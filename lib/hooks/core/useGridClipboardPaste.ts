import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import type {
    GridApi,
    GridBatchEditResult,
    GridBeforeClipboardPasteParams,
    GridCellCoordinates,
    GridCellParams,
    GridClipboardPasteResult,
    GridColDef,
    GridEditSkipReason,
    GridRowId,
    GridRowMeta,
    GridRowModel,
} from '../../types';
import { attempt } from '../../utils/attempt';
import { classifyKeyTarget } from '../../utils/focus';
import type { FocusedCell } from '../../utils/focus';
import { isRangeColumnField, rectCellCount } from '../../utils/cellSelection';
import type { CellRangeRect } from '../../utils/cellSelection';
import { parseCellText, parseTsv } from '../../utils/parsing';
import { getCellValue, warnCallbackFailure } from '../../utils/values';
import {
    buildEditTargetContext,
    isEditTargetWritable,
    isTextColumn,
    rectCorners,
} from '../../utils/editing/targets';
import type { GridEditTargetContext } from '../../utils/editing/targets';
import type { GridBatchCellEdit, UseGridBatchEditReturn } from '../features/useGridBatchEdit';
import type { UseGridCellSelectionReturn } from './useGridCellSelection';

/** Above this many cells a paste warns in development. */
export const LARGE_PASTE_CELLS = 10_000;

const emptyResult = (): GridBatchEditResult => ({ updated: [], failed: [], skipped: [] });

export interface UseGridClipboardPasteParams<R extends GridRowModel> {
    apiRef: MutableRefObject<GridApi>;
    /** The grid root: paste and Delete are listened for here. */
    containerRef: RefObject<HTMLDivElement | null>;
    viewportRef: RefObject<HTMLDivElement | null>;
    selection: UseGridCellSelectionReturn;
    disableClipboardPaste: boolean;
    disableRangeClear: boolean;
    focusedCell: FocusedCell | null;
    allRenderableRows: R[];
    getRowId: (row: R) => GridRowId;
    /** System columns and the rendered data columns, in render order. */
    navigationColumns: ReadonlyArray<GridColDef<R>>;
    isCellEditable?: (params: GridCellParams<R>) => boolean;
    rowMetaMap: Map<GridRowId, GridRowMeta>;
    getSpanOrigin?: (rowId: GridRowId, field: string) => { rowId: GridRowId; field: string } | null;
    /** Whether a cell editor is open: paste and Delete then belong to it. */
    isEditing: boolean;
    batchEdit: UseGridBatchEditReturn<R>;
    onClipboardPaste?: (result: GridClipboardPasteResult) => void;
    onBeforeClipboardPaste?: (params: GridBeforeClipboardPasteParams) => boolean | string;
}

function warnLargePaste(cellCount: number): void {
    if (process.env.NODE_ENV === 'production') return;
    console.warn(`[OpenGridX] Pasting ${cellCount} cells. Pastes above ${LARGE_PASTE_CELLS} cells can be slow; consider importing the data instead.`);
}

/**
 * Clipboard paste and range clear (v3.4). With `cellSelection` on: Ctrl/Cmd+V (the `paste` event,
 * so no clipboard permission is needed) writes tab-separated text into the editable cells, and
 * Delete / Backspace on a multi-cell range empties them. Both are one batch edit (`useGridBatchEdit`),
 * so one undo. Installs `apiRef.pasteText`. Runs after useGridCellSelectionApi.
 */
