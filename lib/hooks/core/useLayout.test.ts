import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLayout } from './useLayout';
import type { UseLayoutParams } from './useLayout';
import type { GridColDef, GridRowId, GridRowModel } from '../../types';

type Row = GridRowModel & { id: number };

const rows = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: i + 1 }));

const params = (cols: GridColDef<Row>[], extra: Partial<UseLayoutParams<Row>> = {}): UseLayoutParams<Row> => ({
    rowHeight: 50,
    pagination: false,
    paginatedUnpinnedRows: [],
    sortedUnpinnedRows: [],
    expandedRowIds: new Set<GridRowId>(),
    pinnedTopRowsLength: 0,
    pinnedBottomRowsLength: 0,
    visibleOrderedColumns: cols,
    pinnedColumns: undefined,
    columnWidths: {},
    viewportWidth: 1000,
    checkboxSelection: false,
    hasDetailPanel: false,
    rowReordering: false,
    pinCheckboxColumn: true,
    pinExpandColumn: true,
    autoHeight: false,
    paginationMode: 'client',
    isLoading: false,
    pageSize: 25,
    ...extra,
});

const layoutOf = (p: UseLayoutParams<Row>) => renderHook(() => useLayout(p)).result.current;

describe('useLayout — percentage widths', () => {
    it('gives every percentage column a share of the same base', () => {
        const layout = layoutOf(params([{ field: 'a', width: '50%' }, { field: 'b', width: '50%' }]));
        expect(layout.unpinnedColWidths).toEqual([500, 500]);
        expect(layout.totalWidth).toBe(1000);
    });

    it('does not depend on the order of the percentage columns', () => {
        const first = layoutOf(params([{ field: 'a', width: '30%' }, { field: 'b', width: '60%' }]));
        const second = layoutOf(params([{ field: 'b', width: '60%' }, { field: 'a', width: '30%' }]));
        expect(first.unpinnedColWidths).toEqual([300, 600]);
        expect(second.unpinnedColWidths).toEqual([600, 300]);
    });

    it('takes percentages of the space left by fixed-width columns', () => {
        const layout = layoutOf(params([
            { field: 'a', width: 250 },
            { field: 'b', width: '25%' },
            { field: 'c', width: '25%' },
            { field: 'd', width: '50%' },
        ]));
        expect(layout.unpinnedColWidths).toEqual([250, 187.5, 187.5, 375]);
    });

    it('clamps a percentage width to maxWidth', () => {
        const layout = layoutOf(params([{ field: 'a', width: '50%', maxWidth: 300 }, { field: 'b', width: '50%' }]));
        expect(layout.unpinnedColWidths).toEqual([300, 500]);
    });
});

describe('useLayout — minWidth / maxWidth', () => {
    it('clamps fixed widths to minWidth and maxWidth, as the cell CSS does', () => {
        const layout = layoutOf(params([
            { field: 'a', width: 50, minWidth: 120 },
            { field: 'b', width: 400, maxWidth: 200 },
            { field: 'c', width: 200 },
        ]));
        expect(layout.unpinnedColWidths).toEqual([120, 200, 200]);
        expect(layout.totalWidth).toBe(520);
    });

    it('clamps a manual (resized) width', () => {
        const layout = layoutOf(params([{ field: 'a', width: 100, minWidth: 80 }], { columnWidths: { a: 30 } }));
        expect(layout.unpinnedColWidths).toEqual([80]);
    });

    it('clamps pinned column widths, so the pinned block width matches what renders', () => {
        const layout = layoutOf(params([
            { field: 'name', width: 50, minWidth: 120 },
            { field: 'amount', width: 400, maxWidth: 150 },
            { field: 'x', width: 100 },
        ], { pinnedColumns: { left: ['name'], right: ['amount'] } }));
        expect(layout.leftPinnedCols.map(c => c.width)).toEqual([120]);
        expect(layout.rightPinnedCols.map(c => c.width)).toEqual([150]);
        expect(layout.leftWidth).toBe(120);
        expect(layout.rightWidth).toBe(150);
    });
});

