import type { GridRowId, GridRowModel, GridPinnedRows } from './rows';
import type { GridColDef, GridColumnVisibilityModel, GridPinnedColumns } from './columns';

export interface GridInternalState {
  /**
   * The row store. Cell edits (`REPLACE_ROW` / `REPLACE_ROWS`) update `idRowsLookup`, `idByRow`
   * and `indexById` IN PLACE and only replace `rows`: never rely on those maps changing identity
   * to detect an edit; depend on `rows` (or `state.rows`) instead. `SET_ROWS` builds new maps.
   */
  rows: {
    idRowsLookup: Map<GridRowId, GridRowModel>;
    allRows: GridRowId[];
    /** Row object → its getRowId() key. Rows are stored untouched, so this is how ids are resolved. */
    idByRow: Map<GridRowModel, GridRowId>;
    /** The stored rows in `allRows` order. */
    rows: GridRowModel[];
    /** Row id → its index in `allRows` / `rows`. */
    indexById: Map<GridRowId, number>;
  };
  pagination: {
    /** Server-reported total (dataSource responses); undefined until one arrives. */
    rowCount?: number;
  };
  columns: {
    all: GridColDef[];
    lookup: Map<string, GridColDef>;
    orderedFields: string[];
    columnVisibilityModel: GridColumnVisibilityModel;
  };
  pinning: {
    pinnedColumns: GridPinnedColumns;
    pinnedRows: GridPinnedRows;
  };
  dimensions: {
    rowHeight: number;
    headerHeight: number;
    viewportWidth: number;
    viewportHeight: number;
  };
  dataSource: {
    loading: boolean;
    error: unknown;
  };
}
