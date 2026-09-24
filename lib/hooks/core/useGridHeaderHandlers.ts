import { useCallback, useLayoutEffect, useRef } from 'react';
import { upsertSortItem } from '../../utils/sorting';
import { pinColumnTo } from '../../utils/pinning';
import type {
    GridColumnPinning,
    GridColumnVisibilityModel,
    GridPinnedPosition,
    GridSortDirection,
    GridSortItem,
} from '../../types';

/**
 * The sort model after sorting `field` by `direction` (null removes it). `multiSort` adds or updates
 * the column in the model (shift-click); otherwise the model is replaced by this one column. The
 * header, the keyboard and `apiRef.sortColumn` all build the next model with this.
 */
export function nextSortModelForColumn(
    current: readonly GridSortItem[],
    field: string,
    direction: GridSortDirection,
    multiSort: boolean
): GridSortItem[] {
    if (multiSort) return upsertSortItem(current, field, direction);
    return direction ? [{ field, sort: direction }] : current.filter(item => item.field !== field);
}

export interface UseGridSortHandlersParams {
    sortModel: GridSortItem[];
    /** Stores the model when uncontrolled and calls onSortModelChange (useGridControlledState). */
    onSortModelChange: (model: GridSortItem[]) => void;
}

export interface UseGridSortHandlersResult {
    /** Header click / Enter: replaces the sort model with this column (or clears it). */
    handleSort: (field: string, direction: GridSortDirection) => void;
    /** Shift-click / Shift+Enter: adds, updates or removes this column in the sort model. */
    handleSortAdd: (field: string, direction: GridSortDirection) => void;
}

/** Sort changes from the header and the keyboard; the same transition and handler as apiRef.sortColumn. */
export function useGridSortHandlers(params: UseGridSortHandlersParams): UseGridSortHandlersResult {
    const { sortModel, onSortModelChange } = params;

    const handleSort = useCallback((field: string, direction: GridSortDirection) => {
        onSortModelChange(nextSortModelForColumn(sortModel, field, direction, false));
    }, [sortModel, onSortModelChange]);

    const handleSortAdd = useCallback((field: string, direction: GridSortDirection) => {
        onSortModelChange(nextSortModelForColumn(sortModel, field, direction, true));
    }, [sortModel, onSortModelChange]);

    return { handleSort, handleSortAdd };
}

export interface UseGridColumnMenuHandlersParams {
    columnVisibilityModel: GridColumnVisibilityModel;
    onColumnVisibilityModelChange: (model: GridColumnVisibilityModel) => void;
    pinnedColumns: GridColumnPinning;
    onPinnedColumnsChange: (model: GridColumnPinning) => void;
}

export interface UseGridColumnMenuHandlersResult {
    handleHideColumn: (field: string) => void;
    handlePinColumn: (field: string, side: GridPinnedPosition | null) => void;
}

/**
 * The column menu's Hide and Pin actions. Each builds on the latest model, including a change made
 * earlier in the same tick, so two hides (or pins) before a re-render both stick.
 */
export function useGridColumnMenuHandlers(params: UseGridColumnMenuHandlersParams): UseGridColumnMenuHandlersResult {
    const { columnVisibilityModel, onColumnVisibilityModelChange, pinnedColumns, onPinnedColumnsChange } = params;

    const latestRef = useRef({ columnVisibilityModel, pinnedColumns });
    useLayoutEffect(() => {
        latestRef.current = { columnVisibilityModel, pinnedColumns };
    });

    const handleHideColumn = useCallback((field: string) => {
        const next = { ...latestRef.current.columnVisibilityModel, [field]: false };
        latestRef.current = { ...latestRef.current, columnVisibilityModel: next };
        onColumnVisibilityModelChange(next);
    }, [onColumnVisibilityModelChange]);

    const handlePinColumn = useCallback((field: string, side: GridPinnedPosition | null) => {
        const next = pinColumnTo(latestRef.current.pinnedColumns, field, side);
        latestRef.current = { ...latestRef.current, pinnedColumns: next };
        onPinnedColumnsChange(next);
    }, [onPinnedColumnsChange]);

    return { handleHideColumn, handlePinColumn };
}
