
import type { GridColDef, GridRowId, GridRowModel, GridSortCellParams, GridSortDirection, GridSortItem } from '../../types';
import type { GridColumnLookup } from '../columnLookup';
import { getCellValue, toDate, toNumber, warnCallbackFailure } from '../values';

/**
 * Language-aware string order: accented letters sort next to their base letter instead of after
 * 'z', case is ignored, and digit runs compare by value ('item9' before 'item10').
 */
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'accent' });

// Values of different kinds are ordered by kind first, so the comparator stays transitive when a
// column mixes, say, numbers and strings.
const RANK_NUMBER = 0;
const RANK_DATE = 1;
const RANK_BOOLEAN = 2;
const RANK_STRING = 3;
const RANK_OTHER = 4;

/** A normalized sort value. null is the empty bucket (null, undefined, NaN, Invalid Date, unparsable). */
type SortKey = { rank: number; num: number; str: string } | null;

function numberKey(rank: number, num: number): SortKey {
  return { rank, num, str: '' };
}

/**
 * Normalize a cell value for sorting. `type: 'number'` columns coerce numeric strings ('10' sorts
 * after '9'), `type: 'date'` columns parse date strings; values that cannot be read go to the empty
 * bucket together with null.
 */
function toSortKey(value: unknown, type?: GridColDef['type']): SortKey {
  if (value == null) return null;
  if (type === 'number') {
    const n = toNumber(value);
    return n === null ? null : numberKey(RANK_NUMBER, n);
  }
  if (type === 'date') {
    const date = toDate(value);
    return date ? numberKey(RANK_DATE, date.getTime()) : null;
  }
  switch (typeof value) {
    case 'number':
      return Number.isNaN(value) ? null : numberKey(RANK_NUMBER, value);
    case 'bigint':
      return numberKey(RANK_NUMBER, Number(value));
    case 'boolean':
      return numberKey(RANK_BOOLEAN, value ? 1 : 0);
    case 'string':
      return { rank: RANK_STRING, num: 0, str: value };
    default:
      break;
  }
  if (value instanceof Date) {
    const t = value.getTime();
    return Number.isNaN(t) ? null : numberKey(RANK_DATE, t);
  }
  return { rank: RANK_OTHER, num: 0, str: String(value) };
}

/** Ascending comparison of two keys. The empty bucket sorts after every value. Never returns NaN. */
function compareSortKeys(a: SortKey, b: SortKey): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (a.rank !== b.rank) return a.rank - b.rank;
  if (a.rank === RANK_STRING || a.rank === RANK_OTHER) return collator.compare(a.str, b.str);
  return a.num < b.num ? -1 : a.num > b.num ? 1 : 0;
}

/** Reverse an ascending comparison for 'desc'. */
export function applySortDirection(comparison: number, direction: 'asc' | 'desc'): number {
  if (comparison === 0) return 0;
  return direction === 'asc' ? comparison : -comparison;
}

/**
 * Compare two cell values. Empty values (null, undefined, NaN, Invalid Date) sort last in 'asc'
 * and first in 'desc'. Pass the column `type` to get numeric / date coercion of string values.
 */
export function compareValues(
  a: unknown,
  b: unknown,
  direction: 'asc' | 'desc',
  type?: GridColDef['type']
): number {
  return applySortDirection(compareSortKeys(toSortKey(a, type), toSortKey(b, type)), direction);
}

/** A column's `sortComparator`, as the sorting utils call it. */
export type GridSortComparatorFn = NonNullable<GridColDef['sortComparator']>;

/**
 * Call a consumer `sortComparator`, containing failures: a throw or a non-finite result reads as 0
 * (equal), with a one-time dev warning per column, so one bad comparison cannot break the sort.
 */
export function callSortComparator(
  comparator: GridSortComparatorFn,
  a: GridSortCellParams,
  b: GridSortCellParams
): number {
  let result: number;
  try {
    result = comparator(a.value, b.value, a, b);
  } catch (error) {
    warnCallbackFailure(`sortComparator:${a.field}`, `sortComparator for column "${a.field}" threw; the values are treated as equal`, error);
    return 0;
  }
  if (typeof result !== 'number' || Number.isNaN(result)) {
    warnCallbackFailure(`sortComparator:${a.field}:nan`, `sortComparator for column "${a.field}" returned ${String(result)}; the values are treated as equal`, undefined);
    return 0;
  }
  return result;
}

