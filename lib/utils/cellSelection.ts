import type { GridCellCoordinates, GridCellRange, GridCellSelectionModel, GridRowId } from '../types';
import { isSystemField } from './focus';

/**
 * Pure helpers of cell range selection (`cellSelection`). A range is stored as two corner cells
 * (ids and fields); everything here works it out against the current display order.
 */

/** The synthetic row-grouping column. Like the system columns, it never joins a range. */
export const GROUPING_COLUMN_FIELD = '__group__';

/** Whether cells of this column can be part of a range: data columns only. */
export function isRangeColumnField(field: string): boolean {
    return !isSystemField(field) && field !== GROUPING_COLUMN_FIELD;
}

export const isSameCoordinates = (a: GridCellCoordinates | null | undefined, b: GridCellCoordinates | null | undefined): boolean =>
    a === b || (!!a && !!b && a.id === b.id && a.field === b.field);

export const isSingleCellRange = (range: GridCellRange): boolean => isSameCoordinates(range.anchor, range.head);

/** A model holding the same range(s) as `b`. */
export function isSameCellSelectionModel(a: GridCellSelectionModel, b: GridCellSelectionModel): boolean {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    return a.every((range, i) => isSameCoordinates(range.anchor, b[i].anchor) && isSameCoordinates(range.head, b[i].head));
}

