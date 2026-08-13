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

#### Sorting, Filtering & Pagination

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sortingMode` | `'client' \| 'server'` | `'client'` | Set to `'server'` when your backend handles sorting. The grid calls `onSortModelChange` but does not re-sort rows locally. |
| `filterMode` | `'client' \| 'server'` | `'client'` | Set to `'server'` when your backend handles filtering. The grid calls `onFilterModelChange` but does not re-filter rows locally. |
| `onSortModelChange` | `(model: GridSortItem[]) => void` | — | Fired when the active sort model changes. |
| `onFilterModelChange` | `(model: GridFilterModel) => void` | — | Fired when the active filter model changes. |

#### Row Selection

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rowSelectionModel` | `GridRowSelectionModel` | `[]` | Controlled selection state — array of selected row IDs. |
| `onRowSelectionModelChange` | `(model: GridRowSelectionModel) => void` | — | Fired when the selection changes. |
| `disableRowSelectionOnClick` | `boolean` | `false` | When `true`, clicking a row does not toggle its selection. |
| `disableMultipleRowSelection` | `boolean` | `false` | When `true`, at most one row can be selected at a time. |

#### Column Visibility

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `columnVisibilityModel` | `GridColumnVisibilityModel` | — | Map of `field → boolean` controlling which columns are visible (`false` = hidden). |
| `onColumnVisibilityModelChange` | `(model: GridColumnVisibilityModel) => void` | — | Fired when the visibility of any column changes. |

#### Column & Row Reordering

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `disableColumnReorder` | `boolean` | `false` | Disables drag-and-drop column reordering. |
| `columnOrder` | `GridColumnOrder` | — | Controlled ordered array of column field names. |
| `onColumnOrderChange` | `(params: GridColumnOrderChangeParams) => void` | — | Fired after a column is dragged to a new position. |
| `rowReordering` | `boolean` | `false` | Enables drag-and-drop row reordering. |
| `onRowOrderChange` | `(params: GridRowOrderChangeParams) => void` | — | Fired after a row is dragged to a new position. |

