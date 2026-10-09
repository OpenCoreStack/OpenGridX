import type { GridAiPart, GridAiState, GridAiValidationError } from '../types';

// The state types live with the grid's own types (lib/types), so the grid's `aiAssistant` prop can
// use them without importing this entry point. They are type-only and re-exported from here.
export type {
  GridAiHistoryEntry,
  GridAiPart,
  GridAiPromptContext,
  GridAiPromptResult,
  GridAiState,
  GridAiValidationError,
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

/**
 * The validated state and what was dropped. Since v3.5 the result and its `state` carry the brand
 * `Symbol.for('opengridx.ai.validated')` (not enumerable), which the grid's `aiAssistant` checks.
 */
export interface GridAiValidationResult {
  state: GridAiState;
  errors: GridAiValidationError[];
}

/** What `callModel` receives: send it to your model. @since v3.5 */
export interface GridAiModelRequest {
  prompt: string;
  /** `getGridAiSchema(columns, …)`: use it as the structured-output format. */
  schema: GridAiSchema;
  currentState: GridAiState;
  history: { prompt: string; applied: GridAiState }[];
}

/** Options of `createGridAiPromptHandler`. @since v3.5 */
export interface GridAiPromptHandlerOptions<C extends GridAiColumn = GridAiColumn> {
  columns: readonly C[];
  /**
   * Calls your model. Resolve with its reply: a state object, a JSON string, or text with a fenced JSON
   * block. A string `message` key next to the state, or the text around the JSON, is shown as the reply.
   */
  callModel: (request: GridAiModelRequest, options: { signal: AbortSignal }) => Promise<unknown>;
  /** The parts the model may change (schema and validation). Default: every part. */
  parts?: readonly GridAiPart[];
  /** Options for the schema; its `include` / `exclude` also limit validation. */
  schemaOptions?: GridAiSchemaOptions;
}

/**
 * The part of `GridApi` the agent tools use. A grid's `apiRef.current` fits it.
 * @since v3.5
 */
export interface GridAgentApi {
  getGridAiState: () => GridAiState;
  setFilterModel: (model: NonNullable<GridAiState['filterModel']>) => void;
  setSortModel: (model: NonNullable<GridAiState['sortModel']>) => void;
  setRowGroupingModel: (model: NonNullable<GridAiState['rowGroupingModel']>) => void;
  setAggregationModel: (model: NonNullable<GridAiState['aggregationModel']>) => void;
  setColumnVisibilityModel: (model: NonNullable<GridAiState['columnVisibilityModel']>) => void;
  getAllFilteredRows: () => object[];
}

/** Options of `createGridAgentTools`. @since v3.5 */
export interface GridAgentToolsOptions {
  /** Adds `get_row_summary`, the one tool that sends row values to the model. Default: false. */
  allowRowAccess?: boolean;
  /** Fields `get_row_summary` returns. Default: every column the tools were given. */
  fields?: readonly string[];
  /** Most rows `get_row_summary` returns. Default: 20. */
  maxRows?: number;
}

/** What every tool's `execute` resolves with. It never throws or rejects. @since v3.5 */
export interface GridAgentToolResult {
  ok: boolean;
  /** The state the tool applied. */
  applied?: GridAiState;
  /** Why nothing was applied. */
  errors?: GridAiValidationError[];
  /** `get_grid_state`: the current models. */
  state?: GridAiState;
  /** `get_grid_state`: the columns the tools know. */
  columns?: { field: string; headerName: string; type: string }[];
  /** `get_row_summary`: the number of rows that pass the filter. */
  rowCount?: number;
  /** `get_row_summary`: the first rows, limited to the allowed fields. */
  rows?: Record<string, unknown>[];
}

/**
 * A tool in the shape most tool-calling APIs take: `name`, `description`, a JSON Schema for the input
 * and `execute`. No SDK is involved. @since v3.5
 */
export interface GridAgentTool {
  name: string;
  description: string;
  inputSchema: GridAiJsonSchema;
  execute: (input: unknown) => Promise<GridAgentToolResult>;
}
