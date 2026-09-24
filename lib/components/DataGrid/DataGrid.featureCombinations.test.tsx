import { StrictMode, useEffect, useState } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type { DataGridProps, GridApi, GridColDef, GridRowModel, GridRowId } from '../../types';

// Features that each work alone, combined: selection pruning with controlled selection, row
// grouping with server pagination, spans with synthetic rows, hierarchy sort with exports,
// pinning with getVisibleColumns, lazy tree nodes with the default expansion depth, list view
// with grouping, and the pivot Grand Total with selection.

type P = { key: string; dept: string; name: string; amount: number };
// Rows without an `id` field, keyed by getRowId (cast like DataGrid.rowId.test.tsx does).
const PEOPLE_ROWS: P[] = [
    { key: 'a', dept: 'Eng', name: 'Ada', amount: 10 },
    { key: 'b', dept: 'Eng', name: 'Bo', amount: 20 },
    { key: 'c', dept: 'Ops', name: 'Cy', amount: 30 },
];
const PEOPLE = PEOPLE_ROWS as unknown as GridRowModel[];
const COLS: GridColDef[] = [
    { field: 'dept', width: 120 },
    { field: 'name', width: 120 },
    { field: 'amount', width: 120, type: 'number' },
];
const byKey = (r: GridRowModel) => r.key as string;

const bodyRows = (c: HTMLElement) => Array.from(c.querySelectorAll('.ogx__rows [role="row"]'));
const rowTexts = (c: HTMLElement) => bodyRows(c).map(r => r.textContent ?? '');
const headerFields = (c: HTMLElement) =>
    Array.from(c.querySelectorAll('[role="columnheader"][data-field]')).map(h => h.getAttribute('data-field'));
const listRows = (c: HTMLElement) => Array.from(c.querySelectorAll('.ogx-list-view__rows > [role="row"]'));

function renderWithApi(props: Partial<DataGridProps>) {
    const out: { api: GridApi | null } = { api: null };
    function Harness() {
        const apiRef = useGridApiRef();
        useEffect(() => { out.api = apiRef.current; });
        return <DataGrid rows={PEOPLE} columns={COLS} apiRef={apiRef} {...props} />;
    }
    const utils = render(<Harness />);
    return { ...utils, api: () => out.api! };
}

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('selection pruning x controlled selection', () => {
    it('reports a pruned model once, even when the parent re-renders without adopting it', async () => {
        // A controlled model naming a row that is not in `rows`, and a callback that re-renders the
        // parent without adopting the pruned model (logging, analytics, a counter...).
        let calls = 0;
        function Parent() {
            const [, setTick] = useState(0);
            return (
                <DataGrid rows={PEOPLE} columns={COLS} getRowId={byKey} checkboxSelection
                    rowSelectionModel={['a', 'gone']}
                    onRowSelectionModelChange={() => { calls++; if (calls < 50) setTick(t => t + 1); }} />
            );
        }
        await act(async () => { render(<Parent />); });
        expect(calls).toBe(1);
    });

    it('does not loop when the consumer keeps selected ids of rows it filtered out itself', async () => {
        let calls = 0;
        function Parent() {
            const [selected, setSelected] = useState<GridRowId[]>(['a', 'c']);
            const visible = PEOPLE.filter(p => p.dept === 'Eng');
            return (
                <DataGrid rows={visible} columns={COLS} getRowId={byKey} checkboxSelection rowSelectionModel={selected}
                    onRowSelectionModelChange={(m) => {
                        calls++;
                        if (calls > 50) return;
                        const hidden = selected.filter(id => !visible.some(v => v.key === id));
                        setSelected([...new Set([...m, ...hidden])]);
                    }} />
            );
        }
        await act(async () => { render(<Parent />); });
        expect(calls).toBeLessThanOrEqual(1);
    });
});

