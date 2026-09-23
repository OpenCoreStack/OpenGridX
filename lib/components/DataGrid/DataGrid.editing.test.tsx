import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { StrictMode, useState } from 'react';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridFilterModel, GridRenderEditCellParams } from '../../types';

type Row = { id: number; name: string; qty: number; dept: string };

const ROWS: Row[] = [
    { id: 1, name: 'Alpha', qty: 1, dept: 'A' },
    { id: 2, name: 'Beta', qty: 2, dept: 'A' },
    { id: 3, name: 'Gamma', qty: 3, dept: 'B' },
];

const COLS: GridColDef<Row>[] = [
    { field: 'name', headerName: 'Name', editable: true, width: 150 },
    { field: 'qty', headerName: 'Qty', type: 'number', editable: true, width: 100 },
    { field: 'dept', headerName: 'Dept', width: 100 },
];

const cellOf = (container: HTMLElement, rowIndex: number, field: string) =>
    container.querySelector<HTMLElement>(`.ogx__rows [data-rowindex="${rowIndex}"] [data-field="${field}"]`)!;
const gridOf = (container: HTMLElement) => container.querySelector<HTMLElement>('[role="grid"]')!;
const editorOf = (container: HTMLElement) => container.querySelector<HTMLInputElement>('.ogx__edit-input');

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>(res => { resolve = res; });
    return { promise, resolve };
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('isCellEditable', () => {
    it('blocks double-click editing when it returns false', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} isCellEditable={() => false} />);
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        expect(editorOf(container)).toBeNull();
    });

    it('blocks Enter editing when it returns false', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} isCellEditable={() => false} />);
        fireEvent.click(cellOf(container, 0, 'name'));
        fireEvent.keyDown(gridOf(container), { key: 'Enter' });
        expect(editorOf(container)).toBeNull();
    });

    it('marks the cells it rejects as aria-readonly', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} isCellEditable={({ row }) => row.id !== 1} />);
        expect(cellOf(container, 0, 'name').getAttribute('aria-readonly')).toBe('true');
        expect(cellOf(container, 1, 'name').getAttribute('aria-readonly')).toBeNull();
    });

    it('decides per cell, with the valueGetter value and indices', () => {
        const isCellEditable = vi.fn(({ row }: { row: Row }) => row.id !== 1);
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} isCellEditable={isCellEditable} />);
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        expect(editorOf(container)).toBeNull();
        fireEvent.doubleClick(cellOf(container, 1, 'name'));
        expect(editorOf(container)).not.toBeNull();
        expect(isCellEditable).toHaveBeenCalledWith(expect.objectContaining({ field: 'name', value: 'Beta', rowIndex: 1, colIndex: 0 }));
    });

    it('cannot make a column without editable: true editable', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} isCellEditable={() => true} />);
        fireEvent.doubleClick(cellOf(container, 0, 'dept'));
        expect(editorOf(container)).toBeNull();
        expect(cellOf(container, 0, 'dept').getAttribute('aria-readonly')).toBe('true');
    });

    it('treats a throwing predicate as read-only', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} isCellEditable={() => { throw new Error('boom'); }} />);
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        expect(editorOf(container)).toBeNull();
    });
});

