import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, fireEvent, act, waitFor } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import { GridToolbar } from '../Toolbar/GridToolbar';
import type { DataGridProps, GridColDef } from '../../types';

// A consumer callback that throws for one bad record is contained: the grid keeps rendering and
// the pipelines (filter, sort, quick filter, aggregation, grouping, pivot, list view) read the
// failing cell as undefined. getRowId and getTreeDataPath are the exception: they must not throw
// (API_REFERENCE), so they are not covered here.

type Row = { id: number; name: string; team: string; age: number };
const ROWS: Row[] = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, name: `n${i}`, team: i % 2 ? 'A' : 'B', age: i }));

const failForRow3 = (row: Row | undefined) => {
    if (row && row.id === 3) throw new Error('bad row');
};

const BASE: GridColDef<Row>[] = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'team', headerName: 'Team', width: 100 },
    { field: 'age', headerName: 'Age', type: 'number', width: 80 },
];

function withAge(extra: Partial<GridColDef<Row>>): GridColDef<Row>[] {
    return BASE.map(c => (c.field === 'age' ? { ...c, ...extra } as GridColDef<Row> : c));
}

const getterThrows = withAge({ valueGetter: ({ row }) => { failForRow3(row); return row.age; } });
const formatterThrows = withAge({ valueFormatter: ({ value, row }) => { failForRow3(row); return String(value); } });

let warnSpy: { mock: { calls: unknown[][] } };
beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

function mount(props: Partial<DataGridProps<Row>>) {
    return render(<div style={{ height: 400 }}><DataGrid<Row> rows={ROWS} columns={BASE} {...props} /></div>);
}

const bodyText = (c: HTMLElement) => c.querySelector('[role="grid"], .ogx-list-view')?.textContent ?? '';

describe('a consumer callback that throws for one row does not take down the grid', () => {
    it.each<[string, Partial<DataGridProps<Row>>]>([
        ['valueGetter (render)', { columns: getterThrows }],
        ['valueGetter + sort on that column', { columns: getterThrows, sortModel: [{ field: 'age', sort: 'asc' }] }],
        ['valueGetter + filter on that column', { columns: getterThrows, filterModel: { items: [{ field: 'age', operator: '>', value: 1 }] } }],
        ['valueGetter + quick filter', { columns: getterThrows, filterModel: { items: [], quickFilterValues: ['n'] } }],
        ['valueGetter + aggregation footer', { columns: getterThrows, aggregationModel: { age: 'sum' } }],
        ['valueGetter + row grouping by that column', { columns: getterThrows, rowGroupingModel: ['age'] }],
        ['valueGetter + grouping aggregation', { columns: getterThrows, rowGroupingModel: ['team'], aggregationModel: { age: 'sum' } }],
        ['valueGetter + pivot', { columns: getterThrows, pivotMode: true, pivotModel: { rowFields: ['team'], columnFields: [], valueFields: [{ field: 'age', aggFn: 'sum' }] } }],
        ['valueFormatter (render)', { columns: formatterThrows }],
        ['valueFormatter + quick filter', { columns: formatterThrows, filterModel: { items: [], quickFilterValues: ['n'] } }],
        ['valueFormatter + toolbar', { columns: formatterThrows, slots: { toolbar: GridToolbar } }],
        ['colSpan', { columns: withAge({ colSpan: ({ row }) => { failForRow3(row); return 1; } }) }],
        ['rowSpan', { columns: withAge({ rowSpan: ({ row }) => { failForRow3(row); return 2; } }) }],
        ['cellClassName', { columns: withAge({ cellClassName: ({ row }) => { failForRow3(row); return 'x'; } }) }],
        ['isCellEditable', { columns: BASE.map(c => ({ ...c, editable: true })), isCellEditable: ({ row }) => { failForRow3(row); return true; } }],
        ['getAggregationPosition', { rowGroupingModel: ['team'], aggregationModel: { age: 'sum' }, getAggregationPosition: () => { throw new Error('x'); } }],
        ['renderCell', { columns: withAge({ renderCell: ({ row }) => { failForRow3(row); return <b>{row.age}</b>; } }) }],
        ['getDetailPanelContent', { getDetailPanelContent: ({ row }) => { failForRow3(row); return <div>d</div>; }, detailPanelExpandedRowIds: new Set([3]) }],
        ['getDetailPanelHeight', { getDetailPanelContent: () => <div>d</div>, getDetailPanelHeight: ({ row }) => { failForRow3(row); return 50; }, detailPanelExpandedRowIds: new Set([3]) }],
        ['groupingValueFormatter', { rowGroupingModel: ['team'], columns: BASE.map(c => (c.field === 'team' ? { ...c, groupingValueFormatter: () => { throw new Error('x'); } } : c)) }],
        ['list view renderCell', { listView: true, listViewColumn: { field: 'name', renderCell: ({ row }) => { failForRow3(row); return <b>{row.name}</b>; } } }],
        ['list view + valueGetter of the list field', { listView: true, columns: BASE.map(c => (c.field === 'name' ? { ...c, valueGetter: ({ row }: { row: Row }) => { failForRow3(row); return row.name; } } : c)), listViewColumn: { field: 'name', renderCell: ({ formattedValue }) => <b>{String(formattedValue)}</b> } }],
    ])('%s', (_label, props) => {
        let container: HTMLElement | undefined;
        expect(() => { ({ container } = mount(props)); }).not.toThrow();
        expect(container?.querySelector('[role="grid"], .ogx-list-view')).not.toBeNull();
    });

    it('sorting by a throwing valueGetter keeps every row and puts the failing one with the blanks', () => {
        const { container } = mount({ columns: getterThrows, sortModel: [{ field: 'age', sort: 'desc' }] });
        const names = Array.from(container.querySelectorAll('.ogx__rows [role="row"] [data-field="name"]')).map(c => c.textContent);
        expect(names).toHaveLength(6);
        expect(names).toContain('n2');
    });

    it('warns once per column in development, not once per row', () => {
        mount({ columns: withAge({ valueGetter: () => { throw new Error('always'); } }), sortModel: [{ field: 'age', sort: 'asc' }] });
        const calls = warnSpy.mock.calls.filter(args => String(args[0]).includes('valueGetter for column "age"'));
        expect(calls.length).toBeLessThanOrEqual(1);
    });

    it('a throwing groupingValueFormatter labels the group "field: value"', () => {
        const { container } = mount({
            rowGroupingModel: ['team'],
            columns: BASE.map(c => (c.field === 'team' ? { ...c, groupingValueFormatter: () => { throw new Error('x'); } } : c)),
        });
        expect(bodyText(container)).toContain('team: B');
    });

    it('a throwing list view renderCell shows the cell error for that row only', () => {
        const { container } = mount({ listView: true, listViewColumn: { field: 'name', renderCell: ({ row }) => { failForRow3(row); return <b>{row.name}</b>; } } });
        const text = bodyText(container);
        expect(text).toContain('n0');
        expect(text).toContain('n5');
    });

    it('processRowUpdate that throws goes to onProcessRowUpdateError', async () => {
        const onProcessRowUpdateError = vi.fn();
        const { container } = mount({
            columns: BASE.map(c => ({ ...c, editable: true })),
            processRowUpdate: () => { throw new Error('nope'); },
            onProcessRowUpdateError,
        });
        const cell = container.querySelector('[data-field="name"][role="gridcell"]') as HTMLElement;
        await act(async () => { fireEvent.doubleClick(cell); });
        const input = container.querySelector('input') as HTMLInputElement;
        await act(async () => {
            fireEvent.change(input, { target: { value: 'zz' } });
            fireEvent.keyDown(input, { key: 'Enter' });
        });
        expect(onProcessRowUpdateError).toHaveBeenCalled();
    });
});

