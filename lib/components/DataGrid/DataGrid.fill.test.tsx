import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import React, { useState } from 'react';
import { DataGrid } from './DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type { DataGridProps, GridApi, GridCellSelectionModel, GridColDef, GridFillResult } from '../../types';

// Fill handle (v3.5) through the public <DataGrid> props. jsdom has no layout, so the handle drag
// is driven with pointer events and a stubbed elementFromPoint; real drags with auto-scroll in
// three engines: DataGrid.fill.browser.test.tsx.

type Row = { id: number; name: string; qty: number | null; when: Date | null; note: string };

const d = (day: number) => new Date(2026, 9, day);
const BASE_ROWS: Row[] = [
    { id: 1, name: 'A', qty: 1, when: d(5), note: 'n1' },
    { id: 2, name: 'B', qty: 2, when: d(6), note: 'n2' },
    { id: 3, name: 'C', qty: 7, when: null, note: 'n3' },
    { id: 4, name: 'D', qty: 9, when: null, note: 'n4' },
    { id: 5, name: 'E', qty: 0, when: null, note: 'n5' },
];

const COLS: GridColDef<Row>[] = [
    { field: 'name', editable: true, width: 100 },
    { field: 'qty', type: 'number', editable: true, width: 100 },
    { field: 'when', type: 'date', editable: true, width: 100 },
    { field: 'note', width: 100 },
];

type Props = Partial<DataGridProps<Row>>;

function renderGrid(props: Props = {}) {
    const holder: { api: React.MutableRefObject<GridApi> | null; rows: () => Row[] } = { api: null, rows: () => [] };
    const processRowUpdate = vi.fn((row: Row) => row);
    function Harness(p: Props) {
        const apiRef = useGridApiRef();
        const [rows, setRows] = useState(BASE_ROWS);
        holder.api = apiRef;
        holder.rows = () => rows;
        return (
            <DataGrid<Row>
                rows={rows}
                columns={COLS}
                apiRef={apiRef}
                cellSelection
                processRowUpdate={(newRow) => {
                    const stored = processRowUpdate(newRow);
                    setRows(prev => prev.map(r => (r.id === stored.id ? stored : r)));
                    return stored;
                }}
                {...p}
            />
        );
    }
    const utils = render(<Harness {...props} />);
    return {
        ...utils,
        api: () => holder.api!.current,
        rows: () => holder.rows(),
        processRowUpdate,
        rerenderGrid: (next: Props) => utils.rerender(<Harness {...next} />),
    };
}

const cellAt = (c: HTMLElement, rowIndex: number, field: string) =>
    c.querySelector(`[role="row"][data-rowindex="${rowIndex}"] [data-field="${field}"]`) as HTMLElement;
const range = (a: number, af: string, h: number, hf: string): GridCellSelectionModel =>
    [{ anchor: { id: a, field: af }, head: { id: h, field: hf } }];
const handles = (c: HTMLElement) => Array.from(c.querySelectorAll('.ogx__cell-fill-handle')).map(h => {
    const cell = h.closest('.ogx__cell') as HTMLElement;
    return `${cell.closest('[role="row"]')!.getAttribute('data-rowindex')}:${cell.dataset.field}`;
});
const ymd = (v: Date | null) => (v ? `${v.getMonth() + 1}/${v.getDate()}` : null);

async function settle() {
    await act(async () => { await Promise.resolve(); });
}
async function nextFrame() {
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 40)); });
}

/**
 * Drags the fill handle to the cell at (rowIndex, field), the pointer moving by (dx, dy) px. jsdom
 * has no hit testing, so elementFromPoint answers with that cell.
 */
