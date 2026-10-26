import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { DataGrid } from './DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type { DataGridProps, GridApi, GridColDef, GridContextMenuEntry, GridContextMenuParams } from '../../types';

// The cell context menu (`contextMenu`) opened by a right-click, through the public <DataGrid> props.
// Positioning and focus need a real browser: the browser tests of Task 6b.

type Row = { id: number; dept: string; name: string; age: number };

const ROWS: Row[] = [
    { id: 1, dept: 'A', name: 'Alice', age: 30 },
    { id: 2, dept: 'A', name: 'Bob', age: 40 },
    { id: 3, dept: 'B', name: 'Carol', age: 50 },
    { id: 4, dept: 'B', name: 'Dan', age: 60 },
    { id: 5, dept: 'C', name: 'Eve', age: 70 },
];

const COLS: GridColDef<Row>[] = [
    { field: 'name', headerName: 'Name', width: 100 },
    { field: 'age', headerName: 'Age', type: 'number', width: 100 },
];

let writeText: ReturnType<typeof vi.fn<(text: string) => Promise<void>>>;

function setClipboard(value: unknown): void {
    Object.defineProperty(navigator, 'clipboard', { value, configurable: true, writable: true });
}

beforeEach(() => {
    writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
    setClipboard({ writeText });
});
afterEach(() => {
    setClipboard(undefined);
    vi.restoreAllMocks();
});

type GridProps = Partial<DataGridProps<Row>>;

function renderGrid(props: GridProps = {}) {
    const holder: { api: React.MutableRefObject<GridApi> | null } = { api: null };
    function Harness(p: GridProps) {
        const apiRef = useGridApiRef();
        holder.api = apiRef;
        return <DataGrid<Row> rows={ROWS} columns={COLS} apiRef={apiRef} height={400} {...p} />;
    }
    const utils = render(<Harness {...props} />);
    return {
        ...utils,
        api: () => holder.api!.current,
        rerenderGrid: (next: GridProps) => utils.rerender(<Harness {...next} />),
    };
}

const rowEl = (c: HTMLElement, rowIndex: number) => c.querySelector(`[role="row"][data-rowindex="${rowIndex}"]`) as HTMLElement;
const cellAt = (c: HTMLElement, rowIndex: number, field: string) =>
    rowEl(c, rowIndex)?.querySelector(`[data-field="${field}"]`) as HTMLElement;
