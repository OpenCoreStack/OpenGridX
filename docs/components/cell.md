# `<Cell />`

The atomic unit of the grid. Handles rendering, formatting, editing, and selection states for a single data point.

## ⚙️ Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `value` | `any` | The raw value to display. |
| `row` | `GridRowModel` | The full row data object. |
| `colDef` | `GridColDef` | Configuration for the column. |
| `rowIndex` | `number` | 0-indexed position in the current view. |
| `colIndex` | `number` | 0-indexed position of the column among the visible data columns in render order (system columns excluded). Passed to `renderCell`, `cellClassName`, `onCellClick` and `isCellEditable`. |
| `ariaColIndex` | `number` | 1-based `aria-colindex`, system columns included. Defaults to `colIndex + 1`. |
| `isSelected` | `boolean` | Whether the parent row is selected. |
| `isFocused` | `boolean` | Whether the cell is the grid's focus position (drives `.ogx__cell--focused`). Since v3.0 the cell does not move DOM focus onto itself; the grid does, and only while it owns focus. |
| `isEditable` | `boolean` | Whether this cell may enter edit mode. `<Row />` resolves it per cell from `colDef.editable`, the row (synthetic group rows are never editable) and `isCellEditable`; it also drives `aria-readonly`. |
| `isEditing` | `boolean` | Whether the cell is currently in edit mode. While editing, clicks and double-clicks inside the cell belong to the editor and are not handled as cell clicks. |
| `onEditStop` | `(cancel?: boolean, field?: string) => void` | Ends this cell's edit (commit, or discard when `cancel` is true). The cell passes its own `field` so a late call cannot end another cell's edit. Also called (commit) when the cell unmounts while editing. |
| `width` | `number` | Calculated width including resizing and flex. |
| `pinnedPosition` | `'left' \| 'right' \| null` | Sticky positioning state. |

## 🧩 Modifiers & Classes

The `<Cell />` component applies various BEM classes for styling:
- `.ogx__cell--selected`: When the row is selected.
- `.ogx__cell--focused`: When focused via keyboard.
- `.ogx__cell--editing`: During active cell editing.
- `.ogx__cell--pinned-left`: Sticky to the left.
- `.ogx__cell--pinned-right`: Sticky to the right.
- `.ogx__cell-image`: The default `<img>` of a `type: 'image'` column without `renderCell`.

## 🛠️ Custom Rendering

Use the `renderCell` property in your `GridColDef` to override the default content:

```tsx
const columns: GridColDef[] = [
  {
    field: 'status',
    renderCell: (params) => (
      <Tag color={params.value === 'active' ? 'green' : 'red'}>
        {params.value}
      </Tag>
    )
  }
];
```

## 🛡️ Error containment

Custom `renderCell` and `renderEditCell` callbacks are wrapped in a `CellErrorBoundary`. If a renderCell throws during render, that single cell shows a `⚠` indicator (CSS class `ogx__cell-error`, `role="img"` with an `aria-label`) with the error message as a tooltip. The rest of the grid continues rendering normally.

The cell renders again (and the indicator clears if the renderer now succeeds) when the row object, the column's `renderCell` function or the cell value changes, so passing fixed columns recovers without replacing every row (v3.0).

A column's `valueGetter` or `valueFormatter` that throws for a row is contained the same way: that cell shows the `⚠` indicator and the rest of the grid renders. On synthetic rows (row-grouping group and subtotal rows, auto-created tree parents) `valueGetter` is not called (the row already holds its grouping value and aggregates under the column's field), and `valueFormatter` is only called for the values the row holds, not for its empty cells.

To style the error indicator:

```css
.ogx__cell-error {
  color: red; /* override the default */
}
```
