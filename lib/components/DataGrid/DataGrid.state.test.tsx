import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { useEffect, useState } from 'react';
import { DataGrid } from './DataGrid';
import { GridToolbar } from '../Toolbar/GridToolbar';
import { useGridStateStorage } from '../../state/useGridStateStorage';
import type { GridState } from '../../state/types';
import type { GridColDef, GridDataSource, GridFilterModel, GridRowModel } from '../../types';

const COLS: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age', headerName: 'Age', width: 100, type: 'number' },
];
const ROWS: GridRowModel[] = [
    { id: 1, name: 'Carol', age: 30 },
    { id: 2, name: 'Alice', age: 25 },
    { id: 3, name: 'Bob', age: 40 },
];
const BOB: GridFilterModel = { items: [{ field: 'name', operator: 'equals', value: 'Bob' }] };

const cellTexts = (container: HTMLElement, col = 0) =>
    Array.from(container.querySelectorAll('.ogx__row')).map(r => r.querySelectorAll('[role="gridcell"]')[col]?.textContent ?? '');

afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('uncontrolled filter state', () => {
    it('applies initialState.filter', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} initialState={{ filter: { filterModel: BOB } }} />);
        expect(cellTexts(container)).toEqual(['Bob']);
    });

    it('lets the toolbar search filter the grid without a filterModel prop', async () => {
        const onFilterModelChange = vi.fn();
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} slots={{ toolbar: GridToolbar }} onFilterModelChange={onFilterModelChange} />
        );
        const search = container.querySelector('input[aria-label="Global Search"]') as HTMLInputElement;
        expect(search).toBeTruthy();
        fireEvent.change(search, { target: { value: 'Alice' } });
        await act(async () => { await new Promise(r => setTimeout(r, 300)); });
        expect(onFilterModelChange).toHaveBeenCalled();
        expect(cellTexts(container)).toEqual(['Alice']);
    });

    it('shows the toolbar search and filter button with no filter props at all', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} slots={{ toolbar: GridToolbar }} />);
        expect(container.querySelector('input[aria-label="Global Search"]')).toBeTruthy();
        expect(container.querySelector('button[aria-label="Advanced filters"]')).toBeTruthy();
    });

    it('refetches from a server-filtered dataSource when the toolbar filter changes', async () => {
        const getRows = vi.fn(async () => ({ rows: ROWS, rowCount: 3 }));
        const ds: GridDataSource = { getRows };
        const EMPTY: GridRowModel[] = [];
        const { container } = render(<DataGrid rows={EMPTY} columns={COLS} dataSource={ds} filterMode="server" slots={{ toolbar: GridToolbar }} />);
        await act(async () => { await new Promise(r => setTimeout(r, 400)); });
        const calls = getRows.mock.calls.length;
        fireEvent.change(container.querySelector('input[aria-label="Global Search"]') as HTMLInputElement, { target: { value: 'Bob' } });
        // Search debounce, then the dataSource's own fetch delay (each act flushes the render it triggered).
        await act(async () => { await new Promise(r => setTimeout(r, 300)); });
        await act(async () => { await new Promise(r => setTimeout(r, 400)); });
        expect(getRows.mock.calls.length).toBeGreaterThan(calls);
        const lastParams = getRows.mock.lastCall as unknown as [{ filterModel: GridFilterModel }];
        expect(lastParams[0].filterModel.quickFilterValues).toEqual(['Bob']);
    });

    it('round-trips a filter through useGridStateStorage', async () => {
        const m = new Map<string, string>();
        const storage = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, removeItem: (k: string) => { m.delete(k); } };
        function Persisted({ filter }: { filter?: GridFilterModel }) {
            const { initialState, onStateChange } = useGridStateStorage({ key: 'grid', storage, debounceMs: 0 });
            return <DataGrid rows={ROWS} columns={COLS} initialState={initialState} onStateChange={onStateChange} filterModel={filter} />;
        }
        const first = render(<Persisted filter={BOB} />);
        await act(async () => { await new Promise(r => setTimeout(r, 20)); });
        first.unmount();
        expect((JSON.parse(m.get('grid')!) as GridState).filter?.filterModel).toEqual(BOB);

        const second = render(<Persisted />);
        expect(cellTexts(second.container)).toEqual(['Bob']);
    });
});

