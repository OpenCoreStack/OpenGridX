import { useEffect } from 'react';
import type { MutableRefObject } from 'react';
import { buildGroupedExportRows } from '../../utils/grouping/groupedExportRows';
import type { GridHierarchyVisibleRowsOptions, GridGroupAggregationPosition } from '../useRowGrouping';
import type {
    GridAggregationModel,
    GridAggregationResult,
    GridApi,
    GridColDef,
    GridGroupedExportRow,
    GridRowId,
    GridRowMeta,
    GridRowModel,
} from '../../types';

export interface UseGridAggregationApiParams<R extends GridRowModel> {
    apiRef: MutableRefObject<GridApi>;
    /** An aggregation model is set and the pivot is off. */
    hasAggregation: boolean;
    aggregationResult: GridAggregationResult;
    aggregationModel: GridAggregationModel;
    isRowGrouping: boolean;
    rowGroupingHandlers: {
        getVisibleRows: (options?: GridHierarchyVisibleRowsOptions) => R[] | null;
        rootAggregationPosition: GridGroupAggregationPosition;
        aggregationPositions: Map<GridRowId, GridGroupAggregationPosition>;
    };
    rowMetaMap: Map<GridRowId, GridRowMeta>;
    columns: GridColDef<R>[];
    getRowId: (row: GridRowModel) => GridRowId;
}

/** Installs `getAggregationResult`, `getAggregationModel` and `getGroupedExportRows` on the API. */
export function useGridAggregationApi<R extends GridRowModel>(params: UseGridAggregationApiParams<R>): void {
    const {
        apiRef, hasAggregation, aggregationResult, aggregationModel, isRowGrouping, rowGroupingHandlers,
        rowMetaMap, columns, getRowId,
    } = params;

    useEffect(() => {
        apiRef.current.getAggregationResult = () => hasAggregation ? aggregationResult : null;
        apiRef.current.getAggregationModel = () => hasAggregation ? aggregationModel : null;
        apiRef.current.getGroupedExportRows = (): GridGroupedExportRow[] | null => {
            if (!isRowGrouping) return null;
            // Every group expanded, filtered and sorted like the screen: collapsed groups still
            // export their rows. Subtotals and the grand total hidden by getAggregationPosition
            // (null) are left out, as they are on screen.
            return buildGroupedExportRows<R>({
                rows: rowGroupingHandlers.getVisibleRows({ expandAll: true }) ?? [],
                getRowId,
                rowMetaMap,
                columns,
                aggregationModel,
                aggregationResult: hasAggregation && rowGroupingHandlers.rootAggregationPosition !== null ? aggregationResult : null,
                isSubtotalHidden: (groupId) => rowGroupingHandlers.aggregationPositions.get(groupId) === null,
            });
        };
    }, [aggregationResult, aggregationModel, hasAggregation, apiRef, isRowGrouping, rowGroupingHandlers, rowMetaMap, columns, getRowId]);
}
