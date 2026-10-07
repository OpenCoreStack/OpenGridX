import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { userEvent, commands, page } from 'vitest/browser';
import { useLayoutEffect } from 'react';
import type { ReactNode } from 'react';
import '../../styles/opengridx.css';
import { DataGrid } from '../../index';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type { DataGridProps, GridApi, GridCellSelectionModel, GridColDef } from '../../types';

// Cell range selection in Chromium, Firefox and WebKit: real pointer drags (Playwright mouse, held
// down while the grid auto-scrolls), virtualization, focus, the clipboard text and the layout of
// the range outline.

declare module 'vitest/browser' {
    interface BrowserCommands {
        // Defined in vitest.config.ts: Playwright mouse input, which every engine supports.
        pointerMoveTo: (selector: string, x?: number, y?: number) => Promise<void>;
        pointerDown: () => Promise<void>;
        pointerUp: () => Promise<void>;
    }
}

type Row = { id: number; [k: string]: unknown };

const makeRows = (n: number, cols = 4): Row[] => Array.from({ length: n }, (_, i) => {
    const r: Row = { id: i + 1 };
    for (let c = 0; c < cols; c++) r[`c${c}`] = c === 0 ? `r${i + 1}` : (i + 1) * 10 + c;
    return r;
});
const makeCols = (n: number, width = 120): GridColDef<Row>[] =>
    Array.from({ length: n }, (_, c) => ({ field: `c${c}`, headerName: `C${c}`, width, type: c === 0 ? 'string' : 'number' }));

const Box = ({ children, h = 360, w = 600 }: { children: ReactNode; h?: number; w?: number }) => (
    <div>
        {/* Page text next to the grid: a drag must not leave a text selection on it (WebKit extended one). */}
        <p style={{ margin: 0 }}>Text above the grid</p>
        <div data-testid="box" style={{ height: h, width: w, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
        </div>
        <div data-testid="below" style={{ height: 200, width: w + 300 }} />
    </div>
);

const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
const settle = async () => { for (let i = 0; i < 4; i++) await frame(); };
const viewport = (c: HTMLElement) => c.querySelector<HTMLElement>('.ogx__viewport')!;
const cellSelector = (rowIndex: number, field: string) =>
    `.ogx__viewport [role="row"][data-rowindex="${rowIndex}"] [data-field="${field}"]`;
const cellAt = (c: HTMLElement, rowIndex: number, field: string) => c.querySelector<HTMLElement>(cellSelector(rowIndex, field));
const rangeCells = (c: HTMLElement) =>
    Array.from(c.querySelectorAll<HTMLElement>('.ogx__cell--range')).map(
        el => `${el.closest('[role="row"]')?.getAttribute('data-rowindex')}:${el.dataset.field}`
    );

let copied: string[] = [];
beforeEach(async () => {
    // Room for the grid plus the strips around it that the pointer rests on.
    await page.viewport(1200, 900);
    copied = [];
    // Captures what the grid writes; the real clipboard needs permissions that differ per engine.
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: (text: string) => { copied.push(text); return Promise.resolve(); } },
        configurable: true,
        writable: true,
    });
});
afterEach(async () => {
    await commands.pointerUp().catch(() => {});
    cleanup();
    Reflect.deleteProperty(navigator, 'clipboard');
});

function renderGrid(props: Partial<DataGridProps<Row>> & { rows: Row[]; columns: GridColDef<Row>[] }, box: { h?: number; w?: number } = {}) {
    const holder: { api: React.MutableRefObject<GridApi> | null } = { api: null };
    const models: GridCellSelectionModel[] = [];
    function Harness() {
        const apiRef = useGridApiRef();
        useLayoutEffect(() => { holder.api = apiRef; }, [apiRef]);
        return (
            <Box {...box}>
                <DataGrid<Row>
                    apiRef={apiRef}
                    cellSelection
                    height="100%"
                    onCellSelectionModelChange={(m) => { models.push(m); }}
                    {...props}
                />
            </Box>
        );
    }
    const utils = render(<Harness />);
    return { ...utils, api: () => holder.api!.current, models, lastModel: () => models[models.length - 1] };
}

