import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type React from 'react';
import { useColumnReorder } from './useColumnReorder';
import type { UseColumnReorderProps } from './useColumnReorder';
import type { GridColDef, GridColumnOrderChangeParams } from '../types';

interface FakeDragEvent {
    preventDefault: ReturnType<typeof vi.fn>;
    dataTransfer: {
        effectAllowed: string;
        dropEffect: string;
        setData: ReturnType<typeof vi.fn>;
    };
}

function makeEvent(): { fake: FakeDragEvent; event: React.DragEvent } {
    const fake: FakeDragEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { effectAllowed: 'none', dropEffect: 'none', setData: vi.fn() },
    };
    return { fake, event: fake as unknown as React.DragEvent };
}

const COLUMNS: GridColDef[] = [
    { field: 'a' },
    { field: 'b' },
    { field: 'c' },
    { field: 'd' },
];

function setup(overrides: Partial<UseColumnReorderProps> = {}) {
    const onColumnOrderChange = vi.fn<(params: GridColumnOrderChangeParams) => void>();
    const initialProps: UseColumnReorderProps = { columns: COLUMNS, onColumnOrderChange, ...overrides };
    const hook = renderHook((props: UseColumnReorderProps) => useColumnReorder(props), { initialProps });
    return { ...hook, onColumnOrderChange };
}

function drag(result: { current: ReturnType<typeof useColumnReorder> }, from: string, to: string) {
    act(() => { result.current.onDragStart?.(from)(makeEvent().event); });
    act(() => { result.current.onDragOver?.(to)(makeEvent().event); });
    const drop = makeEvent();
    act(() => { result.current.onDrop?.(to)(drop.event); });
    return drop;
}

