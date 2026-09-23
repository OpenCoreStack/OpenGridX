import { useMemo } from 'react';
import type { GridColDef, GridRowModel, GridValidRowModel, GridPivotModel } from '../../types';
import { computePivot, EMPTY_PIVOT_RESULT } from '../../utils/pivot';
import type { PivotResult } from '../../utils/pivot';

export type UsePivotReturn = PivotResult;

/**
 * Headless pivot: turns flat rows into pivot rows (one per row-field combination, then a Grand Total
 * row) and generated columns (row-label columns, then one value column per column key and value field).
 * `DataGrid`'s `pivotMode` uses the same engine.
 */
export function usePivot<R extends GridValidRowModel = GridRowModel>(
    rawRows: R[], rawCols: GridColDef<R>[], model: GridPivotModel, enabled: boolean,
): UsePivotReturn;
export function usePivot<R extends GridValidRowModel = GridRowModel>(
    rawRows: R[], rawCols: GridColDef[], model: GridPivotModel, enabled: boolean,
): UsePivotReturn;
// Internally rows are read as GridRowModel records; the signatures above are the public ones.
export function usePivot(
    rawRows:  GridRowModel[],
    rawCols:  GridColDef[],
    model:    GridPivotModel,
    enabled:  boolean,
): UsePivotReturn {
    return useMemo<UsePivotReturn>(
        () => (enabled ? computePivot(rawRows, rawCols, model) : EMPTY_PIVOT_RESULT),
        [rawRows, rawCols, model, enabled],
    );
}
