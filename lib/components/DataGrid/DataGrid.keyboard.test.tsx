import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef } from '../../types';

// Keyboard and focus behaviour of the grid, driven through the public <DataGrid> props.
// Anything that needs layout or real browser focus navigation lives in DataGrid.focus.browser.test.tsx.

type Row = { id: number | string; a: string; b: string; c: string };

const ROWS: Row[] = [
    { id: 1, a: 'a1', b: 'b1', c: 'c1' },
    { id: 2, a: 'a2', b: 'b2', c: 'c2' },
    { id: 3, a: 'a3', b: 'b3', c: 'c3' },
];

const COLS: GridColDef<Row>[] = [
    { field: 'a', width: 100 },
    { field: 'b', width: 100 },
    { field: 'c', width: 100 },
];

const grid = (c: HTMLElement) => c.querySelector('.ogx__viewport') as HTMLElement;
const rowEl = (c: HTMLElement, rowIndex: number) => c.querySelector(`[role="row"][data-rowindex="${rowIndex}"]`) as HTMLElement;
const cellAt = (c: HTMLElement, rowIndex: number, field: string) =>
    rowEl(c, rowIndex)?.querySelector(`[data-field="${field}"]`) as HTMLElement;
const headerCell = (c: HTMLElement, field: string) =>
    c.querySelector(`.ogx__header [role="columnheader"][data-field="${field}"]`) as HTMLElement;
const focusedCells = (c: HTMLElement) =>
    Array.from(c.querySelectorAll<HTMLElement>('.ogx__cell--focused')).map(
        el => `${el.closest('[role="row"]')?.getAttribute('data-rowindex')}:${el.dataset.field}`
    );
const focusedHeader = (c: HTMLElement) =>
    c.querySelector<HTMLElement>('.ogx__header-cell--focused')?.dataset.field ?? null;
const key = (el: HTMLElement, k: string, init: Partial<KeyboardEventInit> = {}) =>
    fireEvent.keyDown(el, { key: k, ...init });

describe('keys typed inside cell and detail-panel content', () => {
    it('a space typed in a detail-panel input reaches the input and leaves the panel open', () => {
        const { container, getByTestId, queryByTestId } = render(
            <DataGrid rows={ROWS} columns={COLS} getDetailPanelContent={() => <input data-testid="panel-input" />} />
        );
        const expandCell = rowEl(container, 0).querySelector('.ogx__cell--expand') as HTMLElement;
        fireEvent.click(expandCell);
        fireEvent.click(expandCell.querySelector('button')!);
        const input = getByTestId('panel-input');
        input.focus();
        const notPrevented = key(input, ' ');
        expect(notPrevented).toBe(true);
        expect(queryByTestId('panel-input')).toBeInTheDocument();
    });

    it('arrow keys in a detail-panel input are not prevented and focus stays in the input', () => {
        const { container, getByTestId } = render(
            <DataGrid rows={ROWS} columns={COLS} getDetailPanelContent={() => <input data-testid="panel-input" />} />
        );
        fireEvent.click(cellAt(container, 0, 'b'));
        fireEvent.click(rowEl(container, 0).querySelector('.ogx__cell--expand button')!);
        const input = getByTestId('panel-input');
        input.focus();
        expect(key(input, 'ArrowLeft')).toBe(true);
        expect(key(input, 'Home')).toBe(true);
        expect(document.activeElement).toBe(input);
        expect(focusedCells(container)).toEqual(['0:b']);
    });

    it('arrow keys in a text input rendered by renderCell are left to the input', () => {
        const cols: GridColDef<Row>[] = [{ field: 'a', width: 100, renderCell: () => <input data-testid="rc-input" /> }, COLS[1]];
        const { container, getAllByTestId } = render(<DataGrid rows={ROWS} columns={cols} />);
        const input = getAllByTestId('rc-input')[0];
        fireEvent.click(input);
        input.focus();
        expect(key(input, 'ArrowRight')).toBe(true);
        expect(document.activeElement).toBe(input);
        expect(focusedCells(container)).toEqual(['0:a']);
    });

    it('arrow keys pressed on a button inside a cell still move grid focus', () => {
        const cols: GridColDef<Row>[] = [{ field: 'a', width: 100, renderCell: () => <button type="button">go</button> }, COLS[1]];
        const { container } = render(<DataGrid rows={ROWS} columns={cols} />);
        const button = cellAt(container, 0, 'a').querySelector('button')!;
        fireEvent.click(button);
        button.focus();
        expect(key(button, 'ArrowRight')).toBe(false);
        expect(focusedCells(container)).toEqual(['0:b']);
        expect(document.activeElement).toBe(cellAt(container, 0, 'b'));
    });
});

