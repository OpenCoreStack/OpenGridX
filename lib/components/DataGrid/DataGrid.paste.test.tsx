import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import React, { useState } from 'react';
import { DataGrid } from './DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type {
    DataGridProps, GridApi, GridCellSelectionModel, GridClipboardPasteResult, GridColDef, GridHistoryChangeParams,
} from '../../types';

// Clipboard paste, Delete on a range and undo/redo (v3.4) through the public <DataGrid> props.
// Real paste events and keyboard in three engines: DataGrid.paste.browser.test.tsx.

type Row = { id: number; name: string; qty: number | null; active: boolean | null; status: string | null; note: string };

const BASE_ROWS: Row[] = [
    { id: 1, name: 'Apple', qty: 1, active: true, status: 'open', note: 'n1' },
    { id: 2, name: 'Pear', qty: 2, active: false, status: 'closed', note: 'n2' },
    { id: 3, name: 'Plum', qty: 3, active: true, status: 'open', note: 'n3' },
    { id: 4, name: 'Fig', qty: 4, active: false, status: 'open', note: 'n4' },
];

const COLS: GridColDef<Row>[] = [
    { field: 'name', editable: true, width: 100 },
    { field: 'qty', type: 'number', editable: true, width: 100 },
    { field: 'active', type: 'boolean', editable: true, width: 100 },
    { field: 'status', type: 'singleSelect', valueOptions: ['open', 'closed'], editable: true, width: 100 },
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
const names = (rows: Row[]) => rows.map(r => r.name);

function pasteInto(el: HTMLElement, text: string) {
    fireEvent.paste(el, { clipboardData: { getData: (type: string) => (type === 'text/plain' ? text : '') } });
}

async function settle() {
    await act(async () => { await Promise.resolve(); });
}

afterEach(() => cleanup());

describe('apiRef.pasteText placement', () => {
    it('one value into one cell', async () => {
        const g = renderGrid();
        act(() => g.api().selectCellRange({ id: 2, field: 'name' }, { id: 2, field: 'name' }));
        await act(async () => { await g.api().pasteText('Kiwi'); });
        expect(names(g.rows())).toEqual(['Apple', 'Kiwi', 'Plum', 'Fig']);
    });

    it('one value fills every cell of a range', async () => {
        const g = renderGrid();
        act(() => g.api().selectCellRange({ id: 1, field: 'qty' }, { id: 3, field: 'qty' }));
        await act(async () => { await g.api().pasteText('7'); });
        expect(g.rows().map(r => r.qty)).toEqual([7, 7, 7, 4]);
        expect(g.processRowUpdate).toHaveBeenCalledTimes(3);
    });

    it('a block from one cell extends right and down, dropping what passes the last row or column', async () => {
        const g = renderGrid();
        act(() => g.api().selectCellRange({ id: 3, field: 'status' }, { id: 3, field: 'status' }));
        await act(async () => { await g.api().pasteText('closed\tz1\tEXTRA\nclosed\tz2\nopen\tz3\n'); });
        expect(g.rows().map(r => r.status)).toEqual(['open', 'closed', 'closed', 'closed']);
        // `note` is not editable: skipped, not written.
        expect(g.rows().map(r => r.note)).toEqual(['n1', 'n2', 'n3', 'n4']);
        expect(g.api().getCellSelectionModel()).toEqual(range(3, 'status', 4, 'note'));
    });

    it('a block into a range starts at its top-left cell and is cut to the range', async () => {
        const g = renderGrid();
        act(() => g.api().selectCellRange({ id: 2, field: 'qty' }, { id: 1, field: 'name' }));
        await act(async () => { await g.api().pasteText('A\t10\tyes\nB\t20\tno\nC\t30\tyes'); });
        expect(g.rows().map(r => [r.name, r.qty, r.active])).toEqual([
            ['A', 10, true], ['B', 20, false], ['Plum', 3, true], ['Fig', 4, false],
        ]);
        expect(g.api().getCellSelectionModel()).toEqual(range(1, 'name', 2, 'qty'));
    });

    it('reports skipped cells with reasons, parses per column type and fires onClipboardPaste', async () => {
        const onClipboardPaste = vi.fn<(r: GridClipboardPasteResult) => void>();
        const g = renderGrid({ onClipboardPaste });
        act(() => g.api().selectCellRange({ id: 1, field: 'qty' }, { id: 1, field: 'qty' }));
        await act(async () => { await g.api().pasteText('1,500\tmaybe\tCLOSED\tnote\n\t1\tunknown'); });
        expect(g.rows()[0]).toMatchObject({ qty: 1500, active: true, status: 'closed', note: 'n1' });
        expect(g.rows()[1]).toMatchObject({ qty: null, active: true, status: 'closed' });
        const result = onClipboardPaste.mock.calls[0][0];
        expect(result.text).toContain('1,500');
        expect(result.updated).toEqual([1, 2]);
        expect(result.skipped).toEqual([
            { id: 1, field: 'active', reason: 'invalidValue' },
            { id: 1, field: 'note', reason: 'notEditable' },
            { id: 2, field: 'status', reason: 'invalidValue' },
        ]);
    });

    it('honours isCellEditable and valueParser', async () => {
        const g = renderGrid({
            isCellEditable: ({ row }) => row.id !== 2,
            columns: COLS.map(c => (c.field === 'qty'
                ? { ...c, valueParser: (text: string) => Number(text.split('.').join('').replace(',', '.')) }
                : c)),
        });
        act(() => g.api().selectCellRange({ id: 1, field: 'qty' }, { id: 1, field: 'qty' }));
        await act(async () => { await g.api().pasteText('1.234,5\n2\n3'); });
        expect(g.rows().map(r => r.qty)).toEqual([1234.5, 2, 3, 4]);
    });

    it('onBeforeClipboardPaste can cancel or rewrite the text', async () => {
        const g = renderGrid({ onBeforeClipboardPaste: ({ text }) => (text === 'no' ? false : text.toUpperCase()) });
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 1, field: 'name' }));
        await act(async () => { await g.api().pasteText('no'); });
        expect(g.rows()[0].name).toBe('Apple');
        await act(async () => { await g.api().pasteText('kiwi'); });
        expect(g.rows()[0].name).toBe('KIWI');
    });
});

