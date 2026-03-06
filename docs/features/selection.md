# ✅ Row Selection

OpenGridX provides various ways for users to select one or multiple rows.

---

## 🔘 Selection Modes

| Mode | Description |
| :--- | :--- |
| **Checkbox Selection** | Adds a column with checkboxes for bulk selection. |
| **Row Click Selection** | Select a row by clicking anywhere on the row body. |
| **Single Selection** | Limit the user to picking only one row at a time. |

---

## 🛠️ Implementation

### Enable Checkbox Selection
```tsx
<DataGrid
  checkboxSelection
  pinCheckboxColumn // Optional: keeps checkbox on the left during horizontal scroll
/>
```

### Controlled Selection
Use the `rowSelectionModel` to control the selection state from your parent component.

```tsx
const [selection, setSelection] = useState<GridRowId[]>([]);

<DataGrid
  rowSelectionModel={selection}
  onRowSelectionModelChange={(newSelection) => setSelection(newSelection)}
/>
```

---

## ⚙️ API Reference

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `checkboxSelection` | `boolean` | `false` | Enable the checkbox column. |
| `disableRowSelectionOnClick` | `boolean` | `false` | If true, clicking a cell won't select the row. |
| `disableMultipleRowSelection` | `boolean` | `false` | Restricts selection to a single row. |
| `rowSelectionModel` | `GridRowId[]` | `[]` | Controlled array of selected IDs. |
| `isRowSelectable` | `(params) => boolean` | `undefined` | Predicate to disable selection for specific rows. |

---

## 🖱️ Interaction Callbacks

### `onRowClick`
Fired when a row is clicked (even if selection is disabled on click).
```typescript
onRowClick: (params: GridRowParams) => {
  console.log('Row clicked:', params.id, params.row);
}
```

### `onCellClick`
Fired when a specific cell is clicked.
```typescript
onCellClick: (params: GridCellParams) => {
  console.log('Cell clicked:', params.field, params.value);
}
```
