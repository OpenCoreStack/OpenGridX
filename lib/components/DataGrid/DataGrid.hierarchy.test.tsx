import { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type {
    GridColDef,
    GridRowId,
    GridRenderCellParams,
    GridTreeNode,
    GridDataSource,
    GridGetRowsParams,
    GridGetRowsResponse,
    GridFilterModel,
    GridSortItem,
    GridApi,
} from '../../types';

// Tree data and row grouping through the public DataGrid API: synthetic rows (group rows, subtotal
// rows, auto-created tree parents) versus the consumer's callbacks, selection, detail panels and clicks.

type Person = { id: number; dept: string; name: string; amount: number; user?: { name: string }; orders?: number[] };
const PEOPLE: Person[] = [
    { id: 1, dept: 'Eng', name: 'Ada', amount: 10, user: { name: 'ada' }, orders: [1] },
    { id: 2, dept: 'Eng', name: 'Bo', amount: 20, user: { name: 'bo' }, orders: [2, 3] },
    { id: 3, dept: 'Ops', name: 'Cy', amount: 30, user: { name: 'cy' }, orders: [] },
];

type FileRow = { id: number | string; path: string[]; title: string; size?: number; serverChildrenCount?: number };

const bodyRows = (c: HTMLElement) => Array.from(c.querySelectorAll('.ogx__rows [role="row"]'));
const rowTexts = (c: HTMLElement) => bodyRows(c).map(r => r.textContent ?? '');
const cellText = (row: Element, field: string) => row.querySelector(`[role="gridcell"][data-field="${field}"]`)?.textContent ?? '';

describe('synthetic rows and column callbacks', () => {
    it('does not call a leaf valueGetter for group rows', () => {
        const cols: GridColDef<Person>[] = [
            { field: 'dept', width: 150 },
            { field: 'userName', width: 150, valueGetter: ({ row }) => row.user!.name },
        ];
        const { container } = render(<DataGrid rows={PEOPLE} columns={cols} rowGroupingModel={['dept']} defaultGroupingExpansionDepth={-1} />);
        expect(rowTexts(container)[0]).toContain('dept: Eng (2)');
        expect(screen.getByText('ada')).toBeInTheDocument();
    });

    it('does not call a leaf valueGetter for auto-created tree parents', () => {
        const rows = [{ id: 1, path: ['Folder', 'x'], user: { name: 'ada' } }];
        const cols: GridColDef<(typeof rows)[number]>[] = [
            { field: 'title', width: 150 },
            { field: 'userName', width: 150, valueGetter: ({ row }) => row.user.name },
        ];
        const { container } = render(<DataGrid rows={rows} columns={cols} treeData getTreeDataPath={r => r.path} defaultGroupingExpansionDepth={-1} />);
        expect(rowTexts(container)[0]).toContain('Folder (1)');
        expect(screen.getByText('ada')).toBeInTheDocument();
    });

    it('contains a throwing valueGetter or valueFormatter to its cell', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        const cols: GridColDef<Person>[] = [
            { field: 'name', width: 150 },
            { field: 'bad', width: 100, valueGetter: ({ row }) => { if (row.id === 2) throw new Error('getter'); return 'ok'; } },
            { field: 'amount', width: 100, valueFormatter: ({ value }) => { if (value === 30) throw new Error('formatter'); return String(value); } },
        ];
        const { container } = render(<DataGrid rows={PEOPLE} columns={cols} />);
        const rows = bodyRows(container);
        expect(rows).toHaveLength(3);
        expect(cellText(rows[0], 'bad')).toBe('ok');
        expect(rows[1].querySelector('[data-field="bad"] .ogx__cell-error')).not.toBeNull();
        expect(rows[2].querySelector('[data-field="amount"] .ogx__cell-error')).not.toBeNull();
        expect(cellText(rows[2], 'name')).toBe('Cy');
        warn.mockRestore();
        error.mockRestore();
    });

    it('does not call a valueFormatter for the empty cells of group rows', () => {
        const formatter = vi.fn(({ value }: { value: unknown }) => (value as string).toUpperCase());
        const cols: GridColDef<Person>[] = [{ field: 'dept', width: 150 }, { field: 'name', width: 150, valueFormatter: formatter }];
        const { container } = render(<DataGrid rows={PEOPLE} columns={cols} rowGroupingModel={['dept']} defaultGroupingExpansionDepth={-1} />);
        expect(container.querySelector('.ogx__cell-error')).toBeNull();
        expect(screen.getByText('ADA')).toBeInTheDocument();
    });
});

