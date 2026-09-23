import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DataGrid } from '../../index';
import type { GridColDef, GridRowModel } from '../../types';

// Runs in real Chromium (vitest browser project): these tests compare the geometry of
// body cells, header cells and column-group cells, which jsdom cannot lay out.

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
const bodyCell = (c: HTMLElement, rowIndex: number, field: string) =>
    c.querySelector(`[role="row"][data-rowindex="${rowIndex}"] [data-field="${field}"]`);

function expectAligned(container: HTMLElement, fields: string[], rowIndex = 0) {
    for (const field of fields) {
        const h = rectOf(headerCell(container, field));
        const b = rectOf(bodyCell(container, rowIndex, field));
        expect({ field, left: b?.left, width: b?.width }).toEqual({ field, left: h?.left, width: h?.width });
    }
}

afterEach(() => cleanup());

describe('cell spanning geometry (real browser)', () => {
    it('body cells line up with their headers for percentage and flex widths when no span is configured', async () => {
        const configs: GridColDef[][] = [
            [{ field: 'a', width: '40%' }, { field: 'b', flex: 1, width: 50 }, { field: 'c', flex: 2 }],
            [{ field: 'a', flex: 1 }, { field: 'b', flex: 3 }, { field: 'c', flex: 1 }],
            [{ field: 'a' }, { field: 'b', width: 120 }, { field: 'c' }],
        ];
        for (const columns of configs) {
            const { container, unmount } = render(
                <Box><DataGrid rows={[{ id: 1, a: 'x', b: 'y', c: 'z' }]} columns={columns} height={500} /></Box>
            );
            await expect.poll(() => bodyCell(container, 0, 'c')).not.toBeNull();
            await settle();
            expectAligned(container, ['a', 'b', 'c']);
            unmount();
        }
    });

    it('a colSpan origin takes the resolved widths of the flex columns it covers', async () => {
        const columns: GridColDef[] = [
            { field: 'a', flex: 1, colSpan: 2 },
            { field: 'b', flex: 3 },
            { field: 'c', width: 100 },
        ];
        const { container } = render(<Box><DataGrid rows={[{ id: 1, a: 'x', b: 'y', c: 'z' }]} columns={columns} height={500} /></Box>);
        await expect.poll(() => bodyCell(container, 0, 'c')).not.toBeNull();
        await settle();
        const merged = rectOf(bodyCell(container, 0, 'a'));
        const ha = rectOf(headerCell(container, 'a'));
        const hb = rectOf(headerCell(container, 'b'));
        expect(merged?.left).toBe(ha?.left);
        expect(merged?.right).toBe(hb?.right);
        expectAligned(container, ['c']);
    });

    it('a colSpan origin with maxWidth still covers the full merged width', async () => {
        const columns: GridColDef[] = [
            { field: 'a', width: 100, maxWidth: 150, colSpan: 2 },
            { field: 'b', width: 100 },
            { field: 'c', width: 100 },
        ];
        const { container } = render(<Box><DataGrid rows={[{ id: 1, a: 'x', b: 'y', c: 'z' }]} columns={columns} height={500} /></Box>);
        await expect.poll(() => bodyCell(container, 0, 'c')).not.toBeNull();
        await settle();
        expect(rectOf(bodyCell(container, 0, 'a'))?.width).toBe(200);
        expectAligned(container, ['c']);
    });

    it('keeps later cells under their headers when a colSpan origin is scrolled out of the column window', async () => {
        const columns: GridColDef[] = Array.from({ length: 60 }, (_, i) => ({
            field: `c${i}`,
            width: 100,
            ...(i === 10 ? { colSpan: 4 } : {}),
        }));
        const row: GridRowModel = { id: 1 };
        columns.forEach(c => { row[c.field] = c.field; });
        const { container } = render(<Box><DataGrid rows={[row]} columns={columns} height={500} /></Box>);
        await expect.poll(() => bodyCell(container, 0, 'c0')).not.toBeNull();

        const viewport = container.querySelector<HTMLElement>('[role="grid"]')!;
        viewport.scrollLeft = 100 * 17 + 50;
        viewport.dispatchEvent(new Event('scroll'));
        await expect.poll(() => bodyCell(container, 0, 'c0')).toBeNull();
        await settle();

        expectAligned(container, ['c14', 'c20', 'c25']);
        // The merged cell itself still covers c10..c13.
        const merged = rectOf(bodyCell(container, 0, 'c10'));
        expect(merged?.right).toBe(rectOf(headerCell(container, 'c14'))?.left);
    });

    it('keeps a rowSpan visible when its origin row scrolls out of the row window', async () => {
        const rows = Array.from({ length: 300 }, (_, i) => ({ id: i + 1, a: `A${i + 1}`, g: i < 60 ? 'FIRSTGROUP' : 'rest' }));
        const columns: GridColDef<(typeof rows)[number]>[] = [
            { field: 'a', width: 100 },
            { field: 'g', width: 150, rowSpan: ({ rowIndex }) => (rowIndex === 0 ? 60 : 1) },
        ];
        const { container } = render(<Box><DataGrid rows={rows} columns={columns} height={500} /></Box>);
        await expect.poll(() => bodyCell(container, 0, 'a')).not.toBeNull();

        const viewport = container.querySelector<HTMLElement>('[role="grid"]')!;
        viewport.scrollTop = 52 * 30;
        viewport.dispatchEvent(new Event('scroll'));
        await expect.poll(() => bodyCell(container, 35, 'a')).not.toBeNull();
        await settle();

        const merged = Array.from(container.querySelectorAll<HTMLElement>('[role="gridcell"][data-field="g"]'))
            .find(el => el.textContent === 'FIRSTGROUP');
        expect(merged).toBeDefined();
        const viewportRect = viewport.getBoundingClientRect();
        const mergedRect = merged!.getBoundingClientRect();
        // The merged cell covers the visible part of its span.
        expect(mergedRect.top).toBeLessThan(viewportRect.top + 100);
        expect(mergedRect.bottom).toBeGreaterThan(viewportRect.top + 200);
        // Rows are still where the layout puts them: row 35's `a` sits under row 34's.
        const r34 = rectOf(bodyCell(container, 34, 'a'))!;
        const r35 = rectOf(bodyCell(container, 35, 'a'))!;
        expect(r35.top - r34.top).toBe(52);
    });

    it('a cell with colSpan 2 and rowSpan 2 hides every cell of the rectangle in the next row', async () => {
        type Row = { id: number; a: string; b: string; c: string; isHeader?: boolean };
        const rows: Row[] = [
            { id: 1, a: 'HEADER', b: 'b1', c: 'c1', isHeader: true },
            { id: 2, a: 'a2', b: 'b2', c: 'c2' },
            { id: 3, a: 'a3', b: 'b3', c: 'c3' },
        ];
        const columns: GridColDef<Row>[] = [
            { field: 'a', width: 100, colSpan: ({ row }) => (row.isHeader ? 2 : 1), rowSpan: ({ row }) => (row.isHeader ? 2 : 1) },
            { field: 'b', width: 100 },
            { field: 'c', width: 100 },
        ];
        const { container } = render(<Box width={500} height={400}><DataGrid rows={rows} columns={columns} height="100%" /></Box>);
        await expect.poll(() => bodyCell(container, 2, 'c')).not.toBeNull();
        await settle();

        const b2 = bodyCell(container, 1, 'b');
        expect(b2?.getAttribute('role')).not.toBe('gridcell');
        const origin = rectOf(bodyCell(container, 0, 'a'))!;
        expect(origin.width).toBe(200);
        // The merged cell ends at the second row (it leaves that row's 1px bottom border visible).
        const secondRowBottom = rectOf(container.querySelector('[role="row"][data-rowindex="1"]'))!.bottom;
        expect(Math.abs(origin.bottom - secondRowBottom)).toBeLessThanOrEqual(1);
        // Column c keeps the same x in every row.
        const cLefts = [0, 1, 2].map(i => rectOf(bodyCell(container, i, 'c'))?.left);
        expect(new Set(cLefts).size).toBe(1);
        expect(cLefts[0]).toBe(rectOf(headerCell(container, 'c'))?.left);
    });

    it('a static colSpan on a column whose cell is hidden by a rowSpan does not shift the row', async () => {
        type Row = { id: number; a: string; b: string; c: string };
        const rows: Row[] = [1, 2, 3].map(i => ({ id: i, a: `a${i}`, b: `b${i}`, c: `c${i}` }));
        const columns: GridColDef<Row>[] = [
            { field: 'a', width: 100, colSpan: 2, rowSpan: ({ rowIndex }) => (rowIndex === 0 ? 2 : 1) },
            { field: 'b', width: 100 },
            { field: 'c', width: 100 },
        ];
        const { container } = render(<Box width={500} height={400}><DataGrid rows={rows} columns={columns} height="100%" /></Box>);
        await expect.poll(() => bodyCell(container, 2, 'c')).not.toBeNull();
        await settle();
        const cLefts = [0, 1, 2].map(i => rectOf(bodyCell(container, i, 'c'))?.left);
        expect(cLefts).toEqual([cLefts[0], cLefts[0], cLefts[0]]);
    });

    it('a rowSpan stops at a row whose detail panel is expanded instead of covering the panel', async () => {
        type Row = { id: number; a: string; b: string };
        const rows: Row[] = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, a: `a${i + 1}`, b: `b${i + 1}` }));
        const columns: GridColDef<Row>[] = [
            { field: 'a', width: 100, rowSpan: ({ rowIndex }) => (rowIndex === 0 ? 2 : 1) },
            { field: 'b', width: 100 },
        ];
        const { container } = render(
            <Box width={400} height={600}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    height="100%"
                    getDetailPanelContent={({ row }) => <div>panel {row.id}</div>}
                    getDetailPanelHeight={() => 120}
                    detailPanelExpandedRowIds={new Set([1])}
                />
            </Box>
        );
        await expect.poll(() => container.querySelector('.ogx__detail-panel')).not.toBeNull();
        await settle();
        const origin = rectOf(bodyCell(container, 0, 'a'))!;
        const panel = rectOf(container.querySelector('.ogx__detail-panel'))!;
        expect(origin.bottom).toBeLessThanOrEqual(panel.top + 1);
        expect(bodyCell(container, 1, 'a')?.textContent).toBe('a2');
    });
});
