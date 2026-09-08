import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef } from '../../types';

const COLUMNS: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'dept', headerName: 'Dept', width: 120 },
];

const ROWS = [
    { id: 1, name: 'Alice', dept: 'Eng' },
    { id: 2, name: 'Bob', dept: 'HR' },
];

// ── density ──────────────────────────────────────────────────────────────────

describe('DataGrid — density prop', () => {
    it('renders without throwing for compact density', () => {
        expect(() =>
            render(<DataGrid rows={ROWS} columns={COLUMNS} density="compact" />)
        ).not.toThrow();
    });

    it('renders without throwing for comfortable density', () => {
        expect(() =>
            render(<DataGrid rows={ROWS} columns={COLUMNS} density="comfortable" />)
        ).not.toThrow();
    });

    it('applies compact row height via CSS variable', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLUMNS} density="compact" />
        );
        const root = container.firstElementChild as HTMLElement;
        expect(root.style.getPropertyValue('--ogx-row-height')).toBe('32px');
    });

    it('applies comfortable row height via CSS variable', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLUMNS} density="comfortable" />
        );
        const root = container.firstElementChild as HTMLElement;
        expect(root.style.getPropertyValue('--ogx-row-height')).toBe('72px');
    });

    it('uses rowHeight as default when density is standard', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLUMNS} density="standard" rowHeight={52} />
        );
        const root = container.firstElementChild as HTMLElement;
        expect(root.style.getPropertyValue('--ogx-row-height')).toBe('52px');
    });
});

// ── disableRowSelectionOnClick ────────────────────────────────────────────────

describe('DataGrid — disableRowSelectionOnClick', () => {
    it('clicking a row changes selection when prop is false (default)', () => {
        const onChange = vi.fn();
        render(
            <DataGrid
                rows={ROWS}
                columns={COLUMNS}
                onRowSelectionModelChange={onChange}
            />
        );
        const rows = screen.getAllByRole('row');
        // rows[0] is header, rows[1] is Alice
        fireEvent.click(rows[1]);
        expect(onChange).toHaveBeenCalled();
    });

    it('clicking a row does NOT change selection when disableRowSelectionOnClick=true', () => {
        const onChange = vi.fn();
        render(
            <DataGrid
                rows={ROWS}
                columns={COLUMNS}
                disableRowSelectionOnClick
                onRowSelectionModelChange={onChange}
            />
        );
        const rows = screen.getAllByRole('row');
        fireEvent.click(rows[1]);
        expect(onChange).not.toHaveBeenCalled();
    });
});

// ── disableMultipleRowSelection ───────────────────────────────────────────────

describe('DataGrid — disableMultipleRowSelection', () => {
    it('selecting a second row replaces the first when disableMultipleRowSelection=true', () => {
        const selections: unknown[][] = [];
        render(
            <DataGrid
                rows={ROWS}
                columns={COLUMNS}
                disableMultipleRowSelection
                onRowSelectionModelChange={(model) => selections.push(model)}
            />
        );
        const rows = screen.getAllByRole('row');
        fireEvent.click(rows[1]); // select Alice (id=1)
        fireEvent.click(rows[2]); // select Bob (id=2) — should replace
        expect(selections.at(-1)).toEqual([2]);
        expect(selections.at(-1)?.length).toBe(1);
    });

    it('clicking already-selected row deselects it when disableMultipleRowSelection=true', () => {
        const selections: unknown[][] = [];
        render(
            <DataGrid
                rows={ROWS}
                columns={COLUMNS}
                disableMultipleRowSelection
                onRowSelectionModelChange={(model) => selections.push(model)}
            />
        );
        const rows = screen.getAllByRole('row');
        fireEvent.click(rows[1]); // select
        fireEvent.click(rows[1]); // deselect
        expect(selections.at(-1)).toEqual([]);
    });
});
