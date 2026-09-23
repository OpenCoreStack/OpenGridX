import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { DataGrid } from '../../components/DataGrid/DataGrid';
import type { GridState } from '../../state/types';
import type { GridColDef, GridRowModel } from '../../types';

const COLS: GridColDef[] = [{ field: 'name', headerName: 'Name', width: 150 }];
const ROWS: GridRowModel[] = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 3, name: 'c' }];

const lastState = (fn: { mock: { lastCall?: unknown[] } }) => fn.mock.lastCall![0] as GridState;

describe('onStateChange', () => {
    it('does not loop when the parent stores the state and passes inline model props', () => {
        let renders = 0;
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        function Parent() {
            renders++;
            const [, setSaved] = useState<GridState | null>(null);
            // Guard so a regression fails the assertion instead of hanging the run.
            const onStateChange = (s: GridState) => { if (renders < 50) setSaved(s); };
            return (
                <DataGrid rows={ROWS} columns={COLS}
                    filterModel={{ items: [] }}
                    sortModel={[]}
                    paginationModel={{ page: 0, pageSize: 10 }}
                    onStateChange={onStateChange} />
            );
        }
        render(<Parent />);
        errorSpy.mockRestore();
        expect(renders).toBeLessThan(5);
    });

    it('does not fire for a parent re-render that changes nothing', () => {
        const onStateChange = vi.fn();
        const Wrap = () => <DataGrid rows={ROWS} columns={COLS} paginationModel={{ page: 0, pageSize: 10 }} onStateChange={onStateChange} />;
        const { rerender } = render(<Wrap />);
        const calls = onStateChange.mock.calls.length;
        rerender(<Wrap />);
        rerender(<Wrap />);
        expect(onStateChange.mock.calls.length).toBe(calls);
    });

    it('still fires when the state actually changes', () => {
        const onStateChange = vi.fn();
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} onStateChange={onStateChange} />);
        const calls = onStateChange.mock.calls.length;
        fireEvent.click(container.querySelector('[role="columnheader"]') as HTMLElement);
        expect(onStateChange.mock.calls.length).toBe(calls + 1);
        const last = lastState(onStateChange);
        expect(last.sorting?.sortModel).toEqual([{ field: 'name', sort: 'asc' }]);
    });

    it('includes density, from the prop or from initialState', () => {
        const fromProp = vi.fn();
        render(<DataGrid rows={ROWS} columns={COLS} density="compact" onStateChange={fromProp} />);
        expect(lastState(fromProp).density).toEqual({ density: 'compact' });

        const fromInitial = vi.fn();
        render(<DataGrid rows={ROWS} columns={COLS} initialState={{ density: { density: 'comfortable' } }} onStateChange={fromInitial} />);
        expect(lastState(fromInitial).density).toEqual({ density: 'comfortable' });
    });

    it('keeps the synthetic grouping column out of columnOrder and pinnedColumns', () => {
        const rows: GridRowModel[] = [{ id: 1, team: 'x', name: 'a' }];
        const cols: GridColDef[] = [{ field: 'team', width: 100 }, { field: 'name', width: 100 }];
        const onStateChange = vi.fn();
        render(<DataGrid rows={rows} columns={cols} rowGroupingModel={['team']} groupingColDef={{ field: 'group', headerName: 'G' }} onStateChange={onStateChange} />);
        const columns = lastState(onStateChange).columns!;
        expect(columns.columnOrder).toEqual(['team', 'name']);
        expect(columns.pinnedColumns).toEqual({});
        expect(JSON.stringify(columns)).not.toContain('__group__');
    });
});

describe('initialState.density', () => {
    it('sets the row height when no density prop is given', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} initialState={{ density: { density: 'compact' } }} />);
        expect((container.firstChild as HTMLElement).style.getPropertyValue('--ogx-row-height')).toBe('32px');
    });

    it('loses to the density prop', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} density="comfortable" initialState={{ density: { density: 'compact' } }} />);
        expect((container.firstChild as HTMLElement).style.getPropertyValue('--ogx-row-height')).toBe('72px');
    });
});
