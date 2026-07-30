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
| `paginationModel` | `GridPaginationModel` | — | Controlled pagination state (`{ page, pageSize }`). |
| `onPaginationModelChange` | `(model: GridPaginationModel) => void` | — | Fired when page or page size changes. |
| `pageSizeOptions` | `number[]` | `[10, 25, 50]` | Available page size options. |
| `rowCount` | `number` | — | Total rows (required for server-side paging). |
| `height` | `number \| string` | `undefined` | Total height of the grid container. |
| `density` | `'compact' \| 'standard' \| 'comfortable'` | `'standard'` | Visual row density. |
| `initialState` | `GridInitialState` | `undefined` | Starting state for sorting, filters, etc. |
| `slots` | `GridSlots` | `{}` | Custom component overrides. |
| `slotProps` | `Record<string, unknown>` | `{}` | Props passed to custom slots. |
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
| `getFilterModel()` | `GridFilterModel` | Get the current filter model. |
| `setPage(page)` | `void` | Change current page (0-indexed). |
| `setPageSize(pageSize)` | `void` | Change the current page size. |
| `scrollToIndexes(params)` | `void` | Scroll to specific row/column index. |
| `getAllColumns()` | `GridColDef[]` | Get all defined columns. |
| `getAggregationResult()` | `Record<string, unknown> \| null` | Get current aggregation results. |
| `getAggregationModel()` | `GridAggregationModel \| null` | Get the active aggregation configuration. |
| `copySelectedRows()` | `Promise<void>` | Copy selected rows to clipboard as TSV. |

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
| `groupingValue` | `unknown` | The value this node is grouping by. |
| `aggregatedValues` | `object` | Sums/Avgs computed for this group. |

---

## 📑 Column Definitions

### `GridColDef`
Defines the behavior and appearance of a single column.

#### Sizing & Layout

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `field` | `string` | — | **Required.** Unique identifier matching the row object key. |
| `headerName` | `string` | — | Text shown in the column header cell. |
| `description` | `string` | — | Tooltip shown on header hover (accessibility label). |
| `width` | `number \| string` | `100` | Fixed width in pixels or a percentage string. |
| `minWidth` | `number` | — | Minimum width in pixels (enforced during resize). |
| `maxWidth` | `number` | — | Maximum width in pixels (enforced during resize). |
| `flex` | `number` | — | Flex grow factor — distributes remaining space proportionally. Mutually exclusive with a fixed `width`. |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Horizontal alignment of cell content. |
| `headerAlign` | `'left' \| 'center' \| 'right'` | `'left'` | Horizontal alignment of the header cell content. |

#### Data & Type

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | `'string' \| 'number' \| 'date' \| 'boolean' \| 'singleSelect' \| 'image'` | `'string'` | Data type — determines default filter operators and cell formatting. |
| `valueOptions` | `Array<string \| number \| { value: unknown; label: string }>` | — | Allowed values for `type: 'singleSelect'` — used in the filter dropdown and edit cell. |
| `valueGetter` | `(params: GridValueGetterParams) => unknown` | — | Derive a computed value from the row object. Runs before `valueFormatter` and `renderCell`. |
| `valueFormatter` | `(params: GridValueFormatterParams) => string` | — | Format the value into a display string (e.g. currency, dates). Does not affect editing or sorting. |

#### Rendering

| Property | Type | Description |
| :--- | :--- | :--- |
| `renderCell` | `(params: GridRenderCellParams) => ReactNode` | Fully custom cell renderer. Receives `value`, `row`, `field`, `rowIndex`, `colIndex`. |
| `renderHeader` | `(params: GridRenderHeaderParams) => ReactNode` | Custom header cell renderer. Use for icons, sort indicators, or rich headers. |
| `renderEditCell` | `(params: GridRenderCellParams) => ReactNode` | Custom editor rendered when the cell enters edit mode. Requires `editable: true`. |

#### Editing

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `editable` | `boolean` | `false` | Enables inline cell editing. Commit is handled by `DataGrid.processRowUpdate`. |

#### Spanning

| Property | Type | Description |
| :--- | :--- | :--- |
| `colSpan` | `number \| ((params: GridRenderCellParams) => number)` | Number of columns this cell merges horizontally. |
| `rowSpan` | `number \| ((params: GridRenderCellParams) => number)` | Number of rows this cell merges vertically. |

#### Styling

| Property | Type | Description |
| :--- | :--- | :--- |
| `cellClassName` | `string \| ((params: GridRenderCellParams) => string)` | CSS class applied to every cell in this column. Use a function for conditional per-row styling. |
| `headerClassName` | `string` | CSS class applied to the header cell. |

#### Feature Flags

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sortable` | `boolean` | `true` | Enable/disable sorting for this column. |
| `filterable` | `boolean` | `true` | Enable/disable filtering for this column. |
| `resizable` | `boolean` | `true` | Allow the user to drag-resize this column. |
| `hideable` | `boolean` | `true` | Allow the user to hide this column via the panel. |
| `pinnable` | `boolean` | `true` | Allow this column to be pinned via the UI. |
| `disableColumnMenu` | `boolean` | `false` | Hide the column header kebab/context menu. |
| `exportable` | `boolean` | `true` | Set to `false` to exclude from CSV, Excel, JSON, and Print exports. |
| `groupable` | `boolean` | `true` | Allow this column to be used as a row grouping dimension. |
| `aggregable` | `boolean` | `true` | Allow this column to be aggregated. |
| `availableAggregationFunctions` | `string[]` | all built-ins | Restrict which aggregation functions are available for this column (e.g. `['sum', 'avg']`). |

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

Creates a typed ref to pass to the `apiRef` prop. Gives you imperative access to the grid after mount.

```tsx
import { useGridApiRef } from '@opencorestack/opengridx';

