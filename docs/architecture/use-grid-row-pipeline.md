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
   ▼ filterRows (client) / getVisibleRows (hierarchy) / passthrough (server)
filteredRows
   │
   ▼ getPinnedRowGroups
pinnedTopRows, unpinnedRows, pinnedBottomRows
   │
   ▼ sortRows (client) / passthrough (server / hierarchy)
sortedUnpinnedRows
   │
   ▼ slice [page * pageSize, (page+1) * pageSize]  — skipped when pagination=false or server
paginatedUnpinnedRows
   │
   ▼ [...pinnedTop, ...center, ...pinnedBottom] + optional skeleton rows
allRenderableRows   ← consumed by viewport
```

---

## Parameters

```ts
interface UseGridRowPipelineParams<R extends GridRowModel> {
    effectiveRows: R[];                       // rows after dataSource / prop merge
    activeHierarchyHandlers: { getVisibleRows: () => R[] } | null;
    filterMode: 'client' | 'server';
    filterModel: GridFilterModel;
    dataSource?: GridDataSource<R>;
    sortModel: GridSortItem[];
    sortingMode: 'client' | 'server';
    pagination: boolean;                      // must be true to enable slicing
    paginationMode: 'client' | 'server' | 'infinite';
    effectivePaginationModel: GridPaginationModel;
    pinnedRows?: GridRowPinning;              // { top: GridRowId[], bottom: GridRowId[] }
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
    pinnedTopRows: R[];
    unpinnedRows: R[];
    pinnedBottomRows: R[];
    sortedUnpinnedRows: R[];
    paginatedUnpinnedRows: R[];
    allRenderableRows: R[];      // the viewport consumes this
}
```

All intermediate results are returned so features like the row count badge or aggregation can read `filteredRows.length` without re-deriving it.

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
