// getGridAiSchema: a JSON Schema (draft 2020-12) of the grid state a model may produce. Built from
// the column definitions only; no row data is read. Same columns and options, same schema.
import {
  MAX_FILTER_DEPTH,
  NO_VALUE_OPS,
  PART_KEYS,
  PIVOT_FNS,
  aggregationFnsOf,
  isFilterable,
  isGroupable,
  isHideable,
  isSortable,
  operatorsOf,
  optionValues,
  selectedParts,
  usableColumns,
} from './columns';
import type { GridAiColumn, GridAiJsonSchema, GridAiPart, GridAiSchema, GridAiSchemaOptions } from './types';

/** Title of every schema. Also the marker `check-bundle` uses to keep this code out of the core bundle. */
export const GRID_AI_SCHEMA_TITLE = 'OpenGridX grid state';

const MAX_EXAMPLES = 10;

interface Ctx {
  descriptions: boolean;
  examples: boolean;
}

function label(col: GridAiColumn): string {
  const header = typeof col.headerName === 'string' && col.headerName !== '' ? col.headerName : col.field;
  const desc = typeof col.description === 'string' && col.description !== '' ? ` (${col.description})` : '';
  return `${header}${desc}`;
}

function describe(node: GridAiJsonSchema, text: string, ctx: Ctx): GridAiJsonSchema {
  return ctx.descriptions ? { ...node, description: text } : node;
}

function examplesOf(col: GridAiColumn, ctx: Ctx): unknown[] {
  if (!ctx.examples || !Array.isArray(col.aiExamples)) return [];
  return col.aiExamples
    .filter((v) => typeof v === 'string' || typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v)))
    .slice(0, MAX_EXAMPLES);
}

/** Schema of one filter value for the column's type. */
function valueSchema(col: GridAiColumn, ctx: Ctx): GridAiJsonSchema {
  let node: GridAiJsonSchema;
  switch (col.type) {
    case 'number':
      node = { type: 'number' };
      break;
    case 'date':
      node = { type: 'string', format: 'date' };
      break;
    case 'boolean':
      node = { type: 'boolean' };
      break;
    case 'singleSelect': {
      const values = optionValues(col);
      const one: GridAiJsonSchema = values.length > 0 ? { enum: values } : { type: 'string' };
      node = { anyOf: [one, { type: 'array', items: one }] };
      break;
    }
    default:
      node = { type: 'string' };
  }
  const examples = examplesOf(col, ctx);
  return examples.length > 0 ? { ...node, examples } : node;
}

function filterItemSchema(col: GridAiColumn, ctx: Ctx): GridAiJsonSchema {
  const operators = operatorsOf(col);
  const noValue = operators.filter((op) => NO_VALUE_OPS.includes(op));
  const hint = col.type === 'singleSelect' ? '; isAnyOf takes an array' : '';
  const ops = noValue.length > 0 ? `${noValue.join(' and ')} take no value${hint}` : hint.slice(2);
  return describe(
    {
      type: 'object',
      properties: {
        field: { const: col.field },
        operator: { enum: operators },
        value: valueSchema(col, ctx),
      },
      required: ['field', 'operator'],
      additionalProperties: false,
    },
    ops ? `${label(col)}: ${ops}` : label(col),
    ctx,
  );
}

function filterSchema(cols: GridAiColumn[], ctx: Ctx, defs: Record<string, GridAiJsonSchema>): GridAiJsonSchema | null {
  const filterable = cols.filter(isFilterable);
  const properties: Record<string, GridAiJsonSchema> = {};
  const logic = { enum: ['and', 'or'] };
  if (filterable.length > 0) {
    defs.filterItem = { oneOf: filterable.map((col) => filterItemSchema(col, ctx)) };
    // Groups are unrolled to MAX_FILTER_DEPTH levels: the deepest one holds items only.
    for (let depth = MAX_FILTER_DEPTH; depth >= 1; depth--) {
      const child = depth === MAX_FILTER_DEPTH ? { $ref: '#/$defs/filterItem' } : { anyOf: [{ $ref: '#/$defs/filterItem' }, { $ref: `#/$defs/filterGroup${depth + 1}` }] };
      defs[`filterGroup${depth}`] = {
        type: 'object',
        properties: { logicOperator: logic, items: { type: 'array', items: child } },
        required: ['logicOperator', 'items'],
        additionalProperties: false,
      };
    }
    properties.items = { type: 'array', items: { anyOf: [{ $ref: '#/$defs/filterItem' }, { $ref: '#/$defs/filterGroup1' }] } };
    properties.logicOperator = logic;
  }
  properties.quickFilterValues = describe({ type: 'array', items: { type: 'string' } }, 'Words a row must contain, in any column', ctx);
  return { type: 'object', properties, additionalProperties: false };
}