describe('mouse focus', () => {
    it('clicking an input rendered by renderCell keeps focus on the input', () => {
        const cols: GridColDef<Row>[] = [{ field: 'a', width: 100, renderCell: () => <input data-testid="rc-input" /> }, COLS[1]];
        const { getAllByTestId } = render(<DataGrid rows={ROWS.slice(0, 1)} columns={cols} />);
        const input = getAllByTestId('rc-input')[0];
        fireEvent.mouseDown(input);
        input.focus();
        fireEvent.click(input);
        expect(document.activeElement).toBe(input);
    });

    it('clicking the already focused cell keeps DOM focus on the cell', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} />);
        fireEvent.click(cellAt(container, 0, 'a'));
        expect(document.activeElement).toBe(cellAt(container, 0, 'a'));
        fireEvent.click(cellAt(container, 0, 'a'));
        expect(document.activeElement).toBe(cellAt(container, 0, 'a'));
    });

    it('committing an edit with Enter returns DOM focus to the edited cell', async () => {
        const cols: GridColDef<Row>[] = [{ field: 'a', width: 100, editable: true }, COLS[1]];
        const { container } = render(<DataGrid rows={ROWS} columns={cols} />);
        fireEvent.click(cellAt(container, 0, 'a'));
        key(grid(container), 'Enter');
        const input = container.querySelector('.ogx__edit-input') as HTMLInputElement;
        expect(document.activeElement).toBe(input);
        await act(async () => { key(input, 'Enter'); });
        expect(container.querySelector('.ogx__edit-input')).toBeNull();
        expect(document.activeElement).toBe(cellAt(container, 0, 'a'));
    });

    it('cancelling an edit with Escape returns DOM focus to the edited cell', async () => {
        const cols: GridColDef<Row>[] = [{ field: 'a', width: 100, editable: true }, COLS[1]];
        const { container } = render(<DataGrid rows={ROWS} columns={cols} />);
        fireEvent.click(cellAt(container, 1, 'a'));
        key(grid(container), 'Enter');
        const input = container.querySelector('.ogx__edit-input') as HTMLInputElement;
        await act(async () => { key(input, 'Escape'); });
        expect(document.activeElement).toBe(cellAt(container, 1, 'a'));
    });
});

describe('Ctrl+C copy shortcut scope', () => {
    let writeText: ReturnType<typeof vi.fn<(text: string) => Promise<void>>>;

    beforeEach(() => {
        writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
        Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true, writable: true });
    });
    afterEach(() => {
        Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true, writable: true });
        window.getSelection()?.removeAllRanges();
    });

    it('Ctrl+C with focus outside every grid neither copies nor moves focus', async () => {
        const { getByTestId } = render(
            <div>
                <button type="button" data-testid="outside">outside</button>
                <DataGrid rows={ROWS} columns={COLS} rowSelectionModel={[1]} />
                <DataGrid rows={ROWS} columns={COLS} rowSelectionModel={[2, 3]} />
            </div>
        );
        const button = getByTestId('outside');
        button.focus();
        await act(async () => { key(button, 'c', { ctrlKey: true }); });
        expect(writeText).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(button);
    });

    it('Ctrl+C inside a grid copies only that grid\'s selection', async () => {
        const { container } = render(
            <div>
                <DataGrid rows={ROWS} columns={COLS} rowSelectionModel={[1]} />
                <DataGrid rows={ROWS} columns={COLS} rowSelectionModel={[2, 3]} />
            </div>
        );
        const second = container.querySelectorAll<HTMLElement>('.ogx__viewport')[1];
        const cell = second.querySelector<HTMLElement>('[role="row"][data-rowindex="0"] [data-field="a"]')!;
        fireEvent.click(cell);
        await act(async () => { key(cell, 'c', { ctrlKey: true }); });
        expect(writeText).toHaveBeenCalledTimes(1);
        expect(writeText.mock.calls[0][0]).toBe('a\tb\tc\na2\tb2\tc2\na3\tb3\tc3');
    });

    it('Ctrl+C is left to the browser while the page has a text selection', async () => {
        const { container, getByTestId } = render(
            <div>
                <p data-testid="para">Some page text</p>
                <DataGrid rows={ROWS} columns={COLS} rowSelectionModel={[1]} />
            </div>
        );
        fireEvent.click(cellAt(container, 0, 'a'));
        const range = document.createRange();
        range.selectNodeContents(getByTestId('para'));
        window.getSelection()!.removeAllRanges();
        window.getSelection()!.addRange(range);
        await act(async () => { key(cellAt(container, 0, 'a'), 'c', { ctrlKey: true }); });
        expect(writeText).not.toHaveBeenCalled();
    });
});

