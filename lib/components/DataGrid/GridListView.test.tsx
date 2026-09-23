import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridRenderCellParams, GridRowModel, GridSortItem } from '../../types';

const COLS: GridColDef[] = [{ field: 'name', headerName: 'Name' }];
const EMPTY: GridRowModel[] = [];

describe('DataGrid list view rows', () => {
    it('never passes infinite-scroll loading placeholders to renderCell', async () => {
        const seen: unknown[] = [];
        let call = 0;
        const dataSource = {
            getRows: vi.fn(() => {
                call++;
                if (call === 1) return Promise.resolve({ rows: [{ id: 1, name: 'x' }, { id: 2, name: 'y' }] });
                return new Promise<never>(() => {});
            }),
        };
        const listViewColumn = {
            field: 'card',
            renderCell: (p: GridRenderCellParams<GridRowModel>) => { seen.push(p.row.id); return String(p.row.name); },
        };
        const Grid = ({ sortModel }: { sortModel: GridSortItem[] }) => (
            <DataGrid rows={EMPTY} columns={COLS} dataSource={dataSource as never} paginationMode="infinite"
                sortingMode="server" sortModel={sortModel} listView listViewColumn={listViewColumn} />
        );
        const { rerender } = render(<Grid sortModel={[]} />);
        await act(async () => { await new Promise(r => setTimeout(r, 400)); });
        expect(seen).toContain(1);

        // A refetch that keeps the loaded rows on screen while the next request is in flight.
        rerender(<Grid sortModel={[{ field: 'name', sort: 'asc' }]} />);
        await act(async () => { await new Promise(r => setTimeout(r, 400)); });
        expect(dataSource.getRows).toHaveBeenCalledTimes(2);
        expect(seen.filter(id => String(id).startsWith('__skeleton'))).toEqual([]);
    });

    it('passes the cell value, formatted value, column and hierarchy metadata to renderCell', () => {
        const got: GridRenderCellParams<GridRowModel>[] = [];
        const cols: GridColDef[] = [
            { field: 'name', headerName: 'Name', valueFormatter: ({ value }) => String(value).toUpperCase() },
            { field: 'full', valueGetter: ({ row }) => `${String(row.name)}!` },
        ];
        render(
            <DataGrid rows={[{ id: 1, name: 'Alice', path: ['Alice'] }]} columns={cols}
                treeData getTreeDataPath={(r: GridRowModel) => r.path as string[]}
                listView listViewColumn={{ field: 'name', renderCell: (p) => { got.push(p); return null; } }} />
        );
        const params = got[got.length - 1];
        expect(params.value).toBe('Alice');
        expect(params.formattedValue).toBe('ALICE');
        expect(params.colDef.headerName).toBe('Name');
        expect(params.rowMeta?.treeDepth).toBe(0);

        const computed: unknown[] = [];
        render(
            <DataGrid rows={[{ id: 1, name: 'Bob' }]} columns={cols}
                listView listViewColumn={{ field: 'full', renderCell: (p) => { computed.push(p.value); return null; } }} />
        );
        expect(computed[computed.length - 1]).toBe('Bob!');
    });

    it('gives a synthetic list field an undefined value and the list column as colDef', () => {
        let params: GridRenderCellParams<GridRowModel> | null = null;
        render(
            <DataGrid rows={[{ id: 1, name: 'Alice' }]} columns={COLS}
                listView listViewColumn={{ field: 'card', renderCell: (p) => { params = p; return null; } }} />
        );
        expect(params!.value).toBeUndefined();
        expect(params!.formattedValue).toBe('');
        expect(params!.colDef.field).toBe('card');
    });

    it('announces absolute row positions and the total row count', () => {
        const rows: GridRowModel[] = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, name: `n${i + 1}` }));
        const { container } = render(
            <DataGrid rows={rows} columns={COLS} pagination pageSizeOptions={[10]} listView
                listViewColumn={{ field: 'name', renderCell: (p) => String(p.row.name) }}
                initialState={{ pagination: { paginationModel: { page: 1, pageSize: 10 } } }} />
        );
        const list = container.querySelector('.ogx-list-view') as HTMLElement;
        const first = container.querySelector('.ogx-list-view__row') as HTMLElement;
        expect(first.textContent).toBe('n11');
        expect(first.getAttribute('aria-rowindex')).toBe('11');
        expect(list.getAttribute('aria-rowcount')).toBe('20');
    });

    it('counts pinned rows in their own positions', () => {
        const rows: GridRowModel[] = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, name: `n${i + 1}` }));
        const { container } = render(
            <DataGrid rows={rows} columns={COLS} pinnedRows={{ top: [5], bottom: [1] }} listView
                listViewColumn={{ field: 'name', renderCell: (p) => String(p.row.name) }} />
        );
        const indexes = Array.from(container.querySelectorAll('.ogx-list-view__row'))
            .map(r => `${r.textContent}:${r.getAttribute('aria-rowindex')}`);
        expect(indexes).toEqual(['n5:1', 'n2:2', 'n3:3', 'n4:4', 'n1:5']);
    });

    it('summarises the server row count, not the loaded page, under server pagination', async () => {
        const dataSource = {
            getRows: vi.fn(async () => ({ rows: [{ id: 1, name: 'x' }, { id: 2, name: 'y' }], rowCount: 50 })),
        };
        const { container } = render(
            <DataGrid rows={EMPTY} columns={COLS} dataSource={dataSource as never} paginationMode="server" pagination
                listView listViewColumn={{ field: 'name', renderCell: (p) => String(p.row.name) }}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 2 } } }} />
        );
        await act(async () => { await new Promise(r => setTimeout(r, 450)); });
        expect(container.querySelector('.ogx-list-view__toolbar')?.textContent).toBe('50 items · page 1 of 25');
        expect(container.querySelector('.ogx-pagination__page-info')?.textContent).toBe('Page 1 of 25');
        expect(container.querySelector('.ogx-list-view')?.getAttribute('aria-rowcount')).toBe('50');
    });

    it('pages only the unpinned rows, like the grid view', () => {
        const rows: GridRowModel[] = Array.from({ length: 11 }, (_, i) => ({ id: i + 1, name: `n${i + 1}` }));
        const { container } = render(
            <DataGrid rows={rows} columns={COLS} pinnedRows={{ top: [11] }} pagination pageSizeOptions={[10]} listView
                listViewColumn={{ field: 'name', renderCell: (p) => String(p.row.name) }}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }} />
        );
        expect(container.querySelector('.ogx-list-view__toolbar')?.textContent).toBe('11 items · page 1 of 1');
        expect(container.querySelector('.ogx-pagination__page-info')?.textContent).toBe('Page 1 of 1');
    });

    it('shows one page at a time under tree data with pagination', () => {
        const rows = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `r${i + 1}`, path: [`r${i + 1}`] }));
        const { container } = render(
            <DataGrid rows={rows} columns={COLS} treeData getTreeDataPath={(r: GridRowModel) => r.path as string[]}
                listView listViewColumn={{ field: 'name', renderCell: (p) => <span className="lv">{String(p.row.name)}</span> }}
                pagination pageSizeOptions={[10]}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }} />
        );
        const names = () => Array.from(container.querySelectorAll('.lv')).map(e => e.textContent);
        expect(names()).toHaveLength(10);
        expect(names()[0]).toBe('r1');

        fireEvent.click(screen.getByLabelText('Go to next page'));
        expect(names()).toHaveLength(10);
        expect(names()[0]).toBe('r11');
    });
});
