# Virtualization

The DataGrid uses **row and column virtualization** to efficiently render large datasets by only rendering the rows and columns that are currently visible in the viewport, plus a small buffer (overscan) for smooth scrolling.

## Overview

Virtualization is a technique that dramatically improves performance when working with large datasets. Instead of rendering all rows in the DOM (which would be slow and memory-intensive), the grid only renders:

1. **Visible rows** - Rows currently in the viewport
2. **Overscan rows** - A buffer of rows above and below the viewport for smooth scrolling
3. **Pinned rows** - Rows that are always visible (top/bottom)

## How It Works

### Row Virtualization

The grid calculates which rows are visible based on:
- Current scroll position
- Viewport height
- Row height (fixed or variable)
- Overscan buffer (adaptive, minimum `overscanRowCount`, default 3 rows)

```tsx
// Example: 1000 rows, but only ~15 rendered at a time
<DataGrid
  rows={thousandRows}
  columns={columns}
  style={{ height: 600 }}
/>
```

**Performance characteristics** (when the grid has a bounded height — see below):
- ✅ Renders ~15-25 rows regardless of total dataset size
- ✅ Constant memory usage
- ✅ Smooth 60fps scrolling
- ✅ Supports millions of rows

### Column Virtualization

Unpinned columns are virtualized horizontally: only the columns in view plus 6 on each side are rendered, with spacer cells standing in for the rest. Pinned columns are always rendered.

### The grid needs a bounded height

Virtualization renders as many rows as fit in the grid's viewport. If the grid's container has no bounded height, the viewport grows to fit **every** row, so every row is rendered. Nothing errors; the grid just stops virtualizing.

The most common cause is a flex child that is missing `min-height: 0`. A flex item defaults to `min-height: auto`, which lets it grow to its content:

```tsx
// ❌ Grows to fit all rows — virtualization is effectively off
<div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
  <div style={{ flex: 1 }}>
    <DataGrid rows={rows} columns={columns} height="100%" />
  </div>
</div>

// ✅ Bounded — only visible rows render
<div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
  <div style={{ flex: 1, minHeight: 0 }}>
    <DataGrid rows={rows} columns={columns} height="100%" />
  </div>
</div>
```

`height="100%"` only helps if every ancestor up to a fixed-height element also has a definite height.

In development builds the grid logs a `console.warn` when it detects that it is rendering every row of a dataset larger than 200 rows because its viewport is unbounded.

Pagination can hide this problem, because a paginated grid only has one page of rows to render. Row grouping switches pagination off (see below), so an unbounded container that looked fine with pagination can freeze the tab once grouping is enabled.

## Configuration

### Row Height

The grid supports both fixed and variable row heights:

```tsx
// Fixed row height (default: 52px)
<DataGrid
  rows={rows}
  columns={columns}
  rowHeight={40}
/>
```

The `density` prop overrides `rowHeight` with preset values:

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  density="compact"      // 32px rows
  // density="standard"  // uses rowHeight (default 52px)
  // density="comfortable" // 72px rows
/>
```

### Auto Height

Disable virtualization for small datasets:

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  autoHeight
/>
```

⚠️ **Warning:** `autoHeight` disables row virtualization and renders all rows. Only use for small datasets (< 100 rows).

## Performance Optimization

### Overscan Buffer

The overscan buffer determines how many extra rows are rendered outside the viewport. The grid adapts this buffer automatically based on scroll velocity so fast scrolls never produce blank flashes.

**Adaptive algorithm (`useGridScrollSync`):**
- Scroll velocity (px/ms) is measured on every scroll event
- The overscan tier is chosen from the table below and applied immediately
- 200 ms after scrolling stops the buffer decays back to `overscanRowCount`

| Velocity (px/ms) | Overscan rows |
|---|---|
| < 0.5 | 3 |
| 0.5 – 3 | 5 |
| 3 – 15 | 12 |
| 15 – 40 | 20 |
| > 40 | 30 |

