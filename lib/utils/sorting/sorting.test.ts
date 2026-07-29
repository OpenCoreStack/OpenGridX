import { describe, it, expect } from 'vitest';
import { sortRows, compareValues } from './index';

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
