# OpenGridX Library Hardening — Design Spec

**Date:** 2026-09-02  
**Version target:** v1.1.0  
**Status:** Approved — ready for implementation planning

---

## Overview

Four parallel improvements that harden the library without breaking existing users, plus a documentation layer designed to be consumed by AI coding assistants. Each item is independently shippable but all ship together as v1.1.0.

**What is NOT in scope here (already implemented):**
- Accessibility roles/attributes — completed 2026-03-03
- `useGridColumns` / `useGridVisibleRows` hook extraction — completed 2026-07-29
- Filter AND/OR logic — completed per roadmap

---

## 1. Row Metadata Isolation

### Problem

`GridRowModel` (in `lib/types/index.ts`) currently exposes internal hierarchy fields as typed optional properties:

```ts
// Current — leaks implementation detail into public type
interface GridRowModel {
  id: GridRowId;
  _hasChildren?: boolean;
  _treeDepth?: number;
  _groupingField?: string;
  _groupingValue?: unknown;
  _descendantCount?: number;
  _isExpanded?: boolean;
  _isGroupRow?: boolean;
  [key: string]: unknown;
}
```

These were never documented as user-facing API. A user whose data has a field called `_hasChildren` gets a silent collision. The types mislead users into depending on an implementation detail.

### Solution

**New public type: `GridRowMeta`**

```ts
// lib/types/index.ts — new interface
export interface GridRowMeta {
  hasChildren?: boolean;
  treeDepth?: number;
  groupingField?: string;
  groupingValue?: unknown;
  descendantCount?: number;
  isExpanded?: boolean;
  isGroupRow?: boolean;
}
```

**Type changes:**
- Remove all `_*` fields from `GridRowModel`
- Add `rowMeta?: GridRowMeta` to `GridRenderCellParams<R>` — the new typed path for custom `renderCell` implementations that need hierarchy context

**Internal data flow change:**
- `useTreeData` and `useRowGrouping` currently write `_hasChildren` etc. directly onto each row object in their returned row arrays
- They each gain a new return field: `rowMetaMap: Map<GridRowId, GridRowMeta>`
- `DataGrid.tsx` selects the active map — `treeDataHandlers.rowMetaMap` when `treeData=true`, `rowGroupingHandlers.rowMetaMap` when row grouping is active, otherwise an empty map. Tree data and row grouping are mutually exclusive; no actual merging occurs. The selected map is held in a `rowMetaMap` const.
- `useGridColumns` receives `rowMetaMap` as a new param, reads from it instead of from `row._hasChildren` etc. (eliminates the current `Record<string, unknown>` casting in the hierarchy cell renderer)
- `GridRenderCellParams` is constructed with `rowMeta: rowMetaMap.get(row.id)` — `undefined` for non-hierarchy rows

**Runtime backward-compat shim (v1.1 only):**
- The underscore fields continue to be injected onto the row object at runtime by `useTreeData` / `useRowGrouping`. The injection code is not removed — only the TypeScript type declaration is removed.
- Effect: `(params.row as any)._hasChildren` still resolves at runtime. TypeScript strict-mode users get a compile error pointing them to `params.rowMeta`. JS users and `as any` users are unaffected.
- This shim is removed in v2.0.

**Files touched:**
- `lib/types/index.ts` — type changes
- `lib/hooks/useTreeData.ts` — add `rowMetaMap` to return
- `lib/hooks/useRowGrouping.ts` — add `rowMetaMap` to return
- `lib/hooks/core/useGridColumns.tsx` — accept `rowMetaMap` param, replace `row._*` access
- `lib/components/DataGrid/DataGrid.tsx` — merge maps, pass to useGridColumns, inject into renderCellParams

**Migration guide (for doc):**

```tsx
// Before (still works at runtime in v1.1, TypeScript error in strict mode)
renderCell: (params) => {
  const hasChildren = (params.row as any)._hasChildren;
  return hasChildren ? <GroupIcon /> : params.value;
}

// After (v1.1+)
renderCell: (params) => {
  const hasChildren = params.rowMeta?.hasChildren;
  return hasChildren ? <GroupIcon /> : params.value;
}
```

