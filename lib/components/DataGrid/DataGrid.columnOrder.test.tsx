import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef } from '../../types';

const COLS: GridColDef[] = [
    { field: 'name', headerName: 'Name' },
    { field: 'age', headerName: 'Age', type: 'number' },
];
const ROWS = [{ id: 1, name: 'Ann', age: 30 }];

const headerFields = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('[role="columnheader"][data-field]')).map(h => h.getAttribute('data-field'));
const cellFields = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('[role="row"][data-rowindex="0"] [role="gridcell"][data-field]')).map(c => c.getAttribute('data-field'));

describe('column order with disableColumnReorder', () => {
    it('applies a controlled columnOrder to headers and cells', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} disableColumnReorder columnOrder={['age', 'name']} />);
        expect(headerFields(container)).toEqual(['age', 'name']);
        expect(cellFields(container)).toEqual(['age', 'name']);
    });

    it('applies initialState.columns.columnOrder', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} disableColumnReorder initialState={{ columns: { columnOrder: ['age', 'name'] } }} />
        );
        expect(headerFields(container)).toEqual(['age', 'name']);
    });

    it('makes headers non-draggable', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} disableColumnReorder columnOrder={['age', 'name']} />);
        const draggable = Array.from(container.querySelectorAll('[role="columnheader"][data-field]')).map(h => h.getAttribute('draggable'));
        expect(draggable).not.toContain('true');
    });
});
