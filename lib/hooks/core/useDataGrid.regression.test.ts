/**
 * Regression tests for bugs fixed in the useDataGrid reducer.
 *
 * Each describe block names the bug and the commit that fixed it, so a
 * future failure tells you exactly what regressed and where to look.
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataGrid } from './useDataGrid';
import type { GridColDef } from '../../types';

type Row = { id: number; name: string; age: number };

const COLS: GridColDef<Row>[] = [
    { field: 'id',   headerName: 'ID',   width: 80 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age',  headerName: 'Age',  width: 100 },
];

const ROWS: Row[] = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob',   age: 25 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Bug: SET_COLUMNS reducer was hardcoding columnVisibilityModel: {} on every
// column update, silently wiping any hidden columns.
// ─────────────────────────────────────────────────────────────────────────────
describe('SET_COLUMNS preserves columnVisibilityModel', () => {
    it('keeps hidden columns hidden after setColumns is called', () => {
        const { result } = renderHook(() =>
            useDataGrid({
                rows: ROWS,
                columns: COLS,
                columnVisibilityModel: { age: false },
            })
        );

        // Confirm the initial visibility model was applied.
        expect(result.current.state.columns.columnVisibilityModel).toEqual({ age: false });

        // Simulate a column update (e.g. a width change coming from a resize handler).
        const updatedCols: GridColDef<Row>[] = COLS.map(c =>
            c.field === 'name' ? { ...c, width: 200 } : c
        );

        act(() => {
            result.current.setColumns(updatedCols);
        });

        // The visibility model must survive the column update — not reset to {}.
        expect(result.current.state.columns.columnVisibilityModel).toEqual({ age: false });
    });

    it('does not gain a visibility entry for columns that were already visible', () => {
        const { result } = renderHook(() =>
            useDataGrid({ rows: ROWS, columns: COLS })
        );

        act(() => {
            result.current.setColumns(COLS);
        });

        // No spurious entries: an empty model means all columns are visible.
        expect(result.current.state.columns.columnVisibilityModel).toEqual({});
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Perf (3.8.0): a committed edit must not rebuild the id maps (O(rows) at 1M rows).
// The maps keep their identity, only the row array is patched.
// ─────────────────────────────────────────────────────────────────────────────
describe('REPLACE_ROW(S) update the store incrementally', () => {
    it('patches the edited rows and keeps the id maps', () => {
        const { result } = renderHook(() => useDataGrid({ rows: ROWS, columns: COLS }));
        const before = result.current.state.rows;
        const edited = { id: 2, name: 'Bobby', age: 26 };
        act(() => { result.current.replaceRows(new Map([[2, edited]])); });
        const after = result.current.state.rows;
        expect(after.idByRow).toBe(before.idByRow);
        expect(after.idRowsLookup).toBe(before.idRowsLookup);
        expect(after.rows).not.toBe(before.rows);
        expect(after.rows).toEqual([ROWS[0], edited]);
        expect(after.idByRow.get(edited)).toBe(2);
        expect(after.idByRow.has(ROWS[1])).toBe(false);
        expect(after.indexById.get(2)).toBe(1);
        expect(result.current.apiRef.current.getRow(2)).toBe(edited);
    });

    it('ignores an id the store does not hold', () => {
        const { result } = renderHook(() => useDataGrid({ rows: ROWS, columns: COLS }));
        const before = result.current.state;
        act(() => { result.current.replaceRow(99, { id: 99, name: 'x', age: 1 }); });
        expect(result.current.state).toBe(before);
    });
});