describe('row grouping x server pagination (dataSource)', () => {
    it('keeps every server row reachable: either a pager is shown or all rows are requested', async () => {
        vi.useFakeTimers();
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const ALL = Array.from({ length: 30 }, (_, i) => ({ key: `k${i}`, name: `n${i}`, dept: i % 2 ? 'Eng' : 'Ops', amount: i }));
        const getRows = vi.fn(async (p: { startRow: number; endRow: number }) => ({ rows: ALL.slice(p.startRow, p.endRow) as unknown as GridRowModel[], rowCount: 30 }));
        const { container } = render(
            <DataGrid rows={[]} columns={COLS} getRowId={byKey} dataSource={{ getRows }} rowGroupingModel={['dept']}
                pagination paginationMode="server" paginationModel={{ page: 0, pageSize: 10 }} pageSizeOptions={[10]} />
        );
        await act(async () => { await vi.advanceTimersByTimeAsync(400); });
        const hasPager = container.querySelector('.ogx-pagination') !== null;
        const loadedEveryRow = rowTexts(container).join('|').includes('(15)');
        expect(hasPager || loadedEveryRow).toBe(true);
    });
});

describe('row spanning x row grouping', () => {
    it('a synthetic group row is not a rowSpan origin that hides the leaves below it', () => {
        const cols: GridColDef[] = [{ field: 'dept', width: 100 }, { field: 'name', width: 100, rowSpan: 2 }];
        const { container } = render(
            <DataGrid rows={PEOPLE} columns={cols} getRowId={byKey} rowGroupingModel={['dept']} defaultGroupingExpansionDepth={-1} />
        );
        // Rows: [Eng group] [Ada] [Bo] [Ops group] [Cy]. The empty 'name' cell of the Eng group row
        // must not merge over Ada's name.
        const ada = bodyRows(container)[1];
        const adaName = ada.querySelector('[data-field="name"]') as HTMLElement;
        expect(adaName.className).not.toContain('ogx__cell--hidden');
        expect(adaName.textContent).toBe('Ada');
    });
});

describe('sorting by the hierarchy column x exports / clipboard', () => {
    const cols: GridColDef[] = [{ field: 'name', width: 150 }, { field: 'dept', width: 100 }, { field: 'amount', width: 100, type: 'number' }];

    it('row grouping: getGroupedExportRows orders groups like the screen', () => {
        const { container, api } = renderWithApi({ columns: cols, getRowId: byKey, rowGroupingModel: ['dept'], sortModel: [{ field: 'name', sort: 'desc' }] });
        const onScreen = bodyRows(container).map(r => (r.textContent?.includes('Ops') ? 'Ops' : 'Eng'));
        expect(onScreen).toEqual(['Ops', 'Eng']);
        const exported = api().getGroupedExportRows()!.filter(r => r.type === 'group-header').map(r => r.groupValue);
        expect(exported).toEqual(['Ops', 'Eng']);
    });

    it('tree data: getAllFilteredRows (used by copySelectedRows) orders auto-created parents like the screen', () => {
        const rows = [
            { key: '1', path: ['A', 'a1'], name: 'a1' },
            { key: '2', path: ['B', 'b1'], name: 'b1' },
        ] as unknown as GridRowModel[];
        const { container, api } = renderWithApi({
            rows, columns: [{ field: 'name', width: 150 }], getRowId: byKey, treeData: true,
            getTreeDataPath: (r: GridRowModel) => r.path as string[], defaultGroupingExpansionDepth: -1,
            sortModel: [{ field: 'name', sort: 'desc' }],
        });
        expect(rowTexts(container)).toEqual(['B (1)', 'b1', 'A (1)', 'a1']);
        expect(api().getAllFilteredRows().map(r => r.name)).toEqual(['b1', 'a1']);
    });
});

describe('getVisibleColumns x column pinning', () => {
    it('returns the columns in display order when columns are pinned', () => {
        const { container, api } = renderWithApi({ getRowId: byKey, pinnedColumns: { left: ['amount'], right: ['dept'] } });
        expect(headerFields(container)).toEqual(['amount', 'name', 'dept']);
        expect(api().getVisibleColumns().map(c => c.field)).toEqual(['amount', 'name', 'dept']);
    });

    it('matches the header under row grouping with a grouping column and a right-pinned column', () => {
        const { container, api } = renderWithApi({ getRowId: byKey, rowGroupingModel: ['dept'], groupingColDef: { headerName: 'G' }, pinnedColumns: { right: ['name'] } });
        expect(api().getVisibleColumns().map(c => c.field)).toEqual(headerFields(container));
    });
});