describe('commit is called once per edit', () => {
    it('Tab out of an editor calls a synchronous processRowUpdate once', async () => {
        const processRowUpdate = vi.fn((row: Row) => row);
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} processRowUpdate={processRowUpdate} />);
        fireEvent.click(cellOf(container, 0, 'name'));
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        const input = editorOf(container)!;
        fireEvent.change(input, { target: { value: 'Omega' } });
        fireEvent.keyDown(input, { key: 'Tab' });
        await waitFor(() => expect(editorOf(container)).toBeNull());
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
    });

    it('Tab out of an editor calls an async processRowUpdate once', async () => {
        const d = deferred<Row>();
        const processRowUpdate = vi.fn(() => d.promise);
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} processRowUpdate={processRowUpdate} />);
        fireEvent.click(cellOf(container, 0, 'name'));
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        const input = editorOf(container)!;
        fireEvent.change(input, { target: { value: 'Omega' } });
        fireEvent.keyDown(input, { key: 'Tab' });
        await act(async () => { d.resolve({ ...ROWS[0], name: 'Omega' }); await d.promise; });
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        expect(cellOf(container, 0, 'name').textContent).toBe('Omega');
    });

    it('Enter followed by blur calls an async processRowUpdate once', async () => {
        const d = deferred<Row>();
        const processRowUpdate = vi.fn(() => d.promise);
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} processRowUpdate={processRowUpdate} />);
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        const input = editorOf(container)!;
        fireEvent.change(input, { target: { value: 'Omega' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        fireEvent.blur(input);
        await act(async () => { d.resolve({ ...ROWS[0], name: 'Omega' }); await d.promise; });
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
    });
});

describe('editing hierarchy rows', () => {
    type TreeRow = { id: number; name: string; qty: number; path: string[] };
    const TREE: TreeRow[] = [
        { id: 1, name: 'Parent', qty: 1, path: ['Parent'] },
        { id: 2, name: 'Child', qty: 2, path: ['Parent', 'Child'] },
        { id: 3, name: 'Orphan', qty: 3, path: ['Ghost', 'Orphan'] },
    ];
    const TREE_COLS: GridColDef<TreeRow>[] = [
        { field: 'name', editable: true, width: 150 },
        { field: 'qty', type: 'number', editable: true, width: 100 },
    ];
    const renderTree = (processRowUpdate?: (r: TreeRow) => TreeRow) => render(
        <DataGrid rows={TREE} columns={TREE_COLS} treeData getTreeDataPath={r => r.path} defaultGroupingExpansionDepth={-1} processRowUpdate={processRowUpdate} />
    );
    const rowIndexOf = (container: HTMLElement, text: string) =>
        Array.from(container.querySelectorAll<HTMLElement>('.ogx__rows [role="row"]'))
            .find(r => r.textContent?.includes(text))!.getAttribute('data-rowindex')!;

    it('a tree-data parent row (a real data row) can be edited by double-click', async () => {
        const processRowUpdate = vi.fn((r: TreeRow) => r);
        const { container } = renderTree(processRowUpdate);
        fireEvent.doubleClick(cellOf(container, Number(rowIndexOf(container, 'Parent')), 'qty'));
        const input = editorOf(container)!;
        expect(input).not.toBeNull();
        fireEvent.change(input, { target: { value: '9' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => expect(processRowUpdate).toHaveBeenCalledTimes(1));
        expect(processRowUpdate.mock.calls[0][0]).toMatchObject({ id: 1, qty: 9 });
    });

    it('a tree-data parent row can be edited with Enter', () => {
        const { container } = renderTree();
        const cell = cellOf(container, Number(rowIndexOf(container, 'Parent')), 'qty');
        fireEvent.click(cell);
        fireEvent.keyDown(gridOf(container), { key: 'Enter' });
        expect(editorOf(container)).not.toBeNull();
    });

    it('an auto-generated tree ancestor is not editable', () => {
        const { container } = renderTree();
        const ghostIndex = Number(rowIndexOf(container, 'Ghost'));
        fireEvent.doubleClick(cellOf(container, ghostIndex, 'qty'));
        expect(editorOf(container)).toBeNull();
        fireEvent.click(cellOf(container, ghostIndex, 'qty'));
        fireEvent.keyDown(gridOf(container), { key: 'Enter' });
        expect(editorOf(container)).toBeNull();
        expect(cellOf(container, ghostIndex, 'qty').getAttribute('aria-readonly')).toBe('true');
    });

    it('Enter on a row-grouping group row does not open an editor', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} rowGroupingModel={['dept']} />);
        const groupCell = container.querySelector<HTMLElement>('.ogx__row--group [data-field="qty"]')!;
        fireEvent.click(groupCell);
        fireEvent.keyDown(gridOf(container), { key: 'Enter' });
        expect(container.querySelector('.ogx__row--group .ogx__edit-cell')).toBeNull();
        expect(groupCell.getAttribute('aria-readonly')).toBe('true');
    });

    it('double-click on a row-grouping group row does not open an editor', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} rowGroupingModel={['dept']} />);
        fireEvent.doubleClick(container.querySelector<HTMLElement>('.ogx__row--group [data-field="qty"]')!);
        expect(container.querySelector('.ogx__edit-cell')).toBeNull();
    });
});