describe('focus after the focused row or column disappears', () => {
    it('arrow keys recover after the focused row is removed', () => {
        const { container, rerender } = render(<DataGrid rows={ROWS} columns={COLS} />);
        fireEvent.click(cellAt(container, 1, 'a'));
        rerender(<DataGrid rows={[ROWS[0], ROWS[2]]} columns={COLS} />);
        expect(focusedCells(container)).toEqual(['1:a']);
        key(grid(container), 'ArrowUp');
        expect(focusedCells(container)).toEqual(['0:a']);
        expect(document.activeElement).toBe(cellAt(container, 0, 'a'));
    });

    it('arrow keys recover after the focused row is filtered out', () => {
        const { container, rerender } = render(<DataGrid rows={ROWS} columns={COLS} />);
        fireEvent.click(cellAt(container, 1, 'a'));
        rerender(<DataGrid rows={ROWS} columns={COLS} filterModel={{ items: [{ field: 'a', operator: 'equals', value: 'a1' }] }} />);
        grid(container).focus();
        key(grid(container), 'ArrowUp');
        expect(focusedHeader(container)).toBe('a');
        key(grid(container), 'ArrowDown');
        expect(focusedCells(container)).toEqual(['0:a']);
    });

    it('keeps focus on the grid when the focused cell is removed', () => {
        const { container, rerender } = render(<DataGrid rows={ROWS} columns={COLS} />);
        fireEvent.click(cellAt(container, 2, 'a'));
        rerender(<DataGrid rows={ROWS.slice(0, 2)} columns={COLS} />);
        expect(grid(container).contains(document.activeElement)).toBe(true);
    });

    it('a re-mounted focused row does not steal focus from an outside input', () => {
        const Wrapper = ({ rows }: { rows: Row[] }) => (
            <div>
                <input data-testid="search" />
                <DataGrid rows={rows} columns={COLS} />
            </div>
        );
        const { container, rerender, getByTestId } = render(<Wrapper rows={ROWS} />);
        fireEvent.click(cellAt(container, 1, 'a'));
        rerender(<Wrapper rows={[ROWS[0], ROWS[2]]} />);
        const search = getByTestId('search');
        search.focus();
        rerender(<Wrapper rows={ROWS} />);
        expect(document.activeElement).toBe(search);
    });

    it('focus falls back to a visible column when the focused column is hidden', () => {
        const { container, rerender } = render(<DataGrid rows={ROWS} columns={COLS} />);
        fireEvent.click(cellAt(container, 0, 'b'));
        rerender(<DataGrid rows={ROWS} columns={COLS} columnVisibilityModel={{ b: false }} />);
        key(grid(container), 'ArrowDown');
        expect(focusedCells(container)).toHaveLength(1);
    });
});

