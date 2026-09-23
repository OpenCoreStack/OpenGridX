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

## Runtime shim (still present as of v2.1.0)

The underscore fields (`_hasChildren`, `_treeDepth`, `_isExpanded`, `_groupingField`, `_groupingValue`, `_descendantCount`, `_isGroupRow`) continue to be injected onto the row object at runtime — this has not changed since v1.1. They are not declared on `GridRowModel`; because `GridRowModel` retains `[key: string]: unknown`, accessing `params.row._hasChildren` resolves to `unknown` rather than producing a TypeScript compile error. Assignment to a typed variable (e.g. `const x: boolean = params.row._hasChildren`) and arithmetic will error; truthiness checks will not. Migrate to `params.rowMeta?.hasChildren` for the typed path — new code should not rely on the underscore fields at all.

**This shim is deprecated and scheduled for removal in a future major version, not v2.0.** An earlier revision of this doc (and of `roadmap.md`) stated the injection was removed in v2.0 — that was inaccurate; `useTreeData.ts` and `useRowGrouping.ts` both still assign these fields on every row. Treat `params.rowMeta` as the only supported API going forward, but do not assume the underscore fields are absent at runtime yet.

---

## Non-hierarchy rows

`params.rowMeta` is `undefined` when no tree-data or row-grouping is active, and for any row that is not part of the hierarchy (plain data rows rendered within a group). Always guard: `params.rowMeta?.hasChildren`.