describe('focus after a commit', () => {
    it('committing by focusing a control outside the grid leaves focus on that control', async () => {
        const processRowUpdate = vi.fn((r: Row) => r);
        const { container } = render(
            <div>
                <input data-testid="outside" />
                <DataGrid rows={ROWS} columns={COLS} processRowUpdate={processRowUpdate} />
            </div>
        );
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        const input = editorOf(container)!;
        expect(document.activeElement).toBe(input);
        fireEvent.change(input, { target: { value: 'Omega' } });
        const outside = screen.getByTestId('outside');
        await act(async () => { outside.focus(); });
        await waitFor(() => expect(editorOf(container)).toBeNull());
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        expect(document.activeElement).toBe(outside);
    });

    it('committing with Enter keeps focus in the grid', async () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} />);
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        const input = editorOf(container)!;
        fireEvent.change(input, { target: { value: 'Omega' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => expect(editorOf(container)).toBeNull());
        expect(gridOf(container).contains(document.activeElement)).toBe(true);
    });
});

describe('custom getRowId', () => {
    it('applies a processRowUpdate result that lacks the grid-normalised id', async () => {
        type URow = { uid: string; name: string };
        const rows = [{ uid: 'a', name: 'Alpha' }, { uid: 'b', name: 'Beta' }] as unknown as (URow & { id: string })[];
        const cols: GridColDef<URow & { id: string }>[] = [{ field: 'name', editable: true, width: 150 }];
        const processRowUpdate = (newRow: URow & { id: string }) => ({ uid: newRow.uid, name: newRow.name }) as URow & { id: string };
        const { container } = render(<DataGrid rows={rows} columns={cols} getRowId={r => r.uid} processRowUpdate={processRowUpdate} />);
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        const input = editorOf(container)!;
        fireEvent.change(input, { target: { value: 'Omega' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => expect(editorOf(container)).toBeNull());
        expect(cellOf(container, 0, 'name').textContent).toBe('Omega');
        expect(cellOf(container, 1, 'name').textContent).toBe('Beta');
    });

    it('keeps a committed edit when the parent re-renders with an inline getRowId', async () => {
        function Harness() {
            const [tick, setTick] = useState(0);
            return (
                <div data-tick={tick}>
                    <button type="button" onClick={() => setTick(t => t + 1)}>re-render</button>
                    <DataGrid rows={ROWS} columns={COLS} getRowId={r => r.id} />
                </div>
            );
        }
        const { container } = render(<Harness />);
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        const input = editorOf(container)!;
        fireEvent.change(input, { target: { value: 'Omega' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => expect(editorOf(container)).toBeNull());
        expect(cellOf(container, 0, 'name').textContent).toBe('Omega');
        fireEvent.click(screen.getByText('re-render'));
        expect(container.querySelector('[data-tick="1"]')).not.toBeNull();
        expect(cellOf(container, 0, 'name').textContent).toBe('Omega');
    });

    it('still resets the rows when the rows prop itself changes', async () => {
        const { container, rerender } = render(<DataGrid rows={ROWS} columns={COLS} getRowId={r => r.id} />);
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        const input = editorOf(container)!;
        fireEvent.change(input, { target: { value: 'Omega' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => expect(cellOf(container, 0, 'name').textContent).toBe('Omega'));
        rerender(<DataGrid rows={[{ ...ROWS[0], name: 'Reset' }, ROWS[1], ROWS[2]]} columns={COLS} getRowId={r => r.id} />);
        expect(cellOf(container, 0, 'name').textContent).toBe('Reset');
    });
});

describe('valueGetter columns', () => {
    type PRow = { id: number; first: string; last: string; cents: number };
    const PEOPLE: PRow[] = [{ id: 1, first: 'Ada', last: 'Lovelace', cents: 1250 }];

    it('commits through valueSetter so the edited value is shown', async () => {
        const processRowUpdate = vi.fn((r: PRow) => r);
        const cols: GridColDef<PRow>[] = [{
            field: 'full',
            editable: true,
            width: 200,
            valueGetter: ({ row }) => `${row.first} ${row.last}`,
            valueSetter: ({ value, row }) => {
                const [first, ...rest] = String(value).split(' ');
                return { ...row, first, last: rest.join(' ') };
            },
        }];
        const { container } = render(<DataGrid rows={PEOPLE} columns={cols} processRowUpdate={processRowUpdate} />);
        fireEvent.doubleClick(cellOf(container, 0, 'full'));
        const input = editorOf(container)!;
        expect(input.value).toBe('Ada Lovelace');
        fireEvent.change(input, { target: { value: 'Ada King' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => expect(editorOf(container)).toBeNull());
        expect(processRowUpdate.mock.calls[0][0]).toEqual({ id: 1, first: 'Ada', last: 'King', cents: 1250 });
        expect(cellOf(container, 0, 'full').textContent).toBe('Ada King');
    });

    it('Enter-to-edit and double-click-to-edit start from the same valueGetter value', () => {
        const cols: GridColDef<PRow>[] = [
            { field: 'cents', editable: true, type: 'number', width: 100, valueGetter: ({ row }) => row.cents / 100 },
        ];
        const { container } = render(<DataGrid rows={PEOPLE} columns={cols} />);
        const cell = cellOf(container, 0, 'cents');
        fireEvent.doubleClick(cell);
        const viaDoubleClick = editorOf(container)!.value;
        fireEvent.keyDown(editorOf(container)!, { key: 'Escape' });
        fireEvent.click(cell);
        fireEvent.keyDown(gridOf(container), { key: 'Enter' });
        const viaEnter = editorOf(container)!.value;
        expect({ viaDoubleClick, viaEnter }).toEqual({ viaDoubleClick: '12.5', viaEnter: '12.5' });
    });
});

describe('onRowDoubleClick with editable cells', () => {
    it('fires when an editable cell is double-clicked (and the editor still opens)', () => {
        const onRowDoubleClick = vi.fn();
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} onRowDoubleClick={onRowDoubleClick} />);
        fireEvent.doubleClick(cellOf(container, 0, 'dept'));
        expect(onRowDoubleClick).toHaveBeenCalledTimes(1);
        fireEvent.doubleClick(cellOf(container, 1, 'name'));
        expect(onRowDoubleClick).toHaveBeenCalledTimes(2);
        expect(editorOf(container)).not.toBeNull();
    });

    it('fires for an editable cell of a group row, where no editor opens', () => {
        const onRowDoubleClick = vi.fn();
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} rowGroupingModel={['dept']} onRowDoubleClick={onRowDoubleClick} />);
        fireEvent.doubleClick(container.querySelector<HTMLElement>('.ogx__row--group [data-field="name"]')!);
        expect(onRowDoubleClick).toHaveBeenCalledTimes(1);
        expect(container.querySelector('.ogx__edit-cell')).toBeNull();
    });

    it('does not fire, and keeps the typed value, when double-clicking inside the open editor', async () => {
        const onRowDoubleClick = vi.fn();
        const processRowUpdate = vi.fn((r: Row) => r);
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} onRowDoubleClick={onRowDoubleClick} processRowUpdate={processRowUpdate} />);
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        onRowDoubleClick.mockClear();
        const input = editorOf(container)!;
        fireEvent.change(input, { target: { value: 'Omega' } });
        fireEvent.doubleClick(input);
        expect(onRowDoubleClick).not.toHaveBeenCalled();
        fireEvent.keyDown(editorOf(container)!, { key: 'Enter' });
        await waitFor(() => expect(processRowUpdate).toHaveBeenCalledTimes(1));
        expect(processRowUpdate.mock.calls[0][0].name).toBe('Omega');
    });
});

describe('clicks inside an open editor', () => {
    it('keep the built-in editor open and focused and do not fire onCellClick', () => {
        const onCellClick = vi.fn();
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} onCellClick={onCellClick} />);
        fireEvent.click(cellOf(container, 0, 'name'));
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        onCellClick.mockClear();
        const input = editorOf(container)!;
        fireEvent.change(input, { target: { value: 'Om' } });
        fireEvent.mouseDown(input);
        fireEvent.click(input);
        expect(editorOf(container)).toBe(input);
        expect(document.activeElement).toBe(input);
        expect(onCellClick).not.toHaveBeenCalled();
    });

    it('in a custom renderEditCell do not fire onRowClick or toggle row selection', () => {
        const onRowClick = vi.fn();
        const cols: GridColDef<Row>[] = [{ field: 'name', editable: true, width: 150, renderEditCell: () => <input data-testid="custom" /> }];
        const { container } = render(<DataGrid rows={ROWS} columns={cols} onRowClick={onRowClick} />);
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        onRowClick.mockClear();
        const row = container.querySelector<HTMLElement>('.ogx__rows [data-rowindex="0"]')!;
        const selectedBefore = row.getAttribute('aria-selected');
        fireEvent.click(screen.getByTestId('custom'));
        expect(onRowClick).not.toHaveBeenCalled();
        expect(row.getAttribute('aria-selected')).toBe(selectedBefore);
    });
});