const menu = () => document.querySelector('[role="menu"]');
const menuLabels = () => Array.from(document.querySelectorAll('[role="menuitem"]')).map(el => el.textContent);
const menuItem = (label: string) =>
    Array.from(document.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(el => el.textContent === label) as HTMLElement;

/** Fires `contextmenu` and returns whether the browser default would be suppressed. */
function rightClick(el: Element): boolean {
    let prevented = false;
    act(() => {
        prevented = !fireEvent.contextMenu(el, { clientX: 20, clientY: 30 });
    });
    return prevented;
}

describe('DataGrid contextMenu', () => {
    it('without contextMenu: no menu and the browser menu is kept', () => {
        const { container } = renderGrid();
        expect(rightClick(cellAt(container, 0, 'name'))).toBe(false);
        expect(menu()).toBeNull();
    });

    it('opens with Copy and Copy with headers', () => {
        const { container } = renderGrid({ contextMenu: true });
        expect(rightClick(cellAt(container, 0, 'name'))).toBe(true);
        expect(menu()).not.toBeNull();
        expect(menuLabels()).toEqual(['Copy', 'Copy with headers']);
    });

    it('undoRedo adds Undo and Redo, disabled with an empty history', () => {
        const { container } = renderGrid({ contextMenu: true, undoRedo: true });
        rightClick(cellAt(container, 0, 'name'));
        expect(menuLabels()).toEqual(['Copy', 'Copy with headers', 'Undo', 'Redo']);
        expect(menuItem('Undo').getAttribute('aria-disabled')).toBe('true');
        expect(menuItem('Redo').getAttribute('aria-disabled')).toBe('true');
    });

    it('getContextMenuItems receives the cell params and replaces the items', () => {
        const getItems = vi.fn((_p: GridContextMenuParams<Row>, defaults: readonly GridContextMenuEntry[]) =>
            [{ id: 'mine', label: 'Mine' }, ...defaults.slice(0, 1)]);
        const cols: GridColDef<Row>[] = [
            ...COLS,
            { field: 'label', headerName: 'Label', width: 100, valueGetter: ({ row }) => `${row.name}!` },
        ];
        const { container } = renderGrid({ contextMenu: true, columns: cols, getContextMenuItems: getItems });
        rightClick(cellAt(container, 1, 'label'));
        expect(getItems).toHaveBeenCalledTimes(1);
        const [params, defaults] = getItems.mock.calls[0];
        expect(params.id).toBe(2);
        expect(params.field).toBe('label');
        expect(params.value).toBe('Bob!');
        expect(params.row).toBe(ROWS[1]);
        expect(params.colDef.field).toBe('label');
        expect(params.cellRange).toBeNull();
        expect(defaults.map(d => (d === 'divider' ? d : d.id))).toEqual(['copy', 'copyWithHeaders']);
        expect(menuLabels()).toEqual(['Mine', 'Copy']);
    });

    it('passes rowMeta on a group row', () => {
        const getItems = vi.fn((_p: GridContextMenuParams<Row>, d: readonly GridContextMenuEntry[]) => d);
        const { container } = renderGrid({
            contextMenu: true, rowGroupingModel: ['dept'], getContextMenuItems: getItems,
        });
        const groupRow = Array.from(container.querySelectorAll<HTMLElement>('[role="row"][data-rowindex]'))[0];
        const cell = groupRow.querySelector('[role="gridcell"][data-field="name"]') as HTMLElement;
        rightClick(cell);
        expect(getItems).toHaveBeenCalledTimes(1);
        expect(getItems.mock.calls[0][0].rowMeta?.isGroupRow).toBe(true);
    });

    it('an empty list: no menu and the browser menu is kept', () => {
        const { container } = renderGrid({ contextMenu: true, getContextMenuItems: () => [] });
        expect(rightClick(cellAt(container, 0, 'name'))).toBe(false);
        expect(menu()).toBeNull();
    });

    it('a throwing getContextMenuItems falls back to the defaults with one warning', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { container } = renderGrid({
            contextMenu: true,
            getContextMenuItems: () => { throw new Error('boom'); },
        });
        expect(rightClick(cellAt(container, 0, 'name'))).toBe(true);
        expect(menuLabels()).toEqual(['Copy', 'Copy with headers']);
        act(() => { fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' }); });
        rightClick(cellAt(container, 1, 'name'));
        expect(warn.mock.calls.filter(([m]) => String(m).includes('getContextMenuItems'))).toHaveLength(1);
    });

    it('header, header filter and editor input keep the browser menu', () => {
        const editable: GridColDef<Row>[] = [{ ...COLS[0], editable: true }, COLS[1]];
        const { container } = renderGrid({ contextMenu: true, headerFilters: true, columns: editable });
        const header = container.querySelector('.ogx__header [data-field="name"]') as HTMLElement;
        expect(rightClick(header)).toBe(false);
        const filterCell = container.querySelector('.ogx__header-filter-row [data-field="name"]') as HTMLElement;
        expect(rightClick(filterCell)).toBe(false);
        act(() => { fireEvent.doubleClick(cellAt(container, 0, 'name')); });
        const input = cellAt(container, 0, 'name').querySelector('input') as HTMLInputElement;
        expect(input).not.toBeNull();
        expect(rightClick(input)).toBe(false);
        expect(menu()).toBeNull();
    });

    it('Copy writes the cell text', async () => {
        const { container } = renderGrid({ contextMenu: true });
        rightClick(cellAt(container, 1, 'name'));
        await act(async () => { fireEvent.click(menuItem('Copy')); });
        expect(writeText).toHaveBeenLastCalledWith('Bob');
        expect(menu()).toBeNull();
    });

    it('Copy with headers writes the header line first', async () => {
        const { container } = renderGrid({ contextMenu: true });
        rightClick(cellAt(container, 1, 'age'));
        await act(async () => { fireEvent.click(menuItem('Copy with headers')); });
        expect(writeText).toHaveBeenLastCalledWith('Age\n40');
    });

    it('Copy inside a 2×2 range writes the range', async () => {
        const { container, api } = renderGrid({ contextMenu: true, cellSelection: true });
        act(() => { api().selectCellRange({ id: 1, field: 'name' }, { id: 2, field: 'age' }); });
        rightClick(cellAt(container, 1, 'age'));
        expect(api().getCellSelectionModel()).toEqual([{ anchor: { id: 1, field: 'name' }, head: { id: 2, field: 'age' } }]);
        await act(async () => { fireEvent.click(menuItem('Copy')); });
        expect(writeText).toHaveBeenLastCalledWith('Alice\t30\nBob\t40');
    });

    it('right-click outside the range collapses it to the cell', async () => {
        const { container, api } = renderGrid({ contextMenu: true, cellSelection: true });
        act(() => { api().selectCellRange({ id: 1, field: 'name' }, { id: 2, field: 'age' }); });
        rightClick(cellAt(container, 3, 'name'));
        expect(api().getCellSelectionModel()).toEqual([{ anchor: { id: 4, field: 'name' }, head: { id: 4, field: 'name' } }]);
        await act(async () => { fireEvent.click(menuItem('Copy')); });
        expect(writeText).toHaveBeenLastCalledWith('Dan');
    });

    it('openContextMenu and closeContextMenu through apiRef', () => {
        const { api } = renderGrid({ contextMenu: true });
        act(() => { api().openContextMenu(3, 'name'); });
        expect(menu()).not.toBeNull();
        act(() => { api().closeContextMenu(); });
        expect(menu()).toBeNull();
    });

    it('warns in development when getContextMenuItems is passed without contextMenu', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        renderGrid({ getContextMenuItems: (_p, d) => d });
        expect(warn.mock.calls.some(([m]) => String(m).includes('getContextMenuItems'))).toBe(true);
    });

    it('closes when its row is removed', () => {
        const { container, rerenderGrid } = renderGrid({ contextMenu: true });
        rightClick(cellAt(container, 1, 'name'));
        expect(menu()).not.toBeNull();
        rerenderGrid({ contextMenu: true, rows: ROWS.filter(r => r.id !== 2) });
        expect(menu()).toBeNull();
        rerenderGrid({ contextMenu: true, rows: ROWS });
        expect(menu()).toBeNull();
    });

    describe('row resolution', () => {
        function idsFrom(props: GridProps) {
            const ids: unknown[] = [];
            const utils = renderGrid({
                contextMenu: true,
                getContextMenuItems: (p, d) => { ids.push(p.id); return d; },
                ...props,
            });
            return { ...utils, ids };
        }

        it('top-pinned, centre and bottom-pinned rows report their own ids', () => {
            const { container, ids } = idsFrom({ pinnedRows: { top: [4, 5], bottom: [3] } });
            // Visible list: [4, 5 | 1, 2 | 3].
            rightClick(cellAt(container, 0, 'name'));
            rightClick(cellAt(container, 2, 'name'));
            rightClick(cellAt(container, 4, 'name'));
            expect(ids).toEqual([4, 1, 3]);
        });

        it('on page 2 the first centre row is that page\'s row', () => {
            const { container, ids } = idsFrom({
                pagination: true, paginationModel: { page: 1, pageSize: 2 }, pageSizeOptions: [2],
            });
            rightClick(cellAt(container, 0, 'name'));
            expect(ids).toEqual([3]);
        });

        it('a covered row-span cell resolves to the span origin', async () => {
            const cols: GridColDef<Row>[] = [
                { field: 'dept', headerName: 'Dept', width: 100, rowSpan: ({ row }) => (row.id === 1 ? 2 : 1) },
                ...COLS,
            ];
            const { container, ids } = idsFrom({ columns: cols });
            const covered = cellAt(container, 1, 'dept');
            expect(covered.classList.contains('ogx__cell--hidden')).toBe(true);
            rightClick(covered);
            expect(ids).toEqual([1]);
            await act(async () => { fireEvent.click(menuItem('Copy')); });
            expect(writeText).toHaveBeenLastCalledWith('A');
        });
    });
});
