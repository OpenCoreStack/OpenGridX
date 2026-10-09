// createGridAgentTools: plain tool objects ({ name, description, inputSchema, execute }) that let an AI
// agent read and change the grid through its apiRef. No SDK: they fit the Vercel AI SDK, CopilotKit,
// OpenAI or Anthropic tool calling and WebMCP. Every input is validated; execute never throws.
import type { GridAiState, GridRowModel } from '../types';
import { getCellValue } from '../utils/values';

type CellColumn = Parameters<typeof getCellValue>[2];
import { hasOwn, isPlainObject, PART_KEYS, usableColumns } from './columns';
import { getGridAiSchema } from './schema';
import type {
  GridAgentApi,
  GridAgentTool,
  GridAgentToolResult,
  GridAgentToolsOptions,
  GridAiColumn,
  GridAiJsonSchema,
  GridAiPart,
} from './types';
import { validateGridAiState } from './validate';

const DEFAULT_MAX_ROWS = 20;
const MAX_ROWS_LIMIT = 1000;

const SET_TOOLS: { name: string; part: GridAiPart; description: string }[] = [
  { name: 'set_filter', part: 'filter', description: 'Replace the filter model of the grid (filters and quick-filter words).' },
  { name: 'set_sort', part: 'sort', description: 'Replace the sort model of the grid, most significant field first. An empty list clears sorting.' },
  { name: 'set_grouping', part: 'grouping', description: 'Group the rows by these fields, outermost first. An empty list removes grouping.' },
  { name: 'set_aggregation', part: 'aggregation', description: 'Replace the summaries: field to aggregation function. An empty object removes them.' },
  { name: 'set_column_visibility', part: 'columnVisibility', description: 'Show (true) or hide (false) columns. Columns not listed keep their visibility.' },
];

type ApiRef = { readonly current: GridAgentApi | null | undefined };

function failure(message: string, path = ''): GridAgentToolResult {
  return { ok: false, errors: [{ path, message }] };
}

/** Runs a tool body; a throw becomes `{ ok: false }`. */
async function run(body: () => GridAgentToolResult): Promise<GridAgentToolResult> {
  try {
    return body();
  } catch (error) {
    return failure(error instanceof Error && error.message ? error.message : 'The tool failed');
  }
}

function apiOf(apiRef: ApiRef): GridAgentApi | null {
  const api = apiRef?.current;
  return api && typeof api.getGridAiState === 'function' ? api : null;
}

/** A JSON-safe cell value: primitives as they are, a Date as an ISO string, anything else null. */
function jsonValue(value: unknown): unknown {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  return typeof value === 'string' || typeof value === 'boolean' ? value : null;
}

function setTool(apiRef: ApiRef, columns: readonly GridAiColumn[], name: string, part: GridAiPart, description: string): GridAgentTool | null {
  const key = PART_KEYS[part] as keyof GridAiState;
  const schema = getGridAiSchema(columns, { include: [part] });
  if (!hasOwn(schema.properties, key)) return null;
  const { $schema: _version, schemaVersion: _schemaVersion, title: _title, description: _description, ...inputSchema } = schema;
  return {
    name,
    description,
    inputSchema: { ...inputSchema, required: [key] },
    execute: (input) => run(() => {
      const api = apiOf(apiRef);
      if (!api) return failure('The grid is not ready');
      if (!isPlainObject(input) || !hasOwn(input, key)) return failure(`Expected an object with "${key}"`, key);
      const { state, errors } = validateGridAiState({ [key]: input[key] }, columns, { include: [part] });
      // All or nothing: the agent gets the errors back and can correct its call.
      if (errors.length > 0) return { ok: false, errors };
      const applied: GridAiState = {};
      if (state.filterModel) api.setFilterModel(applied.filterModel = state.filterModel);
      if (state.sortModel) api.setSortModel(applied.sortModel = state.sortModel);
      if (state.rowGroupingModel) api.setRowGroupingModel(applied.rowGroupingModel = state.rowGroupingModel);
      if (state.aggregationModel) api.setAggregationModel(applied.aggregationModel = state.aggregationModel);
      if (state.columnVisibilityModel) {
        applied.columnVisibilityModel = { ...api.getGridAiState().columnVisibilityModel, ...state.columnVisibilityModel };
        api.setColumnVisibilityModel(applied.columnVisibilityModel);
      }
      return { ok: true, applied };
    }),
  };
}

