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

// ❌ Bad: new array on every render → grid re-mounts
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

{ field: 'status', renderCell: (p) => <StatusBadge value={p.value} /> }

// ❌ Bad: inline object / new function reference every render
{ field: 'status', renderCell: (p) => <span style={{ color: 'red' }}>{p.value}</span> }
```

## Use fixed row heights when possible

Variable-height rows (detail panels, `getRowHeight`) require a full cumulative-height scan on mount. Fixed-height rows skip this scan.

```tsx
// Fixed height — fastest
<DataGrid rows={rows} columns={columns} rowHeight={48} />

// Variable height — necessary for detail panels, but adds cost
<DataGrid rows={rows} columns={columns} getDetailPanelHeight={() => 200} />
```

## Choose the right density

`density` overrides `rowHeight` with a CSS variable — no JS cost. Prefer it over a custom `rowHeight` when one of the three presets fits.

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

`autoHeight` disables row virtualization and renders all rows. Only use it when the dataset is small (< 100 rows).

## Use server-side operations for very large datasets

Client-side filtering, sorting, and pagination load the full dataset into JS. For 10 000+ rows, prefer server-side modes:

```tsx
<DataGrid
    rows={rows}
    columns={columns}
    filteringMode="server"
    sortingMode="server"
    paginationMode="server"
    onFilterModelChange={fetchFiltered}
    onSortModelChange={fetchSorted}
    onPaginationModelChange={fetchPage}
/>
```

Or use the `dataSource` prop with `useGridDataSource` for a unified data-fetching abstraction.

## Related

- [Virtualization](./features/virtualization.md)
- [Server-Side Data](./features/server-side.md)
- [Infinite Scroll](./features/sorting-pagination.md)
