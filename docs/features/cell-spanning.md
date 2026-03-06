# Cell Spanning - OpenGridX

## Overview

Cell spanning allows cells in the DataGrid to span across multiple columns (column spanning) or multiple rows (row spanning). This is useful for creating complex table layouts, summary rows, merged headers, and hierarchical data presentations.

## Features

- **Column Spanning**: Cells can span horizontally across multiple columns
- **Row Spanning**: Cells can span vertically across multiple rows
- **Dynamic Spanning**: Span values can be calculated dynamically based on cell data
- **Static Spanning**: Span values can be set as fixed numbers
- **Accessibility**: Automatic ARIA attributes (`aria-colspan`, `aria-rowspan`)
- **CSS Grid Integration**: Uses CSS Grid for proper layout

---

## ⚠️ Important: Feature Conflicts

When using `colSpan` or `rowSpan`, some other DataGrid features may not work as expected or may create a confusing grid layout. **To avoid layout issues and unexpected behavior, consider disabling the following features for any columns that use cell spanning:**

### Features to Disable

1. **Sorting** (`sortable: false`)
   - When rows are reordered by sorting, spanned cells may break visual continuity
   - Subtotal/summary rows with spanning should remain in fixed positions

2. **Filtering** (when implemented)
   - Hidden rows can cause spanned cells to appear disconnected or incomplete
   - Filtering may hide parts of a spanned cell group

3. **Column Reordering** (`disableReorder: true`)
   - Moving columns can break the spanning logic
   - Spanned cells depend on specific column order

4. **Column Hiding** (`hideable: false`)
   - Hiding columns within a span creates layout gaps and visual artifacts
   - The grid cannot properly render partial spans

5. **Column Pinning** (avoid pinning spanned columns)
   - Pinned columns with spanning can cause rendering conflicts
   - Spanning across pinned and non-pinned columns is not supported

### Recommended Configuration

```tsx
const columns: GridColDef<Row>[] = [
    {
        field: 'summary',
        headerName: 'Summary',
        width: 200,
        colSpan: (params) => params.row.isTotal ? 3 : 1,
        // Disable conflicting features
        sortable: false,        // ✅ Disable sorting
        hideable: false,        // ✅ Disable column hiding
        disableReorder: true,   // ✅ Disable column reordering
        // Note: Avoid pinning this column
        renderCell: (params) => {
            if (params.row.isTotal) {
                return <strong>Total: {params.value}</strong>;
            }
            return params.value;
        }
    },
    // Other columns...
];
```

### Why These Limitations Exist

Cell spanning fundamentally changes the grid's layout model:
- **Sorting/Filtering** change row order/visibility, breaking span relationships
- **Column operations** (reorder/hide/pin) modify the column structure that spans depend on
- **CSS Grid** requires stable column positions for proper spanning

**Best Practice**: Use cell spanning primarily for static summary rows, headers, or fixed layout sections where these features are not needed.

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
            return params.value;
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
const columns: GridColDef<Row>[] = [
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
const columns: GridColDef<Row>[] = [
    {
        field: 'category',
        headerName: 'Category',
        width: 150,
        // Dynamic row span based on data
        rowSpan: (params) => {
            // Calculate how many rows this category spans
            const categoryRows = rows.filter(
                r => r.category === params.row.category
            );
            return categoryRows.length;
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

You can use both `colSpan` and `rowSpan` together:

```tsx
const columns: GridColDef<Row>[] = [
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
                        {params.value}
                    </div>
                );
            }
            return params.value;
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
                return params.value;
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
            valueFormatter: ({ value }) => `$${value.toLocaleString()}`
        },
        {
            field: 'q2',
            headerName: 'Q2',
            width: 120,
            type: 'number',
            valueFormatter: ({ value }) => `$${value.toLocaleString()}`
        },
        {
            field: 'q3',
            headerName: 'Q3',
            width: 120,
            type: 'number',
            valueFormatter: ({ value }) => `$${value.toLocaleString()}`
        },
        {
            field: 'q4',
            headerName: 'Q4',
            width: 120,
            type: 'number',
            valueFormatter: ({ value }) => `$${value.toLocaleString()}`
        },
        {
            field: 'total',
            headerName: 'Total',
            width: 140,
            type: 'number',
            valueFormatter: ({ value }) => value ? `$${value.toLocaleString()}` : ''
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
rowSpan: (params) => params.row.categorySize || 1
```

### GridRenderCellParams

Parameters passed to the `colSpan` and `rowSpan` functions:

```tsx
interface GridRenderCellParams<R> {
    value: any;           // Cell value
    row: R;               // Complete row data
    field: string;        // Column field name
    colDef: GridColDef<R>; // Column definition
    rowIndex: number;     // Row index
    colIndex: number;     // Column index
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
                    {params.value}
                </div>
            );
        }
        return params.value;
    }
}
```

---

## Accessibility

The DataGrid automatically adds ARIA attributes for spanned cells:

- `aria-colspan`: Added when `colSpan > 1`
- `aria-rowspan`: Added when `rowSpan > 1`

This ensures screen readers properly announce the spanning behavior.

---

## Best Practices

1. **Use Dynamic Spanning**: Prefer dynamic spanning functions over static values for flexibility
2. **Combine with renderCell**: Always provide custom rendering for spanned cells to improve visual clarity
3. **Consider Performance**: Spanning calculations run on every render, so keep them lightweight
4. **Test with Virtualization**: Ensure spanning works correctly with virtual scrolling
5. **Accessibility**: Provide meaningful content in spanned cells for screen readers

---

## Limitations

### Feature Conflicts

**⚠️ See the [Feature Conflicts](#️-important-feature-conflicts) section above for important information about which features should be disabled when using cell spanning.**

### Technical Limitations

1. **Virtualization**: 
   - Row spanning may have visual artifacts with virtualization if spans cross virtual boundaries
   - Large row spans (>10 rows) may cause performance issues with virtual scrolling
   - Consider using row pinning for summary rows instead of row spanning

2. **Pinned Columns**: 
   - Column spanning with pinned columns requires careful consideration
   - Spanning across pinned and non-pinned columns is not supported
   - Use spanning only within pinned or non-pinned column groups

3. **Sorting/Filtering**: 
   - Spanned cells may break visual continuity when rows are reordered
   - Always disable sorting on columns with dynamic spanning
   - Filtering can hide parts of spanned cell groups

4. **Column Operations**:
   - Column reordering can break spanning logic
   - Hiding columns within a span creates layout gaps
   - Column resizing may not work optimally with spanned cells

5. **Editing**:
   - Cell editing on spanned cells may have unexpected behavior
   - Consider disabling editing for columns with spanning

### Workarounds

- **For Summary Rows**: Use [Row Pinning](./pinning.md) with pinned bottom rows instead of row spanning
- **For Headers**: Consider using column grouping instead of cell spanning
- **For Hierarchical Data**: Use [Tree Data](./tree-data-grouping.md) instead of row spanning

---

## Browser Support

Cell spanning uses CSS Grid, which is supported in:
- Chrome 57+
- Firefox 52+
- Safari 10.1+
- Edge 16+

---

## See Also

- [Row Pinning](./pinning.md)
- [Column Pinning](./pinning.md)
- [Custom Cell Rendering](./cell.md)
- [Aggregation](./aggregation-pivot.md)
