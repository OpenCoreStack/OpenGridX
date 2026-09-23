import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DataGrid } from '../DataGrid/DataGrid';
import type { GridColDef, GridDetailPanelParams, GridRowModel } from '../../types';

type Row = GridRowModel & { id: number; name: string; city: string; orders: { n: number }[] };
const ROWS: Row[] = [
    { id: 1, name: 'Ann', city: 'Oslo', orders: [{ n: 1 }] },
    { id: 2, name: 'Bob', city: 'Rome', orders: [{ n: 2 }, { n: 3 }] },
    { id: 3, name: 'Cid', city: 'Rome', orders: [] },
];
const toggles = () => Array.from(document.querySelectorAll<HTMLElement>('[aria-label="Expand row details"] .ogx-expand-icon'));

const COLS: GridColDef<Row>[] = [
    { field: 'name', headerName: 'Name', width: 120 },
    { field: 'city', headerName: 'City', width: 120 },
];

describe('detail panel callbacks', () => {
    it('does not call getDetailPanelContent or getDetailPanelHeight for collapsed rows', () => {
        const content = vi.fn(() => <div>detail</div>);
        const height = vi.fn(() => 100);
        render(<DataGrid rows={ROWS} columns={COLS} getDetailPanelContent={content} getDetailPanelHeight={height} />);
        expect(content).not.toHaveBeenCalled();
        expect(height).not.toHaveBeenCalled();
    });

    it('calls them only for the row that is expanded', () => {
        const content = vi.fn(({ row }: GridDetailPanelParams<Row>) => <div>{row.orders.length} orders</div>);
        render(<DataGrid rows={ROWS} columns={COLS} getDetailPanelContent={content} />);
        fireEvent.click(toggles()[1]);
        expect(screen.getByText('2 orders')).toBeTruthy();
        expect(new Set(content.mock.calls.map(([p]) => p.id))).toEqual(new Set([2]));
    });

    it('never calls them for row-grouping group rows, which get no toggle', () => {
        const content = vi.fn(({ row }: GridDetailPanelParams<Row>) => <div>{row.orders.length} orders</div>);
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} rowGroupingModel={['city']} defaultGroupingExpansionDepth={-1} getDetailPanelContent={content} />
        );
        const groupRows = Array.from(container.querySelectorAll<HTMLElement>('.ogx__row--group'));
        expect(groupRows.length).toBeGreaterThan(0);
        for (const groupRow of groupRows) {
            expect(within(groupRow).queryByLabelText('Expand row details')).toBeNull();
        }
        // Leaf rows still have a working toggle
        fireEvent.click(toggles()[0]);
        expect(content).toHaveBeenCalled();
        expect(content.mock.calls.every(([p]) => typeof p.row.name === 'string' && Array.isArray(p.row.orders))).toBe(true);
    });

    it('ignores a controlled expanded id that names a group row', () => {
        const content = vi.fn(() => <div>detail</div>);
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} rowGroupingModel={['city']} getDetailPanelContent={content}
                detailPanelExpandedRowIds={new Set(['auto-group-city-Rome-root'])} />
        );
        expect(container.querySelector('.ogx__row--group')).not.toBeNull();
        expect(container.querySelectorAll('.ogx__detail-panel')).toHaveLength(0);
        expect(content).not.toHaveBeenCalled();
    });

    it('contains a throwing getDetailPanelContent to its panel', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        render(<DataGrid rows={ROWS} columns={COLS} getDetailPanelContent={() => { throw new Error('boom'); }} />);
        fireEvent.click(toggles()[0]);
        expect(screen.getByText('Ann')).toBeTruthy();
        expect(screen.getByLabelText('Error in cell: detail panel')).toBeTruthy();
        warn.mockRestore();
        error.mockRestore();
    });
});
