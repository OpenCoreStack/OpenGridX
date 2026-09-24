
import type { GridRowModel, GridFilterItem, GridFilterModel, GridFilterGroup, GridFilterOperator, GridColDef } from '../../types';
import type { GridColumnLookup } from '../columnLookup';
import { getCellValue, getFormattedValue, toLocalDateString, toLocalDayKey, toNumber } from '../values';

/** Compares a cell value with the filter item's value. */
export type GridFilterOperatorFn = (value: unknown, filterValue?: unknown) => boolean;

type RowPredicate = (row: GridRowModel) => boolean;

/** Operators that take no value. Every other operator ignores an item whose value is empty. */
export const NO_VALUE_OPERATORS: ReadonlySet<string> = new Set<GridFilterOperator>(['isEmpty', 'isNotEmpty']);

/**
 * True for a filter value that means "nothing entered yet": undefined, null, a blank string or an
 * empty array. Items with such a value (other than isEmpty / isNotEmpty) do not filter.
 */
export function isEmptyFilterValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function isBlankCell(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'number') return Number.isNaN(value);
  return typeof value === 'string' && value.trim() === '';
}

const numeric = (compare: (a: number, b: number) => boolean): GridFilterOperatorFn => (value, filterValue) => {
  const a = toNumber(value);
  const b = toNumber(filterValue);
  if (a === null || b === null) return false;
  return compare(a, b);
};

const byDay = (compare: (a: number, b: number) => boolean): GridFilterOperatorFn => (value, filterValue) => {
  const a = toLocalDayKey(value);
  const b = toLocalDayKey(filterValue);
  if (a === null || b === null) return false;
  return compare(a, b);
};

/** Same local calendar day. Accepts Date objects, epoch milliseconds and date strings on both sides. */
const dateIs: GridFilterOperatorFn = byDay((a, b) => a === b);

/** A different local calendar day. Empty or unparsable cells count as "not that day". */
const dateNot: GridFilterOperatorFn = (value, filterValue) => {
  const a = toLocalDayKey(value);
  const b = toLocalDayKey(filterValue);
  if (a === null || b === null) return true;
  return a !== b;
};

export const FILTER_OPERATORS: Record<GridFilterOperator, GridFilterOperatorFn> = {
  contains: (value, filterValue) => {
    if (value == null || filterValue == null) return false;
    return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
  },

  equals: (value, filterValue) => {
    if (value == null && filterValue == null) return true;
    if (value == null || filterValue == null) return false;
    return String(value).toLowerCase() === String(filterValue).toLowerCase();
  },

  startsWith: (value, filterValue) => {
    if (value == null || filterValue == null) return false;
    return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
  },

  endsWith: (value, filterValue) => {
    if (value == null || filterValue == null) return false;
    return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
  },

  isEmpty: (value) => {
    return value == null || String(value).trim() === '';
  },

  isNotEmpty: (value) => {
    return value != null && String(value).trim() !== '';
  },

  // Numeric operators: blank cells and non-numeric values never match (a blank cell is not 0).
  '=': numeric((a, b) => a === b),
  '>': numeric((a, b) => a > b),
  '>=': numeric((a, b) => a >= b),
  '<': numeric((a, b) => a < b),
  '<=': numeric((a, b) => a <= b),

  '!=': (value, filterValue) => {
    if (isEmptyFilterValue(filterValue)) return true;
    const a = toNumber(value);
    const b = toNumber(filterValue);
    if (a !== null && b !== null) return a !== b;
    // An empty cell is "not equal" to every value, whatever that value is.
    if (isBlankCell(value)) return true;
    return String(value).toLowerCase() !== String(filterValue).toLowerCase();
  },

  // A scalar value is treated as a one-element list, so a typed "Active" works like ["Active"].
  isAnyOf: (value, filterValue) => {
    if (value == null) return false;
    const options = Array.isArray(filterValue) ? filterValue : [filterValue];
    const cell = String(value).toLowerCase();
    return options.some(option => option != null && String(option).toLowerCase() === cell);
  },

  // Used by boolean and singleSelect (case-insensitive string comparison), and by dates.
  not: (value, filterValue) => {
    if (value instanceof Date) return dateNot(value, filterValue);
    if (value == null && filterValue == null) return false;
    if (value == null || filterValue == null) return true;
    return String(value).toLowerCase() !== String(filterValue).toLowerCase();
  },

  is: (value, filterValue) => {
    if (filterValue == null || filterValue === '') return true;
    if (value instanceof Date) return dateIs(value, filterValue);
    return String(value).toLowerCase() === String(filterValue).toLowerCase();
  },

  // Date operators compare local calendar days.
  after: byDay((a, b) => a > b),
  onOrAfter: byDay((a, b) => a >= b),
  before: byDay((a, b) => a < b),
  onOrBefore: byDay((a, b) => a <= b),
};

