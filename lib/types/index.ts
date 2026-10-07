import type { GridToolbarProps } from '../components/Toolbar/GridToolbar';
import type { PaginationProps } from '../components/Pagination/Pagination';

/** Unique identifier for a row (string or number). */
export type GridRowId = string | number;

/** Base interface for a grid row data object. */
export interface GridRowModel {
  /** Uniquely identifies the row. */
  id: GridRowId;
  /** Internal: row is a skeleton placeholder during infinite-scroll loading. */
  _isSkeleton?: boolean;
  /** Internal: server-reported child count for lazy-loaded tree nodes. */
  serverChildrenCount?: number;
  /** Any other dynamic row properties. */
  [key: string]: unknown;
}

/**
 * The constraint on the row type `R` of the generic grid types (`DataGridProps<R>`, `GridColDef<R>`,
 * `GridRenderCellParams<R>` …): any object type. Your own interfaces and type aliases can be used as `R`
 * directly; they do not need an index signature or to extend `GridRowModel`. Rows without an `id`
 * field need `getRowId`. `GridRowModel` stays the default `R` (rows with any keys, read as `unknown`).
 * @since v3.0
 */
export type GridValidRowModel = object;

/**
 * A callback that is checked bivariantly in its parameter, like a method. Used for `GridColDef`
 * options that are either a value or a function, so a column typed for your rows (`GridColDef<Row>`)
 * can still be used where an untyped `GridColDef` is expected.
 */
type GridColDefCallback<P, T> = { bivarianceHack(params: P): T }['bivarianceHack'];

/**
 * Hierarchy metadata for a row. Exposed via `params.rowMeta` in `renderCell`.
 * Not present (`undefined`) for flat rows with no active tree-data or row-grouping.
 *
 * @since v1.1 — replaces the `_hasChildren` / `_treeDepth` / `_groupingField` etc.
 * fields that were injected onto row objects. Since v3.0 those fields are no longer
 * added at runtime: row objects reach `renderCell` exactly as you passed them.
 */
export interface GridRowMeta {
    /** The row has children to show: the expand toggle is rendered for it. */
    hasChildren?: boolean;
    treeDepth?: number;
    groupingField?: string;
    groupingValue?: unknown;
    /** The label the grid shows for a synthetic row: the group label, or the path segment of an auto-created tree parent. */
    groupLabel?: string;
    /**
     * Data rows below this row at any depth that pass the active filter (row-grouping leaves, or
     * tree-data rows; auto-created tree parents are not counted). The "(n)" shown next to group labels.
     */
    descendantCount?: number;
    isExpanded?: boolean;
    /**
     * The row is synthetic: a row-grouping group row, a group subtotal row, or a tree-data parent the
     * grid created for a path segment with no row of its own. Synthetic rows are never selected,
     * edited or given a detail panel, and `valueGetter` is not called for them.
     */
    isGroupRow?: boolean;
    /**
     * The row is the subtotal row of the group described by `groupingField` / `groupingValue`, shown
     * after the group's children when `getAggregationPosition` returns `'footer'` for it.
     * @since v3.0
     */
    isGroupFooter?: boolean;
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
    groupingValue?: unknown;

    /** Computed aggregation results for this group. */
    aggregatedValues?: Record<string, unknown>;
    /** Position of the aggregation row relative to the group. */
    aggregationPosition?: 'inline' | 'footer' | null; 
    /** Current expansion state. */
    isExpanded: boolean;
    /** IDs of the direct child nodes. */
    children?: GridRowId[];
    /** Display label for the group. */
    label?: string;

    /** Row grouping: the number of leaf rows in the group that pass the active filter (recursive). */
    descendantCount?: number;

    /** Count of children on the server (for lazy loading). */
    serverChildrenCount?: number;
}

export type GridSortDirection = 'asc' | 'desc' | null;

/**
 * Metadata for a single column.
 * Governs rendering, sorting, filtering, and data transformation.
 */
export interface GridColDef<R extends GridValidRowModel = GridRowModel> {
  /** The unique identifier for the column, typically matching a row object key. */
  field: string;
  /** Text displayed in the column header. */
  headerName?: string;
  /** Tooltip shown on header hover — used as the column's accessibility label. */
  description?: string;
  /** If true, this column can be used as a grouping dimension. */
  groupable?: boolean;

  /**
   * Custom formatter for the group-header label when this column is used as a grouping field.
   * Receives the field name and grouped value; return the string to display.
   * Falls back to `"field: value"` when omitted.
   */
  groupingValueFormatter?: (params: { field: string; value: unknown }) => string;

