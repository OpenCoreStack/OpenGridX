import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import { commands, userEvent } from 'vitest/browser';
import { DataGrid, GridToolbar } from '../../index';
import type { GridColDef } from '../../types';
import '../../styles/opengridx.css';

// Right-to-left layout (dir="rtl" on an ancestor or on <html>) in real browsers, and the left-to-right
// layout the RTL fixes must leave unchanged. See docs/features/rtl.md for what is not supported.

type Row = Record<string, string | number>;
const COLUMN_COUNT = 30;
const makeColumns = (): GridColDef<Row>[] =>
    Array.from({ length: COLUMN_COUNT }, (_, i) => ({ field: `c${i}`, headerName: `Col ${i}`, width: 120, editable: true }));
const ROWS: Row[] = Array.from({ length: 40 }, (_, r) => {
    const row: Row = { id: r };
    for (let i = 0; i < COLUMN_COUNT; i++) row[`c${i}`] = `r${r}c${i}`;
    return row;
});

const frame = () => new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
const settle = async () => { for (let i = 0; i < 3; i++) await frame(); };

afterEach(() => {
    cleanup();
    document.documentElement.removeAttribute('dir');
});

const viewport = (c: HTMLElement) => c.querySelector<HTMLElement>('.ogx__viewport')!;
const header = (c: HTMLElement, field: string) => c.querySelector<HTMLElement>(`.ogx__header [role="columnheader"][data-field="${field}"]`);
const cell = (c: HTMLElement, row: number, field: string) =>
    c.querySelector<HTMLElement>(`.ogx__virtual-container [role="row"][aria-rowindex="${row + 2}"] [data-field="${field}"]`);
const focusedField = () => (document.activeElement as HTMLElement | null)?.dataset.field;
const box = (el: Element) => el.getBoundingClientRect();
// The scrollLeft of the scroll start (the browser clamps 1 to it): 0, except in headless Chromium
// with classic scrollbars (Linux CI). Playwright hides scrollbars there (--hide-scrollbars) but
// `scrollbar-gutter: stable` still reserves the gutter, and in RTL Chromium then cannot scroll the
// last gutter-width of the start into view: scrollLeft stops at -gutter and the content starts that
// far right of the viewport. A plain scroller without the grid does the same; real browsers with
// visible scrollbars do not.
const scrollOrigin = (el: HTMLElement) => {
    const saved = el.scrollLeft;
    el.scrollLeft = 1;
    const origin = el.scrollLeft;
    el.scrollLeft = saved;
    return origin;
};
// Sticky end-side cells stick to the scrollport edge, inside the scrollbar gutter, except in that
// headless Chromium mode, where they stick to the border edge over the (hidden) gutter.
const nearestEdge = (x: number, edges: number[]) => Math.min(...edges.map(e => Math.abs(x - e)));
const scrollTo = async (el: HTMLElement, left: number) => {
    el.scrollLeft = left;
    el.dispatchEvent(new Event('scroll'));
    await settle();
};

function RtlGrid({ dir = 'rtl', columns = makeColumns(), toolbar = false }: { dir?: 'rtl' | 'ltr' | null; columns?: GridColDef<Row>[]; toolbar?: boolean }) {
    return (
        <div dir={dir ?? undefined} style={{ width: 400, height: 360 }}>
            <DataGrid rows={ROWS} columns={columns} height={360} cellSelection slots={toolbar ? { toolbar: GridToolbar } : undefined} />
        </div>
    );
}

