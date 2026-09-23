import { useEffect, useMemo, useRef } from 'react';
import type { GridColDef, GridFilterModel, GridPivotModel, GridRowModel, GridSortItem } from '../../types';
import { filterRows } from '../../utils/filtering';
import { computePivot, splitPivotFilterModel, EMPTY_PIVOT_RESULT } from '../../utils/pivot';

const EMPTY_FILTER_MODEL: GridFilterModel = { items: [] };
const EMPTY_SORT_MODEL: GridSortItem[] = [];

export interface UseGridPivotParams {
    rows: GridRowModel[];
    columns: GridColDef[];
    pivotMode: boolean;
    pivotModel: GridPivotModel;
    filterModel: GridFilterModel;
    sortModel: GridSortItem[];
    /** Pivoting is client-side: with a dataSource the grid only holds one page, so pivot mode is not applied. */
    hasDataSource: boolean;
    /** treeData or a rowGroupingModel was requested; both are turned off while pivoting. */
    hierarchyRequested: boolean;
}

export interface UseGridPivotResult {
    /** Pivot mode is on, the model is usable and the grid is client-side. */
    isActive: boolean;
    /** Sorted pivot data rows followed by the Grand Total row. */
    rows: GridRowModel[];
    columns: GridColDef[];
    /**
     * Filter and sort models for the row pipeline. While pivoting they are empty: the pivot already
     * applied them (filters to the source rows or the pivot rows, sorting with the Grand Total kept last).
     */
    pipelineFilterModel: GridFilterModel;
    pipelineSortModel: GridSortItem[];
}

/**
 * DataGrid's pivot stage. Source-field filters and the quick filter run on the source rows before
 * pivoting, so pivot values and the Grand Total reflect them; conditions on generated value columns run
 * on the pivot rows. Sorting orders the pivot data rows and never moves the Grand Total.
 */
export function useGridPivot(params: UseGridPivotParams): UseGridPivotResult {
    const { rows, columns, pivotMode, pivotModel, filterModel, sortModel, hasDataSource, hierarchyRequested } = params;
    const enabled = pivotMode && !hasDataSource;

    const sourceFields = useMemo(() => new Set(columns.map((c) => c.field)), [columns]);
    const splitFilter = useMemo(
        () => splitPivotFilterModel(filterModel, sourceFields),
        [filterModel, sourceFields],
    );
    const sourceRows = useMemo(
        () => (enabled ? filterRows(rows, splitFilter.source) : rows),
        [enabled, rows, splitFilter.source],
    );
    const pivot = useMemo(
        () => (enabled
            ? computePivot(sourceRows, columns, pivotModel, { outputFilterModel: splitFilter.output, sortModel })
            : EMPTY_PIVOT_RESULT),
        [enabled, sourceRows, columns, pivotModel, splitFilter.output, sortModel],
    );
    const isActive = enabled && pivot.isValid;

    const warnedRef = useRef({ dataSource: false, hierarchy: false });
    useEffect(() => {
        if (process.env.NODE_ENV === 'production') return;
        if (pivotMode && hasDataSource && !warnedRef.current.dataSource) {
            warnedRef.current.dataSource = true;
            console.warn(
                '[OpenGridX] `pivotMode` is ignored when a `dataSource` is set: pivoting is client-side and the grid ' +
                'only holds the rows of one server page. Pivot on the server, or pass the full dataset as `rows`.'
            );
        }
        if (isActive && hierarchyRequested && !warnedRef.current.hierarchy) {
            warnedRef.current.hierarchy = true;
            console.warn(
                '[OpenGridX] `treeData` and `rowGroupingModel` are turned off while `pivotMode` is active: the pivot ' +
                'rows are already grouped by the pivot row fields.'
            );
        }
    }, [pivotMode, hasDataSource, isActive, hierarchyRequested]);

    return {
        isActive,
        rows: isActive ? pivot.pivotRows : rows,
        columns: isActive ? pivot.pivotColumns : columns,
        pipelineFilterModel: isActive ? EMPTY_FILTER_MODEL : filterModel,
        pipelineSortModel: isActive ? EMPTY_SORT_MODEL : sortModel,
    };
}