  /** If true, this column can be summarized using aggregation functions. */
  aggregable?: boolean;
  /** Restricts which aggregation functions are offered for this column (e.g., ['sum', 'avg']). */
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
  /**
   * Wraps this column's header title onto several lines instead of cutting it with an ellipsis.
   * Overrides the grid's `wrapHeaderText`. The header keeps `headerHeight`: the title shows as many
   * lines as fit and ends in an ellipsis if it is still longer. Raise `headerHeight` for more lines.
   */
  wrapHeaderText?: boolean;
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
  /** Internal: marks this column as a virtual spacer used for horizontal virtualization. */
  isSpacer?: boolean;
  /** Type used to determine default operators and formatting logic. */
  type?: 'string' | 'number' | 'date' | 'boolean' | 'singleSelect' | 'image';
  /** Options used for 'singleSelect' type. */
  valueOptions?: Array<string | number | { value: unknown; label: string }>;

  // The row callbacks below are declared as methods so that `GridColDef<Row>` stays assignable to an
  // untyped `GridColDef` (method parameters are checked bivariantly).
  /** Function to compute a cell value from raw row data. */
  valueGetter?(params: GridValueGetterParams<R>): unknown;
  /**
   * Maps an edited value back onto the row when an edit is committed; return the updated row.
   * Needed for editable columns with a `valueGetter`, whose value is not stored in `row[field]`.
   * Without it the commit writes `row[field] = value`.
   * @since v3.0
   */
  valueSetter?(params: GridValueSetterParams<R>): R;
  /**
   * Custom ascending comparator for client-side sorting by this column, used instead of the built-in
   * type-aware comparison. `v1` / `v2` are the cell values (`valueGetter` applied) and **include
   * `null` / `undefined`**, so the comparator decides where empty values go. The grid reverses the
   * result for 'desc' and chains it with the other sort keys in a multi-sort. Row grouping uses the
   * grouping column's comparator to order groups by their grouping value. A comparator that throws
   * or returns NaN is read as 0 (with a one-time dev warning). Ignored with `sortingMode="server"`.
   * @since v3.1
   */
  sortComparator?(v1: unknown, v2: unknown, params1: GridSortCellParams<R>, params2: GridSortCellParams<R>): number;
  /** Function to format a value into a human-readable string. */
  valueFormatter?(params: GridValueFormatterParams<R>): string;
  /** Custom component or element to render in the cell. */
  renderCell?(params: GridRenderCellParams<R>): React.ReactNode;
  /** Custom component or element to render in the header. */
  renderHeader?(params: GridRenderHeaderParams): React.ReactNode;
  /** Component to render when the cell is in edit mode. Receives `onValueChange`, `onCommit` and `onCancel`. */
  renderEditCell?(params: GridRenderEditCellParams<R>): React.ReactNode;
  /** If true, the cell's value can be modified by the user. */
  editable?: boolean;
  /** Optional stacking order (CSS z-index). */
  zIndex?: number;
  /** If true, the column kebab/hamburger menu is disabled. */
  disableColumnMenu?: boolean;

  /**
   * Number of columns this cell should occupy horizontally: the origin plus the next visible columns
   * in render order, clamped to the end of the origin's pinned section. Fractions are floored,
   * `Infinity` means "to the end", and NaN / values below 1 mean no span. `params.value` is the
   * `valueGetter` result. A function that throws is treated as 1.
   */
  colSpan?: number | GridColDefCallback<GridRenderCellParams<R>, number>;
  /**
   * Number of rows this cell should occupy vertically, clamped to the end of its row section
   * (top-pinned, scrolling or bottom-pinned rows) and to the first row with an expanded detail
   * panel. Normalised like `colSpan`. With both set, the origin covers the whole rectangle.
   */
  rowSpan?: number | GridColDefCallback<GridRenderCellParams<R>, number>;

