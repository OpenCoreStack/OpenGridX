# `<DataGrid />`

The central component of the OpenGridX library. Highly optimized for performance with virtualization and a rich feature set.

## 🚀 Usage

```tsx
import { DataGrid } from '@opencorestack/opengridx';

function MyGrid() {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      height={600}
    />
  );
}
```

## ⚙️ Core Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rows` | `R[]` | `[]` | The dataset to display. |
| `columns` | `GridColDef[]` | `[]` | Column definitions. |
| `getRowId` | `(row: R) => GridRowId` | `row.id` | Unique ID for each row. |
| `height` | `number \| string` | `undefined` | Height of the grid container. |
| `loading` | `boolean` | `false` | Displays a loading skeleton/shimmer. |
| `density` | `'compact' \| 'standard' \| 'comfortable'` | `'standard'` | Row height preset: compact = 32 px, standard = `rowHeight`, comfortable = 72 px. |
| `checkboxSelection` | `boolean` | `false` | Enable row checkboxes. |
| `disableRowSelectionOnClick` | `boolean` | `false` | When `true`, clicking a row does not toggle its selection. |
| `disableMultipleRowSelection` | `boolean` | `false` | When `true`, at most one row can be selected at a time. |
| `pagination` | `boolean` | `false` | Enable/Disable bottom pagination bar. |
| `paginationModel` | `GridPaginationModel` | — | Controlled pagination state (`{ page, pageSize }`). Omit for uncontrolled; use `initialState` to set the initial page/pageSize. |
| `pageSizeOptions` | `number[]` | `[10, 25, 50]` | Available page size options. |
| `initialState` | `GridInitialState` | `undefined` | Initial configuration (sorting, columns, pagination, etc). |

## 🔃 Sorting

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sortModel` | `GridSortItem[]` | — | Controlled sort state. |
| `onSortModelChange` | `(model: GridSortItem[]) => void` | — | Fired when the sort model changes. |
| `multiSort` | `boolean` | `false` | When `true`, every click appends/cycles the column in the sort model instead of replacing it. Shift+click always appends regardless of this prop. |

## 🌳 Row Grouping

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rowGroupingModel` | `string[]` | `[]` | Fields to group by (in order). |
| `groupingColDef` | `GridColDef` | — | Config for the dedicated `__group__` column created at position 0, auto-pinned left, when grouping is active. |

## 🖱️ Interaction & Events

| Prop | Type | Description |
| :--- | :--- | :--- |
| `onRowClick` | `(params) => void` | Fired when clicking a row body. |
| `onCellClick` | `(params) => void` | Fired when clicking a specific cell. |
| `onPaginationModelChange` | `(model: GridPaginationModel) => void` | Fired when page or page size changes. |
| `onStateChange` | `(state) => void` | Fired on any internal state update. |
| `processRowUpdate` | `(new, old) => R \| Promise<R>` | Fired after a cell edit is committed. |

## 📦 Slots

Customize internal components using the `slots` prop.

```tsx
<DataGrid
  slots={{
    toolbar: MyCustomToolbar,
    pagination: MyCustomPagination,
    noRowsOverlay: MyEmptyState
  }}
/>
```

---

## 🔗 Related Components
- [Row](row.md)
- [Cell](cell.md)
- [Header](header.md)
- [Toolbar](toolbar.md)
- [Filter Panel](filter-panel.md)
- [Pagination](pagination.md)
- [Tooltip](tooltip.md)
- [Column Visibility](column-visibility.md)
- [Column Grouping](column-group-header.md)
- [Column Resizing](column-resize.md)
- [Empty State](empty-state.md)
- [Error Overlay](error-overlay.md)
- [Aggregation Footer](aggregation-footer.md)
