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

Inside the grid, the Filter Panel opens from the toolbar's **Filters** button (`slots={{ toolbar: GridToolbar }}`). `FilterPanel` and `FilterPanelProps` are also exported, to host the editor yourself:

| Prop | Type | Description |
| :--- | :--- | :--- |
| `filterModel` | `GridFilterModel` | The model to edit. |
| `columns` | `GridColDef[]` | The columns offered (those with `filterable: false` are left out). |
| `onFilterModelChange` | `(model: GridFilterModel) => void` | Called with the edited model. |

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

## 🎨 Customizing

There is no slot for the Filter Panel. Restyle it with CSS (its classes start with `ogx-filter`) and the theme's overlay colours, replace only the toolbar's trigger with `renderFilterButton`, or render your own editor that writes a `GridFilterModel` to the grid's `filterModel` prop.
