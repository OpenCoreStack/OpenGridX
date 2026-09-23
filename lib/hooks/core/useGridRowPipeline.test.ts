import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGridRowPipeline } from './useGridRowPipeline';

const DEFAULT_PAGINATION = { page: 0, pageSize: 3 };

const ROWS = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
    { id: 3, name: 'Carol', age: 35 },
    { id: 4, name: 'Dan', age: 28 },
    { id: 5, name: 'Eve', age: 22 },
];

const BASE_PARAMS = {
    effectiveRows: ROWS,
    activeHierarchyHandlers: null,
    filterMode: 'client',
    filterModel: { items: [] },
    sortModel: [],
    sortingMode: 'client',
    pagination: false,
    paginationMode: 'client',
    effectivePaginationModel: DEFAULT_PAGINATION,
};

describe('useGridRowPipeline — filtering', () => {
    it('passes all rows through when filterModel is empty', () => {
        const { result } = renderHook(() => useGridRowPipeline(BASE_PARAMS));
        expect(result.current.filteredRows).toHaveLength(5);
    });

    it('filters rows by string contains operator', () => {
        const { result } = renderHook(() => useGridRowPipeline({
            ...BASE_PARAMS,
            filterModel: { items: [{ id: 'f1', field: 'name', operator: 'contains' as const, value: 'al' }] },
        }));
        // 'Alice' contains 'al' (case-insensitive); 'Carol' does not ('car-o-l')
        expect(result.current.filteredRows.map(r => r.id)).toEqual([1]);
    });

    it('filterMode=server passes rows through unfiltered, with or without a dataSource', () => {
        const { result } = renderHook(() => useGridRowPipeline({
            ...BASE_PARAMS,
            filterMode: 'server',
            filterModel: { items: [{ id: 'f1', field: 'name', operator: 'contains' as const, value: 'Alice' }] },
        }));
        expect(result.current.filteredRows).toHaveLength(5);
    });
});

describe('useGridRowPipeline — sorting', () => {
    it('sorts rows ascending by field', () => {
        const { result } = renderHook(() => useGridRowPipeline({
            ...BASE_PARAMS,
            sortModel: [{ field: 'age', sort: 'asc' }],
        }));
        const ages = result.current.sortedUnpinnedRows.map(r => r.age);
        expect(ages).toEqual([22, 25, 28, 30, 35]);
    });

    it('sorts rows descending by field', () => {
        const { result } = renderHook(() => useGridRowPipeline({
            ...BASE_PARAMS,
            sortModel: [{ field: 'age', sort: 'desc' }],
        }));
        const ages = result.current.sortedUnpinnedRows.map(r => r.age);
        expect(ages).toEqual([35, 30, 28, 25, 22]);
    });

    it('sortingMode=server passes rows through unsorted, with or without a dataSource', () => {
        const { result } = renderHook(() => useGridRowPipeline({
            ...BASE_PARAMS,
            sortingMode: 'server',
            sortModel: [{ field: 'age', sort: 'asc' }],
        }));
        // Rows stay in original order
        expect(result.current.sortedUnpinnedRows.map(r => r.id)).toEqual([1, 2, 3, 4, 5]);
    });
});

describe('useGridRowPipeline — pagination', () => {
    it('returns first pageSize rows on page 0', () => {
        const { result } = renderHook(() => useGridRowPipeline({
            ...BASE_PARAMS,
            pagination: true,
            effectivePaginationModel: { page: 0, pageSize: 3 },
        }));
        expect(result.current.paginatedUnpinnedRows.map(r => r.id)).toEqual([1, 2, 3]);
    });

    it('returns correct offset slice on page 1', () => {
        const { result } = renderHook(() => useGridRowPipeline({
            ...BASE_PARAMS,
            pagination: true,
            effectivePaginationModel: { page: 1, pageSize: 3 },
        }));
        expect(result.current.paginatedUnpinnedRows.map(r => r.id)).toEqual([4, 5]);
    });

    it('paginationMode=server returns all rows unsliced, with or without a dataSource', () => {
        const { result } = renderHook(() => useGridRowPipeline({
            ...BASE_PARAMS,
            pagination: true,
            paginationMode: 'server',
            effectivePaginationModel: { page: 1, pageSize: 2 },
        }));
        expect(result.current.paginatedUnpinnedRows).toHaveLength(5);
    });
});

describe('useGridRowPipeline — page clamping', () => {
    it('shows the last page when the requested page is past the end', () => {
        const { result } = renderHook(() => useGridRowPipeline({
            ...BASE_PARAMS,
            pagination: true,
            effectivePaginationModel: { page: 4, pageSize: 3 },
        }));
        expect(result.current.currentPage).toBe(1);
        expect(result.current.paginatedUnpinnedRows.map(r => r.id)).toEqual([4, 5]);
    });

    it('re-clamps when the rows shrink', () => {
        const { result, rerender } = renderHook(
            ({ rows }) => useGridRowPipeline({
                ...BASE_PARAMS,
                effectiveRows: rows,
                pagination: true,
                effectivePaginationModel: { page: 1, pageSize: 3 },
            }),
            { initialProps: { rows: ROWS } },
        );
        expect(result.current.paginatedUnpinnedRows.map(r => r.id)).toEqual([4, 5]);
        rerender({ rows: ROWS.slice(0, 2) });
        expect(result.current.currentPage).toBe(0);
        expect(result.current.paginatedUnpinnedRows.map(r => r.id)).toEqual([1, 2]);
    });

    it('treats a page size of 0 as 1', () => {
        const { result } = renderHook(() => useGridRowPipeline({
            ...BASE_PARAMS,
            pagination: true,
            effectivePaginationModel: { page: 1, pageSize: 0 },
        }));
        expect(result.current.paginatedUnpinnedRows.map(r => r.id)).toEqual([2]);
    });

    it('leaves the page alone in server mode, where the server owns the page count', () => {
        const { result } = renderHook(() => useGridRowPipeline({
            ...BASE_PARAMS,
            pagination: true,
            paginationMode: 'server',
            effectivePaginationModel: { page: 7, pageSize: 2 },
        }));
        expect(result.current.currentPage).toBe(7);
    });
});

describe('useGridRowPipeline — allRenderableRows', () => {
    it('holds only real rows in infinite mode (loading placeholders are drawn by GridVirtualRows)', () => {
        const { result } = renderHook(() => useGridRowPipeline({
            ...BASE_PARAMS,
            paginationMode: 'infinite',
        }));
        expect(result.current.allRenderableRows.map(r => r.id)).toEqual([1, 2, 3, 4, 5]);
    });

    it('is the current page under tree data or row grouping, as the grid renders it', () => {
        const { result } = renderHook(() => useGridRowPipeline({
            ...BASE_PARAMS,
            activeHierarchyHandlers: { getVisibleRows: () => ROWS },
            pagination: true,
            effectivePaginationModel: { page: 1, pageSize: 3 },
        }));
        expect(result.current.allRenderableRows.map(r => r.id)).toEqual([4, 5]);
    });
});
