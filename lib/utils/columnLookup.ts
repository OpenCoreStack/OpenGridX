import type { GridColDef } from '../types';

/**
 * Column information the client-side filter and sort need: the column definition for each field
 * (for `valueGetter` and `type`) and the columns the quick filter searches.
 */
export interface GridColumnLookup {
    /** Column definitions keyed by field. */
    byField: ReadonlyMap<string, GridColDef>;
    /** Visible, filterable columns. The quick filter searches only these. */
    quickFilterColumns: readonly GridColDef[];
}

/**
 * Build the lookup from the grid's columns. Columns hidden through `columnVisibilityModel`,
 * columns with `filterable: false` and internal `__`-prefixed columns are not searched by the
 * quick filter; column filter items still apply to every column.
 */
export function buildColumnLookup(
    columns: readonly GridColDef[],
    columnVisibilityModel: Record<string, boolean> = {},
): GridColumnLookup {
    const byField = new Map<string, GridColDef>();
    const quickFilterColumns: GridColDef[] = [];
    for (const col of columns) {
        byField.set(col.field, col);
        if (col.isSpacer || col.field.startsWith('__')) continue;
        if (col.filterable === false) continue;
        if (columnVisibilityModel[col.field] === false) continue;
        quickFilterColumns.push(col);
    }
    return { byField, quickFilterColumns };
}
