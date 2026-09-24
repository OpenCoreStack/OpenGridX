import type { GridRowId, GridRowMeta, GridRowModel } from '../types';

export interface CollectAllFilteredRowsParams<R extends GridRowModel> {
    /** The active tree-data / row-grouping handlers, or null when the rows are flat. */
    hierarchyHandlers: { getVisibleRows: (options?: { expandAll?: boolean }) => R[] | null } | null;
    pinnedTopRows: R[];
    /** Every unpinned row that passes the filter, sorted, across all pages. */
    sortedUnpinnedRows: R[];
    pinnedBottomRows: R[];
    rowMetaMap: Map<GridRowId, GridRowMeta>;
    getRowId: (row: GridRowModel) => GridRowId;
}

/**
 * `GridApi.getAllFilteredRows()`: every data row that passes the filter, in display order,
 * ignoring pagination and hierarchy expansion. Flat rows keep their pinned rows; with a
 * hierarchy every group is expanded and synthetic group rows are left out.
 */
export function collectAllFilteredRows<R extends GridRowModel>(params: CollectAllFilteredRowsParams<R>): R[] {
    const { hierarchyHandlers, pinnedTopRows, sortedUnpinnedRows, pinnedBottomRows, rowMetaMap, getRowId } = params;
    const hierarchyRows = hierarchyHandlers?.getVisibleRows({ expandAll: true });
    if (!hierarchyRows) return [...pinnedTopRows, ...sortedUnpinnedRows, ...pinnedBottomRows];
    return hierarchyRows.filter(row => !rowMetaMap.get(getRowId(row))?.isGroupRow);
}