describe('RTL — layout', () => {
    it('lays the first column out on the right, with text from the right', async () => {
        const { container } = render(<RtlGrid />);
        await settle();
        const vp = box(viewport(container));
        const origin = scrollOrigin(viewport(container));
        expect(viewport(container).scrollLeft).toBe(origin);
        expect(Math.round(box(header(container, 'c0')!).right)).toBe(Math.round(vp.right - origin));
        expect(box(header(container, 'c1')!).right).toBeLessThanOrEqual(box(header(container, 'c0')!).left + 1);
        const c = cell(container, 0, 'c0')!;
        expect(getComputedStyle(c).textAlign).toBe('start');
        // The text sits at the cell's right edge.
        const range = document.createRange();
        range.selectNodeContents(c.querySelector('.ogx__cell-content') ?? c);
        expect(box(c).right - range.getBoundingClientRect().right).toBeLessThan(box(c).width / 2);
    });

    it('works with document.dir = rtl as well', async () => {
        document.documentElement.dir = 'rtl';
        const { container } = render(<RtlGrid dir={null} />);
        await settle();
        const origin = scrollOrigin(viewport(container));
        expect(Math.round(box(header(container, 'c0')!).right)).toBe(Math.round(box(viewport(container)).right - origin));
    });

    it('renders the columns in view after a horizontal scroll (negative scrollLeft)', async () => {
        const { container } = render(<RtlGrid />);
        await settle();
        const vp = viewport(container);
        await scrollTo(vp, -1500);
        expect(vp.scrollLeft).toBeLessThan(-1400);
        const vpBox = box(vp);
        const visible = Array.from(container.querySelectorAll<HTMLElement>('.ogx__virtual-container [role="row"][aria-rowindex="2"] [role="gridcell"]'))
            .filter(el => { const b = box(el); return b.right > vpBox.left + 1 && b.left < vpBox.right - 1; })
            .map(el => el.dataset.field);
        // 1500px from the start: columns 12 to 15 fill the 400px viewport.
        expect(visible).toContain('c13');
        expect(visible).toContain('c14');
    });

    it('puts the resize handle on the left edge and widens the column when dragged left', async () => {
        const { container } = render(<RtlGrid />);
        await settle();
        const h = header(container, 'c1')!;
        const handle = h.querySelector<HTMLElement>('.ogx-column-resize-handle')!;
        expect(Math.round(box(handle).left)).toBe(Math.round(box(h).left));
        const start = box(handle);
        const x = start.left + start.width / 2;
        const y = start.top + start.height / 2;
        fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: x, clientY: y });
        fireEvent.pointerMove(handle, { pointerId: 1, clientX: x - 40, clientY: y });
        fireEvent.pointerUp(handle, { pointerId: 1, clientX: x - 40, clientY: y });
        await settle();
        expect(Math.round(box(header(container, 'c1')!).width)).toBe(160);
    });

    it('puts the fill handle in the bottom-left corner of the range', async () => {
        const { container } = render(<RtlGrid />);
        await settle();
        await userEvent.click(cell(container, 1, 'c1')!);
        await settle();
        const handle = container.querySelector<HTMLElement>('.ogx__cell-fill-handle')!;
        const c = cell(container, 1, 'c1')!;
        // Inside the cell's left border.
        expect(Math.abs(box(handle).left - box(c).left)).toBeLessThan(1.5);
        expect(Math.round(box(handle).bottom)).toBe(Math.round(box(c).bottom));
    });

    it('opens the toolbar panels towards the grid, lined up with the button', async () => {
        const { container } = render(<RtlGrid toolbar />);
        await settle();
        const button = container.querySelector<HTMLElement>('[aria-label="Manage columns"]')!;
        await act(async () => { button.click(); });
        await settle();
        const panel = document.querySelector<HTMLElement>('[aria-label="Column visibility"]:not(button)')!;
        expect(Math.abs(box(panel).left - box(button).left)).toBeLessThan(1.5);
    });
});