describe('useLayout — pinned columns', () => {
    it('resolves a percentage width on a pinned column like on an unpinned one', () => {
        const cols: GridColDef<Row>[] = [{ field: 'name', width: '30%' }, { field: 'x', width: 100 }];
        const unpinned = layoutOf(params(cols));
        const pinned = layoutOf(params(cols, { pinnedColumns: { left: ['name'] } }));
        expect(unpinned.unpinnedColWidths[0]).toBe(270);
        expect(pinned.leftPinnedCols[0].width).toBe(270);
        expect(pinned.leftWidth).toBe(270);
    });

    it('gives a flex column the same width whether pinned or not', () => {
        const cols: GridColDef<Row>[] = [{ field: 'name', flex: 1 }, { field: 'x', width: 100 }];
        const unpinned = layoutOf(params(cols));
        const pinned = layoutOf(params(cols, { pinnedColumns: { right: ['name'] } }));
        expect(unpinned.unpinnedColWidths[0]).toBe(900);
        expect(pinned.rightPinnedCols[0].width).toBe(900);
    });

    it('orders pinned columns by the pinnedColumns model, not by column order', () => {
        const cols: GridColDef<Row>[] = [
            { field: 'a', width: 100 }, { field: 'b', width: 200 }, { field: 'c', width: 150 }, { field: 'd', width: 120 },
        ];
        const layout = layoutOf(params(cols, { pinnedColumns: { left: ['b', 'a'], right: ['d', 'c'] } }));
        expect(layout.leftPinnedCols.map(c => c.field)).toEqual(['b', 'a']);
        expect(layout.rightPinnedCols.map(c => c.field)).toEqual(['d', 'c']);
    });

    it('reports how much of the system column block is sticky', () => {
        const layout = layoutOf(params([{ field: 'a', width: 100 }], {
            checkboxSelection: true, hasDetailPanel: true, rowReordering: true, pinCheckboxColumn: false,
        }));
        expect(layout.systemColumnsWidth).toBe(144);
        expect(layout.pinnedSystemColumnsWidth).toBe(96);
    });
});

describe('useLayout — detail panel heights', () => {
    const expanded = new Set<GridRowId>([1]);

    it('lays an "auto" panel out at its measured height', () => {
        const layout = layoutOf(params([{ field: 'a', width: 100 }], {
            sortedUnpinnedRows: rows(3),
            expandedRowIds: expanded,
            getDetailPanelHeight: () => 'auto',
            detailPanelHeights: new Map<GridRowId, number>([[1, 734]]),
        }));
        expect(layout.rowHeights).toEqual([784, 50, 50]);
    });

    it('lays out a panel height of 0 as 0, the height the panel renders at', () => {
        const layout = layoutOf(params([{ field: 'a', width: 100 }], {
            sortedUnpinnedRows: rows(2),
            expandedRowIds: expanded,
            getDetailPanelHeight: () => 0,
        }));
        expect(layout.rowHeights).toEqual([50, 50]);
    });

    it('defaults to a 200px panel when getDetailPanelHeight is omitted', () => {
        const layout = layoutOf(params([{ field: 'a', width: 100 }], {
            sortedUnpinnedRows: rows(2),
            expandedRowIds: expanded,
        }));
        expect(layout.rowHeights).toEqual([250, 50]);
    });

    it('includes expanded panels of pinned rows in the pinned block heights', () => {
        const pinnedRow: Row = { id: 1 };
        const layout = layoutOf(params([{ field: 'a', width: 100 }], {
            sortedUnpinnedRows: [{ id: 2 }, { id: 3 }],
            pinnedBottomRows: [pinnedRow],
            pinnedBottomRowsLength: 1,
            expandedRowIds: expanded,
            getDetailPanelHeight: () => 120,
        }));
        expect(layout.pinnedBottomHeight).toBe(170);
        expect(layout.pinnedTopHeight).toBe(0);
    });
});
