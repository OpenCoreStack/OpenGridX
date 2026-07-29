import { describe, it, expect } from 'vitest';
import { filterRows, applyFilterItem, applyQuickFilter, FILTER_OPERATORS } from './index';
import type { GridFilterItem } from '../../types';

const ROWS = [
    { id: 1, name: 'Alice', age: 30, active: true, department: 'Engineering' },
    { id: 2, name: 'Bob', age: 25, active: false, department: 'Marketing' },
    { id: 3, name: 'Charlie', age: 35, active: true, department: 'Engineering' },
    { id: 4, name: 'Diana', age: null, active: false, department: null },
    { id: 5, name: 'Eve', age: 28, active: true, department: 'Marketing' },
];

describe('FILTER_OPERATORS', () => {
    describe('contains', () => {
        it('matches substring case-insensitively', () => {
            expect(FILTER_OPERATORS.contains('Alice', 'ali')).toBe(true);
            expect(FILTER_OPERATORS.contains('Alice', 'Bob')).toBe(false);
        });
        it('returns false for null values', () => {
            expect(FILTER_OPERATORS.contains(null, 'x')).toBe(false);
            expect(FILTER_OPERATORS.contains('x', null)).toBe(false);
        });
    });

    describe('equals', () => {
        it('matches case-insensitively', () => {
            expect(FILTER_OPERATORS.equals('Alice', 'alice')).toBe(true);
            expect(FILTER_OPERATORS.equals('Alice', 'Bob')).toBe(false);
        });
        it('returns true for both null', () => {
            expect(FILTER_OPERATORS.equals(null, null)).toBe(true);
        });
    });

    describe('startsWith / endsWith', () => {
        it('startsWith matches prefix', () => {
            expect(FILTER_OPERATORS.startsWith('Alice', 'Ali')).toBe(true);
            expect(FILTER_OPERATORS.startsWith('Alice', 'ice')).toBe(false);
        });
        it('endsWith matches suffix', () => {
            expect(FILTER_OPERATORS.endsWith('Alice', 'ice')).toBe(true);
            expect(FILTER_OPERATORS.endsWith('Alice', 'Ali')).toBe(false);
        });
    });

    describe('isEmpty / isNotEmpty', () => {
        it('isEmpty detects null, undefined, empty string, whitespace', () => {
            expect(FILTER_OPERATORS.isEmpty(null)).toBe(true);
            expect(FILTER_OPERATORS.isEmpty(undefined)).toBe(true);
            expect(FILTER_OPERATORS.isEmpty('')).toBe(true);
            expect(FILTER_OPERATORS.isEmpty('  ')).toBe(true);
            expect(FILTER_OPERATORS.isEmpty('x')).toBe(false);
        });
        it('isNotEmpty is the inverse', () => {
            expect(FILTER_OPERATORS.isNotEmpty('x')).toBe(true);
            expect(FILTER_OPERATORS.isNotEmpty(null)).toBe(false);
        });
    });

    describe('numeric comparisons', () => {
        it('> returns true when value exceeds filter', () => {
            expect(FILTER_OPERATORS['>'](30, 25)).toBe(true);
            expect(FILTER_OPERATORS['>'](25, 30)).toBe(false);
        });
        it('>= includes equality', () => {
            expect(FILTER_OPERATORS['>='](30, 30)).toBe(true);
        });
        it('< and <= work symmetrically', () => {
            expect(FILTER_OPERATORS['<'](20, 30)).toBe(true);
            expect(FILTER_OPERATORS['<='](30, 30)).toBe(true);
        });
        it('returns false for non-numeric values', () => {
            expect(FILTER_OPERATORS['>'](NaN, 10)).toBe(false);
            expect(FILTER_OPERATORS['>'](10, NaN)).toBe(false);
        });
    });

    describe('isAnyOf', () => {
        it('matches any value in the array', () => {
            expect(FILTER_OPERATORS.isAnyOf('Engineering', ['Engineering', 'Finance'])).toBe(true);
            expect(FILTER_OPERATORS.isAnyOf('HR', ['Engineering', 'Finance'])).toBe(false);
        });
        it('returns false for non-array filterValue', () => {
            expect(FILTER_OPERATORS.isAnyOf('x', null as unknown as [])).toBe(false);
        });
    });
});

