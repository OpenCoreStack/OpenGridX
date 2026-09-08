# OpenGridX — AI Context

This file is auto-loaded by Claude Code and other AI coding assistants. It provides the orientation needed to work in this codebase without exploring files first.

---

## What this is

`@opencorestack/opengridx` — a high-performance React DataGrid component library.

- **Language:** TypeScript 5.9 strict mode. Zero `any`, zero `eslint-disable`.
- **Framework:** React 19
- **Tests:** Vitest 4 + `@testing-library/react` (`renderHook` for hooks, component tests for UI)
- **Build:** Vite (library mode). `npm run build` produces `dist/opengridx.es.js` and `dist/opengridx.umd.js`.
- **Lint:** `npm run lint` (ESLint). Must pass before every commit.
- **Current version:** 1.3.0

---

## Architecture — data flow

Props enter `DataGrid.tsx` (the orchestration layer — no logic lives here, only hook calls and JSX).

```
DataGridProps
  │
  ├─ useGridControlledState     — normalises controlled/uncontrolled prop pairs
  │    (sort, pagination, selection, column visibility, pivot, aggregation)
  │
  ├─ useGridRowPipeline         — filter → sort → paginate → split pinned rows
  │
  ├─ useGridColumns             — inject hierarchy renderers; resolve order/visibility
  │    reads rowMetaMap (from useTreeData / useRowGrouping) instead of row._* fields
  │
  ├─ useGridVirtualization      — compute render window (which rows/columns are visible)
  │
  ├─ useGridVisibleRows         — merge pinned + virtual center → { row, rowIndex }[]
  │
  └─ JSX renders:
       Header, GridVirtualRows, GridPinnedRows, Pagination, GridAggregationFooter
```

Hierarchy (tree data, row grouping) is handled by `useTreeData` / `useRowGrouping`. They produce flat renderable row arrays with internal `_*` fields injected (runtime shim, removed in v2) **and** a `rowMetaMap: Map<GridRowId, GridRowMeta>` that is the clean typed API.

---

## Key files

| File | Purpose |
| :--- | :--- |
| `lib/types/index.ts` | All public types: `DataGridProps`, `GridColDef`, `GridRowModel`, `GridRowMeta`, `GridLocaleText`, `GridRenderCellParams`, etc. |
| `lib/components/DataGrid/DataGrid.tsx` | Orchestration only — hooks + JSX, no business logic |
| `lib/hooks/core/` | Core pipeline hooks (always active): `useGridControlledState`, `useGridRowPipeline`, `useGridColumns`, `useGridVirtualization`, `useGridVisibleRows`, `useGridScrollSync`, `useGridKeyboardNavigation`, `useLayout` |
| `lib/hooks/features/` | Opt-in feature hooks: `useAggregation`, `usePivot`, `useGridEditing`, `useGridSpanning`, `useGridDataSource`, `useGridClipboard` |
| `lib/hooks/useTreeData.ts` | Tree-data hierarchy — flat row array + `rowMetaMap` |
| `lib/hooks/useRowGrouping.ts` | Row-grouping hierarchy — flat row array + `rowMetaMap` |
| `lib/components/Cell/Cell.tsx` | Cell render — invokes `renderCell`, wraps with `CellErrorBoundary` |
| `lib/components/Cell/CellErrorBoundary.tsx` | Class error boundary wrapping `renderCell` output |
| `lib/utils/filtering/` | Client-side filter operators |
| `lib/utils/sorting/` | Client-side sort comparators |

---

## Where to add things

| Task | Where |
| :--- | :--- |
| New filter operator for a column type | `lib/utils/filtering/filtering.ts` + `types/index.ts` |
| New feature (aggregation, pivot, etc.) | New hook in `lib/hooks/features/`, consumed by `DataGrid.tsx` |
| New core pipeline stage | New hook in `lib/hooks/core/`, added to `DataGrid.tsx` |
| New component (slot, overlay, etc.) | `lib/components/<Name>/` |
| New public prop on `DataGrid` | Add to `DataGridProps` in `lib/types/index.ts`, destructure in `DataGrid.tsx` |
| New column type | `GridColType` union in `lib/types/index.ts`, operators in `lib/utils/filtering/filtering.ts` |
| New slot | Add to `GridSlots` in `lib/types/index.ts`, wire in `DataGrid.tsx` via `slots?.mySlot` |

---

## Naming conventions

- **CSS classes:** `ogx__` BEM prefix (e.g. `ogx__cell`, `ogx__cell--focused`)
- **CSS variables:** `--ogx-*` (e.g. `--ogx-row-height`, `--ogx-color-primary`)
- **Hook names:** `use-grid-*` for core hooks, `use*` for feature hooks
- **Exported types:** `Grid*` prefix (e.g. `GridColDef`, `GridRowMeta`, `GridLocaleText`)
- **Internal fields still on row at runtime (shim, remove in v2):** `_hasChildren`, `_treeDepth`, `_isExpanded`, `_groupingField`, `_groupingValue`, `_descendantCount`, `_isGroupRow`

---

## `GridRowMeta` pattern

Hierarchy metadata (`hasChildren`, `treeDepth`, `groupingField`, etc.) lives in a `Map<GridRowId, GridRowMeta>` returned by `useTreeData`/`useRowGrouping`, not on the row object. Access it in `renderCell` via `params.rowMeta`.

