import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, renderHook, act, fireEvent } from '@testing-library/react';
import { DataGrid } from '../components/DataGrid/DataGrid';
import { useGridStateStorage } from './useGridStateStorage';
import type { GridState } from './types';
import type { GridColDef, GridRowModel } from '../types';

function memStorage(initial: Record<string, string> = {}) {
    const m = new Map<string, string>(Object.entries(initial));
    return {
        getItem: vi.fn((k: string) => m.get(k) ?? null),
        setItem: vi.fn((k: string, v: string) => { m.set(k, v); }),
        removeItem: vi.fn((k: string) => { m.delete(k); }),
        m,
    };
}

const SORT_ASC: GridState = { sorting: { sortModel: [{ field: 'a', sort: 'asc' }] } };

afterEach(() => {
    vi.useRealTimers();
});

describe('useGridStateStorage', () => {
    it('falls back to no persistence when reading window.localStorage throws', () => {
        const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            get() { throw new DOMException('Access is denied', 'SecurityError'); },
        });
        try {
            const { result } = renderHook(() => useGridStateStorage('k'));
            expect(result.current.initialState).toBeUndefined();
            expect(() => act(() => { result.current.onStateChange(SORT_ASC); })).not.toThrow();
            expect(() => act(() => { result.current.clearState(); })).not.toThrow();
        } finally {
            if (original) Object.defineProperty(window, 'localStorage', original);
        }
    });

    it('debounces writes into a single setItem', () => {
        vi.useFakeTimers();
        const storage = memStorage();
        const { result } = renderHook(() => useGridStateStorage({ key: 'k', storage }));
        act(() => {
            result.current.onStateChange({ sorting: { sortModel: [] } });
            result.current.onStateChange(SORT_ASC);
        });
        act(() => { vi.advanceTimersByTime(400); });
        expect(storage.setItem).toHaveBeenCalledTimes(1);
        expect(JSON.parse(storage.m.get('k')!)).toEqual(SORT_ASC);
    });

    it('clearState cancels a pending debounced write', () => {
        vi.useFakeTimers();
        const storage = memStorage();
        const { result } = renderHook(() => useGridStateStorage({ key: 'k', storage }));
        act(() => { result.current.onStateChange(SORT_ASC); });
        act(() => { result.current.clearState(); });
        act(() => { vi.advanceTimersByTime(400); });
        expect(storage.m.has('k')).toBe(false);
    });

    it('clearState is not undone by the unmount flush after the timer already fired', () => {
        vi.useFakeTimers();
        const storage = memStorage();
        const { result, unmount } = renderHook(() => useGridStateStorage({ key: 'k', storage }));
        act(() => { result.current.onStateChange(SORT_ASC); });
        act(() => { vi.advanceTimersByTime(400); });
        expect(storage.m.has('k')).toBe(true);
        act(() => { result.current.clearState(); });
        unmount();
        expect(storage.m.has('k')).toBe(false);
    });

    it('still flushes a pending write on unmount', () => {
        vi.useFakeTimers();
        const storage = memStorage();
        const { result, unmount } = renderHook(() => useGridStateStorage({ key: 'k', storage }));
        act(() => { result.current.onStateChange(SORT_ASC); });
        unmount();
        expect(JSON.parse(storage.m.get('k')!)).toEqual(SORT_ASC);
    });

    it('does not write on bare re-renders with an inline include array', () => {
        vi.useFakeTimers();
        const storage = memStorage();
        const { result, rerender } = renderHook(() => useGridStateStorage({ key: 'k', storage, include: ['sorting'] }));
        act(() => { result.current.onStateChange(SORT_ASC); });
        act(() => { vi.advanceTimersByTime(400); });
        const writes = storage.setItem.mock.calls.length;
        for (let i = 0; i < 5; i++) rerender();
        expect(storage.setItem.mock.calls.length).toBe(writes);
    });

    it('reads storage once per key even when the storage object is recreated on every render', () => {
        const m = new Map<string, string>([['k', JSON.stringify(SORT_ASC)]]);
        const getItem = vi.fn((k: string) => m.get(k) ?? null);
        const { result, rerender } = renderHook(() => useGridStateStorage({
            key: 'k',
            storage: { getItem, setItem: (k, v) => { m.set(k, v); }, removeItem: (k) => { m.delete(k); } },
        }));
        const first = result.current.initialState;
        rerender();
        rerender();
        expect(getItem).toHaveBeenCalledTimes(1);
        expect(result.current.initialState).toBe(first);
        expect(first).toEqual(SORT_ASC);
    });

    it('writes a pending state to the key it was made for when the key changes', () => {
        vi.useFakeTimers();
        const storage = memStorage();
        const { result, rerender } = renderHook(({ k }) => useGridStateStorage({ key: k, storage }), { initialProps: { k: 'user-a' } });
        act(() => { result.current.onStateChange(SORT_ASC); });
        rerender({ k: 'user-b' });
        act(() => { result.current.onStateChange({ sorting: { sortModel: [] } }); });
        act(() => { vi.advanceTimersByTime(400); });
        expect(JSON.parse(storage.m.get('user-a')!)).toEqual(SORT_ASC);
        expect(JSON.parse(storage.m.get('user-b')!)).toEqual({ sorting: { sortModel: [] } });
    });

    it('loads the new key\'s state when the key changes', () => {
        const storage = memStorage({ 'user-b': JSON.stringify(SORT_ASC) });
        const { result, rerender } = renderHook(({ k }) => useGridStateStorage({ key: k, storage }), { initialProps: { k: 'user-a' } });
        expect(result.current.initialState).toBeUndefined();
        rerender({ k: 'user-b' });
        expect(result.current.initialState).toEqual(SORT_ASC);
    });
});

