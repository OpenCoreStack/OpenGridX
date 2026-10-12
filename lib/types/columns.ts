import type { GridRowModel, GridValidRowModel, GridRowMeta } from './rows';
import type { GridSortCellParams } from './sorting';
import type { GridFilterOperator } from './filtering';
import type { GridFillValueParams } from './editing';

/**
 * A callback that is checked bivariantly in its parameter, like a method. Used for `GridColDef`
 * options that are either a value or a function, so a column typed for your rows (`GridColDef<Row>`)
 * can still be used where an untyped `GridColDef` is expected.
 */
type GridColDefCallback<P, T> = { bivarianceHack(params: P): T }['bivarianceHack'];

export type GridAlignment = 'left' | 'center' | 'right';

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
  /**
   * Set to `false` to leave this column's cell in the header filter row (`headerFilters`) empty.
   * Columns with `filterable: false` or `type: 'image'` have no header filter either.
   * @since v3.5
   */
  headerFilter?: boolean;
  /**
   * The operator a new header filter (`headerFilters`) for this column starts with. Defaults by type:
   * `contains` (string), `=` (number), `is` (date, boolean, singleSelect).
   * @since v3.5
   */
  headerFilterOperator?: GridFilterOperator;
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
   * Turns pasted text into this column's value (clipboard paste), instead of the default parser for
   * the column `type` (see `docs/features/clipboard.md`). Use it for locales such as `1.234,5` or for
   * custom codes. Throw (or return `undefined`) to reject the text: the cell is skipped with reason
   * `'invalidValue'`. The value then goes through `valueSetter` and `processRowUpdate` like an edit.
   * @since v3.4
   */
  valueParser?(text: string, params: GridValueParserParams<R>): unknown;
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
  /**
   * Decides the value the fill handle (or Ctrl/Cmd+D, Ctrl/Cmd+R) writes into a cell of this column.
   * `params.value` is what the grid would write (a continued series, the repeated pattern or a copy);
   * return it to keep that, or any other value. A throw skips the cell with reason `'invalidValue'`.
   * The value then goes through `valueSetter` and `processRowUpdate` like an edit. @since v3.5
   */
  fillValue?(params: GridFillValueParams<R>): unknown;
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

  /**
   * Example values for this column, put into the schema from `getGridAiSchema`
   * (`@opencorestack/opengridx/ai`) to help a language model write filters ("Acme" → `customer`).
   * **These values are sent to the model.** The grid never reads row data for the schema; only what
   * you list here leaves the app, so list nothing private. Strings, numbers and booleans are used
   * (at most 10); other values are ignored. Not used by the grid itself.
   * @since v3.4
   */
  aiExamples?: unknown[];
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

/** Parameters passed to the `valueGetter` function. */
export interface GridValueGetterParams<R extends GridValidRowModel = GridRowModel> {
  /** The row object. */
  row: R;
  /** The field name. */
  field: string;
  /** The raw value from the row object. */
  value: unknown;
}

/** Parameters passed to `GridColDef.valueParser`. @since v3.4 */
export interface GridValueParserParams<R extends GridValidRowModel = GridRowModel> {
  /** The row the text is pasted into, as stored now. */
  row: R;
  field: string;
  colDef: GridColDef<R>;
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

export type GridPinnedPosition = 'left' | 'right';

export type GridColumnVisibilityModel = Record<string, boolean>;

/** Configuration for pinning columns to the grid edges. */
export interface GridColumnPinning {
  /** Field strings to pin to the left edge. */
  left?: string[];  
  /** Field strings to pin to the right edge. */
  right?: string[]; 
}

export interface GridColumnOrderChangeParams {
  column: GridColDef;
  oldIndex: number;
  targetIndex: number;
}

export type GridColumnOrder = string[];

export interface GridPinnedColumns {
  left?: string[];
  right?: string[];
}

export interface GridCellParams<R extends GridValidRowModel = GridRowModel> {
  row: R;
  field: string;
  value: unknown;
  colDef: GridColDef<R>;
  rowIndex: number;
  colIndex: number;
}
