import { describe, it, expect, vi } from 'vitest';
import { render, act, fireEvent } from '@testing-library/react';
import { useEffect } from 'react';
import { DataGrid } from './DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import { exportToCsv } from '../../utils/export';
import { pickSelectedRows } from '../../utils/export/exportShared';
import type { DataGridProps, GridApi, GridColDef, GridRowModel } from '../../types';

// `id` is a meaningful but non-unique field; `sku` is the unique key.
type Line = GridRowModel & { sku: string; qty: number };
const LINES: Line[] = [
    { id: 7, sku: 'A', qty: 1 },
    { id: 7, sku: 'B', qty: 2 },
];
const COLS: GridColDef[] = [
    { field: 'id', headerName: 'Line', width: 100 },
    { field: 'sku', headerName: 'SKU', width: 100 },
    { field: 'qty', headerName: 'Qty', width: 100, type: 'number', editable: true },
];
const bySku = (row: GridRowModel) => row.sku as string;

const cellTexts = (container: HTMLElement, field: string) =>
    Array.from(container.querySelectorAll('.ogx__row')).map(r => r.querySelector(`[data-field="${field}"]`)?.textContent ?? '');

function renderWithApi(extra: Partial<DataGridProps> = {}, rows: GridRowModel[] = LINES) {
    const out: { api: GridApi | null } = { api: null };
    function Harness() {
        const apiRef = useGridApiRef();
        useEffect(() => { out.api = apiRef.current; });
        return <DataGrid rows={rows} columns={COLS} getRowId={bySku} apiRef={apiRef} {...extra} />;
    }
    const utils = render(<Harness />);
    return { ...utils, api: () => out.api! };
}

