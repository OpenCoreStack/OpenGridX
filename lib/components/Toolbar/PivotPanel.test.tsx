import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { PivotPanel } from './PivotPanel';
import type { GridColDef, GridPivotModel } from '../../types';

const cols: GridColDef[] = [
    { field: 'dept', headerName: 'Dept' },
    { field: 'region', headerName: 'Region' },
    { field: 'salary', headerName: 'Salary', type: 'number' },
];

function setup(model: GridPivotModel, columns: GridColDef[] = cols) {
    const anchor = document.createElement('button');
    document.body.appendChild(anchor);
    const onChange = vi.fn();
    render(<PivotPanel anchorRef={{ current: anchor }} columns={columns} model={model} onChange={onChange} onClose={() => {}} />);
    return onChange;
}

afterEach(() => { vi.restoreAllMocks(); });

const TWO_SALARY_CHIPS: GridPivotModel = {
    rowFields: ['dept'], columnFields: [],
    valueFields: [{ field: 'salary', aggFn: 'sum' }, { field: 'salary', aggFn: 'avg' }],
};

describe('PivotPanel value chips on the same field', () => {
    it('changes the function of only the chip that was edited', () => {
        const onChange = setup(TWO_SALARY_CHIPS);
        fireEvent.change(screen.getAllByTitle('Aggregation function')[1], { target: { value: 'max' } });
        expect(onChange.mock.calls[0][0].valueFields).toEqual([{ field: 'salary', aggFn: 'sum' }, { field: 'salary', aggFn: 'max' }]);
    });

    it('removes only the chip whose remove button was clicked', () => {
        const onChange = setup(TWO_SALARY_CHIPS);
        fireEvent.click(screen.getAllByTitle('Remove Salary')[1]);
        expect(onChange.mock.calls[0][0].valueFields).toEqual([{ field: 'salary', aggFn: 'sum' }]);
    });

    it('renders the chips without a duplicate React key', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        setup(TWO_SALARY_CHIPS);
        expect(error.mock.calls.some(args => String(args[0]).includes('same key'))).toBe(false);
    });
});

describe('PivotPanel accessible names', () => {
    it('names each remove and add button after its field and zone', () => {
        setup({ rowFields: ['dept'], columnFields: [], valueFields: [{ field: 'salary', aggFn: 'sum' }] });
        expect(screen.getByRole('button', { name: 'Remove Dept from Row Fields' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Remove Salary (SUM) from Value Fields' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Add Region to Row Fields' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Add Region to Column Fields' })).toBeTruthy();
        expect(screen.getByRole('combobox', { name: 'Aggregation function for Salary' })).toBeTruthy();
    });
});

describe('PivotPanel column rules', () => {
    const ruled: GridColDef[] = [
        { field: 'id', headerName: 'ID', type: 'number', aggregable: false },
        { field: 'price', headerName: 'Price', type: 'number', availableAggregationFunctions: ['avg', 'max'] },
        { field: 'sku', headerName: 'SKU', groupable: false },
        { field: 'dept', headerName: 'Dept' },
    ];

    it('does not offer an aggregable: false column as a value field', () => {
        setup({ rowFields: [], columnFields: [], valueFields: [] }, ruled);
        expect(screen.queryByRole('button', { name: 'Add ID to Value Fields' })).toBeNull();
        expect(screen.getByRole('button', { name: 'Add Price to Value Fields' })).toBeTruthy();
    });

    it('offers only the allowed functions and adds a value with the first allowed one', () => {
        const onChange = setup({ rowFields: [], columnFields: [], valueFields: [] }, ruled);
        fireEvent.click(screen.getByRole('button', { name: 'Add Price to Value Fields' }));
        expect(onChange.mock.calls[0][0].valueFields).toEqual([{ field: 'price', aggFn: 'avg' }]);
    });

    it('lists only the allowed functions in a value chip', () => {
        setup({ rowFields: [], columnFields: [], valueFields: [{ field: 'price', aggFn: 'avg' }] }, ruled);
        const options = Array.from(screen.getByRole('combobox', { name: 'Aggregation function for Price' }).querySelectorAll('option')).map(o => o.value);
        expect(options).toEqual(['avg', 'max']);
    });

    it('does not offer a groupable: false column as a row or column field', () => {
        setup({ rowFields: [], columnFields: [], valueFields: [] }, ruled);
        expect(screen.queryByRole('button', { name: 'Add SKU to Row Fields' })).toBeNull();
        expect(screen.queryByRole('button', { name: 'Add SKU to Column Fields' })).toBeNull();
        expect(screen.getByRole('button', { name: 'Add Dept to Row Fields' })).toBeTruthy();
    });
});
