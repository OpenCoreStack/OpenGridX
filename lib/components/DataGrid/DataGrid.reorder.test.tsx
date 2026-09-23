import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { useState } from 'react';
import { DataGrid } from './DataGrid';
import { GridToolbar } from '../Toolbar/GridToolbar';
import type { GridColDef, GridRowModel, GridRowOrderChangeParams, GridColumnOrderChangeParams } from '../../types';

// A DataTransfer double that behaves like the browser's: what dragstart stores shows up in `types`.
function createDataTransfer(initialTypes: string[] = []) {
    const store = new Map<string, string>(initialTypes.map(t => [t, '']));
    return {
        effectAllowed: 'none',
        dropEffect: 'none',
        setData: (type: string, value: string) => { store.set(type, value); },
        getData: (type: string) => store.get(type) ?? '',
        setDragImage: () => {},
        get types() { return Array.from(store.keys()); },
    };
}

function rowEl(container: HTMLElement, text: string): HTMLElement {
    const row = Array.from(container.querySelectorAll<HTMLElement>('.ogx__row')).find(r => r.textContent?.includes(text));
    if (!row) throw new Error(`no row ${text}`);
    return row;
}

function dragRow(container: HTMLElement, from: string, to: string) {
    const dataTransfer = createDataTransfer();
    const handle = rowEl(container, from).querySelector('.ogx__cell--drag-handle') as HTMLElement;
    fireEvent.dragStart(handle, { dataTransfer });
    const target = rowEl(container, to);
    const notCancelled = fireEvent.dragOver(target, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });
    fireEvent.dragEnd(handle, { dataTransfer });
    return { accepted: !notCancelled };
}

function headerEl(container: HTMLElement, field: string): HTMLElement {
    return container.querySelector(`.ogx__header [role="columnheader"][data-field="${field}"]`) as HTMLElement;
}

function headerOrder(container: HTMLElement): (string | null)[] {
    return Array.from(container.querySelectorAll('.ogx__header [role="columnheader"][data-field]'))
        .map(h => h.getAttribute('data-field'))
        .filter(f => f !== '__reorder_col__');
}

function dragHeader(container: HTMLElement, from: string, to: string) {
    const dataTransfer = createDataTransfer();
    fireEvent.dragStart(headerEl(container, from), { dataTransfer });
    fireEvent.dragOver(headerEl(container, to), { dataTransfer });
    fireEvent.drop(headerEl(container, to), { dataTransfer });
    fireEvent.dragEnd(headerEl(container, from), { dataTransfer });
}

const NAME_COL: GridColDef[] = [{ field: 'name', width: 150 }];
const SIX_ROWS: GridRowModel[] = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, name: `row${i + 1}` }));

