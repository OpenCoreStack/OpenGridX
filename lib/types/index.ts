

/** Unique identifier for a row (string or number). */
export type GridRowId = string | number;

/** Base interface for a grid row data object. */
export interface GridRowModel {
  /** Uniquely identifies the row. */
  id: GridRowId;
  /** Any other dynamic row properties. */
  [key: string]: any;
}

export type GridAlignment = 'left' | 'center' | 'right';

/** Represents a row node in the grid's hierarchical tree structure. */
export interface GridTreeNode {
    /** Unique ID of the row. */
    id: GridRowId;
    /** ID of the parent node, or null if root. */
    parentId: GridRowId | null;
    /** Current depth in the tree (0 for root). */
    depth: number;
    /** The key used for grouping at this level. */
    groupingKey: string;

    /** The field this node is grouping by. */
    groupingField?: string;
    /** The actual value being grouped. */
    groupingValue?: any;

    /** Computed aggregation results for this group. */
    aggregatedValues?: Record<string, any>;
    /** Position of the aggregation row relative to the group. */
    aggregationPosition?: 'inline' | 'footer' | null; 
    /** Current expansion state. */
    isExpanded: boolean;
    /** IDs of the direct child nodes. */
    children?: GridRowId[];
    /** Display label for the group. */
    label?: string;

    /** Total count of all descendants (recursive). */
    descendantCount?: number;

    /** Count of children on the server (for lazy loading). */
    serverChildrenCount?: number;
}

export type GridSortDirection = 'asc' | 'desc' | null;

/**
 * Metadata for a single column.
 * Governs rendering, sorting, filtering, and data transformation.
 */
export interface GridColDef<R extends GridRowModel = GridRowModel> {
  /** The unique identifier for the column, typically matching a row object key. */
  field: string;
  /** Text displayed in the column header. */
  headerName?: string;
  /** Tooltip or accessible description for the header. */
  description?: string;

  /** If true, this column can be used as a grouping dimension. */
  groupable?: boolean;

  /** If true, this column can be summarized using aggregation functions. */
  aggregable?: boolean;
  /** List of allowed aggregation functions (e.g., ['sum', 'avg']). */
  availableAggregationFunctions?: string[]; 

  /** Width in pixels or a percentage string. Defaults to automatic calculation. */
  width?: number | string;
  /** Minimum width in pixels. */
  minWidth?: number;
  /** Maximum width in pixels. */
  maxWidth?: number;
  /** Relative flex weight used when distributing extra space. */
  flex?: number;
  /** Content alignment within cells. */
  align?: GridAlignment;
  /** Content alignment within the header cell. */
  headerAlign?: GridAlignment;
  /** If false, sorting is disabled for this column. */
  sortable?: boolean;
  /** If false, filtering is disabled for this column. */
  filterable?: boolean;
  /** If false, the user cannot manually resize this column. */
  resizable?: boolean;
  /** If false, the column cannot be hidden via the UI. */
  hideable?: boolean;
  /** If false, the column cannot be pinned. */
  pinnable?: boolean;
  /** Type used to determine default operators and formatting logic. */
  type?: 'string' | 'number' | 'date' | 'boolean' | 'singleSelect' | 'image';
  /** Options used for 'singleSelect' type. */
  valueOptions?: Array<string | number | { value: any; label: string }>;

  /** Function to compute a cell value from raw row data. */
  valueGetter?: (params: GridValueGetterParams<R>) => any;
  /** Function to format a value into a human-readable string. */
  valueFormatter?: (params: GridValueFormatterParams<R>) => string;
  /** Custom component or element to render in the cell. */
  renderCell?: (params: GridRenderCellParams<R>) => React.ReactNode;
  /** Custom component or element to render in the header. */
  renderHeader?: (params: GridRenderHeaderParams) => React.ReactNode;
  /** Component to render when the cell is in edit mode. */
  renderEditCell?: (params: GridRenderCellParams<R>) => React.ReactNode;
  /** If true, the cell's value can be modified by the user. */
  editable?: boolean;
  /** Optional stacking order (CSS z-index). */
  zIndex?: number;
  /** If true, the column kebab/hamburger menu is disabled. */
  disableColumnMenu?: boolean;

