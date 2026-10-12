import type { GridRowId, GridRowModel, GridPinnedRows } from './rows';
import type { GridColDef, GridColumnVisibilityModel, GridPinnedColumns } from './columns';

export interface GridInternalState {
  rows: {
    idRowsLookup: Map<GridRowId, GridRowModel>;
    allRows: GridRowId[];
    /** Row object → its getRowId() key. Rows are stored untouched, so this is how ids are resolved. */
    idByRow: Map<GridRowModel, GridRowId>;
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