describe('detail panels', () => {
    it('never calls the detail callbacks for group rows, and gives group rows no detail toggle', () => {
        const seen: GridRowId[] = [];
        const cols: GridColDef<Person>[] = [{ field: 'dept', width: 150 }, { field: 'name', width: 150 }];
        const { container } = render(
            <DataGrid
                rows={PEOPLE}
                columns={cols}
                rowGroupingModel={['dept']}
                defaultGroupingExpansionDepth={-1}
                getDetailPanelContent={({ row }) => { seen.push(row.id); return <div>{row.orders!.length} orders</div>; }}
                getDetailPanelHeight={({ row }) => row.orders!.length * 10 + 50}
            />
        );
        expect(seen.every(id => typeof id === 'number')).toBe(true);
        const [groupRow, leafRow] = bodyRows(container);
        expect(groupRow.querySelector('.ogx__cell--expand .ogx-expand-icon')).toBeNull();
        expect(leafRow.querySelector('.ogx__cell--expand .ogx-expand-icon')).not.toBeNull();
    });
});

describe('renderCell on synthetic rows', () => {
    it('calls renderCell of other columns for group rows (the documented rowMeta pattern)', () => {
        const renderCell = vi.fn((params: GridRenderCellParams<Person>) =>
            params.rowMeta?.hasChildren ? <strong>GROUP({params.rowMeta.descendantCount})</strong> : String(params.value));
        const cols: GridColDef<Person>[] = [{ field: 'dept', width: 150 }, { field: 'name', width: 150, renderCell }];
        render(<DataGrid rows={PEOPLE} columns={cols} rowGroupingModel={['dept']} />);
        expect(screen.getByText('GROUP(2)')).toBeInTheDocument();
    });

    it('shows the hierarchy column renderCell output next to the toggle', () => {
        const renderCell = (p: GridRenderCellParams<Person>) =>
            p.rowMeta?.isGroupRow ? <em>G-{String(p.rowMeta.groupingValue)}</em> : String(p.value);
        const cols: GridColDef<Person>[] = [{ field: 'name', width: 150, renderCell }, { field: 'dept', width: 150 }];
        const { container } = render(<DataGrid rows={PEOPLE} columns={cols} rowGroupingModel={['dept']} />);
        expect(screen.getByText('G-Eng')).toBeInTheDocument();
        expect(bodyRows(container)[0].querySelector('.ogx-expand-icon')).not.toBeNull();
    });

    it('uses groupingColDef.renderCell for group rows', () => {
        const cols: GridColDef<Person>[] = [{ field: 'dept', width: 150 }, { field: 'name', width: 150 }];
        render(
            <DataGrid
                rows={PEOPLE}
                columns={cols}
                rowGroupingModel={['dept']}
                groupingColDef={{ field: 'ignored', headerName: 'Group', renderCell: p => <span>custom-{String(p.rowMeta?.groupingValue)}</span> }}
            />
        );
        expect(screen.getByText('custom-Eng')).toBeInTheDocument();
    });

    it('uses renderCell output for auto-created tree parents', () => {
        const rows: FileRow[] = [{ id: 'a', path: ['Eng', 'Ada'], title: 'Ada' }, { id: 'b', path: ['Eng', 'Bo'], title: 'Bo' }];
        const cols: GridColDef<FileRow>[] = [{
            field: 'title',
            width: 200,
            renderCell: p => (p.rowMeta?.isGroupRow ? <em>AUTO-{String(p.rowMeta.descendantCount)}</em> : String(p.value)),
        }];
        render(<DataGrid rows={rows} columns={cols} treeData getTreeDataPath={r => r.path} />);
        expect(screen.getByText('AUTO-2')).toBeInTheDocument();
    });

    it('keeps the default group label when renderCell returns undefined for a synthetic row', () => {
        const cols: GridColDef<Person>[] = [
            { field: 'name', width: 150, renderCell: p => (p.rowMeta?.isGroupRow ? undefined : <b>{String(p.value)}</b>) },
            { field: 'dept', width: 150 },
        ];
        const { container } = render(<DataGrid rows={PEOPLE} columns={cols} rowGroupingModel={['dept']} />);
        expect(rowTexts(container)).toEqual(['dept: Eng (2)', 'dept: Ops (1)']);
    });

    it('keeps the expand toggle when the hierarchy column renderCell throws for a group row', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        const cols: GridColDef<Person>[] = [
            { field: 'name', width: 150, renderCell: p => <b>{p.row.user!.name}</b> },
            { field: 'dept', width: 150 },
        ];
        const { container } = render(<DataGrid rows={PEOPLE} columns={cols} rowGroupingModel={['dept']} />);
        const groupRow = bodyRows(container)[0];
        expect(groupRow.querySelector('.ogx__cell-error')).not.toBeNull();
        fireEvent.click(groupRow.querySelector('.ogx-expand-icon')!);
        expect(screen.getByText('ada')).toBeInTheDocument();
        warn.mockRestore();
        error.mockRestore();
    });
});

