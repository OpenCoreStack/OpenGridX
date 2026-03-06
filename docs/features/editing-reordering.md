# ✏️ Editing & ↕️ Reordering

Capture user input directly in the grid and rearrange data with intuitive drag-and-drop interactions.

---

## 🏗️ Cell Editing

OpenGridX supports inline cell editing. For a column to be editable, you must set `editable: true` in its definition.

### Basic Setup
```tsx
const columns = [
  { field: 'name', editable: true },
  { field: 'role', editable: true, type: 'singleSelect', valueOptions: ['Admin', 'Editor'] }
];
```

### Persistence
When a cell edit is committed, the `processRowUpdate` callback is triggered.

```tsx
<DataGrid
  processRowUpdate={(newRow, oldRow) => {
    // Save to your database/state here
    const updatedRows = rows.map(r => r.id === newRow.id ? newRow : r);
    setRows(updatedRows);
    return newRow; // Return the new row to confirm saving
  }}
  onProcessRowUpdateError={(error) => {
    console.error('Update failed:', error);
  }}
/>
```

---

## ↕️ Row Reordering

Allows users to rearrange rows by dragging a handle.

### Enable
1. Set `rowReordering={true}` on the grid.
2. Handle the `onRowOrderChange` callback.

```tsx
<DataGrid
  rowReordering={true}
  onRowOrderChange={(params) => {
    const { oldIndex, targetIndex } = params;
    // Move logic
    const newRows = [...rows];
    const [moved] = newRows.splice(oldIndex, 1);
    newRows.splice(targetIndex, 0, moved);
    setRows(newRows);
  }}
/>
```

> [!IMPORTANT]
> Row reordering is usually disabled when sorting or filtering is active to prevent index confusion.

---

## ↔️ Column Reordering

Users can drag column headers to change their horizontal order. This is enabled by default.

### Enable / Disable
Use the `disableColumnReorder` prop to control this feature globally.

```tsx
<DataGrid disableColumnReorder={true} />
```

### Controlled Column Order
You can manage the column order state explicitly using `columnOrder` and `onColumnOrderChange`.

```tsx
const [colOrder, setColOrder] = useState(['id', 'name', 'status']);

<DataGrid
  columnOrder={colOrder}
  onColumnOrderChange={(params) => {
    // params.newOrder is the updated array of field strings
    setColOrder(params.newOrder);
  }}
/>
```

### Non-Reorderable Columns
To prevent a specific column from being moved, set `reorderable: false` in its definition.

```tsx
const columns = [
  { field: 'id', reorderable: false }, // Stay pinned at start
  { field: 'name' }
];
```
