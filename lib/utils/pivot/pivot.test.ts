import { describe, it, expect } from 'vitest';
import { computePivot, splitPivotFilterModel, PIVOT_GRAND_TOTAL_ID } from './index';
import type { GridColDef, GridFilterModel, GridPivotModel } from '../../types';

const COLS: GridColDef[] = [
    { field: 'name' },
    { field: 'dept' },
    { field: 'salary', type: 'number' },
];
const ROWS = [
    { id: 1, name: 'a', dept: 'Eng', salary: 1000 },
    { id: 2, name: 'b', dept: 'Eng', salary: 2000 },
    { id: 3, name: 'c', dept: 'HR', salary: 3500 },
    { id: 4, name: 'd', dept: 'Ops', salary: 500 },
];
const MODEL: GridPivotModel = { rowFields: ['dept'], columnFields: [], valueFields: [{ field: 'salary', aggFn: 'sum' }] };
const SUM = 'salary\u001fsum';

describe('splitPivotFilterModel', () => {
    const sourceFields = new Set(COLS.map(c => c.field));

    it('sends conditions on generated value columns to the pivot rows and everything else to the source rows', () => {
        const model: GridFilterModel = {
            items: [
                { field: 'name', operator: 'equals', value: 'a' },
                { field: SUM, operator: '>', value: 100 },
                { field: 'dept', operator: 'equals', value: 'Eng' },
            ],
            quickFilterValues: ['eng'],
        };
        const { source, output } = splitPivotFilterModel(model, sourceFields);
        expect(source.items!.map(i => ('field' in i ? i.field : 'group'))).toEqual(['name', 'dept']);
        expect(source.quickFilterValues).toEqual(['eng']);
        expect(output.items!.map(i => ('field' in i ? i.field : 'group'))).toEqual([SUM]);
        expect(output.quickFilterValues).toBeUndefined();
    });

    it('treats a filter group as a pivot-row condition only when every leaf targets a generated column', () => {
        const model: GridFilterModel = {
            items: [
                { logicOperator: 'or', items: [{ field: SUM, operator: '>', value: 1 }, { field: SUM, operator: '<', value: 0 }] },
                { logicOperator: 'or', items: [{ field: SUM, operator: '>', value: 1 }, { field: 'name', operator: 'equals', value: 'a' }] },
            ],
        };
        const { source, output } = splitPivotFilterModel(model, sourceFields);
        expect(output.items).toHaveLength(1);
        expect(source.items).toHaveLength(1);
    });
});

describe('computePivot options', () => {
    it('sorts the data rows and keeps Grand Total last', () => {
        const { pivotRows } = computePivot(ROWS, COLS, MODEL, { sortModel: [{ field: SUM, sort: 'desc' }] });
        expect(pivotRows.map(r => r.dept)).toEqual(['HR', 'Eng', 'Ops', 'Grand Total']);
        const asc = computePivot(ROWS, COLS, MODEL, { sortModel: [{ field: 'dept', sort: 'asc' }] }).pivotRows;
        expect(asc.map(r => r.dept)).toEqual(['Eng', 'HR', 'Ops', 'Grand Total']);
    });

    it('filters pivot rows on a generated column and totals only the rows kept', () => {
        const { pivotRows } = computePivot(ROWS, COLS, MODEL, {
            outputFilterModel: { items: [{ field: SUM, operator: '>=', value: 1000 }] },
        });
        expect(pivotRows.map(r => r.dept)).toEqual(['Eng', 'HR', 'Grand Total']);
        expect(pivotRows.find(r => r.id === PIVOT_GRAND_TOTAL_ID)![SUM]).toBe(6500);
    });

    it('never filters out the Grand Total row on its own, and drops it when no data row is left', () => {
        const kept = computePivot(ROWS, COLS, MODEL, { outputFilterModel: { items: [{ field: SUM, operator: '<', value: 1000 }] } });
        expect(kept.pivotRows.map(r => r.dept)).toEqual(['Ops', 'Grand Total']);
        const none = computePivot(ROWS, COLS, MODEL, { outputFilterModel: { items: [{ field: SUM, operator: '>', value: 1e9 }] } });
        expect(none.pivotRows).toEqual([]);
    });

    it('recomputes avg over the raw values of the rows kept', () => {
        const model: GridPivotModel = { ...MODEL, valueFields: [{ field: 'salary', aggFn: 'avg' }] };
        const { pivotRows } = computePivot(ROWS, COLS, model, {
            outputFilterModel: { items: [{ field: 'salary\u001favg', operator: '>=', value: 1000 }] },
        });
        // Eng (1000, 2000) and HR (3500) are kept: 6500 / 3, not the average of the averages 1500 and 3500
        expect(pivotRows.find(r => r.id === PIVOT_GRAND_TOTAL_ID)!['salary\u001favg']).toBeCloseTo(6500 / 3, 6);
    });

    it('skips value fields on an aggregable: false column', () => {
        const cols: GridColDef[] = COLS.map(c => (c.field === 'salary' ? { ...c, aggregable: false } : c));
        expect(computePivot(ROWS, cols, MODEL).pivotRows).toEqual([]);
    });
});
