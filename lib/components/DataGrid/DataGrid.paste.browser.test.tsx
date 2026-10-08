import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { userEvent, page, server } from 'vitest/browser';
import { Profiler, useLayoutEffect, useState } from 'react';
import type { ReactNode } from 'react';
import '../../styles/opengridx.css';
import { DataGrid } from '../../index';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type { DataGridProps, GridApi, GridColDef } from '../../types';

// Clipboard paste, Delete on a range and undo/redo in Chromium, Firefox and WebKit. The clipboard is
// the browser's own: the TSV is copied from a textarea with the copy shortcut and pasted with the
// paste shortcut (Playwright keyboard), so the grid receives a real `paste` event. A synthetic
// ClipboardEvent is not engine-neutral: Firefox drops its clipboardData.

const MOD = /Mac|iPhone|iPad/.test(navigator.platform) ? 'Meta' : 'Control';

type Row = { id: number; name: string; qty: number | null; price: number | null };

const ROWS: Row[] = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, name: `item${i + 1}`, qty: i + 1, price: (i + 1) * 10 }));
const COLS: GridColDef<Row>[] = [
    { field: 'name', headerName: 'Name', width: 120, editable: true },
    { field: 'qty', headerName: 'Qty', type: 'number', width: 100, editable: true },
    { field: 'price', headerName: 'Price', type: 'number', width: 100, editable: true },
];

const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
const settle = async () => { for (let i = 0; i < 4; i++) await frame(); };
const cellAt = (c: HTMLElement, rowIndex: number, field: string) =>
    c.querySelector<HTMLElement>(`.ogx__viewport [role="row"][data-rowindex="${rowIndex}"] [data-field="${field}"]`);
const textAt = (c: HTMLElement, rowIndex: number, field: string) => cellAt(c, rowIndex, field)?.textContent ?? null;
const rangeCells = (c: HTMLElement) =>
    Array.from(c.querySelectorAll<HTMLElement>('.ogx__cell--range')).map(
        el => `${el.closest('[role="row"]')?.getAttribute('data-rowindex')}:${el.dataset.field}`
    );

