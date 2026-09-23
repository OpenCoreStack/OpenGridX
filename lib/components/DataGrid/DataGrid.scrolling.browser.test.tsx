import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, act, fireEvent } from '@testing-library/react';
import type { ReactNode, RefObject } from 'react';
import { DataGrid, useGridApiRef } from '../../index';
import type { GridApi, GridColDef, GridColumnPinning, GridDataSource, GridGetRowsResponse, GridRowId, GridRowModel, GridSortItem } from '../../types';

// Real Chromium: scroll positions, ResizeObserver and element geometry need a layout engine.

type Row = { id: number; name: string; amount: number; [k: string]: unknown };

const makeRows = (n: number, offset = 0): Row[] =>
    Array.from({ length: n }, (_, i) => ({ id: offset + i + 1, name: `n${offset + i + 1}`, amount: offset + i }));

const Box = ({ children, h = 400, w = 800 }: { children: ReactNode; h?: number; w?: number }) => (
    <div style={{ height: h, width: w, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
);

const viewport = (c: HTMLElement) => c.querySelector<HTMLElement>('.ogx__viewport')!;
const rect = (c: HTMLElement, sel: string) => c.querySelector<HTMLElement>(sel)!.getBoundingClientRect();
const bodyRows = (c: HTMLElement) => c.querySelectorAll('.ogx__rows [role="row"]').length;
const frame = () => new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
/** Real scroll: set the position and let the browser fire its own scroll event. */
const scrollTo = async (el: HTMLElement, pos: { top?: number; left?: number }) => {
    if (pos.top !== undefined) el.scrollTop = pos.top;
    if (pos.left !== undefined) el.scrollLeft = pos.left;
    await frame();
    await frame();
};
const settle = async () => { await frame(); await frame(); await frame(); };
const maxTop = (el: HTMLElement) => el.scrollHeight - el.clientHeight;
/** Rows whose box intersects the viewport. */
const visibleRowIds = (c: HTMLElement) => {
    const vp = viewport(c).getBoundingClientRect();
    return Array.from(c.querySelectorAll<HTMLElement>('.ogx__rows [role="row"]'))
        .filter(r => { const b = r.getBoundingClientRect(); return b.bottom > vp.top && b.top < vp.bottom; })
        .map(r => r.querySelector('[data-field="name"]')?.textContent);
};

function withApi(render: (api: RefObject<GridApi>) => ReactNode) {
    const holder: { api: RefObject<GridApi> | null } = { api: null };
    const Grid = () => {
        const api = useGridApiRef();
        holder.api = api;
        return <>{render(api)}</>;
    };
    return { Grid, api: () => holder.api!.current };
}

const numberCols: GridColDef<Row>[] = [{ field: 'name', width: 200 }, { field: 'amount', width: 200, type: 'number' }];

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

describe('DataGrid scrolling in a real browser', () => {
    describe('scroll-into-view keeps rows clear of the sticky bottom block', () => {
        it('scrollToIndexes(last row) stops above the aggregation footer', async () => {
            const { Grid, api } = withApi(a => <DataGrid apiRef={a} rows={makeRows(200)} columns={numberCols} height="100%" aggregationModel={{ amount: 'sum' }} />);
            const { container } = render(<Box><Grid /></Box>);
            await expect.poll(() => container.querySelector('.ogx__aggregation-footer')).not.toBeNull();
            await act(async () => { api().scrollToIndexes({ rowIndex: 199 }); });
            await settle();
            const row = rect(container, '.ogx__rows [data-rowindex="199"]');
            expect(row.bottom).toBeLessThanOrEqual(rect(container, '.ogx__aggregation-footer').top + 1);
        });

        it('Ctrl+End keeps the focused last row above the aggregation footer', async () => {
            const { container } = render(<Box><DataGrid rows={makeRows(200)} columns={numberCols} height="100%" aggregationModel={{ amount: 'sum' }} /></Box>);
            await expect.poll(() => container.querySelector('.ogx__rows [data-rowindex="0"] [data-field="name"]')).not.toBeNull();
            fireEvent.click(container.querySelector<HTMLElement>('.ogx__rows [data-rowindex="0"] [data-field="name"]')!);
            await act(async () => { fireEvent.keyDown(viewport(container), { key: 'End', ctrlKey: true }); });
            await settle();
            await expect.poll(() => container.querySelector('.ogx__rows [data-rowindex="199"]')).not.toBeNull();
            expect(rect(container, '.ogx__rows [data-rowindex="199"]').bottom).toBeLessThanOrEqual(rect(container, '.ogx__aggregation-footer').top + 1);
        });

        it('accounts for an expanded detail panel on a bottom-pinned row', async () => {
            const { Grid, api } = withApi(a => (
                <DataGrid apiRef={a} rows={makeRows(100)} columns={numberCols} height="100%" pinnedRows={{ bottom: [100] }}
                    getDetailPanelContent={() => <div>detail</div>} getDetailPanelHeight={() => 150}
                    detailPanelExpandedRowIds={new Set<GridRowId>([100])} />
            ));
            const { container } = render(<Box><Grid /></Box>);
            await expect.poll(() => container.querySelector('.ogx__pinned-rows--bottom .ogx__detail-panel')).not.toBeNull();
            await act(async () => { api().scrollToIndexes({ rowIndex: 40 }); });
            await settle();
            const row = rect(container, '.ogx__rows [data-rowindex="40"]');
            expect(row.bottom).toBeLessThanOrEqual(rect(container, '.ogx__pinned-rows--bottom').top + 1);
        });
    });

    describe('scrollToIndexes({ colIndex })', () => {
        const cols: GridColDef<Row>[] = [...Array.from({ length: 20 }, (_, i) => ({ field: `c${i}`, width: 150 })), { field: 'actions', width: 200 }];

        const cases: Array<[string, { checkboxSelection?: boolean; pinnedColumns?: GridColumnPinning }]> = [
            ['checkbox column and a right-pinned column', { checkboxSelection: true, pinnedColumns: { right: ['actions'] } }],
            ['a right-pinned column', { pinnedColumns: { right: ['actions'] } }],
            ['a checkbox column', { checkboxSelection: true }],
        ];
        it.each(cases)('scrolls the column fully into view with %s', async (_label, extra) => {
            const { Grid, api } = withApi(a => <DataGrid apiRef={a} rows={makeRows(5)} columns={cols} height="100%" {...extra} />);
            const { container } = render(<Box><Grid /></Box>);
            await expect.poll(() => container.querySelector('.ogx__rows [data-field="c0"]')).not.toBeNull();
            await act(async () => { api().scrollToIndexes({ colIndex: 8 }); });
            await settle();
            const target = rect(container, '.ogx__rows [data-field="c8"]');
            const vp = viewport(container);
            const vpRect = vp.getBoundingClientRect();
            const visibleEnd = extra.pinnedColumns ? rect(container, '.ogx__rows [data-field="actions"]').left : vpRect.left + vp.clientWidth;
            expect(target.right).toBeLessThanOrEqual(visibleEnd + 1);
            // Scrolling back left keeps the column clear of the sticky checkbox column.
            await scrollTo(vp, { left: vp.scrollWidth });
            await act(async () => { api().scrollToIndexes({ colIndex: 2 }); });
            await settle();
            const left = rect(container, '.ogx__rows [data-field="c2"]');
            const stickyEnd = extra.checkboxSelection ? rect(container, '.ogx__rows .ogx__cell--checkbox').right : vpRect.left;
            expect(left.left).toBeGreaterThanOrEqual(stickyEnd - 1);
        });
    });

    describe("'auto' detail panel height", () => {
        const tallPanel = () => (
            <div style={{ height: 1000 }} className="tall">tall<div className="marker" style={{ marginTop: 500 }}>M</div></div>
        );

        it('lays the panel out at its rendered height', async () => {
            const { container } = render(
                <Box><DataGrid rows={makeRows(50)} columns={[{ field: 'name', width: 200 }]} height="100%"
                    getDetailPanelContent={tallPanel} getDetailPanelHeight={() => 'auto'}
                    detailPanelExpandedRowIds={new Set<GridRowId>([1])} /></Box>
            );
            await expect.poll(() => container.querySelector('.tall')).not.toBeNull();
            await settle();
            const panel = rect(container, '.ogx__detail-panel').height;
            const vc = parseFloat(container.querySelector<HTMLElement>('.ogx__virtual-container')!.style.height);
            expect(Math.abs(vc - (50 * 52 + panel + 2))).toBeLessThanOrEqual(1);
        });

        it('keeps the panel mounted while it is still in view and rows do not jump', async () => {
            const { container } = render(
                <Box><DataGrid rows={makeRows(50)} columns={[{ field: 'name', width: 200 }]} height="100%"
                    getDetailPanelContent={tallPanel} getDetailPanelHeight={() => 'auto'}
                    detailPanelExpandedRowIds={new Set<GridRowId>([1])} /></Box>
            );
            await expect.poll(() => container.querySelector('.tall')).not.toBeNull();
            await settle();
            const vc = () => container.querySelector<HTMLElement>('.ogx__virtual-container')!.getBoundingClientRect().top;
            const row2Offset = () => rect(container, '.ogx__rows [data-rowindex="1"]').top - vc();
            const before = row2Offset();
            await scrollTo(viewport(container), { top: 450 });
            await settle();
            expect(container.querySelector('.marker')).not.toBeNull();
            await scrollTo(viewport(container), { top: 1000 });
            await settle();
            expect(Math.round(row2Offset())).toBe(Math.round(before));
        });
    });

    describe('onRowsScrollEnd', () => {
        const wideCols: GridColDef<Row>[] = Array.from({ length: 10 }, (_, i) => ({ field: `c${i}`, width: 200 }));

        it('fires once for one gesture into the bottom threshold, not for each scroll event', async () => {
            const onEnd = vi.fn();
            const { container } = render(<Box><DataGrid rows={makeRows(100)} columns={wideCols} height="100%" onRowsScrollEnd={onEnd} /></Box>);
            await expect.poll(() => bodyRows(container)).toBeGreaterThan(0);
            const el = viewport(container);
            const max = maxTop(el);
            await scrollTo(el, { top: max - 300 });
            expect(onEnd).not.toHaveBeenCalled();
            for (const top of [max - 80, max - 40, max - 10, max]) await scrollTo(el, { top });
            expect(onEnd).toHaveBeenCalledTimes(1);
            // Horizontal-only scrolling at the bottom does not fire again.
            await scrollTo(el, { left: 100 });
            await scrollTo(el, { left: 200 });
            expect(onEnd).toHaveBeenCalledTimes(1);
            // Leaving the threshold and coming back is a new arrival.
            await scrollTo(el, { top: max - 400 });
            await scrollTo(el, { top: max });
            expect(onEnd).toHaveBeenCalledTimes(2);
        });

        it('re-arms after rows are appended', async () => {
            const onEnd = vi.fn();
            const cols: GridColDef<Row>[] = [{ field: 'name', width: 200 }];
            const first = makeRows(50);
            const { container, rerender } = render(<Box><DataGrid rows={first} columns={cols} height="100%" onRowsScrollEnd={onEnd} /></Box>);
            await expect.poll(() => bodyRows(container)).toBeGreaterThan(0);
            await scrollTo(viewport(container), { top: maxTop(viewport(container)) });
            expect(onEnd).toHaveBeenCalledTimes(1);
            rerender(<Box><DataGrid rows={[...first, ...makeRows(50, 50)]} columns={cols} height="100%" onRowsScrollEnd={onEnd} /></Box>);
            await settle();
            expect(onEnd).toHaveBeenCalledTimes(1);
            await scrollTo(viewport(container), { top: maxTop(viewport(container)) });
            expect(onEnd).toHaveBeenCalledTimes(2);
        });

        it('fires when the rows do not fill the viewport', async () => {
            const onEnd = vi.fn();
            const { container } = render(<Box><DataGrid rows={makeRows(3)} columns={[{ field: 'name', width: 200 }]} height="100%" onRowsScrollEnd={onEnd} /></Box>);
            await expect.poll(() => bodyRows(container)).toBe(3);
            await settle();
            expect(viewport(container).scrollHeight).toBeLessThanOrEqual(viewport(container).clientHeight);
            expect(onEnd).toHaveBeenCalledTimes(1);
        });

        it('does not fire before any rows exist', async () => {
            const onEnd = vi.fn();
            render(<Box><DataGrid rows={[]} columns={[{ field: 'name', width: 200 }]} height="100%" onRowsScrollEnd={onEnd} /></Box>);
            await settle();
            expect(onEnd).not.toHaveBeenCalled();
        });
    });

    describe('list view round trip', () => {
        const cols: GridColDef<Row>[] = [{ field: 'name', width: 200 }];
        const listViewColumn = { field: 'name', renderCell: (p: { row: Row }) => String(p.row.name) };
        const Tall = ({ listView, rows }: { listView: boolean; rows: Row[] }) => (
            <Box h={900} w={600}><DataGrid rows={rows} columns={cols} height="100%" listView={listView} listViewColumn={listViewColumn} /></Box>
        );

        it('measures the viewport that mounts after starting in list view', async () => {
            const rows = makeRows(3000);
            const { container, rerender } = render(<Tall listView rows={rows} />);
            await frame();
            rerender(<Tall listView={false} rows={rows} />);
            await expect.poll(() => bodyRows(container)).toBeGreaterThan(0);
            await settle();
            const vp = viewport(container);
            const vpRect = vp.getBoundingClientRect();
            const lastBottom = Math.max(...Array.from(container.querySelectorAll<HTMLElement>('.ogx__rows [role="row"]')).map(r => r.getBoundingClientRect().bottom));
            expect(lastBottom).toBeGreaterThanOrEqual(vpRect.top + vp.clientHeight);
        });

        it('shows the rows at the scroll position after switching list view off again', async () => {
            const rows = makeRows(3000);
            const { container, rerender } = render(<Tall listView={false} rows={rows} />);
            await expect.poll(() => bodyRows(container)).toBeGreaterThan(0);
            await scrollTo(viewport(container), { top: 60000 });
            await settle();
            const before = visibleRowIds(container);
            expect(before.length).toBeGreaterThan(5);
            rerender(<Tall listView rows={rows} />);
            await frame();
            rerender(<Tall listView={false} rows={rows} />);
            await settle();
            expect(viewport(container).scrollTop).toBe(60000);
            expect(visibleRowIds(container)).toEqual(before);
        });
    });

    describe('infinite-scroll skeleton rows', () => {
        const TOTAL = 100;
        const rows = makeRows(TOTAL);
        const EMPTY: GridRowModel[] = [];
        const SORT_NONE: GridSortItem[] = [];
        const SORT_DESC: GridSortItem[] = [{ field: 'name', sort: 'desc' }];
        const PAGE = { page: 0, pageSize: TOTAL };
        const skeletons = (c: HTMLElement) => Array.from(c.querySelectorAll<HTMLElement>('.ogx__skeleton-group .ogx__row--skeleton'));

        const makeDataSource = (): GridDataSource => ({
            getRows: vi.fn<GridDataSource['getRows']>()
                .mockResolvedValueOnce({ rows } as GridGetRowsResponse)
                .mockImplementation(() => new Promise<GridGetRowsResponse>(() => {})),
        });
        const grid = (ds: GridDataSource, sortModel: GridSortItem[]) => (
            <Box><DataGrid rows={EMPTY} columns={[{ field: 'name', width: 200 }] as unknown as GridColDef[]} height="100%" dataSource={ds}
                pagination={false} paginationMode="infinite" sortingMode="server" paginationModel={PAGE} sortModel={sortModel} /></Box>
        );

        it('draws skeleton rows only after the last data row', async () => {
            const ds = makeDataSource();
            const { container, rerender } = render(grid(ds, SORT_NONE));
            await expect.poll(() => bodyRows(container), { timeout: 3000 }).toBeGreaterThan(0);
            const el = viewport(container);
            await scrollTo(el, { top: 2000 });
            await wait(250);
            rerender(grid(ds, SORT_DESC));
            await wait(400);
            await expect.poll(() => (ds.getRows as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
            await settle();
            // Mid-list: the end of the data is not rendered, so neither are the placeholders.
            expect(skeletons(container)).toHaveLength(0);
            await scrollTo(el, { top: maxTop(el) });
            await settle();
            const group = container.querySelector<HTMLElement>('.ogx__skeleton-group');
            expect(group).not.toBeNull();
            const vcTop = container.querySelector<HTMLElement>('.ogx__virtual-container')!.getBoundingClientRect().top;
            expect(Math.round(group!.getBoundingClientRect().top - vcTop)).toBe(TOTAL * 52);
        });
    });
});
