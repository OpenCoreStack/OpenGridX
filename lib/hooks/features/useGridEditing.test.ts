import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGridEditing } from './useGridEditing';
import type { UseGridEditingParams } from './useGridEditing';
import type { GridColDef, GridRowId } from '../../types';

type Row = { id: GridRowId; name: string; qty: number | null };

const ROWS: Row[] = [
    { id: 1, name: 'Alpha', qty: 10 },
    { id: 2, name: 'Beta', qty: 20 },
];

const getRowId = (row: Row): GridRowId => row.id;

function setup(overrides: Partial<UseGridEditingParams<Row>> = {}) {
    const initialProps: UseGridEditingParams<Row> = { rows: ROWS, getRowId, ...overrides };
    return renderHook((props: UseGridEditingParams<Row>) => useGridEditing<Row>(props), { initialProps });
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

describe('useGridEditing — start / change', () => {
    it('starts with no cell in edit mode', () => {
        const { result } = setup();
        expect(result.current.editingCell).toBeNull();
    });

    it('startCellEdit records id, field, value and originalValue', () => {
        const { result } = setup();
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        expect(result.current.editingCell).toEqual({ id: 1, field: 'name', value: 'Alpha', originalValue: 'Alpha' });
    });

    it('startCellEdit on another cell replaces the current edit session', () => {
        const { result } = setup();
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.startCellEdit({ id: 2, field: 'qty', value: 20 }); });
        expect(result.current.editingCell).toEqual({ id: 2, field: 'qty', value: 20, originalValue: 20 });
    });

    it('setEditCellValue updates the value of the cell being edited and keeps originalValue', () => {
        const { result } = setup();
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        expect(result.current.editingCell).toEqual({ id: 1, field: 'name', value: 'Gamma', originalValue: 'Alpha' });
    });

    it('setEditCellValue ignores a different row id', () => {
        const { result } = setup();
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 2, field: 'name', value: 'Gamma' }); });
        expect(result.current.editingCell?.value).toBe('Alpha');
    });

    it('setEditCellValue ignores a different field', () => {
        const { result } = setup();
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'qty', value: 99 }); });
        expect(result.current.editingCell?.value).toBe('Alpha');
    });

    it('setEditCellValue does nothing when no cell is being edited', () => {
        const { result } = setup();
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        expect(result.current.editingCell).toBeNull();
    });

    it('matches row ids strictly (string "1" is not number 1)', () => {
        const { result } = setup();
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: '1', field: 'name', value: 'Gamma' }); });
        expect(result.current.editingCell?.value).toBe('Alpha');
    });

    it('supports row id 0', () => {
        const onRowChange = vi.fn();
        const rows: Row[] = [{ id: 0, name: 'Zero', qty: 0 }];
        const { result } = setup({ rows, onRowChange });
        act(() => { result.current.startCellEdit({ id: 0, field: 'qty', value: 0 }); });
        act(() => { result.current.setEditCellValue({ id: 0, field: 'qty', value: 5 }); });
        expect(result.current.editingCell?.value).toBe(5);
    });

    it('keeps startCellEdit identity stable across re-renders', () => {
        const { result, rerender } = setup();
        const first = result.current.startCellEdit;
        rerender({ rows: [...ROWS], getRowId });
        expect(result.current.startCellEdit).toBe(first);
    });
});

