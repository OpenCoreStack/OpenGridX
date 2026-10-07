import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { DataGrid } from './DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import { DataGridThemeProvider } from '../../theme/DataGridThemeProvider';
import { amberTheme, compactTheme, darkTheme, emeraldTheme, roseTheme } from '../../theme/presets';
import type {
    DataGridProps, GridApi, GridCellSelectionModel, GridCellSelectionReason, GridColDef,
    GridCellSelectionStatsSlotProps,
} from '../../types';

// Cell range selection (`cellSelection`) through the public <DataGrid> props. Pointer drags,
// auto-scroll and the layout of the outline need a real browser: DataGrid.cellSelection.browser.test.tsx.

type Row = { id: number; a: string; b: string; c: number; d?: number };

const ROWS: Row[] = [
    { id: 1, a: 'a1', b: 'b1', c: 10 },
    { id: 2, a: 'a2', b: 'b2', c: 20 },
    { id: 3, a: 'a3', b: 'b3', c: 30 },
    { id: 4, a: 'a4', b: 'b4', c: 40 },
];

const COLS: GridColDef<Row>[] = [
    { field: 'a', headerName: 'A', width: 100 },
    { field: 'b', headerName: 'B', width: 100 },
    { field: 'c', headerName: 'C', type: 'number', width: 100 },
];

const grid = (c: HTMLElement) => c.querySelector('.ogx__viewport') as HTMLElement;
const rowEl = (c: HTMLElement, rowIndex: number) => c.querySelector(`[role="row"][data-rowindex="${rowIndex}"]`) as HTMLElement;
const cellAt = (c: HTMLElement, rowIndex: number, field: string) =>
    rowEl(c, rowIndex)?.querySelector(`[data-field="${field}"]`) as HTMLElement;
const rangeCells = (c: HTMLElement) =>
    Array.from(c.querySelectorAll<HTMLElement>('.ogx__cell--range')).map(
        el => `${el.closest('[role="row"]')?.getAttribute('data-rowindex')}:${el.dataset.field}`
    );
const focusedCells = (c: HTMLElement) =>
    Array.from(c.querySelectorAll<HTMLElement>('.ogx__cell--focused')).map(
        el => `${el.closest('[role="row"]')?.getAttribute('data-rowindex')}:${el.dataset.field}`
    );
const key = (el: HTMLElement, k: string, init: Partial<KeyboardEventInit> = {}) => fireEvent.keyDown(el, { key: k, ...init });

/** A pointer click as a browser sends it: mousedown, mouseup, click. */
function pointerClick(el: HTMLElement, init: MouseEventInit = {}) {
    fireEvent.mouseDown(el, init);
    fireEvent.mouseUp(el, init);
    fireEvent.click(el, init);
}

type GridProps = Partial<DataGridProps<Row>>;
type Change = { model: GridCellSelectionModel; reason: GridCellSelectionReason };

function renderGrid(props: GridProps = {}) {
    const holder: { api: React.MutableRefObject<GridApi> | null } = { api: null };
    const changes: Change[] = [];
    const onChange = vi.fn((model: GridCellSelectionModel, details: { reason: GridCellSelectionReason }) => {
        changes.push({ model, reason: details.reason });
    });
    function Harness(p: GridProps) {
        const apiRef = useGridApiRef();
        holder.api = apiRef;
        return <DataGrid<Row> rows={ROWS} columns={COLS} apiRef={apiRef} cellSelection onCellSelectionModelChange={onChange} {...p} />;
    }
    const utils = render(<Harness {...props} />);
    return {
        ...utils,
        api: () => holder.api!.current,
        changes,
        lastChange: () => changes[changes.length - 1],
        rerenderGrid: (next: GridProps) => utils.rerender(<Harness {...next} />),
    };
}

const range = (anchorId: number, anchorField: string, headId: number, headField: string): GridCellSelectionModel =>
    [{ anchor: { id: anchorId, field: anchorField }, head: { id: headId, field: headField } }];

let writeText: ReturnType<typeof vi.fn<(text: string) => Promise<void>>>;
beforeEach(() => {
    writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true, writable: true });
});
afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true, writable: true });
    vi.useRealTimers();
    vi.restoreAllMocks();
});

const lastCopied = (): string => String(writeText.mock.calls[writeText.mock.calls.length - 1]?.[0]);