describe('paste event', () => {
    it('pastes on the paste event of a focused cell, and not while an editor is open', async () => {
        const g = renderGrid();
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 1, field: 'name' }));
        pasteInto(cellAt(g.container, 0, 'name'), 'One\nTwo');
        await settle();
        expect(names(g.rows())).toEqual(['One', 'Two', 'Plum', 'Fig']);

        fireEvent.doubleClick(cellAt(g.container, 2, 'name'));
        const input = g.container.querySelector('.ogx__cell--editing input') as HTMLInputElement;
        expect(input).not.toBeNull();
        pasteInto(input, 'Nope');
        await settle();
        expect(names(g.rows())).toEqual(['One', 'Two', 'Plum', 'Fig']);
    });

    it('does nothing with disableClipboardPaste, without cellSelection or without editable columns', async () => {
        for (const props of [
            { disableClipboardPaste: true },
            { cellSelection: false },
            { columns: COLS.map(c => ({ ...c, editable: false })) },
        ] as Props[]) {
            const g = renderGrid(props);
            pasteInto(cellAt(g.container, 0, 'name'), 'X');
            await settle();
            expect(names(g.rows())).toEqual(['Apple', 'Pear', 'Plum', 'Fig']);
            cleanup();
        }
    });
});

describe('Delete on a range', () => {
    it('empties the editable cells of a multi-cell range in one edit', async () => {
        const g = renderGrid({ undoRedo: true });
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 2, field: 'note' }));
        fireEvent.keyDown(cellAt(g.container, 0, 'name'), { key: 'Delete' });
        await settle();
        expect(g.rows()[0]).toMatchObject({ name: '', qty: null, active: null, status: null, note: 'n1' });
        expect(g.rows()[1]).toMatchObject({ name: '', qty: null, note: 'n2' });
        await act(async () => { await g.api().undo(); });
        expect(g.rows().slice(0, 2)).toEqual(BASE_ROWS.slice(0, 2));
    });

    it('leaves a single cell alone, and does nothing with disableRangeClear', async () => {
        const g = renderGrid({ disableRangeClear: true });
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 2, field: 'qty' }));
        fireEvent.keyDown(cellAt(g.container, 0, 'name'), { key: 'Backspace' });
        await settle();
        expect(g.rows()).toEqual(BASE_ROWS);
        g.rerenderGrid({});
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 1, field: 'name' }));
        fireEvent.keyDown(cellAt(g.container, 0, 'name'), { key: 'Delete' });
        await settle();
        expect(g.rows()).toEqual(BASE_ROWS);
    });
});