describe('cellSelection: pointer drag', () => {
    it('dragging selects the rectangle, keeps focus on the anchor and leaves the row selection alone', async () => {
        const onRowSelectionModelChange = vi.fn();
        const { container, lastModel } = renderGrid({ rows: makeRows(20), columns: makeCols(4), onRowSelectionModelChange });
        await expect.poll(() => cellAt(container, 0, 'c0')).not.toBeNull();

        await commands.pointerMoveTo(cellSelector(0, 'c0'));
        await commands.pointerDown();
        await commands.pointerMoveTo(cellSelector(1, 'c1'));
        await commands.pointerMoveTo(cellSelector(2, 'c2'));
        await expect.poll(() => container.querySelector('.ogx')!.classList.contains('ogx--range-dragging')).toBe(true);
        await commands.pointerUp();
        await settle();

        expect(lastModel()).toEqual([{ anchor: { id: 1, field: 'c0' }, head: { id: 3, field: 'c2' } }]);
        expect(rangeCells(container)).toEqual(['0:c0', '0:c1', '0:c2', '1:c0', '1:c1', '1:c2', '2:c0', '2:c1', '2:c2']);
        expect(container.querySelector('.ogx')!.classList.contains('ogx--range-dragging')).toBe(false);
        expect(document.activeElement).toBe(cellAt(container, 0, 'c0'));
        expect(onRowSelectionModelChange).not.toHaveBeenCalledWith([3]);
        expect(window.getSelection()?.toString() ?? '').toBe('');
    });

    it('auto-scrolls down over virtualized rows while the pointer is held below the grid', async () => {
        const { container, lastModel } = renderGrid({ rows: makeRows(400), columns: makeCols(4) });
        await expect.poll(() => cellAt(container, 1, 'c0')).not.toBeNull();
        const vp = viewport(container);

        await commands.pointerMoveTo(cellSelector(1, 'c0'));
        await commands.pointerDown();
        await commands.pointerMoveTo(cellSelector(2, 'c1'));
        // Rest the pointer below the grid: the viewport keeps scrolling on its own.
        await commands.pointerMoveTo('[data-testid="below"]', 180, 120);
        await expect.poll(() => vp.scrollTop, { timeout: 8000 }).toBeGreaterThan(2000);
        await commands.pointerUp();
        await settle();

        const model = lastModel();
        expect(model[0].anchor).toEqual({ id: 2, field: 'c0' });
        const headId = Number(model[0].head.id);
        // The head follows the scroll: far past the rows that were rendered when the drag started.
        expect(headId).toBeGreaterThan(30);
        expect(model[0].head.field).toBe('c1');
        // The head row is on screen and drawn as the bottom edge of the range.
        const headCell = cellAt(container, headId - 1, 'c1');
        expect(headCell).not.toBeNull();
        expect(headCell!.classList.contains('ogx__cell--range-bottom')).toBe(true);
        // Scrolling stopped with the button.
        const top = vp.scrollTop;
        await settle();
        expect(vp.scrollTop).toBe(top);
    });

    it('auto-scrolls right over virtualized columns while the pointer is held right of the grid', async () => {
        const { container, lastModel } = renderGrid({ rows: makeRows(10, 40), columns: makeCols(40, 100) }, { w: 500 });
        await expect.poll(() => cellAt(container, 0, 'c1')).not.toBeNull();
        const vp = viewport(container);

        await commands.pointerMoveTo(cellSelector(0, 'c1'));
        await commands.pointerDown();
        await commands.pointerMoveTo(cellSelector(1, 'c2'));
        // 100px right of the grid, at the height of the second row.
        const box = container.querySelector<HTMLElement>('[data-testid="box"]')!.getBoundingClientRect();
        const row1 = cellAt(container, 1, 'c2')!.getBoundingClientRect();
        await commands.pointerMoveTo('[data-testid="box"]', box.width + 100, row1.top - box.top + row1.height / 2);
        await expect.poll(() => vp.scrollLeft, { timeout: 8000 }).toBeGreaterThan(1500);
        await commands.pointerUp();
        await settle();

        const model = lastModel();
        expect(model[0].anchor).toEqual({ id: 1, field: 'c1' });
        expect(model[0].head.id).toBe(2);
        expect(Number(String(model[0].head.field).slice(1))).toBeGreaterThan(15);
    });
});

