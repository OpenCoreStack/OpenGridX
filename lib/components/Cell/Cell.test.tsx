import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { StrictMode } from 'react';
import { Row } from '../Row/Row';
import type { GridColDef, GridRowModel } from '../../types';

// A cell that unmounts while editing commits its edit (it gets no blur). These tests mount a
// Row whose cell is already editing, which is when StrictMode runs its extra setup + cleanup.

type TRow = GridRowModel & { name: string };
const row: TRow = { id: 1, name: 'Alpha' };
const columns: GridColDef<TRow>[] = [{ field: 'name', editable: true, width: 150 }];
const editingCell = { id: 1, field: 'name', value: 'Alpha' };

function renderEditingRow(onEditStop: (params?: { cancel?: boolean; id?: GridRowModel['id']; field?: string }) => void, strict = false) {
    const ui = (
        <Row<TRow>
            row={row}
            columns={columns}
            rowIndex={0}
            editingCell={editingCell}
            onEditStart={() => {}}
            onEditStop={onEditStop}
            onEditCellValueChange={() => {}}
        />
    );
    return render(strict ? <StrictMode>{ui}</StrictMode> : ui);
}

const flushMicrotasks = () => act(async () => { await Promise.resolve(); });

describe('Cell edit lifecycle', () => {
    it('commits its own cell when it unmounts while editing', async () => {
        const onEditStop = vi.fn();
        const { unmount } = renderEditingRow(onEditStop);
        await flushMicrotasks();
        expect(onEditStop).not.toHaveBeenCalled();
        unmount();
        await flushMicrotasks();
        expect(onEditStop).toHaveBeenCalledTimes(1);
        expect(onEditStop).toHaveBeenCalledWith({ cancel: false, id: 1, field: 'name' });
    });

    it('does not stop the edit when React StrictMode simulates an unmount on mount', async () => {
        const onEditStop = vi.fn();
        renderEditingRow(onEditStop, true);
        await flushMicrotasks();
        expect(onEditStop).not.toHaveBeenCalled();
    });
});
