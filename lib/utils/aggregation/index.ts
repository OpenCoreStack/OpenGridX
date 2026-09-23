import type { GridAggregationModel, GridAggregationResult, GridColDef, GridRowModel } from '../../types';

export type BuiltInAggFn = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'unique';

/**
 * A value that carries no data for aggregation: null, undefined, or a string that is empty or whitespace
 * only. Blank cells come from edits, CSV imports and form inputs; they must not count as zero or as an item.
 */
export const isEmptyAggregateValue = (v: unknown): boolean =>
    v == null || (typeof v === 'string' && v.trim() === '');

// Accepts numbers, numeric strings and Dates (as timestamps). Booleans, arrays and blank strings are
// skipped: Number() coerces them to 0 or 1, which silently corrupts avg / min / max.
const toNumber = (v: unknown): number | null => {
    if (typeof v === 'number') return Number.isNaN(v) ? null : v;
    if (typeof v === 'string') {
        if (v.trim() === '') return null;
        const n = Number(v);
        return Number.isNaN(n) ? null : n;
    }
    if (v instanceof Date) {
        const t = v.getTime();
        return Number.isNaN(t) ? null : t;
    }
    return null;
};

const toNumbers = (values: unknown[]): number[] => {
    const nums: number[] = [];
    for (const v of values) {
        const n = toNumber(v);
        if (n !== null) nums.push(n);
    }
    return nums;
};

// Loops instead of Math.min(...nums): spreading >~120k arguments throws RangeError.
const minOf = (nums: number[]): number | null => {
    if (nums.length === 0) return null;
    let m = nums[0];
    for (let i = 1; i < nums.length; i++) if (nums[i] < m) m = nums[i];
    return m;
};

const maxOf = (nums: number[]): number | null => {
    if (nums.length === 0) return null;
    let m = nums[0];
    for (let i = 1; i < nums.length; i++) if (nums[i] > m) m = nums[i];
    return m;
};

export const AGGREGATION_FUNCTIONS: Record<BuiltInAggFn, (values: unknown[]) => unknown> = {
    sum: (values) => toNumbers(values).reduce((acc, n) => acc + n, 0),
    avg: (values) => {
        const nums = toNumbers(values);
        return nums.length ? nums.reduce((acc, n) => acc + n, 0) / nums.length : null;
    },
    count: (values) => values.filter((v) => !isEmptyAggregateValue(v)).length,
    min: (values) => minOf(toNumbers(values)),
    max: (values) => maxOf(toNumbers(values)),
    unique: (values) => new Set(values.filter((v) => !isEmptyAggregateValue(v))).size,
};

/**
 * The value a cell of `field` shows for `row`: the column's `valueGetter` result when it has one,
 * otherwise `row[field]`. Aggregates must total what the cells display, so computed columns work.
 */
export function getAggregationCellValue<R extends GridRowModel>(
    row: R,
    field: string,
    colDef?: GridColDef<R>,
): unknown {
    const raw = row[field];
    return colDef?.valueGetter ? colDef.valueGetter({ row, field, value: raw }) : raw;
}

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
        result[field] = fn(rows.map((row) => getAggregationCellValue(row, field, colDef)));
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

// count and unique are numbers of items, not amounts in the column's unit, so a currency
// or percent formatter would mislabel them.
const USES_COLUMN_FORMATTER = new Set<string>(['sum', 'avg', 'min', 'max']);

/**
 * Display string for an aggregate of `colDef`'s values. sum / avg / min / max go through the column's
 * `valueFormatter` (so totals keep the column's currency, unit or percent format); count and unique use
 * the default format. The formatter was written for a data row, so it gets `sampleRow` (a real row from
 * the aggregated set, when there is one) and, if it still throws, the default format is shown instead of
 * crashing the grid.
 */
export function formatAggregateForColumn<R extends GridRowModel>(
    value: unknown,
    fnName: string,
    colDef?: GridColDef<R>,
    sampleRow?: R,
): string {
    if (value == null) return '—';
    if (colDef?.valueFormatter && USES_COLUMN_FORMATTER.has(fnName)) {
        try {
            return colDef.valueFormatter({ value, row: sampleRow ?? ({} as R), field: colDef.field });
        } catch {
            // The formatter depends on row data an aggregate does not have; use the default format.
        }
    }
    return formatAggregationValue(value, fnName);
}