const defaultRowId = (row: GridRowModel): GridRowId => row.id;

/**
 * Compare two rows by a sort model, reading cells through `valueGetter` and using each column's
 * `type` (or its `sortComparator`). Returns 0 when every key is equal.
 */
export function compareRowsBySortModel(
  a: GridRowModel,
  b: GridRowModel,
  sortModel: readonly GridSortItem[],
  columns?: GridColumnLookup,
  getRowId: (row: GridRowModel) => GridRowId = defaultRowId
): number {
  for (const sortItem of sortModel) {
    const colDef = columns?.byField.get(sortItem.field);
    const va = getCellValue(a, sortItem.field, colDef);
    const vb = getCellValue(b, sortItem.field, colDef);
    const comparison = colDef?.sortComparator
      ? applySortDirection(
          callSortComparator(
            colDef.sortComparator,
            { id: getRowId(a), field: sortItem.field, row: a, value: va },
            { id: getRowId(b), field: sortItem.field, row: b, value: vb }
          ),
          sortItem.sort
        )
      : compareValues(va, vb, sortItem.sort, colDef?.type);
    if (comparison !== 0) return comparison;
  }
  return 0;
}

export function sortRows<R extends GridRowModel>(
  rows: R[],
  sortModel: GridSortItem[],
  columns?: GridColumnLookup,
  getRowId: (row: R) => GridRowId = defaultRowId
): R[] {
  if (sortModel.length === 0) {
    return rows;
  }
  return sortItemsBySortModel(rows, sortModel, (row, sortItem) => {
    const colDef = columns?.byField.get(sortItem.field);
    const value = getCellValue(row, sortItem.field, colDef);
    return {
      value,
      type: colDef?.type,
      comparator: colDef?.sortComparator,
      params: colDef?.sortComparator ? { id: getRowId(row), field: sortItem.field, row, value } : undefined,
    };
  });
}

/** The value an item sorts by for one sort key, and how to compare it. */
export interface GridSortValue {
  value: unknown;
  type?: GridColDef['type'];
  /**
   * The column's `sortComparator`. Two items are compared with it when both carry the same one
   * (with their `params`); otherwise the built-in comparison of `value` / `type` applies.
   */
  comparator?: GridSortComparatorFn;
  /** The params passed to `comparator` for this item; `value` here is what the comparator sees. */
  params?: GridSortCellParams;
}

/**
 * Stable sort of any items by a sort model. `readValue` gives the value (and column type or
 * comparator) an item sorts by for each sort key; it is called once per item and key, not once per
 * comparison. Used by the flat pipeline and by tree data / row grouping, whose synthetic group rows
 * sort by their grouping value or label instead of a cell.
 */
export function sortItemsBySortModel<T>(
  items: readonly T[],
  sortModel: readonly GridSortItem[],
  readValue: (item: T, sortItem: GridSortItem) => GridSortValue
): T[] {
  if (sortModel.length === 0 || items.length < 2) {
    return [...items];
  }

  // Read and normalize every sort value once, instead of calling valueGetter and parsing dates
  // O(n log n) times inside the comparator.
  const values = sortModel.map(sortItem => items.map(item => readValue(item, sortItem)));
  const keys = values.map(column => column.map(({ value, type }) => toSortKey(value, type)));

  const order = items.map((_, index) => index);
  order.sort((ia, ib) => {
    for (let k = 0; k < sortModel.length; k++) {
      const a = values[k][ia];
      const b = values[k][ib];
      const ascending = a.comparator && a.comparator === b.comparator && a.params && b.params
        ? callSortComparator(a.comparator, a.params, b.params)
        : compareSortKeys(keys[k][ia], keys[k][ib]);
      const comparison = applySortDirection(ascending, sortModel[k].sort);
      if (comparison !== 0) return comparison;
    }
    return ia - ib;
  });

  return order.map(index => items[index]);
}

/**
 * The sort model after setting one column's direction while keeping the others: an existing key
 * keeps its priority and only changes direction, a new key is appended, and `null` removes it.
 */
export function upsertSortItem(
  sortModel: readonly GridSortItem[],
  field: string,
  direction: GridSortDirection
): GridSortItem[] {
  if (!direction) return sortModel.filter(item => item.field !== field);
  const index = sortModel.findIndex(item => item.field === field);
  if (index === -1) return [...sortModel, { field, sort: direction }];
  return sortModel.map((item, i) => (i === index ? { field, sort: direction } : item));
}
