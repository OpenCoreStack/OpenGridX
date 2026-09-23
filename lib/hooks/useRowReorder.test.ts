import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type React from 'react';
import { useRowReorder } from './useRowReorder';
import type { UseRowReorderProps } from './useRowReorder';
import type { GridRowId, GridRowOrderChangeParams } from '../types';

interface Row {
    id: GridRowId;
    name: string;
    [key: string]: unknown;
}

interface FakeDragEvent {
    preventDefault: ReturnType<typeof vi.fn>;
    dataTransfer: { effectAllowed: string; dropEffect: string };
}

function makeEvent(): { fake: FakeDragEvent; event: React.DragEvent } {
    const fake: FakeDragEvent = {
        preventDefault: vi.fn(),
        dataTransfer: { effectAllowed: 'none', dropEffect: 'none' },
    };
    return { fake, event: fake as unknown as React.DragEvent };
}

const ROWS: Row[] = [
    { id: 1, name: 'one' },
    { id: 2, name: 'two' },
    { id: 3, name: 'three' },
    { id: 4, name: 'four' },
];

type Props = UseRowReorderProps<Row>;

function setup(overrides: Partial<Props> = {}) {
    const onRowOrderChange = vi.fn<(params: GridRowOrderChangeParams<Row>) => void>();
    const initialProps: Props = { rows: ROWS, onRowOrderChange, rowReordering: true, ...overrides };
    const hook = renderHook((props: Props) => useRowReorder<Row>(props), { initialProps });
    return { ...hook, onRowOrderChange, initialProps };
}

function drag(result: { current: ReturnType<typeof useRowReorder> }, from: GridRowId, to: GridRowId) {
    act(() => { result.current.onDragStart?.(from)(makeEvent().event); });
    act(() => { result.current.onDragOver?.(to)(makeEvent().event); });
    const drop = makeEvent();
    act(() => { result.current.onDrop?.(to)(drop.event); });
    return drop;
}

