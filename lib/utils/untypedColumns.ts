import type { GridColDef, GridRowModel } from '../types';

/**
 * A column typed for the grid's rows (`GridColDef<R>`) as the untyped `GridColDef` that public
 * callback parameters, the toolbar and the row store use. TypeScript rejects the plain widening
 * because the column's callbacks take `R` (`strictFunctionTypes`); it is sound here because the grid
 * only ever calls them with its own rows. The one place this widening is written (R4, 3.10).
 */
export function untypedColumn<R extends GridRowModel>(column: GridColDef<R>): GridColDef {
    return column as unknown as GridColDef;
}

/** `untypedColumn` for a list. */
export function untypedColumns<R extends GridRowModel>(columns: readonly GridColDef<R>[]): GridColDef[] {
    return columns as unknown as GridColDef[];
}
