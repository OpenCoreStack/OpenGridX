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

### Use Cases
- **Header Summary**: Keep a "Totals" or "Averages" row at the top.
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
| `onPinnedRowsChange` | `(model) => void` | Callback triggered when row pinning changes. |

---

## 🎨 Styling Pinning
Pinned elements have specific CSS shadow classes applied to indicate depth:
- `.ogx-column--pinned-left--last`
- `.ogx-column--pinned-right--first`

These can be customized via your theme or global CSS.