/** A rectangle in display indices: rows of the renderable rows, columns of the range columns. Inclusive. */
export interface CellRangeRect {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

/** The rectangle of a range, plus where its two corners are. */
export interface ResolvedCellRange extends CellRangeRect {
    anchorRow: number;
    anchorCol: number;
    headRow: number;
    headCol: number;
}

/** Span information, from useGridSpanning. */
export interface CellRangeSpanLookup {
    /** For a cell covered by a span, the origin cell of that span; `null` for any other cell. */
    getSpanOrigin: (rowId: GridRowId, field: string) => { rowId: GridRowId; field: string } | null;
    /** The colSpan of a span origin (1 for other cells). */
    getColSpan: (rowId: GridRowId, field: string) => number;
    /** The rowSpan of a span origin (1 for other cells). */
    getRowSpan: (rowId: GridRowId, field: string) => number;
}

export interface CellRangeContext {
    /** Ids of the renderable rows (top-pinned, page rows, bottom-pinned), in display order. */
    rowIds: readonly GridRowId[];
    rowIndexById: ReadonlyMap<GridRowId, number>;
    /** Range columns in screen order: left-pinned, centre, right-pinned. */
    fields: readonly string[];
    colIndexByField: ReadonlyMap<string, number>;
    /** Present when the grid has column or row spans. */
    spans?: CellRangeSpanLookup;
}

/** The merged area (span) that contains a cell, or the cell itself. */
function mergedArea(r: number, c: number, ctx: CellRangeContext): CellRangeRect {
    const { rowIds, fields, rowIndexById, colIndexByField, spans } = ctx;
    const single = { top: r, bottom: r, left: c, right: c };
    if (!spans) return single;
    const rowId = rowIds[r];
    const field = fields[c];
    const origin = spans.getSpanOrigin(rowId, field) ?? { rowId, field };
    const originRow = rowIndexById.get(origin.rowId);
    const originCol = colIndexByField.get(origin.field);
    if (originRow === undefined || originCol === undefined) return single;
    const rowSpan = Math.max(1, spans.getRowSpan(origin.rowId, origin.field));
    const colSpan = Math.max(1, spans.getColSpan(origin.rowId, origin.field));
    return {
        top: originRow,
        bottom: Math.min(rowIds.length - 1, originRow + rowSpan - 1),
        left: originCol,
        right: Math.min(fields.length - 1, originCol + colSpan - 1),
    };
}

/**
 * Grows a rectangle until no span crosses its edge, as Excel does with merged cells. A span that
 * crosses the edge holds a cell on the edge, so only the edge cells are looked at.
 */
export function growRectToSpans(rect: CellRangeRect, ctx: CellRangeContext): CellRangeRect {
    if (!ctx.spans) return rect;
    let { top, bottom, left, right } = rect;
    let changed = true;
    const take = (area: CellRangeRect) => {
        if (area.top < top) { top = area.top; changed = true; }
        if (area.bottom > bottom) { bottom = area.bottom; changed = true; }
        if (area.left < left) { left = area.left; changed = true; }
        if (area.right > right) { right = area.right; changed = true; }
    };
    while (changed) {
        changed = false;
        for (let r = top; r <= bottom; r++) {
            take(mergedArea(r, left, ctx));
            if (right !== left) take(mergedArea(r, right, ctx));
        }
        for (let c = left + 1; c < right; c++) {
            take(mergedArea(top, c, ctx));
            if (bottom !== top) take(mergedArea(bottom, c, ctx));
        }
    }
    return { top, bottom, left, right };
}

/**
 * Where a range lies in the current display order, or `null` when one of its corners is not
 * displayed (its row was filtered, paged or removed, or its column hidden).
 */
export function resolveCellRange(range: GridCellRange, ctx: CellRangeContext): ResolvedCellRange | null {
    const anchorRow = ctx.rowIndexById.get(range.anchor.id);
    const headRow = ctx.rowIndexById.get(range.head.id);
    const anchorCol = ctx.colIndexByField.get(range.anchor.field);
    const headCol = ctx.colIndexByField.get(range.head.field);
    if (anchorRow === undefined || headRow === undefined || anchorCol === undefined || headCol === undefined) return null;
    const rect = growRectToSpans({
        top: Math.min(anchorRow, headRow),
        bottom: Math.max(anchorRow, headRow),
        left: Math.min(anchorCol, headCol),
        right: Math.max(anchorCol, headCol),
    }, ctx);
    return { ...rect, anchorRow, anchorCol, headRow, headCol };
}

export const rectCellCount = (rect: CellRangeRect): number => (rect.bottom - rect.top + 1) * (rect.right - rect.left + 1);

/**
 * The new head for a Shift+navigation key, as display indices, or `null` when it does not move.
 * Shift+Arrow moves one cell and does not wrap to the next row. Extending moves from the far edge
 * of the rectangle, so the head steps out of a span it grew over.
 */
export function nextRangeHead(
    resolved: ResolvedCellRange,
    key: string,
    withModifier: boolean,
    pageSize: number,
    lastRow: number,
    lastCol: number,
): { row: number; col: number } | null {
    const { headRow, headCol, anchorRow, anchorCol, top, bottom, left, right } = resolved;
    let row = headRow;
    let col = headCol;
    switch (key) {
        case 'ArrowRight': col = headCol >= anchorCol ? right + 1 : headCol + 1; break;
        case 'ArrowLeft': col = headCol <= anchorCol ? left - 1 : headCol - 1; break;
        case 'ArrowDown': row = headRow >= anchorRow ? bottom + 1 : headRow + 1; break;
        case 'ArrowUp': row = headRow <= anchorRow ? top - 1 : headRow - 1; break;
        case 'Home':
            col = 0;
            if (withModifier) row = 0;
            break;
        case 'End':
            col = lastCol;
            if (withModifier) row = lastRow;
            break;
        case 'PageUp': row = headRow - pageSize; break;
        case 'PageDown': row = headRow + pageSize; break;
        default: return null;
    }
    row = Math.min(Math.max(row, 0), lastRow);
    col = Math.min(Math.max(col, 0), lastCol);
    if (row === headRow && col === headCol) return null;
    return { row, col };
}

/**
 * The range flags one row passes to its cells, or `null` for a row outside the range. Rows outside
 * keep `null`, so a drag only re-renders the rows it enters or leaves. `left` / `right` are data
 * column indices (`columnIndexMap`).
 */
export interface GridRowCellRange {
    left: number;
    right: number;
    isTop: boolean;
    isBottom: boolean;
    /** Rows from this one to the bottom of the range; only set (else 0) when the grid has row spans. */
    bottomOffset: number;
}

export function getRowCellRange(
    range: { top: number; bottom: number; left: number; right: number } | null | undefined,
    rowIndex: number,
    hasRowSpan: boolean,
): GridRowCellRange | null {
    if (!range || rowIndex < range.top || rowIndex > range.bottom) return null;
    return {
        left: range.left,
        right: range.right,
        isTop: rowIndex === range.top,
        isBottom: rowIndex === range.bottom,
        bottomOffset: hasRowSpan ? range.bottom - rowIndex : 0,
    };
}

export const isSameRowCellRange = (a: GridRowCellRange | null | undefined, b: GridRowCellRange | null | undefined): boolean =>
    a === b || (!!a && !!b && a.left === b.left && a.right === b.right && a.isTop === b.isTop && a.isBottom === b.isBottom
        && a.bottomOffset === b.bottomOffset);

/** Bit flags a cell receives for its place in the range (a number keeps memoised cells stable). */
export const RANGE_CELL = 1;
export const RANGE_TOP = 2;
export const RANGE_BOTTOM = 4;
export const RANGE_LEFT = 8;
export const RANGE_RIGHT = 16;

/**
 * The flags of the cell at data column `colIndex` (spanning `colSpan` columns and `rowSpan` rows from
 * this row), or 0 when it is outside the range.
 */
export function getCellRangeFlags(rowRange: GridRowCellRange | null | undefined, colIndex: number, colSpan: number, rowSpan: number): number {
    if (!rowRange) return 0;
    const lastCol = colIndex + Math.max(1, colSpan) - 1;
    if (colIndex < rowRange.left || lastCol > rowRange.right) return 0;
    let flags = RANGE_CELL;
    if (rowRange.isTop) flags |= RANGE_TOP;
    if (rowRange.isBottom || (rowSpan > 1 && rowSpan - 1 >= rowRange.bottomOffset)) flags |= RANGE_BOTTOM;
    if (colIndex === rowRange.left) flags |= RANGE_LEFT;
    if (lastCol === rowRange.right) flags |= RANGE_RIGHT;
    return flags;
}

/** The default screen-reader text after a range change. */
export function defaultCellSelectionAnnouncement(cellCount: number, rowCount: number, columnCount: number): string {
    const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
    return `${plural(cellCount, 'cell', 'cells')} selected, ${plural(rowCount, 'row', 'rows')} by ${plural(columnCount, 'column', 'columns')}`;
}

/** Above this many cells a copy warns (development only) that exportToCsv suits the job better. */
export const LARGE_RANGE_COPY_CELLS = 100_000;
