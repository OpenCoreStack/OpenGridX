import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGridControlledState } from './useGridControlledState';

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
