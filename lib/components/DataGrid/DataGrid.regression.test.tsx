/**
 * Regression tests for bugs fixed in the DataGrid render layer.
 *
 * Tests cover:
 *   - getVisibleRows() respects pagination (not returning all rows)
 *   - Row DOM nodes are not remounted when column widths change
 *
 * Not covered here (require a real browser / ResizeObserver):
 *   - translateY offset — depends on computed cumulativeHeights, which requires
 *     a real viewport; jsdom reports all dimensions as 0
 *   - scroll-ref RAF batching — requires scroll events that jsdom fires but
 *     requestAnimationFrame does not execute by default
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import type { GridColDef } from '../../types';

const COLS: GridColDef[] = [
    { field: 'id',   headerName: 'ID',   width: 80 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'age',  headerName: 'Age',  width: 100 },
];

// 10 rows so pagination actually clips the visible set
const ROWS = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    age: 20 + i,
}));

// ─────────────────────────────────────────────────────────────────────────────
// Bug: getVisibleRows() was returning sortedUnpinnedRows (all rows) regardless
// of whether pagination was active. Fixed: now returns paginatedUnpinnedRows
// when a paginationModel is set.
// ─────────────────────────────────────────────────────────────────────────────

describe('getVisibleRows respects pagination', () => {
    it('returns only the current page rows, not all rows', () => {
        const assigningRef = React.createRef<import('../../types').GridApi>();

        function GridWithRef() {
            const ref = useGridApiRef();
            // expose ref to test scope after render
            React.useEffect(() => {
                (assigningRef as React.MutableRefObject<import('../../types').GridApi>).current = ref.current;
            });
            return (
                <DataGrid
                    rows={ROWS}
                    columns={COLS}
                    apiRef={ref}
                    pagination
                    paginationModel={{ page: 0, pageSize: 3 }}
                />
            );
        }

        act(() => {
            render(<GridWithRef />);
        });

        // pageSize=3, total=10 → page 0 should expose 3 rows, not 10.
        const visible = assigningRef.current?.getVisibleRows() ?? [];
        expect(visible.length).toBe(3);
        expect(visible.map(r => r.id)).toEqual([1, 2, 3]);
    });

    it('returns all rows when no pagination is provided', () => {
        const assigningRef = React.createRef<import('../../types').GridApi>();

        function GridNoPagination() {
            const ref = useGridApiRef();
            React.useEffect(() => {
                (assigningRef as React.MutableRefObject<import('../../types').GridApi>).current = ref.current;
            });
            return <DataGrid rows={ROWS} columns={COLS} apiRef={ref} />;
        }

        act(() => {
            render(<GridNoPagination />);
        });

        const visible = assigningRef.current?.getVisibleRows() ?? [];
        // Without pagination the full sorted set is returned.
        expect(visible.length).toBe(ROWS.length);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Bug: row keys were `${row.id}-${virtualization.totalWidth}`, so every column
// resize unmounted and remounted every DOM row node.
// Fixed: key is now simply `row.id`.
//
// Test strategy: capture DOM element identity before and after a column prop
// change. If the key includes totalWidth the elements will be new nodes; if
// the key is stable they will be the exact same DOM nodes.
// ─────────────────────────────────────────────────────────────────────────────

describe('row DOM nodes are stable across column width changes', () => {
    it('does not remount rows when column widths change', () => {
        const { rerender, container } = render(
            <DataGrid rows={ROWS.slice(0, 3)} columns={COLS} />
        );

        // Collect the row cell elements before the update.
        const cellsBefore = Array.from(
            container.querySelectorAll('[role="gridcell"]')
        );
        expect(cellsBefore.length).toBeGreaterThan(0);

        // Update the Name column width — simulates a resize.
        const updatedCols: GridColDef[] = COLS.map(c =>
            c.field === 'name' ? { ...c, width: 250 } : c
        );

        rerender(<DataGrid rows={ROWS.slice(0, 3)} columns={updatedCols} />);

        const cellsAfter = Array.from(
            container.querySelectorAll('[role="gridcell"]')
        );

        // Same number of cells, and critically the same DOM node instances.
        expect(cellsAfter.length).toBe(cellsBefore.length);
        cellsBefore.forEach((node, i) => {
            expect(cellsAfter[i]).toBe(node);
        });
    });
});