  /** Number of columns this cell should occupy horizontally. */
  colSpan?: number | ((params: GridRenderCellParams<R>) => number);
  /** Number of rows this cell should occupy vertically. */
  rowSpan?: number | ((params: GridRenderCellParams<R>) => number);

  /**
   * Custom CSS class applied to every cell in this column.
   * Can be a static string or a function that receives the cell params and returns a string.
   * Useful for per-row conditional styling without custom renderCell.
   * @example
   *   cellClassName: 'my-class'
   *   cellClassName: ({ value }) => value > 100 ? 'cell--high' : 'cell--low'
   */
  cellClassName?: string | ((params: GridRenderCellParams<R>) => string);

  /**
   * Custom CSS class applied to the header cell of this column.
   * @example
   *   headerClassName: 'my-header'
   */
  headerClassName?: string;

  /**
   * If false, this column is excluded from all exports (CSV, Excel, JSON, Print).
   * Useful for action columns with buttons.
   * @default true
   */
  exportable?: boolean;
}

/** Column definition used exclusively in List View mode. */
export interface GridListViewColDef<R extends GridRowModel = GridRowModel> {
  field: string;
  renderCell: (params: GridRenderCellParams<R>) => React.ReactNode;
}

/**
 * Describes one level of column grouping.
 * Groups can be nested by placing child GridColumnGroup objects in `children`.
 * Leaf groups reference actual column fields via `children: string[]`.
 *
 * Example – two levels:
 * [
 *   { groupId: 'q1', headerName: 'Q1 2024', children: ['q1Sales', 'q1Target'] },
 *   { groupId: 'info', headerName: 'Info', children: [
 *       { groupId: 'personal', headerName: 'Personal', children: ['name', 'age'] }
 *   ] }
 * ]
 */
export interface GridColumnGroup {
  /** Unique identifier for this group. */
  groupId: string;
  /** Text displayed in the group header cell. */
  headerName: string;
  /** Optional override for the header cell background color. */
  headerClassName?: string;
  /**
   * Either an array of column field strings (leaf group)
   * or an array of child GridColumnGroup objects (nested group).
   */
  children: Array<string | GridColumnGroup>;
}

export type GridColumnGroupingModel = GridColumnGroup[];


/** Parameters passed to the `valueGetter` function. */
export interface GridValueGetterParams<R extends GridRowModel = GridRowModel> {
  /** The row object. */
  row: R;
  /** The field name. */
  field: string;
  /** The raw value from the row object. */
  value: any;
}

/** Parameters passed to the `valueFormatter` function. */
export interface GridValueFormatterParams<R extends GridRowModel = GridRowModel> {
  /** The raw value to format. */
  value: any;
  /** The row object. */
  row: R;
  /** The field name. */
  field: string;
}

/** Parameters passed to the `renderCell` function. */
export interface GridRenderCellParams<R extends GridRowModel = GridRowModel> {
  /** The current cell value. */
  value: any;
  /** The row object. */
  row: R;
  /** The field name and unique ID. */
  field: string;
  /** The column definition. */
  colDef: GridColDef<R>;
  /** The index of the row in the currently visible dataset. */
  rowIndex: number;
  /** The index of the column. */
  colIndex: number;
}

export interface GridRenderHeaderParams {
  field: string;
  colDef: GridColDef;
  colIndex: number;
}

export interface GridSortModel {
  field: string;
  sort: GridSortDirection;
}

export interface GridSortItem {
  field: string;
  sort: 'asc' | 'desc';
}

export type GridFilterOperator =
  | 'contains'
  | 'equals'
  | 'startsWith'
  | 'endsWith'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'isAnyOf'
  | '>'
  | '>='
  | '<'
  | '<='
  | '!='
  | 'is'
  | 'not';

/** Describes a filter condition for a specific column. */
export interface GridFilterItem {
  /** Optional ID for the filter item. */
  id?: string | number;
  /** The field name to filter. */
  field: string;
  /** The comparison operator. */
  operator: GridFilterOperator;
  /** The value to compare against. */
  value?: any;
}

/** Describes a group of filters combined with a logical operator. */
export interface GridFilterGroup {
    /** Optional ID for the group. */
    id?: string | number;
    /** Logical operator to join child items ('and' | 'or'). */
    logicOperator: 'and' | 'or';
    /** Array of child filter items or groups. */
    items: (GridFilterItem | GridFilterGroup)[];
}

