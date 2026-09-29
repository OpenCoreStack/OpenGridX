import { describe, it, expect, vi } from 'vitest';
import { sortRows, compareValues, upsertSortItem } from './index';
import { buildColumnLookup } from '../columnLookup';
import type { GridSortItem } from '../../types';

describe('compareValues', () => {
    describe('null handling', () => {
        it('null === null → 0', () => expect(compareValues(null, null, 'asc')).toBe(0));
        it('null sorts last in asc', () => expect(compareValues(null, 1, 'asc')).toBeGreaterThan(0));
        it('null sorts first in desc', () => expect(compareValues(null, 1, 'desc')).toBeLessThan(0));
        it('non-null before null in asc', () => expect(compareValues(1, null, 'asc')).toBeLessThan(0));
    });

    describe('numbers', () => {
        it('asc: smaller first', () => expect(compareValues(1, 2, 'asc')).toBeLessThan(0));
        it('desc: larger first', () => expect(compareValues(2, 1, 'desc')).toBeLessThan(0));
        it('equal numbers → 0', () => expect(compareValues(5, 5, 'asc')).toBe(0));
    });

    describe('dates', () => {
        const d1 = new Date('2023-01-01');
        const d2 = new Date('2024-01-01');
        it('asc: earlier date first', () => expect(compareValues(d1, d2, 'asc')).toBeLessThan(0));
        it('desc: later date first', () => expect(compareValues(d2, d1, 'desc')).toBeLessThan(0));
    });

    describe('strings', () => {
        it('asc: lexicographic order', () => expect(compareValues('apple', 'banana', 'asc')).toBeLessThan(0));
        it('desc: reversed order', () => expect(compareValues('banana', 'apple', 'desc')).toBeLessThan(0));
        it('case-insensitive', () => expect(compareValues('APPLE', 'apple', 'asc')).toBe(0));
    });
});

describe('sortRows', () => {
    const ROWS = [
        { id: 3, name: 'Charlie', age: 35, dept: 'Engineering' },
        { id: 1, name: 'Alice', age: 30, dept: 'Marketing' },
        { id: 4, name: 'Diana', age: 25, dept: 'Engineering' },
        { id: 2, name: 'Bob', age: 30, dept: 'Marketing' },
    ];

    it('returns same reference when sortModel is empty', () => {
        const result = sortRows(ROWS, []);
        expect(result).toBe(ROWS);
    });

    it('does not mutate the original array', () => {
        const original = [...ROWS];
        sortRows(ROWS, [{ field: 'name', sort: 'asc' }]);
        expect(ROWS).toEqual(original);
    });

    it('sorts by single field asc', () => {
        const result = sortRows(ROWS, [{ field: 'name', sort: 'asc' }]);
        expect(result.map(r => r.name)).toEqual(['Alice', 'Bob', 'Charlie', 'Diana']);
    });

    it('sorts by single field desc', () => {
        const result = sortRows(ROWS, [{ field: 'age', sort: 'desc' }]);
        expect(result.map(r => r.age)).toEqual([35, 30, 30, 25]);
    });

    it('applies multi-field sort (age asc, name asc for ties)', () => {
        const result = sortRows(ROWS, [
            { field: 'age', sort: 'asc' },
            { field: 'name', sort: 'asc' },
        ]);
        expect(result.map(r => r.name)).toEqual(['Diana', 'Alice', 'Bob', 'Charlie']);
    });

    it('handles null values — nulls sort last in asc', () => {
        const rowsWithNull = [
            { id: 1, name: 'Alice', age: 30 },
            { id: 2, name: null, age: 25 },
            { id: 3, name: 'Bob', age: 35 },
        ];
        const result = sortRows(rowsWithNull, [{ field: 'name', sort: 'asc' }]);
        expect(result[result.length - 1].name).toBeNull();
    });

    it('handles rows with identical values — stable relative order preserved', () => {
        const rows = [
            { id: 1, score: 10 },
            { id: 2, score: 10 },
            { id: 3, score: 10 },
        ];
        const result = sortRows(rows, [{ field: 'score', sort: 'asc' }]);
        expect(result.map(r => r.id)).toEqual([1, 2, 3]);
    });
});

