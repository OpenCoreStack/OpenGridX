import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import '../../styles/opengridx.css';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridRowModel, GridRowOrderChangeParams, GridColumnOrderChangeParams } from '../../types';

// Real HTML5 drag and drop: the drag token must be readable from dataTransfer.types during dragover.

const COLS: GridColDef[] = [
    { field: 'name', width: 150 },
    { field: 'age', width: 100 },
    { field: 'city', width: 150 },
];
const ROWS: GridRowModel[] = Array.from({ length: 5 }, (_, i) => ({ id: i, name: `row${i}`, age: i, city: `c${i}` }));

describe('drag reorder in a real browser', () => {
    it('dragging a row handle onto another row reports indices in rows', async () => {
        const onRowOrderChange = vi.fn<(p: GridRowOrderChangeParams) => void>();
        const { container } = render(
            <div style={{ width: 600, height: 400 }}>
                <DataGrid rows={ROWS} columns={COLS} rowReordering onRowOrderChange={onRowOrderChange} />
            </div>
        );
        const rows = container.querySelectorAll<HTMLElement>('.ogx__rows .ogx__row');
        await userEvent.dragAndDrop(rows[0].querySelector('.ogx__cell--drag-handle') as HTMLElement, rows[3]);
        expect(onRowOrderChange).toHaveBeenCalledWith({ row: ROWS[0], oldIndex: 0, targetIndex: 3 });
        expect(container.querySelector('.ogx__row--dragging')).toBeNull();
    });

    it('dragging a header onto another header reorders the columns', async () => {
        const onColumnOrderChange = vi.fn<(p: GridColumnOrderChangeParams) => void>();
        const { container } = render(
            <div style={{ width: 600, height: 400 }}>
                <DataGrid rows={ROWS} columns={COLS} onColumnOrderChange={onColumnOrderChange} />
            </div>
        );
        const header = (field: string) => container.querySelector(`.ogx__header [data-field="${field}"]`) as HTMLElement;
        await userEvent.dragAndDrop(header('city'), header('name'), { sourcePosition: { x: 40, y: 20 }, targetPosition: { x: 40, y: 20 } });
        expect(onColumnOrderChange).toHaveBeenCalledTimes(1);
        expect(onColumnOrderChange.mock.calls[0][0]).toMatchObject({ oldIndex: 2, targetIndex: 0 });
        const order = Array.from(container.querySelectorAll('.ogx__header [role="columnheader"][data-field]')).map(h => h.getAttribute('data-field'));
        expect(order).toEqual(['city', 'name', 'age']);
    });
});
