import { describe, it, expect, vi } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { DataGrid } from '../../components/DataGrid/DataGrid';
import { nextSelectionForClick, nextSelectionForRows } from './useGridRowSelection';
import type { GridColDef, GridDataSource, GridRowId, GridRowModel } from '../../types';

const COLS: GridColDef[] = [{ field: 'name', headerName: 'Name', width: 150 }];
const mk = (n: number): GridRowModel[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `r${i + 1}` }));

const headerCheckbox = (container: HTMLElement) =>
    container.querySelector('input[aria-label="Select all rows"], input[aria-label="Deselect all rows"]') as HTMLInputElement | null;
const rowCheckboxes = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('.ogx__row input[type="checkbox"]')) as HTMLInputElement[];

describe('selection transitions', () => {
    it('adds and removes ids, and keeps only the last id in single mode', () => {
        expect(nextSelectionForRows(new Set([1]), [2], true, false)).toEqual([1, 2]);
        expect(nextSelectionForRows(new Set([1, 2]), [1], false, false)).toEqual([2]);
        expect(nextSelectionForRows(new Set([1]), [2, 3], true, true)).toEqual([3]);
        expect(nextSelectionForRows(new Set([1]), [1], false, true)).toEqual([]);
    });

    it('a click toggles, and replaces the selection in single mode', () => {
        expect(nextSelectionForClick(new Set([1]), 2, false)).toEqual([1, 2]);
        expect(nextSelectionForClick(new Set([1, 2]), 2, false)).toEqual([1]);
        expect(nextSelectionForClick(new Set([1]), 2, true)).toEqual([2]);
        expect(nextSelectionForClick(new Set([2]), 2, true)).toEqual([]);
    });
});

describe('header select-all', () => {
    it('selects only the rows that pass the filter', () => {
        const onSel = vi.fn();
        const { container } = render(<DataGrid rows={mk(3)} columns={COLS} checkboxSelection onRowSelectionModelChange={onSel}
            filterModel={{ items: [{ field: 'name', operator: 'equals', value: 'r1' }] }} />);
        fireEvent.click(headerCheckbox(container)!);
        expect(onSel).toHaveBeenLastCalledWith([1]);
    });

    it('deselect-all keeps the selection of rows hidden by the filter', () => {
        const onSel = vi.fn();
        function Parent() {
            const [sel, setSel] = useState<GridRowId[]>([2]);
            return <DataGrid rows={mk(3)} columns={COLS} checkboxSelection rowSelectionModel={sel}
                onRowSelectionModelChange={(m) => { onSel(m); setSel(m); }}
                filterModel={{ items: [{ field: 'name', operator: 'equals', value: 'r1' }] }} />;
        }
        const { container } = render(<Parent />);
        fireEvent.click(headerCheckbox(container)!);
        expect(onSel).toHaveBeenLastCalledWith([2, 1]);
        expect(headerCheckbox(container)!.checked).toBe(true);
        fireEvent.click(headerCheckbox(container)!);
        expect(onSel).toHaveBeenLastCalledWith([2]);
    });

    it('stays checked when the selection holds ids of rows that were removed', () => {
        const Wrap = ({ rows }: { rows: GridRowModel[] }) => <DataGrid rows={rows} columns={COLS} checkboxSelection />;
        const { container, rerender } = render(<Wrap rows={mk(3)} />);
        fireEvent.click(headerCheckbox(container)!);
        expect(headerCheckbox(container)!.checked).toBe(true);
        rerender(<Wrap rows={mk(2)} />);
        expect(headerCheckbox(container)!.checked).toBe(true);
        expect(headerCheckbox(container)!.indeterminate).toBe(false);
    });

    it('is indeterminate when only some rows are selected', () => {
        const { container } = render(<DataGrid rows={mk(3)} columns={COLS} checkboxSelection rowSelectionModel={[1]} />);
        expect(headerCheckbox(container)!.checked).toBe(false);
        expect(headerCheckbox(container)!.indeterminate).toBe(true);
    });

    it('does not count synthetic group-row ids as selected data rows', () => {
        const rows: GridRowModel[] = [{ id: 1, team: 'A', name: 'a' }, { id: 2, team: 'B', name: 'b' }];
        const { container } = render(
            <DataGrid rows={rows} columns={[{ field: 'team' }, { field: 'name' }]} checkboxSelection rowGroupingModel={['team']}
                rowSelectionModel={['auto-group-team-A-root', 'auto-group-team-B-root']} />
        );
        expect(headerCheckbox(container)!.checked).toBe(false);
        expect(headerCheckbox(container)!.getAttribute('aria-label')).toBe('Select all rows');
    });

    it('can be undone when a dataSource supplies the rows', async () => {
        const ds: GridDataSource = { getRows: async () => ({ rows: mk(3), rowCount: 3 }) };
        const onSel = vi.fn();
        const EMPTY: GridRowModel[] = [];
        const { container } = render(<DataGrid rows={EMPTY} columns={COLS} dataSource={ds} paginationMode="server" checkboxSelection onRowSelectionModelChange={onSel} />);
        await act(async () => { await new Promise(r => setTimeout(r, 400)); });
        fireEvent.click(headerCheckbox(container)!);
        expect(onSel).toHaveBeenLastCalledWith([1, 2, 3]);
        expect(headerCheckbox(container)!.checked).toBe(true);
        fireEvent.click(headerCheckbox(container)!);
        expect(onSel).toHaveBeenLastCalledWith([]);
    });
});

describe('disableMultipleRowSelection', () => {
    it('row checkboxes keep a single selected row', () => {
        const onSel = vi.fn();
        function Parent() {
            const [sel, setSel] = useState<GridRowId[]>([]);
            return <DataGrid rows={mk(3)} columns={COLS} checkboxSelection disableMultipleRowSelection
                rowSelectionModel={sel} onRowSelectionModelChange={(m) => { onSel(m); setSel(m); }} />;
        }
        const { container } = render(<Parent />);
        fireEvent.click(rowCheckboxes(container)[0]);
        fireEvent.click(rowCheckboxes(container)[1]);
        expect(onSel).toHaveBeenLastCalledWith([2]);
        fireEvent.click(rowCheckboxes(container)[1]);
        expect(onSel).toHaveBeenLastCalledWith([]);
    });

    it('has no select-all checkbox', () => {
        const { container } = render(<DataGrid rows={mk(3)} columns={COLS} checkboxSelection disableMultipleRowSelection />);
        expect(headerCheckbox(container)).toBeNull();
    });

    it('Space on the checkbox column keeps a single selected row', () => {
        const onSel = vi.fn();
        const { container } = render(<DataGrid rows={mk(3)} columns={COLS} checkboxSelection disableMultipleRowSelection
            disableRowSelectionOnClick rowSelectionModel={[1]} onRowSelectionModelChange={onSel} />);
        const grid = container.querySelector('[role="grid"]') as HTMLElement;
        const secondRowNameCell = container.querySelectorAll('.ogx__row')[1].querySelector('[role="gridcell"][data-field="name"]') as HTMLElement;
        fireEvent.click(secondRowNameCell);
        expect(onSel).not.toHaveBeenCalled();
        fireEvent.keyDown(grid, { key: 'ArrowLeft' });
        fireEvent.keyDown(grid, { key: ' ' });
        expect(onSel).toHaveBeenLastCalledWith([2]);
    });
});