const Box = ({ children }: { children: ReactNode }) => (
    <div>
        <textarea data-testid="source" defaultValue="" style={{ width: 300, height: 40 }} />
        <div style={{ height: 360, width: 600, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
        </div>
    </div>
);

type Props = Partial<DataGridProps<Row>>;

function renderGrid(props: Props = {}) {
    const holder: { api: { current: GridApi } | null } = { api: null };
    function Harness() {
        const apiRef = useGridApiRef();
        const [rows, setRows] = useState(ROWS);
        useLayoutEffect(() => { holder.api = apiRef; }, [apiRef]);
        return (
            <Box>
                <DataGrid<Row>
                    rows={rows}
                    columns={COLS}
                    apiRef={apiRef}
                    cellSelection
                    undoRedo
                    processRowUpdate={(row) => {
                        setRows(prev => prev.map(r => (r.id === row.id ? row : r)));
                        return row;
                    }}
                    {...props}
                />
            </Box>
        );
    }
    const utils = render(<Harness />);
    return { ...utils, api: () => holder.api!.current };
}

/** Puts `text` on the browser clipboard with the copy shortcut, from the page's textarea. */
async function copyToClipboard(c: HTMLElement, text: string) {
    const source = c.querySelector<HTMLTextAreaElement>('[data-testid="source"]')!;
    source.value = text;
    source.focus();
    source.select();
    await userEvent.keyboard(`{${MOD}>}c{/${MOD}}`);
}

async function focusCell(c: HTMLElement, rowIndex: number, field: string) {
    await expect.poll(() => cellAt(c, rowIndex, field)).not.toBeNull();
    await userEvent.click(cellAt(c, rowIndex, field)!);
    await expect.poll(() => document.activeElement === cellAt(c, rowIndex, field)).toBe(true);
}

const press = (combo: string) => userEvent.keyboard(combo);

beforeEach(async () => {
    await page.viewport(1000, 800);
});
afterEach(() => cleanup());

describe('paste from the clipboard', () => {
    it('pastes an Excel-style block (CRLF, quoted field, thousands) on the paste shortcut and selects it', async () => {
        const { container } = renderGrid();
        await copyToClipboard(container, 'Alpha\t1,200\t$9.50\r\n"Beta\tQuoted"\t3\t4\r\n');
        await focusCell(container, 1, 'name');
        await press(`{${MOD}>}v{/${MOD}}`);

        await expect.poll(() => textAt(container, 1, 'name')).toBe('Alpha');
        expect(textAt(container, 1, 'qty')).toBe('1200');
        expect(textAt(container, 1, 'price')).toBe('9.5');
        expect(textAt(container, 2, 'name')).toBe('Beta\tQuoted');
        expect(textAt(container, 2, 'qty')).toBe('3');
        await settle();
        expect(rangeCells(container)).toEqual(['1:name', '1:qty', '1:price', '2:name', '2:qty', '2:price']);
    });

    it('undoes with Ctrl/Cmd+Z and redoes with Ctrl/Cmd+Shift+Z and Ctrl+Y, selecting the affected cells', async () => {
        const { container } = renderGrid();
        await copyToClipboard(container, 'A\nB');
        await focusCell(container, 0, 'name');
        await press(`{${MOD}>}v{/${MOD}}`);
        await expect.poll(() => textAt(container, 1, 'name')).toBe('B');

        // Move away, so the selection after undo is the undo's doing.
        await focusCell(container, 4, 'price');
        await press(`{${MOD}>}z{/${MOD}}`);
        await expect.poll(() => [textAt(container, 0, 'name'), textAt(container, 1, 'name')]).toEqual(['item1', 'item2']);
        await settle();
        expect(rangeCells(container)).toEqual(['0:name', '1:name']);
        expect(document.activeElement).toBe(cellAt(container, 0, 'name'));

        await press(`{${MOD}>}{Shift>}z{/Shift}{/${MOD}}`);
        await expect.poll(() => textAt(container, 1, 'name')).toBe('B');

        await press(`{${MOD}>}z{/${MOD}}`);
        await expect.poll(() => textAt(container, 1, 'name')).toBe('item2');
        await press('{Control>}y{/Control}');
        await expect.poll(() => textAt(container, 1, 'name')).toBe('B');
    });

    it('keeps native paste and native undo inside an open editor', async () => {
        const { container, api } = renderGrid();
        await copyToClipboard(container, 'pasted');
        await focusCell(container, 2, 'name');
        await userEvent.dblClick(cellAt(container, 2, 'name')!);
        const input = () => container.querySelector<HTMLInputElement>('.ogx__cell--editing input');
        await expect.poll(() => document.activeElement === input()).toBe(true);
        await press(`{${MOD}>}a{/${MOD}}`);
        await press(`{${MOD}>}v{/${MOD}}`);
        await expect.poll(() => input()?.value).toBe('pasted');
        // Nothing else was written: the paste went to the input only.
        expect(textAt(container, 3, 'name')).toBe('item4');

        await press(`{${MOD}>}z{/${MOD}}`);
        await expect.poll(() => input()?.value).toBe('item3');
        expect(api().canUndo()).toBe(false);
        await press('{Enter}');
        await expect.poll(() => input()).toBeNull();
        expect(textAt(container, 2, 'name')).toBe('item3');
    });

    it('clears a range with Delete as one undoable edit', async () => {
        const { container, api } = renderGrid();
        await focusCell(container, 0, 'qty');
        api().selectCellRange({ id: 1, field: 'qty' }, { id: 3, field: 'price' });
        await settle();
        await press('{Delete}');
        await expect.poll(() => [textAt(container, 0, 'qty'), textAt(container, 2, 'price')]).toEqual(['', '']);
        expect(textAt(container, 0, 'name')).toBe('item1');
        await press(`{${MOD}>}z{/${MOD}}`);
        await expect.poll(() => [textAt(container, 0, 'qty'), textAt(container, 2, 'price')]).toEqual(['1', '30']);
    });
});

describe('paste performance', () => {
    it('pastes 10,000 cells in one store update', async () => {
        type Wide = { id: number; [field: string]: number };
        const rows: Wide[] = Array.from({ length: 1000 }, (_, i) => {
            const r: Wide = { id: i };
            for (let c = 0; c < 10; c++) r[`c${c}`] = 0;
            return r;
        });
        const cols: GridColDef<Wide>[] = Array.from({ length: 10 }, (_, c) => ({ field: `c${c}`, type: 'number', width: 80, editable: true }));
        const text = Array.from({ length: 1000 }, (_, r) => Array.from({ length: 10 }, (_, c) => String(r * 10 + c + 1)).join('\t')).join('\n');

        const holder: { api: { current: GridApi<Wide> } | null } = { api: null };
        let commits = 0;
        // The first commit that shows pasted values: its number since the paste, and when it happened.
        let dataCommit = 0;
        let dataCommitAt = 0;
        const gridRoot: { el: HTMLElement | null } = { el: null };
        function Harness() {
            const apiRef = useGridApiRef<Wide>();
            useLayoutEffect(() => { holder.api = apiRef; }, [apiRef]);
            return (
                <Box>
                    <Profiler id="grid" onRender={() => {
                        commits += 1;
                        if (dataCommit === 0 && gridRoot.el && textAt(gridRoot.el, 0, 'c0') === '1') {
                            dataCommit = commits;
                            dataCommitAt = performance.now();
                        }
                    }}>
                        <DataGrid<Wide> rows={rows} columns={cols} apiRef={apiRef} cellSelection />
                    </Profiler>
                </Box>
            );
        }
        const { container } = render(<Harness />);
        gridRoot.el = container;
        await expect.poll(() => cellAt(container, 0, 'c0')).not.toBeNull();
        await settle();
        holder.api!.current.selectCellRange({ id: 0, field: 'c0' }, { id: 0, field: 'c0' });
        await settle();

        commits = 0;
        const start = performance.now();
        const result = await holder.api!.current.pasteText(text);
        await expect.poll(() => textAt(container, 0, 'c0')).toBe('1');
        const elapsed = dataCommitAt - start;

        expect(result.updated).toHaveLength(1000);
        expect(holder.api!.current.getRow(999)).toMatchObject({ c9: 10000 });
        // One store update: the first commit after the paste holds the selection and every row (later
        // commits, such as the debounced live-region text, are not part of the paste).
        expect(dataCommit).toBe(1);
        // Chromium is the reference; Firefox and WebKit run the same work more slowly in CI.
        const bound = server.browser === 'chromium' ? 300 : 1000;
        expect(elapsed).toBeLessThan(bound);
    });
});