describe('useColumnReorder', () => {
    describe('initial state', () => {
        it('starts with no dragged or drag-over column', () => {
            const { result } = setup();
            expect(result.current.draggedColumn).toBeNull();
            expect(result.current.dragOverColumn).toBeNull();
        });

        it('exposes all four handlers when reordering is enabled', () => {
            const { result } = setup();
            expect(result.current.onDragStart).toBeTypeOf('function');
            expect(result.current.onDragOver).toBeTypeOf('function');
            expect(result.current.onDragEnd).toBeTypeOf('function');
            expect(result.current.onDrop).toBeTypeOf('function');
        });

        it('exposes no handlers when disableColumnReorder is true', () => {
            const { result } = setup({ disableColumnReorder: true });
            expect(result.current.onDragStart).toBeUndefined();
            expect(result.current.onDragOver).toBeUndefined();
            expect(result.current.onDragEnd).toBeUndefined();
            expect(result.current.onDrop).toBeUndefined();
            expect(result.current.draggedColumn).toBeNull();
        });

        it('exposes handlers again when disableColumnReorder flips back to false', () => {
            const { result, rerender, onColumnOrderChange } = setup({ disableColumnReorder: true });
            rerender({ columns: COLUMNS, onColumnOrderChange, disableColumnReorder: false });
            expect(result.current.onDragStart).toBeTypeOf('function');
        });
    });

    describe('onDragStart', () => {
        it('marks the column as dragged and configures dataTransfer', () => {
            const { result } = setup();
            const { fake, event } = makeEvent();
            act(() => { result.current.onDragStart?.('b')(event); });
            expect(result.current.draggedColumn).toBe('b');
            expect(fake.dataTransfer.effectAllowed).toBe('move');
            expect(fake.dataTransfer.setData).toHaveBeenCalledWith('text/plain', 'b');
            expect(fake.preventDefault).not.toHaveBeenCalled();
        });

        it('does not throw when the event has no dataTransfer', () => {
            const { result } = setup();
            const event = { preventDefault: vi.fn() } as unknown as React.DragEvent;
            expect(() => act(() => { result.current.onDragStart?.('a')(event); })).not.toThrow();
            expect(result.current.draggedColumn).toBe('a');
        });
    });

    describe('onDragOver', () => {
        it('ignores drag-over when no column drag is in progress (e.g. external drags)', () => {
            const { result } = setup();
            const { fake, event } = makeEvent();
            act(() => { result.current.onDragOver?.('c')(event); });
            expect(fake.preventDefault).not.toHaveBeenCalled();
            expect(result.current.dragOverColumn).toBeNull();
        });

        it('allows the drop and records the hovered column while dragging', () => {
            const { result } = setup();
            act(() => { result.current.onDragStart?.('a')(makeEvent().event); });
            const { fake, event } = makeEvent();
            act(() => { result.current.onDragOver?.('c')(event); });
            expect(fake.preventDefault).toHaveBeenCalledTimes(1);
            expect(fake.dataTransfer.dropEffect).toBe('move');
            expect(result.current.dragOverColumn).toBe('c');
        });

        it('tracks the most recently hovered column', () => {
            const { result } = setup();
            act(() => { result.current.onDragStart?.('a')(makeEvent().event); });
            act(() => { result.current.onDragOver?.('b')(makeEvent().event); });
            act(() => { result.current.onDragOver?.('d')(makeEvent().event); });
            expect(result.current.dragOverColumn).toBe('d');
        });
    });

    describe('onDrop', () => {
        it('reports the source and target indices when moving a column right', () => {
            const { result, onColumnOrderChange } = setup();
            const drop = drag(result, 'a', 'c');
            expect(drop.fake.preventDefault).toHaveBeenCalled();
            expect(onColumnOrderChange).toHaveBeenCalledTimes(1);
            expect(onColumnOrderChange).toHaveBeenCalledWith({ column: COLUMNS[0], oldIndex: 0, targetIndex: 2 });
        });

        it('reports the source and target indices when moving a column left', () => {
            const { result, onColumnOrderChange } = setup();
            drag(result, 'd', 'b');
            expect(onColumnOrderChange).toHaveBeenCalledWith({ column: COLUMNS[3], oldIndex: 3, targetIndex: 1 });
        });

        it('passes the original column definition object in the payload', () => {
            const { result, onColumnOrderChange } = setup();
            drag(result, 'b', 'a');
            expect(onColumnOrderChange.mock.calls[0][0].column).toBe(COLUMNS[1]);
        });

        it('produces indices that, applied with splice, yield the visually expected order', () => {
            const { result, onColumnOrderChange } = setup();
            drag(result, 'a', 'c');
            const { oldIndex, targetIndex } = onColumnOrderChange.mock.calls[0][0];
            const order = COLUMNS.map(c => c.field);
            const [moved] = order.splice(oldIndex, 1);
            order.splice(targetIndex, 0, moved);
            expect(order).toEqual(['b', 'c', 'a', 'd']);
        });

        it('resets drag state after a successful drop', () => {
            const { result } = setup();
            drag(result, 'a', 'b');
            expect(result.current.draggedColumn).toBeNull();
            expect(result.current.dragOverColumn).toBeNull();
        });

        it('does not fire when a column is dropped onto itself', () => {
            const { result, onColumnOrderChange } = setup();
            drag(result, 'b', 'b');
            expect(onColumnOrderChange).not.toHaveBeenCalled();
            expect(result.current.draggedColumn).toBeNull();
            expect(result.current.dragOverColumn).toBeNull();
        });

        it('does not fire when nothing is being dragged, but still prevents the default drop', () => {
            const { result, onColumnOrderChange } = setup();
            const { fake, event } = makeEvent();
            act(() => { result.current.onDrop?.('b')(event); });
            expect(fake.preventDefault).toHaveBeenCalled();
            expect(onColumnOrderChange).not.toHaveBeenCalled();
        });

        it('does not fire when the drop target is not a known column', () => {
            const { result, onColumnOrderChange } = setup();
            drag(result, 'a', 'zzz');
            expect(onColumnOrderChange).not.toHaveBeenCalled();
            expect(result.current.draggedColumn).toBeNull();
        });

        it('does not fire when the dragged column was removed before the drop', () => {
            const { result, rerender, onColumnOrderChange } = setup();
            act(() => { result.current.onDragStart?.('a')(makeEvent().event); });
            rerender({ columns: COLUMNS.slice(1), onColumnOrderChange });
            act(() => { result.current.onDrop?.('c')(makeEvent().event); });
            expect(onColumnOrderChange).not.toHaveBeenCalled();
            expect(result.current.draggedColumn).toBeNull();
        });

        it('computes indices against the columns current at drop time', () => {
            const { result, rerender, onColumnOrderChange } = setup();
            act(() => { result.current.onDragStart?.('c')(makeEvent().event); });
            const extended: GridColDef[] = [{ field: 'z' }, ...COLUMNS];
            rerender({ columns: extended, onColumnOrderChange });
            act(() => { result.current.onDrop?.('a')(makeEvent().event); });
            expect(onColumnOrderChange).toHaveBeenCalledWith({ column: extended[3], oldIndex: 3, targetIndex: 1 });
        });

        it('resets state without throwing when no onColumnOrderChange is provided', () => {
            const { result } = setup({ onColumnOrderChange: undefined });
            expect(() => drag(result, 'a', 'c')).not.toThrow();
            expect(result.current.draggedColumn).toBeNull();
        });

        it('calls the latest onColumnOrderChange after the callback prop changes', () => {
            const { result, rerender } = setup();
            const next = vi.fn<(params: GridColumnOrderChangeParams) => void>();
            rerender({ columns: COLUMNS, onColumnOrderChange: next });
            drag(result, 'a', 'b');
            expect(next).toHaveBeenCalledTimes(1);
        });

        it('fires exactly once per drop across consecutive drags', () => {
            const { result, onColumnOrderChange } = setup();
            drag(result, 'a', 'b');
            drag(result, 'c', 'd');
            expect(onColumnOrderChange).toHaveBeenCalledTimes(2);
            expect(onColumnOrderChange.mock.calls[1][0]).toMatchObject({ oldIndex: 2, targetIndex: 3 });
        });
    });

    describe('onDragEnd', () => {
        it('clears the dragged and drag-over column (e.g. drag cancelled with Escape)', () => {
            const { result, onColumnOrderChange } = setup();
            act(() => { result.current.onDragStart?.('a')(makeEvent().event); });
            act(() => { result.current.onDragOver?.('c')(makeEvent().event); });
            act(() => { result.current.onDragEnd?.(); });
            expect(result.current.draggedColumn).toBeNull();
            expect(result.current.dragOverColumn).toBeNull();
            expect(onColumnOrderChange).not.toHaveBeenCalled();
        });

        it('makes a later drop a no-op', () => {
            const { result, onColumnOrderChange } = setup();
            act(() => { result.current.onDragStart?.('a')(makeEvent().event); });
            act(() => { result.current.onDragEnd?.(); });
            act(() => { result.current.onDrop?.('c')(makeEvent().event); });
            expect(onColumnOrderChange).not.toHaveBeenCalled();
        });

        it('keeps a stable identity across renders', () => {
            const { result, rerender, onColumnOrderChange } = setup();
            const first = result.current.onDragEnd;
            rerender({ columns: [...COLUMNS], onColumnOrderChange });
            expect(result.current.onDragEnd).toBe(first);
        });
    });
});
