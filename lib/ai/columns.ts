// Which columns may take part in each part of the state. The schema and the validator both read
// these, so the model is never offered a field the validator would drop.
import { getOperatorsForType } from '../utils/filtering';
import type { GridFilterOperator, GridPivotAggFn } from '../types';
import type { GridAiColumn, GridAiPart, GridAiPartOptions } from './types';

/** The built-in aggregation functions (`AGGREGATION_FUNCTIONS` in lib/utils/aggregation). */
export const AGGREGATION_FNS: readonly string[] = ['sum', 'avg', 'count', 'min', 'max', 'unique'];
/** The functions a pivot value field takes (`GridPivotAggFn`). */
export const PIVOT_FNS: readonly GridPivotAggFn[] = ['sum', 'avg', 'count', 'min', 'max'];
/** Operators without a value. */
export const NO_VALUE_OPS: readonly string[] = ['isEmpty', 'isNotEmpty'];
/** Deepest nesting of filter groups. */
export const MAX_FILTER_DEPTH = 3;

export const ALL_PARTS: readonly GridAiPart[] = ['filter', 'sort', 'grouping', 'aggregation', 'pivot', 'columnVisibility'];

/** State key of each part, in output order. */
export const PART_KEYS: Record<GridAiPart, string> = {
  filter: 'filterModel',
  sort: 'sortModel',
  grouping: 'rowGroupingModel',
  aggregation: 'aggregationModel',
  pivot: 'pivotModel',
  columnVisibility: 'columnVisibilityModel',
};

export function hasOwn(obj: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function selectedParts(options: GridAiPartOptions | undefined): GridAiPart[] {
  const include = Array.isArray(options?.include) ? options.include : ALL_PARTS;
  const exclude = Array.isArray(options?.exclude) ? options.exclude : [];
  return ALL_PARTS.filter((part) => include.includes(part) && !exclude.includes(part));
}

/**
 * The usable columns, first one per field. System columns (`__check__`, `__group__`, …), spacers
 * and fields that are not plain strings are skipped.
 */
export function usableColumns(columns: readonly GridAiColumn[] | unknown): GridAiColumn[] {
  if (!Array.isArray(columns)) return [];
  const seen = new Set<string>();
  const out: GridAiColumn[] = [];
  for (const col of columns as unknown[]) {
    if (!isPlainObject(col)) continue;
    const field = col.field;
    if (typeof field !== 'string' || field === '' || field.startsWith('__') || col.isSpacer === true || seen.has(field)) continue;
    seen.add(field);
    out.push(col as unknown as GridAiColumn);
  }
  return out;
}

export function operatorsOf(col: GridAiColumn): GridFilterOperator[] {
  return getOperatorsForType(col.type);
}

export const isFilterable = (col: GridAiColumn): boolean => col.filterable !== false;
export const isSortable = (col: GridAiColumn): boolean => col.sortable !== false;
export const isGroupable = (col: GridAiColumn): boolean => col.groupable !== false;
export const isHideable = (col: GridAiColumn): boolean => col.hideable !== false;

/**
 * Aggregation functions for a column, as the Summaries panel offers them: every built-in function
 * for number columns (or `aggregable: true`), `count` for the others, never with `aggregable: false`,
 * and limited by `availableAggregationFunctions`.
 */
export function aggregationFnsOf(col: GridAiColumn, fns: readonly string[] = AGGREGATION_FNS): string[] {
  if (col.aggregable === false) return [];
  const base = col.type === 'number' || col.aggregable === true ? fns : fns.filter((fn) => fn === 'count');
  const allowed = col.availableAggregationFunctions;
  return Array.isArray(allowed) ? base.filter((fn) => allowed.includes(fn)) : [...base];
}

/** JSON-safe option values of a singleSelect column, in order, without duplicates. */
export function optionValues(col: GridAiColumn): (string | number)[] {
  const out: (string | number)[] = [];
  if (!Array.isArray(col.valueOptions)) return out;
  for (const option of col.valueOptions) {
    const value: unknown = option !== null && typeof option === 'object' ? option.value : option;
    if ((typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))) && !out.includes(value)) out.push(value);
  }
  return out;
}
