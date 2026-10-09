# Fill Handle

With [`cellSelection`](cell-selection.md) on, the selected range has a small square on its bottom-right corner: the **fill handle** (v3.5). Drag it down, up, right or left to fill the next cells from the range, as in Excel. **Ctrl/Cmd+D** and **Ctrl/Cmd+R** fill from the keyboard. Every fill is written like a paste, through `valueSetter` and `processRowUpdate`, and is one [undo](undo-redo.md) step. Demo: **Fill Handle** (`/fill-handle`).

```tsx
import { DataGrid, type GridFillResult } from '@opencorestack/opengridx';

<DataGrid
  rows={rows}
  columns={columns}             // fills only write editable columns
  cellSelection                 // the fill handle comes with range selection
  undoRedo                      // optional: one fill = one undo step
  onFill={(result: GridFillResult) => console.log(result.direction, result.updated, result.skipped)}
  processRowUpdate={saveRow}    // called once per filled row
/>
```

## Dragging the handle

- The handle sits on the bottom-right cell of the range, or on the only selected cell. It is shown while at least one column is `editable` and no editor is open.
- Drag it beyond the range. The range grows in **one direction**: the side of the range the cell under the pointer lies beyond. When that cell lies beyond both a row edge and a column edge (a diagonal drag), the larger pointer movement wins.
- Past the edge of the grid the body auto-scrolls, as in a range drag, also over rows and columns that are not rendered yet.
- Release to fill. Releasing over the original range, pressing Escape or losing the pointer writes nothing and restores the range.
- Hold **Alt** while releasing to **copy** instead of continuing a series (Excel uses Ctrl for this, which the grid keeps for range shortcuts).
- The handle has a 24 px hit area and `touch-action: none`, so a touch drag on it fills instead of scrolling the grid.

After the fill, the range covers the source and the filled cells.

## What is written

Each line along the fill (each column for a fill down or up, each row for a fill right or left) is filled from its source cells, read towards the new cells:

| Source cells of the line | Fill |
| :--- | :--- |
| One cell | Copies the value |
| Two or more numbers with an exactly equal step | Continues the series: 2, 4, 6 → 8, 10. Decimals are rounded to the source's decimal places, so 0.1, 0.2 → 0.3, not 0.30000000000000004 |
| Two or more dates on the same day of the month, an equal number of months apart | Continues by months: 15 Jan, 15 Feb → 15 Mar. The day is clamped to the month's end (31 Jan, 31 Mar → 31 May; 31 Dec, 31 Jan → 28 Feb) |
| Two or more dates at the same time of day, an equal number of days apart | Continues by days: Mon 5 Oct, Tue 6 Oct → Wed 7 Oct (calendar days, so a daylight-saving change does not break it) |
| Anything else (text, booleans, unequal steps, mixed types, empty cells) | Repeats the source pattern: A, B → A, B, A |

Filling up or left reads the source in that direction: 7, 9 filled up gives 5, 3.

Values are typed already, so `valueParser` is not involved: a number copied into a text column stays a number. Synthetic rows (group headers, subtotals, tree auto-parents) in the source are left out of the series.

### `GridColDef.fillValue`

A column can decide what a fill writes into its cells:

```ts
{
  field: 'amount', type: 'number', editable: true,
  // params.value is what the grid would write; return it to keep it.
  fillValue: ({ value, sourceValues, index, direction, copy, row, id }) =>
    typeof value === 'number' ? Math.max(0, Math.round(value)) : value,
}
```

| Param | Description |
| :--- | :--- |
| `value` | The grid's choice: the next value of the series, the repeated pattern or the copy |
| `sourceValues` | The line's source values in fill order (the value next to the first filled cell is last) |
| `index` | Position of the cell among the filled cells of its line, from 0 |
| `direction` | `'down'`, `'up'`, `'right'` or `'left'` |
| `copy` | `true` when Alt was held or the fill came from Ctrl/Cmd+D or Ctrl/Cmd+R |
| `row`, `id`, `field`, `colDef` | The cell being filled |

A `fillValue` that throws skips that cell with reason `'invalidValue'` (and warns once in development).

## Keyboard

While focus is on a cell of the grid and no editor is open:

| Key | Action |
| :--- | :--- |
| **Ctrl+D** (Cmd+D) | Copies the range's top row into the rows below it |
| **Ctrl+R** (Cmd+R) | Copies the range's left column into the columns right of it |

The grid takes these keys (`preventDefault`, so no bookmark dialog or page reload) whenever a range or focused cell exists, `cellSelection` is on and `disableFillHandle` is not set. A range of one row (Ctrl+D) or one column (Ctrl+R) has nothing to fill. Inside an editor or a text field you render in a cell, the keys keep their native meaning.

## How it writes

A fill is a batch edit, the same path as [paste](clipboard.md):

- `valueSetter` (when the column has one) builds each row, and `processRowUpdate` runs **once per row**; rows run in parallel, and a row that throws or rejects is reported to `onProcessRowUpdateError` without stopping the others.
- All rows that succeeded are stored in one update.
- With `undoRedo`, the whole fill is **one undo step**.
- Cells that cannot be written are skipped with a reason:

| Reason | Cell |
| :--- | :--- |
| `'notEditable'` | The column is not `editable`, `isCellEditable` returned false, the row is synthetic, or a span covers the cell |
| `'invalidValue'` | The column's `fillValue` threw |

`onFill` receives the result plus the direction:

```ts
interface GridFillResult extends GridBatchEditResult {
  direction: 'down' | 'up' | 'right' | 'left';
}
// { updated: [3, 4, 5], failed: [], skipped: [{ id: 3, field: 'owner', reason: 'notEditable' }], direction: 'down' }
```

## Opting out

`disableFillHandle` hides the handle and leaves Ctrl/Cmd+D and Ctrl/Cmd+R to the browser. A grid without `cellSelection` has no fill handle.

## Styling

| Hook | Description |
| :--- | :--- |
| `.ogx__cell-fill-handle` | The handle: a 24 × 24 px hit area in the corner of the cell (`cursor: crosshair`, `touch-action: none`). The visible square is its `::after` |
| `--ogx-fill-handle-color` | The square's colour. Defaults to the range border (`--ogx-range-border`); theme key `grid.fillHandleColor` |

```css
.my-grid { --ogx-fill-handle-color: #16a34a; }
.my-grid .ogx__cell-fill-handle::after { width: 9px; height: 9px; }
```

## API

| Member | Description |
| :--- | :--- |
| `disableFillHandle?: boolean` | Hides the handle and turns off Ctrl/Cmd+D and Ctrl/Cmd+R. Default `false` |
| `onFill?(result: GridFillResult)` | Fired after every fill |
| `GridColDef.fillValue?(params: GridFillValueParams): unknown` | Decides the value written into a cell of the column |