---

## 2. Cell Error Boundary

### Problem

A runtime error inside a custom `renderCell` callback propagates up and crashes the entire DataGrid. There is no error containment — one bad cell takes down the whole table.

### Solution

New class component `CellErrorBoundary` wrapping only the `renderCell` output inside `Cell.tsx`. Default cell rendering (plain value display, no `renderCell`) does not go through the boundary — it cannot throw.

**Location:** `lib/components/Cell/CellErrorBoundary.tsx`

**Interface:**

```ts
interface CellErrorBoundaryProps {
  children: React.ReactNode;
  field: string;  // used in fallback aria-label
}

interface CellErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
```

**Behavior:**
- On error: renders a `<div className="ogx__cell-error" role="alert" aria-label={`Error in cell: ${field}`} title={error?.message}>⚠</div>`
- The cell frame (`role="gridcell"`, `aria-colindex`, selection, pinning styles) is unaffected — it comes from `Cell.tsx` which is outside the boundary
- Error is caught silently (React already logs it to console); no additional logging
- Error state is per-cell — other cells continue rendering normally
- No `onError` prop — this is internal containment, not user-visible error reporting

**Integration in `Cell.tsx`:**

```tsx
// Only the renderCell output is wrapped
{col.renderCell ? (
  <CellErrorBoundary field={col.field}>
    {col.renderCell(cellParams)}
  </CellErrorBoundary>
) : (
  formattedValue  // plain value — no boundary needed
)}
```

**Files touched:**
- `lib/components/Cell/CellErrorBoundary.tsx` — new file
- `lib/components/Cell/Cell.tsx` — wrap renderCell output

---

## 3. Pagination `localeText` (i18n)

### Problem

All user-visible strings in `Pagination.tsx` are hardcoded English: "Rows per page:", "Page X of Y", "X–Y of Z". There is no way to override them without replacing the entire pagination component via the `slots.pagination` slot.

### Solution

New optional `localeText` prop on `DataGrid`, forwarded to `Pagination`. All existing strings become defaults — no existing code changes behaviour.

**New type:**

```ts
// lib/types/index.ts
export interface GridLocaleText {
  /** Label before the rows-per-page select. Default: "Rows per page:" */
  paginationRowsPerPage?: string;

  /** Range label. Receives (from, to, count). Default: (f, t, c) => `${f}–${t} of ${c}` */
  paginationOf?: (from: number, to: number, count: number) => string;

  /** Page counter label. Receives (page, pageCount). Default: (p, pc) => `Page ${p} of ${pc}` */
  paginationPage?: (page: number, pageCount: number) => string;

  /** Empty-state message. Merges with the existing noRowsLabel prop (localeText wins). */
  noRowsLabel?: string;
}
```

**Prop addition:**

```ts
// DataGridProps
localeText?: Partial<GridLocaleText>;
```

**Pagination receives:**

```ts
// PaginationProps gains:
localeText?: Pick<GridLocaleText, 'paginationRowsPerPage' | 'paginationOf' | 'paginationPage'>;
```

**`Pagination.tsx` usage:**

```tsx
const rowsPerPageLabel = localeText?.paginationRowsPerPage ?? 'Rows per page:';
const ofLabel = localeText?.paginationOf
  ? localeText.paginationOf(firstRowIndex + 1, lastRowIndex, rowCount)
  : `${displayedRows} of ${rowCount}`;
const pageLabel = localeText?.paginationPage
  ? localeText.paginationPage(currentPage + 1, pageCount)
  : `Page ${currentPage + 1} of ${pageCount}`;
```

**`GridEmptyState` receives `noRowsLabel` from merged value** (existing `noRowsLabel` prop on DataGrid is kept; `localeText.noRowsLabel` overrides it if both are set).

**Files touched:**
- `lib/types/index.ts` — add `GridLocaleText`
- `lib/components/DataGrid/DataGrid.tsx` — accept `localeText` prop, forward to Pagination and GridEmptyState
- `lib/components/Pagination/Pagination.tsx` — consume localeText with defaults
- `lib/components/DataGrid/GridEmptyState.tsx` — accept `noRowsLabel` from merged source

