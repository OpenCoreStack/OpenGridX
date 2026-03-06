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
| `checkboxSelection` | `boolean` | `false` | Enable row checkboxes. |
| `pagination` | `boolean` | `false` | Enable/Disable bottom pagination bar. |
| `paginationModel` | `GridPaginationModel` | `{page:0, pageSize:25}` | Controlled pagination state. |
| `initialState` | `GridState` | `undefined` | Initial configuration (sorting, columns, etc). |

## 🖱️ Interaction & Events

| Prop | Type | Description |
| :--- | :--- | :--- |
| `onRowClick` | `(params) => void` | Fired when clicking a row body. |
| `onCellClick` | `(params) => void` | Fired when clicking a specific cell. |
| `onStateChange` | `(state) => void` | Fired on any internal state update. |
| `processRowUpdate` | `(new, old) => R` | Fired after a cell edit is committed. |

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
