import { describe, it, expect, vi } from 'vitest';
import { filterRows, applyFilterItem, applyQuickFilter, FILTER_OPERATORS, getOperatorsForType } from './index';
import { buildColumnLookup } from '../columnLookup';
import type { GridColDef, GridFilterItem, GridFilterModel, GridRowModel } from '../../types';

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

const ids = (rows: { id: number | string }[]) => rows.map(r => r.id);

describe('date operators', () => {
    const DATE_COLS: GridColDef[] = [{ field: 'd', type: 'date' }];
    const lookup = buildColumnLookup(DATE_COLS);
    const rows = [
        { id: 1, d: '2024-01-10' },
        { id: 2, d: '2024-03-10' },
        { id: 3, d: '2024-06-10' },
        { id: 4, d: null },
    ];
    const run = (operator: GridFilterItem['operator'], value: unknown) =>
        ids(filterRows(rows, { items: [{ field: 'd', operator, value }] }, lookup));

    it('implements every operator the panel offers for a date column', () => {
        const missing = getOperatorsForType('date').filter(op => !(op in FILTER_OPERATORS));
        expect(missing).toEqual([]);
    });

    it('after / onOrAfter / before / onOrBefore compare calendar days', () => {
        expect(run('after', '2024-03-10')).toEqual([3]);
        expect(run('onOrAfter', '2024-03-10')).toEqual([2, 3]);
        expect(run('before', '2024-03-10')).toEqual([1]);
        expect(run('onOrBefore', '2024-03-10')).toEqual([1, 2]);
        expect(run('after', '2024-02-01')).toEqual([2, 3]);
    });

    it('reads a YYYY-MM-DD filter value as a local date, not UTC midnight', () => {
        const local = [{ id: 1, d: new Date(2024, 0, 10, 0, 30) }, { id: 2, d: new Date(2024, 0, 9, 23, 30) }];
        expect(ids(filterRows(local, { items: [{ field: 'd', operator: 'onOrAfter', value: '2024-01-10' }] }, lookup))).toEqual([1]);
    });

    it('"is" matches Date objects, ISO datetimes and plain dates for the same local day', () => {
        const midday = new Date(2024, 0, 10, 12, 0);
        const drows = [
            { id: 1, d: new Date(2024, 0, 10) },
            { id: 2, d: midday.toISOString() },
            { id: 3, d: '2024-01-10' },
            { id: 4, d: midday.getTime() },
            { id: 5, d: '2024-01-11' },
        ];
        expect(ids(filterRows(drows, { items: [{ field: 'd', operator: 'is', value: '2024-01-10' }] }, lookup))).toEqual([1, 2, 3, 4]);
        expect(ids(filterRows(drows, { items: [{ field: 'd', operator: 'not', value: '2024-01-10' }] }, lookup))).toEqual([5]);
    });

    it('"is" on a Date cell works without column definitions', () => {
        expect(applyFilterItem({ id: 1, d: new Date(2024, 0, 10, 9) }, { field: 'd', operator: 'is', value: '2024-01-10' })).toBe(true);
    });

    it('unparsable filter values match nothing for after/before', () => {
        expect(run('after', 'not a date')).toEqual([]);
    });

    it('warns about an unknown operator once per filter pass, not once per row', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const model = { items: [{ field: 'd', operator: 'nope', value: 'x' }] } as unknown as GridFilterModel;
        expect(ids(filterRows(rows, model, lookup))).toEqual([1, 2, 3, 4]);
        expect(warn).toHaveBeenCalledTimes(1);
        warn.mockRestore();
    });
});

