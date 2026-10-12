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
        expect(Math.round(box(header(container, 'c0')!).right)).toBe(Math.round(vp.right));
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
        expect(Math.round(box(header(container, 'c0')!).right)).toBe(Math.round(box(viewport(container)).right));
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
        expect(Math.round(box(handle).left)).toBe(Math.round(box(c).left));
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
        expect(vp.scrollLeft).toBe(0);
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
        expect(Math.abs(box(header(container, 'c11')!).right - (vpBox.left + vp.clientWidth))).toBeLessThan(1);

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