describe('tree data labels', () => {
    it('shows the label of an auto-created parent whatever the first column is called', () => {
        const rows: FileRow[] = [{ id: 1, path: ['Root', 'Sub', 'leaf.txt'], title: 'leaf.txt' }];
        const { container } = render(
            <DataGrid rows={rows} columns={[{ field: 'title', width: 200 }]} treeData getTreeDataPath={r => r.path} defaultGroupingExpansionDepth={-1} />
        );
        expect(rowTexts(container)).toEqual(['Root (1)', 'Sub (1)', 'leaf.txt']);
    });

    it('sorts auto-created parents by their label when the label column is sorted', () => {
        const rows: FileRow[] = [{ id: 1, path: ['Bravo', 'b.txt'], title: 'b.txt' }, { id: 2, path: ['Alpha', 'a.txt'], title: 'a.txt' }];
        const { container } = render(
            <DataGrid rows={rows} columns={[{ field: 'title', width: 200 }]} treeData getTreeDataPath={r => r.path} sortModel={[{ field: 'title', sort: 'asc' }]} />
        );
        expect(rowTexts(container)).toEqual(['Alpha (1)', 'Bravo (1)']);
    });

    it('shows the rows flat, with a warning, when treeData has no getTreeDataPath', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { container } = render(<DataGrid rows={[{ id: 1, path: [], title: 'r1' }]} columns={[{ field: 'title', width: 200 }]} treeData />);
        expect(rowTexts(container)).toEqual(['r1']);
        expect(warn.mock.calls.some(c => String(c[0]).includes('without getTreeDataPath'))).toBe(true);
        warn.mockRestore();
    });
});

describe('row grouping labels and sorting', () => {
    it('sorts groups by grouping value when the column showing the labels is sorted', () => {
        const rows = [{ id: 1, region: 'South', team: 'b' }, { id: 2, region: 'North', team: 'a' }];
        const { container } = render(
            <DataGrid rows={rows} columns={[{ field: 'team', width: 150 }, { field: 'region', width: 150 }]} rowGroupingModel={['region']} sortModel={[{ field: 'team', sort: 'asc' }]} />
        );
        expect(rowTexts(container)).toEqual(['region: North (1)', 'region: South (1)']);
    });

    it('indents and expands as if a groupable:false field was not in the model', () => {
        const rows = [{ id: 1, region: 'EU', team: 'Alpha', name: 'Ann' }, { id: 2, region: 'US', team: 'Alpha', name: 'Bob' }];
        const cols: GridColDef[] = [{ field: 'region', width: 100, groupable: false }, { field: 'team', width: 100 }, { field: 'name', width: 100 }];
        const { container } = render(<DataGrid rows={rows} columns={cols} rowGroupingModel={['region', 'team']} defaultGroupingExpansionDepth={1} />);
        expect(rowTexts(container)).toEqual(['team: Alpha (2)', 'EUAlphaAnn', 'USAlphaBob']);
    });

    it('counts and aggregates only the leaves that pass the filter', () => {
        const rows = [{ id: 1, region: 'N', team: 'a', amount: 100 }, { id: 2, region: 'N', team: 'b', amount: 5 }];
        const cols: GridColDef[] = [{ field: 'region', width: 100 }, { field: 'team', width: 100 }, { field: 'amount', width: 100 }];
        const { container } = render(
            <DataGrid rows={rows} columns={cols} rowGroupingModel={['region']} aggregationModel={{ amount: 'sum' }}
                filterModel={{ items: [{ field: 'team', operator: 'equals', value: 'a' }] }} />
        );
        const groupRow = bodyRows(container)[0];
        expect(cellText(groupRow, 'region')).toBe('region: N (1)');
        expect(cellText(groupRow, 'amount')).toBe('100');
    });
});

