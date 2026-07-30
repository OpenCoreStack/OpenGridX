# OpenGridX | The Free Enterprise React DataGrid

![OpenGridX Hero Banner](docs/assets/banner.png)

**OpenGridX** is a premium, high-performance React DataGrid engine designed to break the "Pay-to-Play" model in the React ecosystem. It provides a pure-custom, zero-dependency alternative to enterprise grids like **MUI X DataGrid Pro** and **AG Grid**, offering advanced features for free.

👉 **[Live Demo & Docs](https://opencorestack.github.io/OpenGridX/)** — Interactive showcase with full API documentation

---

## 🛠️ Getting Started

### Installation

```bash
npm install @opencorestack/opengridx
```

```tsx
import { DataGrid } from '@opencorestack/opengridx';
```

> **Styles:** The CSS is bundled as a separate file (`opengridx.css`) alongside the JS. It is imported automatically via the package barrel in most setups.
> However, **if your grid appears unstyled** (Vite, Next.js App Router, or SSR environments sometimes skip side-effect CSS auto-detection), add this explicit import once — typically in your app's root file (`main.tsx` / `layout.tsx`):
>
> ```tsx
> import '@opencorestack/opengridx/styles';
> ```

---


## ⚡ Basic Example

```tsx
import { DataGrid, GridColDef } from '@opencorestack/opengridx';

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

---

## 🚀 Key Features

- **High-Performance Virtualization**: Custom-built engine handling 100,000+ rows at 60fps.
- **Advanced Layouts**: Native support for **Row & Column Spanning**, Grouping, and Tree Data.
- **Data Orchestration**: 11+ filter operators, multi-column sorting, and robust pagination.
- **Zero UI Dependencies**: 100% vanilla CSS (BEM) and pure React/TypeScript logic.
- **Skeleton Loader**: Built-in animated loading states with smart column detection.
- **Fully Customizable**: Slots system for replacing any component (pagination, overlays, toolbar).
- **Export Functionality**: Built-in CSV, Excel, JSON, and Print export.
- **Clipboard**: `Ctrl+C` / `Cmd+C` copies selected rows as TSV for Excel/Sheets.
- **Accessibility**: WCAG 2.1 AA — full ARIA roles and keyboard navigation.
- **Theming**: CSS variable API with 5 built-in themes + custom theme support.
- **Column & Row Reordering**: Drag-and-drop column reordering and row reordering.
- **Inline Cell Editing**: Full inline editing with `processRowUpdate` validation.
- **State Persistence**: Save and restore grid state (sort, filter, columns) via `useGridStateStorage`.
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
| `rows` | `GridRowModel[]` | — | **Required.** Array of data rows. |
| `columns` | `GridColDef[]` | — | **Required.** Column definitions. |
| `height` | `number \| string` | `500` | Grid height in pixels or CSS string (e.g. `'100%'`). |
| `autoHeight` | `boolean` | `false` | Expands grid height to fit all rows. |
| `loading` | `boolean` | `false` | Shows skeleton loader when `true`. |
| `density` | `'compact' \| 'standard' \| 'comfortable'` | `'standard'` | Visual row density. |
| `checkboxSelection` | `boolean` | `false` | Enables checkbox column for row selection. |
| `pagination` | `boolean` | `false` | Enables client-side pagination. |
| `paginationModel` | `{ page: number; pageSize: number }` | — | Controlled pagination state. |
| `onPaginationModelChange` | `(model) => void` | — | Fires on page or page size change. |
| `pageSizeOptions` | `number[]` | `[10, 25, 50]` | Available page size options. |
| `getRowId` | `(row) => GridRowId` | `row.id` | Custom row ID accessor. |
| `rowHeight` | `number` | `52` | Row height in pixels. |
| `headerHeight` | `number` | `56` | Header height in pixels. |
| `noRowsLabel` | `string` | — | Custom empty-state message. |
| `className` | `string` | — | Custom CSS class on the grid container. |
| `style` | `React.CSSProperties` | — | Custom inline styles on the grid container. |

### Selection

| Prop | Type | Description |
| :--- | :--- | :--- |
| `rowSelectionModel` | `GridRowId[]` | Controlled selected row IDs. |
| `onRowSelectionModelChange` | `(model: GridRowId[]) => void` | Fires on selection change. |
| `disableRowSelectionOnClick` | `boolean` | Prevent row click from toggling selection. |
| `disableMultipleRowSelection` | `boolean` | Restrict to single-row selection. |
| `pinCheckboxColumn` | `boolean` | Keeps the checkbox column visible during horizontal scroll. |

### Sorting & Filtering

| Prop | Type | Description |
| :--- | :--- | :--- |
| `sortModel` | `GridSortItem[]` | Controlled sort model. |
| `onSortModelChange` | `(model: GridSortItem[]) => void` | Fires on sort change. |
| `filterModel` | `GridFilterModel` | Controlled filter model. |
| `onFilterModelChange` | `(model: GridFilterModel) => void` | Fires on filter change. |
| `disableColumnFilter` | `boolean` | Disables column-level filtering. |

### Columns

| Prop | Type | Description |
| :--- | :--- | :--- |
| `columnVisibilityModel` | `GridColumnVisibilityModel` | Controlled column visibility. |
| `onColumnVisibilityModelChange` | `(model) => void` | Fires when column visibility changes. |
| `columnOrder` | `string[]` | Controlled column field order. |
| `onColumnOrderChange` | `(params) => void` | Fires when columns are reordered. |
| `disableColumnReorder` | `boolean` | Disables drag-and-drop column reordering. |

### Events

| Prop | Type | Description |
| :--- | :--- | :--- |
| `onRowClick` | `(params: GridRowParams) => void` | Fires when a row is clicked. |
| `onCellClick` | `(params: GridCellParams) => void` | Fires when a cell is clicked. |
| `onRowsScrollEnd` | `(params: GridRowScrollEndParams) => void` | Fires when scrolling reaches the bottom. |

### Server-Side

| Prop | Type | Description |
| :--- | :--- | :--- |
| `paginationMode` | `'client' \| 'server' \| 'infinite'` | Data fetching mode. |
| `sortingMode` | `'client' \| 'server'` | Where sorting is applied. |
| `filterMode` | `'client' \| 'server'` | Where filtering is applied. |
| `dataSource` | `GridDataSource` | Server-side data adapter. |
| `rowCount` | `number` | Total rows for server-side pagination. |

### Pinning

| Prop | Type | Description |
| :--- | :--- | :--- |
| `pinnedColumns` | `GridColumnPinning` | Pin columns to `left` or `right`. |
| `onPinnedColumnsChange` | `(model) => void` | Fires when column pinning changes. |
| `pinnedRows` | `GridRowPinning` | Pin rows to `top` or `bottom`. |
| `onPinnedRowsChange` | `(model) => void` | Fires when row pinning changes. |

### Inline Editing

| Prop | Type | Description |
| :--- | :--- | :--- |
| `isCellEditable` | `(params: GridCellParams) => boolean` | Per-cell editability predicate. |
| `processRowUpdate` | `(newRow, oldRow) => R \| Promise<R>` | Handles row save; supports async validation. |
| `onProcessRowUpdateError` | `(error: unknown) => void` | Fires if `processRowUpdate` throws. |

### Row Reordering

| Prop | Type | Description |
| :--- | :--- | :--- |
| `rowReordering` | `boolean` | Enables drag-and-drop row reordering. |
| `onRowOrderChange` | `(params) => void` | Fires when rows are reordered. |

### Advanced Features

| Prop | Type | Description |
| :--- | :--- | :--- |
| `treeData` | `boolean` | Enables hierarchical tree data display. |
| `getTreeDataPath` | `(row) => string[]` | Returns the path array for each row in tree mode. |
| `groupingColDef` | `GridColDef` | Overrides the auto-generated grouping column. |
| `defaultGroupingExpansionDepth` | `number` | Initial expansion depth for tree data. |
| `rowGroupingModel` | `GridRowGroupingModel` | Controlled row grouping state. |
| `onRowGroupingModelChange` | `(model) => void` | Fires when grouping changes. |
| `aggregationModel` | `GridAggregationModel` | Controlled aggregation state (e.g. `{ salary: 'sum' }`). |
| `onAggregationModelChange` | `(model) => void` | Fires when aggregation changes. |
| `pivotMode` | `boolean` | Switches the grid to multidimensional pivot mode. |
| `pivotModel` | `GridPivotModel` | Controlled pivot configuration (rows, columns, values). |
| `onPivotModelChange` | `(model) => void` | Fires when pivot model changes. |

### Master-Detail

| Prop | Type | Description |
| :--- | :--- | :--- |
| `getDetailPanelContent` | `(params) => ReactNode` | Renders the expandable detail panel. |
| `getDetailPanelHeight` | `(params) => number \| 'auto'` | Controls detail panel height. |
| `detailPanelExpandedRowIds` | `Set<GridRowId>` | Controlled expanded rows. |
| `onDetailPanelExpandedRowIdsChange` | `(ids) => void` | Fires when expanded rows change. |

### Customization

| Prop | Type | Description |
| :--- | :--- | :--- |
| `slots` | `GridSlots` | Replace built-in components (toolbar, pagination, overlays, footer). |
| `slotProps` | `GridSlotProps` | Pass custom props to slot components. |
| `getRowClassName` | `(params) => string` | Add custom CSS class to rows. |
| `getCellClassName` | `(params) => string` | Add custom CSS class to cells. |
| `theme` | `GridTheme` | Apply a custom theme object. |

### `apiRef` — Imperative API

```tsx
const apiRef = useGridApiRef();
<DataGrid apiRef={apiRef} ... />

// Rows
apiRef.current.getRow(id)              // → GridRowModel | null
apiRef.current.getAllRows()            // → GridRowModel[]
apiRef.current.getVisibleRows()        // → GridRowModel[] (post-filter/sort)

// Columns
apiRef.current.getColumn(field)        // → GridColDef | null
apiRef.current.getAllColumns()         // → GridColDef[]
apiRef.current.getVisibleColumns()     // → GridColDef[]

// Selection
apiRef.current.selectRow(id, true)
apiRef.current.selectRows([id1, id2], true)
apiRef.current.getSelectedRows()       // → GridRowId[]

// Sorting
apiRef.current.sortColumn('name', 'asc')
apiRef.current.getSortModel()          // → GridSortItem[]

// Filtering
apiRef.current.setFilterModel(model)
apiRef.current.getFilterModel()        // → GridFilterModel

// Pagination
apiRef.current.setPage(2)
apiRef.current.setPageSize(50)

// Scroll
apiRef.current.scrollToIndexes({ rowIndex: 100, colIndex: 3 })

// Clipboard
apiRef.current.copySelectedRows()      // → Promise<void>

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
  slots={{ toolbar: GridToolbar }}
/>
```

`GridToolbar` provides global search, column visibility panel, filter panel, and export controls out of the box.

### Export Functionality

OpenGridX has **two tiers of Excel export**:

```tsx
import {
    exportToCsv,
    exportToExcel,          // ✅ built-in, zero deps
    exportToExcelAdvanced,  // ✅ rich .xlsx — requires: npm install exceljs
    exportToJson,
    printGrid
} from '@opencorestack/opengridx';

exportToCsv(rows, columns, { fileName: 'data.csv' });
exportToExcel(rows, columns, { fileName: 'data.xlsx' });
exportToExcelAdvanced(rows, columns, {
    fileName: 'data.xlsx',
    columnStyles: { avatar: { embedImage: true, imageWidth: 40, imageHeight: 40 } }
});
exportToJson(rows, columns, { fileName: 'data.json' });
printGrid(rows, columns, 'Report Title');
```

> **Optional peer dependency:** `exportToExcelAdvanced` requires ExcelJS:
> ```bash
> npm install exceljs
> ```

### State Persistence

```tsx
import { useGridStateStorage } from '@opencorestack/opengridx';

const { initialState, onStateChange } = useGridStateStorage('my-grid-key');

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

Built-in themes: `darkTheme`, `roseTheme`, `emeraldTheme`, `amberTheme`, `compactTheme`

---

## ⚡ Performance & Bundle Size

| Artifact | Minified | Gzipped | Notes |
| :--- | :--- | :--- | :--- |
| **Core ES Module** (`opengridx.es.js`) | 242 KB | **58 KB** | Use this — tree-shakeable |
| **Core UMD** (`opengridx.umd.js`) | 164 KB | **48 KB** | CommonJS / CDN compat |
| **Styles** (`opengridx.css`) | 62 KB | **10 KB** | Auto-included |
| **ExcelJS** (optional peer dep) | — | — | `npm install exceljs` |
| **npm package download** | — | **613 KB** | Total compressed tarball |

- **Tree-shaking Ready**: ES Module build — bundlers (Vite, Webpack) only include what you use.
- **Zero UI Dependencies**: No MUI, Ant Design, or Radix. Pure React + vanilla CSS.
- **Lazy Advanced Export**: ExcelJS is an optional peer dep — not bundled, only used if you install it.
- **Efficient Rendering**: Custom virtualization handles 100k+ rows with zero DOM churn.

---

## 📚 Documentation

Full documentation at 👉 **[opencorestack.github.io/OpenGridX](https://opencorestack.github.io/OpenGridX/)**

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
- **[Export Guide](docs/features/export-guide.md)** — Excel, CSV, and Print
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

## 📝 License

MIT © 2026 Open Core Stack
