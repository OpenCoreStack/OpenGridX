# OpenGridX — AI Context for Consumer Projects

This file is intended to be fed to an AI coding assistant (Claude or similar) working on a project
that uses the `@opencorestack/opengridx` library. Read it in full before writing any grid-related code.

---

## What this library is

`@opencorestack/opengridx` is a zero-dependency, high-performance React DataGrid component.
Current version: **3.0.0**. It is a full custom implementation — not a wrapper around MUI or any
other library.

---

## Where to find documentation (REQUIRED — read these before answering questions)

The package ships its full documentation inside `node_modules`. **Always read these files before
answering questions about the grid API** — do not rely on training data, which may reflect an older
version.

```
node_modules/@opencorestack/opengridx/docs/API_REFERENCE.md   ← complete prop + type reference
node_modules/@opencorestack/opengridx/CHANGELOG.md            ← what changed in each version
node_modules/@opencorestack/opengridx/llms.txt                ← AI-readable package summary
node_modules/@opencorestack/opengridx/README.md               ← quick-start overview
```

Feature guides (each covers one area in depth):
```
node_modules/@opencorestack/opengridx/docs/features/sorting-pagination.md
node_modules/@opencorestack/opengridx/docs/features/tree-data-grouping.md
node_modules/@opencorestack/opengridx/docs/features/selection.md
node_modules/@opencorestack/opengridx/docs/features/filtering.md
node_modules/@opencorestack/opengridx/docs/features/export-guide.md
node_modules/@opencorestack/opengridx/docs/features/aggregation-pivot.md
node_modules/@opencorestack/opengridx/docs/features/editing-reordering.md
node_modules/@opencorestack/opengridx/docs/features/master-detail.md
node_modules/@opencorestack/opengridx/docs/features/pinning.md
node_modules/@opencorestack/opengridx/docs/features/toolbar-customization.md
node_modules/@opencorestack/opengridx/docs/features/virtualization.md
node_modules/@opencorestack/opengridx/docs/features/infinite-scroll.md
node_modules/@opencorestack/opengridx/docs/features/pdf-export.md
node_modules/@opencorestack/opengridx/docs/features/state-persistence.md
node_modules/@opencorestack/opengridx/docs/features/loading-states.md
node_modules/@opencorestack/opengridx/docs/features/data-source.md
node_modules/@opencorestack/opengridx/docs/features/clipboard.md
node_modules/@opencorestack/opengridx/docs/features/keyboard-navigation.md
node_modules/@opencorestack/opengridx/docs/features/cell-spanning.md
node_modules/@opencorestack/opengridx/docs/features/list-view.md
node_modules/@opencorestack/opengridx/docs/features/custom-pagination.md
node_modules/@opencorestack/opengridx/docs/customization/theming.md
node_modules/@opencorestack/opengridx/docs/customization/slots-api.md
```

Component docs (internal component API):
```
node_modules/@opencorestack/opengridx/docs/components/datagrid.md
node_modules/@opencorestack/opengridx/docs/components/header.md
node_modules/@opencorestack/opengridx/docs/components/row.md
node_modules/@opencorestack/opengridx/docs/components/cell.md
node_modules/@opencorestack/opengridx/docs/components/toolbar.md
node_modules/@opencorestack/opengridx/docs/components/pagination.md
node_modules/@opencorestack/opengridx/docs/components/column-visibility.md
node_modules/@opencorestack/opengridx/docs/components/aggregation-footer.md
```

TypeScript types (authoritative source for all interfaces):
```
node_modules/@opencorestack/opengridx/dist/index.d.ts          ← compiled declarations
node_modules/@opencorestack/opengridx/lib/types/index.ts       ← source (more readable)
```

---

## Minimal usage

```tsx
import { DataGrid } from '@opencorestack/opengridx';
import type { GridColDef } from '@opencorestack/opengridx';
import '@opencorestack/opengridx/styles';

const columns: GridColDef[] = [
  { field: 'id',   headerName: 'ID',   width: 80 },
  { field: 'name', headerName: 'Name', width: 160 },
];

const rows = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

export default function MyPage() {
  return <DataGrid rows={rows} columns={columns} height={400} />;
}
```

