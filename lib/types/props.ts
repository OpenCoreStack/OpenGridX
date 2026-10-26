import type { GridToolbarProps } from '../components/Toolbar/GridToolbar';
import type { GridRowId, GridRowModel, GridValidRowModel, GridTreeNode, GridRowPinning, GridRowOrderChangeParams, GridRowScrollEndParams, GridRowParams, GridDetailPanelParams, GridDetailPanelHeight } from './rows';
import type { GridColDef, GridListViewColDef, GridColumnGroupingModel, GridColumnVisibilityModel, GridColumnPinning, GridColumnOrderChangeParams, GridColumnOrder, GridCellParams } from './columns';
import type { GridSortItem } from './sorting';
import type { GridFilterModel } from './filtering';
import type { GridFillResult, GridClipboardPasteResult, GridBeforeClipboardPasteParams, GridHistoryChangeParams, GridUndoRedoOptions } from './editing';
import type { GridDataSource, GridPaginationModel } from './dataSource';
import type { GridRowSelectionModel, GridCellSelectionModel, GridCellSelectionChangeDetails, GridCellSelectionStatsSlotProps } from './selection';
import type { GridRowGroupingModel, GridAggregationModel, GridPivotModel } from './grouping';
import type { GridLocaleText } from './locale';
import type { GridToolbarSlotProps, GridPaginationSlotProps, GridOverlaySlotProps, GridFooterSlotProps } from './slots';
import type { GridApi } from './api';
import type { GridContextMenuParams, GridContextMenuEntry } from './contextMenu';
import type { GridAiPromptResult, GridAiAssistantOptions, GridAiAssistantPanelProps } from './ai';

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
  /**
   * Adds a filter row under the column headers: one control per column (text, number, date, a Yes / No
   * select for booleans, the `valueOptions` for singleSelect) with an operator menu and a clear button.
   * It reads and writes `filterModel`: each cell owns the root-level item with `id: 'header:<field>'`,
   * so the filter panel, quick filter and `filterMode="server"` keep working. A model the row cannot
   * show (root `logicOperator: 'or'`, other conditions on the column, nested groups) is shown as
   * "Custom filter" and left untouched. See `docs/features/header-filters.md`. Defaults to `false`.
   * @since v3.5
   */
  headerFilters?: boolean;
  /** Height of the header filter row (`headerFilters`) in pixels. Defaults to 40. @since v3.5 */
  headerFilterHeight?: number;
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

  /**
   * With `cellSelection` on, Ctrl/Cmd+V pastes tab-separated text (Excel, Google Sheets) into the
   * editable cells from the range's top-left cell (or the focused cell), through `valueSetter` and
   * `processRowUpdate`. `true` turns the shortcut off; `apiRef.pasteText()` still works. Default: false.
   * @since v3.4
   */
  disableClipboardPaste?: boolean;
  /**
   * Fired after every paste with the result (`updated` rows, `failed` rows, `skipped` cells and why)
   * and the pasted text. @since v3.4
   */
  onClipboardPaste?: (result: GridClipboardPasteResult) => void;
  /**
   * Called before a paste is applied. Return `false` to cancel it, or a string to paste instead of the
   * clipboard text. A throw cancels the paste. @since v3.4
   */
  onBeforeClipboardPaste?: (params: GridBeforeClipboardPasteParams) => boolean | string;
  /**
   * With `cellSelection` on, Delete / Backspace on a range of more than one cell empties its editable
   * cells (`null`, or `''` in string columns) as one edit. `true` turns that off. Default: false.
   * @since v3.4
   */
  disableRangeClear?: boolean;
  /**
   * Undo and redo of cell edits, pastes and range clears: Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z and Ctrl+Y while
   * focus is in the grid and no editor is open, and `apiRef.undo()` / `redo()`. Undo and redo write
   * through `valueSetter` and `processRowUpdate`, like an edit. `{ limit }` sets how many actions are
   * kept (default 100). Default: false. @since v3.4
   */
  undoRedo?: boolean | GridUndoRedoOptions;
  /** Fired when what can be undone or redone changes (`undoRedo`). @since v3.4 */
  onHistoryChange?: (params: GridHistoryChangeParams) => void;
  /**
   * With `cellSelection` on, a fill handle sits on the bottom-right corner of the range: dragging it
   * down, up, right or left fills the new cells from the range (a series of numbers or dates with an
   * equal step continues, anything else repeats; Alt at release copies), and Ctrl/Cmd+D / Ctrl/Cmd+R
   * fill down from the range's top row / right from its left column. `true` hides the handle and turns
   * the shortcuts off. Default: false. @since v3.5
   */
  disableFillHandle?: boolean;
  /** Fired after every fill with the result and its direction. @since v3.5 */
  onFill?: (result: GridFillResult) => void;

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

  /**
   * The row grouping model: the fields to group by, outermost first. Passing it controls grouping;
   * without it the grid keeps its own model, which `apiRef.setRowGroupingModel` and the AI assistant change.
   */
  rowGroupingModel?: GridRowGroupingModel;
  /** Fired when the row grouping model changes (`apiRef.setRowGroupingModel`, the AI assistant). @since v3.5 */
  onRowGroupingModelChange?: (model: GridRowGroupingModel) => void;
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
    /** Replaces the `aiAssistant` panel. Receives `GridAiAssistantPanelProps` while the panel is open. @since v3.5 */
    aiAssistantPanel?: React.ComponentType<GridAiAssistantPanelProps & Record<string, unknown>>;
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
    /** Extra props for `slots.aiAssistantPanel`. */
    aiAssistantPanel?: Record<string, unknown>;
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

  /**
   * The "Ask AI" prompt panel: users describe the view they want and the grid applies the validated
   * reply as one undoable step, shown as removable chips. The built-in toolbar shows an **Ask AI**
   * button; `apiRef.openAiAssistant()` opens it without one. Build `onPrompt` with
   * `createGridAiPromptHandler` from `@opencorestack/opengridx/ai`. @since v3.5
   */
  aiAssistant?: GridAiAssistantOptions;
  /** Fired after the assistant applied a reply. @since v3.5 */
  onAiAssistantApply?: (result: GridAiPromptResult) => void;
  /** Fired when `onPrompt` fails or returns a result that was not validated. @since v3.5 */
  onAiAssistantError?: (error: unknown) => void;

  /**
   * Shows a context menu (Copy, Copy with headers, Undo, Redo) on right-click or Shift+F10 / the Menu
   * key over a body cell. @since v3.11
   */
  contextMenu?: boolean;
  /**
   * Builds the menu for the cell it opens on, given the built-in items. Return an empty list to show
   * no menu (the browser menu is then not suppressed either). Does nothing without `contextMenu`.
   * @since v3.11
   */
  getContextMenuItems?: (
    params: GridContextMenuParams<R>,
    defaultItems: readonly GridContextMenuEntry[],
  ) => readonly GridContextMenuEntry[];
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
