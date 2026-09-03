# `GridRowMeta`

Hierarchy metadata for a grid row, available via `params.rowMeta` in `renderCell` since v1.1.

**File:** `lib/types/index.ts`

---

## Why it exists

Before v1.1, `useTreeData` and `useRowGrouping` injected internal fields (`_hasChildren`, `_treeDepth`, etc.) directly onto each row object and declared them on `GridRowModel`. This caused two problems:

1. **Collision risk** — a user dataset with a field called `_hasChildren` would be silently corrupted.
2. **API leakage** — implementation details appeared as typed public API, inviting users to depend on them.

`GridRowMeta` moves these fields to a separate `Map<GridRowId, GridRowMeta>` that never touches the user's data.

---

## Interface

```ts
export interface GridRowMeta {
  hasChildren?: boolean;
  treeDepth?: number;
  groupingField?: string;
  groupingValue?: unknown;
  descendantCount?: number;
  isExpanded?: boolean;
  isGroupRow?: boolean;
}
```

---

## Data flow

```
useTreeData / useRowGrouping
  └─ returns rowMetaMap: Map<GridRowId, GridRowMeta>

DataGrid.tsx
  └─ selects the active map (tree data XOR row grouping XOR empty)
  └─ passes rowMetaMap to:
       ├─ useGridColumns (reads meta for hierarchy cell renderers)
       └─ GridVirtualRows / GridPinnedRows
            └─ Row (resolves meta per row: rowMetaMap.get(row.id))
                 └─ Cell (passes rowMeta into GridRenderCellParams)
```

---

## Accessing metadata in `renderCell`

```tsx
renderCell: (params) => {
  // params.rowMeta is undefined for flat rows
  if (params.rowMeta?.hasChildren) {
    return <strong>{params.value} ({params.rowMeta.descendantCount})</strong>;
  }
  return params.value;
}
```

---

## Runtime shim (v1.1 only)

The underscore fields (`_hasChildren`, `_treeDepth`, etc.) continue to be injected onto the row object at runtime in v1.1. They are no longer declared on `GridRowModel`, so TypeScript strict-mode users get a compile error when accessing them. JS users or users who cast with `as any` see no change.

**The runtime injection will be removed in v2.0.** Migrate to `params.rowMeta` before upgrading to v2.

---

## Non-hierarchy rows

`params.rowMeta` is `undefined` when no tree-data or row-grouping is active, and for any row that is not part of the hierarchy (plain data rows rendered within a group). Always guard: `params.rowMeta?.hasChildren`.