async function pressCopy(el: HTMLElement) {
    await act(async () => {
        key(el, 'c', { ctrlKey: true });
        await Promise.resolve();
    });
}

describe('cellSelection: pointer', () => {
    it('a click selects that one cell (reason pointer) and draws no range', () => {
        const { container, lastChange } = renderGrid();
        pointerClick(cellAt(container, 1, 'b'));
        expect(lastChange()).toEqual({ model: range(2, 'b', 2, 'b'), reason: 'pointer' });
        expect(rangeCells(container)).toEqual([]);
        expect(focusedCells(container)).toEqual(['1:b']);
    });

    it('Shift+click extends from the anchor, draws the rectangle and marks its cells aria-selected', () => {
        const { container, lastChange } = renderGrid();
        pointerClick(cellAt(container, 0, 'a'));
        pointerClick(cellAt(container, 2, 'b'), { shiftKey: true });
        expect(lastChange()).toEqual({ model: range(1, 'a', 3, 'b'), reason: 'pointer' });
        expect(rangeCells(container)).toEqual(['0:a', '0:b', '1:a', '1:b', '2:a', '2:b']);
        expect(cellAt(container, 1, 'a')).toHaveAttribute('aria-selected', 'true');
        expect(cellAt(container, 1, 'c')).not.toHaveAttribute('aria-selected');
        // Focus stays on the anchor.
        expect(focusedCells(container)).toEqual(['0:a']);
    });

    it('marks the edge cells of the rectangle', () => {
        const { container } = renderGrid({ cellSelectionModel: range(1, 'a', 3, 'c') });
        const classes = (r: number, f: string) => Array.from(cellAt(container, r, f).classList).filter(c => c.startsWith('ogx__cell--range'));
        expect(classes(0, 'a')).toEqual(['ogx__cell--range', 'ogx__cell--range-top', 'ogx__cell--range-left']);
        expect(classes(1, 'b')).toEqual(['ogx__cell--range']);
        expect(classes(2, 'c')).toEqual(['ogx__cell--range', 'ogx__cell--range-bottom', 'ogx__cell--range-right']);
    });

    it('Shift+click neither changes the row selection nor fires onRowClick / onCellClick', () => {
        const onRowSelectionModelChange = vi.fn();
        const onRowClick = vi.fn();
        const onCellClick = vi.fn();
        const { container } = renderGrid({ onRowSelectionModelChange, onRowClick, onCellClick });
        pointerClick(cellAt(container, 0, 'a'));
        onRowSelectionModelChange.mockClear();
        onRowClick.mockClear();
        onCellClick.mockClear();
        pointerClick(cellAt(container, 2, 'b'), { shiftKey: true });
        expect(onRowSelectionModelChange).not.toHaveBeenCalled();
        expect(onRowClick).not.toHaveBeenCalled();
        expect(onCellClick).not.toHaveBeenCalled();
    });

    it('a plain click still selects the row, as without cellSelection', () => {
        const onRowSelectionModelChange = vi.fn();
        const { container } = renderGrid({ onRowSelectionModelChange });
        pointerClick(cellAt(container, 1, 'a'));
        expect(onRowSelectionModelChange).toHaveBeenLastCalledWith([2]);
    });

    it('the checkbox column never joins a range and keeps selecting rows', () => {
        const onRowSelectionModelChange = vi.fn();
        const { container, changes } = renderGrid({ checkboxSelection: true, onRowSelectionModelChange });
        pointerClick(cellAt(container, 0, 'a'));
        const before = changes.length;
        const checkboxCell = cellAt(container, 2, '__checkbox_col__');
        fireEvent.mouseDown(checkboxCell, { shiftKey: true });
        expect(changes.length).toBe(before);
        fireEvent.click(checkboxCell.querySelector('input')!);
        expect(onRowSelectionModelChange).toHaveBeenLastCalledWith(expect.arrayContaining([3]));
    });

    it('the grouping column (__group__) never joins a range', () => {
        type G = Row & { region: string };
        const rows: G[] = ROWS.map((r, i) => ({ ...r, region: i < 2 ? 'North' : 'South' }));
        const cols: GridColDef<G>[] = [{ field: 'region', width: 100 }, ...(COLS as GridColDef<G>[])];
        const { container } = render(
            <DataGrid<G> rows={rows} columns={cols} cellSelection rowGroupingModel={['region']} groupingColDef={{ headerName: 'Group' }}
                defaultGroupingExpansionDepth={-1} />
        );
        const groupCell = cellAt(container, 1, '__group__');
        expect(groupCell).toBeTruthy();
        pointerClick(cellAt(container, 1, 'a'));
        key(grid(container), 'a', { ctrlKey: true });
        expect(rangeCells(container).some(c => c.endsWith(':__group__'))).toBe(false);
        expect(rangeCells(container)).toContain('1:a');
    });
});