#### Pinning

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `pinnedColumns` | `GridColumnPinning` | — | Columns pinned to the left or right viewport edges. See [Column & Row Pinning](#-column--row-pinning). |
| `onPinnedColumnsChange` | `(model: GridColumnPinning) => void` | — | Fired when column pinning changes. |
| `pinnedRows` | `GridRowPinning` | — | Row IDs pinned to the top or bottom of the viewport. |
| `onPinnedRowsChange` | `(model: GridRowPinning) => void` | — | Fired when row pinning changes. |
| `pinCheckboxColumn` | `boolean` | `false` | Keeps the checkbox column visible during horizontal scrolling. |
| `pinExpandColumn` | `boolean` | `false` | Keeps the Master-Detail expansion column visible during horizontal scrolling. |

#### Inline Editing

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `isCellEditable` | `(params: GridCellParams) => boolean` | — | Per-cell predicate. Return `false` to make a specific cell read-only even when the column has `editable: true`. |
| `onProcessRowUpdateError` | `(error: unknown) => void` | — | Fired if `processRowUpdate` throws or returns a rejected Promise. Use to display validation errors or restore the previous row value. |

#### Master-Detail

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `getDetailPanelContent` | `(params: GridDetailPanelParams) => ReactNode` | — | Returns the JSX content rendered inside the expandable detail panel. |
| `getDetailPanelHeight` | `(params: GridDetailPanelParams) => number \| 'auto'` | `'auto'` | Controls the panel height in pixels, or `'auto'` to fit content. |
| `detailPanelExpandedRowIds` | `Set<GridRowId>` | — | Controlled set of currently-expanded detail panel row IDs. |
| `onDetailPanelExpandedRowIdsChange` | `(ids: Set<GridRowId>) => void` | — | Fired when detail panels expand or collapse. |

#### Tree Data

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `treeData` | `boolean` | `false` | Enables hierarchical tree data display. |
| `getTreeDataPath` | `(row: R) => string[]` | — | Returns the hierarchy path for a row (e.g. `['Engineering', 'Frontend']`). |
| `groupingColDef` | `GridColDef` | — | Overrides the auto-generated tree expand/collapse column definition. |
| `defaultGroupingExpansionDepth` | `number` | `0` | Number of tree levels expanded on initial render (`-1` = all). |

#### Row Grouping & Aggregation

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rowGroupingModel` | `GridRowGroupingModel` | `[]` | Array of field names to group rows by (e.g. `['department', 'team']`). See [Row Grouping](#️-row-grouping). |
| `onRowGroupingModelChange` | `(model: GridRowGroupingModel) => void` | — | Fired when the grouping model changes. |
| `aggregationModel` | `GridAggregationModel` | — | Map of `field → aggFn` (e.g. `{ salary: 'sum', age: 'avg' }`). See [Aggregation Reference](#-aggregation-reference). |
| `onAggregationModelChange` | `(model: GridAggregationModel) => void` | — | Fired when the aggregation model changes. |
| `getAggregationPosition` | `(groupNode: GridTreeNode \| null) => 'inline' \| 'footer' \| null` | — | Controls where aggregation results appear. `'inline'` = inside the group row, `'footer'` = a dedicated row below the group, `null` = hidden. Pass `null` groupNode = grand-total (root) position. |

#### Pivot

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `pivotMode` | `boolean` | `false` | Switches the grid to multidimensional Pivot Mode. |
| `pivotModel` | `GridPivotModel` | — | Controlled pivot configuration (row fields, column fields, value fields). |
| `onPivotModelChange` | `(model: GridPivotModel) => void` | — | Fired when the pivot model changes. |

#### Scroll & Viewport

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `onRowsScrollEnd` | `(params: GridRowScrollEndParams) => void` | — | Fired when the user scrolls to the bottom of the grid viewport. Use this to trigger the next page in infinite-scroll mode. |

#### Accessibility & Appearance

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `ariaLabel` | `string` | — | ARIA label for the grid container element. |
| `noRowsLabel` | `string` | `'No rows'` | Message shown in the empty-state overlay when there are no rows. |
| `className` | `string` | — | Additional CSS class applied to the outermost grid wrapper element. |
| `style` | `React.CSSProperties` | — | Inline styles applied to the grid wrapper element. |

#### Imperative Ref

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `apiRef` | `React.MutableRefObject<GridApi>` | — | Reactive ref to the imperative API. Create with `useGridApiRef()`. |

#### List View

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `listView` | `boolean` | `false` | Renders the grid as a single-column list of cards. Designed for mobile and responsive layouts. |
| `listViewColumn` | `GridListViewColDef` | — | Column definition for list view mode. Must provide a `renderCell` function. The `field` value is used as a key. |

#### Column Group Headers

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `columnGroupingModel` | `GridColumnGroupingModel` | — | Defines spanning header rows above the regular column headers. See [Column Group Headers](#️-column-group-headers). |

---

## 🛠️ `GridToolbar`

The built-in toolbar component. Mount it via `slots={{ toolbar: GridToolbar }}`. All props below are passed through `slotProps.toolbar` (or directly when building a custom wrapper).

### `GridToolbarProps`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `columns` | `GridColDef[]` | `[]` | Column definitions — injected automatically when used via `slots`. |
| `baseColumns` | `GridColDef[]` | — | Pre-pivot columns shown in the Pivot panel instead of synthetic pivot columns. |
| `aggregationModel` | `GridAggregationModel` | `{}` | Current aggregation configuration. |
| `onAggregationModelChange` | `(model: GridAggregationModel) => void` | — | Called when the user changes aggregation settings. |
| `pivotModel` | `GridPivotModel` | — | Current pivot configuration. Presence of this prop renders the Pivot button. |
| `onPivotModelChange` | `(model: GridPivotModel) => void` | — | Called when the user changes pivot settings. |
| `filterModel` | `GridFilterModel` | — | Current filter model. Presence of this prop renders the search bar and Filter button. |
| `onFilterModelChange` | `(model: GridFilterModel) => void` | — | Called when the user changes filters or the quick-search value. |
| `columnVisibilityModel` | `Record<string, boolean>` | `{}` | Current column visibility map. |
| `onColumnVisibilityModelChange` | `(model: Record<string, boolean>) => void` | — | Called when the user shows or hides a column. Presence renders the Columns button. |
| `onColumnReorder` | `(from: string, to: string) => void` | — | Called when the user drags a column in the Columns panel. |
| `onColumnOrderReset` | `() => void` | — | Called when the user clicks "Reset order" in the Columns panel. |
| `forceColumnsOpen` | `boolean` | — | Forces the Columns panel open (used internally by the column header context menu). |
| `onColumnsPanelClose` | `() => void` | — | Called when the Columns panel closes after a `forceColumnsOpen`. |
| `children` | `ReactNode` | — | Content rendered on the **left** side of the toolbar, before the spacer. |
| `rightContent` | `ReactNode` | — | Content rendered on the **right** side, after all built-in buttons. |
| `className` | `string` | — | Additional CSS class on the toolbar root `<div>`. Use for visual theme overrides. |
| `style` | `CSSProperties` | — | Inline styles on the toolbar root. |
| `renderColumnsButton` | `(props: ToolbarButtonRenderProps) => ReactNode` | — | Replace the built-in Columns toggle button. The Columns panel still functions normally. |
| `renderFilterButton` | `(props: ToolbarButtonRenderProps) => ReactNode` | — | Replace the built-in Filters toggle button. The Filter panel still functions normally. |
| `renderAggregationButton` | `(props: ToolbarButtonRenderProps) => ReactNode` | — | Replace the built-in Summaries toggle button. The Aggregation panel still functions normally. |
| `renderExportButton` | `() => ReactNode` | — | Inject an Export button after the Aggregation button. No built-in export button exists. |
| `renderQuickFilter` | `(props: ToolbarQuickFilterRenderProps) => ReactNode` | — | Replace the built-in `GlobalSearch` input with your own component. |

### `ToolbarButtonRenderProps`

Passed to `renderColumnsButton`, `renderFilterButton`, and `renderAggregationButton`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `onClick` | `() => void` | Toggle the associated panel open or closed. |
| `isOpen` | `boolean` | Whether the associated panel is currently open. |
| `activeCount` | `number` | Active items: hidden columns for Columns, applied filters for Filter, configured aggregations for Summaries. |

### `ToolbarQuickFilterRenderProps`

Passed to `renderQuickFilter`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `value` | `string` | Current search string. |
| `onChange` | `(value: string) => void` | Call with the updated string when the input changes. |

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

---

## 📡 Event Callback Types

These interfaces describe the parameter objects passed to every event callback prop.

### `GridRowParams<R>`
Passed to `onRowClick`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `row` | `R` | The full row data object. |
| `id` | `GridRowId` | Unique identifier of the row. |
| `rowIndex` | `number` | Zero-based index of the row in the visible dataset. |

### `GridCellParams<R>`
Passed to `onCellClick` and `isCellEditable`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `row` | `R` | The full row data object. |
| `field` | `string` | The column field name. |
| `value` | `unknown` | The cell value (after `valueGetter`, before `valueFormatter`). |
| `colDef` | `GridColDef<R>` | The column definition. |
| `rowIndex` | `number` | Zero-based row index in the visible dataset. |
| `colIndex` | `number` | Zero-based column index. |

### `GridColumnOrderChangeParams`
Passed to `onColumnOrderChange`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `column` | `GridColDef` | The column definition that was moved. |
| `oldIndex` | `number` | Previous column index. |
| `targetIndex` | `number` | New column index after the move. |

### `GridRowOrderChangeParams<R>`
Passed to `onRowOrderChange`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `row` | `R` | The row data object that was moved. |
| `oldIndex` | `number` | Previous row index. |
| `targetIndex` | `number` | New row index after the move. |

### `GridRowScrollEndParams`
Passed to `onRowsScrollEnd`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `visibleTop` | `number` | Pixel offset of the topmost visible row. |
| `visibleBottom` | `number` | Pixel offset of the bottommost visible row. |
| `viewportHeight` | `number` | Current height of the scroll viewport in pixels. |

### `GridDetailPanelParams<R>`
Passed to `getDetailPanelContent` and `getDetailPanelHeight`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `row` | `R` | The full row data object. |
| `id` | `GridRowId` | Unique identifier of the row. |
| `rowIndex` | `number` | Zero-based index of the row in the visible dataset. |

---

## 🌐 Server-Side Data Source (`GridDataSource`)

The `dataSource` prop is the primary integration point for connecting the grid to a remote API. When set, the grid delegates data fetching — including pagination, sorting, filtering, and optionally aggregation — to your `getRows` function instead of processing the data locally.

### `GridDataSource<R>`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `getRows` | `(params: GridGetRowsParams) => Promise<GridGetRowsResponse<R>>` | Yes | Called whenever the grid needs data. The promise must resolve with rows and optionally a total row count. |
| `getAggregations` | `(params: Omit<GridGetRowsParams, 'startRow' \| 'endRow'>) => Promise<Record<string, unknown>>` | No | Called to fetch aggregate values for the full dataset (e.g. column totals). If omitted, aggregation results from `getRows.aggregationResults` are used instead. |

### `GridGetRowsParams`
The object passed to `getRows` by the grid on every data fetch.

| Property | Type | Description |
| :--- | :--- | :--- |
| `startRow` | `number` | Zero-based index of the first row to fetch (based on `page * pageSize`). |
| `endRow` | `number` | Zero-based index of the last row to fetch (exclusive). |
| `sortModel` | `GridSortItem[]` | Active sort configuration. Empty array when no sort is applied. |
| `filterModel` | `GridFilterModel` | Active filter state. Has empty `items` when no filters are applied. |
| `groupKeys` | `string[]` | Path of grouping key values for the current group level (used in lazy-loaded tree/grouping). Empty array for the root level. |
| `aggregationModel` | `GridAggregationModel \| undefined` | Active aggregation configuration, forwarded so the server can compute column summaries. |

### `GridGetRowsResponse<R>`
The object your `getRows` function must resolve with.

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `rows` | `R[]` | Yes | The rows for the requested page/range. |
| `rowCount` | `number` | No | Total number of rows in the full dataset. Required for server-side pagination; optional for infinite scroll. |
| `aggregationResults` | `Record<string, unknown>` | No | Column aggregation values for this response (e.g. `{ salary: 84500, age: 34.2 }`). |

### Complete Server-Side Usage Example

```tsx
import {
  DataGrid,
  GridDataSource,
  GridGetRowsParams,
  GridGetRowsResponse,
  GridRowModel,
  GridColDef,
} from '@opencorestack/opengridx';

interface Employee extends GridRowModel {
  id: number;
  name: string;
  department: string;
  salary: number;
}

const columns: GridColDef<Employee>[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'department', headerName: 'Department', width: 160 },
  { field: 'salary', headerName: 'Salary', type: 'number', width: 130 },
];

