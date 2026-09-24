import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { columnsShallowEqual, useStableColumns } from './useStableColumns';
import type { GridColDef } from '../../types';

const getter = () => 1;

describe('useStableColumns', () => {
    it('keeps the first array while each column is shallowly equal', () => {
        const make = (): GridColDef[] => [{ field: 'a', width: 100, valueGetter: getter }, { field: 'b' }];
        const first = make();
        const { result, rerender } = renderHook(({ columns }) => useStableColumns(columns), { initialProps: { columns: first } });
        rerender({ columns: make() });
        rerender({ columns: make() });
        expect(result.current).toBe(first);
    });

    it('takes the new array when a property or callback changes', () => {
        const first: GridColDef[] = [{ field: 'a', valueGetter: getter }];
        const { result, rerender } = renderHook(({ columns }) => useStableColumns(columns), { initialProps: { columns: first } });
        const newCallback: GridColDef[] = [{ field: 'a', valueGetter: () => 1 }];
        rerender({ columns: newCallback });
        expect(result.current).toBe(newCallback);
        const newWidth: GridColDef[] = [{ field: 'a', valueGetter: () => 1, width: 5 }];
        rerender({ columns: newWidth });
        expect(result.current).toBe(newWidth);
    });
});

describe('columnsShallowEqual', () => {
    it('compares length, keys and values by identity', () => {
        expect(columnsShallowEqual([{ field: 'a' }], [{ field: 'a' }])).toBe(true);
        expect(columnsShallowEqual([{ field: 'a' }], [{ field: 'a' }, { field: 'b' }])).toBe(false);
        expect(columnsShallowEqual([{ field: 'a' }], [{ field: 'a', width: 1 }])).toBe(false);
        expect(columnsShallowEqual([{ field: 'a', valueOptions: ['x'] }], [{ field: 'a', valueOptions: ['x'] }])).toBe(false);
    });
});
