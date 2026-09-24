# `useGridVirtualization`

Internal hook. Converts scroll position, viewport dimensions, and the current row/column layout into a render context — the minimal window of rows and columns that need to be in the DOM at any given moment.

**File:** `lib/hooks/core/useGridVirtualization.ts`

---

## Purpose

Row virtualization is the core performance mechanism: instead of rendering all rows, only the visible slice is rendered. Columns are virtualized too: of the unpinned (centre) columns, only those in the horizontal viewport plus an overscan of **6 columns on each side** are rendered, with spacer columns standing in for the rest. Pinned columns (left and right) are always rendered. This hook encapsulates the binary search and offset math that determines both slices.

Row indices in `renderContext` and `cumulativeHeights` cover the **centre (unpinned) rows only**; top- and bottom-pinned rows are laid out separately (`pinnedTopHeight` / `pinnedBottomHeight`).

Before extraction, ~120 lines of `useMemo` logic lived inside `DataGrid.tsx`. The hook makes the math independently readable and testable.

---

## Parameters

```ts
interface UseGridVirtualizationParams<R extends GridRowModel> {
    layout: LayoutResult<R>;   // from useLayout: row heights, column widths
    scrollTop: number;         // current vertical scroll position in pixels
    scrollLeft: number;        // current horizontal scroll position in pixels
    viewportWidth: number;
    viewportHeight: number;
    autoHeight: boolean;
    rowReordering: boolean;
    hasDetailPanel: boolean;
    checkboxSelection: boolean;
    pinCheckboxColumn: boolean;
    pinExpandColumn: boolean;
    /** Adaptive overscan row count from useGridScrollSync. Defaults to 5 when omitted. */
    overscanRows?: number;
}
```

> `scrollTop`, `scrollLeft`, and `overscanRows` all come from `useGridScrollSync`, which batches scroll events via RAF and bundles all three into a single state update that fires at most once per animation frame. `overscanRows` there is velocity-based and never below the grid's `overscanRowCount` prop (default 3). Column overscan is fixed at 6 and not configurable.

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
    offsetLeft: number;          // always 0: horizontal offset is carried by spacer columns
    totalHeight: number;         // full scrollable height
    pinnedTopHeight: number;
    pinnedBottomHeight: number;
    totalWidth: number;
    rowHeights: number[];
    cumulativeHeights: number[]; // inclusive prefix sums of centre-row heights (from useLayout)
    virtualColumns: (GridColDef<R> & { width: number })[]; // left-pinned, [__spacer_left__], window, [__spacer_right__], right-pinned
    columnMetrics: {
        leftPinnedWidth: number;
        rightPinnedWidth: number;
        unpinnedAccWidths: number[];  // inclusive prefix sums of unpinned column widths
        unpinnedCols: { field: string; width: number }[];
        totalSpecialsWidth: number;   // combined width of checkbox / expand / reorder columns
        pinnedSpecialsWidth: number;
    };
}
```

---

## Binary search algorithm

The hook uses binary search on the `cumulativeHeights` prefix-sum array to find the first visible row in O(log n) instead of scanning all rows:

```
cumulativeHeights[i] = sum of heights of centre rows 0..i   (inclusive: the bottom edge of row i)

firstVisible  = first index where cumulativeHeights[i] >= scrollTop
firstRowIndex = max(0, firstVisible - overscanRows)
offsetTop     = firstRowIndex > 0 ? cumulativeHeights[firstRowIndex - 1] : 0
lastRowIndex  = (first index where cumulativeHeights[i] >= scrollTop + viewportHeight) + overscanRows,
                clamped to the last centre row
```

Row heights include an expanded detail panel's height, so the prefix sums account for open panels.

Columns use the same search on `unpinnedAccWidths` (also inclusive), relative to the left edge of the unpinned area (`scrollLeft - leftPinnedWidth`), widened by 6 columns on each side. The skipped widths become `__spacer_left__` / `__spacer_right__` entries (`isSpacer: true`) in `virtualColumns`.

When a column declares `colSpan` / `rowSpan`, `DataGrid` widens this window afterwards (`useGridSpanRowWindow` / `useGridSpanColumnWindow`) so a span whose origin is outside the window is not cut.

---

## `autoHeight` mode

When `autoHeight={true}`, the viewport height used for the row window is the sum of all row heights (pinned and centre, plus 50px) rather than the measured container height. Row virtualization is effectively disabled — all rows are in the render window — so the height adjusts to content. Column virtualization still applies. Without `autoHeight`, a viewport that has not been measured yet falls back to 600px high and 1000px wide.

---

## Relationship to DataGrid

`DataGrid.tsx` calls this hook and uses:
- `renderContext` (after the span widening above) to slice the centre rows to the visible subset; `useGridVisibleRows` then merges them with the pinned rows
- `offsetTop` as the `translateY` value on the virtual row container
- `totalHeight` and `totalWidth` to set the scroll container's inner dimensions
- `columnMetrics` to lay out pinned and unpinned column groups

---

## 🔗 Related
- [useGridRowPipeline](use-grid-row-pipeline.md)
- [Virtualization](../features/virtualization.md)
