import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import React from 'react';
import { DataGrid } from './DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type { DataGridProps, GridApi, GridColDef, GridFilterModel, GridRowId } from '../../types';

type Row = { id: number; name: string; age: number; note?: string };

const ROWS: Row[] = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 40 },
    { id: 3, name: 'Carol', age: 50 },
];

const COLS: GridColDef<Row>[] = [
    { field: 'name', headerName: 'Name' },
    { field: 'age', headerName: 'Age' },
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
    Object.defineProperty(document, 'execCommand', { value: undefined, configurable: true, writable: true });
    vi.restoreAllMocks();
});

const lastCopied = (): string => String(writeText.mock.calls[writeText.mock.calls.length - 1]?.[0]);

type GridProps = Partial<DataGridProps<Row>>;

function renderGrid(props: GridProps = {}) {
    const holder: { api: React.MutableRefObject<GridApi> | null } = { api: null };
    function Harness(p: GridProps) {
        const apiRef = useGridApiRef();
        holder.api = apiRef;
        return <DataGrid<Row> rows={ROWS} columns={COLS} apiRef={apiRef} {...p} />;
    }
    const utils = render(<Harness {...props} />);
    return {
        ...utils,
        api: () => holder.api!.current,
        rerenderGrid: (next: GridProps) => utils.rerender(<Harness {...next} />),
    };
}

async function copyVia(props: GridProps): Promise<string> {
    const { api } = renderGrid(props);
    await act(async () => { await api().copySelectedRows(); });
    expect(writeText).toHaveBeenCalledTimes(1);
    return lastCopied();
}

const firstCell = (container: HTMLElement) =>
    container.querySelector<HTMLElement>('[role="row"][data-rowindex="0"] [role="gridcell"]')!;

async function pressCtrlCIn(el: HTMLElement, init: KeyboardEventInit = {}) {
    await act(async () => {
        fireEvent.keyDown(el, { key: 'c', ctrlKey: true, ...init });
        await Promise.resolve();
    });
}

describe('DataGrid copy — columns', () => {
    it('leaves out columns hidden with columnVisibilityModel', async () => {
        expect(await copyVia({ rowSelectionModel: [1], columnVisibilityModel: { age: false } })).toBe('Name\nAlice');
    });

    it('follows columnOrder', async () => {
        expect(await copyVia({ rowSelectionModel: [1], columnOrder: ['age', 'name'] })).toBe('Age\tName\n30\tAlice');
    });

    it('puts left-pinned columns first, as on screen', async () => {
        expect(await copyVia({ rowSelectionModel: [1], pinnedColumns: { left: ['age'] } })).toBe('Age\tName\n30\tAlice');
    });

    it('leaves out exportable: false columns', async () => {
        const cols: GridColDef<Row>[] = [...COLS, { field: 'actions', headerName: 'Actions', exportable: false, renderCell: () => 'btn' }];
        expect(await copyVia({ rowSelectionModel: [1], columns: cols })).toBe('Name\tAge\nAlice\t30');
    });

    it('applies valueGetter, as the cells do', async () => {
        const cols: GridColDef<Row>[] = [
            ...COLS,
            { field: 'label', headerName: 'Label', valueGetter: ({ row }) => `${row.name}-${row.age}` },
        ];
        expect(await copyVia({ rowSelectionModel: [1], columns: cols })).toBe('Name\tAge\tLabel\nAlice\t30\tAlice-30');
    });

    it('quotes values holding tabs, line breaks or quotes so the pasted table keeps its shape', async () => {
        const rows: Row[] = [{ id: 1, name: 'A\tB', age: 1, note: 'say "line1\nline2"' }];
        const cols: GridColDef<Row>[] = [...COLS, { field: 'note', headerName: 'Note' }];
        expect(await copyVia({ rows, rowSelectionModel: [1], columns: cols }))
            .toBe('Name\tAge\tNote\n"A\tB"\t1\t"say ""line1\nline2"""');
    });
});

