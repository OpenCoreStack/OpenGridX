# 🔢 Sorting & Pagination

Efficiently navigate and organize through large datasets using OpenGridX's sorting and pagination engines.

---

## 🔼 Column Sorting

Sorting can be toggled by clicking column headers. It supports single-column and multi-column (Shift+Click) sorting.

### Props
| Prop | Type | Description |
| :--- | :--- | :--- |
| `sortingMode` | `'client' \| 'server'` | Whether to sort locally or on the server. |
| `sortModel` | `GridSortItem[]` | Controlled state of active sorts. |
| `onSortModelChange` | `(model) => void` | Callback triggered when sorting changes. |

### Multi-Column Sort

OpenGridX supports two modes of multi-column sorting:

**`multiSort` prop (single-click, recommended):** Pass `multiSort` to make every click append or cycle a column in the sort model rather than replacing it. No modifier key required.

```tsx
<DataGrid
  multiSort
  sortModel={sortModel}
  onSortModelChange={setSortModel}
  ...
/>
```

**Shift+Click (always available):** Even without `multiSort`, holding **Shift** while clicking a column header appends it to the active sort. This works in all grids regardless of the prop.

Each active sort column shows a numbered priority badge (`1`, `2`, `3`…) next to its arrow.

- Clicking (or shift-clicking) an already-sorted column cycles its direction: `asc → desc → removed`. The column keeps its priority while its direction changes; it is not moved to the end of the sort model.
- A plain click *without* `multiSort` and without Shift always resets to a single-key sort on that column.
- The column menu acts on that column only: **Unsort** removes just that key, and **Sort Ascending / Descending** on a column that is already sorted changes its direction in place. On a column that is not sorted yet it appends with `multiSort` and replaces the model without it, like a plain click.
- Set `sortable: false` on a column to exclude it entirely.

### How values are compared (client-side)

- Cells are read through the column's `valueGetter`, so computed columns sort by the value they display.
- `type: 'number'` columns compare numerically even when the data holds numeric strings (`'9'` sorts before `'10'`). `type: 'date'` columns parse date strings (`'YYYY-MM-DD'` is read as a local date) and compare chronologically.
- Strings use language-aware ordering (`Intl.Collator`): case is ignored, accented letters sort next to their base letter (`'Émile'` between `'Adam'` and `'Zoe'`), and digit runs compare by value (`'item9'` before `'item10'`).
- `null`, `undefined`, `NaN`, an Invalid Date and, in number / date columns, values that cannot be parsed are "empty": they sort last in ascending order and first in descending order.
- A column that mixes kinds of value (numbers and strings, say) is ordered by kind first — numbers, dates, booleans, strings — so the order does not depend on the input order.
- Ties keep the rows' original order.

### Custom comparator: `sortComparator` (v3.1.0+)

Give a column `sortComparator(v1, v2, params1, params2)` to replace the built-in comparison for that column. Return a negative number when `v1` sorts before `v2` **in ascending order**, a positive number when after, `0` when equal.

```tsx
const SIZE_ORDER: Record<string, number> = { S: 0, M: 1, L: 2, XL: 3 };

const columns: GridColDef<Product>[] = [
  {
    field: 'size',
    sortComparator: (a, b) => (SIZE_ORDER[String(a)] ?? 99) - (SIZE_ORDER[String(b)] ?? 99),
  },
];
```

- `v1` / `v2` are the cell values **after `valueGetter`** (the same values the built-in sort reads). `params1` / `params2` are `{ id, field, row, value }` (`GridSortCellParams`), for tie-breaking on other fields of the row.
- **The comparator sees every value, including `null` and `undefined`**, so you decide where empty values go. The built-in "empty values last in asc" rule does not apply to a column with a comparator. (Why: a custom order often has its own idea of "empty" — `'N/A'`, `0`, a sentinel — and hiding nulls from the comparator would make those impossible to place consistently with real nulls.)
- **Direction**: write the ascending order only. For `desc` the grid negates the result, so values the comparator puts last in asc (nulls, typically) come first in desc — the same as the built-in behaviour.
- **Multi-sort**: the comparator is one key in the chain; when it returns `0` the next sort key decides, then the original row order.
- **Row grouping**: sorting by the grouping column (or by the grouping/label column) orders the groups by their grouping value using the grouping column's comparator; for a group row, `params.row` is the synthetic group row. Leaf rows inside a group use the sorted column's comparator.
- **Tree data**: siblings are sorted with the comparator at every level. Auto-created parents (no row of their own) are compared by label with the built-in comparison.
- **Pivot**: sorting a pivot row-label column uses that source column's comparator on the label values.
- Everything that reuses the pipeline order uses it too: `apiRef.getAllFilteredRows()`, exports, clipboard.
- A comparator that throws, or returns `NaN`, reads as `0` (equal) with a one-time dev warning per column; the grid does not crash.
- **Ignored with `sortingMode="server"`**: the server sorts, the grid shows `rows` as given.