describe('cellSelection: keyboard', () => {
    it('Shift+Arrow moves the head without wrapping; focus stays on the anchor', () => {
        const { container, lastChange } = renderGrid();
        pointerClick(cellAt(container, 0, 'b'));
        key(grid(container), 'ArrowRight', { shiftKey: true });
        expect(lastChange()).toEqual({ model: range(1, 'b', 1, 'c'), reason: 'keyboard' });
        // At the last column Shift+ArrowRight does nothing (a plain ArrowRight would wrap to the next row).
        key(grid(container), 'ArrowRight', { shiftKey: true });
        expect(lastChange().model).toEqual(range(1, 'b', 1, 'c'));
        key(grid(container), 'ArrowDown', { shiftKey: true });
        key(grid(container), 'ArrowDown', { shiftKey: true });
        expect(lastChange().model).toEqual(range(1, 'b', 3, 'c'));
        expect(rangeCells(container)).toEqual(['0:b', '0:c', '1:b', '1:c', '2:b', '2:c']);
        expect(focusedCells(container)).toEqual(['0:b']);
        expect(document.activeElement).toBe(cellAt(container, 0, 'b'));
    });

    it('Shift+Home / Shift+End and Ctrl+Shift+End move the head to the row ends and the last cell', () => {
        const { container, lastChange } = renderGrid();
        pointerClick(cellAt(container, 1, 'b'));
        key(grid(container), 'End', { shiftKey: true });
        expect(lastChange().model).toEqual(range(2, 'b', 2, 'c'));
        key(grid(container), 'Home', { shiftKey: true });
        expect(lastChange().model).toEqual(range(2, 'b', 2, 'a'));
        key(grid(container), 'End', { shiftKey: true, ctrlKey: true });
        expect(lastChange().model).toEqual(range(2, 'b', 4, 'c'));
    });

    it('a plain arrow after a range collapses it to the new focused cell', () => {
        const { container, lastChange } = renderGrid();
        pointerClick(cellAt(container, 0, 'a'));
        key(grid(container), 'ArrowDown', { shiftKey: true });
        key(grid(container), 'ArrowRight');
        expect(lastChange()).toEqual({ model: range(1, 'b', 1, 'b'), reason: 'keyboard' });
        expect(rangeCells(container)).toEqual([]);
    });

    it('Escape collapses the range to its anchor', () => {
        const { container, lastChange } = renderGrid();
        pointerClick(cellAt(container, 0, 'a'));
        key(grid(container), 'ArrowDown', { shiftKey: true });
        const notPrevented = key(grid(container), 'Escape');
        expect(notPrevented).toBe(false);
        expect(lastChange()).toEqual({ model: range(1, 'a', 1, 'a'), reason: 'keyboard' });
        expect(rangeCells(container)).toEqual([]);
    });

    it('Ctrl+A selects every data cell of the page and leaves the row selection alone', () => {
        const onRowSelectionModelChange = vi.fn();
        const { container, lastChange } = renderGrid({ checkboxSelection: true, onRowSelectionModelChange });
        pointerClick(cellAt(container, 1, 'b'));
        onRowSelectionModelChange.mockClear();
        key(grid(container), 'a', { ctrlKey: true });
        expect(lastChange()).toEqual({ model: range(1, 'a', 4, 'c'), reason: 'selectAll' });
        expect(rangeCells(container)).toHaveLength(12);
        expect(onRowSelectionModelChange).not.toHaveBeenCalled();
        expect(focusedCells(container)).toEqual(['0:a']);
    });

    it('Ctrl+A covers only the current page', () => {
        const { container, lastChange } = renderGrid({ pagination: true, paginationModel: { page: 1, pageSize: 2 }, pageSizeOptions: [2] });
        pointerClick(cellAt(container, 0, 'a'));
        key(grid(container), 'a', { ctrlKey: true });
        expect(lastChange().model).toEqual(range(3, 'a', 4, 'c'));
    });

    it('Enter still starts editing the anchor cell', () => {
        const cols: GridColDef<Row>[] = COLS.map(c => ({ ...c, editable: true }));
        const { container } = renderGrid({ columns: cols });
        pointerClick(cellAt(container, 0, 'a'));
        key(grid(container), 'ArrowDown', { shiftKey: true });
        key(grid(container), 'Enter');
        expect(cellAt(container, 0, 'a').querySelector('input')).toBeTruthy();
    });
});

