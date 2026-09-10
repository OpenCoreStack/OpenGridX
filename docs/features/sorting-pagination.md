# 🔢 Sorting & Pagination

Efficiently naviagte and organize through large datasets using OpenGridX's sorting and pagination engines.

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

- Clicking (or shift-clicking) an already-sorted column cycles its direction: `asc → desc → removed`.
- A plain click *without* `multiSort` and without Shift always resets to a single-key sort on that column.
- Set `sortable: false` on a column to exclude it entirely.

```tsx
// Controlled multi-sort — set programmatically or drive from UI with multiSort:
<DataGrid
  multiSort
  sortModel={[
    { field: 'department', sort: 'asc' },
    { field: 'salary', sort: 'desc' },
  ]}
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

### Usage
```tsx
<DataGrid
  pagination
  paginationModel={{ page: 0, pageSize: 10 }}
  pageSizeOptions={[5, 10, 20, 50]}
/>
```

### Server-Side Pagination
When using `paginationMode="server"`, you must provide the `rowCount` and handle page changes in your `dataSource`.

```tsx
<DataGrid
  pagination
  paginationMode="server"
  rowCount={1000} // Total rows on server
  onPaginationModelChange={(model) => fetchNextPage(model)}
/>
```

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `pagination` | `boolean` | `false` | Enable/disable the pagination footer. |
| `paginationMode` | `'client' \| 'server' \| 'infinite'` | `'client'` | Location of the pagination logic. |
| `paginationModel` | `GridPaginationModel` | — | Controlled pagination state (`{ page, pageSize }`). |
| `onPaginationModelChange` | `(model: GridPaginationModel) => void` | — | Fired when page or page size changes. |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Options for the rows-per-page selector. |

---

## ⚡ Infinite Scrolling
For a more modern experience, use infinite scroll combined with virtualization.

1. Set `paginationMode="infinite"`.
2. Implement `onRowsScrollEnd` or use the `dataSource.getRows` method to fetch data as the user scrolls.

📖 **[Full Infinite Scroll Guide](docs/features/infinite-scroll.md)**