/** Date columns compare `is` / `not` by calendar day, so ISO strings and Date objects match the typed day. */
const DATE_COLUMN_OPERATORS: Partial<Record<GridFilterOperator, GridFilterOperatorFn>> = {
  is: dateIs,
  not: dateNot,
};

function resolveOperator(operator: string, colDef: GridColDef | undefined): GridFilterOperatorFn | undefined {
  if (!Object.prototype.hasOwnProperty.call(FILTER_OPERATORS, operator)) return undefined;
  const op = operator as GridFilterOperator;
  if (colDef?.type === 'date') {
    const dateFn = DATE_COLUMN_OPERATORS[op];
    if (dateFn) return dateFn;
  }
  return FILTER_OPERATORS[op];
}

function isFilterGroup(item: GridFilterItem | GridFilterGroup): item is GridFilterGroup {
  return 'items' in item && Array.isArray(item.items);
}

interface CompileContext {
  columns?: GridColumnLookup;
  /** Unknown operators already reported in this pass, so the warning fires once per pass, not per row. */
  warned: Set<string>;
}

function compileItem(item: GridFilterItem, ctx: CompileContext): RowPredicate | null {
  const { field, operator, value } = item;
  // An item whose value has not been entered yet (or was cleared) does not filter.
  if (!NO_VALUE_OPERATORS.has(operator) && isEmptyFilterValue(value)) return null;

  const colDef = ctx.columns?.byField.get(field);
  const operatorFn = resolveOperator(operator, colDef);
  if (!operatorFn) {
    if (!ctx.warned.has(operator)) {
      ctx.warned.add(operator);
      console.warn(`Unknown filter operator: ${operator}`);
    }
    return null;
  }
  return (row) => operatorFn(getCellValue(row, field, colDef), value);
}

function compileGroup(
  items: (GridFilterItem | GridFilterGroup)[],
  logicOperator: 'and' | 'or',
  ctx: CompileContext
): RowPredicate | null {
  const predicates: RowPredicate[] = [];
  for (const item of items) {
    const predicate = isFilterGroup(item)
      ? compileGroup(item.items, item.logicOperator, ctx)
      : compileItem(item, ctx);
    if (predicate) predicates.push(predicate);
  }
  if (predicates.length === 0) return null;
  if (predicates.length === 1) return predicates[0];
  return logicOperator === 'or'
    ? (row) => predicates.some(p => p(row))
    : (row) => predicates.every(p => p(row));
}

function pushSearchText(out: string[], value: unknown): void {
  if (value == null) return;
  switch (typeof value) {
    case 'string':
      out.push(value.toLowerCase());
      return;
    case 'number':
      if (!Number.isNaN(value)) out.push(String(value));
      return;
    case 'boolean':
    case 'bigint':
      out.push(String(value));
      return;
    default:
      break;
  }
  if (value instanceof Date) {
    // Search the calendar day, not Date.toString()'s "Wed Jan 10 2024 ... GMT+0000".
    const day = toLocalDateString(value);
    if (day) out.push(day);
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      if (entry == null || typeof entry !== 'object') pushSearchText(out, entry);
    }
  }
  // Other objects have no meaningful text ("[object Object]") and are skipped.
}

function getQuickFilterTexts(row: GridRowModel, columns: GridColumnLookup | undefined): string[] {
  const texts: string[] = [];
  if (!columns) {
    for (const value of Object.values(row)) pushSearchText(texts, value);
    return texts;
  }
  for (const col of columns.quickFilterColumns) {
    const value = getCellValue(row, col.field, col);
    const formatted = getFormattedValue(row, col.field, value, col);
    if (formatted != null && formatted !== '') texts.push(String(formatted).toLowerCase());
    pushSearchText(texts, value);
  }
  return texts;
}

// Search texts per column lookup and row object. The grid keeps one lookup while the columns and
// hidden columns stay the same, so typing in the quick filter reads every cell once, not per keystroke.
const quickFilterTextCache = new WeakMap<GridColumnLookup, WeakMap<GridRowModel, string[]>>();

