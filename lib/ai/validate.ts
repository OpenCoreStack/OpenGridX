// validateGridAiState: the safety layer between a model's reply and the grid. Anything the columns
// do not allow is dropped with an error; values are coerced to the column type. Never throws.
// Only own keys of the input are read (never `__proto__`), and every key written to the output is a
// column field, so nothing in the reply can reach Object.prototype or the output's prototype.
import type {
  GridAggregationModel,
  GridColumnVisibilityModel,
  GridFilterGroup,
  GridFilterItem,
  GridFilterModel,
  GridFilterOperator,
  GridPivotModel,
  GridPivotValueField,
  GridSortItem,
} from '../types';
import { toLocalDateString } from '../utils/values';
import { coerceBoolean, coerceValue } from './coerce';
import {
  ALL_PARTS,
  MAX_FILTER_DEPTH,
  NO_VALUE_OPS,
  PART_KEYS,
  PIVOT_FNS,
  aggregationFnsOf,
  hasOwn,
  isFilterable,
  isGroupable,
  isHideable,
  isPlainObject,
  isSortable,
  operatorsOf,
  selectedParts,
  usableColumns,
} from './columns';
import type { GridAiColumn, GridAiPart, GridAiState, GridAiValidateOptions, GridAiValidationError, GridAiValidationResult } from './types';

/** Longest list read from the model output; the rest is dropped with one error. */
const MAX_LIST = 200;
/** Errors past this many are not listed, so a reply full of junk still gives a readable list. */
const MAX_ERRORS = 100;

type Allowed = (col: GridAiColumn) => boolean;
type FilterNode = GridFilterItem | GridFilterGroup;

interface Ctx {
  errors: GridAiValidationError[];
  byField: Map<string, GridAiColumn>;
}

function fail(ctx: Ctx, path: string, message: string): null {
  if (ctx.errors.length < MAX_ERRORS) ctx.errors.push({ path, message });
  return null;
}

/** A short, safe rendering of a value for an error message. */
function show(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value.slice(0, 60));
  return value === null || typeof value !== 'object' ? String(value) : Array.isArray(value) ? 'a list' : 'an object';
}

function lower(value: unknown): string | null {
  return typeof value === 'string' ? value.trim().toLowerCase() : null;
}

/** Own enumerable keys of the input, without `__proto__`. */
function keysOf(obj: Record<string, unknown>): string[] {
  return Object.keys(obj).filter((key) => key !== '__proto__');
}

function column(ctx: Ctx, value: unknown, path: string, allowed: Allowed, what: string): GridAiColumn | null {
  const col = typeof value === 'string' ? ctx.byField.get(value) : undefined;
  if (!col) return fail(ctx, path, `Unknown field ${show(value)}`);
  return allowed(col) ? col : fail(ctx, path, `Field ${show(value)} cannot be ${what}`);
}

/** The first MAX_LIST entries of an array; a single value is read as a one-entry list. */
function list(ctx: Ctx, value: unknown, path: string): unknown[] {
  if (value == null) return [];
  const items = Array.isArray(value) ? value : [value];
  if (items.length > MAX_LIST) fail(ctx, path, `Only the first ${MAX_LIST} entries are read`);
  return items.slice(0, MAX_LIST);
}

/** The choice `value` names, case-insensitively, in the choice's own spelling. */
function oneOf(ctx: Ctx, value: unknown, path: string, choices: readonly string[]): string | null {
  const v = lower(value);
  return choices.find((c) => c.toLowerCase() === v) ?? fail(ctx, path, `${show(value)} is not one of ${choices.join(', ')}`);
}

/** One filter value, coerced; dates become `YYYY-MM-DD` as the filter panel writes them. */
function filterValue(ctx: Ctx, raw: unknown, col: GridAiColumn, path: string): { v: unknown } | null {
  const result = coerceValue(raw, col);
  if (!result.ok) return fail(ctx, path, `${show(raw)} is not a valid ${col.type ?? 'string'} value`);
  const v = result.value instanceof Date ? toLocalDateString(result.value) : result.value;
  return v == null || v === '' ? fail(ctx, path, 'Missing value') : { v };
}