describe('clicking tree-data parents', () => {
    const rows: FileRow[] = [{ id: 1, path: ['CEO'], title: 'Ada' }, { id: 2, path: ['CEO', 'CTO'], title: 'Bo' }];
    const cols: GridColDef<FileRow>[] = [{ field: 'title', width: 200 }];

    it('fires onRowClick and selects a real parent row instead of toggling it', () => {
        const onRowClick = vi.fn();
        const onSelection = vi.fn();
        render(<DataGrid rows={rows} columns={cols} treeData getTreeDataPath={r => r.path} onRowClick={onRowClick} onRowSelectionModelChange={onSelection} />);
        fireEvent.click(screen.getByText('Ada'));
        expect(onRowClick).toHaveBeenCalledTimes(1);
        expect(onRowClick.mock.calls[0][0].id).toBe(1);
        expect(onSelection).toHaveBeenLastCalledWith([1]);
        expect(screen.queryByText('Bo')).toBeNull();
    });

    it('expands a real parent row through its chevron, and a double-click does not toggle it', () => {
        const onRowDoubleClick = vi.fn();
        const onRowClick = vi.fn();
        render(<DataGrid rows={rows} columns={cols} treeData getTreeDataPath={r => r.path} onRowClick={onRowClick} onRowDoubleClick={onRowDoubleClick} />);
        const cell = screen.getByText('Ada');
        fireEvent.click(cell);
        expect(screen.queryByText('Bo')).toBeNull();
        fireEvent.click(cell);
        fireEvent.doubleClick(cell);
        expect(onRowDoubleClick).toHaveBeenCalledTimes(1);
        expect(onRowClick).toHaveBeenCalledTimes(2);
        expect(screen.queryByText('Bo')).toBeNull();
        fireEvent.click(screen.getByRole('button', { name: 'Expand row' }));
        expect(screen.getByText('Bo')).toBeInTheDocument();
    });

    it('still toggles a synthetic group row on click without firing onRowClick', () => {
        const onRowClick = vi.fn();
        const { container } = render(<DataGrid rows={PEOPLE} columns={[{ field: 'dept', width: 150 }, { field: 'name', width: 150 }]} rowGroupingModel={['dept']} onRowClick={onRowClick} />);
        fireEvent.click(bodyRows(container)[0]);
        expect(screen.getByText('Ada')).toBeInTheDocument();
        expect(onRowClick).not.toHaveBeenCalled();
    });
});

describe('selection under row grouping', () => {
    const rows = [{ id: 1, region: 'North', name: 'A' }, { id: 2, region: 'North', name: 'B' }, { id: 3, region: 'South', name: 'C' }];
    const cols: GridColDef[] = [{ field: 'region', width: 150 }, { field: 'name', width: 150 }];
    const mount = (onChange: (ids: GridRowId[]) => void) => render(
        <DataGrid rows={rows} columns={cols} checkboxSelection rowGroupingModel={['region']} defaultGroupingExpansionDepth={-1} onRowSelectionModelChange={onChange} />
    );
    const header = (c: HTMLElement) => c.querySelector<HTMLInputElement>('input[aria-label="Select all rows"], input[aria-label="Deselect all rows"]')!;
    const rowBox = (c: HTMLElement, id: number) => c.querySelector<HTMLInputElement>(`.ogx__row input[aria-label="Select row ${id}"], .ogx__row input[aria-label="Deselect row ${id}"]`)!;

    it('renders no checkbox on group rows', () => {
        const { container } = mount(vi.fn());
        const groupRows = container.querySelectorAll('.ogx__row--group');
        expect(groupRows).toHaveLength(2);
        groupRows.forEach(row => expect(row.querySelector('input[type="checkbox"]')).toBeNull());
    });

    it('never puts a group id in the selection, and shows the header partial while a leaf is unchecked', () => {
        const onChange = vi.fn<(ids: GridRowId[]) => void>();
        const { container } = mount(onChange);
        fireEvent.click(rowBox(container, 1));
        fireEvent.click(rowBox(container, 3));
        expect(onChange).toHaveBeenLastCalledWith([1, 3]);
        expect(header(container).checked).toBe(false);
        fireEvent.click(rowBox(container, 2));
        expect(header(container).checked).toBe(true);
    });

    it('ignores synthetic ids given through a controlled model when computing the header state', () => {
        const { container } = render(
            <DataGrid rows={rows} columns={cols} checkboxSelection rowGroupingModel={['region']} rowSelectionModel={[1, 2, 'stale-id']} />
        );
        expect(header(container).checked).toBe(false);
    });
});

