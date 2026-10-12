import type { GridRowId } from './rows';
import type { GridApi } from './api';

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
