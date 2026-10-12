import type { GridRowModel, GridValidRowModel } from './rows';
import type { GridSortItem } from './sorting';
import type { GridFilterModel } from './filtering';
import type { GridAggregationModel } from './grouping';

export interface GridGetRowsParams {
  startRow: number;
  endRow: number;
  sortModel: GridSortItem[];
  filterModel: GridFilterModel;
  groupKeys: string[];
    aggregationModel?: GridAggregationModel;
}

export interface GridGetRowsResponse<R extends GridValidRowModel = GridRowModel> {
  rows: R[];
  rowCount?: number;
    aggregationResults?: Record<string, unknown>;
}

/**
 * Interface for providing data to the grid from a remote source.
 * Enables server-side sorting, filtering, and pagination.
 */
export interface GridDataSource<R extends GridValidRowModel = GridRowModel> {
  /**
   * Fetches a chunk of rows based on current grid state.
   * @param params Sorting, filtering, and range parameters.
   */
  getRows: (params: GridGetRowsParams) => Promise<GridGetRowsResponse<R>>;
  /**
   * Optional: Fetches aggregation results for the entire dataset.
   */
  getAggregations?: (params: Omit<GridGetRowsParams, 'startRow' | 'endRow'>) => Promise<Record<string, unknown>>;
}

export interface GridPaginationModel {
  page: number;
  pageSize: number;
}