describe('RTL — cell range drag', () => {
    it('auto-scrolls towards the later columns while the pointer is held left of the grid', async () => {
        // Room left of the grid for the pointer, inside the page (Firefox drops moves outside it).
        const { container } = render(
            <div data-testid="box" dir="rtl" style={{ marginLeft: 150, width: 250, height: 360 }}>
                <DataGrid rows={ROWS} columns={makeColumns()} height={360} cellSelection />
            </div>,
        );
        await settle();
        const vp = viewport(container);
        const sel = (field: string) => `.ogx__viewport [role="row"][data-rowindex="0"] [data-field="${field}"]`;
        await commands.pointerMoveTo(sel('c1'));
        await commands.pointerDown();
        await commands.pointerMoveTo(sel('c2'));
        const row = cell(container, 0, 'c2')!.getBoundingClientRect();
        const boxTop = container.querySelector<HTMLElement>('[data-testid="box"]')!.getBoundingClientRect().top;
        await commands.pointerMoveTo('[data-testid="box"]', -100, row.top - boxTop + row.height / 2);
        await expect.poll(() => vp.scrollLeft, { timeout: 8000 }).toBeLessThan(-1000);
        await commands.pointerUp();
        await settle();
        const inRange = Array.from(container.querySelectorAll<HTMLElement>('.ogx__cell--range')).map(el => Number(el.dataset.field!.slice(1)));
        expect(Math.max(...inRange)).toBeGreaterThan(8);
    });
});

describe('RTL — keyboard', () => {
    it('ArrowLeft moves to the column on the left (the next one) and ArrowRight back', async () => {
        const { container } = render(<RtlGrid />);
        await settle();
        await userEvent.click(cell(container, 0, 'c2')!);
        await userEvent.keyboard('{ArrowLeft}');
        expect(focusedField()).toBe('c3');
        await userEvent.keyboard('{ArrowRight}{ArrowRight}');
        expect(focusedField()).toBe('c1');
    });

    it('Shift+ArrowLeft extends the range to the left', async () => {
        const { container } = render(<RtlGrid />);
        await settle();
        await userEvent.click(cell(container, 0, 'c1')!);
        await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
        await settle();
        expect(cell(container, 0, 'c2')!.className).toContain('ogx__cell--range');
        expect(cell(container, 0, 'c0')!.className).not.toContain('ogx__cell--range');
        // The outline is on the range's outer edges: the right of c1, the left of c2.
        expect(getComputedStyle(cell(container, 0, 'c1')!).boxShadow).toMatch(/\) -2px 0px 0px 0px inset/);
        expect(getComputedStyle(cell(container, 0, 'c1')!).boxShadow).not.toMatch(/\) 2px 0px 0px 0px inset/);
        expect(getComputedStyle(cell(container, 0, 'c2')!).boxShadow).toMatch(/\) 2px 0px 0px 0px inset/);
    });

    it('End and Home scroll the focused cell into view', async () => {
        const { container } = render(<RtlGrid />);
        await settle();
        const vp = viewport(container);
        await userEvent.click(cell(container, 0, 'c1')!);
        await userEvent.keyboard('{End}');
        await settle();
        expect(focusedField()).toBe(`c${COLUMN_COUNT - 1}`);
        const vpBox = box(vp);
        const last = box(document.activeElement!);
        expect(last.left).toBeGreaterThanOrEqual(vpBox.left - 1);
        expect(last.right).toBeLessThanOrEqual(vpBox.right + 1);
        await userEvent.keyboard('{Home}');
        await settle();
        expect(focusedField()).toBe('c0');
        expect(vp.scrollLeft).toBe(scrollOrigin(vp));
    });

    it('Alt+ArrowLeft on a header widens the column', async () => {
        const { container } = render(<RtlGrid />);
        await settle();
        await userEvent.click(cell(container, 0, 'c0')!);
        await userEvent.keyboard('{ArrowUp}');
        expect(focusedField()).toBe('c0');
        await userEvent.keyboard('{Alt>}{ArrowLeft}{/Alt}');
        await settle();
        expect(Math.round(box(header(container, 'c0')!).width)).toBe(130);
    });
});

