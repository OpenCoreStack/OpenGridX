# Cell Spanning - OpenGridX

## Overview

Cell spanning allows cells in the DataGrid to span across multiple columns (column spanning) or multiple rows (row spanning). This is useful for creating complex table layouts, summary rows, merged headers, and hierarchical data presentations.

## Features

- **Column Spanning**: Cells can span horizontally across multiple columns
- **Row Spanning**: Cells can span vertically across multiple rows
- **Dynamic Spanning**: Span values can be calculated dynamically based on cell data
- **Static Spanning**: Span values can be set as fixed numbers
- **Accessibility**: Automatic ARIA attributes (`aria-colspan`, `aria-rowspan`) and keyboard navigation that treats a merged area as one cell
- **Virtualization-aware**: A span stays rendered while any part of it is in view, horizontally and vertically
- **Zero cost when unused**: Nothing is computed unless a column declares `colSpan` or `rowSpan`

---

## How spans interact with other features

Spans are computed from the grid **as it is rendered**, so they follow the current column order, visibility, pinning, sorting, filtering and page:

| Feature | Behaviour |
| :--- | :--- |
| **Column visibility** | Hidden columns are skipped. `colSpan: 2` merges the origin with the next *visible* column, and the merged width and `aria-colspan` count visible columns only. |
| **Column order / reordering** | A span covers the columns that follow the origin in the current (rendered) order. |
| **Column pinning** | A span never crosses a pinned-section boundary: it is clamped to the end of the left-pinned, unpinned or right-pinned section its origin is in. |
| **Row pinning** | Spans are computed separately for the top-pinned rows, the scrolling rows and the bottom-pinned rows, and never reach from one into another. |
| **Sorting / filtering / pagination** | Spans are recomputed against the new row order, the filtered rows and the current page. `rowIndex` in the callback is the row's position in the rendered rows (top-pinned rows first). |
| **Master-detail** | A row span ends at a row whose detail panel is expanded, so the merged cell never covers the panel. |
| **Virtualization** | The render window is widened so a span is never cut: the row whose cell starts a visible row span, and the column that starts a visible column span, are always rendered. |
| **Column resizing, flex and percentage widths** | A merged cell is exactly as wide as the columns it covers, using their resolved widths. The origin column's own `minWidth` / `maxWidth` do not apply to the merged cell. Resizing never recomputes the spans. |
| **Keyboard navigation** | Arrow keys move over a merged area in one step and land on its origin cell; covered cells are never focused. While editing, Tab skips covered cells (outside edit mode Tab leaves the grid). |
| **Infinite scrolling** | The loading placeholder rows are never passed to `colSpan` / `rowSpan`. |
| **Row grouping, tree data, pivot** | Rows the grid made (group headers, subtotals, auto-created tree parents, the pivot Grand Total) are never a span origin, and a `rowSpan` ends before the next such row, so a span never merges data across a group boundary (v3.0+). |

Spans on columns whose values change with sorting still work, but the merged areas move with the rows. For summary rows that must stay in place, disable sorting on the spanning column (`sortable: false`) or use [Row Pinning](./pinning.md).

### Span values

The value returned (or set) for `colSpan` / `rowSpan` is normalised before it is used:

- Values larger than what is left are clamped: `colSpan` to the end of the origin's pinned section, `rowSpan` to the end of the row section (or to the first row with an expanded detail panel). `aria-colspan` / `aria-rowspan` show the clamped value.
- Fractions are rounded down (`1.7` → `1`).
- `Infinity` means "to the end" and is clamped like any other large value.
- `NaN`, `0`, negative numbers and non-numbers mean no span (`1`).

A `colSpan` or `rowSpan` function (or the `valueGetter` whose value it receives) that **throws** is treated as `1` for that cell, and a warning is logged in development. The rest of the grid keeps rendering.

---

## Column Spanning

### Basic Usage

```tsx
import { DataGrid, GridColDef } from '@opencorestack/opengridx';

interface Row {
    id: number;
    name: string;
    value: number;
    isTotal?: boolean;
}

const columns: GridColDef<Row>[] = [
    {
        field: 'name',
        headerName: 'Name',
        width: 200,
        // Static column span
        colSpan: 2  // This cell will span 2 columns
    },
    {
        field: 'value',
        headerName: 'Value',
        width: 150
    }
];
```

### Dynamic Column Spanning

```tsx
const columns: GridColDef<Row>[] = [
    {
        field: 'name',
        headerName: 'Name',
        width: 200,
        // Dynamic column span based on row data
        colSpan: (params) => {
            // Span across both columns for total rows
            if (params.row.isTotal) {
                return 2;
            }
            return 1;  // Normal span for regular rows
        },
        renderCell: (params) => {
            if (params.row.isTotal) {
                return <strong>Total: {params.row.name}</strong>;
            }
            return params.formattedValue;
        }
    },
    {
        field: 'value',
        headerName: 'Value',
        width: 150
    }
];
```

