import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef } from '../../types';

// ARIA grid structure: row/column indices and counts, sort, hierarchy and detail-panel semantics.

type Row = { id: number; a: string; b: string; c: string };

const makeRows = (n: number): Row[] =>
    Array.from({ length: n }, (_, i) => ({ id: i + 1, a: `a${i + 1}`, b: `b${i + 1}`, c: `c${i + 1}` }));
const ROWS = makeRows(3);
const COLS: GridColDef<Row>[] = [
    { field: 'a', width: 100 },
    { field: 'b', width: 100 },
    { field: 'c', width: 100 },
];

const grid = (c: HTMLElement) => c.querySelector('.ogx__viewport') as HTMLElement;
const dataRows = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>('[role="row"][data-rowindex]'));
const rowIndices = (c: HTMLElement) => dataRows(c).map(r => r.getAttribute('aria-rowindex'));
const headerRow = (c: HTMLElement) => c.querySelector('.ogx__header[role="row"]') as HTMLElement;
const headerCell = (c: HTMLElement, field: string) =>
    c.querySelector(`.ogx__header [role="columnheader"][data-field="${field}"]`) as HTMLElement;
const bodyCell = (c: HTMLElement, rowIndex: number, field: string) =>
    c.querySelector(`[role="row"][data-rowindex="${rowIndex}"] [data-field="${field}"]`) as HTMLElement;

describe('aria-rowindex and aria-rowcount', () => {
    it('the header row is row 1 and data rows follow it', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} />);
        expect(grid(container).getAttribute('aria-rowcount')).toBe('4');
        expect(headerRow(container).getAttribute('aria-rowindex')).toBe('1');
        expect(rowIndices(container)).toEqual(['2', '3', '4']);
    });

    it('rows on page 2 carry their position in the whole dataset', () => {
        const { container } = render(
            <DataGrid rows={makeRows(20)} columns={COLS} pagination paginationModel={{ page: 1, pageSize: 10 }} />
        );
        expect(grid(container).getAttribute('aria-rowcount')).toBe('21');
        const indices = rowIndices(container);
        expect(indices[0]).toBe('12');
        expect(indices[indices.length - 1]).toBe('21');
    });

    it('pinned rows get unique indices and bottom-pinned rows come last', () => {
        const { container } = render(<DataGrid rows={makeRows(5)} columns={COLS} pinnedRows={{ top: [1], bottom: [5] }} />);
        expect(rowIndices(container)).toEqual(['2', '3', '4', '5', '6']);
        expect(grid(container).getAttribute('aria-rowcount')).toBe('6');
    });

    it('a bottom-pinned row reports its own rowIndex to onRowClick, the detail panel and the stripe class', () => {
        const onRowClick = vi.fn();
        const getDetailPanelContent = vi.fn(() => null);
        const { container } = render(
            <DataGrid rows={makeRows(4)} columns={COLS} pinnedRows={{ bottom: [4] }}
                onRowClick={onRowClick} getDetailPanelContent={getDetailPanelContent} />
        );
        const bottomRow = container.querySelector<HTMLElement>('.ogx__row--pinned-bottom')!;
        expect(bottomRow.getAttribute('data-rowindex')).toBe('3');
        expect(bottomRow.className).toContain('ogx__row--odd');
        fireEvent.click(bottomRow.querySelector('[data-field="a"]')!);
        expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ id: 4, rowIndex: 3 }));
        expect(getDetailPanelContent).toHaveBeenCalledWith(expect.objectContaining({ id: 4, rowIndex: 3 }));
    });

    it('bottom-pinned rows come after every page of centre rows', () => {
        const { container } = render(
            <DataGrid rows={makeRows(21)} columns={COLS} pinnedRows={{ bottom: [21] }}
                pagination paginationModel={{ page: 0, pageSize: 10 }} />
        );
        const bottomRow = container.querySelector<HTMLElement>('.ogx__row--pinned-bottom')!;
        expect(bottomRow.getAttribute('aria-rowindex')).toBe('22');
        expect(grid(container).getAttribute('aria-rowcount')).toBe('22');
    });

    it('column group header rows are counted and indexed', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS}
                columnGroupingModel={[{ groupId: 'g', headerName: 'Group', children: ['a', 'b'] }]} />
        );
        expect(grid(container).getAttribute('aria-rowcount')).toBe('5');
        expect(container.querySelector('.ogx-col-group-row')!.getAttribute('aria-rowindex')).toBe('1');
        expect(headerRow(container).getAttribute('aria-rowindex')).toBe('2');
        expect(rowIndices(container)[0]).toBe('3');
    });
});

