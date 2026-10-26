import type { GridRowId, GridRowModel, GridValidRowModel } from './rows';
import type { GridColDef, GridColumnVisibilityModel } from './columns';
import type { GridSortDirection, GridSortItem } from './sorting';
import type { GridFilterModel } from './filtering';
import type { GridBatchEditResult } from './editing';
import type { GridGroupedExportRow } from './export';
import type { GridCellCoordinates, GridCellSelectionModel, GridSelectedCell } from './selection';
import type { GridRowGroupingModel, GridAggregationModel, GridPivotModel } from './grouping';
import type { GridAiState } from './ai';

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

  /**
   * Pastes tab-separated text as Ctrl/Cmd+V does: from `anchor` (default: the range's top-left cell,
   * else the focused cell), with `onBeforeClipboardPaste` and `onClipboardPaste`. Works with
   * `disableClipboardPaste`. Resolves once every row's `processRowUpdate` has settled. @since v3.4
   */
  pasteText: (text: string, anchor?: GridCellCoordinates) => Promise<GridBatchEditResult>;
  /** Undoes the last action (`undoRedo`). Resolves with what was written. @since v3.4 */
  undo: () => Promise<GridBatchEditResult>;
  /** Redoes the last undone action (`undoRedo`). @since v3.4 */
  redo: () => Promise<GridBatchEditResult>;
  /** Whether there is an action to undo. @since v3.4 */
  canUndo: () => boolean;
  /** Whether there is an undone action to redo. @since v3.4 */
  canRedo: () => boolean;
  /** Forgets every action (undo and redo). @since v3.4 */
  clearHistory: () => void;

  /** Replaces the sort model (fires `onSortModelChange`). @since v3.5 */
  setSortModel: (model: GridSortItem[]) => void;
  /** Replaces the row grouping model (fires `onRowGroupingModelChange`). @since v3.5 */
  setRowGroupingModel: (model: GridRowGroupingModel) => void;
  /** Replaces the aggregation model (fires `onAggregationModelChange`). @since v3.5 */
  setAggregationModel: (model: GridAggregationModel) => void;
  /** Replaces the column visibility model (fires `onColumnVisibilityModelChange`). @since v3.5 */
  setColumnVisibilityModel: (model: GridColumnVisibilityModel) => void;
  /** Replaces the pivot model (fires `onPivotModelChange`). @since v3.5 */
  setPivotModel: (model: GridPivotModel) => void;
  /**
   * The current filter, sort, grouping, aggregation, pivot and column visibility models, in the shape
   * of the AI toolkit (`GridAiState`). @since v3.5
   */
  getGridAiState: () => GridAiState;
  /** Opens the `aiAssistant` panel (does nothing without `aiAssistant`). @since v3.5 */
  openAiAssistant: () => void;
  /** Closes the `aiAssistant` panel. @since v3.5 */
  closeAiAssistant: () => void;
  /** Opens the context menu on a cell (does nothing without `contextMenu`). @since v3.11 */
  openContextMenu: (id: GridRowId, field: string) => void;
  /** Closes the context menu. @since v3.11 */
  closeContextMenu: () => void;
}

// ── AI toolkit (v3.4 state types; v3.5 assistant) ──────────────────────────────────────────────────
// Type-only and React-free: the `@opencorestack/opengridx/ai` entry point re-exports them.
