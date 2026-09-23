import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useEffect } from 'react';
import { DataGrid } from './DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import { GridToolbar } from '../Toolbar/GridToolbar';
import type { GridColDef, GridDataSource, GridPivotModel, GridRowModel } from '../../types';

type GridApiRef = ReturnType<typeof useGridApiRef>;

const COLS: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 100 },
    { field: 'dept', headerName: 'Dept', width: 110 },
    { field: 'salary', headerName: 'Salary', width: 130, type: 'number' },
];
const ROWS: GridRowModel[] = [
    { id: 1, name: 'a', dept: 'Eng', salary: 1000, path: ['a'] },
    { id: 2, name: 'b', dept: 'Eng', salary: 2000, path: ['a', 'b'] },
    { id: 3, name: 'c', dept: 'HR', salary: 3500, path: ['c'] },
    { id: 4, name: 'd', dept: 'Ops', salary: 500, path: ['d'] },
];
const MODEL: GridPivotModel = { rowFields: ['dept'], columnFields: [], valueFields: [{ field: 'salary', aggFn: 'sum' }] };
const SUM = 'salary\u001fsum';

const column = (c: HTMLElement, field: string) =>
    Array.from(c.querySelectorAll(`[role="gridcell"][data-field="${field}"]`)).map(e => e.textContent);
const headers = (c: HTMLElement) =>
    Array.from(c.querySelectorAll('[role="columnheader"][data-field]')).map(h => h.getAttribute('data-field'));

afterEach(() => { vi.restoreAllMocks(); });

describe('pivot mode — Grand Total row', () => {
    it('stays last when a value column is sorted', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} pivotMode pivotModel={MODEL} sortModel={[{ field: SUM, sort: 'desc' }]} />
        );
        expect(column(container, 'dept')).toEqual(['HR', 'Eng', 'Ops', 'Grand Total']);
        expect(column(container, SUM)).toEqual(['3,500', '3,000', '500', '7,000']);
    });

    it('is left out of select-all', () => {
        const onSelection = vi.fn();
        render(<DataGrid rows={ROWS} columns={COLS} pivotMode pivotModel={MODEL} checkboxSelection onRowSelectionModelChange={onSelection} />);
        fireEvent.click(screen.getByLabelText('Select all rows'));
        expect(onSelection).toHaveBeenLastCalledWith([0, 1, 2]);
    });

    it('is not rendered, and the no-rows overlay is, when there are no source rows', () => {
        const { container } = render(<DataGrid rows={[]} columns={COLS} pivotMode pivotModel={MODEL} />);
        expect(headers(container)).toEqual(['dept', SUM]);
        expect(column(container, 'dept')).toEqual([]);
        expect(container.querySelector('.ogx__empty')).not.toBeNull();
    });
});

describe('pivot mode — rows and ids', () => {
    it('ignores the consumer getRowId, which cannot read synthetic pivot rows', () => {
        const rows = ROWS.map(({ id, ...r }) => ({ ...r, empId: id }));
        const { container } = render(
            <DataGrid rows={rows as unknown as GridRowModel[]} columns={COLS} pivotMode pivotModel={MODEL}
                getRowId={(r) => (r as unknown as { empId: number }).empId} />
        );
        expect(column(container, 'dept')).toEqual(['Eng', 'HR', 'Ops', 'Grand Total']);
    });

    it('renders with a source valueFormatter that reads other row fields', () => {
        const cols: GridColDef[] = [
            ...COLS.slice(0, 2),
            { field: 'salary', type: 'number', valueFormatter: ({ value, row }) => `${(row as unknown as { cur: { s: string } }).cur.s}${String(value)}` },
        ];
        const rows: GridRowModel[] = ROWS.map(r => ({ ...r, cur: { s: '$' } }));
        const { container } = render(<DataGrid rows={rows} columns={cols} pivotMode pivotModel={MODEL} />);
        expect(column(container, SUM)).toEqual(['$3000', '$3500', '$500', '$7000']);
    });
});

describe('pivot mode — filtering', () => {
    it('applies a filter on a source field to the source rows before pivoting', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} pivotMode pivotModel={MODEL}
                filterModel={{ items: [{ field: 'name', operator: 'equals', value: 'a' }] }} />
        );
        expect(column(container, 'dept')).toEqual(['Eng', 'Grand Total']);
        expect(column(container, SUM)).toEqual(['1,000', '1,000']);
    });

    it('applies the quick filter to the source rows', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} pivotMode pivotModel={MODEL} filterModel={{ items: [], quickFilterValues: ['b'] }} />
        );
        expect(column(container, SUM)).toEqual(['2,000', '2,000']);
    });

    it('applies a filter on a generated value column to the pivot rows and totals what is shown', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} pivotMode pivotModel={MODEL}
                filterModel={{ items: [{ field: SUM, operator: '>=', value: 1000 }] }} />
        );
        expect(column(container, 'dept')).toEqual(['Eng', 'HR', 'Grand Total']);
        expect(column(container, SUM)).toEqual(['3,000', '3,500', '6,500']);
    });
});