function filterItem(ctx: Ctx, raw: Record<string, unknown>, path: string): GridFilterItem | null {
  const col = column(ctx, raw.field, `${path}.field`, isFilterable, 'filtered');
  if (!col) return null;
  const operator = oneOf(ctx, raw.operator, `${path}.operator`, operatorsOf(col));
  if (operator === null) return null;
  const item: GridFilterItem = { field: col.field, operator: operator as GridFilterOperator };
  if (NO_VALUE_OPS.includes(item.operator)) return item;
  const rawValue = hasOwn(raw, 'value') ? raw.value : undefined;
  if (item.operator === 'isAnyOf') {
    const values: unknown[] = [];
    list(ctx, rawValue, `${path}.value`).forEach((entry, i) => {
      const r = filterValue(ctx, entry, col, `${path}.value[${i}]`);
      if (r && !values.includes(r.v)) values.push(r.v);
    });
    if (values.length === 0) return fail(ctx, `${path}.value`, 'No valid values');
    item.value = values;
    return item;
  }
  if (Array.isArray(rawValue)) return fail(ctx, `${path}.value`, 'Expected one value, not a list');
  const r = filterValue(ctx, rawValue, col, `${path}.value`);
  if (!r) return null;
  item.value = r.v;
  return item;
}

function logic(ctx: Ctx, raw: unknown, path: string): 'and' | 'or' | null {
  return raw === undefined ? null : (oneOf(ctx, raw, path, ['and', 'or']) as 'and' | 'or' | null);
}

function filterItems(ctx: Ctx, raw: unknown, path: string, depth: number): FilterNode[] {
  const out: FilterNode[] = [];
  list(ctx, raw, path).forEach((entry, i) => {
    const at = `${path}[${i}]`;
    if (!isPlainObject(entry)) {
      fail(ctx, at, `Expected a filter, got ${show(entry)}`);
    } else if (hasOwn(entry, 'items') || hasOwn(entry, 'logicOperator')) {
      if (depth >= MAX_FILTER_DEPTH) {
        fail(ctx, at, `Groups nest at most ${MAX_FILTER_DEPTH} levels`);
        return;
      }
      const items = filterItems(ctx, entry.items, `${at}.items`, depth + 1);
      if (items.length === 0) fail(ctx, at, 'Empty group removed');
      else out.push({ logicOperator: logic(ctx, entry.logicOperator, `${at}.logicOperator`) ?? 'and', items });
    } else {
      const item = filterItem(ctx, entry, at);
      if (item) out.push(item);
    }
  });
  return out;
}

function filterModel(ctx: Ctx, raw: Record<string, unknown>, path: string): GridFilterModel {
  const model: GridFilterModel = {};
  if (hasOwn(raw, 'items')) model.items = filterItems(ctx, raw.items, `${path}.items`, 0);
  const op = logic(ctx, raw.logicOperator, `${path}.logicOperator`);
  if (op) model.logicOperator = op;
  if (hasOwn(raw, 'quickFilterValues')) {
    model.quickFilterValues = [];
    list(ctx, raw.quickFilterValues, `${path}.quickFilterValues`).forEach((entry, i) => {
      const word = typeof entry === 'string' || typeof entry === 'number' ? String(entry).trim() : null;
      if (word === null) fail(ctx, `${path}.quickFilterValues[${i}]`, `Expected text, got ${show(entry)}`);
      else if (word !== '') model.quickFilterValues?.push(word);
    });
  }
  return model;
}

function sortModel(ctx: Ctx, raw: unknown, path: string): GridSortItem[] {
  const out: GridSortItem[] = [];
  list(ctx, raw, path).forEach((entry, i) => {
    const at = `${path}[${i}]`;
    if (!isPlainObject(entry)) return fail(ctx, at, `Expected { field, sort }, got ${show(entry)}`);
    const col = column(ctx, entry.field, `${at}.field`, isSortable, 'sorted');
    const sort = col && oneOf(ctx, entry.sort, `${at}.sort`, ['asc', 'desc']);
    if (!col || !sort) return;
    if (out.some((s) => s.field === col.field)) fail(ctx, at, `${show(col.field)} is sorted twice`);
    else out.push({ field: col.field, sort: sort as 'asc' | 'desc' });
  });
  return out;
}

function fieldList(ctx: Ctx, raw: unknown, path: string, allowed: Allowed, what: string): string[] {
  const out: string[] = [];
  list(ctx, raw, path).forEach((entry, i) => {
    const col = column(ctx, entry, `${path}[${i}]`, allowed, what);
    if (col && !out.includes(col.field)) out.push(col.field);
  });
  return out;
}

const canAggregate: Allowed = (col) => aggregationFnsOf(col).length > 0;
const canPivot: Allowed = (col) => aggregationFnsOf(col, PIVOT_FNS).length > 0;

function aggregationModel(ctx: Ctx, raw: Record<string, unknown>, path: string): GridAggregationModel {
  const model: GridAggregationModel = {};
  for (const key of keysOf(raw)) {
    // 'none' is how the grid spells "no aggregation": nothing to set.
    if (lower(raw[key]) === 'none') continue;
    const col = column(ctx, key, `${path}.${key}`, canAggregate, 'aggregated');
    const fn = col && oneOf(ctx, raw[key], `${path}.${key}`, aggregationFnsOf(col));
    if (col && fn) model[col.field] = fn;
  }
  return model;
}

