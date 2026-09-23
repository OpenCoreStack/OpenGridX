# 📌 Pinning (Rows & Columns)

Keep critical data visible while scrolling through large tables.

---

## ⬅️ Column Pinning

Columns can be pinned to the left or right edges of the grid. Pinned columns remain sticky while the rest of the columns scroll horizontally.

### Implementation
```tsx
<DataGrid
  pinnedColumns={{
    left: ['name', 'department'],
    right: ['actions']
  }}
/>
```

### Order and widths
- Pinned columns render in the order of `pinnedColumns.left` / `pinnedColumns.right`, not in column order. Pinning from the column menu appends the column to the end of its side, so it lands next to the scrolling columns.
- A pinned column is sized exactly as it would be unpinned: numbers, percentages, `flex` and `'auto'` all apply, clamped to `minWidth` / `maxWidth`. The sticky offsets use those widths, so pinned columns never overlap.

### Column Configuration
Individual columns can be marked as non-pinnable:
```typescript
{ field: 'id', pinnable: false }
```

---

## ⬆️ Row Pinning

Rows can be pinned to the top or bottom of the grid. Pinned rows remain visible while the user scrolls vertically through the grid body.

### Implementation
```tsx
<DataGrid
  pinnedRows={{
    top: ['row-1', 'row-5'], // Array of Row IDs
    bottom: ['row-summary']
  }}
/>
```

### Behaviour
- Pinned rows are split out after filtering: a pinned row that does not match the active filter or quick filter is hidden. They are never sorted; they keep the order of `pinnedRows.top` / `.bottom`.
- `pinnedRows` is **ignored while `treeData` or `rowGroupingModel` is active**: the rows stay in their place in the hierarchy, and a development warning is logged.
- Top-pinned rows stick directly below the whole header, including column group header rows. Bottom-pinned rows stick directly above the aggregation footer; both stay visible.

### Use Cases
- **Header Summary**: Keep a summary row at the top (for grid-wide totals that follow the filter, prefer `aggregationModel`, whose footer never scrolls away).
- **Comparison**: Pin a specific row to compare it against other data.
- **Actions footer**: Pin a specialized row for bulk actions at the bottom.

---

## ⚙️ API Reference

### Props
| Prop | Type | Description |
| :--- | :--- | :--- |
| `pinnedColumns` | `GridColumnPinning` | `{ left: string[], right: string[] }` |
| `pinnedRows` | `GridRowPinning` | `{ top: GridRowId[], bottom: GridRowId[] }` |
| `onPinnedColumnsChange` | `(model) => void` | Callback triggered when pinning changes. |

---

## 🎨 Styling Pinning
The last left-pinned cell and the first right-pinned cell of each row carry section-edge classes (the body cells draw an edge shadow):
- body cells: `.ogx__cell--pinned-left-last`, `.ogx__cell--pinned-right-first`
- header cells: `.ogx__header-cell--pinned-left-last`, `.ogx__header-cell--pinned-right-first`
- aggregation footer: `.ogx__aggregation-cell--pinned-left-last`, `.ogx__aggregation-cell--pinned-right-first`

The edge is the last / first pinned column that is actually shown, so hiding a pinned column moves it. All pinned cells also carry `.ogx__cell--pinned-left` / `--pinned-right` (`.ogx__header-cell--pinned-left` / `--pinned-right`).

These can be customized via your theme or global CSS.
