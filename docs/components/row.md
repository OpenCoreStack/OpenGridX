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
