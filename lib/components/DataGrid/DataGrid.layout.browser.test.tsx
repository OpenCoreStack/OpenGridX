import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DataGrid } from '../../index';
import type { GridColDef, GridColumnGroupingModel } from '../../types';

// Real Chromium: sticky positioning, stacking order and rendered widths need a layout engine.

type Row = { id: number; name: string; amount: number; [k: string]: unknown };

const makeRows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: `n${i + 1}`, amount: i }));

const Box = ({ children, h = 400, w = 800 }: { children: ReactNode; h?: number; w?: number }) => (
    <div style={{ height: h, width: w, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
);

const viewport = (c: HTMLElement) => c.querySelector<HTMLElement>('.ogx__viewport')!;
const rect = (c: HTMLElement, sel: string) => c.querySelector<HTMLElement>(sel)!.getBoundingClientRect();
const frame = () => new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
const scrollTo = async (el: HTMLElement, top: number, left?: number) => {
    el.scrollTop = top;
    if (left !== undefined) el.scrollLeft = left;
    await frame();
    await frame();
};
/** The element painted on top at the centre of `r`. */
const topmostAt = (r: DOMRect) => document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);

const wideColumns = (n: number): GridColDef<Row>[] => Array.from({ length: n }, (_, i) => ({ field: `c${i}`, width: 150 }));

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('DataGrid layout in a real browser', () => {
    describe('pinned column widths and offsets', () => {
        it('does not overlap left-pinned columns when a pinned column has minWidth > width', async () => {
            const cols: GridColDef<Row>[] = [{ field: 'name', width: 50, minWidth: 120 }, { field: 'amount', width: 100 }, ...wideColumns(10)];
            const { container } = render(<Box><DataGrid rows={makeRows(20)} columns={cols} height="100%" pinnedColumns={{ left: ['name', 'amount'] }} /></Box>);
            await expect.poll(() => container.querySelector('.ogx__rows [data-field="name"]')).not.toBeNull();
            await scrollTo(viewport(container), 0, 400);
            for (const scope of ['.ogx__rows', '.ogx__header']) {
                const name = rect(container, `${scope} [data-field="name"]`);
                const amount = rect(container, `${scope} [data-field="amount"]`);
                expect(Math.round(name.width)).toBe(120);
                expect(Math.round(amount.left)).toBe(Math.round(name.right));
            }
        });

        it('sizes the scrollable content to the clamped column widths', async () => {
            const cols: GridColDef<Row>[] = [{ field: 'a', width: 50, minWidth: 120 }, { field: 'b', width: 400, maxWidth: 200 }, ...wideColumns(4)];
            const { container } = render(<Box><DataGrid rows={makeRows(5)} columns={cols} height="100%" /></Box>);
            await expect.poll(() => container.querySelector('.ogx__rows [data-field="a"]')).not.toBeNull();
            const rendered = Array.from(container.querySelectorAll<HTMLElement>('.ogx__rows [role="row"]:first-child [data-field]'))
                .reduce((sum, el) => sum + el.getBoundingClientRect().width, 0);
            expect(Math.round(rendered)).toBe(120 + 200 + 4 * 150);
            expect(container.querySelector<HTMLElement>('.ogx__content')!.style.width).toBe(`${120 + 200 + 4 * 150}px`);
        });

        it('keeps left-pinned columns side by side when pinned out of column order', async () => {
            const cols: GridColDef<Row>[] = [{ field: 'a', width: 100 }, { field: 'b', width: 200 }, ...wideColumns(10)];
            const { container } = render(<Box><DataGrid rows={makeRows(5)} columns={cols} height="100%" pinnedColumns={{ left: ['b', 'a'] }} /></Box>);
            await expect.poll(() => container.querySelector('.ogx__rows [data-field="a"]')).not.toBeNull();
            const vp = viewport(container).getBoundingClientRect();
            for (const scrollLeft of [0, 500]) {
                await scrollTo(viewport(container), 0, scrollLeft);
                for (const scope of ['.ogx__rows', '.ogx__header']) {
                    const b = rect(container, `${scope} [data-field="b"]`);
                    const a = rect(container, `${scope} [data-field="a"]`);
                    expect(Math.abs(b.left - vp.left), `${scope} @${scrollLeft}`).toBeLessThanOrEqual(1);
                    expect(Math.round(a.left), `${scope} @${scrollLeft}`).toBe(Math.round(b.right));
                }
            }
        });

        it('gives a pinned percentage column its percentage width', async () => {
            const cols: GridColDef<Row>[] = [{ field: 'name', width: '30%' }, { field: 'amount', width: 100 }];
            const { container } = render(<Box w={1002}><DataGrid rows={makeRows(5)} columns={cols} height="100%" pinnedColumns={{ left: ['name'] }} /></Box>);
            await expect.poll(() => container.querySelector('.ogx__rows [data-field="name"]')).not.toBeNull();
            await frame();
            const vpWidth = viewport(container).clientWidth;
            const expected = 0.3 * (vpWidth - 100);
            expect(Math.abs(rect(container, '.ogx__rows [data-field="name"]').width - expected)).toBeLessThan(1);
            expect(Math.abs(rect(container, '.ogx__header [data-field="name"]').width - expected)).toBeLessThan(1);
        });
    });

    describe('sticky header and pinned rows', () => {
        const groupModel: GridColumnGroupingModel = [{ groupId: 'g', headerName: 'Group', children: ['name', 'amount'] }];
        const nestedModel: GridColumnGroupingModel = [{ groupId: 'outer', headerName: 'Outer', children: [{ groupId: 'inner', headerName: 'Inner', children: ['name', 'amount'] }] }];
        const models: Array<[string, GridColumnGroupingModel]> = [['one group level', groupModel], ['two group levels', nestedModel]];
        const cols: GridColDef<Row>[] = [{ field: 'name', width: 200 }, { field: 'amount', width: 200 }];

        it.each(models)('keeps top-pinned rows below every header row (%s)', async (_label, model) => {
            const { container } = render(
                <Box><DataGrid rows={makeRows(200)} columns={cols} height="100%" pinnedRows={{ top: [1] }} columnGroupingModel={model} /></Box>
            );
            await expect.poll(() => container.querySelector('.ogx__pinned-rows--top')).not.toBeNull();
            await scrollTo(viewport(container), 2000);
            const header = rect(container, '.ogx__header');
            const pinned = rect(container, '.ogx__pinned-rows--top');
            expect(pinned.top).toBeGreaterThanOrEqual(header.bottom - 1);
            expect(topmostAt(rect(container, '.ogx__header [data-field="name"]'))?.closest('.ogx__header')).not.toBeNull();
        });

        it('keeps the aggregation footer visible below bottom-pinned rows', async () => {
            const numberCols: GridColDef<Row>[] = [{ field: 'name', width: 200 }, { field: 'amount', width: 200, type: 'number' }];
            const { container } = render(
                <Box><DataGrid rows={makeRows(200)} columns={numberCols} height="100%" pinnedRows={{ bottom: [200] }} aggregationModel={{ amount: 'sum' }} /></Box>
            );
            await expect.poll(() => container.querySelector('.ogx__aggregation-footer')).not.toBeNull();
            await scrollTo(viewport(container), 1000);
            const footer = rect(container, '.ogx__aggregation-footer');
            const pinned = rect(container, '.ogx__pinned-rows--bottom');
            expect(pinned.bottom).toBeLessThanOrEqual(footer.top + 1);
            expect(Math.round(footer.bottom)).toBe(Math.round(viewport(container).getBoundingClientRect().top + viewport(container).clientHeight));
            expect(topmostAt(footer)?.closest('.ogx__aggregation-footer')).not.toBeNull();
            expect(topmostAt(pinned)?.closest('.ogx__pinned-rows--bottom')).not.toBeNull();
        });
    });

    describe('stacking of sticky system columns', () => {
        it('keeps the expand and drag-handle columns above a row-spanned cell scrolled under them', async () => {
            const cols: GridColDef<Row>[] = [{ field: 'name', width: 150, rowSpan: 2 }, ...wideColumns(12)];
            const { container } = render(
                <Box><DataGrid rows={makeRows(20)} columns={cols} height="100%" rowReordering checkboxSelection getDetailPanelContent={() => <div>d</div>} /></Box>
            );
            await expect.poll(() => container.querySelector('.ogx__rows .ogx__cell--spanned')).not.toBeNull();
            await scrollTo(viewport(container), 0, 100);
            const row = container.querySelector('.ogx__rows [role="row"]')!;
            for (const cls of ['ogx__cell--drag-handle', 'ogx__cell--expand', 'ogx__cell--checkbox']) {
                const cell = row.querySelector<HTMLElement>(`.${cls}`)!.getBoundingClientRect();
                expect(topmostAt(cell)?.closest(`.${cls}`), cls).not.toBeNull();
            }
        });
    });
});
