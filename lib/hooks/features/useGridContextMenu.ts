import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import type {
    GridApi, GridCellSelectionModel, GridColDef, GridContextMenuEntry, GridContextMenuParams, GridLocaleText,
    GridRowId, GridRowMeta, GridRowModel,
} from '../../types';
import type { UseGridCellSelectionReturn } from '../core/useGridCellSelection';
import type { GridSpanOrigin } from './useGridSpanning';
import { CHECKBOX_FIELD, EXPAND_FIELD, REORDER_FIELD, findFocusTarget, type FocusedCell } from '../../utils/focus';
import { isRangeColumnField } from '../../utils/cellSelection';
import { getCellValue, warnCallbackFailure } from '../../utils/values';
import { attempt } from '../../utils/attempt';
import { isRtl } from '../../utils/direction';
import { resolveGridLocale } from '../../utils/gridLocale';
import { untypedColumn } from '../../utils/untypedColumns';
import { buildCellCopyText, writeToClipboard } from './useGridClipboard';
import { cleanContextMenuEntries } from '../../components/ContextMenu/menuEntries';

export interface UseGridContextMenuParams<R extends GridRowModel> {
    /** The `contextMenu` prop: without it no listener is attached. */
    enabled: boolean;
    getContextMenuItems?: (
        params: GridContextMenuParams<R>,
        defaultItems: readonly GridContextMenuEntry[],
    ) => readonly GridContextMenuEntry[];
    /** `undoRedo` is on: the menu gets Undo and Redo. */
    undoRedo: boolean;
    apiRef: MutableRefObject<GridApi>;
    containerRef: RefObject<HTMLDivElement | null>;
    viewportRef: RefObject<HTMLDivElement | null>;
    /** The visible row list `data-rowindex` indexes: top-pinned, centre rows of the page, bottom-pinned. */
    allRenderableRows: R[];
    getRowId: (row: R) => GridRowId;
    navigationColumns: GridColDef<R>[];
    /** Rendered data columns in render order: `scrollToIndexes` column indices. */
    renderedDataColumns: GridColDef<R>[];
    pinnedTopRowCount: number;
    rowMetaMap: ReadonlyMap<GridRowId, GridRowMeta>;
    getSpanOrigin: (rowId: GridRowId, field: string) => GridSpanOrigin | null;
    selection: UseGridCellSelectionReturn;
    setFocusedCell: React.Dispatch<React.SetStateAction<FocusedCell | null>>;
    localeText?: GridLocaleText;
    /** Filled with `openAt` while enabled: keyboard navigation runs earlier and reads it at key time. */
    openAtRef: MutableRefObject<((cell: FocusedCell) => void) | null>;
}

export interface GridContextMenuState {
    /** Row the menu was opened on. */
    id: GridRowId;
    x: number;
    y: number;
    entries: readonly GridContextMenuEntry[];
    anchorCell: HTMLElement | null;
}

export interface UseGridContextMenuResult {
    menu: GridContextMenuState | null;
    close: () => void;
    /** Opens the menu at a cell's corner (keyboard and `apiRef.openContextMenu`). Stable. */
    openAt: (cell: FocusedCell) => void;
}


const SYSTEM_FIELDS = new Set([CHECKBOX_FIELD, EXPAND_FIELD, REORDER_FIELD]);
/** Apple platforms: Ctrl+click opens the context menu (elsewhere it is a selection gesture). */
const APPLE = typeof navigator !== 'undefined' && /Mac|iP/.test(navigator.platform);

/** Calls `run` on each of the next `tries` animation frames until it returns something truthy. */
function whenRendered(run: () => unknown, tries: number): void {
    requestAnimationFrame(() => {
        if (!run() && tries > 1) whenRendered(run, tries - 1);
    });
}

/** Whether a cell (`rowIndex` into the visible rows) lies inside the current cell range. */
function isInRange<R extends GridRowModel>(p: UseGridContextMenuParams<R>, field: string, rowIndex: number): boolean {
    const { selection } = p;
    if (!selection.enabled || !isRangeColumnField(field)) return false;
    const { resolved } = selection.getCurrentRange();
    const colIndex = p.navigationColumns.filter(c => isRangeColumnField(c.field)).findIndex(c => c.field === field);
    return resolved !== null && rowIndex >= resolved.top && rowIndex <= resolved.bottom
        && colIndex >= resolved.left && colIndex <= resolved.right;
}