  /**
   * Custom CSS class applied to every cell in this column.
   * Can be a static string or a function that receives the cell params and returns a string.
   * Useful for per-row conditional styling without custom renderCell.
   * @example
   *   cellClassName: 'my-class'
   *   cellClassName: ({ value }) => value > 100 ? 'cell--high' : 'cell--low'
   */
  cellClassName?: string | GridColDefCallback<GridRenderCellParams<R>, string>;

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
export interface GridListViewColDef<R extends GridValidRowModel = GridRowModel> {
  field: string;
  renderCell(params: GridRenderCellParams<R>): React.ReactNode;
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
  /** CSS class(es) added to this group's header cell(s). */
  headerClassName?: string;
  /**
   * Either an array of column field strings (leaf group)
   * or an array of child GridColumnGroup objects (nested group).
   */
  children: Array<string | GridColumnGroup>;
}

export type GridColumnGroupingModel = GridColumnGroup[];


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

/** Parameters passed to the `valueGetter` function. */
export interface GridValueGetterParams<R extends GridValidRowModel = GridRowModel> {
  /** The row object. */
  row: R;
  /** The field name. */
  field: string;
  /** The raw value from the row object. */
  value: unknown;
}

/**
 * Parameters passed to the `valueSetter` function.
 * @since v3.0
 */
export interface GridValueSetterParams<R extends GridValidRowModel = GridRowModel> {
  /** The committed value from the editor. */
  value: unknown;
  /** The row as it was before the edit. */
  row: R;
  /** The field name. */
  field: string;
}

/** Parameters passed to the `valueFormatter` function. */
export interface GridValueFormatterParams<R extends GridValidRowModel = GridRowModel> {
  /** The raw value to format. */
  value: unknown;
  /** The row object. */
  row: R;
  /** The field name. */
  field: string;
}

/** Parameters passed to the `renderCell` function. */
export interface GridRenderCellParams<R extends GridValidRowModel = GridRowModel> {
  /** The current cell value. */
  value: unknown;
  /**
   * The value after `colDef.valueFormatter` (or `String(value)` when no formatter is set; `''` for null/undefined).
   * @since v2.1
   */
  formattedValue?: string;
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
  /**
   * Hierarchy metadata for this row. `undefined` for flat rows (no tree-data or row-grouping active).
   * @since v1.1
   */
  rowMeta?: GridRowMeta;
}

/**
 * Parameters passed to `renderEditCell`. `value` is the pending (uncommitted) value.
 * @since v3.0
 */
export interface GridRenderEditCellParams<R extends GridValidRowModel = GridRowModel> extends GridRenderCellParams<R> {
  /** Updates the pending value. Call it on every change; nothing is saved until `onCommit`. */
  onValueChange: (value: unknown) => void;
  /** Commits the pending value (runs `processRowUpdate`) and leaves edit mode. */
  onCommit: () => void;
  /** Discards the pending value and leaves edit mode. */
  onCancel: () => void;
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
  | '='
  | '>'
  | '>='
  | '<'
  | '<='
  | '!='
  | 'is'
  | 'not'
  | 'after'
  | 'onOrAfter'
  | 'before'
  | 'onOrBefore';

/** Describes a filter condition for a specific column. */
export interface GridFilterItem {
  /** Optional ID for the filter item. */
  id?: string | number;
  /** The field name to filter. */
  field: string;
  /** The comparison operator. */
  operator: GridFilterOperator;
  /** The value to compare against. */
  value?: unknown;
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

/**
 * Configuration options for exporting the DataGrid to PDF format.
 * Requires jspdf and jspdf-autotable peer dependencies.
 */
export interface PdfExportOptions<R extends GridValidRowModel = GridRowModel> {
  /**
   * Output filename without extension. Default: 'export'
   */
  fileName?: string;

  /**
   * Title text displayed in the document header.
   * When omitted, no header block is rendered.
   */
  title?: string;

  /**
   * URL or data URI of a logo image rendered left of the title.
   * Only used when `title` is also set. Default: none
   */
  logoUrl?: string;

  /**
   * Page orientation. Default: 'landscape'
   */
  orientation?: 'portrait' | 'landscape';

  /**
   * If provided, only rows whose id is in this array are exported. A non-empty selection takes
   * precedence over `groupedRows` (the selected rows are exported flat), and the footer totals
   * are recomputed over the selected rows.
   */
  selectedRows?: (string | number)[];

  /**
   * The grid's `getRowId`, when it has one: `selectedRows` holds those ids, and the grid does not
   * copy them onto `row.id` (v3.0+). Defaults to `row.id`.
   */
  getRowId?: (row: R) => GridRowId;

  /**
   * Aggregation result from apiRef.current.getAggregationResult().
   * When provided alongside aggregationModel, appends a footer row.
   */
  aggregationResult?: Record<string, unknown> | null;

  /**
   * Aggregation model from apiRef.current.getAggregationModel().
   */
  aggregationModel?: GridAggregationModel | null;

  /**
   * Active filter model. When provided, a filter summary is shown in the header.
   */
  filterModel?: GridFilterModel | null;

  /**
   * Whether to apply alternating row shading. Default: true
   */
  alternateRowColor?: boolean;

  /**
   * Column header background color (hex). Default: '#4f46e5'
   */
  headerBackgroundColor?: string;

  /**
   * Column header text color (hex). Default: '#ffffff'
   */
  headerTextColor?: string;

  /**
   * Base font size in points for table body. Default: 9
   */
  fontSize?: number;

