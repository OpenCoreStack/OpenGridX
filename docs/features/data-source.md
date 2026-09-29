# 🌐 Server-Side Data Source

Connect OpenGridX to your backend API so the server does the sorting, filtering and paging.

---

## 📑 The `GridDataSource` Interface

The `dataSource` prop is the gateway to server-side operations. The grid calls `getRows` with a row range and the current sort, filter and aggregation models, and shows the rows it returns. Requests are page-based (see *Modes of Operation*), not driven by the scroll position.

### Implementation
```tsx
import { DataGrid, type GridDataSource } from '@opencorestack/opengridx';

const myDataSource: GridDataSource = {
  getRows: async (params) => {
    const { startRow, endRow, sortModel, filterModel } = params;
    
    const response = await fetch('/api/data', {
      method: 'POST',
      body: JSON.stringify({ startRow, endRow, sortModel, filterModel })
    });
    
    const data = await response.json();
    
    return {
      rows: data.items,
      rowCount: data.totalCount // the total, used by the pager with paginationMode="server"
    };
  }
};

<DataGrid
  rows={[]}
  columns={columns}
  dataSource={myDataSource}
  pagination
  paginationMode="server"
  sortingMode="server"
  filterMode="server"
/>
```

---

## ⚙️ Request Parameters (`GridGetRowsParams`)

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `startRow` | `number` | The starting index of the requested range. |
| `endRow` | `number` | The ending index (exclusive): return `rows.slice(startRow, endRow)`. `Number.MAX_SAFE_INTEGER` means "every row". |
| `sortModel` | `GridSortItem[]` | Current sorting configuration. |
| `filterModel` | `GridFilterModel` | Current filtering configuration. |
| `groupKeys` | `string[]` | Path of the parent whose children are requested (server-side tree data); empty for top-level rows. |
| `aggregationModel` | `GridAggregationModel \| undefined` | Current aggregation configuration, so the server can return `aggregationResults`. |

---

## 🔄 Modes of Operation

The grid calls `getRows` whenever a `dataSource` is set. Rapid changes are collapsed into one request (300 ms debounce); the loading state shows from the moment a request is scheduled. Rows are keyed with `getRowId`.

### 1. Client Pagination (default)
With `paginationMode="client"` (the default) the grid requests every row once (`startRow: 0`, `endRow: Number.MAX_SAFE_INTEGER`) and pages them itself. With `sortingMode="server"` or `filterMode="server"` a sort or filter change requests every row again with the new model; client-side sorts and filters, and page changes, never refetch.

### 2. Server-Side Pagination
Set `paginationMode="server"`. Each page change requests `[page * pageSize, (page + 1) * pageSize)` and the response replaces the rows. Return `rowCount` so the pager knows the total.

Row grouping turns pagination off (every group renders in one scrollable view). With `rowGroupingModel` set, a `paginationMode="server"` source is therefore asked for every row (`startRow: 0`, `endRow: Number.MAX_SAFE_INTEGER`) instead of the first page, and a development warning says so (v3.0+; before, only the first page was requested and the rest were unreachable).

### 3. Infinite Loading
Set `paginationMode="infinite"` and advance `paginationModel.page` (for example from `onRowsScrollEnd`). The grid requests the rows from the end of what is loaded up to the current page and appends them, so a page that moves on while a request is in flight never leaves a gap. See [Infinite Scroll](infinite-scroll.md).

### 4. Server-Side Tree Data
When `treeData` is enabled with a `dataSource`, top-level rows come from the normal request. A row with `serverChildrenCount > 0` shows an expand toggle; expanding it calls `getRows` with that row's path in `groupKeys` (and `startRow: 0`, `endRow: Number.MAX_SAFE_INTEGER`). Return that parent's children. With `filterMode="server"` / `sortingMode="server"` the returned rows are neither re-filtered nor re-sorted in the tree. When a refetch replaces the rows (page, sort, filter), the children of nodes that are still expanded are requested again. If a children request fails, the node collapses again and the error is logged; expanding it retries. (It does not show the grid-level error overlay.) `defaultGroupingExpansionDepth` counts a node with `serverChildrenCount > 0` as expandable, so the nodes within that depth (all of them with `-1`) start expanded and their children are requested right away (v3.0+; before, lazy nodes were never expanded by the default depth).

### When a refetch happens
Models are compared by content, so an inline `filterModel={{ items: [] }}` or a `dataSource={{ getRows }}` object recreated with the same `getRows` function does not refetch. A new `getRows` function does. A response for parameters that have changed in the meantime is discarded.

---

## 🛠️ Error Handling
If your API call fails, throw an error or return a rejected promise. OpenGridX shows the **Error Overlay** with the rejection's `message` (an `Error`, a string, or any object with a string `message`) and a **Retry** button that requests the rows again.

A response the grid cannot use fails the same way (v3.0+): a response without a `rows` array, or a `getRowId` that throws for a fetched row, shows the error overlay and ends the loading state, instead of an unhandled promise rejection and an endless "Loading". For a children request (server-side tree data) it collapses the node as a failed request does.

```typescript
getRows: async () => {
  try {
    return await apiCall();
  } catch (err) {
    throw new Error("Failed to connect to database");
  }
}
```
