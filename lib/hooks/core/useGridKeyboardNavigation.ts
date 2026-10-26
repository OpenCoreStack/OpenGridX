import {
    useState,
    useCallback,
    useMemo,
    useRef,
    useLayoutEffect,
} from 'react';
import { handleGridKeyDown } from './gridKeyDown';
import { getScrollStart, setScrollStart } from '../../utils/direction';
import { scrollRowIntoView } from '../../utils/scroll';
import {
    CHECKBOX_FIELD,
    EXPAND_FIELD,
    REORDER_FIELD,
    findFocusTarget,
    focusedCellFromElement,
    isSameCell,
    isSystemField,
} from '../../utils/focus';
import type { FocusedCell } from '../../utils/focus';
import type {
    GridRowModel,
    GridRowId,
    GridColDef,
    GridCellParams,
    GridSortItem,
    GridSortDirection,
    GridRowParams,
    GridRowMeta,
} from '../../types';
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
    selectedRowIds: ReadonlySet<GridRowId>;
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
    /**
     * Adds, updates or removes one sort key and keeps the others. Enter/Space on a header use it
     * when `multiSort` is on or Shift is held, as a header click does.
     */
    handleSortAdd?: (field: string, direction: GridSortDirection) => void;
    multiSort?: boolean;
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
    rowMetaMap?: ReadonlyMap<GridRowId, GridRowMeta>;
    /** Enter on a non-editable cell: the same handler a row click runs. */
    onRowActivate?: (params: GridRowParams<R>) => void;
    /**
     * Tree data / row grouping: expands or collapses a row. Enter on a non-editable cell of any row
     * with children toggles it (a tree-data parent that is a real row included, whose click selects it
     * instead), and Alt+ArrowRight / Alt+ArrowLeft expand / collapse it.
     */
    toggleRowExpansion?: (id: GridRowId) => void;
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
    /**
     * Cell range selection (`cellSelection`), absent while it is off. Shift+navigation keys on a
     * data cell move the range's head (focus stays on the anchor), Escape collapses the range and
     * Ctrl/Cmd+A selects every data cell instead of every row.
     */
    cellSelection?: GridKeyboardCellSelection;
    /**
     * Whether the header filter row (`headerFilters`) is rendered: ArrowDown on a column header
     * moves to its filter cell, and ArrowDown there into the first row.
     */
    headerFilters?: boolean;
    /**
     * The context menu's `openAt` (`contextMenu`), filled after render by `useGridContextMenu`, which
     * runs later: Shift+F10 / the ContextMenu key read it at event time. `null` while the menu is off.
     */
    openContextMenuAtRef: React.RefObject<((cell: FocusedCell) => void) | null>;
}

export interface GridKeyboardCellSelection {
    /** Returns whether the key was used. */
    extendSelection: (key: string, withModifier: boolean, pageSize: number, from: FocusedCell) => boolean;
    /** Returns whether a multi-cell range was collapsed. */
    collapseSelection: () => boolean;
    /** Returns whether anything was selected. */
    selectAllCells: () => boolean;
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

/** Keeps a stored focus position valid when its row or column is no longer rendered. */
function resolveFocus<R extends GridRowModel>(
    cell: FocusedCell | null,
    rows: R[],
    columns: ReadonlyArray<NavigationColumn<R>>,
    getRowId: (row: R) => GridRowId,
    headerFilters: boolean
): { cell: FocusedCell | null; rowIndex: number } {
    if (!cell || columns.length === 0) return { cell: null, rowIndex: -1 };
    const fallbackField = (columns.find(c => !isSystemField(c.field)) ?? columns[0]).field;
    const field = columns.some(c => c.field === cell.field) ? cell.field : fallbackField;

    if (cell.id === null) {
        // A filter cell whose row was turned off falls back to its column header.
        const headerFilter = Boolean(cell.headerFilter) && headerFilters;
        if (field === cell.field && headerFilter === Boolean(cell.headerFilter)) return { cell, rowIndex: -1 };
        return { cell: headerFilter ? { id: null, field, headerFilter } : { id: null, field }, rowIndex: -1 };
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
        handleSortAdd,
        multiSort = false,
        isCellEditable,
        pagination,
        pageSize,
        virtualization,
        viewportRef,
        pinnedTopRowCount = 0,
        getRowId = defaultGetRowId,
        rowMetaMap,
        onRowActivate,
        toggleRowExpansion,
        handleSelectAll,
        rowSelectionEnabled = true,
        multipleRowSelectionEnabled = true,
        pinCheckboxColumn = true,
        pinExpandColumn = true,
        rowHeight,
        getSpanOrigin,
        cellSelection,
        headerFilters = false,
        openContextMenuAtRef,
    } = params;

    const [storedFocus, setFocusedCell] = useState<FocusedCell | null>(null);
    const [focusWithin, setFocusWithin] = useState(false);

    const resolved = useMemo(
        () => resolveFocus(storedFocus, allRenderableRows, navigationColumns, getRowId, headerFilters),
        [storedFocus, allRenderableRows, navigationColumns, getRowId, headerFilters]
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
            if (!isPinned && getScrollStart(el) > 0) setScrollStart(el, 0);
            return;
        }
        if (!columnMetrics) return;

        const { clientWidth } = el;
        const scrollLeft = getScrollStart(el);
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
        if (newScrollLeft !== scrollLeft) setScrollStart(el, newScrollLeft);
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
        handleGridKeyDown(event, {
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
            handleSortAdd,
            multiSort,
            isCellEditable,
            pagination,
            pageSize,
            rowMetaMap,
            onRowActivate,
            toggleRowExpansion,
            handleSelectAll,
            rowSelectionEnabled,
            multipleRowSelectionEnabled,
            getDefaultFocus,
            scrollCellIntoView,
            getSpanOrigin,
            getRowId,
            cellSelection,
            headerFilters,
            setFocusedCell,
            openContextMenuAt: openContextMenuAtRef.current,
        });
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
        handleSortAdd,
        multiSort,
        isCellEditable,
        pagination,
        pageSize,
        rowMetaMap,
        onRowActivate,
        toggleRowExpansion,
        handleSelectAll,
        rowSelectionEnabled,
        multipleRowSelectionEnabled,
        getDefaultFocus,
        scrollCellIntoView,
        getSpanOrigin,
        getRowId,
        cellSelection,
        headerFilters,
        openContextMenuAtRef,
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