```tsx
// Controlled multi-sort — set programmatically or drive from UI with multiSort:
const [sortModel, setSortModel] = useState<GridSortItem[]>([
  { field: 'department', sort: 'asc' },
  { field: 'salary', sort: 'desc' },
]);

<DataGrid
  rows={rows}
  columns={columns}
  multiSort
  sortModel={sortModel}
  onSortModelChange={setSortModel}
/>
```

### Column-Specific Config
Disable sorting for specific columns in `GridColDef`:
```typescript
{ field: 'actions', sortable: false }
```

---

## 📄 Pagination

OpenGridX supports standard page-based pagination and infinite scrolling.

> **Pagination is ignored while row grouping is active.** When `rowGroupingModel` is non-empty the grid renders all groups in one scrollable, virtualized view and does not show the pager, even if `pagination` is set. A development-mode `console.warn` flags this combination. Give a grouped grid a bounded height so virtualization limits what renders; see [Virtualization](./virtualization.md#the-grid-needs-a-bounded-height).

### Usage
```tsx
// Uncontrolled: the grid keeps the page; initialState sets where it starts
<DataGrid
  rows={rows}
  columns={columns}
  pagination
  pageSizeOptions={[5, 10, 20, 50]}
  initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
/>

// Controlled: pass onPaginationModelChange too, or the pager cannot change page
const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
<DataGrid
  rows={rows}
  columns={columns}
  pagination
  paginationModel={paginationModel}
  onPaginationModelChange={setPaginationModel}
/>
```

The pager counts the rows being paged: the rows that pass the filter, excluding pinned rows (pinned rows show on every page).

Without `paginationModel` or `initialState.pagination`, the page size is 100 when `pageSizeOptions` offers it and otherwise the first option, so the rows-per-page select always matches the rows shown.

### When the rows shrink
If the current page ends up past the last page (new `rows`, a filter, collapsed tree nodes), the grid shows the last page and reports the corrected model through `onPaginationModelChange`, so Previous and Next continue from the page on screen. The correction waits until rows are present and nothing is loading, so a restored page (for example from `initialState.pagination`) survives an initially empty `rows` array. Under server pagination the server's `rowCount` decides; the grid does not clamp.

### Page sizes outside `pageSizeOptions`
When the page size in use is not one of `pageSizeOptions` (for example a controlled `paginationModel={{ page: 0, pageSize: 20 }}` with `pageSizeOptions={[10, 25, 50]}`), the rows-per-page select adds it as an extra option, so it shows the size actually used. A page size below 1 is treated as 1.

### Server-Side Pagination
With `paginationMode="server"` the grid does not slice rows: `rows` is the current page. There are two ways to supply it.

**Fetch the page yourself** — control `paginationModel`, pass the page's rows and the server total as `rowCount`. `rowCount` is read on every render, so update it when the total changes.

```tsx
const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
const { rows, total } = usePageQuery(paginationModel); // your data fetching

<DataGrid
  rows={rows}               // only the current page
  columns={columns}
  pagination
  paginationMode="server"
  rowCount={total}          // total rows on the server
  paginationModel={paginationModel}
  onPaginationModelChange={setPaginationModel}
/>
```

**Or use a `dataSource`** — the grid calls `getRows` with `startRow` / `endRow` and uses the response's `rowCount` as the total (the `rowCount` prop is only a fallback until the first response). See [Server-Side Data](./data-source.md).

`sortingMode="server"` and `filterMode="server"` work the same way: the grid fires `onSortModelChange` / `onFilterModelChange` and shows `rows` as given, without re-sorting or re-filtering them, with or without a `dataSource`.

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `pagination` | `boolean` | `false` | Enable/disable the pagination footer. |
| `paginationMode` | `'client' \| 'server' \| 'infinite'` | `'client'` | Location of the pagination logic. |
| `paginationModel` | `GridPaginationModel` | — | Controlled pagination state (`{ page, pageSize }`). |
| `onPaginationModelChange` | `(model: GridPaginationModel) => void` | — | Fired when page or page size changes. |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Options for the rows-per-page selector. The uncontrolled default page size is 100 when offered, else the first option. |
| `rowCount` | `number` | — | Server total for `paginationMode="server"` without a `dataSource` (with one, the response's `rowCount` is used). |

---

## ⚡ Infinite Scrolling
For a more modern experience, use infinite scroll combined with virtualization.

1. Set `paginationMode="infinite"` and pass a `dataSource`.
2. Advance `paginationModel.page` from `onRowsScrollEnd`; the grid requests the next rows from `dataSource.getRows` and appends them. The pager is not shown and rows are not sliced.

📖 **[Full Infinite Scroll Guide](./infinite-scroll.md)**
