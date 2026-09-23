import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGridControlledState, getDefaultPageSize } from './useGridControlledState';
import type { GridInitialState } from '../../state/types';

const BASE_PARAMS = {
    sortModel: undefined,
    paginationModel: undefined,
    rowSelectionModel: undefined,
};

describe('useGridControlledState — sort', () => {
    it('uncontrolled: setInternalSortModel updates sortModel', () => {
        const { result } = renderHook(() => useGridControlledState(BASE_PARAMS));
        expect(result.current.sortModel).toEqual([]);
        act(() => {
            result.current.setInternalSortModel([{ field: 'name', sort: 'asc' }]);
        });
        expect(result.current.sortModel).toEqual([{ field: 'name', sort: 'asc' }]);
    });

    it('controlled: external sortModel prop always wins', () => {
        const externalSort = [{ field: 'age', sort: 'desc' as const }];
        const { result } = renderHook(() =>
            useGridControlledState({ ...BASE_PARAMS, sortModel: externalSort })
        );
        expect(result.current.isSortControlled).toBe(true);
        expect(result.current.sortModel).toEqual(externalSort);
        act(() => {
            result.current.setInternalSortModel([{ field: 'name', sort: 'asc' }]);
        });
        // External prop still wins
        expect(result.current.sortModel).toEqual(externalSort);
    });

    it('initialState.sorting seeds the internal sort model', () => {
        const { result } = renderHook(() =>
            useGridControlledState({
                ...BASE_PARAMS,
                initialState: { sorting: { sortModel: [{ field: 'name', sort: 'asc' }] } },
            })
        );
        expect(result.current.sortModel).toEqual([{ field: 'name', sort: 'asc' }]);
    });
});

describe('useGridControlledState — pagination', () => {
    it('uncontrolled: handlePaginationModelChange updates effectivePaginationModel', () => {
        const { result } = renderHook(() => useGridControlledState(BASE_PARAMS));
        act(() => {
            result.current.handlePaginationModelChange({ page: 2, pageSize: 25 });
        });
        expect(result.current.effectivePaginationModel).toEqual({ page: 2, pageSize: 25 });
    });

    it('controlled: external paginationModel always wins', () => {
        const externalPagination = { page: 3, pageSize: 50 };
        const { result } = renderHook(() =>
            useGridControlledState({ ...BASE_PARAMS, paginationModel: externalPagination })
        );
        expect(result.current.effectivePaginationModel).toEqual(externalPagination);
        act(() => {
            result.current.handlePaginationModelChange({ page: 0, pageSize: 10 });
        });
        expect(result.current.effectivePaginationModel).toEqual(externalPagination);
    });

    it('initialState.pagination seeds page and pageSize', () => {
        const { result } = renderHook(() =>
            useGridControlledState({
                ...BASE_PARAMS,
                initialState: { pagination: { paginationModel: { page: 1, pageSize: 25 } } },
            })
        );
        expect(result.current.effectivePaginationModel).toEqual({ page: 1, pageSize: 25 });
    });
});

describe('useGridControlledState — selection', () => {
    it('uncontrolled: setInternalRowSelectionModel updates selectedRowIds', () => {
        const { result } = renderHook(() => useGridControlledState(BASE_PARAMS));
        act(() => {
            result.current.setInternalRowSelectionModel([1, 2, 3]);
        });
        expect(result.current.selectedRowIds).toEqual(new Set([1, 2, 3]));
    });
});

describe('useGridControlledState — filter', () => {
    const BOB = { items: [{ field: 'name', operator: 'equals' as const, value: 'Bob' }] };

    it('initialState.filter seeds the internal filter model', () => {
        const { result } = renderHook(() =>
            useGridControlledState({ ...BASE_PARAMS, initialState: { filter: { filterModel: BOB } } })
        );
        expect(result.current.isFilterControlled).toBe(false);
        expect(result.current.filterModel).toEqual(BOB);
    });

    it('uncontrolled: handleFilterModelChange updates the model and fires the callback', () => {
        const onFilterModelChange = vi.fn();
        const { result } = renderHook(() => useGridControlledState({ ...BASE_PARAMS, onFilterModelChange }));
        expect(result.current.filterModel).toEqual({ items: [] });
        act(() => { result.current.handleFilterModelChange(BOB); });
        expect(result.current.filterModel).toEqual(BOB);
        expect(onFilterModelChange).toHaveBeenCalledWith(BOB);
    });

    it('controlled: the filterModel prop wins over handleFilterModelChange', () => {
        const controlled = { items: [] };
        const { result } = renderHook(() => useGridControlledState({ ...BASE_PARAMS, filterModel: controlled }));
        act(() => { result.current.handleFilterModelChange(BOB); });
        expect(result.current.filterModel).toBe(controlled);
    });
});

describe('useGridControlledState — default page size', () => {
    it('is 100 when pageSizeOptions offers it (or is not given)', () => {
        expect(getDefaultPageSize(undefined)).toBe(100);
        expect(getDefaultPageSize([10, 25, 50, 100])).toBe(100);
        const { result } = renderHook(() => useGridControlledState(BASE_PARAMS));
        expect(result.current.effectivePaginationModel).toEqual({ page: 0, pageSize: 100 });
    });

    it('is the first option when 100 is not offered', () => {
        const { result } = renderHook(() => useGridControlledState({ ...BASE_PARAMS, pageSizeOptions: [5, 10, 20] }));
        expect(result.current.effectivePaginationModel).toEqual({ page: 0, pageSize: 5 });
    });
});

describe('useGridControlledState — density', () => {
    it('uses the prop, then initialState.density, then standard', () => {
        expect(renderHook(() => useGridControlledState(BASE_PARAMS)).result.current.density).toBe('standard');
        expect(renderHook(() => useGridControlledState({ ...BASE_PARAMS, initialState: { density: { density: 'compact' } } })).result.current.density).toBe('compact');
        expect(renderHook(() => useGridControlledState({ ...BASE_PARAMS, density: 'comfortable', initialState: { density: { density: 'compact' } } })).result.current.density).toBe('comfortable');
    });
});

describe('GridInitialState', () => {
    it('accepts a partial columns state', () => {
        // Type-level check: this literal did not compile while columnWidths and columnOrder were required.
        const initialState: GridInitialState = { columns: { columnVisibilityModel: { age: false } } };
        const { result } = renderHook(() => useGridControlledState({ ...BASE_PARAMS, initialState }));
        expect(result.current.columnVisibilityModel).toEqual({ age: false });
    });
});
