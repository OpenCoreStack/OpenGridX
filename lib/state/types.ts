
import type {
  GridSortItem,
  GridFilterModel,
  GridPaginationModel,
  GridColumnPinning,
  GridColumnOrder,
} from '../types';

export interface GridSortingState {
  sortModel: GridSortItem[];
}

export interface GridFilterState {
  filterModel: GridFilterModel;
}

export interface GridPaginationState {
  paginationModel: GridPaginationModel;
  rowCount?: number;
}

export interface GridDataSourceState {
  loading: boolean;
  error?: any;
}

export interface GridColumnsState {
    columnWidths: Record<string, number>;
    columnOrder: GridColumnOrder;
    pinnedColumns?: GridColumnPinning;
    columnVisibilityModel?: Record<string, boolean>;
}

export interface GridDensityState {
  density: 'compact' | 'standard' | 'comfortable';
}

export interface GridState {
  sorting?: GridSortingState;
  filter?: GridFilterState;
  pagination?: GridPaginationState;
  columns?: GridColumnsState;
  density?: GridDensityState;
  dataSource?: GridDataSourceState;
}

export type GridInitialState = GridState;
