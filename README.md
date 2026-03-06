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
// Styles are automatically included — no separate CSS import needed
import { DataGrid } from '@opencorestack/opengridx';
```

> **Note:** Styles are bundled inside the component. For SSR or CSS-in-JS setups use the explicit styles export:
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
    valueFormatter: ({ value }) => `$${value.toLocaleString()}` },
  { field: 'department', headerName: 'Department',  width: 160 },
];

const rows = [
  { id: 1, name: 'Jon Snow',       role: 'Engineer',  salary: 95000,  department: 'Defense' },
  { id: 2, name: 'Cersei Lannister', role: 'Manager', salary: 140000, department: 'Management' },
  { id: 3, name: 'Arya Stark',     role: 'Analyst',   salary: 65000,  department: 'Special Ops' },
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

---

## 📐 API Reference

### Core Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rows` | `GridRowModel[]` | — | **Required.** Array of data rows. |
| `columns` | `GridColDef[]` | — | **Required.** Column definitions. |
| `height` | `number` | `500` | Grid height in pixels. |
| `loading` | `boolean` | `false` | Shows skeleton loader when `true`. |
| `checkboxSelection` | `boolean` | `false` | Enables checkbox column for row selection. |
| `pagination` | `boolean` | `false` | Enables client-side pagination. |
| `pageSize` | `number` | `25` | Rows per page. |
| `getRowId` | `(row) => GridRowId` | `row.id` | Custom row ID accessor. |
| `rowHeight` | `number` | `52` | Row height in pixels. |
| `headerHeight` | `number` | `56` | Header height in pixels. |

### Selection

| Prop | Type | Description |
| :--- | :--- | :--- |
| `rowSelectionModel` | `GridRowId[]` | Controlled selected row IDs. |
| `onRowSelectionModelChange` | `(model: GridRowId[]) => void` | Fires on selection change. |
| `disableRowSelectionOnClick` | `boolean` | Prevent row click from toggling selection. |

### Sorting & Filtering

| Prop | Type | Description |
| :--- | :--- | :--- |
| `sortModel` | `GridSortItem[]` | Controlled sort model. |
| `onSortModelChange` | `(model) => void` | Fires on sort change. |
| `filterModel` | `GridFilterModel` | Controlled filter model. |
| `onFilterModelChange` | `(model) => void` | Fires on filter change. |
| `disableColumnFilter` | `boolean` | Disables column-level filtering. |

### Server-Side

| Prop | Type | Description |
| :--- | :--- | :--- |
| `paginationMode` | `'client' \| 'server' \| 'infinite'` | Data fetching mode. |
| `sortingMode` | `'client' \| 'server'` | Where sorting is applied. |
| `filterMode` | `'client' \| 'server'` | Where filtering is applied. |
| `dataSource` | `GridDataSource` | Server-side data adapter. |
| `rowCount` | `number` | Total rows for server-side pagination. |

### Customization

| Prop | Type | Description |
| :--- | :--- | :--- |
| `slots` | `GridSlots` | Replace built-in components (toolbar, pagination, overlays). |
| `slotProps` | `GridSlotProps` | Pass custom props to slot components. |
| `getRowClassName` | `(params) => string` | Add custom CSS class to rows. |
| `getCellClassName` | `(params) => string` | Add custom CSS class to cells. |
| `theme` | `GridTheme` | Apply a custom theme object. |

### `apiRef` — Imperative API

```tsx
const apiRef = useGridApiRef();
<DataGrid apiRef={apiRef} ... />

// Usage
apiRef.current.getSelectedRows()       // → GridRowId[]
apiRef.current.copySelectedRows()      // → Promise<void>
apiRef.current.selectRow(id, true)     // select a row
apiRef.current.setFilterModel(model)   // programmatic filter
apiRef.current.sortColumn('name', 'asc')
apiRef.current.setPage(2)
apiRef.current.getVisibleRows()        // → GridRowModel[]
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
| **Core ES Module** (`opengridx.es.js`) | 220 KB | **52 KB** | Use this — tree-shakeable |
| **Core UMD** (`opengridx.umd.js`) | 146 KB | **44 KB** | CommonJS / CDN compat |
| **Styles** (`opengridx.css`) | 57 KB | **9 KB** | Auto-included |
| **ExcelJS** (optional peer dep) | — | — | `npm install exceljs` |
| **npm package download** | — | **400 KB** | Total compressed tarball |

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
| **Price** | Free | **$$$** | Free (limited) | **Free** |

---

## 📝 License

MIT © 2026 Open Core Stack