  /**
   * A TrueType font for the whole document. The built-in Helvetica font only covers Latin-1 and
   * WinAnsi punctuation (é, ü, €, “ ”, •). Without this option other characters (₹, Greek,
   * Cyrillic, CJK, Devanagari, U+202F used by some locales as a thousands separator) are
   * replaced with `?` (spaces and minus signs with their ASCII forms) and a warning is logged.
   * `data` is the `.ttf` file as a base64 string; `boldData` is an optional bold face for the
   * title, header and totals (the regular face is used when omitted). jsPDF does not shape
   * complex scripts, so Devanagari or Arabic ligatures may not join.
   * @since v3.0
   */
  font?: {
    /** Font family name, e.g. 'NotoSans'. */
    name: string;
    /** Base64-encoded .ttf file. */
    data: string;
    /** Base64-encoded bold .ttf file. Default: `data`. */
    boldData?: string;
  };

  /**
   * Pre-built grouped export rows from `apiRef.current.getGroupedExportRows()`.
   * When provided, the PDF table reflects the grouping structure (group headers,
   * leaf rows, per-group subtotals, grand total) instead of a flat row list.
   * Has no effect when the grid has no active `rowGroupingModel`, or when `selectedRows` is non-empty.
   */
  groupedRows?: GridGroupedExportRow[];

  /**
   * Called as the export advances: `prepare` (formatting rows; `total` = source rows or grouped
   * entries), `render` (drawing table rows; `total` = table body rows) and `save` (`0/1` before the
   * file is written, `1/1` after). `done` never decreases within a phase and ends at `total`.
   * @since v3.2
   */
  onProgress?: (progress: PdfExportProgress) => void;

  /**
   * Cancels the export. When aborted, the returned promise rejects with a `DOMException` named
   * `'AbortError'` and no file is saved. Checked between slices of work, so cancellation takes
   * effect within one slice; the final save step cannot be interrupted once started.
   * @since v3.2
   */
  signal?: AbortSignal;

