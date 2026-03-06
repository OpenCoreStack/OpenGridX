# 📖 OpenGridX API Reference

This document provides a comprehensive reference for all exported types, interfaces, and utility functions in the OpenGridX library.

---

## 🏗️ Core Components

### `<DataGrid />`
The main component for displaying and interacting with data.

#### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rows` | `GridRowModel[]` | `[]` | Array of data objects. |
| `columns` | `GridColDef[]` | `[]` | Definitions for the columns. |
| `getRowId` | `(row: GridRowModel) => GridRowId` | `row.id` | Returns a unique identifier for each row. |
| `rowHeight` | `number` | `52` | Height of each row in pixels. |
| `headerHeight` | `number` | `56` | Height of the header row. |
| `autoHeight` | `boolean` | `false` | Adjust grid height to match row total. |
| `loading` | `boolean` | `false` | Shows a loading skeleton overlay. |
| `checkboxSelection` | `boolean` | `false` | Enable row selection via checkboxes. |
| `pagination` | `boolean` | `false` | Enable the bottom pagination bar. |
| `paginationMode` | `'client' \| 'server' \| 'infinite'` | `'client'` | How to handle paging. |
| `paginationModel` | `GridPaginationModel` | `{page:0, pageSize:25}` | Current page and page size. |
| `rowCount` | `number` | — | Total rows (required for server-side paging). |
| `initialState` | `GridInitialState` | `undefined` | Starting state for sorting, filters, etc. |
| `slots` | `GridSlots` | `{}` | Custom component overrides. |
| `slotProps` | `Record<string, any>` | `{}` | Props passed to custom slots. |
| `filterModel` | `GridFilterModel` | `undefined` | Active filters. |
| `sortModel` | `GridSortItem[]` | `undefined` | Active sorting. |
| `onRowClick` | `(params: GridRowParams) => void` | — | Fired when a row is clicked. |
| `onCellClick` | `(params: GridCellParams) => void` | — | Fired when a cell is clicked. |
| `onStateChange` | `(state: GridState) => void` | — | Fired on any internal state update. |
| `processRowUpdate` | `(new, old) => R \| Promise<R>` | — | Fired after a cell edit is committed. |
| `dataSource` | `GridDataSource` | — | Remote data provider interface. |

---

## 🕹️ Imperative API (`GridApi`)

Access these methods via the `apiRef` prop.

| Method | Return | Description |
| :--- | :--- | :--- |
| `getRow(id)` | `GridRowModel \| null` | Get row data by ID. |
| `getAllRows()` | `GridRowModel[]` | Get all loaded rows. |
| `getVisibleRows()` | `GridRowModel[]` | Get rows after filtering/sorting. |
| `getColumn(field)` | `GridColDef \| null` | Get column definition by field. |
| `getVisibleColumns()` | `GridColDef[]` | Get currently visible columns. |
| `selectRow(id, isSelected)` | `void` | Set selection for a single row. |
| `selectRows(ids, isSelected)`| `void` | Set selection for multiple rows. |
| `getSelectedRows()` | `GridRowId[]` | Get IDs of all selected rows. |
| `sortColumn(field, dir)` | `void` | Programmatically sort a column. |
| `getSortModel()` | `GridSortItem[]` | Get active sorting state. |
| `setFilterModel(model)` | `void` | Programmatically set filters. |
| `setPage(page)` | `void` | Change current page (0-indexed). |
| `scrollToIndexes(params)` | `void` | Scroll to specific row/column index. |

---

## 🌳 Internal Data Structures

### `GridTreeNode`
Used in Tree Data and Row Grouping hierarchies.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `GridRowId` | Unique ID of the row. |
| `parentId` | `GridRowId \| null` | ID of the parent node. |
| `depth` | `number` | Nesting level (0 for root). |
| `isExpanded` | `boolean` | Current expansion state. |
| `children` | `GridRowId[]` | IDs of child nodes. |
| `groupingValue` | `any` | The value this node is grouping by. |
| `aggregatedValues` | `object` | Sums/Avgs computed for this group. |

---

## 📑 Column Definitions

### `GridColDef`
Defines the behavior and appearance of a single column.

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `field` | `string` | — | Unique identifier (matches row property). |
| `headerName` | `string` | — | Text displayed in the header. |
| `width` | `number` | `100` | Width in pixels. |
| `type` | `'string' \| 'number' \| 'date' \| 'dateTime' \| 'boolean'` | `'string'` | Data type for formatting and filtering. |
| `sortable` | `boolean` | `true` | Enable sorting for this column. |
| `filterable` | `boolean` | `true` | Enable filtering for this column. |
| `resizable` | `boolean` | `true` | Allow user to drag resize. |
| `hideable` | `boolean` | `true` | Allow user to hide the column. |
| `pinned` | `'left' \| 'right' \| null` | `null` | Sticky positioning. |
| `valueFormatter` | `(params: GridValueFormatterParams) => string` | — | Format value for display. |
| `valueGetter` | `(params: GridValueGetterParams) => any` | — | Compute value from row data. |
| `renderCell` | `(params: GridRenderCellParams) => ReactNode` | — | Custom cell renderer. |

---

## 📂 Export Utilities

| Function | Return | Description |
| :--- | :--- | :--- |
| `exportToCsv(rows, cols, options?)` | `void` | Triggers download of CSV file. |
| `exportToJson(rows, cols, options?)` | `void` | Triggers download of JSON file. |
| `exportToExcel(rows, cols, options?)` | `void` | Basic `.xls` export (zero-dep). |
| `exportToExcelAdvanced(rows, cols, options?)` | `Promise<void>` | Real `.xlsx` export (styled, multi-sheet, lazy-loaded). |
| `printGrid(rows, cols, title \| options)` | `void` | Opens browser print dialog. |

---

## 🎨 Theming & Styling

### `DataGridThemeProvider`
Context provider for overriding the grid's visual system.

#### `GridTheme` Object
- **Colors**: `primary`, `secondary`, `header`, `border`, `rowHover`, `rowSelected`.
- **Typography**: `fontFamily`, `fontSize`, `fontWeight`.
- **Spacing**: `cellPadding`, `headerHeight`, `rowHeight`.

---

## 🛠️ Hooks

### `useGridApiRef()`
Returns a ref to interact with the grid programmatically.
- `state`: Access full internal state.
- `getVisibleRows()`: Returns filtered/sorted rows.
- `getVisibleColumns()`: Returns currently visible columns.

### `useAggregation(params)`
Compute summary values for datasets.
- **Built-in Functions**: `sum`, `avg`, `min`, `max`, `count`, `unique`.

### `useGridStateStorage(options)`
Persist and restore grid configurations to LocalStorage or a backend.

---

## ⚙️ Interfaces & Types

### `GridSortItem`
```typescript
interface GridSortItem {
  field: string;
  sort: 'asc' | 'desc';
}
```

### `GridFilterModel`
```typescript
interface GridFilterModel {
  items: GridFilterItem[];
  logicOperator?: 'and' | 'or';
  quickFilterValues?: string[];
}
```

### `GridPaginationModel`
```typescript
interface GridPaginationModel {
  page: number;
  pageSize: number;
}
```

### `GridPivotModel`
```typescript
interface GridPivotModel {
  rowFields: string[];
  columnFields: string[];
  valueFields: { field: string; aggFn: string; headerName?: string }[];
}
```