/**
 * Step 37a of `DataGrid`: the cell context menu (`contextMenu`). A native `contextmenu` listener on the
 * grid root resolves the body cell (`data-field` and the row's `data-rowindex`, an index into the visible
 * row list), moves focus / the range there, builds the items and opens the menu at the pointer.
 * Installs `apiRef.openContextMenu` / `closeContextMenu`.
 */
export function useGridContextMenu<R extends GridRowModel>(params: UseGridContextMenuParams<R>): UseGridContextMenuResult {
    const { enabled, apiRef, containerRef, allRenderableRows, getRowId, openAtRef } = params;
    const latestRef = useRef(params);
    useLayoutEffect(() => {
        latestRef.current = params;
    });

    const [menu, setMenu] = useState<GridContextMenuState | null>(null);
    const close = useCallback(() => setMenu(null), []);

    /** Builds the items for a cell and opens the menu. Returns whether a menu opened. */
    const open = useCallback((id: GridRowId, field: string, rowIndex: number, x: number, y: number, anchorCell: HTMLElement | null): boolean => {
        const p = latestRef.current;
        const row = p.allRenderableRows[rowIndex];
        const colDef = p.navigationColumns.find(c => c.field === field);
        // A delayed open (openAt) whose row moved in the meantime opens nothing.
        if (!row || !colDef || p.getRowId(row) !== id) return false;

        const { selection } = p;
        const inRange = isInRange(p, field, rowIndex);
        if (selection.enabled && isRangeColumnField(field) && !inRange) {
            const cell = { id, field };
            selection.setModel([{ anchor: cell, head: cell }], 'pointer');
        }
        // Focus moved inside a range would collapse it (useGridCellSelectionApi): it stays where it is.
        if (!inRange) p.setFocusedCell({ id, field, rowIndex });

        const copy = (includeHeaders: boolean) => {
            const rangeText = inRange ? latestRef.current.selection.getCopyText({ includeHeaders }) : null;
            const text = rangeText ?? buildCellCopyText(row, untypedColumn(colDef), includeHeaders);
            writeToClipboard(text).catch(() => {});
        };
        const locale = resolveGridLocale(p.localeText);
        const api = p.apiRef.current;
        const defaults: GridContextMenuEntry[] = [
            { id: 'copy', label: locale.contextMenuCopy, onClick: () => copy(false) },
            { id: 'copyWithHeaders', label: locale.contextMenuCopyWithHeaders, onClick: () => copy(true) },
        ];
        if (p.undoRedo) {
            defaults.push(
                { id: 'undo', label: locale.contextMenuUndo, disabled: !api.canUndo(), onClick: () => { void api.undo(); } },
                { id: 'redo', label: locale.contextMenuRedo, disabled: !api.canRedo(), onClick: () => { void api.redo(); } },
            );
        }

        let entries: readonly GridContextMenuEntry[] = defaults;
        const getItems = p.getContextMenuItems;
        if (getItems) {
            const range = selection.enabled ? selection.getCurrentRange().range : null;
            const cellRange: GridCellSelectionModel | null = range ? [range] : null;
            const menuParams: GridContextMenuParams<R> = {
                id, field, row, colDef,
                value: getCellValue(row, field, colDef),
                rowMeta: p.rowMetaMap.get(id),
                cellRange,
                api: api as GridApi<R>,
            };
            const result = attempt(() => getItems(menuParams, defaults));
            if (result.ok) {
                entries = result.value;
            } else {
                warnCallbackFailure('getContextMenuItems', 'getContextMenuItems threw; the default items are shown', result.error);
            }
        }
        // Cleaned here so a list of only dividers opens nothing and keeps the browser menu.
        entries = cleanContextMenuEntries(entries);
        if (entries.length === 0) return false;
        setMenu({ id, x, y, entries, anchorCell });
        return true;
    }, []);

    /** The span origin of a cell and its index in the visible rows (`rowIndex` when already known, else -1). */
    const resolveCell = useCallback((rowId: GridRowId, cellField: string, rowIndex: number) => {
        const p = latestRef.current;
        const origin = p.getSpanOrigin(rowId, cellField);
        const id = origin ? origin.rowId : rowId;
        const index = origin || rowIndex < 0 ? p.allRenderableRows.findIndex(r => p.getRowId(r) === id) : rowIndex;
        return index < 0 ? null : { id, field: origin ? origin.field : cellField, rowIndex: index };
    }, []);

    const openAt = useCallback((cell: FocusedCell) => {
        const p = latestRef.current;
        if (!p.enabled || cell.id === null) return;
        const target = resolveCell(cell.id, cell.field, -1);
        if (!target) return;
        const { id, field, rowIndex } = target;
        const centerIndex = rowIndex - p.pinnedTopRowCount;
        const centerCount = p.allRenderableRows.length - p.pinnedTopRowCount;
        p.apiRef.current.scrollToIndexes({
            rowIndex: centerIndex >= 0 && centerIndex < centerCount ? centerIndex : undefined,
            colIndex: p.renderedDataColumns.findIndex(c => c.field === field),
        });
        // Opened from a later frame: the scrolled-to row is rendered by then, and the scroll event has
        // fired before the menu's close-on-scroll listener attaches. Gives up if the cell never appears.
        whenRendered(() => {
            const viewport = latestRef.current.viewportRef.current;
            const el = viewport && findFocusTarget(viewport, target, rowIndex);
            if (el) {
                const rect = el.getBoundingClientRect();
                open(id, field, rowIndex, isRtl(el) ? rect.right : rect.left, rect.bottom, el);
            }
            return el;
        }, 10);
    }, [open, resolveCell]);

    // Right-click on a body cell of this grid.
    useEffect(() => {
        const root = containerRef.current;
        if (!root || !enabled) return;
        const onContextMenu = (event: MouseEvent) => {
            const p = latestRef.current;
            const viewport = p.viewportRef.current;
            const target = event.target;
            if (!viewport || !(target instanceof Element)) return;
            const cell = target.closest<HTMLElement>('.ogx__cell');
            if (!cell || cell.closest('.ogx__viewport') !== viewport) return;
            if (cell.classList.contains('ogx__cell--editing')) return;
            const field = cell.dataset.field;
            const rowEl = cell.parentElement;
            const indexText = rowEl ? rowEl.getAttribute('data-rowindex') : null;
            if (!field || SYSTEM_FIELDS.has(field) || indexText === null) return;
            const index = Number(indexText);
            const row = Number.isInteger(index) ? p.allRenderableRows[index] : undefined;
            if (!row) return;
            const resolved = resolveCell(p.getRowId(row), field, index);
            if (!resolved) return;
            const anchor = resolved.rowIndex === index && resolved.field === field
                ? cell : findFocusTarget(viewport, resolved, resolved.rowIndex);
            if (open(resolved.id, resolved.field, resolved.rowIndex, event.clientX, event.clientY, anchor ?? cell)) event.preventDefault();
        };
        // A menu press (right button, or Ctrl+click on Apple platforms) inside the range must not move
        // focus there or start a range drag: either collapses the range before contextmenu arrives.
        // Mousedown targets are Elements.
        const onMouseDown = (event: MouseEvent) => {
            const menuPress = event.button === 2 || (APPLE && event.button === 0 && event.ctrlKey);
            const cell = menuPress ? (event.target as Element).closest<HTMLElement>('.ogx__cell') : null;
            const row = cell && cell.closest<HTMLElement>('[data-rowindex]');
            if (row && isInRange(latestRef.current, cell.dataset.field as string, Number(row.dataset.rowindex))) event.preventDefault();
        };
        root.addEventListener('contextmenu', onContextMenu);
        root.addEventListener('mousedown', onMouseDown, true);
        return () => {
            root.removeEventListener('contextmenu', onContextMenu);
            root.removeEventListener('mousedown', onMouseDown, true);
        };
    }, [containerRef, enabled, open, resolveCell]);

    useLayoutEffect(() => {
        const api = apiRef.current;
        api.openContextMenu = (id, field) => openAt({ id, field });
        api.closeContextMenu = close;
        openAtRef.current = enabled ? openAt : null;
    }, [apiRef, openAt, close, openAtRef, enabled]);

    // The menu closes when its row leaves the visible row list or the feature is turned off.
    // Cleared during render (state derived from props), so the same row coming back does not reopen it.
    if (menu !== null && (!enabled || !allRenderableRows.some(r => getRowId(r) === menu.id))) setMenu(null);
    return { menu, close, openAt };
}
