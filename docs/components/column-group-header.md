# Column Group Headers

Column group headers are spanning header cells above the regular column headers, so related columns can sit under a shared label (Year → Quarter → Metric). They are rendered by `<Header />` from the `columnGroupingModel` prop on `<DataGrid />`; there is no separate component to import or replace (the old internal `ColumnGroupHeader` component was removed in v3.0).

## 🛠️ Usage

Pass a `columnGroupingModel`. Each group lists column `field`s, or nested groups, in `children`:

```tsx
import { DataGrid } from '@opencorestack/opengridx';
import type { GridColDef, GridColumnGroupingModel } from '@opencorestack/opengridx';

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', width: 160 },
  { field: 'q1Sales', headerName: 'Sales', type: 'number' },
  { field: 'q1Target', headerName: 'Target', type: 'number' },
  { field: 'q2Sales', headerName: 'Sales', type: 'number' },
  { field: 'q2Target', headerName: 'Target', type: 'number' },
];

const columnGroupingModel: GridColumnGroupingModel = [
  {
    groupId: '2024',
    headerName: '2024 Performance',
    children: [
      { groupId: 'q1', headerName: 'Q1', children: ['q1Sales', 'q1Target'] },
      { groupId: 'q2', headerName: 'Q2', children: ['q2Sales', 'q2Target'], headerClassName: 'my-q2-header' },
    ],
  },
];

<DataGrid rows={rows} columns={columns} columnGroupingModel={columnGroupingModel} height={500} />
```

This renders two group rows (`2024 Performance`, then `Q1` / `Q2`) above the column header row: one group row per nesting level. `name` is not in any group, so it gets an empty filler cell in both group rows.

See [`GridColumnGroup`](../API_REFERENCE.md#️-column-group-headers) for the type.

---

## ⚙️ How it works

- **Order, visibility and pinning**: a group cell covers its visible member columns in their rendered order. When the members are not adjacent (because of reordering, hiding or a pinned-section boundary), the group renders one labelled cell per run of adjacent members. Group cells over pinned columns are sticky, so they stay above their columns on horizontal scroll.
- **Widths**: a group cell is exactly as wide as its member columns, including flex, `auto` and percentage widths and manual resizes.
- **Reordering**: header drag and the toolbar / Columns-panel reorder keep groups intact: a column can only be moved onto a column of the same innermost group, and an ungrouped column only onto another ungrouped column.
- **Accessibility**: group rows are `role="row"` with `aria-rowindex`; group cells are `role="columnheader"` with `aria-colspan` (visible member columns) and `aria-colindex`; filler cells are `aria-hidden`. The grid's `aria-rowcount` includes the group rows.

---

## 🎨 Styling

Group headers cannot be replaced through the `slots` API. Style them with CSS:

| Class | Element |
| :--- | :--- |
| `.ogx-col-group-row` | One group header row (one per nesting level). |
| `.ogx-col-group-cell` | Every cell in a group row. |
| `.ogx-col-group-cell--group` | A cell that shows a group label. |
| `.ogx-col-group-cell--filler` | An empty cell over columns that are not in a group at that level. |
| `.ogx-col-group-cell--pinned` | A cell over pinned columns (sticky), with `--pinned-left` or `--pinned-right`. |
| `.ogx-col-group-cell__label` | The label text inside a group cell. |

A group's `headerClassName` is added to its group cells, next to `ogx-col-group-cell` and `ogx-col-group-cell--group`:

```css
.ogx-col-group-cell--group {
  font-weight: 600;
}
.my-q2-header {
  background: #eef2ff;
}
```

## 📝 Best Practices
- **Logical Labels**: Use clear, concise labels for groups like `2024 Performance` or `Contact Info`.
- **Type-Based Grouping**: Align related data types (e.g., all currency fields under a `Finance` group) for better user comprehension.
- **Limit Depth**: More than 3-4 levels of nesting becomes hard to follow, especially on small screens.