describe('committing an edit', () => {
    const EDIT_COLS: GridColDef[] = [
        { field: 'name', headerName: 'Name', width: 150, editable: true },
        { field: 'qty', headerName: 'Qty', width: 100, type: 'number', editable: true },
    ];

    async function editQty(container: HTMLElement, rowIndex: number, value: string) {
        const cell = container.querySelectorAll('.ogx__row')[rowIndex].querySelectorAll('[role="gridcell"]')[1] as HTMLElement;
        fireEvent.doubleClick(cell);
        const input = container.querySelector('.ogx__row input:not([type="checkbox"])') as HTMLInputElement;
        fireEvent.change(input, { target: { value } });
        await act(async () => {
            fireEvent.keyDown(input, { key: 'Enter' });
            await new Promise(r => setTimeout(r, 10));
        });
    }

    it('keeps other row changes the parent made inside processRowUpdate', async () => {
        function Parent() {
            const [rows, setRows] = useState<GridRowModel[]>([
                { id: 1, name: 'a', qty: 1 },
                { id: 2, name: 'b', qty: 2 },
                { id: 'total', name: 'TOTAL', qty: 3 },
            ]);
            const processRowUpdate = (newRow: GridRowModel) => {
                setRows(prev => {
                    const next = prev.map(r => (r.id === newRow.id ? newRow : r));
                    const total = next.filter(r => r.id !== 'total').reduce((s, r) => s + Number(r.qty), 0);
                    return next.map(r => (r.id === 'total' ? { ...r, qty: total } : r));
                });
                return newRow;
            };
            return <DataGrid rows={rows} columns={EDIT_COLS} processRowUpdate={processRowUpdate} />;
        }
        const { container } = render(<Parent />);
        await editQty(container, 0, '10');
        expect(cellTexts(container, 1)).toEqual(['10', '2', '12']);
    });

    it('keeps rows that arrive while an async processRowUpdate is pending', async () => {
        const controls = { resolve: () => {}, addRow: () => {} };
        function Parent() {
            const [rows, setRows] = useState<GridRowModel[]>([{ id: 1, name: 'a', qty: 1 }]);
            useEffect(() => { controls.addRow = () => setRows(prev => [...prev, { id: 2, name: 'b', qty: 2 }]); });
            const processRowUpdate = (newRow: GridRowModel) => new Promise<GridRowModel>(r => { controls.resolve = () => r(newRow); });
            return <DataGrid rows={rows} columns={EDIT_COLS} processRowUpdate={processRowUpdate} />;
        }
        const { container } = render(<Parent />);
        const cell = container.querySelectorAll('.ogx__row')[0].querySelectorAll('[role="gridcell"]')[1] as HTMLElement;
        fireEvent.doubleClick(cell);
        const input = container.querySelector('.ogx__row input:not([type="checkbox"])') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '5' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        act(() => { controls.addRow(); });
        await act(async () => { controls.resolve(); await new Promise(r => setTimeout(r, 10)); });
        expect(cellTexts(container, 1)).toEqual(['5', '2']);
    });

    it('does not reset the server row count', async () => {
        const ds: GridDataSource = { getRows: async () => ({ rows: [{ id: 1, name: 'a', qty: 1 }, { id: 2, name: 'b', qty: 2 }], rowCount: 1000 }) };
        const EMPTY: GridRowModel[] = [];
        const { container } = render(
            <DataGrid rows={EMPTY} columns={EDIT_COLS} dataSource={ds} pagination paginationMode="server"
                pageSizeOptions={[2]} initialState={{ pagination: { paginationModel: { page: 0, pageSize: 2 } } }} />
        );
        await act(async () => { await new Promise(r => setTimeout(r, 400)); });
        expect(container.querySelector('.ogx-pagination')?.textContent).toContain('of 1000');
        await editQty(container, 0, '7');
        expect(cellTexts(container, 1)[0]).toBe('7');
        expect(container.querySelector('.ogx-pagination')?.textContent).toContain('1–2 of 1000');
    });
});

describe('pivot mode', () => {
    const SALES: GridRowModel[] = [
        { id: 1, dept: 'Eng', region: 'US', salary: 10 },
        { id: 2, dept: 'HR', region: 'EU', salary: 20 },
        // Three source rows, two pivot rows: the header must not compare against the source row count.
        { id: 3, dept: 'Eng', region: 'EU', salary: 5 },
    ];
    const SALES_COLS: GridColDef[] = [{ field: 'dept' }, { field: 'region' }, { field: 'salary', type: 'number' }];
    const PIVOT = { rowFields: ['dept'], columnFields: ['region'], valueFields: [{ field: 'salary', aggFn: 'sum' as const }] };
    const headerFields = (container: HTMLElement) =>
        Array.from(container.querySelectorAll('[role="columnheader"][data-field]')).map(h => h.getAttribute('data-field'));

    it('select-all selects the pivot rows, not the grand total, and the header reflects them', () => {
        const onSel = vi.fn();
        function Parent() {
            const [sel, setSel] = useState<GridRowModel['id'][]>([]);
            return <DataGrid rows={SALES} columns={SALES_COLS} pivotMode pivotModel={PIVOT} checkboxSelection
                rowSelectionModel={sel} onRowSelectionModelChange={(m) => { onSel(m); setSel(m); }} />;
        }
        const { container } = render(<Parent />);
        const header = () => container.querySelector('input[aria-label$="all rows"]') as HTMLInputElement;
        fireEvent.click(header());
        const selected = onSel.mock.lastCall![0] as GridRowModel['id'][];
        expect(selected.length).toBe(2);
        expect(selected.map(String).some(id => id.toLowerCase().includes('total'))).toBe(false);
        expect(header().checked).toBe(true);
    });

    it('the toolbar reorders the generated columns even with a controlled columnOrder', () => {
        const Toolbar = vi.fn((_props: Record<string, unknown>) => null);
        const { container } = render(
            <DataGrid rows={SALES} columns={SALES_COLS} pivotMode pivotModel={PIVOT}
                columnOrder={['salary', 'region', 'dept']} slots={{ toolbar: Toolbar }} />
        );
        const before = headerFields(container);
        expect(before.length).toBeGreaterThan(2);
        const reorder = Toolbar.mock.lastCall![0].onColumnReorder as (from: string, to: string) => void;
        act(() => { reorder(before[before.length - 1]!, before[0]!); });
        expect(headerFields(container)[0]).toBe(before[before.length - 1]);
    });
});

describe('duplicate row ids', () => {
    it('renders each id once, keeps the first row and warns', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const rows: GridRowModel[] = [{ id: 1, name: 'a', age: 1 }, { id: 1, name: 'b', age: 2 }, { id: 2, name: 'c', age: 3 }];
        const { container } = render(<DataGrid rows={rows} columns={COLS} />);
        expect(cellTexts(container)).toEqual(['a', 'c']);
        const duplicateWarnings = warn.mock.calls.filter(call => String(call[0]).includes('reuse the id'));
        expect(duplicateWarnings).toHaveLength(1);
    });
});
