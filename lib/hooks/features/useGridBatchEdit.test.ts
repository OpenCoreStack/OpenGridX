import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGridBatchEdit } from './useGridBatchEdit';
import type { UseGridBatchEditParams } from './useGridBatchEdit';
import type { GridColDef, GridRowId, GridRowModel } from '../../types';

type Row = GridRowModel & { id: number; a: string; b: number; total?: number };

const ROWS: Row[] = [
    { id: 1, a: 'x', b: 1 },
    { id: 2, a: 'y', b: 2 },
    { id: 3, a: 'z', b: 3 },
];
const COLS: GridColDef<Row>[] = [{ field: 'a', editable: true }, { field: 'b', type: 'number', editable: true }];

function setup(overrides: Partial<UseGridBatchEditParams<Row>> = {}) {
    const lookup = new Map<GridRowId, Row>(ROWS.map(r => [r.id, r]));
    const replaceRows = vi.fn((rows: ReadonlyMap<GridRowId, Row>) => {
        rows.forEach((row, id) => lookup.set(id, row));
    });
    const onCommitted = vi.fn();
    const onProcessRowUpdateError = vi.fn();
    const hook = renderHook(() => useGridBatchEdit<Row>({
        rowsLookup: lookup,
        columns: COLS,
        replaceRows,
        onCommitted,
        onProcessRowUpdateError,
        ...overrides,
    }));
    return { hook, lookup, replaceRows, onCommitted, onProcessRowUpdateError };
}

describe('useGridBatchEdit', () => {
    it('calls processRowUpdate once per row and stores every row in one update', async () => {
        const processRowUpdate = vi.fn((row: Row) => row);
        const { hook, replaceRows, onCommitted } = setup({ processRowUpdate });
        let outcome!: Awaited<ReturnType<typeof hook.result.current.applyEdits>>;
        await act(async () => {
            outcome = await hook.result.current.applyEdits([
                { id: 1, field: 'b', value: 10 },
                { id: 1, field: 'a', value: 'xx' },
                { id: 2, field: 'a', value: 'yy' },
            ], 'paste');
        });
        expect(processRowUpdate).toHaveBeenCalledTimes(2);
        expect(processRowUpdate.mock.calls[0][0]).toEqual({ id: 1, a: 'xx', b: 10 });
        expect(replaceRows).toHaveBeenCalledTimes(1);
        expect(outcome.result).toEqual({ updated: [1, 2], failed: [], skipped: [] });
        expect(outcome.committed).toEqual([
            { id: 1, field: 'a', before: 'x', after: 'xx' },
            { id: 1, field: 'b', before: 1, after: 10 },
            { id: 2, field: 'a', before: 'y', after: 'yy' },
        ]);
        expect(onCommitted).toHaveBeenCalledWith(outcome.committed, 'paste');
    });

    it('isolates a failing row: the others are stored, the error is reported', async () => {
        const boom = new Error('rejected');
        const processRowUpdate = vi.fn((row: Row) => {
            if (row.id === 2) throw boom;
            return row;
        });
        const { hook, replaceRows, onProcessRowUpdateError, lookup } = setup({ processRowUpdate });
        let result!: Awaited<ReturnType<typeof hook.result.current.applyEdits>>['result'];
        await act(async () => {
            ({ result } = await hook.result.current.applyEdits([
                { id: 1, field: 'a', value: 'p' },
                { id: 2, field: 'a', value: 'q' },
                { id: 3, field: 'a', value: 'r' },
            ], 'paste'));
        });
        expect(result.updated).toEqual([1, 3]);
        expect(result.failed).toEqual([{ id: 2, error: boom }]);
        expect(onProcessRowUpdateError).toHaveBeenCalledWith(boom);
        expect(replaceRows).toHaveBeenCalledTimes(1);
        expect(lookup.get(2)?.a).toBe('y');
        expect(lookup.get(3)?.a).toBe('r');
    });

    it('waits for async rows and still stores them in one update; a rejection or a non-row fails that row only', async () => {
        const processRowUpdate = vi.fn((row: Row) => {
            if (row.id === 1) return new Promise<Row>(resolve => setTimeout(() => resolve({ ...row, total: 99 }), 5));
            if (row.id === 2) return Promise.reject(new Error('server'));
            return null as unknown as Row;
        });
        const { hook, replaceRows, onProcessRowUpdateError, lookup } = setup({ processRowUpdate });
        let result!: Awaited<ReturnType<typeof hook.result.current.applyEdits>>['result'];
        await act(async () => {
            ({ result } = await hook.result.current.applyEdits([
                { id: 1, field: 'b', value: 5 },
                { id: 2, field: 'b', value: 6 },
                { id: 3, field: 'b', value: 7 },
            ], 'paste'));
        });
        expect(result.updated).toEqual([1]);
        expect(result.failed.map(f => f.id)).toEqual([2, 3]);
        expect(onProcessRowUpdateError).toHaveBeenCalledTimes(2);
        expect(replaceRows).toHaveBeenCalledTimes(1);
        expect(lookup.get(1)).toEqual({ id: 1, a: 'x', b: 5, total: 99 });
    });

    it('skips missing rows and stale cells, and leaves unchanged cells alone', async () => {
        const processRowUpdate = vi.fn((row: Row) => row);
        const { hook } = setup({ processRowUpdate });
        let result!: Awaited<ReturnType<typeof hook.result.current.applyEdits>>['result'];
        await act(async () => {
            ({ result } = await hook.result.current.applyEdits([
                { id: 99, field: 'a', value: 'nope' },
                { id: 1, field: 'a', value: 'back', expect: { value: 'not-x' } },
                { id: 2, field: 'a', value: 'y' },
                { id: 3, field: 'a', value: 'zz', expect: { value: 'z' } },
            ], 'undo'));
        });
        expect(result.skipped).toEqual([
            { id: 99, field: 'a', reason: 'missing' },
            { id: 1, field: 'a', reason: 'changed' },
        ]);
        expect(result.updated).toEqual([3]);
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
    });

    it('does not report undo/redo commits to onCommitted, and getRow sees stored rows before a render', async () => {
        const { hook, onCommitted } = setup({ replaceRows: vi.fn() });
        await act(async () => {
            await hook.result.current.applyEdits([{ id: 1, field: 'a', value: 'u' }], 'undo');
        });
        expect(onCommitted).not.toHaveBeenCalled();
        const before = hook.result.current.getRow(2);
        hook.result.current.storeRow(2, { id: 2, a: 'stored', b: 2 });
        expect(before?.a).toBe('y');
        expect(hook.result.current.getRow(2)?.a).toBe('stored');
    });
});