describe('cellSelection: model', () => {
    it('renders a controlled model and leaves it alone until the prop changes', () => {
        const { container, rerenderGrid, lastChange } = renderGrid({ cellSelectionModel: range(1, 'a', 2, 'b') });
        expect(rangeCells(container)).toEqual(['0:a', '0:b', '1:a', '1:b']);
        key(grid(container), 'ArrowDown', { shiftKey: true });
        expect(lastChange().model).toEqual(range(1, 'a', 3, 'b'));
        expect(rangeCells(container)).toEqual(['0:a', '0:b', '1:a', '1:b']);
        rerenderGrid({ cellSelectionModel: range(3, 'c', 4, 'c') });
        expect(rangeCells(container)).toEqual(['2:c', '3:c']);
        expect(focusedCells(container)).toEqual(['2:c']);
    });

    it('clears the range when a corner row is filtered out (reason dataChange)', () => {
        const { container, rerenderGrid, lastChange } = renderGrid();
        pointerClick(cellAt(container, 0, 'a'));
        key(grid(container), 'ArrowDown', { shiftKey: true });
        rerenderGrid({ filterModel: { items: [{ field: 'a', operator: 'equals', value: 'a2' }] } });
        expect(lastChange()).toEqual({ model: [], reason: 'dataChange' });
        expect(rangeCells(container)).toEqual([]);
    });

    it('follows the corner rows when sorting moves them', () => {
        const { container, rerenderGrid } = renderGrid({ cellSelectionModel: range(1, 'a', 2, 'a') });
        expect(rangeCells(container)).toEqual(['0:a', '1:a']);
        rerenderGrid({ cellSelectionModel: range(1, 'a', 2, 'a'), sortModel: [{ field: 'c', sort: 'desc' }] });
        expect(rangeCells(container)).toEqual(['2:a', '3:a']);
    });

    it('ignores the model and draws nothing while cellSelection is off', () => {
        const { container } = render(<DataGrid<Row> rows={ROWS} columns={COLS} cellSelectionModel={range(1, 'a', 2, 'b')} />);
        expect(rangeCells(container)).toEqual([]);
        expect(container.querySelector('[role="gridcell"][aria-selected]')).toBeNull();
    });
});

describe('cellSelection: apiRef', () => {
    it('selectCellRange, getCellSelectionModel, getSelectedCells and clearCellSelection', () => {
        const cols: GridColDef<Row>[] = [...COLS, { field: 'd', width: 100, valueGetter: ({ row }) => row.c * 2 }];
        const { container, api, lastChange } = renderGrid({ columns: cols });
        act(() => { api().selectCellRange({ id: 2, field: 'c' }, { id: 3, field: 'd' }); });
        expect(lastChange()).toEqual({ model: range(2, 'c', 3, 'd'), reason: 'api' });
        expect(api().getCellSelectionModel()).toEqual(range(2, 'c', 3, 'd'));
        expect(api().getSelectedCells()).toEqual([
            { id: 2, field: 'c', value: 20 }, { id: 2, field: 'd', value: 40 },
            { id: 3, field: 'c', value: 30 }, { id: 3, field: 'd', value: 60 },
        ]);
        expect(focusedCells(container)).toEqual(['1:c']);
        act(() => { api().clearCellSelection(); });
        expect(lastChange()).toEqual({ model: [], reason: 'clear' });
        expect(api().getCellSelectionModel()).toEqual([]);
    });

    it('answers with a model set in the same tick', () => {
        const { api } = renderGrid();
        let seen: GridCellSelectionModel = [];
        let cells: unknown[] = [];
        act(() => {
            api().setCellSelectionModel([...range(1, 'a', 1, 'b'), ...range(3, 'a', 3, 'a')]);
            seen = api().getCellSelectionModel();
            cells = api().getSelectedCells();
        });
        // Only the first range is kept in 3.3.
        expect(seen).toEqual(range(1, 'a', 1, 'b'));
        expect(cells).toHaveLength(2);
    });

    it('copySelectedCells writes the range as TSV without a header line', async () => {
        const { api } = renderGrid({ cellSelectionModel: range(2, 'a', 3, 'c') });
        await act(async () => { await api().copySelectedCells(); });
        expect(lastCopied()).toBe('a2\tb2\t20\na3\tb3\t30');
    });

    it('the methods are inert while cellSelection is off', async () => {
        const { api, changes } = renderGrid({ cellSelection: false });
        act(() => { api().selectCellRange({ id: 1, field: 'a' }, { id: 2, field: 'b' }); });
        expect(changes).toEqual([]);
        expect(api().getCellSelectionModel()).toEqual([]);
        expect(api().getSelectedCells()).toEqual([]);
        await act(async () => { await api().copySelectedCells(); });
        expect(writeText).not.toHaveBeenCalled();
    });
});

