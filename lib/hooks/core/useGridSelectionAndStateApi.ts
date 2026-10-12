import type { GridRowModel } from '../../types';
import { useGridRowInteractions, type UseGridRowInteractionsParams, type UseGridRowInteractionsResult } from './useGridRowInteractions';
import { useGridApiMethods, type UseGridApiMethodsParams } from './useGridApiMethods';
import type { UseGridControlledStateReturn } from './useGridControlledState';

/** The state API inputs that do not come from `useGridControlledState`. */
export type GridStateApiParams = Pick<UseGridApiMethodsParams,
    'apiRef' | 'multiSort' | 'selectedRowIds' | 'disableMultipleRowSelection' | 'isSyntheticRowId' | 'getVisibleRows' |
    'getAllFilteredRows' | 'visibleColumns'>;

export interface UseGridSelectionAndStateApiParams<R extends GridRowModel> {
    controlledState: UseGridControlledStateReturn;
    interactions: Omit<UseGridRowInteractionsParams<R>, 'selectedRowIds' | 'onSelectionModelChange' | 'disableMultipleRowSelection'>;
    api: GridStateApiParams;
}

/**
 * Steps 23–24 of `DataGrid` (docs/architecture/datagrid-orchestration.md), in their call order: row
 * selection and the row click / checkbox handlers, then the state API methods (sort, filter, pagination,
 * selection, row grouping, aggregation, visibility and pivot setters, `getGridAiState`) installed on `apiRef`.
 */
export function useGridSelectionAndStateApi<R extends GridRowModel>(
    params: UseGridSelectionAndStateApiParams<R>
): UseGridRowInteractionsResult<R> {
    const { controlledState, interactions, api } = params;
    const {
        sortModel, handleSortModelChange, filterModel, handleFilterModelChange, effectivePaginationModel,
        handlePaginationModelChange, handleRowSelectionModelChange, rowGroupingModel, handleRowGroupingModelChange,
        aggregationModel, handleAggregationModelChange, columnVisibilityModel, handleColumnVisibilityModelChange,
        currentPivotModel, handlePivotModelChange,
    } = controlledState;

    const result = useGridRowInteractions<R>({
        ...interactions,
        selectedRowIds: api.selectedRowIds,
        onSelectionModelChange: handleRowSelectionModelChange,
        disableMultipleRowSelection: api.disableMultipleRowSelection,
    });

    useGridApiMethods({
        ...api,
        onSortModelChange: handleSortModelChange,
        sortModel,
        filterModel,
        onFilterModelChange: handleFilterModelChange,
        paginationModel: effectivePaginationModel,
        onPaginationModelChange: handlePaginationModelChange,
        getPendingRowSelectionModel: controlledState.getPendingRowSelectionModel,
        onRowSelectionModelChange: handleRowSelectionModelChange,
        rowGroupingModel,
        onRowGroupingModelChange: handleRowGroupingModelChange,
        aggregationModel,
        onAggregationModelChange: handleAggregationModelChange,
        columnVisibilityModel,
        onColumnVisibilityModelChange: handleColumnVisibilityModelChange,
        pivotModel: currentPivotModel,
        onPivotModelChange: handlePivotModelChange,
    });

    return result;
}