describe('DataGrid copy — rows', () => {
    it('copies selected rows on other pages', async () => {
        const rows: Row[] = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `N${i + 1}`, age: i }));
        expect(await copyVia({ rows, pagination: true, paginationModel: { page: 0, pageSize: 5 }, rowSelectionModel: [9, 1] }))
            .toBe('Name\tAge\nN1\t0\nN9\t8');
    });

    it('copies selected pinned rows in screen order', async () => {
        expect(await copyVia({ rowSelectionModel: [1, 2], pinnedRows: { top: [2] } })).toBe('Name\tAge\nBob\t40\nAlice\t30');
    });

    it('does not copy selected rows the filter removes', async () => {
        const filterModel: GridFilterModel = { items: [{ field: 'name', operator: 'contains', value: 'Bob' }] };
        expect(await copyVia({ rowSelectionModel: [1, 2], filterModel })).toBe('Name\tAge\nBob\t40');
    });

    it('copies selected rows inside collapsed groups, without the group rows', async () => {
        expect(await copyVia({ rowSelectionModel: [1], rowGroupingModel: ['name'], defaultGroupingExpansionDepth: 0 }))
            .toBe('Name\tAge\nAlice\t30');
    });

    it('does not call getRowId on synthetic group rows', async () => {
        type NRow = Row & { meta: { key: number } };
        const rows: NRow[] = ROWS.map(r => ({ ...r, meta: { key: r.id } }));
        const holder: { api: React.MutableRefObject<GridApi> | null } = { api: null };
        function Harness() {
            const apiRef = useGridApiRef();
            holder.api = apiRef;
            return (
                <DataGrid<NRow>
                    rows={rows}
                    columns={COLS as unknown as GridColDef<NRow>[]}
                    apiRef={apiRef}
                    getRowId={(r) => r.meta.key}
                    rowGroupingModel={['name']}
                    defaultGroupingExpansionDepth={-1}
                    rowSelectionModel={[1]}
                />
            );
        }
        render(<Harness />);
        await act(async () => { await holder.api!.current.copySelectedRows(); });
        expect(lastCopied()).toBe('Name\tAge\nAlice\t30');
    });

    it('copies tree-data rows under a collapsed parent', async () => {
        type TRow = Row & { path: string[] };
        const rows: TRow[] = [
            { id: 1, name: 'Alice', age: 30, path: ['Alice'] },
            { id: 2, name: 'Bob', age: 40, path: ['Alice', 'Bob'] },
        ];
        const holder: { api: React.MutableRefObject<GridApi> | null } = { api: null };
        function Harness() {
            const apiRef = useGridApiRef();
            holder.api = apiRef;
            return (
                <DataGrid<TRow>
                    rows={rows}
                    columns={COLS as unknown as GridColDef<TRow>[]}
                    apiRef={apiRef}
                    treeData
                    getTreeDataPath={(r) => r.path}
                    defaultGroupingExpansionDepth={0}
                    rowSelectionModel={[2]}
                />
            );
        }
        render(<Harness />);
        await act(async () => { await holder.api!.current.copySelectedRows(); });
        expect(lastCopied()).toBe('Name\tAge\nBob\t40');
    });
});

