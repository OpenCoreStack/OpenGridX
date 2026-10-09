import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { userEvent, commands, page } from 'vitest/browser';
import { useLayoutEffect, useState } from 'react';
import type { ReactNode } from 'react';
import '../../styles/opengridx.css';
import { DataGrid } from '../../index';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type { DataGridProps, GridApi, GridColDef, GridFillResult } from '../../types';

// Fill handle (v3.5) in Chromium, Firefox and WebKit: real pointer drags of the handle (Playwright
// mouse, held while the grid auto-scrolls), Alt at release, touch pointer events, Ctrl/Cmd+D and
// Ctrl/Cmd+R from the keyboard, undo, and where the handle is drawn (pinned columns included).

declare module 'vitest/browser' {
    interface BrowserCommands {
        // Defined in vitest.config.ts: Playwright mouse input, which every engine supports.
        pointerMoveTo: (selector: string, x?: number, y?: number) => Promise<void>;
        pointerDown: () => Promise<void>;
        pointerUp: () => Promise<void>;
    }
}

const MOD = /Mac|iPhone|iPad/.test(navigator.platform) ? 'Meta' : 'Control';

type Row = { id: number; [k: string]: unknown };

/** Column c0 holds text, the others numbers; every number is 0 except the first two rows / columns. */
const makeRows = (n: number, cols = 4): Row[] => Array.from({ length: n }, (_, i) => {
    const r: Row = { id: i + 1 };
    for (let c = 0; c < cols; c++) r[`c${c}`] = c === 0 ? `r${i + 1}` : 0;
    return r;
});
const makeCols = (n: number, width = 120): GridColDef<Row>[] =>
    Array.from({ length: n }, (_, c) => ({
        field: `c${c}`, headerName: `C${c}`, width, type: c === 0 ? 'string' : 'number', editable: true,
    }));

