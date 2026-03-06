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
- Overscan buffer (default: 5 rows)

```tsx
// Example: 1000 rows, but only ~15 rendered at a time
<DataGrid
  rows={thousandRows}
  columns={columns}
  style={{ height: 600 }}
/>
```

**Performance characteristics:**
- ✅ Renders ~15-25 rows regardless of total dataset size
- ✅ Constant memory usage
- ✅ Smooth 60fps scrolling
- ✅ Supports millions of rows

### Column Virtualization

Currently, the DataGrid renders all columns. Column virtualization (rendering only visible columns) is planned for future releases.

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

The overscan buffer determines how many extra rows are rendered outside the viewport. A larger buffer provides smoother scrolling but uses more memory.

**Current implementation:**
- Default overscan: **5 rows** (above and below viewport)
- Total rendered rows: ~(viewport rows + 10)

**Trade-offs:**
- **Smaller overscan (1-3)**: Less memory, potential flickering during fast scrolling
- **Larger overscan (5-8)**: More memory, smoother fast scrolling
- **Very large overscan (10+)**: Diminishing returns, wasted rendering

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

Row grouping and tree data work seamlessly with virtualization:

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

**Note:** When groups are collapsed, only visible rows are rendered. Expanding a group dynamically adds rows to the render list.

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

1. **Column virtualization** - Not yet implemented (all columns are rendered)
2. **Dynamic row heights** - Requires full dataset scan for accurate scroll calculations
3. **Horizontal scrolling** - May show brief flicker with very wide grids

## Future Improvements

- [ ] Column virtualization for grids with 50+ columns
- [ ] Adaptive overscan based on scroll velocity
- [ ] Virtual scrollbar for extremely large datasets (millions of rows)
- [ ] Intersection Observer API for better scroll detection

## Comparison with MUI X DataGrid

| Feature | Aui DataGrid | MUI X DataGrid |
|---------|--------------|----------------|
| Row virtualization | ✅ Yes | ✅ Yes |
| Column virtualization | ❌ Planned | ✅ Yes (Pro) |
| Variable row heights | ✅ Yes | ✅ Yes |
| Overscan buffer | 5 rows | 3-8 rows (adaptive) |
| Max recommended rows | 100,000+ | 100,000+ |

## Related Documentation

- [Performance Best Practices](../performance.md)
- [Row Grouping](./tree-data-grouping.md)
- [Tree Data](./tree-data-grouping.md)
- [Detail Panel](./master-detail.md)