describe('useRowReorder', () => {
    describe('enabling', () => {
        it('exposes no handlers by default (rowReordering defaults to false)', () => {
            const { result } = renderHook(() => useRowReorder<Row>({ rows: ROWS }));
            expect(result.current.onDragStart).toBeUndefined();
            expect(result.current.onDragOver).toBeUndefined();
            expect(result.current.onDragEnd).toBeUndefined();
            expect(result.current.onDrop).toBeUndefined();
            expect(result.current.draggedRowId).toBeNull();
            expect(result.current.dragOverRowId).toBeNull();
        });

        it('exposes all four handlers when rowReordering is true', () => {
            const { result } = setup();
            expect(result.current.onDragStart).toBeTypeOf('function');
            expect(result.current.onDragOver).toBeTypeOf('function');
            expect(result.current.onDragEnd).toBeTypeOf('function');
            expect(result.current.onDrop).toBeTypeOf('function');
        });

        it('removes the handlers when rowReordering is switched off', () => {
            const { result, rerender, initialProps } = setup();
            rerender({ ...initialProps, rowReordering: false });
            expect(result.current.onDragStart).toBeUndefined();
            expect(result.current.onDrop).toBeUndefined();
        });
    });

    describe('onDragStart', () => {
        it('records the dragged row and sets effectAllowed to move', () => {
            const { result } = setup();
            const { fake, event } = makeEvent();
            act(() => { result.current.onDragStart?.(2)(event); });
            expect(result.current.draggedRowId).toBe(2);
            expect(fake.dataTransfer.effectAllowed).toBe('move');
        });

        it('accepts string row ids', () => {
            const rows: Row[] = [{ id: 'x', name: 'x' }, { id: 'y', name: 'y' }];
            const { result } = setup({ rows });
            act(() => { result.current.onDragStart?.('y')(makeEvent().event); });
            expect(result.current.draggedRowId).toBe('y');
        });
    });

    describe('onDragOver', () => {
        it('ignores drag-over when no row drag is in progress', () => {
            const { result } = setup();
            const { fake, event } = makeEvent();
            act(() => { result.current.onDragOver?.(3)(event); });
            expect(fake.preventDefault).not.toHaveBeenCalled();
            expect(result.current.dragOverRowId).toBeNull();
        });

        it('allows the drop and records the hovered row while dragging', () => {
            const { result } = setup();
            act(() => { result.current.onDragStart?.(1)(makeEvent().event); });
            const { fake, event } = makeEvent();
            act(() => { result.current.onDragOver?.(3)(event); });
            expect(fake.preventDefault).toHaveBeenCalledTimes(1);
            expect(fake.dataTransfer.dropEffect).toBe('move');
            expect(result.current.dragOverRowId).toBe(3);
        });

        it('keeps calling preventDefault on repeated drag-over of the same row', () => {
            const { result } = setup();
            act(() => { result.current.onDragStart?.(1)(makeEvent().event); });
            act(() => { result.current.onDragOver?.(3)(makeEvent().event); });
            const again = makeEvent();
            act(() => { result.current.onDragOver?.(3)(again.event); });
            expect(again.fake.preventDefault).toHaveBeenCalledTimes(1);
            expect(result.current.dragOverRowId).toBe(3);
        });

        it('tracks the most recently hovered row', () => {
            const { result } = setup();
            act(() => { result.current.onDragStart?.(1)(makeEvent().event); });
            act(() => { result.current.onDragOver?.(2)(makeEvent().event); });
            act(() => { result.current.onDragOver?.(4)(makeEvent().event); });
            expect(result.current.dragOverRowId).toBe(4);
        });
    });

    describe('onDrop', () => {
        it('reports the moved row and indices when dragging down', () => {
            const { result, onRowOrderChange } = setup();
            const drop = drag(result, 1, 3);
            expect(drop.fake.preventDefault).toHaveBeenCalled();
            expect(onRowOrderChange).toHaveBeenCalledTimes(1);
            expect(onRowOrderChange).toHaveBeenCalledWith({ row: ROWS[0], oldIndex: 0, targetIndex: 2 });
        });

        it('reports the moved row and indices when dragging up', () => {
            const { result, onRowOrderChange } = setup();
            drag(result, 4, 2);
            expect(onRowOrderChange).toHaveBeenCalledWith({ row: ROWS[3], oldIndex: 3, targetIndex: 1 });
        });

        it('passes the original row object reference', () => {
            const { result, onRowOrderChange } = setup();
            drag(result, 2, 4);
            expect(onRowOrderChange.mock.calls[0][0].row).toBe(ROWS[1]);
        });

        it('produces indices that, applied with the documented splice, give the expected order', () => {
            const { result, onRowOrderChange } = setup();
            drag(result, 4, 1);
            const { oldIndex, targetIndex } = onRowOrderChange.mock.calls[0][0];
            const next = [...ROWS];
            const [moved] = next.splice(oldIndex, 1);
            next.splice(targetIndex, 0, moved);
            expect(next.map(r => r.id)).toEqual([4, 1, 2, 3]);
        });

        it('resets drag state after the drop', () => {
            const { result } = setup();
            drag(result, 1, 2);
            expect(result.current.draggedRowId).toBeNull();
            expect(result.current.dragOverRowId).toBeNull();
        });

        it('does not fire when a row is dropped onto itself', () => {
            const { result, onRowOrderChange } = setup();
            drag(result, 2, 2);
            expect(onRowOrderChange).not.toHaveBeenCalled();
            expect(result.current.draggedRowId).toBeNull();
        });

        it('does not fire when nothing is being dragged, but still prevents the default drop', () => {
            const { result, onRowOrderChange } = setup();
            const { fake, event } = makeEvent();
            act(() => { result.current.onDrop?.(2)(event); });
            expect(fake.preventDefault).toHaveBeenCalled();
            expect(onRowOrderChange).not.toHaveBeenCalled();
        });

        it('does not fire when the target id is not in rows', () => {
            const { result, onRowOrderChange } = setup();
            drag(result, 1, 999);
            expect(onRowOrderChange).not.toHaveBeenCalled();
            expect(result.current.draggedRowId).toBeNull();
        });

        it('does not fire when the dragged row disappeared before the drop', () => {
            const { result, rerender, onRowOrderChange, initialProps } = setup();
            act(() => { result.current.onDragStart?.(1)(makeEvent().event); });
            rerender({ ...initialProps, rows: ROWS.slice(1) });
            act(() => { result.current.onDrop?.(3)(makeEvent().event); });
            expect(onRowOrderChange).not.toHaveBeenCalled();
            expect(result.current.draggedRowId).toBeNull();
        });

        it('computes indices against the rows current at drop time', () => {
            const { result, rerender, onRowOrderChange, initialProps } = setup();
            act(() => { result.current.onDragStart?.(3)(makeEvent().event); });
            const extended: Row[] = [{ id: 0.5, name: 'new' }, ...ROWS];
            rerender({ ...initialProps, rows: extended });
            act(() => { result.current.onDrop?.(1)(makeEvent().event); });
            expect(onRowOrderChange).toHaveBeenCalledWith({ row: extended[3], oldIndex: 3, targetIndex: 1 });
        });

        it('resets state without throwing when no onRowOrderChange is provided', () => {
            const { result } = setup({ onRowOrderChange: undefined });
            expect(() => drag(result, 1, 3)).not.toThrow();
            expect(result.current.draggedRowId).toBeNull();
            expect(result.current.dragOverRowId).toBeNull();
        });

        it('works with string ids', () => {
            const rows: Row[] = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }];
            const { result, onRowOrderChange } = setup({ rows });
            drag(result, 'c', 'a');
            expect(onRowOrderChange).toHaveBeenCalledWith({ row: rows[2], oldIndex: 2, targetIndex: 0 });
        });

        it('does not treat the string id "1" and the number id 1 as the same row', () => {
            const rows: Row[] = [{ id: 1, name: 'num' }, { id: '1', name: 'str' }, { id: 2, name: 'two' }];
            const { result, onRowOrderChange } = setup({ rows });
            drag(result, '1', 2);
            expect(onRowOrderChange).toHaveBeenCalledWith({ row: rows[1], oldIndex: 1, targetIndex: 2 });
        });

        it('resolves ids through a custom getRowId', () => {
            const rows: Row[] = [
                { id: 1, name: 'x', key: 'k1' },
                { id: 2, name: 'y', key: 'k2' },
                { id: 3, name: 'z', key: 'k3' },
            ];
            const getRowId = (row: Row) => String(row.key);
            const { result, onRowOrderChange } = setup({ rows, getRowId });
            drag(result, 'k1', 'k3');
            expect(onRowOrderChange).toHaveBeenCalledWith({ row: rows[0], oldIndex: 0, targetIndex: 2 });
        });

        it('fires once per drop across consecutive drags', () => {
            const { result, onRowOrderChange } = setup();
            drag(result, 1, 2);
            drag(result, 3, 4);
            expect(onRowOrderChange).toHaveBeenCalledTimes(2);
            expect(onRowOrderChange.mock.calls[1][0]).toMatchObject({ oldIndex: 2, targetIndex: 3 });
        });

        it('calls the latest onRowOrderChange after the callback prop changes', () => {
            const { result, rerender, initialProps } = setup();
            const next = vi.fn<(params: GridRowOrderChangeParams<Row>) => void>();
            rerender({ ...initialProps, onRowOrderChange: next });
            drag(result, 1, 2);
            expect(next).toHaveBeenCalledTimes(1);
        });
    });

    describe('onDragEnd', () => {
        it('clears drag state when the drag is cancelled', () => {
            const { result, onRowOrderChange } = setup();
            act(() => { result.current.onDragStart?.(1)(makeEvent().event); });
            act(() => { result.current.onDragOver?.(3)(makeEvent().event); });
            act(() => { result.current.onDragEnd?.(); });
            expect(result.current.draggedRowId).toBeNull();
            expect(result.current.dragOverRowId).toBeNull();
            expect(onRowOrderChange).not.toHaveBeenCalled();
        });

        it('makes a later drop a no-op', () => {
            const { result, onRowOrderChange } = setup();
            act(() => { result.current.onDragStart?.(1)(makeEvent().event); });
            act(() => { result.current.onDragEnd?.(); });
            act(() => { result.current.onDrop?.(3)(makeEvent().event); });
            expect(onRowOrderChange).not.toHaveBeenCalled();
        });

        it('keeps a stable identity across renders', () => {
            const { result, rerender, initialProps } = setup();
            const first = result.current.onDragEnd;
            rerender({ ...initialProps, rows: [...ROWS] });
            expect(result.current.onDragEnd).toBe(first);
        });
    });
});