describe('Tab key', () => {
    const manyRows: Row[] = Array.from({ length: 50 }, (_, i) => ({ id: i + 1, a: `a${i + 1}`, b: '', c: '' }));

    it('Tab from a cell is left to the browser with checkboxSelection', () => {
        const { container } = render(<DataGrid rows={manyRows} columns={COLS} checkboxSelection />);
        fireEvent.click(cellAt(container, 0, 'c'));
        expect(key(grid(container), 'Tab')).toBe(true);
        expect(focusedCells(container)).toEqual(['0:c']);
    });

    it('Shift+Tab from a cell is left to the browser with rowReordering and a detail panel', () => {
        const { container } = render(
            <DataGrid rows={manyRows} columns={COLS} rowReordering getDetailPanelContent={() => 'detail'} />
        );
        fireEvent.click(cellAt(container, 3, 'a'));
        expect(key(grid(container), 'Tab', { shiftKey: true })).toBe(true);
        expect(focusedCells(container)).toEqual(['3:a']);
    });

    it('Tab inside a detail-panel input is left to the browser', () => {
        const { container, getByTestId } = render(
            <DataGrid
                rows={ROWS}
                columns={COLS}
                getDetailPanelContent={() => <input data-testid="panel-input" />}
                detailPanelExpandedRowIds={new Set([1])}
            />
        );
        fireEvent.click(cellAt(container, 0, 'c'));
        const input = getByTestId('panel-input');
        input.focus();
        expect(key(input, 'Tab')).toBe(true);
        expect(focusedCells(container)).toEqual(['0:c']);
    });

    it('while the grid holds focus the viewport is not an extra tab stop', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} />);
        expect(grid(container).tabIndex).toBe(0);
        fireEvent.click(cellAt(container, 0, 'a'));
        expect(grid(container).tabIndex).toBe(-1);
    });

    it('Tab while editing still commits and moves to the next editable cell', async () => {
        const cols: GridColDef<Row>[] = [
            { field: 'a', width: 100, editable: true },
            { field: 'b', width: 100 },
            { field: 'c', width: 100, editable: true },
        ];
        const { container } = render(<DataGrid rows={ROWS} columns={cols} checkboxSelection />);
        fireEvent.click(cellAt(container, 0, 'a'));
        key(grid(container), 'Enter');
        const input = container.querySelector('.ogx__edit-input') as HTMLInputElement;
        await act(async () => { key(input, 'Tab'); });
        expect(focusedCells(container)).toEqual(['0:c']);
        await act(async () => { key(grid(container), 'Enter'); });
        const next = container.querySelector('.ogx__edit-input') as HTMLInputElement;
        await act(async () => { key(next, 'Tab'); });
        // The next editable cell is in the next row; the checkbox column is not a Tab stop while editing.
        expect(focusedCells(container)).toEqual(['1:a']);
    });
});

describe('navigation column order', () => {
    it('ArrowRight skips a hidden column', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} columnVisibilityModel={{ b: false }} />);
        fireEvent.click(cellAt(container, 0, 'a'));
        key(grid(container), 'ArrowRight');
        expect(focusedCells(container)).toEqual(['0:c']);
    });

    it('End goes to the last visible column', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} columnVisibilityModel={{ c: false }} />);
        fireEvent.click(cellAt(container, 0, 'a'));
        key(grid(container), 'End');
        expect(focusedCells(container)).toEqual(['0:b']);
    });

    it('initial focus never lands on a hidden first column', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} columnVisibilityModel={{ a: false }} />);
        fireEvent.focus(grid(container));
        expect(focusedCells(container)).toEqual(['0:b']);
    });

    it('navigation follows the pinned visual order', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} pinnedColumns={{ left: ['c'] }} />);
        const order = Array.from(rowEl(container, 0).querySelectorAll<HTMLElement>('[role="gridcell"]')).map(e => e.dataset.field);
        expect(order).toEqual(['c', 'a', 'b']);
        fireEvent.click(cellAt(container, 0, 'c'));
        key(grid(container), 'ArrowRight');
        expect(focusedCells(container)).toEqual(['0:a']);
        key(grid(container), 'Home');
        expect(focusedCells(container)).toEqual(['0:c']);
    });
});