/** The overall state of grid filtering. */
export interface GridFilterModel {
  /** Root-level filter items or groups. */
  items?: (GridFilterItem | GridFilterGroup)[];
  /** Global logical operator (defaults to 'and'). */
  logicOperator?: 'and' | 'or';
  /** Array of strings used for the quick search feature across all columns. */
  quickFilterValues?: string[];
}

export type GridPinnedPosition = 'left' | 'right';

export type GridColumnVisibilityModel = Record<string, boolean>;

/** Configuration for pinning columns to the grid edges. */
export interface GridColumnPinning {
  /** Field strings to pin to the left edge. */
  left?: string[];  
  /** Field strings to pin to the right edge. */
  right?: string[]; 
}

/** Configuration for pinning rows to the grid viewport. */
export interface GridRowPinning {
    /** Row IDs to pin to the top. */
    top?: GridRowId[];
    /** Row IDs to pin to the bottom. */
    bottom?: GridRowId[];
}

export interface GridColumnOrderChangeParams {
  column: GridColDef;
  oldIndex: number;
  targetIndex: number;
}

export type GridColumnOrder = string[]; 

export interface GridRowOrderChangeParams<R extends GridRowModel = GridRowModel> {
  row: R;
  oldIndex: number; 
  targetIndex: number; 
}

export interface GridGetRowsParams {
  startRow: number;
  endRow: number;
  sortModel: GridSortItem[];
  filterModel: GridFilterModel;
  groupKeys: string[];
    aggregationModel?: GridAggregationModel;
}

export interface GridGetRowsResponse<R extends GridRowModel = GridRowModel> {
  rows: R[];
  rowCount?: number;
    aggregationResults?: Record<string, any>;
}

/**
 * Interface for providing data to the grid from a remote source.
 * Enables server-side sorting, filtering, and pagination.
 */
export interface GridDataSource<R extends GridRowModel = GridRowModel> {
  /**
   * Fetches a chunk of rows based on current grid state.
   * @param params Sorting, filtering, and range parameters.
   */
  getRows: (params: GridGetRowsParams) => Promise<GridGetRowsResponse<R>>;
  /**
   * Optional: Fetches aggregation results for the entire dataset.
   */
  getAggregations?: (params: Omit<GridGetRowsParams, 'startRow' | 'endRow'>) => Promise<Record<string, any>>;
}

export interface GridPaginationModel {
  page: number;
  pageSize: number;
}

export type GridRowSelectionModel = GridRowId[];

export interface GridPinnedColumns {
  left?: string[];
  right?: string[];
}

export interface GridPinnedRows<R extends GridRowModel = GridRowModel> {
  top?: R[];
  bottom?: R[];
}

export interface GridVirtualizationState {
  renderContext: GridRenderContext;
  scrollTop: number;
  scrollLeft: number;
}

export type GridRowGroupingModel = string[]; 

export type GridAggregationFunction = (values: any[]) => any;

export interface GridAggregationModel {
  [field: string]: string; 
}

export type GridAggregationResult = Record<string, any>;

export type GridAggregationPosition = 'footer' | 'inline' | 'both';

export type GridPivotAggFn = 'sum' | 'avg' | 'count' | 'min' | 'max';

export interface GridPivotValueField {
        field: string;
        aggFn: GridPivotAggFn;
        headerName?: string;
}

export interface GridPivotModel {
    rowFields:    string[];
    columnFields: string[];
    valueFields:  GridPivotValueField[];
}

export interface GridRenderContext {
  firstRowIndex: number;
  lastRowIndex: number;
  firstColumnIndex: number;
  lastColumnIndex: number;
}

export interface GridState {
  rows: {
    idRowsLookup: Map<GridRowId, GridRowModel>;
    allRows: GridRowId[];
  };
  sorting: {
    sortModel: GridSortItem[];
  };
  filter: {
    filterModel: GridFilterModel;
  };
  pagination: {
    paginationModel: GridPaginationModel;
    rowCount: number;
  };
  columns: {
    all: GridColDef[];
    lookup: Map<string, GridColDef>;
    orderedFields: string[];
    columnVisibilityModel: GridColumnVisibilityModel;
  };
  selection: {
    selectedRows: Set<GridRowId>;
  };
  pinning: {
    pinnedColumns: GridPinnedColumns;
    pinnedRows: GridPinnedRows;
  };
  virtualization: GridVirtualizationState;
  dimensions: {
    rowHeight: number;
    headerHeight: number;
    viewportWidth: number;
    viewportHeight: number;
  };
  dataSource: {
    loading: boolean;
    error: any;
  };
}