**The stylesheet is required and is not loaded automatically.** The CSS ships as `dist/opengridx.css`
and the JavaScript bundle does not import it (in Vite/Webpack/CRA/Next.js alike). Add once to your app root:
```ts
import '@opencorestack/opengridx/styles';
```
Without it the grid is unstyled and its viewport does not scroll, so every row is rendered. Dev builds warn once
(`[OpenGridX] The grid stylesheet is not loaded`).

---

## Key patterns to know

### Controlled vs uncontrolled state

Props like `sortModel`, `paginationModel`, `rowSelectionModel`, `filterModel` can be either
**controlled** (you pass the value + an `onChange` handler) or **uncontrolled** (you pass neither;
the grid manages its own state, optionally seeded via `initialState`).

```tsx
// Uncontrolled pagination — grid handles its own page state:
<DataGrid
  rows={rows}
  columns={columns}
  pagination
  pageSizeOptions={[10, 25]}
  initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
/>

// Controlled pagination — you own the state:
<DataGrid
  rows={rows}
  columns={columns}
  pagination
  paginationModel={model}
  onPaginationModelChange={setModel}
/>
```

**Important (v2.0.0 fix):** Uncontrolled pagination navigation was broken in v1 — it now works
correctly. If you have uncontrolled grids and pagination wasn't responding, upgrading to v2 fixes it.

### Row hierarchy metadata

For tree-data and row-grouping, hierarchy metadata lives in `params.rowMeta` inside `renderCell`,
not on `params.row`:

```tsx
renderCell: (params) => {
  const depth      = params.rowMeta?.treeDepth ?? 0;
  const hasChildren = params.rowMeta?.hasChildren;
  return <span style={{ paddingLeft: depth * 16 }}>{params.formattedValue}</span>;
}
```

### Column definitions — useful v2 fields

```tsx
const columns: GridColDef[] = [
  {
    field: 'department',
    headerName: 'Department',

    // Custom label for group-header rows when this field is the active grouping level:
    groupingValueFormatter: ({ value }) => `📁 ${String(value)}`,

    // Prevent this field from being used as a grouping dimension:
    groupable: false,

    // Restrict which aggregation functions are valid for this column.
    // Built-in names: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'unique'
    // ('unique' = count of distinct non-null values, implemented via Set)
    availableAggregationFunctions: ['sum', 'avg'],

    // Browser tooltip on the column header:
    description: 'The employee\'s department',
  },
];
```

### Multi-column sorting

```tsx
// Option A — multiSort prop (single-click appends):
<DataGrid rows={rows} columns={columns} multiSort sortModel={sortModel} onSortModelChange={setSortModel} />

// Option B — Shift+click always appends without any prop.
```

---

## v2 → v3 migration (if this project was on v2)

Read `node_modules/@opencorestack/opengridx/docs/migration/v2-to-v3.md`. In short:
- `params.row._hasChildren`, `_treeDepth`, `_isExpanded`, `_groupingField`, `_groupingValue`, `_descendantCount` and `_isGroupRow` are no longer added to rows → use `params.rowMeta?.*`.
- Under row grouping / tree data, `params.row` is now the consumer's own row object (it used to be a copy) → never mutate it in render callbacks.
- Grouped exports write the same group label as the grid (`groupLabel` → `groupingValueFormatter` → `"field: value"`).
- `getRowId` no longer copies rows or overwrites `row.id`; pass `getRowId` in export options so `selectedRows` match.
- Behaviour fixes a v2 project may notice: `initialState.filter` is applied; toolbar search/filters work without `filterModel`;
  apiRef setters (`sortColumn`, `setFilterModel`, `setPage`, `selectRows`, …) update the grid and fire callbacks;
  `getVisibleColumns()` omits hidden columns and returns render order (left-pinned, unpinned, right-pinned);
  `getAllFilteredRows()` under tree data + a filter returns only matching rows; `selectRow(s)` ignore synthetic ids
  (group, subtotal, pivot Grand Total — which cannot be selected) and fire nothing on a no-op; `slots.footer` `rowCount`
  excludes pinned rows in flat grids (data rows under tree data / grouping); row grouping with a `paginationMode="server"`
  `dataSource` fetches every row in one request; `onRowOrderChange` indices are positions in `rows`; `onColumnOrderChange`
  indices are positions in the full column order (new `onColumnOrderModelChange` gives the whole order); Tab leaves the grid
  outside edit mode; `isCellEditable` also gates double-click and Enter; empty filter values no longer filter; the quick filter
  searches only visible, filterable columns; CSV starts with a BOM and CSV/HTML-Excel neutralise formulas (`escapeFormulas: false`);
  `exportToExcel` saves `.xlsx` names as `.xls`; all grid buttons are `type="button"`; pinned columns render in `pinnedColumns` order;
  `DataGridThemeProvider` pins a light or dark palette by `theme.mode` instead of following the OS.
  Copy (Ctrl/Cmd+C, `copySelectedRows()`) takes the visible columns in screen order and every selected row that passes the filter,
  `copySelectedRows()` rejects when the write fails, and `disableClipboardCopy` turns the shortcut off.
  Without a `valueFormatter`, `type` now formats cells (dates as local dates, booleans Yes / No, singleSelect labels, image `<img>`).
  `loading` with rows already shown keeps them and shows a progress bar (or `slots.loadingOverlay`); list view honours loading,
  overlays and `slots.footer` and is keyboard navigable.