describe('server-side tree data x defaultGroupingExpansionDepth', () => {
    it('-1 ("everything expanded") expands lazy nodes and loads their children', async () => {
        vi.useFakeTimers();
        const getRows = vi.fn(async (p: { groupKeys?: string[] }) => {
            if (!p.groupKeys || p.groupKeys.length === 0) return { rows: [{ key: 'p', path: ['p'], name: 'P', serverChildrenCount: 1 }] as unknown as GridRowModel[], rowCount: 1 };
            return { rows: [{ key: 'c', path: ['p', 'c'], name: 'C' }] as unknown as GridRowModel[], rowCount: 1 };
        });
        const { container } = render(
            <StrictMode>
                <DataGrid rows={[]} columns={[{ field: 'name', width: 100 }]} getRowId={byKey} dataSource={{ getRows }}
                    treeData getTreeDataPath={r => r.path as string[]} defaultGroupingExpansionDepth={-1} />
            </StrictMode>
        );
        await act(async () => { await vi.advanceTimersByTimeAsync(400); });
        await act(async () => { await vi.advanceTimersByTimeAsync(400); });
        expect(getRows.mock.calls.some(c => (c[0].groupKeys ?? []).length > 0)).toBe(true);
        expect(rowTexts(container)).toEqual(['P', 'C']);
    });
});

describe('list view x row grouping', () => {
    const listViewColumn = { field: 'name', renderCell: ({ row }: { row: GridRowModel }) => <span>{String(row.name ?? '')}</span> };

    it('group rows get no selection checkbox, as in the grid view', () => {
        const { container } = render(<DataGrid rows={PEOPLE} columns={COLS} getRowId={byKey} rowGroupingModel={['dept']} checkboxSelection listView listViewColumn={listViewColumn} />);
        const rows = listRows(container);
        expect(rows).toHaveLength(2);
        expect(rows.map(r => r.querySelector('input[type="checkbox"]') !== null)).toEqual([false, false]);
    });

    it('the "N items" summary counts data rows, not visible group rows', () => {
        const { container } = render(<DataGrid rows={PEOPLE} columns={COLS} getRowId={byKey} rowGroupingModel={['dept']} listView listViewColumn={listViewColumn} />);
        expect(container.querySelector('.ogx-list-view__toolbar')?.textContent).toContain('3 items');
    });

    it('a group row shows its label when renderCell returns undefined for synthetic rows', () => {
        const { container } = render(
            <DataGrid rows={PEOPLE} columns={COLS} getRowId={byKey} rowGroupingModel={['dept']} listView
                listViewColumn={{ field: 'name', renderCell: ({ row, rowMeta }) => (rowMeta?.isGroupRow ? undefined : <span>{String(row.name)}</span>) }} />
        );
        expect(listRows(container)[0].textContent).toContain('Eng');
    });
});

describe('pivot x selection', () => {
    it('the Grand Total row cannot be selected by its checkbox or a click', () => {
        const onSel = vi.fn();
        const MODEL = { rowFields: ['dept'], columnFields: [], valueFields: [{ field: 'amount', aggFn: 'sum' as const }] };
        const { container } = render(<DataGrid rows={PEOPLE} columns={COLS} getRowId={byKey} pivotMode pivotModel={MODEL} checkboxSelection onRowSelectionModelChange={onSel} />);
        const rows = bodyRows(container);
        const grandTotal = rows[rows.length - 1];
        const checkbox = grandTotal.querySelector('input[type="checkbox"]');
        if (checkbox) fireEvent.click(checkbox);
        fireEvent.click(grandTotal.querySelector('[data-field="dept"]') as HTMLElement);
        expect(onSel.mock.calls.flatMap(c => c[0])).not.toContain('__pivot_grand_total__');
    });

    it('the Grand Total row has no checkbox and apiRef.selectRow ignores it', () => {
        const onSel = vi.fn();
        const MODEL = { rowFields: ['dept'], columnFields: [], valueFields: [{ field: 'amount', aggFn: 'sum' as const }] };
        const { container, api } = renderWithApi({ pivotMode: true, pivotModel: MODEL, checkboxSelection: true, onRowSelectionModelChange: onSel });
        const rows = bodyRows(container);
        expect(rows[rows.length - 1].querySelector('input[type="checkbox"]')).toBeNull();
        act(() => { api().selectRow('__pivot_grand_total__'); });
        expect(onSel).not.toHaveBeenCalled();
    });
});

