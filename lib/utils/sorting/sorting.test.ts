import { describe, it, expect } from 'vitest';
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
