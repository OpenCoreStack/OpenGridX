# `<FilterPanel />`

A persistent UI component for managing complex multi-column filter rules.

## ⚙️ Key Concepts

The Filter Panel allows users to define a list of `GridFilterItem` objects. Each item consists of:
- **Field**: Which column to filter.
- **Operator**: How to compare (e.g., `contains`, `equals`, `>`, `is empty`).
- **Value**: The target value for comparison.

### Hierarchy-aware custom cells

When a column has a custom `renderCell` and the grid is in tree-data or row-grouping mode, use `params.rowMeta` to access hierarchy context:

```tsx
renderCell: (params) => {
  if (params.rowMeta?.hasChildren) {
    return <strong>{params.value}</strong>;
  }
  return params.value;
}
```

## 🔌 Integration

The `<DataGrid />` manages the visibility of the Filter Panel via its internal state. It is usually triggered from the Column Menu or the Toolbar.

## 📝 Configuration

The panel shows one row per column with `filterable !== false` (the synthetic row-grouping column is not filterable). Operators and the value control depend on the column's `type`:

| `type` | Operators (first = default) | Value control |
| :--- | :--- | :--- |
| `string` (default) | `contains`, `equals`, `startsWith`, `endsWith`, `isEmpty`, `isNotEmpty` | Text input |
| `number` | `=`, `!=`, `>`, `>=`, `<`, `<=`, `isEmpty`, `isNotEmpty` | Text input |
| `date` | `is`, `not`, `after`, `onOrAfter`, `before`, `onOrBefore`, `isEmpty`, `isNotEmpty` | Date input (`YYYY-MM-DD`) |
| `boolean` | `is` | Select: **Any** (no filter), `true`, `false` |
| `singleSelect` | `isAnyOf`, `is`, `not` | Built from `valueOptions`: a multi-select for `isAnyOf` (the value is an array of option values), a select with **Any** for `is` / `not`. Option values keep their type, labels are shown. Without `valueOptions`, a text input (comma-separated for `isAnyOf`). |

`isEmpty` / `isNotEmpty` hide the value control. An item whose operator the column type does not list (set programmatically) is shown with that operator.

## 🔄 How edits reach the model

- Typing is debounced by 300 ms before `onFilterModelChange` fires. Opening the panel never emits anything and never rewrites existing values (arrays, numbers and dates stay as they are).
- Changing the operator right after typing keeps the typed text.
- Each row edits the **first** root-level item for its column and replaces it in place. Filter groups (`GridFilterGroup`) and further items for the same column are passed through untouched; the panel notes how many such conditions it does not show.
- Picking an operator without typing, or clearing the input, leaves an item with an empty value, which does not filter. The row's **×** button removes the item.
- If the model is changed from outside the panel (the toolbar's **Clear all**, or your own code) while typing is still pending, the pending text is dropped instead of being re-applied.

## 🎨 Slot Usage

While the Filter Panel is a complex internal component, its appearance can be influenced by CSS variables or by providing a custom implementation to the `filterPanel` slot in advanced use cases.
