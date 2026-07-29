import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAggregation, formatAggregationValue } from './useAggregation';

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
});