describe('renderEditCell', () => {
    function CustomEditor(params: GridRenderEditCellParams<Row>) {
        return (
            <span>
                <button type="button" onClick={() => params.onValueChange(`${String(params.value)}!`)}>change</button>
                <button type="button" onClick={() => params.onCommit()}>commit</button>
                <button type="button" onClick={() => params.onCancel()}>cancel</button>
            </span>
        );
    }
    const cols: GridColDef<Row>[] = [{ field: 'name', editable: true, width: 200, renderEditCell: p => <CustomEditor {...p} /> }];

    it('can change the value and commit it through processRowUpdate', async () => {
        const processRowUpdate = vi.fn((r: Row) => r);
        const { container } = render(<DataGrid rows={ROWS} columns={cols} processRowUpdate={processRowUpdate} />);
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        fireEvent.click(screen.getByText('change'));
        fireEvent.click(screen.getByText('commit'));
        await waitFor(() => expect(processRowUpdate).toHaveBeenCalledTimes(1));
        expect(processRowUpdate.mock.calls[0][0].name).toBe('Alpha!');
        await waitFor(() => expect(screen.queryByText('commit')).toBeNull());
        expect(cellOf(container, 0, 'name').textContent).toBe('Alpha!');
    });

    it('can cancel, discarding the pending value', () => {
        const processRowUpdate = vi.fn((r: Row) => r);
        const { container } = render(<DataGrid rows={ROWS} columns={cols} processRowUpdate={processRowUpdate} />);
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        fireEvent.click(screen.getByText('change'));
        fireEvent.click(screen.getByText('cancel'));
        expect(screen.queryByText('commit')).toBeNull();
        expect(processRowUpdate).not.toHaveBeenCalled();
        expect(cellOf(container, 0, 'name').textContent).toBe('Alpha');
    });

    it('contains an error thrown by the custom editor to its cell', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const throwing: GridColDef<Row>[] = [
            { field: 'name', editable: true, width: 150, renderEditCell: () => { throw new Error('editor boom'); } },
            { field: 'dept', width: 100 },
        ];
        const { container } = render(<DataGrid rows={ROWS} columns={throwing} />);
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        expect(cellOf(container, 0, 'name').querySelector('.ogx__cell-error')).not.toBeNull();
        expect(cellOf(container, 1, 'dept').textContent).toBe('A');
    });
});