describe('getAggregationPosition in the grid', () => {
    const rows = [{ id: 1, name: 'x', team: 'A', amount: 10 }, { id: 2, name: 'y', team: 'A', amount: 20 }, { id: 3, name: 'z', team: 'B', amount: 5 }];
    const cols: GridColDef[] = [{ field: 'name', width: 150 }, { field: 'team', width: 120 }, { field: 'amount', width: 120, type: 'number' }];
    type Position = 'inline' | 'footer' | null;
    const mount = (getAggregationPosition: (node: GridTreeNode | null) => Position) => render(
        <DataGrid rows={rows} columns={cols} rowGroupingModel={['team']} defaultGroupingExpansionDepth={-1}
            aggregationModel={{ amount: 'sum' }} getAggregationPosition={getAggregationPosition} />
    );

    it("renders a subtotal row after the group's children for 'footer'", () => {
        const { container } = mount(node => (node === null ? 'footer' : 'footer'));
        const footers = container.querySelectorAll('.ogx__row--group-footer');
        expect(footers).toHaveLength(2);
        expect(cellText(footers[0], 'amount')).toBe('30');
        container.querySelectorAll('.ogx__row--group').forEach(row => expect(cellText(row, 'amount')).toBe(''));
        expect(footers[0].querySelector('input[type="checkbox"]')).toBeNull();
    });

    it('hides the grand-total footer when the root position is null', () => {
        const { container } = mount(node => (node === null ? null : 'inline'));
        expect(container.querySelector('.ogx__aggregation-footer')).toBeNull();
        expect(cellText(container.querySelectorAll('.ogx__row--group')[0], 'amount')).toBe('30');
    });

    function ApiHarness({ position, onApi }: { position: (node: GridTreeNode | null) => Position; onApi: (apiRef: React.MutableRefObject<GridApi>) => void }) {
        const apiRef = useGridApiRef();
        useEffect(() => { onApi(apiRef); }, [apiRef, onApi]);
        return <DataGrid rows={rows} columns={cols} rowGroupingModel={['team']} defaultGroupingExpansionDepth={-1}
            aggregationModel={{ amount: 'sum' }} getAggregationPosition={position} apiRef={apiRef} />;
    }

    it('leaves out the subtotals and the grand total that are hidden', () => {
        let apiRef: React.MutableRefObject<GridApi> | null = null;
        render(<ApiHarness position={() => null} onApi={ref => { apiRef = ref; }} />);
        const kinds = (apiRef as React.MutableRefObject<GridApi> | null)?.current.getGroupedExportRows()?.map(r => r.type);
        expect(kinds).toEqual(['group-header', 'leaf', 'leaf', 'group-header', 'leaf']);
    });
});

describe('tree data with pagination', () => {
    const rows: FileRow[] = [{ id: 0, path: ['root'], title: 'root' }];
    for (let i = 1; i < 15; i++) rows.push({ id: i, path: ['root', `n${i}`], title: `n${i}` });

    it('keeps keyboard focus on the current page', () => {
        const { container } = render(
            <DataGrid rows={rows} columns={[{ field: 'title', width: 200 }]} treeData getTreeDataPath={r => r.path}
                defaultGroupingExpansionDepth={-1} pagination paginationModel={{ page: 0, pageSize: 10 }} />
        );
        expect(bodyRows(container)).toHaveLength(10);
        fireEvent.click(screen.getByText('n9'));
        const grid = container.querySelector<HTMLElement>('[role="grid"]')!;
        act(() => { fireEvent.keyDown(grid, { key: 'ArrowDown' }); });
        const focused = container.querySelectorAll('.ogx__cell--focused');
        expect(focused).toHaveLength(1);
        expect(focused[0].textContent).toBe('n9');
    });
});

