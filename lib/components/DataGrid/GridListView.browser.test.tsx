import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import '../../styles/opengridx.css';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridRowModel } from '../../types';

afterEach(() => { cleanup(); });

const COLS: GridColDef[] = [{ field: 'name', width: 150 }];
const ROWS: GridRowModel[] = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, name: `r${i}` }));

describe('DataGrid list view scrolling', () => {
    it('fires onRowsScrollEnd when the list is scrolled to the bottom', async () => {
        const onRowsScrollEnd = vi.fn();
        const { container } = render(
            <div style={{ height: 300, width: 600, display: 'flex', flexDirection: 'column' }}>
                <DataGrid rows={ROWS} columns={COLS} height={300} listView onRowsScrollEnd={onRowsScrollEnd}
                    listViewColumn={{ field: 'name', renderCell: (p) => <div style={{ height: 40 }}>{String(p.row.name)}</div> }} />
            </div>
        );
        const list = container.querySelector<HTMLElement>('.ogx-list-view__rows')!;
        expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);

        await act(async () => {
            list.scrollTop = 50;
            await new Promise(r => setTimeout(r, 50));
        });
        expect(onRowsScrollEnd).not.toHaveBeenCalled();

        await act(async () => {
            list.scrollTop = list.scrollHeight;
            await new Promise(r => setTimeout(r, 50));
        });
        expect(onRowsScrollEnd).toHaveBeenCalled();
        const params = onRowsScrollEnd.mock.calls[onRowsScrollEnd.mock.calls.length - 1][0];
        expect(params.viewportHeight).toBe(list.clientHeight);
        expect(params.visibleBottom).toBe(list.scrollTop + list.clientHeight);
    });
});