  /**
   * Table-row count above which a development-mode warning recommends `exportToCsv` or
   * `exportToExcelAdvanced`. The export still runs (nothing is thrown). Pass `Infinity` to silence it.
   * Default: 20000
   * @since v3.2
   */
  maxRows?: number;
}

/** Progress reported by `PdfExportOptions.onProgress`. @since v3.2 */
export interface PdfExportProgress {
  phase: 'prepare' | 'render' | 'save';
  done: number;
  total: number;
}

/**
 * A single entry in the ordered list returned by `GridApi.getGroupedExportRows()`.
 * Traverse in array order to reproduce the on-screen grouping structure.
 */
export interface GridGroupedExportRow {
  /** Discriminator: the kind of row this entry represents. */
  type: 'group-header' | 'leaf' | 'group-subtotal' | 'grand-total';
  /** Nesting depth (0 = top-level group, 1 = nested group, etc.). */
  depth: number;
  /** The grouping field for this level (absent on 'leaf' and 'grand-total'). */
  groupField?: string;
  /** The raw grouping value for this level (absent on 'leaf' and 'grand-total'). */
  groupValue?: unknown;
  /**
   * The group label exactly as the grid shows it (from `groupingValueFormatter`, else `"field: value"`),
   * on 'group-header' and 'group-subtotal' entries from `getGroupedExportRows()`. Exporters use it for
   * group-header rows; when absent they apply the column's `groupingValueFormatter` themselves.
   * @since v3.0
   */
  groupLabel?: string;
  /** Per-group aggregation results (present on 'group-subtotal' and 'grand-total'). */
  aggregatedValues?: Record<string, unknown>;
  /** The original data row (only present when `type === 'leaf'`). */
  row?: GridRowModel;
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

export interface GridRowOrderChangeParams<R extends GridValidRowModel = GridRowModel> {
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

export type GridRowSelectionModel = GridRowId[];

/** One cell, addressed by its row id and column field. @since v3.3 */
export interface GridCellCoordinates {
  id: GridRowId;
  field: string;
}

/**
 * A rectangle of cells between two corners. `anchor` is the active cell: it keeps focus, is the cell
 * an edit starts in, and stays put while the range is extended. `head` is the corner that moves with
 * Shift+arrows or the pointer, and the one scrolled into view. A single cell has `anchor` equal to `head`.
 * @since v3.3
 */
export interface GridCellRange {
  anchor: GridCellCoordinates;
  head: GridCellCoordinates;
}

/**
 * The cell selection: zero or one range in 3.3 (the array form leaves room for several ranges later).
 * Corners are ids and fields, so the rectangle follows its corner rows through sorting and filtering.
 * @since v3.3
 */
export type GridCellSelectionModel = readonly GridCellRange[];

/** What changed the cell selection. @since v3.3 */
export type GridCellSelectionReason = 'pointer' | 'keyboard' | 'selectAll' | 'api' | 'clear' | 'dataChange';

/** Second argument of `onCellSelectionModelChange`. @since v3.3 */
export interface GridCellSelectionChangeDetails {
  reason: GridCellSelectionReason;
}

/** One cell of the selected range, as returned by `apiRef.getSelectedCells()`. @since v3.3 */
export interface GridSelectedCell {
  id: GridRowId;
  field: string;
  /** The cell's value, read through the column's `valueGetter`. */
  value: unknown;
}

/**
 * Props the grid passes to `slots.cellSelectionStats` (the status bar of `showCellSelectionStats`),
 * before `slotProps.cellSelectionStats` is merged over them. Rendered only while more than one cell
 * is selected.
 * @since v3.3
 */
export interface GridCellSelectionStatsSlotProps {
  apiRef: React.MutableRefObject<GridApi>;
  /** Cells in the rectangle (rows × columns), synthetic rows and span-covered positions included. */
  cellCount: number;
  rowCount: number;
  columnCount: number;
  /** Non-empty cells of data rows. */
  count: number;
  /** Cells holding a number. */
  numericCount: number;
  /** Sum of the numeric cells, or `null` when there are none. */
  sum: number | null;
  /** Average of the numeric cells, or `null` when there are none. */
  average: number | null;
}

export interface GridPinnedColumns {
  left?: string[];
  right?: string[];
}

export interface GridPinnedRows<R extends GridValidRowModel = GridRowModel> {
  top?: R[];
  bottom?: R[];
}

export type GridRowGroupingModel = string[]; 

export interface GridAggregationModel {
  [field: string]: string;
}

export type GridAggregationResult = Record<string, unknown>;

/**
 * Where a group's aggregates are shown, as returned by `getAggregationPosition`: `'inline'` on the group row,
 * `'footer'` on a subtotal row after the group's children, `null` hidden.
 */
export type GridAggregationPosition = 'inline' | 'footer' | null;

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

export interface GridRowScrollEndParams {
  visibleTop: number;
  visibleBottom: number;
  viewportHeight: number;
}

/** Overrideable user-visible strings for internationalisation. All fields are optional; defaults match the built-in English strings. */
export interface GridLocaleText {
    /** Label before the rows-per-page select. Default: `"Rows per page:"` */
    paginationRowsPerPage?: string;
    /** Range label. Receives (from, to, count). Default: `` (f, t, c) => `${f}–${t} of ${c}` `` */
    paginationOf?: (from: number, to: number, count: number) => string;
    /** Page counter label. Receives (page, pageCount). Default: `` (p, pc) => `Page ${p} of ${pc}` `` */
    paginationPage?: (page: number, pageCount: number) => string;
    /** Empty-state label. When set, overrides the `noRowsLabel` prop on DataGrid. Default: `"No Data"` */
    noRowsLabel?: string;
    /**
     * Screen-reader announcement after the cell range changes (`cellSelection`). Receives (cells, rows,
     * columns). Default: `` (c, r, col) => `${c} cells selected, ${r} rows by ${col} columns` `` (singular for 1).
     * @since v3.3
     */
    cellSelectionAnnouncement?: (cellCount: number, rowCount: number, columnCount: number) => string;
}

/**
 * Main properties for the DataGrid component.
 */
export interface DataGridProps<R extends GridValidRowModel = GridRowModel> {
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
  /**
   * Wraps header titles onto several lines instead of cutting them with an ellipsis. The header
   * keeps `headerHeight` (2 lines at the default 56px, 3 at 72px, 4 at 88px); a title that still
   * does not fit ends in an ellipsis. `GridColDef.wrapHeaderText` overrides it per column.
   * Defaults to `false`.
   */
  wrapHeaderText?: boolean;
  /** If true, the grid height will adjust to match the total height of its rows. */
  autoHeight?: boolean;
  /**
   * Minimum number of rows to render outside the visible viewport (overscan buffer).
   * The grid adapts this value upward automatically based on scroll velocity to prevent
   * blank flashes during fast scrolling. This prop sets the floor — the buffer never
   * drops below this value regardless of scroll speed. Defaults to `3`.
   */
  overscanRowCount?: number;

  /** Sorting mode: 'client' (default) or 'server'. */
  sortingMode?: 'client' | 'server';
  /** The current sorting model. */
  sortModel?: GridSortItem[];
  /** Callback fired when the sorting model changes. */
  onSortModelChange?: (model: GridSortItem[]) => void;
  /**
   * When true, clicking any sortable column header appends/cycles that column in the
   * sort model instead of replacing it — no Shift key required. Plain click still
   * cycles asc → desc → removed for that column while all other active sort keys stay.
   * Shift+click continues to work regardless of this prop.
   */
  multiSort?: boolean;

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
  /**
   * If true, Ctrl/Cmd+C does not copy the selected rows, so the page (or your own handler) owns
   * the shortcut. `apiRef.current.copySelectedRows()` still works. Default: false.
   */
  disableClipboardCopy?: boolean;