describe('sortRows with column definitions', () => {
    const values = <T,>(rows: { v: T }[]) => rows.map(r => r.v);

    it('sorts a valueGetter column by the computed value', () => {
        const lookup = buildColumnLookup([{ field: 'fullName', valueGetter: ({ row }) => `${row.first} ${row.last}` }]);
        const rows = [{ id: 1, first: 'Zed', last: 'Young' }, { id: 2, first: 'Amy', last: 'Adams' }];
        expect(sortRows(rows, [{ field: 'fullName', sort: 'asc' }], lookup).map(r => r.id)).toEqual([2, 1]);
        expect(sortRows(rows, [{ field: 'fullName', sort: 'desc' }], lookup).map(r => r.id)).toEqual([1, 2]);
    });

    it('sorts numeric strings in a type:number column numerically, with non-numeric values last', () => {
        const lookup = buildColumnLookup([{ field: 'v', type: 'number' }]);
        const rows = [{ id: 1, v: '100' }, { id: 2, v: '9' }, { id: 3, v: '' }, { id: 4, v: '10' }, { id: 5, v: '-2.5' }];
        expect(values(sortRows(rows, [{ field: 'v', sort: 'asc' }], lookup))).toEqual(['-2.5', '9', '10', '100', '']);
    });

    it('sorts date strings in a type:date column chronologically', () => {
        const lookup = buildColumnLookup([{ field: 'v', type: 'date' }]);
        const rows = [{ id: 1, v: '2024-03-01' }, { id: 2, v: new Date(2023, 11, 31) }, { id: 3, v: 'garbage' }, { id: 4, v: '2024-01-15T10:00:00Z' }];
        expect(sortRows(rows, [{ field: 'v', sort: 'asc' }], lookup).map(r => r.id)).toEqual([2, 4, 1, 3]);
    });
});

describe('comparator consistency', () => {
    const values = <T,>(rows: { v: T }[]) => rows.map(r => r.v);

    it('puts NaN with the empty values instead of leaving the column unsorted', () => {
        const rows = [5, 3, NaN, 4, 1, 2].map((v, id) => ({ id, v }));
        const asc = values(sortRows(rows, [{ field: 'v', sort: 'asc' }]));
        expect(asc.slice(0, 5)).toEqual([1, 2, 3, 4, 5]);
        expect(Number.isNaN(asc[5])).toBe(true);
        expect(Number.isNaN(compareValues(NaN, 1, 'asc'))).toBe(false);
    });

    it('puts an Invalid Date with the empty values', () => {
        const rows = [new Date(2024, 4, 1), new Date('x'), new Date(2024, 0, 1), new Date(2024, 2, 1), new Date(2024, 1, 1)].map((v, id) => ({ id, v }));
        expect(sortRows(rows, [{ field: 'v', sort: 'asc' }]).map(r => r.id)).toEqual([2, 4, 3, 0, 1]);
    });

    it('orders mixed numbers and strings by kind first, independent of input order', () => {
        const input = [10, '1a', 2, 'b'];
        const expected = [2, 10, '1a', 'b'];
        const permutations = [input, [...input].reverse(), ['1a', 2, 'b', 10], ['b', 10, '1a', 2]];
        for (const perm of permutations) {
            const rows = perm.map((v, id) => ({ id, v }));
            expect(values(sortRows(rows, [{ field: 'v', sort: 'asc' }]))).toEqual(expected);
        }
    });

    it('sorts accented strings next to their base letter', () => {
        const rows = ['Zoe', 'Émile', 'Adam', 'Ørsted', 'emma'].map((v, id) => ({ id, v }));
        expect(values(sortRows(rows, [{ field: 'v', sort: 'asc' }]))).toEqual(['Adam', 'Émile', 'emma', 'Ørsted', 'Zoe']);
    });

    it('sorts digit runs inside strings by value', () => {
        const rows = ['item10', 'item9', 'item100'].map((v, id) => ({ id, v }));
        expect(values(sortRows(rows, [{ field: 'v', sort: 'asc' }]))).toEqual(['item9', 'item10', 'item100']);
    });
});

describe('upsertSortItem', () => {
    const model: GridSortItem[] = [{ field: 'a', sort: 'asc' }, { field: 'b', sort: 'asc' }];

    it('changes the direction of an existing key in place, keeping its priority', () => {
        expect(upsertSortItem(model, 'a', 'desc')).toEqual([{ field: 'a', sort: 'desc' }, { field: 'b', sort: 'asc' }]);
    });

    it('appends a new key', () => {
        expect(upsertSortItem(model, 'c', 'asc')).toEqual([...model, { field: 'c', sort: 'asc' }]);
    });

    it('removes only that key when direction is null', () => {
        expect(upsertSortItem(model, 'a', null)).toEqual([{ field: 'b', sort: 'asc' }]);
    });

    it('does not mutate the input', () => {
        upsertSortItem(model, 'a', 'desc');
        expect(model).toEqual([{ field: 'a', sort: 'asc' }, { field: 'b', sort: 'asc' }]);
    });
});