describe('LTR — unchanged by the RTL fixes', () => {
    it('keeps resize handle, fill handle, pinned columns, text and panels where they were', async () => {
        const columns = makeColumns().slice(0, 12).map((c, i) => (i === 1 ? { ...c, align: 'right' as const, headerAlign: 'right' as const } : c));
        const { container } = render(
            <div style={{ width: 400, height: 360 }}>
                <DataGrid rows={ROWS} columns={columns} height={360} cellSelection
                    pinnedColumns={{ left: ['c0'], right: ['c11'] }} slots={{ toolbar: GridToolbar }} />
            </div>,
        );
        await settle();
        const vp = viewport(container);
        const vpBox = box(vp);

        // Columns run left to right; the resize handle is on the right edge.
        expect(Math.round(box(header(container, 'c0')!).left)).toBe(Math.round(vpBox.left));
        const h2 = header(container, 'c2')!;
        expect(Math.round(box(h2.querySelector('.ogx-column-resize-handle')!).right)).toBe(Math.round(box(h2).right));
        // Right-pinned column flush with the right edge (inside the scrollbar gutter).
        expect(nearestEdge(box(header(container, 'c11')!).right, [vpBox.left + vp.clientWidth, vpBox.right])).toBeLessThan(1);

        // Text: left-aligned from the left, right-aligned from the right.
        const textBox = (el: Element) => { const r = document.createRange(); r.selectNodeContents(el.querySelector('.ogx__cell-content') ?? el); return r.getBoundingClientRect(); };
        const left = cell(container, 0, 'c2')!;
        const right = cell(container, 0, 'c1')!;
        expect(textBox(left).left - box(left).left).toBeLessThan(box(left).width / 2);
        expect(box(right).right - textBox(right).right).toBeLessThan(box(right).width / 2);

        // Fill handle bottom-right.
        await userEvent.click(cell(container, 1, 'c2')!);
        await settle();
        const fill = container.querySelector<HTMLElement>('.ogx__cell-fill-handle')!;
        // Inside the cell's right border.
        expect(Math.abs(box(fill).right - box(cell(container, 1, 'c2')!).right)).toBeLessThan(1.5);

        // ArrowRight moves right; pinned columns stay put while scrolling.
        await userEvent.keyboard('{ArrowRight}');
        expect(focusedField()).toBe('c3');
        await scrollTo(vp, 300);
        expect(Math.round(box(header(container, 'c0')!).left)).toBe(Math.round(vpBox.left));

        // Toolbar panel: right edges lined up.
        const button = container.querySelector<HTMLElement>('[aria-label="Manage columns"]')!;
        await act(async () => { button.click(); });
        await settle();
        const panel = document.querySelector<HTMLElement>('[aria-label="Column visibility"]:not(button)')!;
        expect(Math.abs(box(panel).right - box(button).right)).toBeLessThan(1.5);
    });
});

// The part of the viewport the content scrolls in: without the vertical scrollbar, which sits on
// the left in a right-to-left scroller (clientLeft includes it there).
const scrollport = (vp: HTMLElement) => {
    const left = box(vp).left + vp.clientLeft;
    return { left, right: left + vp.clientWidth };
};

type Pinning = { left?: string[]; right?: string[] };
// By data row index: the header filter and column group rows shift aria-rowindex.
const bodyCell = (c: HTMLElement, row: number, field: string) =>
    c.querySelector<HTMLElement>(`.ogx__virtual-container [role="row"][data-rowindex="${row}"] [data-field="${field}"]`);

function PinnedRtlGrid({ onPinnedColumnsChange }: { onPinnedColumnsChange?: (m: Pinning) => void }) {
    return (
        <div dir="rtl" style={{ width: 640, height: 420 }}>
            <DataGrid rows={ROWS} columns={makeColumns()} height={420} cellSelection checkboxSelection pinCheckboxColumn headerFilters
                aggregationModel={{ c0: 'count', c1: 'count', c29: 'count' }}
                columnGroupingModel={[{ groupId: 'g', headerName: 'Group', children: ['c0', 'c1'] }]}
                pinnedColumns={{ left: ['c0', 'c1'], right: ['c29'] }} onPinnedColumnsChange={onPinnedColumnsChange} />
        </div>
    );
}

