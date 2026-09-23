import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAggregation, formatAggregationValue } from './useAggregation';
import type { GridAggregationResult, GridDataSource, GridFilterModel, GridRowModel } from '../../types';

const ROWS = [
    { id: 1, salary: 50000, dept: 'Eng', active: true },
    { id: 2, salary: 60000, dept: 'Eng', active: false },
    { id: 3, salary: 70000, dept: 'HR', active: true },
    { id: 4, salary: null, dept: 'HR', active: true },
    { id: 5, salary: 80000, dept: 'Eng', active: null },
];

describe('formatAggregationValue', () => {
    it('returns em-dash for null', () => {
        expect(formatAggregationValue(null, 'sum')).toBe('—');
    });
    it('formats avg with up to 2 decimal places', () => {
        expect(formatAggregationValue(1234.5678, 'avg')).toBe('1,234.57');
    });
    it('formats non-avg numbers without decimals', () => {
        expect(formatAggregationValue(1234567, 'sum')).toBe('1,234,567');
    });
    it('converts non-numeric to string', () => {
        expect(formatAggregationValue('Engineering', 'unique')).toBe('Engineering');
    });
});

describe('useAggregation — client-side', () => {
    it('returns empty result when no aggregation model', () => {
        const { result } = renderHook(() =>
            useAggregation({ rows: ROWS, aggregationModel: {}, isServerSide: false })
        );
        expect(result.current.aggregationResult).toEqual({});
    });

    it('computes sum correctly, skipping nulls', () => {
        const { result } = renderHook(() =>
            useAggregation({
                rows: ROWS,
                aggregationModel: { salary: 'sum' },
                isServerSide: false,
            })
        );
        expect(result.current.aggregationResult.salary).toBe(260000);
    });

    it('computes avg correctly', () => {
        const { result } = renderHook(() =>
            useAggregation({
                rows: ROWS,
                aggregationModel: { salary: 'avg' },
                isServerSide: false,
            })
        );
        expect(result.current.aggregationResult.salary).toBeCloseTo(65000);
    });

    it('computes count of non-null values', () => {
        const { result } = renderHook(() =>
            useAggregation({
                rows: ROWS,
                aggregationModel: { salary: 'count' },
                isServerSide: false,
            })
        );
        expect(result.current.aggregationResult.salary).toBe(4);
    });

    it('computes min and max', () => {
        const { result } = renderHook(() =>
            useAggregation({
                rows: ROWS,
                aggregationModel: { salary: 'min' },
                isServerSide: false,
            })
        );
        expect(result.current.aggregationResult.salary).toBe(50000);

        const { result: r2 } = renderHook(() =>
            useAggregation({
                rows: ROWS,
                aggregationModel: { salary: 'max' },
                isServerSide: false,
            })
        );
        expect(r2.current.aggregationResult.salary).toBe(80000);
    });

    it('computes unique count', () => {
        const { result } = renderHook(() =>
            useAggregation({
                rows: ROWS,
                aggregationModel: { dept: 'unique' },
                isServerSide: false,
            })
        );
        expect(result.current.aggregationResult.dept).toBe(2);
    });

    it('handles unknown function gracefully — skips the field', () => {
        const { result } = renderHook(() =>
            useAggregation({
                rows: ROWS,
                aggregationModel: { salary: 'median' as 'sum' },
                isServerSide: false,
            })
        );
        expect(result.current.aggregationResult.salary).toBeUndefined();
    });

    it('returns {} and does not mutate state when isServerSide=true', () => {
        const { result } = renderHook(() =>
            useAggregation({
                rows: ROWS,
                aggregationModel: { salary: 'sum' },
                isServerSide: true,
            })
        );
        // No dataSource → serverResult stays {}
        expect(result.current.aggregationResult).toEqual({});
    });

    it('returns serverAggregationResults when provided', () => {
        const serverResults = { salary: 999999 };
        const { result } = renderHook(() =>
            useAggregation({
                rows: ROWS,
                aggregationModel: { salary: 'sum' },
                isServerSide: true,
                serverAggregationResults: serverResults,
            })
        );
        expect(result.current.aggregationResult).toEqual(serverResults);
    });

    it('skips aggregation when function not in availableAggregationFunctions', () => {
        const columns = [{ field: 'salary', availableAggregationFunctions: ['avg', 'count'] }];
        const { result } = renderHook(() =>
            useAggregation({
                rows: ROWS,
                columns,
                aggregationModel: { salary: 'sum' },
                isServerSide: false,
            })
        );
        // 'sum' is not in the allowed list, so the result should be absent
        expect(result.current.aggregationResult.salary).toBeUndefined();
    });

    it('computes aggregation when function is in availableAggregationFunctions', () => {
        const columns = [{ field: 'salary', availableAggregationFunctions: ['sum', 'avg'] }];
        const { result } = renderHook(() =>
            useAggregation({
                rows: ROWS,
                columns,
                aggregationModel: { salary: 'sum' },
                isServerSide: false,
            })
        );
        expect(result.current.aggregationResult.salary).toBe(260000);
    });

    it('does not restrict aggregation when availableAggregationFunctions is absent', () => {
        const columns = [{ field: 'salary' }];
        const { result } = renderHook(() =>
            useAggregation({
                rows: ROWS,
                columns,
                aggregationModel: { salary: 'sum' },
                isServerSide: false,
            })
        );
        expect(result.current.aggregationResult.salary).toBe(260000);
    });
});