describe('sortComparator', () => {
    const rows = [
        { id: 1, size: 'M' },
        { id: 2, size: 'S' },
        { id: 3, size: null },
        { id: 4, size: 'L' },
    ];
    const order: Record<string, number> = { S: 0, M: 1, L: 2 };
    const bySize = (a: unknown, b: unknown) =>
        (typeof a === 'string' ? order[a] : 99) - (typeof b === 'string' ? order[b] : 99);
    const lookup = (comparator: (a: unknown, b: unknown) => number) =>
        buildColumnLookup([{ field: 'size', sortComparator: comparator }]);
    const ids = (list: { id: number }[]) => list.map(r => r.id);

    it('orders asc by the comparator instead of the built-in comparison', () => {
        expect(ids(sortRows(rows, [{ field: 'size', sort: 'asc' }], lookup(bySize)))).toEqual([2, 1, 4, 3]);
    });

    it('reverses the comparator for desc', () => {
        expect(ids(sortRows(rows, [{ field: 'size', sort: 'desc' }], lookup(bySize)))).toEqual([3, 4, 1, 2]);
    });

    it('passes null values and { id, field, row, value } params to the comparator', () => {
        const seen: unknown[] = [];
        const cols = buildColumnLookup([{
            field: 'size',
            sortComparator: (a, b, p1, p2) => {
                seen.push(a, b);
                expect(p1.value).toBe(a);
                expect(p2.field).toBe('size');
                expect(p1.row.id).toBe(p1.id);
                return bySize(a, b);
            },
        }]);
        sortRows(rows, [{ field: 'size', sort: 'asc' }], cols);
        expect(seen).toContain(null);
    });

    it('receives valueGetter values', () => {
        const seen: unknown[] = [];
        const cols = buildColumnLookup([{
            field: 'n',
            valueGetter: ({ row }) => Number(row.raw) * 10,
            sortComparator: (a, b) => { seen.push(a, b); return Number(b) - Number(a); },
        }]);
        const data = [{ id: 1, raw: 1 }, { id: 2, raw: 3 }];
        expect(ids(sortRows(data, [{ field: 'n', sort: 'asc' }], cols))).toEqual([2, 1]);
        expect(seen.every(v => v === 10 || v === 30)).toBe(true);
    });

    it('chains with other keys in a multi-sort', () => {
        const data = [
            { id: 1, size: 'M', name: 'b' },
            { id: 2, size: 'M', name: 'a' },
            { id: 3, size: 'S', name: 'z' },
        ];
        const cols = buildColumnLookup([{ field: 'size', sortComparator: bySize }, { field: 'name' }]);
        expect(ids(sortRows(data, [{ field: 'size', sort: 'asc' }, { field: 'name', sort: 'asc' }], cols))).toEqual([3, 2, 1]);
        expect(ids(sortRows(data, [{ field: 'name', sort: 'desc' }, { field: 'size', sort: 'asc' }], cols))).toEqual([3, 1, 2]);
    });

    it('uses the row id from getRowId in params', () => {
        const data = [{ id: 0, key: 'a', v: 2 }, { id: 0, key: 'b', v: 1 }];
        const seenIds = new Set<unknown>();
        const cols = buildColumnLookup([{
            field: 'v',
            sortComparator: (a, b, p1, p2) => { seenIds.add(p1.id); seenIds.add(p2.id); return Number(a) - Number(b); },
        }]);
        sortRows(data, [{ field: 'v', sort: 'asc' }], cols, r => r.key);
        expect([...seenIds].sort()).toEqual(['a', 'b']);
    });

    it('contains a throwing comparator (treated as equal, original order kept) and warns once', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const cols = buildColumnLookup([{ field: 'boom', sortComparator: () => { throw new Error('x'); } }]);
        const data = [{ id: 1, boom: 2 }, { id: 2, boom: 1 }, { id: 3, boom: 3 }];
        expect(ids(sortRows(data, [{ field: 'boom', sort: 'asc' }], cols))).toEqual([1, 2, 3]);
        sortRows(data, [{ field: 'boom', sort: 'desc' }], cols);
        expect(warn.mock.calls.filter(c => String(c[0]).includes('"boom"'))).toHaveLength(1);
        warn.mockRestore();
    });

    it('reads a NaN result as equal', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const cols = buildColumnLookup([{ field: 'nan', sortComparator: () => NaN }]);
        const data = [{ id: 1, nan: 2 }, { id: 2, nan: 1 }];
        expect(ids(sortRows(data, [{ field: 'nan', sort: 'asc' }], cols))).toEqual([1, 2]);
        warn.mockRestore();
    });
});
