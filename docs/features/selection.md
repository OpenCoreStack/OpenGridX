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

### Disable Click-to-Select

Use `disableRowSelectionOnClick` to prevent clicking a row from changing the selection (useful when rows have their own click actions like navigation). Selection via checkboxes still works.

```tsx
<DataGrid
  checkboxSelection
  disableRowSelectionOnClick
/>
```

### Single-Row Selection Only

Use `disableMultipleRowSelection` to cap selection to one row at a time. Clicking a second row deselects the first; clicking an already-selected row deselects it. The cap applies to row clicks, row checkboxes, the Space key and `apiRef.selectRow` / `selectRows` alike, and the header select-all checkbox is not shown.

```tsx
<DataGrid
  disableMultipleRowSelection
  onRowSelectionModelChange={(model) => console.log('selected:', model)}
/>
```

### Select All

With `checkboxSelection`, the header checkbox selects the rows that pass the current filter (including pinned rows) and adds them to the selection; unchecking it removes those rows again. Rows hidden by the filter keep their selection state, and under row grouping group rows are not part of select-all. The header shows checked when every such row is selected and indeterminate when only some are, so ids of rows that are no longer in `rows` do not affect it.

### Removed Rows

When rows leave `rows`, their ids leave the selection (v3.0+): `apiRef.current.getSelectedRows()`, the header checkbox and the next model a click produces no longer contain them, and the pruned model is reported once through `onRowSelectionModelChange`. An uncontrolled selection forgets the ids, so a row that comes back is not selected again; a controlled model should adopt the reported value. This applies when the grid holds every row: without a `dataSource`, with client pagination and filtering, and outside pivot mode. With `paginationMode="server"`, `filterMode="server"` or a `dataSource`, ids of rows that are not loaded are kept, so a selection survives paging.

In pivot mode the pivot rows have their own ids (`'__pivot_row__:["North"]'`, derived from the row-field values), so a selection made on the source rows never marks a pivot row, and leaving pivot mode gives the source selection back.

### Keyboard Selection

With focus in the grid (see [Keyboard & Accessibility](keyboard-navigation.md)):

| Key | Action |
| :--- | :--- |
| **Shift+Space** | Select or deselect the focused row. Available when rows can be selected at all (`checkboxSelection`, or click selection not disabled with `disableRowSelectionOnClick`). |
| **Space** / **Enter** on a row checkbox | Toggle that row. |
| **Space** / **Enter** on the select-all header | Select or clear all rows, like clicking it. |
| **Enter** on a non-editable cell | Same as clicking the row: `onRowClick`, then click-to-select unless `disableRowSelectionOnClick`. |
| **Ctrl+A** / **Cmd+A** | Select every row, unless `disableMultipleRowSelection` (or selection is not possible). |

Synthetic group rows (row grouping) are never selected from the keyboard. The grid sets `aria-multiselectable="true"` when several rows can be selected.

---

## ⚙️ API Reference

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `checkboxSelection` | `boolean` | `false` | Enable the checkbox column. |
| `disableRowSelectionOnClick` | `boolean` | `false` | If true, clicking a cell won't select the row. |
| `disableMultipleRowSelection` | `boolean` | `false` | Restricts selection to a single row. |
| `rowSelectionModel` | `GridRowId[]` | `[]` | Controlled array of selected IDs. |
| `onRowSelectionModelChange` | `(model: GridRowSelectionModel) => void` | — | Fired when the selection changes. |
| `pinCheckboxColumn` | `boolean` | `true` | Keep the checkbox column visible during horizontal scroll. |

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
