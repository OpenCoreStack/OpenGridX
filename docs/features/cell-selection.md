# Cell Range Selection

*Since v3.3.0*

Users select a rectangle of cells the way they do in Excel or Google Sheets, by dragging, Shift+clicking or pressing Shift+arrow keys, and copy it with Ctrl/Cmd+C. An optional status bar shows the count, sum and average of the selection.

```tsx
import { DataGrid } from '@opencorestack/opengridx';

<DataGrid
  rows={rows}
  columns={columns}
  cellSelection
  showCellSelectionStats
  height={500}
/>
```

Everything is off unless `cellSelection` is set. Without it the grid behaves exactly as before.

## Gestures

| Input | Result |
| :--- | :--- |
| Click | Focus the cell. The range is that cell. A plain click still selects the row unless `disableRowSelectionOnClick` is set. |
| Press and drag | Range from the pressed cell to the cell under the pointer. Holding the pointer near or past an edge of the body scrolls the grid, over virtualized rows and columns. |
| Shift+click | Extend from the anchor (the active cell) to the clicked cell. |
| Shift+Arrow | Move the far corner (head) by one cell. It does **not** wrap to the next row, though plain arrows still do. |
| Shift+Home / Shift+End | Head to the first / last column of its row. |
| Ctrl+Shift+Home / End (Cmd on macOS) | Head to the first / last cell of the page. |
| Shift+PageUp / Shift+PageDown | Head one page up / down. |
| Ctrl/Cmd+A | Select every data cell on the page. The header checkbox still selects all rows. |
| Escape | Collapse the range to the anchor (when not editing). |
| Ctrl/Cmd+C | Copy the range as TSV. |
| Typing / Enter / F2 | Edit the anchor cell, as before. |

Drag and Shift ranges never change the **row** selection, and the checkbox column keeps selecting rows.

## The model

```ts
interface GridCellCoordinates { id: GridRowId; field: string }
interface GridCellRange { anchor: GridCellCoordinates; head: GridCellCoordinates }
type GridCellSelectionModel = readonly GridCellRange[];   // zero or one range in 3.3
type GridCellSelectionReason = 'pointer' | 'keyboard' | 'selectAll' | 'api' | 'clear' | 'dataChange';
```

- `anchor` is the active cell. It keeps DOM focus and it is where an edit starts. `head` is the corner that moves, and the one that is scrolled into view. A single focused cell is a range whose `anchor` equals its `head`. It is not drawn as a range, but it is what Ctrl+C copies.
- Corners are row **ids** and column **fields**, not indices. The rectangle is worked out from the current display order on every render, so after a sort or filter it follows the two corner rows (as Google Sheets does). If a corner's row or column is no longer displayed (filtered, on another page, removed or hidden), the range is cleared with `reason: 'dataChange'`.
- Controlled or uncontrolled, like the other models:

```tsx
const [model, setModel] = useState<GridCellSelectionModel>([]);

<DataGrid
  cellSelection
  cellSelectionModel={model}
  onCellSelectionModelChange={(next, { reason }) => setModel(next)}
/>
```

### Which cells take part

- **Columns:** only data columns, in screen order: left-pinned, then centre, then right-pinned. The checkbox, detail-panel, reorder and grouping (`__group__`) columns never join a range, and clicking them works as before.
- **Rows:** pinned top and bottom rows take part in screen order. Group headers, subtotals, tree auto-parents and the pivot Grand Total are highlighted when they fall inside the rectangle, but they are **skipped by copy** and by `getSelectedCells()`.
- **Spans:** a range that touches part of a `colSpan` or `rowSpan` grows to cover the whole span, repeatedly until no span crosses its edge (as Excel does with merged cells). In a copy the span's value sits at its origin and the covered positions are empty.
- **Pages:** a range covers the rows of the current page.

## Copy

With `cellSelection` on, Ctrl/Cmd+C copies the range (the focused cell when nothing else is selected):

- values formatted the way the cells show them (`valueGetter`, then `valueFormatter`);
- tabs between columns, line breaks between rows, **no header line**, and fields quoted where Excel needs it;
- `exportable: false` columns are copied when they are in the range, because the user chose them on screen.