  /**
   * Lets users select a rectangle of cells (drag, Shift+click, Shift+arrows, Ctrl/Cmd+A) and copy it
   * with Ctrl/Cmd+C as tab-separated text. While on, Ctrl/Cmd+C copies the cell range (the focused
   * cell at minimum) instead of the selected rows; `apiRef.copySelectedRows()` still copies rows.
   * Default: false. @since v3.3
   */
  cellSelection?: boolean;
  /** Controlled cell selection (zero or one range). Needs `cellSelection`. @since v3.3 */
  cellSelectionModel?: GridCellSelectionModel;
  /** Fired when the cell selection changes, with what changed it. @since v3.3 */
  onCellSelectionModelChange?: (model: GridCellSelectionModel, details: GridCellSelectionChangeDetails) => void;
  /**
   * Shows a status bar under the grid with the count of non-empty cells and the sum and average of the
   * numeric cells in the range, while more than one cell is selected. Replaceable through
   * `slots.cellSelectionStats`. Needs `cellSelection`. Default: false. @since v3.3
   */
  showCellSelectionStats?: boolean;

  /** Loading state. With no rows the body shows skeleton rows (or `slots.loadingOverlay`); with rows, they stay and a progress bar (or `slots.loadingOverlay`) is shown over them. */
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
  /** Overrides for user-visible strings (i18n). All fields are optional. */
  localeText?: GridLocaleText;

  /** Advanced: The starting internal state of the grid. */
  initialState?: import('../state/types').GridInitialState;
  /**
   * Called on mount and whenever the value of the sorting, filter, pagination, columns (widths, order,
   * visibility, pinning) or density state changes. Selection, expansion and editing do not call it.
   */
  onStateChange?: (state: import('../state/types').GridState) => void;

  /**
   * Callback fired when a row is clicked. Tree-data parent rows are real rows: a click fires this and
   * selects them like any row (the chevron expands them). Synthetic rows (row-grouping group rows,
   * subtotal rows and auto-created tree parents) do not fire it: clicking a group row toggles it.
   */
  onRowClick?: (params: GridRowParams<R>) => void;
  /**
   * Callback fired when a row is double-clicked. Also fires for group rows; check
   * `apiRef` / `rowMeta` if you only want leaf rows. Not fired when the double-click
   * lands on the checkbox, expand icon, drag handle, or an open cell editor.
   * @since v2.1
   */
  onRowDoubleClick?: (params: GridRowParams<R>) => void;
  /** Callback fired when a cell is clicked. */
  onCellClick?: (params: GridCellParams<R>) => void;

  /**
   * Renders the detail panel content for a row in Master-Detail mode. Called for data rows only:
   * synthetic group, subtotal and auto-created tree-parent rows have no detail panel.
   */
  getDetailPanelContent?: (params: GridDetailPanelParams<R>) => React.ReactNode;
  /** Defines the height of the detail panel. Called for data rows only, like `getDetailPanelContent`. */
  getDetailPanelHeight?: (params: GridDetailPanelParams<R>) => GridDetailPanelHeight;
  /** Controlled state for expanded detail panels. */
  detailPanelExpandedRowIds?: Set<GridRowId>;
  /** Callback fired when expanded detail panels change. */
  onDetailPanelExpandedRowIdsChange?: (expandedRowIds: Set<GridRowId>) => void;

  /** If true, manual column reordering via drag-and-drop is disabled. */
  disableColumnReorder?: boolean; 
  /** Controlled horizontal order of column fields. */
  columnOrder?: GridColumnOrder; 
  /**
   * Fired when the user moves one column (header drag or Columns panel). `oldIndex` / `targetIndex`
   * are positions in the grid's full column order: every current column, in order.
   */
  onColumnOrderChange?: (params: GridColumnOrderChangeParams) => void;
  /**
   * Fired with the whole new column order after every change: a header drag, a Columns panel drag
   * and the panel's Reset. The easiest way to keep a controlled `columnOrder` in sync.
   * Not fired for the generated columns of pivot mode.
   */
  onColumnOrderModelChange?: (columnOrder: GridColumnOrder) => void;

  /** If true, rows can be reordered via drag-and-drop. */
  rowReordering?: boolean; 
  /** Callback fired when rows are reordered. */
  onRowOrderChange?: (params: GridRowOrderChangeParams<R>) => void; 