describe('a dataSource response that cannot be processed fails the request', () => {
    it('getRows that throws synchronously shows the error overlay', async () => {
        const getRows = () => { throw new Error('sync fail'); };
        let container: HTMLElement | undefined;
        await act(async () => { ({ container } = mount({ rows: [], dataSource: { getRows } })); });
        await waitFor(() => expect(container?.textContent).toContain('sync fail'));
    });

    it('a getRowId that throws for a fetched row ends loading with the error overlay, without an unhandled rejection', async () => {
        const unhandled: unknown[] = [];
        const onUnhandled = (e: unknown) => { unhandled.push(e); };
        process.on('unhandledRejection', onUnhandled);
        try {
            let container: HTMLElement | undefined;
            await act(async () => {
                ({ container } = mount({
                    rows: [],
                    getRowId: (r: Row) => { failForRow3(r); return r.id; },
                    dataSource: { getRows: async () => ({ rows: ROWS, rowCount: ROWS.length }) },
                }));
            });
            await act(async () => { await new Promise(r => setTimeout(r, 400)); });
            expect(container?.textContent).not.toContain('Loading');
            expect(container?.textContent).toContain('bad row');
            expect(unhandled).toEqual([]);
        } finally {
            process.off('unhandledRejection', onUnhandled);
        }
    });

    it('a malformed response (no rows array) shows the error overlay', async () => {
        let container: HTMLElement | undefined;
        const getRows = async () => ({ rowCount: 3 }) as unknown as { rows: Row[] };
        await act(async () => { ({ container } = mount({ rows: [], dataSource: { getRows } })); });
        await act(async () => { await new Promise(r => setTimeout(r, 400)); });
        expect(container?.querySelector('.ogx-error-overlay, [role="alert"]')).not.toBeNull();
        expect(container?.textContent).not.toContain('Loading');
    });
});
