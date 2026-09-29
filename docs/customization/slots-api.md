# Slots API Reference

The Slots API allows you to replace any built-in component in the DataGrid with your own custom implementation.

## Available Slots

Every slot is typed `React.ComponentType<Record<string, unknown>>`, and every `slotProps` entry is `Record<string, unknown>`. A slot component therefore takes `props: Record<string, unknown>` and narrows the props it uses; the examples below cast to a type alias describing the props the grid passes. (A component declared with its own required props, such as `(props: { page: number }) => …`, is rejected by TypeScript.) The props from `slotProps.<slot>` are spread last, so they can override the grid's props.

### 1. `toolbar`
Add a custom toolbar above the grid (commonly used for export buttons, filters, actions).

**Props received:**
```typescript
{
  apiRef: React.MutableRefObject<GridApi>;
  columns: GridColDef[];                 // every column in display order, hidden ones included
  baseColumns: GridColDef[];             // the `columns` prop as passed
  aggregationModel: GridAggregationModel;
  onAggregationModelChange: (model: GridAggregationModel) => void;
  pivotModel?: GridPivotModel;           // only when pivotMode, pivotModel or onPivotModelChange is set
  onPivotModelChange?: (model: GridPivotModel) => void;
  filterModel: GridFilterModel;
  onFilterModelChange: (model: GridFilterModel) => void;
  columnVisibilityModel: GridColumnVisibilityModel;
  onColumnVisibilityModelChange: (model: GridColumnVisibilityModel) => void;
  onColumnReorder?: (fromField: string, toField: string) => void;  // undefined with disableColumnReorder
  onColumnOrderReset?: () => void;                                 // undefined with disableColumnReorder
  forceColumnsOpen: boolean;             // the column menu's "Manage columns" asked for the Columns panel
  onColumnsPanelClose: () => void;
  // ...plus any props from slotProps.toolbar
}
```

These match `GridToolbarProps`, so `slots={{ toolbar: GridToolbar }}` gives the built-in toolbar.

**Example:**
```tsx
import { DataGrid, exportToCsv, exportToExcel, type GridApi, type GridColDef } from '@opencorestack/opengridx';
import type { MutableRefObject } from 'react';

type ToolbarSlotProps = { apiRef: MutableRefObject<GridApi>; columns: GridColDef[] };

function CustomToolbar(props: Record<string, unknown>) {
  const { apiRef, columns } = props as ToolbarSlotProps;
  const exportRows = () => apiRef.current.getAllFilteredRows();
  return (
    <div style={{ padding: '12px', display: 'flex', gap: '8px' }}>
      <button type="button" onClick={() => exportToCsv(exportRows(), columns)}>
        Export CSV
      </button>
      <button type="button" onClick={() => exportToExcel(exportRows(), columns)}>
        Export Excel
      </button>
    </div>
  );
}

<DataGrid rows={rows} columns={columns} slots={{ toolbar: CustomToolbar }} />
```

`toolbar` accepts any React component type: function, class, `React.memo`, `forwardRef` or `lazy`. A plain function toolbar may be defined inline inside your own component: the grid keys it on its source code, so it keeps its state (open panels, typed search) when your component re-renders and remounts only when you pass a toolbar with different code. A class, memo or forwardRef toolbar is rendered as a normal element, so define it outside render to keep its identity stable.

### 2. `pagination`
Replace the default pagination component. It is rendered only while pagination is in effect (`pagination` set, no row grouping, `paginationMode` not `"infinite"`), is not rendered when a `footer` slot is set, and is used by list view too.

**Props received:**
```typescript
{
  page: number;                    // Current page (0-based), clamped to the last page client-side
  pageSize: number;                // Current page size
  rowCount: number;                // Rows being paged: filtered, unpinned rows; the server total in paginationMode="server"
  pageSizeOptions: number[];       // Available page sizes (default [10, 25, 50, 100])
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;   // also resets to page 0
  localeText?: Pick<GridLocaleText, 'paginationRowsPerPage' | 'paginationOf' | 'paginationPage'>;  // only when the localeText prop is set
  // ...plus any props from slotProps.pagination
}
```

**Example:**
```tsx
<DataGrid
  rows={rows}
  columns={columns}
  pagination
  slots={{ pagination: CustomPagination }}
  slotProps={{ pagination: { customProp: 'value' } }}
/>
```

### 3. `noRowsOverlay`
Replace the empty state shown when there are no rows.

**Props received:**
```typescript
{
  // Only the props from slotProps.noRowsOverlay
}
```

**Example:**
```tsx
function CustomNoRows() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h3>No data available</h3>
      <p>Try adjusting your filters</p>
    </div>
  );
}

<DataGrid
  rows={rows}
  columns={columns}
  slots={{ noRowsOverlay: CustomNoRows }}
/>
```

### 4. `loadingOverlay`
Replace the loading state overlay.

**Props received:**
```typescript
{
  // Only the props from slotProps.loadingOverlay
}
```