describe('DataGrid copy — selection source', () => {
    it('apiRef.selectRows then copySelectedRows copies those rows and checks their boxes', async () => {
        const { api, container } = renderGrid({ checkboxSelection: true });
        act(() => { api().selectRows([1, 2]); });
        expect(api().getSelectedRows()).toEqual([1, 2]);
        expect(container.querySelectorAll('.ogx__row input[type=checkbox]:checked')).toHaveLength(2);
        await act(async () => { await api().copySelectedRows(); });
        expect(lastCopied()).toBe('Name\tAge\nAlice\t30\nBob\t40');
    });

    it('copySelectedRows right after selectRows in the same tick sees the new selection', async () => {
        const { api } = renderGrid();
        await act(async () => {
            api().selectRows([3]);
            await api().copySelectedRows();
        });
        expect(lastCopied()).toBe('Name\tAge\nCarol\t50');
    });

    it('a copy from onRowSelectionModelChange sees the new selection', async () => {
        const holder: { api: React.MutableRefObject<GridApi> | null } = { api: null };
        function Harness() {
            const [selection, setSelection] = React.useState<GridRowId[]>([]);
            const apiRef = useGridApiRef();
            holder.api = apiRef;
            return (
                <DataGrid<Row>
                    rows={ROWS}
                    columns={COLS}
                    apiRef={apiRef}
                    rowSelectionModel={selection}
                    onRowSelectionModelChange={(model) => {
                        setSelection(model);
                        void apiRef.current.copySelectedRows();
                    }}
                />
            );
        }
        const { container } = render(<Harness />);
        await act(async () => {
            fireEvent.click(firstCell(container));
            await Promise.resolve();
        });
        expect(writeText).toHaveBeenCalledTimes(1);
        expect(lastCopied()).toBe('Name\tAge\nAlice\t30');
    });

    it('keeps one Ctrl+C listener and one copySelectedRows across rerenders', () => {
        const addSpy = vi.spyOn(window, 'addEventListener');
        const { api, rerenderGrid } = renderGrid({ rowSelectionModel: [1] });
        const first = api().copySelectedRows;
        const before = addSpy.mock.calls.filter(call => call[0] === 'keydown').length;
        rerenderGrid({ rowSelectionModel: [1] });
        rerenderGrid({ rowSelectionModel: [2] });
        expect(addSpy.mock.calls.filter(call => call[0] === 'keydown').length).toBe(before);
        expect(api().copySelectedRows).toBe(first);
    });
});

describe('DataGrid copy — shortcut and result', () => {
    it('resolves without writing when nothing is selected', async () => {
        const { api } = renderGrid();
        await act(async () => { await expect(api().copySelectedRows()).resolves.toBeUndefined(); });
        expect(writeText).not.toHaveBeenCalled();
    });

    it('apiRef.copySelectedRows rejects when the clipboard write fails', async () => {
        writeText.mockImplementation(() => Promise.reject(new Error('denied')));
        const { api } = renderGrid({ rowSelectionModel: [1] });
        await act(async () => { await expect(api().copySelectedRows()).rejects.toThrow('denied'); });
    });

    it('Ctrl+C with Caps Lock on still copies', async () => {
        const { container } = renderGrid({ rowSelectionModel: [1] });
        const cell = firstCell(container);
        cell.focus();
        await pressCtrlCIn(cell, { key: 'C' });
        expect(writeText).toHaveBeenCalledTimes(1);
    });

    it('leaves a Ctrl+C that a consumer handler already prevented', async () => {
        const { container } = renderGrid({ rowSelectionModel: [1] });
        const cell = firstCell(container);
        cell.focus();
        const own = (e: KeyboardEvent) => e.preventDefault();
        document.addEventListener('keydown', own);
        await pressCtrlCIn(cell);
        document.removeEventListener('keydown', own);
        expect(writeText).not.toHaveBeenCalled();
    });

    it('disableClipboardCopy turns the shortcut off but keeps apiRef.copySelectedRows', async () => {
        const { container, api } = renderGrid({ rowSelectionModel: [1], disableClipboardCopy: true });
        const cell = firstCell(container);
        cell.focus();
        await pressCtrlCIn(cell);
        expect(writeText).not.toHaveBeenCalled();
        await act(async () => { await api().copySelectedRows(); });
        expect(writeText).toHaveBeenCalledTimes(1);
    });

    it('keeps focus on the grid cell when the execCommand fallback copies', async () => {
        setClipboard(undefined);
        const execCommand = vi.fn(() => true);
        Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true, writable: true });
        const { container } = renderGrid({ rowSelectionModel: [1] });
        const cell = firstCell(container);
        fireEvent.click(cell);
        cell.focus();
        await pressCtrlCIn(cell);
        expect(execCommand).toHaveBeenCalledWith('copy');
        expect(document.activeElement).toBe(cell);
    });
});