describe('applyFilterItem', () => {
    it('returns true for matching field/operator/value', () => {
        const row = { id: 1, name: 'Alice', age: 30 };
        expect(applyFilterItem(row, { field: 'name', operator: 'contains', value: 'ali' })).toBe(true);
    });

    it('returns false for non-matching', () => {
        const row = { id: 1, name: 'Alice', age: 30 };
        expect(applyFilterItem(row, { field: 'name', operator: 'contains', value: 'bob' })).toBe(false);
    });

    it('returns true and warns for unknown operator', () => {
        const row = { id: 1, name: 'Alice' };
        // Unknown operator → falls through to true (lenient)
        expect(applyFilterItem(row, { field: 'name', operator: 'unknownOp', value: 'x' } as unknown as GridFilterItem)).toBe(true);
    });
});

describe('applyQuickFilter', () => {
    it('returns true when empty quickFilterValues', () => {
        expect(applyQuickFilter({ id: 1, name: 'Alice' }, [])).toBe(true);
    });
    it('matches all terms (AND logic)', () => {
        const row = { id: 1, name: 'Alice', department: 'Engineering' };
        expect(applyQuickFilter(row, ['alice', 'eng'])).toBe(true);
        expect(applyQuickFilter(row, ['alice', 'marketing'])).toBe(false);
    });
    it('ignores null field values', () => {
        expect(applyQuickFilter({ id: 1, name: null }, ['x'])).toBe(false);
    });
});

describe('filterRows', () => {
    it('returns all rows when filterModel is empty', () => {
        const result = filterRows(ROWS, { items: [] });
        expect(result).toHaveLength(ROWS.length);
    });

    it('filters by single contains item', () => {
        const result = filterRows(ROWS, {
            items: [{ field: 'name', operator: 'contains', value: 'a' }],
        });
        // Alice, Charlie, Diana
        expect(result.map(r => r.name)).toEqual(expect.arrayContaining(['Alice', 'Charlie', 'Diana']));
        expect(result).toHaveLength(3);
    });

    it('applies AND logic across multiple items', () => {
        const result = filterRows(ROWS, {
            items: [
                { field: 'department', operator: 'equals', value: 'Engineering' },
                { field: 'age', operator: '>', value: 30 },
            ],
            logicOperator: 'and',
        });
        expect(result.map(r => r.name)).toEqual(['Charlie']);
    });

    it('applies OR logic across multiple items', () => {
        const result = filterRows(ROWS, {
            items: [
                { field: 'name', operator: 'equals', value: 'Alice' },
                { field: 'name', operator: 'equals', value: 'Eve' },
            ],
            logicOperator: 'or',
        });
        expect(result.map(r => r.name)).toEqual(expect.arrayContaining(['Alice', 'Eve']));
        expect(result).toHaveLength(2);
    });

    it('applies quickFilterValues (global search)', () => {
        const result = filterRows(ROWS, {
            items: [],
            quickFilterValues: ['engineering'],
        });
        expect(result.map(r => r.name)).toEqual(expect.arrayContaining(['Alice', 'Charlie']));
    });

    it('handles null field values without throwing', () => {
        const result = filterRows(ROWS, {
            items: [{ field: 'department', operator: 'isEmpty' }],
        });
        expect(result.map(r => r.name)).toEqual(['Diana']);
    });

    it('returns same reference when no filter items and no quickfilter', () => {
        const result = filterRows(ROWS, { items: [], quickFilterValues: [] });
        expect(result).toBe(ROWS);
    });
});
