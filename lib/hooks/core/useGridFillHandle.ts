import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';
import type {
    GridCellCoordinates,
    GridCellParams,
    GridCellSelectionModel,
    GridColDef,
    GridEditSkipReason,
    GridFillDirection,
    GridFillResult,
    GridRowId,
    GridRowMeta,
    GridRowModel,
} from '../../types';
import { attempt } from '../../utils/attempt';
import { classifyKeyTarget } from '../../utils/focus';
import { isRangeColumnField } from '../../utils/cellSelection';
import type { CellRangeRect, GridFillHandlePosition } from '../../utils/cellSelection';
import { isSyntheticRowId } from '../../utils/syntheticRows';
import { getCellValue, warnCallbackFailure } from '../../utils/values';
import { buildEditTargetContext, isEditTargetWritable } from '../../utils/editing/targets';
import type { GridEditTargetContext } from '../../utils/editing/targets';
import {
    computeFillValues,
    fillHandleCell,
    fillLines,
    fillRangeCorners,
    fillTargetFromPointer,
} from '../../utils/editing/fill';
import type { GridBatchCellEdit, UseGridBatchEditReturn } from '../features/useGridBatchEdit';
import type { UseGridCellSelectionReturn } from './useGridCellSelection';

/** The class of the fill handle square (public from v3.5). */
export const FILL_HANDLE_CLASS = 'ogx__cell-fill-handle';

export interface UseGridFillHandleParams<R extends GridRowModel> {
    /** The grid root: Ctrl/Cmd+D and Ctrl/Cmd+R are listened for here. */
    containerRef: RefObject<HTMLDivElement | null>;
    viewportRef: RefObject<HTMLDivElement | null>;
    selection: UseGridCellSelectionReturn;
    disableFillHandle: boolean;
    /** Whether a cell editor is open: no handle and no shortcuts meanwhile. */
    isEditing: boolean;
    allRenderableRows: R[];
    getRowId: (row: R) => GridRowId;
    /** System columns and the rendered data columns, in render order. */
    navigationColumns: ReadonlyArray<GridColDef<R>>;
    columnIndexMap: Map<string, number>;
    isCellEditable?: (params: GridCellParams<R>) => boolean;
    rowMetaMap: Map<GridRowId, GridRowMeta>;
    getSpanOrigin?: (rowId: GridRowId, field: string) => { rowId: GridRowId; field: string } | null;
    batchEdit: UseGridBatchEditReturn<R>;
    onFill?: (result: GridFillResult) => void;
}

export interface UseGridFillHandleReturn {
    /** Where the rows draw the handle, or null. */
    handle: GridFillHandlePosition | null;
}

interface FillDragState<R extends GridRowModel> {
    source: CellRangeRect;
    /** The source range model, restored when the drag ends where it started or is cancelled. */
    sourceModel: GridCellSelectionModel;
    anchor: { row: number; col: number };
    ctx: GridEditTargetContext<R>;
    x: number;
    y: number;
    scrollLeft: number;
    scrollTop: number;
    target: { rect: CellRangeRect; direction: GridFillDirection } | null;
}

/** 'down', 'right' or null for a keydown: Ctrl/Cmd+D and Ctrl/Cmd+R (also on non-Latin layouts). */
function fillShortcut(event: KeyboardEvent): 'down' | 'right' | null {
    if (event.altKey || event.shiftKey || !(event.ctrlKey || event.metaKey)) return null;
    const key = (event.key ?? '').toLowerCase();
    const latin = /^[a-z]$/.test(key);
    if (key === 'd' || (!latin && event.code === 'KeyD')) return 'down';
    if (key === 'r' || (!latin && event.code === 'KeyR')) return 'right';
    return null;
}

/**
 * The fill handle (v3.5). With `cellSelection` on, the bottom-right cell of the range carries a
 * square; dragging it extends the range in one direction (the larger pointer offset wins, with the
 * range drag's auto-scroll) and fills the new cells from the source range on release: numbers or
 * dates with an equal step continue as a series, anything else repeats, Alt at release copies, and
 * `GridColDef.fillValue` has the last word. Ctrl/Cmd+D fills down from the range's top row and
 * Ctrl/Cmd+R right from its left column. Every fill is one batch edit (source `'fill'`), so one undo
 * step. Runs after useGridUndoRedo.
 */