describe('cellSelection: Ctrl/Cmd+C', () => {
    it('copies the range formatted as the cells show it, exportable:false columns included', async () => {
        const cols: GridColDef<Row>[] = [
            COLS[0],
            { field: 'b', width: 100, exportable: false },
            { field: 'c', width: 100, valueFormatter: ({ value }) => `$${value}` },
        ];
        const { container } = renderGrid({ columns: cols });
        pointerClick(cellAt(container, 0, 'a'));
        key(grid(container), 'ArrowDown', { shiftKey: true });
        key(grid(container), 'End', { shiftKey: true });
        await pressCopy(cellAt(container, 0, 'a'));
        expect(lastCopied()).toBe('a1\tb1\t$10\na2\tb2\t$20');
    });

    it('copies the focused cell when no range is selected', async () => {
        const { container, api } = renderGrid();
        pointerClick(cellAt(container, 2, 'b'));
        act(() => { api().clearCellSelection(); });
        await pressCopy(cellAt(container, 2, 'b'));
        expect(lastCopied()).toBe('b3');
    });

    it('copies the range, not the selected rows; copySelectedRows still copies rows', async () => {
        const { container, api } = renderGrid({ rowSelectionModel: [1, 2] });
        pointerClick(cellAt(container, 3, 'c'));
        await pressCopy(cellAt(container, 3, 'c'));
        expect(lastCopied()).toBe('40');
        await act(async () => { await api().copySelectedRows(); });
        expect(lastCopied()).toBe('A\tB\tC\na1\tb1\t10\na2\tb2\t20');
    });

    it('copies columns in screen order with pinned columns', async () => {
        const { container } = renderGrid({ pinnedColumns: { left: ['c'], right: ['a'] } });
        pointerClick(cellAt(container, 0, 'c'));
        key(grid(container), 'End', { shiftKey: true });
        await pressCopy(cellAt(container, 0, 'c'));
        expect(lastCopied()).toBe('10\tb1\ta1');
    });

    it('skips group rows inside the range', async () => {
        type G = Row & { region: string };
        const rows: G[] = ROWS.map((r, i) => ({ ...r, region: i < 2 ? 'North' : 'South' }));
        const cols: GridColDef<G>[] = [{ field: 'region', width: 100 }, ...(COLS as GridColDef<G>[])];
        const { container } = render(
            <DataGrid<G> rows={rows} columns={cols} cellSelection rowGroupingModel={['region']} defaultGroupingExpansionDepth={-1} />
        );
        // Rows: North group, 1, 2, South group, 3, 4. (Clicking a group row would collapse it.)
        pointerClick(cellAt(container, 1, 'a'));
        key(grid(container), 'a', { ctrlKey: true });
        expect(rangeCells(container)).toContain('0:a');
        expect(rangeCells(container)).toContain('5:a');
        await pressCopy(cellAt(container, 0, 'a'));
        const lines = lastCopied().split('\n');
        expect(lines).toHaveLength(4);
        expect(lines.map(l => l.split('\t')[1])).toEqual(['a1', 'a2', 'a3', 'a4']);
    });

    it('a span grows the range, and its covered positions copy empty', async () => {
        const cols: GridColDef<Row>[] = [
            { field: 'a', width: 100, colSpan: ({ row }) => (row.id === 2 ? 2 : 1) },
            COLS[1],
            COLS[2],
        ];
        const { container, api } = renderGrid({ columns: cols });
        act(() => { api().selectCellRange({ id: 1, field: 'b' }, { id: 2, field: 'b' }); });
        // Row 2's 'a' spans over 'b', so the range grows left to 'a'.
        expect(rangeCells(container)).toEqual(['0:a', '0:b', '1:a']);
        await act(async () => { await api().copySelectedCells(); });
        expect(lastCopied()).toBe('a1\tb1\na2\t');
    });
});

