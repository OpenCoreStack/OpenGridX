import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useShallowStableValue } from './useShallowStableValue';

describe('useShallowStableValue', () => {
    it('keeps the first object while new ones hold the same entries', () => {
        const fn = () => 'x';
        const first = { a: 'A', ops: { contains: 'enthält' }, f: fn };
        const { result, rerender } = renderHook(({ v }) => useShallowStableValue(v), { initialProps: { v: first } });
        rerender({ v: { a: 'A', ops: { contains: 'enthält' }, f: fn } });
        expect(result.current).toBe(first);
    });

    it('takes a new object when an entry changes, including a new function', () => {
        const first = { a: 'A', f: () => 'x' };
        const { result, rerender } = renderHook(({ v }) => useShallowStableValue(v), { initialProps: { v: first } });
        const changed = { a: 'B', f: first.f };
        rerender({ v: changed });
        expect(result.current).toBe(changed);
        const newFn = { a: 'B', f: () => 'x' };
        rerender({ v: newFn });
        expect(result.current).toBe(newFn);
    });

    it('handles undefined and swaps between object and undefined', () => {
        const initialProps: { v: { a: string } | undefined } = { v: undefined };
        const { result, rerender } = renderHook(({ v }) => useShallowStableValue(v), { initialProps });
        expect(result.current).toBeUndefined();
        const obj = { a: 'x' };
        rerender({ v: obj });
        expect(result.current).toBe(obj);
        rerender({ v: undefined });
        expect(result.current).toBeUndefined();
    });
});
