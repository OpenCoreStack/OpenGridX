# `<Header />`

Manages the column headers, sorting triggers, column resizing, and column grouping rows.

## ⚙️ Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `columns` | `GridColDef[]` | Column definitions for the visible viewport. |
| `columnGroupingModel` | `GridColumnGroupingModel` | Hierarchy for multi-level header spanning. |
| `sortModel` | `GridSortModel` | Current sorting state for highlight and icons. |
| `onSort` | `(field, direction) => void` | Callback triggered when a header is clicked. |
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
- Sort Asc/Desc
- Pin Left/Right/None
- Hide Column
- Manage Columns (Open [Visibility Panel](column-visibility.md))
