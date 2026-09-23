import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridRowModel } from '../../types';

// Aggregates on in-grid group rows are formatted like the footer and exports: the column
// valueFormatter for sum / avg / min / max, never for count / unique, and dates as dates.

const ROWS: GridRowModel[] = [
    { id: 1, dept: 'Eng', salary: 1000, joined: new Date(2021, 2, 1) },
    { id: 2, dept: 'Eng', salary: 2000, joined: new Date(2019, 6, 15) },
    { id: 3, dept: 'HR', salary: 3000, joined: new Date(2020, 0, 10) },
];
const money = ({ value }: { value: unknown }) => `$${Number(value).toFixed(2)}`;
const COLS: GridColDef[] = [
    { field: 'dept', headerName: 'Dept' },
    { field: 'salary', headerName: 'Salary', type: 'number', valueFormatter: money },
    { field: 'joined', headerName: 'Joined', type: 'date' },
];

const groupRow = (c: HTMLElement) => c.querySelector('.ogx__rows [role="row"]')!;
const cellText = (row: Element, field: string) => row.querySelector(`[role="gridcell"][data-field="${field}"]`)?.textContent;

describe('aggregates on group rows', () => {
    it('formats a sum with the column valueFormatter', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} rowGroupingModel={['dept']} aggregationModel={{ salary: 'sum' }} />);
        expect(cellText(groupRow(container), 'salary')).toBe('$3000.00');
    });

    it('shows a count as a plain number, not in the column unit', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} rowGroupingModel={['dept']} aggregationModel={{ salary: 'count' }} />);
        expect(cellText(groupRow(container), 'salary')).toBe('2');
    });

    it('shows the earliest date of a group as a date', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} rowGroupingModel={['dept']} aggregationModel={{ joined: 'min' }} />);
        expect(cellText(groupRow(container), 'joined')).toBe(new Date(2019, 6, 15).toLocaleDateString());
    });

    it('falls back to the default format when the formatter needs row data a group row does not have', () => {
        const cols: GridColDef[] = [
            COLS[0],
            { field: 'salary', type: 'number', valueFormatter: ({ value, row }) => `${(row as unknown as { cur: { s: string } }).cur.s}${String(value)}` },
        ];
        const rows = ROWS.map(r => ({ ...r, cur: { s: '€' } }));
        const { container } = render(<DataGrid rows={rows} columns={cols} rowGroupingModel={['dept']} aggregationModel={{ salary: 'sum' }} />);
        expect(cellText(groupRow(container), 'salary')).toBe('3,000');
        fireEvent.click(groupRow(container));
        const leaf = container.querySelectorAll('.ogx__rows [role="row"]')[1];
        expect(cellText(leaf, 'salary')).toBe('€1000');
    });

    it('keeps formatting leaf rows with the column valueFormatter', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} rowGroupingModel={['dept']} aggregationModel={{ salary: 'count' }} />);
        fireEvent.click(groupRow(container));
        const leaf = container.querySelectorAll('.ogx__rows [role="row"]')[1];
        expect(cellText(leaf, 'salary')).toBe('$1000.00');
    });
});
