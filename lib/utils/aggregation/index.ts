import type { GridAggregationModel, GridAggregationResult, GridColDef, GridRowModel } from '../../types';
import { getCellValue, toNumber } from '../values';

export type BuiltInAggFn = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'unique';

/**
 * A value that carries no data for aggregation: null, undefined, or a string that is empty or whitespace
 * only. Blank cells come from edits, CSV imports and form inputs; they must not count as zero or as an item.
 */
export const isEmptyAggregateValue = (v: unknown): boolean =>
    v == null || (typeof v === 'string' && v.trim() === '');

// Numeric functions read values with the grid's shared toNumber (as filtering does): numbers, numeric
// strings and Dates (as timestamps). Booleans, arrays and blank strings are skipped, since Number()
// would coerce them to 0 or 1 and silently corrupt avg / min / max.
const toNumbers = (values: unknown[]): number[] => {
    const nums: number[] = [];
    for (const v of values) {
        const n = toNumber(v);
        if (n !== null) nums.push(n);
    }
    return nums;
};

// The smallest / largest value. A loop, not Math.min(...nums): spreading >~120k arguments throws
// RangeError. The extreme is returned as it was given when it is a Date, so min / max of a date
// column is a date (formatted as one) rather than epoch milliseconds.
const extremeOf = (values: unknown[], isBetter: (a: number, b: number) => boolean): number | Date | null => {
    let best: number | null = null;
    let bestValue: unknown = null;
    for (const v of values) {
        const n = toNumber(v);
        if (n === null) continue;
        if (best === null || isBetter(n, best)) {
            best = n;
            bestValue = v;
        }
    }
    if (best === null) return null;
    return bestValue instanceof Date ? bestValue : best;
};

export const AGGREGATION_FUNCTIONS: Record<BuiltInAggFn, (values: unknown[]) => unknown> = {
    sum: (values) => toNumbers(values).reduce((acc, n) => acc + n, 0),
    avg: (values) => {
        const nums = toNumbers(values);
        return nums.length ? nums.reduce((acc, n) => acc + n, 0) / nums.length : null;
    },
    count: (values) => values.filter((v) => !isEmptyAggregateValue(v)).length,
    min: (values) => extremeOf(values, (a, b) => a < b),
    max: (values) => extremeOf(values, (a, b) => a > b),
    unique: (values) => new Set(values.filter((v) => !isEmptyAggregateValue(v))).size,
};

/**
 * Aggregates each `aggregationModel` field over `rows`. Cells are read through the column's
 * `valueGetter` (getCellValue), so a computed column totals what its cells show.
 */
export function computeAggregations<R extends GridRowModel>(
    rows: R[],
    aggregationModel: GridAggregationModel,
    columnsLookup: Map<string, GridColDef<R>>,
    warnPrefix: string,
): GridAggregationResult {
    const result: GridAggregationResult = {};
    for (const [field, fnName] of Object.entries(aggregationModel)) {
        const colDef = columnsLookup.get(field);
        if (colDef?.availableAggregationFunctions && !colDef.availableAggregationFunctions.includes(fnName)) {
            continue;
        }
        const fn = AGGREGATION_FUNCTIONS[fnName as BuiltInAggFn];
        if (!fn) {
            console.warn(`[${warnPrefix}] Unknown aggregation function: "${fnName}"`);
            continue;
        }
        result[field] = fn(rows.map((row) => getCellValue(row, field, colDef as GridColDef | undefined)));
    }
    return result;
}

/** Default display string for an aggregate: `—` when missing, locale-grouped numbers, avg to 2 decimals. */
export function formatAggregationValue(value: unknown, fnName: string): string {
    if (value == null) return '—';
    if (typeof value === 'number') {
        if (fnName === 'avg') {
            return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        return value.toLocaleString();
    }
    return String(value);
}

const COUNT_FUNCTIONS = new Set<string>(['count', 'unique']);

/**
 * Whether an aggregation result is a number of values rather than a value of the column's kind:
 * a count of a currency column is not an amount, so the column's valueFormatter must not format it.
 */
export function isCountAggregation(fnName: string | undefined): boolean {
    return fnName !== undefined && COUNT_FUNCTIONS.has(fnName);
}

/**
 * The aggregation result in the column's own terms: min / max of a `type: 'date'` column given as
 * epoch milliseconds (as a server may return it) becomes a Date again.
 */
export function normalizeAggregateValue<R extends GridRowModel>(
    colDef: GridColDef<R> | undefined,
    fnName: string | undefined,
    value: unknown,
): unknown {
    if (colDef?.type === 'date' && (fnName === 'min' || fnName === 'max') && typeof value === 'number' && Number.isFinite(value)) {
        return new Date(value);
    }
    return value;
}

/**
 * Display text for an aggregate of `colDef`'s values, used by the footer, group rows, pivot cells and
 * every exporter so they all show the same thing.
 * - count / unique are plain counts in the default format; the column's valueFormatter is not applied.
 * - sum / avg / min / max go through the column's valueFormatter. Its `row` is the record of aggregated
 *   values (the group row, the pivot row, or the footer's totals). A formatter that throws, typically
 *   because it reads row data an aggregate does not have, falls back to the default format.
 * - Without a formatter, dates show as locale dates and numbers in the default format.
 */
export function formatAggregateForColumn<R extends GridRowModel>(
    value: unknown,
    fnName: string,
    colDef?: GridColDef<R>,
    aggregates?: Record<string, unknown>,
): string {
    if (value == null) return '—';
    if (isCountAggregation(fnName)) return formatAggregationValue(value, fnName);
    const normalized = normalizeAggregateValue(colDef, fnName, value);
    if (colDef?.valueFormatter) {
        try {
            return String(colDef.valueFormatter({ value: normalized, row: (aggregates ?? {}) as R, field: colDef.field }) ?? '');
        } catch {
            // Fall through to the default format rather than failing the whole grid or export.
        }
    }
    if (normalized instanceof Date) return Number.isNaN(normalized.getTime()) ? '' : normalized.toLocaleDateString();
    return formatAggregationValue(normalized, fnName);
}