describe('row reordering: onRowOrderChange indices address the rows prop', () => {
    it('on page 2, reports positions in rows, not on the page', () => {
        const onRowOrderChange = vi.fn<(p: GridRowOrderChangeParams) => void>();
        const { container } = render(
            <DataGrid rows={SIX_ROWS} columns={NAME_COL} rowReordering onRowOrderChange={onRowOrderChange}
                pagination paginationModel={{ page: 1, pageSize: 3 }} />
        );
        dragRow(container, 'row6', 'row4');
        expect(onRowOrderChange).toHaveBeenCalledWith({ row: SIX_ROWS[5], oldIndex: 5, targetIndex: 3 });
    });

    it('with pinned rows, counts the pinned rows too', () => {
        const onRowOrderChange = vi.fn<(p: GridRowOrderChangeParams) => void>();
        const { container } = render(
            <DataGrid rows={SIX_ROWS} columns={NAME_COL} rowReordering onRowOrderChange={onRowOrderChange} pinnedRows={{ top: [1] }} />
        );
        dragRow(container, 'row4', 'row2');
        expect(onRowOrderChange).toHaveBeenCalledWith({ row: SIX_ROWS[3], oldIndex: 3, targetIndex: 1 });
    });

    it('while sorted, reports positions in the unsorted rows', () => {
        const onRowOrderChange = vi.fn<(p: GridRowOrderChangeParams) => void>();
        const { container } = render(
            <DataGrid rows={SIX_ROWS} columns={NAME_COL} rowReordering onRowOrderChange={onRowOrderChange}
                sortModel={[{ field: 'name', sort: 'desc' }]} />
        );
        dragRow(container, 'row6', 'row4');
        expect(onRowOrderChange).toHaveBeenCalledWith({ row: SIX_ROWS[5], oldIndex: 5, targetIndex: 3 });
    });

    it('the documented splice moves the dragged row', () => {
        function Grid() {
            const [rows, setRows] = useState(SIX_ROWS);
            return (
                <DataGrid rows={rows} columns={NAME_COL} rowReordering pagination paginationModel={{ page: 1, pageSize: 3 }}
                    onRowOrderChange={({ oldIndex, targetIndex }) => {
                        const next = [...rows];
                        const [moved] = next.splice(oldIndex, 1);
                        next.splice(targetIndex, 0, moved);
                        setRows(next);
                    }} />
            );
        }
        const { container } = render(<Grid />);
        dragRow(container, 'row6', 'row4');
        const names = Array.from(container.querySelectorAll('.ogx__rows .ogx__row')).map(r => r.textContent);
        expect(names).toEqual(['row6', 'row4', 'row5']);
    });

    it('a row whose id is 0 can be dragged', () => {
        const onRowOrderChange = vi.fn<(p: GridRowOrderChangeParams) => void>();
        const rows: GridRowModel[] = [{ id: 0, name: 'zero' }, { id: 1, name: 'one' }, { id: 2, name: 'two' }];
        const { container } = render(<DataGrid rows={rows} columns={NAME_COL} rowReordering onRowOrderChange={onRowOrderChange} />);
        expect(dragRow(container, 'zero', 'two').accepted).toBe(true);
        expect(onRowOrderChange).toHaveBeenCalledWith({ row: rows[0], oldIndex: 0, targetIndex: 2 });
    });

    it('with getRowId, the payload row is the consumer object, id untouched', () => {
        type Coded = { id: number; code: string; name: string };
        const rows: Coded[] = [{ id: 10, code: 'A', name: 'a' }, { id: 20, code: 'B', name: 'b' }, { id: 30, code: 'C', name: 'c' }];
        const onRowOrderChange = vi.fn<(p: GridRowOrderChangeParams<Coded>) => void>();
        const { container } = render(
            <DataGrid<Coded> rows={rows} columns={[{ field: 'name', width: 150 }]} getRowId={r => r.code} rowReordering onRowOrderChange={onRowOrderChange} />
        );
        const rendered = container.querySelectorAll<HTMLElement>('.ogx__rows .ogx__row');
        const dataTransfer = createDataTransfer();
        fireEvent.dragStart(rendered[2].querySelector('.ogx__cell--drag-handle')!, { dataTransfer });
        fireEvent.dragOver(rendered[0], { dataTransfer });
        fireEvent.drop(rendered[0], { dataTransfer });
        expect(onRowOrderChange.mock.calls[0][0].row).toBe(rows[2]);
        expect(onRowOrderChange.mock.calls[0][0]).toMatchObject({ oldIndex: 2, targetIndex: 0 });
    });

    it('group rows cannot be dragged or dropped on', () => {
        const onRowOrderChange = vi.fn<(p: GridRowOrderChangeParams) => void>();
        const rows: GridRowModel[] = [
            { id: 1, name: 'ann', team: 'red' },
            { id: 2, name: 'bob', team: 'blue' },
        ];
        const { container } = render(
            <DataGrid rows={rows} columns={[{ field: 'team', width: 150 }, { field: 'name', width: 150 }]}
                rowReordering onRowOrderChange={onRowOrderChange} rowGroupingModel={['team']} defaultGroupingExpansionDepth={-1} />
        );
        const groupRow = rowEl(container, 'team: red');
        const handle = groupRow.querySelector('.ogx__cell--drag-handle') as HTMLElement;
        expect(handle.getAttribute('draggable')).toBe('false');
        expect(dragRow(container, 'bob', 'team: red').accepted).toBe(false);
        expect(onRowOrderChange).not.toHaveBeenCalled();
    });

    it('pinned rows render an inert reorder cell, so their cells line up with the header', () => {
        const { container } = render(<DataGrid rows={SIX_ROWS} columns={NAME_COL} rowReordering pinnedRows={{ top: [1], bottom: [6] }} />);
        const pinned = container.querySelectorAll('.ogx__pinned-rows .ogx__row');
        expect(pinned).toHaveLength(2);
        pinned.forEach(row => {
            const handle = row.querySelector('.ogx__cell--drag-handle');
            expect(handle).not.toBeNull();
            expect(handle?.getAttribute('draggable')).toBe('false');
            expect(row.firstElementChild).toBe(handle);
        });
    });

    it('a drag whose source row unmounted leaves nothing behind: an outside drop does not reorder', async () => {
        const onRowOrderChange = vi.fn<(p: GridRowOrderChangeParams) => void>();
        const rows = Array.from({ length: 300 }, (_, i) => ({ id: i + 1, name: `row${i + 1}` }));
        const { container } = render(<DataGrid rows={rows} columns={NAME_COL} rowReordering onRowOrderChange={onRowOrderChange} height={600} />);
        const handle = container.querySelector('.ogx__rows .ogx__row .ogx__cell--drag-handle') as HTMLElement;
        fireEvent.dragStart(handle, { dataTransfer: createDataTransfer() });
        const viewport = container.querySelector('.ogx__viewport') as HTMLElement;
        await act(async () => {
            viewport.scrollTop = 5000;
            fireEvent.scroll(viewport);
            await new Promise(r => setTimeout(r, 50));
        });
        expect(container.contains(handle)).toBe(false);

        // A file dragged in from the desktop is not a row drag.
        const file = createDataTransfer(['Files']);
        const target = container.querySelector('.ogx__rows .ogx__row') as HTMLElement;
        const notCancelled = fireEvent.dragOver(target, { dataTransfer: file });
        fireEvent.drop(target, { dataTransfer: file });
        expect(notCancelled).toBe(true);
        expect(onRowOrderChange).not.toHaveBeenCalled();
        expect(container.querySelector('.ogx__row--dragging')).toBeNull();
    });

    it('a native dragend on a detached source row still ends the drag', () => {
        const onRowOrderChange = vi.fn<(p: GridRowOrderChangeParams) => void>();
        const { container } = render(<DataGrid rows={SIX_ROWS} columns={NAME_COL} rowReordering onRowOrderChange={onRowOrderChange} />);
        const handle = rowEl(container, 'row1').querySelector('.ogx__cell--drag-handle') as HTMLElement;
        fireEvent.dragStart(handle, { dataTransfer: createDataTransfer() });
        expect(rowEl(container, 'row1').classList.contains('ogx__row--dragging')).toBe(true);
        // What the browser does when the source was removed: dragend on the node, out of React's reach.
        handle.remove();
        act(() => { handle.dispatchEvent(new Event('dragend')); });
        expect(container.querySelector('.ogx__row--dragging')).toBeNull();
    });

    it('puts a row token into the DataTransfer (Firefox needs data to start a drag)', () => {
        const { container } = render(<DataGrid rows={SIX_ROWS} columns={NAME_COL} rowReordering onRowOrderChange={() => {}} />);
        const dataTransfer = createDataTransfer();
        fireEvent.dragStart(rowEl(container, 'row2').querySelector('.ogx__cell--drag-handle')!, { dataTransfer });
        expect(dataTransfer.types).toContain('application/x-ogx-row');
        expect(dataTransfer.getData('text/plain')).toBe('2');
    });
});

