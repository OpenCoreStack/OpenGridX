# OpenGridX — AI Context

This file is auto-loaded by Claude Code and other AI coding assistants. It provides the orientation needed to work in this codebase without exploring files first.

---

## What this is

`@opencorestack/opengridx` — a high-performance React DataGrid component library.

- **Language:** TypeScript 5.9 strict mode. Zero `any`, zero `eslint-disable`.
- **Framework:** React 19
- **Tests:** Vitest 4 + `@testing-library/react`. Two projects: `unit` (jsdom, `npm test`) and `browser` (real Chromium, Firefox and WebKit via Playwright, `npm run test:browser`)
- **Build:** `npm run build:lib` produces the published `dist/opengridx.es.js` / `dist/opengridx.umd.js`. `npm run build` type-checks the lib and builds the **demo site**.
- **Published:** yes — on npm as `@opencorestack/opengridx` with external consumers. Treat public types and behaviour changes as semver-relevant.
- **Lint:** `npm run lint` (ESLint). Must pass before every commit.
- **Current version:** 3.1.0

---

## Architecture — data flow

Props enter `DataGrid.tsx` (the orchestration layer — no logic lives here, only hook calls and JSX). Put new logic in a hook or pure util and call it from there. Hook **call order is load-bearing** (effects run in call order; several hooks install `apiRef` methods): the full ordered list is in `docs/architecture/datagrid-orchestration.md`.

```
DataGridProps
  │
  ├─ useGridControlledState     — normalises controlled/uncontrolled prop pairs
  │    (sort, pagination, selection, column visibility, pivot, aggregation)
  ├─ useGridPivot → resolveGridModes (utils/gridModes) — which features are in effect
  ├─ useGridGroupingColumn      — the synthetic __group__ column + its auto-pin
  ├─ useDataGrid                — row store, dimensions, live apiRef
  │    useGridRowIdOf / useGridApiRefBinding
  ├─ useGridHierarchy           — useTreeData + useRowGrouping → active handlers + rowMetaMap
  ├─ useGridEditing, useGridLiveRowSelection, useGridDataSource, useGridDetailPanel
  │
  ├─ useGridColumns             — inject hierarchy renderers; resolve order/visibility
  │    reads rowMetaMap instead of row._* fields
  ├─ useGridRowPipeline         — filter → sort → paginate → split pinned rows
  ├─ useGridRowInteractions     — selection + row click / checkbox handlers
  ├─ useGridApiMethods, useGridAggregationApi — imperative API
  ├─ useLayout, useGridSpanning, useGridClipboardApi, useGridScrollToIndexesApi
  │
  ├─ useGridViewport            — scroll sync + viewport measurement
  ├─ useGridVirtualization      — compute render window (which rows/columns are visible)
  ├─ useGridKeyboardNavigation  — focus + keys; useGridSortHandlers / useGridPointerFocusHandlers /
  │                               useGridColumnMenuHandlers for header and cell events
  ├─ useGridAriaRows            — aria-rowcount / aria-rowindex bases
  ├─ useGridVisibleRows         — merge pinned + virtual center → { row, rowIndex }[]
  ├─ useGridToolbarProps        — props for slots.toolbar
  │
  └─ JSX renders:
       Header, GridPinnedRows, GridVirtualRows, GridAggregationFooter, GridPaginationArea,
       GridLiveRegion, GridListView (list view), overlays
```

Hierarchy (tree data, row grouping) is handled by `useTreeData` / `useRowGrouping`. They produce flat renderable row arrays of the consumer's own row objects (unchanged — nothing is injected since v3.0) **and** a `rowMetaMap: Map<GridRowId, GridRowMeta>` that carries all hierarchy information.

---

## Key files