export interface GridRowScrollEndParams {
  visibleTop: number;
  visibleBottom: number;
  viewportHeight: number;
}

/**
 * Main properties for the DataGrid component.
 */
export interface DataGridProps<R extends GridRowModel = GridRowModel> {
  /** The dataset to display in the grid. */
  rows: R[];
  /** Column definitions governing how data is displayed and interacted with. */
  columns: GridColDef<R>[];

  /** Function to extract a unique ID from a row object. Defaults to `row.id`. */
  getRowId?: (row: R) => GridRowId;

  /** Height of each row in pixels. Defaults to 52. */
  rowHeight?: number;
  /** Height of the header row in pixels. Defaults to 56. */
  headerHeight?: number;
  /** If true, the grid height will adjust to match the total height of its rows. */
  autoHeight?: boolean;

  /** Sorting mode: 'client' (default) or 'server'. */
  sortingMode?: 'client' | 'server';
  /** The current sorting model. */
  sortModel?: GridSortItem[];
  /** Callback fired when the sorting model changes. */
  onSortModelChange?: (model: GridSortItem[]) => void;

  /** Filtering mode: 'client' (default) or 'server'. */
  filterMode?: 'client' | 'server';
  /** The current filter model. */
  filterModel?: GridFilterModel;
  /** Callback fired when the filter model changes. */
  onFilterModelChange?: (model: GridFilterModel) => void;

  /** If true, pagination UI and logic are enabled. */
  pagination?: boolean;
  /** Pagination mode: 'client' (default), 'server', or 'infinite'. */
  paginationMode?: 'client' | 'server' | 'infinite';
  /** The current pagination state (page and pageSize). */
  paginationModel?: GridPaginationModel;
  /** Callback fired when the pagination model changes. */
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  /** Array of available page sizes (e.g., [10, 25, 50]). */
  pageSizeOptions?: number[];
  /** Total number of rows (required for server-side pagination). */
  rowCount?: number;

  /** Defines which columns are pinned to the sides. */
  pinnedColumns?: GridColumnPinning;
  /** Callback fired when column pinning changes. */
  onPinnedColumnsChange?: (model: GridColumnPinning) => void;

  /** Controls which columns are visible. */
  columnVisibilityModel?: GridColumnVisibilityModel;
  /** Callback fired when column visibility changes. */
  onColumnVisibilityModelChange?: (model: GridColumnVisibilityModel) => void;

  /** Defines which rows are pinned to the top or bottom. */
  pinnedRows?: GridRowPinning;
  /** Callback fired when row pinning changes. */
  onPinnedRowsChange?: (model: GridRowPinning) => void;

  /** If true, a column of checkboxes is added for row selection. */
  checkboxSelection?: boolean;
  /** If true, the checkbox column remains visible during horizontal scrolling. */
  pinCheckboxColumn?: boolean; 
  /** If true, the expansion column (for Master-Detail) remains visible during horizontal scrolling. */
  pinExpandColumn?: boolean; 
  /** The current selection state (array of row IDs). */
  rowSelectionModel?: GridRowSelectionModel;
  /** Callback fired when the selection model changes. */
  onRowSelectionModelChange?: (model: GridRowSelectionModel) => void;
  /** If true, clicking a row won't toggle its selection. */
  disableRowSelectionOnClick?: boolean;
  /** If true, the user can only select a single row at a time. */
  disableMultipleRowSelection?: boolean;

  /** If true, a loading shimmer/skeleton is displayed. */
  loading?: boolean;
  /** Visual density of the grid. */
  density?: 'compact' | 'standard' | 'comfortable';

  /** Optional custom CSS class for the grid container. */
  className?: string;
  /** Optional custom inline styles for the grid container. */
  style?: React.CSSProperties;
  /** Total height of the grid container (pixels or percentage). */
  height?: number | string;

  /** ARIA label for accessibility. */
  ariaLabel?: string;
  /** Message displayed when there are no rows to show. */
  noRowsLabel?: string;

