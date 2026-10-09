import { useMemo } from 'react';
import { getAriaRowLayout, type GridAriaRowLayout } from '../../utils/aria';
import { getColumnGroupDepth } from '../../utils/columnGroups';
import type { GridColumnGroupingModel, GridPaginationModel } from '../../types';

export interface UseGridAriaRowsParams {
    columnGroupingModel: GridColumnGroupingModel | undefined;
    /** Whether the header filter row (`headerFilters`) is rendered: one more header row. */
    headerFilterRow?: boolean;
    pinnedTopCount: number;
    pinnedBottomCount: number;
    pagination: boolean;
    paginationMode: 'client' | 'server' | 'infinite';
    paginationModel: GridPaginationModel;
    /** What the pager pages through (see `getPaginationRowCount`). */
    paginationRowCount: number;
    paginatedUnpinnedRowCount: number;
    sortedUnpinnedRowCount: number;
}

/** `aria-rowcount` and the `aria-rowindex` bases of the pinned and centre rows. */
export function useGridAriaRows(params: UseGridAriaRowsParams): GridAriaRowLayout {
    const {
        columnGroupingModel, headerFilterRow = false, pinnedTopCount, pinnedBottomCount, pagination, paginationMode, paginationModel,
        paginationRowCount, paginatedUnpinnedRowCount, sortedUnpinnedRowCount,
    } = params;
    const { page, pageSize } = paginationModel;

    return useMemo(() => getAriaRowLayout({
        headerRowCount: 1 + getColumnGroupDepth(columnGroupingModel) + (headerFilterRow ? 1 : 0),
        pinnedTopCount,
        pinnedBottomCount,
        pageRowCount: pagination ? paginatedUnpinnedRowCount : sortedUnpinnedRowCount,
        totalCenterRowCount: pagination && paginationMode === 'server'
            ? Math.max(paginationRowCount, paginatedUnpinnedRowCount)
            : sortedUnpinnedRowCount,
        pageOffset: pagination ? page * pageSize : 0,
    }), [columnGroupingModel, headerFilterRow, pinnedTopCount, pinnedBottomCount, pagination, paginatedUnpinnedRowCount,
        sortedUnpinnedRowCount, paginationMode, paginationRowCount, page, pageSize]);
}
