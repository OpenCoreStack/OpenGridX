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
    /** Resolves a row's id (rows are not guaranteed to carry it in `row.id`); defaults to `row.id`. */
    getRowId?: (row: R) => GridRowId;
}

export interface GridVisibleRow<R extends GridRowModel> {
    row: R;
    /** The row's id (getRowId), resolved once for everything that renders the row. */
    id: GridRowId;
    rowIndex: number;
    /** Set on the rows of the top / bottom pinned sections, which render outside the scrolling rows. */
    pinned?: 'top' | 'bottom';
}

const defaultGetRowId = <R extends GridRowModel>(row: R): GridRowId => row.id;

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
        getRowId = defaultGetRowId,
    } = params;

    return useMemo<GridVisibleRow<R>[]>(() => {
        const { firstRowIndex, lastRowIndex } = renderContext;
        const centerRows = pagination ? paginatedUnpinnedRows : sortedUnpinnedRows;
        const topPinnedCount = pinnedTopRows.length;

        const topPinned = pinnedTopRows.map((row, index) => ({ row, id: getRowId(row), rowIndex: index, pinned: 'top' as const }));
        const bottomPinned = pinnedBottomRows.map((row, index) => ({
            row,
            id: getRowId(row),
            rowIndex: topPinnedCount + centerRows.length + index,
            pinned: 'bottom' as const,
        }));

        // renderContext indices come from the unpinned-row layout, so they index centerRows directly.
        const centerStartIndex = Math.max(0, firstRowIndex);
        const centerEndIndex = Math.min(centerRows.length, lastRowIndex + 1);

        const centerVisible = centerRows
            .slice(centerStartIndex, centerEndIndex)
            .map((row, index) => ({
                row,
                id: getRowId(row),
                rowIndex: topPinnedCount + centerStartIndex + index,
            }));

        const combined: GridVisibleRow<R>[] = [...topPinned, ...centerVisible, ...bottomPinned];

        // Deduplication guard: a row ID in both pinnedRows and rows would cause React key collisions
        const seenIds = new Set<GridRowId>();
        return combined.filter(item => {
            if (seenIds.has(item.id)) return false;
            seenIds.add(item.id);
            return true;
        });
    }, [renderContext, pinnedTopRows, pinnedBottomRows, paginatedUnpinnedRows, sortedUnpinnedRows, pagination, getRowId]);
}