  /** Advanced: The starting internal state of the grid. */
  initialState?: import('../state/types').GridInitialState;
  /** Advanced: Callback fired for every internal state update. */
  onStateChange?: (state: import('../state/types').GridState) => void;

  /** Callback fired when a row is clicked. */
  onRowClick?: (params: GridRowParams<R>) => void;
  /** Callback fired when a cell is clicked. */
  onCellClick?: (params: GridCellParams<R>) => void;

  /** Renders the detail panel content for a row in Master-Detail mode. */
  getDetailPanelContent?: (params: GridDetailPanelParams<R>) => React.ReactNode;
  /** Defines the height of the detail panel. */
  getDetailPanelHeight?: (params: GridDetailPanelParams<R>) => GridDetailPanelHeight;
  /** Controlled state for expanded detail panels. */
  detailPanelExpandedRowIds?: Set<GridRowId>;
  /** Callback fired when expanded detail panels change. */
  onDetailPanelExpandedRowIdsChange?: (expandedRowIds: Set<GridRowId>) => void;

  /** If true, manual column reordering via drag-and-drop is disabled. */
  disableColumnReorder?: boolean; 
  /** Controlled horizontal order of column fields. */
  columnOrder?: GridColumnOrder; 
  /** Callback fired when column order changes. */
  onColumnOrderChange?: (params: GridColumnOrderChangeParams) => void; 

  /** If true, rows can be reordered via drag-and-drop. */
  rowReordering?: boolean; 
  /** Callback fired when rows are reordered. */
  onRowOrderChange?: (params: GridRowOrderChangeParams<R>) => void; 

  /** If true, enables hierarchical tree data display. */
  treeData?: boolean;
  /** Function to get the path (array of strings) for a row in Tree Data mode. */
  getTreeDataPath?: (row: R) => string[];
  /** Optional override for the grouping column. */
  groupingColDef?: GridColDef<R>;
  /** Initial expansion depth for Tree Data. */
  defaultGroupingExpansionDepth?: number;

  /** Controlled state for row grouping. */
  rowGroupingModel?: GridRowGroupingModel;
  /** Callback fired when row grouping changes. */
  onRowGroupingModelChange?: (model: GridRowGroupingModel) => void;
  /** Controlled state for data aggregation (e.g., { salary: 'sum' }). */
  aggregationModel?: GridAggregationModel;
  /** Callback fired when aggregation model changes. */
  onAggregationModelChange?: (model: GridAggregationModel) => void;
  /** Advanced: Controls where aggregation results appear relative to groups. */
  getAggregationPosition?: (groupNode: GridTreeNode | null) => 'inline' | 'footer' | null;

  /** If true, switches the grid to multidimensional Pivot Mode. */
  pivotMode?: boolean;
  /** Controlled state for pivot configuration (rows, columns, values). */
  pivotModel?: GridPivotModel;
  /** Callback fired when pivot model changes. */
  onPivotModelChange?: (model: GridPivotModel) => void;

  /** Predicate to control cell editability on a per-cell basis. */
  isCellEditable?: (params: GridCellParams<R>) => boolean;
  /** Callback to process an updated row after inline editing. Supports promises and validation. */
  processRowUpdate?: (newRow: R, oldRow: R) => R | Promise<R>;
  /** Callback fired if `processRowUpdate` throws or rejects. */
  onProcessRowUpdateError?: (error: any) => void;

  /** Interface for connecting the grid to an external (server-side) data source. */
  dataSource?: GridDataSource<R>;
  /** Callback fired when scrolling reaches the bottom of the grid viewport. */
  onRowsScrollEnd?: (params: GridRowScrollEndParams) => void;

  /** Advanced: Reactive reference to the internal API for imperative control. */
  apiRef?: React.MutableRefObject<GridApi>;

  /** Custom components to replace internal grid parts. */
  slots?: {
    /** Component rendered as the grid toolbar. */
    toolbar?: React.ComponentType<any>;
    /** Component rendered as the pagination control. */
    pagination?: React.ComponentType<any>;
    /** Component rendered when the grid is empty. */
    noRowsOverlay?: React.ComponentType<any>;
    /** Component rendered during loading states. */
    loadingOverlay?: React.ComponentType<any>;
    /** Component rendered at the very bottom of the grid. */
    footer?: React.ComponentType<any>;
  };
  /** Properties passed directly to custom slots. */
  slotProps?: {
    toolbar?: any;
    pagination?: any;
    noRowsOverlay?: any;
    loadingOverlay?: any;
    footer?: any;
  };

