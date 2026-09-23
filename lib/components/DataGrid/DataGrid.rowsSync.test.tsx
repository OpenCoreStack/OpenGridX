import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridRowModel } from '../../types';

afterEach(() => { cleanup(); });

describe('DataGrid: rows and columns change in the same render', () => {
    it('evaluates new columns only against the new rows when both props change together', () => {
        const seen: GridRowModel[] = [];
        const colsA: GridColDef[] = [{ field: 'a', valueGetter: ({ row }) => (row as unknown as { a: { x: number } }).a.x }];
        const colsB: GridColDef[] = [{
            field: 'b',
            valueGetter: ({ row }) => { seen.push(row); return (row as unknown as { b: { y: number } }).b.y; },
        }];
        const rowsA: GridRowModel[] = [{ id: 1, a: { x: 1 } }];
        const rowsB: GridRowModel[] = [{ id: 1, b: { y: 2 } }];
        const { rerender } = render(<DataGrid rows={rowsA} columns={colsA} />);
        const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
        try {
            rerender(<DataGrid rows={rowsB} columns={colsB} />);
        } finally {
            errors.mockRestore();
        }
        expect(seen.every(row => 'b' in row)).toBe(true);
        expect(screen.getByRole('gridcell', { name: '2' })).toBeTruthy();
    });

    it('renders the source columns against the source rows when pivot mode is switched off', () => {
        const seen: GridRowModel[] = [];
        const cols: GridColDef[] = [
            { field: 'region' },
            { field: 'owner', valueGetter: ({ row }) => { seen.push(row); return (row as unknown as { owner: { name: string } }).owner.name; } },
            { field: 'amount', type: 'number' },
        ];
        const rows: GridRowModel[] = [
            { id: 1, region: 'N', owner: { name: 'x' }, amount: 1 },
            { id: 2, region: 'S', owner: { name: 'y' }, amount: 2 },
        ];
        const model = { rowFields: ['region'], columnFields: [], valueFields: [{ field: 'amount', aggFn: 'sum' as const }] };
        const { rerender } = render(<DataGrid rows={rows} columns={cols} pivotMode pivotModel={model} />);
        const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
        try {
            rerender(<DataGrid rows={rows} columns={cols} pivotMode={false} pivotModel={model} />);
        } finally {
            errors.mockRestore();
        }
        expect(seen.every(row => rows.includes(row))).toBe(true);
        expect(screen.getByRole('gridcell', { name: 'x' })).toBeTruthy();
        expect(screen.getByRole('gridcell', { name: 'y' })).toBeTruthy();
    });

    it('shows replaced rows without an extra commit', () => {
        const cols: GridColDef[] = [{ field: 'name' }];
        const { rerender, container } = render(<DataGrid rows={[{ id: 1, name: 'one' }]} columns={cols} />);
        rerender(<DataGrid rows={[{ id: 2, name: 'two' }]} columns={cols} />);
        expect(container.textContent).toContain('two');
        expect(container.textContent).not.toContain('one');
    });
});
