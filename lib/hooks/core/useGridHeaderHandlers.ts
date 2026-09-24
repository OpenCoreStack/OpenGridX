import { useCallback } from 'react';
import { upsertSortItem } from '../../utils/sorting';
import { pinColumnTo } from '../../utils/pinning';
import type {
    GridColumnPinning,
    GridColumnVisibilityModel,
    GridPinnedPosition,
    GridSortDirection,
    GridSortItem,
} from '../../types';

export interface UseGridSortHandlersParams {
    sortModel: GridSortItem[];
    isSortControlled: boolean;
    setInternalSortModel: (model: GridSortItem[]) => void;
    onSortModelChange: ((model: GridSortItem[]) => void) | undefined;
}

export interface UseGridSortHandlersResult {
    /** Header click / Enter: replaces the sort model with this column (or clears it). */
    handleSort: (field: string, direction: GridSortDirection) => void;
    /** Shift-click / Shift+Enter: adds, updates or removes this column in the sort model. */
    handleSortAdd: (field: string, direction: GridSortDirection) => void;
}

/** Sort changes from the header and the keyboard. */
export function useGridSortHandlers(params: UseGridSortHandlersParams): UseGridSortHandlersResult {
    const { sortModel, isSortControlled, setInternalSortModel, onSortModelChange } = params;

    const handleSort = useCallback((field: string, direction: GridSortDirection) => {
        const newSortModel = direction ? [{ field, sort: direction }] : [];

        if (!isSortControlled) {
            setInternalSortModel(newSortModel as GridSortItem[]);
        }
        onSortModelChange?.(newSortModel as GridSortItem[]);
    }, [isSortControlled, onSortModelChange, setInternalSortModel]);

    const handleSortAdd = useCallback((field: string, direction: GridSortDirection) => {
        const newSortModel = upsertSortItem(sortModel, field, direction);

        if (!isSortControlled) {
            setInternalSortModel(newSortModel);
        }
        onSortModelChange?.(newSortModel);
    }, [sortModel, isSortControlled, onSortModelChange, setInternalSortModel]);

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

/** The column menu's Hide and Pin actions. */
export function useGridColumnMenuHandlers(params: UseGridColumnMenuHandlersParams): UseGridColumnMenuHandlersResult {
    const { columnVisibilityModel, onColumnVisibilityModelChange, pinnedColumns, onPinnedColumnsChange } = params;

    const handleHideColumn = useCallback((field: string) => {
        onColumnVisibilityModelChange({
            ...columnVisibilityModel,
            [field]: false,
        });
    }, [columnVisibilityModel, onColumnVisibilityModelChange]);

    const handlePinColumn = useCallback((field: string, side: GridPinnedPosition | null) => {
        onPinnedColumnsChange(pinColumnTo(pinnedColumns, field, side));
    }, [pinnedColumns, onPinnedColumnsChange]);

    return { handleHideColumn, handlePinColumn };
}
