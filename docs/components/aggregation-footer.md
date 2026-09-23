# `<GridAggregationFooter />`

Internal component that renders the sticky aggregation totals row pinned to the bottom of the grid. Displays function name labels (e.g. `sum`, `avg`) alongside their computed values for each configured column.

## ⚙️ Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `columns` | `GridColDef[]` | The columns exactly as the rows lay them out (`virtualization.virtualColumns`): visible columns only, left-pinned first and right-pinned last, with the horizontal-virtualization spacer entries. |
| `aggregationModel` | `GridAggregationModel` | Maps field names to function names (`'sum' \| 'avg' \| 'count' \| 'min' \| 'max' \| 'unique'`). |
| `aggregationResult` | `GridAggregationResult` | Computed values keyed by field name, produced by `useAggregation`. |
| `columnWidths` | `Record<string, number>` | User resize overrides, as passed to the rows; otherwise each column's layout width is used. |
| `rowHeight` | `number` | Sets `min-height` on the footer row, matching the grid's configured row height. |
| `checkboxSelection` | `boolean` | When `true`, inserts a 48px spacer aligned with the checkbox column. |
| `hasDetailPanel` | `boolean` | When `true`, inserts a 48px spacer aligned with the expand/collapse column. |
| `rowReordering` | `boolean` | When `true`, inserts a 48px spacer aligned with the drag handle column (always sticky, like the row's handle). |
| `pinCheckboxColumn` | `boolean` | Default `true`. Whether the checkbox spacer sticks to the left, matching the row's checkbox column; also used for the pinned-column offsets. |
| `pinExpandColumn` | `boolean` | Default `true`. The same for the expand/collapse spacer. |
| `pinnedColumns` | `GridColumnPinning` | Pinned columns get sticky totals at the same offsets as the pinned body cells. |
| `loading` | `boolean` | A server aggregation request is pending: sets `aria-busy="true"` and the class `ogx__aggregation-footer--loading`. |

## 🔄 When it renders

`GridAggregationFooter` renders when `aggregationModel` has at least one entry, except in pivot mode (the pivot's Grand Total row is the aggregate there). The footer is sticky — it remains visible when the user scrolls vertically. A column without an entry in `aggregationModel` gets an empty cell, so every total sits under its header.

## 🔢 Value formatting

Values are formatted by `formatAggregateForColumn` (`lib/utils/aggregation`), the same formatting used by group rows, pivot cells and exports:
- `sum` / `avg` / `min` / `max` go through the column's `valueFormatter`, with the footer totals (`aggregationResult`) as its `row`. If the formatter throws, the default format is used.
- `count` / `unique` are plain counts (the column's `valueFormatter` is not applied).
- Without a formatter: `toLocaleString()` (`avg` to at most 2 decimal places); dates as locale dates; a missing value shows `—`.

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

The footer row uses `role="row"` and `aria-label="Aggregation totals"`. Each cell uses `role="gridcell"`. The container uses `aria-live="polite"` so screen readers announce value updates when the data changes, and `aria-busy="true"` while server totals are loading. The system-column spacers are `aria-hidden`.

## 🔗 Related
- [DataGrid](datagrid.md)
- [Aggregation & Pivot](../features/aggregation-pivot.md)
