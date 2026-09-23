import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridDataSource, GridPaginationModel, GridRowModel } from '../../types';

const COLS: GridColDef[] = [{ field: 'name', headerName: 'Name', width: 150 }];
const mk = (n: number, offset = 0): GridRowModel[] =>
    Array.from({ length: n }, (_, i) => ({ id: i + 1 + offset, name: `r${i + 1 + offset}` }));

const names = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('.ogx__row:not(.ogx__row--skeleton)'))
        .map(r => r.querySelector('[role="gridcell"]')?.textContent ?? '');
const pagerText = (container: HTMLElement) => container.querySelector('.ogx-pagination')?.textContent ?? '';
const waitForFetch = () => act(async () => { await new Promise(r => setTimeout(r, 400)); });

describe('client pagination row count', () => {
    it('counts the rows that pass the filter', () => {
        const { container } = render(
            <DataGrid rows={mk(30)} columns={COLS} pagination pageSizeOptions={[10]}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                filterModel={{ items: [{ field: 'name', operator: 'equals', value: 'r5' }] }} />
        );
        expect(names(container)).toEqual(['r5']);
        expect(pagerText(container)).toContain('1–1 of 1');
        expect(pagerText(container)).toContain('Page 1 of 1');
    });

    it('does not count pinned rows, which show on every page', () => {
        const { container } = render(
            <DataGrid rows={mk(11)} columns={COLS} pagination pageSizeOptions={[10]} pinnedRows={{ top: [1] }}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }} />
        );
        expect(pagerText(container)).toContain('1–10 of 10');
        expect(pagerText(container)).toContain('Page 1 of 1');
    });
});

describe('default page size', () => {
    it('is the first option when pageSizeOptions does not offer 100', () => {
        const { container } = render(<DataGrid rows={mk(30)} columns={COLS} pagination pageSizeOptions={[5, 10, 20]} />);
        const select = container.querySelector('.ogx-pagination select') as HTMLSelectElement;
        expect(select.value).toBe('5');
        expect(names(container)).toHaveLength(5);
        expect(pagerText(container)).toContain('1–5 of 30');
    });

    it('stays 100 when it is offered', () => {
        const { container } = render(<DataGrid rows={mk(30)} columns={COLS} pagination />);
        expect((container.querySelector('.ogx-pagination select') as HTMLSelectElement).value).toBe('100');
    });
});

describe('server pagination without a dataSource (rows fetched by the consumer)', () => {
    it('uses the rowCount prop, follows its changes, and does not re-slice the page', () => {
        const Wrap = ({ page, rows, rowCount }: { page: number; rows: GridRowModel[]; rowCount: number }) => (
            <DataGrid rows={rows} columns={COLS} pagination paginationMode="server" rowCount={rowCount}
                pageSizeOptions={[10]} paginationModel={{ page, pageSize: 10 }} />
        );
        const { container, rerender } = render(<Wrap page={0} rows={mk(10)} rowCount={1000} />);
        expect(pagerText(container)).toContain('1–10 of 1000');
        expect(pagerText(container)).toContain('Page 1 of 100');

        rerender(<Wrap page={1} rows={mk(10, 10)} rowCount={1000} />);
        expect(names(container)[0]).toBe('r11');
        expect(names(container)).toHaveLength(10);

        rerender(<Wrap page={1} rows={mk(10, 10)} rowCount={500} />);
        expect(pagerText(container)).toContain('of 500');
    });

    it('does not re-sort or re-filter rows in server sorting and filtering modes', () => {
        const rows: GridRowModel[] = [{ id: 1, name: 'b' }, { id: 2, name: 'a' }];
        const { container } = render(
            <DataGrid rows={rows} columns={COLS} sortingMode="server" filterMode="server"
                sortModel={[{ field: 'name', sort: 'asc' }]}
                filterModel={{ items: [{ field: 'name', operator: 'equals', value: 'zzz' }] }} />
        );
        expect(names(container)).toEqual(['b', 'a']);
    });
});

describe('dataSource', () => {
    it('keeps the fetched rows and total when the parent re-renders with an inline rows={[]}', async () => {
        const ds: GridDataSource = { getRows: vi.fn(async () => ({ rows: mk(5), rowCount: 50 })) };
        const controls = { bump: () => {} };
        function Parent() {
            const [n, setN] = useState(0);
            useEffect(() => { controls.bump = () => setN(x => x + 1); });
            return (
                <div data-n={n}>
                    <DataGrid rows={[]} columns={COLS} dataSource={ds} pagination paginationMode="server" pageSizeOptions={[5]}
                        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }} />
                </div>
            );
        }
        const { container } = render(<Parent />);
        await waitForFetch();
        expect(names(container)).toHaveLength(5);
        expect(pagerText(container)).toContain('of 50');
        await act(async () => { controls.bump(); });
        expect(names(container)).toHaveLength(5);
        expect(pagerText(container)).toContain('1–5 of 50');
    });

    it('passes the server total to slots.footer', async () => {
        const ds: GridDataSource = { getRows: async () => ({ rows: mk(2), rowCount: 500 }) };
        const EMPTY: GridRowModel[] = [];
        const PM: GridPaginationModel = { page: 0, pageSize: 2 };
        const Footer = vi.fn((_props: Record<string, unknown>) => <div>footer</div>);
        render(<DataGrid rows={EMPTY} columns={COLS} dataSource={ds} pagination paginationMode="server" paginationModel={PM} slots={{ footer: Footer }} />);
        await waitForFetch();
        expect(Footer.mock.lastCall![0].rowCount).toBe(500);
    });

    it('list view pages with the server total', async () => {
        const ds: GridDataSource = { getRows: async () => ({ rows: mk(2), rowCount: 40 }) };
        const EMPTY: GridRowModel[] = [];
        const PM: GridPaginationModel = { page: 0, pageSize: 2 };
        const { container } = render(
            <DataGrid rows={EMPTY} columns={COLS} dataSource={ds} pagination paginationMode="server" paginationModel={PM}
                listView listViewColumn={{ field: 'name', renderCell: ({ row }) => String(row.name) }} />
        );
        await waitForFetch();
        expect(pagerText(container)).toContain('1–2 of 40');
    });
});