const COLS: GridColDef[] = [
    { field: 'a', headerName: 'A', width: 100 },
    { field: 'b', headerName: 'B', width: 100 },
    { field: 'c', headerName: 'C', width: 100 },
    { field: 'd', headerName: 'D', width: 100 },
];
const ROW: GridRowModel[] = [{ id: 1, a: 'x', b: 1, c: 1, d: 1 }];

describe('column reordering', () => {
    it('pinned headers are not draggable, and a drop on one does nothing', () => {
        const onColumnOrderChange = vi.fn();
        const { container } = render(<DataGrid rows={ROW} columns={COLS} pinnedColumns={{ left: ['d'] }} onColumnOrderChange={onColumnOrderChange} />);
        expect(headerEl(container, 'd').getAttribute('draggable')).toBe('false');
        expect(headerEl(container, 'a').getAttribute('draggable')).toBe('true');
        dragHeader(container, 'a', 'd');
        expect(headerOrder(container)).toEqual(['d', 'a', 'b', 'c']);
        expect(onColumnOrderChange).not.toHaveBeenCalled();
    });

    it('a column with pinnable: false can still be reordered', () => {
        const { container } = render(<DataGrid rows={ROW} columns={[{ ...COLS[0], pinnable: false }, ...COLS.slice(1)]} />);
        dragHeader(container, 'a', 'c');
        expect(headerOrder(container)).toEqual(['b', 'c', 'a', 'd']);
    });

    it('moves the dragged column after grouping adds the __group__ column to a stored order', () => {
        const rows: GridRowModel[] = [{ id: 1, a: 'x', b: 1, c: 1, d: 1 }, { id: 2, a: 'y', b: 2, c: 2, d: 2 }];
        const Grid = ({ model }: { model?: string[] }) => (
            <DataGrid rows={rows} columns={COLS} rowGroupingModel={model} groupingColDef={{ field: '__group__', headerName: 'G' }} />
        );
        const { container, rerender } = render(<Grid />);
        dragHeader(container, 'b', 'a'); // stores an order without __group__
        expect(headerOrder(container)).toEqual(['b', 'a', 'c', 'd']);
        rerender(<Grid model={['a']} />);
        expect(headerOrder(container)).toEqual(['__group__', 'b', 'a', 'c', 'd']);
        dragHeader(container, 'd', 'a');
        expect(headerOrder(container)).toEqual(['__group__', 'b', 'd', 'a', 'c']);
    });

    it('under a controlled columnOrder that lacks a column, the reported move is the one dragged', () => {
        const onColumnOrderChange = vi.fn<(p: GridColumnOrderChangeParams) => void>();
        const onColumnOrderModelChange = vi.fn<(order: string[]) => void>();
        const { container } = render(
            <DataGrid rows={ROW} columns={COLS} columnOrder={['c', 'b', 'a']}
                onColumnOrderChange={onColumnOrderChange} onColumnOrderModelChange={onColumnOrderModelChange} />
        );
        expect(headerOrder(container)).toEqual(['c', 'b', 'a', 'd']);
        dragHeader(container, 'd', 'b');
        expect(onColumnOrderModelChange).toHaveBeenCalledWith(['c', 'd', 'b', 'a']);
        const change = onColumnOrderChange.mock.calls[0][0];
        expect(change.column.field).toBe('d');
        expect(change).toMatchObject({ oldIndex: 3, targetIndex: 1 });
        // Controlled: the grid shows what the consumer passes.
        expect(headerOrder(container)).toEqual(['c', 'b', 'a', 'd']);
    });

    it('a drag of something else over a header is not accepted', () => {
        const { container } = render(<DataGrid rows={ROW} columns={COLS} />);
        fireEvent.dragStart(headerEl(container, 'a'), { dataTransfer: createDataTransfer() });
        const notCancelled = fireEvent.dragOver(headerEl(container, 'c'), { dataTransfer: createDataTransfer(['Files']) });
        expect(notCancelled).toBe(true);
        expect(container.querySelector('.ogx__header-cell--dragging')).toBeNull();
    });
});