- After upgrading, restart the dev server and clear `node_modules/.vite`, or Vite may keep serving the old version.

## v1 → v2 migration (if this project was on v1)

Read the full guide:
```
node_modules/@opencorestack/opengridx/docs/migration/v1-to-v2.md
```

### Quick summary

**Hard breaking (TypeScript compile error):**

| Removed prop | Fix |
|---|---|
| `onPinnedRowsChange` on `<DataGrid>` | Delete it — callback was never called |
| `onRowGroupingModelChange` on `<DataGrid>` | Delete it — callback was never called |

**Behavioral (silent, no TS error — audit these):**

| Change | Risk |
|---|---|
| `groupable: false` now honored | If any column had `groupable: false` AND appeared in `rowGroupingModel`, it is now skipped. Previously it was grouped anyway. |
| `availableAggregationFunctions` now enforced | If a column had this set, aggregation functions outside the list are now skipped. Check `aggregationModel` matches the allowed list. |
| `groupingColDef` now creates a real column | If passed, a dedicated `__group__` column now appears at position 0, pinned left. Previously it was a no-op. Remove it if you don't want the column. |

**Previously broken, now fixed (verify your UI still looks right):**

| Fix | What to check |
|---|---|
| Uncontrolled pagination | Pagination controls now actually change pages. If you had workarounds for this, they may now conflict. |
| `disableRowSelectionOnClick` | Now prevents click-to-select. If you passed it expecting it to be ignored, selection behavior changes. |
| `disableMultipleRowSelection` | Now caps selection to one row. Same caveat. |
| `density` | Now sets row height. If you passed `density` expecting it to be ignored, row heights will change. |

**Legacy row shim — removed in v3:** v2 still added `_hasChildren`, `_treeDepth` etc. to `params.row`; v3 does not.

```tsx
// ❌ undefined in v3:
const hasChildren = (params.row as Record<string, unknown>)._hasChildren;

// ✅ v1.1+, v2 and v3:
const hasChildren = params.rowMeta?.hasChildren;
```

### Migration checklist

- [ ] Search for `onPinnedRowsChange` → delete
- [ ] Search for `onRowGroupingModelChange` → delete
- [ ] Search for `groupable: false` → verify field is not in `rowGroupingModel`
- [ ] Search for `availableAggregationFunctions` → verify list covers active `aggregationModel`
- [ ] Search for `groupingColDef` → verify you want the `__group__` column it now creates
- [ ] Search for `params.row._hasChildren` / `._treeDepth` etc. → migrate to `params.rowMeta`
- [ ] Run `tsc --noEmit` — compiler will flag any remaining type errors

---

## Common mistakes to avoid

- **Don't use `any`** — the library exports full generics. Use `GridColDef<YourRowType>` and
  `DataGrid<YourRowType>`.
- **Don't import from deep paths** — import only from the package root:
  `import { DataGrid, exportToCsv } from '@opencorestack/opengridx'`
- **`initialState` is for seeding, not controlling** — if you pass `initialState.sorting.sortModel`
  AND `sortModel` prop, the prop wins (controlled mode). Use one or the other.
