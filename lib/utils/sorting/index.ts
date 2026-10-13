
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
/** `big`: the exact value of a bigint key, whose `num` is only its nearest double. */
type SortKey = { rank: number; num: number; str: string; big?: bigint } | null;

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
    if (typeof value === 'bigint') return { rank: RANK_NUMBER, num: Number(value), str: '', big: value };
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
      return { rank: RANK_NUMBER, num: Number(value), str: '', big: value };
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
  if (a.num !== b.num) return a.num < b.num ? -1 : 1;
  // Number(bigint) rounds monotonically, so only equal doubles can hide an order between bigints.
  return a.big !== undefined || b.big !== undefined ? compareExact(a.big ?? a.num, b.big ?? b.num) : 0;
}

/** Exact ascending comparison of numbers and bigints (no rounding of either). */
function compareExact(a: number | bigint, b: number | bigint): number {
  if (typeof a === 'number' && typeof b === 'number') return a < b ? -1 : a > b ? 1 : 0;
  if (typeof a === 'bigint' && typeof b === 'bigint') return a < b ? -1 : a > b ? 1 : 0;
  if (typeof a === 'number') return -compareExact(b, a);
  // a is a bigint, b a number.
  const n = b as number;
  if (!Number.isFinite(n)) return n > 0 ? -1 : 1;
  const floor = Math.floor(n);
  const whole = BigInt(floor);
  if (a < whole) return -1;
  if (a > whole) return 1;
  return n > floor ? -1 : 0;
}

const isUnsafeBigInt = (value: unknown): value is bigint =>
  typeof value === 'bigint' && (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER));

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

export function sortRows<R extends GridRowModel>(
  rows: R[],
  sortModel: GridSortItem[],
  columns?: GridColumnLookup,
  getRowId: (row: R) => GridRowId = defaultRowId
): R[] {
  if (sortModel.length === 0) {
    return rows;
  }
  if (rows.length < 2) return [...rows];
  const sortColumns = sortModel.map(sortItem => {
    const colDef = columns?.byField.get(sortItem.field);
    const comparator = colDef?.sortComparator;
    if (comparator) {
      return genericSortColumn(rows.map(row => {
        const value = getCellValue(row, sortItem.field, colDef);
        return { value, type: colDef.type, comparator, params: { id: getRowId(row), field: sortItem.field, row, value } };
      }));
    }
    const type = colDef?.type;
    return encodeSortColumn(rows.length, i => getCellValue(rows[i], sortItem.field, colDef), () => type);
  });
  return sortByColumns(rows, sortModel, sortColumns);
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

  // Read every sort value once, instead of calling valueGetter and parsing dates O(n log n) times
  // inside the comparator.
  const columns = sortModel.map(sortItem => {
    const values = items.map(item => readValue(item, sortItem));
    // A key where no item carries a comparator compares by the built-in order only, so it can be
    // encoded up front.
    return values.some(v => v.comparator && v.params)
      ? genericSortColumn(values)
      : encodeSortColumn(values.length, i => values[i].value, i => values[i].type);
  });
  return sortByColumns(items, sortModel, columns);
}

/** One sort key, ready to compare: encoded into typed arrays, or kept as values when a sortComparator applies. */
type SortColumn =
  | { kind: 'encoded'; group: Uint8Array; num: Float64Array }
  | { kind: 'generic'; values: readonly GridSortValue[]; keys: readonly SortKey[] };

/** The group of the empty bucket: after every rank, as in compareSortKeys. */
const GROUP_EMPTY = RANK_OTHER + 1;

/** Give each item of `buckets` (distinct text → item indexes) its text's position in collator order. */
function rankTexts(buckets: Map<string, number[]>, num: Float64Array): void {
  const distinct = [...buckets.keys()].sort(collator.compare);
  // Texts the collator calls equal share a position, so they tie exactly as in compareSortKeys.
  let position = 0;
  for (let d = 0; d < distinct.length; d++) {
    if (d > 0 && collator.compare(distinct[d - 1], distinct[d]) !== 0) position++;
    for (const i of buckets.get(distinct[d]) ?? []) num[i] = position;
  }
}

/** Replaces the numbers of a column holding unsafe bigints by their exact ascending position. */
function rankNumbersExactly(group: Uint8Array, num: Float64Array, bigints: ReadonlyMap<number, bigint>): void {
  const indices: number[] = [];
  for (let i = 0; i < group.length; i++) if (group[i] === RANK_NUMBER) indices.push(i);
  const exact = (i: number): number | bigint => bigints.get(i) ?? num[i];
  indices.sort((ia, ib) => compareExact(exact(ia), exact(ib)));
  let position = 0;
  for (let k = 0; k < indices.length; k++) {
    if (k > 0 && compareExact(exact(indices[k - 1]), exact(indices[k])) !== 0) position++;
    num[indices[k]] = position;
  }
}

