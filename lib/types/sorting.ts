import type { GridRowId, GridRowModel, GridValidRowModel } from './rows';

export type GridSortDirection = 'asc' | 'desc' | null;

/**
 * Parameters passed to `GridColDef.sortComparator` for each side of a comparison. For a row-grouping
 * group row, `row` is the synthetic group row and `value` its grouping value.
 * @since v3.1
 */
export interface GridSortCellParams<R extends GridValidRowModel = GridRowModel> {
  id: GridRowId;
  field: string;
  row: R;
  value: unknown;
}

export interface GridSortModel {
  field: string;
  sort: GridSortDirection;
}

export interface GridSortItem {
  field: string;
  sort: 'asc' | 'desc';
}
