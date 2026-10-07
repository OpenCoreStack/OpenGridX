import { describe, it, expect } from 'vitest';
import {
    getCellRangeFlags,
    getRowCellRange,
    growRectToSpans,
    isRangeColumnField,
    isSameCellSelectionModel,
    nextRangeHead,
    resolveCellRange,
    defaultCellSelectionAnnouncement,
    RANGE_BOTTOM,
    RANGE_CELL,
    RANGE_LEFT,
    RANGE_RIGHT,
    RANGE_TOP,
} from './cellSelection';
import type { CellRangeContext, CellRangeSpanLookup } from './cellSelection';
import { buildRangeTsv } from '../hooks/features/useGridClipboard';
import { CHECKBOX_FIELD, EXPAND_FIELD, REORDER_FIELD } from './focus';
import type { GridColDef, GridRowId, GridRowModel } from '../types';

function makeContext(rowIds: GridRowId[], fields: string[], spans?: CellRangeSpanLookup): CellRangeContext {
    return {
        rowIds,
        rowIndexById: new Map(rowIds.map((id, i) => [id, i])),
        fields,
        colIndexByField: new Map(fields.map((f, i) => [f, i])),
        spans,
    };
}

const FIELDS = ['a', 'b', 'c', 'd'];

describe('resolveCellRange', () => {
    it('works out the rectangle from the corner ids and fields, whichever corner is first', () => {
        const ctx = makeContext([1, 2, 3, 4, 5], FIELDS);
        expect(resolveCellRange({ anchor: { id: 4, field: 'c' }, head: { id: 2, field: 'a' } }, ctx)).toEqual({
            top: 1, bottom: 3, left: 0, right: 2, anchorRow: 3, anchorCol: 2, headRow: 1, headCol: 0,
        });
    });

    it('follows the corner rows when sorting moves them', () => {
        const range = { anchor: { id: 1, field: 'a' }, head: { id: 2, field: 'b' } };
        expect(resolveCellRange(range, makeContext([1, 2, 3, 4], FIELDS))).toMatchObject({ top: 0, bottom: 1 });
        // Sorted descending: row 2 is now third and row 1 last.
        expect(resolveCellRange(range, makeContext([4, 3, 2, 1], FIELDS))).toMatchObject({ top: 2, bottom: 3, anchorRow: 3, headRow: 2 });
    });

    it('is null when a corner row or column is no longer displayed', () => {
        const range = { anchor: { id: 1, field: 'a' }, head: { id: 3, field: 'c' } };
        expect(resolveCellRange(range, makeContext([1, 2], FIELDS))).toBeNull();
        expect(resolveCellRange(range, makeContext([1, 2, 3], ['a', 'b']))).toBeNull();
    });
});

describe('growRectToSpans', () => {
    // Row 1 (index 0) has a colSpan of 2 at 'b' (covers 'c'); row 3 (index 2) has a rowSpan of 3 at 'd'.
    const spans: CellRangeSpanLookup = {
        getSpanOrigin: (rowId, field) => {
            if (rowId === 1 && field === 'c') return { rowId: 1, field: 'b' };
            if ((rowId === 4 || rowId === 5) && field === 'd') return { rowId: 3, field: 'd' };
            return null;
        },
        getColSpan: (rowId, field) => (rowId === 1 && field === 'b' ? 2 : 1),
        getRowSpan: (rowId, field) => (rowId === 3 && field === 'd' ? 3 : 1),
    };
    const ctx = makeContext([1, 2, 3, 4, 5], FIELDS, spans);

    it('grows a range that touches part of a colSpan to the whole span', () => {
        expect(growRectToSpans({ top: 0, bottom: 1, left: 0, right: 1 }, ctx)).toEqual({ top: 0, bottom: 1, left: 0, right: 2 });
    });

    it('grows a range that touches part of a rowSpan to the whole span', () => {
        expect(growRectToSpans({ top: 3, bottom: 3, left: 3, right: 3 }, ctx)).toEqual({ top: 2, bottom: 4, left: 3, right: 3 });
    });

    it('grows repeatedly until no span crosses the edge', () => {
        // Starting at row 1 'c' (covered by the colSpan) to row 2 'd': the colSpan pulls in 'b',
        // and growing down to row 3 'd' then pulls in the whole rowSpan (rows 3 to 5).
        expect(growRectToSpans({ top: 0, bottom: 2, left: 2, right: 3 }, ctx)).toEqual({ top: 0, bottom: 4, left: 1, right: 3 });
    });

    it('leaves the rectangle alone without spans', () => {
        expect(growRectToSpans({ top: 0, bottom: 1, left: 0, right: 1 }, makeContext([1, 2, 3], FIELDS))).toEqual({ top: 0, bottom: 1, left: 0, right: 1 });
    });
});