describe('RTL — pinned columns', () => {
    const pinnedParts = (c: HTMLElement) => {
        const q = (sel: string) => c.querySelector<HTMLElement>(sel)!;
        const footerStart = c.querySelectorAll<HTMLElement>('.ogx__aggregation-cell--pinned-left');
        return {
            checkboxHeader: q('.ogx__header [role="columnheader"][data-field="__checkbox_col__"]'),
            checkboxCell: q('.ogx__virtual-container [role="row"] [data-field="__checkbox_col__"]'),
            c0Header: header(c, 'c0')!,
            c1Header: header(c, 'c1')!,
            c1Cell: bodyCell(c, 0, 'c1')!,
            c1Filter: q('.ogx__header-filter-cell[data-field="c1"]'),
            c1Footer: footerStart[footerStart.length - 1],
            group: q('.ogx-col-group-row .ogx-col-group-cell--pinned-left:not(.ogx-col-group-cell--filler)'),
            c29Header: header(c, 'c29')!,
            c29Cell: bodyCell(c, 0, 'c29')!,
            c29Filter: q('.ogx__header-filter-cell[data-field="c29"]'),
            c29Footer: q('.ogx__aggregation-cell--pinned-right'),
        };
    };

    it('keeps left-pinned columns on the right (inline start) and right-pinned ones on the left while scrolling', async () => {
        const { container } = render(<PinnedRtlGrid />);
        await settle();
        const vp = viewport(container);
        const port = scrollport(vp);
        const parts = pinnedParts(container);
        for (const [name, el] of Object.entries(parts)) expect(el, name).toBeTruthy();

        // Start side (right): the checkbox column, then c0, c1; end side (left): c29.
        expect(Math.round(box(parts.checkboxHeader).right)).toBe(Math.round(port.right));
        expect(Math.round(box(parts.c0Header).right)).toBe(Math.round(box(parts.checkboxHeader).left));
        expect(Math.round(box(parts.c1Header).right)).toBe(Math.round(box(parts.c0Header).left));
        expect(nearestEdge(box(parts.c29Header).left, [port.left, box(vp).left])).toBeLessThan(1);

        const before = Object.fromEntries(Object.entries(parts).map(([k, el]) => [k, box(el)]));
        await scrollTo(vp, -900);
        expect(vp.scrollLeft).toBeLessThan(-800);
        const after = pinnedParts(container);
        for (const [name, el] of Object.entries(after)) {
            const b = box(el);
            expect(Math.abs(b.left - before[name].left), name).toBeLessThan(1);
            expect(Math.abs(b.right - before[name].right), name).toBeLessThan(1);
        }
        // Each row's pinned cells line up with the header, filter and footer cells.
        expect(Math.abs(box(after.c1Cell).left - box(after.c1Header).left)).toBeLessThan(1);
        expect(Math.abs(box(after.c1Filter).left - box(after.c1Header).left)).toBeLessThan(1);
        expect(Math.abs(box(after.c1Footer).left - box(after.c1Header).left)).toBeLessThan(1);
        expect(Math.abs(box(after.c29Footer).left - box(after.c29Header).left)).toBeLessThan(1);
        // The group header over c0 + c1 spans them.
        expect(Math.abs(box(after.group).left - box(after.c1Header).left)).toBeLessThan(1);
        expect(Math.abs(box(after.group).right - box(after.c0Header).right)).toBeLessThan(1);
    });

    it('casts the pinned shadows towards the scrolling columns', async () => {
        const { container } = render(<PinnedRtlGrid />);
        await settle();
        const c1 = bodyCell(container, 0, 'c1')!;
        const after = getComputedStyle(c1, '::after');
        // The shadow strip lies left of the last start-pinned cell, shaded from its right side.
        expect(after.left).toBe('-10px');
        expect(after.boxShadow).toMatch(/\) -10px 0px 8px -8px inset|inset -10px 0px 8px -8px/);
        const c29 = bodyCell(container, 0, 'c29')!;
        const before = getComputedStyle(c29, '::before');
        expect(before.right).toBe('-10px');
        expect(before.boxShadow).toMatch(/\) 10px 0px 8px -8px inset|inset 10px 0px 8px -8px/);
        expect(getComputedStyle(header(container, 'c0')!).boxShadow).toMatch(/\) -4px 0px/);
        expect(getComputedStyle(header(container, 'c29')!).boxShadow).toMatch(/\) 4px 0px/);
        // Section borders face the scrolling columns: the end-pinned cell's start (right) edge.
        expect(getComputedStyle(c29).borderRightWidth).toBe('1px');
    });

    it('keyboard moves scroll the focused column out from under the pinned sections', async () => {
        const { container } = render(<PinnedRtlGrid />);
        await settle();
        const vp = viewport(container);
        await userEvent.click(bodyCell(container, 0, 'c1')!);
        for (let i = 0; i < 10; i++) await userEvent.keyboard('{ArrowLeft}');
        await settle();
        expect(focusedField()).toBe('c11');
        const focused = box(document.activeElement!);
        expect(focused.right).toBeLessThanOrEqual(box(header(container, 'c1')!).left + 1);
        expect(focused.left).toBeGreaterThanOrEqual(box(header(container, 'c29')!).right - 1);
        for (let i = 0; i < 9; i++) await userEvent.keyboard('{ArrowRight}');
        await settle();
        expect(focusedField()).toBe('c2');
        // Back at the scroll start (see scrollOrigin): flush with the pinned c1.
        expect(Math.abs(box(document.activeElement!).right - box(header(container, 'c1')!).left + scrollOrigin(vp))).toBeLessThan(1);
        expect(vp.scrollLeft).toBe(scrollOrigin(vp));
    });

    it('draws the range and the fill handle next to a pinned column', async () => {
        const { container } = render(<PinnedRtlGrid />);
        await settle();
        await userEvent.click(bodyCell(container, 1, 'c1')!);
        await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}');
        await settle();
        expect(bodyCell(container, 1, 'c1')!.className).toContain('ogx__cell--range');
        expect(bodyCell(container, 1, 'c2')!.className).toContain('ogx__cell--range');
        const handle = container.querySelector<HTMLElement>('.ogx__cell-fill-handle')!;
        const c2 = bodyCell(container, 1, 'c2')!;
        expect(Math.abs(box(handle).left - box(c2).left)).toBeLessThan(1.5);
    });

    it('the column menu pins by screen side', async () => {
        const changes: Pinning[] = [];
        const { container } = render(<PinnedRtlGrid onPinnedColumnsChange={m => changes.push(m)} />);
        await settle();
        const h = header(container, 'c3')!;
        await act(async () => { h.querySelector<HTMLElement>('.ogx__menu-icon-btn')!.click(); });
        await settle();
        await act(async () => { document.querySelector<HTMLElement>('[aria-label="Pin to left"]')!.click(); });
        // The left of the screen is the inline end: pinnedColumns.right.
        expect(changes[changes.length - 1]?.right).toContain('c3');
        expect(changes[changes.length - 1]?.left ?? []).not.toContain('c3');
    });
});