describe('processRowUpdate that returns nothing', () => {
    it('reports a descriptive error and keeps the editor open', async () => {
        const onProcessRowUpdateError = vi.fn();
        const processRowUpdate = vi.fn(() => undefined as unknown as Row);
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} processRowUpdate={processRowUpdate} onProcessRowUpdateError={onProcessRowUpdateError} />);
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        const input = editorOf(container)!;
        fireEvent.change(input, { target: { value: 'Omega' } });
        await act(async () => { fireEvent.keyDown(input, { key: 'Enter' }); });
        expect(onProcessRowUpdateError).toHaveBeenCalledTimes(1);
        expect(String(onProcessRowUpdateError.mock.calls[0][0])).toMatch(/processRowUpdate must return the updated row/);
        expect(editorOf(container)).not.toBeNull();
    });
});

describe('an edit whose cell leaves the grid', () => {
    it('editing works inside React StrictMode: the editor stays open until Enter, which commits once', async () => {
        const processRowUpdate = vi.fn((r: Row) => r);
        const { container } = render(<StrictMode><DataGrid rows={ROWS} columns={COLS} processRowUpdate={processRowUpdate} /></StrictMode>);
        fireEvent.doubleClick(cellOf(container, 0, 'name'));
        await act(async () => { await Promise.resolve(); });
        const input = editorOf(container)!;
        expect(input).not.toBeNull();
        fireEvent.change(input, { target: { value: 'Omega' } });
        await act(async () => { await Promise.resolve(); });
        expect(editorOf(container)).toBe(input);
        expect(processRowUpdate).not.toHaveBeenCalled();
        fireEvent.keyDown(input, { key: 'Enter' });
        await waitFor(() => expect(editorOf(container)).toBeNull());
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
    });

    it('is committed when the edited row is filtered out of view', async () => {
        const processRowUpdate = vi.fn((r: Row) => r);
        const noFilter: GridFilterModel = { items: [] };
        const onlyBeta: GridFilterModel = { items: [{ field: 'name', operator: 'contains', value: 'Beta' }] };
        const { container, rerender } = render(<DataGrid rows={ROWS} columns={COLS} filterModel={noFilter} processRowUpdate={processRowUpdate} />);
        fireEvent.doubleClick(cellOf(container, 0, 'qty'));
        fireEvent.change(editorOf(container)!, { target: { value: '42' } });
        await act(async () => {
            rerender(<DataGrid rows={ROWS} columns={COLS} filterModel={onlyBeta} processRowUpdate={processRowUpdate} />);
        });
        await waitFor(() => expect(processRowUpdate).toHaveBeenCalledTimes(1));
        expect(processRowUpdate.mock.calls[0][0]).toMatchObject({ id: 1, qty: 42 });
        // Arrow keys work again: the edit session ended with its editor.
        fireEvent.click(cellOf(container, 0, 'name'));
        fireEvent.keyDown(gridOf(container), { key: 'ArrowRight' });
        expect(cellOf(container, 0, 'qty').className).toContain('ogx__cell--focused');
    });
});

describe('render cost', () => {
    it('re-rendering with identical props does not re-run renderCell for every cell', () => {
        const renderCell = vi.fn(({ value }: { value: unknown }) => String(value));
        const cols: GridColDef<Row>[] = [{ field: 'name', width: 150, renderCell }];
        const { rerender } = render(<DataGrid rows={ROWS} columns={cols} />);
        renderCell.mockClear();
        rerender(<DataGrid rows={ROWS} columns={cols} />);
        expect(renderCell).toHaveBeenCalledTimes(0);
    });
});
