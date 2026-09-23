/**
 * Tests for usePivot — including regression tests for grand total correctness.
 *
 * Bug (fixed): avg/min/max grand total was computed by re-aggregating
 * per-row pivot values instead of re-computing from the raw source rows.
 * This produced wrong results whenever groups had unequal sizes.
 *
 * Example of the failure:
 *   Group A: avg salary = (30k + 50k) / 2 = 40k
 *   Group B: avg salary = (90k) / 1 = 90k
 *   Summing those per-row averages → 130k / 2 = 65k  ← WRONG
 *   Correct grand avg → (30k + 50k + 90k) / 3 = 56.67k
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePivot } from './usePivot';
import type { GridColDef, GridRowModel } from '../../types';
import type { GridPivotModel } from '../../types';

const COLS: GridColDef[] = [
    { field: 'dept',   headerName: 'Department', width: 120 },
    { field: 'region', headerName: 'Region',     width: 120 },
    { field: 'salary', headerName: 'Salary',     width: 120, type: 'number' },
];

// Intentionally uneven groups so naive "average of averages" gives wrong results.
//
// dept=Eng  → salaries [30000, 50000]  → avg=40000, min=30000, max=50000
// dept=HR   → salaries [90000]         → avg=90000, min=90000, max=90000
//
// Grand total correct:
//   avg = (30000+50000+90000)/3 ≈ 56666.67
//   min = 30000
//   max = 90000
const ROWS = [
    { id: 1, dept: 'Eng', region: 'US', salary: 30000 },
    { id: 2, dept: 'Eng', region: 'US', salary: 50000 },
    { id: 3, dept: 'HR',  region: 'US', salary: 90000 },
];

const MODEL_NO_COL_FIELDS: GridPivotModel = {
    rowFields:    ['dept'],
    columnFields: [],
    valueFields:  [
        { field: 'salary', aggFn: 'sum'   },
        { field: 'salary', aggFn: 'avg'   },
        { field: 'salary', aggFn: 'count' },
        { field: 'salary', aggFn: 'min'   },
        { field: 'salary', aggFn: 'max'   },
    ],
};

function grandTotalRow(pivotRows: ReturnType<typeof usePivot>['pivotRows']) {
    return pivotRows.find(r => r.id === '__pivot_grand_total__')!;
}

// ─────────────────────────────────────────────────────────────────────────────
// Basic functionality
// ─────────────────────────────────────────────────────────────────────────────

describe('usePivot — basic', () => {
    it('returns isValid=false when disabled', () => {
        const { result } = renderHook(() =>
            usePivot(ROWS, COLS, MODEL_NO_COL_FIELDS, false)
        );
        expect(result.current.isValid).toBe(false);
        expect(result.current.pivotRows).toHaveLength(0);
    });

    it('returns isValid=false when valueFields is empty', () => {
        const { result } = renderHook(() =>
            usePivot(ROWS, COLS, { ...MODEL_NO_COL_FIELDS, valueFields: [] }, true)
        );
        expect(result.current.isValid).toBe(false);
    });

    it('produces one pivot row per unique rowField value plus grand total', () => {
        const { result } = renderHook(() =>
            usePivot(ROWS, COLS, MODEL_NO_COL_FIELDS, true)
        );
        // 2 groups (Eng, HR) + 1 grand total
        expect(result.current.pivotRows).toHaveLength(3);
        expect(result.current.isValid).toBe(true);
    });

    it('computes per-group sum correctly', () => {
        const model: GridPivotModel = {
            ...MODEL_NO_COL_FIELDS,
            valueFields: [{ field: 'salary', aggFn: 'sum' }],
        };
        const { result } = renderHook(() => usePivot(ROWS, COLS, model, true));
        const rows = result.current.pivotRows;
        const eng = rows.find(r => r.dept === 'Eng')!;
        const hr  = rows.find(r => r.dept === 'HR')!;

        expect(eng['salary\u001fsum']).toBe(80000);
        expect(hr['salary\u001fsum']).toBe(90000);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Regression: grand total avg/min/max
// ─────────────────────────────────────────────────────────────────────────────

describe('usePivot — grand total regression', () => {
    it('grand total sum = sum of all raw values', () => {
        const model: GridPivotModel = {
            ...MODEL_NO_COL_FIELDS,
            valueFields: [{ field: 'salary', aggFn: 'sum' }],
        };
        const { result } = renderHook(() => usePivot(ROWS, COLS, model, true));
        const gt = grandTotalRow(result.current.pivotRows);
        expect(gt['salary\u001fsum']).toBe(170000);
    });

    it('grand total avg = raw mean, NOT average of per-group averages', () => {
        // The naive bug: (40000 + 90000) / 2 = 65000
        // The correct value: (30000 + 50000 + 90000) / 3 ≈ 56666.67
        const model: GridPivotModel = {
            ...MODEL_NO_COL_FIELDS,
            valueFields: [{ field: 'salary', aggFn: 'avg' }],
        };
        const { result } = renderHook(() => usePivot(ROWS, COLS, model, true));
        const gt = grandTotalRow(result.current.pivotRows);

        const correct = (30000 + 50000 + 90000) / 3;
        const bugged  = (40000 + 90000) / 2;

        expect(gt['salary\u001favg']).toBeCloseTo(correct, 2);
        expect(gt['salary\u001favg']).not.toBeCloseTo(bugged, 2);
    });

    it('grand total min = minimum across ALL raw rows, not minimum of per-group minimums', () => {
        // With equal-size groups the two approaches coincidentally match.
        // This dataset has unequal groups, so we must use raw data.
        const model: GridPivotModel = {
            ...MODEL_NO_COL_FIELDS,
            valueFields: [{ field: 'salary', aggFn: 'min' }],
        };
        const { result } = renderHook(() => usePivot(ROWS, COLS, model, true));
        const gt = grandTotalRow(result.current.pivotRows);
        expect(gt['salary\u001fmin']).toBe(30000);
    });

    it('grand total max = maximum across ALL raw rows', () => {
        const model: GridPivotModel = {
            ...MODEL_NO_COL_FIELDS,
            valueFields: [{ field: 'salary', aggFn: 'max' }],
        };
        const { result } = renderHook(() => usePivot(ROWS, COLS, model, true));
        const gt = grandTotalRow(result.current.pivotRows);
        expect(gt['salary\u001fmax']).toBe(90000);
    });

    it('grand total count = total number of non-null raw values', () => {
        const model: GridPivotModel = {
            ...MODEL_NO_COL_FIELDS,
            valueFields: [{ field: 'salary', aggFn: 'count' }],
        };
        const { result } = renderHook(() => usePivot(ROWS, COLS, model, true));
        const gt = grandTotalRow(result.current.pivotRows);
        // sum of per-group counts = 2 + 1 = 3, which also equals total count here.
        expect(gt['salary\u001fcount']).toBe(3);
    });

    it('grand total avg ignores null salary values', () => {
        const rowsWithNull = [
            ...ROWS,
            { id: 4, dept: 'Eng', region: 'US', salary: null as unknown as number },
        ];
        const model: GridPivotModel = {
            ...MODEL_NO_COL_FIELDS,
            valueFields: [{ field: 'salary', aggFn: 'avg' }],
        };
        const { result } = renderHook(() => usePivot(rowsWithNull, COLS, model, true));
        const gt = grandTotalRow(result.current.pivotRows);

        // null must be excluded: (30000+50000+90000)/3 not /4
        const correct = (30000 + 50000 + 90000) / 3;
        expect(gt['salary\u001favg']).toBeCloseTo(correct, 2);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Pivot with column fields (colKeys drive dynamic column generation)
// ─────────────────────────────────────────────────────────────────────────────

describe('usePivot — with columnFields', () => {
    it('produces one pivot column per unique columnField value × valueField', () => {
        const model: GridPivotModel = {
            rowFields:    ['dept'],
            columnFields: ['region'],
            valueFields:  [{ field: 'salary', aggFn: 'sum' }],
        };
        const { result } = renderHook(() => usePivot(ROWS, COLS, model, true));
        // colKeys = ['US'] → 1 col per valueField = 1 column (+ dept label column)
        expect(result.current.colKeys).toEqual(['US']);
        // Total pivot columns = 1 row-field col + 1 value col
        expect(result.current.pivotColumns).toHaveLength(2);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Shared aggregation semantics (v2.1.1)
// ─────────────────────────────────────────────────────────────────────────────

describe('usePivot — large datasets and shared aggregation semantics', () => {
    // Regression: Math.min(...values) threw RangeError past ~125k values. This checks correctness, not
    // speed, so it gets a generous timeout for a loaded CI machine; the same guarantee is tested on the
    // aggregation functions directly in lib/utils/aggregation/aggregation.test.ts.
    it('computes min / max grand totals over more rows than a spread argument list allows', { timeout: 60_000 }, () => {
        const rows = Array.from({ length: 200_000 }, (_, i) => ({ id: i, dept: i % 2 ? 'Eng' : 'HR', salary: i }));
        const model: GridPivotModel = {
            rowFields: ['dept'],
            columnFields: [],
            valueFields: [{ field: 'salary', aggFn: 'min' }, { field: 'salary', aggFn: 'max' }],
        };
        const { result } = renderHook(() => usePivot(rows, COLS, model, true));
        const gt = grandTotalRow(result.current.pivotRows);
        expect(gt['salary\u001fmin']).toBe(0);
        expect(gt['salary\u001fmax']).toBe(199_999);
    });

    it('counts non-null values of any type, matching the footer and row grouping', () => {
        const rows = [
            { id: 1, dept: 'Eng', region: 'US' },
            { id: 2, dept: 'Eng', region: 'EU' },
            { id: 3, dept: 'Eng', region: null },
        ];
        const model: GridPivotModel = { rowFields: ['dept'], columnFields: [], valueFields: [{ field: 'region', aggFn: 'count' }] };
        const { result } = renderHook(() => usePivot(rows, COLS, model, true));
        const eng = result.current.pivotRows.find(r => r.dept === 'Eng')!;
        expect(eng['region\u001fcount']).toBe(2);
        expect(grandTotalRow(result.current.pivotRows)['region\u001fcount']).toBe(2);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// v3.0 correctness fixes
// ─────────────────────────────────────────────────────────────────────────────

const GT_ID = '__pivot_grand_total__';
const dataRowsOf = (rows: GridRowModel[]) => rows.filter(r => r.id !== GT_ID);

describe('usePivot — value fields', () => {
    it('does not double sum or count when the same field is listed with two functions', () => {
        const rows = [{ id: 1, dept: 'Eng', salary: 10 }, { id: 2, dept: 'Eng', salary: 20 }];
        const model: GridPivotModel = {
            rowFields: ['dept'], columnFields: [],
            valueFields: [{ field: 'salary', aggFn: 'sum' }, { field: 'salary', aggFn: 'count' }],
        };
        const { result } = renderHook(() => usePivot(rows, COLS, model, true));
        const eng = result.current.pivotRows.find(r => r.dept === 'Eng')!;
        expect(eng['salary\u001fsum']).toBe(30);
        expect(eng['salary\u001fcount']).toBe(2);
        expect(grandTotalRow(result.current.pivotRows)['salary\u001fsum']).toBe(30);
    });

    it('aggregates the valueGetter result of a computed column', () => {
        const cols: GridColDef[] = [
            { field: 'dept' },
            { field: 'total', type: 'number', valueGetter: ({ row }) => (row.price as number) * (row.qty as number) },
        ];
        const rows = [{ id: 1, dept: 'A', price: 2, qty: 3 }, { id: 2, dept: 'A', price: 5, qty: 2 }];
        const model: GridPivotModel = { rowFields: ['dept'], columnFields: [], valueFields: [{ field: 'total', aggFn: 'sum' }] };
        const { result } = renderHook(() => usePivot(rows, cols, model, true));
        expect(result.current.pivotRows.find(r => r.dept === 'A')!['total\u001fsum']).toBe(16);
    });

    it('skips a value field whose function the column does not allow', () => {
        const cols: GridColDef[] = [
            { field: 'dept' },
            { field: 'price', type: 'number', availableAggregationFunctions: ['avg'] },
        ];
        const rows = [{ id: 1, dept: 'A', price: 2 }];
        const model: GridPivotModel = {
            rowFields: ['dept'], columnFields: [],
            valueFields: [{ field: 'price', aggFn: 'sum' }, { field: 'price', aggFn: 'avg' }],
        };
        const { result } = renderHook(() => usePivot(rows, cols, model, true));
        expect(result.current.pivotColumns.map(c => c.field)).toEqual(['dept', 'price\u001favg']);
    });

    it('skips a row or column field on a groupable: false column, as row grouping does', () => {
        const cols: GridColDef[] = [
            { field: 'dept' },
            { field: 'sku', groupable: false },
            { field: 'salary', type: 'number' },
        ];
        const rows = [{ id: 1, dept: 'A', sku: 'x', salary: 1 }, { id: 2, dept: 'A', sku: 'y', salary: 2 }];
        const model: GridPivotModel = { rowFields: ['dept', 'sku'], columnFields: ['sku'], valueFields: [{ field: 'salary', aggFn: 'sum' }] };
        const { result } = renderHook(() => usePivot(rows, cols, model, true));
        expect(result.current.pivotColumns.map(c => c.field)).toEqual(['dept', 'salary\u001fsum']);
        expect(dataRowsOf(result.current.pivotRows)).toHaveLength(1);
    });
});

describe('usePivot — formatting', () => {
    const cols: GridColDef[] = [
        { field: 'dept' },
        { field: 'salary', type: 'number', valueFormatter: ({ value }) => `$${Number(value).toFixed(2)}` },
    ];
    const rows = [
        { id: 1, dept: 'Eng', salary: 10, currency: { symbol: '$' } },
        { id: 2, dept: 'Eng', salary: 15, currency: { symbol: '$' } },
    ];
    const model: GridPivotModel = {
        rowFields: ['dept'], columnFields: [],
        valueFields: [{ field: 'salary', aggFn: 'sum' }, { field: 'salary', aggFn: 'avg' }, { field: 'salary', aggFn: 'count' }],
    };

    it('formats sum and avg with the source valueFormatter, on data rows and on Grand Total', () => {
        const { result } = renderHook(() => usePivot(rows, cols, model, true));
        const eng = result.current.pivotRows.find(r => r.dept === 'Eng')!;
        const col = (f: string) => result.current.pivotColumns.find(c => c.field === f)!;
        expect(col('salary\u001fsum').valueFormatter!({ value: eng['salary\u001fsum'], row: eng, field: 'salary\u001fsum' })).toBe('$25.00');
        expect(col('salary\u001favg').valueFormatter!({ value: eng['salary\u001favg'], row: eng, field: 'salary\u001favg' })).toBe('$12.50');
        const gt = grandTotalRow(result.current.pivotRows);
        expect(col('salary\u001fsum').valueFormatter!({ value: gt['salary\u001fsum'], row: gt, field: 'salary\u001fsum' })).toBe('$25.00');
    });

    it('gives the source valueFormatter the pivot row, the record of aggregated values, as its row', () => {
        const seen: unknown[] = [];
        const spyCols: GridColDef[] = [{ field: 'dept' }, { field: 'salary', valueFormatter: ({ value, row }) => { seen.push(row); return String(value); } }];
        const { result } = renderHook(() => usePivot(rows, spyCols, { ...model, valueFields: [{ field: 'salary', aggFn: 'sum' }] }, true));
        const eng = result.current.pivotRows.find(r => r.dept === 'Eng')!;
        result.current.pivotColumns[1].valueFormatter!({ value: 25, row: eng, field: 'salary\u001fsum' });
        expect(seen).toEqual([eng]);
    });

    it('returns min / max of a date field as dates', () => {
        const early = new Date(2020, 1, 1);
        const late = new Date(2022, 1, 1);
        const dateRows = [{ id: 1, dept: 'Eng', joined: late }, { id: 2, dept: 'Eng', joined: early }];
        const dateCols: GridColDef[] = [{ field: 'dept' }, { field: 'joined', type: 'date' }];
        const { result } = renderHook(() => usePivot(dateRows, dateCols, {
            rowFields: ['dept'], columnFields: [], valueFields: [{ field: 'joined', aggFn: 'min' }, { field: 'joined', aggFn: 'max' }],
        }, true));
        const [eng] = result.current.pivotRows;
        expect(eng['joined\u001fmin']).toBe(early);
        expect(grandTotalRow(result.current.pivotRows)['joined\u001fmax']).toBe(late);
        const minCol = result.current.pivotColumns.find(c => c.field === 'joined\u001fmin')!;
        expect(minCol.valueFormatter!({ value: early, row: eng, field: minCol.field })).toBe(early.toLocaleDateString());
    });

    it('does not apply the source valueFormatter to count', () => {
        const { result } = renderHook(() => usePivot(rows, cols, model, true));
        const eng = result.current.pivotRows.find(r => r.dept === 'Eng')!;
        const col = result.current.pivotColumns.find(c => c.field === 'salary\u001fcount')!;
        expect(col.valueFormatter!({ value: eng['salary\u001fcount'], row: eng, field: col.field })).toBe('2');
    });

    it('falls back to the default format instead of throwing when the formatter needs row data a pivot row does not have', () => {
        const rowReading: GridColDef[] = [
            { field: 'dept' },
            { field: 'salary', valueFormatter: ({ value, row }) => `${(row as unknown as { currency: { symbol: string } }).currency.symbol}${String(value)}` },
        ];
        const { result } = renderHook(() => usePivot(rows, rowReading, model, true));
        const eng = result.current.pivotRows.find(r => r.dept === 'Eng')!;
        const col = result.current.pivotColumns.find(c => c.field === 'salary\u001fsum')!;
        expect(col.valueFormatter!({ value: 1234, row: eng, field: col.field })).toBe('1,234');
    });

    it('formats avg with thousands separators when the column has no formatter', () => {
        const { result } = renderHook(() => usePivot(ROWS, COLS, MODEL_NO_COL_FIELDS, true));
        const col = result.current.pivotColumns.find(c => c.field === 'salary\u001favg')!;
        expect(col.valueFormatter!({ value: 56666.666, row: {} as GridRowModel, field: col.field })).toBe('56,666.67');
    });

    it('keeps the source column formatter, type and alignment on row-label columns, and still shows Grand Total', () => {
        const labelCols: GridColDef[] = [
            { field: 'status', headerName: 'Status', type: 'singleSelect', align: 'center', valueFormatter: ({ value }) => (value === 1 ? 'Active' : 'Inactive') },
            { field: 'salary', type: 'number' },
        ];
        const labelRows = [{ id: 1, status: 1, salary: 10 }, { id: 2, status: 0, salary: 5 }];
        const labelModel: GridPivotModel = { rowFields: ['status'], columnFields: [], valueFields: [{ field: 'salary', aggFn: 'sum' }] };
        const { result } = renderHook(() => usePivot(labelRows, labelCols, labelModel, true));
        const statusCol = result.current.pivotColumns.find(c => c.field === 'status')!;
        expect(statusCol).toMatchObject({ type: 'singleSelect', align: 'center', headerName: 'Status' });
        const [active] = result.current.pivotRows;
        const gt = grandTotalRow(result.current.pivotRows);
        expect(statusCol.valueFormatter!({ value: active.status, row: active, field: 'status' })).toBe('Active');
        expect(statusCol.valueFormatter!({ value: gt.status, row: gt, field: 'status' })).toBe('Grand Total');
    });

    it('formats column-field header labels with the source valueFormatter', () => {
        const flagCols: GridColDef[] = [
            { field: 'dept' },
            { field: 'active', headerName: 'Active', type: 'boolean', valueFormatter: ({ value }) => (value ? 'Yes' : 'No') },
            { field: 'salary', headerName: 'Salary', type: 'number' },
        ];
        const flagRows = [{ id: 1, dept: 'Eng', active: true, salary: 1 }, { id: 2, dept: 'Eng', active: false, salary: 2 }];
        const flagModel: GridPivotModel = { rowFields: ['dept'], columnFields: ['active'], valueFields: [{ field: 'salary', aggFn: 'sum' }] };
        const { result } = renderHook(() => usePivot(flagRows, flagCols, flagModel, true));
        const headers = result.current.pivotColumns.slice(1).map(c => c.headerName);
        expect(headers).toEqual(['Active: No — Salary (sum)', 'Active: Yes — Salary (sum)']);
    });
});

describe('usePivot — keys, ids and ordering', () => {
    it('orders numeric column-field values numerically', () => {
        const rows = [1, 2, 3, 10, 11, 12].map((m, i) => ({ id: i, dept: 'Eng', month: m, salary: 1 }));
        const model: GridPivotModel = { rowFields: ['dept'], columnFields: ['month'], valueFields: [{ field: 'salary', aggFn: 'sum' }] };
        const { result } = renderHook(() => usePivot(rows, COLS, model, true));
        expect(result.current.colKeys).toEqual(['1', '2', '3', '10', '11', '12']);
    });

    it('orders numeric strings naturally and puts blank values last', () => {
        const rows = ['10', '9', null, '100'].map((q, i) => ({ id: i, dept: 'Eng', q, salary: 1 }));
        const model: GridPivotModel = { rowFields: ['dept'], columnFields: ['q'], valueFields: [{ field: 'salary', aggFn: 'sum' }] };
        const { result } = renderHook(() => usePivot(rows, COLS, model, true));
        expect(result.current.colKeys).toEqual(['9', '10', '100', '']);
    });

    it('puts null, undefined and empty-string row values in one blank group labelled null', () => {
        const rows = [{ id: 1, dept: '', salary: 1 }, { id: 2, dept: null, salary: 2 }, { id: 3, salary: 4 }];
        const model: GridPivotModel = { rowFields: ['dept'], columnFields: [], valueFields: [{ field: 'salary', aggFn: 'sum' }] };
        const { result } = renderHook(() => usePivot(rows, COLS, model, true));
        const data = dataRowsOf(result.current.pivotRows);
        expect(data).toHaveLength(1);
        expect(data[0].dept).toBeNull();
        expect(data[0]['salary\u001fsum']).toBe(7);
    });

    it('keeps unique synthetic ids when a row field is named id, and still shows its label', () => {
        const cols: GridColDef[] = [{ field: 'id' }, { field: 'salary', type: 'number' }];
        const rows = [{ id: 'x', salary: 1 }, { id: 'y', salary: 2 }];
        const model: GridPivotModel = { rowFields: ['id'], columnFields: [], valueFields: [{ field: 'salary', aggFn: 'sum' }] };
        const { result } = renderHook(() => usePivot(rows, cols, model, true));
        expect(result.current.pivotRows.map(r => r.id)).toEqual(['__pivot_row__:["x"]', '__pivot_row__:["y"]', GT_ID]);
        const idCol = result.current.pivotColumns.find(c => c.field === 'id')!;
        const labels = result.current.pivotRows.map(r => idCol.valueGetter!({ row: r, field: 'id', value: r.id }));
        expect(labels).toEqual(['x', 'y', 'Grand Total']);
    });
});

describe('usePivot — empty data', () => {
    it('keeps the value columns and produces no rows (not a lone Grand Total) when there is no data', () => {
        const model: GridPivotModel = { rowFields: ['dept'], columnFields: [], valueFields: [{ field: 'salary', aggFn: 'sum' }] };
        const { result } = renderHook(() => usePivot([], COLS, model, true));
        expect(result.current.pivotColumns.map(c => c.field)).toEqual(['dept', 'salary\u001fsum']);
        expect(result.current.pivotRows).toEqual([]);
        expect(result.current.isValid).toBe(true);
    });
});
