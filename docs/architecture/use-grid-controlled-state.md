# `useGridControlledState`

Internal hook. Centralises the controlled/uncontrolled state pattern for every piece of DataGrid state that can be driven externally via props.

**File:** `lib/hooks/core/useGridControlledState.ts`

---

## Purpose

Eight DataGrid state pairs follow the same pattern:

```
[internal, setInternal] = useState(defaultValue)
isControlled = prop !== undefined
effective = isControlled ? prop : internal
```

Before this hook existed, those 85 lines lived inline in `DataGrid.tsx`. `useGridControlledState` extracts them into a single location so the controlled/uncontrolled contract is tested and reasoned about in one place.

---

## Managed state pairs

| State | Prop (controlled) | Change callback |
| :--- | :--- | :--- |
| Sort | `sortModel` | `onSortModelChange` |
| Filter | `filterModel` | `onFilterModelChange` |
| Aggregation | `aggregationModel` | `onAggregationModelChange` |
| Column visibility | `columnVisibilityModel` | `onColumnVisibilityModelChange` |
| Pinned columns | `pinnedColumns` | `onPinnedColumnsChange` |
| Pivot | `pivotModel` | `onPivotModelChange` |
| Pagination | `paginationModel` | `onPaginationModelChange` |
| Row selection | `rowSelectionModel` | `onRowSelectionModelChange` |

It also resolves `density` (the `density` prop, else `initialState.density`, else `'standard'`).

This hook is the single source of truth for these models. The `useDataGrid` reducer holds only
the row store, dimensions and dataSource status (it used to keep its own sort, filter, pagination
and selection copies, which drifted from what the grid rendered and made `apiRef` setters no-ops).
Everything that reads or changes these models — the header, toolbar, pager, row checkboxes and
the imperative API (`useGridApiMethods`) — goes through the values and `handle*Change` callbacks
returned here.

---

## Parameters

```ts
interface UseGridControlledStateParams {
    initialState?: GridInitialState;

    sortModel?: GridSortItem[];
    onSortModelChange?: (model: GridSortItem[]) => void;

    filterModel?: GridFilterModel;
    onFilterModelChange?: (model: GridFilterModel) => void;

    aggregationModel?: GridAggregationModel;
    onAggregationModelChange?: (model: GridAggregationModel) => void;

    columnVisibilityModel?: Record<string, boolean>;
    onColumnVisibilityModelChange?: (model: Record<string, boolean>) => void;

    pinnedColumns?: GridColumnPinning;
    onPinnedColumnsChange?: (model: GridColumnPinning) => void;

    pivotModel?: GridPivotModel;
    onPivotModelChange?: (model: GridPivotModel) => void;

    paginationModel?: GridPaginationModel;
    onPaginationModelChange?: (model: GridPaginationModel) => void;
    pageSizeOptions?: number[];   // picks the uncontrolled default page size

    rowSelectionModel?: GridRowId[];
    onRowSelectionModelChange?: (model: GridRowId[]) => void;

    density?: 'compact' | 'standard' | 'comfortable';
}
```

---

## Returns

```ts
interface UseGridControlledStateReturn {
    // Sort
    sortModel: GridSortItem[];
    isSortControlled: boolean;
    setInternalSortModel: React.Dispatch<React.SetStateAction<GridSortItem[]>>;
    handleSortModelChange: (model: GridSortItem[]) => void;

    // Filter (seeded from initialState.filter.filterModel)
    filterModel: GridFilterModel;
    isFilterControlled: boolean;
    handleFilterModelChange: (model: GridFilterModel) => void;

    // Aggregation
    aggregationModel: GridAggregationModel;
    handleAggregationModelChange: (model: GridAggregationModel) => void;

    // Column visibility
    columnVisibilityModel: Record<string, boolean>;
    handleColumnVisibilityModelChange: (model: Record<string, boolean>) => void;

    // Pinned columns
    pinnedColumns: GridColumnPinning;
    handlePinnedColumnsChange: (model: GridColumnPinning) => void;

    // Pivot
    currentPivotModel: GridPivotModel;
    handlePivotModelChange: (model: GridPivotModel) => void;

    // Pagination
    effectivePaginationModel: GridPaginationModel;
    handlePaginationModelChange: (model: GridPaginationModel) => void;

    // Row selection
    rowSelectionModel: GridRowId[];
    selectedRowIds: Set<GridRowId>;         // derived Set for O(1) lookup
    isSelectionControlled: boolean;
    setInternalRowSelectionModel: React.Dispatch<React.SetStateAction<GridRowId[]>>;
    handleRowSelectionModelChange: (model: GridRowId[]) => void;

    // Density
    density: 'compact' | 'standard' | 'comfortable';
}
```

---

## Key behaviours

**Controlled mode:** When a prop is provided (`prop !== undefined`), the effective value is always `prop`. The internal state is not updated — the caller is responsible for updating the prop via the change callback.

**Uncontrolled mode:** When a prop is `undefined`, the effective value is the internal state. The `handle*Change` callback updates internal state and also fires the external callback (if provided) for observability.

**Selection:** `handleRowSelectionModelChange` applies a new model like the other handlers. The row-click, checkbox, Space-key and select-all rules (including `disableMultipleRowSelection`) live in `useGridRowSelection`, which calls it. `getPendingRowSelectionModel()` (stable identity) returns the model most recently passed to `handleRowSelectionModelChange` that has not rendered yet, or `null`; it is cleared on every commit (a controlled parent may reject a change). `useGridApiMethods` prefers it over the rendered (pruned) selection, so `apiRef.getSelectedRows()` and `copySelectedRows()` are current inside `onRowSelectionModelChange` and right after `apiRef.selectRows`.

**Default page size:** without `paginationModel` or `initialState.pagination`, the page size is 100 when `pageSizeOptions` offers it, otherwise the first option, so the page-size select always shows the size in use.

**`aggregationModel` identity follows content:** an inline `aggregationModel={{ salary: 'sum' }}` is a new object on every parent render. The returned `aggregationModel` keeps its identity while its content is unchanged (it is keyed on its JSON), so the server fetches and memos that depend on it do not rerun for an unchanged model.

**`selectedRowIds` (Set):** The array `rowSelectionModel` is converted to a `Set` via `useMemo` for O(1) membership checks during row rendering. Both are returned so callers can choose the right structure.

---

## Relationship to DataGrid

`DataGrid.tsx` calls this hook at the top of its body and destructures the returned values directly into the variables used by the rest of the component. The hook replaces the controlled/uncontrolled block that previously occupied lines ~200–285 of `DataGrid.tsx`.

---

## 🔗 Related
- [useGridRowPipeline](use-grid-row-pipeline.md)
- [DataGrid](../components/datagrid.md)
