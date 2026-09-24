import type { GridRowGroupingModel } from '../types';

/**
 * Stable empty grouping model: used when `rowGroupingModel` is not passed and while pivot mode
 * is active. It must keep its identity across renders, because the hierarchy hooks memoize on it.
 */
export const EMPTY_ROW_GROUPING_MODEL: GridRowGroupingModel = [];

export interface ResolveGridModesParams {
    /** `rowGroupingModel` prop (or `EMPTY_ROW_GROUPING_MODEL`). */
    rowGroupingModel: GridRowGroupingModel;
    /** `treeData` prop. */
    treeData: boolean;
    /** Whether `getTreeDataPath` was passed. */
    hasTreeDataPath: boolean;
    /** Whether the pivot is producing the rows (`useGridPivot().isActive`). */
    isPivotActive: boolean;
    /** `rowReordering` prop. */
    rowReordering: boolean;
    /** Whether `groupingColDef` was passed. */
    hasGroupingColDef: boolean;
    /** `pagination` prop. */
    pagination: boolean;
    paginationMode: 'client' | 'server' | 'infinite';
    /** `listView` prop. */
    listView: boolean;
    /** Whether `listViewColumn` was passed. */
    hasListViewColumn: boolean;
}

export interface GridModes {
    /** Row drag-reorder is on (never over generated pivot rows). */
    rowReordering: boolean;
    /** The grouping model the hierarchy hooks see: empty while pivoting. */
    hierarchyRowGroupingModel: GridRowGroupingModel;
    /** `treeData` asked for and not overridden by the pivot. */
    isTreeDataRequested: boolean;
    /** Tree data is built: requested and `getTreeDataPath` is present. */
    isTreeData: boolean;
    isRowGrouping: boolean;
    isHierarchyEnabled: boolean;
    /** The synthetic `__group__` column is shown. */
    hasGroupingColumn: boolean;
    /** Pagination is on: requested, not grouping, and not infinite scroll. */
    pagination: boolean;
    /** List view is shown: requested and `listViewColumn` is present. */
    listView: boolean;
}

/**
 * Which grid features are in effect, from the props that request them. Features override each
 * other here and nowhere else:
 * - pivot rows are generated, so row-reorder indices over them would mean nothing to the consumer;
 * - pivot rows are already grouped by the pivot row fields, so tree data and row grouping would regroup them;
 * - without `getTreeDataPath` there is no tree to build: the rows are shown flat (useTreeData warns);
 * - infinite scroll loads rows as the user scrolls: it has no pages to show or slice;
 * - list view needs a `listViewColumn` to render its items; without one the grid view is shown
 *   (useGridDevWarnings says so) instead of an empty container.
 */
export function resolveGridModes(params: ResolveGridModesParams): GridModes {
    const { isPivotActive } = params;
    const hierarchyRowGroupingModel = isPivotActive ? EMPTY_ROW_GROUPING_MODEL : params.rowGroupingModel;
    const isTreeDataRequested = params.treeData && !isPivotActive;
    const isTreeData = isTreeDataRequested && params.hasTreeDataPath;
    const isRowGrouping = hierarchyRowGroupingModel.length > 0;
    return {
        rowReordering: params.rowReordering && !isPivotActive,
        hierarchyRowGroupingModel,
        isTreeDataRequested,
        isTreeData,
        isRowGrouping,
        isHierarchyEnabled: isTreeData || isRowGrouping,
        hasGroupingColumn: params.hasGroupingColDef && (isRowGrouping || isTreeData),
        pagination: params.pagination && !isRowGrouping && params.paginationMode !== 'infinite',
        listView: params.listView && params.hasListViewColumn,
    };
}