describe('apiRef selection x synthetic rows and no-op changes', () => {
    it('selectRow / selectRows ignore group and subtotal ids', () => {
        const onSel = vi.fn();
        const { api } = renderWithApi({
            getRowId: byKey, rowGroupingModel: ['dept'], aggregationModel: { amount: 'sum' },
            getAggregationPosition: () => 'footer', defaultGroupingExpansionDepth: -1, onRowSelectionModelChange: onSel,
        });
        act(() => { api().selectRows(['auto-group-dept-Eng-root', 'auto-group-dept-Eng-root\u001ffooter']); });
        expect(onSel).not.toHaveBeenCalled();
        act(() => { api().selectRows(['auto-group-dept-Eng-root', 'a']); });
        expect(onSel.mock.calls).toEqual([[['a']]]);
    });

    it('selectRow(id, true) on a selected row reports nothing', () => {
        const onSel = vi.fn();
        const { api } = renderWithApi({ getRowId: byKey, rowSelectionModel: ['a'], onRowSelectionModelChange: onSel });
        act(() => { api().selectRow('a', true); });
        act(() => { api().selectRow('b', false); });
        expect(onSel).not.toHaveBeenCalled();
    });
});

describe('row grouping x server pagination (dataSource), request and warning', () => {
    it('asks for every row and warns once in development', async () => {
        vi.useFakeTimers();
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const getRows = vi.fn(async (_params: { startRow: number; endRow: number }) => ({ rows: PEOPLE, rowCount: 3 }));
        render(
            <DataGrid rows={[]} columns={COLS} getRowId={byKey} dataSource={{ getRows }} rowGroupingModel={['dept']}
                pagination paginationMode="server" paginationModel={{ page: 0, pageSize: 2 }} pageSizeOptions={[2]} />
        );
        await act(async () => { await vi.advanceTimersByTimeAsync(400); });
        expect(getRows.mock.calls.map(c => [c[0].startRow, c[0].endRow])).toEqual([[0, Number.MAX_SAFE_INTEGER]]);
        expect(warn.mock.calls.filter(c => String(c[0]).includes("paginationMode: 'server'"))).toHaveLength(1);
    });
});

describe('row spanning x row grouping, across a group boundary', () => {
    it('a leaf span ends before the next group row', () => {
        const cols: GridColDef[] = [
            { field: 'dept', width: 100 },
            { field: 'name', width: 100, rowSpan: ({ row }) => (row.name === 'Bo' ? 3 : 1) },
        ];
        const { container } = render(
            <DataGrid rows={PEOPLE} columns={cols} getRowId={byKey} rowGroupingModel={['dept']} defaultGroupingExpansionDepth={-1} />
        );
        // Rows: [Eng group] [Ada] [Bo] [Ops group] [Cy]
        const rows = bodyRows(container);
        const nameCell = (index: number) => rows[index].querySelector('[data-field="name"]') as HTMLElement;
        expect(nameCell(3).className).not.toContain('ogx__cell--hidden');
        expect(nameCell(4).className).not.toContain('ogx__cell--hidden');
        expect(nameCell(4).textContent).toBe('Cy');
    });
});

describe('tree data x filter x getAllFilteredRows', () => {
    it('returns the rows that match the filter, not the ancestors shown for context', () => {
        const rows = [
            { key: 'p', path: ['P'], name: 'parent' },
            { key: 'c', path: ['P', 'C'], name: 'child' },
        ] as unknown as GridRowModel[];
        const { container, api } = renderWithApi({
            rows, columns: [{ field: 'name', width: 150 }], getRowId: byKey, treeData: true,
            getTreeDataPath: (r: GridRowModel) => r.path as string[], defaultGroupingExpansionDepth: -1,
            filterModel: { items: [{ field: 'name', operator: 'equals', value: 'child' }] },
        });
        expect(rowTexts(container).join('|')).toContain('child');
        expect(api().getAllFilteredRows().map(r => r.name)).toEqual(['child']);
    });
});

describe('slots.footer rowCount', () => {
    it('is the pager count: filtered rows without the pinned ones', () => {
        const seen: number[] = [];
        function Footer({ rowCount }: { rowCount: number }) {
            seen.push(rowCount);
            return null;
        }
        render(<DataGrid rows={PEOPLE} columns={COLS} getRowId={byKey} pinnedRows={{ top: ['a'] }} slots={{ footer: Footer }} />);
        expect(seen[seen.length - 1]).toBe(2);
    });
});