describe('pivot mode — interaction with other features', () => {
    it('turns tree data off instead of crashing on synthetic rows', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} pivotMode pivotModel={MODEL} treeData getTreeDataPath={(r) => (r as unknown as { path: string[] }).path} />
        );
        expect(column(container, 'dept')).toEqual(['Eng', 'HR', 'Ops', 'Grand Total']);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('pivotMode'));
    });

    it('turns row grouping off instead of regrouping the pivot output', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} pivotMode pivotModel={MODEL} rowGroupingModel={['dept']} />);
        expect(column(container, SUM)).toEqual(['3,000', '3,500', '500', '7,000']);
    });

    it('is not applied to a dataSource grid, which shows its server rows and warns', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const ds: GridDataSource<GridRowModel> = { getRows: async () => ({ rows: ROWS, rowCount: ROWS.length }) };
        let container!: HTMLElement;
        await act(async () => {
            ({ container } = render(<DataGrid rows={[]} columns={COLS} pivotMode pivotModel={MODEL} dataSource={ds} paginationMode="server" />));
        });
        await act(async () => { await new Promise(r => setTimeout(r, 400)); });
        expect(headers(container)).toEqual(['name', 'dept', 'salary']);
        expect(column(container, 'dept')).toEqual(['Eng', 'Eng', 'HR', 'Ops']);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('dataSource'));
    });

    it('does not report footer aggregation computed over pivot rows', () => {
        let api: GridApiRef | null = null;
        const Footer = vi.fn((props: Record<string, unknown>) => <div data-testid="footer">{JSON.stringify(props.aggregationResult)}</div>);
        function Harness() {
            const apiRef = useGridApiRef();
            useEffect(() => { api = apiRef; }, [apiRef]);
            return <DataGrid apiRef={apiRef} rows={ROWS} columns={COLS} pivotMode pivotModel={MODEL} aggregationModel={{ salary: 'sum' }} slots={{ footer: Footer }} />;
        }
        render(<Harness />);
        expect(api!.current.getAggregationResult()).toBeNull();
        expect(screen.getByTestId('footer')).toHaveTextContent('null');
    });

    it('does not offer generated pivot columns in the toolbar Summaries panel', () => {
        render(<DataGrid rows={ROWS} columns={COLS} pivotMode pivotModel={MODEL} slots={{ toolbar: GridToolbar }} />);
        fireEvent.click(screen.getByLabelText('Configure summaries'));
        const panel = screen.getByRole('dialog', { name: 'Summaries configuration' });
        expect(panel.textContent).not.toContain('Salary (sum)');
    });

    it('keeps the row-label column visible when the source column is hidden', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} pivotMode pivotModel={MODEL} columnVisibilityModel={{ dept: false }} />);
        expect(headers(container)).toEqual(['dept', SUM]);
    });

    it('still hides a hidden generated value column', () => {
        const model: GridPivotModel = { ...MODEL, valueFields: [{ field: 'salary', aggFn: 'sum' }, { field: 'salary', aggFn: 'max' }] };
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} pivotMode pivotModel={model} columnVisibilityModel={{ [SUM]: false }} />);
        expect(headers(container)).toEqual(['dept', 'salary\u001fmax']);
    });
});

describe('pivot mode — column order', () => {
    it('restores the pre-pivot column order after leaving pivot mode', () => {
        const model: GridPivotModel = { rowFields: ['salary'], columnFields: [], valueFields: [{ field: 'dept', aggFn: 'count' }] };
        const Wrap = ({ pivot }: { pivot: boolean }) => <DataGrid rows={ROWS} columns={COLS} pivotMode={pivot} pivotModel={model} />;
        const { container, rerender } = render(<Wrap pivot={false} />);
        const before = headers(container);
        rerender(<Wrap pivot />);
        expect(headers(container)).toEqual(['salary', 'dept\u001fcount']);
        rerender(<Wrap pivot={false} />);
        expect(headers(container)).toEqual(before);
    });

    it('keeps the generated order when a controlled columnOrder is set', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} pivotMode pivotModel={MODEL} columnOrder={['name', 'salary', 'dept']} />
        );
        expect(headers(container)).toEqual(['dept', SUM]);
    });
});