describe('cellSelection: status bar', () => {
    it('shows count, sum and average of the range, and nothing for a single cell', () => {
        const rows: Row[] = [...ROWS, { id: 5, a: '', b: 'b5', c: Number.NaN }];
        const { container, rerenderGrid } = renderGrid({ rows, showCellSelectionStats: true, cellSelectionModel: range(1, 'a', 1, 'a') });
        const area = container.querySelector('.ogx__cell-selection-stats-area') as HTMLElement;
        expect(area).toBeTruthy();
        expect(area.textContent).toBe('');
        rerenderGrid({ rows, showCellSelectionStats: true, cellSelectionModel: range(1, 'a', 5, 'c') });
        const stat = (name: string) => container.querySelector(`[data-stat="${name}"]`)?.textContent;
        // 15 cells; the empty string is not counted (NaN is a value, as in the footer's count); numbers 10..40.
        expect(stat('count')).toBe('14');
        expect(stat('sum')).toBe((100).toLocaleString());
        expect(stat('average')).toBe((25).toLocaleString(undefined, { maximumFractionDigits: 2 }));
    });

    it('leaves out Sum and Average when the range holds no numbers', () => {
        const { container } = renderGrid({ showCellSelectionStats: true, cellSelectionModel: range(1, 'a', 2, 'b') });
        expect(container.querySelector('[data-stat="count"]')?.textContent).toBe('4');
        expect(container.querySelector('[data-stat="sum"]')).toBeNull();
    });

    it('can be replaced through slots.cellSelectionStats', () => {
        function MyStats(props: GridCellSelectionStatsSlotProps & Record<string, unknown>) {
            return <div data-testid="my-stats">{props.rowCount}x{props.columnCount}:{props.sum}:{String(props.extra)}</div>;
        }
        const { getByTestId } = renderGrid({
            showCellSelectionStats: true,
            cellSelectionModel: range(1, 'b', 2, 'c'),
            slots: { cellSelectionStats: MyStats },
            slotProps: { cellSelectionStats: { extra: 'yes' } },
        });
        expect(getByTestId('my-stats').textContent).toBe('2x2:30:yes');
    });

    it('is not rendered without cellSelection', () => {
        const { container } = render(<DataGrid<Row> rows={ROWS} columns={COLS} showCellSelectionStats />);
        expect(container.querySelector('.ogx__cell-selection-stats-area')).toBeNull();
    });
});

describe('cellSelection: live region', () => {
    it('announces the size of the range after 300 ms', () => {
        vi.useFakeTimers();
        const { container, rerenderGrid } = renderGrid({ cellSelectionModel: range(1, 'a', 3, 'b') });
        const status = container.querySelector('[role="status"]') as HTMLElement;
        expect(status.textContent).toBe('');
        act(() => { vi.advanceTimersByTime(299); });
        expect(status.textContent).toBe('');
        act(() => { vi.advanceTimersByTime(1); });
        expect(status.textContent?.trim()).toBe('6 cells selected, 3 rows by 2 columns');
        rerenderGrid({
            cellSelectionModel: range(1, 'a', 1, 'b'),
            localeText: { cellSelectionAnnouncement: (cells, r, c) => `${cells}/${r}/${c}` },
        });
        act(() => { vi.advanceTimersByTime(300); });
        expect(status.textContent?.trim()).toBe('2/1/2');
    });
});