const Box = ({ children, h = 360, w = 600 }: { children: ReactNode; h?: number; w?: number }) => (
    <div>
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
const HANDLE = '.ogx__viewport .ogx__cell-fill-handle';
const handleCell = (c: HTMLElement) => {
    const cell = c.querySelector(HANDLE)?.closest<HTMLElement>('.ogx__cell');
    return cell ? `${cell.closest('[role="row"]')?.getAttribute('data-rowindex')}:${cell.dataset.field}` : null;
};

beforeEach(async () => {
    await page.viewport(1200, 900);
});
afterEach(async () => {
    await commands.pointerUp().catch(() => {});
    await userEvent.keyboard('{/Alt}').catch(() => {});
    cleanup();
});

function renderGrid(
    props: Partial<DataGridProps<Row>> & { rows: Row[]; columns: GridColDef<Row>[] },
    box: { h?: number; w?: number } = {},
) {
    const holder: { api: { current: GridApi } | null; rows: () => Row[] } = { api: null, rows: () => [] };
    const fills: GridFillResult[] = [];
    function Harness() {
        const apiRef = useGridApiRef();
        const [rows, setRows] = useState(props.rows);
        useLayoutEffect(() => {
            holder.api = apiRef;
            holder.rows = () => rows;
        });
        return (
            <Box {...box}>
                <DataGrid<Row>
                    apiRef={apiRef}
                    cellSelection
                    undoRedo
                    height="100%"
                    onFill={(r) => { fills.push(r); }}
                    {...props}
                    rows={rows}
                    processRowUpdate={(row) => {
                        setRows(prev => prev.map(r => (r.id === row.id ? row : r)));
                        return row;
                    }}
                />
            </Box>
        );
    }
    const utils = render(<Harness />);
    return { ...utils, api: () => holder.api!.current, rows: () => holder.rows(), fills };
}

async function select(api: () => GridApi, a: [number, string], h: [number, string]) {
    api().selectCellRange({ id: a[0], field: a[1] }, { id: h[0], field: h[1] });
    await settle();
}

describe('fill handle: pointer drag', () => {
    it('drags down past the grid, auto-scrolls and continues the series to the row under the pointer', async () => {
        const rows = makeRows(400);
        rows[0].c1 = 1;
        rows[1].c1 = 2;
        const g = renderGrid({ rows, columns: makeCols(4) });
        await expect.poll(() => cellAt(g.container, 1, 'c1')).not.toBeNull();
        await select(g.api, [1, 'c1'], [2, 'c1']);
        await expect.poll(() => handleCell(g.container)).toBe('1:c1');
        const vp = viewport(g.container);

        await commands.pointerMoveTo(HANDLE);
        await commands.pointerDown();
        await commands.pointerMoveTo(cellSelector(3, 'c1'));
        await commands.pointerMoveTo('[data-testid="below"]', 130, 120);
        await expect.poll(() => vp.scrollTop, { timeout: 8000 }).toBeGreaterThan(2000);
        await commands.pointerUp();
        await expect.poll(() => g.fills.length).toBe(1);
        await settle();

        const model = g.api().getCellSelectionModel();
        expect(model[0].anchor).toEqual({ id: 1, field: 'c1' });
        expect(model[0].head.field).toBe('c1');
        const last = Number(model[0].head.id);
        expect(last).toBeGreaterThan(30);
        // Every filled cell continues 1, 2, …; nothing past the head and no other column changed.
        const current = g.rows();
        for (let i = 0; i < last; i++) expect(current[i].c1).toBe(i + 1);
        expect(current[last].c1).toBe(0);
        expect(current.every(r => r.c2 === 0)).toBe(true);
        expect(g.fills[0].direction).toBe('down');
        expect(g.fills[0].updated).toHaveLength(last - 2);
        // The handle followed the range to its new corner.
        await expect.poll(() => handleCell(g.container)).toBe(`${last - 1}:c1`);
    });

    it('drags right past the grid over virtualized columns', async () => {
        const rows = makeRows(10, 40);
        rows[0].c1 = 5;
        rows[0].c2 = 10;
        const g = renderGrid({ rows, columns: makeCols(40, 100) }, { w: 500 });
        await expect.poll(() => cellAt(g.container, 0, 'c2')).not.toBeNull();
        await select(g.api, [1, 'c1'], [1, 'c2']);
        const vp = viewport(g.container);

        await commands.pointerMoveTo(HANDLE);
        await commands.pointerDown();
        const box = g.container.querySelector<HTMLElement>('[data-testid="box"]')!.getBoundingClientRect();
        const row0 = cellAt(g.container, 0, 'c2')!.getBoundingClientRect();
        await commands.pointerMoveTo('[data-testid="box"]', box.width + 100, row0.top - box.top + row0.height / 2);
        await expect.poll(() => vp.scrollLeft, { timeout: 8000 }).toBeGreaterThan(1500);
        await commands.pointerUp();
        await expect.poll(() => g.fills.length).toBe(1);

        const model = g.api().getCellSelectionModel();
        const lastCol = Number(String(model[0].head.field).slice(1));
        expect(lastCol).toBeGreaterThan(15);
        expect(model[0].head.id).toBe(1);
        const first = g.rows()[0];
        for (let c = 1; c <= lastCol; c++) expect(first[`c${c}`]).toBe(c * 5);
        expect(g.rows()[1].c3).toBe(0);
        expect(g.fills[0].direction).toBe('right');
    });

    it('Alt held at release copies the source pattern instead of the series; Ctrl/Cmd+Z undoes it in one step', async () => {
        const rows = makeRows(12);
        rows[0].c1 = 1;
        rows[1].c1 = 2;
        const g = renderGrid({ rows, columns: makeCols(4) });
        await expect.poll(() => cellAt(g.container, 1, 'c1')).not.toBeNull();
        await select(g.api, [1, 'c1'], [2, 'c1']);

        await commands.pointerMoveTo(HANDLE);
        await commands.pointerDown();
        await commands.pointerMoveTo(cellSelector(3, 'c1'));
        await commands.pointerMoveTo(cellSelector(5, 'c1'));
        await userEvent.keyboard('{Alt>}');
        await commands.pointerUp();
        await userEvent.keyboard('{/Alt}');
        await expect.poll(() => g.fills.length).toBe(1);
        expect(g.rows().slice(0, 7).map(r => r.c1)).toEqual([1, 2, 1, 2, 1, 2, 0]);

        // Focus stayed in the grid: the undo shortcut reverts the whole fill.
        expect(viewport(g.container).contains(document.activeElement)).toBe(true);
        await userEvent.keyboard(`{${MOD}>}z{/${MOD}}`);
        await expect.poll(() => g.rows().slice(0, 7).map(r => r.c1)).toEqual([1, 2, 0, 0, 0, 0, 0]);
    });

    it('a touch drag on the handle fills (pointer events of a touch pointer)', async () => {
        const rows = makeRows(12);
        rows[0].c1 = 3;
        const g = renderGrid({ rows, columns: makeCols(4) });
        await expect.poll(() => cellAt(g.container, 0, 'c1')).not.toBeNull();
        await select(g.api, [1, 'c1'], [1, 'c1']);
        const handle = g.container.querySelector<HTMLElement>(HANDLE)!;
        expect(getComputedStyle(handle).touchAction).toBe('none');
        const from = handle.getBoundingClientRect();
        const to = cellAt(g.container, 3, 'c1')!.getBoundingClientRect();
        const init = (x: number, y: number, buttons: number): PointerEventInit => ({
            pointerId: 41, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true, composed: true,
            clientX: x, clientY: y, button: 0, buttons,
        });
        handle.dispatchEvent(new PointerEvent('pointerdown', init(from.left + 12, from.top + 12, 1)));
        document.dispatchEvent(new PointerEvent('pointermove', init(to.left + 20, to.top + to.height / 2, 1)));
        await settle();
        document.dispatchEvent(new PointerEvent('pointerup', init(to.left + 20, to.top + to.height / 2, 0)));
        await expect.poll(() => g.fills.length).toBe(1);
        expect(g.rows().slice(0, 5).map(r => r.c1)).toEqual([3, 3, 3, 3, 0]);
    });

    it('re-renders only the rows the range enters or leaves while the handle is dragged', async () => {
        const renders = new Map<number, number>();
        // Row reads every rendered cell through the valueGetter on each render: a per-row render counter.
        const counter = ({ row }: { row: Row }) => {
            renders.set(row.id, (renders.get(row.id) ?? 0) + 1);
            return row.c0;
        };
        const columns = makeCols(4).map((c, i) => (i === 0 ? { ...c, valueGetter: counter } : c));
        // Tall enough that the pointer never reaches the auto-scroll edge.
        const g = renderGrid({ rows: makeRows(60), columns }, { h: 700 });
        await expect.poll(() => cellAt(g.container, 2, 'c1')).not.toBeNull();
        // Select by dragging, as a user would (the grid then has focus).
        await commands.pointerMoveTo(cellSelector(1, 'c1'));
        await commands.pointerDown();
        await commands.pointerMoveTo(cellSelector(3, 'c2'));
        await commands.pointerUp();
        await settle();
        await commands.pointerMoveTo(HANDLE);
        await settle();
        renders.clear();

        await commands.pointerDown();
        // Straight down, in line with the handle, one row at a time.
        const width = cellAt(g.container, 3, 'c2')!.getBoundingClientRect().width;
        for (const rowIndex of [4, 5, 6, 7]) {
            await commands.pointerMoveTo(cellSelector(rowIndex, 'c2'), width - 12, 20);
            await settle();
        }
        await expect.poll(() => handleCell(g.container)).toBe('7:c2');
        // During the drag: the old bottom row and each row the range entered (ids 4…8), nothing else.
        const rendered = [...renders.keys()].sort((a, b) => a - b);
        expect(rendered).toEqual([4, 5, 6, 7, 8]);
        await commands.pointerUp();
        await expect.poll(() => g.fills.length).toBe(1);
    });
});

describe('fill: keyboard', () => {
    it('Ctrl/Cmd+D fills down from the top row and Ctrl/Cmd+R right from the left column', async () => {
        const rows = makeRows(8);
        rows[0].c1 = 7;
        rows[0].c2 = 8;
        const g = renderGrid({ rows, columns: makeCols(4) });
        await expect.poll(() => cellAt(g.container, 0, 'c1')).not.toBeNull();
        await userEvent.click(cellAt(g.container, 0, 'c1')!);
        await select(g.api, [1, 'c1'], [4, 'c2']);
        await userEvent.keyboard(`{${MOD}>}d{/${MOD}}`);
        await expect.poll(() => g.rows().slice(0, 5).map(r => [r.c1, r.c2])).toEqual([[7, 8], [7, 8], [7, 8], [7, 8], [0, 0]]);
        expect(g.fills[0].direction).toBe('down');

        await select(g.api, [6, 'c0'], [6, 'c3']);
        await userEvent.keyboard(`{${MOD}>}r{/${MOD}}`);
        await expect.poll(() => g.rows()[5]).toMatchObject({ c0: 'r6', c1: 'r6', c2: 'r6', c3: 'r6' });
        expect(g.fills[1].direction).toBe('right');
        // The page is still here (no reload) and the grid still has focus.
        expect(viewport(g.container).contains(document.activeElement)).toBe(true);

        await userEvent.keyboard(`{${MOD}>}z{/${MOD}}`);
        await expect.poll(() => g.rows()[5].c1).toBe(0);
        await userEvent.keyboard(`{${MOD}>}z{/${MOD}}`);
        await expect.poll(() => g.rows()[1].c1).toBe(0);
    });
});

describe('fill handle: where it is drawn', () => {
    const near = (a: number, b: number) => Math.abs(a - b) <= 1.5;

    it('sits in the bottom-right corner of the range cell with a 24px hit area, pinned columns included', async () => {
        const columns = makeCols(10, 110);
        const g = renderGrid({
            rows: makeRows(20, 10),
            columns,
            pinnedColumns: { left: ['c0'], right: ['c9'] },
        }, { w: 600 });
        await expect.poll(() => cellAt(g.container, 1, 'c9')).not.toBeNull();
        const vp = viewport(g.container);

        const check = (rowIndex: number, field: string) => {
            const handle = g.container.querySelector<HTMLElement>(HANDLE)!.getBoundingClientRect();
            const cell = cellAt(g.container, rowIndex, field)!.getBoundingClientRect();
            expect(handleCell(g.container)).toBe(`${rowIndex}:${field}`);
            expect(near(handle.right, cell.right)).toBe(true);
            expect(near(handle.bottom, cell.bottom)).toBe(true);
            expect(handle.width).toBe(24);
            expect(handle.height).toBe(24);
        };

        // A right-pinned corner stays put while the centre scrolls.
        await select(g.api, [1, 'c7'], [2, 'c9']);
        check(1, 'c9');
        vp.scrollLeft = 200;
        await settle();
        check(1, 'c9');

        // A left-pinned corner.
        await select(g.api, [3, 'c0'], [5, 'c0']);
        check(4, 'c0');
        vp.scrollLeft = 0;
        await settle();
        check(4, 'c0');

        // A centre corner moves with the range.
        await select(g.api, [1, 'c1'], [1, 'c2']);
        check(0, 'c2');
        await select(g.api, [1, 'c1'], [3, 'c3']);
        check(2, 'c3');
        const handle = g.container.querySelector<HTMLElement>(HANDLE)!;
        expect(getComputedStyle(handle).cursor).toBe('crosshair');
        expect(getComputedStyle(handle, '::after').backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    });
});
