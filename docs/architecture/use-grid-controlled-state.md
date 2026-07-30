# `useGridControlledState`

Internal hook. Centralises the controlled/uncontrolled state pattern for every piece of DataGrid state that can be driven externally via props.

**File:** `lib/hooks/core/useGridControlledState.ts`

---

## Purpose

Seven DataGrid state pairs follow the same pattern:

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
| Aggregation | `aggregationModel` | `onAggregationModelChange` |
| Column visibility | `columnVisibilityModel` | `onColumnVisibilityModelChange` |
| Pinned columns | `pinnedColumns` | `onPinnedColumnsChange` |
| Pivot | `pivotModel` | `onPivotModelChange` |
| Pagination | `paginationModel` | `onPaginationModelChange` |
| Row selection | `rowSelectionModel` | `onRowSelectionModelChange` |

---

## Parameters

```ts
interface UseGridControlledStateParams {
    initialState?: GridInitialState;

    sortModel?: GridSortItem[];
    onSortModelChange?: (model: GridSortItem[]) => void;

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

    rowSelectionModel?: GridRowId[];
    onRowSelectionModelChange?: (model: GridRowId[]) => void;
}
```

---

## Returns

```ts
interface UseGridControlledStateReturn {
    // Sort — caller uses onSortModelChange directly; setInternalSortModel exposed for reducer dispatches
    sortModel: GridSortItem[];
    isSortControlled: boolean;
    setInternalSortModel: React.Dispatch<React.SetStateAction<GridSortItem[]>>;

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
}
```

---

## Key behaviours

**Controlled mode:** When a prop is provided (`prop !== undefined`), the effective value is always `prop`. The internal state is not updated — the caller is responsible for updating the prop via the change callback.

**Uncontrolled mode:** When a prop is `undefined`, the effective value is the internal state. The `handle*Change` callback updates internal state and also fires the external callback (if provided) for observability.

**`onRowSelectionModelChange` exception:** This callback is consumed by DataGrid directly (e.g. inside `handleSelectAll`) rather than through the hook. The hook silences it with `void onRowSelectionModelChange` to avoid an unused-variable lint error, and exposes `setInternalRowSelectionModel` for DataGrid to update internal state after calling the callback itself.

**`selectedRowIds` (Set):** The array `rowSelectionModel` is converted to a `Set` via `useMemo` for O(1) membership checks during row rendering. Both are returned so callers can choose the right structure.

---

## Relationship to DataGrid

`DataGrid.tsx` calls this hook at the top of its body and destructures the returned values directly into the variables used by the rest of the component. The hook replaces the controlled/uncontrolled block that previously occupied lines ~200–285 of `DataGrid.tsx`.

---

## 🔗 Related
- [useGridRowPipeline](use-grid-row-pipeline.md)
- [DataGrid](../components/datagrid.md)
