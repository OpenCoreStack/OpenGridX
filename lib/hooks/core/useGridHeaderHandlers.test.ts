import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { nextSortModelForColumn, useGridColumnMenuHandlers, useGridSortHandlers } from './useGridHeaderHandlers';
import type { GridColumnPinning, GridColumnVisibilityModel, GridSortItem } from '../../types';

describe('nextSortModelForColumn (header, keyboard and apiRef.sortColumn)', () => {
    const model: GridSortItem[] = [{ field: 'a', sort: 'desc' }, { field: 'b', sort: 'asc' }];

    it('replaces the model with one column, or adds / updates it with multiSort', () => {
        expect(nextSortModelForColumn(model, 'b', 'desc', false)).toEqual([{ field: 'b', sort: 'desc' }]);
        expect(nextSortModelForColumn(model, 'b', 'desc', true)).toEqual([{ field: 'a', sort: 'desc' }, { field: 'b', sort: 'desc' }]);
        expect(nextSortModelForColumn(model, 'c', 'asc', true)).toEqual([...model, { field: 'c', sort: 'asc' }]);
    });

    it('null removes only that column', () => {
        expect(nextSortModelForColumn(model, 'a', null, false)).toEqual([{ field: 'b', sort: 'asc' }]);
        expect(nextSortModelForColumn(model, 'a', null, true)).toEqual([{ field: 'b', sort: 'asc' }]);
    });
});

describe('useGridSortHandlers', () => {
    it('goes through the one sort handler with the shared transition', () => {
        const onSortModelChange = vi.fn();
        const sortModel: GridSortItem[] = [{ field: 'a', sort: 'asc' }];
        const { result } = renderHook(() => useGridSortHandlers({ sortModel, onSortModelChange }));
        act(() => { result.current.handleSort('b', 'asc'); });
        act(() => { result.current.handleSortAdd('b', 'desc'); });
        expect(onSortModelChange.mock.calls).toEqual([
            [nextSortModelForColumn(sortModel, 'b', 'asc', false)],
            [nextSortModelForColumn(sortModel, 'b', 'desc', true)],
        ]);
    });
});

describe('useGridColumnMenuHandlers', () => {
    it('two hides in one tick both stick', () => {
        const onColumnVisibilityModelChange = vi.fn<(model: GridColumnVisibilityModel) => void>();
        const { result } = renderHook(() => useGridColumnMenuHandlers({
            columnVisibilityModel: { c: false },
            onColumnVisibilityModelChange,
            pinnedColumns: {},
            onPinnedColumnsChange: () => {},
        }));
        act(() => {
            result.current.handleHideColumn('a');
            result.current.handleHideColumn('b');
        });
        expect(onColumnVisibilityModelChange.mock.calls[1][0]).toEqual({ c: false, a: false, b: false });
    });

    it('two pins in one tick both stick', () => {
        const onPinnedColumnsChange = vi.fn<(model: GridColumnPinning) => void>();
        const { result } = renderHook(() => useGridColumnMenuHandlers({
            columnVisibilityModel: {},
            onColumnVisibilityModelChange: () => {},
            pinnedColumns: {},
            onPinnedColumnsChange,
        }));
        act(() => {
            result.current.handlePinColumn('a', 'left');
            result.current.handlePinColumn('b', 'right');
        });
        const last = onPinnedColumnsChange.mock.calls[1][0];
        expect(last.left).toEqual(['a']);
        expect(last.right).toEqual(['b']);
    });

    it('a controlled parent that rejects a hide does not carry it into the next one', () => {
        const onColumnVisibilityModelChange = vi.fn<(model: GridColumnVisibilityModel) => void>();
        const { result, rerender } = renderHook(() => useGridColumnMenuHandlers({
            columnVisibilityModel: {},
            onColumnVisibilityModelChange,
            pinnedColumns: {},
            onPinnedColumnsChange: () => {},
        }));
        act(() => { result.current.handleHideColumn('a'); });
        rerender();
        act(() => { result.current.handleHideColumn('b'); });
        expect(onColumnVisibilityModelChange.mock.calls[1][0]).toEqual({ b: false });
    });
});