function fieldEnum(cols: GridAiColumn[]): GridAiJsonSchema {
  return { enum: cols.map((c) => c.field) };
}

function partSchema(part: GridAiPart, cols: GridAiColumn[], ctx: Ctx, defs: Record<string, GridAiJsonSchema>): GridAiJsonSchema | null {
  switch (part) {
    case 'filter':
      return filterSchema(cols, ctx, defs);
    case 'sort': {
      const sortable = cols.filter(isSortable);
      if (sortable.length === 0) return null;
      return describe(
        {
          type: 'array',
          items: {
            type: 'object',
            properties: { field: fieldEnum(sortable), sort: { enum: ['asc', 'desc'] } },
            required: ['field', 'sort'],
            additionalProperties: false,
          },
        },
        'Most significant first',
        ctx,
      );
    }
    case 'grouping': {
      const groupable = cols.filter(isGroupable);
      if (groupable.length === 0) return null;
      return describe({ type: 'array', items: fieldEnum(groupable), uniqueItems: true }, 'Outermost first', ctx);
    }
    case 'aggregation': {
      const properties: Record<string, GridAiJsonSchema> = {};
      for (const col of cols) {
        const fns = aggregationFnsOf(col);
        if (fns.length > 0) properties[col.field] = describe({ enum: fns }, label(col), ctx);
      }
      if (Object.keys(properties).length === 0) return null;
      return { type: 'object', properties, additionalProperties: false };
    }
    case 'pivot': {
      const dims = cols.filter(isGroupable);
      const values = cols
        .map((col) => ({ col, fns: aggregationFnsOf(col, PIVOT_FNS) }))
        .filter((v) => v.fns.length > 0)
        .map(({ col, fns }) => describe({
          type: 'object',
          properties: { field: { const: col.field }, aggFn: { enum: fns } },
          required: ['field', 'aggFn'],
          additionalProperties: false,
        }, label(col), ctx));
      if (dims.length === 0 || values.length === 0) return null;
      const dimArray = { type: 'array', items: fieldEnum(dims), uniqueItems: true };
      return {
        type: 'object',
        properties: { rowFields: dimArray, columnFields: dimArray, valueFields: { type: 'array', items: { oneOf: values } } },
        required: ['rowFields', 'columnFields', 'valueFields'],
        additionalProperties: false,
      };
    }
    case 'columnVisibility': {
      const properties: Record<string, GridAiJsonSchema> = {};
      for (const col of cols.filter(isHideable)) properties[col.field] = describe({ type: 'boolean' }, label(col), ctx);
      if (Object.keys(properties).length === 0) return null;
      return describe({ type: 'object', properties, additionalProperties: false }, 'false hides a column', ctx);
    }
  }
}

/**
 * A JSON Schema (draft 2020-12) of the grid state a model may return for these columns: filter,
 * sort, grouping, aggregation, pivot and column visibility, each limited to the fields, operators
 * and functions the columns allow. Send it with the user's prompt to a model with structured
 * output, then pass the reply to `validateGridAiState`. Reads column definitions only, never rows.
 * @since v3.4
 */
export function getGridAiSchema<C extends GridAiColumn>(columns: readonly C[], options: GridAiSchemaOptions = {}): GridAiSchema {
  const ctx: Ctx = { descriptions: options.descriptions !== false, examples: options.examples !== false };
  const cols = usableColumns(columns);
  const defs: Record<string, GridAiJsonSchema> = {};
  const properties: Record<string, GridAiJsonSchema> = {};
  for (const part of selectedParts(options)) {
    const node = partSchema(part, cols, ctx, defs);
    if (node) properties[PART_KEYS[part]] = node;
  }
  const schema: GridAiSchema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    schemaVersion: 1,
    title: GRID_AI_SCHEMA_TITLE,
    type: 'object',
    properties,
    additionalProperties: false,
  };
  if (ctx.descriptions) {
    schema.description = 'Grid state to apply. Include only the parts the user asked to change.';
  }
  if (Object.keys(defs).length > 0) schema.$defs = defs;
  return schema;
}