  /** When true, renders the grid as a single-column list of cards. Perfect for mobile/responsive views. */
  listView?: boolean;
  /** The column definition used in list view. Must supply a `renderCell` function. */
  listViewColumn?: GridListViewColDef<R>;

  /**
   * Defines column groups rendered as spanning header rows above the normal
   * column headers, supporting multiple levels of nesting.
   */
  columnGroupingModel?: GridColumnGroupingModel;
}

export interface GridEditCellProps<V = any> {
  id: GridRowId;
  field: string;
  value?: V;
  formattedValue?: string;
}

export type GridRowModes = 'view' | 'edit';

export interface GridRowModesModel {
  [id: GridRowId]: { mode: GridRowModes; fieldToFocus?: string };
}

export interface GridRowParams<R extends GridRowModel = GridRowModel> {
  row: R;
  id: GridRowId;
  rowIndex: number;
}

export interface GridCellParams<R extends GridRowModel = GridRowModel> {
  row: R;
  field: string;
  value: any;
  colDef: GridColDef<R>;
  rowIndex: number;
  colIndex: number;
}

export interface GridDetailPanelParams<R extends GridRowModel = GridRowModel> {
  row: R;
  id: GridRowId;
  rowIndex: number;
}

export type GridDetailPanelHeight = number | 'auto';

export type GridDetailPanelContent<R extends GridRowModel = GridRowModel> = 
  | React.ReactNode 
  | ((params: GridDetailPanelParams<R>) => React.ReactNode);

export interface GridDetailPanelState {
  expandedRowIds: Set<GridRowId>;
  contentCache: Map<GridRowId, React.ReactNode>;
}

/**
 * The Imperative API for interacting with the DataGrid.
 * Access this via the `apiRef` prop or a ref passed to the component.
 */
export interface GridApi {
  /**
   * Returns the row model with the given ID.
   * @param id The row unique ID.
   */
  getRow: (id: GridRowId) => GridRowModel | null;
  /** Returns all rows currently loaded into the grid. */
  getAllRows: () => GridRowModel[];
  /** Returns all rows currently visible after filtering and sorting. */
  getVisibleRows: () => GridRowModel[];
  /** Returns the current aggregation results. */
  getAggregationResult: () => Record<string, any> | null;
  /** Returns the active aggregation configuration. */
  getAggregationModel: () => GridAggregationModel | null;

  /** Returns the column definition for the given field. */
  getColumn: (field: string) => GridColDef | null;
  /** Returns all defined columns. */
  getAllColumns: () => GridColDef[];
  /** Returns all columns currently visible. */
  getVisibleColumns: () => GridColDef[];

  /**
   * Sets the selection state of a specific row.
   * @param id The row unique ID.
   * @param isSelected Visibility state.
   */
  selectRow: (id: GridRowId, isSelected?: boolean) => void;
  /**
   * Sets the selection state for multiple rows at once.
   * @param ids Array of row IDs.
   * @param isSelected Visibility state.
   */
  selectRows: (ids: GridRowId[], isSelected?: boolean) => void;
  /** Returns an array of IDs for all currently selected rows. */
  getSelectedRows: () => GridRowId[];

  /**
   * Triggers sorting on a specific column.
   * @param field The column field.
   * @param direction Sort order ('asc', 'desc', or null to clear).
   */
  sortColumn: (field: string, direction: GridSortDirection) => void;
  /** Returns the active sorting model. */
  getSortModel: () => GridSortItem[];

  /** Programmatically sets the filtering model. */
  setFilterModel: (model: GridFilterModel) => void;
  /** Returns the current filtering model. */
  getFilterModel: () => GridFilterModel;

  /** Changes the current page. */
  setPage: (page: number) => void;
  /** Changes the current page size. */
  setPageSize: (pageSize: number) => void;

  /** Scrolls the grid viewport to a specific row or column index. */
  scrollToIndexes: (params: { rowIndex?: number; colIndex?: number }) => void;

  /**
   * Programmatically copies all currently selected rows to the clipboard as TSV.
   * Equivalent to the user pressing Ctrl+C / Cmd+C.
   * @returns A Promise that resolves when the copy completes.
   */
  copySelectedRows: () => Promise<void>;
}