describe('undo / redo', () => {
    it('undoes and redoes a paste through processRowUpdate and reports the history', async () => {
        const events: GridHistoryChangeParams[] = [];
        const g = renderGrid({ undoRedo: true, onHistoryChange: p => events.push(p) });
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 1, field: 'name' }));
        await act(async () => { await g.api().pasteText('A\nB'); });
        expect(g.api().canUndo()).toBe(true);
        g.processRowUpdate.mockClear();

        await act(async () => { await g.api().undo(); });
        expect(names(g.rows())).toEqual(['Apple', 'Pear', 'Plum', 'Fig']);
        expect(g.processRowUpdate).toHaveBeenCalledTimes(2);
        expect(g.api().getCellSelectionModel()).toEqual(range(1, 'name', 2, 'name'));
        expect(g.api().canRedo()).toBe(true);

        await act(async () => { await g.api().redo(); });
        expect(names(g.rows())).toEqual(['A', 'B', 'Plum', 'Fig']);
        expect(events).toEqual([
            { canUndo: true, canRedo: false, size: 1 },
            { canUndo: false, canRedo: false, size: 0 },
            { canUndo: false, canRedo: true, size: 0 },
            { canUndo: false, canRedo: false, size: 0 },
            { canUndo: true, canRedo: false, size: 1 },
        ]);
    });

    it('records a single-cell edit, only once processRowUpdate succeeded', async () => {
        let reject = true;
        const g = renderGrid({ undoRedo: true });
        g.rerenderGrid({
            undoRedo: true,
            processRowUpdate: (row: Row) => {
                if (reject) throw new Error('no');
                return row;
            },
            onProcessRowUpdateError: () => {},
        });
        fireEvent.doubleClick(cellAt(g.container, 0, 'name'));
        let input = g.container.querySelector('.ogx__cell--editing input') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Rejected' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await settle();
        expect(g.api().canUndo()).toBe(false);

        reject = false;
        input = g.container.querySelector('.ogx__cell--editing input') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'Accepted' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await settle();
        expect(g.api().canUndo()).toBe(true);
        expect(cellAt(g.container, 0, 'name').textContent).toBe('Accepted');
        await act(async () => { await g.api().undo(); });
        expect(cellAt(g.container, 0, 'name').textContent).toBe('Apple');
    });

    it('skips cells changed since (reason "changed") and rows that are gone ("missing"), applying the rest', async () => {
        const g = renderGrid({ undoRedo: true });
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 1, field: 'name' }));
        await act(async () => { await g.api().pasteText('A\nB\nC'); });
        // Row 1 edited elsewhere (new object, new value); row 2 re-fetched (new object, same value); row 3 removed.
        g.rerenderGrid({
            undoRedo: true,
            rows: [{ ...BASE_ROWS[0], name: 'Elsewhere' }, { ...BASE_ROWS[1], name: 'B' }, BASE_ROWS[3]],
        });
        let result!: Awaited<ReturnType<GridApi['undo']>>;
        await act(async () => { result = await g.api().undo(); });
        expect(result.skipped).toEqual([
            { id: 1, field: 'name', reason: 'changed' },
            { id: 3, field: 'name', reason: 'missing' },
        ]);
        expect(result.updated).toEqual([2]);
        expect(cellAt(g.container, 1, 'name').textContent).toBe('Pear');
    });

    it('a new action clears redo; the limit drops the oldest; clearHistory forgets all', async () => {
        const g = renderGrid({ undoRedo: { limit: 2 } });
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 1, field: 'name' }));
        for (const text of ['a', 'b', 'c']) {
            await act(async () => { await g.api().pasteText(text); });
        }
        await act(async () => { await g.api().undo(); });
        await act(async () => { await g.api().undo(); });
        expect(g.api().canUndo()).toBe(false);
        expect(g.rows()[0].name).toBe('a');
        await act(async () => { await g.api().pasteText('d'); });
        expect(g.api().canRedo()).toBe(false);
        g.api().clearHistory();
        expect(g.api().canUndo()).toBe(false);
    });

    it('Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z and Ctrl+Y on a cell; nothing without undoRedo', async () => {
        const g = renderGrid({ undoRedo: true });
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 1, field: 'name' }));
        await act(async () => { await g.api().pasteText('Z'); });
        const cell = () => cellAt(g.container, 0, 'name');
        fireEvent.keyDown(cell(), { key: 'z', ctrlKey: true });
        await settle();
        expect(g.rows()[0].name).toBe('Apple');
        fireEvent.keyDown(cell(), { key: 'Z', metaKey: true, shiftKey: true });
        await settle();
        expect(g.rows()[0].name).toBe('Z');
        fireEvent.keyDown(cell(), { key: 'z', metaKey: true });
        await settle();
        fireEvent.keyDown(cell(), { key: 'y', ctrlKey: true });
        await settle();
        expect(g.rows()[0].name).toBe('Z');

        g.rerenderGrid({ undoRedo: false });
        fireEvent.keyDown(cell(), { key: 'z', ctrlKey: true });
        await settle();
        expect(g.rows()[0].name).toBe('Z');
        expect(g.api().canUndo()).toBe(false);
    });

    it('leaves Ctrl+Z to an open editor', async () => {
        const g = renderGrid({ undoRedo: true });
        act(() => g.api().selectCellRange({ id: 1, field: 'name' }, { id: 1, field: 'name' }));
        await act(async () => { await g.api().pasteText('Z'); });
        fireEvent.doubleClick(cellAt(g.container, 1, 'name'));
        const input = g.container.querySelector('.ogx__cell--editing input') as HTMLInputElement;
        const event = fireEvent.keyDown(input, { key: 'z', ctrlKey: true });
        await settle();
        expect(event).toBe(true);
        expect(g.rows()[0].name).toBe('Z');
    });
});