- **Keep the active `pageSize` in `pageSizeOptions`** — a page size missing from the options is
  added to the selector as an extra entry, which usually is not what you want. The default options are
  `[10, 25, 50, 100]`.
- **Import the stylesheet** — `import '@opencorestack/opengridx/styles'` once in the app root.
- **Controlled props need their callback** — `paginationModel` without `onPaginationModelChange` (or `sortModel`
  without `onSortModelChange`) freezes that state. Leave both out to let the grid own it.
- **Give the grid a bounded height** — in a flex layout wrap it in `<div style={{ flex: 1, minHeight: 0 }}>`.
  Without `min-height: 0` the container grows to fit every row and virtualization is silently off.
  Pagination hides this, and row grouping disables pagination, so it tends to appear only after grouping
  is turned on. Dev builds log a warning.
- **Call `apiRef` methods after mount** — `apiRef.current` is never null, but before the grid mounts
  its methods do nothing. Call `apiRef.current.*` inside event handlers or `useEffect`, never during render.
- **`valueFormatter` / `valueGetter` params are typed `unknown`** — cast before calling methods:
  `valueFormatter: ({ value }) => (value as number).toFixed(2)`. A throwing `valueGetter` / `valueFormatter` reads as
  `undefined` (dev warning) instead of crashing.
- **Keep `valueGetter` pure** — the quick filter caches text per row object; replace the row object when its data changes.
- **Inline `columns` are reused while shallow-equal** — a new array per render is fine, but mutating a column object in
  place is not detected; pass new column objects when a definition changes.
- **Browser height limit** — one scrolling grid reaches about 645,000 rows at the default 52 px row height
  (browsers cap element height); page or stream larger datasets.

---

## Exports available at the package root

```ts
// Components
import { DataGrid, GridToolbar, FilterPanel, ColumnVisibilityPanel, GridTooltip, Pagination,
         Cell, Row, Header, Skeleton, Button, Input, Checkbox } from '@opencorestack/opengridx';

// Hooks
import { useGridApiRef, useGridStateStorage, useAggregation, usePivot } from '@opencorestack/opengridx';

// Theming
import { DataGridThemeProvider, darkTheme, roseTheme, emeraldTheme,
         amberTheme, compactTheme } from '@opencorestack/opengridx';

// Export utilities
import { exportToCsv, exportToExcel, exportToExcelAdvanced,
         exportToJson, printGrid, exportToPdf, formatAggregationValue } from '@opencorestack/opengridx';

// Types (a selection; lib/index.ts lists them all)
import type {
  DataGridProps, GridColDef, GridRowModel, GridRowId, GridRowMeta,
  GridSortItem, GridSortModel, GridFilterModel, GridFilterItem, GridFilterGroup, GridFilterOperator,
  GridPaginationModel, GridColumnPinning, GridRowPinning, GridColumnVisibilityModel,
  GridRowParams, GridCellParams, GridRenderCellParams, GridRenderEditCellParams,
  GridValueGetterParams, GridValueSetterParams, GridValueFormatterParams,
  GridApi, GridInitialState, GridState,
  GridAggregationModel, GridPivotModel, GridTreeNode, GridGroupedExportRow,
  GridDataSource, GridGetRowsParams, GridGetRowsResponse,
  GridSlots, GridSlotProps, GridLocaleText, GridListViewColDef, GridColumnGroupingModel,
  GridTheme, DataGridThemeProviderProps,
  GridToolbarProps, ToolbarButtonRenderProps, ToolbarQuickFilterRenderProps,
  PaginationProps, CellProps, RowProps, HeaderProps, FilterPanelProps, ColumnVisibilityPanelProps,
  CsvExportOptions, ExcelExportOptions, JsonExportOptions, PrintOptions, PdfExportOptions,
  ExcelAdvancedExportOptions, UseGridStateStorageOptions,
} from '@opencorestack/opengridx';
```

---

## Getting help

- Full API reference: `node_modules/@opencorestack/opengridx/docs/API_REFERENCE.md`
- Migration guides: `node_modules/@opencorestack/opengridx/docs/migration/v2-to-v3.md`,
  `node_modules/@opencorestack/opengridx/docs/migration/v1-to-v2.md`
- Changelog: `node_modules/@opencorestack/opengridx/CHANGELOG.md`
- GitHub: https://github.com/OpenCoreStack/OpenGridX