const dataSource: GridDataSource<Employee> = {
  getRows: async (params: GridGetRowsParams): Promise<GridGetRowsResponse<Employee>> => {
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await response.json();
    // data must have shape { rows: Employee[], total: number }
    return { rows: data.rows, rowCount: data.total };
  },

  getAggregations: async (params) => {
    const response = await fetch('/api/employees/aggregations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return response.json(); // e.g. { salary: 4250000 }
  },
};

export default function EmployeeGrid() {
  return (
    <DataGrid<Employee>
      rows={[]}
      columns={columns}
      dataSource={dataSource}
      paginationMode="server"
      sortingMode="server"
      filterMode="server"
      pagination
      pageSizeOptions={[25, 50, 100]}
      height={600}
    />
  );
}
```

**How the grid decides when to call `getRows`:** The hook fires (with a 300 ms debounce) whenever `paginationMode`, `sortingMode`, or `filterMode` is set to `'server'` AND a `dataSource` is provided. Any change to `sortModel`, `filterModel`, or `paginationModel` re-triggers the fetch. Stale responses from superseded requests are silently discarded — only the latest request updates the grid.

---

## 📌 Column & Row Pinning

### `GridColumnPinning`

Pinned columns stay visible at the left or right edge of the grid during horizontal scrolling.

```typescript
interface GridColumnPinning {
  left?: string[];   // field names pinned to the left edge
  right?: string[];  // field names pinned to the right edge
}
```

### `GridRowPinning`

Pinned rows stay visible at the top or bottom of the viewport during vertical scrolling. The values are **row IDs**, not full row objects.

```typescript
interface GridRowPinning {
  top?: GridRowId[];    // IDs of rows pinned to the top
  bottom?: GridRowId[]; // IDs of rows pinned to the bottom
}
```

### Column-level pinning control

Set `pinnable: false` on a `GridColDef` to prevent that column from being pinned via the UI menu.

### Usage Example

```tsx
import { DataGrid, GridColumnPinning, GridRowPinning } from '@opencorestack/opengridx';

<DataGrid
  rows={rows}
  columns={columns}
  // Pin 'name' to the left and 'actions' to the right
  pinnedColumns={{ left: ['name'], right: ['actions'] }}
  // Pin rows with id=1 to the top, id=99 to the bottom
  pinnedRows={{ top: [1], bottom: [99] }}
  // Checkbox and expand columns stay visible while scrolling horizontally
  checkboxSelection
  pinCheckboxColumn
  pinExpandColumn
/>
```

---

## 🔍 Filter Model Deep Reference

### `GridFilterModel`

The top-level filter state passed to `filterModel` and `onFilterModelChange`.

```typescript
interface GridFilterModel {
  items?: (GridFilterItem | GridFilterGroup)[];
  logicOperator?: 'and' | 'or';   // default: 'and'
  quickFilterValues?: string[];    // global search terms
}
```

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `items` | `(GridFilterItem \| GridFilterGroup)[]` | `[]` | Root-level filter conditions or nested groups. |
| `logicOperator` | `'and' \| 'or'` | `'and'` | How to combine the root `items`. |
| `quickFilterValues` | `string[]` | `[]` | Each string must match at least one field in the row (all strings must match). Applied before `items`. |

### `GridFilterItem`

A single column filter condition.

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string \| number` | No | Optional stable identifier for this item (useful for controlled updates). |
| `field` | `string` | Yes | The column field to filter on. |
| `operator` | `GridFilterOperator` | Yes | The comparison operator to apply. |
| `value` | `unknown` | No | The value to compare against. Not required for `isEmpty` / `isNotEmpty`. |

### `GridFilterGroup`

A nested group of filter conditions combined with a logical operator. Groups can be nested arbitrarily.

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string \| number` | No | Optional stable identifier. |
| `logicOperator` | `'and' \| 'or'` | Yes | How to combine the child `items` in this group. |
| `items` | `(GridFilterItem \| GridFilterGroup)[]` | Yes | Child conditions or nested groups. |

### `GridFilterOperator`

```typescript
type GridFilterOperator =
  | 'contains' | 'equals' | 'startsWith' | 'endsWith'
  | 'isEmpty'  | 'isNotEmpty' | 'isAnyOf'
  | '>'  | '>=' | '<' | '<=' | '!='
  | 'is' | 'not';
```

### Default Operators per Column Type

The filter panel shows only the operators relevant to each column's `type`. These are also the operators used when the grid applies client-side filtering.

| Column `type` | Default operator | Available operators |
| :--- | :--- | :--- |
| `string` (default) | `contains` | `contains`, `equals`, `startsWith`, `endsWith`, `isEmpty`, `isNotEmpty` |
| `number` | `=` (numeric eq.) | `=`, `!=`, `>`, `>=`, `<`, `<=`, `isEmpty`, `isNotEmpty` |
| `date` | `is` | `is`, `not`, `after`, `onOrAfter`, `before`, `onOrBefore`, `isEmpty`, `isNotEmpty` |
| `boolean` | `is` | `is` |
| `singleSelect` | `isAnyOf` | `isAnyOf`, `is`, `not` |

### Nested Group Example

```tsx
import { DataGrid, GridFilterModel } from '@opencorestack/opengridx';

const filterModel: GridFilterModel = {
  logicOperator: 'and',
  items: [
    // Simple item: department equals Engineering
    { id: 1, field: 'department', operator: 'equals', value: 'Engineering' },
    // Nested group: salary > 80000 OR title contains 'Lead'
    {
      id: 2,
      logicOperator: 'or',
      items: [
        { id: 3, field: 'salary', operator: '>', value: 80000 },
        { id: 4, field: 'title', operator: 'contains', value: 'Lead' },
      ],
    },
  ],
};

<DataGrid rows={rows} columns={columns} filterModel={filterModel} filterMode="client" />
```

---

## 💾 `GridInitialState` and `GridState`

`GridInitialState` is a type alias for `GridState`. Pass it to `initialState` to restore persisted grid state on mount (e.g. from `localStorage`). Each key corresponds to a feature slice — all are optional.

```typescript
type GridInitialState = GridState;

interface GridState {
  sorting?:    GridSortingState;
  filter?:     GridFilterState;
  pagination?: GridPaginationState;
  columns?:    GridColumnsState;
  density?:    GridDensityState;
  dataSource?: GridDataSourceState;
}
```

### State Slices

| Slice key | Interface | Shape |
| :--- | :--- | :--- |
| `sorting` | `GridSortingState` | `{ sortModel: GridSortItem[] }` |
| `filter` | `GridFilterState` | `{ filterModel: GridFilterModel }` |
| `pagination` | `GridPaginationState` | `{ paginationModel: GridPaginationModel; rowCount?: number }` |
| `columns` | `GridColumnsState` | `{ columnWidths: Record<string, number>; columnOrder: string[]; pinnedColumns?: GridColumnPinning; columnVisibilityModel?: Record<string, boolean> }` |
| `density` | `GridDensityState` | `{ density: 'compact' \| 'standard' \| 'comfortable' }` |
| `dataSource` | `GridDataSourceState` | `{ loading: boolean; error?: unknown }` (read-only — not meaningful to restore) |

### Restoring State from `localStorage`

The recommended way is `useGridStateStorage` (see Hooks section), but you can also drive it manually:

```tsx
import { DataGrid, GridState, GridInitialState } from '@opencorestack/opengridx';
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'my-grid-state';

function loadState(): GridInitialState | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GridInitialState) : undefined;
  } catch {
    return undefined;
  }
}

