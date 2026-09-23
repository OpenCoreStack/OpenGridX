import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { DataGrid } from './DataGrid';
import type {
    GridColDef,
    GridDataSource,
    GridFilterModel,
    GridGetRowsParams,
    GridGetRowsResponse,
    GridPaginationModel,
    GridRowId,
    GridRowModel,
    GridSortItem,
} from '../../types';

const COLS: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'amount', headerName: 'Amount', width: 100, type: 'number' },
];
const ALL = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `r${i}`, amount: 1 }));
const EMPTY: GridRowModel[] = [];

/** Serves the requested range of ALL, like a server implementing the exclusive-end contract. */
const rangeDataSource = (): GridDataSource => ({
    getRows: vi.fn(async (p: GridGetRowsParams): Promise<GridGetRowsResponse> => ({
        rows: ALL.slice(p.startRow, p.endRow),
        rowCount: ALL.length,
    })),
});

function names(container: HTMLElement): string[] {
    return Array.from(container.querySelectorAll('.ogx__row:not(.ogx__row--skeleton)'))
        .map(r => r.querySelectorAll('[role="gridcell"]')[0]?.textContent ?? '');
}
const pager = (container: HTMLElement) => container.querySelector('.ogx-pagination')?.textContent ?? '';
const ariaRowCount = (container: HTMLElement) => container.querySelector('[role="grid"]')?.getAttribute('aria-rowcount');
const liveStatus = (container: HTMLElement) => container.querySelector('.ogx-aria-live-status')?.textContent ?? '';