| File | Purpose |
| :--- | :--- |
| `lib/types/index.ts` | All public types: `DataGridProps`, `GridColDef`, `GridRowModel`, `GridRowMeta`, `GridLocaleText`, `GridRenderCellParams`, etc. |
| `lib/components/DataGrid/DataGrid.tsx` | Orchestration only — hooks + JSX, no business logic. Hook order: `docs/architecture/datagrid-orchestration.md` |
| `lib/hooks/core/` | Core pipeline hooks (always active): `useGridControlledState`, `useGridRowPipeline`, `useGridColumns`, `useGridVirtualization`, `useGridVisibleRows`, `useGridScrollSync`, `useGridKeyboardNavigation`, `useLayout`; DataGrid wiring: `useGridHierarchy`, `useGridGroupingColumn`, `useGridRowIdOf`, `useGridDetailPanel`, `useGridRowInteractions`, `useGridViewport`, `useGridAriaRows`, `useGridToolbarProps`, `useGridHeaderHandlers`, `useGridFocusHandlers`, and the `apiRef` installers `useGridApiRefBinding` / `useGridApiMethods` / `useGridAggregationApi` / `useGridClipboardApi` / `useGridScrollToIndexesApi` |
| `lib/utils/gridModes.ts` | `resolveGridModes`: the one place features override each other (pivot vs tree/grouping/reorder, grouping vs pagination, infinite vs pages, list view needs `listViewColumn`) |
| `lib/hooks/features/` | Opt-in feature hooks: `useAggregation`, `usePivot`, `useGridEditing`, `useGridSpanning`, `useGridDataSource`, `useGridClipboard` |
| `lib/hooks/useTreeData.ts` | Tree-data hierarchy — flat row array + `rowMetaMap` |
| `lib/hooks/useRowGrouping.ts` | Row-grouping hierarchy — flat row array + `rowMetaMap` |
| `lib/components/Cell/Cell.tsx` | Cell render — invokes `renderCell`, wraps with `CellErrorBoundary` |
| `lib/components/Cell/CellErrorBoundary.tsx` | Class error boundary wrapping `renderCell` output |
| `lib/utils/filtering/` | Client-side filter operators |
| `lib/utils/sorting/` | Client-side sort comparators |
| `lib/utils/aggregation/` | The single set of aggregation functions (`sum`/`avg`/`count`/`min`/`max`/`unique`) used by footer, row grouping and exports — do not re-implement them elsewhere |
| `lib/hooks/core/useGridDevWarnings.ts` | Dev-only `console.warn`s (unbounded container, pagination + grouping) |

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
- **Never inject fields onto consumer row objects.** Hierarchy info goes in `rowMetaMap` / `params.rowMeta`; the old `_hasChildren`-style runtime fields were removed in v3.0.

---

## `GridRowMeta` pattern

Hierarchy metadata (`hasChildren`, `treeDepth`, `groupingField`, etc.) lives in a `Map<GridRowId, GridRowMeta>` returned by `useTreeData`/`useRowGrouping`, not on the row object. Access it in `renderCell` via `params.rowMeta`.

The underscore fields (`_hasChildren`, `_treeDepth`, …) were injected onto copied rows from v1.1 to v2.x as a backward-compat shim and **removed in v3.0** — rows now pass through unchanged, so `params.row` is the consumer's own object. Migration: `docs/migration/v2-to-v3.md`.

Full doc: `docs/architecture/grid-row-meta.md`

---

## Testing conventions

