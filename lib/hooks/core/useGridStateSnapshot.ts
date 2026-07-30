import { useRef, useEffect, useLayoutEffect } from 'react';
import type { GridState } from '../../state/types';
import type {
    GridSortItem,
    GridFilterModel,
    GridPaginationModel,
    GridColumnPinning,
} from '../../types';

export interface UseGridStateSnapshotParams {
    onStateChange?: (state: GridState) => void;
    sortModel: GridSortItem[];
    filterModel: GridFilterModel;
    effectivePaginationModel: GridPaginationModel;
    columnWidths: Record<string, number>;
    effectiveColumnOrder: string[];
    columnVisibilityModel: Record<string, boolean>;
    pinnedColumns: GridColumnPinning;
}

export function useGridStateSnapshot(params: UseGridStateSnapshotParams): void {
    const {
        onStateChange,
        sortModel,
        filterModel,
        effectivePaginationModel,
        columnWidths,
        effectiveColumnOrder,
        columnVisibilityModel,
        pinnedColumns,
    } = params;

    const onStateChangeRef = useRef(onStateChange);
    useLayoutEffect(() => {
        onStateChangeRef.current = onStateChange;
    });

    useEffect(() => {
        if (!onStateChangeRef.current) return;

        const snapshot: GridState = {
            sorting: { sortModel: sortModel as { field: string; sort: 'asc' | 'desc' }[] },
            filter: { filterModel },
            pagination: { paginationModel: effectivePaginationModel },
            columns: {
                columnWidths,
                columnOrder: effectiveColumnOrder,
                columnVisibilityModel,
                pinnedColumns,
            },
        };

        onStateChangeRef.current(snapshot);
    }, [
        sortModel,
        filterModel,
        effectivePaginationModel,
        columnWidths,
        effectiveColumnOrder,
        columnVisibilityModel,
        pinnedColumns,
    ]);
}
