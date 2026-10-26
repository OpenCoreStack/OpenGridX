import type { GridRowId, GridRowModel, GridValidRowModel, GridRowMeta } from './rows';
import type { GridColDef } from './columns';
import type { GridCellSelectionModel } from './selection';
import type { GridApi } from './api';

/** What `getContextMenuItems` receives for the cell the menu was opened on. @since v3.11 */
export interface GridContextMenuParams<R extends GridValidRowModel = GridRowModel> {
  /** Id of the row. */
  id: GridRowId;
  /** Field of the column. */
  field: string;
  /** The row object (the synthetic row for group, subtotal, auto-parent and pivot Grand Total rows). */
  row: R;
  /** The column definition. */
  colDef: GridColDef<R>;
  /** The cell value, read through `valueGetter`. */
  value: unknown;
  /** Hierarchy metadata of the row, when it has any. */
  rowMeta: GridRowMeta | undefined;
  /** The current cell range; `null` without `cellSelection` or with no range. */
  cellRange: GridCellSelectionModel | null;
  /** The grid API. */
  api: GridApi<R>;
}

/** One action of the context menu. @since v3.11 */
export interface GridContextMenuItem {
  /** Stable key. Built-in items use `'copy'`, `'copyWithHeaders'`, `'undo'` and `'redo'`. */
  id: string;
  label: string;
  /** Contained: a throw is caught and warned once in development. */
  onClick?: () => void;
  disabled?: boolean;
  /** Display only, e.g. `'Ctrl+C'`. */
  shortcut?: string;
  icon?: React.ReactNode;
  /** Styling only. */
  danger?: boolean;
}

/** A menu item or a separator line. @since v3.11 */
export type GridContextMenuEntry = GridContextMenuItem | 'divider';