const xScale = (el: Element) => {
    const t = getComputedStyle(el).transform;
    return t === 'none' ? 1 : new DOMMatrix(t).a;
};
type TreeRow = { id: number; path: string[]; c0: string };
const TREE: TreeRow[] = [{ id: 1, path: ['a'], c0: 'a' }, { id: 2, path: ['a', 'b'], c0: 'b' }];

describe('RTL — icons', () => {
    function IconGrids({ dir }: { dir?: 'rtl' }) {
        return (
            <div dir={dir} style={{ width: 500 }}>
                <DataGrid rows={ROWS} columns={makeColumns().slice(0, 3)} height={300} pagination pageSizeOptions={[10]}
                    sortModel={[{ field: 'c0', sort: 'asc' }]} />
                <DataGrid rows={TREE} columns={[{ field: 'c0', width: 200 }]} height={200} treeData getTreeDataPath={r => r.path} />
            </div>
        );
    }

    it('mirrors the pagination arrows and the tree expand chevron, not the sort arrow', async () => {
        const { container } = render(<IconGrids dir="rtl" />);
        await settle();
        expect(xScale(container.querySelector('[aria-label="Go to next page"] svg')!)).toBe(-1);
        expect(xScale(container.querySelector('[aria-label="Go to previous page"] svg')!)).toBe(-1);
        expect(xScale(container.querySelector('.ogx-expand-icon__chevron')!)).toBe(-1);
        expect(xScale(container.querySelector('.ogx__sort-icon')!)).toBe(1);
    });

    it('leaves them as they were left to right', async () => {
        const { container } = render(<IconGrids />);
        await settle();
        expect(getComputedStyle(container.querySelector('[aria-label="Go to next page"] svg')!).transform).toBe('none');
        expect(xScale(container.querySelector('.ogx-expand-icon__chevron')!)).toBe(1);
    });
});

