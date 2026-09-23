import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridPaginationModel, GridRowModel } from '../../types';

const COLS: GridColDef[] = [{ field: 'name', headerName: 'Name' }];
const mk = (n: number): GridRowModel[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `r${i + 1}` }));

function bodyRows(container: HTMLElement): string[] {
    return Array.from(container.querySelectorAll('.ogx__row')).map(r => r.textContent ?? '');
}

describe('DataGrid pagination when the rows shrink', () => {
    it('clamps a controlled page past the end, reports it, and Previous goes to the page before it', () => {
        const onPaginationModelChange = vi.fn();
        const Grid = ({ rows }: { rows: GridRowModel[] }) => (
            <DataGrid rows={rows} columns={COLS} pagination pageSizeOptions={[10]}
                paginationModel={{ page: 2, pageSize: 10 }} onPaginationModelChange={onPaginationModelChange} />
        );
        const { container, rerender } = render(<Grid rows={mk(30)} />);
        expect(bodyRows(container)[0]).toBe('r21');

        rerender(<Grid rows={mk(15)} />);
        expect(bodyRows(container)).toEqual(['r11', 'r12', 'r13', 'r14', 'r15']);
        expect(screen.getByText('Page 2 of 2')).toBeTruthy();
        expect(onPaginationModelChange).toHaveBeenCalledTimes(1);
        expect(onPaginationModelChange).toHaveBeenLastCalledWith({ page: 1, pageSize: 10 });

        fireEvent.click(screen.getByLabelText('Go to previous page'));
        expect(onPaginationModelChange).toHaveBeenLastCalledWith({ page: 0, pageSize: 10 });
    });

    it('moves an uncontrolled grid to the last page and navigates from there', () => {
        const Grid = ({ rows }: { rows: GridRowModel[] }) => (
            <DataGrid rows={rows} columns={COLS} pagination pageSizeOptions={[10]}
                initialState={{ pagination: { paginationModel: { page: 2, pageSize: 10 } } }} />
        );
        const { container, rerender } = render(<Grid rows={mk(30)} />);
        rerender(<Grid rows={mk(15)} />);
        expect(bodyRows(container)[0]).toBe('r11');

        fireEvent.click(screen.getByLabelText('Go to previous page'));
        expect(bodyRows(container)[0]).toBe('r1');
        expect(screen.getByText('Page 1 of 2')).toBeTruthy();
    });

    it('keeps a restored page while the rows have not arrived yet', () => {
        const onPaginationModelChange = vi.fn();
        const Grid = ({ rows }: { rows: GridRowModel[] }) => (
            <DataGrid rows={rows} columns={COLS} pagination pageSizeOptions={[10]}
                initialState={{ pagination: { paginationModel: { page: 2, pageSize: 10 } } }}
                onPaginationModelChange={onPaginationModelChange} />
        );
        const { container, rerender } = render(<Grid rows={[]} />);
        rerender(<Grid rows={mk(30)} />);
        expect(onPaginationModelChange).not.toHaveBeenCalled();
        expect(bodyRows(container)[0]).toBe('r21');
    });

    it('reports the correction once even when the consumer ignores it', () => {
        const onPaginationModelChange = vi.fn();
        function Harness() {
            const [tick, setTick] = React.useState(0);
            // A fresh model object every render, and a callback that re-renders the parent.
            const model: GridPaginationModel = { page: 3, pageSize: 10 };
            return (
                <DataGrid rows={mk(15)} columns={COLS} pagination pageSizeOptions={[10]}
                    paginationModel={model}
                    onPaginationModelChange={(m) => { onPaginationModelChange(m); setTick(tick + 1); }} />
            );
        }
        const { container } = render(<Harness />);
        expect(bodyRows(container)[0]).toBe('r11');
        expect(onPaginationModelChange).toHaveBeenCalledTimes(1);
    });
});

describe('DataGrid page-size select', () => {
    it('shows the default page size of 100 when pageSizeOptions does not list it', () => {
        const { container } = render(<DataGrid rows={mk(300)} columns={COLS} pagination pageSizeOptions={[10, 25, 50]} />);
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.value).toBe('100');
        expect(container.querySelector('.ogx-pagination__info')?.textContent).toBe('1–100 of 300');
    });
});
