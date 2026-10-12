export type GridRowGroupingModel = string[];

export interface GridAggregationModel {
  [field: string]: string;
}

export type GridAggregationResult = Record<string, unknown>;

/**
 * Where a group's aggregates are shown, as returned by `getAggregationPosition`: `'inline'` on the group row,
 * `'footer'` on a subtotal row after the group's children, `null` hidden.
 */
export type GridAggregationPosition = 'inline' | 'footer' | null;

export type GridPivotAggFn = 'sum' | 'avg' | 'count' | 'min' | 'max';

export interface GridPivotValueField {
        field: string;
        aggFn: GridPivotAggFn;
        headerName?: string;
}

export interface GridPivotModel {
    rowFields:    string[];
    columnFields: string[];
    valueFields:  GridPivotValueField[];
}
