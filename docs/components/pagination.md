# `<Pagination />`

Handles row limit selection and page navigation. Compatible with both client-side and server-side data modes.

## ⚙️ Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `0` | The current active page (0-indexed). |
| `pageSize` | `number` | `100` | Number of rows per page. |
| `rowCount` | `number` | `0` | Total number of rows (used to calculate page count). |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Options for the "Rows per page" dropdown. |

## 🕹️ Interaction

The pagination component communicates state changes back to the `<DataGrid />` via:
- `onPageChange`: Triggered when clicking Next/Prev or a page number.
- `onPageSizeChange`: Triggered when changing the rows-per-page limit.

## 🔄 Modes

- **Client-side**: Pagination happens automatically on the local `rows` array.
- **Server-side**: Pagination state is passed to the `GridDataSource` to fetch new chunks of data.

## 🎨 Customizing
You can replace the internal pagination UI using the `pagination` slot:

```tsx
<DataGrid
  slots={{
    pagination: MyCustomPaginationComponent
  }}
/>
```

## 🌍 Internationalisation

Pass `localeText` on `<DataGrid />` to override all user-visible strings in the Pagination component:

| Key | Type | Default |
| :--- | :--- | :--- |
| `paginationRowsPerPage` | `string` | `"Rows per page:"` |
| `paginationOf` | `(from, to, count) => string` | `` `${from}–${to} of ${count}` `` |
| `paginationPage` | `(page, pageCount) => string` | `` `Page ${page} of ${pageCount}` `` |
| `noRowsLabel` | `string` | `"No Data"` |

**Example — French locale:**

```tsx
<DataGrid
  localeText={{
    paginationRowsPerPage: 'Lignes par page :',
    paginationOf: (from, to, count) => `${from}–${to} sur ${count}`,
    paginationPage: (page, pageCount) => `Page ${page} sur ${pageCount}`,
    noRowsLabel: 'Aucune donnée',
  }}
  rows={rows}
  columns={columns}
/>
```
