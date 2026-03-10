
// Auto-import styles — this ensures consumers do NOT need a manual CSS import
import './styles/opengridx.css';

export { DataGrid } from './components/DataGrid/DataGrid';
export { Cell } from './components/Cell/Cell';
export { Row } from './components/Row/Row';
export { Header } from './components/Header/Header';
export { Skeleton } from './components/Skeleton/Skeleton';
export { FilterPanel } from './components/FilterPanel';
export { GridToolbar } from './components/Toolbar/GridToolbar';
export type { GridToolbarProps } from './components/Toolbar/GridToolbar';
export { GridTooltip } from './components/Tooltip/Tooltip';

export { useGridApiRef } from './hooks/core/useGridApiRef';
export { Button, Input, Checkbox } from './components/ui';

export {
    exportToCsv,
    exportToExcel,
    exportToJson,
    printGrid
} from './utils/export/index';

export { exportToExcelAdvanced } from './utils/export/exportToExcelAdvanced';
export type {
    ExcelAdvancedExportOptions,
    ExcelSheetDefinition,
    ExcelColumnStyle
} from './utils/export/exportToExcelAdvanced';

export { useAggregation, formatAggregationValue } from './hooks/features/useAggregation';
export type { UseAggregationParams, UseAggregationReturn, BuiltInAggFn } from './hooks/features/useAggregation';
export { usePivot } from './hooks/features/usePivot';
export type { UsePivotReturn } from './hooks/features/usePivot';

export { DataGridThemeProvider } from './theme';
export type { DataGridThemeProviderProps, GridTheme, GridThemeColors, GridThemeTypography, GridThemeSpacing, GridThemeBorders, GridThemeShadows, GridThemeGrid, GridThemeTransitions } from './theme';
export { darkTheme, roseTheme, emeraldTheme, amberTheme, compactTheme } from './theme';

export { useGridStateStorage } from './state';
export type {
    GridState,
    GridInitialState,
    GridSortingState,
    GridFilterState,
    GridPaginationState,
    GridColumnsState,
    GridDensityState,
    UseGridStateStorageOptions,
    UseGridStateStorageReturn,
} from './state';

export type {
    CsvExportOptions,
    ExcelExportOptions,
    JsonExportOptions,
    PrintOptions
} from './utils/export/index';

export type {
    GridRowModel,
    GridRowId,
    GridColDef,
    GridAlignment,
    GridSortDirection,
    GridFilterModel,
    GridFilterItem,
    GridFilterOperator,
    GridFilterGroup,
    GridPaginationModel,
    GridRenderCellParams,
    GridRenderHeaderParams,
    GridValueGetterParams,
    GridValueFormatterParams,
    GridRowParams,
    GridCellParams,
    GridColumnPinning,
    GridRowPinning,
    GridPinnedPosition,
    GridRowGroupingModel,
    GridAggregationModel,
    GridAggregationResult,
    DataGridProps,
    GridDataSource,
    GridGetRowsParams,
    GridGetRowsResponse,

    GridPivotModel,
    GridPivotValueField,
    GridPivotAggFn,

    GridListViewColDef,
    GridColumnGroup,
    GridColumnGroupingModel,
} from './types';