const apiRef = useGridApiRef();

// Pass to the grid
<DataGrid apiRef={apiRef} rows={rows} columns={columns} />

// Then call methods imperiously
apiRef.current.scrollToIndexes({ rowIndex: 0 });
apiRef.current.setFilterModel({ items: [] });
```

See the [Imperative API (`GridApi`)](#%EF%B8%8F-imperative-api-gridapi) table above for the full method list.

---

### `useAggregation(params)`

Headless hook for computing column summaries outside of the built-in `aggregationModel` prop. Useful when you need aggregation results for a custom footer or external display.

```tsx
import { useAggregation } from '@opencorestack/opengridx';

const { aggregationResult, isLoading } = useAggregation({
  rows,
  aggregationModel: { salary: 'sum', age: 'avg' },
  isServerSide: false,
});
```

#### Params (`UseAggregationParams`)

| Param | Type | Description |
| :--- | :--- | :--- |
| `rows` | `GridRowModel[]` | The rows to aggregate. |
| `aggregationModel` | `GridAggregationModel` | Map of `field → aggFn` (e.g. `{ salary: 'sum' }`). |
| `isServerSide` | `boolean` | If `true`, skips client computation and uses `serverAggregationResults`. |
| `filterModel` | `GridFilterModel` | Optional — restricts aggregation to filtered rows. |
| `sortModel` | `GridSortItem[]` | Optional — used when `dataSource` is provided. |
| `dataSource` | `GridDataSource` | Optional — server-side data adapter for async aggregation. |
| `serverAggregationResults` | `GridAggregationResult \| null` | Pre-fetched results when `isServerSide: true`. |

#### Return (`UseAggregationReturn`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `aggregationResult` | `GridAggregationResult` | Map of `field → computed value`. |
| `isLoading` | `boolean` | `true` while a server-side fetch is in progress. |
| `error` | `unknown` | Set if the server-side fetch threw. |

**Built-in aggregation functions:** `sum`, `avg`, `min`, `max`, `count`, `unique`

You can also use `formatAggregationValue(value, fnName)` to produce a display string from a raw result.

---

### `usePivot(rawRows, rawCols, model, enabled)`

Headless hook that transforms a flat dataset into pivot rows and pivot column definitions. Pass the output directly to `<DataGrid rows={} columns={} />` when `pivotMode` is active.

```tsx
import { usePivot } from '@opencorestack/opengridx';

const { pivotRows, pivotColumns, isValid } = usePivot(
  rows,
  columns,
  {
    rowFields: ['department'],
    columnFields: ['year'],
    valueFields: [{ field: 'revenue', aggFn: 'sum' }],
  },
  isPivotEnabled,
);

<DataGrid
  rows={isPivotEnabled ? pivotRows : rows}
  columns={isPivotEnabled ? pivotColumns : columns}
/>
```

#### Parameters

| Param | Type | Description |
| :--- | :--- | :--- |
| `rawRows` | `GridRowModel[]` | Original flat dataset. |
| `rawCols` | `GridColDef[]` | Original column definitions. |
| `model` | `GridPivotModel` | Pivot configuration — `rowFields`, `columnFields`, `valueFields`. |
| `enabled` | `boolean` | When `false`, returns empty arrays immediately (no computation). |

#### Return (`UsePivotReturn`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `pivotRows` | `GridRowModel[]` | Transformed rows ready for the grid. |
| `pivotColumns` | `GridColDef[]` | Generated column definitions for each pivot key. |
| `colKeys` | `string[]` | The distinct column pivot values used. |
| `isValid` | `boolean` | `false` if the model is incomplete (e.g. no `rowFields` or `valueFields`). |

#### `GridPivotModel`

```ts
interface GridPivotModel {
  rowFields: string[];     // fields to group rows by
  columnFields: string[];  // fields to spread as columns
  valueFields: Array<{
    field: string;
    aggFn: 'sum' | 'avg' | 'count' | 'min' | 'max';
    headerName?: string;
  }>;
}
```

---

### `useGridStateStorage(options)`

Persists grid state (sort, filters, pagination, column visibility, etc.) to `localStorage` and restores it on mount. Pass the returned values directly to `DataGrid`.

```tsx
import { useGridStateStorage } from '@opencorestack/opengridx';

// Simple — just a storage key
const { initialState, onStateChange } = useGridStateStorage('my-grid');

// Advanced — with options
const { initialState, onStateChange, clearState } = useGridStateStorage({
  key: 'my-grid',
  debounceMs: 500,                        // default: 300
  include: ['sorting', 'filter', 'pagination'], // persist only these slices
  storage: sessionStorage,                // default: localStorage
});

<DataGrid
  rows={rows}
  columns={columns}
  initialState={initialState}
  onStateChange={onStateChange}
/>

// Clear saved state (e.g. on a "Reset" button)
<button onClick={clearState}>Reset Grid</button>
```

#### Options (`UseGridStateStorageOptions`)

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `key` | `string` | — | **Required.** Storage key — use a unique value per grid instance. |
| `debounceMs` | `number` | `300` | Debounce delay in ms before writing to storage. |
| `include` | `(keyof GridState)[]` | all | Restrict which state slices are persisted. |
| `storage` | `Storage` | `localStorage` | Any object implementing `getItem`/`setItem`/`removeItem` (e.g. `sessionStorage` or a custom backend adapter). |

#### Return (`UseGridStateStorageReturn`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `initialState` | `GridState \| undefined` | Restored state from storage — pass to `DataGrid.initialState`. |
| `onStateChange` | `(state: GridState) => void` | Callback to pass to `DataGrid.onStateChange`. |
| `clearState` | `() => void` | Removes the saved state from storage. |

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
  items?: (GridFilterItem | GridFilterGroup)[];
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
