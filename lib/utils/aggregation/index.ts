import type { GridAggregationModel, GridAggregationResult, GridColDef, GridRowModel } from '../../types';

export type BuiltInAggFn = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'unique';

const toNumbers = (values: unknown[]): number[] => {
    const nums: number[] = [];
    for (const v of values) {
        if (v == null) continue;
        const n = Number(v);
        if (!isNaN(n)) nums.push(n);
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
    count: (values) => values.filter((v) => v != null).length,
    min: (values) => minOf(toNumbers(values)),
    max: (values) => maxOf(toNumbers(values)),
    unique: (values) => new Set(values.filter((v) => v != null)).size,
};

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
        result[field] = fn(rows.map((row) => row[field]));
    }
    return result;
}