- Test files are co-located with the file they test: `useGridRowPipeline.test.ts` lives in `lib/hooks/core/`
- Import pattern: `import { describe, it, expect, vi } from 'vitest'` + `import { renderHook, act } from '@testing-library/react'`
- Hook tests use `renderHook(() => useMyHook(params))` — no DOM needed for pure hooks
- Component tests use `render` from `@testing-library/react`
- Run unit tests: `npm test` (jsdom). Real-browser tests: `npm run test:browser`. Both: `npm run test:all`
- Run a single file: `npx vitest run --project unit lib/hooks/core/useGridRowPipeline.test.ts`
- Anything that depends on layout, `ResizeObserver`, or scrolling (virtualization, container height, drag) must be a `*.browser.test.tsx` — jsdom has no layout engine and reports a 0px viewport (the grid falls back to 600px), so such bugs are invisible there
- Browser tests run in Chromium, Firefox and WebKit: `npx playwright install chromium firefox webkit` once. One engine only: `npx vitest run --project browser --browser.name=firefox`
- Browser test files run one at a time (`fileParallelism: false`): several test pages open at once in one Firefox steal focus and pointer input from each other
- Keep browser tests engine-neutral: no CDP (`cdp()` is Chromium-only; use a Playwright-backed command such as `commands.setColorScheme` from `vitest.config.ts`), Tab-order anchors are text inputs (WebKit on macOS skips buttons on Tab), compare scroll positions with what the browser actually took (Firefox snaps them to device pixels), and wait for CSS animations to finish before measuring. Skip an engine only with `it.skipIf(server.browser === '...')` (`server` from `vitest/browser`) and a comment saying why

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

## v3.1.0 — significant changes

