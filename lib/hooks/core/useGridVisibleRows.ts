import { useMemo } from 'react';
import type { GridRowModel, GridRowId } from '../../types';

interface RenderContext {
    firstRowIndex: number;
    lastRowIndex: number;
}

export interface UseGridVisibleRowsParams<R extends GridRowModel> {
    renderContext: RenderContext;
    pinnedTopRows: R[];
    pinnedBottomRows: R[];
    paginatedUnpinnedRows: R[];
    sortedUnpinnedRows: R[];
    pagination: boolean;
}

export interface GridVisibleRow<R extends GridRowModel> {
    row: R;
    rowIndex: number;
}

export function useGridVisibleRows<R extends GridRowModel>(
    params: UseGridVisibleRowsParams<R>
): GridVisibleRow<R>[] {
    const {
        renderContext,
        pinnedTopRows,
        pinnedBottomRows,
        paginatedUnpinnedRows,
        sortedUnpinnedRows,
        pagination,
    } = params;

    return useMemo<GridVisibleRow<R>[]>(() => {
        const { firstRowIndex, lastRowIndex } = renderContext;
        const centerRows = pagination ? paginatedUnpinnedRows : sortedUnpinnedRows;
        const topPinnedCount = pinnedTopRows.length;

        const topPinned = pinnedTopRows.map((row, index) => ({ row, rowIndex: index }));
        const bottomPinned = pinnedBottomRows.map((row, index) => ({
            row,
            rowIndex: topPinnedCount + centerRows.length + index,
        }));

        const centerStartIndex = Math.max(0, firstRowIndex - topPinnedCount);
        const centerEndIndex = Math.min(centerRows.length, lastRowIndex - topPinnedCount + 1);

        const centerVisible = centerRows
            .slice(centerStartIndex, centerEndIndex)
            .map((row, index) => ({
                row,
                rowIndex: topPinnedCount + centerStartIndex + index,
            }));

        const combined = [...topPinned, ...centerVisible, ...bottomPinned];

        // Deduplication guard: a row ID in both pinnedRows and rows would cause React key collisions
        const seenIds = new Set<GridRowId>();
        return combined.filter(item => {
            if (seenIds.has(item.row.id)) return false;
            seenIds.add(item.row.id);
            return true;
        });
    }, [renderContext, pinnedTopRows, pinnedBottomRows, paginatedUnpinnedRows, sortedUnpinnedRows, pagination]);
}
