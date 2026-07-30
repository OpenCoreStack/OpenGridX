# `useGridStateSnapshot`

Internal hook. Fires the `onStateChange` callback whenever any tracked grid state changes — sorting, filtering, pagination, or column configuration. Packages the current state into a `GridState` snapshot and delivers it to the caller.

**File:** `lib/hooks/core/useGridStateSnapshot.ts`

---

## Purpose

Before extraction, ~28 lines of state-snapshot logic lived inline in `DataGrid.tsx` — a `useRef` to hold the latest `onStateChange` callback plus a `useEffect` that fired on state changes. Extracting them makes the snapshot contract explicit and independently testable.

---

## Parameters

```ts
interface UseGridStateSnapshotParams {
    onStateChange?: (state: GridState) => void;
    sortModel: GridSortItem[];
    filterModel: GridFilterModel;
    effectivePaginationModel: GridPaginationModel;
    columnWidths: Record<string, number>;
    effectiveColumnOrder: string[];
    columnVisibilityModel: Record<string, boolean>;
    pinnedColumns: GridColumnPinning;
}
```

---

## Returns

`void` — this is a side-effect-only hook.

---

## Snapshot shape

The hook assembles a `GridState` object on every tracked change:

```ts
{
    sorting: { sortModel },
    filter: { filterModel },
    pagination: { paginationModel: effectivePaginationModel },
    columns: {
        columnWidths,
        columnOrder: effectiveColumnOrder,
        columnVisibilityModel,
        pinnedColumns,
    },
}
```

This matches the `GridState` interface from `lib/state/types.ts` and is the same structure accepted by `initialState` / `GridInitialState` — so a caller can persist the snapshot and restore it directly.

---

## Ref-stabilized callback

`onStateChange` is stored in a ref (updated via `useLayoutEffect`) rather than being included directly in the snapshot effect's dependency array:

```ts
const onStateChangeRef = useRef(onStateChange);
useLayoutEffect(() => {
    onStateChangeRef.current = onStateChange;
});
```

**Why:** Without a ref, if the consumer passes an inline arrow function (`onStateChange={() => {...}}`), the snapshot effect would fire on every render (the function identity changes each time) rather than only when state actually changes. The ref decouples the callback identity from the effect deps.

`useLayoutEffect` (not `useEffect`) is used for the ref update so the ref is always current before the snapshot effect reads it, avoiding a one-render lag on the first fire.

---

## 🔗 Related
- [useGridScrollSync](use-grid-scroll-sync.md)
- [useGridControlledState](use-grid-controlled-state.md)
- [useGridColumns](use-grid-columns.md)
