# 📖 OpenGridX API Reference

This document provides a comprehensive reference for all exported types, interfaces, and utility functions in the OpenGridX library.

---

## 🏗️ Core Components

### `<DataGrid />`
The main component for displaying and interacting with data.

#### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rows` | `R[]` | — | **Required.** Array of data objects. `R` is your row type: any object type, interfaces included (see [Typing your rows](#typing-your-rows)). Pass `[]` when a `dataSource` supplies the rows. |
| `columns` | `GridColDef<R>[]` or `GridColDef[]` | — | **Required.** Definitions for the columns: typed for your rows, or untyped. An inline array is fine (v3.0+): while every column is shallowly equal to the previous render's (same properties, callbacks compared by identity) the grid keeps its filter, sort and grouping results. A new inline callback (`valueGetter: (p) => …` written in the render) counts as a change. |
| `getRowId` | `(row: R) => GridRowId` | `row.id` | Returns a unique identifier for each row. It only keys the grid's internal store: rows reach `renderCell`, events, `apiRef` and `processRowUpdate` unchanged, and the id is never written to `row.id` (v3.0+). Pass it to export functions as `getRowId` when you export `selectedRows`. It must not throw: an id is a programming contract, so a throw is not contained (for a `dataSource` row it fails that request with the error overlay). |
| `rowHeight` | `number` | `52` | Height of each row in pixels. Without it, an enclosing `DataGridThemeProvider`'s `grid.rowHeightStandard` applies (v3.0+). |
| `headerHeight` | `number` | `56` | Height of the header row. Without it, the theme's `grid.headerHeight` applies (v3.0+). |
| `autoHeight` | `boolean` | `false` | Adjust grid height to match row total. |
| `overscanRowCount` | `number` | `3` | Minimum rows rendered outside the visible viewport. The grid adapts this upward automatically based on scroll velocity — this prop sets the floor. |
| `loading` | `boolean` | `false` | With no rows, the body shows skeleton rows (or `slots.loadingOverlay`). With rows already shown, they stay and a progress bar runs along the top of the grid (or `slots.loadingOverlay` is shown over them). Works in list view too. |
| `checkboxSelection` | `boolean` | `false` | Enable row selection via checkboxes. |
| `pagination` | `boolean` | `false` | Enable the bottom pagination bar. Ignored while `rowGroupingModel` is active (dev-mode warning) and with `paginationMode="infinite"`. |
| `paginationMode` | `'client' \| 'server' \| 'infinite'` | `'client'` | How to handle paging. `'infinite'` appends rows from the `dataSource` as `paginationModel.page` grows and never shows a pager or slices rows (see [Infinite Scroll](features/infinite-scroll.md)). |
| `paginationModel` | `GridPaginationModel` | — | Controlled pagination state (`{ page, pageSize }`). |
| `onPaginationModelChange` | `(model: GridPaginationModel) => void` | — | Fired when page or page size changes. |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Available page size options. The uncontrolled default page size is 100 when offered, else the first option. |
| `rowCount` | `number` | — | Server total for `paginationMode="server"` when you fetch pages yourself (read on every render). With a `dataSource`, the response's `rowCount` is used and this is only the fallback before the first response. |
| `height` | `number \| string` | `undefined` | Total height of the grid container. |
| `density` | `'compact' \| 'standard' \| 'comfortable'` | `'standard'` | Visual row density: compact = the theme's `grid.rowHeightCompact` or 32 px, standard = `rowHeight`, comfortable = the theme's `grid.rowHeightComfortable` or 72 px. |
| `initialState` | `GridInitialState` | `undefined` | Starting state (sort, filter, pagination, columns, density), read on mount. Seeds the grid's uncontrolled state; see [State Persistence](features/state-persistence.md). |
| `slots` | `GridSlots` | — | Custom component overrides: `toolbar`, `pagination`, `noRowsOverlay`, `loadingOverlay`, `footer`. See [`GridSlots`](#gridslots-and-gridslotprops) and the [Slots API](customization/slots-api.md). |
| `slotProps` | `GridSlotProps` | — | Props passed to the slots, keyed like `slots`. `slotProps.toolbar` is typed as `Partial<GridToolbarProps>` (plus any extra keys your own toolbar reads), so `GridToolbar` render props are type-checked (v3.0+). |
| `filterModel` | `GridFilterModel` | `undefined` | Active filters (controlled). Omit it to let the grid keep its own filter state, seeded from `initialState.filter` and changed by the toolbar or `apiRef.setFilterModel` (v3.0+). |
| `sortModel` | `GridSortItem[]` | `undefined` | Active sorting. |
| `onRowClick` | `(params: GridRowParams) => void` | — | Fired when a row is clicked. Tree-data parent rows are real rows: a click fires this and selects them (their chevron expands them). Not fired for synthetic rows (row-grouping group rows, subtotal rows, auto-created tree parents): clicking a group row toggles it. |
| `onRowDoubleClick` | `(params: GridRowParams) => void` | — | Fired when a row is double-clicked (v2.1+). Also fires for group rows, and (v3.0+) for the double-click that opens an editor on an editable cell; not fired on the checkbox, expand icon, drag handle or inside an open editor. |
| `onCellClick` | `(params: GridCellParams) => void` | — | Fired when a cell is clicked. Not fired for clicks inside an open editor (v3.0+). |
| `onStateChange` | `(state: GridState) => void` | — | Fired on mount and whenever the value of the sort, filter, pagination, column or density state changes (not on re-renders with equal props). |
| `processRowUpdate` | `(new, old) => R \| Promise<R>` | — | Called once per committed cell edit (Enter, Tab, blur, or the editor's cell leaving the grid). Return the row to store, or a Promise of it; the editor stays open until the Promise settles. Returning nothing is reported through `onProcessRowUpdateError`. See [Editing](features/editing-reordering.md#commit-and-cancel). |
| `dataSource` | `GridDataSource` | — | Remote data provider interface. |

#### Sorting, Filtering & Pagination

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sortingMode` | `'client' \| 'server'` | `'client'` | Set to `'server'` when your backend handles sorting. The grid calls `onSortModelChange` but does not re-sort rows locally, with or without a `dataSource` (v3.0+). |
| `filterMode` | `'client' \| 'server'` | `'client'` | Set to `'server'` when your backend handles filtering. The grid calls `onFilterModelChange` but does not re-filter rows locally, with or without a `dataSource` (v3.0+). |
| `multiSort` | `boolean` | `false` | When `true`, clicking any sortable column header appends/cycles it in the sort model instead of replacing it — no Shift key required. Shift+click always appends regardless of this prop. |
| `onSortModelChange` | `(model: GridSortItem[]) => void` | — | Fired when the active sort model changes. |
| `onFilterModelChange` | `(model: GridFilterModel) => void` | — | Fired when the active filter model changes. |

#### Row Selection

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rowSelectionModel` | `GridRowSelectionModel` | `[]` | Controlled selection state — array of selected row IDs. |
| `onRowSelectionModelChange` | `(model: GridRowSelectionModel) => void` | — | Fired when the selection changes. |
| `disableRowSelectionOnClick` | `boolean` | `false` | When `true`, clicking a row does not toggle its selection. |
| `disableMultipleRowSelection` | `boolean` | `false` | When `true`, at most one row can be selected at a time — by click, checkbox, Space or `apiRef` — and the header select-all checkbox is not shown. |
| `disableClipboardCopy` | `boolean` | `false` | When `true`, Ctrl+C / Cmd+C does not copy the selected rows, so the page or your own handler owns the shortcut. `apiRef.current.copySelectedRows()` still works. See [Clipboard](features/clipboard.md). |

#### Column Visibility

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `columnVisibilityModel` | `GridColumnVisibilityModel` | — | Map of `field → boolean` controlling which columns are visible (`false` = hidden). |
| `onColumnVisibilityModelChange` | `(model: GridColumnVisibilityModel) => void` | — | Fired when the visibility of any column changes. |

#### Column & Row Reordering

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `disableColumnReorder` | `boolean` | `false` | Disables drag-and-drop and Columns-panel reordering. A controlled `columnOrder` or `initialState.columns.columnOrder` still applies. |
| `columnOrder` | `GridColumnOrder` | — | Controlled ordered array of column field names. |
| `onColumnOrderChange` | `(params: GridColumnOrderChangeParams) => void` | — | Fired after the user moves one column (header drag or Columns panel drag). Indices are positions in the grid's full column order. |
| `onColumnOrderModelChange` | `(columnOrder: GridColumnOrder) => void` | — | Fired with the whole new column order after every change, including the Columns panel's **Reset**. Use it to keep a controlled `columnOrder` in sync (v3.0+). Not fired for generated pivot columns. |
| `rowReordering` | `boolean` | `false` | Enables drag-and-drop row reordering. |
| `onRowOrderChange` | `(params: GridRowOrderChangeParams) => void` | — | Fired after a row is dragged onto another row. Indices are positions in your `rows` prop. |

#### Pinning

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `pinnedColumns` | `GridColumnPinning` | — | Columns pinned to the left or right viewport edges. See [Column & Row Pinning](#-column--row-pinning). |
| `onPinnedColumnsChange` | `(model: GridColumnPinning) => void` | — | Fired when column pinning changes. |
| `pinnedRows` | `GridRowPinning` | — | Row IDs pinned to the top or bottom of the viewport. Pinned rows still have to pass the filter. Ignored (with a development warning) under tree data and row grouping, where the rows stay in the hierarchy. |
| `pinCheckboxColumn` | `boolean` | `true` | Keeps the checkbox column visible during horizontal scrolling. |
| `pinExpandColumn` | `boolean` | `true` | Keeps the Master-Detail expansion column visible during horizontal scrolling. |

#### Inline Editing

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `isCellEditable` | `(params: GridCellParams) => boolean` | — | Per-cell predicate. Return `false` to make a specific cell read-only even when the column has `editable: true`. Applies to double-click, Enter, Tab stops and `aria-readonly` (v3.0+). It can only restrict: a column without `editable: true` is never editable. A predicate that throws counts as `false`. |
| `onProcessRowUpdateError` | `(error: unknown) => void` | — | Fired if `processRowUpdate` (or `valueSetter`) throws, returns a rejected Promise, or returns something that is not a row. The editor stays open with the pending value. Use to display validation errors. |

#### Master-Detail

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `getDetailPanelContent` | `(params: GridDetailPanelParams) => ReactNode` | — | Returns the JSX content rendered inside the expandable detail panel. |
| `getDetailPanelHeight` | `(params: GridDetailPanelParams) => GridDetailPanelHeight` | `200` | Panel height in pixels (`0` is a 0px panel), or `'auto'` to fit the content. An `'auto'` panel is measured when it renders and whenever its size changes, and the rows below it are laid out at that height. Without this prop every panel is a fixed 200px scroll box. A callback that throws gets the 200px default (v3.0+, with a one-time development warning). |
| `detailPanelExpandedRowIds` | `Set<GridRowId>` | — | Controlled set of currently-expanded detail panel row IDs. |
| `onDetailPanelExpandedRowIdsChange` | `(ids: Set<GridRowId>) => void` | — | Fired when detail panels expand or collapse. |

#### Tree Data

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `treeData` | `boolean` | `false` | Enables hierarchical tree data display. |
| `getTreeDataPath` | `(row: R) => string[]` | — | Returns the hierarchy path for a row (e.g. `['Engineering', 'Frontend']`). Required with `treeData`: without it the rows are shown flat. Keep its identity stable (module scope or `useCallback`); a new function rebuilds the tree. It must not throw (a throw is not contained). |
| `groupingColDef` | `Partial<GridColDef<R>>` | — | Configures the dedicated `__group__` column prepended at position 0 (auto-pinned left) when row grouping or tree data is active. Under tree data its cells show the last segment of each row's `getTreeDataPath` (override with `groupingColDef.valueGetter`). Accepts `headerName`, `width`, `renderCell`, and any non-system `GridColDef` field. Its `renderCell` is called for group rows too (check `params.rowMeta?.isGroupRow`); its output replaces the default group label next to the toggle, and returning `undefined` for a group row keeps the default label. The column's `field` is always `'__group__'` (no `field` is needed; one you pass is ignored); it is never sorted, filtered, pinned by the user, exported, hidden, or re-ordered. Defaults: `headerName: 'Group'`, `width: 220`. |
| `defaultGroupingExpansionDepth` | `number` | `0` | Number of tree levels expanded on initial render (`-1` = all). |

#### Row Grouping & Aggregation

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rowGroupingModel` | `GridRowGroupingModel` | `[]` | Array of field names to group rows by (e.g. `['department', 'team']`). See [Row Grouping](#️-row-grouping). |
| `aggregationModel` | `GridAggregationModel` | — | Map of `field → aggFn` (e.g. `{ salary: 'sum', age: 'avg' }`). See [Aggregation Reference](#-aggregation-reference). |
| `onAggregationModelChange` | `(model: GridAggregationModel) => void` | — | Fired when the aggregation model changes. |
| `getAggregationPosition` | `(groupNode: GridTreeNode \| null) => 'inline' \| 'footer' \| null` | — | Controls where aggregation results appear. Called for every group node (with its current `isExpanded`) and once with `null` for the grand total. `'inline'` (group default) = on the group row, `'footer'` = on a subtotal row after the group's children while it is expanded (on the group row while collapsed), `null` = hidden. For the grand total, `null` hides the footer row. A callback that throws gets the default (`'inline'` for a group, `'footer'` for the grand total; v3.0+). See [the callback](#getaggregationposition-callback). |

#### Pivot

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `pivotMode` | `boolean` | `false` | Switches the grid to multidimensional Pivot Mode (client-side: ignored when a `dataSource` is set; tree data and row grouping are turned off while pivoting). See [Aggregation & Pivot](features/aggregation-pivot.md#-pivot-mode). |
| `pivotModel` | `GridPivotModel` | — | Controlled pivot configuration (row fields, column fields, value fields). |
| `onPivotModelChange` | `(model: GridPivotModel) => void` | — | Fired when the pivot model changes. |

#### Scroll & Viewport

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `onRowsScrollEnd` | `(params: GridRowScrollEndParams) => void` | — | Fired once each time the viewport comes within 100px of the bottom of the rows: after a vertical scroll, and also when the rows change while the end is in view (including rows that do not fill the viewport). It fires again only after the viewport leaves that zone or the row count changes; horizontal scrolling never fires it. `listView` follows the same once-per-arrival rule for its list (it re-arms when the list leaves the zone or the row count changes). Use it to load the next page in infinite-scroll mode. |

#### Accessibility & Appearance

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `ariaLabel` | `string` | — | ARIA label for the grid container element. |
| `noRowsLabel` | `string` | `'No Data'` | Message shown in the empty-state overlay when there are no rows. |
| `className` | `string` | — | Additional CSS class applied to the outermost grid wrapper element. |
| `style` | `React.CSSProperties` | — | Inline styles applied to the grid wrapper element. |

#### Localization

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `localeText` | `GridLocaleText` | — | Override user-visible strings: the Pagination labels and the empty-state label (`noRowsLabel`, which wins over the `noRowsLabel` prop). See [`GridLocaleText`](#gridlocaletext). |

#### Imperative Ref

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `apiRef` | `React.MutableRefObject<GridApi>` | — | Reactive ref to the imperative API. Create with `useGridApiRef()`. |

#### List View

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `listView` | `boolean` | `false` | Renders the grid as a single-column list of cards. Designed for mobile and responsive layouts. Requires `listViewColumn`; without it the grid view is shown and a dev warning is logged. |
| `listViewColumn` | `GridListViewColDef` | — | Column definition for list view mode. Must provide a `renderCell` function. The `field` value is used as a key. |

#### Column Group Headers

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `columnGroupingModel` | `GridColumnGroupingModel` | — | Defines spanning header rows above the regular column headers. See [Column Group Headers](#️-column-group-headers). |

### Typing your rows

`DataGrid` and every generic type (`GridColDef<R>`, `GridRenderCellParams<R>`, `GridRowParams<R>` …) take your row type `R`. Since v3.0 `R` can be any object type (`GridValidRowModel`), so your own interfaces work directly: they need no index signature and do not have to extend `GridRowModel`. `R` is inferred from `rows`.

```tsx
import { DataGrid } from '@opencorestack/opengridx';
import type { GridColDef } from '@opencorestack/opengridx';

interface Employee { id: number; name: string; salary: number }

// Typed columns: callbacks see `params.row` as Employee.
const columns: GridColDef<Employee>[] = [
  { field: 'name', renderCell: ({ row }) => row.name.toUpperCase() },
  { field: 'salary', valueGetter: ({ row }) => row.salary * 12,
    valueSetter: ({ row, value }) => ({ ...row, salary: Number(value) / 12 }) },
];

<DataGrid rows={employees} columns={columns} onRowClick={({ row }) => console.log(row.name)} />;
```

- **Untyped columns** (`GridColDef[]`, as in the README) work with rows of any type. Their callbacks see `params.row` as `GridRowModel` (any key, read as `unknown`). The `DataGridUntypedColumnsProps<R>` type describes these props.
- **Inline column arrays** (`columns={[{ field: 'name', renderCell: ({ row }) => … }]}`) get `R` from `rows`.
- **Rows without an `id`** need `getRowId`, e.g. `getRowId={(row) => row.code}`.
- A `GridColDef<Row>` for a type-alias row (or an interface that extends `GridRowModel`) can be used where a `GridColDef` is expected: the row callbacks are declared as methods, so they are checked bivariantly.
- `params.value` stays `unknown`; read typed values from `params.row`, or render `params.formattedValue`.
- The export functions, `usePivot` and `useAggregation` accept the same typed or untyped columns, and their options' `getRowId` takes your row type.
- `apiRef` methods (`getRow`, `getAllRows` …) return `GridRowModel`: the API object is not generic.
- For the component's props type, use `DataGridProps<R>`. `React.ComponentProps<typeof DataGrid>` resolves to the untyped-columns overload.

### `GridSlots` and `GridSlotProps`

The types of the `slots` and `slotProps` props (v3.0+ exports). Each slot is typed with the props the grid passes it, so a slot component with its own typed props (e.g. `function Footer({ rowCount }: { rowCount: number })`) is checked, and an inline slot (`footer: (props) => …`) gets its parameter typed. A function component typed `(props: Record<string, unknown>)` is still accepted; a class, `memo` or `forwardRef` component needs the slot's props type (e.g. `GridToolbarSlotProps`). A prop the grid does not pass (one you supply through `slotProps`) must be optional in your component, or close over it in an inline slot.

| Slot | Replaces | Receives |
| :--- | :--- | :--- |
| `toolbar` | Nothing by default: renders a toolbar above the grid. Use `GridToolbar` or your own component. | `GridToolbarSlotProps`: the toolbar props the grid owns (see [`GridToolbarProps`](#gridtoolbarprops)) plus `apiRef`, then `slotProps.toolbar`. |
| `pagination` | The built-in `Pagination` bar (shown with `pagination`). | `GridPaginationSlotProps` (= `PaginationProps`: `page`, `pageSize`, `rowCount`, `pageSizeOptions`, `onPageChange`, `onPageSizeChange`, `localeText`), then `slotProps.pagination`. |
| `noRowsOverlay` | The empty-state icon and label (shown when there are no rows and the grid is not loading). | `slotProps.noRowsOverlay` only (`GridOverlaySlotProps`). |
| `loadingOverlay` | The loading indicator: the skeleton rows while loading with no rows, the progress bar while loading with rows shown (the slot is then shown over them). | `slotProps.loadingOverlay` only (`GridOverlaySlotProps`). |
| `footer` | The pagination area. | `GridFooterSlotProps`: `apiRef`, `aggregationModel`, `aggregationResult`, `rowCount`, `pagination`, `paginationModel`, `pageSizeOptions`, `onPaginationModelChange`, then `slotProps.footer`. `rowCount` is the built-in pager's count (pinned rows excluded, v3.0+); under tree data or row grouping, the filtered data rows. |

```ts
type GridSlots = NonNullable<DataGridProps['slots']>;
type GridSlotProps = NonNullable<DataGridProps['slotProps']>;
```

---

## 🛠️ `GridToolbar`

The built-in toolbar component. Mount it via `slots={{ toolbar: GridToolbar }}`. The grid passes the models and change handlers it owns (plus `apiRef`), then spreads `slotProps.toolbar` over them, so any prop below can be set or overridden there (or directly when rendering `GridToolbar` yourself).

### `GridToolbarProps`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `columns` | `GridColDef[]` | `[]` | Column definitions — injected automatically when used via `slots`. |
| `baseColumns` | `GridColDef[]` | — | Pre-pivot columns shown in the Pivot panel instead of synthetic pivot columns. |
| `aggregationModel` | `GridAggregationModel` | `{}` | Current aggregation configuration. |
| `onAggregationModelChange` | `(model: GridAggregationModel) => void` | — | Called when the user changes aggregation settings. Presence of this prop renders the Summaries button; the grid always injects it when the toolbar is mounted via `slots`. |
| `pivotModel` | `GridPivotModel` | — | Current pivot configuration. |
| `onPivotModelChange` | `(model: GridPivotModel) => void` | — | Called when the user changes pivot settings. Presence of this prop renders the Pivot button; the grid injects it when `pivotMode`, `pivotModel` or `onPivotModelChange` is set. |
| `filterModel` | `GridFilterModel` | — | Current filter model. |
| `onFilterModelChange` | `(model: GridFilterModel) => void` | — | Called when the user changes filters or the quick-search value. Its presence renders the search bar and Filter button; the grid always injects it when the toolbar is mounted via `slots` (v3.0+). |
| `columnVisibilityModel` | `Record<string, boolean>` | `{}` | Current column visibility map. |
| `onColumnVisibilityModelChange` | `(model: Record<string, boolean>) => void` | — | Called when the user shows or hides a column. Presence renders the Columns button; the grid always injects it when the toolbar is mounted via `slots`. |
| `showNonHideableColumns` | `boolean` | `false` | Show `hideable: false` columns in the Columns panel as disabled rows. |
| `onColumnReorder` | `(from: string, to: string) => void` | — | Called when the user drags a column in the Columns panel. |
| `onColumnOrderReset` | `() => void` | — | Called when the user clicks "Reset order" in the Columns panel. |
| `forceColumnsOpen` | `boolean` | — | Opens the Columns panel when it becomes `true` (set by `DataGrid` for the column menu's **Manage columns**). If the toolbar slot does not render a `GridToolbar` that receives it, the grid opens its standalone Columns panel instead. |
| `onColumnsPanelClose` | `() => void` | — | Called whenever the Columns panel closes (its button, a custom button, another panel opening, click-outside or Escape). |
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
| `value` | `string` | Current search string: `filterModel.quickFilterValues` joined with spaces. |
| `onChange` | `(value: string) => void` | Call with the updated string when the input changes. The toolbar splits it on whitespace into `quickFilterValues` terms. |

---

## 🕹️ Imperative API (`GridApi`)

Access these methods via the `apiRef` prop.

| Method | Return | Description |
| :--- | :--- | :--- |
| `getRow(id)` | `GridRowModel \| null` | Get row data by ID (your row object, unchanged). |
| `getAllRows()` | `GridRowModel[]` | Get all loaded rows. |
| `getVisibleRows()` | `GridRowModel[]` | Get the rows on screen after filtering/sorting: pinned-top rows, the current page (or all rows without pagination), pinned-bottom rows. Under row grouping and tree data this is the visible hierarchy, group rows included. |
| `getColumn(field)` | `GridColDef \| null` | Get column definition by field. |
| `getVisibleColumns()` | `GridColDef[]` | Get the columns on screen, in render order (hidden columns excluded): left-pinned, unpinned, right-pinned, as the header shows them (v3.0+; before, pinned columns kept their unpinned position). |
| `selectRow(id, isSelected = true)` | `void` | Set selection for a single row. Fires `onRowSelectionModelChange`, unless nothing changes (selecting a selected row, deselecting an unselected one; v3.0+). Ids of rows the grid made (group headers, subtotals, auto-created tree parents, the pivot Grand Total) are ignored, as they are for the checkbox, click and keyboard (v3.0+). |
| `selectRows(ids, isSelected = true)`| `void` | Set selection for multiple rows. With `disableMultipleRowSelection`, selecting keeps only the last id. Same no-op and synthetic-id rules as `selectRow`. |
| `getSelectedRows()` | `GridRowId[]` | Get IDs of all selected rows. |
| `sortColumn(field, dir)` | `void` | Sort like a header click: replaces the sort model (or, with `multiSort`, updates/appends that field); `null` removes the field. Fires `onSortModelChange`. |
| `getSortModel()` | `GridSortItem[]` | Get the sort model the grid is using (controlled or not). |
| `setFilterModel(model)` | `void` | Set filters. Fires `onFilterModelChange`; with a controlled `filterModel`, update the prop from it. |
| `getFilterModel()` | `GridFilterModel` | Get the filter model the grid is using (controlled or not). |
| `setPage(page)` | `void` | Change current page (0-indexed). Fires `onPaginationModelChange`. |
| `setPageSize(pageSize)` | `void` | Change the page size and go to page 0. Fires `onPaginationModelChange`. |
| `scrollToIndexes(params)` | `void` | Scroll to specific row/column index. Uses the current layout, also when called from a layout effect right after an update (v3.0+). |
| `getAllColumns()` | `GridColDef[]` | Get all defined columns. |
| `getAggregationResult()` | `Record<string, unknown> \| null` | Get current aggregation results (`null` without an `aggregationModel`, and in pivot mode). Live in a parent's `useLayoutEffect` on mount and current after every update (v3.0+; before, it was installed in a passive effect). The same holds for `getAggregationModel()` and `getGroupedExportRows()`. |
| `getAggregationModel()` | `GridAggregationModel \| null` | Get the active aggregation configuration. |
| `getAllFilteredRows()` | `GridRowModel[]` | Get every row that passes the filter, sorted, regardless of pagination, including pinned rows. Under row grouping and tree data it returns the data rows (no group rows) in hierarchy order with every group expanded, ordered like the screen (also when sorting by the hierarchy column; v3.0+). With tree data and a filter, ancestors shown only to give a match its context are left out: the result is the set select-all and the aggregation footer act on (v3.0+). Use for full-dataset exports. |
| `getGroupedExportRows()` | `GridGroupedExportRow[] \| null` | Get a flat ordered list reflecting the active row-grouping tree (group-header, leaf, subtotal, grand-total), sorted and filtered like the screen. Collapsed groups are included with their rows, and subtotals are computed over each group's exported rows. Group-header and subtotal entries carry `groupLabel`, the label the grid shows (v3.0+). Returns `null` when row grouping is not active. |
| `copySelectedRows()` | `Promise<void>` | Copy every selected row that passes the filter (other pages, collapsed groups and pinned rows included) as TSV, with the visible columns in screen order. Resolves without writing when no selected row is found; rejects when the clipboard write fails. |

---

## 🌳 Internal Data Structures

### `GridTreeNode`
Used in Tree Data and Row Grouping hierarchies. This is what `getAggregationPosition` receives.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `GridRowId` | Unique ID of the row. |
| `parentId` | `GridRowId \| null` | ID of the parent node (`null` at the root). |
| `depth` | `number` | Nesting level (0 for root). |
| `groupingKey` | `string` | The key identifying this node within its parent. |
| `groupingField` | `string` (optional) | Row grouping: the field this node groups by. |
| `groupingValue` | `unknown` (optional) | The value this node is grouping by. |
| `isExpanded` | `boolean` | Current expansion state. |
| `children` | `GridRowId[]` (optional) | IDs of the direct child nodes. |
| `label` | `string` (optional) | Display label of the group. |
| `aggregatedValues` | `Record<string, unknown>` (optional) | Aggregates computed for this group, keyed by field. |
| `aggregationPosition` | `'inline' \| 'footer' \| null` (optional) | Where this group's aggregates are shown. |
| `descendantCount` | `number` (optional) | Row grouping: leaf rows in the group that pass the filter (recursive). |
| `serverChildrenCount` | `number` (optional) | Server-side tree data: the child count the server reported. |

---

## 📑 Column Definitions

### `GridColDef`
Defines the behavior and appearance of a single column.

#### Sizing & Layout

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `field` | `string` | — | **Required.** Unique identifier matching the row object key. |
| `headerName` | `string` | — | Text shown in the column header cell. |
| `description` | `string` | — | Tooltip shown on column header hover (rendered as the HTML `title` attribute — improves accessibility). |
| `width` | `number \| string` | unset: flexes | Fixed width in pixels, or a percentage string (`'30%'`): a share of the width left after the fixed-width columns, the same base for every percentage column. Unset (or `'auto'`), the column behaves like `flex: 1` and shares the free space with the flex columns (at least `minWidth`, 50px by default). Pinned and unpinned columns are sized the same way. Every width, including a manual resize, is clamped to `minWidth` / `maxWidth`. |
| `minWidth` | `number` | — | Minimum width in pixels (enforced during resize; 50 when omitted, or the column's own width if that is smaller). |
| `maxWidth` | `number` | — | Maximum width in pixels (enforced during resize; no limit when omitted). |
| `flex` | `number` | — | Flex grow factor — distributes remaining space proportionally. When both are set, `flex` wins over `width` until the user resizes the column. |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Horizontal alignment of cell content. |
| `headerAlign` | `'left' \| 'center' \| 'right'` | `align` | Horizontal alignment of the header cell content. Falls back to the column's `align`, then `'left'`. |
| `zIndex` | `number` | — | CSS `z-index` for the column's cells and header cell (pinned cells default to 3). |

#### Data & Type

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | `'string' \| 'number' \| 'date' \| 'boolean' \| 'singleSelect' \| 'image'` | `'string'` | Data type: sets the default filter operators and, when the column has no `valueFormatter`, the default cell text: `date` shows the local calendar date (`toLocaleDateString()`), `boolean` shows Yes / No, `singleSelect` shows the `valueOptions` label, `image` renders an `<img>` of the URL. `number` and `string` show `String(value)`. The text exporters (CSV, Excel HTML, print, PDF) and list view use the same text. |
| `valueOptions` | `Array<string \| number \| { value: unknown; label: string }>` | — | Allowed values for `type: 'singleSelect'` — the filter panel offers them as a (multi-)select, and the edit cell uses them; cells and exports show the option's label. |
| `valueGetter` | `(params: GridValueGetterParams) => unknown` | — | Derive a computed value from the row object. Runs before `valueFormatter` and `renderCell`. Client-side sorting, column filters and the quick filter use this value, and editors start from it (double-click and Enter alike). Keep it pure: the quick filter caches each row's search text per row object and column set. A getter that throws for a row shows an error in that cell and reads as `undefined` for sorting, filtering, aggregation, grouping, pivot and list view (v3.0+, with a one-time development warning per column); before, it crashed the grid once the column was sorted, filtered or aggregated. |
| `valueSetter` | `(params: GridValueSetterParams) => R` | — | v3.0+. Maps an edited value back onto the row (`{ value, row, field }` → updated row) when an edit is committed. Needed for editable `valueGetter` columns; without it the commit writes `row[field]` and a development warning is logged. |
| `valueFormatter` | `(params: GridValueFormatterParams) => string` | — | Format the value into a display string (e.g. currency, dates). Does not affect editing, sorting or column filters; the quick filter also searches the formatted text. A formatter that throws leaves the value unformatted (the quick filter searches the raw value; v3.0+). |

#### Rendering

| Property | Type | Description |
| :--- | :--- | :--- |
| `renderCell` | `(params: GridRenderCellParams) => ReactNode` | Fully custom cell renderer. Receives `value`, `formattedValue` (v2.1+, the `valueFormatter` output), `row`, `field`, `colDef`, `rowIndex`, `colIndex`, `rowMeta`. |
| `renderHeader` | `(params: GridRenderHeaderParams) => ReactNode` | Custom header cell renderer. Use for icons, sort indicators, or rich headers. |
| `renderEditCell` | `(params: GridRenderEditCellParams) => ReactNode` | Custom editor rendered when the cell enters edit mode. Requires `editable: true`. Receives the `renderCell` params (with `value` = the pending value) plus `onValueChange(value)`, `onCommit()` and `onCancel()` (v3.0+). Errors it throws are contained to the cell. |

#### Editing

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `editable` | `boolean` | `false` | Enables inline cell editing (double-click or Enter). Commit is handled by `DataGrid.processRowUpdate`. Row-grouping group rows and auto-generated tree ancestors are never editable; tree-data parent rows are. |

#### Spanning

| Property | Type | Description |
| :--- | :--- | :--- |
| `colSpan` | `number \| ((params: GridRenderCellParams) => number)` | Number of columns this cell merges horizontally: the origin plus the next visible columns in render order, clamped to the end of its pinned section. `params.value` is the `valueGetter` result. |
| `rowSpan` | `number \| ((params: GridRenderCellParams) => number)` | Number of rows this cell merges vertically, clamped to the end of its row section (top-pinned, scrolling or bottom-pinned rows) and to the first row with an expanded detail panel. |

Span values are floored; `Infinity` means "to the end"; `NaN`, `0` and negative values mean no span. A span function that throws is treated as `1` (with a development warning). With both set, the origin covers the whole `colSpan × rowSpan` rectangle. See [Cell Spanning](features/cell-spanning.md).

#### Styling

| Property | Type | Description |
| :--- | :--- | :--- |
| `cellClassName` | `string \| ((params: GridRenderCellParams) => string)` | CSS class applied to every cell in this column. Use a function for conditional per-row styling. |
| `headerClassName` | `string` | CSS class applied to the header cell. |

#### Feature Flags

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `sortable` | `boolean` | `true` | Enable/disable sorting for this column. |
| `filterable` | `boolean` | `true` | Enable/disable filtering for this column. `false` also removes it from the quick-filter search. |
| `resizable` | `boolean` | `true` | Allow the user to drag-resize this column. |
| `hideable` | `boolean` | `true` | Allow the user to hide this column from the UI. `false` removes it from the Columns panel (unless `showNonHideableColumns`) and removes **Hide Column** from its column menu. |
| `pinnable` | `boolean` | `true` | Allow this column to be pinned via the UI. `false` removes the pin actions from its column menu. Does not affect drag-reordering (v3.0+). |
| `disableColumnMenu` | `boolean` | `false` | Hide the column header kebab/context menu. |
| `exportable` | `boolean` | `true` | Set to `false` to exclude from CSV, Excel, JSON, PDF and Print exports (including their subtotals and totals). |
| `groupable` | `boolean` | `true` | Allow this column to be used as a row grouping dimension. Set to `false` to prevent this field from being grouped, even when it appears in `rowGroupingModel`, or used as a pivot row or column field (the pivot panel does not offer it). |
| `groupingValueFormatter` | `(params: { field: string; value: unknown }) => string` | — | Custom formatter for group-header labels when this column is the active grouping field. Falls back to `"field: value"` when omitted or when it throws (v3.0+). |
| `aggregable` | `boolean` | — | Whether this column can be aggregated. Unset, the toolbar's Summaries panel and the pivot panel's value fields offer it only for `type: 'number'` columns; `true` offers it for any type. `false` keeps it out of both panels, and an `aggregationModel` or `pivotModel` entry naming it is ignored (no footer total, group aggregate, pivot value or export total). |
| `availableAggregationFunctions` | `string[]` | all built-ins | Restrict which aggregation functions are computed and available for this column (e.g. `['sum', 'avg']`). Functions outside this list are skipped even if set in `aggregationModel` or a pivot value field, the toolbar's Summaries panel and the pivot panel offer only these. |

---

## 📂 Export Utilities

| Function | Return | Description |
| :--- | :--- | :--- |
| `exportToCsv(rows, cols, options?)` | `void` | Triggers download of a UTF-8 CSV file (with a byte-order mark and formula escaping by default, v3.0+). |
| `exportToJson(rows, cols, options?)` | `void` | Triggers download of JSON file. Values, including aggregation values, are raw. |
| `exportToExcel(rows, cols, options?)` | `void` | Basic `.xls` export (zero-dep HTML table). A `.xlsx` file name is renamed to `.xls` (v3.0+). |
| `exportToExcelAdvanced(rows, cols, options?)` | `Promise<void>` | Real `.xlsx` export (styled, multi-sheet, lazy-loaded). Accepts `groupedRows` for outlined grouped reports (v2.1+). |
| `exportToPdf(rows, cols, options?)` | `Promise<void>` | PDF report via the optional `jspdf` + `jspdf-autotable` peers. `font` registers a Unicode font (v3.0+). See [PDF Export](features/pdf-export.md). |
| `printGrid(rows, cols, titleOrOptions?)` | `Promise<void>` | Opens the browser print dialog. The third argument is a title string or `PrintOptions`. |

In every exporter, a non-empty `selectedRows` takes precedence over `groupedRows` (the selected rows are exported flat) and the totals are recomputed over the selected rows (v3.0+). See the [Export Guide](features/export-guide.md#selection-grouping-and-totals).

Every exporter takes `columns` typed for your rows (`GridColDef<R>[]`) or untyped (`GridColDef[]`), and its options also accept `getRowId?: (row: R) => GridRowId`. Pass the grid's `getRowId` when you use one: `selectedRows` holds those ids, and since v3.0 the grid no longer copies them onto `row.id`.

---

## 🧩 Standalone Components

The grid's building blocks are exported with their props types (the props types since v3.0). `DataGrid` renders all of them itself; import them to build your own layout or slot.

| Component | Props type | Description |
| :--- | :--- | :--- |
| `ColumnVisibilityPanel` | `ColumnVisibilityPanelProps` | Controlled column show/hide (and optional reorder) list, for use outside the grid (v2.1+). See [Column Visibility](components/column-visibility.md). |
| `GridToolbar` | `GridToolbarProps` | The built-in toolbar. See [`GridToolbar`](#️-gridtoolbar). |
| `Pagination` | `PaginationProps` | The built-in pagination bar (v3.0+ export), e.g. to wrap in a `pagination` slot. See [Pagination](components/pagination.md). |
| `FilterPanel` | `FilterPanelProps` | The filter rule editor (`filterModel`, `columns`, `onFilterModelChange`). See [Filter Panel](components/filter-panel.md). |
| `GridTooltip` | `GridTooltipProps` | Tooltip wrapper. See [Tooltip](components/tooltip.md). |
| `Header` | `HeaderProps` | The column header rows. See [Header](components/header.md). |
| `Row` | `RowProps` | One body row. See [Row](components/row.md). |
| `Cell` | `CellProps` | One body cell. See [Cell](components/cell.md). |
| `Skeleton` | `SkeletonProps` | Loading placeholder (`rows`, `columns`, both default 5). |
| `Button`, `Input`, `Checkbox` | `ButtonProps`, `InputProps`, `CheckboxProps` | The grid's form controls. `Button` defaults to `type="button"`. |

---

## 🎨 Theming & Styling

### `DataGridThemeProvider`
Context provider for overriding the grid's visual system.

#### `GridTheme` Object
- **`mode`**: `'light'` (default) or `'dark'`: the complete base palette the provider pins before applying the other keys (v3.0+).
- **`colors`**: `primary`, `primaryDark`, `primaryLight`, `primaryFocus`, `secondary*`, `success`, `warning`, `error`, `info`, `white`, `black`, `gray` (`{ 50 … 900 }`). Toolbar, menu, selection and focus accents derive from `primary*` unless set directly.
- **`typography`**: `fontFamily`, `fontFamilyMono`, `fontSizeXs` … `fontSizeXl`.
- **`spacing`**: `xs` … `xxl`. **`borders`**: `widthThin/Medium/Thick`, `radiusSm` … `radiusXl`, `color`, `colorHover`. **`shadows`**: `sm` … `xl`.
- **`grid`**: surfaces (`background`, `borderColor`, `headerBackground`, `headerText`, `headerHoverBackground`, `headerSortedBackground`, `rowText`, `rowHoverBackground`, `rowAlternateBackground`, `rowSelectedBackground`, `rowSelectedHoverBackground`, `cellFocusBorder`, `pinnedLeftShadow`, `pinnedRightShadow`, `checkboxBg`, `checkboxBorder`), sizing (`rowHeightCompact`, `rowHeightStandard`, `rowHeightComfortable`, `headerHeight` in px, read by the grid's layout; the `rowHeight` / `headerHeight` props win), `cellPaddingX`, `cellPaddingY`, `cellFontSize`, `headerFontSize`.
- **`toolbar`**, **`overlays`**, **`scrollbar`** (`thumbColor`, `trackColor`, `size`), **`skeleton`** (`baseColor`, `highlightColor`), **`transitions`**.

Presets: `darkTheme`, `roseTheme`, `emeraldTheme`, `amberTheme`, `compactTheme`. See [Theming](customization/theming.md).

---

## 🛠️ Hooks

### `useGridApiRef()`

Creates a typed ref to pass to the `apiRef` prop. Gives you imperative access to the grid after mount.

`apiRef.current` is never `null`: until the grid mounts it holds an API whose methods do nothing and whose getters return empty values. The grid installs the live API in a layout effect, so it is ready in your own `useLayoutEffect` / `useEffect` and in event handlers (v3.0+).

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
| `rows` | `R[]` | The rows to aggregate (already filtered: the hook aggregates every row it is given). Any object row type (v3.0+). |
| `aggregationModel` | `GridAggregationModel` | Map of `field → aggFn` (e.g. `{ salary: 'sum' }`). |
| `isServerSide` | `boolean` | If `true`, skips client computation and uses `serverAggregationResults`, else the result of `dataSource.getAggregations`. The grid sets it whenever a `dataSource` drives the rows (server or infinite pagination, server sorting or server filtering). |
| `columns` | `GridColDef[]` | Optional — column definitions, so values are read through each column's `valueGetter` and `availableAggregationFunctions` is honoured. |
| `filterModel` | `GridFilterModel` | Optional — sent to `dataSource.getAggregations`. It does not filter `rows`. |
| `sortModel` | `GridSortItem[]` | Optional — used when `dataSource` is provided. |
| `dataSource` | `GridDataSource` | Optional — server-side data adapter for async aggregation. |
| `serverAggregationResults` | `GridAggregationResult \| null` | Pre-fetched results when `isServerSide: true`. |

#### Return (`UseAggregationReturn`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `aggregationResult` | `GridAggregationResult` | Map of `field → computed value`. |
| `isLoading` | `boolean` | `true` while the `getAggregations` request for the current model, filter and sort is pending. |
| `error` | `unknown` | Set if the request for the current model, filter and sort failed. |

**Built-in aggregation functions:** `sum`, `avg`, `min`, `max`, `count`, `unique`

You can also use `formatAggregationValue(value, fnName)` to produce a display string from a raw result.

---

### `usePivot(rawRows, rawCols, model, enabled)`

Headless hook that transforms a flat dataset into pivot rows and pivot column definitions, with the same engine `<DataGrid pivotMode />` uses. Use it to pivot outside the grid (charts, custom exports). To show a pivot in the grid, prefer `pivotMode`: it also filters the source rows, keeps the Grand Total row last when sorting and leaves it out of select-all, which a grid given `pivotRows` as plain rows does not do.

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
| `rawRows` | `R[]` | Original flat dataset. Any object row type (v3.0+); `rawCols` may be `GridColDef<R>[]` or `GridColDef[]`. |
| `rawCols` | `GridColDef[]` | Original column definitions. |
| `model` | `GridPivotModel` | Pivot configuration — `rowFields`, `columnFields`, `valueFields`. |
| `enabled` | `boolean` | When `false`, returns empty arrays immediately (no computation). |

#### Return (`UsePivotReturn`)

| Field | Type | Description |
| :--- | :--- | :--- |
| `pivotRows` | `GridRowModel[]` | One row per row-field combination (ids `'__pivot_row__:["value", …]'`, from its row-field values), then the Grand Total row (id `'__pivot_grand_total__'`). There is no Grand Total row when `rawRows` is empty. |
| `pivotColumns` | `GridColDef[]` | Row-label columns (keeping the source column's formatter, renderer, type and alignment; `hideable: false`), then one value column per column key and value field. Value columns format aggregates like the footer. |
| `colKeys` | `string[]` | The distinct column-field value combinations, ordered by value (numbers numerically, strings naturally, blanks last). `['']` when there are no column fields. |
| `isValid` | `boolean` | `false` if the model has no usable row field or value field (fields on `groupable: false` columns and value fields whose function `availableAggregationFunctions` does not allow are skipped). |

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
| `clearState` | `() => void` | Removes the saved state from storage and cancels a pending write. |

If the key can change while the grid stays mounted, remount the grid with it (`<DataGrid key={storageKey} … />`): the grid reads `initialState` only on mount. When the browser blocks storage, the hook falls back to no persistence.

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
  valueFields: GridPivotValueField[];
}

interface GridPivotValueField {
  field: string;
  aggFn: GridPivotAggFn; // 'sum' | 'avg' | 'count' | 'min' | 'max'
  headerName?: string;
}
```

### `GridLocaleText`

Override user-visible strings in the Pagination component and the empty state. All fields are optional.

```typescript
interface GridLocaleText {
  paginationRowsPerPage?: string;
  paginationOf?: (from: number, to: number, count: number) => string;
  paginationPage?: (page: number, pageCount: number) => string;
  noRowsLabel?: string;
}
```

### `GridRowMeta`

Available via `params.rowMeta` in `renderCell`. Undefined for non-hierarchy rows.

```typescript
interface GridRowMeta {
  hasChildren?: boolean;
  treeDepth?: number;
  groupingField?: string;
  groupingValue?: unknown;
  groupLabel?: string;
  descendantCount?: number; // data rows below, at any depth, that pass the filter
  isExpanded?: boolean;
  isGroupRow?: boolean;     // synthetic row: group, subtotal or auto-created tree parent
  isGroupFooter?: boolean;  // v3.0: the subtotal row of a group ('footer' aggregation position)
}
```

### `GridGroupedExportRow`

One entry of the list returned by `apiRef.current.getGroupedExportRows()`, and the element type of every exporter's `groupedRows` option. Traverse in array order to reproduce the grouping.

```typescript
interface GridGroupedExportRow {
  type: 'group-header' | 'leaf' | 'group-subtotal' | 'grand-total';
  depth: number;                              // 0 = top-level group
  groupField?: string;                        // absent on 'leaf' and 'grand-total'
  groupValue?: unknown;                       // absent on 'leaf' and 'grand-total'
  groupLabel?: string;                        // v3.0: label as the grid shows it ('group-header', 'group-subtotal')
  aggregatedValues?: Record<string, unknown>; // 'group-subtotal' and 'grand-total'
  row?: GridRowModel;                         // 'leaf' only: your row object
}
```

### `GridDetailPanelHeight`

```typescript
type GridDetailPanelHeight = number | 'auto';
```

Returned by `getDetailPanelHeight`.

---

## 📡 Event Callback Types

These interfaces describe the parameter objects passed to every event callback prop.

Keyboard activation uses the same callbacks: **Enter** on a cell that is not editable runs the row-click handling (`onRowClick`, click-to-select, group expansion). See [Keyboard & Accessibility](features/keyboard-navigation.md) for every key and the ARIA structure.

### `GridRowParams<R>`
Passed to `onRowClick` and `onRowDoubleClick`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `row` | `R` | The full row data object. |
| `id` | `GridRowId` | Unique identifier of the row. |
| `rowIndex` | `number` | Zero-based index of the row among the rendered rows: top-pinned, then the current page, then bottom-pinned (the row's `data-rowindex`). |

### `GridCellParams<R>`
Passed to `onCellClick` and `isCellEditable`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `row` | `R` | The full row data object. |
| `field` | `string` | The column field name. |
| `value` | `unknown` | The cell value (after `valueGetter`, before `valueFormatter`). |
| `colDef` | `GridColDef<R>` | The column definition. |
| `rowIndex` | `number` | Zero-based index of the row among the rendered rows: top-pinned, then the current page, then bottom-pinned. |
| `colIndex` | `number` | Zero-based position of the column among the visible data columns in render order (left-pinned, unpinned, right-pinned); system columns are not counted. It does not change with horizontal scrolling (v3.0). |

### `GridRenderEditCellParams<R>`
Passed to `renderEditCell` (v3.0+). Everything in `GridRenderCellParams` (`value` is the pending, uncommitted value), plus:

| Property | Type | Description |
| :--- | :--- | :--- |
| `onValueChange` | `(value: unknown) => void` | Updates the pending value. Nothing is saved until `onCommit`. |
| `onCommit` | `() => void` | Commits the pending value through `processRowUpdate` and leaves edit mode. |
| `onCancel` | `() => void` | Discards the pending value and leaves edit mode. |

### `GridValueSetterParams<R>`
Passed to `valueSetter` (v3.0+).

| Property | Type | Description |
| :--- | :--- | :--- |
| `value` | `unknown` | The committed value from the editor. |
| `row` | `R` | The row as it was before the edit. |
| `field` | `string` | The column field name. |

### `GridColumnOrderChangeParams`
Passed to `onColumnOrderChange`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `column` | `GridColDef` | The column definition that was moved. |
| `oldIndex` | `number` | The column's position before the move, in the grid's full column order: every current column (hidden ones and the row-grouping `__group__` column included), in its current order. |
| `targetIndex` | `number` | Its position after the move, in the same order. |

Splicing the full order with these indices gives the new order. A controlled `columnOrder` that lists only some columns, or no `__group__`, is not that order: use `onColumnOrderModelChange`, which hands you the whole new order.

### `GridRowOrderChangeParams<R>`
Passed to `onRowOrderChange`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `row` | `R` | The row that was dragged: your own object from `rows`. |
| `oldIndex` | `number` | Its position in your `rows` prop (`rows[oldIndex] === row`), whatever the sort, filter, page or pinned rows on screen. |
| `targetIndex` | `number` | The position in `rows` of the row it was dropped on. Remove the row at `oldIndex` and insert it at `targetIndex`. |

### `GridRowScrollEndParams`
Passed to `onRowsScrollEnd`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `visibleTop` | `number` | Scroll offset (`scrollTop`) of the viewport's top edge, in pixels. |
| `visibleBottom` | `number` | Offset of the viewport's bottom edge (`visibleTop + viewportHeight`). |
| `viewportHeight` | `number` | Current height of the scroll viewport in pixels. |

### `GridDetailPanelParams<R>`
Passed to `getDetailPanelContent` and `getDetailPanelHeight`.

| Property | Type | Description |
| :--- | :--- | :--- |
| `row` | `R` | The full row data object. |
| `id` | `GridRowId` | Unique identifier of the row. |
| `rowIndex` | `number` | Zero-based index of the row among the rendered rows: top-pinned, then the current page, then bottom-pinned (the row's `data-rowindex`). |

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
| `startRow` | `number` | Zero-based index of the first row to fetch. Server pagination: `page * pageSize`. Infinite scroll: the number of rows already loaded. Client pagination and tree children: `0`. |
| `endRow` | `number` | Zero-based index just past the last row to fetch (exclusive), so `rows.slice(startRow, endRow)` is the requested range. Server pagination: `startRow + pageSize`. Infinite scroll: `(page + 1) * pageSize`. When the grid wants every row (client pagination, the children of a tree node) it is `Number.MAX_SAFE_INTEGER`. |
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

interface Employee {
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

**How the grid decides when to call `getRows`:** whenever a `dataSource` is provided, with a 300 ms debounce that collapses rapid changes into one request. The grid shows its loading state from the moment a request is scheduled, so the empty state never flashes up first.

| `paginationMode` | Request | Refetches when |
| :--- | :--- | :--- |
| `'client'` (default) | Every row once (`startRow: 0`, `endRow: Number.MAX_SAFE_INTEGER`). The grid pages, and sorts/filters unless those modes are `'server'`. | A `'server'` sort or filter changes, or `getRows` changes. Page changes never refetch. |
| `'server'` | One page. The response replaces the rows. | The page, page size, sort, filter or aggregation model changes, or `getRows` changes. |
| `'infinite'` | The rows from the end of what is loaded up to the current page. Responses are appended; rows whose id is already loaded are skipped. | The page grows. A sort, filter, page-size or `getRows` change restarts the list at row 0 and reports page 0 through `onPaginationModelChange`; a smaller page reloads the list up to that page. |

Models are compared by content, so inline `sortModel`/`filterModel`/`aggregationModel` objects and a `dataSource` object recreated with the same `getRows` function do not refetch. A response for parameters that have changed since (another page, sort, filter or `dataSource`, or a removed `dataSource`) is discarded. Fetched rows are keyed with `getRowId`. When `getRows` rejects, the error overlay shows the rejection's `message` (an `Error`, a string, or any object with a string `message`) and a **Retry** button that requests the rows again.

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
| `quickFilterValues` | `string[]` | `[]` | Search terms. Every term must be found (case-insensitive substring) in at least one visible, filterable column, read through `valueGetter` and, if set, `valueFormatter`. The row `id` and non-column fields are not searched. Blank terms are ignored. Applied together with `items`. The toolbar search box splits the typed text on whitespace. |

### `GridFilterItem`

A single column filter condition.

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string \| number` | No | Optional stable identifier for this item (useful for controlled updates). |
| `field` | `string` | Yes | The column field to filter on. |
| `operator` | `GridFilterOperator` | Yes | The comparison operator to apply. |
| `value` | `unknown` | No | The value to compare against. Not required for `isEmpty` / `isNotEmpty`. For every other operator, an empty value (`undefined`, `null`, a blank string or an empty array) means the item does not filter. |

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
  | '=' | '>'  | '>=' | '<' | '<=' | '!='
  | 'is' | 'not'
  | 'after' | 'onOrAfter' | 'before' | 'onOrBefore';
```

| Operator | Matches when the cell… |
| :--- | :--- |
| `contains` / `startsWith` / `endsWith` / `equals` | contains / starts with / ends with / equals the value (case-insensitive text). |
| `=` `!=` `>` `>=` `<` `<=` | compares numerically with the value (numeric strings accepted). A blank cell never matches, except for `!=`, which it always matches. |
| `is` / `not` | equals / does not equal the value (case-insensitive). On `type: 'date'` columns and `Date` cells: the same / a different local calendar day. |
| `after` / `onOrAfter` / `before` / `onOrBefore` | is a later / same-or-later / earlier / same-or-earlier local calendar day. |
| `isAnyOf` | equals any value in the array (a single value counts as a one-element array). |
| `isEmpty` / `isNotEmpty` | is / is not `null`, `undefined` or blank. No value needed. |

Dates can be `Date` objects, epoch milliseconds or date strings; a `'YYYY-MM-DD'` string is read as a local date. Cells are read through the column's `valueGetter`.

### Default Operators per Column Type

The filter panel shows only the operators relevant to each column's `type`; an operator set programmatically that the type does not list is still shown and applied. Every operator works in a programmatic `filterModel` on any column.

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

`GridInitialState` is `GridState` with every column field optional as well. Pass it to `initialState` to restore persisted grid state on mount (e.g. from `localStorage`). Each key corresponds to a feature slice — all are optional. A `GridState` from `onStateChange` is a valid `GridInitialState`.

```typescript
interface GridInitialState extends Omit<GridState, 'columns'> {
  columns?: Partial<GridColumnsState>; // e.g. { columnVisibilityModel: { age: false } }
}

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
| `sum` | numeric values | `number` | Sum of the numeric values (numbers, numeric strings, `Date`s as timestamps). Blank cells, booleans and arrays are skipped. `0` when there are none. |
| `avg` | numeric values | `number \| null` | Arithmetic mean of the same values. Returns `null` if there are none. |
| `min` | numeric values | `number \| Date \| null` | Smallest value; a `Date` when the smallest value is a `Date`. Returns `null` if there are none. |
| `max` | numeric values | `number \| Date \| null` | Largest value; a `Date` when the largest value is a `Date`. Returns `null` if there are none. |
| `count` | any values | `number` | Count of values that are not `null`, `undefined` or a blank string. |
| `unique` | any values | `number` | Count of distinct values, blanks excluded (uses a `Set`). |

Cells are read through the column's `valueGetter`.

All built-in functions are exported as the `BuiltInAggFn` type: `'sum' | 'avg' | 'count' | 'min' | 'max' | 'unique'`.

Use `formatAggregationValue(value, fnName)` to turn a raw result into a display string: `'—'` for `null` / `undefined`, `avg` to at most 2 decimal places, other numbers with `toLocaleString()`, anything else with `String(value)`.

### `getAggregationPosition` Callback

```typescript
getAggregationPosition?: (groupNode: GridTreeNode | null) => 'inline' | 'footer' | null
```

The return type is exported as `GridAggregationPosition` (`'inline' | 'footer' | null`, v3.0+).

Called on every render for each group node, with the node's current `isExpanded`, and once with `null` for the grand total. Only the answers matter, so an inline arrow function is fine.

| Return value | For a group | For the grand total (`null`) |
| :--- | :--- | :--- |
| `'inline'` | Aggregates on the group row (the default). | The footer row is shown. |
| `'footer'` | Aggregates on a subtotal row placed after the group's children while the group is expanded; the group row shows none. While the group is collapsed there is no subtotal row, so the aggregates stay on the group row. | The footer row is shown (the default). |
| `null` | No aggregates for this group, on screen or in `getGroupedExportRows()` (no `group-subtotal` entry). | The footer row is hidden, and `getGroupedExportRows()` has no `grand-total` entry. |

Subtotal rows are synthetic: `params.rowMeta` has `isGroupRow: true` and `isGroupFooter: true` (plus the group's `groupingField`, `groupingValue`, `groupLabel`), they carry the aggregates under each column's field, and they are never selected, edited or given a detail panel. Their row element has the class `ogx__row--group-footer`. To show subtotals below expanded groups only: `getAggregationPosition={(node) => (node === null ? 'footer' : node.isExpanded ? 'footer' : 'inline')}`.

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

interface Employee {
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
  const [aggregationModel, setAggregationModel] = useState<GridAggregationModel>({
    salary: 'sum',
    age: 'avg',
  });

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      rowGroupingModel={['department']}
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

The grid renders one group header row per nesting level above the regular per-column header row. Columns that are not referenced in `columnGroupingModel` get an empty filler cell in the group rows.

Group rows follow the columns as they are rendered:

- **Order, visibility and pinning** — a group covers its visible member columns in their current order. A group whose members are not adjacent (or that spans a pinned-section boundary) renders one group cell per run of adjacent members. Group cells over pinned columns are sticky, so they stay above their columns on horizontal scroll.
- **Widths** — a group cell is exactly as wide as its member columns, including flex, `auto` and percentage widths and manual resizes.
- **`headerClassName`** — added to the group cell's class list (next to `ogx-col-group-cell` and `ogx-col-group-cell--group`).
- **Column reordering** — header drag and the toolbar / columns-panel reorder keep groups intact: a column can only be moved onto a column of the same innermost group, and an ungrouped column only onto another ungrouped column.
- **Accessibility** — group cells are `role="columnheader"` with `aria-colspan` (visible member columns) and `aria-colindex`; filler cells are `aria-hidden`. The grid's `aria-rowcount` includes the group header rows.

---

## 📋 List View

List view renders the grid as a single-column list of cards, replacing all normal column layout. It is designed for narrow viewports and mobile layouts.

### `GridListViewColDef<R>`

```typescript
interface GridListViewColDef<R extends GridValidRowModel = GridRowModel> {
  field: string;
  renderCell: (params: GridRenderCellParams<R>) => React.ReactNode;
}
```

The `renderCell` function receives the full `GridRenderCellParams` (including `row`), so you have access to every field of the row to build a rich card layout.

### Usage Example

```tsx
import { DataGrid, GridListViewColDef, GridRenderCellParams, GridRowModel } from '@opencorestack/opengridx';

interface Employee {
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

---

## 🔧 Utilities

### `exportToPdf`

```ts
function exportToPdf<R extends GridValidRowModel>(
    rows: R[],
    columns: GridColDef<R>[],
    options?: PdfExportOptions
): Promise<void>
```

Generates a styled PDF report and triggers a browser download. Requires peer deps `jspdf` and `jspdf-autotable`. See [docs/features/pdf-export.md](./features/pdf-export.md) for full usage.

### `PdfExportOptions`

```ts
interface PdfExportOptions {
    fileName?: string;
    title?: string;
    logoUrl?: string;
    orientation?: 'portrait' | 'landscape';
    selectedRows?: (string | number)[];
    getRowId?: (row: GridRowModel) => GridRowId; // v3.0+
    aggregationResult?: Record<string, unknown> | null;
    aggregationModel?: GridAggregationModel | null;
    filterModel?: GridFilterModel | null;
    groupedRows?: GridGroupedExportRow[];
    alternateRowColor?: boolean;
    headerBackgroundColor?: string;
    headerTextColor?: string;
    fontSize?: number;
    font?: { name: string; data: string; boldData?: string }; // v3.0+
}
```

| Property | Type | Default | Description |
|:---|:---|:---|:---|
| `fileName` | `string` | `'export'` | Output filename without `.pdf` extension |
| `title` | `string` | — | Adds a branded header block above the table |
| `logoUrl` | `string` | — | Data URI or URL for a logo image (requires `title`) |
| `orientation` | `'portrait' \| 'landscape'` | `'landscape'` | Page orientation |
| `selectedRows` | `(string \| number)[]` | — | Export only rows with these IDs. Takes precedence over `groupedRows`; footer totals are recomputed over the selection (v3.0+) |
| `getRowId` | `(row) => GridRowId` | `row.id` | The grid's `getRowId`, to match `selectedRows` against rows that keep their id elsewhere (v3.0+) |
| `aggregationResult` | `Record<string, unknown>` | — | From `apiRef.current.getAggregationResult()` |
| `aggregationModel` | `GridAggregationModel` | — | From `apiRef.current.getAggregationModel()` |
| `filterModel` | `GridFilterModel` | — | From `apiRef.current.getFilterModel()`. Nested groups, the logic operator and quick-search terms are summarised; rules without a value are skipped |
| `groupedRows` | `GridGroupedExportRow[]` | — | Pre-built grouped export rows from `apiRef.current.getGroupedExportRows()`. When provided (and `selectedRows` is empty), the PDF table reflects the grouping structure (group-header, indented leaves, subtotals, grand total). |
| `alternateRowColor` | `boolean` | `true` | Alternating row background shading |
| `headerBackgroundColor` | `string` | `'#4f46e5'` | Column header cell background (`#rrggbb` / `#rgb`) |
| `headerTextColor` | `string` | `'#ffffff'` | Column header cell text color (`#rrggbb` / `#rgb`) |
| `fontSize` | `number` | `9` | Body cell font size in points |
| `font` | `{ name, data, boldData? }` | — | Base64 TrueType font for text outside Latin-1 (₹, CJK, Cyrillic…). Without it, such characters are replaced with `?` (v3.0+) |