function getCachedQuickFilterTexts(row: GridRowModel, columns: GridColumnLookup | undefined): string[] {
  if (!columns) return getQuickFilterTexts(row, columns);
  let byRow = quickFilterTextCache.get(columns);
  if (!byRow) {
    byRow = new WeakMap();
    quickFilterTextCache.set(columns, byRow);
  }
  let texts = byRow.get(row);
  if (!texts) {
    texts = getQuickFilterTexts(row, columns);
    byRow.set(row, texts);
  }
  return texts;
}

function compileQuickFilter(values: readonly string[] | undefined, columns: GridColumnLookup | undefined): RowPredicate | null {
  const terms = (values ?? [])
    .map(value => String(value ?? '').trim().toLowerCase())
    .filter(term => term !== '');
  if (terms.length === 0) return null;
  return (row) => {
    const texts = getCachedQuickFilterTexts(row, columns);
    return terms.every(term => texts.some(text => text.includes(term)));
  };
}

/**
 * Compile a filter model into a row predicate. Returns null when the model filters nothing
 * (no items with a value and no quick-filter terms), so callers can skip the pass entirely.
 *
 * Pass `columns` so that cells are read through `valueGetter`, date columns use calendar-day
 * comparison and the quick filter searches only visible, filterable columns (including their
 * `valueFormatter` text). Without it, `row[field]` is read and the quick filter searches every
 * primitive value in the row.
 */
export function createRowFilter(
  filterModel: GridFilterModel | GridFilterGroup | null | undefined,
  columns?: GridColumnLookup
): RowPredicate | null {
  if (!filterModel) return null;
  const ctx: CompileContext = { columns, warned: new Set() };
  const quickFilterValues = 'quickFilterValues' in filterModel ? filterModel.quickFilterValues : undefined;
  const quick = compileQuickFilter(quickFilterValues, columns);
  const itemsPredicate = compileGroup(filterModel.items ?? [], filterModel.logicOperator ?? 'and', ctx);
  if (quick && itemsPredicate) return (row) => quick(row) && itemsPredicate(row);
  return quick ?? itemsPredicate;
}

/**
 * Apply a single filter item to a row
 */
export function applyFilterItem<R extends GridRowModel>(
  row: R,
  filterItem: GridFilterItem,
  colDef?: GridColDef
): boolean {
  const columns: GridColumnLookup | undefined = colDef
    ? { byField: new Map([[filterItem.field, colDef]]), quickFilterColumns: [] }
    : undefined;
  const predicate = compileItem(filterItem, { columns, warned: new Set() });
  return predicate ? predicate(row) : true;
}

/**
 * Apply the quick filter (global search). Every term must be found in at least one searched value.
 */
export function applyQuickFilter<R extends GridRowModel>(
  row: R,
  quickFilterValues: string[],
  columns?: GridColumnLookup
): boolean {
  const predicate = compileQuickFilter(quickFilterValues, columns);
  return predicate ? predicate(row) : true;
}

/**
 * Check if a row matches the filter model. Compiles the model on every call: to test many rows,
 * build a predicate once with createRowFilter.
 */
export function isRowMatchingFilter<R extends GridRowModel>(
  row: R,
  filterModel: GridFilterModel | GridFilterGroup,
  columns?: GridColumnLookup
): boolean {
  const predicate = createRowFilter(filterModel, columns);
  return predicate ? predicate(row) : true;
}

export function filterRows<R extends GridRowModel>(
  rows: R[],
  filterModel: GridFilterModel,
  columns?: GridColumnLookup
): R[] {
  const predicate = createRowFilter(filterModel, columns);
  if (!predicate) return rows;
  return rows.filter(row => predicate(row));
}

export function getDefaultOperator(type?: string): GridFilterOperator {
  switch (type) {
    case 'number':
      return '=';
    case 'date':
      return 'is';
    case 'boolean':
      return 'is';
    case 'singleSelect':
      return 'isAnyOf';
    default:
      return 'contains';
  }
}

export function getOperatorsForType(type?: string): GridFilterOperator[] {
  switch (type) {
    case 'number':
      return ['=', '!=', '>', '>=', '<', '<=', 'isEmpty', 'isNotEmpty'];
    case 'date':
      return ['is', 'not', 'after', 'onOrAfter', 'before', 'onOrBefore', 'isEmpty', 'isNotEmpty'];
    case 'boolean':
      return ['is'];
    case 'singleSelect':
      return ['isAnyOf', 'is', 'not'];
    default:
      return ['contains', 'equals', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'];
  }
}
