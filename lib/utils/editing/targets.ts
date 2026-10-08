import type { GridCellCoordinates, GridCellParams, GridColDef, GridRowId, GridRowMeta, GridRowModel } from '../../types';
import { isRangeColumnField } from '../cellSelection';
import type { CellRangeRect } from '../cellSelection';
import { isSystemField } from '../focus';
import { isSyntheticRowId } from '../syntheticRows';
import { resolveCellEditable } from './index';
import { getCellValue } from '../values';

/**
 * Where batch edits (paste, range clear, undo/redo) land: the renderable rows and the range columns
 * (data columns, no system or grouping column) in display order, the same coordinates as a cell range.
 */
export interface GridEditTargetContext<R extends GridRowModel> {
    rows: readonly R[];
    rowIds: GridRowId[];
    rowIndexById: Map<GridRowId, number>;
    /** Range columns in screen order. */
    columns: GridColDef<R>[];
    colIndexByField: Map<string, number>;
    /** Number of system columns before the data columns (for `isCellEditable`'s `colIndex`). */
    dataColumnOffset: number;
}

export function buildEditTargetContext<R extends GridRowModel>(
    rows: readonly R[],
    getRowId: (row: R) => GridRowId,
    navigationColumns: ReadonlyArray<GridColDef<R>>,
): GridEditTargetContext<R> {
    const rowIds = rows.map(getRowId);
    const rowIndexById = new Map<GridRowId, number>();
    rowIds.forEach((id, index) => { if (!rowIndexById.has(id)) rowIndexById.set(id, index); });
    const columns = navigationColumns.filter(c => isRangeColumnField(c.field));
    const colIndexByField = new Map<string, number>();
    columns.forEach((c, index) => { colIndexByField.set(c.field, index); });
    const dataColumnOffset = navigationColumns.filter(c => isSystemField(c.field)).length;
    return { rows, rowIds, rowIndexById, columns, colIndexByField, dataColumnOffset };
}

export interface GridEditTargetRules<R extends GridRowModel> {
    isCellEditable?: (params: GridCellParams<R>) => boolean;
    rowMetaMap?: ReadonlyMap<GridRowId, GridRowMeta>;
    /** For a cell covered by a span, the origin cell (`null` otherwise). */
    getSpanOrigin?: (rowId: GridRowId, field: string) => { rowId: GridRowId; field: string } | null;
}

/**
 * Whether a batch edit may write the cell at display position (r, c): a data row (not synthetic),
 * not covered by a span whose origin is another cell, and editable by the same rule as double-click.
 */
export function isEditTargetWritable<R extends GridRowModel>(
    ctx: GridEditTargetContext<R>,
    rules: GridEditTargetRules<R>,
    row: R,
    r: number,
    c: number,
): boolean {
    const id = ctx.rowIds[r];
    const colDef = ctx.columns[c];
    if (!colDef || isSyntheticRowId(id, rules.rowMetaMap)) return false;
    const origin = rules.getSpanOrigin?.(id, colDef.field);
    if (origin && (origin.rowId !== id || origin.field !== colDef.field)) return false;
    return resolveCellEditable({
        row,
        field: colDef.field,
        value: getCellValue(row, colDef.field, colDef),
        colDef,
        rowIndex: r,
        colIndex: ctx.dataColumnOffset + c,
        rowMeta: rules.rowMetaMap?.get(id),
    }, rules.isCellEditable);
}

/** The rectangle around the displayed cells among `cells`, or null when none is displayed. */
export function boundingTargetRect<R extends GridRowModel>(
    ctx: GridEditTargetContext<R>,
    cells: ReadonlyArray<{ id: GridRowId; field: string }>,
): CellRangeRect | null {
    let top = Infinity;
    let bottom = -Infinity;
    let left = Infinity;
    let right = -Infinity;
    for (const cell of cells) {
        const r = ctx.rowIndexById.get(cell.id);
        const c = ctx.colIndexByField.get(cell.field);
        if (r === undefined || c === undefined) continue;
        if (r < top) top = r;
        if (r > bottom) bottom = r;
        if (c < left) left = c;
        if (c > right) right = c;
    }
    return top === Infinity ? null : { top, bottom, left, right };
}

/** The two corner cells of a rectangle. */
export function rectCorners<R extends GridRowModel>(
    ctx: GridEditTargetContext<R>,
    rect: CellRangeRect,
): { anchor: GridCellCoordinates; head: GridCellCoordinates } {
    return {
        anchor: { id: ctx.rowIds[rect.top], field: ctx.columns[rect.left].field },
        head: { id: ctx.rowIds[rect.bottom], field: ctx.columns[rect.right].field },
    };
}

/** Columns whose empty value is `''` rather than `null`. */
export function isTextColumn(colDef: Pick<GridColDef, 'type'> | undefined): boolean {
    const type = colDef?.type;
    return type === undefined || type === 'string' || type === 'image';
}