describe('getRowId only decides the internal key', () => {
    it('leaves the consumer\'s own id field alone', () => {
        const { container, api } = renderWithApi();
        expect(cellTexts(container, 'id')).toEqual(['7', '7']);
        expect(api().getAllRows()).toEqual(LINES);
        expect(api().getAllRows()[0]).toBe(LINES[0]);
        expect(api().getRow('B')).toBe(LINES[1]);
    });

    it('passes the consumer\'s row objects to events, keyed by getRowId', () => {
        const onRowClick = vi.fn();
        const { container } = renderWithApi({ onRowClick });
        fireEvent.click(container.querySelectorAll('.ogx__row')[1].querySelector('[data-field="sku"]') as HTMLElement);
        expect(onRowClick).toHaveBeenCalledTimes(1);
        expect(onRowClick.mock.lastCall![0].row).toBe(LINES[1]);
        expect(onRowClick.mock.lastCall![0].id).toBe('B');
    });

    it('selects, pins and expands rows by their getRowId key', () => {
        const onRowSelectionModelChange = vi.fn();
        const { container, api } = renderWithApi({
            checkboxSelection: true,
            onRowSelectionModelChange,
            pinnedRows: { top: ['B'] },
            getDetailPanelContent: ({ id }) => <div className="detail">detail {String(id)}</div>,
        });
        expect(cellTexts(container, 'sku')[0]).toBe('B'); // pinned row renders first
        const firstRowCheckbox = container.querySelector('.ogx__row input[type="checkbox"]') as HTMLInputElement;
        fireEvent.click(firstRowCheckbox);
        expect(onRowSelectionModelChange).toHaveBeenLastCalledWith(['B']);
        expect(api().getSelectedRows()).toEqual(['B']);
        fireEvent.click(container.querySelector('.ogx__row .ogx-expand-icon') as HTMLElement);
        expect(container.querySelector('.detail')?.textContent).toBe('detail B');
    });

    it('hands processRowUpdate the consumer\'s row shape and applies the result', async () => {
        const processRowUpdate = vi.fn((newRow: GridRowModel, _oldRow: GridRowModel) => newRow);
        const { container } = renderWithApi({ processRowUpdate });
        const qtyCell = container.querySelectorAll('.ogx__row')[1].querySelector('[data-field="qty"]') as HTMLElement;
        fireEvent.doubleClick(qtyCell);
        const input = container.querySelector('.ogx__row input:not([type="checkbox"])') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '9' } });
        await act(async () => {
            fireEvent.keyDown(input, { key: 'Enter' });
            await new Promise(r => setTimeout(r, 10));
        });
        const [newRow, oldRow] = processRowUpdate.mock.lastCall!;
        expect(oldRow).toBe(LINES[1]);
        expect(newRow).toEqual({ id: 7, sku: 'B', qty: 9 });
        expect(cellTexts(container, 'sku')).toEqual(['A', 'B']);
        expect(cellTexts(container, 'qty')).toEqual(['1', '9']);
    });

    it('keeps an edited row under its id even when processRowUpdate returns a row without the key', async () => {
        const processRowUpdate = (newRow: GridRowModel) => ({ qty: newRow.qty }) as unknown as GridRowModel;
        const { container, api } = renderWithApi({ processRowUpdate, checkboxSelection: true });
        const qtyCell = container.querySelectorAll('.ogx__row')[0].querySelector('[data-field="qty"]') as HTMLElement;
        fireEvent.doubleClick(qtyCell);
        const input = container.querySelector('.ogx__row input:not([type="checkbox"])') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '4' } });
        await act(async () => {
            fireEvent.keyDown(input, { key: 'Enter' });
            await new Promise(r => setTimeout(r, 10));
        });
        expect(cellTexts(container, 'qty')).toEqual(['4', '2']);
        expect(api().getRow('A')).toEqual({ qty: 4 });
        act(() => { api().selectRow('A'); });
        expect(container.querySelectorAll('.ogx__row--selected')).toHaveLength(1);
    });

    it('works for rows that have no id field at all', () => {
        const rows = [{ sku: 'A', name: 'a' }, { sku: 'B', name: 'b' }] as unknown as GridRowModel[];
        const cols: GridColDef[] = [{ field: 'name', width: 100 }];
        const { container, api } = renderWithApi({ columns: cols, checkboxSelection: true }, rows);
        expect(cellTexts(container, 'name')).toEqual(['a', 'b']);
        act(() => { api().selectRow('B'); });
        expect(container.querySelectorAll('.ogx__row--selected')).toHaveLength(1);
        expect(api().getAllRows()[0]).not.toHaveProperty('id');
    });

    it('expands tree data nodes keyed by getRowId', () => {
        const rows = [
            { key: 'p', path: ['P'], name: 'parent' },
            { key: 'c', path: ['P', 'C'], name: 'child' },
        ] as unknown as GridRowModel[];
        const { container } = render(
            <DataGrid rows={rows} columns={[{ field: 'name', width: 150 }]} getRowId={(r) => r.key as string}
                treeData getTreeDataPath={(r) => r.path as string[]} />
        );
        expect(container.querySelectorAll('.ogx__row')).toHaveLength(1);
        // Tree-data parents are real rows: a row click selects them, the chevron expands them.
        fireEvent.click(container.querySelector('.ogx__row .ogx-expand-icon') as HTMLElement);
        expect(container.querySelectorAll('.ogx__row')).toHaveLength(2);
    });

    it('does not apply a source-row getRowId to pivot rows', () => {
        const rows = [
            { key: 1, dept: 'Eng', salary: 1 },
            { key: 2, dept: 'HR', salary: 2 },
        ] as unknown as GridRowModel[];
        const { container } = render(
            <DataGrid rows={rows} columns={[{ field: 'dept' }, { field: 'salary', type: 'number' }]}
                getRowId={(r) => r.key as number}
                pivotMode pivotModel={{ rowFields: ['dept'], columnFields: [], valueFields: [{ field: 'salary', aggFn: 'sum' }] }} />
        );
        expect(container.querySelectorAll('.ogx__row').length).toBeGreaterThanOrEqual(2);
    });
});

describe('exports with getRowId', () => {
    it('pick selected rows by the grid\'s getRowId', () => {
        expect(pickSelectedRows(LINES, ['B'], bySku)).toEqual([LINES[1]]);
        expect(pickSelectedRows(LINES, ['B'])).toEqual([]);
    });

    it('exportToCsv honors getRowId for selectedRows', () => {
        const blobs: Blob[] = [];
        const createObjectURL = vi.fn((b: Blob) => { blobs.push(b); return 'blob:x'; });
        const revokeObjectURL = vi.fn();
        Object.assign(URL, { createObjectURL, revokeObjectURL });
        exportToCsv(LINES, COLS, { selectedRows: ['B'], getRowId: bySku, bom: false });
        expect(blobs).toHaveLength(1);
        return blobs[0].text().then(text => {
            expect(text).toContain('B');
            expect(text).not.toContain('A,');
        });
    });
});
