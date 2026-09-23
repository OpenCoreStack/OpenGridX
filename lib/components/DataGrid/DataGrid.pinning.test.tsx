import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import type { GridColDef, GridRowModel } from '../../types';

interface Row extends GridRowModel {
    id: number;
    a: string;
    b: string;
    c: string;
    d: string;
    amount: number;
}

const ROWS: Row[] = [1, 2, 3].map(i => ({ id: i, a: `a${i}`, b: `b${i}`, c: `c${i}`, d: `d${i}`, amount: i }));
const COLS: GridColDef<Row>[] = [
    { field: 'a', width: 100 },
    { field: 'b', width: 200 },
    { field: 'c', width: 150 },
    { field: 'd', width: 120 },
];

const renderGrid = (props: Partial<React.ComponentProps<typeof DataGrid<Row>>> = {}) =>
    render(<div style={{ height: 400, width: 800 }}><DataGrid<Row> rows={ROWS} columns={COLS} {...props} /></div>);

/** Field, sticky side and offset of each pinned element in a row, in DOM order. */
const pinnedLayout = (row: Element, selector: string) =>
    Array.from(row.querySelectorAll<HTMLElement>(selector))
        .filter(el => el.style.left !== '' || el.style.right !== '')
        .map(el => `${el.dataset.field}:${el.style.left ? `left=${el.style.left}` : `right=${el.style.right}`}`);

afterEach(() => { vi.restoreAllMocks(); });

describe('DataGrid pinned columns', () => {
    describe('sticky offsets follow the rendered order', () => {
        it('renders left-pinned columns in pinnedColumns order with stacked offsets', () => {
            const { container } = renderGrid({ pinnedColumns: { left: ['b', 'a'] } });
            const row = container.querySelector('.ogx__rows [role="row"]')!;
            expect(pinnedLayout(row, '.ogx__cell[data-field]')).toEqual(['b:left=0px', 'a:left=200px']);
            const header = container.querySelector('.ogx__header')!;
            expect(pinnedLayout(header, '.ogx__header-cell[data-field]')).toEqual(['b:left=0px', 'a:left=200px']);
        });

        it('renders right-pinned columns in pinnedColumns order with stacked offsets', () => {
            const { container } = renderGrid({ pinnedColumns: { right: ['d', 'c'] } });
            const row = container.querySelector('.ogx__rows [role="row"]')!;
            // d then c: c is the rightmost, so it sits at right=0 and d right of it by c's width.
            expect(pinnedLayout(row, '.ogx__cell[data-field]')).toEqual(['d:right=150px', 'c:right=0px']);
            const header = container.querySelector('.ogx__header')!;
            expect(pinnedLayout(header, '.ogx__header-cell[data-field]')).toEqual(['d:right=150px', 'c:right=0px']);
        });

        it('lines the aggregation footer up with the pinned body cells', () => {
            const { container } = renderGrid({
                columns: [...COLS, { field: 'amount', width: 90, type: 'number' }],
                pinnedColumns: { left: ['amount', 'a'] },
                aggregationModel: { amount: 'sum' },
            });
            const footer = container.querySelector('.ogx__aggregation-footer')!;
            const offsets = Array.from(footer.querySelectorAll<HTMLElement>('.ogx__aggregation-cell--pinned-left')).map(el => el.style.left);
            expect(offsets).toEqual(['0px', '90px']);
        });

        it('stacks offsets from the clamped width when minWidth exceeds width', () => {
            const { container } = renderGrid({
                columns: [{ field: 'a', width: 50, minWidth: 120 }, ...COLS.slice(1)],
                pinnedColumns: { left: ['a', 'b'] },
            });
            const row = container.querySelector('.ogx__rows [role="row"]')!;
            expect(pinnedLayout(row, '.ogx__cell[data-field]')).toEqual(['a:left=0px', 'b:left=120px']);
            expect(container.querySelector<HTMLElement>('.ogx__content')!.style.width).toBe('590px');
        });
    });

    describe('pinned section edge classes', () => {
        it('marks the last left-pinned and first right-pinned body and header cells', () => {
            const { container } = renderGrid({ pinnedColumns: { left: ['b', 'a'], right: ['d'] } });
            const row = container.querySelector('.ogx__rows [role="row"]')!;
            const cls = (sel: string) => Array.from(container.querySelectorAll(sel)).map(el => (el as HTMLElement).dataset.field);
            expect(Array.from(row.querySelectorAll('.ogx__cell--pinned-left-last')).map(el => (el as HTMLElement).dataset.field)).toEqual(['a']);
            expect(Array.from(row.querySelectorAll('.ogx__cell--pinned-right-first')).map(el => (el as HTMLElement).dataset.field)).toEqual(['d']);
            expect(cls('.ogx__header-cell--pinned-left-last')).toEqual(['a']);
            expect(cls('.ogx__header-cell--pinned-right-first')).toEqual(['d']);
        });

        it('uses the last visible left-pinned column when the last one in the model is hidden', () => {
            const { container } = renderGrid({ pinnedColumns: { left: ['a', 'b'] }, columnVisibilityModel: { b: false } });
            const row = container.querySelector('.ogx__rows [role="row"]')!;
            expect(Array.from(row.querySelectorAll('.ogx__cell--pinned-left-last')).map(el => (el as HTMLElement).dataset.field)).toEqual(['a']);
        });
    });
});