describe('RTL — switching direction and reordering', () => {
    function Switchable({ dir }: { dir: 'rtl' | 'ltr' }) {
        return (
            <div dir={dir} style={{ width: 400, height: 360 }}>
                <DataGrid rows={ROWS} columns={makeColumns()} height={360} pinnedColumns={{ left: ['c0'] }} />
            </div>
        );
    }
    const visibleFields = (c: HTMLElement) => {
        const vpBox = box(viewport(c));
        return Array.from(c.querySelectorAll<HTMLElement>('.ogx__virtual-container [role="row"][aria-rowindex="2"] [role="gridcell"]'))
            .filter(el => { const b = box(el); return b.right > vpBox.left + 1 && b.left < vpBox.right - 1 && b.width > 0; })
            .map(el => el.dataset.field);
    };

    it('renders the columns in view after dir changes on a scrolled grid', async () => {
        const { container, rerender } = render(<Switchable dir="ltr" />);
        await settle();
        const vp = viewport(container);
        await scrollTo(vp, 1500);
        rerender(<Switchable dir="rtl" />);
        await settle();
        let fields = visibleFields(container);
        expect(fields).toContain('c0');
        // Whatever scroll position the browser kept, the cells in view are rendered (no blank body).
        expect(fields.length).toBeGreaterThan(2);
        expect(Math.round(box(header(container, 'c0')!).right)).toBe(Math.round(scrollport(vp).right));
        rerender(<Switchable dir="ltr" />);
        await settle();
        fields = visibleFields(container);
        expect(fields).toContain('c0');
        expect(fields.length).toBeGreaterThan(2);
        expect(Math.round(box(header(container, 'c0')!).left)).toBe(Math.round(box(vp).left));
    });

    it('reorders columns by dragging a header', async () => {
        const changes: { oldIndex: number; targetIndex: number }[] = [];
        const { container } = render(
            <div dir="rtl" style={{ width: 600, height: 300 }}>
                <DataGrid rows={ROWS} columns={makeColumns().slice(0, 4)} height={300}
                    onColumnOrderChange={p => changes.push({ oldIndex: p.oldIndex, targetIndex: p.targetIndex })} />
            </div>,
        );
        await settle();
        await userEvent.dragAndDrop(header(container, 'c0')!, header(container, 'c2')!);
        await settle();
        expect(changes[changes.length - 1]).toEqual({ oldIndex: 0, targetIndex: 2 });
        const order = Array.from(container.querySelectorAll<HTMLElement>('.ogx__header [role="columnheader"][data-field^="c"]'))
            .sort((a, b) => box(b).right - box(a).right).map(el => el.dataset.field);
        expect(order.indexOf('c0')).toBeGreaterThan(order.indexOf('c1'));
    });
});
