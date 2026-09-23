import { useState, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { scrollRowIntoView } from '../../utils/scroll';
import { getCellValue, resolveCellEditable } from '../../utils/editing';
import {
    CHECKBOX_FIELD,
    EXPAND_FIELD,
    REORDER_FIELD,
    classifyKeyTarget,
    findFocusTarget,
    focusedCellFromElement,
    isSameCell,
    isSystemField,
} from '../../utils/focus';
import type { FocusedCell } from '../../utils/focus';
import type { GridRowModel, GridRowId, GridColDef, GridCellParams, GridSortItem, GridSortDirection, GridRowParams, GridRowMeta } from '../../types';
import type { GridEditingState } from '../features/useGridEditing';

export type { FocusedCell } from '../../utils/focus';

interface ColumnMetrics {
    leftPinnedWidth: number;
    rightPinnedWidth: number;
    unpinnedAccWidths: number[];
    unpinnedCols: { field: string }[];
    totalSpecialsWidth: number;
    pinnedSpecialsWidth: number;
}

interface VirtualizationSnapshot {
    cumulativeHeights: number[];
    pinnedTopHeight: number;
    pinnedBottomHeight: number;
    columnMetrics: ColumnMetrics | null;
}

type NavigationColumn<R extends GridRowModel> = Pick<GridColDef<R>, 'field' | 'editable' | 'sortable' | 'valueGetter'>;

export interface UseGridKeyboardNavigationParams<R extends GridRowModel> {
    allRenderableRows: R[];
    /** Focusable columns in render order: system columns first, then the visible data columns. */
    navigationColumns: ReadonlyArray<NavigationColumn<R>>;
    checkboxSelection: boolean;
    selectedRowIds: Set<GridRowId>;
    handleSelectionChange: (id: GridRowId, selected: boolean) => void;
    handleDetailPanelToggle: (id: GridRowId) => void;
    editingHandlers: {
        editingCell: GridEditingState['editingCell'];
        startCellEdit: (params: { id: GridRowId; field: string; value: unknown }) => void;
        stopCellEdit: (params?: { cancel?: boolean }) => void;
    };
    setKeyboardMode: (mode: boolean) => void;
    sortModel: GridSortItem[];
    handleSort: (field: string, direction: GridSortDirection) => void;
    isCellEditable?: (params: GridCellParams<R>) => boolean;
    pagination: boolean;
    pageSize: number;
    virtualization: VirtualizationSnapshot;
    viewportRef: React.RefObject<HTMLDivElement | null>;
    /** Number of top-pinned rows at the start of allRenderableRows. */
    pinnedTopRowCount?: number;
    /** Resolves a row's id (getRowId); defaults to `row.id`. */
    getRowId?: (row: R) => GridRowId;
    /** Hierarchy metadata. Synthetic group rows are never edited or selected from the keyboard. */
    rowMetaMap?: Map<GridRowId, GridRowMeta>;
    /** Enter on a non-editable cell: the same handler a row click runs. */
    onRowActivate?: (params: GridRowParams<R>) => void;
    /** Ctrl/Cmd+A. */
    handleSelectAll?: (selected: boolean) => void;
    /** Whether rows can be selected from the keyboard (Shift+Space). */
    rowSelectionEnabled?: boolean;
    /** Whether several rows can be selected at once (Ctrl/Cmd+A). */
    multipleRowSelectionEnabled?: boolean;
    pinCheckboxColumn?: boolean;
    pinExpandColumn?: boolean;
    /** Height of a row without its detail panel, for scroll-into-view. */
    rowHeight?: number;
    /**
     * For a cell covered by a colSpan or rowSpan, the origin cell of that span (`null` otherwise).
     * Navigation skips the cells of the focused span and lands on span origins.
     */
    getSpanOrigin?: (rowId: GridRowId, field: string) => { rowId: GridRowId; field: string } | null;
}

export interface UseGridKeyboardNavigationReturn {
    /** The focus position, validated against the current rows and columns. */
    focusedCell: FocusedCell | null;
    setFocusedCell: React.Dispatch<React.SetStateAction<FocusedCell | null>>;
    /** tabIndex for the viewport: it stops being a tab stop while focus is inside the grid. */
    viewportTabIndex: number;
    /** Moves DOM focus into the grid (for pointer interactions) unless it is already there. */
    ensureGridFocus: () => void;
    handleFocus: (event: React.FocusEvent<HTMLDivElement>) => void;
    handleBlur: (event: React.FocusEvent<HTMLDivElement>) => void;
    handleKeyDown: (event: React.KeyboardEvent) => void;
    handleMouseDownCapture: () => void;
}

const defaultGetRowId = <R extends GridRowModel>(row: R): GridRowId => row.id;

const NAVIGATION_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown']);

/** Keeps a stored focus position valid when its row or column is no longer rendered. */
function resolveFocus<R extends GridRowModel>(
    cell: FocusedCell | null,
    rows: R[],
    columns: ReadonlyArray<NavigationColumn<R>>,
    getRowId: (row: R) => GridRowId
): { cell: FocusedCell | null; rowIndex: number } {
    if (!cell || columns.length === 0) return { cell: null, rowIndex: -1 };
    const fallbackField = (columns.find(c => !isSystemField(c.field)) ?? columns[0]).field;
    const field = columns.some(c => c.field === cell.field) ? cell.field : fallbackField;

    if (cell.id === null) {
        return { cell: field === cell.field ? cell : { id: null, field }, rowIndex: -1 };
    }
    const hint = cell.rowIndex;
    let rowIndex = hint !== undefined && rows[hint] && getRowId(rows[hint]) === cell.id ? hint : rows.findIndex(r => getRowId(r) === cell.id);
    if (rowIndex === -1) {
        if (rows.length === 0) return { cell: { id: null, field }, rowIndex: -1 };
        rowIndex = Math.min(Math.max(hint ?? 0, 0), rows.length - 1);
        return { cell: { id: getRowId(rows[rowIndex]), field, rowIndex }, rowIndex };
    }
    return { cell: field === cell.field ? cell : { ...cell, field }, rowIndex };
}

export function useGridKeyboardNavigation<R extends GridRowModel>(
    params: UseGridKeyboardNavigationParams<R>
): UseGridKeyboardNavigationReturn {
    const {
        allRenderableRows,
        navigationColumns,
        checkboxSelection,
        selectedRowIds,
        handleSelectionChange,
        handleDetailPanelToggle,
        editingHandlers,
        setKeyboardMode,
        sortModel,
        handleSort,
        isCellEditable,
        pagination,
        pageSize,
        virtualization,
        viewportRef,
        pinnedTopRowCount = 0,
        getRowId = defaultGetRowId,
        rowMetaMap,
        onRowActivate,
        handleSelectAll,
        rowSelectionEnabled = true,
        multipleRowSelectionEnabled = true,
        pinCheckboxColumn = true,
        pinExpandColumn = true,
        rowHeight,
        getSpanOrigin,
    } = params;

    const [storedFocus, setFocusedCell] = useState<FocusedCell | null>(null);
    const [focusWithin, setFocusWithin] = useState(false);

    const resolved = useMemo(
        () => resolveFocus(storedFocus, allRenderableRows, navigationColumns, getRowId),
        [storedFocus, allRenderableRows, navigationColumns, getRowId]
    );
    const focusedCell = resolved.cell;
    const focusedRowIndex = resolved.rowIndex;

    // Whether this grid held DOM focus as of the last focus event. Focus lost because the focused
    // node was unmounted produces no event React can see, so this stays true in that case.
    const ownsFocusRef = useRef(false);
    // Set while the grid moves focus to its own viewport, so handleFocus does not treat it as entry.
    const internalFocusRef = useRef(false);
    // Set by a mouse press, so a focus entry it causes does not turn on the keyboard focus ring.
    const pointerDownRef = useRef(false);
    const lastSyncedRef = useRef<FocusedCell | null>(null);

    const focusViewport = useCallback((viewport: HTMLElement) => {
        internalFocusRef.current = true;
        viewport.focus({ preventScroll: true });
        internalFocusRef.current = false;
    }, []);

    const ensureGridFocus = useCallback(() => {
        const viewport = viewportRef.current;
        if (viewport && !viewport.contains(viewport.ownerDocument.activeElement)) focusViewport(viewport);
    }, [viewportRef, focusViewport]);

    const firstDataColumn = useMemo(
        () => navigationColumns.find(c => !isSystemField(c.field)) ?? navigationColumns[0],
        [navigationColumns]
    );

    const getDefaultFocus = useCallback((): FocusedCell | null => {
        if (checkboxSelection) return { id: null, field: CHECKBOX_FIELD };
        if (!firstDataColumn) return null;
        const firstRow = allRenderableRows[0];
        return firstRow ? { id: getRowId(firstRow), field: firstDataColumn.field, rowIndex: 0 } : { id: null, field: firstDataColumn.field };
    }, [checkboxSelection, firstDataColumn, allRenderableRows, getRowId]);

    const scrollCellIntoView = useCallback((rowIndex: number, field: string) => {
        const el = viewportRef.current;
        if (!el) return;
        const { cumulativeHeights, pinnedBottomHeight, columnMetrics } = virtualization;

        // allRenderableRows = pinned top + center + pinned bottom; pinned rows are sticky and always visible.
        if (rowIndex >= 0) {
            scrollRowIntoView(el, rowIndex - pinnedTopRowCount, cumulativeHeights, pinnedBottomHeight, rowHeight);
        }

        if (isSystemField(field)) {
            // System columns sit before every data column; only unpinned ones can scroll away.
            const isPinned = field === REORDER_FIELD
                || (field === EXPAND_FIELD && pinExpandColumn)
                || (field === CHECKBOX_FIELD && pinCheckboxColumn);
            if (!isPinned && el.scrollLeft > 0) el.scrollLeft = 0;
            return;
        }
        if (!columnMetrics) return;

        const { clientWidth, scrollLeft } = el;
        const { leftPinnedWidth, rightPinnedWidth, unpinnedAccWidths, unpinnedCols, totalSpecialsWidth, pinnedSpecialsWidth } = columnMetrics;
        const unpinnedIndex = unpinnedCols.findIndex(c => c.field === field);
        if (unpinnedIndex === -1) return;

        const colLeft = totalSpecialsWidth + leftPinnedWidth + (unpinnedIndex > 0 ? unpinnedAccWidths[unpinnedIndex - 1] : 0);
        const colRight = totalSpecialsWidth + leftPinnedWidth + unpinnedAccWidths[unpinnedIndex];
        const visibleStart = scrollLeft + pinnedSpecialsWidth + leftPinnedWidth;
        const visibleEnd = scrollLeft + clientWidth - rightPinnedWidth;

        let newScrollLeft = scrollLeft;
        if (colLeft < visibleStart) {
            newScrollLeft = Math.max(0, colLeft - pinnedSpecialsWidth - leftPinnedWidth);
        } else if (colRight > visibleEnd) {
            newScrollLeft = colRight - clientWidth + rightPinnedWidth;
        }
        if (newScrollLeft !== scrollLeft) el.scrollLeft = newScrollLeft;
    }, [viewportRef, virtualization, pinnedTopRowCount, rowHeight, pinCheckboxColumn, pinExpandColumn]);

    // Keep DOM focus on the element of the focused cell. This covers keyboard moves, a cell that
    // mounts later (scrolled into the render window), the end of an edit, and a focused cell that
    // unmounts (focus is parked on the viewport so keys keep working). Focus is never taken from
    // an element outside the grid, nor from content inside the grid unless the focus position moved.
    useLayoutEffect(() => {
        const viewport = viewportRef.current;
        const moved = !isSameCell(lastSyncedRef.current, focusedCell);
        lastSyncedRef.current = focusedCell;
        if (!viewport || !focusedCell) return;

        const doc = viewport.ownerDocument;
        const active = doc.activeElement;
        let takeFocus: boolean;
        if (active === viewport) takeFocus = true;
        else if (!active || active === doc.body) takeFocus = ownsFocusRef.current;
        else if (viewport.contains(active)) takeFocus = moved;
        else takeFocus = false;
        if (!takeFocus) return;

        const target = findFocusTarget(viewport, focusedCell, focusedRowIndex);
        if (target) {
            if (!target.contains(active)) target.focus({ preventScroll: true });
        } else if (active !== viewport) {
            focusViewport(viewport);
        }
    });

    const handleMouseDownCapture = useCallback(() => {
        pointerDownRef.current = true;
        setKeyboardMode(false);
    }, [setKeyboardMode]);

    const handleFocus = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
        const viewport = event.currentTarget;
        const related = event.relatedTarget;
        const fromOutside = !(related instanceof Node && viewport.contains(related));
        const byPointer = pointerDownRef.current;
        pointerDownRef.current = false;
        ownsFocusRef.current = true;
        setFocusWithin(true);
        if (internalFocusRef.current) return;

        if (event.target === viewport) {
            if (!fromOutside) return;
            // Tabbing (or programmatic focus) into the grid: go back to the last focused cell.
            if (!byPointer) setKeyboardMode(true);
            if (focusedCell) {
                const target = findFocusTarget(viewport, focusedCell, focusedRowIndex);
                if (target) target.focus({ preventScroll: true });
                else scrollCellIntoView(focusedRowIndex, focusedCell.field);
                return;
            }
            const initial = getDefaultFocus();
            if (initial) {
                setFocusedCell(prev => prev ?? initial);
                scrollCellIntoView(initial.rowIndex ?? -1, initial.field);
            }
            return;
        }

        // Focus landed inside the grid (a click, Tab onto a control in a cell, the window being
        // re-activated): the focus position follows it.
        const hit = focusedCellFromElement(event.target, viewport, allRenderableRows, getRowId);
        if (hit && !isSameCell(hit, focusedCell)) setFocusedCell(hit);
    }, [focusedCell, focusedRowIndex, getDefaultFocus, scrollCellIntoView, setKeyboardMode, allRenderableRows, getRowId]);

    const handleBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        // The focus position is kept so that returning to the grid restores it; only the ring is hidden.
        ownsFocusRef.current = false;
        pointerDownRef.current = false;
        setFocusWithin(false);
        setKeyboardMode(false);
    }, [setKeyboardMode]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        const viewport = event.currentTarget as HTMLElement;
        const targetKind = classifyKeyTarget(event.target, viewport);
        if (targetKind === 'foreign') return;
        setKeyboardMode(true);

        // While an IME is composing, Enter / Escape / arrows confirm or navigate candidates.
        if (event.nativeEvent?.isComposing || event.keyCode === 229) return;

        const { key } = event;
        const isSpace = key === ' ' || key === 'Spacebar';
        const isEditing = Boolean(editingHandlers.editingCell);

        const moveTo = (r: number, c: number) => {
            const col = navigationColumns[c];
            if (!col || r < -1 || r >= allRenderableRows.length) return;
            setFocusedCell(r === -1 ? { id: null, field: col.field } : { id: getRowId(allRenderableRows[r]), field: col.field, rowIndex: r });
            scrollCellIntoView(r, col.field);
        };

        if (!focusedCell) {
            if (!NAVIGATION_KEYS.has(key)) return;
            const initial = getDefaultFocus();
            if (!initial) return;
            event.preventDefault();
            setFocusedCell(initial);
            scrollCellIntoView(initial.rowIndex ?? -1, initial.field);
            return;
        }

        const { id, field } = focusedCell;
        const rowIndex = focusedRowIndex;
        const colIndex = navigationColumns.findIndex(c => c.field === field);
        const systemColumnCount = navigationColumns.filter(c => isSystemField(c.field)).length;
        const isSyntheticRow = (rowId: GridRowId) => rowMetaMap?.get(rowId)?.isGroupRow === true;
        // Same rule and starting value as double-click (see Row / resolveCellEditable).
        const isEditableCell = (row: R, r: number, c: number) => {
            const colDef = navigationColumns[c] as GridColDef<R>;
            if (isSystemField(colDef.field)) return false;
            return resolveCellEditable({
                row,
                field: colDef.field,
                value: getCellValue(row, colDef),
                colDef,
                rowIndex: r,
                colIndex: c - systemColumnCount,
                rowMeta: rowMetaMap?.get(getRowId(row)),
            }, isCellEditable);
        };

        // Next editable data cell in reading order, for Tab while editing.
        const findNextEditable = (deltaCol: number) => {
            let r = rowIndex;
            let c = colIndex;
            const maxSteps = (allRenderableRows.length + 1) * navigationColumns.length;
            for (let steps = 0; steps < maxSteps; steps++) {
                c += deltaCol;
                if (c >= navigationColumns.length) { c = 0; r++; }
                else if (c < 0) { c = navigationColumns.length - 1; r--; }
                if (r < 0 || r >= allRenderableRows.length) return null;

                const row = allRenderableRows[r];
                // Cells covered by a span are not stops; their origin is.
                if (getSpanOrigin?.(getRowId(row), navigationColumns[c].field)) continue;
                if (isEditableCell(row, r, c)) return { r, c };
            }
            return null;
        };

        if (isEditing) {
            if (key === 'Enter') {
                event.preventDefault();
                editingHandlers.stopCellEdit();
            } else if (key === 'Escape') {
                event.preventDefault();
                editingHandlers.stopCellEdit({ cancel: true });
            } else if (key === 'Tab' && id !== null) {
                // No next editable cell: the browser moves focus on and the editor commits on blur.
                const next = findNextEditable(event.shiftKey ? -1 : 1);
                if (next) {
                    event.preventDefault();
                    editingHandlers.stopCellEdit();
                    moveTo(next.r, next.c);
                }
            }
            return;
        }

        // Tab is not captured outside edit mode: the grid is a single tab stop and Tab leaves it
        // (or reaches focusable content inside cells and detail panels).
        if (key === 'Tab' || key === 'Escape') return;
        // Enter and Space activate a control rendered inside a cell.
        if (targetKind === 'control' && (key === 'Enter' || isSpace)) return;

        if ((event.ctrlKey || event.metaKey) && (key === 'a' || key === 'A')) {
            if (!rowSelectionEnabled || !multipleRowSelectionEnabled || !handleSelectAll) return;
            event.preventDefault();
            handleSelectAll(true);
            return;
        }

        if (id === null) {
            if (key === 'Enter' || isSpace) {
                event.preventDefault();
                if (field === CHECKBOX_FIELD) {
                    // Same as clicking the select-all checkbox.
                    findFocusTarget(viewport, focusedCell, -1)?.click();
                    return;
                }
                const col = navigationColumns[colIndex];
                if (!col || isSystemField(field) || col.sortable === false) return;
                const currentSort = sortModel.find(item => item.field === field);
                const direction: GridSortDirection = currentSort ? (currentSort.sort === 'asc' ? 'desc' : null) : 'asc';
                handleSort(field, direction);
                return;
            }
        } else if (key === 'Enter' || isSpace) {
            event.preventDefault();
            const row = allRenderableRows[rowIndex];
            if (field === CHECKBOX_FIELD) {
                handleSelectionChange(id, !selectedRowIds.has(id));
                return;
            }
            if (field === EXPAND_FIELD) {
                if (!event.shiftKey) handleDetailPanelToggle(id);
                return;
            }
            if (isSpace) {
                // Shift+Space selects the row; plain Space only must not scroll the viewport.
                if (event.shiftKey && rowSelectionEnabled && !isSyntheticRow(id)) {
                    handleSelectionChange(id, !selectedRowIds.has(id));
                }
                return;
            }
            if (field === REORDER_FIELD) return;
            if (isEditableCell(row, rowIndex, colIndex)) {
                editingHandlers.startCellEdit({ id, field, value: getCellValue(row, navigationColumns[colIndex] as GridColDef<R>) });
                return;
            }
            // Keyboard equivalent of clicking the row: onRowClick, click-to-select, group expansion.
            onRowActivate?.({ row, id, rowIndex });
            return;
        }

        if (!NAVIGATION_KEYS.has(key)) return;
        // Prevent native scrolling even when the focus cannot move (grid edges).
        event.preventDefault();

        const lastRow = allRenderableRows.length - 1;
        const lastCol = navigationColumns.length - 1;
        const withModifier = event.ctrlKey || event.metaKey;
        const page = pagination ? pageSize : 10;

        const step = (r: number, c: number): { r: number; c: number } => {
            switch (key) {
                case 'ArrowRight': return c + 1 > lastCol ? { r: r + 1, c: 0 } : { r, c: c + 1 };
                case 'ArrowLeft': return c - 1 < 0 ? { r: r - 1, c: lastCol } : { r, c: c - 1 };
                case 'ArrowDown': return { r: r + 1, c };
                case 'ArrowUp': return { r: r - 1, c };
                case 'Home': return { r: withModifier ? -1 : r, c: 0 };
                case 'End': return { r: withModifier ? lastRow : r, c: lastCol };
                case 'PageUp': return { r: Math.max(-1, r - page), c };
                default: return { r: Math.min(lastRow, r + page), c };
            }
        };
        const inGrid = ({ r, c }: { r: number; c: number }) => r >= -1 && r <= lastRow && c >= 0 && c <= lastCol;
        const spanOriginAt = ({ r, c }: { r: number; c: number }) =>
            r >= 0 ? getSpanOrigin?.(getRowId(allRenderableRows[r]), navigationColumns[c].field) ?? null : null;

        let next = step(rowIndex, colIndex);
        // Arrow keys step over the cells of the focused span (its own merged area) ...
        if (key.startsWith('Arrow')) {
            for (let origin = inGrid(next) ? spanOriginAt(next) : null;
                origin && origin.rowId === id && origin.field === field;
                origin = inGrid(next) ? spanOriginAt(next) : null) {
                next = step(next.r, next.c);
            }
        }
        if (!inGrid(next)) return;
        // ... then land on the origin of whatever span covers the target cell.
        const origin = spanOriginAt(next);
        if (origin) {
            const originRow = allRenderableRows.findIndex(r => getRowId(r) === origin.rowId);
            const originCol = navigationColumns.findIndex(c => c.field === origin.field);
            if (originRow !== -1 && originCol !== -1) next = { r: originRow, c: originCol };
        }
        if (next.r === rowIndex && next.c === colIndex) return;
        moveTo(next.r, next.c);
    }, [
        focusedCell,
        focusedRowIndex,
        allRenderableRows,
        navigationColumns,
        editingHandlers,
        selectedRowIds,
        handleSelectionChange,
        handleDetailPanelToggle,
        setKeyboardMode,
        sortModel,
        handleSort,
        isCellEditable,
        pagination,
        pageSize,
        rowMetaMap,
        onRowActivate,
        handleSelectAll,
        rowSelectionEnabled,
        multipleRowSelectionEnabled,
        getDefaultFocus,
        scrollCellIntoView,
        getSpanOrigin,
        getRowId,
    ]);

    return {
        focusedCell,
        setFocusedCell,
        viewportTabIndex: focusWithin ? -1 : 0,
        ensureGridFocus,
        handleFocus,
        handleBlur,
        handleKeyDown,
        handleMouseDownCapture,
    };
}
