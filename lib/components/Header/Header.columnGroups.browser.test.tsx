import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DataGrid } from '../../index';
import type { GridColDef, GridColumnGroupingModel, GridRowModel } from '../../types';

// Runs in real Chromium (vitest browser project): column group cells must line up with the
// header cells they cover, which jsdom cannot lay out.

const Box = ({ children, width = 1000, height = 500 }: { children: ReactNode; width?: number; height?: number }) => (
    <div style={{ width, height }}>{children}</div>
);

const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
const settle = async () => { for (let i = 0; i < 4; i++) await frame(); };

const rectOf = (el: Element | null | undefined) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width) };
};

const headerCell = (c: HTMLElement, field: string) => c.querySelector(`.ogx__header-cell[data-field="${field}"]`);

afterEach(() => cleanup());

describe('column group header geometry (real browser)', () => {
    const groupCell = (c: HTMLElement, label: string) =>
        Array.from(c.querySelectorAll('.ogx-col-group-cell--group')).find(el => el.textContent === label) ?? null;

    it('a group over flex columns is as wide as its member headers', async () => {
        const columns: GridColDef[] = [{ field: 'a', flex: 1 }, { field: 'b', flex: 1 }, { field: 'c', width: 100 }];
        const model: GridColumnGroupingModel = [{ groupId: 'g', headerName: 'G', children: ['a', 'b'] }];
        const { container } = render(<Box><DataGrid rows={[{ id: 1, a: 'x', b: 'y', c: 'z' }]} columns={columns} height={500} columnGroupingModel={model} /></Box>);
        await expect.poll(() => groupCell(container, 'G')).not.toBeNull();
        await settle();
        const g = rectOf(groupCell(container, 'G'))!;
        expect(g.left).toBe(rectOf(headerCell(container, 'a'))?.left);
        expect(g.right).toBe(rectOf(headerCell(container, 'b'))?.right);
    });

    it('a group over a percentage column is as wide as its member headers', async () => {
        const columns: GridColDef[] = [{ field: 'a', width: '20%' }, { field: 'b', width: 70 }, { field: 'c', width: 100 }];
        const model: GridColumnGroupingModel = [{ groupId: 'g', headerName: 'G', children: ['a', 'b'] }];
        const { container } = render(<Box><DataGrid rows={[{ id: 1, a: 'x', b: 'y', c: 'z' }]} columns={columns} height={500} columnGroupingModel={model} /></Box>);
        await expect.poll(() => groupCell(container, 'G')).not.toBeNull();
        await settle();
        const g = rectOf(groupCell(container, 'G'))!;
        expect(g.left).toBe(rectOf(headerCell(container, 'a'))?.left);
        expect(g.right).toBe(rectOf(headerCell(container, 'b'))?.right);
    });

    it('groups follow the rendered column order, visibility and pinning', async () => {
        const columns: GridColDef[] = ['a', 'b', 'c', 'd', 'e'].map(field => ({ field, width: 100 }));
        const model: GridColumnGroupingModel = [{ groupId: 'g', headerName: 'G', children: ['b', 'c', 'd'] }];
        const { container } = render(
            <Box>
                <DataGrid
                    rows={[{ id: 1, a: 1, b: 2, c: 3, d: 4, e: 5 }]}
                    columns={columns}
                    height={500}
                    columnGroupingModel={model}
                    columnVisibilityModel={{ c: false }}
                    pinnedColumns={{ left: ['e'] }}
                />
            </Box>
        );
        await expect.poll(() => groupCell(container, 'G')).not.toBeNull();
        await settle();
        const g = rectOf(groupCell(container, 'G'))!;
        expect(g.left).toBe(rectOf(headerCell(container, 'b'))?.left);
        expect(g.right).toBe(rectOf(headerCell(container, 'd'))?.right);
    });

    it('a group over a left-pinned column stays over it while the grid scrolls horizontally', async () => {
        const columns: GridColDef[] = Array.from({ length: 30 }, (_, i) => ({ field: `c${i}`, width: 100 }));
        const model: GridColumnGroupingModel = [
            { groupId: 'pinned', headerName: 'Pinned', children: ['c0', 'c1'] },
            { groupId: 'rest', headerName: 'Rest', children: ['c2', 'c3', 'c4'] },
        ];
        const row: GridRowModel = { id: 1 };
        columns.forEach(c => { row[c.field] = c.field; });
        const { container } = render(
            <Box width={600}>
                <DataGrid rows={[row]} columns={columns} height={500} columnGroupingModel={model} pinnedColumns={{ left: ['c0', 'c1'] }} checkboxSelection />
            </Box>
        );
        await expect.poll(() => groupCell(container, 'Pinned')).not.toBeNull();
        const viewport = container.querySelector<HTMLElement>('[role="grid"]')!;
        viewport.scrollLeft = 700;
        viewport.dispatchEvent(new Event('scroll'));
        await settle();
        const g = rectOf(groupCell(container, 'Pinned'))!;
        expect(g.left).toBe(rectOf(headerCell(container, 'c0'))?.left);
        expect(g.right).toBe(rectOf(headerCell(container, 'c1'))?.right);
        // The group row's leading filler covers the sticky checkbox column too.
        const hit = document.elementFromPoint(g.left - 10, g.top + 5);
        expect(hit?.closest('.ogx-col-group-row')).not.toBeNull();
        expect(hit?.closest('.ogx-col-group-cell--group')).toBeNull();
    });
});
