import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGridSpanning, normalizeSpan } from './useGridSpanning';
import type { UseGridSpanningParams } from './useGridSpanning';
import type { GridColDef, GridRenderCellParams, GridRowId, GridRowModel } from '../../types';

interface TestRow extends GridRowModel {
    id: number | string;
    a?: string;
    b?: string;
    c?: string;
    d?: string;
    k?: string;
}

function makeRows(count: number): TestRow[] {
    return Array.from({ length: count }, (_, i) => ({ id: i + 1, a: `a${i + 1}`, b: `b${i + 1}`, c: `c${i + 1}` }));
}

type Params = UseGridSpanningParams<TestRow>;
const NO_ROWS: TestRow[] = [];
const NO_COLUMNS: GridColDef<TestRow>[] = [];

/** Unpinned columns only, center rows only, unless overridden. */
function params(rows: TestRow[], columns: GridColDef<TestRow>[], overrides: Partial<Params> = {}): Params {
    return {
        pinnedTopRows: NO_ROWS,
        centerRows: rows,
        pinnedBottomRows: NO_ROWS,
        columns,
        leftPinnedColumns: NO_COLUMNS,
        unpinnedColumns: columns,
        rightPinnedColumns: NO_COLUMNS,
        ...overrides,
    };
}

const colSpanOf = (result: ReturnType<typeof useGridSpanning>, rowId: GridRowId, field: string) => {
    const info = result.colspanMap.get(rowId)?.[field];
    if (!info) return undefined;
    return info.spannedByColSpan ? 'covered' : info.cellProps.colSpan;
};

afterEach(() => { vi.restoreAllMocks(); });

describe('normalizeSpan', () => {
    it('floors fractions, treats Infinity as "to the end" and everything else invalid as 1', () => {
        expect(normalizeSpan(3)).toBe(3);
        expect(normalizeSpan(2.9)).toBe(2);
        expect(normalizeSpan(0)).toBe(1);
        expect(normalizeSpan(-4)).toBe(1);
        expect(normalizeSpan(Number.NaN)).toBe(1);
        expect(normalizeSpan(-Infinity)).toBe(1);
        expect(normalizeSpan(undefined)).toBe(1);
        expect(normalizeSpan('2')).toBe(1);
        expect(normalizeSpan(Infinity)).toBe(Number.MAX_SAFE_INTEGER);
    });
});