describe('DataGrid pinned rows under a hierarchy', () => {
    type TreeRow = { id: number; name: string; path: string[] };
    const TREE_ROWS: TreeRow[] = [
        { id: 1, name: 'root', path: ['root'] },
        { id: 2, name: 'child', path: ['root', 'child'] },
        { id: 3, name: 'other', path: ['other'] },
    ];
    const names = (c: HTMLElement) =>
        Array.from(c.querySelectorAll('.ogx__row [data-field="name"]')).map(el => (el.textContent ?? '').trim());

    it('keeps a pinned row in its normal position with tree data and warns that pinning is ignored', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { container } = render(
            <div style={{ height: 400 }}>
                <DataGrid<TreeRow>
                    rows={TREE_ROWS}
                    columns={[{ field: 'name', width: 150 }]}
                    treeData
                    getTreeDataPath={r => r.path}
                    defaultGroupingExpansionDepth={-1}
                    rowHeight={40}
                    pinnedRows={{ top: [3] }}
                />
            </div>,
        );
        expect(names(container)).toEqual(['root', 'child', 'other']);
        expect(container.querySelectorAll('.ogx__row--pinned-top')).toHaveLength(0);
        // Space is reserved for exactly the rows that render.
        expect(parseFloat(container.querySelector<HTMLElement>('.ogx__virtual-container')!.style.height)).toBe(3 * 40 + 2);
        expect(warn.mock.calls.some(([m]) => String(m).includes('`pinnedRows` is ignored'))).toBe(true);
    });

    it('keeps a pinned row inside its group with row grouping', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const flat = [1, 2, 3, 4, 5].map(i => ({ id: i, name: `n${i}`, region: i % 2 ? 'A' : 'B' }));
        const { container } = render(
            <div style={{ height: 400 }}>
                <DataGrid
                    rows={flat}
                    columns={[{ field: 'name', width: 150 }, { field: 'region', width: 150 }]}
                    rowGroupingModel={['region']}
                    defaultGroupingExpansionDepth={-1}
                    pinnedRows={{ top: [3] }}
                />
            </div>,
        );
        expect(names(container)).toEqual(['region: A (3)', 'n1', 'n3', 'n5', 'region: B (2)', 'n2', 'n4']);
    });
});

describe('DataGrid viewport measurement', () => {
    it('observes the viewport that mounts when listView is switched off', () => {
        const observed: Element[] = [];
        const disconnected: number[] = [];
        const Original = globalThis.ResizeObserver;
        class RecordingObserver {
            constructor(_cb: ResizeObserverCallback) { void _cb; }
            observe(el: Element) { observed.push(el); }
            unobserve() {}
            disconnect() { disconnected.push(1); }
        }
        globalThis.ResizeObserver = RecordingObserver as unknown as typeof ResizeObserver;
        try {
            const listViewColumn = { field: 'a', renderCell: () => 'x' };
            const { container, rerender } = render(<DataGrid<Row> rows={ROWS} columns={COLS} listView listViewColumn={listViewColumn} />);
            expect(container.querySelector('.ogx__viewport')).toBeNull();
            rerender(<DataGrid<Row> rows={ROWS} columns={COLS} listView={false} listViewColumn={listViewColumn} />);
            const first = container.querySelector('.ogx__viewport')!;
            expect(observed).toContain(first);

            rerender(<DataGrid<Row> rows={ROWS} columns={COLS} listView listViewColumn={listViewColumn} />);
            expect(disconnected.length).toBeGreaterThan(0);
            rerender(<DataGrid<Row> rows={ROWS} columns={COLS} listView={false} listViewColumn={listViewColumn} />);
            const second = container.querySelector('.ogx__viewport')!;
            expect(second).not.toBe(first);
            expect(observed).toContain(second);
        } finally {
            globalThis.ResizeObserver = Original;
        }
    });
});