describe('cellSelection: Shift+click, copy and announcement', () => {
    it('Shift+click extends the range, and Ctrl+C copies it as TSV', async () => {
        const { container, lastModel } = renderGrid({ rows: makeRows(10), columns: makeCols(4) });
        await expect.poll(() => cellAt(container, 0, 'c0')).not.toBeNull();
        await userEvent.click(cellAt(container, 1, 'c1')!);
        await userEvent.click(cellAt(container, 3, 'c3')!, { modifiers: ['Shift'] });
        await settle();
        expect(lastModel()).toEqual([{ anchor: { id: 2, field: 'c1' }, head: { id: 4, field: 'c3' } }]);
        expect(document.activeElement).toBe(cellAt(container, 1, 'c1'));

        await userEvent.keyboard('{Control>}c{/Control}');
        await expect.poll(() => copied.length).toBe(1);
        expect(copied[0]).toBe('21\t22\t23\n31\t32\t33\n41\t42\t43');
    });

    it('Shift+arrows extend the range from the keyboard and the live region announces its size', async () => {
        const { container } = renderGrid({ rows: makeRows(10), columns: makeCols(4) });
        await expect.poll(() => cellAt(container, 0, 'c0')).not.toBeNull();
        await userEvent.click(cellAt(container, 0, 'c0')!);
        await userEvent.keyboard('{Shift>}{ArrowRight}{ArrowRight}{ArrowDown}{/Shift}');
        await settle();
        expect(rangeCells(container)).toHaveLength(6);
        const status = container.querySelector<HTMLElement>('[role="status"]')!;
        await expect.poll(() => status.textContent?.trim()).toBe('6 cells selected, 2 rows by 3 columns');
        await userEvent.keyboard('{Escape}');
        await settle();
        expect(rangeCells(container)).toEqual([]);
        await expect.poll(() => status.textContent?.trim()).toBe('');
    });

    it('the status bar shows the totals of a dragged range', async () => {
        const { container } = renderGrid({ rows: makeRows(10), columns: makeCols(4), showCellSelectionStats: true });
        await expect.poll(() => cellAt(container, 0, 'c1')).not.toBeNull();
        await commands.pointerMoveTo(cellSelector(0, 'c1'));
        await commands.pointerDown();
        await commands.pointerMoveTo(cellSelector(1, 'c2'));
        await commands.pointerUp();
        await settle();
        const stat = (name: string) => container.querySelector(`[data-stat="${name}"]`)?.textContent;
        // 11, 12, 21, 22.
        expect(stat('count')).toBe('4');
        expect(stat('sum')).toBe((66).toLocaleString());
        expect(stat('average')).toBe((16.5).toLocaleString(undefined, { maximumFractionDigits: 2 }));
    });
});

describe('cellSelection: layout', () => {
    it('the range outline moves no cell and no cell content', async () => {
        const { container, api } = renderGrid({ rows: makeRows(10), columns: makeCols(4), showCellSelectionStats: true });
        await expect.poll(() => cellAt(container, 0, 'c0')).not.toBeNull();
        await settle();
        const measure = () => [0, 1, 2, 3].flatMap(r => ['c0', 'c1', 'c2', 'c3'].map(f => {
            const cell = cellAt(container, r, f)!;
            const a = cell.getBoundingClientRect();
            const b = cell.querySelector<HTMLElement>('.ogx__cell-content')!.getBoundingClientRect();
            return [a.left, a.top, a.width, a.height, b.left, b.top, b.width, b.height].map(v => Math.round(v * 100) / 100).join(',');
        }));
        const viewportHeight = () => viewport(container).getBoundingClientRect().height;
        const before = measure();
        const heightBefore = viewportHeight();
        act(() => { api().selectCellRange({ id: 2, field: 'c1' }, { id: 3, field: 'c2' }); });
        await settle();
        expect(rangeCells(container)).toHaveLength(4);
        const edge = cellAt(container, 1, 'c1')!;
        expect(getComputedStyle(edge).boxShadow).toContain('inset');
        expect(measure()).toEqual(before);
        // The status bar keeps its height whether or not a range is selected.
        expect(viewportHeight()).toBe(heightBefore);
    });
});