Row copy stays available through `apiRef.current.copySelectedRows()`, which still includes the header line. `disableClipboardCopy` turns the shortcut off for both. Above 100,000 cells a development warning suggests `exportToCsv` instead. Nothing is truncated.

## API

| Method | Description |
| :--- | :--- |
| `getCellSelectionModel()` | The current model (`[]` when `cellSelection` is off). |
| `setCellSelectionModel(model)` | Replace the model (only the first range is kept). Focus moves to its anchor. |
| `selectCellRange(anchor, head)` | Select the rectangle between two cells. |
| `clearCellSelection()` | Empty the selection (`reason: 'clear'`). |
| `getSelectedCells()` | `{ id, field, value }[]` of the range in display order, values read through `valueGetter`. Synthetic rows and span-covered positions are left out. |
| `copySelectedCells()` | Copy the range as TSV. Rejects when the clipboard write fails. |

The methods do nothing while `cellSelection` is off.

## Status bar

`showCellSelectionStats` adds a strip under the grid (above the pagination area). While more than one cell is selected it shows:

- **Count**: non-empty cells of data rows;
- **Sum** and **Average**: of the numeric cells. Both are hidden when there are none.

These use the shared aggregation functions. The strip keeps its height while one cell or none is selected, so the grid does not jump. Replace its content with `slots.cellSelectionStats`, which receives `GridCellSelectionStatsSlotProps` (`cellCount`, `rowCount`, `columnCount`, `count`, `numericCount`, `sum`, `average`, `apiRef`) plus `slotProps.cellSelectionStats`. The default component is exported as `CellSelectionStats`.

```tsx
function MyStats({ count, sum }: GridCellSelectionStatsSlotProps) {
  return <span>{count} cells, total {sum ?? 0}</span>;
}

<DataGrid cellSelection showCellSelectionStats slots={{ cellSelectionStats: MyStats }} />
```

## Styling

| Class / variable | Meaning |
| :--- | :--- |
| `ogx__cell--range` | Every cell in the range (tinted). |
| `ogx__cell--range-top` / `-bottom` / `-left` / `-right` | Edge cells. The outline is an inset `box-shadow`, so nothing moves. |
| `ogx--range-dragging` | On the grid root during a pointer drag (`user-select: none`). |
| `--ogx-range-background` | Range tint. Theme key `grid.rangeBackground`. |
| `--ogx-range-border` | Range outline. Theme key `grid.rangeBorder`. |
| `ogx__cell-fill-handle` | The fill handle on the range's bottom-right cell (v3.5, see [Fill Handle](fill-handle.md)). |
| `--ogx-fill-handle-color` | Fill handle colour; defaults to the range outline. Theme key `grid.fillHandleColor` (v3.5). |

All five built-in themes define both variables. A custom `DataGridThemeProvider` theme derives them from `colors.primary` unless it sets them.

## Accessibility

- Cells in the range have `aria-selected="true"`, and the grid is `aria-multiselectable`.
- DOM focus stays on the anchor. The grid stays a single Tab stop.
- After each change the polite live region announces the size, for example "12 cells selected, 3 rows by 4 columns", debounced to 300 ms. Translate it with `localeText.cellSelectionAnnouncement(cells, rows, columns)`.

## Fill handle (v3.5)

The range's bottom-right cell carries a fill handle: drag it to continue a series or repeat the range into the next cells, or press Ctrl/Cmd+D / Ctrl/Cmd+R. See [Fill Handle](fill-handle.md); `disableFillHandle` turns it off.

## Not in 3.3

Paste, Delete-to-clear and undo (added in 3.4), the fill handle (added in 3.5), several ranges at once (Ctrl+drag), touch selection (on touch a drag scrolls; the fill handle accepts touch drags) and ranges across pages.

See also: [Fill Handle](fill-handle.md), [Clipboard](clipboard.md), [Undo & Redo](undo-redo.md), [Keyboard Navigation](keyboard-navigation.md), [Theming](../customization/theming.md).