describe('system columns', () => {
    it('Space on the select-all header cell selects every row and does not sort', () => {
        const onSortModelChange = vi.fn();
        const onRowSelectionModelChange = vi.fn();
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} checkboxSelection
                onSortModelChange={onSortModelChange} onRowSelectionModelChange={onRowSelectionModelChange} />
        );
        fireEvent.focus(grid(container));
        key(grid(container), ' ');
        expect(onSortModelChange).not.toHaveBeenCalled();
        expect(onRowSelectionModelChange).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('Enter on the select-all header cell clears a full selection', () => {
        const onRowSelectionModelChange = vi.fn();
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} checkboxSelection rowSelectionModel={[1, 2, 3]}
                onRowSelectionModelChange={onRowSelectionModelChange} />
        );
        fireEvent.focus(grid(container));
        key(grid(container), 'Enter');
        expect(onRowSelectionModelChange).toHaveBeenCalledWith([]);
    });

    it('Enter on the detail-panel header column does not sort', () => {
        const onSortModelChange = vi.fn();
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} getDetailPanelContent={() => 'x'} onSortModelChange={onSortModelChange} />
        );
        fireEvent.click(headerCell(container, 'a'));
        onSortModelChange.mockClear();
        key(grid(container), 'ArrowLeft');
        expect(document.activeElement).toBe(container.querySelector('.ogx__header-cell--expand'));
        key(grid(container), 'Enter');
        expect(onSortModelChange).not.toHaveBeenCalled();
    });

    it('Home moves DOM focus onto the row reorder handle cell', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} rowReordering />);
        fireEvent.click(cellAt(container, 0, 'a'));
        key(grid(container), 'Home');
        const handle = rowEl(container, 0).querySelector('.ogx__cell--drag-handle') as HTMLElement;
        expect(document.activeElement).toBe(handle);
        expect(handle.className).toContain('ogx__cell--focused');
    });

    it('ArrowLeft from header a focuses the reorder header cell', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} rowReordering />);
        fireEvent.click(headerCell(container, 'a'));
        key(grid(container), 'ArrowLeft');
        expect(document.activeElement).toBe(container.querySelector('.ogx__header [aria-label="Row reorder handle"]'));
    });

    it('Enter on a row checkbox cell toggles that row', () => {
        const onRowSelectionModelChange = vi.fn();
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} checkboxSelection onRowSelectionModelChange={onRowSelectionModelChange} />
        );
        fireEvent.click(rowEl(container, 1).querySelector('.ogx__cell--checkbox')!);
        key(grid(container), 'Enter');
        expect(onRowSelectionModelChange).toHaveBeenLastCalledWith([2]);
    });

    it('Enter on the expand cell toggles the detail panel', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} getDetailPanelContent={() => <span>detail</span>} />);
        fireEvent.click(rowEl(container, 0).querySelector('.ogx__cell--expand')!);
        key(grid(container), 'Enter');
        expect(container.querySelector('.ogx__detail-panel')).not.toBeNull();
    });
});

describe('pinned rows', () => {
    it('Enter on an editable cell of a pinned row opens an editor there, and Escape restores navigation', async () => {
        const cols: GridColDef<Row>[] = [{ field: 'a', width: 100, editable: true }, COLS[1]];
        const { container } = render(<DataGrid rows={ROWS} columns={cols} pinnedRows={{ top: [1] }} />);
        fireEvent.click(cellAt(container, 0, 'a'));
        key(grid(container), 'Enter');
        const input = cellAt(container, 0, 'a').querySelector('.ogx__edit-input') as HTMLInputElement;
        expect(input).not.toBeNull();
        await act(async () => { key(input, 'Escape'); });
        key(grid(container), 'ArrowDown');
        expect(focusedCells(container)).toEqual(['1:a']);
    });

    it('double-click on an editable cell of a pinned row opens an editor', () => {
        const cols: GridColDef<Row>[] = [{ field: 'a', width: 100, editable: true }, COLS[1]];
        const { container } = render(<DataGrid rows={ROWS} columns={cols} pinnedRows={{ bottom: [3] }} />);
        fireEvent.doubleClick(cellAt(container, 2, 'a'));
        expect(cellAt(container, 2, 'a').querySelector('.ogx__edit-input')).not.toBeNull();
    });
});

