# OpenGridX | The Free Enterprise React DataGrid

![OpenGridX Hero Banner](docs/assets/banner.png)

**OpenGridX** is a premium, high-performance React DataGrid engine designed to break the "Pay-to-Play" model in the React ecosystem. It provides a pure-custom, zero-dependency alternative to enterprise grids like **MUI X DataGrid Pro** and **AG Grid**, offering advanced features for free.

👉 **[Live Demo & Docs](https://opencorestack.github.io/OpenGridX/)** — Interactive showcase with full API documentation

> **Upgrading from 2.x?** 3.0.0 changes formatted text, exported files, callback indices and request ranges. See the **[v2 → v3 migration guide](https://github.com/OpenCoreStack/OpenGridX/blob/main/docs/migration/v2-to-v3.md)** first: it starts with a table that maps what your app uses to the sections you need.

---

## 🛠️ Getting Started

### Installation

```bash
npm install @opencorestack/opengridx
```

```tsx
import { DataGrid } from '@opencorestack/opengridx';
import '@opencorestack/opengridx/styles';
```

> **Import the styles.** The CSS ships as a separate file (`dist/opengridx.css`) and the JavaScript bundle does **not** load it. Import `@opencorestack/opengridx/styles` once, typically in your app's root file (`main.tsx`, `App.tsx` or Next.js `layout.tsx`). Without it the grid is unstyled and, because the viewport's scrolling comes from the stylesheet, it grows to fit every row and virtualization stops working. Development builds log a one-time `[OpenGridX] The grid stylesheet is not loaded` warning when this happens.

---


## ⚡ Basic Example

```tsx
import { DataGrid, type GridColDef } from '@opencorestack/opengridx';
import '@opencorestack/opengridx/styles';

const columns: GridColDef[] = [
  { field: 'id',         headerName: 'ID',         width: 70 },
  { field: 'name',       headerName: 'Name',        width: 180 },
  { field: 'role',       headerName: 'Role',        width: 150 },
  { field: 'salary',     headerName: 'Salary',      width: 120, type: 'number',
    valueFormatter: ({ value }) => `$${(value as number).toLocaleString()}` },
  { field: 'department', headerName: 'Department',  width: 160 },
];

const rows = [
  { id: 1, name: 'Jon Snow',         role: 'Engineer',  salary: 95000,  department: 'Defense' },
  { id: 2, name: 'Cersei Lannister', role: 'Manager',   salary: 140000, department: 'Management' },
  { id: 3, name: 'Arya Stark',       role: 'Analyst',   salary: 65000,  department: 'Special Ops' },
];

export default function App() {
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      checkboxSelection
      pagination
      height={400}
    />
  );
}
```

Without a `height` prop the grid fills its container (`height: 100%`, or the free space as a flex item), so put it in a container with a bounded height: a definite `height`, and `min-height: 0` on every flex or grid item up to that element. In an unbounded container the grid grows to fit and every row is rendered (a development warning says so). See [Virtualization](docs/features/virtualization.md#the-grid-needs-a-bounded-height).

---

## 🚀 Key Features

- **High-Performance Virtualization**: Row and column virtualization for 100,000+ rows. (Browsers cap an element's height, so a single scrolling grid reaches about 645,000 rows at the default 52 px row height; page or stream larger datasets.)
- **Advanced Layouts**: Native support for **Row & Column Spanning**, Grouping, and Tree Data.
- **Data Orchestration**: 19 filter operators across string, number, date, boolean and select columns, AND/OR filter groups, multi-column sorting, and client or server pagination.
- **Zero UI Dependencies**: 100% vanilla CSS (BEM) and pure React/TypeScript logic.
- **Skeleton Loader**: Built-in animated skeleton rows that follow the current columns.
- **Fully Customizable**: Slots system for replacing any component (pagination, overlays, toolbar).
- **Export Functionality**: Built-in CSV, Excel (HTML `.xls`, or real `.xlsx` with the optional ExcelJS peer), JSON, PDF (optional jsPDF peer) and Print export.
- **Clipboard**: `Ctrl+C` / `Cmd+C` copies the selected rows' visible columns as TSV for Excel/Sheets.
- **Cell Range Selection** (v3.3): drag, Shift+click or Shift+arrows select a rectangle of cells; copy it as TSV and see its count, sum and average in a status bar (`cellSelection`, `showCellSelectionStats`).
- **AI Toolkit** (v3.4): `@opencorestack/opengridx/ai` turns your columns into a JSON Schema for your own model and validates its reply before the grid applies it (`getGridAiSchema`, `validateGridAiState`). No AI SDK, no row data sent by default.
- **Accessibility**: WCAG 2.1 AA — full ARIA roles and keyboard navigation.
- **Theming**: CSS variable API, `DataGridThemeProvider` with 5 built-in themes (`darkTheme`, `roseTheme`, `emeraldTheme`, `amberTheme`, `compactTheme`) and custom themes.
- **Column & Row Reordering**: Drag-and-drop column reordering and row reordering.
- **Inline Cell Editing**: Full inline editing with `processRowUpdate` validation.
- **State Persistence**: Save and restore grid state (sort, filter, pagination, columns, density) via `useGridStateStorage`.
- **AI-Native Integration**: Shipped with raw `lib/` source and `docs/` inside the npm package, allowing AI agents (Cursor, Copilot, Windsurf) to flawlessly implement features by "seeing" the internal logic.

---

## 🤖 AI-Powered Implementation

OpenGridX is built for the era of AI-native development. When you install `@opencorestack/opengridx`, we include the full raw source code and markdown documentation in your `node_modules`.

This means that **Cursor**, **GitHub Copilot**, **Windsurf**, and other AI agents can read the actual implementation patterns and docs to accurately help you build complex features like server-side tree data or pivot tables without guessing.

> **Tip for Cursor/Copilot users:** If your AI is struggling, tell it to "Read the docs and source in `./node_modules/@opencorestack/opengridx/docs`" for instant context.

---

## 📐 API Reference

### Core Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rows` | `GridRowModel[]` | — | **Required.** Array of data rows. The grid never modifies or copies them. |
| `columns` | `GridColDef[]` | — | **Required.** Column definitions. |
| `height` | `number \| string` | — | Grid height in pixels or a CSS string (e.g. `'100%'`). No default: fills its container's height (`height: 100%`, or `flex: 1` with `min-height: 0` as a flex item); in an auto-height container it grows to fit every row. |
| `autoHeight` | `boolean` | `false` | Grows the grid to fit all rows (renders every row). |
| `loading` | `boolean` | `false` | With no rows, shows skeleton rows (or `slots.loadingOverlay`). With rows shown, keeps them and runs a progress bar along the top (or shows `slots.loadingOverlay` over them). Works in list view too. |
| `density` | `'compact' \| 'standard' \| 'comfortable'` | `'standard'` | Row height preset: 32 px, `rowHeight`, 72 px. |
| `overscanRowCount` | `number` | `3` | Minimum rows rendered outside the viewport; raised automatically while scrolling fast. |
| `checkboxSelection` | `boolean` | `false` | Enables checkbox column for row selection. |
| `pagination` | `boolean` | `false` | Enables the pager. Ignored under row grouping and with `paginationMode="infinite"`. |
| `paginationModel` | `{ page: number; pageSize: number }` | — | Controlled pagination state (pair with `onPaginationModelChange`). |
| `onPaginationModelChange` | `(model) => void` | — | Fires on page or page size change. |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Available page size options. |
| `getRowId` | `(row) => GridRowId` | `row.id` | Custom row ID accessor. |
| `rowHeight` | `number` | `52` | Row height in pixels. |
| `headerHeight` | `number` | `56` | Header height in pixels. |
| `noRowsLabel` | `string` | `'No Data'` | Custom empty-state message. |
| `localeText` | `GridLocaleText` | — | Overrides for the pager and empty-state strings (i18n). |
| `ariaLabel` | `string` | — | Accessible name for the grid. |
| `initialState` | `GridInitialState` | — | Starting sort, filter, pagination, column and density state (uncontrolled). |
| `onStateChange` | `(state: GridState) => void` | — | Fires when sort, filter, pagination, columns or density change. |
| `apiRef` | `MutableRefObject<GridApi<R>> \| MutableRefObject<GridApi>` | — | Imperative API; create it with `useGridApiRef<R>()` so the row getters return your row type (or `useGridApiRef()` for `GridRowModel`). |
| `className` | `string` | — | Custom CSS class on the grid container. |
| `style` | `React.CSSProperties` | — | Custom inline styles on the grid container. |

### Column Definitions (`GridColDef`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `field` | `string` | — | **Required.** Must match the row object key. |
| `headerName` | `string` | — | Header label text. |
| `description` | `string` | — | Tooltip on header hover. |
| `width` | `number \| string` | — | Width in px, or a percentage string such as `'20%'`. A column with neither `width` nor `flex` behaves like `flex: 1`. |
| `flex` | `number` | — | Flex-grow weight — shares the space left after fixed and percentage columns. When set, `width` is ignored. |
| `minWidth` | `number` | — | Minimum width in px (layout and resizing; resizing defaults to 50). |
| `maxWidth` | `number` | — | Maximum width in px (layout and resizing). |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Cell content alignment. |
| `headerAlign` | `'left' \| 'center' \| 'right'` | `'left'` | Header content alignment. |
| `type` | `'string' \| 'number' \| 'date' \| 'boolean' \| 'singleSelect' \| 'image'` | `'string'` | Drives filter operators and, without a `valueFormatter`, the cell text: local date, Yes / No, `singleSelect` label, `<img>` for `image`. |
| `valueOptions` | `Array<string \| number \| { value, label }>` | — | Options list for `type: 'singleSelect'`. |
| `editable` | `boolean` | `false` | Enables inline cell editing. Pair with `processRowUpdate`. |
| `valueGetter` | `(params) => unknown` | — | Derive a computed cell value from the row. Sorting, filtering, quick search, aggregation, copy and export use it. |
| `valueSetter` | `(params) => row` | — | Maps an edited value back onto the row, for editable `valueGetter` columns. |
| `valueFormatter` | `(params) => string` | — | Format the display string (does not affect edit or sort; quick search also matches it). |
| `renderCell` | `(params) => ReactNode` | — | Fully custom cell renderer. |
| `renderHeader` | `(params) => ReactNode` | — | Custom header cell renderer. |
| `renderEditCell` | `(params) => ReactNode` | — | Custom editor rendered in edit mode. |
| `cellClassName` | `string \| ((params) => string)` | — | CSS class on every cell; use a function for conditional per-row styling. |
| `headerClassName` | `string` | — | CSS class on the header cell. |
| `groupingValueFormatter` | `({ field, value }) => string` | — | Label for group rows when grouping by this column (default `"field: value"`). |
| `colSpan` | `number \| ((params) => number)` | — | Merge cells horizontally. |
| `rowSpan` | `number \| ((params) => number)` | — | Merge cells vertically. |
| `sortable` | `boolean` | `true` | Enable/disable column sorting. |
| `sortComparator` | `(v1, v2, p1, p2) => number` | — | Custom ascending comparator (sees nulls; negated for desc). v3.1.0+ |
| `filterable` | `boolean` | `true` | Enable/disable column filtering. |
| `resizable` | `boolean` | `true` | Allow drag-resize; double-click the handle to auto-size to content (v3.1.0+). |
| `hideable` | `boolean` | `true` | Allow hiding via the column panel. |
| `pinnable` | `boolean` | `true` | Allow pinning via the UI. |
| `disableColumnMenu` | `boolean` | `false` | Hide the column header context menu. |
| `exportable` | `boolean` | `true` | Set to `false` to exclude from all exports. |
| `groupable` | `boolean` | `true` | Set to `false` to skip this column in `rowGroupingModel` and the pivot panel. |
| `aggregable` | `boolean` | — | `false` keeps the column out of aggregation. The Summaries panel offers `number` columns, plus any column with `aggregable: true`. |
| `availableAggregationFunctions` | `string[]` | all | Restrict which aggregation functions are offered. |

### Selection

| Prop | Type | Description |
| :--- | :--- | :--- |
| `rowSelectionModel` | `GridRowId[]` | Controlled selected row IDs. |
| `onRowSelectionModelChange` | `(model: GridRowId[]) => void` | Fires on selection change. |
| `disableRowSelectionOnClick` | `boolean` | Prevent row click from toggling selection. |
| `disableMultipleRowSelection` | `boolean` | Restrict to single-row selection. |
| `pinCheckboxColumn` | `boolean` | Keeps the checkbox column visible during horizontal scroll. Default `true`. |
| `disableClipboardCopy` | `boolean` | Turns off the grid's Ctrl/Cmd+C copy (`apiRef.current.copySelectedRows()` still works). |
| `cellSelection` | `boolean` | Spreadsheet-style cell range selection; Ctrl/Cmd+C then copies the range (v3.3). |
| `cellSelectionModel` / `onCellSelectionModelChange` | `GridCellSelectionModel` / `(model, { reason }) => void` | Controlled cell range. |
| `showCellSelectionStats` | `boolean` | Status bar with count, sum and average of the range. |

### Sorting & Filtering

| Prop | Type | Description |
| :--- | :--- | :--- |
| `sortModel` | `GridSortItem[]` | Controlled sort model. |
| `onSortModelChange` | `(model: GridSortItem[]) => void` | Fires on sort change. |
| `filterModel` | `GridFilterModel` | Controlled filter model. |
| `onFilterModelChange` | `(model: GridFilterModel) => void` | Fires on filter change. |
| `multiSort` | `boolean` | Every header click adds to the sort instead of replacing it (Shift+click always does). |

### Columns

| Prop | Type | Description |
| :--- | :--- | :--- |
| `columnVisibilityModel` | `GridColumnVisibilityModel` | Controlled column visibility. |
| `onColumnVisibilityModelChange` | `(model) => void` | Fires when column visibility changes. |
| `columnOrder` | `string[]` | Controlled column field order. |
| `onColumnOrderChange` | `(params) => void` | Fires when the user moves a column. |
| `onColumnOrderModelChange` | `(columnOrder) => void` | Fires with the whole new column order (also for the Columns panel's Reset). |
| `disableColumnReorder` | `boolean` | Disables drag-and-drop column reordering. |

### Events

| Prop | Type | Description |
| :--- | :--- | :--- |
| `onRowClick` | `(params: GridRowParams) => void` | Fires when a row is clicked (or Enter is pressed on a non-editable cell). |
| `onRowDoubleClick` | `(params: GridRowParams) => void` | Fires when a row is double-clicked. |
| `onCellClick` | `(params: GridCellParams) => void` | Fires when a cell is clicked. |
| `onRowsScrollEnd` | `(params: GridRowScrollEndParams) => void` | Fires once each time scrolling reaches the bottom. |

### Server-Side

| Prop | Type | Description |
| :--- | :--- | :--- |
| `paginationMode` | `'client' \| 'server' \| 'infinite'` | Data fetching mode. |
| `sortingMode` | `'client' \| 'server'` | Where sorting is applied. |
| `filterMode` | `'client' \| 'server'` | Where filtering is applied. |
| `dataSource` | `GridDataSource` | Server-side data adapter. |
| `rowCount` | `number` | Total rows for `paginationMode="server"` without a `dataSource` (with one, the response's `rowCount` wins). |

### Pinning

| Prop | Type | Description |
| :--- | :--- | :--- |
| `pinnedColumns` | `GridColumnPinning` | Pin columns to `left` or `right`. |
| `onPinnedColumnsChange` | `(model) => void` | Fires when column pinning changes. |
| `pinnedRows` | `GridRowPinning` | Pin rows (by id) to `top` or `bottom`. Ignored under tree data and row grouping. |

### Inline Editing

| Prop | Type | Description |
| :--- | :--- | :--- |
| `isCellEditable` | `(params: GridCellParams) => boolean` | Per-cell editability predicate. |
| `processRowUpdate` | `(newRow, oldRow) => R \| Promise<R>` | Handles row save; supports async validation. |
| `onProcessRowUpdateError` | `(error: unknown) => void` | Fires if `processRowUpdate` throws, rejects or returns no row. The cell then stays in edit mode with the typed value, so the user can correct it or press Escape to cancel. |

### Row Reordering

| Prop | Type | Description |
| :--- | :--- | :--- |
| `rowReordering` | `boolean` | Enables drag-and-drop row reordering. |
| `onRowOrderChange` | `(params) => void` | Fires when a row is dropped; `oldIndex` / `targetIndex` are positions in the `rows` prop. |

### Advanced Features

| Prop | Type | Description |
| :--- | :--- | :--- |
| `treeData` | `boolean` | Enables hierarchical tree data display. |
| `getTreeDataPath` | `(row) => string[]` | Returns the path array for each row in tree mode. |
| `groupingColDef` | `Partial<GridColDef>` | With `rowGroupingModel` or `treeData`, adds a dedicated `__group__` column, pinned left (`field` not needed). |
| `defaultGroupingExpansionDepth` | `number` | Initial expansion depth for tree data and row grouping. Default `0` (collapsed); `-1` expands everything. |
| `rowGroupingModel` | `GridRowGroupingModel` | Fields to group rows by (e.g. `['department']`). |
| `aggregationModel` | `GridAggregationModel` | Controlled aggregation state (e.g. `{ salary: 'sum' }`). |
| `onAggregationModelChange` | `(model) => void` | Fires when aggregation changes. |
| `getAggregationPosition` | `(groupNode) => 'inline' \| 'footer' \| null` | Where group and grand totals appear. |
| `pivotMode` | `boolean` | Switches the grid to multidimensional pivot mode. |
| `pivotModel` | `GridPivotModel` | Controlled pivot configuration (rows, columns, values). |
| `onPivotModelChange` | `(model) => void` | Fires when pivot model changes. |

### Master-Detail

| Prop | Type | Description |
| :--- | :--- | :--- |
| `getDetailPanelContent` | `(params) => ReactNode` | Renders the expandable detail panel. |
| `getDetailPanelHeight` | `(params) => number \| 'auto'` | Detail panel height in px, or `'auto'` to measure the content. Default 200. |
| `detailPanelExpandedRowIds` | `Set<GridRowId>` | Controlled expanded rows. |
| `onDetailPanelExpandedRowIdsChange` | `(ids) => void` | Fires when expanded rows change. |

### Customization

| Prop | Type | Description |
| :--- | :--- | :--- |
| `slots` | `GridSlots` | Replace built-in components (toolbar, pagination, overlays, footer). |
| `slotProps` | `object` | Pass custom props to slot components. |
| `listView` / `listViewColumn` | `boolean` / `GridListViewColDef` | Render rows as cards (mobile layouts). Honours loading, overlays and `slots.footer`; keyboard navigable; tree/group parents get an expand chevron. **Not virtualized:** every row of the page is rendered, so use `pagination` or server-side loading for more than a few thousand rows (development builds warn above 2,000). |
| `columnGroupingModel` | `GridColumnGroupingModel` | Multi-level column group headers. |

Per-cell styling uses `GridColDef.cellClassName` / `headerClassName`; themes are applied with `<DataGridThemeProvider theme={…}>` (see Theming below).

### `apiRef` — Imperative API

```tsx
const apiRef = useGridApiRef();
<DataGrid apiRef={apiRef} ... />

// Rows
apiRef.current.getRow(id)              // → GridRowModel | null
apiRef.current.getAllRows()            // → GridRowModel[]
apiRef.current.getVisibleRows()        // → GridRowModel[] (rows on screen: current page + pinned rows)
apiRef.current.getAllFilteredRows()    // → GridRowModel[] (every filtered + sorted row, all pages)
apiRef.current.getGroupedExportRows()  // → GridGroupedExportRow[] | null (row grouping only)

// Columns
apiRef.current.getColumn(field)        // → GridColDef | null
apiRef.current.getAllColumns()         // → GridColDef[]
apiRef.current.getVisibleColumns()     // → GridColDef[] (visible columns, display order)

// Selection
apiRef.current.selectRow(id, true)
apiRef.current.selectRows([id1, id2], true)
apiRef.current.getSelectedRows()       // → GridRowId[]

// Sorting
apiRef.current.sortColumn('name', 'asc')   // null removes the column's sort
apiRef.current.getSortModel()          // → GridSortItem[]

// Filtering
apiRef.current.setFilterModel(model)
apiRef.current.getFilterModel()        // → GridFilterModel

// Pagination
apiRef.current.setPage(2)
apiRef.current.setPageSize(50)

// Scroll
apiRef.current.scrollToIndexes({ rowIndex: 100, colIndex: 3 })
apiRef.current.autosizeColumn('name')   // fit to content (v3.1.0+)

// Clipboard
apiRef.current.copySelectedRows()      // → Promise<void>, rejects if the clipboard write fails

// Cell range selection (cellSelection, v3.3.0+)
apiRef.current.selectCellRange({ id: 1, field: 'q1' }, { id: 12, field: 'q4' })
apiRef.current.getSelectedCells()      // → { id, field, value }[]
apiRef.current.copySelectedCells()     // → Promise<void>
apiRef.current.clearCellSelection()

// Aggregation
apiRef.current.getAggregationResult()  // → Record<string, unknown> | null
apiRef.current.getAggregationModel()   // → GridAggregationModel | null
```

---

## 🎨 Customization & Extensibility

### Slots System

Replace any built-in component with your own:

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  slots={{
    toolbar: CustomToolbar,
    pagination: CustomPaginationComponent,
    noRowsOverlay: CustomEmptyState,
    loadingOverlay: CustomLoader,
    footer: CustomFooter
  }}
  slotProps={{
    toolbar: { /* custom props */ },
    pagination: { /* custom props */ }
  }}
/>
```

### Built-in Toolbar

```tsx
import { DataGrid, GridToolbar } from '@opencorestack/opengridx';

<DataGrid
  rows={rows}
  columns={columns}
  filterModel={filterModel}
  onFilterModelChange={setFilterModel}
  columnVisibilityModel={columnVisibilityModel}
  onColumnVisibilityModelChange={setColumnVisibilityModel}
  slots={{ toolbar: GridToolbar }}
/>
```

`GridToolbar` provides global search, column visibility management, advanced filters, and aggregation (Summaries) controls, plus a Pivot button when pivot mode is configured. Mounted through `slots.toolbar`, every control works without any filter or visibility props: the grid keeps that state itself, and the props above only make it controlled. Rendered on its own, outside a grid, `GridToolbar` hides each button whose callback prop (`onFilterModelChange`, `onColumnVisibilityModelChange`, `onAggregationModelChange`, `onPivotModelChange`) is not passed.

#### Customizing individual toolbar controls

Replace any single control using render props — the panels remain fully functional:

| Prop | What it replaces |
|------|-----------------|
| `renderQuickFilter(props)` | The search input. Receives `{ value, onChange }`. |
| `renderColumnsButton(props)` | The Columns toggle button. Receives `{ onClick, isOpen, activeCount }`. |
| `renderFilterButton(props)` | The Filters toggle button. Receives `{ onClick, isOpen, activeCount }`. |
| `renderAggregationButton(props)` | The Summaries toggle button. Receives `{ onClick, isOpen, activeCount }`. |
| `renderExportButton()` | Inserts an Export button slot (no built-in exists). |
| `className` | CSS class on the toolbar root for theme overrides. |

```tsx
import { GridToolbar, exportToCsv, useGridApiRef,
         type ToolbarButtonRenderProps, type ToolbarQuickFilterRenderProps } from '@opencorestack/opengridx';

const apiRef = useGridApiRef();

<DataGrid
  rows={rows}
  columns={columns}
  apiRef={apiRef}
  slots={{ toolbar: GridToolbar }}
  slotProps={{
    toolbar: {
      className: 'my-branded-toolbar',
      renderQuickFilter: ({ value, onChange }: ToolbarQuickFilterRenderProps) => (
        <input className="my-search" value={value} onChange={e => onChange(e.target.value)} />
      ),
      renderFilterButton: ({ onClick, isOpen, activeCount }: ToolbarButtonRenderProps) => (
        <button className={isOpen ? 'active' : ''} onClick={onClick}>
          Filters {activeCount > 0 && <span>{activeCount}</span>}
        </button>
      ),
      renderExportButton: () => (
        <button onClick={() => exportToCsv(apiRef.current.getAllFilteredRows(), apiRef.current.getVisibleColumns())}>
          Export CSV
        </button>
      ),
    },
  }}
/>
```

### Export Functionality

OpenGridX has **two tiers of Excel export**:

```tsx
import {
    exportToCsv,
    exportToExcel,          // ✅ built-in, zero deps
    exportToExcelAdvanced,  // ✅ rich .xlsx — requires: npm install exceljs
    exportToJson,
    exportToPdf,            // ✅ PDF — requires: npm install jspdf jspdf-autotable
    printGrid
} from '@opencorestack/opengridx';

exportToCsv(rows, columns, { fileName: 'data.csv' });
exportToExcel(rows, columns, { fileName: 'data.xls' });  // HTML table, opened by Excel as .xls
exportToExcelAdvanced(rows, columns, {
    fileName: 'data.xlsx',
    columnStyles: { avatar: { embedImage: true, imageWidth: 40, imageHeight: 40 } }
});
exportToJson(rows, columns, { fileName: 'data.json' });
await exportToPdf(rows, columns, { fileName: 'data', title: 'Report Title' });
printGrid(rows, columns, 'Report Title');
```

> **Optional peer dependencies:** `exportToExcelAdvanced` requires ExcelJS (`npm install exceljs`); `exportToPdf` requires `npm install jspdf jspdf-autotable`.

> **Large exports:** PDF size and time grow fast (75–120 MB and several seconds for 50,000 grouped rows). Since v3.2 `exportToPdf` yields between slices so the page stays responsive, reports `onProgress` and accepts an abort `signal`; above `maxRows` (default 20,000) it warns in development. For more than a few thousand rows export CSV or `.xlsx`. PDF's built-in font only covers Latin-1: pass the `font` option (a Unicode `.ttf`) for characters such as `₹`, otherwise they print as `?`. See [PDF Export](docs/features/pdf-export.md).

CSV and HTML-Excel exports neutralise spreadsheet formulas (text starting with `=`, `+`, `-`, `@`, a tab or a carriage return gets a leading `'`; opt out with `escapeFormulas: false`), and CSV starts with a UTF-8 BOM (`bom: false` omits it). `exportToExcel` writes an HTML table, so a `.xlsx` file name is saved as `.xls`. To export what the grid shows, pass `apiRef.current.getAllFilteredRows()` and `apiRef.current.getVisibleColumns()`; with a custom `getRowId`, also pass `getRowId` in the options so `selectedRows` match. See the [Export Guide](docs/features/export-guide.md).

### State Persistence

```tsx
import { useGridStateStorage } from '@opencorestack/opengridx';

const { initialState, onStateChange, clearState } = useGridStateStorage('my-grid-key');

<DataGrid
  rows={rows}
  columns={columns}
  initialState={initialState}
  onStateChange={onStateChange}
/>
```

### Theming

```tsx
import { DataGridThemeProvider, darkTheme } from '@opencorestack/opengridx';

<DataGridThemeProvider theme={darkTheme}>
  <DataGrid rows={rows} columns={columns} />
</DataGridThemeProvider>
```

Built-in themes: `darkTheme`, `roseTheme`, `emeraldTheme`, `amberTheme`, `compactTheme`. The provider pins a complete light or dark palette (`theme.mode`), whatever the operating system's colour scheme.

---

## ⚡ Performance & Bundle Size

| Artifact | Size | Gzipped | Notes |
| :--- | :--- | :--- | :--- |
| **Core ES Module** (`opengridx.es.js`) | 331 KB | **86 KB** | Use this — tree-shakeable |
| **Core UMD** (`opengridx.umd.js`) | 233 KB | **73 KB** | CommonJS / CDN compat |
| **Styles** (`opengridx.css`) | 65 KB | **10 KB** | `import '@opencorestack/opengridx/styles'` |
| **ExcelJS** (optional peer dep) | — | — | `npm install exceljs` |
| **jsPDF** (optional peer dep) | — | — | `npm install jspdf jspdf-autotable` |
| **npm package download** | — | **~1.1 MB** | Compressed tarball (includes `lib/` source, docs and source maps) |

- **Tree-shaking Ready**: ES Module build — bundlers (Vite, Webpack) only include what you use.
- **Zero UI Dependencies**: No MUI, Ant Design, or Radix. Pure React + vanilla CSS.
- **Lazy Advanced Export**: ExcelJS and jsPDF are optional peer deps — not bundled, loaded only when you call `exportToExcelAdvanced` / `exportToPdf`.
- **Efficient Rendering**: Row and column virtualization keeps the DOM small for 100k+ rows (needs a bounded grid height).

---

## 📚 Documentation

Full documentation at 👉 **[opencorestack.github.io/OpenGridX](https://opencorestack.github.io/OpenGridX/)** · 📖 **[Wiki](https://github.com/OpenCoreStack/OpenGridX/wiki)**

### 🏛️ Components
- **[DataGrid](docs/components/datagrid.md)** — Main component props and slots
- **[Toolbar & Pagination](docs/components/toolbar.md)** — Supplemental UI components
- **[Filter Panel](docs/components/filter-panel.md)** — Advanced filter panel component
- **[Column Visibility](docs/components/column-visibility.md)** — Column show/hide panel

### 🚀 Features
- **[Virtualization](docs/features/virtualization.md)** — 60fps rendering for 100k+ rows
- **[Filtering & Search](docs/features/filtering.md)** — Quick filters and advanced operators
- **[Sorting & Pagination](docs/features/sorting-pagination.md)** — Multi-column sorting
- **[Editing & Reordering](docs/features/editing-reordering.md)** — Inline edits and DnD
- **[Row Selection](docs/features/selection.md)** — Checkbox and multi-row interaction
- **[Pinning](docs/features/pinning.md)** — Sticky columns and rows
- **[State Persistence](docs/features/state-persistence.md)** — Save/Restore grid state
- **[Infinite Scroll](docs/features/infinite-scroll.md)** — Seamless lazy-loading
- **[Export Guide](docs/features/export-guide.md)** — Excel, CSV, JSON, and Print
- **[PDF Export](docs/features/pdf-export.md)** — Branded PDF reports
- **[Clipboard](docs/features/clipboard.md)** — Copy rows as TSV, paste from Excel / Sheets, clear a range with Delete
- **[Cell Range Selection](docs/features/cell-selection.md)** — Select, total and copy cell ranges
- **[Undo & Redo](docs/features/undo-redo.md)** — Undo and redo edits, pastes and range clears
- **[AI Toolkit](docs/features/ai-toolkit.md)** — Schema and validator for driving the grid from your own model, the **Ask AI** panel (`aiAssistant`) and agent tools
- **[Keyboard & Accessibility](docs/features/keyboard-navigation.md)** — Keys, focus and ARIA
- **[Data Source](docs/features/data-source.md)** — Server-side integration
- **[Loading States](docs/features/loading-states.md)** — Skeleton and shimmer overlays

### 📊 Advanced Data
- **[Aggregation & Pivot](docs/features/aggregation-pivot.md)** — Summary totals
- **[Tree Data & Grouping](docs/features/tree-data-grouping.md)** — Hierarchical rows
- **[Cell Spanning](docs/features/cell-spanning.md)** — Colspan and Rowspan
- **[Master-Detail](docs/features/master-detail.md)** — Expandable detail panels

### 🎨 Customization
- **[Theming Guide](docs/customization/theming.md)** — CSS variables and custom themes
- **[Slots API](docs/customization/slots-api.md)** — Component replacement system

---

## 🚀 Why OpenGridX?

Most React grids gatekeep essential features like **Row Grouping**, **Excel Export**, and **Master-Detail** behind expensive annual licenses. OpenGridX provides these premium capabilities out-of-the-box, with full source-code control and no external UI dependencies.

| Feature | MUI Free | MUI Pro ($$$) | AG Grid Community | **OpenGridX** |
| :--- | :---: | :---: | :---: | :---: |
| Virtualization | ✅ | ✅ | ✅ | ✅ |
| Column Pinning | ❌ | ✅ | ✅ | ✅ |
| Row Grouping | ❌ | ✅ | ✅ | ✅ |
| Tree Data | ❌ | ✅ | ✅ | ✅ |
| Master-Detail | ❌ | ✅ | ✅ | ✅ |
| Excel Export | ❌ | ✅ | ❌ | ✅ |
| Advanced Filtering | ❌ | ✅ | ❌ | ✅ |
| Aggregation | ❌ | ✅ | ❌ | ✅ |
| Pivot Mode | ❌ | ✅ | ❌ | ✅ |
| Inline Cell Editing | ❌ | ✅ | ✅ | ✅ |
| State Persistence | ❌ | ✅ | ❌ | ✅ |
| **Price** | Free | **$$$** | Free (limited) | **Free** |

---

## 🤝 Contributing

See [CONTRIBUTING.md](https://github.com/OpenCoreStack/OpenGridX/blob/main/CONTRIBUTING.md) and the [Code of Conduct](https://github.com/OpenCoreStack/OpenGridX/blob/main/CODE_OF_CONDUCT.md). Bugs and feature requests: [open an issue](https://github.com/OpenCoreStack/OpenGridX/issues/new/choose).

### 🧪 Testing

```bash
npm test                # unit tests (jsdom)
npm run test:browser    # real Chromium, Firefox and WebKit
npm run test:smoke      # pack the library, install it into React 18/19 apps, run Playwright
```

Which layer to use, and how the package smoke suite works: [docs/contributing/testing.md](https://github.com/OpenCoreStack/OpenGridX/blob/main/docs/contributing/testing.md).

---

## 📝 License

MIT © 2026 Open Core Stack