**Example:**
```tsx
function CustomLoader() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <Spin size="large" /> {/* Ant Design Spinner */}
      <p>Loading data...</p>
    </div>
  );
}

<DataGrid
  rows={rows}
  columns={columns}
  loading={isLoading}
  slots={{ loadingOverlay: CustomLoader }}
/>
```

### 5. `footer`
Replace the entire footer section below the grid, including the default pagination. Rendered whenever the slot is set, including while row grouping is active, except in list view.

**Props received** (`GridFooterSlotProps`, v3.0+):
```typescript
{
  apiRef: React.MutableRefObject<GridApi>;
  aggregationModel: GridAggregationModel;
  aggregationResult: GridAggregationResult | null;  // null when aggregationModel is empty, and in pivot mode
  rowCount: number;              // see below
  pagination: boolean;           // effective: false while row grouping is active or with paginationMode="infinite"
  paginationModel: GridPaginationModel;   // the model as held (not clamped to the last page)
  pageSizeOptions: number[];
  onPaginationModelChange: (model: GridPaginationModel) => void;
  // ...plus any props from slotProps.footer
}
```

`rowCount` is:
- with `paginationMode="server"`: the server total (the `dataSource` response's `rowCount`, else the `rowCount` prop, else the number of loaded rows);
- otherwise, in a flat grid: the pager's `rowCount`, the filtered rows **without** pinned rows (v3.0+; before, pinned rows were counted). With `filterMode="server"` it is every row the grid holds; with `paginationMode="infinite"` the rows loaded so far; in pivot mode the pivot rows including the Grand Total row;
- under row grouping and tree data: the data rows that pass the client filter (never group rows), whatever is expanded.

**Example — a persistent grand-total bar that stays in sync with filtering:**
```tsx
import type { GridFooterSlotProps } from '@opencorestack/opengridx';

// Type the props you read; the grid checks them against GridFooterSlotProps.
function TotalsFooter({ aggregationResult, rowCount }: Pick<GridFooterSlotProps, 'aggregationResult' | 'rowCount'>) {
  const total = aggregationResult?.amount;
  return (
    <div style={{ padding: '12px', borderTop: '1px solid #e0e0e0' }}>
      {rowCount} rows · Total: {typeof total === 'number' ? total.toLocaleString() : '—'}
    </div>
  );
}

<DataGrid
  rows={rows}
  columns={columns}
  aggregationModel={{ amount: 'sum' }}
  slots={{ footer: TotalsFooter }}
/>
```

> `noRowsOverlay`, `loadingOverlay` and `footer` were declared in the types before v2.1 but never rendered. They are wired from v2.1.

## Complete Example

```tsx
import { Select, Pagination, Spin, Empty } from 'antd';
import { DataGrid } from '@opencorestack/opengridx';

type PaginationSlotProps = {
  page: number;
  pageSize: number;
  rowCount: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

function AntdPagination(props: Record<string, unknown>) {
  const { page, pageSize, rowCount, pageSizeOptions, onPageChange, onPageSizeChange } =
    props as PaginationSlotProps;

  return (
    <div style={{ display: 'flex', gap: '16px', padding: '12px 16px', justifyContent: 'flex-end' }}>
      <Select
        value={pageSize}
        onChange={onPageSizeChange}
        options={pageSizeOptions.map(s => ({ value: s, label: s }))}
      />
      <Pagination
        current={page + 1}
        total={rowCount}
        pageSize={pageSize}
        onChange={(p) => onPageChange(p - 1)}
      />
    </div>
  );
}

function AntdNoRows() {
  return <Empty description="No data available" />;
}

function AntdLoader() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <Spin size="large" />
    </div>
  );
}

function MyApp() {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pagination
      loading={isLoading}
      slots={{
        pagination: AntdPagination,
        noRowsOverlay: AntdNoRows,
        loadingOverlay: AntdLoader
      }}
      slotProps={{
        pagination: {
          // Additional custom props if needed
        }
      }}
    />
  );
}
```

## TypeScript Support

The library exports no props type for the pagination, overlay or footer slots (the toolbar's props are `GridToolbarProps`). Declare a type alias for the props you read and narrow `Record<string, unknown>` to it, as above. Use a `type` alias rather than an `interface`: an interface has no index signature, so `props as MyInterface` needs `as unknown as`.

```typescript
type CustomPaginationProps = PaginationSlotProps & {
  customProp?: string; // from slotProps.pagination
};

function CustomPagination(props: Record<string, unknown>) {
  const { page, customProp } = props as CustomPaginationProps;
  // Your implementation
}
```

## Best Practices

1. **Maintain Functionality**: Ensure your custom component provides the same core functionality as the default.
2. **Accessibility**: Include proper ARIA labels and keyboard navigation.
3. **Responsive Design**: Make sure your component works on different screen sizes.
4. **Performance**: Avoid expensive operations in render; use memoization where appropriate.
5. **Consistent Styling**: Match your app's design system while maintaining usability.

## See Also

- [Custom Pagination Guide](../features/custom-pagination.md) - Detailed examples with Ant Design and MUI
- [DataGrid Props](../../lib/types/index.ts) - Full TypeScript definitions