**Configuring the floor:**

```tsx
// Never render fewer than 5 rows outside the viewport
<DataGrid
  rows={rows}
  columns={columns}
  overscanRowCount={5}
/>
```

`overscanRowCount` (default `3`) sets the minimum — the adaptive algorithm always produces a value ≥ this floor.

**Trade-offs:**
- **Smaller floor (1-3)**: Less idle memory, relies on adaptive headroom for fast scrolls
- **Larger floor (5-8)**: Pre-renders more rows at rest, trades memory for smoother slow scrolls

### Scroll Performance

For optimal scroll performance:

1. **Use fixed row heights** when possible
2. **Avoid complex cell renderers** - Keep `renderCell` functions lightweight
3. **Memoize custom components** - Use `React.memo` for custom cell components
4. **Minimize re-renders** - Use stable column definitions

```tsx
// ✅ Good: Memoized columns
const columns = useMemo(() => [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 200 }
], []);

// ❌ Bad: New column array on every render
const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 200 }
];
```

## Detail Panel Considerations

When using detail panels, row heights become variable. The grid automatically:
- Calculates cumulative heights for each row
- Adjusts scroll calculations for expanded panels
- Maintains smooth scrolling

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  getDetailPanelContent={({ row }) => <DetailPanel row={row} />}
  getDetailPanelHeight={() => 200}
/>
```

## Virtualization with Grouping/Tree Data

Grouped and tree rows go through the same virtualizer as flat rows. Expanding a group of any size adds its rows to the virtual row list, not to the DOM: in a bounded container, expanding a 25,000-row group renders ~20 DOM rows (verified in Chromium by `DataGrid.virtualization.browser.test.tsx`).

```tsx
// Tree data with virtualization
<DataGrid
  rows={rows}
  columns={columns}
  treeData
  getTreeDataPath={(row) => row.path}
  defaultGroupingExpansionDepth={-1} // Expand all
/>
```

**Note:** `pagination` is ignored while `rowGroupingModel` is active, so a grouped grid relies entirely on virtualization to bound what it renders. Make sure its container has a bounded height. A development-mode warning is logged if `pagination` is passed together with `rowGroupingModel`.

## Debugging Virtualization

To see which rows are being rendered:

```tsx
// Add this to your column definition
{
  field: 'debug',
  headerName: 'Debug',
  renderCell: (params) => {
    console.log('Rendering row:', params.row.id);
    return params.row.id;
  }
}
```

You should see console logs only for visible rows + overscan buffer.

## Known Limitations

1. **Unbounded containers** - Virtualization needs a bounded viewport height (see above)
2. **Dynamic row heights** - Requires full dataset scan for accurate scroll calculations
3. **Horizontal scrolling** - May show brief flicker with very wide grids

## Future Improvements

- [x] Column virtualization (unpinned columns, 6-column overscan)
- [x] Adaptive overscan based on scroll velocity (`overscanRowCount` prop, v2.0.4)
- [ ] Virtual scrollbar for extremely large datasets (millions of rows)
- [ ] Intersection Observer API for better scroll detection

## Comparison with MUI X DataGrid

| Feature | OpenGridX | MUI X DataGrid |
|---------|--------------|----------------|
| Row virtualization | ✅ Yes | ✅ Yes |
| Column virtualization | ✅ Yes (unpinned columns) | ✅ Yes (Pro) |
| Variable row heights | ✅ Yes | ✅ Yes |
| Overscan buffer | 3–30 rows (adaptive, velocity-based) | 3-8 rows (adaptive) |
| Max recommended rows | 100,000+ | 100,000+ |

## Related Documentation

- [Performance Best Practices](../performance.md)
- [Row Grouping](./tree-data-grouping.md)
- [Tree Data](./tree-data-grouping.md)
- [Detail Panel](./master-detail.md)
