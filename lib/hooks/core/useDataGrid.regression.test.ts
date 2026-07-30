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

const COLS: GridColDef[] = [
    { field: 'id',   headerName: 'ID',   width: 80 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age',  headerName: 'Age',  width: 100 },
];

const ROWS = [
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
        const updatedCols: GridColDef[] = COLS.map(c =>
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