describe('cellSelection off: behaviour unchanged', () => {
    it('Shift+ArrowRight moves focus (and wraps) like ArrowRight, and Ctrl+A selects every row', () => {
        const onRowSelectionModelChange = vi.fn();
        const { container } = render(
            <DataGrid<Row> rows={ROWS} columns={COLS} onRowSelectionModelChange={onRowSelectionModelChange} />
        );
        fireEvent.click(cellAt(container, 0, 'c'));
        key(grid(container), 'ArrowRight', { shiftKey: true });
        expect(focusedCells(container)).toEqual(['1:a']);
        key(grid(container), 'a', { ctrlKey: true });
        expect(onRowSelectionModelChange).toHaveBeenLastCalledWith([1, 2, 3, 4]);
        expect(rangeCells(container)).toEqual([]);
    });

    it('Ctrl+C copies the selected rows with a header line', async () => {
        const { container } = render(<DataGrid<Row> rows={ROWS} columns={COLS} rowSelectionModel={[2]} />);
        fireEvent.click(cellAt(container, 0, 'a'));
        await pressCopy(cellAt(container, 0, 'a'));
        expect(lastCopied()).toBe('A\tB\tC\na2\tb2\t20');
    });

    it('renders the same markup with cellSelection={false} as without the prop', () => {
        const a = render(<DataGrid<Row> rows={ROWS} columns={COLS} />);
        const b = render(<DataGrid<Row> rows={ROWS} columns={COLS} cellSelection={false} showCellSelectionStats />);
        const strip = (html: string) => html.replace(/_r_[0-9a-z]+_|:r[0-9a-z]+:/g, 'ID');
        expect(strip(b.container.innerHTML)).toBe(strip(a.container.innerHTML));
    });
});

describe('PERF: a range change re-renders only the rows it enters or leaves', () => {
    it('100,000 rows x 30 columns: growing the range by one row renders one row', () => {
        const ROW_COUNT = 100_000;
        type Wide = Record<string, number> & { id: number };
        const rows: Wide[] = Array.from({ length: ROW_COUNT }, (_, i) => ({ id: i } as Wide));
        const renders = new Map<number, number>();
        // Row reads every rendered cell through the valueGetter on each render: a per-row render counter.
        const counter = ({ row }: { row: Wide }) => {
            if (row.id !== undefined) renders.set(row.id, (renders.get(row.id) ?? 0) + 1);
            return row.id;
        };
        const cols: GridColDef<Wide>[] = Array.from({ length: 30 }, (_, i) => ({
            field: `f${i}`, width: 60, valueGetter: i === 0 ? counter : undefined,
        }));
        const holder: { api: React.MutableRefObject<GridApi> | null } = { api: null };
        function Harness() {
            const apiRef = useGridApiRef();
            holder.api = apiRef;
            return (
                <div style={{ height: 600, width: 800 }}>
                    <DataGrid<Wide> rows={rows} columns={cols} cellSelection apiRef={apiRef} />
                </div>
            );
        }
        render(<Harness />);
        const api = () => holder.api!.current;
        act(() => { api().selectCellRange({ id: 0, field: 'f0' }, { id: 1, field: 'f3' }); });
        for (let head = 2; head <= 6; head++) {
            renders.clear();
            act(() => { api().selectCellRange({ id: 0, field: 'f0' }, { id: head, field: 'f3' }); });
            // The row the range entered, and the previous bottom row (it loses its bottom edge).
            expect([...renders.keys()].sort((x, y) => x - y)).toEqual([head - 1, head]);
        }
    });
});

describe('cellSelection: theme tokens', () => {
    it('every built-in theme defines --ogx-range-background and --ogx-range-border', () => {
        for (const theme of [darkTheme, roseTheme, emeraldTheme, amberTheme, compactTheme]) {
            const { container, unmount } = render(<DataGridThemeProvider theme={theme}><div /></DataGridThemeProvider>);
            const el = container.querySelector<HTMLElement>('.ogx-theme-provider')!;
            expect(el.style.getPropertyValue('--ogx-range-background')).not.toBe('');
            expect(el.style.getPropertyValue('--ogx-range-border')).not.toBe('');
            unmount();
        }
    });

    it('maps grid.rangeBackground and grid.rangeBorder, and follows the primary colour otherwise', () => {
        const { container } = render(
            <DataGridThemeProvider theme={{ grid: { rangeBackground: 'rgba(1, 2, 3, 0.5)', rangeBorder: '#123456' } }}><div /></DataGridThemeProvider>
        );
        const el = container.querySelector<HTMLElement>('.ogx-theme-provider')!;
        expect(el.style.getPropertyValue('--ogx-range-background')).toBe('rgba(1, 2, 3, 0.5)');
        expect(el.style.getPropertyValue('--ogx-range-border')).toBe('#123456');
        const plain = render(<DataGridThemeProvider theme={{ colors: { primary: '#e11d48' } }}><div /></DataGridThemeProvider>);
        const vars = plain.container.querySelector<HTMLElement>('.ogx-theme-provider')!.style;
        expect(vars.getPropertyValue('--ogx-range-border')).toBe('var(--ogx-color-primary)');
    });
});
