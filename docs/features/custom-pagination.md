# Custom Pagination with Ant Design

This guide shows how to use Ant Design (or any other UI library) components with the DataGrid.

## Using Ant Design Select for Page Size

Slots are typed `React.ComponentType<Record<string, unknown>>`, so the component takes `Record<string, unknown>` and narrows it to the props it reads (see [Slots API](../customization/slots-api.md#available-slots)).

```tsx
import { Pagination, Select } from 'antd';
import { DataGrid } from '@opencorestack/opengridx';

type PaginationSlotProps = {
    page: number;
    pageSize: number;
    rowCount: number;
    pageSizeOptions: number[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
};

function AntdPaginationComponent(props: Record<string, unknown>) {
    const {
        page,
        pageSize,
        rowCount,
        pageSizeOptions,
        onPageChange,
        onPageSizeChange
    } = props as PaginationSlotProps;

    // Client-side, `page` is already clamped to the last page.
    const firstRowIndex = page * pageSize;
    const lastRowIndex = Math.min(firstRowIndex + pageSize, rowCount);
    // Show the page size in use even when it is not one of pageSizeOptions, as the built-in pager does.
    const sizes = pageSizeOptions.includes(pageSize)
        ? pageSizeOptions
        : [...pageSizeOptions, pageSize].sort((a, b) => a - b);

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
                    options={sizes.map(size => ({
                        value: size,
                        label: size
                    }))}
                    style={{ width: 80 }}
                />
            </div>

            {/* Row count */}
            <span>{rowCount === 0 ? 0 : firstRowIndex + 1}–{lastRowIndex} of {rowCount}</span>

            {/* Ant Design Pagination */}
            <Pagination
                current={page + 1}
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
// PaginationSlotProps: the type alias from the example above

function MuiPaginationComponent(props: Record<string, unknown>) {
    const { pageSize, pageSizeOptions, onPageSizeChange } = props as PaginationSlotProps;

    return (
        <div>
            <Select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
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

- `page`: Current page index (0-based). With client pagination it is clamped to the last page: when the rows shrink below the current page, the grid shows the last page and reports the corrected page once through `onPaginationModelChange`.
- `pageSize`: Current page size. It may be a value missing from `pageSizeOptions` (the built-in pager then lists it as an extra option).
- `rowCount`: Number of rows being paged: the filtered, unpinned rows (pinned rows show on every page), or the server total with `paginationMode="server"`.
- `pageSizeOptions`: Array of available page sizes (default `[10, 25, 50, 100]`). The default page size is 100, or the first option when 100 is not offered.
- `onPageChange(newPage: number)`: Callback to change page
- `onPageSizeChange(newPageSize: number)`: Callback to change page size (also goes back to page 0)
- `localeText`: `{ paginationRowsPerPage, paginationOf, paginationPage }`, passed only when the grid's `localeText` prop is set. The built-in pager uses `paginationRowsPerPage` as the select's label and accessible name.
- Any additional props from `slotProps.pagination`

The slot is rendered only while pagination is in effect: `pagination` is set, row grouping is off and `paginationMode` is not `"infinite"`. A `slots.footer` replaces it. List view uses it too.

## Other Customizable Slots

```tsx
<DataGrid
    rows={rows}
    columns={columns}
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

See `demo/examples/CustomPagination/CustomPagination.tsx` for a complete working example.