async function dragHandle(c: HTMLElement, to: { rowIndex: number; field: string }, dx: number, dy: number, altKey = false) {
    const handle = c.querySelector('.ogx__cell-fill-handle') as HTMLElement;
    expect(handle).not.toBeNull();
    const target = cellAt(c, to.rowIndex, to.field);
    const original = document.elementFromPoint;
    document.elementFromPoint = () => target;
    try {
        fireEvent.pointerDown(handle, { pointerId: 7, button: 0, clientX: 100, clientY: 100 });
        fireEvent.pointerMove(document, { pointerId: 7, buttons: 1, clientX: 100 + dx, clientY: 100 + dy });
        await nextFrame();
        fireEvent.pointerUp(document, { pointerId: 7, button: 0, clientX: 100 + dx, clientY: 100 + dy, altKey });
        await settle();
        await settle();
    } finally {
        document.elementFromPoint = original;
    }
}

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('fill handle: where it is drawn', () => {
    it('sits on the bottom-right cell of the range, and on a single selected cell', () => {
        const g = renderGrid({ cellSelectionModel: range(1, 'name', 2, 'qty') });
        expect(handles(g.container)).toEqual(['1:qty']);
        g.rerenderGrid({ cellSelectionModel: range(3, 'when', 3, 'when') });
        expect(handles(g.container)).toEqual(['2:when']);
        // A single cell draws the handle but no range.
        expect(g.container.querySelectorAll('.ogx__cell--range')).toHaveLength(0);
        expect(cellAt(g.container, 2, 'when').getAttribute('aria-selected')).toBeNull();
    });

    it('is absent with disableFillHandle, without cellSelection, without editable columns or while editing', () => {
        const g = renderGrid({ cellSelectionModel: range(1, 'name', 2, 'qty'), disableFillHandle: true });
        expect(handles(g.container)).toEqual([]);
        g.rerenderGrid({ cellSelectionModel: range(1, 'name', 2, 'qty'), cellSelection: false });
        expect(handles(g.container)).toEqual([]);
        g.rerenderGrid({ cellSelectionModel: range(1, 'name', 2, 'qty'), columns: COLS.map(c => ({ ...c, editable: false })) });
        expect(handles(g.container)).toEqual([]);
        g.rerenderGrid({});
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 1, field: 'name' }));
        expect(handles(g.container)).toEqual(['0:name']);
        fireEvent.doubleClick(cellAt(g.container, 0, 'name'));
        expect(g.container.querySelector('.ogx__cell--editing')).not.toBeNull();
        expect(handles(g.container)).toEqual([]);
    });

    it('renders the same markup with disableFillHandle as a grid whose range has no handle', () => {
        const a = render(<DataGrid<Row> rows={BASE_ROWS} columns={COLS} />);
        const b = render(<DataGrid<Row> rows={BASE_ROWS} columns={COLS} disableFillHandle onFill={() => {}} />);
        const strip = (html: string) => html.replace(/_r_[0-9a-z]+_|:r[0-9a-z]+:/g, 'ID');
        expect(strip(b.container.innerHTML)).toBe(strip(a.container.innerHTML));
    });
});

