import type { GridToolbarProps } from '../components/Toolbar/GridToolbar';
import type { PaginationProps } from '../components/Pagination/Pagination';
import type { GridPaginationModel } from './dataSource';
import type { GridAggregationModel, GridAggregationResult } from './grouping';
import type { DataGridProps } from './props';
import type { GridApi } from './api';

/**
 * Props the grid passes to `slots.toolbar`, before `slotProps.toolbar` is merged over them: the
 * `GridToolbarProps` it controls (columns, models and their change handlers) plus `apiRef`.
 * @since v3.0
 */
export interface GridToolbarSlotProps extends GridToolbarProps {
  apiRef: React.MutableRefObject<GridApi>;
}

/**
 * Props the grid passes to `slots.pagination`, before `slotProps.pagination` is merged over them.
 * @since v3.0
 */
export type GridPaginationSlotProps = PaginationProps;

/**
 * Props of `slots.noRowsOverlay` and `slots.loadingOverlay`: the grid passes none of its own, only
 * `slotProps.noRowsOverlay` / `slotProps.loadingOverlay`.
 * @since v3.0
 */
export type GridOverlaySlotProps = Record<string, unknown>;

/**
 * Props the grid passes to `slots.footer`, before `slotProps.footer` is merged over them.
 * @since v3.0
 */
export interface GridFooterSlotProps {
  apiRef: React.MutableRefObject<GridApi>;
  /** The active aggregation model (`{}` when none). */
  aggregationModel: GridAggregationModel;
  /** The grand-total aggregation result, or `null` when no aggregation is active. */
  aggregationResult: GridAggregationResult | null;
  /**
   * The built-in pager's count: rows after filtering, pinned rows excluded (`rowCount` from the
   * server in server pagination mode). Under tree data / row grouping: the filtered data rows.
   */
  rowCount: number;
  /** Whether pagination is in effect (false under row grouping and infinite scroll). */
  pagination: boolean;
  paginationModel: GridPaginationModel;
  pageSizeOptions: number[];
  onPaginationModelChange: (model: GridPaginationModel) => void;
}

/** The `slots` prop of `DataGrid`: components that replace built-in parts of the grid. */
export type GridSlots = NonNullable<DataGridProps['slots']>;

/** The `slotProps` prop of `DataGrid`: props for each slot, keyed like `GridSlots`. */
export type GridSlotProps = NonNullable<DataGridProps['slotProps']>;
