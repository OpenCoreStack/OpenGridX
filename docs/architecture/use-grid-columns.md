# `useGridColumns`

Internal hook. Manages the full column lifecycle: injects hierarchy cell renderers, maintains column widths and order state, derives ordered/visible column lists, and computes the navigation column array used by keyboard navigation and spanning.

**File:** `lib/hooks/core/useGridColumns.tsx` (`.tsx` — contains JSX for hierarchy cell renderers)

---

## Purpose

Before extraction, ~195 lines of column management lived inline in `DataGrid.tsx`. Pulling them out gives this logic its own test surface and removes hierarchy rendering concerns from the main component.

As a side effect of extraction, the `params.row as any` casts used to read internal row metadata (`_treeDepth`, `_hasChildren`, etc.) were replaced with typed `Record<string, unknown>` access, eliminating the only remaining `any` usages in the column rendering path.

---

## Parameters

```ts
interface UseGridColumnsParams<R extends GridRowModel> {
    activeColumns: GridColDef<R>[];           // pivot-resolved column list
    isHierarchyEnabled: boolean;              // true when treeData OR rowGrouping active
    isRowGrouping: boolean;
    isTreeData: boolean;
    activeHierarchyHandlers: { toggleExpansion: (id: GridRowId) => void } | null;
    columnVisibilityModel: Record<string, boolean>;
    columnOrder?: string[];                   // controlled; undefined = uncontrolled
    onColumnOrderChange?: (params: GridColumnOrderChangeParams) => void;
    onColumnOrderModelChange?: (columnOrder: string[]) => void;  // whole new order; not in pivot mode
    disableColumnReorder: boolean;
    pivotMode: boolean;                       // pivot is active (DataGrid passes useGridPivot's isActive)
    checkboxSelection: boolean;
    hasDetailPanel: boolean;
    rowReordering: boolean;
    initialState?: GridInitialState;
    setColumns: (cols: GridColDef[]) => void; // state store updater from useDataGrid
    pinnedColumns?: GridColumnPinning;
    aggregationModel?: GridAggregationModel;  // formats aggregates on row-grouping group rows
    groupingRows?: ReadonlyMap<GridRowId, unknown>; // row grouping's synthetic group rows, by id
}
```

> **`hasDetailPanel` is hoisted before the hook call in DataGrid.tsx** — it depends only on `getDetailPanelContent` (a prop), so it is computed as `Boolean(getDetailPanelContent)` immediately before `useGridColumns` is called.

---

## Returns

```ts
interface UseGridColumnsResult<R extends GridRowModel> {
    effectiveColumns: GridColDef<R>[];   // hierarchy renderers injected
    orderedColumns: GridColDef<R>[];     // sorted by effectiveColumnOrder
    visibleOrderedColumns: GridColDef<R>[];  // filtered by columnVisibilityModel
    navigationColumns: Array<GridColDef<R> | { field: string }>;  // system + data cols
    columnWidths: Record<string, number>;
    effectiveColumnOrder: string[];
    setInternalColumnOrder: React.Dispatch<...>;
    columnReorderHandlers: ReturnType<typeof useColumnReorder>;  // header drag
    moveColumn: (fromField: string, toField: string) => void;    // Columns panel drag
    resetColumnOrder: () => void;                                // Columns panel Reset
    handleColumnResize: (field: string, newWidth: number) => void;
}
```

---

## `effectiveColumns` — hierarchy renderer injection

When `isHierarchyEnabled` is `false`, `effectiveColumns` is `activeColumns` unchanged.

When `true`, the first column gets a `renderCell` override that:
1. Reads internal row metadata via `row as Record<string, unknown>` (no `any`)
2. Renders indented padding (`depth * 24px`) for tree nesting
3. Shows an `<ExpandIcon>` if the row has children
4. Overrides the cell content for row-grouping header rows (shows group label + count)