  /** If true, enables hierarchical tree data display. */
  treeData?: boolean;
  /**
   * Function to get the path (array of strings) for a row in Tree Data mode. Required with `treeData`:
   * without it the rows are shown flat. Segments may contain any character, including '/'. Keep the
   * function identity stable (module scope or useCallback); a new function rebuilds the tree.
   */
  getTreeDataPath?: (row: R) => string[];
  /**
   * Adds a dedicated grouping column (pinned left) under row grouping or tree data, configured by these
   * fields. Every key is optional: `field` is always `'__group__'` (a `field` you pass is ignored).
   */
  groupingColDef?: Partial<GridColDef<R>>;
  /** Initial expansion depth for Tree Data. */
  defaultGroupingExpansionDepth?: number;

  /** Controlled state for row grouping. */
  rowGroupingModel?: GridRowGroupingModel;
  /** Controlled state for data aggregation (e.g., { salary: 'sum' }). */
  aggregationModel?: GridAggregationModel;
  /** Callback fired when aggregation model changes. */
  onAggregationModelChange?: (model: GridAggregationModel) => void;
  /**
   * Advanced: where aggregation results appear. Called for every group node (with its current
   * `isExpanded`) and once with `null` for the grand total. `'inline'` (default for groups) shows them
   * on the group row; `'footer'` on a subtotal row after the group's children while it is expanded
   * (inline while collapsed); `null` hides them. For the grand total, `null` hides the footer row.
   */
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
  onProcessRowUpdateError?: (error: unknown) => void;

  /** Interface for connecting the grid to an external (server-side) data source. */
  dataSource?: GridDataSource<R>;
  /** Callback fired when scrolling reaches the bottom of the grid viewport. */
  onRowsScrollEnd?: (params: GridRowScrollEndParams) => void;

  /**
   * Advanced: reactive reference to the internal API for imperative control. Pass
   * `useGridApiRef<MyRow>()` to have the row getters typed as `MyRow`; a plain `useGridApiRef()` also works.
   */
  apiRef?: React.MutableRefObject<GridApi<R>> | React.MutableRefObject<GridApi>;