describe('aria-colindex and colIndex', () => {
    it('header and body cells of a column share aria-colindex with checkboxSelection', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} checkboxSelection />);
        expect(headerCell(container, 'a').getAttribute('aria-colindex')).toBe('2');
        expect(bodyCell(container, 0, 'a').getAttribute('aria-colindex')).toBe('2');
        expect(container.querySelector('.ogx__header-cell--checkbox')!.getAttribute('aria-colindex')).toBe('1');
        expect(container.querySelector('[role="row"][data-rowindex="0"] .ogx__cell--checkbox')!.getAttribute('aria-colindex')).toBe('1');
    });

    it('system columns take the first indices in render order', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} checkboxSelection rowReordering getDetailPanelContent={() => null} />
        );
        const row = container.querySelector('[role="row"][data-rowindex="0"]')!;
        expect(row.querySelector('.ogx__cell--drag-handle')!.getAttribute('aria-colindex')).toBe('1');
        expect(row.querySelector('.ogx__cell--expand')!.getAttribute('aria-colindex')).toBe('2');
        expect(row.querySelector('.ogx__cell--checkbox')!.getAttribute('aria-colindex')).toBe('3');
        expect(bodyCell(container, 0, 'a').getAttribute('aria-colindex')).toBe('4');
        expect(headerCell(container, 'c').getAttribute('aria-colindex')).toBe('6');
        expect(grid(container).getAttribute('aria-colcount')).toBe('6');
    });

    it('colIndex and aria-colindex are absolute after horizontal scrolling', async () => {
        const many: GridColDef<Row>[] = Array.from({ length: 40 }, (_, i) => ({ field: `f${i}`, width: 100 }));
        const onCellClick = vi.fn();
        const renderedIndex = vi.fn();
        many[25] = { ...many[25], renderCell: (p) => { renderedIndex(p.colIndex); return 'x'; } };
        const { container } = render(<DataGrid rows={ROWS} columns={many} onCellClick={onCellClick} />);
        const vp = grid(container);
        vp.scrollLeft = 2000;
        await act(async () => { fireEvent.scroll(vp); await new Promise(r => setTimeout(r, 50)); });
        const target = bodyCell(container, 0, 'f25');
        expect(target).not.toBeNull();
        fireEvent.click(target);
        expect(onCellClick.mock.calls[0][0].colIndex).toBe(25);
        expect(target.getAttribute('aria-colindex')).toBe('26');
        expect(target.getAttribute('data-colindex')).toBe('25');
        expect(headerCell(container, 'f25').getAttribute('aria-colindex')).toBe('26');
        expect(renderedIndex).toHaveBeenLastCalledWith(25);
    });

    it('colIndex follows the visible column order', () => {
        const onCellClick = vi.fn();
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} columnVisibilityModel={{ a: false }} pinnedColumns={{ left: ['c'] }} onCellClick={onCellClick} />
        );
        fireEvent.click(bodyCell(container, 0, 'b'));
        expect(onCellClick.mock.calls[0][0].colIndex).toBe(1);
        expect(bodyCell(container, 0, 'c').getAttribute('aria-colindex')).toBe('1');
    });
});

describe('aria-colcount', () => {
    it('counts only the rendered columns', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} columnVisibilityModel={{ b: false, c: false }} />);
        expect(grid(container).getAttribute('aria-colcount')).toBe('1');
    });

    it('counts the synthetic grouping column', () => {
        type GRow = { id: number; region: string; amount: number };
        const { container } = render(
            <DataGrid<GRow> rows={[{ id: 1, region: 'N', amount: 1 }]}
                columns={[{ field: 'region', width: 100 }, { field: 'amount', width: 100 }]}
                rowGroupingModel={['region']} groupingColDef={{ field: 'group', headerName: 'Group' }} />
        );
        const headers = container.querySelectorAll('.ogx__header [role="columnheader"]').length;
        expect(grid(container).getAttribute('aria-colcount')).toBe(String(headers));
    });

    it('counts pivot columns rather than source columns', () => {
        type PRow = { id: number; region: string; quarter: string; revenue: number; cost: number; extra: string };
        const rows: PRow[] = [
            { id: 1, region: 'N', quarter: 'Q1', revenue: 10, cost: 1, extra: 'x' },
            { id: 2, region: 'S', quarter: 'Q2', revenue: 20, cost: 2, extra: 'y' },
        ];
        const cols: GridColDef<PRow>[] = ['region', 'quarter', 'revenue', 'cost', 'extra'].map(field => ({ field, width: 100 }));
        const { container } = render(
            <DataGrid<PRow> rows={rows} columns={cols} pivotMode
                pivotModel={{ rowFields: ['region'], columnFields: ['quarter'], valueFields: [{ field: 'revenue', aggFn: 'sum' }] }} />
        );
        const headers = container.querySelectorAll('.ogx__header [role="columnheader"]').length;
        expect(grid(container).getAttribute('aria-colcount')).toBe(String(headers));
    });
});

