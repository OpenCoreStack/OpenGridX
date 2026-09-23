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