export default function PersistentGrid() {
  const [initialState] = useState<GridInitialState | undefined>(loadState);

  const handleStateChange = useCallback((state: GridState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, []);

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      initialState={initialState}
      onStateChange={handleStateChange}
    />
  );
}
```

---

## ∑ Aggregation Reference

### `GridAggregationModel`

A plain object mapping column field names to aggregation function names.

```typescript
interface GridAggregationModel {
  [field: string]: string; // e.g. { salary: 'sum', age: 'avg', name: 'count' }
}
```

### `GridAggregationResult`

The computed output, also a plain object mapping field names to their computed values.

```typescript
type GridAggregationResult = Record<string, unknown>;
// e.g. { salary: 420000, age: 34.2, name: 12 }
```

### Built-In Aggregation Functions

| Function | Input | Output | Description |
| :--- | :--- | :--- | :--- |
| `sum` | numeric values | `number` | Sum of all non-null numeric values in the group. |
| `avg` | numeric values | `number \| null` | Arithmetic mean. Returns `null` if there are no numeric values. |
| `min` | numeric values | `number \| null` | Smallest numeric value. Returns `null` if there are no numeric values. |
| `max` | numeric values | `number \| null` | Largest numeric value. Returns `null` if there are no numeric values. |
| `count` | any values | `number` | Count of non-null values. |
| `unique` | any values | `number` | Count of distinct non-null values (uses a `Set`). |

All built-in functions are exported as the `BuiltInAggFn` type: `'sum' | 'avg' | 'count' | 'min' | 'max' | 'unique'`.

Use `formatAggregationValue(value, fnName)` to turn a raw result into a display string. `avg` is formatted to 2 decimal places; all other numbers use `toLocaleString()`.

### `getAggregationPosition` Callback

```typescript
getAggregationPosition?: (groupNode: GridTreeNode | null) => 'inline' | 'footer' | null
```

Called once per group node (and once with `null` for the grand-total / root level) to decide where the aggregated row appears:

| Return value | Effect |
| :--- | :--- |
| `'inline'` | Aggregation values appear inside the group header row itself. |
| `'footer'` | A separate aggregation row is rendered below the group's last row. |
| `null` | Aggregation result is hidden for this group. |

### Aggregation + Row Grouping Example

```tsx
import {
  DataGrid,
  GridColDef,
  GridRowModel,
  GridTreeNode,
  GridAggregationModel,
  GridRowGroupingModel,
} from '@opencorestack/opengridx';

