import { describe, it, expect, vi, afterEach } from 'vitest';
import { StrictMode, useState, act } from 'react';
import { render, cleanup } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import { GridToolbar } from '../Toolbar/GridToolbar';
import type { DataGridProps, GridColDef, GridRowId } from '../../types';

type Row = { id: number; name: string; team: string; age: number; path: string[] };
const ROWS: Row[] = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1, name: `n${i}`, team: i % 2 ? 'A' : 'B', age: i, path: i === 0 ? ['n0'] : ['n0', `n${i}`],
}));
const COLUMNS: GridColDef<Row>[] = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'team', headerName: 'Team', width: 100 },
    { field: 'age', headerName: 'Age', type: 'number', width: 80 },
];

const CALLBACKS = [
    'onSortModelChange', 'onFilterModelChange', 'onPaginationModelChange', 'onPinnedColumnsChange',
    'onColumnVisibilityModelChange', 'onRowSelectionModelChange', 'onDetailPanelExpandedRowIdsChange',
    'onColumnOrderChange', 'onColumnOrderModelChange', 'onRowOrderChange', 'onAggregationModelChange',
    'onPivotModelChange', 'onProcessRowUpdateError', 'onRowClick', 'onCellClick',
] as const;

afterEach(cleanup);

function spies() {
    return Object.fromEntries(CALLBACKS.map(n => [n, vi.fn<(...args: unknown[]) => void>()])) as Record<(typeof CALLBACKS)[number], ReturnType<typeof vi.fn<(...args: unknown[]) => void>>>;
}
function called(s: ReturnType<typeof spies>) {
    return Object.fromEntries(Object.entries(s).filter(([, f]) => f.mock.calls.length > 0).map(([k, f]) => [k, f.mock.calls]));
}

const CONFIGS: [string, Partial<DataGridProps<Row>>][] = [
    ['uncontrolled plain', {}],
    ['controlled models', {
        sortModel: [{ field: 'age', sort: 'desc' }],
        filterModel: { items: [] },
        pagination: true,
        paginationModel: { page: 0, pageSize: 10 },
        pageSizeOptions: [10, 25],
        rowSelectionModel: [1, 2],
        columnVisibilityModel: { team: true },
        pinnedColumns: { left: ['name'] },
        columnOrder: ['name', 'team', 'age'],
        checkboxSelection: true,
    }],
    ['initialState pagination', { pagination: true, initialState: { pagination: { paginationModel: { page: 1, pageSize: 10 } } }, pageSizeOptions: [10] }],
    ['grouping + aggregation', { rowGroupingModel: ['team'], aggregationModel: { age: 'sum' }, groupingColDef: { field: '__group__', headerName: 'G' } }],
    ['tree', { treeData: true, getTreeDataPath: (r: Row) => r.path }],
    ['pivot', { pivotMode: true, pivotModel: { rowFields: ['team'], columnFields: [], valueFields: [{ field: 'age', aggFn: 'sum' }] } }],
    ['toolbar + detail', { slots: { toolbar: GridToolbar }, getDetailPanelContent: () => <div>d</div>, detailPanelExpandedRowIds: new Set([1]) }],
];

describe('no change callbacks fire on mount when nothing changed (StrictMode)', () => {
    it.each(CONFIGS)('%s', (_l, props) => {
        const s = spies();
        render(<StrictMode><div style={{ height: 400 }}><DataGrid<Row> rows={ROWS} columns={COLUMNS} {...props} {...s} /></div></StrictMode>);
        expect(called(s)).toEqual({});
    });

    it('onStateChange fires at most once on mount (StrictMode)', () => {
        const onStateChange = vi.fn();
        render(<StrictMode><DataGrid<Row> rows={ROWS} columns={COLUMNS} onStateChange={onStateChange} /></StrictMode>);
        expect(onStateChange.mock.calls.length).toBeLessThanOrEqual(1);
    });
});

describe('a page correction is reported once, also under StrictMode', () => {
    it('initialState page past the end', () => {
        const onPaginationModelChange = vi.fn();
        render(<StrictMode><DataGrid<Row> rows={ROWS.slice(0, 5)} columns={COLUMNS} pagination pageSizeOptions={[10]}
            initialState={{ pagination: { paginationModel: { page: 3, pageSize: 10 } } }}
            onPaginationModelChange={onPaginationModelChange} /></StrictMode>);
        expect(onPaginationModelChange).toHaveBeenCalledTimes(1);
    });

    it('stale selected id pruned once under StrictMode', () => {
        const onRowSelectionModelChange = vi.fn();
        render(<StrictMode><DataGrid<Row> rows={ROWS} columns={COLUMNS} checkboxSelection
            initialState={{}}
            rowSelectionModel={[1, 999]}
            onRowSelectionModelChange={onRowSelectionModelChange} /></StrictMode>);
        expect(onRowSelectionModelChange).toHaveBeenCalledTimes(1);
    });
});

describe('stale-id selection pruning is reported once per change', () => {
    it('a controlled parent that keeps a stale id is not re-notified on every unrelated re-render', () => {
        const onRowSelectionModelChange = vi.fn();
        const el = (n: number) => (
            <div data-n={n}><DataGrid<Row> rows={ROWS} columns={COLUMNS} checkboxSelection
                rowSelectionModel={[1, 999]}
                onRowSelectionModelChange={onRowSelectionModelChange} /></div>
        );
        const { rerender } = render(el(0));
        for (let i = 1; i <= 5; i++) rerender(el(i));
        expect(onRowSelectionModelChange).toHaveBeenCalledTimes(1);
    });

    it('a parent that records the reported model in its own state does not loop', async () => {
        let calls = 0;
        function Parent() {
            const [, setLast] = useState<GridRowId[]>([]);
            return (
                <DataGrid<Row> rows={ROWS} columns={COLUMNS} checkboxSelection
                    rowSelectionModel={[1, 999]}
                    onRowSelectionModelChange={(m) => { calls++; if (calls < 200) setLast(m); }} />
            );
        }
        await act(async () => { render(<Parent />); });
        await act(async () => { await new Promise(r => setTimeout(r, 50)); });
        expect(calls).toBe(1);
    });

    it('reports again when the model or the rows change what is pruned', () => {
        const onRowSelectionModelChange = vi.fn();
        const el = (model: GridRowId[], rows: Row[]) => (
            <DataGrid<Row> rows={rows} columns={COLUMNS} checkboxSelection
                rowSelectionModel={model} onRowSelectionModelChange={onRowSelectionModelChange} />
        );
        const { rerender } = render(el([1, 999], ROWS));
        rerender(el([1, 998], ROWS));
        rerender(el([1, 2], ROWS.filter(r => r.id !== 2)));
        expect(onRowSelectionModelChange.mock.calls.map(c => c[0])).toEqual([[1], [1], [1]]);
    });
});