**Example — French locale:**

```tsx
<DataGrid
  localeText={{
    paginationRowsPerPage: 'Lignes par page :',
    paginationOf: (from, to, count) => `${from}–${to} sur ${count}`,
    paginationPage: (page, pageCount) => `Page ${page} sur ${pageCount}`,
    noRowsLabel: 'Aucune donnée',
  }}
  // ...
/>
```

---

## 4. Test Coverage — Core Hooks

### Problem

Three high-impact core hooks have zero test coverage: `useGridRowPipeline`, `useGridControlledState`, `useGridKeyboardNavigation`. These hooks determine whether rows display correctly, whether controlled/uncontrolled state is respected, and whether keyboard interaction works. Bugs here are silent until a user reports them.

### Solution

Three new test files following the existing pattern (`usePivot.test.ts`, `useAggregation.test.ts` — Vitest, renderHook from `@testing-library/react`).

**`lib/hooks/core/useGridRowPipeline.test.ts`**

| Test | What it verifies |
|---|---|
| client filter — string contains | rows filtered by field value |
| client filter — isEmpty operator | rows with null/undefined excluded |
| client sort — ascending / descending | row order after sort |
| client sort — multi-column | secondary sort key respected |
| client pagination — page 0 | first N rows returned |
| client pagination — page 1 | correct offset slice |
| pinned rows excluded from pagination count | pinned top/bottom not included in page slice |
| paginationMode server — rows passed through unsliced | server mode: no client-side slice |
| filterMode server — rows passed through unfiltered | server mode: no client-side filter |

**`lib/hooks/core/useGridControlledState.test.ts`**

| Test | What it verifies |
|---|---|
| uncontrolled sort — internal state updates | setInternalSortModel updates state |
| controlled sort — external prop wins | isSortControlled=true, internal setter ignored |
| uncontrolled pagination — page change updates state | handlePaginationModelChange mutates internal state |
| controlled pagination — prop value always returned | external paginationModel prop takes precedence |
| uncontrolled selection — selection updates | setInternalRowSelectionModel works |
| initialState.sorting seeds internal sort | initial sort model applied on first render |
| initialState.pagination seeds page/pageSize | initial pagination applied on first render |

**`lib/hooks/core/useGridKeyboardNavigation.test.ts`**

| Test | What it verifies |
|---|---|
| ArrowDown moves focus to next row | focusedCell.id changes to next row |
| ArrowUp at first row — no change | clamps at top boundary |
| ArrowRight moves to next column | focusedCell.field changes |
| ArrowLeft at first column — no change | clamps at left boundary |
| Enter triggers edit start | editingHandlers.startEditing called |
| Escape cancels edit | editingHandlers.stopEditing called with cancel |
| Home moves to first column | focusedCell.field = first navigation column |
| End moves to last column | focusedCell.field = last navigation column |
| Space toggles checkbox selection row | handleSelectionChange called |

**Files created:**
- `lib/hooks/core/useGridRowPipeline.test.ts`
- `lib/hooks/core/useGridControlledState.test.ts`
- `lib/hooks/core/useGridKeyboardNavigation.test.ts`

---

## 5. Documentation

### Existing docs to update

| File | What changes |
|---|---|
| `docs/components/row.md` | Add deprecation notice for `_*` fields on `params.row`; migration example to `params.rowMeta` |
| `docs/components/pagination.md` | Add `localeText` prop table; French locale example |
| `docs/components/filter-panel.md` | Add note that `renderCell` can use `params.rowMeta` for hierarchy-aware cells |
| `docs/components/cell.md` | Add section on `CellErrorBoundary` — what it catches, fallback appearance, that it wraps only `renderCell` |

### New architecture doc

**`docs/architecture/grid-row-meta.md`**