describe('items with an empty value do not filter', () => {
    const rows = [{ id: 1, n: -5 }, { id: 2, n: 0 }, { id: 3, n: 7 }, { id: 4, n: null }];
    const run = (item: GridFilterItem) => ids(filterRows(rows, { items: [item] }));

    it.each(['=', '!=', '>', '>=', '<', '<='] as const)('number operator %s with an empty value keeps every row', (operator) => {
        expect(run({ field: 'n', operator, value: '' })).toEqual([1, 2, 3, 4]);
        expect(run({ field: 'n', operator, value: undefined })).toEqual([1, 2, 3, 4]);
        expect(run({ field: 'n', operator, value: '   ' })).toEqual([1, 2, 3, 4]);
    });

    it.each(['contains', 'equals', 'startsWith', 'endsWith', 'is', 'not', 'isAnyOf', 'after', 'before'] as const)('%s with undefined, null or "" keeps every row', (operator) => {
        const srows = [{ id: 1, s: 'a' }, { id: 2, s: null }, { id: 3, s: '' }];
        for (const value of [undefined, null, '', '  ']) {
            expect(ids(filterRows(srows, { items: [{ field: 's', operator, value }] }))).toEqual([1, 2, 3]);
        }
        // An item with no value key at all behaves the same.
        expect(ids(filterRows(srows, { items: [{ field: 's', operator }] }))).toEqual([1, 2, 3]);
    });

    it('isAnyOf with an empty array keeps every row', () => {
        const srows = [{ id: 1, s: 'Active' }, { id: 2, s: 'Inactive' }];
        expect(ids(filterRows(srows, { items: [{ field: 's', operator: 'isAnyOf', value: [] }] }))).toEqual([1, 2]);
    });

    it('isEmpty / isNotEmpty still apply without a value', () => {
        expect(run({ field: 'n', operator: 'isEmpty' })).toEqual([4]);
        expect(run({ field: 'n', operator: 'isNotEmpty' })).toEqual([1, 2, 3]);
    });

    it('an empty item inside an OR group is ignored rather than matching everything', () => {
        const model: GridFilterModel = {
            items: [{ logicOperator: 'or', items: [{ field: 'n', operator: '>', value: '5' }, { field: 'n', operator: '<', value: '' }] }],
        };
        expect(ids(filterRows(rows, model))).toEqual([3]);
    });
});

describe('numeric operators and blank cells', () => {
    it('a blank or whitespace cell is not 0', () => {
        const rows = [{ id: 1, n: '' }, { id: 2, n: 0 }, { id: 3, n: ' ' }, { id: 4, n: 10 }];
        expect(ids(filterRows(rows, { items: [{ field: 'n', operator: '=', value: '0' }] }))).toEqual([2]);
        expect(ids(filterRows(rows, { items: [{ field: 'n', operator: '<', value: '15' }] }))).toEqual([2, 4]);
    });

    it('numeric strings compare as numbers', () => {
        const rows = [{ id: 1, n: '9' }, { id: 2, n: '10' }];
        expect(ids(filterRows(rows, { items: [{ field: 'n', operator: '>', value: 9 }] }))).toEqual([2]);
    });

    it('"!=" treats null, undefined and blank cells the same for every filter value', () => {
        const rows = [{ id: 1, n: -5 }, { id: 2, n: 0 }, { id: 3, n: 7 }, { id: 4, n: null }, { id: 5, n: undefined }, { id: 6, n: '' }];
        expect(ids(filterRows(rows, { items: [{ field: 'n', operator: '!=', value: 0 }] }))).toEqual([1, 3, 4, 5, 6]);
        expect(ids(filterRows(rows, { items: [{ field: 'n', operator: '!=', value: 5 }] }))).toEqual([1, 2, 3, 4, 5, 6]);
    });
});

describe('isAnyOf', () => {
    const rows = [{ id: 1, s: 'Active' }, { id: 2, s: 'Inactive' }, { id: 3, s: 1 }];
    it('treats a scalar value as a one-element list', () => {
        expect(ids(filterRows(rows, { items: [{ field: 's', operator: 'isAnyOf', value: 'active' }] }))).toEqual([1]);
    });
    it('matches numeric option values against their string form', () => {
        expect(ids(filterRows(rows, { items: [{ field: 's', operator: 'isAnyOf', value: ['1', 'Inactive'] }] }))).toEqual([2, 3]);
    });
});

describe('valueGetter columns', () => {
    const cols: GridColDef[] = [
        { field: 'fullName', valueGetter: ({ row }) => `${row.first} ${row.last}` },
        { field: 'first' },
    ];
    const lookup = buildColumnLookup(cols);
    const rows = [{ id: 1, first: 'Zed', last: 'Young' }, { id: 2, first: 'Amy', last: 'Adams' }];

    it('column filters read the computed value', () => {
        expect(ids(filterRows(rows, { items: [{ field: 'fullName', operator: 'contains', value: 'amy a' }] }, lookup))).toEqual([2]);
    });

    it('the quick filter finds the computed text', () => {
        expect(ids(filterRows(rows, { quickFilterValues: ['amy adams'] }, lookup))).toEqual([2]);
    });
});

