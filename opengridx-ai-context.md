# OpenGridX — AI Context for Consumer Projects

This file is intended to be fed to an AI coding assistant (Claude or similar) working on a project
that uses the `@opencorestack/opengridx` library. Read it in full before writing any grid-related code.

---

## What this library is

`@opencorestack/opengridx` is a zero-dependency, high-performance React DataGrid component.
Current version: **2.0.0**. It is a full custom implementation — not a wrapper around MUI or any
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

const columns: GridColDef[] = [
  { field: 'id',   headerName: 'ID',   width: 80 },
  { field: 'name', headerName: 'Name', width: 160 },
];

const rows = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

export default function MyPage() {
  return <DataGrid rows={rows} columns={columns} />;
}
```

Styles load automatically — no manual CSS import needed in Vite/Webpack/CRA. If the grid appears
unstyled (Next.js App Router, SSR), add once to your app root:
```ts
import '@opencorestack/opengridx/styles';
```

---

## Key patterns to know

### Controlled vs uncontrolled state

Props like `sortModel`, `paginationModel`, `rowSelectionModel`, `filterModel` can be either
**controlled** (you pass the value + an `onChange` handler) or **uncontrolled** (you pass neither;
the grid manages its own state, optionally seeded via `initialState`).

```tsx
// Uncontrolled pagination — grid handles its own page state:
<DataGrid
  pagination
  pageSizeOptions={[10, 25]}
  initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
/>

// Controlled pagination — you own the state:
<DataGrid
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
  return <span style={{ paddingLeft: depth * 16 }}>{params.value}</span>;
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
<DataGrid multiSort sortModel={sortModel} onSortModelChange={setSortModel} />

// Option B — Shift+click always appends without any prop.
```

---

## v1 → v2 migration (if this project was on v1)

Read the full guide:
```
node_modules/@opencorestack/opengridx/docs/migration/v1-to-v2.md   ← if it ships
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

**Removed runtime row shim:**

```tsx
// ❌ v1 shim — no longer injected on params.row in v2:
const hasChildren = (params.row as Record<string, unknown>)._hasChildren;

// ✅ v2:
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
- **`pageSizeOptions` must include the active `pageSize`** — if `pageSize` is 10 but
  `pageSizeOptions` is `[25, 50]`, the selector will show a mismatch. Always include the initial
  page size in the options array.
- **`apiRef` methods are only available after mount** — call `apiRef.current.*` inside event
  handlers or `useEffect`, never during render.

---

## Exports available at the package root

```ts
// Component
import { DataGrid } from '@opencorestack/opengridx';

// Hooks
import { useGridApiRef } from '@opencorestack/opengridx';

// Export utilities
import { exportToCsv, exportToExcel, exportToExcelAdvanced,
         exportToJson, printGrid, exportToPdf } from '@opencorestack/opengridx';

// Types
import type {
  GridColDef, GridRowModel, GridRowId,
  DataGridProps, GridSortItem, GridSortModel,
  GridFilterModel, GridFilterItem,
  GridPaginationModel, GridColumnPinning,
  GridRowMeta, GridRowParams, GridCellParams,
  GridApi, GridInitialState,
  GridAggregationModel, GridPivotModel,
  GridLocaleText, GridSlots,
  GridGroupedExportRow,
} from '@opencorestack/opengridx';
```

---

## Getting help

- Full API reference: `node_modules/@opencorestack/opengridx/docs/API_REFERENCE.md`
- Migration guide: `node_modules/@opencorestack/opengridx/docs/migration/v1-to-v2.md`
- Changelog: `node_modules/@opencorestack/opengridx/CHANGELOG.md`
- GitHub: https://github.com/OpenCoreStack/OpenGridX
