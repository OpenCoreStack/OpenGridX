import { describe, it, expect, afterEach } from 'vitest';
import { render, act, cleanup } from '@testing-library/react';
import React, { StrictMode } from 'react';
import { DataGrid } from './DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type { GridApi, GridColDef } from '../../types';

// The row store updates its id maps in place on edits (3.8.0). StrictMode double-invokes reducers
// and effects: the store must end up exactly as after a single run, through paste, undo and redo.

type Row = { id: number; name: string; qty: number };
const ROWS: Row[] = [
    { id: 1, name: 'a', qty: 1 },
    { id: 2, name: 'b', qty: 2 },
    { id: 3, name: 'c', qty: 3 },
];
const COLS: GridColDef<Row>[] = [{ field: 'name', editable: true }, { field: 'qty', type: 'number', editable: true }];

afterEach(cleanup);

function renderStrict() {
    const holder: { api: React.MutableRefObject<GridApi> | null } = { api: null };
    function Harness() {
        const apiRef = useGridApiRef();
        holder.api = apiRef;
        return <DataGrid<Row> rows={ROWS} columns={COLS} apiRef={apiRef} cellSelection undoRedo height={300} />;
    }
    render(<StrictMode><Harness /></StrictMode>);
    return () => holder.api!.current;
}

describe('row store updated in place under StrictMode', () => {
    it('paste, undo and redo leave a consistent store', async () => {
        const api = renderStrict();
        act(() => api().selectCellRange({ id: 1, field: 'name' }, { id: 1, field: 'name' }));
        await act(async () => { await api().pasteText('x\t10\ny\t20'); });
        expect(api().getAllRows()).toEqual([
            { id: 1, name: 'x', qty: 10 },
            { id: 2, name: 'y', qty: 20 },
            { id: 3, name: 'c', qty: 3 },
        ]);
        api().getAllRows().forEach(row => expect(api().getRow(row.id)).toBe(row));

        await act(async () => { await api().undo(); });
        expect(api().getAllRows()).toEqual(ROWS);
        api().getAllRows().forEach(row => expect(api().getRow(row.id)).toBe(row));

        await act(async () => { await api().redo(); });
        expect(api().getAllRows().map(r => r.name)).toEqual(['x', 'y', 'c']);
        expect(api().getAllRows()).toHaveLength(3);
    });
});