export function useGridClipboardPaste<R extends GridRowModel>(params: UseGridClipboardPasteParams<R>): void {
    const { apiRef, containerRef, selection, disableClipboardPaste, disableRangeClear } = params;
    const latestRef = useRef(params);
    useLayoutEffect(() => {
        latestRef.current = params;
    });

    const getContext = useCallback((): GridEditTargetContext<R> => {
        const { allRenderableRows, getRowId, navigationColumns } = latestRef.current;
        return buildEditTargetContext(allRenderableRows, getRowId, navigationColumns);
    }, []);

    /** The range's rectangle (display indices), or null. */
    const currentRect = useCallback((): CellRangeRect | null => {
        const { selection: s } = latestRef.current;
        if (!s.enabled) return null;
        return s.getCurrentRange().resolved;
    }, []);

    /** The cell a paste starts from: the range's top-left cell, else the focused data cell. */
    const defaultAnchor = useCallback((ctx: GridEditTargetContext<R>): GridCellCoordinates | null => {
        const rect = currentRect();
        if (rect && ctx.rowIds[rect.top] !== undefined && ctx.columns[rect.left]) {
            return { id: ctx.rowIds[rect.top], field: ctx.columns[rect.left].field };
        }
        const focus = latestRef.current.focusedCell;
        if (focus && focus.id !== null && isRangeColumnField(focus.field)) return { id: focus.id, field: focus.field };
        return null;
    }, [currentRect]);

    const paste = useCallback(async (clipboardText: string, anchorOverride: GridCellCoordinates | undefined, viaKeyboard: boolean): Promise<GridBatchEditResult> => {
        const ctx = getContext();
        const anchor = anchorOverride ?? defaultAnchor(ctx);
        let text = clipboardText;
        const { onBeforeClipboardPaste } = latestRef.current;
        if (onBeforeClipboardPaste) {
            const verdict = attempt(() => onBeforeClipboardPaste({ text, anchor }));
            if (!verdict.ok) {
                warnCallbackFailure('onBeforeClipboardPaste', 'onBeforeClipboardPaste threw; the paste was cancelled', verdict.error);
                return emptyResult();
            }
            if (verdict.value === false) return emptyResult();
            if (typeof verdict.value === 'string') text = verdict.value;
        }
        if (!anchor) return emptyResult();
        const block = parseTsv(text);
        const anchorRow = ctx.rowIndexById.get(anchor.id);
        const anchorCol = ctx.colIndexByField.get(anchor.field);
        if (block.length === 0 || anchorRow === undefined || anchorCol === undefined) return emptyResult();

        const lastRow = ctx.rowIds.length - 1;
        const lastCol = ctx.columns.length - 1;
        // A range of several cells bounds the paste; one value fills all of it.
        const range = anchorOverride ? null : currentRect();
        const multiCellRange = range && rectCellCount(range) > 1 ? range : null;
        const singleValue = block.length === 1 && block[0].length === 1;
        const blockWidth = block.reduce((max, line) => Math.max(max, line.length), 0);
        let rect: CellRangeRect;
        if (singleValue && multiCellRange) {
            rect = multiCellRange;
        } else {
            rect = {
                top: anchorRow,
                left: anchorCol,
                bottom: Math.min(anchorRow + block.length - 1, lastRow, multiCellRange ? multiCellRange.bottom : lastRow),
                right: Math.min(anchorCol + blockWidth - 1, lastCol, multiCellRange ? multiCellRange.right : lastCol),
            };
        }
        const cellCount = rectCellCount(rect);
        if (cellCount > LARGE_PASTE_CELLS) warnLargePaste(cellCount);

        const { batchEdit, isCellEditable, rowMetaMap, getSpanOrigin } = latestRef.current;
        const rules = { isCellEditable, rowMetaMap, getSpanOrigin };
        const edits: GridBatchCellEdit[] = [];
        const skipped: { id: GridRowId; field: string; reason: GridEditSkipReason }[] = [];
        for (let r = rect.top; r <= rect.bottom; r++) {
            const id = ctx.rowIds[r];
            const row = batchEdit.getRow(id) ?? ctx.rows[r];
            const line = singleValue ? block[0] : block[r - rect.top];
            for (let c = rect.left; c <= rect.right; c++) {
                const cellText = singleValue ? block[0][0] : line?.[c - rect.left];
                if (cellText === undefined) continue;
                const colDef = ctx.columns[c];
                if (!isEditTargetWritable(ctx, rules, row, r, c)) {
                    skipped.push({ id, field: colDef.field, reason: 'notEditable' });
                    continue;
                }
                const parsed = parseCellText(cellText, colDef, row, { current: getCellValue(row, colDef.field, colDef) });
                if (!parsed.ok) {
                    skipped.push({ id, field: colDef.field, reason: 'invalidValue' });
                    continue;
                }
                edits.push({ id, field: colDef.field, value: parsed.value });
            }
        }

        // The pasted area becomes the selection, so one look shows what changed.
        if (latestRef.current.selection.enabled) {
            const { anchor: from, head: to } = rectCorners(ctx, rect);
            latestRef.current.selection.setModel([{ anchor: from, head: to }], viaKeyboard ? 'keyboard' : 'api');
        }

        const outcome = await batchEdit.applyEdits(edits, 'paste');
        const result: GridBatchEditResult = {
            updated: outcome.result.updated,
            failed: outcome.result.failed,
            skipped: [...skipped, ...outcome.result.skipped],
        };
        latestRef.current.onClipboardPaste?.({ ...result, text });
        return result;
    }, [getContext, defaultAnchor, currentRect]);

    /** Delete / Backspace: empties the editable cells of a multi-cell range. Returns whether it applied. */
    const clearRange = useCallback((): boolean => {
        const rect = currentRect();
        if (!rect || rectCellCount(rect) <= 1) return false;
        const ctx = getContext();
        const { batchEdit, isCellEditable, rowMetaMap, getSpanOrigin } = latestRef.current;
        const rules = { isCellEditable, rowMetaMap, getSpanOrigin };
        const edits: GridBatchCellEdit[] = [];
        for (let r = rect.top; r <= rect.bottom; r++) {
            const id = ctx.rowIds[r];
            if (id === undefined) continue;
            const row = batchEdit.getRow(id) ?? ctx.rows[r];
            for (let c = rect.left; c <= rect.right; c++) {
                const colDef = ctx.columns[c];
                if (!colDef || !isEditTargetWritable(ctx, rules, row, r, c)) continue;
                edits.push({ id, field: colDef.field, value: isTextColumn(colDef) ? '' : null });
            }
        }
        void batchEdit.applyEdits(edits, 'clear');
        return true;
    }, [currentRect, getContext]);

    const pasteEnabled = selection.enabled && !disableClipboardPaste;
    const clearEnabled = selection.enabled && !disableRangeClear;

    useEffect(() => {
        const root = containerRef.current;
        if (!root || (!pasteEnabled && !clearEnabled)) return;
        /** Only events aimed at this grid's cells (not an editor, a text field or a nested grid). */
        const ownsTarget = (event: Event) => {
            const viewport = latestRef.current.viewportRef.current;
            if (!viewport || event.defaultPrevented || latestRef.current.isEditing) return false;
            const kind = classifyKeyTarget(event.target, viewport);
            return kind === 'grid' || kind === 'control';
        };
        const onPaste = (event: ClipboardEvent) => {
            if (!pasteEnabled || !ownsTarget(event)) return;
            if (!latestRef.current.navigationColumns.some(c => c.editable)) return;
            const text = event.clipboardData ? event.clipboardData.getData('text/plain') : '';
            if (text === '') return;
            event.preventDefault();
            void paste(text, undefined, true);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (!clearEnabled || (event.key !== 'Delete' && event.key !== 'Backspace')) return;
            if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
            if (!ownsTarget(event)) return;
            if (clearRange()) event.preventDefault();
        };
        root.addEventListener('paste', onPaste);
        root.addEventListener('keydown', onKeyDown);
        return () => {
            root.removeEventListener('paste', onPaste);
            root.removeEventListener('keydown', onKeyDown);
        };
    }, [containerRef, pasteEnabled, clearEnabled, paste, clearRange]);

    useLayoutEffect(() => {
        apiRef.current.pasteText = (text, anchor) => paste(text, anchor, false);
    }, [apiRef, paste]);
}