describe('useAggregation — server side (getAggregations)', () => {
    const rows: GridRowModel[] = [{ id: 1, salary: 10 }, { id: 2, salary: 20 }];
    const NO_SORT: never[] = [];
    const makeSource = (getAggregations: GridDataSource<GridRowModel>['getAggregations']) =>
        ({ getRows: vi.fn(), getAggregations }) as unknown as GridDataSource<GridRowModel>;

    it('does not refetch when the parent re-renders with an equal inline model or filter', async () => {
        const getAggregations = vi.fn(async () => ({ salary: 999 }));
        const dataSource = makeSource(getAggregations);
        const { result, rerender } = renderHook(({ model, filter }) => useAggregation({
            rows, aggregationModel: model, isServerSide: true, dataSource, filterModel: filter, sortModel: NO_SORT,
        }), { initialProps: { model: { salary: 'sum' } as Record<string, string>, filter: { items: [] } as GridFilterModel } });
        await waitFor(() => expect(result.current.aggregationResult).toEqual({ salary: 999 }));
        for (let i = 0; i < 3; i++) {
            rerender({ model: { salary: 'sum' }, filter: { items: [] } });
            await act(async () => { await Promise.resolve(); });
            expect(result.current.aggregationResult).toEqual({ salary: 999 });
        }
        expect(getAggregations).toHaveBeenCalledTimes(1);
    });

    it('shows no result, not the previous function\'s, while the request for a new model is pending', async () => {
        let resolveSecond: (v: GridAggregationResult) => void = () => {};
        const getAggregations = vi.fn()
            .mockImplementationOnce(async () => ({ salary: 30 }))
            .mockImplementationOnce(() => new Promise(r => { resolveSecond = r; }));
        const dataSource = makeSource(getAggregations);
        const { result, rerender } = renderHook(({ model }) => useAggregation({
            rows, aggregationModel: model, isServerSide: true, dataSource, sortModel: NO_SORT,
        }), { initialProps: { model: { salary: 'sum' } as Record<string, string> } });
        await waitFor(() => expect(result.current.aggregationResult).toEqual({ salary: 30 }));

        rerender({ model: { salary: 'avg' } });
        expect(result.current.aggregationResult).toEqual({});
        expect(result.current.isLoading).toBe(true);

        await act(async () => { resolveSecond({ salary: 15 }); });
        expect(result.current.aggregationResult).toEqual({ salary: 15 });
        expect(result.current.isLoading).toBe(false);
    });

    it('drops the previous filter\'s totals and reports the error when the new request fails', async () => {
        const failure = new Error('boom');
        const getAggregations = vi.fn()
            .mockImplementationOnce(async () => ({ salary: 30 }))
            .mockImplementationOnce(async () => { throw failure; });
        const dataSource = makeSource(getAggregations);
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const model = { salary: 'sum' };
        const { result, rerender } = renderHook(({ filter }) => useAggregation({
            rows, aggregationModel: model, isServerSide: true, dataSource, filterModel: filter, sortModel: NO_SORT,
        }), { initialProps: { filter: { items: [] } as GridFilterModel } });
        await waitFor(() => expect(result.current.aggregationResult).toEqual({ salary: 30 }));

        rerender({ filter: { items: [{ field: 'salary', operator: '>', value: 15 }] } });
        await waitFor(() => expect(result.current.error).toBe(failure));
        expect(result.current.aggregationResult).toEqual({});
        expect(result.current.isLoading).toBe(false);
        errSpy.mockRestore();
    });
});
