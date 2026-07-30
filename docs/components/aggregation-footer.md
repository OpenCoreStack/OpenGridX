# `<GridAggregationFooter />`

Internal component that renders the sticky aggregation totals row pinned to the bottom of the grid. Displays function name labels (e.g. `sum`, `avg`) alongside their computed values for each configured column.

## ⚙️ Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `columns` | `GridColDef[]` | Ordered list of visible column definitions used to lay out cells. |
| `aggregationModel` | `GridAggregationModel` | Maps field names to function names (`'sum' \| 'avg' \| 'count' \| 'min' \| 'max'`). |
| `aggregationResult` | `GridAggregationResult` | Computed values keyed by field name, produced by `useAggregation`. |
| `columnWidths` | `Record<string, number>` | Runtime pixel widths for each field, kept in sync with user resize actions. |
| `rowHeight` | `number` | Sets `min-height` on the footer row, matching the grid's configured row height. |
| `checkboxSelection` | `boolean` | When `true`, inserts a 48px spacer at the start to align with the checkbox column. |
| `hasDetailPanel` | `boolean` | When `true`, inserts a 48px spacer to align with the expand/collapse column. |
| `rowReordering` | `boolean` | When `true`, inserts a 48px spacer to align with the drag handle column. |

## 🔄 When it renders

`GridAggregationFooter` renders when `aggregationModel` has at least one entry and `aggregationResult` contains the corresponding computed values. The footer is sticky — it remains visible when the user scrolls vertically.

## 🔢 Value formatting

Values are formatted by `formatAggregationValue` from `useAggregation`:
- `count` → integer (e.g. `42`)
- `sum` / `avg` / `min` / `max` → `toLocaleString()` with up to 2 decimal places

## 🎨 Usage via DataGrid prop

```tsx
<DataGrid
    aggregationModel={{
        salary: 'sum',
        age: 'avg',
        department: 'count'
    }}
/>
```

The footer renders automatically. No additional configuration required.

## ♿ Accessibility

The footer row uses `role="row"` and `aria-label="Aggregation totals"`. Each cell uses `role="gridcell"`. The container uses `aria-live="polite"` so screen readers announce value updates when the data changes.

## 🔗 Related
- [DataGrid](datagrid.md)
- [Aggregation & Pivot](../features/aggregation-pivot.md)
