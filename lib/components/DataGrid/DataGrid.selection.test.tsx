import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import React from 'react';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridRowModel, GridApi, GridRowId } from '../../types';

afterEach(() => { cleanup(); });

const COLS: GridColDef[] = [{ field: 'a' }];

describe('DataGrid selection when rows are removed', () => {
    it('drops the ids of removed rows from an uncontrolled selection', () => {
        const apiRef = { current: null as unknown as GridApi };
        const onSel = vi.fn();
        const grid = (rows: GridRowModel[]) => (
            <DataGrid apiRef={apiRef as React.MutableRefObject<GridApi>} rows={rows} columns={COLS} checkboxSelection onRowSelectionModelChange={onSel} />
        );
        const { rerender } = render(grid([{ id: 1, a: 'one' }, { id: 2, a: 'two' }]));
        fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
        expect(onSel).toHaveBeenLastCalledWith([1]);

        act(() => { rerender(grid([{ id: 2, a: 'two' }])); });
        expect(apiRef.current.getSelectedRows()).toEqual([]);
        expect(onSel).toHaveBeenLastCalledWith([]);

        fireEvent.click(screen.getByRole('checkbox', { name: 'Select row 2' }));
        expect(onSel).toHaveBeenLastCalledWith([2]);
        expect(apiRef.current.getSelectedRows()).toEqual([2]);

        // The removed row coming back does not bring its old selection with it.
        act(() => { rerender(grid([{ id: 1, a: 'one' }, { id: 2, a: 'two' }])); });
        expect(apiRef.current.getSelectedRows()).toEqual([2]);
    });

    it('reports a pruned controlled model through onRowSelectionModelChange and ignores stale ids', () => {
        const apiRef = { current: null as unknown as GridApi };
        const onSel = vi.fn();
        render(
            <DataGrid
                apiRef={apiRef as React.MutableRefObject<GridApi>}
                rows={[{ id: 2, a: 'two' }]}
                columns={COLS}
                checkboxSelection
                rowSelectionModel={[1, 2]}
                onRowSelectionModelChange={onSel}
            />,
        );
        expect(apiRef.current.getSelectedRows()).toEqual([2]);
        expect(onSel).toHaveBeenLastCalledWith([2]);
    });

    it('keeps ids of rows that are not loaded when the server owns pagination', () => {
        const onSel = vi.fn();
        const grid = (rows: GridRowModel[]) => (
            <DataGrid
                rows={rows}
                columns={COLS}
                checkboxSelection
                pagination
                paginationMode="server"
                rowCount={4}
                rowSelectionModel={[1]}
                onRowSelectionModelChange={onSel}
            />
        );
        const { rerender } = render(grid([{ id: 1, a: 'one' }, { id: 2, a: 'two' }]));
        rerender(grid([{ id: 3, a: 'three' }, { id: 4, a: 'four' }]));
        expect(onSel).not.toHaveBeenCalled();
    });
});

describe('DataGrid selection in pivot mode', () => {
    type S = { id: number; region: string; q: string; revenue: number };
    const SRC: S[] = [
        { id: 0, region: 'N', q: 'Q1', revenue: 1 },
        { id: 1, region: 'N', q: 'Q2', revenue: 2 },
        { id: 2, region: 'S', q: 'Q1', revenue: 3 },
    ];
    const SCOLS: GridColDef<S>[] = [{ field: 'region' }, { field: 'q' }, { field: 'revenue', type: 'number' }];
    const PIVOT = { rowFields: ['region'], columnFields: ['q'], valueFields: [{ field: 'revenue', aggFn: 'sum' as const }] };

    it('does not highlight a pivot row whose position matches a selected source row id', () => {
        const onSel = vi.fn();
        const { container } = render(
            <DataGrid<S> rows={SRC} columns={SCOLS} checkboxSelection rowSelectionModel={[0, 1]} onRowSelectionModelChange={onSel} pivotMode pivotModel={PIVOT} />,
        );
        expect(container.querySelectorAll('.ogx__row--selected')).toHaveLength(0);
        // Entering pivot mode does not discard the source selection.
        expect(onSel).not.toHaveBeenCalled();
    });

    it('gives pivot rows ids that cannot collide with source row ids', () => {
        const onSel = vi.fn();
        render(<DataGrid<S> rows={SRC} columns={SCOLS} checkboxSelection onRowSelectionModelChange={onSel} pivotMode pivotModel={PIVOT} />);
        fireEvent.click(screen.getByRole('checkbox', { name: /select all rows/i }));
        const ids = onSel.mock.calls[onSel.mock.calls.length - 1][0] as GridRowId[];
        expect(ids).toHaveLength(2);
        for (const id of ids) expect(SRC.some(r => r.id === id)).toBe(false);
    });
});