---

## Row Spanning

### Basic Usage

```tsx
interface ItemRow {
    id: number;
    category: string;
    item: string;
}

const columns: GridColDef<ItemRow>[] = [
    {
        field: 'category',
        headerName: 'Category',
        width: 150,
        // Static row span
        rowSpan: 3  // This cell will span 3 rows
    },
    {
        field: 'item',
        headerName: 'Item',
        width: 200
    }
];
```

### Dynamic Row Spanning

```tsx
// `rows: ItemRow[]` is the array passed to the grid, sorted by category.
const columns: GridColDef<ItemRow>[] = [
    {
        field: 'category',
        headerName: 'Category',
        width: 150,
        // Dynamic row span based on data
        rowSpan: (params) => {
            // Start a span at the first row of each category; the rest are covered by it
            const index = rows.findIndex(r => r.category === params.row.category);
            if (rows[index].id !== params.row.id) return 1;
            return rows.filter(r => r.category === params.row.category).length;
        }
    },
    {
        field: 'item',
        headerName: 'Item',
        width: 200
    }
];
```

---

## Combined Column and Row Spanning

You can use both `colSpan` and `rowSpan` together. The origin cell then covers the whole rectangle: with `colSpan: 3` and `rowSpan: 2`, the three cells in the next row are covered too.

- A cell covered by another cell's `colSpan` is not evaluated as a `rowSpan` origin in that row.
- A cell covered by a `rowSpan` from above is not evaluated as a `colSpan` origin.
- A `colSpan` stops before a cell that a `rowSpan` from a row above already covers.

```tsx
interface SectionRow {
    id: number;
    header: string;
    isHeader?: boolean;
}

const columns: GridColDef<SectionRow>[] = [
    {
        field: 'header',
        headerName: 'Header',
        width: 200,
        colSpan: (params) => params.row.isHeader ? 3 : 1,
        rowSpan: (params) => params.row.isHeader ? 2 : 1,
        renderCell: (params) => {
            if (params.row.isHeader) {
                return (
                    <div style={{ 
                        fontSize: '1.2em', 
                        fontWeight: 'bold',
                        textAlign: 'center',
                        padding: '20px'
                    }}>
                        {params.formattedValue}
                    </div>
                );
            }
            return params.formattedValue;
        }
    }
];
```

---

## Complete Example: Sales Report with Subtotals

```tsx
import { useState } from 'react';
import { DataGrid, GridColDef } from '@opencorestack/opengridx';

interface SalesData {
    id: number;
    region: string;
    product: string;
    q1: number;
    q2: number;
    q3: number;
    q4: number;
    total?: number;
    isSubtotal?: boolean;
    isGrandTotal?: boolean;
}

export default function SalesReport() {
    const [rows] = useState<SalesData[]>([
        // Regular rows
        { id: 1, region: 'North', product: 'Laptops', q1: 45000, q2: 52000, q3: 48000, q4: 55000 },
        { id: 2, region: 'North', product: 'Tablets', q1: 23000, q2: 28000, q3: 25000, q4: 30000 },
        
        // Subtotal row - Region column spans across Region and Product
        { 
            id: 3, 
            region: 'North', 
            product: '', 
            q1: 68000, 
            q2: 80000, 
            q3: 73000, 
            q4: 85000, 
            total: 306000,
            isSubtotal: true 
        },
        
        // Grand total row
        { 
            id: 4, 
            region: '', 
            product: '', 
            q1: 68000, 
            q2: 80000, 
            q3: 73000, 
            q4: 85000, 
            total: 306000,
            isGrandTotal: true 
        }
    ]);

    const columns: GridColDef<SalesData>[] = [
        {
            field: 'region',
            headerName: 'Region',
            width: 150,
            // Span across Region and Product columns for subtotal/total rows
            colSpan: (params) => {
                if (params.row.isSubtotal || params.row.isGrandTotal) {
                    return 2;
                }
                return 1;
            },
            renderCell: (params) => {
                if (params.row.isGrandTotal) {
                    return <strong style={{ fontSize: '1.1em' }}>Grand Total</strong>;
                }
                if (params.row.isSubtotal) {
                    return <em>{params.row.region} Subtotal</em>;
                }
                return params.formattedValue;
            }
        },
        {
            field: 'product',
            headerName: 'Product',
            width: 150
        },
        {
            field: 'q1',
            headerName: 'Q1',
            width: 120,
            type: 'number',
            valueFormatter: ({ value }) => `$${(value as number).toLocaleString()}`
        },
        {
            field: 'q2',
            headerName: 'Q2',
            width: 120,
            type: 'number',
            valueFormatter: ({ value }) => `$${(value as number).toLocaleString()}`
        },
        {
            field: 'q3',
            headerName: 'Q3',
            width: 120,
            type: 'number',
            valueFormatter: ({ value }) => `$${(value as number).toLocaleString()}`
        },
        {
            field: 'q4',
            headerName: 'Q4',
            width: 120,
            type: 'number',
            valueFormatter: ({ value }) => `$${(value as number).toLocaleString()}`
        },
        {
            field: 'total',
            headerName: 'Total',
            width: 140,
            type: 'number',
            valueFormatter: ({ value }) => (value == null ? '' : `$${(value as number).toLocaleString()}`)
        }
    ];

    return (
        <div style={{ height: 600, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                rowHeight={48}
                headerHeight={56}
            />
        </div>
    );
}
```

