import { useMemo } from 'react';
import { useTreeData } from '../useTreeData';
import { useRowGrouping, type UseRowGroupingParams } from '../useRowGrouping';
import type { GridRowGroupingModel, GridRowId, GridRowMeta, GridRowModel } from '../../types';

const EMPTY_ROW_META_MAP: Map<GridRowId, GridRowMeta> = new Map();

export interface UseGridHierarchyParams<R extends GridRowModel> extends Pick<
    UseRowGroupingParams<R>,
    | 'rows'
    | 'getRowId'
    | 'columns'
    | 'aggregationModel'
    | 'defaultGroupingExpansionDepth'
    | 'filterModel'
    | 'sortModel'
    | 'getAggregationPosition'
    | 'columnLookup'
    | 'filterMode'
    | 'sortingMode'
> {
    getTreeDataPath?: (row: R) => string[];
    /** `treeData` asked for (see `resolveGridModes`): useTreeData warns when it cannot build the tree. */
    isTreeDataRequested: boolean;
    /** Tree data is built. */
    isTreeData: boolean;
    /** The grouping model the hierarchy is built from (empty while pivoting). */
    rowGroupingModel: GridRowGroupingModel;
    isRowGrouping: boolean;
}

/**
 * Tree data and row grouping. Both hooks always run (hook order is fixed); the active one, if
 * any, drives the rows and supplies the `rowMetaMap` every renderer reads hierarchy info from.
 */
export function useGridHierarchy<R extends GridRowModel>(params: UseGridHierarchyParams<R>) {
    const {
        rows, getRowId, getTreeDataPath, isTreeDataRequested, isTreeData, columns, rowGroupingModel, isRowGrouping,
        aggregationModel, defaultGroupingExpansionDepth, filterModel, sortModel, getAggregationPosition,
        columnLookup, filterMode, sortingMode,
    } = params;

    const treeDataHandlers = useTreeData({
        rows,
        getRowId,
        getTreeDataPath,
        treeData: isTreeDataRequested,
        defaultGroupingExpansionDepth,
        filterModel,

        sortModel,
        columnLookup,
        filterMode,
        sortingMode,
    });

    const rowGroupingHandlers = useRowGrouping({
        rows,
        getRowId,
        columns,
        rowGroupingModel,
        aggregationModel,
        defaultGroupingExpansionDepth,
        filterModel,
        sortModel,
        getAggregationPosition,
        columnLookup,
        filterMode,
        sortingMode,
    });

    const activeHierarchyHandlers = isTreeData ? treeDataHandlers : (isRowGrouping ? rowGroupingHandlers : null);

    const rowMetaMap = useMemo<Map<GridRowId, GridRowMeta>>(() => {
        if (isTreeData) return treeDataHandlers.rowMetaMap;
        if (isRowGrouping) return rowGroupingHandlers.rowMetaMap;
        return EMPTY_ROW_META_MAP;
    }, [isTreeData, treeDataHandlers.rowMetaMap, isRowGrouping, rowGroupingHandlers.rowMetaMap]);

    return { treeDataHandlers, rowGroupingHandlers, activeHierarchyHandlers, rowMetaMap };
}
