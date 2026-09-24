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
  isGroupFooter?: boolean; // v3.0
}
```

| Field | Meaning |
| :--- | :--- |
| `hasChildren` | The row has children to show under the active filter, so the expand toggle is rendered. A lazy tree node whose children are not loaded yet (`serverChildrenCount > 0`) counts as having children. |
| `descendantCount` | Data rows below the row, at any depth, that pass the filter: row-grouping leaves, or tree-data rows (auto-created tree parents are not counted). `undefined` for a lazy node whose children are not loaded. It is the `(n)` next to group labels. |
| `groupLabel` | The label shown for a synthetic row: the group label (`groupingValueFormatter` or `"field: value"`), or the path segment of an auto-created tree parent. |
| `isGroupRow` | The row is synthetic: a row-grouping group row, a group subtotal row, or a tree-data parent created for a path segment that has no row of its own (its row object is just `{ id }`). Synthetic rows are never selected, edited or given a detail panel, clicking one toggles it, and `valueGetter` is not called for them. Tree-data parents that are your own rows have `isGroupRow: false`. |
| `isGroupFooter` | The row is the subtotal row of a group, shown after its children when `getAggregationPosition` returns `'footer'`. |

---

## Data flow

```
useTreeData / useRowGrouping
  └─ returns rowMetaMap: Map<GridRowId, GridRowMeta>

DataGrid.tsx
  └─ selects the active map (tree data XOR row grouping XOR empty)
  └─ uses rowMetaMap in:
       ├─ handleRowClick / selection / editing (skip or toggle synthetic rows)
       └─ GridVirtualRows / GridPinnedRows / GridListView
            (resolve meta per row: rowMetaMap.get(id), id = getRowId(row))
            └─ Row (rowMeta prop)
                 └─ Cell (passes rowMeta into GridRenderCellParams)
                      └─ renderCell, including the hierarchy renderers useGridColumns injects (read params.rowMeta)
```

---

## Accessing metadata in `renderCell`

```tsx
renderCell: (params) => {
  // params.rowMeta is undefined for flat rows
  if (params.rowMeta?.hasChildren) {
    return <strong>{params.formattedValue} ({params.rowMeta.descendantCount})</strong>;
  }
  return params.formattedValue;
}
```

Since v3.0 `renderCell` is called for every row, including synthetic group, subtotal and auto-created tree-parent rows, in every column, and its output is shown. In the column that holds the expand toggle, the output replaces the default group label next to the toggle. **Returning `undefined` for a synthetic row keeps the grid's default content** (the group label and count in the toggle column, the aggregate or nothing elsewhere), so a renderCell written for data rows can opt out in one line:

```tsx
renderCell: (params) => (params.rowMeta?.isGroupRow ? undefined : <Avatar user={params.row.user} />)
```

A renderCell that throws on a synthetic row shows the `⚠` cell indicator; in the toggle column the toggle stays usable.

---

## Runtime shim (removed in v3.0)

From v1.1 to v2.x, `useTreeData` and `useRowGrouping` still copied each row and injected the underscore fields (`_hasChildren`, `_treeDepth`, `_isExpanded`, `_groupingField`, `_groupingValue`, `_descendantCount`, `_isGroupRow`) onto the copy for backward compatibility. (An earlier revision of this doc wrongly said the injection was removed in v2.0.)

**Since v3.0 nothing is injected.** Both hooks pass the consumer's row objects through unchanged and all hierarchy information lives in `rowMetaMap` / `params.rowMeta`. `params.row` under grouping is therefore the same object the consumer passed in `rows`, just as it is without grouping. See [Migrating from v2 to v3](../migration/v2-to-v3.md).

---

## Non-hierarchy rows

`params.rowMeta` is `undefined` when no tree-data or row-grouping is active. While a hierarchy is active, **every** row rendered in it has an entry, data rows included:

- Row grouping: a leaf (data) row has `{ hasChildren: false, treeDepth, isGroupRow: false }`; group rows add `groupingField`, `groupingValue`, `groupLabel`, `descendantCount` and `isExpanded`; subtotal rows are like their group row with `isGroupFooter: true`, `hasChildren: false` and `treeDepth + 1`.
- Tree data: every node has `hasChildren`, `treeDepth`, `descendantCount`, `isGroupRow` and `isExpanded`; auto-created parents also have `groupLabel`.

Still guard with optional chaining (`params.rowMeta?.hasChildren`) so the same `renderCell` works with and without a hierarchy.
