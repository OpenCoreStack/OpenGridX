# `<Cell />`

The atomic unit of the grid. Handles rendering, formatting, editing, and selection states for a single data point.

## ⚙️ Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `value` | `any` | The raw value to display. |
| `row` | `GridRowModel` | The full row data object. |
| `colDef` | `GridColDef` | Configuration for the column. |
| `rowIndex` | `number` | 0-indexed position in the current view. |
| `isSelected` | `boolean` | Whether the parent row is selected. |
| `isFocused` | `boolean` | Whether the cell has keyboard focus. |
| `isEditable` | `boolean` | Enables inline editing for this cell. |
| `isEditing` | `boolean` | Whether the cell is currently in edit mode. |
| `width` | `number` | Calculated width including resizing and flex. |
| `pinnedPosition` | `'left' \| 'right' \| null` | Sticky positioning state. |

## 🧩 Modifiers & Classes

The `<Cell />` component applies various BEM classes for styling:
- `.ogx__cell--selected`: When the row is selected.
- `.ogx__cell--focused`: When focused via keyboard.
- `.ogx__cell--editing`: During active cell editing.
- `.ogx__cell--pinned-left`: Sticky to the left.
- `.ogx__cell--pinned-right`: Sticky to the right.

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
