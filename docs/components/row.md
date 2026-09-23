# `<Row />`

Manages a horizontal collection of cells. Includes support for selection, expansion (Detail Panels), row pinning, and reordering.

## ⚙️ Props

`Row` and its props type `RowProps` are exported. The main props (see `RowProps` for the rest, such as the drag, edit and spanning callbacks the grid wires):

| Prop | Type | Description |
| :--- | :--- | :--- |
| `row` | `GridRowModel` | The data object for this row. |
| `rowId` | `GridRowId` | The row's id (from the grid's `getRowId`). Defaults to `row.id`; the grid always passes it (v3.0+). |
| `columns` | `GridColDef[]` | Columns currently visible in the viewport. |
| `rowIndex` | `number` | Index used for virtualization and alternating colors. |
| `isSelected` | `boolean` | Checkbox / Selection state. |
| `checkboxSelection` | `boolean` | If `true`, renders the selection checkbox. |
| `hasDetailPanel` | `boolean` | Enables the detail panel toggle icon. |
| `isDetailPanelExpanded` | `boolean` | Current expansion state. |
| `rowReordering` | `boolean` | Enables the drag handle for reordering rows. |
| `rowHeight` | `number` | Height in pixels (default: 52). |
| `rowMeta` | `GridRowMeta` | Hierarchy metadata for the row (tree data / row grouping), passed to cells as `params.rowMeta`. |
| `onRowClick` / `onRowDoubleClick` | `(params: GridRowParams) => void` | Row click handlers. |
| `onCellClick` | `(params: GridCellParams) => void` | Cell click handler. |
| `onSelectionChange` | `(rowId: GridRowId, isSelected: boolean) => void` | Called by the row's checkbox. |
| `isCellEditable` | `(params: GridCellParams) => boolean` | Per-cell editability predicate, combined with `colDef.editable` and the row's `rowMeta` to decide each cell's `isEditable`. |
| `columnIndexMap` | `Map<string, number>` | Position of each visible data column in render order. Gives cells their `colIndex` / `aria-colindex` independently of the horizontal render window. |
| `ariaRowIndex` | `number` | 1-based `aria-rowindex` in the whole grid (header rows and earlier pages included). Defaults to `rowIndex + 2`. |

## ♿ Accessibility

- `aria-rowindex` (from `ariaRowIndex`), `aria-selected`; with tree data or row grouping, `aria-level` (depth + 1) and, on rows with children, `aria-expanded`.
- The reorder handle, detail-panel toggle and checkbox cells have `data-field` (`__reorder_col__`, `__expand_col__`, `__checkbox_col__`), `tabIndex={-1}` and `aria-colindex`, so they are keyboard focus stops like data cells.
- The detail panel is rendered as a `role="row"` with one `role="gridcell"` spanning every column, referenced by the expand cell's `aria-controls` while open.

## 📐 Row Pinning

Rows can be pinned to the **Top** or **Bottom** of the grid using the `pinnedRows` prop on the `<DataGrid />`. Pinned rows are rendered using the same `<Row />` component but are positioned sticky within their own containers.

## 🌈 Alternating Colors

The grid supports "Zebra" striping via CSS:
- `.ogx__row--even`: Even-indexed rows.
- `.ogx__row--odd`: Odd-indexed rows.

## 📋 Detail Panel

When `getDetailPanelContent` is provided, the `<Row />` renders an expandable container below itself to show supplemental data.

## ⚠️ v3.0 — Runtime `_*` hierarchy fields removed

Up to v2.x the grid copied tree-data and row-grouping rows and added hierarchy fields to the copies (`_hasChildren`, `_treeDepth`, `_isExpanded`, `_groupingField`, `_groupingValue`, `_descendantCount`, `_isGroupRow`). Since v3.0 nothing is added: `params.row` is your own row object, unchanged. Read the hierarchy from `params.rowMeta` instead:

```tsx
// ❌ v2.x — the field is undefined in v3.0:
renderCell: (params) => {
  const hasChildren = (params.row as Record<string, unknown>)._hasChildren;
  return hasChildren ? <GroupIcon /> : params.value;
}

// ✅ v1.1+ (the only way since v3.0):
renderCell: (params) => {
  const hasChildren = params.rowMeta?.hasChildren;
  return hasChildren ? <GroupIcon /> : params.value;
}
```

`params.rowMeta` is `undefined` for flat rows with no active tree-data or row-grouping.
See [`GridRowMeta` architecture doc](../architecture/grid-row-meta.md) for the full data flow and the [v2 → v3 migration guide](../migration/v2-to-v3.md).
