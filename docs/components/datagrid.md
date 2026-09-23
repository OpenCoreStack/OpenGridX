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
| `rows` | `R[]` | — | **Required.** The dataset to display (`[]` when a `dataSource` supplies the rows). |
| `columns` | `GridColDef<R>[]` | — | **Required.** Column definitions. |
| `getRowId` | `(row: R) => GridRowId` | `row.id` | Unique ID for each row. Only keys the grid's store; row objects are never copied or given an `id` (v3.0+). Duplicate ids keep the first row and log a development warning. |
| `height` | `number \| string` | `undefined` | Height of the grid container. |
| `loading` | `boolean` | `false` | Displays a loading skeleton/shimmer. |
| `density` | `'compact' \| 'standard' \| 'comfortable'` | `'standard'` | Row height preset: compact = 32 px, standard = `rowHeight`, comfortable = 72 px. Inside a `DataGridThemeProvider`, the theme's `grid.rowHeightCompact` / `rowHeightStandard` / `rowHeightComfortable` replace these defaults (an explicit `rowHeight` still wins for standard). |
| `checkboxSelection` | `boolean` | `false` | Enable row checkboxes. |
| `disableRowSelectionOnClick` | `boolean` | `false` | When `true`, clicking a row does not toggle its selection. |
| `disableMultipleRowSelection` | `boolean` | `false` | When `true`, at most one row can be selected at a time. |
| `disableClipboardCopy` | `boolean` | `false` | When `true`, Ctrl+C / Cmd+C does not copy the selected rows. `apiRef.current.copySelectedRows()` still works. |
| `pagination` | `boolean` | `false` | Enable/Disable bottom pagination bar. |
| `paginationModel` | `GridPaginationModel` | — | Controlled pagination state (`{ page, pageSize }`). Omit for uncontrolled; use `initialState` to set the initial page/pageSize. |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Available page size options. |
| `initialState` | `GridInitialState` | `undefined` | Initial configuration (sorting, filter, columns, pagination, density), read on mount. |
| `overscanRowCount` | `number` | `3` | Minimum rows rendered outside the visible viewport. The grid adapts this upward automatically based on scroll velocity — this prop sets the floor. |

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
| `groupingColDef` | `Partial<GridColDef<R>>` | — | Config for the dedicated `__group__` column created at position 0, auto-pinned left, when grouping is active. Every key is optional; `field` is always `'__group__'`. |

## 🖱️ Interaction & Events

| Prop | Type | Description |
| :--- | :--- | :--- |
| `onRowClick` | `(params: GridRowParams) => void` | Fired when clicking a row body (not for synthetic group rows, which toggle instead). |
| `onRowDoubleClick` | `(params: GridRowParams) => void` | Fired when double-clicking a row. |
| `onCellClick` | `(params: GridCellParams) => void` | Fired when clicking a specific cell. |
| `onPaginationModelChange` | `(model: GridPaginationModel) => void` | Fired when page or page size changes. |
| `onStateChange` | `(state: GridState) => void` | Fired on mount and whenever the value of the sort, filter, pagination, column or density state changes. |
| `processRowUpdate` | `(new, old) => R \| Promise<R>` | Called once per committed cell edit; return the row to store (or a Promise of it). See [Editing](../features/editing-reordering.md#commit-and-cancel). |

## 📦 Slots

Customize internal components using the `slots` prop (`GridSlots`: `toolbar`, `pagination`, `noRowsOverlay`, `loadingOverlay`, `footer`) and pass them props with `slotProps`. See [`GridSlots`](../API_REFERENCE.md#gridslots-and-gridslotprops).

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
- [Column Group Headers](column-group-header.md)
- [Column Resizing](column-resize.md)
- [Empty State](empty-state.md)
- [Error Overlay](error-overlay.md)
- [Aggregation Footer](aggregation-footer.md)