describe('fill handle: drag', () => {
    it('drag down continues number and date series, repeats text, and selects source + filled cells', async () => {
        const onFill = vi.fn<(r: GridFillResult) => void>();
        const g = renderGrid({ onFill, undoRedo: true });
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 2, field: 'when' }));
        await dragHandle(g.container, { rowIndex: 4, field: 'when' }, 10, 90);
        expect(g.rows().map(r => r.name)).toEqual(['A', 'B', 'A', 'B', 'A']);
        expect(g.rows().map(r => r.qty)).toEqual([1, 2, 3, 4, 5]);
        expect(g.rows().map(r => ymd(r.when))).toEqual(['10/5', '10/6', '10/7', '10/8', '10/9']);
        expect(g.api().getCellSelectionModel()).toEqual(range(1, 'name', 5, 'when'));
        // One processRowUpdate per filled row.
        expect(g.processRowUpdate).toHaveBeenCalledTimes(3);
        expect(onFill).toHaveBeenCalledTimes(1);
        expect(onFill.mock.calls[0][0]).toEqual({ updated: [3, 4, 5], failed: [], skipped: [], direction: 'down' });

        // One undo step restores every filled cell.
        await act(async () => { await g.api().undo(); });
        expect(g.rows()).toEqual(BASE_ROWS);
        expect(g.api().canUndo()).toBe(false);
    });

    it('Alt at release copies (repeats) instead of continuing the series', async () => {
        const g = renderGrid();
        act(() => g.api().selectCellRange({ id: 1, field: 'qty' }, { id: 2, field: 'qty' }));
        await dragHandle(g.container, { rowIndex: 4, field: 'qty' }, 0, 90, true);
        expect(g.rows().map(r => r.qty)).toEqual([1, 2, 1, 2, 1]);
    });

    it('drag up reads the source towards the filled cells', async () => {
        const g = renderGrid();
        act(() => g.api().selectCellRange({ id: 3, field: 'qty' }, { id: 4, field: 'qty' }));
        await dragHandle(g.container, { rowIndex: 0, field: 'qty' }, 0, -120);
        // 7, 9 upwards: 5, 3.
        expect(g.rows().map(r => r.qty)).toEqual([3, 5, 7, 9, 0]);
        expect(g.api().getCellSelectionModel()).toEqual(range(4, 'qty', 1, 'qty'));
    });

    it('drag right fills along rows; the larger pointer offset picks the direction; non-editable cells are skipped', async () => {
        const onFill = vi.fn<(r: GridFillResult) => void>();
        const g = renderGrid({ onFill });
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 1, field: 'name' }));
        // The pointer ends over row 2 but moved further right than down: a fill to the right.
        await dragHandle(g.container, { rowIndex: 1, field: 'note' }, 300, 30);
        expect(g.rows()[0]).toMatchObject({ name: 'A', qty: 'A', note: 'n1' });
        expect(g.rows()[0].when).toBe('A');
        expect(onFill.mock.calls[0][0]).toMatchObject({
            updated: [1],
            skipped: [{ id: 1, field: 'note', reason: 'notEditable' }],
            direction: 'right',
        });
        expect(g.api().getCellSelectionModel()).toEqual(range(1, 'name', 1, 'note'));
    });

    it('ending over the source restores the source range and writes nothing', async () => {
        const onFill = vi.fn();
        const g = renderGrid({ onFill });
        act(() => g.api().selectCellRange({ id: 1, field: 'qty' }, { id: 2, field: 'qty' }));
        await dragHandle(g.container, { rowIndex: 0, field: 'qty' }, 0, -20);
        expect(g.rows()).toEqual(BASE_ROWS);
        expect(onFill).not.toHaveBeenCalled();
        expect(g.api().getCellSelectionModel()).toEqual(range(1, 'qty', 2, 'qty'));
    });

    it('Escape during the drag cancels it: nothing is written and the range is restored', async () => {
        const g = renderGrid();
        act(() => g.api().selectCellRange({ id: 1, field: 'qty' }, { id: 2, field: 'qty' }));
        const handle = g.container.querySelector('.ogx__cell-fill-handle') as HTMLElement;
        const target = cellAt(g.container, 4, 'qty');
        const original = document.elementFromPoint;
        document.elementFromPoint = () => target;
        fireEvent.pointerDown(handle, { pointerId: 5, button: 0, clientX: 0, clientY: 0 });
        fireEvent.pointerMove(document, { pointerId: 5, buttons: 1, clientX: 0, clientY: 90 });
        await nextFrame();
        expect(g.api().getCellSelectionModel()).toEqual(range(1, 'qty', 5, 'qty'));
        fireEvent.keyDown(document, { key: 'Escape' });
        fireEvent.pointerUp(document, { pointerId: 5, button: 0, clientX: 0, clientY: 90 });
        await settle();
        document.elementFromPoint = original;
        expect(g.rows()).toEqual(BASE_ROWS);
        expect(g.api().getCellSelectionModel()).toEqual(range(1, 'qty', 2, 'qty'));
    });

    it('a cancelled pointer (pointercancel) writes nothing', async () => {
        const g = renderGrid();
        act(() => g.api().selectCellRange({ id: 1, field: 'qty' }, { id: 2, field: 'qty' }));
        const handle = g.container.querySelector('.ogx__cell-fill-handle') as HTMLElement;
        const target = cellAt(g.container, 4, 'qty');
        const original = document.elementFromPoint;
        document.elementFromPoint = () => target;
        fireEvent.pointerDown(handle, { pointerId: 3, button: 0, pointerType: 'touch', clientX: 0, clientY: 0 });
        fireEvent.pointerMove(document, { pointerId: 3, buttons: 1, pointerType: 'touch', clientX: 0, clientY: 90 });
        await nextFrame();
        expect(g.api().getCellSelectionModel()).toEqual(range(1, 'qty', 5, 'qty'));
        fireEvent.pointerCancel(document, { pointerId: 3, pointerType: 'touch' });
        await settle();
        document.elementFromPoint = original;
        expect(g.rows()).toEqual(BASE_ROWS);
        expect(g.api().getCellSelectionModel()).toEqual(range(1, 'qty', 2, 'qty'));
    });
});

