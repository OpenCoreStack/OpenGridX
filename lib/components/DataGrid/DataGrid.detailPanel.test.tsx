import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridRowId } from '../../types';

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
