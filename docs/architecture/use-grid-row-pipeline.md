# `useGridRowPipeline`

Internal hook. Transforms the raw `rows` array through a deterministic five-stage pipeline — filter → pin → sort → paginate → assemble — producing the final ordered list of rows the viewport renders.

**File:** `lib/hooks/core/useGridRowPipeline.ts`

---

## Purpose

Before this hook existed, the five `useMemo` stages lived inline in `DataGrid.tsx` (~85 lines). Extracting them into one place makes the pipeline independently testable and removes noise from the main component.

---

## Pipeline stages

```
effectiveRows
   │
   ▼ filterRows (client) / getVisibleRows (hierarchy) / passthrough (filterMode='server')
filteredRows
   │
   ▼ getPinnedRowGroups
pinnedTopRows, unpinnedRows, pinnedBottomRows
   │
   ▼ sortRows (client) / passthrough (sortingMode='server' / hierarchy)
sortedUnpinnedRows
   │
   ▼ slice [page * pageSize, (page+1) * pageSize]  — skipped when pagination=false or paginationMode='server'
paginatedUnpinnedRows
   │
   ▼ [...pinnedTop, ...center, ...pinnedBottom] + optional skeleton rows
allRenderableRows   ← consumed by viewport
```

**Server modes do not need a `dataSource`.** `filterMode`, `sortingMode` and `paginationMode` set to
`'server'` mean the rows already arrived filtered, sorted or paged, whether a `dataSource` fetched
them or the consumer did (for example from `onPaginationModelChange`). Before v3.0 the passthrough
applied only when a `dataSource` was also set, so a consumer-fetched page was sliced again (page 2
rendered empty) and server results were re-filtered and re-sorted with client rules.

---

## Parameters

```ts
interface UseGridRowPipelineParams<R extends GridRowModel> {
    effectiveRows: R[];                       // rows after dataSource / prop merge
    activeHierarchyHandlers: { getVisibleRows: () => R[] } | null;
    filterMode: 'client' | 'server';
    filterModel: GridFilterModel;
    sortModel: GridSortItem[];
    sortingMode: 'client' | 'server';
    pagination: boolean;                      // must be true to enable slicing
    paginationMode: 'client' | 'server' | 'infinite';
    effectivePaginationModel: GridPaginationModel;
    pinnedRows?: GridRowPinning;              // { top: GridRowId[], bottom: GridRowId[] }
    getRowId?: (row: R) => GridRowId;         // resolves ids for pinnedRows; rows are not required to carry `id`
    isLoading: boolean;
    pageSize: number;
}
```

> **`GridRowPinning` vs `GridPinnedRows<R>`** — `GridRowPinning` (used here) holds `top: GridRowId[]`; `GridPinnedRows<R>` holds `top: R[]`. These are distinct types. `getPinnedRowGroups` expects `GridRowPinning`.

---

## Returns

```ts
interface GridRowPipelineResult<R extends GridRowModel> {
    filteredRows: R[];
    dataRows: R[];               // filtered data rows, independent of hierarchy expansion
    pinnedTopRows: R[];
    unpinnedRows: R[];
    pinnedBottomRows: R[];
    sortedUnpinnedRows: R[];
    paginatedUnpinnedRows: R[];
    allRenderableRows: R[];      // the viewport consumes this
}
```

All intermediate results are returned so features like the row count badge or aggregation can read them without re-deriving them. The client pager counts `sortedUnpinnedRows` (filtered, pinned rows excluded, since pinned rows show on every page); select-all acts on `dataRows`.

---

## Hierarchy mode shortcut

When `activeHierarchyHandlers` is set (tree data or row grouping), the hook delegates row ordering entirely to the hierarchy controller. Pinning and client-side sort/filter are bypassed:

```
getVisibleRows() → allRenderableRows (direct pass-through)
```

---

## Infinite scroll skeleton injection

When `paginationMode === 'infinite'` and `isLoading === true` and rows already exist, the hook appends synthetic skeleton rows:

```ts
{ id: '__skeleton_0__', _isSkeleton: true }, ...
```

Up to `Math.min(pageSize, 20)` skeletons are injected. The viewport renders these as shimmer cells.

---

## Relationship to DataGrid

`DataGrid.tsx` calls this hook and destructures `allRenderableRows` for the viewport, `filteredRows` for the row count display, and `pinnedTopRows` / `pinnedBottomRows` for the sticky row sections.

---

## 🔗 Related
- [useGridControlledState](use-grid-controlled-state.md)
- [useGridVirtualization](use-grid-virtualization.md)
- [Filtering](../features/filtering.md)
- [Sorting & Pagination](../features/sorting-pagination.md)
- [Tree Data & Grouping](../features/tree-data-grouping.md)