describe('useGridStateStorage with a DataGrid keyed by the storage key', () => {
    const rows: GridRowModel[] = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }];
    const cols: GridColDef[] = [{ field: 'name', width: 100 }, { field: 'x', width: 100 }];
    const names = (container: HTMLElement) =>
        Array.from(container.querySelectorAll('.ogx__row')).map(r => r.querySelector('[role="gridcell"]')?.textContent ?? '');

    it('restores the new key\'s state and never writes the previous key\'s state into it', () => {
        vi.useFakeTimers();
        const storage = memStorage({
            'user-a': JSON.stringify({ sorting: { sortModel: [{ field: 'name', sort: 'asc' }] } }),
            'user-b': JSON.stringify({ sorting: { sortModel: [{ field: 'name', sort: 'desc' }] } }),
        });
        function Host({ user }: { user: string }) {
            const storageKey = `user-${user}`;
            const { initialState, onStateChange } = useGridStateStorage({ key: storageKey, storage });
            return <DataGrid key={storageKey} rows={rows} columns={cols} initialState={initialState} onStateChange={onStateChange} />;
        }
        const { rerender, container } = render(<Host user="a" />);
        act(() => { vi.advanceTimersByTime(400); });
        expect(names(container)).toEqual(['a', 'b']);

        rerender(<Host user="b" />);
        act(() => { vi.advanceTimersByTime(400); });
        expect(names(container)).toEqual(['b', 'a']);

        fireEvent.click(container.querySelectorAll('[role="columnheader"]')[1] as HTMLElement);
        act(() => { vi.advanceTimersByTime(400); });
        const storedB = JSON.parse(storage.m.get('user-b')!) as GridState;
        expect(storedB.sorting?.sortModel).toEqual([{ field: 'x', sort: 'asc' }]);
        const storedA = JSON.parse(storage.m.get('user-a')!) as GridState;
        expect(storedA.sorting?.sortModel).toEqual([{ field: 'name', sort: 'asc' }]);
    });
});
