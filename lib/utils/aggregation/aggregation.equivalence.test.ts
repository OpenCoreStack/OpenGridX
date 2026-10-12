import { describe, it, expect } from 'vitest';
import { AGGREGATION_FUNCTIONS, computeAggregations, type BuiltInAggFn } from './index';
import { getCellValue } from '../values';
import type { GridColDef, GridRowModel } from '../../types';

function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const POOL: unknown[] = [null, undefined, '', '  ', ' 12.5 ', 'abc', true, false, NaN, Infinity, -Infinity, -0, 0, new Date(2024, 1, 3), new Date(NaN), [1], { a: 1 }, BigInt(7)];

function makeRows(count: number, seed: number): GridRowModel[] {
    const rand = mulberry32(seed);
    return Array.from({ length: count }, (_, id) => ({
        id,
        v: rand() < 0.4 ? POOL[Math.floor(rand() * POOL.length)] : (rand() - 0.5) * 1e6 + rand() * 1e-9,
    }));
}

const FNS = Object.keys(AGGREGATION_FUNCTIONS) as BuiltInAggFn[];

describe('computeAggregations matches the value-array aggregation functions', () => {
    const columns: Array<GridColDef | undefined> = [undefined, { field: 'v' }, { field: 'v', valueGetter: ({ value }) => value }];
    for (let seed = 1; seed <= 8; seed++) {
        it(`seed ${seed}`, () => {
            const rows = makeRows(seed === 1 ? 0 : 3000, seed);
            for (const colDef of columns) {
                const lookup = new Map<string, GridColDef>(colDef ? [['v', colDef]] : []);
                for (const fn of FNS) {
                    const expected = AGGREGATION_FUNCTIONS[fn](rows.map(row => getCellValue(row, 'v', colDef)));
                    expect(computeAggregations(rows, { v: fn }, lookup, 'test').v).toStrictEqual(expected);
                }
            }
        });
    }
});
