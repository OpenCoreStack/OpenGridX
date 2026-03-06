# Slots API Reference

The Slots API allows you to replace any built-in component in the DataGrid with your own custom implementation.

## Available Slots

### 1. `toolbar`
Add a custom toolbar above the grid (commonly used for export buttons, filters, actions).

**Props received:**
```typescript
{
  // Any props from slotProps.toolbar
}
```

**Example:**
```tsx
import { exportToCsv, exportToExcel } from '@opencorestack/opengridx';

function CustomToolbar({ rows, columns }) {
  return (
    <div style={{ padding: '12px', display: 'flex', gap: '8px' }}>
      <button onClick={() => exportToCsv(rows, columns)}>
        Export CSV
      </button>
      <button onClick={() => exportToExcel(rows, columns)}>
        Export Excel
      </button>
    </div>
  );
}

<DataGrid
  slots={{ toolbar: CustomToolbar }}
  slotProps={{ toolbar: { rows, columns } }}
/>
```

### 2. `pagination`
Replace the default pagination component.

**Props received:**
```typescript
{
  page: number;                    // Current page (0-based)
  pageSize: number;                // Current page size
  rowCount: number;                // Total number of rows
  pageSizeOptions: number[];       // Available page sizes
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}
```

**Example:**
```tsx
<DataGrid
  slots={{ pagination: CustomPagination }}
  slotProps={{ pagination: { customProp: 'value' } }}
/>
```

### 3. `noRowsOverlay`
Replace the empty state shown when there are no rows.

**Props received:**
```typescript
{
  // Any props from slotProps.noRowsOverlay
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
  slots={{ noRowsOverlay: CustomNoRows }}
/>
```

### 4. `loadingOverlay`
Replace the loading state overlay.

**Props received:**
```typescript
{
  // Any props from slotProps.loadingOverlay
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
  slots={{ loadingOverlay: CustomLoader }}
/>
```

### 5. `footer`
Replace the entire footer section (including pagination).

**Props received:**
```typescript
{
  // Any props from slotProps.footer
}
```

**Example:**
```tsx
function CustomFooter() {
  return (
    <div style={{ padding: '12px', borderTop: '1px solid #e0e0e0' }}>
      <span>Custom footer content</span>
    </div>
  );
}

<DataGrid
  slots={{ footer: CustomFooter }}
/>
```

## Complete Example

```tsx
import { Select, Pagination, Spin, Empty } from 'antd';
import { DataGrid } from '@opencorestack/opengridx';

function AntdPagination(props) {
  const { page, pageSize, rowCount, pageSizeOptions, onPageChange, onPageSizeChange } = props;
  
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

For full type safety, define your component props:

```typescript
import type { PaginationProps } from '@opencorestack/opengridx';

interface CustomPaginationProps extends PaginationProps {
  customProp?: string;
}

const CustomPagination: React.FC<CustomPaginationProps> = (props) => {
  // Your implementation
};
```

## Best Practices

1. **Maintain Functionality**: Ensure your custom component provides the same core functionality as the default.
2. **Accessibility**: Include proper ARIA labels and keyboard navigation.
3. **Responsive Design**: Make sure your component works on different screen sizes.
4. **Performance**: Avoid expensive operations in render; use memoization where appropriate.
5. **Consistent Styling**: Match your app's design system while maintaining usability.

## See Also

- [Custom Pagination Guide](./CUSTOM_PAGINATION.md) - Detailed examples with Ant Design and MUI
- [DataGrid Props](../src/OpenGridX/types/index.ts) - Full TypeScript definitions
