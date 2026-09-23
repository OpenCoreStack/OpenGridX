import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridRowId, GridDetailPanelParams } from '../../types';

type Row = { id: number; name: string };
const ROWS: Row[] = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }];
const COLS: GridColDef<Row>[] = [{ field: 'name', width: 100 }];
const EXPANDED = new Set<GridRowId>([1]);

const panelHeight = (getDetailPanelHeight?: () => number | 'auto') => {
    const { container } = render(
        <DataGrid<Row> rows={ROWS} columns={COLS} rowHeight={40} getDetailPanelContent={() => <div>detail</div>}
            getDetailPanelHeight={getDetailPanelHeight} detailPanelExpandedRowIds={EXPANDED} />,
    );
    const panel = container.querySelector<HTMLElement>('.ogx__detail-panel')!;
    const layoutHeight = parseFloat(container.querySelector<HTMLElement>('.ogx__virtual-container')!.style.height) - 2 * 40 - 2;
    return { rendered: panel.style.height, layoutHeight };
};

describe('DataGrid detail panel height', () => {
    it('renders and lays out a panel height of 0 the same way', () => {
        expect(panelHeight(() => 0)).toEqual({ rendered: '0px', layoutHeight: 0 });
    });

    it('renders and lays out a numeric height the same way', () => {
        expect(panelHeight(() => 120)).toEqual({ rendered: '120px', layoutHeight: 120 });
    });

    it('defaults to a fixed 200px panel when getDetailPanelHeight is omitted', () => {
        expect(panelHeight()).toEqual({ rendered: '200px', layoutHeight: 200 });
    });

    it('renders an "auto" panel at its content height', () => {
        expect(panelHeight(() => 'auto').rendered).toBe('auto');
    });
});

describe('DataGrid detail panel callbacks', () => {
    type OrderRow = { id: number; region: string; name: string; orders: number[] };
    const ORDER_ROWS: OrderRow[] = [
        { id: 1, region: 'N', name: 'a', orders: [1, 2] },
        { id: 2, region: 'S', name: 'b', orders: [3] },
    ];
    const ORDER_COLS: GridColDef<OrderRow>[] = [{ field: 'region' }, { field: 'name' }];

    it('does not call getDetailPanelContent or getDetailPanelHeight for collapsed rows', () => {
        const content = vi.fn(({ row }: GridDetailPanelParams<OrderRow>) => <div>{row.orders.length} orders</div>);
        const height = vi.fn((_params: GridDetailPanelParams<OrderRow>) => 100);
        const { container } = render(
            <DataGrid<OrderRow> rows={ORDER_ROWS} columns={ORDER_COLS} getDetailPanelContent={content} getDetailPanelHeight={height} />,
        );
        expect(content).not.toHaveBeenCalled();
        expect(height).not.toHaveBeenCalled();

        fireEvent.click(container.querySelectorAll<HTMLElement>('.ogx__cell--expand .ogx-expand-icon')[0]);
        expect(container.querySelector('.ogx__detail-panel')?.textContent).toBe('2 orders');
        expect(content.mock.calls.every(([p]) => p.id === 1)).toBe(true);
        expect(height.mock.calls.every(([p]) => p.id === 1)).toBe(true);
    });

    it('never passes synthetic group rows to the callbacks and gives them no expand toggle', () => {
        const content = vi.fn(({ row }: GridDetailPanelParams<OrderRow>) => <div>{row.orders.length} orders</div>);
        const { container } = render(
            <DataGrid<OrderRow>
                rows={ORDER_ROWS}
                columns={ORDER_COLS}
                rowGroupingModel={['region']}
                defaultGroupingExpansionDepth={-1}
                getDetailPanelContent={content}
                detailPanelExpandedRowIds={new Set<GridRowId>(['auto-group-region-N-root', 1])}
            />,
        );
        const groupRow = container.querySelector<HTMLElement>('.ogx__row--group')!;
        expect(groupRow.querySelector('.ogx__cell--expand .ogx-expand-icon')).toBeNull();
        expect(content.mock.calls.map(([p]) => p.id)).toEqual(expect.arrayContaining([1]));
        expect(content.mock.calls.every(([p]) => ORDER_ROWS.includes(p.row))).toBe(true);
        expect(container.querySelectorAll('.ogx__detail-panel')).toHaveLength(1);
    });
});