All other columns get a `renderCell` wrapper that returns `null` for row-grouping header rows when the column is the grouping field, hiding duplicated values.

Under row grouping, a column with an `aggregationModel` entry also gets `valueGetter` / `valueFormatter` wrappers for group rows (identified through `groupingRows`): the cell shows the aggregate stored on the group row (a `valueGetter` would recompute it from fields a group row does not have), formatted with `formatAggregateForColumn`, the formatter the footer, pivot cells and exports use (so `count` / `unique` are never put in the column's currency or unit format). Leaf rows keep the column's own getter and formatter.

---

## Column order

- **Uncontrolled:** the order is the columns' own order until the user reorders (`setInternalColumnOrder`); it is derived, not snapshotted at mount, so it stays right when the columns change or the grid mounts in pivot mode.
- **Controlled:** `columnOrder` wins, except in pivot mode.
- **Every move works on the full current order**, `orderedColumns.map(c => c.field)`: all current columns, including those added after mount, those missing from a stored or controlled order, and the synthetic `__group__` column. The header drag (`columnReorderHandlers`), `moveColumn` and `resetColumnOrder` all go through one commit step: it stores the new order (uncontrolled or pivot), fires `onColumnOrderChange` with indices in that full order (not for Reset), and fires `onColumnOrderModelChange` with the whole order (not in pivot mode). Before v3.0 the indices came from `orderedColumns` but were applied to `effectiveColumnOrder`, so a column added after the order was stored, or a partial controlled order, made a drag move the wrong column or nothing.
- **Pivot mode:** the generated pivot columns keep an order of their own, reset whenever the generated column set changes. Pivoting never rewrites the normal order, a controlled `columnOrder` (which names source columns) does not apply, and reordering updates the pivot order. `setInternalColumnOrder` writes to the order that is active.

## Visibility

`visibleOrderedColumns` drops columns hidden by `columnVisibilityModel`, except, in pivot mode, the pivot row-label columns (marked `hideable: false`): they share their field with the source column, which the visibility model may hide in normal mode, and the pivot rows are labelled by them.

---

## `navigationColumns` and `columnIndexMap`

`navigationColumns` is what Row and Header render, in render order: system column stubs, then the visible data columns sorted left-pinned, unpinned, right-pinned (the same order `useLayout` renders them in):

```
[{ field: '__reorder_col__', sortable: false, editable: false }]   (if rowReordering)
[{ field: '__expand_col__', sortable: false, editable: false }]    (if hasDetailPanel)
[{ field: '__checkbox_col__', sortable: false, editable: false }]  (if checkboxSelection)
...visibleOrderedColumns in pinned render order
```

Hidden columns are not in it, so arrow keys never land on a column that is not rendered (v3.0; it used to be built from `orderedColumns`, in unpinned order). Its length is the grid's `aria-colcount`.

`columnIndexMap` maps each visible data column's field to its position in that render order, system columns excluded. Row, Cell and Header use it for the public `colIndex` (`GridCellParams`, `renderCell`, `renderHeader`) and for `aria-colindex` (`colIndex + 1 +` the number of system columns), so both are absolute and do not depend on the horizontal render window.

`navigationColumns` is consumed by `useGridKeyboardNavigation` (to map arrow-key movements across all focusable columns). `useGridSpanning` does not use it: spans are computed over the rendered data columns only (the layout's left-pinned, unpinned and right-pinned columns), so system columns and hidden columns are never part of a span.

---

## Relationship to DataGrid

DataGrid calls this hook after computing `isHierarchyEnabled`, `activeHierarchyHandlers`, and hoisting `hasDetailPanel`. The hook's return values are destructured directly into the variables the JSX return and downstream hooks expect.

---

## 🔗 Related
- [useGridRowPipeline](use-grid-row-pipeline.md)
- [useGridVirtualization](use-grid-virtualization.md)
- [useGridVisibleRows](use-grid-visible-rows.md)
- [DataGrid](../components/datagrid.md)
