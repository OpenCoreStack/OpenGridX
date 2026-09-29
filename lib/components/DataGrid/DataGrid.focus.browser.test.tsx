import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import type { ReactNode } from 'react';
import { DataGrid } from '../../index';
import type { GridColDef } from '../../types';

// Runs in real Chromium (vitest browser project): real focus, Tab navigation, scrolling and
// virtualization. jsdom cannot show any of these behaviours.

type Row = { id: number; [k: string]: unknown };

const makeRows = (n: number, cols = 3): Row[] => Array.from({ length: n }, (_, i) => {
    const r: Row = { id: i + 1 };
    for (let c = 0; c < cols; c++) r[`c${c}`] = `r${i + 1}c${c}`;
    return r;
});
const makeCols = (n: number, width = 150): GridColDef<Row>[] =>
    Array.from({ length: n }, (_, c) => ({ field: `c${c}`, width }));

const Box = ({ children, h = 400, w = 600 }: { children: ReactNode; h?: number; w?: number }) => (
    <div style={{ height: h, width: w, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
);

const viewport = (c: HTMLElement) => c.querySelector<HTMLElement>('.ogx__viewport')!;
const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
const settle = async () => { for (let i = 0; i < 4; i++) await frame(); };
const cellByText = (c: HTMLElement, text: string) =>
    Array.from(c.querySelectorAll<HTMLElement>('[role="gridcell"]')).find(el => el.textContent === text) ?? null;
const activeText = () => (document.activeElement as HTMLElement | null)?.textContent ?? '';
const activeField = () => (document.activeElement as HTMLElement | null)?.dataset.field;
const scrollTo = async (el: HTMLElement, pos: { top?: number; left?: number }) => {
    if (pos.top !== undefined) el.scrollTop = pos.top;
    if (pos.left !== undefined) el.scrollLeft = pos.left;
    el.dispatchEvent(new Event('scroll'));
    await settle();
};

afterEach(() => { cleanup(); });

describe('focus survives virtualization', () => {
    it('keeps focus in the grid when the focused row scrolls out of the render window', async () => {
        const { container } = render(<Box><DataGrid rows={makeRows(300)} columns={makeCols(3)} height="100%" /></Box>);
        await expect.poll(() => cellByText(container, 'r1c0')).not.toBeNull();
        await userEvent.click(cellByText(container, 'r1c0')!);
        await settle();
        await scrollTo(viewport(container), { top: 5000 });
        expect(cellByText(container, 'r1c0')).toBeNull();
        expect(viewport(container).contains(document.activeElement)).toBe(true);
        await userEvent.keyboard('{ArrowDown}');
        await settle();
        expect(activeText()).toBe('r2c0');
        expect(viewport(container).scrollTop).toBeLessThan(200);
    });

    it('focuses a header cell that End brings into the horizontal render window', async () => {
        const { container } = render(<Box><DataGrid rows={makeRows(5, 30)} columns={makeCols(30)} height="100%" /></Box>);
        await expect.poll(() => container.querySelector('[role="columnheader"][data-field="c0"]')).not.toBeNull();
        await userEvent.click(container.querySelector<HTMLElement>('[role="columnheader"][data-field="c0"] .ogx__header-cell-title')!);
        await settle();
        await userEvent.keyboard('{End}');
        await expect.poll(() => activeField()).toBe('c29');
        await userEvent.keyboard('{Home}');
        await expect.poll(() => activeField()).toBe('c0');
        await userEvent.keyboard('{ArrowDown}');
        await settle();
        expect(activeText()).toBe('r1c0');
    });

    it('scrolls an unpinned checkbox column into view when Home moves onto it', async () => {
        const { container } = render(
            <Box><DataGrid rows={makeRows(5, 30)} columns={makeCols(30)} height="100%" checkboxSelection pinCheckboxColumn={false} /></Box>
        );
        await expect.poll(() => container.querySelector('[role="gridcell"][data-field="c0"]')).not.toBeNull();
        await scrollTo(viewport(container), { left: 2000 });
        await userEvent.click(cellByText(container, 'r2c15')!);
        await userEvent.keyboard('{Home}');
        await settle();
        const focused = container.querySelector<HTMLElement>('.ogx__cell--focused')!;
        expect(focused.classList.contains('ogx__cell--checkbox')).toBe(true);
        expect(document.activeElement).toBe(focused);
        expect(focused.getBoundingClientRect().left).toBeGreaterThanOrEqual(viewport(container).getBoundingClientRect().left - 1);
    });
});

describe('focus across blur and re-entry', () => {
    it('keeps navigating after the window loses and regains focus', async () => {
        const { container } = render(<Box><DataGrid rows={makeRows(10)} columns={makeCols(2, 100)} height="100%" /></Box>);
        await expect.poll(() => cellByText(container, 'r1c0')).not.toBeNull();
        const cell = cellByText(container, 'r1c0')!;
        await userEvent.click(cell);
        await frame();
        // What the browser dispatches on the focused element when the window is left and re-entered.
        cell.dispatchEvent(new FocusEvent('blur', { relatedTarget: null }));
        cell.dispatchEvent(new FocusEvent('focusout', { relatedTarget: null, bubbles: true }));
        await frame();
        cell.dispatchEvent(new FocusEvent('focus', { relatedTarget: null }));
        cell.dispatchEvent(new FocusEvent('focusin', { relatedTarget: null, bubbles: true }));
        await frame();
        expect(container.querySelector('.ogx__cell--focused')?.textContent).toBe('r1c0');
        await userEvent.keyboard('{ArrowDown}');
        await settle();
        expect(container.querySelector('.ogx__cell--focused')?.textContent).toBe('r2c0');
        expect(activeText()).toBe('r2c0');
    });

    // Tab anchors are text inputs, not buttons: WebKit on macOS skips buttons on Tab by default.
    it('Shift+Tab back into a scrolled grid restores the last focused cell', async () => {
        const { container, getByLabelText } = render(
            <div>
                <Box><DataGrid rows={makeRows(300)} columns={makeCols(3)} height="100%" /></Box>
                <input aria-label="after" />
            </div>
        );
        await expect.poll(() => cellByText(container, 'r1c0')).not.toBeNull();
        await scrollTo(viewport(container), { top: 3000 });
        const target = Array.from(container.querySelectorAll<HTMLElement>('[role="gridcell"][data-field="c1"]'))[5];
        const text = target.textContent!;
        await userEvent.click(target);
        await settle();
        await userEvent.keyboard('{Tab}');
        await settle();
        expect(document.activeElement).toBe(getByLabelText('after'));
        expect(container.querySelector('.ogx--kb .ogx__cell--focused')).toBeNull();
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
        await settle();
        expect(activeText()).toBe(text);
        const scrollTop = viewport(container).scrollTop;
        await userEvent.keyboard('{ArrowDown}');
        await settle();
        const [, r, c] = /^r(\d+)c(\d+)$/.exec(text)!;
        expect(activeText()).toBe(`r${Number(r) + 1}c${c}`);
        expect(Math.abs(viewport(container).scrollTop - scrollTop)).toBeLessThan(100);
    });

    it('Tab leaves the grid in one press from any cell, even with checkbox and detail columns', async () => {
        const { container, getByLabelText } = render(
            <div>
                <input aria-label="before" />
                <Box><DataGrid rows={makeRows(50)} columns={makeCols(3, 100)} height="100%" checkboxSelection getDetailPanelContent={() => null} /></Box>
                <input aria-label="after" />
            </div>
        );
        await expect.poll(() => cellByText(container, 'r3c1')).not.toBeNull();
        await userEvent.click(cellByText(container, 'r3c1')!);
        await userEvent.keyboard('{Tab}');
        expect(document.activeElement).toBe(getByLabelText('after'));
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
        expect(activeText()).toBe('r3c1');
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
        expect(document.activeElement).toBe(getByLabelText('before'));
    });

    it('Tab from a cell reaches an input inside an expanded detail panel', async () => {
        const { container, getByTestId } = render(
            <Box><DataGrid rows={makeRows(5)} columns={makeCols(3, 100)} height="100%"
                getDetailPanelContent={() => <input data-testid="panel-input" />}
                getDetailPanelHeight={() => 60} detailPanelExpandedRowIds={new Set([1])} /></Box>
        );
        await expect.poll(() => cellByText(container, 'r1c2')).not.toBeNull();
        await userEvent.click(cellByText(container, 'r1c2')!);
        await userEvent.keyboard('{Tab}');
        const input = getByTestId('panel-input');
        expect(document.activeElement).toBe(input);
        await userEvent.keyboard('hello world{ArrowLeft}{Home}');
        expect((input as HTMLInputElement).value).toBe('hello world');
        expect(document.activeElement).toBe(input);
        expect(container.querySelector('.ogx__detail-panel')).not.toBeNull();
    });
});

describe('keys that must not scroll the viewport', () => {
    it('Space on a focused data cell does not scroll the grid or lose focus', async () => {
        const { container } = render(<Box><DataGrid rows={makeRows(300)} columns={makeCols(3)} height="100%" /></Box>);
        await expect.poll(() => cellByText(container, 'r1c0')).not.toBeNull();
        await userEvent.click(cellByText(container, 'r1c0')!);
        await settle();
        await userEvent.keyboard(' ');
        await settle();
        expect(viewport(container).scrollTop).toBe(0);
        expect(activeText()).toBe('r1c0');
    });

    it('ArrowUp on the header row does not scroll the grid', async () => {
        const { container } = render(<Box><DataGrid rows={makeRows(300)} columns={makeCols(3)} height="100%" /></Box>);
        await expect.poll(() => cellByText(container, 'r1c0')).not.toBeNull();
        await scrollTo(viewport(container), { top: 1000 });
        await userEvent.click(container.querySelector<HTMLElement>('[role="columnheader"][data-field="c1"] .ogx__header-cell-title')!);
        await settle();
        const before = viewport(container).scrollTop;
        await userEvent.keyboard('{ArrowUp}{ArrowUp}');
        await settle();
        expect(viewport(container).scrollTop).toBe(before);
        expect(activeField()).toBe('c1');
    });

    it('ArrowDown onto a row with a tall expanded detail panel keeps that row visible', async () => {
        const rows = makeRows(20, 2);
        const { container } = render(
            <Box h={400} w={400}><DataGrid rows={rows} columns={makeCols(2, 100)} height="100%"
                getDetailPanelContent={({ row }) => <div>panel {row.id}</div>}
                getDetailPanelHeight={() => 500}
                detailPanelExpandedRowIds={new Set([3])} /></Box>
        );
        await expect.poll(() => cellByText(container, 'r1c0')).not.toBeNull();
        await userEvent.click(cellByText(container, 'r1c0')!);
        await userEvent.keyboard('{ArrowDown}{ArrowDown}');
        await settle();
        const header = container.querySelector<HTMLElement>('.ogx__header')!.getBoundingClientRect();
        const vpRect = viewport(container).getBoundingClientRect();
        const r3 = container.querySelector<HTMLElement>('.ogx__cell--focused')!;
        expect(r3.textContent).toBe('r3c0');
        const rect = r3.getBoundingClientRect();
        expect(rect.top).toBeGreaterThanOrEqual(header.bottom - 1);
        expect(rect.bottom).toBeLessThanOrEqual(vpRect.bottom + 1);
    });
});

describe('interactive content inside cells', () => {
    it('an input rendered by renderCell can be clicked and typed into', async () => {
        const cols: GridColDef<Row>[] = [{ field: 'c0', width: 200, renderCell: () => <input data-testid="rc-input" /> }, { field: 'c1', width: 100 }];
        const { getAllByTestId } = render(<Box><DataGrid rows={makeRows(3, 2)} columns={cols} height="100%" /></Box>);
        await expect.poll(() => getAllByTestId('rc-input').length).toBe(3);
        const input = getAllByTestId('rc-input')[0] as HTMLInputElement;
        await userEvent.click(input);
        await settle();
        expect(document.activeElement).toBe(input);
        await userEvent.keyboard('ab cd{ArrowLeft}x');
        expect(input.value).toBe('ab cxd');
    });

    it('a space typed into a detail-panel input does not collapse the panel', async () => {
        const { container, getByTestId } = render(
            <Box><DataGrid rows={makeRows(3)} columns={makeCols(3, 100)} height="100%"
                getDetailPanelContent={() => <input data-testid="panel-input" />} getDetailPanelHeight={() => 60} /></Box>
        );
        await expect.poll(() => container.querySelector('[role="row"][data-rowindex="0"] .ogx__cell--expand')).not.toBeNull();
        const expandCell = container.querySelector<HTMLElement>('[role="row"][data-rowindex="0"] .ogx__cell--expand')!;
        // Clicking the cell padding (not the button) makes the expand column the focused cell.
        await userEvent.click(expandCell, { position: { x: 2, y: 2 } });
        await userEvent.click(expandCell.querySelector('button')!);
        await settle();
        const input = getByTestId('panel-input') as HTMLInputElement;
        await userEvent.click(input);
        await userEvent.keyboard('hello world');
        expect(input.value).toBe('hello world');
        expect(container.querySelector('.ogx__detail-panel')).not.toBeNull();
    });
});
