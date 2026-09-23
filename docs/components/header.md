# `<Header />`

Manages the column headers, sorting triggers, column resizing, and column grouping rows.

## ⚙️ Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `columns` | `GridColDef[]` | Column definitions for the visible viewport. |
| `columnGroupingModel` | `GridColumnGroupingModel` | Hierarchy for multi-level header spanning. |
| `sortModel` | `GridSortModel` | Current sorting state for highlight and icons. |
| `onSort` | `(field, direction) => void` | Callback triggered on a plain click — replaces the sort model with a single key. |
| `onSortAdd` | `(field, direction) => void` | Callback triggered on Shift+click or when `multiSort` is active — appends/cycles the key without replacing others (an existing key keeps its priority). Also used by the column menu for **Unsort** and for a direction change on an already-sorted column. |
| `multiSort` | `boolean` | When `true`, every click routes to `onSortAdd` instead of `onSort`. Wired from the `multiSort` prop on `<DataGrid>`. |
| `onColumnResize` | `Function` | Callback for manual column width changes. |
| `pinnedColumns` | `GridColumnPinning` | Coordinates sticky positioning for headers. |
| `checkboxSelection` | `boolean` | Renders the "Select All" checkbox. |

## 📐 Column Grouping

The `<Header />` dynamically calculates the nesting depth of your `columnGroupingModel` and renders additional [Column Group Headers](column-group-header.md) above the main column headers.

```tsx
const columnGroupingModel = [
  {
    groupId: 'internal',
    headerName: 'Internal Details',
    children: ['id', 'path'],
  }
];
```

## 🖱️ Column Menu & Resizing

Unless `disableColumnMenu` is set to `true` in a column's `GridColDef`, each header cell renders a menu icon. In addition, the header facilitates manual [Column Resizing](column-resize.md).

Clicking the menu icon opens a popover with actions to:
- Sort Asc/Desc/Unsort (acts on that column only; other sort keys are kept)
- Pin Left/Right/None (left out for columns with `pinnable: false`)
- Hide Column (left out for columns with `hideable: false`)
- Manage Columns (opens the toolbar's Columns panel when `slots.toolbar` renders `GridToolbar`, otherwise the standalone [Visibility Panel](column-visibility.md))
