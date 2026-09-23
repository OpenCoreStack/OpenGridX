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
   ▼ slice [currentPage * pageSize, (currentPage+1) * pageSize]  — skipped when pagination=false or server
paginatedUnpinnedRows
   │
   ▼ [...pinnedTop, ...center, ...pinnedBottom]
allRenderableRows   ← the rows the grid view and the list view render
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
    columnLookup?: GridColumnLookup;          // from useGridColumnLookup(activeColumns, columnVisibilityModel)
}
```

`columnLookup` (built by `useGridColumnLookup`, `lib/utils/columnLookup.ts`) gives `filterRows` / `sortRows` the column definitions: cells are read through `valueGetter` (`getCellValue` in `lib/utils/values.ts`), the column `type` selects numeric / date comparison, and the quick filter searches only the visible, filterable columns. `DataGrid` passes the same lookup to `useTreeData` and `useRowGrouping`, which compile the filter once per pass with `createRowFilter` and sort with `compareRowsBySortModel` / `compareValues`. The lookup's identity changes only when the columns or the set of hidden columns change, so an inline `columnVisibilityModel` object does not re-run filter and sort.

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
    currentPage: number;         // the page actually sliced (clamped to the last page)
    allRenderableRows: R[];      // the rows the grid view and the list view render
}
```

All intermediate results are returned so features like the row count badge or aggregation can read `filteredRows.length` without re-deriving it.

---

## Page clamping

When the grid pages client-side, the slice uses `currentPage`: `effectivePaginationModel.page` clamped to `0 … pageCount - 1`, where `pageCount = ceil(sortedUnpinnedRows.length / pageSize)` (at least 1). A page size below 1 is treated as 1 (`lib/utils/pagination`). So when the rows shrink (new `rows`, a filter, collapsed tree nodes) and the requested page is past the end, the last page is shown instead of an empty body. Under server pagination (`paginationMode="server"` with a `dataSource`) `currentPage` is the requested page, because the server owns the page count.

`DataGrid` passes `currentPage` to the pager and calls `useGridPageCorrection`, which reports the corrected model through `onPaginationModelChange` (and stores it when uncontrolled) once rows are present and nothing is loading. A restored page is therefore not thrown away before the rows arrive.

---

## Hierarchy mode shortcut

When `activeHierarchyHandlers` is set (tree data or row grouping), the hook delegates row ordering entirely to the hierarchy controller. Pinning and client-side sort/filter are bypassed: `getVisibleRows()` becomes `filteredRows` and `sortedUnpinnedRows`. Pagination still applies, so `allRenderableRows` is the current page of the visible hierarchy, the same rows the grid view renders.

---

## Infinite scroll loading rows

`allRenderableRows` holds only real rows. While an infinite-scroll page loads, `GridVirtualRows` draws the placeholder rows itself (from `dataSourceLoading`) and `useLayout` adds their height, so the placeholders never reach `renderCell`, the list view, keyboard navigation, selection or spanning. (Before v3.0 the hook appended `{ id: '__skeleton_N__', _isSkeleton: true }` objects to `allRenderableRows`.)

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