describe('fill: GridColDef.fillValue', () => {
    it('decides the value per cell with the default value, index and source values', async () => {
        const fillValue = vi.fn(({ value, index }: { value: unknown; index: number }) => `${String(value)}-${index}`);
        const g = renderGrid({ columns: COLS.map(c => (c.field === 'name' ? { ...c, fillValue } : c)) });
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 2, field: 'name' }));
        await dragHandle(g.container, { rowIndex: 3, field: 'name' }, 0, 60);
        expect(g.rows().map(r => r.name)).toEqual(['A', 'B', 'A-0', 'B-1', 'E']);
        expect(fillValue.mock.calls[0][0]).toMatchObject({
            id: 3, field: 'name', direction: 'down', sourceValues: ['A', 'B'], index: 0, value: 'A', copy: false,
        });
    });

    it('a fillValue that throws skips the cell (invalidValue) and warns once', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const onFill = vi.fn<(r: GridFillResult) => void>();
        const fillValue = ({ index }: { index: number }) => {
            if (index === 0) throw new Error('nope');
            return 42;
        };
        const g = renderGrid({ onFill, columns: COLS.map(c => (c.field === 'qty' ? { ...c, fillValue } : c)) });
        act(() => g.api().selectCellRange({ id: 1, field: 'qty' }, { id: 1, field: 'qty' }));
        await dragHandle(g.container, { rowIndex: 2, field: 'qty' }, 0, 60);
        expect(g.rows().map(r => r.qty)).toEqual([1, 2, 42, 9, 0]);
        expect(onFill.mock.calls[0][0].skipped).toEqual([{ id: 2, field: 'qty', reason: 'invalidValue' }]);
        expect(warn).toHaveBeenCalledTimes(1);
    });

    it('isCellEditable can refuse cells (notEditable)', async () => {
        const onFill = vi.fn<(r: GridFillResult) => void>();
        const g = renderGrid({ onFill, isCellEditable: ({ row }) => row.id !== 2 });
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 1, field: 'name' }));
        await dragHandle(g.container, { rowIndex: 2, field: 'name' }, 0, 60);
        expect(g.rows().map(r => r.name)).toEqual(['A', 'B', 'A', 'D', 'E']);
        expect(onFill.mock.calls[0][0].skipped).toEqual([{ id: 2, field: 'name', reason: 'notEditable' }]);
    });
});

describe('fill: Ctrl/Cmd+D and Ctrl/Cmd+R', () => {
    it('Ctrl+D copies the top row down the range; one undo restores it', async () => {
        const onFill = vi.fn<(r: GridFillResult) => void>();
        const g = renderGrid({ onFill, undoRedo: true });
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 3, field: 'qty' }));
        const notPrevented = fireEvent.keyDown(cellAt(g.container, 0, 'name'), { key: 'd', ctrlKey: true });
        await settle();
        expect(notPrevented).toBe(false);
        expect(g.rows().map(r => [r.name, r.qty])).toEqual([['A', 1], ['A', 1], ['A', 1], ['D', 9], ['E', 0]]);
        expect(onFill.mock.calls[0][0].direction).toBe('down');
        expect(g.api().getCellSelectionModel()).toEqual(range(1, 'name', 3, 'qty'));
        await act(async () => { await g.api().undo(); });
        expect(g.rows()).toEqual(BASE_ROWS);
    });

    it('Cmd+R copies the left column right across the range', async () => {
        const g = renderGrid();
        act(() => g.api().selectCellRange({ id: 2, field: 'name' }, { id: 2, field: 'when' }));
        const notPrevented = fireEvent.keyDown(cellAt(g.container, 1, 'name'), { key: 'r', metaKey: true });
        await settle();
        expect(notPrevented).toBe(false);
        expect(g.rows()[1]).toMatchObject({ name: 'B', qty: 'B', when: 'B', note: 'n2' });
    });

    it('a single row (or column) range writes nothing but still keeps the browser shortcut away', async () => {
        const g = renderGrid();
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 1, field: 'qty' }));
        expect(fireEvent.keyDown(cellAt(g.container, 0, 'name'), { key: 'd', ctrlKey: true })).toBe(false);
        await settle();
        expect(g.rows()).toEqual(BASE_ROWS);
    });

    it('leaves the keys to the browser with disableFillHandle, without cellSelection, or to an open editor', async () => {
        for (const props of [{ disableFillHandle: true }, { cellSelection: false }] as Props[]) {
            const g = renderGrid(props);
            if (props.cellSelection !== false) act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 3, field: 'name' }));
            expect(fireEvent.keyDown(cellAt(g.container, 0, 'name'), { key: 'd', ctrlKey: true })).toBe(true);
            expect(fireEvent.keyDown(cellAt(g.container, 0, 'name'), { key: 'r', ctrlKey: true })).toBe(true);
            await settle();
            expect(g.rows()).toEqual(BASE_ROWS);
            cleanup();
        }
        const g = renderGrid();
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 3, field: 'name' }));
        fireEvent.doubleClick(cellAt(g.container, 1, 'name'));
        const input = g.container.querySelector('.ogx__cell--editing input') as HTMLInputElement;
        expect(fireEvent.keyDown(input, { key: 'd', ctrlKey: true })).toBe(true);
        await settle();
        expect(g.rows()).toEqual(BASE_ROWS);
        // Ctrl+Shift+D and Alt combinations are not fills.
        expect(fireEvent.keyDown(cellAt(g.container, 0, 'name'), { key: 'D', ctrlKey: true, shiftKey: true })).toBe(true);
    });
});