Covers:
- Why `GridRowMeta` is separate from `GridRowModel`
- The `Map<GridRowId, GridRowMeta>` data flow: `useTreeData`/`useRowGrouping` → `DataGrid` → `useGridColumns` + `GridRenderCellParams`
- Runtime shim explanation and v2 removal plan
- How to access metadata in a custom `renderCell`
- Why no metadata is present for flat (non-hierarchy) rows (`rowMeta` is `undefined`)

### New root-level `CLAUDE.md`

The single most important documentation artifact. Auto-loaded by Claude Code and most AI coding assistants when working in the repo. Written to answer "what is this codebase and how do I work in it" without requiring the AI to explore files first.

**Sections:**

1. **What this is** — React DataGrid component library, TypeScript strict, React 19, Vitest
2. **Architecture map** — prose description of data flow:
   - Props enter `DataGrid.tsx`
   - `useGridControlledState` normalises controlled/uncontrolled prop pairs
   - `useGridRowPipeline` filters → sorts → paginates rows
   - `useGridColumns` injects hierarchy renderers, resolves order/visibility
   - `useGridVirtualization` computes which rows/columns are in the render window
   - `useGridVisibleRows` merges pinned + virtual center → `{ row, rowIndex }[]`
   - JSX renders `Header` + `GridVirtualRows` + `GridPinnedRows` + `Pagination`
3. **Key files** — flat list: `lib/types/index.ts` (all public types), `lib/hooks/core/` (pipeline hooks), `lib/hooks/features/` (opt-in feature hooks), `lib/components/DataGrid/DataGrid.tsx` (orchestration only, no logic)
4. **Where to add things** — decision table:
   - New column type → `lib/utils/filtering/filtering.ts` + `types/index.ts`
   - New feature hook → `lib/hooks/features/`
   - New core pipeline stage → `lib/hooks/core/`
   - New component → `lib/components/<Name>/`
   - New public prop on DataGrid → `DataGridProps` in `types/index.ts`, destructure in `DataGrid.tsx`
5. **Naming conventions** — `ogx__` BEM class prefix, `--ogx-*` CSS variables, `use-grid-*` hook naming, `Grid*` prefix for all exported types
6. **`GridRowMeta` pattern** — brief explanation + pointer to full doc, v2 shim plan
7. **Testing conventions** — Vitest, `renderHook` for hooks, `@testing-library/react` for components, test files co-located with source
8. **Docs conventions** — component docs in `docs/components/`, hook docs in `docs/architecture/`, feature guides in `docs/features/`
9. **Build and lint** — `npm run lint && npm run build` must pass after every change; zero `eslint-disable`, zero `any`
10. **Version and recent changes** — current version, summary of significant v1.1 changes

**Files created:**
- `CLAUDE.md` (project root)
- `docs/architecture/grid-row-meta.md`

---

## Implementation Order

Dependencies determine this sequence — each step can be verified independently:

1. `GridLocaleText` type + `localeText` prop (pure addition, no risk)
2. `GridRowMeta` type + remove from `GridRowModel` + update `useTreeData` / `useRowGrouping`
3. Update `useGridColumns` to use `rowMetaMap`; inject `rowMeta` into `GridRenderCellParams`
4. `CellErrorBoundary` component + integration in `Cell.tsx`
5. Three test files
6. Docs: update existing component docs
7. Docs: new `docs/architecture/grid-row-meta.md`
8. Docs: `CLAUDE.md` at project root

`npm run lint && npm run build` runs after every step.

---

## Breaking Changes Summary

| Change | Breaking? | Who is affected |
|---|---|---|
| `_*` fields removed from `GridRowModel` type | TypeScript compile error only | Users accessing `params.row._hasChildren` etc. with typed access |
| `_*` fields still on row object at runtime | Not breaking | JS users / `as any` users — no change |
| `params.rowMeta` added to `GridRenderCellParams` | Not breaking — additive | All users gain access |
| `localeText` prop added to DataGrid | Not breaking — additive | All users gain access |
| `CellErrorBoundary` wrapping renderCell | Behaviour change (errors now caught) | Any user who relied on uncaught renderCell errors propagating — extremely unlikely |

**Version:** all changes ship as **v1.1.0** (minor bump — the `GridRowModel` type change is a breaking TypeScript change).