describe('quick filter with column definitions', () => {
    it('does not match the id or fields that are not columns', () => {
        const lookup = buildColumnLookup([{ field: 'name' }]);
        const rows = [{ id: 11, name: 'Alice', secret: 'zebra' }, { id: 2, name: 'Bob', secret: 'lion' }];
        expect(ids(filterRows(rows, { quickFilterValues: ['1'] }, lookup))).toEqual([]);
        expect(ids(filterRows(rows, { quickFilterValues: ['zebra'] }, lookup))).toEqual([]);
    });

    it('skips hidden and non-filterable columns', () => {
        const cols: GridColDef[] = [{ field: 'name' }, { field: 'secret' }, { field: 'code', filterable: false }];
        const lookup = buildColumnLookup(cols, { secret: false });
        const rows = [{ id: 1, name: 'Carol', secret: 'zebra', code: 'xyz' }];
        expect(ids(filterRows(rows, { quickFilterValues: ['zebra'] }, lookup))).toEqual([]);
        expect(ids(filterRows(rows, { quickFilterValues: ['xyz'] }, lookup))).toEqual([]);
        expect(ids(filterRows(rows, { quickFilterValues: ['carol'] }, lookup))).toEqual([1]);
    });

    it('searches valueFormatter text as well as the raw value', () => {
        const lookup = buildColumnLookup([{ field: 'price', valueFormatter: ({ value }) => `$${Number(value).toLocaleString('en-US')}` }]);
        const rows = [{ id: 1, price: 1200 }, { id: 2, price: 5 }];
        expect(ids(filterRows(rows, { quickFilterValues: ['$1,200'] }, lookup))).toEqual([1]);
        expect(ids(filterRows(rows, { quickFilterValues: ['1200'] }, lookup))).toEqual([1]);
    });

    it('does not match "[object Object]" or Date.toString() text', () => {
        const lookup = buildColumnLookup([{ field: 'name' }, { field: 'meta' }, { field: 'd' }]);
        const rows = [{ id: 1, name: 'Alice', meta: { a: 1 }, d: new Date(2024, 0, 10) }];
        expect(ids(filterRows(rows, { quickFilterValues: ['object'] }, lookup))).toEqual([]);
        expect(ids(filterRows(rows, { quickFilterValues: ['gmt'] }, lookup))).toEqual([]);
        expect(ids(filterRows(rows, { quickFilterValues: ['2024-01-10'] }, lookup))).toEqual([1]);
    });

    it('ignores blank terms and trims whitespace', () => {
        const lookup = buildColumnLookup([{ field: 'name' }]);
        const rows = [{ id: 1, name: 'John' }, { id: 2, name: 'Mary Ann' }];
        expect(ids(filterRows(rows, { quickFilterValues: [' '] }, lookup))).toEqual([1, 2]);
        expect(ids(filterRows(rows, { quickFilterValues: ['john '] }, lookup))).toEqual([1]);
    });

    it('reads each row\'s cells once per column lookup, not once per keystroke', () => {
        const getter = vi.fn(({ row }: { row: GridRowModel }) => row.name);
        const lookup = buildColumnLookup([{ field: 'name', valueGetter: getter }]);
        const rows = [{ id: 1, name: 'John' }, { id: 2, name: 'Mary' }];
        expect(ids(filterRows(rows, { quickFilterValues: ['j'] }, lookup))).toEqual([1]);
        expect(ids(filterRows(rows, { quickFilterValues: ['jo'] }, lookup))).toEqual([1]);
        expect(ids(filterRows(rows, { quickFilterValues: ['mar'] }, lookup))).toEqual([2]);
        expect(getter).toHaveBeenCalledTimes(2);
        // A new row object (an edit) and a new lookup (changed columns) are read again.
        filterRows([{ id: 1, name: 'Joan' }], { quickFilterValues: ['j'] }, lookup);
        filterRows(rows, { quickFilterValues: ['j'] }, buildColumnLookup([{ field: 'name', valueGetter: getter }]));
        expect(getter).toHaveBeenCalledTimes(5);
    });

    it('reads a throwing valueGetter or valueFormatter as no text instead of throwing', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const lookup = buildColumnLookup([
            { field: 'name' },
            { field: 'bad', valueGetter: () => { throw new Error('x'); } },
            { field: 'fmt', valueFormatter: () => { throw new Error('y'); } },
        ]);
        const rows = [{ id: 1, name: 'John', fmt: 'zz' }];
        expect(ids(filterRows(rows, { quickFilterValues: ['john'] }, lookup))).toEqual([1]);
        expect(ids(filterRows(rows, { quickFilterValues: ['zz'] }, lookup))).toEqual([1]);
        vi.restoreAllMocks();
    });
});
