import { describe, it, expect, vi } from 'vitest';
import { render, act, waitFor, fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridDataSource, GridRowModel } from '../../types';

// Footer totals when a dataSource drives the rows: the grid then holds only the rows the server
// returned, so totals must come from the server, and must survive unrelated parent re-renders.

const COLS: GridColDef[] = [{ field: 'salary', type: 'number', width: 100 }];
const footerValue = (c: HTMLElement) => c.querySelector('.ogx__aggregation-value')?.textContent;
const bodyCellCount = (c: HTMLElement) => c.querySelectorAll('.ogx__rows [role="gridcell"][data-field="salary"]').length;

describe('server-driven footer totals', () => {
    it('uses the server total in infinite-scroll mode instead of summing the loaded page', async () => {
        const dataSource: GridDataSource<GridRowModel> = {
            getRows: async ({ startRow, endRow }) => ({
                rows: Array.from({ length: endRow - startRow }, (_, i) => ({ id: startRow + i, salary: 1 })),
                rowCount: 1000,
                aggregationResults: { salary: 1000 },
            }),
        };
        const { container } = render(
            <DataGrid rows={[]} columns={COLS} dataSource={dataSource} paginationMode="infinite"
                paginationModel={{ page: 0, pageSize: 50 }} aggregationModel={{ salary: 'sum' }} />
        );
        await waitFor(() => expect(bodyCellCount(container)).toBeGreaterThan(0), { timeout: 3000 });
        expect(footerValue(container)).toBe('1,000');
    });

    it('uses the server total when only filtering is done on the server', async () => {
        const dataSource: GridDataSource<GridRowModel> = {
            getRows: async () => ({ rows: [{ id: 1, salary: 5 }], rowCount: 400, aggregationResults: { salary: 2000 } }),
        };
        const { container } = render(
            <DataGrid rows={[]} columns={COLS} dataSource={dataSource} filterMode="server" aggregationModel={{ salary: 'sum' }} />
        );
        await waitFor(() => expect(bodyCellCount(container)).toBeGreaterThan(0), { timeout: 3000 });
        expect(footerValue(container)).toBe('2,000');
    });

    it('keeps getRows totals and does not refetch when the parent re-renders with an inline aggregationModel', async () => {
        const getRows = vi.fn(async () => ({ rows: [{ id: 1, salary: 5 }], rowCount: 100, aggregationResults: { salary: 777 } }));
        const dataSource: GridDataSource<GridRowModel> = { getRows };
        function Parent() {
            const [n, setN] = useState(0);
            return (
                <div data-n={n}>
                    <button onClick={() => setN(x => x + 1)}>re-render</button>
                    <DataGrid rows={[]} columns={COLS} dataSource={dataSource} paginationMode="server" pagination
                        aggregationModel={{ salary: 'sum' }} />
                </div>
            );
        }
        const { container } = render(<Parent />);
        await waitFor(() => expect(footerValue(container)).toBe('777'), { timeout: 3000 });
        const calls = getRows.mock.calls.length;

        fireEvent.click(screen.getByText('re-render'));
        expect(container.querySelector('[data-n="1"]')).not.toBeNull();
        expect(footerValue(container)).toBe('777');
        await act(async () => { await new Promise(r => setTimeout(r, 400)); });
        expect(getRows.mock.calls.length).toBe(calls);
        expect(footerValue(container)).toBe('777');
    });

    it('marks the footer busy while a getAggregations request is pending', async () => {
        let resolve: (v: Record<string, unknown>) => void = () => {};
        const dataSource: GridDataSource<GridRowModel> = {
            getRows: async () => ({ rows: [{ id: 1, salary: 5 }], rowCount: 100 }),
            getAggregations: () => new Promise(r => { resolve = r; }),
        };
        const { container } = render(
            <DataGrid rows={[]} columns={COLS} dataSource={dataSource} paginationMode="server" pagination aggregationModel={{ salary: 'sum' }} />
        );
        const footer = () => container.querySelector('.ogx__aggregation-footer')!;
        await waitFor(() => expect(footer().getAttribute('aria-busy')).toBe('true'));
        expect(footerValue(container)).toBe('—');
        await act(async () => { resolve({ salary: 42 }); });
        expect(footer().hasAttribute('aria-busy')).toBe(false);
        expect(footerValue(container)).toBe('42');
    });
});