interface Employee extends GridRowModel {
  id: number;
  name: string;
  department: string;
  salary: number;
}

const columns: GridColDef<Employee>[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'department', headerName: 'Department', width: 160, groupable: true },
  { field: 'salary', headerName: 'Salary', type: 'number', width: 130, aggregable: true },
];

const aggregationModel: GridAggregationModel = { salary: 'sum' };
const rowGroupingModel: GridRowGroupingModel = ['department'];

export default function GroupedGrid() {
  return (
    <DataGrid<Employee>
      rows={rows}
      columns={columns}
      rowGroupingModel={rowGroupingModel}
      aggregationModel={aggregationModel}
      getAggregationPosition={(groupNode: GridTreeNode | null) => {
        // Show grand total at the footer, group totals inline
        return groupNode === null ? 'footer' : 'inline';
      }}
    />
  );
}
```

---

## 🗂️ Row Grouping

### `GridRowGroupingModel`

A simple array of field names that defines which columns the grid groups rows by, in order.

```typescript
type GridRowGroupingModel = string[];
// e.g. ['department']            → one level of grouping
// e.g. ['department', 'team']    → two levels (department → team → rows)
```

The referenced fields must have `groupable: true` (the default) on their `GridColDef`.

### Usage Example

```tsx
import { DataGrid, GridRowGroupingModel, GridAggregationModel } from '@opencorestack/opengridx';
import { useState } from 'react';

