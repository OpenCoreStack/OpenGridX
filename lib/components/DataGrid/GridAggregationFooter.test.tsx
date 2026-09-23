import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridRowModel } from '../../types';

const COLS: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 100 },
    { field: 'dept', headerName: 'Dept', width: 110 },
    { field: 'age', headerName: 'Age', width: 120, type: 'number' },
    { field: 'salary', headerName: 'Salary', width: 130, type: 'number', valueFormatter: ({ value }) => `$${Number(value).toFixed(0)}` },
];
const ROWS: GridRowModel[] = [
    { id: 1, name: 'a', dept: 'Eng', age: 30, salary: 1000 },
    { id: 2, name: 'b', dept: 'Eng', age: 40, salary: 2000 },
    { id: 3, name: 'c', dept: 'HR', age: 50, salary: 3000 },
];

const headerFields = (c: HTMLElement) =>
    Array.from(c.querySelectorAll('[role="columnheader"][data-field]')).map(h => h.getAttribute('data-field'));
const footerCells = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>('.ogx__aggregation-cell'));
const footerIndexOf = (c: HTMLElement, fn: string) =>
    footerCells(c).findIndex(cell => cell.querySelector('.ogx__aggregation-label')?.textContent === fn);

describe('GridAggregationFooter layout', () => {
    it('renders no cell for a hidden column, so each total stays under its header', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} aggregationModel={{ salary: 'sum' }} columnVisibilityModel={{ dept: false }} />
        );
        const headers = headerFields(container);
        expect(footerCells(container)).toHaveLength(headers.length);
        expect(footerIndexOf(container, 'sum')).toBe(headers.indexOf('salary'));
    });

    it('puts the total of a left-pinned column first, where the body renders that column', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} aggregationModel={{ salary: 'sum' }} pinnedColumns={{ left: ['salary'] }} />
        );
        expect(headerFields(container)[0]).toBe('salary');
        expect(footerIndexOf(container, 'sum')).toBe(0);
    });

    it('puts the total of a right-pinned column last', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} aggregationModel={{ name: 'count' }} pinnedColumns={{ right: ['name'] }} />
        );
        expect(headerFields(container).slice(-1)).toEqual(['name']);
        expect(footerIndexOf(container, 'count')).toBe(footerCells(container).length - 1);
    });
});

describe('GridAggregationFooter values', () => {
    it('formats sum / avg / min / max with the column valueFormatter', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} aggregationModel={{ salary: 'sum' }} />);
        expect(container.querySelector('.ogx__aggregation-value')?.textContent).toBe('$6000');
    });

    it('does not put a count in the column unit', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} aggregationModel={{ salary: 'count' }} />);
        expect(container.querySelector('.ogx__aggregation-value')?.textContent).toBe('3');
    });

    it('falls back to the default format, instead of crashing, when the valueFormatter reads row data', () => {
        const cols: GridColDef[] = [
            { field: 'salary', type: 'number', valueFormatter: ({ value, row }) => `${(row as unknown as { cur: string }).cur.toUpperCase()} ${String(value)}` },
        ];
        const rows: GridRowModel[] = [{ id: 1, salary: 5, cur: 'eur' }, { id: 2, salary: 7000, cur: 'eur' }];
        const { container } = render(<DataGrid rows={rows} columns={cols} aggregationModel={{ salary: 'sum' }} />);
        expect(container.querySelector('.ogx__aggregation-value')?.textContent).toBe('7,005');
    });

    it('gives the valueFormatter the footer totals as its row', () => {
        const cols: GridColDef[] = [
            { field: 'qty', type: 'number' },
            { field: 'amount', type: 'number', valueFormatter: ({ value, row }) => `${String(value)} over ${String(row.qty)} items` },
        ];
        const rows: GridRowModel[] = [{ id: 1, qty: 2, amount: 10 }, { id: 2, qty: 3, amount: 20 }];
        const { container } = render(<DataGrid rows={rows} columns={cols} aggregationModel={{ qty: 'sum', amount: 'sum' }} />);
        const values = Array.from(container.querySelectorAll('.ogx__aggregation-value')).map(v => v.textContent);
        expect(values).toEqual(['5', '30 over 5 items']);
    });

    it('shows date min / max as dates', () => {
        const cols: GridColDef[] = [{ field: 'joined', type: 'date' }];
        const rows: GridRowModel[] = [{ id: 1, joined: new Date(2024, 0, 15) }, { id: 2, joined: new Date(2023, 5, 1) }];
        const { container } = render(<DataGrid rows={rows} columns={cols} aggregationModel={{ joined: 'min' }} />);
        expect(container.querySelector('.ogx__aggregation-value')?.textContent).toBe(new Date(2023, 5, 1).toLocaleDateString());
    });

    it('totals a valueGetter column the way its cells show it', () => {
        const cols: GridColDef[] = [
            { field: 'price', type: 'number' },
            { field: 'qty', type: 'number' },
            { field: 'total', type: 'number', valueGetter: ({ row }) => (row.price as number) * (row.qty as number) },
        ];
        const rows: GridRowModel[] = [{ id: 1, price: 2, qty: 3 }, { id: 2, price: 5, qty: 2 }];
        const { container } = render(<DataGrid rows={rows} columns={cols} aggregationModel={{ total: 'sum' }} />);
        expect(container.querySelector('.ogx__aggregation-value')?.textContent).toBe('16');
    });

    it('ignores blank cells in avg', () => {
        const cols: GridColDef[] = [{ field: 'n', type: 'number', width: 100 }];
        const rows: GridRowModel[] = [{ id: 1, n: 10 }, { id: 2, n: '' }, { id: 3, n: 20 }];
        const { container } = render(<DataGrid rows={rows} columns={cols} aggregationModel={{ n: 'avg' }} />);
        expect(container.querySelector('.ogx__aggregation-value')?.textContent).toBe('15');
    });
});

describe('GridAggregationFooter column rules', () => {
    it('shows no total for an aggregable: false column named in the model', () => {
        const cols: GridColDef[] = [
            { field: 'name', width: 150 },
            { field: 'id', width: 100, type: 'number', aggregable: false },
            { field: 'age', width: 100, type: 'number' },
        ];
        const rows: GridRowModel[] = [{ id: 5, name: 'a', age: 1 }, { id: 7, name: 'b', age: 2 }];
        const { container } = render(<DataGrid rows={rows} columns={cols} aggregationModel={{ id: 'sum', age: 'sum' }} />);
        const cells = footerCells(container);
        expect(cells[1].textContent).toBe('');
        expect(cells[2].textContent).toBe('sum3');
    });
});
