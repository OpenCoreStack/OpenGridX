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
  groupLabel?: string;
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

## Runtime shim (removed in v3.0)

From v1.1 to v2.x, `useTreeData` and `useRowGrouping` still copied each row and injected the underscore fields (`_hasChildren`, `_treeDepth`, `_isExpanded`, `_groupingField`, `_groupingValue`, `_descendantCount`, `_isGroupRow`) onto the copy for backward compatibility. (An earlier revision of this doc wrongly said the injection was removed in v2.0.)

**Since v3.0 nothing is injected.** Both hooks pass the consumer's row objects through unchanged and all hierarchy information lives in `rowMetaMap` / `params.rowMeta`. `params.row` under grouping is therefore the same object the consumer passed in `rows`, just as it is without grouping. See [Migrating from v2 to v3](../migration/v2-to-v3.md).

---

## Non-hierarchy rows

`params.rowMeta` is `undefined` when no tree-data or row-grouping is active, and for any row that is not part of the hierarchy (plain data rows rendered within a group). Always guard: `params.rowMeta?.hasChildren`.
