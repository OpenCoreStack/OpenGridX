# Custom Pagination with Ant Design

This guide shows how to use Ant Design (or any other UI library) components with the DataGrid.

## Using Ant Design Select for Page Size

```tsx
import { Select } from 'antd';
import { DataGrid } from '@opencorestack/opengridx';

function AntdPaginationComponent(props) {
    const {
        page,
        pageSize,
        rowCount,
        pageSizeOptions,
        onPageChange,
        onPageSizeChange
    } = props;

    const pageCount = Math.max(1, Math.ceil(rowCount / pageSize));
    const currentPage = Math.min(page, pageCount - 1);
    const firstRowIndex = currentPage * pageSize;
    const lastRowIndex = Math.min(firstRowIndex + pageSize, rowCount);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '16px',
            padding: '12px 16px',
            borderTop: '1px solid #f0f0f0'
        }}>
            {/* Ant Design Select for page size */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Rows per page:</span>
                <Select
                    value={pageSize}
                    onChange={onPageSizeChange}
                    options={pageSizeOptions.map(size => ({
                        value: size,
                        label: size
                    }))}
                    style={{ width: 80 }}
                />
            </div>

            {/* Row count */}
            <span>{firstRowIndex + 1}–{lastRowIndex} of {rowCount}</span>

            {/* Ant Design Pagination */}
            <Pagination
                current={currentPage + 1}
                total={rowCount}
                pageSize={pageSize}
                onChange={(page) => onPageChange(page - 1)}
                showSizeChanger={false}
                simple
            />
        </div>
    );
}

// Usage in your app
function MyApp() {
    return (
        <DataGrid
            rows={rows}
            columns={columns}
            pagination
            slots={{
                pagination: AntdPaginationComponent
            }}
            slotProps={{
                pagination: {
                    // Any custom props for your component
                }
            }}
        />
    );
}
```

## Using MUI Select

```tsx
import { Select, MenuItem } from '@mui/material';

function MuiPaginationComponent(props) {
    const { pageSize, pageSizeOptions, onPageSizeChange } = props;

    return (
        <div>
            <Select
                value={pageSize}
                onChange={(e) => onPageSizeChange(e.target.value)}
            >
                {pageSizeOptions.map(size => (
                    <MenuItem key={size} value={size}>
                        {size}
                    </MenuItem>
                ))}
            </Select>
        </div>
    );
}
```

## Available Props

Your custom pagination component will receive these props:

- `page`: Current page index (0-based)
- `pageSize`: Current page size
- `rowCount`: Total number of rows
- `pageSizeOptions`: Array of available page sizes
- `onPageChange(newPage: number)`: Callback to change page
- `onPageSizeChange(newPageSize: number)`: Callback to change page size
- Any additional props from `slotProps.pagination`

## Other Customizable Slots

```tsx
<DataGrid
    slots={{
        pagination: CustomPaginationComponent,
        noRowsOverlay: CustomNoRowsComponent,
        loadingOverlay: CustomLoadingComponent,
        footer: CustomFooterComponent
    }}
    slotProps={{
        pagination: { /* custom props */ },
        noRowsOverlay: { /* custom props */ },
        loadingOverlay: { /* custom props */ },
        footer: { /* custom props */ }
    }}
/>
```

## Complete Example

See `demo/examples/CustomPagination.tsx` for a complete working example.