---

## API Reference

### GridColDef Properties

#### `colSpan`

Defines how many columns a cell should span.

**Type**: `number | ((params: GridRenderCellParams<R>) => number)`

**Default**: `undefined` (no spanning)

**Examples**:
```tsx
// Static spanning
colSpan: 2

// Dynamic spanning
colSpan: (params) => params.row.isTotal ? 3 : 1
```

#### `rowSpan`

Defines how many rows a cell should span.

**Type**: `number | ((params: GridRenderCellParams<R>) => number)`

**Default**: `undefined` (no spanning)

**Examples**:
```tsx
// Static spanning
rowSpan: 2

// Dynamic spanning
rowSpan: (params) => (params.row.categorySize as number | undefined) ?? 1
```

### GridRenderCellParams

Parameters passed to the `colSpan` and `rowSpan` functions:

```tsx
interface GridRenderCellParams<R> {
    value: unknown;        // Cell value: the valueGetter result when the column has one
    formattedValue?: string; // The valueFormatter result (or String(value)); render this, not `value`
    row: R;                // Complete row data
    field: string;         // Column field name
    colDef: GridColDef<R>; // Column definition
    rowIndex: number;      // Position among the rendered rows (top-pinned rows, then the current page, then bottom-pinned rows)
    colIndex: number;      // Position among the rendered data columns (left-pinned first); checkbox, detail-panel and reorder columns are not counted
    rowMeta?: GridRowMeta; // Hierarchy metadata under tree data / row grouping
}
```

---

## Styling Spanned Cells

Spanned cells can be styled using custom `renderCell`:

```tsx
{
    field: 'name',
    headerName: 'Name',
    colSpan: (params) => params.row.isHeader ? 3 : 1,
    renderCell: (params) => {
        if (params.row.isHeader) {
            return (
                <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#e3f2fd',
                    fontWeight: 'bold',
                    fontSize: '1.2em',
                    borderBottom: '2px solid #1976d2'
                }}>
                    {params.formattedValue}
                </div>
            );
        }
        return params.formattedValue;
    }
}
```

---

## Accessibility

The DataGrid automatically adds ARIA attributes for spanned cells:

- `aria-colspan`: Added when the (clamped) `colSpan > 1`
- `aria-rowspan`: Added when the (clamped) `rowSpan > 1`

Cells covered by a column span are not rendered. Cells covered by a row span render as empty `role="presentation"` placeholders that keep the column's slot. Keyboard focus always lands on the origin cell of a merged area.

---

## Best Practices

1. **Use Dynamic Spanning**: Prefer dynamic spanning functions over static values for flexibility
2. **Combine with renderCell**: Always provide custom rendering for spanned cells to improve visual clarity
3. **Consider Performance**: Span functions run once per cell of a spanning column whenever the rows or the column structure change (not on scroll or resize), so keep them lightweight
4. **Keep Row Spans Short**: While a long row span is on screen, every row from its origin down is rendered, so a 1,000-row span renders up to 1,000 rows
5. **Accessibility**: Provide meaningful content in spanned cells for screen readers

---

## Limitations

1. **Pinned columns**: A span cannot cover columns in two pinned sections. Put the columns a span should merge in the same section.
2. **Pinned rows**: A span cannot reach from a pinned row into the scrolling rows (or the other way).
3. **Long row spans**: The rows between a visible row span's origin and the viewport are rendered, so very long row spans cost DOM nodes. Consider [Row Grouping](./tree-data-grouping.md) for large vertical groups.
4. **Editing**: Double-click editing on a merged cell edits the origin cell's field.

### Workarounds

- **For Summary Rows**: Use [Row Pinning](./pinning.md) with pinned bottom rows instead of row spanning
- **For Headers**: Consider using column grouping instead of cell spanning
- **For Hierarchical Data**: Use [Tree Data](./tree-data-grouping.md) instead of row spanning

---

## See Also

- [Row Pinning](./pinning.md)
- [Column Pinning](./pinning.md)
- [Custom Cell Rendering](../components/cell.md)
- [Aggregation](./aggregation-pivot.md)