  /** Custom components to replace internal grid parts. */
  slots?: {
    /**
     * Component rendered as the grid toolbar. Receives `GridToolbarSlotProps` (plus `slotProps.toolbar`),
     * so it can be typed with `GridToolbarProps` or wrap the exported `GridToolbar`.
     */
    toolbar?: React.ComponentType<GridToolbarSlotProps & Record<string, unknown>>;
    /**
     * Component rendered as the pagination control. Receives `PaginationProps` (plus `slotProps.pagination`),
     * so it can be typed with `PaginationProps` or wrap the exported `Pagination`.
     */
    pagination?: React.ComponentType<GridPaginationSlotProps & Record<string, unknown>>;
    /** Component rendered when the grid is empty. Receives only `slotProps.noRowsOverlay`. */
    noRowsOverlay?: React.ComponentType<GridOverlaySlotProps>;
    /** Component rendered during loading states. Receives only `slotProps.loadingOverlay`. */
    loadingOverlay?: React.ComponentType<GridOverlaySlotProps>;
    /**
     * Component rendered at the very bottom of the grid, in place of the pagination area.
     * Receives `GridFooterSlotProps` (plus `slotProps.footer`).
     */
    footer?: React.ComponentType<GridFooterSlotProps & Record<string, unknown>>;
    /**
     * Replaces the status bar of `showCellSelectionStats`. Receives `GridCellSelectionStatsSlotProps`
     * (plus `slotProps.cellSelectionStats`). @since v3.3
     */
    cellSelectionStats?: React.ComponentType<GridCellSelectionStatsSlotProps & Record<string, unknown>>;
  };
  /** Properties passed directly to custom slots. */
  slotProps?: {
    /**
     * Merged over the props the grid passes to the toolbar. Typed as `GridToolbarProps` (so render props
     * such as `renderQuickFilter` are checked and their parameters inferred), plus any extra keys a custom
     * toolbar reads. `columns` / `baseColumns` are not checked, so typed `GridColDef<R>[]` can be passed.
     */
    toolbar?: Omit<Partial<GridToolbarProps>, 'columns' | 'baseColumns'> & Record<string, unknown>;
    /** Merged over the `PaginationProps` the grid passes to the pagination slot. */
    pagination?: Partial<GridPaginationSlotProps> & Record<string, unknown>;
    noRowsOverlay?: GridOverlaySlotProps;
    loadingOverlay?: GridOverlaySlotProps;
    /** Merged over the `GridFooterSlotProps` the grid passes to the footer slot. */
    footer?: Partial<GridFooterSlotProps> & Record<string, unknown>;
    /** Merged over the `GridCellSelectionStatsSlotProps` the grid passes to the status bar. */
    cellSelectionStats?: Partial<GridCellSelectionStatsSlotProps> & Record<string, unknown>;
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

/**
 * `DataGridProps<R>` with untyped `columns` (`GridColDef[]`, i.e. `GridColDef<GridRowModel>[]`). `DataGrid`
 * accepts these props as well as `DataGridProps<R>`, so columns written without a row type work with rows of
 * any type `R`. Their callbacks then see `params.row` as `GridRowModel`; type the columns as
 * `GridColDef<R>[]` to get your row type there.
 * @since v3.0
 */
export type DataGridUntypedColumnsProps<R extends GridValidRowModel = GridRowModel> =
  Omit<DataGridProps<R>, 'columns'> & { columns: GridColDef[] };

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

export interface GridRowParams<R extends GridValidRowModel = GridRowModel> {
  row: R;
  id: GridRowId;
  rowIndex: number;
}

export interface GridCellParams<R extends GridValidRowModel = GridRowModel> {
  row: R;
  field: string;
  value: unknown;
  colDef: GridColDef<R>;
  rowIndex: number;
  colIndex: number;
}

export interface GridDetailPanelParams<R extends GridValidRowModel = GridRowModel> {
  row: R;
  id: GridRowId;
  rowIndex: number;
}

export type GridDetailPanelHeight = number | 'auto';

/**
 * The Imperative API for interacting with the DataGrid.
 * Access this via the `apiRef` prop or a ref passed to the component.
 */
/**
 * The imperative grid API. `R` types the row getters (`getRow`, `getAllRows`, `getVisibleRows`,
 * `getAllFilteredRows`); it defaults to `GridRowModel`, so `GridApi` alone keeps working.
 */
export interface GridApi<R extends GridValidRowModel = GridRowModel> {
  /**
   * Returns the row model with the given ID.
   * @param id The row unique ID.
   */
  getRow: (id: GridRowId) => R | null;
  /** Returns all rows currently loaded into the grid. */
  getAllRows: () => R[];
  /** Returns all rows currently visible after filtering and sorting. */
  getVisibleRows: () => R[];
  /** Returns all filtered and sorted rows, ignoring pagination. Use this for full-dataset exports. */
  getAllFilteredRows: () => R[];
  /**
   * Returns an ordered flat list of `GridGroupedExportRow` entries that mirrors the
   * on-screen grouping tree: group-headers, leaf rows, per-group subtotals, and a
   * grand-total entry at the end. Returns `null` when no `rowGroupingModel` is active.
   * Pass the result to export functions that accept a `groupedRows` option.
   */
  getGroupedExportRows: () => GridGroupedExportRow[] | null;
  /** Returns the current aggregation results. */
  getAggregationResult: () => Record<string, unknown> | null;
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
   * Sizes a column to fit its header and the cells rendered right now (the virtualization window),
   * clamped to `minWidth` (default 50px) / `maxWidth`, like double-clicking its resize handle.
   * Does nothing for `resizable: false` columns or a column that is not rendered.
   * A flex column gets a fixed width. @since v3.1
   */
  autosizeColumn: (field: string) => void;
  /** `autosizeColumn` for several columns (default: every column). @since v3.1 */
  autosizeColumns: (fields?: readonly string[]) => void;

  /**
   * Programmatically copies all currently selected rows to the clipboard as TSV: every selected
   * row that passes the filter (other pages, collapsed groups and pinned rows included), with the
   * visible columns in screen order. Equivalent to the user pressing Ctrl+C / Cmd+C.
   * @returns A Promise that resolves when the text is written (or when no selected row was found,
   * in which case nothing is written) and rejects when the clipboard write fails.
   */
  copySelectedRows: () => Promise<void>;

  /** The cell selection (`[]` when `cellSelection` is off or nothing is selected). @since v3.3 */
  getCellSelectionModel: () => GridCellSelectionModel;
  /**
   * Replaces the cell selection (only the first range is kept) and moves focus to its anchor.
   * Does nothing while `cellSelection` is off. @since v3.3
   */
  setCellSelectionModel: (model: GridCellSelectionModel) => void;
  /** Selects the rectangle between two cells; `anchor` becomes the active cell. @since v3.3 */
  selectCellRange: (anchor: GridCellCoordinates, head: GridCellCoordinates) => void;
  /** Empties the cell selection. Focus stays where it is. @since v3.3 */
  clearCellSelection: () => void;
  /**
   * Cells of the current range in display order (row by row, columns in screen order), values read
   * through the column's `valueGetter`. Synthetic rows (group headers, subtotals, tree auto-parents, the
   * pivot Grand Total) and positions covered by a span are left out. @since v3.3
   */
  getSelectedCells: () => GridSelectedCell[];
  /**
   * Copies the cell range (the focused cell when nothing is selected) as tab-separated text, formatted
   * the way the cells show it, with no header line. Resolves without writing when there is nothing to
   * copy; rejects when the clipboard write fails. @since v3.3
   */
  copySelectedCells: () => Promise<void>;
}
