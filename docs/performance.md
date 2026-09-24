# Performance Best Practices

Tips for getting the most out of OpenGridX with large datasets.

## Stabilize column definitions

The most common cause of unnecessary re-renders is a new column array being created on every render.

```tsx
// ✅ Good: stable reference
const columns = useMemo<GridColDef[]>(() => [
    { field: 'id',   headerName: 'ID',   width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
], []);

// ❌ Bad: new array on every render → column layout is recomputed every render
const columns = [
    { field: 'id',   headerName: 'ID',   width: 70 },
    { field: 'name', headerName: 'Name', width: 200 },
];
```

The same applies to the `rows` prop — if you derive rows from server data, wrap the derivation in `useMemo`.

## Keep cell renderers lightweight

`renderCell` is called for every visible cell on every render. Expensive work inside it multiplies with overscan.

```tsx
// ✅ Good: memoized sub-component
const StatusBadge = React.memo(({ value }: { value: string }) => (
    <span className={`badge badge--${value}`}>{value}</span>
));

{ field: 'status', renderCell: (p) => <StatusBadge value={String(p.value)} /> }

// ❌ Bad: inline object / new function reference every render
{ field: 'status', renderCell: (p) => <span style={{ color: 'red' }}>{String(p.value)}</span> }
```

## Use fixed row heights when possible

Every row has the same height (`rowHeight` or the `density` preset); there is no per-row height callback. Expanded detail panels add their own height, which the grid folds into a cumulative-height table, so many expanded panels (and `'auto'` panels, which are measured after they render) cost more than plain rows.

```tsx
// Fixed height — fastest
<DataGrid rows={rows} columns={columns} rowHeight={48} />

// Variable height — necessary for detail panels, but adds cost
<DataGrid rows={rows} columns={columns} getDetailPanelHeight={() => 200} />
```

## Choose the right density

`density="compact"` and `density="comfortable"` replace `rowHeight` with a preset (32 px / 72 px, or the theme's `grid.rowHeightCompact` / `grid.rowHeightComfortable`); `density="standard"` uses `rowHeight`. Compact rows fit more rows in the viewport.

```tsx
<DataGrid density="compact" />      // 32 px rows — more rows in viewport
<DataGrid density="standard" />     // rowHeight (default 52 px)
<DataGrid density="comfortable" />  // 72 px rows
```

## Tune the overscan buffer

`overscanRowCount` (default `3`) is the minimum rows rendered outside the viewport. The grid raises it automatically based on scroll velocity. Raise the floor only if you still see blank flashes at the default.

```tsx
// Raise the floor for very fast scrolling environments
<DataGrid overscanRowCount={8} rows={rows} columns={columns} />
```

See [Virtualization](./features/virtualization.md) for the full adaptive-overscan details.

## Avoid `autoHeight` on large datasets

`autoHeight` sizes the grid to all of its rows, so every row is rendered. Only use it when the dataset is small (< 100 rows), or together with `pagination`.

## Give the grid a bounded height, and import the stylesheet

Virtualization only works when the viewport has a fixed height: pass `height`, or put the grid in a container with a definite height (a flex child needs `min-height: 0`). In an unbounded container the viewport grows to fit every row and every row is rendered; a dev-mode warning reports this.

The same happens when the stylesheet is missing, because the viewport's `overflow: auto` comes from it (a dev-mode warning reports a missing stylesheet too). Import it once in your app:

```tsx
import '@opencorestack/opengridx/styles';
```

## Know the browser's height limit

The grid sizes its scroll content to `rowCount × rowHeight` pixels and does not scale scroll positions. Browsers cap an element's height (Chromium at 33,554,432 px, Firefox lower), so at the default 52 px row height rows past roughly 645,000 cannot be scrolled to. A dev-mode warning reports it. For more rows, use pagination, `paginationMode="server"` or infinite scroll with a `dataSource`.

## Use server-side operations for very large datasets

Client-side filtering, sorting, and pagination load the full dataset into JS. For very large datasets, prefer server-side modes. The simplest way is a `dataSource`: the grid calls `getRows` with the page range, sort model and filter model, and shows the response (see [Server-Side Data](./features/data-source.md)).

Without a `dataSource`, fetch the rows yourself from the change callbacks and control the models:

```tsx
<DataGrid
    rows={pageRows}            // the current page, already filtered and sorted by the server
    columns={columns}
    filterMode="server"
    sortingMode="server"
    pagination
    paginationMode="server"
    rowCount={totalRows}       // server total
    paginationModel={paginationModel}
    onPaginationModelChange={setPaginationModel}   // refetch in an effect on these models
    sortModel={sortModel}
    onSortModelChange={setSortModel}
    filterModel={filterModel}
    onFilterModelChange={setFilterModel}
/>
```

In server modes the grid shows `rows` as given: it does not re-filter, re-sort or slice them (v3.0+; earlier versions did unless a `dataSource` was set).


## Related

- [Virtualization](./features/virtualization.md)
- [Server-Side Data](./features/data-source.md)
- [Sorting & Pagination](./features/sorting-pagination.md)
- [Infinite Scroll](./features/infinite-scroll.md)