The underscore fields remain on the row object at runtime in v1.x (backward compat shim). **Remove the runtime injection in v2.0** by deleting the `_hasChildren = ...` assignments in `useTreeData.ts` and `useRowGrouping.ts`.

Full doc: `docs/architecture/grid-row-meta.md`

---

## Testing conventions

- Test files are co-located with the file they test: `useGridRowPipeline.test.ts` lives in `lib/hooks/core/`
- Import pattern: `import { describe, it, expect, vi } from 'vitest'` + `import { renderHook, act } from '@testing-library/react'`
- Hook tests use `renderHook(() => useMyHook(params))` — no DOM needed for pure hooks
- Component tests use `render` from `@testing-library/react`
- Run all tests: `npx vitest run`
- Run a single file: `npx vitest run lib/hooks/core/useGridRowPipeline.test.ts`

---

## Docs conventions

| Content | Location |
| :--- | :--- |
| Component public API (props, slots, events) | `docs/components/<name>.md` |
| Internal hook architecture | `docs/architecture/<hook-name>.md` |
| Feature guides (usage patterns, code examples) | `docs/features/<feature>.md` |
| Full public API reference | `docs/API_REFERENCE.md` |
| Roadmap and feature status | `docs/roadmap.md` |

---

## Build and lint rules

- `npm run lint && npm run build` must pass after every change
- Zero `eslint-disable` or `@ts-ignore` — fix the root cause
- Zero `any` — use `unknown` or explicit interfaces
- Never add `Co-Authored-By` AI attribution to commit messages

---

## v1.3.0 — significant changes

- **`GridApi.getGroupedExportRows()`** — new method returning a flat `GridGroupedExportRow[]` ordered list by traversing the active row-grouping tree (group-header → children → subtotal → grand-total). Returns `null` when row grouping is not active.
- **`GridGroupedExportRow` type** — public interface for each entry: `type` (`group-header | leaf | group-subtotal | grand-total`), `depth`, optional `groupField`, `groupValue`, `aggregatedValues`, `row`.
- **Grouped export across all formats** — `exportToCsv`, `exportToExcel`, `exportToJson`, `printGrid`, `exportToPdf` all accept `groupedRows?: GridGroupedExportRow[]`; flat behavior unchanged when absent.

---

## v1.2.3 — significant changes

- **`hideable: false` columns excluded from Columns panel** — `ColumnVisibilityPanel` now filters out columns with `hideable: false` by default, removing the permanently-disabled rows that added visual noise. Columns still render in the grid body and exports unchanged.
- **`GridToolbarProps.showNonHideableColumns`** — new optional boolean prop. Pass `true` to restore the old behavior (show non-hideable columns as disabled rows in the panel). Default: `false`.

---

## v1.2.2 — significant changes

- **`CellErrorBoundary` CellRenderTarget pattern** — `renderFn` is now called inside a module-scope `CellRenderTarget` child component so the throw happens in a descendant; boundaries cannot catch errors in their own `render()`
- **`resetKey={row}`** — error boundary resets when the row object reference changes (not just the cell value), so "Restore" correctly clears error state after fresh row objects are provided
- **`getAllFilteredRows()` API** — new `GridApi` method returning all filtered+sorted rows regardless of pagination; use for full-dataset exports
- **PDF aggregation footer** — `PdfExportDemo` now computes the aggregation directly from exported rows (bypasses `useEffect`-based `getAggregationResult`); footer now reliably appears with correct values
- **PDF footer text color** — aggregation footer row text is now explicitly black (`[0,0,0]`) instead of inheriting the default (which could render invisible against the light gray fill)
- **`exportToPdf` standalone API** — uses `autoTable(doc, opts)` standalone function instead of `doc.autoTable(opts)` to avoid unreliable ESM prototype patching

---

## v1.2.1 — significant changes

- **`exportToPdf`** — native PDF export via optional peer deps `jspdf` + `jspdf-autotable`; lazy-loaded, zero bundle impact for non-PDF consumers
- **`PdfExportOptions`** — 12-field interface: fileName, title, logoUrl, orientation, selectedRows, aggregationResult, aggregationModel, filterModel, alternateRowColor, headerBackgroundColor, headerTextColor, fontSize
- **`CellErrorBoundary` fix** — changed to `renderFn` prop so the boundary calls `renderCell` inside its own `render()`; previously the throw occurred in the parent before the boundary could catch it
- **GitHub Pages SPA routing** — deploy workflow now copies `404.html` so direct URL access to demo routes works

---

## v1.1.0 — significant changes

- **`GridRowMeta`** — hierarchy metadata moved off `GridRowModel` into `Map<GridRowId, GridRowMeta>`; exposed via `params.rowMeta` in `renderCell`
- **`CellErrorBoundary`** — `renderCell` errors now caught per-cell; grid continues rendering
- **`GridLocaleText` / `localeText` prop** — all pagination strings are now overrideable for i18n
- **Duplicate DOM ID fix** — `Row` checkbox and `FilterPanel` inputs now use `useId()` (was `ogx-select-row-${row.id}`, caused duplicates with two grids on one page)
