import { useLayoutEffect, useRef } from 'react';
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
    /** The column that shows the group labels, so export order matches the screen when sorting by it. */
    hierarchyField?: string;
}

/**
 * Installs `getAggregationResult`, `getAggregationModel` and `getGroupedExportRows` on the API.
 * Like useGridApiMethods, the methods are installed in a layout effect and read the latest values
 * from a ref, so they are live in a parent's layout effect on mount and never answer from a
 * previous render.
 */
export function useGridAggregationApi<R extends GridRowModel>(params: UseGridAggregationApiParams<R>): void {
    const { apiRef } = params;
    const latestRef = useRef(params);
    useLayoutEffect(() => {
        latestRef.current = params;
    });

    useLayoutEffect(() => {
        const latest = () => latestRef.current;
        apiRef.current.getAggregationResult = () => (latest().hasAggregation ? latest().aggregationResult : null);
        apiRef.current.getAggregationModel = () => (latest().hasAggregation ? latest().aggregationModel : null);
        apiRef.current.getGroupedExportRows = (): GridGroupedExportRow[] | null => {
            const {
                hasAggregation, aggregationResult, aggregationModel, isRowGrouping, rowGroupingHandlers,
                rowMetaMap, columns, getRowId, hierarchyField,
            } = latest();
            if (!isRowGrouping) return null;
            // Every group expanded, filtered and sorted like the screen: collapsed groups still
            // export their rows. Subtotals and the grand total hidden by getAggregationPosition
            // (null) are left out, as they are on screen.
            return buildGroupedExportRows<R>({
                rows: rowGroupingHandlers.getVisibleRows({ expandAll: true, labelField: hierarchyField }) ?? [],
                getRowId,
                rowMetaMap,
                columns,
                aggregationModel,
                aggregationResult: hasAggregation && rowGroupingHandlers.rootAggregationPosition !== null ? aggregationResult : null,
                isSubtotalHidden: (groupId) => rowGroupingHandlers.aggregationPositions.get(groupId) === null,
            });
        };
    }, [apiRef]);
}
