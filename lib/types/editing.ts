import type { GridRowId, GridRowModel, GridValidRowModel } from './rows';
import type { GridColDef } from './columns';
import type { GridCellCoordinates } from './selection';

/** The way a fill extends the cell range. @since v3.5 */
export type GridFillDirection = 'down' | 'up' | 'right' | 'left';

/** Parameters passed to `GridColDef.fillValue`. @since v3.5 */
export interface GridFillValueParams<R extends GridValidRowModel = GridRowModel> {
  /** The row of the cell being filled, as stored now. */
  row: R;
  id: GridRowId;
  field: string;
  colDef: GridColDef<R>;
  direction: GridFillDirection;
  /** The source cells' values in fill order: the value next to the first filled cell is last. */
  sourceValues: unknown[];
  /** Position of this cell among the filled cells of its line, from 0 (next to the source). */
  index: number;
  /** What the grid would write: the continued series, the repeated pattern or a copy. */
  value: unknown;
  /** Whether a copy was asked for (Alt held at release, or the keyboard shortcuts), so no series. */
  copy: boolean;
}

/** `onFill` details: the batch edit result plus the direction of the fill. @since v3.5 */
export interface GridFillResult extends GridBatchEditResult {
  direction: GridFillDirection;
}

/**
 * Why a cell of a batch edit (paste, range clear, undo, redo) was not written:
 * - `'notEditable'`: the column is not `editable`, `isCellEditable` returned false, or the row is a
 *   synthetic row (group header, subtotal, tree auto-parent, pivot Grand Total);
 * - `'invalidValue'`: the pasted text does not parse for the column type (or `valueParser` rejected it);
 * - `'changed'`: undo/redo only, the cell no longer holds the value the history recorded;
 * - `'missing'`: undo/redo only, the row is gone.
 * @since v3.4
 */
export type GridEditSkipReason = 'notEditable' | 'invalidValue' | 'changed' | 'missing';

/** What a batch edit (paste, range clear, undo, redo) did. @since v3.4 */
export interface GridBatchEditResult {
  /** Rows whose `processRowUpdate` succeeded and that were stored, in the order they were first touched. */
  updated: GridRowId[];
  /** Rows whose `valueSetter` or `processRowUpdate` threw or rejected (also reported to `onProcessRowUpdateError`). */
  failed: { id: GridRowId; error: unknown }[];
  /** Cells that were not written, with the reason. */
  skipped: { id: GridRowId; field: string; reason: GridEditSkipReason }[];
}

/** `onClipboardPaste` details: the batch edit result plus the text that was pasted. @since v3.4 */
export interface GridClipboardPasteResult extends GridBatchEditResult {
  text: string;
}

/** `onBeforeClipboardPaste` params. @since v3.4 */
export interface GridBeforeClipboardPasteParams {
  /** The clipboard text (`text/plain`). */
  text: string;
  /** The cell the paste starts from (the range's top-left cell, or the focused cell). */
  anchor: GridCellCoordinates | null;
}

/** `onHistoryChange` params. @since v3.4 */
export interface GridHistoryChangeParams {
  canUndo: boolean;
  canRedo: boolean;
  /** Number of actions that can be undone. */
  size: number;
}

/** `undoRedo` options. @since v3.4 */
export interface GridUndoRedoOptions {
  /** How many actions are kept; the oldest is dropped beyond it. Default: 100. */
  limit?: number;
}