describe('useGridSpanning', () => {
    describe('no spans configured', () => {
        it('returns empty, stable caches and costs nothing for large grids', () => {
            // Counts row reads instead of timing the hook: with no span callbacks it must not walk the
            // rows at all (it used to build an entry for every cell, ~2 s at this size).
            let rowReads = 0;
            const rows = new Proxy(Array.from({ length: 100_000 }, (_, i) => ({ id: i })), {
                get(target, key, receiver) {
                    if (typeof key === 'string' && /^\d+$/.test(key)) rowReads++;
                    return Reflect.get(target, key, receiver);
                },
            });
            const columns: GridColDef<TestRow>[] = Array.from({ length: 20 }, (_, i) => ({ field: `f${i}` }));
            const { result, rerender } = renderHook(({ p }) => useGridSpanning(p), { initialProps: { p: params(rows, columns) } });
            expect(rowReads).toBe(0);
            expect(result.current.colspanMap.size).toBe(0);
            expect(result.current.rowSpanningCaches.spannedCells).toEqual({});
            const first = result.current;
            rerender({ p: params([...rows], columns) });
            expect(result.current).toBe(first);
        });
    });

    describe('column spanning', () => {
        it('only stores span origins and covered cells', () => {
            const cols: GridColDef<TestRow>[] = [{ field: 'a', colSpan: 2 }, { field: 'b' }, { field: 'c' }];
            const { result } = renderHook(() => useGridSpanning(params(makeRows(1), cols)));
            expect(result.current.colspanMap.get(1)).toEqual({
                a: { spannedByColSpan: false, cellProps: { colSpan: 2 } },
                b: { spannedByColSpan: true, leftVisibleCellIndex: 0, rightVisibleCellIndex: 1 },
            });
            expect(result.current.getSpanOrigin(1, 'b')).toEqual({ rowId: 1, field: 'a' });
            expect(result.current.getSpanOrigin(1, 'a')).toBeNull();
            expect(result.current.getSpanOrigin(1, 'c')).toBeNull();
        });

        it('evaluates a colSpan function per row with the valueGetter value, row index and rendered column index', () => {
            const rows: TestRow[] = [{ id: 1, a: 'total', b: 'x' }, { id: 2, a: 'item', b: 'y' }];
            const spanFn = vi.fn((p: GridRenderCellParams<TestRow>) => (p.value === 'TOTAL' ? 2 : 1));
            const left: GridColDef<TestRow>[] = [{ field: 'k' }];
            const cols: GridColDef<TestRow>[] = [{ field: 'a', valueGetter: ({ row }) => String(row.a).toUpperCase(), colSpan: spanFn }, { field: 'b' }];
            const { result } = renderHook(() => useGridSpanning(params(rows, [...left, ...cols], { leftPinnedColumns: left, unpinnedColumns: cols })));
            expect(colSpanOf(result.current, 1, 'a')).toBe(2);
            expect(colSpanOf(result.current, 2, 'a')).toBeUndefined();
            expect(spanFn.mock.calls[0][0]).toMatchObject({ field: 'a', value: 'TOTAL', rowIndex: 0, colIndex: 1 });
            expect(spanFn.mock.calls[1][0]).toMatchObject({ value: 'ITEM', rowIndex: 1, colIndex: 1 });
        });

        it('does not evaluate the colSpan of a covered column', () => {
            const covered = vi.fn(() => 2);
            const cols: GridColDef<TestRow>[] = [{ field: 'a', colSpan: 2 }, { field: 'b', colSpan: covered }, { field: 'c' }];
            const { result } = renderHook(() => useGridSpanning(params(makeRows(1), cols)));
            expect(covered).not.toHaveBeenCalled();
            expect(colSpanOf(result.current, 1, 'c')).toBeUndefined();
        });

        it('clamps a colSpan to the end of its pinned section', () => {
            const left: GridColDef<TestRow>[] = [{ field: 'a', colSpan: 5 }, { field: 'b' }];
            const center: GridColDef<TestRow>[] = [{ field: 'c', colSpan: 9 }, { field: 'd' }];
            const { result } = renderHook(() =>
                useGridSpanning(params(makeRows(1), [...left, ...center], { leftPinnedColumns: left, unpinnedColumns: center })),
            );
            expect(colSpanOf(result.current, 1, 'a')).toBe(2);
            expect(colSpanOf(result.current, 1, 'b')).toBe('covered');
            expect(colSpanOf(result.current, 1, 'c')).toBe(2);
            expect(colSpanOf(result.current, 1, 'd')).toBe('covered');
            // Unpinned ranges are reported in unpinned index space.
            expect(result.current.getUnpinnedColSpanRanges(1)).toEqual([0, 1]);
        });

        it('normalises huge, infinite, NaN and fractional values without looping over them', () => {
            const rows = makeRows(4);
            const values = [Infinity, 5e9, Number.NaN, 1.9];
            const cols: GridColDef<TestRow>[] = [{ field: 'a', colSpan: ({ rowIndex }) => values[rowIndex] }, { field: 'b' }, { field: 'c' }];
            const t0 = performance.now();
            const { result } = renderHook(() => useGridSpanning(params(rows, cols)));
            expect(performance.now() - t0).toBeLessThan(200);
            expect([1, 2, 3, 4].map(id => colSpanOf(result.current, id, 'a'))).toEqual([3, 3, undefined, undefined]);
        });

        it('does not recompute when only the column widths change', () => {
            const spanFn = vi.fn(() => 2);
            const cols: GridColDef<TestRow>[] = [{ field: 'a', colSpan: spanFn }, { field: 'b' }];
            const rows = makeRows(3);
            const { rerender } = renderHook(({ p }) => useGridSpanning(p), { initialProps: { p: params(rows, cols) } });
            const calls = spanFn.mock.calls.length;
            // The layout rebuilds its column arrays with new widths on every resize tick.
            rerender({ p: params(rows, cols, { unpinnedColumns: cols.map(c => ({ ...c, width: 300 })) }) });
            expect(spanFn.mock.calls.length).toBe(calls);
        });
    });

    describe('row spanning', () => {
        it('a static rowSpan hides the following rows and records the origin', () => {
            const cols: GridColDef<TestRow>[] = [{ field: 'a', rowSpan: 2 }, { field: 'b' }];
            const { result } = renderHook(() => useGridSpanning(params(makeRows(5), cols)));
            const { spannedCells, hiddenCells, hiddenCellOriginMap } = result.current.rowSpanningCaches;
            // Rows 1 and 3 are origins; row 5 is the last row, so its span is clamped to 1.
            expect(spannedCells).toEqual({ 1: { a: 2 }, 3: { a: 2 } });
            expect(hiddenCells).toEqual({ 2: { a: true }, 4: { a: true } });
            expect(hiddenCellOriginMap).toEqual({ 2: { a: 1 }, 4: { a: 3 } });
            expect(result.current.getSpanOrigin(4, 'a')).toEqual({ rowId: 3, field: 'a' });
            expect(result.current.getCenterRowSpanStart(3)).toBe(2);
            expect(result.current.getCenterRowSpanStart(2)).toBe(2);
        });

        it('passes the valueGetter value and skips rows that are covered', () => {
            const rows: TestRow[] = [{ id: 1, k: 'x' }, { id: 2, k: 'x' }, { id: 3, k: 'y' }];
            const spanFn = vi.fn((p: GridRenderCellParams<TestRow>) => (p.value === 'X!' ? 2 : 1));
            const cols: GridColDef<TestRow>[] = [{ field: 'k', valueGetter: ({ row }) => `${String(row.k).toUpperCase()}!`, rowSpan: spanFn }];
            const { result } = renderHook(() => useGridSpanning(params(rows, cols)));
            expect(result.current.rowSpanningCaches.spannedCells).toEqual({ 1: { k: 2 } });
            expect(spanFn.mock.calls.map(([p]) => p.row.id)).toEqual([1, 3]);
        });

        it('clamps a rowSpan to the rows left in its section', () => {
            const cols: GridColDef<TestRow>[] = [{ field: 'a', rowSpan: ({ rowIndex }) => (rowIndex === 1 ? 1e9 : 1) }];
            const t0 = performance.now();
            const { result } = renderHook(() => useGridSpanning(params(makeRows(3), cols)));
            expect(performance.now() - t0).toBeLessThan(200);
            expect(result.current.rowSpanningCaches.spannedCells).toEqual({ 2: { a: 2 } });
        });

        it('computes each row section on its own, with rowIndex counted across sections', () => {
            const [top, c1, c2, bottom] = makeRows(4);
            const spanFn = vi.fn<(p: GridRenderCellParams<TestRow>) => number>(() => 2);
            const cols: GridColDef<TestRow>[] = [{ field: 'a', rowSpan: spanFn }];
            const { result } = renderHook(() => useGridSpanning(params([c1, c2], cols, { pinnedTopRows: [top], pinnedBottomRows: [bottom] })));
            expect(result.current.rowSpanningCaches.spannedCells).toEqual({ 2: { a: 2 } });
            expect(result.current.rowSpanningCaches.hiddenCells).toEqual({ 3: { a: true } });
            expect(spanFn.mock.calls.map(([p]) => [p.row.id, p.rowIndex])).toEqual([[1, 0], [2, 1], [4, 3]]);
        });

        it('ends a span at a row whose detail panel is expanded', () => {
            const cols: GridColDef<TestRow>[] = [{ field: 'a', rowSpan: ({ rowIndex }) => (rowIndex === 0 ? 4 : 1) }];
            const { result } = renderHook(() => useGridSpanning(params(makeRows(5), cols, { expandedRowIds: new Set([2]) })));
            expect(result.current.rowSpanningCaches.spannedCells).toEqual({ 1: { a: 2 } });
            expect(result.current.rowSpanningCaches.hiddenCells).toEqual({ 2: { a: true } });
        });

        it('recomputes against the new row order', () => {
            const cols: GridColDef<TestRow>[] = [{ field: 'a', rowSpan: ({ rowIndex }) => (rowIndex === 0 ? 2 : 1) }];
            const rows = makeRows(3);
            const { result, rerender } = renderHook(({ r }) => useGridSpanning(params(r, cols)), { initialProps: { r: rows } });
            expect(result.current.rowSpanningCaches.hiddenCells).toEqual({ 2: { a: true } });
            rerender({ r: [...rows].reverse() });
            expect(result.current.rowSpanningCaches.spannedCells).toEqual({ 3: { a: 2 } });
            expect(result.current.rowSpanningCaches.hiddenCells).toEqual({ 2: { a: true } });
        });

        it('skips infinite-scroll skeleton rows', () => {
            const spanFn = vi.fn<(p: GridRenderCellParams<TestRow>) => number>(() => 1);
            const rows = [...makeRows(2), { id: '__skeleton_0__', _isSkeleton: true }] as TestRow[];
            renderHook(() => useGridSpanning(params(rows, [{ field: 'a', colSpan: spanFn, rowSpan: spanFn }])));
            expect(spanFn.mock.calls.every(([p]) => !p.row._isSkeleton)).toBe(true);
        });
    });

    describe('combined spans', () => {
        it('an origin with colSpan and rowSpan covers the whole rectangle', () => {
            const cols: GridColDef<TestRow>[] = [
                { field: 'a', colSpan: ({ rowIndex }) => (rowIndex === 0 ? 2 : 1), rowSpan: ({ rowIndex }) => (rowIndex === 0 ? 2 : 1) },
                { field: 'b' },
                { field: 'c' },
            ];
            const { result } = renderHook(() => useGridSpanning(params(makeRows(3), cols)));
            expect(result.current.rowSpanningCaches.hiddenCells).toEqual({ 2: { a: true, b: true } });
            expect(result.current.getSpanOrigin(2, 'b')).toEqual({ rowId: 1, field: 'a' });
        });

        it('a cell hidden by a row span is not evaluated as a colSpan origin', () => {
            const spanFn = vi.fn<(p: GridRenderCellParams<TestRow>) => number>(() => 2);
            const cols: GridColDef<TestRow>[] = [{ field: 'a', colSpan: spanFn, rowSpan: ({ rowIndex }) => (rowIndex === 0 ? 2 : 1) }, { field: 'b' }, { field: 'c' }];
            const { result } = renderHook(() => useGridSpanning(params(makeRows(3), cols)));
            expect(spanFn.mock.calls.map(([p]) => p.row.id)).toEqual([1, 3]);
            expect(result.current.colspanMap.get(2)).toBeUndefined();
            expect(result.current.rowSpanningCaches.hiddenCells).toEqual({ 2: { a: true, b: true } });
        });

        it('a colSpan-covered cell is not a rowSpan origin, and a colSpan stops at a cell covered from above', () => {
            const cols: GridColDef<TestRow>[] = [
                { field: 'a', colSpan: ({ rowIndex }) => (rowIndex === 1 ? 3 : rowIndex === 2 ? 2 : 1) },
                { field: 'b', rowSpan: ({ rowIndex }) => (rowIndex <= 2 ? 2 : 1) },
                { field: 'c' },
            ];
            const { result } = renderHook(() => useGridSpanning(params(makeRows(4), cols)));
            // Row 1: b spans rows 1-2. Row 2: a's colSpan 3 stops at the hidden b.
            expect(colSpanOf(result.current, 2, 'a')).toBeUndefined();
            expect(result.current.rowSpanningCaches.hiddenCells[2]).toEqual({ b: true });
            // Row 3: a covers b, so b is not evaluated as a rowSpan origin there.
            expect(colSpanOf(result.current, 3, 'b')).toBe('covered');
            expect(result.current.rowSpanningCaches.spannedCells[3]).toBeUndefined();
        });
    });

    it('treats a throwing callback as span 1 and warns once per column', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const cols: GridColDef<TestRow>[] = [{ field: 'a', colSpan: () => { throw new Error('boom'); } }, { field: 'b' }];
        const { result } = renderHook(() => useGridSpanning(params(makeRows(3), cols)));
        expect(result.current.colspanMap.size).toBe(0);
        expect(warn).toHaveBeenCalledTimes(1);
    });
});