export function useGridFillHandle<R extends GridRowModel>(params: UseGridFillHandleParams<R>): UseGridFillHandleReturn {
    const {
        containerRef, viewportRef, selection, disableFillHandle, isEditing, allRenderableRows, getRowId,
        navigationColumns, columnIndexMap, getSpanOrigin,
    } = params;
    const latestRef = useRef(params);
    useLayoutEffect(() => {
        latestRef.current = params;
    });

    const enabled = selection.enabled && !disableFillHandle;
    const hasEditableColumn = useMemo(() => navigationColumns.some(c => c.editable), [navigationColumns]);

    // The handle: on the range's bottom-right cell (or the cell whose span covers it).
    const resolved = selection.resolved;
    const handle = useMemo<GridFillHandlePosition | null>(() => {
        if (!enabled || !hasEditableColumn || !resolved) return null;
        const fields = navigationColumns.filter(c => isRangeColumnField(c.field)).map(c => c.field);
        const rowIdAt = (r: number) => {
            const row = allRenderableRows[r];
            return row === undefined ? undefined : getRowId(row);
        };
        const cell = fillHandleCell(resolved, rowIdAt, fields, getSpanOrigin);
        if (!cell) return null;
        const col = columnIndexMap.get(cell.field);
        return col === undefined ? null : { row: cell.row, col };
    }, [enabled, hasEditableColumn, resolved, allRenderableRows, getRowId, navigationColumns, columnIndexMap, getSpanOrigin]);

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const getContext = useCallback((): GridEditTargetContext<R> => {
        const p = latestRef.current;
        return buildEditTargetContext(p.allRenderableRows, p.getRowId, p.navigationColumns);
    }, []);

    /** Selects `rect` with its corners chosen for the fill. */
    const selectRect = useCallback((
        ctx: GridEditTargetContext<R>,
        rect: CellRangeRect,
        direction: GridFillDirection,
        anchor: { row: number; col: number },
        reason: 'pointer' | 'keyboard',
    ) => {
        const corners = fillRangeCorners(rect, direction, anchor);
        const toCell = (p: { row: number; col: number }): GridCellCoordinates => ({ id: ctx.rowIds[p.row], field: ctx.columns[p.col].field });
        latestRef.current.selection.setModel([{ anchor: toCell(corners.anchor), head: toCell(corners.head) }], reason);
    }, []);

    /** Fills `target` from `source` (display indices) and selects `target`. */
    const fill = useCallback(async (
        ctx: GridEditTargetContext<R>,
        source: CellRangeRect,
        target: CellRangeRect,
        direction: GridFillDirection,
        copy: boolean,
        anchor: { row: number; col: number },
        reason: 'pointer' | 'keyboard',
    ): Promise<GridFillResult> => {
        const { batchEdit, isCellEditable, rowMetaMap, getSpanOrigin: spanOrigin } = latestRef.current;
        const rules = { isCellEditable, rowMetaMap, getSpanOrigin: spanOrigin };
        const vertical = direction === 'down' || direction === 'up';
        const rowAt = (r: number): R | undefined => {
            const id = ctx.rowIds[r];
            return id === undefined ? undefined : batchEdit.getRow(id) ?? ctx.rows[r];
        };
        const edits: GridBatchCellEdit[] = [];
        const skipped: { id: GridRowId; field: string; reason: GridEditSkipReason }[] = [];
        for (const line of fillLines(source, target, direction)) {
            if (line.targets.length === 0) continue;
            const position = (k: number) => (vertical ? { r: k, c: line.line } : { r: line.line, c: k });
            // The source values in fill order; synthetic rows hold no data and are left out.
            const sourceValues: unknown[] = [];
            for (const k of line.source) {
                const { r, c } = position(k);
                const row = rowAt(r);
                const colDef = ctx.columns[c];
                if (!row || !colDef || isSyntheticRowId(ctx.rowIds[r], rowMetaMap)) continue;
                sourceValues.push(getCellValue(row, colDef.field, colDef));
            }
            if (sourceValues.length === 0) continue;
            const values = computeFillValues(sourceValues, line.targets.length, !copy);
            line.targets.forEach((k, index) => {
                const { r, c } = position(k);
                const row = rowAt(r);
                const colDef = ctx.columns[c];
                const id = ctx.rowIds[r];
                if (!row || !colDef || id === undefined) return;
                if (!isEditTargetWritable(ctx, rules, row, r, c)) {
                    skipped.push({ id, field: colDef.field, reason: 'notEditable' });
                    return;
                }
                let value = values[index];
                const fillValue = colDef.fillValue;
                if (fillValue) {
                    const decided = attempt(() => fillValue.call(colDef, {
                        row, id, field: colDef.field, colDef, direction, sourceValues: sourceValues.slice(), index, value, copy,
                    }));
                    if (!decided.ok) {
                        warnCallbackFailure(`fillValue:${colDef.field}`, `fillValue of column "${colDef.field}" threw; the cell was skipped`, decided.error);
                        skipped.push({ id, field: colDef.field, reason: 'invalidValue' });
                        return;
                    }
                    value = decided.value;
                }
                edits.push({ id, field: colDef.field, value });
            });
        }

        // The source and the filled cells become the range.
        selectRect(ctx, target, direction, anchor, reason);

        const outcome = await batchEdit.applyEdits(edits, 'fill');
        const result: GridFillResult = {
            updated: outcome.result.updated,
            failed: outcome.result.failed,
            skipped: [...skipped, ...outcome.result.skipped],
            direction,
        };
        latestRef.current.onFill?.(result);
        return result;
    }, [selectRect]);

    // ── Pointer: drag the handle ────────────────────────────────────────────
    const dragRef = useRef<FillDragState<R> | null>(null);

    const onTrack = useCallback((head: GridCellCoordinates, x: number, y: number) => {
        const drag = dragRef.current;
        const viewport = latestRef.current.viewportRef.current;
        if (!drag || !viewport) return;
        const ctx = drag.ctx;
        const row = ctx.rowIndexById.get(head.id);
        const col = ctx.colIndexByField.get(head.field);
        if (row === undefined || col === undefined) return;
        const dx = x - drag.x + viewport.scrollLeft - drag.scrollLeft;
        const dy = y - drag.y + viewport.scrollTop - drag.scrollTop;
        const target = fillTargetFromPointer(drag.source, { row, col }, dx, dy);
        drag.target = target;
        if (target) selectRect(ctx, target.rect, target.direction, drag.anchor, 'pointer');
        else latestRef.current.selection.setModel(drag.sourceModel, 'pointer');
    }, [selectRect]);

    const onEnd = useCallback(({ cancelled, altKey }: { cancelled: boolean; altKey: boolean }) => {
        const drag = dragRef.current;
        dragRef.current = null;
        if (!drag || !mountedRef.current) return;
        const ctx = drag.ctx;
        if (cancelled || !drag.target) {
            latestRef.current.selection.setModel(drag.sourceModel, 'pointer');
            return;
        }
        void fill(ctx, drag.source, drag.target.rect, drag.target.direction, altKey, drag.anchor, 'pointer');
    }, [fill]);

    const dragEnabled = enabled && hasEditableColumn;
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport || !dragEnabled) return;
        const onPointerDown = (event: PointerEvent) => {
            if (event.button !== 0 || !(event.target instanceof Element)) return;
            const handleEl = event.target.closest(`.${FILL_HANDLE_CLASS}`);
            if (!handleEl || handleEl.closest('.ogx__viewport') !== viewport || latestRef.current.isEditing) return;
            const { selection: s } = latestRef.current;
            const { range, resolved: current } = s.getCurrentRange();
            if (!range || !current) return;
            const ctx = getContext();
            const startId = ctx.rowIds[current.bottom];
            const startCol = ctx.columns[current.right];
            if (startId === undefined || !startCol) return;
            // No mousedown follows, so the range drag does not start and focus does not move.
            event.preventDefault();
            const doc = viewport.ownerDocument;
            if (!viewport.contains(doc.activeElement)) viewport.focus({ preventScroll: true });
            // Pointer events keep reaching the grid even after the handle moves to another cell.
            attempt(() => viewport.setPointerCapture(event.pointerId));
            dragRef.current = {
                source: { top: current.top, bottom: current.bottom, left: current.left, right: current.right },
                sourceModel: [range],
                anchor: { row: current.anchorRow, col: current.anchorCol },
                ctx,
                x: event.clientX,
                y: event.clientY,
                scrollLeft: viewport.scrollLeft,
                scrollTop: viewport.scrollTop,
                target: null,
            };
            s.startTrackedDrag({
                start: { id: startId, field: startCol.field },
                x: event.clientX,
                y: event.clientY,
                pointerId: event.pointerId,
                onTrack,
                onEnd,
            });
        };
        viewport.addEventListener('pointerdown', onPointerDown);
        return () => viewport.removeEventListener('pointerdown', onPointerDown);
    }, [viewportRef, dragEnabled, getContext, onTrack, onEnd]);

    // ── Keyboard: Ctrl/Cmd+D and Ctrl/Cmd+R ────────────────────────────────
    useEffect(() => {
        const root = containerRef.current;
        if (!root || !enabled) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented) return;
            const shortcut = fillShortcut(event);
            if (!shortcut) return;
            const viewport = latestRef.current.viewportRef.current;
            if (!viewport || latestRef.current.isEditing) return;
            const kind = classifyKeyTarget(event.target, viewport);
            if (kind !== 'grid' && kind !== 'control') return;
            const { range, resolved: current } = latestRef.current.selection.getCurrentRange();
            if (!range || !current) return;
            // The browser's bookmark (Ctrl+D) and reload (Ctrl/Cmd+R) never fire inside the grid.
            event.preventDefault();
            const rect = { top: current.top, bottom: current.bottom, left: current.left, right: current.right };
            const source = shortcut === 'down' ? { ...rect, bottom: rect.top } : { ...rect, right: rect.left };
            if (shortcut === 'down' ? rect.bottom === rect.top : rect.right === rect.left) return;
            void fill(getContext(), source, rect, shortcut, true, { row: current.anchorRow, col: current.anchorCol }, 'keyboard');
        };
        root.addEventListener('keydown', onKeyDown);
        return () => root.removeEventListener('keydown', onKeyDown);
    }, [containerRef, enabled, fill, getContext]);

    return { handle: isEditing ? null : handle };
}

export type { GridFillHandlePosition };