describe('useRowReorder drag identity', () => {
    const withTypes = (types: string[]) => {
        const { fake, event } = makeEvent();
        Object.assign(fake.dataTransfer, { types });
        return { fake, event };
    };

    it('a row whose id is 0 can be dragged and dropped', () => {
        const rows: Row[] = [{ id: 0, name: 'zero' }, ...ROWS];
        const { result, onRowOrderChange } = setup({ rows });
        const over = makeEvent();
        act(() => { result.current.onDragStart?.(0)(makeEvent().event); });
        act(() => { result.current.onDragOver?.(2)(over.event); });
        expect(over.fake.preventDefault).toHaveBeenCalled();
        act(() => { result.current.onDrop?.(2)(makeEvent().event); });
        expect(onRowOrderChange).toHaveBeenCalledWith({ row: rows[0], oldIndex: 0, targetIndex: 2 });
    });

    it('stores a row token (and plain text) in the DataTransfer', () => {
        const { result } = setup();
        const setData = vi.fn();
        const { fake, event } = makeEvent();
        Object.assign(fake.dataTransfer, { setData });
        act(() => { result.current.onDragStart?.(3)(event); });
        expect(setData).toHaveBeenCalledWith('application/x-ogx-row', '3');
        expect(setData).toHaveBeenCalledWith('text/plain', '3');
    });

    it('does not accept a drag that carries other data, and forgets the stale drag', () => {
        const { result, onRowOrderChange } = setup();
        act(() => { result.current.onDragStart?.(1)(makeEvent().event); });
        const over = withTypes(['Files']);
        act(() => { result.current.onDragOver?.(3)(over.event); });
        expect(over.fake.preventDefault).not.toHaveBeenCalled();
        expect(result.current.draggedRowId).toBeNull();
        act(() => { result.current.onDrop?.(3)(withTypes(['Files']).event); });
        expect(onRowOrderChange).not.toHaveBeenCalled();
    });

    it('rows that are not in `rows` (group rows) can be neither dragged nor dropped on', () => {
        const { result, onRowOrderChange } = setup();
        expect(result.current.canReorderRow('group-1')).toBe(false);
        expect(result.current.canReorderRow(1)).toBe(true);
        const start = makeEvent();
        act(() => { result.current.onDragStart?.('group-1')(start.event); });
        expect(start.fake.preventDefault).toHaveBeenCalled();
        expect(result.current.draggedRowId).toBeNull();

        act(() => { result.current.onDragStart?.(1)(makeEvent().event); });
        const over = makeEvent();
        act(() => { result.current.onDragOver?.('group-1')(over.event); });
        expect(over.fake.preventDefault).not.toHaveBeenCalled();
        act(() => { result.current.onDrop?.('group-1')(makeEvent().event); });
        expect(onRowOrderChange).not.toHaveBeenCalled();
    });

    it('a native dragend on the source node ends the drag even after it unmounted', () => {
        const { result } = setup();
        const source = document.createElement('div');
        const { fake, event } = makeEvent();
        Object.assign(fake, { currentTarget: source });
        act(() => { result.current.onDragStart?.(1)(event); });
        expect(result.current.draggedRowId).toBe(1);
        act(() => { source.dispatchEvent(new Event('dragend')); });
        expect(result.current.draggedRowId).toBeNull();
    });
});