async function flush(ms = 350) {
    await act(async () => {
        await vi.advanceTimersByTimeAsync(ms);
    });
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('DataGrid dataSource — what gets loaded', () => {
    it('loads the rows of a dataSource with the default (client) modes', async () => {
        const ds = rangeDataSource();
        const { container } = render(<DataGrid rows={EMPTY} columns={COLS} dataSource={ds} />);
        await flush();
        expect(ds.getRows).toHaveBeenCalledTimes(1);
        expect(names(container).slice(0, 3)).toEqual(['r0', 'r1', 'r2']);
    });

    it.each([
        ['sortingMode="server"', { sortingMode: 'server' as const }],
        ['filterMode="server"', { filterMode: 'server' as const }],
    ])('shows page 2 with %s and client pagination', async (_label, modes) => {
        const ds = rangeDataSource();
        const { container } = render(
            <DataGrid rows={EMPTY} columns={COLS} dataSource={ds} {...modes}
                pagination pageSizeOptions={[10]} paginationModel={{ page: 1, pageSize: 10 }} />
        );
        await flush();
        expect(names(container)[0]).toBe('r10');
        expect(names(container)).toHaveLength(10);
        expect(pager(container)).toContain('11–20 of 100');
    });

    it('loads every row with filterMode="server" and no pagination', async () => {
        const ds = rangeDataSource();
        const { container } = render(
            <DataGrid rows={EMPTY} columns={COLS} dataSource={ds} filterMode="server" paginationModel={{ page: 0, pageSize: 25 }} />
        );
        await flush();
        expect(ariaRowCount(container)).toBe('101');
    });

    it('keys dataSource rows by getRowId', async () => {
        const ds: GridDataSource = {
            getRows: async () => ({ rows: [{ key: 'a', name: 'A' }, { key: 'b', name: 'B' }, { key: 'c', name: 'C' }] as unknown as GridRowModel[], rowCount: 3 }),
        };
        const { container } = render(
            <DataGrid rows={EMPTY} columns={COLS} dataSource={ds} paginationMode="server" getRowId={(r) => (r as unknown as { key: string }).key} />
        );
        await flush();
        expect(names(container)).toEqual(['A', 'B', 'C']);
    });
});

describe('DataGrid dataSource — infinite scroll', () => {
    it('renders an overlapping page without a duplicate row', async () => {
        const ds: GridDataSource = {
            // The second page starts one row early, as offset pagination does when data shifts.
            getRows: async (p) => ({ rows: ALL.slice(Math.max(0, p.startRow - (p.startRow > 0 ? 1 : 0)), p.endRow) }),
        };
        const Grid = ({ page }: { page: number }) => (
            <DataGrid rows={EMPTY} columns={COLS} dataSource={ds} paginationMode="infinite" paginationModel={{ page, pageSize: 5 }} />
        );
        const { container, rerender } = render(<Grid page={0} />);
        await flush();
        rerender(<Grid page={1} />);
        await flush();
        expect(names(container)).toEqual(ALL.slice(0, 10).map(r => r.name));
        expect(ariaRowCount(container)).toBe('11');
    });

    it('ignores pagination: every loaded row renders and no pager is shown', async () => {
        const ds = rangeDataSource();
        const Grid = ({ page }: { page: number }) => (
            <DataGrid rows={EMPTY} columns={COLS} dataSource={ds} paginationMode="infinite" pagination
                pageSizeOptions={[5]} paginationModel={{ page, pageSize: 5 }} />
        );
        const { container, rerender } = render(<Grid page={0} />);
        await flush();
        rerender(<Grid page={1} />);
        await flush();
        expect(names(container)).toEqual(ALL.slice(0, 10).map(r => r.name));
        expect(container.querySelector('.ogx-pagination')).toBeNull();
    });

    it('restarts at the first page when the user sorts', async () => {
        const getRows = vi.fn(async (p: GridGetRowsParams): Promise<GridGetRowsResponse> => {
            // The server sorts names as strings: r0, r1, r10, r11, ...
            const sorted = p.sortModel.length > 0 ? [...ALL].sort((a, b) => a.name.localeCompare(b.name)) : ALL;
            return { rows: sorted.slice(p.startRow, p.endRow) };
        });
        const pages: number[] = [];
        function App() {
            const [model, setModel] = useState<GridPaginationModel>({ page: 0, pageSize: 5 });
            return (
                <>
                    <button type="button" onClick={() => setModel(m => ({ ...m, page: m.page + 1 }))}>more</button>
                    <DataGrid rows={EMPTY} columns={COLS} dataSource={{ getRows }} paginationMode="infinite" sortingMode="server"
                        paginationModel={model} onPaginationModelChange={(m) => { pages.push(m.page); setModel(m); }} />
                </>
            );
        }
        const { container, getByText } = render(<App />);
        await flush();
        fireEvent.click(getByText('more'));
        await flush();
        fireEvent.click(getByText('more'));
        await flush();
        expect(names(container)).toHaveLength(15);

        fireEvent.click(container.querySelector('[role="columnheader"][data-field="name"]') as HTMLElement);
        await flush();
        expect(pages).toEqual([0]);
        const last = getRows.mock.calls.at(-1)![0];
        expect([last.startRow, last.endRow]).toEqual([0, 5]);
        expect(names(container)).toEqual(['r0', 'r1', 'r10', 'r11', 'r12']);
    });

    it.each(['filterModel', 'dataSource'] as const)('keeps the loaded pages when the parent re-renders with an inline %s', async (inline) => {
        const getRows = vi.fn(async (p: GridGetRowsParams) => ({ rows: ALL.slice(p.startRow, p.endRow) }));
        const stable: GridDataSource = { getRows };
        function App() {
            const [model, setModel] = useState<GridPaginationModel>({ page: 0, pageSize: 5 });
            const [selection, setSelection] = useState<GridRowId[]>([]);
            return (
                <>
                    <button type="button" onClick={() => setModel(m => ({ ...m, page: m.page + 1 }))}>more</button>
                    <DataGrid rows={EMPTY} columns={COLS} paginationMode="infinite"
                        dataSource={inline === 'dataSource' ? { getRows } : stable}
                        filterModel={inline === 'filterModel' ? { items: [] } : undefined}
                        paginationModel={model} onPaginationModelChange={setModel}
                        rowSelectionModel={selection} onRowSelectionModelChange={setSelection} />
                </>
            );
        }
        const { container, getByText } = render(<App />);
        await flush();
        fireEvent.click(getByText('more'));
        await flush();
        const calls = getRows.mock.calls.length;
        fireEvent.click(container.querySelector('.ogx__row [role="gridcell"]') as HTMLElement);
        await flush();
        expect(getRows).toHaveBeenCalledTimes(calls);
        expect(names(container)).toHaveLength(10);
    });
});

describe('DataGrid dataSource — loading and errors', () => {
    it('shows the loading state, not the empty state, before the first response', async () => {
        const ds: GridDataSource = { getRows: () => new Promise(() => {}) };
        const { container } = render(<DataGrid rows={EMPTY} columns={COLS} dataSource={ds} paginationMode="server" />);
        expect(container.textContent).not.toContain('No Data');
        expect(container.querySelector('.ogx')?.getAttribute('aria-busy')).toBe('true');
        await flush();
        expect(container.textContent).not.toContain('No Data');
        expect(liveStatus(container)).toBe('Loading data...');
    });

    it('announces the empty state once an empty response arrives', async () => {
        const ds: GridDataSource = { getRows: async () => ({ rows: [], rowCount: 0 }) };
        const { container } = render(<DataGrid rows={EMPTY} columns={COLS} dataSource={ds} paginationMode="server" />);
        await flush();
        expect(liveStatus(container)).toBe('No Data');
    });

    it('Retry requests the rows again instead of reloading the page', async () => {
        const getRows = vi.fn()
            .mockRejectedValueOnce(new Error('boom'))
            .mockResolvedValue({ rows: ALL.slice(0, 3), rowCount: 3 });
        const reload = vi.fn();
        const original = window.location;
        Object.defineProperty(window, 'location', { configurable: true, value: { ...original, reload } });
        try {
            const { container, getByText } = render(<DataGrid rows={EMPTY} columns={COLS} dataSource={{ getRows }} paginationMode="server" />);
            await flush();
            expect(container.querySelector('.ogx-error-overlay')?.textContent).toContain('boom');
            fireEvent.click(getByText('Retry'));
            await flush(0);
            expect(reload).not.toHaveBeenCalled();
            expect(getRows).toHaveBeenCalledTimes(2);
            expect(container.querySelector('.ogx-error-overlay')).toBeNull();
            expect(names(container)).toEqual(['r0', 'r1', 'r2']);
        } finally {
            Object.defineProperty(window, 'location', { configurable: true, value: original });
        }
    });

    it('shows the message of a rejected plain object', async () => {
        const ds: GridDataSource = { getRows: () => Promise.reject({ message: 'HTTP 500' }) };
        const { container } = render(<DataGrid rows={EMPTY} columns={COLS} dataSource={ds} paginationMode="server" />);
        await flush();
        expect(container.querySelector('.ogx-error-overlay__message')?.textContent).toBe('HTTP 500');
        expect(liveStatus(container)).toBe('Error: HTTP 500');
    });

    it('shows no Retry button for an error that no dataSource request can retry', () => {
        const { container } = render(
            <DataGrid rows={EMPTY} columns={COLS} initialState={{ dataSource: { loading: false, error: new Error('seeded') } }} />
        );
        expect(container.querySelector('.ogx-error-overlay')?.textContent).toContain('seeded');
        expect(container.querySelector('.ogx-error-overlay button')).toBeNull();
    });
});

describe('DataGrid dataSource — server-side tree data', () => {
    type TreeRow = GridRowModel & { path: string[]; name: string; serverChildrenCount?: number };
    const TREE_COLS: GridColDef[] = [{ field: 'name', headerName: 'Name', width: 200 }];
    const ROOTS: TreeRow[] = [
        { id: 'sales', path: ['Sales'], name: 'Sales', serverChildrenCount: 2 },
        { id: 'eng', path: ['Eng'], name: 'Eng', serverChildrenCount: 2 },
    ];
    // Children come back in the server's order, which is not alphabetical.
    const CHILDREN: Record<string, TreeRow[]> = {
        Sales: [{ id: 's2', path: ['Sales', 'Bob'], name: 'Bob' }, { id: 's1', path: ['Sales', 'Ann'], name: 'Ann' }],
        Eng: [{ id: 'e1', path: ['Eng', 'Cat'], name: 'Cat' }, { id: 'e2', path: ['Eng', 'Dan'], name: 'Dan' }],
    };
    const getTreeDataPath = (row: GridRowModel) => (row as TreeRow).path;
    const texts = (container: HTMLElement) =>
        Array.from(container.querySelectorAll('.ogx__row:not(.ogx__row--skeleton)')).map(r => r.textContent?.trim());
    const rowNamed = (container: HTMLElement, name: string) =>
        Array.from(container.querySelectorAll('.ogx__row')).find(r => r.textContent?.includes(name)) as HTMLElement;

    function treeSource(): GridDataSource & { calls: string[][] } {
        const calls: string[][] = [];
        return {
            calls,
            getRows: async (p: GridGetRowsParams) => {
                calls.push(p.groupKeys);
                if (p.groupKeys.length > 0) return { rows: CHILDREN[p.groupKeys[0]] ?? [] };
                const value = p.filterModel.items[0]?.value;
                const roots = value ? ROOTS.filter(r => r.name.includes(String(value))) : ROOTS;
                const ordered = p.sortModel[0]?.sort === 'desc' ? [...roots].reverse() : roots;
                return { rows: ordered, rowCount: 50 };
            },
        };
    }

    it('keeps the server row count in the pager after expanding a node', async () => {
        const ds = treeSource();
        const { container } = render(
            <DataGrid rows={EMPTY} columns={TREE_COLS} dataSource={ds} treeData getTreeDataPath={getTreeDataPath}
                paginationMode="server" pagination pageSizeOptions={[10]} paginationModel={{ page: 0, pageSize: 10 }} />
        );
        await flush();
        expect(pager(container)).toContain('of 50');
        fireEvent.click(rowNamed(container, 'Sales'));
        await flush(0);
        expect(texts(container)).toEqual(['Sales', 'Bob', 'Ann', 'Eng']);
        expect(pager(container)).toContain('of 50');
    });

    it('shows lazily loaded children under server filtering and keeps the server order under server sorting', async () => {
        const ds = treeSource();
        const filterModel: GridFilterModel = { items: [{ field: 'name', operator: 'contains', value: 'Sales' }] };
        const sortModel: GridSortItem[] = [{ field: 'name', sort: 'asc' }];
        const { container } = render(
            <DataGrid rows={EMPTY} columns={TREE_COLS} dataSource={ds} treeData getTreeDataPath={getTreeDataPath}
                filterMode="server" sortingMode="server" paginationMode="server" filterModel={filterModel} sortModel={sortModel} />
        );
        await flush();
        expect(texts(container)).toEqual(['Sales']);
        fireEvent.click(rowNamed(container, 'Sales'));
        await flush(0);
        expect(ds.calls).toContainEqual(['Sales']);
        expect(texts(container)).toEqual(['Sales', 'Bob', 'Ann']);
    });

    it('reloads the children of an expanded node when a server sort replaces the rows', async () => {
        const ds = treeSource();
        const Grid = ({ sortModel }: { sortModel: GridSortItem[] }) => (
            <DataGrid rows={EMPTY} columns={TREE_COLS} dataSource={ds} treeData getTreeDataPath={getTreeDataPath}
                sortingMode="server" paginationMode="server" sortModel={sortModel} />
        );
        const { container, rerender } = render(<Grid sortModel={[]} />);
        await flush();
        fireEvent.click(rowNamed(container, 'Sales'));
        await flush(0);
        expect(texts(container)).toEqual(['Sales', 'Bob', 'Ann', 'Eng']);

        rerender(<Grid sortModel={[{ field: 'name', sort: 'desc' }]} />);
        await flush();
        expect(ds.calls.filter(keys => keys[0] === 'Sales')).toHaveLength(2);
        expect(texts(container)).toEqual(['Eng', 'Sales', 'Bob', 'Ann']);

        // A single click collapses it, like any expanded node.
        fireEvent.click(rowNamed(container, 'Sales'));
        await flush(0);
        expect(texts(container)).toEqual(['Eng', 'Sales']);
    });

    it('keeps a children failure local to its node: no grid overlay, the node collapses, expanding retries', async () => {
        const ds = treeSource();
        let failChildren = true;
        const flaky: GridDataSource = {
            getRows: async (p) => {
                if (p.groupKeys.length > 0 && failChildren) throw new Error('child boom');
                return ds.getRows(p);
            },
        };
        const { container } = render(
            <DataGrid rows={EMPTY} columns={TREE_COLS} dataSource={flaky} treeData getTreeDataPath={getTreeDataPath} paginationMode="server" />
        );
        await flush();
        fireEvent.click(rowNamed(container, 'Sales'));
        await flush(0);
        expect(container.querySelector('.ogx-error-overlay')).toBeNull();
        expect(texts(container)).toEqual(['Sales', 'Eng']);

        // The node is collapsed again, so one click expands it and retries the request.
        failChildren = false;
        fireEvent.click(rowNamed(container, 'Sales'));
        await flush(0);
        expect(texts(container)).toEqual(['Sales', 'Bob', 'Ann', 'Eng']);
    });

    it('drops children that arrive after the page changed', async () => {
        let releaseChildren: (() => void) | undefined;
        const ds: GridDataSource = {
            getRows: (p) => {
                if (p.groupKeys.length > 0) {
                    return new Promise(resolve => {
                        releaseChildren = () => resolve({ rows: CHILDREN.Sales });
                    });
                }
                const rows = p.startRow === 0 ? ROOTS : [{ id: 'hr', path: ['HR'], name: 'HR' }];
                return Promise.resolve({ rows, rowCount: 20 });
            },
        };
        const Grid = ({ page }: { page: number }) => (
            <DataGrid rows={EMPTY} columns={TREE_COLS} dataSource={ds} treeData getTreeDataPath={getTreeDataPath}
                paginationMode="server" pagination pageSizeOptions={[10]} paginationModel={{ page, pageSize: 10 }} />
        );
        const { container, rerender } = render(<Grid page={0} />);
        await flush();
        fireEvent.click(rowNamed(container, 'Sales'));
        rerender(<Grid page={1} />);
        await flush();
        expect(texts(container)).toEqual(['HR']);
        await act(async () => { releaseChildren?.(); });
        expect(texts(container)).toEqual(['HR']);
    });
});
