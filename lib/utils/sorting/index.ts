
import type { GridColDef, GridRowModel, GridSortDirection, GridSortItem } from '../../types';
import type { GridColumnLookup } from '../columnLookup';
import { getCellValue, toDate, toNumber } from '../values';

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

function applyDirection(comparison: number, direction: 'asc' | 'desc'): number {
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
  return applyDirection(compareSortKeys(toSortKey(a, type), toSortKey(b, type)), direction);
}

/**
 * Compare two rows by a sort model, reading cells through `valueGetter` and using each column's
 * `type`. Returns 0 when every key is equal.
 */
export function compareRowsBySortModel(
  a: GridRowModel,
  b: GridRowModel,
  sortModel: readonly GridSortItem[],
  columns?: GridColumnLookup
): number {
  for (const sortItem of sortModel) {
    const colDef = columns?.byField.get(sortItem.field);
    const comparison = compareValues(
      getCellValue(a, sortItem.field, colDef),
      getCellValue(b, sortItem.field, colDef),
      sortItem.sort,
      colDef?.type
    );
    if (comparison !== 0) return comparison;
  }
  return 0;
}

export function sortRows<R extends GridRowModel>(
  rows: R[],
  sortModel: GridSortItem[],
  columns?: GridColumnLookup
): R[] {
  if (sortModel.length === 0) {
    return rows;
  }
  return sortItemsBySortModel(rows, sortModel, (row, sortItem) => {
    const colDef = columns?.byField.get(sortItem.field);
    return { value: getCellValue(row, sortItem.field, colDef), type: colDef?.type };
  });
}

/** The value an item sorts by for one sort key, and the column type used to compare it. */
export interface GridSortValue {
  value: unknown;
  type?: GridColDef['type'];
}

/**
 * Stable sort of any items by a sort model. `readValue` gives the value (and column type) an item
 * sorts by for each sort key; it is called once per item and key, not once per comparison. Used by
 * the flat pipeline and by tree data / row grouping, whose synthetic group rows sort by their
 * grouping value or label instead of a cell.
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
  const keys = sortModel.map(sortItem => items.map(item => {
    const { value, type } = readValue(item, sortItem);
    return toSortKey(value, type);
  }));

  const order = items.map((_, index) => index);
  order.sort((ia, ib) => {
    for (let k = 0; k < sortModel.length; k++) {
      const comparison = applyDirection(compareSortKeys(keys[k][ia], keys[k][ib]), sortModel[k].sort);
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
