import type { GridCellParams, GridRowMeta, GridRowModel } from '../../types';

// Cells are read through the one `getCellValue` in `lib/utils/values`.

export interface CellEditabilityParams<R extends GridRowModel = GridRowModel> extends GridCellParams<R> {
    rowMeta?: GridRowMeta;
}

/**
 * Whether a body cell may enter edit mode. Double-click, Enter, Tab stops and `aria-readonly` all use
 * this one rule:
 * - the column must have `editable: true` (`isCellEditable` can only restrict, never grant);
 * - the row must be a real data row, not a synthetic row-grouping header or an auto-generated tree
 *   ancestor (`rowMeta.isGroupRow`). Tree-data parents are real rows and stay editable;
 * - `isCellEditable`, when given, must return true. A predicate that throws counts as read-only.
 */
export function resolveCellEditable<R extends GridRowModel>(
    params: CellEditabilityParams<R>,
    isCellEditable?: (params: GridCellParams<R>) => boolean
): boolean {
    const { row, field, value, colDef, rowIndex, colIndex, rowMeta } = params;
    if (!colDef.editable) return false;
    if (rowMeta?.isGroupRow || row._isSkeleton) return false;
    if (!isCellEditable) return true;
    try {
        return Boolean(isCellEditable({ row, field, value, colDef, rowIndex, colIndex }));
    } catch {
        return false;
    }
}