describe('hierarchy rows from the keyboard', () => {
    type GRow = { id: number; region: string; amount: number };
    const gRows: GRow[] = [{ id: 1, region: 'N', amount: 1 }, { id: 2, region: 'S', amount: 2 }];
    const gCols: GridColDef<GRow>[] = [{ field: 'region', width: 100 }, { field: 'amount', width: 100, editable: true }];
    const count = (c: HTMLElement) => c.querySelectorAll('[role="row"][data-rowindex]').length;

    it('Enter on a group row expands and collapses it without opening an editor', () => {
        const { container } = render(<DataGrid rows={gRows} columns={gCols} rowGroupingModel={['region']} />);
        fireEvent.focus(grid(container));
        expect(count(container)).toBe(2);
        key(grid(container), 'ArrowRight');
        key(grid(container), 'Enter');
        expect(container.querySelector('.ogx__edit-input')).toBeNull();
        expect(count(container)).toBe(3);
        expect(rowEl(container, 0).getAttribute('aria-expanded')).toBe('true');
        key(grid(container), 'Enter');
        expect(count(container)).toBe(2);
    });

    it('the expand buttons inside hierarchy cells are not tab stops', () => {
        const { container } = render(<DataGrid rows={gRows} columns={gCols} rowGroupingModel={['region']} />);
        const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('.ogx-expand-icon'));
        expect(buttons.length).toBeGreaterThan(0);
        expect(buttons.map(b => b.tabIndex)).toEqual(buttons.map(() => -1));
    });
});

describe('Enter-to-edit value', () => {
    type PRow = { id: number; first: string; last: string };
    it('Enter opens the editor with the valueGetter value, as double-click does', () => {
        const cols: GridColDef<PRow>[] = [
            { field: 'full', width: 150, editable: true, valueGetter: ({ row }) => `${row.first} ${row.last}` },
        ];
        const { container } = render(<DataGrid rows={[{ id: 1, first: 'Ada', last: 'Lovelace' }]} columns={cols} />);
        fireEvent.doubleClick(cellAt(container, 0, 'full'));
        const viaDoubleClick = (container.querySelector('.ogx__edit-input') as HTMLInputElement).value;
        key(container.querySelector('.ogx__edit-input') as HTMLElement, 'Escape');
        fireEvent.click(cellAt(container, 0, 'full'));
        key(grid(container), 'Enter');
        const viaEnter = (container.querySelector('.ogx__edit-input') as HTMLInputElement).value;
        expect({ viaDoubleClick, viaEnter }).toEqual({ viaDoubleClick: 'Ada Lovelace', viaEnter: 'Ada Lovelace' });
    });
});

describe('empty grid', () => {
    it('focusing an empty grid puts focus on the first header cell', () => {
        const { container } = render(<DataGrid rows={[]} columns={COLS} />);
        fireEvent.focus(grid(container));
        expect(focusedHeader(container)).toBe('a');
    });

    it('the header of a grid emptied by a filter can be sorted from the keyboard', () => {
        const onSortModelChange = vi.fn();
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} onSortModelChange={onSortModelChange}
                filterModel={{ items: [{ field: 'a', operator: 'equals', value: 'nothing' }] }} />
        );
        fireEvent.focus(grid(container));
        key(grid(container), 'ArrowRight');
        key(grid(container), 'Enter');
        expect(focusedHeader(container)).toBe('b');
        expect(onSortModelChange).toHaveBeenCalledWith([{ field: 'b', sort: 'asc' }]);
    });

    it('rows removed under a focused cell leave focus on the header', () => {
        const { container, rerender } = render(<DataGrid rows={ROWS} columns={COLS} />);
        fireEvent.click(cellAt(container, 0, 'b'));
        rerender(<DataGrid rows={[]} columns={COLS} />);
        key(grid(container), 'ArrowRight');
        expect(focusedHeader(container)).toBe('c');
    });
});

