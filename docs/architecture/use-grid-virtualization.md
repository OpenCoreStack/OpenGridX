# `useGridVirtualization`

Internal hook. Converts scroll position, viewport dimensions, and the current row/column layout into a render context — the minimal window of rows and columns that need to be in the DOM at any given moment.

**File:** `lib/hooks/core/useGridVirtualization.ts`

---

## Purpose

Row and column virtualization is the core performance mechanism: instead of rendering all rows and columns, only the visible slice is rendered. This hook encapsulates the binary search and offset math that determines that slice.

Before extraction, ~120 lines of `useMemo` logic lived inside `DataGrid.tsx`. The hook makes the math independently readable and testable.

---

## Parameters

```ts
interface UseGridVirtualizationParams<R extends GridRowModel> {
    layout: LayoutResult<R>;                      // from useLayout: row heights, column widths
    scrollPosRef: React.MutableRefObject<{
        scrollTop: number;
        scrollLeft: number;
    }>;
    scrollTick: number;     // increments on scroll; exists only to invalidate the memo
    viewportWidth: number;
    viewportHeight: number;
    autoHeight: boolean;
    rowReordering: boolean;
    hasDetailPanel: boolean;
    checkboxSelection: boolean;
    pinCheckboxColumn: boolean;
    pinExpandColumn: boolean;
}
```

> **`scrollTick` pattern** — The scroll position is read from `scrollPosRef.current` inside the memo body rather than held in state to avoid triggering a full React re-render on every scroll frame. `scrollTick` is the only scroll-related memo dependency — it is incremented by the rAF loop after every scroll event to invalidate and rerun the memo.

---

## Returns

```ts
interface GridVirtualizationResult {
    renderContext: {
        firstRowIndex: number;
        lastRowIndex: number;
        firstColumnIndex: number;
        lastColumnIndex: number;
    };
    offsetTop: number;           // translateY for the virtual row block
    offsetLeft: number;          // translateX for the virtual column block
    totalHeight: number;         // full scrollable height
    pinnedTopHeight: number;
    pinnedBottomHeight: number;
    totalWidth: number;
    rowHeights: number[];
    cumulativeHeights: number[]; // prefix sums; binary-searched to find firstRowIndex
    virtualColumns: object[];    // rendered column descriptors (includes spacers)
    columnMetrics: {
        leftPinnedWidth: number;
        rightPinnedWidth: number;
        unpinnedAccWidths: number[];  // prefix sums for column binary search
        unpinnedCols: GridColDef[];
        totalSpecialsWidth: number;   // combined width of checkbox / expand / reorder columns
        pinnedSpecialsWidth: number;
    };
}
```

---

## Binary search algorithm

The hook uses binary search on the `cumulativeHeights` prefix-sum array to find the first visible row in O(log n) instead of scanning all rows:

```
cumulativeHeights[i] = sum of heights of rows 0..i-1

firstRowIndex = last index where cumulativeHeights[i] <= scrollTop
```

The same approach is used for columns via `unpinnedAccWidths`.

---

## `autoHeight` mode

When `autoHeight={true}`, the viewport height is set to the sum of all row heights (`totalHeight`) rather than a fixed container height. Virtualization is effectively disabled — all rows are in the render window — so the height adjusts to content.

---

## Relationship to DataGrid

`DataGrid.tsx` calls this hook and uses:
- `renderContext` to slice `allRenderableRows` to only the visible subset
- `offsetTop` as the `translateY` value on the virtual row container
- `totalHeight` and `totalWidth` to set the scroll container's inner dimensions
- `columnMetrics` to lay out pinned and unpinned column groups

---

## 🔗 Related
- [useGridRowPipeline](use-grid-row-pipeline.md)
- [Virtualization](../features/virtualization.md)