function pivotModel(ctx: Ctx, raw: Record<string, unknown>, path: string): GridPivotModel {
  const valueFields: GridPivotValueField[] = [];
  list(ctx, raw.valueFields, `${path}.valueFields`).forEach((entry, i) => {
    const at = `${path}.valueFields[${i}]`;
    if (!isPlainObject(entry)) return fail(ctx, at, `Expected { field, aggFn }, got ${show(entry)}`);
    const col = column(ctx, entry.field, `${at}.field`, canPivot, 'a pivot value');
    const aggFn = col && (oneOf(ctx, entry.aggFn, `${at}.aggFn`, aggregationFnsOf(col, PIVOT_FNS)) as GridPivotValueField['aggFn'] | null);
    if (col && aggFn && !valueFields.some((v) => v.field === col.field && v.aggFn === aggFn)) valueFields.push({ field: col.field, aggFn });
  });
  return {
    rowFields: fieldList(ctx, raw.rowFields, `${path}.rowFields`, isGroupable, 'a pivot label'),
    columnFields: fieldList(ctx, raw.columnFields, `${path}.columnFields`, isGroupable, 'a pivot label'),
    valueFields,
  };
}

function visibilityModel(ctx: Ctx, raw: Record<string, unknown>, path: string): GridColumnVisibilityModel {
  const model: GridColumnVisibilityModel = {};
  for (const key of keysOf(raw)) {
    const col = column(ctx, key, `${path}.${key}`, isHideable, 'hidden');
    const visible = coerceBoolean(raw[key]);
    if (!col) continue;
    if (visible.ok && visible.value !== null) model[col.field] = visible.value;
    else fail(ctx, `${path}.${key}`, `Expected true or false, got ${show(raw[key])}`);
  }
  return model;
}

function readPart(ctx: Ctx, part: GridAiPart, raw: unknown, path: string, state: GridAiState): void {
  if (part === 'sort') state.sortModel = sortModel(ctx, raw, path);
  else if (part === 'grouping') state.rowGroupingModel = fieldList(ctx, raw, path, isGroupable, 'grouped');
  else if (!isPlainObject(raw)) fail(ctx, path, `Expected an object, got ${show(raw)}`);
  else if (part === 'filter') state.filterModel = filterModel(ctx, raw, path);
  else if (part === 'aggregation') state.aggregationModel = aggregationModel(ctx, raw, path);
  else if (part === 'pivot') state.pivotModel = pivotModel(ctx, raw, path);
  else state.columnVisibilityModel = visibilityModel(ctx, raw, path);
}

/**
 * Checks a model's reply against the columns and returns the state that is safe to apply.
 * `json` is an object or a JSON string (bad JSON gives one error and an empty state). Unknown
 * parts, fields, operators and enum values are dropped, each with an error; values are coerced to
 * the column type (`"1,200"` → 1200, a date → `"YYYY-MM-DD"`); filter groups left empty are
 * removed. Never throws, and never returns a field the columns do not allow.
 * @since v3.4
 */
export function validateGridAiState<C extends GridAiColumn>(
  json: unknown,
  columns: readonly C[],
  options: GridAiValidateOptions = {},
): GridAiValidationResult {
  const ctx: Ctx = { errors: [], byField: new Map() };
  const state: GridAiState = {};
  try {
    for (const col of usableColumns(columns)) ctx.byField.set(col.field, col);
    let input = json;
    if (typeof json === 'string') {
      try {
        input = JSON.parse(json) as unknown;
      } catch {
        fail(ctx, '', 'Not valid JSON');
        return { state, errors: ctx.errors };
      }
    }
    if (!isPlainObject(input)) {
      fail(ctx, '', `Expected an object, got ${show(input)}`);
      return { state, errors: ctx.errors };
    }
    const allowed = selectedParts(options);
    for (const key of keysOf(input)) {
      const part = ALL_PARTS.find((p) => PART_KEYS[p] === key);
      if (key === 'schemaVersion') {
        if (input[key] !== 1) fail(ctx, key, `Unsupported schemaVersion ${show(input[key])}`);
      } else if (!part) fail(ctx, key, 'Unknown part');
      else if (!allowed.includes(part)) fail(ctx, key, 'Part not allowed');
      else readPart(ctx, part, input[key], key, state);
    }
  } catch {
    // Defensive only: a getter on a hand-built input object could throw.
    fail(ctx, '', 'Could not read the input');
    return { state: {}, errors: ctx.errors };
  }
  return { state, errors: ctx.errors };
}