describe('isRangeColumnField', () => {
    it('leaves out the checkbox, expand, reorder and grouping columns', () => {
        for (const field of [CHECKBOX_FIELD, EXPAND_FIELD, REORDER_FIELD, '__group__']) expect(isRangeColumnField(field)).toBe(false);
        expect(isRangeColumnField('amount')).toBe(true);
    });
});

describe('nextRangeHead', () => {
    const at = (anchorRow: number, anchorCol: number, headRow: number, headCol: number) => ({
        anchorRow, anchorCol, headRow, headCol,
        top: Math.min(anchorRow, headRow), bottom: Math.max(anchorRow, headRow),
        left: Math.min(anchorCol, headCol), right: Math.max(anchorCol, headCol),
    });

    it('moves one cell and does not wrap at the end of a row', () => {
        expect(nextRangeHead(at(0, 2, 0, 2), 'ArrowRight', false, 10, 9, 3)).toEqual({ row: 0, col: 3 });
        expect(nextRangeHead(at(0, 3, 0, 3), 'ArrowRight', false, 10, 9, 3)).toBeNull();
        expect(nextRangeHead(at(1, 0, 1, 0), 'ArrowLeft', false, 10, 9, 3)).toBeNull();
    });

    it('shrinks back towards the anchor', () => {
        expect(nextRangeHead(at(2, 1, 4, 1), 'ArrowUp', false, 10, 9, 3)).toEqual({ row: 3, col: 1 });
        expect(nextRangeHead(at(2, 2, 2, 0), 'ArrowRight', false, 10, 9, 3)).toEqual({ row: 2, col: 1 });
    });

    it('extends from the far edge of a rectangle grown over a span', () => {
        const grown = { ...at(0, 0, 0, 1), right: 2 };
        expect(nextRangeHead(grown, 'ArrowRight', false, 10, 9, 3)).toEqual({ row: 0, col: 3 });
    });

    it('Home / End go to the row ends, with Ctrl to the page corners; PageUp / PageDown by a page', () => {
        expect(nextRangeHead(at(3, 2, 3, 2), 'Home', false, 10, 9, 3)).toEqual({ row: 3, col: 0 });
        expect(nextRangeHead(at(3, 2, 3, 2), 'End', false, 10, 9, 3)).toEqual({ row: 3, col: 3 });
        expect(nextRangeHead(at(3, 2, 3, 2), 'Home', true, 10, 9, 3)).toEqual({ row: 0, col: 0 });
        expect(nextRangeHead(at(3, 2, 3, 2), 'End', true, 10, 9, 3)).toEqual({ row: 9, col: 3 });
        expect(nextRangeHead(at(3, 2, 3, 2), 'PageDown', false, 4, 9, 3)).toEqual({ row: 7, col: 2 });
        expect(nextRangeHead(at(3, 2, 3, 2), 'PageUp', false, 4, 9, 3)).toEqual({ row: 0, col: 2 });
    });
});