describe('useGridEditing — stop / cancel', () => {
    it('stopCellEdit is a no-op when nothing is being edited', async () => {
        const processRowUpdate = vi.fn((row: Row) => row);
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onRowChange });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(processRowUpdate).not.toHaveBeenCalled();
        expect(onRowChange).not.toHaveBeenCalled();
        expect(result.current.editingCell).toBeNull();
    });

    it('cancel discards the edit without calling processRowUpdate or onRowChange', async () => {
        const processRowUpdate = vi.fn((row: Row) => row);
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        await act(async () => { await result.current.stopCellEdit({ cancel: true }); });
        expect(result.current.editingCell).toBeNull();
        expect(processRowUpdate).not.toHaveBeenCalled();
        expect(onRowChange).not.toHaveBeenCalled();
    });

    it('an unchanged value closes the editor without calling processRowUpdate', async () => {
        const processRowUpdate = vi.fn((row: Row) => row);
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(result.current.editingCell).toBeNull();
        expect(processRowUpdate).not.toHaveBeenCalled();
        expect(onRowChange).not.toHaveBeenCalled();
    });

    it('a value changed and changed back counts as unchanged', async () => {
        const processRowUpdate = vi.fn((row: Row) => row);
        const { result } = setup({ processRowUpdate });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Alphax' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Alpha' }); });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(processRowUpdate).not.toHaveBeenCalled();
        expect(result.current.editingCell).toBeNull();
    });

    it('without processRowUpdate, onRowChange receives the row merged with the new value', async () => {
        const onRowChange = vi.fn();
        const { result } = setup({ onRowChange });
        act(() => { result.current.startCellEdit({ id: 2, field: 'qty', value: 20 }); });
        act(() => { result.current.setEditCellValue({ id: 2, field: 'qty', value: 25 }); });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(onRowChange).toHaveBeenCalledTimes(1);
        expect(onRowChange).toHaveBeenCalledWith({ id: 2, name: 'Beta', qty: 25 }, 2);
        expect(result.current.editingCell).toBeNull();
    });

    it('does not mutate the original row object', async () => {
        const rows: Row[] = [{ id: 1, name: 'Alpha', qty: 10 }];
        const { result } = setup({ rows, onRowChange: vi.fn() });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(rows[0]).toEqual({ id: 1, name: 'Alpha', qty: 10 });
    });

    it('commits a cleared (null) value', async () => {
        const onRowChange = vi.fn();
        const { result } = setup({ onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'qty', value: 10 }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'qty', value: null }); });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(onRowChange).toHaveBeenCalledWith({ id: 1, name: 'Alpha', qty: null }, 1);
    });

    it('commits the value 0 over a non-zero value', async () => {
        const onRowChange = vi.fn();
        const { result } = setup({ onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'qty', value: 10 }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'qty', value: 0 }); });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(onRowChange).toHaveBeenCalledWith({ id: 1, name: 'Alpha', qty: 0 }, 1);
    });

    it('closes silently when the edited row no longer exists', async () => {
        const processRowUpdate = vi.fn((row: Row) => row);
        const onRowChange = vi.fn();
        const { result, rerender } = setup({ processRowUpdate, onRowChange });
        act(() => { result.current.startCellEdit({ id: 2, field: 'name', value: 'Beta' }); });
        act(() => { result.current.setEditCellValue({ id: 2, field: 'name', value: 'Gamma' }); });
        rerender({ rows: [ROWS[0]], getRowId, processRowUpdate, onRowChange });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(processRowUpdate).not.toHaveBeenCalled();
        expect(onRowChange).not.toHaveBeenCalled();
        expect(result.current.editingCell).toBeNull();
    });

    it('merges the edit into the latest version of the row', async () => {
        const onRowChange = vi.fn();
        const { result, rerender } = setup({ onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        rerender({ rows: [{ id: 1, name: 'Alpha', qty: 99 }, ROWS[1]], getRowId, onRowChange });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(onRowChange).toHaveBeenCalledWith({ id: 1, name: 'Gamma', qty: 99 }, 1);
    });

    it('looks rows up through a custom getRowId', async () => {
        type URow = { id: GridRowId; uid: string; name: string };
        const rows: URow[] = [{ id: 'x', uid: 'a', name: 'Alpha' }, { id: 'y', uid: 'b', name: 'Beta' }];
        const onRowChange = vi.fn();
        const { result } = renderHook(() => useGridEditing<URow>({ rows, getRowId: r => r.uid, onRowChange }));
        act(() => { result.current.startCellEdit({ id: 'b', field: 'name', value: 'Beta' }); });
        act(() => { result.current.setEditCellValue({ id: 'b', field: 'name', value: 'Bravo' }); });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(onRowChange).toHaveBeenCalledWith({ id: 'y', uid: 'b', name: 'Bravo' }, 'b');
    });
});

