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
import type { GridColDef } from '../../types';
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

        expect(eng['salarysum']).toBe(80000);
        expect(hr['salarysum']).toBe(90000);
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
        expect(gt['salarysum']).toBe(170000);
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

        expect(gt['salaryavg']).toBeCloseTo(correct, 2);
        expect(gt['salaryavg']).not.toBeCloseTo(bugged, 2);
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
        expect(gt['salarymin']).toBe(30000);
    });

    it('grand total max = maximum across ALL raw rows', () => {
        const model: GridPivotModel = {
            ...MODEL_NO_COL_FIELDS,
            valueFields: [{ field: 'salary', aggFn: 'max' }],
        };
        const { result } = renderHook(() => usePivot(ROWS, COLS, model, true));
        const gt = grandTotalRow(result.current.pivotRows);
        expect(gt['salarymax']).toBe(90000);
    });

    it('grand total count = total number of non-null raw values', () => {
        const model: GridPivotModel = {
            ...MODEL_NO_COL_FIELDS,
            valueFields: [{ field: 'salary', aggFn: 'count' }],
        };
        const { result } = renderHook(() => usePivot(ROWS, COLS, model, true));
        const gt = grandTotalRow(result.current.pivotRows);
        // sum of per-group counts = 2 + 1 = 3, which also equals total count here.
        expect(gt['salarycount']).toBe(3);
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
        expect(gt['salaryavg']).toBeCloseTo(correct, 2);
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
