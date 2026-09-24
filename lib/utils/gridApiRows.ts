import type { GridRowId, GridRowMeta, GridRowModel } from '../types';

export interface CollectAllFilteredRowsParams<R extends GridRowModel> {
    /** The active tree-data / row-grouping handlers, or null when the rows are flat. */
    hierarchyHandlers: { getVisibleRows: (options?: { expandAll?: boolean; labelField?: string }) => R[] | null } | null;
    /** The column that shows the hierarchy, so sorting by it orders the rows as on screen. */
    hierarchyField?: string;
    pinnedTopRows: R[];
    /** Every unpinned row that passes the filter, sorted, across all pages. */
    sortedUnpinnedRows: R[];
    pinnedBottomRows: R[];
    rowMetaMap: Map<GridRowId, GridRowMeta>;
    getRowId: (row: GridRowModel) => GridRowId;
    /**
     * With a hierarchy: the rows that pass the filter (the set select-all and the footer use).
     * Tree-data ancestors shown only to give a match its context are left out. Omitted: every
     * non-synthetic row of the expanded hierarchy is returned.
     */
    dataRows?: readonly R[];
}

/**
 * `GridApi.getAllFilteredRows()`: every data row that passes the filter, in display order,
 * ignoring pagination and hierarchy expansion. Flat rows keep their pinned rows; with a
 * hierarchy every group is expanded, and synthetic group rows and tree-data ancestors that do
 * not match the filter themselves (shown only for context) are left out, so the result is the
 * set select-all and the aggregation footer act on.
 */
export function collectAllFilteredRows<R extends GridRowModel>(params: CollectAllFilteredRowsParams<R>): R[] {
    const { hierarchyHandlers, pinnedTopRows, sortedUnpinnedRows, pinnedBottomRows, rowMetaMap, getRowId, hierarchyField, dataRows } = params;
    const hierarchyRows = hierarchyHandlers?.getVisibleRows({ expandAll: true, labelField: hierarchyField });
    if (!hierarchyRows) return [...pinnedTopRows, ...sortedUnpinnedRows, ...pinnedBottomRows];
    const matching = dataRows ? new Set<R>(dataRows) : null;
    return hierarchyRows.filter(row => !rowMetaMap.get(getRowId(row))?.isGroupRow && (!matching || matching.has(row)));
}