describe('aria-sort', () => {
    it('only the primary sort column exposes a sort direction', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} sortModel={[{ field: 'a', sort: 'asc' }, { field: 'b', sort: 'desc' }]} />
        );
        const sorted = Array.from(container.querySelectorAll('[role="columnheader"][aria-sort]'))
            .filter(h => h.getAttribute('aria-sort') !== 'none')
            .map(h => `${h.getAttribute('data-field')}=${h.getAttribute('aria-sort')}`);
        expect(sorted).toEqual(['a=ascending']);
        expect(headerCell(container, 'b').getAttribute('aria-description')).toContain('descending');
    });
});

describe('hierarchy rows', () => {
    type GRow = { id: number; region: string; amount: number };
    const gRows: GRow[] = [{ id: 1, region: 'N', amount: 1 }, { id: 2, region: 'S', amount: 2 }];
    const gCols: GridColDef<GRow>[] = [{ field: 'region', width: 100 }, { field: 'amount', width: 100 }];

    it('group rows expose aria-expanded and every row exposes aria-level', () => {
        const { container } = render(<DataGrid rows={gRows} columns={gCols} rowGroupingModel={['region']} />);
        const group = container.querySelector<HTMLElement>('[role="row"].ogx__row--group')!;
        expect(group.getAttribute('aria-expanded')).toBe('false');
        expect(group.getAttribute('aria-level')).toBe('1');
        fireEvent.click(group);
        const expanded = container.querySelector<HTMLElement>('[role="row"].ogx__row--group')!;
        expect(expanded.getAttribute('aria-expanded')).toBe('true');
        const leaf = container.querySelector<HTMLElement>('[role="row"][data-rowindex]:not(.ogx__row--group)')!;
        expect(leaf.getAttribute('aria-level')).toBe('2');
        expect(leaf.hasAttribute('aria-expanded')).toBe(false);
    });

    it('tree-data rows expose their depth and expansion', () => {
        type TRow = { id: number; path: string[] };
        const rows: TRow[] = [
            { id: 1, path: ['A'] },
            { id: 2, path: ['A', 'B'] },
            { id: 3, path: ['A', 'B', 'C'] },
        ];
        const { container } = render(
            <DataGrid<TRow> rows={rows} columns={[{ field: 'id', width: 100 }]} treeData
                getTreeDataPath={(r) => r.path} defaultGroupingExpansionDepth={-1} />
        );
        const attrs = dataRows(container).map(r => ({ expanded: r.getAttribute('aria-expanded'), level: r.getAttribute('aria-level') }));
        expect(attrs).toEqual([
            { expanded: 'true', level: '1' },
            { expanded: 'true', level: '2' },
            { expanded: null, level: '3' },
        ]);
    });

    it('flat rows carry no hierarchy attributes', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} />);
        expect(dataRows(container)[0].hasAttribute('aria-level')).toBe(false);
        expect(dataRows(container)[0].hasAttribute('aria-expanded')).toBe(false);
    });
});

describe('detail panel structure', () => {
    it('an expanded panel is a row with one spanning gridcell, controlled by the expand cell', () => {
        const { container } = render(
            <DataGrid rows={ROWS} columns={COLS} getDetailPanelContent={() => <span>detail</span>} detailPanelExpandedRowIds={new Set([1])} />
        );
        for (const group of Array.from(container.querySelectorAll('[role="rowgroup"]'))) {
            const nonRows = Array.from(group.children).filter(ch => ch.getAttribute('role') !== 'row');
            expect(nonRows).toEqual([]);
        }
        const panel = container.querySelector<HTMLElement>('.ogx__detail-panel')!;
        expect(panel.getAttribute('role')).toBe('row');
        const cell = panel.querySelector<HTMLElement>('[role="gridcell"]')!;
        expect(cell.getAttribute('aria-colspan')).toBe(grid(container).getAttribute('aria-colcount'));
        const expandCell = container.querySelector<HTMLElement>('[role="row"][data-rowindex="0"] .ogx__cell--expand')!;
        expect(expandCell.getAttribute('aria-controls')).toBe(panel.id);
        expect(panel.id).not.toBe('');
    });

    it('expand buttons inside cells are not tab stops', () => {
        const { container } = render(<DataGrid rows={ROWS} columns={COLS} getDetailPanelContent={() => null} />);
        const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('.ogx-expand-icon'));
        expect(buttons).toHaveLength(3);
        expect(buttons.map(b => b.tabIndex)).toEqual([-1, -1, -1]);
    });
});
