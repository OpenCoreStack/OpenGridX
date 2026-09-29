import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { userEvent, page } from 'vitest/browser';
import '../../styles/opengridx.css';
import { DataGrid } from './DataGrid';
import type { DataGridProps, GridColDef, GridRowModel } from '../../types';

const ROWS: GridRowModel[] = [{ id: 1, name: 'b', age: 2, c: 3, d: 4 }, { id: 2, name: 'a', age: 1, c: 5, d: 6 }];

function renderGrid(props: Partial<DataGridProps> & { columns: GridColDef[] }, width = 800) {
    const utils = render(
        <div style={{ width, height: 400 }}>
            <DataGrid rows={ROWS} {...props} />
        </div>
    );
    const header = (field: string) => utils.container.querySelector(`.ogx__header [data-field="${field}"]`) as HTMLElement;
    const handle = (field: string) => header(field).querySelector('.ogx-column-resize-handle') as HTMLElement;
    return { ...utils, header, handle };
}

afterEach(() => { cleanup(); });

const settle = () => new Promise(r => setTimeout(r, 50));

describe('column resize in a real browser', () => {
    it('ending a resize over the same header cell does not sort it', async () => {
        const onSortModelChange = vi.fn();
        const { header, handle } = renderGrid({
            columns: [{ field: 'name', width: 300 }, { field: 'age', width: 100 }],
            onSortModelChange,
        });
        // Shrinking past the 50px minimum leaves the pointer over the header's title.
        await userEvent.dragAndDrop(handle('name'), header('name'), { targetPosition: { x: 10, y: 10 } });
        await settle();
        expect(header('name').getBoundingClientRect().width).toBeCloseTo(50, 0);
        expect(onSortModelChange).not.toHaveBeenCalled();
    });

    it('a plain click on the handle neither sorts nor resizes', async () => {
        const onSortModelChange = vi.fn();
        const { header, handle } = renderGrid({
            columns: [{ field: 'name', width: 30 }, { field: 'age', width: 100 }],
            onSortModelChange,
        });
        await userEvent.click(handle('name'));
        await settle();
        expect(header('name').getBoundingClientRect().width).toBeCloseTo(30, 0);
        expect(onSortModelChange).not.toHaveBeenCalled();
    });

    it('a resize does not start a column drag', async () => {
        const onColumnOrderChange = vi.fn();
        const { header, handle } = renderGrid({
            columns: [{ field: 'name', width: 200 }, { field: 'age', width: 200 }, { field: 'c', width: 200 }],
            onColumnOrderChange,
        });
        const dragStarts = vi.fn();
        header('name').addEventListener('dragstart', dragStarts);
        // From the handle (x ≈ 200) to 150px into the next column: +150px.
        await userEvent.dragAndDrop(handle('name'), header('age'), { targetPosition: { x: 150, y: 10 } });
        await settle();
        expect(dragStarts).not.toHaveBeenCalled();
        expect(onColumnOrderChange).not.toHaveBeenCalled();
        expect(header('name').getBoundingClientRect().width).toBeGreaterThan(330);
    });

    it('a column can be widened past 1000px when it has no maxWidth', async () => {
        await page.viewport(1600, 800);
        const { header, handle } = renderGrid({
            columns: [{ field: 'name', width: 900 }, { field: 'age', width: 400 }],
        }, 1500);
        // From the handle (x ≈ 900) to 250px into the next column: +250px.
        await userEvent.dragAndDrop(handle('name'), header('age'), { targetPosition: { x: 250, y: 10 } });
        await settle();
        expect(header('name').getBoundingClientRect().width).toBeGreaterThan(1100);
    });

    it('a right-pinned column is resized from its left edge, and that edge follows the pointer', async () => {
        await page.viewport(1200, 800);
        const { header, handle } = renderGrid({
            columns: ['a', 'b', 'c', 'd'].map(field => ({ field, width: 300 })),
            pinnedColumns: { right: ['c', 'd'] },
        });
        const before = header('c').getBoundingClientRect();
        const h = handle('c').getBoundingClientRect();
        // The handle lies entirely inside column c, starting at its left edge.
        expect(h.left).toBeCloseTo(before.left, 0);
        const GRAB = 2;
        // Drag the handle 60px to the left, over column b.
        const b = header('b').getBoundingClientRect();
        await userEvent.dragAndDrop(handle('c'), header('b'), {
            sourcePosition: { x: h.width / 2 + GRAB, y: 10 },
            targetPosition: { x: before.left + GRAB - 60 - b.left, y: 10 },
        });
        await settle();
        const after = header('c').getBoundingClientRect();
        expect(after.width).toBeCloseTo(before.width + 60, -1);
        expect(after.left).toBeCloseTo(before.left - 60, -1);
        expect(after.right).toBeCloseTo(before.right, 0);
        // The rightmost column's handle is inside the grid, not clipped at its right edge.
        const viewport = document.querySelector('.ogx__viewport') as HTMLElement;
        expect(handle('d').getBoundingClientRect().right).toBeLessThanOrEqual(viewport.getBoundingClientRect().right);
    });

    it('Alt+ArrowRight / Alt+ArrowLeft on a focused header resize its column', async () => {
        const { header } = renderGrid({ columns: [{ field: 'name', width: 200 }, { field: 'age', width: 100 }] });
        header('name').focus();
        await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}');
        await settle();
        expect(header('name').getBoundingClientRect().width).toBeCloseTo(210, 0);
        await userEvent.keyboard('{Alt>}{Shift>}{ArrowLeft}{/Shift}{/Alt}');
        await settle();
        expect(header('name').getBoundingClientRect().width).toBeCloseTo(160, 0);
        expect(document.activeElement).toBe(header('name'));
    });

    it('with tree data, Alt+Arrow resizes on a header and expands / collapses on a row, never both', async () => {
        type TreeRow = { id: number; name: string; path: string[] };
        const rows: TreeRow[] = [
            { id: 1, name: 'parent', path: ['parent'] },
            { id: 2, name: 'child', path: ['parent', 'child'] },
        ];
        const { container } = render(
            <div style={{ width: 800, height: 400 }}>
                <DataGrid<TreeRow> rows={rows} columns={[{ field: 'name', width: 200 }]}
                    treeData getTreeDataPath={r => r.path} defaultGroupingExpansionDepth={-1} />
            </div>
        );
        const header = () => container.querySelector('.ogx__header [data-field="name"]') as HTMLElement;
        const parentRow = () => container.querySelector('.ogx__row[aria-expanded]') as HTMLElement;
        expect(parentRow().getAttribute('aria-expanded')).toBe('true');

        header().focus();
        await userEvent.keyboard('{Alt>}{ArrowLeft}{/Alt}');
        await settle();
        expect(header().getBoundingClientRect().width).toBeCloseTo(190, 0);
        expect(parentRow().getAttribute('aria-expanded')).toBe('true');

        await userEvent.click(parentRow().querySelector('.ogx__cell[data-field="name"]') as HTMLElement);
        await userEvent.keyboard('{Alt>}{ArrowLeft}{/Alt}');
        await settle();
        expect(parentRow().getAttribute('aria-expanded')).toBe('false');
        expect(header().getBoundingClientRect().width).toBeCloseTo(190, 0);
        await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}');
        await settle();
        expect(parentRow().getAttribute('aria-expanded')).toBe('true');
        expect(header().getBoundingClientRect().width).toBeCloseTo(190, 0);
    });

    /** Every pixel column across the handle's width hits the handle itself. */
    const hitTestable = (h: HTMLElement) => {
        const r = h.getBoundingClientRect();
        const y = r.top + r.height / 2;
        const misses: number[] = [];
        for (let x = Math.ceil(r.left) + 0.5; x < r.right; x++) {
            if (document.elementFromPoint(x, y)?.closest('.ogx-column-resize-handle') !== h) misses.push(x);
        }
        return { width: r.width, misses };
    };

    it('the whole 8px resize handle is grabbable, for unpinned and right-pinned columns', async () => {
        await page.viewport(1200, 800);
        const { handle } = renderGrid({
            columns: ['a', 'b', 'c', 'd'].map(field => ({ field, width: 200 })),
            pinnedColumns: { right: ['d'] },
        }, 1000);
        for (const field of ['a', 'b', 'd']) {
            const { width, misses } = hitTestable(handle(field));
            expect(width, field).toBeGreaterThanOrEqual(8);
            expect(misses, field).toEqual([]);
        }
    });

    it('resizes from a grabbable handle in the column-group header layout', async () => {
        await page.viewport(1200, 800);
        const { header, handle } = renderGrid({
            columns: ['name', 'age', 'c', 'd'].map(field => ({ field, width: 200 })),
            columnGroupingModel: [{ groupId: 'g1', headerName: 'Group 1', children: ['name', 'age'] }],
        }, 1000);
        const { misses } = hitTestable(handle('name'));
        expect(misses).toEqual([]);
        await userEvent.dragAndDrop(handle('name'), header('age'), { targetPosition: { x: 100, y: 10 } });
        await settle();
        expect(header('name').getBoundingClientRect().width).toBeGreaterThan(280);
    });
});