export default function GroupingExample() {
  const [rowGroupingModel, setRowGroupingModel] = useState<GridRowGroupingModel>(['department']);
  const [aggregationModel, setAggregationModel] = useState<GridAggregationModel>({
    salary: 'sum',
    age: 'avg',
  });

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      rowGroupingModel={rowGroupingModel}
      onRowGroupingModelChange={setRowGroupingModel}
      aggregationModel={aggregationModel}
      onAggregationModelChange={setAggregationModel}
    />
  );
}
```

### Interaction with `aggregationModel`

When `rowGroupingModel` is set, the grid creates group nodes (see `GridTreeNode`). The `aggregationModel` controls which columns show summaries on those nodes. The `getAggregationPosition` callback gives per-group control over whether the summary appears inline (in the group header row) or as a footer row below the group. For server-side grouping, return aggregation values in `GridGetRowsResponse.aggregationResults`.

---

## 🗃️ Column Group Headers

Column groups render spanning header cells above the normal column header row, allowing multi-level column organisation.

### `GridColumnGroup`

```typescript
interface GridColumnGroup {
  groupId: string;           // unique identifier for this group
  headerName: string;        // text shown in the spanning header cell
  headerClassName?: string;  // optional CSS class for custom styling
  children: Array<string | GridColumnGroup>; // field names (leaf) or nested groups
}

