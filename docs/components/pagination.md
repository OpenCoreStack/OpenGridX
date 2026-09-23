# `<Pagination />`

Handles row limit selection and page navigation. Compatible with both client-side and server-side data modes. `DataGrid` renders it when `pagination` is set. `Pagination` and `PaginationProps` are exported (v3.0+), so a `pagination` slot can wrap or restyle it; the slot receives the same props.

## ⚙️ Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | — | **Required.** The current active page (0-indexed). |
| `pageSize` | `number` | — | **Required.** Number of rows per page. |
| `rowCount` | `number` | — | **Required.** Total number of rows (used to calculate page count). |
| `onPageChange` | `(page: number) => void` | — | **Required.** Called with the new page. |
| `onPageSizeChange` | `(pageSize: number) => void` | — | **Required.** Called with the new page size (the grid then goes to page 0). |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Options for the "Rows per page" dropdown. When `pageSize` is not one of them it is added as an extra option, so the select always shows the size in use. |
| `showFirstButton` / `showLastButton` | `boolean` | `true` | Show the first-page / last-page buttons. |
| `localeText` | `Pick<GridLocaleText, 'paginationRowsPerPage' \| 'paginationOf' \| 'paginationPage'>` | — | Label overrides (see below). |

A `page` outside `0 … pageCount - 1` is displayed as the nearest valid page (the last page for a page past the end), and Previous/Next move from the displayed page. A `pageSize` below 1 (0, negative, `NaN`) is treated as 1.

## 🕹️ Interaction

The pagination component communicates state changes back to the `<DataGrid />` via:
- `onPageChange`: Triggered by the first / previous / next / last buttons.
- `onPageSizeChange`: Triggered when changing the rows-per-page limit.

## 🔄 Modes

- **Client-side**: Pagination happens automatically on the local `rows` array.
- **Server-side**: With `paginationMode="server"`, page changes are passed to the `GridDataSource` (or to your `onPaginationModelChange`) to fetch the page; `rowCount` is the server total.

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

Pass `localeText` on `<DataGrid />` to override the text labels in the Pagination component (rows-per-page, range, and page-counter labels). The rows-per-page select takes its accessible name from the `paginationRowsPerPage` label. The navigation landmark label (`aria-label="Pagination"`) and the button labels and titles (`Go to next page`, `Next page`, …) are hardcoded and not overrideable via `localeText`.

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
