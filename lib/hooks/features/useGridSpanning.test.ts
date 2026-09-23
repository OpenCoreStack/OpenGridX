import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGridSpanning } from './useGridSpanning';
import type { CellColSpanInfo } from './useGridSpanning';
import type { GridColDef, GridRenderCellParams, GridRowModel } from '../../types';

interface TestRow extends GridRowModel {
    id: number | string;
    a?: string;
    b?: string;
    c?: string;
    d?: string;
    k?: string;
}

const NO_WIDTHS: Record<string, number> = {};

function originProps(info: CellColSpanInfo | undefined): { colSpan: number; width: number } | undefined {
    if (!info || info.spannedByColSpan) return undefined;
    return info.cellProps;
}

function makeRows(count: number): TestRow[] {
    return Array.from({ length: count }, (_, i) => ({ id: i + 1, a: `a${i + 1}`, b: `b${i + 1}`, c: `c${i + 1}` }));
}

describe('useGridSpanning', () => {
    describe('initial state', () => {
        it('returns empty caches for empty rows and columns', () => {
            const rows: TestRow[] = [];
            const cols: GridColDef<TestRow>[] = [];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            expect(result.current.colspanMap.size).toBe(0);
            expect(result.current.getSpannedCells()).toEqual({});
            expect(result.current.getHiddenCells()).toEqual({});
            expect(result.current.getHiddenCellOriginMap()).toEqual({});
            expect(result.current.rowSpanningState.processedRange).toEqual({ firstRowIndex: 0, lastRowIndex: 0 });
        });

        it('returns an empty colspan map when there are rows but no columns', () => {
            const rows = makeRows(3);
            const cols: GridColDef<TestRow>[] = [];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            expect(result.current.colspanMap.size).toBe(0);
            expect(result.current.rowSpanningState.processedRange).toEqual({ firstRowIndex: 0, lastRowIndex: 3 });
        });
    });

    describe('column spanning (colSpan)', () => {
        it('records a single-column entry for every cell when no colSpan is configured', () => {
            const rows = makeRows(2);
            const cols: GridColDef<TestRow>[] = [{ field: 'a', width: 120 }, { field: 'b', width: 80 }];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            expect(result.current.colspanMap.size).toBe(2);
            expect(result.current.getCellColSpanInfo(1, 'a')).toEqual({
                spannedByColSpan: false,
                cellProps: { colSpan: 1, width: 120 },
            });
            expect(result.current.getCellColSpanInfo(2, 'b')).toEqual({
                spannedByColSpan: false,
                cellProps: { colSpan: 1, width: 80 },
            });
        });

        it('resolves width from columnWidths first, then numeric colDef.width, then 100', () => {
            const rows = makeRows(1);
            const cols: GridColDef<TestRow>[] = [
                { field: 'a', width: 120 },
                { field: 'b', width: 80 },
                { field: 'c' },
            ];
            const widths: Record<string, number> = { a: 200 };
            const { result } = renderHook(() => useGridSpanning(rows, cols, widths));

            expect(originProps(result.current.getCellColSpanInfo(1, 'a'))?.width).toBe(200);
            expect(originProps(result.current.getCellColSpanInfo(1, 'b'))?.width).toBe(80);
            expect(originProps(result.current.getCellColSpanInfo(1, 'c'))?.width).toBe(100);
        });

        it('a static colSpan merges the following columns and sums their widths', () => {
            const rows = makeRows(1);
            const cols: GridColDef<TestRow>[] = [
                { field: 'a', width: 100, colSpan: 2 },
                { field: 'b', width: 70 },
                { field: 'c', width: 90 },
            ];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            expect(result.current.getCellColSpanInfo(1, 'a')).toEqual({
                spannedByColSpan: false,
                cellProps: { colSpan: 2, width: 170 },
            });
            expect(result.current.getCellColSpanInfo(1, 'b')).toEqual({
                spannedByColSpan: true,
                leftVisibleCellIndex: 0,
                rightVisibleCellIndex: 1,
            });
            // The column after the span is processed as a normal origin cell.
            expect(result.current.getCellColSpanInfo(1, 'c')).toEqual({
                spannedByColSpan: false,
                cellProps: { colSpan: 1, width: 90 },
            });
        });

        it('uses columnWidths overrides for covered columns when summing the span width', () => {
            const rows = makeRows(1);
            const cols: GridColDef<TestRow>[] = [
                { field: 'a', width: 100, colSpan: 3 },
                { field: 'b', width: 70 },
                { field: 'c', width: 90 },
            ];
            const widths: Record<string, number> = { b: 30 };
            const { result } = renderHook(() => useGridSpanning(rows, cols, widths));

            expect(originProps(result.current.getCellColSpanInfo(1, 'a'))).toEqual({ colSpan: 3, width: 220 });
            const covered = result.current.getCellColSpanInfo(1, 'c');
            expect(covered?.spannedByColSpan).toBe(true);
        });

        it('a colSpan function is evaluated per row with row, field, raw value, rowIndex and colIndex', () => {
            const rows: TestRow[] = [
                { id: 1, a: 'total', b: 'x' },
                { id: 2, a: 'item', b: 'y' },
            ];
            const spanFn = vi.fn((params: GridRenderCellParams<TestRow>) => (params.row.a === 'total' ? 2 : 1));
            const cols: GridColDef<TestRow>[] = [
                { field: 'a', width: 100, colSpan: spanFn },
                { field: 'b', width: 50 },
            ];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            expect(originProps(result.current.getCellColSpanInfo(1, 'a'))).toEqual({ colSpan: 2, width: 150 });
            expect(result.current.getCellColSpanInfo(1, 'b')?.spannedByColSpan).toBe(true);
            expect(originProps(result.current.getCellColSpanInfo(2, 'a'))).toEqual({ colSpan: 1, width: 100 });
            expect(originProps(result.current.getCellColSpanInfo(2, 'b'))).toEqual({ colSpan: 1, width: 50 });

            const firstCall = spanFn.mock.calls.find(([p]) => p.row.id === 1)?.[0];
            expect(firstCall).toMatchObject({ field: 'a', value: 'total', rowIndex: 0, colIndex: 0 });
            const secondCall = spanFn.mock.calls.find(([p]) => p.row.id === 2)?.[0];
            expect(secondCall).toMatchObject({ field: 'a', value: 'item', rowIndex: 1, colIndex: 0 });
        });

        it('treats colSpan values of 1, 0 and negative numbers as a single column', () => {
            const rows = makeRows(1);
            const cols: GridColDef<TestRow>[] = [
                { field: 'a', width: 10, colSpan: 1 },
                { field: 'b', width: 20, colSpan: 0 },
                { field: 'c', width: 30, colSpan: -3 },
            ];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            expect(originProps(result.current.getCellColSpanInfo(1, 'a'))).toEqual({ colSpan: 1, width: 10 });
            expect(originProps(result.current.getCellColSpanInfo(1, 'b'))).toEqual({ colSpan: 1, width: 20 });
            expect(originProps(result.current.getCellColSpanInfo(1, 'c'))).toEqual({ colSpan: 1, width: 30 });
        });

        it('a colSpan past the last column only sums existing columns and clamps rightVisibleCellIndex', () => {
            const rows = makeRows(1);
            const cols: GridColDef<TestRow>[] = [
                { field: 'a', width: 50 },
                { field: 'b', width: 70, colSpan: 5 },
                { field: 'c', width: 30 },
            ];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            expect(originProps(result.current.getCellColSpanInfo(1, 'b'))?.width).toBe(100);
            expect(result.current.getCellColSpanInfo(1, 'c')).toEqual({
                spannedByColSpan: true,
                leftVisibleCellIndex: 1,
                rightVisibleCellIndex: 2,
            });
            expect(originProps(result.current.getCellColSpanInfo(1, 'a'))).toEqual({ colSpan: 1, width: 50 });
        });

        it('does not evaluate the colSpan of a column that is covered by an earlier span', () => {
            const rows = makeRows(1);
            const coveredSpan = vi.fn(() => 2);
            const cols: GridColDef<TestRow>[] = [
                { field: 'a', width: 10, colSpan: 2 },
                { field: 'b', width: 10, colSpan: coveredSpan },
                { field: 'c', width: 10 },
            ];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            expect(coveredSpan).not.toHaveBeenCalled();
            expect(result.current.getCellColSpanInfo(1, 'b')?.spannedByColSpan).toBe(true);
            expect(originProps(result.current.getCellColSpanInfo(1, 'c'))).toEqual({ colSpan: 1, width: 10 });
        });

        it('keys entries by row id, including string ids', () => {
            const rows: TestRow[] = [{ id: 'r-1', a: 'x' }, { id: 'r-2', a: 'y' }];
            const cols: GridColDef<TestRow>[] = [{ field: 'a', width: 40 }];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            expect(originProps(result.current.getCellColSpanInfo('r-1', 'a'))).toEqual({ colSpan: 1, width: 40 });
            expect(result.current.getCellColSpanInfo('missing', 'a')).toBeUndefined();
            expect(result.current.getCellColSpanInfo('r-1', 'missing')).toBeUndefined();
        });

        it('recomputes when columnWidths change', () => {
            const rows = makeRows(1);
            const cols: GridColDef<TestRow>[] = [{ field: 'a', width: 100, colSpan: 2 }, { field: 'b', width: 50 }];
            const { result, rerender } = renderHook(
                ({ widths }) => useGridSpanning(rows, cols, widths),
                { initialProps: { widths: NO_WIDTHS } },
            );
            expect(originProps(result.current.getCellColSpanInfo(1, 'a'))?.width).toBe(150);

            rerender({ widths: { b: 80 } });
            expect(originProps(result.current.getCellColSpanInfo(1, 'a'))?.width).toBe(180);
        });

        it('drops entries for rows that are no longer present', () => {
            const cols: GridColDef<TestRow>[] = [{ field: 'a', width: 10 }];
            const { result, rerender } = renderHook(
                ({ rows }) => useGridSpanning(rows, cols, NO_WIDTHS),
                { initialProps: { rows: makeRows(3) } },
            );
            expect(result.current.colspanMap.size).toBe(3);

            rerender({ rows: makeRows(1) });
            expect(result.current.colspanMap.size).toBe(1);
            expect(result.current.getCellColSpanInfo(3, 'a')).toBeUndefined();
        });

        it('resetColSpan clears the colspan map', () => {
            const rows = makeRows(2);
            const cols: GridColDef<TestRow>[] = [{ field: 'a', width: 10 }];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));
            expect(result.current.colspanMap.size).toBe(2);

            act(() => { result.current.resetColSpan(); });
            expect(result.current.colspanMap.size).toBe(0);
            expect(result.current.getCellColSpanInfo(1, 'a')).toBeUndefined();
        });

        it('calculateColSpan computes a column range for one row and keeps other rows', () => {
            const rows = makeRows(2);
            const cols: GridColDef<TestRow>[] = [
                { field: 'a', width: 10 },
                { field: 'b', width: 20, colSpan: 2 },
                { field: 'c', width: 30 },
            ];
            // calculateColSpan reads widths from columnWidths only (falls back to 100).
            const widths: Record<string, number> = { a: 10, b: 20, c: 30 };
            const { result } = renderHook(() => useGridSpanning(rows, cols, widths));
            act(() => { result.current.resetColSpan(); });

            act(() => { result.current.calculateColSpan(1, rows[0], 0, 1, 3); });

            expect(result.current.getCellColSpanInfo(1, 'a')).toBeUndefined();
            expect(originProps(result.current.getCellColSpanInfo(1, 'b'))).toEqual({ colSpan: 2, width: 50 });
            expect(result.current.getCellColSpanInfo(1, 'c')?.spannedByColSpan).toBe(true);
            expect(result.current.getCellColSpanInfo(2, 'b')).toBeUndefined();
        });
    });

    describe('row spanning (rowSpan)', () => {
        it('a static rowSpan hides the following rows and records the origin index', () => {
            const rows = makeRows(5);
            const cols: GridColDef<TestRow>[] = [{ field: 'a', rowSpan: 2 }, { field: 'b' }];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            // rows 1,3,5 are origins; 2,4 are hidden
            expect(result.current.getSpannedCells()).toEqual({ 1: { a: 2 }, 3: { a: 2 }, 5: { a: 2 } });
            expect(result.current.getHiddenCells()).toEqual({ 2: { a: true }, 4: { a: true } });
            expect(result.current.getHiddenCellOriginMap()).toEqual({ 1: { a: 0 }, 3: { a: 2 } });
            expect(result.current.rowSpanningState.processedRange).toEqual({ firstRowIndex: 0, lastRowIndex: 5 });
        });

        it('a rowSpan function receives the valueGetter value and the row index', () => {
            const rows: TestRow[] = [
                { id: 1, k: 'x' },
                { id: 2, k: 'x' },
                { id: 3, k: 'y' },
            ];
            const spanFn = vi.fn((params: GridRenderCellParams<TestRow>) => (params.value === 'X!' ? 2 : 1));
            const cols: GridColDef<TestRow>[] = [
                {
                    field: 'k',
                    valueGetter: ({ row }) => `${String(row.k).toUpperCase()}!`,
                    rowSpan: spanFn,
                },
            ];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            expect(result.current.getSpannedCells()).toEqual({ 1: { k: 2 } });
            expect(result.current.getHiddenCells()).toEqual({ 2: { k: true } });

            const first = spanFn.mock.calls[0]?.[0];
            expect(first).toMatchObject({ field: 'k', value: 'X!', rowIndex: 0, colIndex: 0 });
            // Row 2 is covered, so its rowSpan function is not evaluated.
            expect(spanFn.mock.calls.map(([p]) => p.row.id)).toEqual([1, 3]);
            expect(spanFn.mock.calls[1]?.[0]).toMatchObject({ value: 'Y!', rowIndex: 2 });
        });

        it('computes independent spans per column', () => {
            const rows = makeRows(3);
            const cols: GridColDef<TestRow>[] = [
                { field: 'a', rowSpan: 3 },
                { field: 'b' },
                { field: 'c', rowSpan: ({ rowIndex }) => (rowIndex === 1 ? 2 : 1) },
            ];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            expect(result.current.getSpannedCells()).toEqual({ 1: { a: 3 }, 2: { c: 2 } });
            expect(result.current.getHiddenCells()).toEqual({ 2: { a: true }, 3: { a: true, c: true } });
            expect(result.current.getHiddenCellOriginMap()).toEqual({ 1: { a: 0 }, 2: { a: 0, c: 1 } });
        });

        it('a rowSpan of 1, 0 or a negative number does not span', () => {
            const rows = makeRows(3);
            const cols: GridColDef<TestRow>[] = [
                { field: 'a', rowSpan: 1 },
                { field: 'b', rowSpan: () => 0 },
                { field: 'c', rowSpan: () => -2 },
            ];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            expect(result.current.getSpannedCells()).toEqual({});
            expect(result.current.getHiddenCells()).toEqual({});
        });

        it('a rowSpan past the last row only hides rows that exist', () => {
            const rows = makeRows(2);
            const cols: GridColDef<TestRow>[] = [{ field: 'a', rowSpan: ({ rowIndex }) => (rowIndex === 1 ? 4 : 1) }];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            expect(result.current.getHiddenCells()).toEqual({});
            expect(result.current.getHiddenCellOriginMap()).toEqual({});
        });

        it('recomputes spans against the new row order after sorting', () => {
            const cols: GridColDef<TestRow>[] = [{ field: 'a', rowSpan: ({ rowIndex }) => (rowIndex === 0 ? 2 : 1) }];
            const rows = makeRows(3);
            const { result, rerender } = renderHook(
                ({ r }) => useGridSpanning(r, cols, NO_WIDTHS),
                { initialProps: { r: rows } },
            );
            expect(result.current.getHiddenCells()).toEqual({ 2: { a: true } });

            rerender({ r: [...rows].reverse() });
            expect(result.current.getSpannedCells()).toEqual({ 3: { a: 2 } });
            expect(result.current.getHiddenCells()).toEqual({ 2: { a: true } });
            expect(result.current.getHiddenCellOriginMap()).toEqual({ 1: { a: 0 } });
        });

        it('clears spans when rows are filtered down to nothing', () => {
            const cols: GridColDef<TestRow>[] = [{ field: 'a', rowSpan: 2 }];
            const { result, rerender } = renderHook(
                ({ r }) => useGridSpanning(r, cols, NO_WIDTHS),
                { initialProps: { r: makeRows(4) } },
            );
            expect(Object.keys(result.current.getSpannedCells())).toHaveLength(2);

            rerender({ r: [] });
            expect(result.current.getSpannedCells()).toEqual({});
            expect(result.current.getHiddenCells()).toEqual({});
            expect(result.current.rowSpanningState.processedRange).toEqual({ firstRowIndex: 0, lastRowIndex: 0 });
        });

        it('resetRowSpan clears the row spanning caches', () => {
            const rows = makeRows(2);
            const cols: GridColDef<TestRow>[] = [{ field: 'a', rowSpan: 2 }];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));
            expect(result.current.getSpannedCells()).toEqual({ 1: { a: 2 } });

            act(() => { result.current.resetRowSpan(); });
            expect(result.current.getSpannedCells()).toEqual({});
            expect(result.current.getHiddenCells()).toEqual({});
            expect(result.current.getHiddenCellOriginMap()).toEqual({});
            expect(result.current.rowSpanningState.processedRange).toEqual({ firstRowIndex: 0, lastRowIndex: 0 });
        });

        it('calculateRowSpan only processes the requested range and does not hide rows past its end', () => {
            const rows = makeRows(6);
            const cols: GridColDef<TestRow>[] = [{ field: 'a', rowSpan: 2 }];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            act(() => { result.current.calculateRowSpan(2, 5); });

            expect(result.current.getSpannedCells()).toEqual({ 3: { a: 2 }, 5: { a: 2 } });
            // Row 6 (index 5) is outside the processed range, so it is not hidden.
            expect(result.current.getHiddenCells()).toEqual({ 4: { a: true } });
            expect(result.current.getHiddenCellOriginMap()).toEqual({ 3: { a: 2 } });
            expect(result.current.rowSpanningState.processedRange).toEqual({ firstRowIndex: 2, lastRowIndex: 5 });
        });

        it('rowSpan and colSpan caches are independent', () => {
            const rows = makeRows(2);
            const cols: GridColDef<TestRow>[] = [
                { field: 'a', width: 10, rowSpan: 2, colSpan: 2 },
                { field: 'b', width: 20 },
            ];
            const { result } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));

            expect(originProps(result.current.getCellColSpanInfo(1, 'a'))).toEqual({ colSpan: 2, width: 30 });
            expect(result.current.getCellColSpanInfo(1, 'b')?.spannedByColSpan).toBe(true);
            expect(result.current.getSpannedCells()).toEqual({ 1: { a: 2 } });
            expect(result.current.getHiddenCells()).toEqual({ 2: { a: true } });
        });
    });

    describe('getter identity', () => {
        it('getters are stable across re-renders with the same inputs', () => {
            const rows = makeRows(2);
            const cols: GridColDef<TestRow>[] = [{ field: 'a', rowSpan: 2 }];
            const { result, rerender } = renderHook(() => useGridSpanning(rows, cols, NO_WIDTHS));
            const first = result.current;

            rerender();
            expect(result.current.getSpannedCells).toBe(first.getSpannedCells);
            expect(result.current.getHiddenCells).toBe(first.getHiddenCells);
            expect(result.current.getCellColSpanInfo).toBe(first.getCellColSpanInfo);
            expect(result.current.resetColSpan).toBe(first.resetColSpan);
            expect(result.current.resetRowSpan).toBe(first.resetRowSpan);
        });
    });
});