- `GridColDef.sortComparator(v1, v2, params1, params2)`: ascending comparator; sees null/undefined (no built-in nulls-last for that column); negated for desc. Sorting utils (`lib/utils/sorting`) take it through `GridSortValue.comparator` + `params` — two items use it only when both carry the same comparator, otherwise the built-in key comparison applies (tree auto-parents, group rows sorted by a non-grouping field). Always call it through `callSortComparator` (throw / NaN → 0, warn once). Row grouping passes the grouping column's comparator for group rows; pivot uses the source column's for row-label fields
- Column auto-size: `useGridColumnAutosize` (hooks/core, after `useGridScrollToIndexesApi`) measures via `lib/utils/columnAutosize` (`.ogx__cell-content` / `.ogx__header-cell-content` at `max-content` + cell padding/borders, scoped to the grid's own `.ogx` root so nested grids are skipped) and writes through `handleColumnResize`. Installs `apiRef.autosizeColumn` / `autosizeColumns`; `ColumnResizeHandle` calls it on double-click and Enter. Only rendered rows are measured

## v3.0.1 — significant changes

- Without a `height` prop the root gets `ogx--fill` (`height: 100%; flex: 1 1 auto; min-height: 0`) and fills its container; in an auto-height container it still grows to fit. The unbounded warning in `useGridDevWarnings` also requires the viewport to be at least as tall as the rows
- The list view does not virtualize; `useGridDevWarnings` warns above `LIST_VIEW_WARN_THRESHOLD` (2000) items
- The column resize handle lies inside its header cell (the cell clips overflow); right-pinned columns take `margin-left: auto` on their first cell and `.ogx__content` is `max(100%, totalWidth)` when right-pinned columns exist
- `GridApi<R>` / `useGridApiRef<R>()` type the row getters; `apiRef` prop accepts `MutableRefObject<GridApi<R>> | MutableRefObject<GridApi>`
- `.ogx-list-view__rows` has `tabIndex={-1}` (Firefox makes scroll containers Tab stops). CI (deploy + publish workflows) installs and runs Chromium, Firefox and WebKit
- Demo pages: a `<DataGrid>` without `height` now stretches to its parent; give demo grids an explicit `height` (or a sized wrapper) unless filling is intended

## v3.0.0 — significant changes (breaking)

Correctness release; full list in `CHANGELOG.md`, consumer guide in `docs/migration/v2-to-v3.md`. Facts future work needs:

- **Rows are never modified.** No `id` or underscore fields are written; the row store maps rows to ids via `getRowId` and `idByRow` (`useGridRowIdOf`). Hierarchy info lives only in `rowMetaMap`
- **Generics use `GridValidRowModel` (`object`)**, not `GridRowModel`, so consumer interfaces work; `DataGrid` and exports have typed and untyped-columns overloads
- **Read cell values through `getCellValue` (`lib/utils/values.ts`)**: it applies `valueGetter` and contains throws (value `undefined`, dev warning once per column). Don't call `valueGetter` directly
- **Consumer callbacks must be contained** (throws fall back to defaults); synthetic rows (group, subtotal, auto-parent, pivot Grand Total) are never selectable and never start or join row spans
- **`DataGrid.tsx` hook layout** is documented in `docs/architecture/datagrid-orchestration.md`
- **`npm run typecheck`** (lib, tests, demo) is a gate alongside lint and build

## v2.1.0 — significant changes

- Row-grouping aggregation now shares `lib/utils/aggregation` (nulls ignored, `unique`, `availableAggregationFunctions`). Expansion in **both** `useRowGrouping` and `useTreeData` is derived state (depth default plus user overrides keyed by config); no effect resets it on row changes. Never call callbacks such as `onRowExpansionChange` inside a `setState` updater
- Hierarchy renderers injected by `useGridColumns` must render `params.formattedValue`, not `params.value`, or `valueFormatter` is lost; `Cell` passes `formattedValue` into `renderCell` params
- `slots.footer` / `noRowsOverlay` / `loadingOverlay` are rendered (they were typed-only). `footer` replaces the pagination area and receives grid state
- New: `onRowDoubleClick`, exported `ColumnVisibilityPanel`, `ExcelAdvancedExportOptions.groupedRows`
- Row indices: `renderContext` and `layout.cumulativeHeights` cover **center (unpinned) rows only**; `allRenderableRows` indices include top-pinned rows. Convert with `pinnedTopRows.length`. Vertical scroll-into-view goes through `lib/utils/scroll` (`scrollRowIntoView`), which accounts for the sticky header and pinned rows
- **Virtualization needs a bounded container height.** In an unbounded container (e.g. flex child without `min-height: 0`) the viewport grows to content and every row renders; pagination masks it and grouping disables pagination. `useGridDevWarnings` warns about both

## v2.0.0 — significant changes (breaking)

### Breaking: removed dead public API surface

The following props existed in v1.x but had no runtime implementation. They have been **removed** from the public TypeScript types. (`GridColDef.description` was *not* removed — it renders as the header `title` tooltip.)

| Removed | Type | Reason |
| :--- | :--- | :--- |
| `onPinnedRowsChange` | `DataGridProps` | No pin/unpin-row UI exists; callback was never called |
| `onRowGroupingModelChange` | `DataGridProps` | No drag-to-group UI; callback was never called |

### New: `density` prop wired

`density?: 'compact' | 'standard' | 'comfortable'` now controls `effectiveRowHeight` (compact=32, standard=`rowHeight`, comfortable=72) via CSS `--ogx-row-height`. Previously the prop was accepted but silently discarded.

### New: `disableRowSelectionOnClick` and `disableMultipleRowSelection`

Both props are now wired in `handleRowClick`. `disableRowSelectionOnClick` suppresses click-to-select; `disableMultipleRowSelection` caps selection to a single row.

### New: `groupingColDef` implemented

When `rowGroupingModel` is active, passing `groupingColDef` now creates a dedicated synthetic `__group__` column at position 0, auto-pinned left. Previously the prop was accepted but had no runtime effect.

### New: `groupable: false` honored

Columns with `groupable: false` are now skipped when building the grouping tree in `useRowGrouping`. Previously this flag was silently ignored.

### New: `groupingValueFormatter` on `GridColDef`

```ts
groupingValueFormatter?: (params: { field: string; value: unknown }) => string
```

Customizes the label for group-header rows at that level. Falls back to `"${field}: ${value}"` when omitted. The formatted string flows through `GridRowMeta.groupLabel` so `useGridColumns` picks it up for rendering.

### New: `availableAggregationFunctions` honored

Per-column `availableAggregationFunctions?: string[]` now gates which aggregation functions are computed in `useAggregation`. If the current `aggregationModel` entry for a field uses a function not in that list, the aggregation is skipped for that field.

### New: Multi-sort shift-click

Shift-clicking a column header now appends to (or removes from) `sortModel` rather than replacing it. The sort priority badge (1, 2, 3…) appears next to the sort arrow when more than one sort key is active. Plain click still replaces with a single-key sort.

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