describe('useGridEditing — processRowUpdate', () => {
    it('calls sync processRowUpdate with (newRow, oldRow) and forwards the returned row', async () => {
        const returned: Row = { id: 1, name: 'GAMMA', qty: 11 };
        const processRowUpdate = vi.fn((): Row => returned);
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        expect(processRowUpdate).toHaveBeenCalledWith({ id: 1, name: 'Gamma', qty: 10 }, ROWS[0]);
        expect(onRowChange).toHaveBeenCalledTimes(1);
        expect(onRowChange.mock.calls[0][0]).toBe(returned);
        expect(result.current.editingCell).toBeNull();
    });

    it('passes the original row object reference as oldRow', async () => {
        const processRowUpdate = vi.fn((newRow: Row, oldRow: Row) => (oldRow ? newRow : newRow));
        const { result } = setup({ processRowUpdate });
        act(() => { result.current.startCellEdit({ id: 2, field: 'qty', value: 20 }); });
        act(() => { result.current.setEditCellValue({ id: 2, field: 'qty', value: 21 }); });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(processRowUpdate.mock.calls[0][1]).toBe(ROWS[1]);
    });

    it('keeps the editor open until an async processRowUpdate resolves', async () => {
        const d = deferred<Row>();
        const processRowUpdate = vi.fn(() => d.promise);
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        let pending: Promise<void> | undefined;
        act(() => { pending = result.current.stopCellEdit(); });
        expect(result.current.editingCell).toEqual(expect.objectContaining({ id: 1, value: 'Gamma' }));
        expect(onRowChange).not.toHaveBeenCalled();

        const saved: Row = { id: 1, name: 'Gamma (saved)', qty: 10 };
        await act(async () => { d.resolve(saved); await pending; });
        expect(onRowChange).toHaveBeenCalledWith(saved, 1);
        expect(result.current.editingCell).toBeNull();
    });

    it('reports a rejected processRowUpdate and keeps the editor open', async () => {
        const error = new Error('validation failed');
        const processRowUpdate = vi.fn(() => Promise.reject(error));
        const onProcessRowUpdateError = vi.fn();
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onProcessRowUpdateError, onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: '' }); });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(onProcessRowUpdateError).toHaveBeenCalledWith(error);
        expect(onRowChange).not.toHaveBeenCalled();
        expect(result.current.editingCell).toEqual({ id: 1, field: 'name', value: '', originalValue: 'Alpha' });
    });

    it('reports a synchronously throwing processRowUpdate', async () => {
        const error = new Error('boom');
        const processRowUpdate = vi.fn((): Row => { throw error; });
        const onProcessRowUpdateError = vi.fn();
        const { result } = setup({ processRowUpdate, onProcessRowUpdateError });
        act(() => { result.current.startCellEdit({ id: 1, field: 'qty', value: 10 }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'qty', value: -5 }); });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(onProcessRowUpdateError).toHaveBeenCalledWith(error);
        expect(result.current.editingCell?.value).toBe(-5);
    });

    it('does not throw when processRowUpdate rejects and no error handler is given', async () => {
        const processRowUpdate = vi.fn(() => Promise.reject(new Error('nope')));
        const { result } = setup({ processRowUpdate });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        await expect(act(async () => { await result.current.stopCellEdit(); })).resolves.toBeUndefined();
        expect(result.current.editingCell?.value).toBe('Gamma');
    });

    it('can retry a commit after a rejection', async () => {
        const processRowUpdate = vi.fn()
            .mockRejectedValueOnce(new Error('first'))
            .mockImplementation((newRow: Row) => newRow);
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onRowChange, onProcessRowUpdateError: vi.fn() });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(result.current.editingCell).not.toBeNull();
        await act(async () => { await result.current.stopCellEdit(); });
        expect(processRowUpdate).toHaveBeenCalledTimes(2);
        expect(onRowChange).toHaveBeenCalledWith({ id: 1, name: 'Gamma', qty: 10 }, 1);
        expect(result.current.editingCell).toBeNull();
    });

    it('cancel after a rejection discards the edit', async () => {
        const processRowUpdate = vi.fn(() => Promise.reject(new Error('bad')));
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onRowChange, onProcessRowUpdateError: vi.fn() });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        await act(async () => { await result.current.stopCellEdit(); });
        await act(async () => { await result.current.stopCellEdit({ cancel: true }); });
        expect(result.current.editingCell).toBeNull();
        expect(onRowChange).not.toHaveBeenCalled();
    });

    it('uses the processRowUpdate passed on the latest render', async () => {
        const first = vi.fn((row: Row) => row);
        const second = vi.fn((row: Row) => row);
        const { result, rerender } = setup({ processRowUpdate: first });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        rerender({ rows: ROWS, getRowId, processRowUpdate: second });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });
});