describe('a row whose id is the string "HEADER"', () => {
    const rows: Row[] = [{ id: 'HEADER', a: 'x', b: 'y', c: 'z' }, { id: 'r2', a: 'p', b: 'q', c: 'r' }];

    it('is navigated and activated like any other row', () => {
        const onSortModelChange = vi.fn();
        const { container } = render(<DataGrid rows={rows} columns={COLS} onSortModelChange={onSortModelChange} />);
        fireEvent.click(cellAt(container, 0, 'a'));
        expect(focusedHeader(container)).toBeNull();
        key(grid(container), 'Enter');
        expect(onSortModelChange).not.toHaveBeenCalled();
        key(grid(container), 'ArrowDown');
        expect(focusedCells(container)).toEqual(['1:a']);
    });
});

describe('row selection and activation from the keyboard', () => {
    it('Shift+Space toggles the focused row and updates aria-selected', () => {
        const onRowSelectionModelChange = vi.fn();
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} onRowSelectionModelChange={onRowSelectionModelChange} />);
        fireEvent.focus(grid(container));
        key(grid(container), 'ArrowDown');
        expect(key(grid(container), ' ', { shiftKey: true })).toBe(false);
        expect(onRowSelectionModelChange).toHaveBeenLastCalledWith([2]);
        expect(rowEl(container, 1).getAttribute('aria-selected')).toBe('true');
        key(grid(container), ' ', { shiftKey: true });
        expect(onRowSelectionModelChange).toHaveBeenLastCalledWith([]);
    });

    it('Shift+Space does not select a synthetic group row', () => {
        type GRow = { id: number; region: string };
        const onRowSelectionModelChange = vi.fn();
        const { container } = render(
            <DataGrid<GRow> rows={[{ id: 1, region: 'N' }]} columns={[{ field: 'region', width: 100 }]}
                rowGroupingModel={['region']} onRowSelectionModelChange={onRowSelectionModelChange} />
        );
        fireEvent.focus(grid(container));
        key(grid(container), ' ', { shiftKey: true });
        expect(onRowSelectionModelChange).not.toHaveBeenCalled();
    });

    it('Shift+Space does nothing when rows cannot be selected', () => {
        const onRowSelectionModelChange = vi.fn();
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} disableRowSelectionOnClick onRowSelectionModelChange={onRowSelectionModelChange} />
        );
        fireEvent.focus(grid(container));
        key(grid(container), ' ', { shiftKey: true });
        expect(onRowSelectionModelChange).not.toHaveBeenCalled();
    });

    it('plain Space on a data cell is prevented so the viewport does not scroll', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} />);
        fireEvent.click(cellAt(container, 0, 'a'));
        expect(key(grid(container), ' ')).toBe(false);
    });

    it('arrow keys at the edge of the grid are still prevented', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} />);
        fireEvent.click(cellAt(container, 2, 'c'));
        expect(key(grid(container), 'ArrowDown')).toBe(false);
        expect(key(grid(container), 'ArrowRight')).toBe(false);
    });

    it('Enter on a non-editable cell activates the row like a click', () => {
        const onRowClick = vi.fn();
        const onRowSelectionModelChange = vi.fn();
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} onRowClick={onRowClick} onRowSelectionModelChange={onRowSelectionModelChange} />
        );
        fireEvent.focus(grid(container));
        key(grid(container), 'ArrowDown');
        key(grid(container), 'Enter');
        expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ id: 2, rowIndex: 1 }));
        expect(onRowSelectionModelChange).toHaveBeenLastCalledWith([2]);
    });

    it('Ctrl+A selects every row when multiple selection is possible', () => {
        const onRowSelectionModelChange = vi.fn();
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} checkboxSelection onRowSelectionModelChange={onRowSelectionModelChange} />
        );
        fireEvent.click(cellAt(container, 0, 'a'));
        onRowSelectionModelChange.mockClear();
        expect(key(grid(container), 'a', { ctrlKey: true })).toBe(false);
        expect(onRowSelectionModelChange).toHaveBeenLastCalledWith([1, 2, 3]);
    });

    it('Ctrl+A is left to the browser with disableMultipleRowSelection', () => {
        const onRowSelectionModelChange = vi.fn();
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} checkboxSelection disableMultipleRowSelection onRowSelectionModelChange={onRowSelectionModelChange} />
        );
        fireEvent.click(cellAt(container, 0, 'a'));
        onRowSelectionModelChange.mockClear();
        expect(key(grid(container), 'a', { ctrlKey: true })).toBe(true);
        expect(onRowSelectionModelChange).not.toHaveBeenCalled();
    });
});