const NO_INPUT: GridAiJsonSchema = { type: 'object', properties: {}, additionalProperties: false };

/**
 * Tools for an AI agent: `get_grid_state`, `set_filter`, `set_sort`, `set_grouping`, `set_aggregation`,
 * `set_column_visibility`, `clear_filters`, and `get_row_summary` only with `allowRowAccess: true` (the
 * one tool that sends row values). Each tool is `{ name, description, inputSchema, execute }`; inputs are
 * checked with `validateGridAiState` and applied through `apiRef` only when valid. `execute` never throws.
 * @since v3.5
 */
export function createGridAgentTools<C extends GridAiColumn>(
  apiRef: ApiRef,
  columns: readonly C[],
  options: GridAgentToolsOptions = {},
): GridAgentTool[] {
  const cols = usableColumns(columns);
  const tools: GridAgentTool[] = [{
    name: 'get_grid_state',
    description: 'Read the current filter, sort, grouping, aggregation, pivot and column visibility of the grid, and its columns.',
    inputSchema: NO_INPUT,
    execute: () => run(() => {
      const api = apiOf(apiRef);
      if (!api) return failure('The grid is not ready');
      return {
        ok: true,
        state: api.getGridAiState(),
        columns: cols.map((c) => ({ field: c.field, headerName: typeof c.headerName === 'string' ? c.headerName : c.field, type: typeof c.type === 'string' ? c.type : 'string' })),
      };
    }),
  }];
  for (const { name, part, description } of SET_TOOLS) {
    const tool = setTool(apiRef, cols, name, part, description);
    if (tool) tools.push(tool);
  }
  tools.push({
    name: 'clear_filters',
    description: 'Remove every filter and the quick-filter words.',
    inputSchema: NO_INPUT,
    execute: () => run(() => {
      const api = apiOf(apiRef);
      if (!api) return failure('The grid is not ready');
      const filterModel = { items: [] };
      api.setFilterModel(filterModel);
      return { ok: true, applied: { filterModel } };
    }),
  });
  if (options.allowRowAccess === true) {
    const maxRows = typeof options.maxRows === 'number' && options.maxRows >= 1 ? Math.min(Math.floor(options.maxRows), MAX_ROWS_LIMIT) : DEFAULT_MAX_ROWS;
    const allowed = Array.isArray(options.fields) ? cols.filter((c) => options.fields?.includes(c.field)) : cols;
    tools.push({
      name: 'get_row_summary',
      description: `Count the rows that pass the current filter and read the first ones (at most ${maxRows}, fields: ${allowed.map((c) => c.field).join(', ')}).`,
      inputSchema: { type: 'object', properties: { limit: { type: 'integer', minimum: 1, maximum: maxRows } }, additionalProperties: false },
      execute: (input) => run(() => {
        const api = apiOf(apiRef);
        if (!api) return failure('The grid is not ready');
        const raw = isPlainObject(input) && hasOwn(input, 'limit') ? input.limit : maxRows;
        const limit = typeof raw === 'number' && raw >= 1 ? Math.min(Math.floor(raw), maxRows) : maxRows;
        const all = api.getAllFilteredRows();
        const list = Array.isArray(all) ? all : [];
        const rows = list.slice(0, limit).map((row) => {
          const out: Record<string, unknown> = {};
          if (!isPlainObject(row)) return out;
          // Through the column's valueGetter, as the grid shows the cell.
          for (const col of allowed) out[col.field] = jsonValue(getCellValue(row as GridRowModel, col.field, col as CellColumn));
          return out;
        });
        return { ok: true, rowCount: list.length, rows };
      }),
    });
  }
  return tools;
}