type GridColumnGroupingModel = GridColumnGroup[];
```

The `children` array can contain:
- **`string`** — a column `field` name, making this a leaf group that spans exactly those columns.
- **`GridColumnGroup`** — a nested sub-group, enabling multi-level spanning headers.

### Usage Example

```tsx
import { DataGrid, GridColumnGroup, GridColumnGroupingModel } from '@opencorestack/opengridx';

const columnGroupingModel: GridColumnGroupingModel = [
  {
    groupId: 'personal',
    headerName: 'Personal Info',
    children: ['firstName', 'lastName', 'age'],
  },
  {
    groupId: 'compensation',
    headerName: 'Compensation',
    children: [
      { groupId: 'base', headerName: 'Base', children: ['salary', 'bonus'] },
      { groupId: 'equity', headerName: 'Equity', children: ['options', 'rsu'] },
    ],
  },
];

export default function GroupedHeadersGrid() {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      columnGroupingModel={columnGroupingModel}
    />
  );
}
```

The grid renders two header rows: the spanning group row on top, and the regular per-column header row below. Groups that are not referenced in `columnGroupingModel` are rendered without a spanning header.

---

## 📋 List View

List view renders the grid as a single-column list of cards, replacing all normal column layout. It is designed for narrow viewports and mobile layouts.

### `GridListViewColDef<R>`

```typescript
interface GridListViewColDef<R extends GridRowModel = GridRowModel> {
  field: string;
  renderCell: (params: GridRenderCellParams<R>) => React.ReactNode;
}
```

The `renderCell` function receives the full `GridRenderCellParams` (including `row`), so you have access to every field of the row to build a rich card layout.

### Usage Example

```tsx
import { DataGrid, GridListViewColDef, GridRenderCellParams } from '@opencorestack/opengridx';

interface Employee extends GridRowModel {
  id: number;
  name: string;
  department: string;
  salary: number;
}

const listViewColumn: GridListViewColDef<Employee> = {
  field: 'card',
  renderCell: (params: GridRenderCellParams<Employee>) => (
    <div style={{ padding: '12px 16px' }}>
      <strong>{params.row.name}</strong>
      <span> — {params.row.department}</span>
      <div>${params.row.salary.toLocaleString()}</div>
    </div>
  ),
};

export default function MobileGrid() {
  return (
    <DataGrid<Employee>
      rows={rows}
      columns={columns}
      listView
      listViewColumn={listViewColumn}
    />
  );
}
```
