# `<Row />`

Manages a horizontal collection of cells. Includes support for selection, expansion (Detail Panels), row pinning, and reordering.

## ⚙️ Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `row` | `GridRowModel` | The data object for this row. |
| `columns` | `GridColDef[]` | Columns currently visible in the viewport. |
| `rowIndex` | `number` | Index used for virtualization and alternating colors. |
| `isSelected` | `boolean` | Checkbox / Selection state. |
| `checkboxSelection` | `boolean` | If `true`, renders the selection checkbox. |
| `hasDetailPanel` | `boolean` | Enables the detail panel toggle icon. |
| `isDetailPanelExpanded` | `boolean` | Current expansion state. |
| `rowReordering` | `boolean` | Enables the drag handle for reordering rows. |
| `rowHeight` | `number` | Height in pixels (default: 52). |

## 📐 Row Pinning

Rows can be pinned to the **Top** or **Bottom** of the grid using the `pinnedRows` prop on the `<DataGrid />`. Pinned rows are rendered using the same `<Row />` component but are positioned sticky within their own containers.

## 🌈 Alternating Colors

The grid supports "Zebra" striping via CSS:
- `.ogx__row--even`: Even-indexed rows.
- `.ogx__row--odd`: Odd-indexed rows.

## 📋 Detail Panel

When `getDetailPanelContent` is provided, the `<Row />` renders an expandable container below itself to show supplemental data.

## ⚠️ v1.1 — Hierarchy Field Deprecation

The internal hierarchy fields (`_hasChildren`, `_treeDepth`, `_isExpanded`, `_groupingField`, `_groupingValue`, `_descendantCount`, `_isGroupRow`) are no longer typed on `GridRowModel`. They will be removed from the runtime row object in v2.0.

**Before (still works at runtime in v1.1 — `params.row._hasChildren` is `unknown`, not `boolean`; assignment to typed variables and arithmetic will error, truthiness checks will not):**

```tsx
renderCell: (params) => {
  // v1.1 accepts this at runtime; _hasChildren resolves to unknown via [key: string]: unknown
  const hasChildren = (params.row as Record<string, unknown>)._hasChildren;
  return hasChildren ? <GroupIcon /> : params.value;
}
```

**After (v1.1+):**

```tsx
renderCell: (params) => {
  const hasChildren = params.rowMeta?.hasChildren;
  return hasChildren ? <GroupIcon /> : params.value;
}
```

`params.rowMeta` is `undefined` for flat rows with no active tree-data or row-grouping.
See [`GridRowMeta` architecture doc](../architecture/grid-row-meta.md) for the full data flow.