function openManageColumns(field: string) {
    fireEvent.click(screen.getByLabelText(`Open column menu for ${field}`));
    fireEvent.click(screen.getByText(/manage columns/i));
}

function panelLabels(): (string | null)[] {
    return Array.from(document.querySelectorAll('.ogx-column-visibility-panel__list .ogx-column-visibility-panel__label')).map(l => l.textContent);
}

describe('Columns panel order and Reset', () => {
    it('the column-menu Columns panel lists the columns in their current order', () => {
        const { container } = render(<DataGrid rows={ROW} columns={COLS} columnOrder={['d', 'c', 'b', 'a']} />);
        expect(headerOrder(container)).toEqual(['d', 'c', 'b', 'a']);
        openManageColumns('D');
        expect(panelLabels()).toEqual(['D', 'C', 'B', 'A']);
    });

    it('the column-menu Columns panel Reset restores the definition order', () => {
        const { container } = render(<DataGrid rows={ROW} columns={COLS} initialState={{ columns: { columnOrder: ['d', 'c', 'b', 'a'], columnWidths: {} } }} />);
        openManageColumns('D');
        fireEvent.click(screen.getByText('Reset'));
        expect(headerOrder(container)).toEqual(['a', 'b', 'c', 'd']);
    });

    it('toolbar Reset reaches a controlled columnOrder through onColumnOrderModelChange', () => {
        const onColumnOrderModelChange = vi.fn<(order: string[]) => void>();
        function Grid() {
            const [order, setOrder] = useState(['c', 'b', 'a', 'd']);
            return (
                <DataGrid rows={ROW} columns={COLS} columnOrder={order} slots={{ toolbar: GridToolbar }}
                    onColumnOrderModelChange={(next) => { onColumnOrderModelChange(next); setOrder(next); }} />
            );
        }
        const { container } = render(<Grid />);
        expect(headerOrder(container)).toEqual(['c', 'b', 'a', 'd']);
        fireEvent.click(screen.getByLabelText('Manage columns'));
        fireEvent.click(screen.getByText('Reset'));
        expect(onColumnOrderModelChange).toHaveBeenCalledWith(['a', 'b', 'c', 'd']);
        expect(headerOrder(container)).toEqual(['a', 'b', 'c', 'd']);
    });

    it('a Columns panel drag reports the move in the full column order', () => {
        const onColumnOrderModelChange = vi.fn<(order: string[]) => void>();
        const { container } = render(<DataGrid rows={ROW} columns={COLS} slots={{ toolbar: GridToolbar }} onColumnOrderModelChange={onColumnOrderModelChange} />);
        fireEvent.click(screen.getByLabelText('Manage columns'));
        const items = Array.from(document.querySelectorAll<HTMLElement>('.ogx-column-visibility-panel__list > *'));
        const byLabel = (label: string) => items.find(i => i.textContent?.includes(label)) as HTMLElement;
        const dataTransfer = createDataTransfer();
        fireEvent.dragStart(byLabel('D').querySelector('.ogx-column-visibility-panel__drag-handle-wrapper')!, { dataTransfer });
        fireEvent.dragOver(byLabel('A'), { dataTransfer });
        fireEvent.drop(byLabel('A'), { dataTransfer });
        expect(onColumnOrderModelChange).toHaveBeenCalledWith(['d', 'a', 'b', 'c']);
        expect(headerOrder(container)).toEqual(['d', 'a', 'b', 'c']);
    });
});