function addToBucket(buckets: Map<string, number[]>, text: string, index: number): void {
  const bucket = buckets.get(text);
  if (bucket) bucket.push(index);
  else buckets.set(text, [index]);
}

/**
 * Encode one key as (group, number) per item. The group is the value's rank, with the empty bucket
 * last; the number is the value itself for numbers, dates and booleans, and for strings (and other
 * values) the position of its text among the key's distinct texts in collator order. Comparing
 * (group, number) gives exactly compareSortKeys' order, while the collator runs only to sort the
 * distinct texts instead of in every row comparison.
 */
function encodeSortColumn(count: number, valueAt: (i: number) => unknown, typeAt: (i: number) => GridColDef['type']): SortColumn {
  const group = new Uint8Array(count);
  const num = new Float64Array(count);
  const strings = new Map<string, number[]>();
  const others = new Map<string, number[]>();
  // Bigints beyond 2^53 lose precision as doubles: if any appears, numbers are re-ranked exactly.
  let bigints: Map<number, bigint> | null = null;
  for (let i = 0; i < count; i++) {
    const value = valueAt(i);
    const type = typeAt(i);
    if (isUnsafeBigInt(value) && type !== 'date') (bigints ??= new Map()).set(i, value);
    if (typeof value === 'number' && type !== 'date') {
      // toSortKey for a number, without the allocation.
      if (Number.isNaN(value)) {
        group[i] = GROUP_EMPTY;
      } else {
        group[i] = RANK_NUMBER;
        num[i] = value;
      }
      continue;
    }
    const key = toSortKey(value, type);
    if (key === null) {
      group[i] = GROUP_EMPTY;
    } else {
      group[i] = key.rank;
      if (key.rank === RANK_STRING) addToBucket(strings, key.str, i);
      else if (key.rank === RANK_OTHER) addToBucket(others, key.str, i);
      else num[i] = key.num;
    }
  }
  rankTexts(strings, num);
  rankTexts(others, num);
  if (bigints) rankNumbersExactly(group, num, bigints);
  return { kind: 'encoded', group, num };
}

function genericSortColumn(values: readonly GridSortValue[]): SortColumn {
  return { kind: 'generic', values, keys: values.map(({ value, type }) => toSortKey(value, type)) };
}

/** Ascending comparison of items `ia` and `ib` on one key. */
function compareInColumn(column: SortColumn, ia: number, ib: number): number {
  if (column.kind === 'encoded') {
    const ga = column.group[ia];
    const gb = column.group[ib];
    if (ga !== gb) return ga - gb;
    const na = column.num[ia];
    const nb = column.num[ib];
    return na < nb ? -1 : na > nb ? 1 : 0;
  }
  const a = column.values[ia];
  const b = column.values[ib];
  return a.comparator && a.comparator === b.comparator && a.params && b.params
    ? callSortComparator(a.comparator, a.params, b.params)
    : compareSortKeys(column.keys[ia], column.keys[ib]);
}

/** Stable sort by prepared keys: the first key that differs decides, ties keep the input order. */
function sortByColumns<T>(items: readonly T[], sortModel: readonly GridSortItem[], columns: readonly SortColumn[]): T[] {
  const n = items.length;
  const order = new Array<number>(n);
  for (let i = 0; i < n; i++) order[i] = i;
  const first = columns[0];
  if (columns.length === 1 && first.kind === 'encoded') {
    // The common single-key case, without the per-comparison key loop.
    const { group, num } = first;
    const sign = sortModel[0].sort === 'asc' ? 1 : -1;
    order.sort((ia, ib) => {
      const ga = group[ia];
      const gb = group[ib];
      if (ga !== gb) return (ga - gb) * sign;
      const na = num[ia];
      const nb = num[ib];
      if (na < nb) return -sign;
      if (na > nb) return sign;
      return ia - ib;
    });
  } else {
    order.sort((ia, ib) => {
      for (let k = 0; k < columns.length; k++) {
        const comparison = applySortDirection(compareInColumn(columns[k], ia, ib), sortModel[k].sort);
        if (comparison !== 0) return comparison;
      }
      return ia - ib;
    });
  }
  const result = new Array<T>(n);
  for (let i = 0; i < n; i++) result[i] = items[order[i]];
  return result;
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
