# `useGridVisibleRows`

Internal hook. Merges the pinned top rows, the virtual center window, and the pinned bottom rows into a single `{ row, rowIndex }[]` array — exactly what the viewport JSX iterates to render `<Row>` components.

**File:** `lib/hooks/core/useGridVisibleRows.ts`

---

## Purpose

The render window is the intersection of what the row pipeline produced and what the virtualization engine says is visible. Before this hook, ~40 lines of `useMemo` logic lived inline in `DataGrid.tsx`. Extracting it makes the merge strategy explicit and independently testable.

---

## Parameters

```ts
interface UseGridVisibleRowsParams<R extends GridRowModel> {
    renderContext: {
        firstRowIndex: number;  // from useGridVirtualization
        lastRowIndex: number;
    };
    pinnedTopRows: R[];             // from useGridRowPipeline
    pinnedBottomRows: R[];          // from useGridRowPipeline
    paginatedUnpinnedRows: R[];     // from useGridRowPipeline
    sortedUnpinnedRows: R[];        // from useGridRowPipeline
    pagination: boolean;
}
```

---

## Returns

```ts
GridVisibleRow<R>[]
// where GridVisibleRow<R> = { row: R; rowIndex: number }
```

`rowIndex` is the absolute position in the full (non-virtual) row list — used by `<Row>` to compute `aria-rowindex` and by the zebra-stripe CSS class.

---

## Merge strategy

```
topPinned:  rows 0 .. pinnedTopRows.length - 1              (always fully rendered)
center:     rows [firstRowIndex - topPinnedCount, lastRowIndex - topPinnedCount]
            (clipped to the virtual window)
bottomPinned: rows (topPinned + centerCount) .. end          (always fully rendered)
```

Pinned rows are NOT subject to virtualization — they are always in the DOM regardless of scroll position.

---

## Deduplication guard

After merging, the hook filters out any row whose `id` has already been seen:

```ts
const seenIds = new Set<GridRowId>();
return combined.filter(item => {
    if (seenIds.has(item.row.id)) return false;
    seenIds.add(item.row.id);
    return true;
});
```

**Why:** If a user passes the same row in both `rows` and `pinnedRows`, it would appear in both `pinnedTopRows` and `paginatedUnpinnedRows`. Two `<Row key={id}>` elements with the same key cause React reconciliation bugs. The guard ensures each ID appears at most once — the pinned version takes precedence since it comes first in the merged array.

---

## Relationship to DataGrid

`DataGrid.tsx` calls this hook after `useGridVirtualization` produces the render context and after `useGridRowPipeline` produces the pinned/paginated row groups. The returned `visibleRows` array is iterated directly in the viewport JSX.

---

## 🔗 Related
- [useGridRowPipeline](use-grid-row-pipeline.md)
- [useGridVirtualization](use-grid-virtualization.md)
- [useGridColumns](use-grid-columns.md)