describe('row and cell flags', () => {
    const display = { top: 2, bottom: 4, left: 1, right: 3 };

    it('gives rows outside the range null', () => {
        expect(getRowCellRange(display, 1, false)).toBeNull();
        expect(getRowCellRange(display, 5, false)).toBeNull();
        expect(getRowCellRange(null, 3, false)).toBeNull();
    });

    it('gives middle rows the same values, so they compare equal render to render', () => {
        expect(getRowCellRange(display, 3, false)).toEqual({ left: 1, right: 3, isTop: false, isBottom: false, bottomOffset: 0 });
        expect(getRowCellRange({ ...display, bottom: 6 }, 3, false)).toEqual(getRowCellRange(display, 3, false));
    });

    it('marks the edges of the rectangle', () => {
        const top = getRowCellRange(display, 2, false);
        expect(getCellRangeFlags(top, 0, 1, 1)).toBe(0);
        expect(getCellRangeFlags(top, 1, 1, 1)).toBe(RANGE_CELL | RANGE_TOP | RANGE_LEFT);
        expect(getCellRangeFlags(top, 2, 1, 1)).toBe(RANGE_CELL | RANGE_TOP);
        expect(getCellRangeFlags(getRowCellRange(display, 4, false), 3, 1, 1)).toBe(RANGE_CELL | RANGE_BOTTOM | RANGE_RIGHT);
    });

    it('draws the bottom edge on a rowSpan origin that reaches the bottom row', () => {
        const row = getRowCellRange(display, 3, true);
        expect(getCellRangeFlags(row, 2, 1, 2) & RANGE_BOTTOM).toBe(RANGE_BOTTOM);
        expect(getCellRangeFlags(row, 2, 1, 1) & RANGE_BOTTOM).toBe(0);
    });

    it('draws the right edge on a colSpan origin that ends at the right column', () => {
        expect(getCellRangeFlags(getRowCellRange(display, 3, false), 2, 2, 1) & RANGE_RIGHT).toBe(RANGE_RIGHT);
    });
});

describe('buildRangeTsv', () => {
    const columns: GridColDef[] = [
        { field: 'name' },
        { field: 'note' },
        { field: 'amount', valueFormatter: ({ value }) => `$${Number(value).toFixed(2)}` },
    ];
    const rows: GridRowModel[] = [
        { id: 1, name: 'Tab\there', note: 'say "hi"', amount: 5 },
        { id: 2, name: 'Line\nbreak', note: '', amount: 7.5 },
    ];

    it('writes tabs between cells and line breaks between rows, without a header line', () => {
        expect(buildRangeTsv(rows, columns)).toBe('"Tab\there"\t"say ""hi"""\t$5.00\n"Line\nbreak"\t\t$7.50');
    });

    it('leaves span-covered positions empty', () => {
        expect(buildRangeTsv([rows[0]], columns, (_row, col) => col.field === 'note')).toBe('"Tab\there"\t\t$5.00');
    });

    it('falls back to the raw value when a valueFormatter throws', () => {
        const cols: GridColDef[] = [{ field: 'amount', valueFormatter: () => { throw new Error('boom'); } }];
        expect(buildRangeTsv([rows[0]], cols)).toBe('5');
    });
});

describe('model helpers', () => {
    it('compares models by their corners', () => {
        const a = [{ anchor: { id: 1, field: 'a' }, head: { id: 2, field: 'b' } }];
        expect(isSameCellSelectionModel(a, [{ anchor: { id: 1, field: 'a' }, head: { id: 2, field: 'b' } }])).toBe(true);
        expect(isSameCellSelectionModel(a, [{ anchor: { id: 1, field: 'a' }, head: { id: 2, field: 'c' } }])).toBe(false);
        expect(isSameCellSelectionModel(a, [])).toBe(false);
    });

    it('announces the size in words, singular for one', () => {
        expect(defaultCellSelectionAnnouncement(12, 3, 4)).toBe('12 cells selected, 3 rows by 4 columns');
        expect(defaultCellSelectionAnnouncement(2, 1, 2)).toBe('2 cells selected, 1 row by 2 columns');
    });
});