describe('useGridEditing — commit concurrency', () => {
    it('a second stop while an async commit is pending does not call processRowUpdate again', async () => {
        const d = deferred<Row>();
        const processRowUpdate = vi.fn(() => d.promise);
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        let first: Promise<void> | undefined;
        let second: Promise<void> | undefined;
        act(() => { first = result.current.stopCellEdit(); });
        act(() => { second = result.current.stopCellEdit(); });
        await act(async () => { d.resolve({ id: 1, name: 'Gamma', qty: 10 }); await first; await second; });
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        expect(onRowChange).toHaveBeenCalledTimes(1);
        expect(result.current.editingCell).toBeNull();
    });

    it('a second stop after a rejected commit does not retry with the same value', async () => {
        const d = deferred<Row>();
        const processRowUpdate = vi.fn(() => d.promise);
        const onProcessRowUpdateError = vi.fn();
        const { result } = setup({ processRowUpdate, onProcessRowUpdateError });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        let first: Promise<void> | undefined;
        let second: Promise<void> | undefined;
        act(() => { first = result.current.stopCellEdit(); });
        act(() => { second = result.current.stopCellEdit(); });
        await act(async () => { d.reject(new Error('nope')); await first; await second; });
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        expect(onProcessRowUpdateError).toHaveBeenCalledTimes(1);
        expect(result.current.editingCell?.value).toBe('Gamma');
    });

    it('a commit that resolves late does not close a different cell edit started meanwhile', async () => {
        const d = deferred<Row>();
        const processRowUpdate = vi.fn(() => d.promise);
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        let pending: Promise<void> | undefined;
        act(() => { pending = result.current.stopCellEdit(); });
        act(() => { result.current.startCellEdit({ id: 2, field: 'name', value: 'Beta' }); });
        await act(async () => { d.resolve({ id: 1, name: 'Gamma', qty: 10 }); await pending; });
        expect(result.current.editingCell).toEqual({ id: 2, field: 'name', value: 'Beta', originalValue: 'Beta' });
        // The finished commit is still applied to its own row.
        expect(onRowChange).toHaveBeenCalledWith({ id: 1, name: 'Gamma', qty: 10 }, 1);
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
    });

    it('cancel while a commit is pending closes the editor at once; the saved row is still applied', async () => {
        const d = deferred<Row>();
        const processRowUpdate = vi.fn(() => d.promise);
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        let pending: Promise<void> | undefined;
        act(() => { pending = result.current.stopCellEdit(); });
        await act(async () => { await result.current.stopCellEdit({ cancel: true }); });
        expect(result.current.editingCell).toBeNull();
        await act(async () => { d.resolve({ id: 1, name: 'Gamma', qty: 10 }); await pending; });
        // processRowUpdate already ran (and may have persisted the row), so the grid reflects it.
        expect(onRowChange).toHaveBeenCalledTimes(1);
        expect(result.current.editingCell).toBeNull();
    });

    it('text typed while a commit is pending stays in the editor instead of being discarded', async () => {
        const d = deferred<Row>();
        const processRowUpdate = vi.fn((newRow: Row) => (newRow.name === 'Gamma' ? d.promise : newRow));
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        let pending: Promise<void> | undefined;
        act(() => { pending = result.current.stopCellEdit(); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma2' }); });
        await act(async () => { d.resolve({ id: 1, name: 'Gamma', qty: 10 }); await pending; });
        expect(result.current.editingCell).toEqual({ id: 1, field: 'name', value: 'Gamma2', originalValue: 'Gamma' });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(processRowUpdate).toHaveBeenCalledTimes(2);
        expect(processRowUpdate.mock.calls[1][0]).toEqual({ id: 1, name: 'Gamma2', qty: 10 });
        expect(result.current.editingCell).toBeNull();
    });

    it('a stop requested while a commit is pending commits the newer value after the first one settles', async () => {
        const d = deferred<Row>();
        const processRowUpdate = vi.fn((newRow: Row) => (newRow.name === 'Gamma' ? d.promise : newRow));
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        let first: Promise<void> | undefined;
        let second: Promise<void> | undefined;
        act(() => { first = result.current.stopCellEdit(); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma2' }); });
        act(() => { second = result.current.stopCellEdit(); });
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        await act(async () => { d.resolve({ id: 1, name: 'Gamma', qty: 10 }); await first; await second; });
        expect(processRowUpdate).toHaveBeenCalledTimes(2);
        expect(onRowChange).toHaveBeenLastCalledWith({ id: 1, name: 'Gamma2', qty: 10 }, 1);
        expect(result.current.editingCell).toBeNull();
    });

    it('startCellEdit on another cell commits the pending edit first', async () => {
        const processRowUpdate = vi.fn((row: Row) => row);
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        await act(async () => { result.current.startCellEdit({ id: 2, field: 'qty', value: 20 }); });
        expect(processRowUpdate).toHaveBeenCalledTimes(1);
        expect(onRowChange).toHaveBeenCalledWith({ id: 1, name: 'Gamma', qty: 10 }, 1);
        expect(result.current.editingCell).toEqual({ id: 2, field: 'qty', value: 20, originalValue: 20 });
    });

    it('startCellEdit on the cell already being edited keeps the pending value', () => {
        const { result } = setup();
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Gamma' }); });
        expect(result.current.editingCell).toEqual({ id: 1, field: 'name', value: 'Gamma', originalValue: 'Alpha' });
    });

    it('a stop aimed at a cell that is no longer being edited is ignored', async () => {
        const processRowUpdate = vi.fn((row: Row) => row);
        const { result } = setup({ processRowUpdate });
        act(() => { result.current.startCellEdit({ id: 2, field: 'qty', value: 20 }); });
        await act(async () => { await result.current.stopCellEdit({ id: 1, field: 'name' }); });
        await act(async () => { await result.current.stopCellEdit({ id: 2, field: 'name' }); });
        expect(result.current.editingCell).toEqual({ id: 2, field: 'qty', value: 20, originalValue: 20 });
        await act(async () => { await result.current.stopCellEdit({ id: 2, field: 'qty' }); });
        expect(result.current.editingCell).toBeNull();
    });

    it('setEditCellValue issued in the same tick as startCellEdit is applied', () => {
        const { result } = setup();
        act(() => {
            result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' });
            result.current.setEditCellValue({ id: 1, field: 'name', value: 'Q' });
        });
        expect(result.current.editingCell?.value).toBe('Q');
    });

    it('applies a synchronous processRowUpdate result without waiting for a microtask', () => {
        const processRowUpdate = vi.fn((row: Row) => row);
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        act(() => { void result.current.stopCellEdit(); });
        expect(onRowChange).toHaveBeenCalledTimes(1);
        expect(result.current.editingCell).toBeNull();
    });
});

describe('useGridEditing — callback identity', () => {
    it('keeps stopCellEdit, startCellEdit and setEditCellValue stable when callbacks and rows change', () => {
        const { result, rerender } = setup({ processRowUpdate: (r: Row) => r, onRowChange: () => {} });
        const first = result.current;
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        rerender({ rows: [...ROWS], getRowId: (r: Row) => r.id, processRowUpdate: (r: Row) => r, onRowChange: () => {} });
        expect(result.current.stopCellEdit).toBe(first.stopCellEdit);
        expect(result.current.startCellEdit).toBe(first.startCellEdit);
        expect(result.current.setEditCellValue).toBe(first.setEditCellValue);
    });

    it('uses the onRowChange passed on the latest render', async () => {
        const first = vi.fn();
        const second = vi.fn();
        const { result, rerender } = setup({ onRowChange: first });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        rerender({ rows: ROWS, getRowId, onRowChange: second });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });
});

describe('useGridEditing — processRowUpdate contract', () => {
    it('reports a processRowUpdate that returns nothing and keeps the editor open', async () => {
        const processRowUpdate = vi.fn(() => undefined as unknown as Row);
        const onProcessRowUpdateError = vi.fn();
        const onRowChange = vi.fn();
        const { result } = setup({ processRowUpdate, onProcessRowUpdateError, onRowChange });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(onRowChange).not.toHaveBeenCalled();
        expect(onProcessRowUpdateError).toHaveBeenCalledTimes(1);
        const reported = onProcessRowUpdateError.mock.calls[0][0] as Error;
        expect(reported).toBeInstanceOf(Error);
        expect(reported.message).toMatch(/processRowUpdate must return the updated row/);
        expect(result.current.editingCell?.value).toBe('Gamma');
    });

    it('does not report an error thrown while the grid stores the row as a processRowUpdate failure', async () => {
        const boom = new Error('store failed');
        const onRowChange = vi.fn(() => { throw boom; });
        const onProcessRowUpdateError = vi.fn();
        const { result } = setup({ processRowUpdate: (r: Row) => Promise.resolve(r), onRowChange, onProcessRowUpdateError });
        act(() => { result.current.startCellEdit({ id: 1, field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'name', value: 'Gamma' }); });
        let caught: unknown;
        await act(async () => { await result.current.stopCellEdit().catch((e: unknown) => { caught = e; }); });
        expect(caught).toBe(boom);
        expect(onProcessRowUpdateError).not.toHaveBeenCalled();
    });

    it('passes the edited row id to onRowChange even when processRowUpdate returns a row without it', async () => {
        type URow = { id: GridRowId; uid: string; name: string };
        const rows: URow[] = [{ id: 'a', uid: 'a', name: 'Alpha' }];
        const onRowChange = vi.fn();
        const processRowUpdate = (n: URow) => ({ uid: n.uid, name: n.name }) as URow;
        const { result } = renderHook(() => useGridEditing<URow>({ rows, getRowId: r => r.uid, processRowUpdate, onRowChange }));
        act(() => { result.current.startCellEdit({ id: 'a', field: 'name', value: 'Alpha' }); });
        act(() => { result.current.setEditCellValue({ id: 'a', field: 'name', value: 'Gamma' }); });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(onRowChange).toHaveBeenCalledWith({ uid: 'a', name: 'Gamma' }, 'a');
    });
});

describe('useGridEditing — valueSetter', () => {
    type PRow = { id: GridRowId; first: string; last: string };
    const people: PRow[] = [{ id: 1, first: 'Ada', last: 'Lovelace' }];

    it('builds the committed row with colDef.valueSetter', async () => {
        const processRowUpdate = vi.fn((r: PRow) => r);
        const columns: GridColDef<PRow>[] = [{
            field: 'full',
            valueGetter: ({ row }) => `${row.first} ${row.last}`,
            valueSetter: ({ value, row }) => {
                const [first, ...rest] = String(value).split(' ');
                return { ...row, first, last: rest.join(' ') };
            },
        }];
        const { result } = renderHook(() => useGridEditing<PRow>({ rows: people, getRowId: r => r.id, columns, processRowUpdate }));
        act(() => { result.current.startCellEdit({ id: 1, field: 'full', value: 'Ada Lovelace' }); });
        act(() => { result.current.setEditCellValue({ id: 1, field: 'full', value: 'Ada King' }); });
        await act(async () => { await result.current.stopCellEdit(); });
        expect(processRowUpdate).toHaveBeenCalledWith({ id: 1, first: 'Ada', last: 'King' }, people[0]);
    });

    it('warns once in development when a valueGetter column without valueSetter is committed', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const columns: GridColDef<PRow>[] = [{ field: 'full', valueGetter: ({ row }) => `${row.first} ${row.last}` }];
        const { result } = renderHook(() => useGridEditing<PRow>({ rows: people, getRowId: r => r.id, columns, onRowChange: () => {} }));
        for (const next of ['Ada King', 'Ada Byron']) {
            act(() => { result.current.startCellEdit({ id: 1, field: 'full', value: 'Ada Lovelace' }); });
            act(() => { result.current.setEditCellValue({ id: 1, field: 'full', value: next }); });
            await act(async () => { await result.current.stopCellEdit(); });
        }
        const messages = warn.mock.calls.map(c => String(c[0])).filter(m => m.includes('valueSetter'));
        expect(messages).toHaveLength(1);
        expect(messages[0]).toContain('"full"');
        warn.mockRestore();
    });
});
