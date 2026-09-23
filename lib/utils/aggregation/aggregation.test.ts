import { describe, it, expect } from 'vitest';
import { AGGREGATION_FUNCTIONS, computeAggregations, formatAggregateForColumn } from './index';
import type { GridColDef, GridRowModel } from '../../types';

describe('AGGREGATION_FUNCTIONS', () => {
    it('computes min / max over more values than a spread argument list allows', () => {
        const values = Array.from({ length: 300_000 }, (_, i) => i);
        expect(AGGREGATION_FUNCTIONS.min(values)).toBe(0);
        expect(AGGREGATION_FUNCTIONS.max(values)).toBe(299_999);
    });

    it('returns null for min / max / avg when there are no numeric values', () => {
        expect(AGGREGATION_FUNCTIONS.min([null, undefined])).toBeNull();
        expect(AGGREGATION_FUNCTIONS.max([])).toBeNull();
        expect(AGGREGATION_FUNCTIONS.avg(['x'])).toBeNull();
    });

    it('ignores blank strings instead of treating them as zero', () => {
        expect(AGGREGATION_FUNCTIONS.avg([10, '', 20])).toBe(15);
        expect(AGGREGATION_FUNCTIONS.min([10, ' ', 20])).toBe(10);
        expect(AGGREGATION_FUNCTIONS.max([-5, '', -1])).toBe(-1);
        expect(AGGREGATION_FUNCTIONS.sum(['', '  ', 4])).toBe(4);
    });

    it('ignores booleans and arrays, which Number() would coerce to 0 or 1', () => {
        expect(AGGREGATION_FUNCTIONS.min([false, 5, 7])).toBe(5);
        expect(AGGREGATION_FUNCTIONS.max([true, -3])).toBe(-3);
        expect(AGGREGATION_FUNCTIONS.avg([[], 8, 12])).toBe(10);
    });

    it('still accepts numeric strings and dates', () => {
        expect(AGGREGATION_FUNCTIONS.sum(['12', 3])).toBe(15);
        expect(AGGREGATION_FUNCTIONS.max([new Date(1000), new Date(5000)])).toBe(5000);
    });

    it('does not count or distinguish blank strings', () => {
        expect(AGGREGATION_FUNCTIONS.count(['a', '', null, undefined, ' ', 0])).toBe(2);
        expect(AGGREGATION_FUNCTIONS.unique(['a', 'a', '', 'b'])).toBe(2);
    });
});

describe('computeAggregations', () => {
    it('aggregates the value a column displays when it has a valueGetter', () => {
        const rows: GridRowModel[] = [{ id: 1, price: 2, qty: 3 }, { id: 2, price: 5, qty: 2 }];
        const total: GridColDef = {
            field: 'total',
            valueGetter: ({ row }) => (row.price as number) * (row.qty as number),
        };
        const result = computeAggregations(rows, { total: 'sum' }, new Map([['total', total]]), 'test');
        expect(result.total).toBe(16);
    });
});

describe('formatAggregateForColumn', () => {
    const money: GridColDef = {
        field: 'salary',
        valueFormatter: ({ value, row }) => `${(row as { cur?: string }).cur ?? '$'}${Number(value).toFixed(0)}`,
    };

    it('applies the column valueFormatter to sum / avg / min / max', () => {
        expect(formatAggregateForColumn(6000, 'sum', money)).toBe('$6000');
        expect(formatAggregateForColumn(2000.4, 'avg', money)).toBe('$2000');
        expect(formatAggregateForColumn(10, 'min', money)).toBe('$10');
    });

    it('passes the sample row to the valueFormatter', () => {
        expect(formatAggregateForColumn(5, 'max', money, { id: 1, cur: '€' } as GridRowModel)).toBe('€5');
    });

    it('does not apply the valueFormatter to count or unique, which are not in the column unit', () => {
        expect(formatAggregateForColumn(1234, 'count', money)).toBe('1,234');
        expect(formatAggregateForColumn(3, 'unique', money)).toBe('3');
    });

    it('falls back to the default format when the valueFormatter throws', () => {
        const fragile: GridColDef = {
            field: 'salary',
            valueFormatter: ({ row }) => (row as unknown as { cur: { s: string } }).cur.s,
        };
        expect(formatAggregateForColumn(6000, 'sum', fragile)).toBe('6,000');
    });

    it('shows an em dash for a missing value', () => {
        expect(formatAggregateForColumn(null, 'sum', money)).toBe('—');
        expect(formatAggregateForColumn(undefined, 'avg')).toBe('—');
    });
});