describe('server-side tree data', () => {
    type TreeRow = { id: number; path: string[]; name: string; serverChildrenCount?: number };
    const ROOTS: TreeRow[] = [{ id: 1, path: ['Roo'], name: 'Roo', serverChildrenCount: 2 }];
    const KIDS: TreeRow[] = [{ id: 2, path: ['Roo', 'Roo-A'], name: 'Roo-A' }, { id: 3, path: ['Roo', 'Roo-B'], name: 'Roo-B' }];
    const COLS: GridColDef<TreeRow>[] = [{ field: 'name', width: 200 }];
    const EMPTY: TreeRow[] = [];
    const getPath = (r: TreeRow) => r.path;

    const makeDataSource = (roots: TreeRow[] = ROOTS) => {
        const getRows = vi.fn(async (p: GridGetRowsParams): Promise<GridGetRowsResponse<TreeRow>> => (
            p.groupKeys && p.groupKeys.length > 0 ? { rows: KIDS, rowCount: KIDS.length } : { rows: roots, rowCount: roots.length }
        ));
        const ds: GridDataSource<TreeRow> = { getRows };
        return { ds, getRows };
    };
    const childFetches = (getRows: ReturnType<typeof makeDataSource>['getRows']) =>
        getRows.mock.calls.filter(([p]) => (p.groupKeys ?? []).length > 0).length;
    const flush = async (ms = 400) => { await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); };

    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('refetches the children of an expanded node after a server re-fetch replaces the rows', async () => {
        const { ds, getRows } = makeDataSource();
        const { rerender } = render(<DataGrid rows={EMPTY} columns={COLS} treeData getTreeDataPath={getPath} dataSource={ds} filterMode="server" />);
        await flush();
        fireEvent.click(screen.getByRole('button', { name: 'Expand row' }));
        await flush();
        expect(screen.getByText('Roo-A')).toBeInTheDocument();
        expect(childFetches(getRows)).toBe(1);

        const filterModel: GridFilterModel = { items: [], quickFilterValues: ['roo'] };
        rerender(<DataGrid rows={EMPTY} columns={COLS} treeData getTreeDataPath={getPath} dataSource={ds} filterMode="server" filterModel={filterModel} />);
        await flush(800);
        expect(childFetches(getRows)).toBe(2);
        expect(screen.getByText('Roo-A')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Collapse row' })).toBeInTheDocument();
    });

    it('fetches the children of a node once per expand', async () => {
        const { ds, getRows } = makeDataSource();
        render(<DataGrid rows={EMPTY} columns={COLS} treeData getTreeDataPath={getPath} dataSource={ds} sortingMode="server" />);
        await flush();
        fireEvent.click(screen.getByRole('button', { name: 'Expand row' }));
        await flush();
        fireEvent.click(screen.getByRole('button', { name: 'Collapse row' }));
        fireEvent.click(screen.getByRole('button', { name: 'Expand row' }));
        await flush();
        expect(childFetches(getRows)).toBe(1);
    });

    it("does not re-filter or re-sort the server's rows on the client", async () => {
        const roots: TreeRow[] = [{ id: 1, path: ['Zeta'], name: 'Zeta' }, { id: 2, path: ['Alpha'], name: 'Alpha' }];
        const { ds } = makeDataSource(roots);
        const sortModel: GridSortItem[] = [{ field: 'name', sort: 'asc' }];
        const { container } = render(
            <DataGrid rows={EMPTY} columns={COLS} treeData getTreeDataPath={getPath} dataSource={ds}
                filterMode="server" sortingMode="server" filterModel={{ items: [], quickFilterValues: ['finance'] }} sortModel={sortModel} />
        );
        await flush();
        expect(rowTexts(container)).toEqual(['Zeta', 'Alpha']);
    });
});
