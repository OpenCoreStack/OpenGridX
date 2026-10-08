import type {
  GridAggregationModel,
  GridColumnVisibilityModel,
  GridFilterModel,
  GridPivotModel,
  GridRowGroupingModel,
  GridSortItem,
} from '../types';

/**
 * The column properties the AI toolkit reads. A `GridColDef` (typed or untyped) is accepted as is;
 * renderers, getters and formatters are never called, and no row data is read.
 * @since v3.4
 */
export interface GridAiColumn {
  field: string;
  headerName?: string;
  description?: string;
  type?: string;
  filterable?: boolean;
  sortable?: boolean;
  groupable?: boolean;
  hideable?: boolean;
  aggregable?: boolean;
  availableAggregationFunctions?: readonly string[];
  valueOptions?: readonly (string | number | { value: unknown; label: string })[];
  /** Example values sent to the model. Real data: see `GridColDef.aiExamples`. */
  aiExamples?: readonly unknown[];
  /** Internal spacer columns are skipped. */
  isSpacer?: boolean;
}

/** A part of the grid state the model may change. */
export type GridAiPart = 'filter' | 'sort' | 'grouping' | 'aggregation' | 'pivot' | 'columnVisibility';

/** Chooses the parts of the state; `exclude` wins over `include`. Default: every part. */
export interface GridAiPartOptions {
  include?: readonly GridAiPart[];
  exclude?: readonly GridAiPart[];
}

export interface GridAiSchemaOptions extends GridAiPartOptions {
  /**
   * Put each column's `headerName` and `description` into the schema, so the model can map the
   * user's words ("revenue") to a field (`amt_usd`).
   * @default true
   */
  descriptions?: boolean;
  /**
   * Include the columns' `aiExamples`. Columns without `aiExamples` never send example values.
   * @default true
   */
  examples?: boolean;
}

export type GridAiValidateOptions = GridAiPartOptions;

/** A JSON Schema (draft 2020-12) node. */
export type GridAiJsonSchema = { [keyword: string]: unknown };

/** The schema returned by `getGridAiSchema`. `schemaVersion` changes when its shape changes. */
export interface GridAiSchema extends GridAiJsonSchema {
  $schema: 'https://json-schema.org/draft/2020-12/schema';
  schemaVersion: 1;
  type: 'object';
  properties: Record<string, GridAiJsonSchema>;
}

/** The validated state: only parts, fields, operators and values the columns allow. */
export interface GridAiState {
  filterModel?: GridFilterModel;
  sortModel?: GridSortItem[];
  rowGroupingModel?: GridRowGroupingModel;
  aggregationModel?: GridAggregationModel;
  pivotModel?: GridPivotModel;
  columnVisibilityModel?: GridColumnVisibilityModel;
}

/** One thing the validator dropped or could not use. `path` points into the model output. */
export interface GridAiValidationError {
  path: string;
  message: string;
}

export interface GridAiValidationResult {
  state: GridAiState;
  errors: GridAiValidationError[];
}
