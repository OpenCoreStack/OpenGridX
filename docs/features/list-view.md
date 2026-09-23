# 📱 List View

Switch from a multi-column grid to a single-column detailed list. Perfect for mobile responsiveness or card-based layouts.

---

## 🏗️ Usage

Enable List View by passing the `listView` prop. You must also provide a `listViewColumn` object which defines how each "Card" should be rendered. Without `listViewColumn` the grid view is shown instead and a dev warning is logged.

List view honours `loading`, `slots.loadingOverlay`, `slots.noRowsOverlay` and `slots.footer` like the grid view: while loading it shows a progress bar (or your loading overlay) rather than the empty state, and `slots.footer` replaces its pagination controls.

```tsx
const listColDef: GridListViewColDef<Employee> = {
  field: 'card',
  renderCell: (params) => <MyEmployeeCard row={params.row} />
};

<DataGrid
  listView={true}
  listViewColumn={listColDef}
  rows={rows}
  columns={columns} // Fallback columns for standard grid view
/>
```

---

## 🎨 Styling

When `listView` is active:
- **Header is Hidden**: The standard column header row disappears.
- **Full Width**: The row container becomes a vertical stack where the `renderCell` output takes 100% of the available width.
- **Card Containers**: Each row maintains its standard selection and hover behaviors, but visually acts as a card.

### Custom Card Rendering
The `renderCell` function in `listViewColumn` receives all standard `GridRenderCellParams`, allowing you to build rich, complex UIs for each item:

| Param | Value |
| :--- | :--- |
| `row` | The consumer's row object. |
| `field` | `listViewColumn.field`. |
| `value` | The cell value for that field: the grid column with the same `field` reads it through its `valueGetter`; otherwise `row[field]` (so a synthetic field such as `'card'` gives `undefined`). |
| `formattedValue` | That column's `valueFormatter` result, or `String(value)` (`''` for null/undefined). |
| `colDef` | The grid column with the same `field`, or `listViewColumn` itself. |
| `rowMeta` | Tree-data / row-grouping metadata (`treeDepth`, `hasChildren`, …), `undefined` for flat rows. |
| `rowIndex` | Index of the row among the rendered rows (pinned rows first). |

`renderCell` only ever receives real rows: while an infinite-scroll page loads, no placeholder rows are passed to it.

```tsx
function MyEmployeeCard({ row }) {
  return (
    <div className="employee-card">
       <Avatar src={row.avatar} />
       <div className="info">
          <h3>{row.name}</h3>
          <p>{row.role}</p>
       </div>
       <div className="status">{row.status}</div>
    </div>
  );
}
```

---

## 📄 Pagination and infinite scroll

List view pages exactly like the grid view: with `pagination`, one page of the (unpinned) rows is shown between any pinned rows, also under tree data. The summary line above the list reads `N items · page X of Y`, where under server pagination (`paginationMode="server"` with a `dataSource`) `N` and the page count come from the server's `rowCount`.

`onRowsScrollEnd` fires when the list is scrolled to within 100px of its bottom, as it does for the grid viewport, so the [infinite scroll](./infinite-scroll.md) pattern works in list view too.

## ♿ Accessibility

The list is a `role="grid"` whose rows carry an `aria-rowindex` over the whole data set (row 11 on the second page of 10) and whose `aria-rowcount` is the total number of rows. There is no header row in list view. Tree-data and grouped rows also carry `aria-level` and, for parents, `aria-expanded`; they are indented by depth, and parents show a chevron that expands or collapses them on click (the chevron is not a Tab stop).

### Keyboard (v3.0)

Rows are focusable with a roving tab stop:

| Key | Action |
| :--- | :--- |
| **Tab** | The list is one Tab stop: it lands on the last focused row (the first row at first). Row checkboxes are not separate Tab stops. |
| **ArrowDown** / **ArrowUp** | Next / previous row. |
| **Home** / **End** | First / last row. |
| **PageDown** / **PageUp** | Ten rows down / up. |
| **Enter** / **Space** | A row with children (tree-data parent, group row): expand or collapse it. Any other row: same as clicking it (`onRowClick`, and click selection unless `disableRowSelectionOnClick`). |
| **Alt+ArrowRight** / **Alt+ArrowLeft** | Expand / collapse the focused parent row. |
| **Shift+Space** | Select or deselect the focused row, when rows can be selected. |

Keys pressed in content your `renderCell` puts in a row (inputs, buttons) are left to that content.

---

## 📱 Responsive Toggle

A common pattern is to toggle List View based on screen width:

```tsx
const isMobile = window.innerWidth < 768;

<DataGrid
  listView={isMobile}
  // ...
/>
```