describe('aria-multiselectable', () => {
    it('is true when several rows can be selected', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} checkboxSelection />);
        expect(grid(container).getAttribute('aria-multiselectable')).toBe('true');
    });

    it('is false with disableMultipleRowSelection', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} checkboxSelection disableMultipleRowSelection />);
        expect(grid(container).getAttribute('aria-multiselectable')).toBe('false');
    });

    it('is false when rows cannot be selected at all', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} disableRowSelectionOnClick />);
        expect(grid(container).getAttribute('aria-multiselectable')).toBe('false');
    });
});

describe('column menu from the keyboard', () => {
    const menuItems = () => Array.from(document.querySelectorAll<HTMLElement>('[role="menu"] [role^="menuitem"]'));

    it('Alt+ArrowDown on a focused header opens the menu and focuses its first item', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} />);
        fireEvent.focus(grid(container));
        key(grid(container), 'ArrowUp');
        const header = headerCell(container, 'a');
        expect(document.activeElement).toBe(header);
        key(header, 'ArrowDown', { altKey: true });
        expect(document.querySelector('[role="menu"]')).not.toBeNull();
        expect(document.activeElement).toBe(menuItems()[0]);
        expect(focusedHeader(container)).toBe('a');
    });

    it('Ctrl+Enter also opens the menu instead of sorting', () => {
        const onSortModelChange = vi.fn();
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} onSortModelChange={onSortModelChange} />);
        fireEvent.click(headerCell(container, 'b'));
        onSortModelChange.mockClear();
        key(headerCell(container, 'b'), 'Enter', { ctrlKey: true });
        expect(document.querySelector('[role="menu"]')).not.toBeNull();
        expect(onSortModelChange).not.toHaveBeenCalled();
    });

    it('arrow keys move between menu items and Escape returns focus to the header', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} />);
        fireEvent.click(headerCell(container, 'a'));
        key(headerCell(container, 'a'), 'ArrowDown', { altKey: true });
        const items = menuItems();
        key(document.activeElement as HTMLElement, 'ArrowDown');
        expect(document.activeElement).toBe(items[1]);
        key(document.activeElement as HTMLElement, 'ArrowUp');
        key(document.activeElement as HTMLElement, 'ArrowUp');
        expect(document.activeElement).toBe(items[items.length - 1]);
        key(document.activeElement as HTMLElement, 'Home');
        expect(document.activeElement).toBe(items[0]);
        expect(focusedHeader(container)).toBe('a');
        act(() => { key(document.activeElement as HTMLElement, 'Escape'); });
        expect(document.querySelector('[role="menu"]')).toBeNull();
        expect(document.activeElement).toBe(headerCell(container, 'a'));
        key(headerCell(container, 'a'), 'ArrowRight');
        expect(focusedHeader(container)).toBe('b');
    });

    it('hiding a column from the menu keeps keyboard focus in the grid header', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} />);
        fireEvent.click(headerCell(container, 'b'));
        key(headerCell(container, 'b'), 'ArrowDown', { altKey: true });
        const hide = menuItems().find(el => el.textContent?.includes('Hide Column'))!;
        act(() => { fireEvent.click(hide); });
        expect(headerCell(container, 'b')).toBeNull();
        expect(focusedHeader(container)).not.toBeNull();
        expect(grid(container).contains(document.activeElement)).toBe(true);
    });

    it('a menu opened with the mouse moves focus into the menu', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} />);
        fireEvent.click(headerCell(container, 'a').querySelector('.ogx__menu-icon-btn')!);
        expect(document.activeElement).toBe(menuItems()[0]);
    });
});
