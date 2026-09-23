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

Double-click a cell or press **Enter** on a focused cell to open its editor.

### Which cells can be edited
A cell is editable when its column has `editable: true` **and**, if you pass it, `isCellEditable` returns `true`. The same rule drives double-click, Enter, the cells **Tab** stops on while editing, and `aria-readonly`.

```tsx
<DataGrid
  columns={columns}
  rows={rows}
  // Lock archived rows, whatever the column says.
  isCellEditable={({ row }) => row.status !== 'archived'}
/>
```

- `isCellEditable` can only restrict. It cannot make a column without `editable: true` editable. If it throws, the cell is treated as read-only.
- Row-grouping group rows and the ancestors tree data generates for missing path segments are never editable. Tree-data **parent rows are your own rows** and are editable like any other row.
- Pinned rows (`pinnedRows`) are edited like any other row, with double-click or Enter (v3.0; they used to show no editor).
- **Enter** on a cell that is not editable does what clicking its row does (`onRowClick`, click-to-select, expanding a group). See [Keyboard & Accessibility](keyboard-navigation.md).

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

`processRowUpdate` must return the row to store (or a Promise of it). The grid stores that row under the id of the row you edited, so a server response that lacks the key field (for example the `uid` read by `getRowId={r => r.uid}`) is still applied. The row is stored as returned: the grid never adds an `id` field to it (v3.0+). Returning nothing is a mistake the grid reports through `onProcessRowUpdateError` (or `console.error` in development when no handler is set); the editor stays open.

### Commit and cancel

| Action | Result |
| :--- | :--- |
| **Enter** | Commits and closes the editor. |
| **Tab** / **Shift+Tab** | Commits and moves to the next / previous editable cell. With no editable cell left, focus moves on out of the grid and the edit commits. Outside edit mode Tab is not captured: it leaves the grid. |
| Moving focus away (clicking another cell or any control outside the grid) | Commits. Focus stays where you put it. |
| The edited cell leaving the grid (scrolled out of the render window, filtered out, another page) | Commits, as if the editor had lost focus. |
| Starting an edit on another cell | Commits the current edit first. |
| **Escape** | Discards the pending value and closes the editor. |

Clicks and double-clicks inside an open editor stay in the editor: you can place the caret, select a word or open a dropdown. They do not fire `onCellClick`, `onRowClick` or `onRowDoubleClick`, and do not change row selection. While an IME is composing (Japanese, Chinese, Korean input), **Enter** confirms the candidate and does not commit.

`processRowUpdate` runs **once per commit**. Actions that overlap, such as pressing Enter and then clicking elsewhere while an async save is in flight, share that one call.

With an async `processRowUpdate`, the editor stays open until the Promise settles:
- **Resolved:** the returned row is stored and the editor closes. If the user kept typing meanwhile, the editor stays open with the newer text, which the next commit saves.
- **Rejected:** `onProcessRowUpdateError` receives the error and the editor stays open with the pending value, so the user can fix it or press Escape.
- **Escape while pending** closes the editor at once, but cannot recall the save: when it resolves, the returned row is still stored, because your `processRowUpdate` has already run.
- A late result never closes an edit the user has started on another cell.

### Built-in editors
The editor follows the column `type`, and commits values of the same type the cell held.

| `type` | Editor | Committed value |
| :--- | :--- | :--- |
| `'string'` (default) | Text input | String. |
| `'number'` | Number input | Number, or `null` when cleared. |
| `'boolean'` | Checkbox | Toggling commits immediately. |
| `'singleSelect'` | `<select>` over `valueOptions` | The option's own value: `{ value: 2, label: 'Closed' }` commits the number `2`, not `'2'`. When the current value is empty or not among the options, an empty choice is shown, so any option can be picked. |
| `'date'` | Date input | Same kind as before: a `Date` stays a `Date` (keeping its time of day), a timestamp stays a timestamp, an ISO date-time string keeps its time part. `null` when cleared. |

Every editor is labelled with the column's `headerName` (or `field`) for screen readers.

### Custom editors (`renderEditCell`)
`renderEditCell` receives the usual cell params, with `value` set to the pending value, plus three callbacks:

```tsx
import type { GridColDef, GridRenderEditCellParams } from '@opencorestack/opengridx';

function RatingEditor({ value, onValueChange, onCommit, onCancel }: GridRenderEditCellParams) {
  return (
    <input
      type="range" min={0} max={5} autoFocus
      value={Number(value ?? 0)}
      onChange={e => onValueChange(Number(e.target.value))}
      onBlur={onCommit}
      onKeyDown={e => { if (e.key === 'Escape') onCancel(); }}
    />
  );
}

const columns: GridColDef[] = [
  { field: 'rating', type: 'number', editable: true, renderEditCell: params => <RatingEditor {...params} /> },
];
```

Enter and Escape keydowns that bubble out of a custom editor also commit and cancel. An error thrown by `renderEditCell` is contained to its cell (the cell shows `⚠`), like `renderCell`.

### Computed columns (`valueGetter` + `valueSetter`)
An editable column with a `valueGetter` edits the derived value. Give it a `valueSetter` so the commit can write the value back to the fields it comes from; otherwise the commit writes `row[field]`, which the `valueGetter` ignores, and a development warning is logged.

```tsx
{
  field: 'fullName',
  editable: true,
  valueGetter: ({ row }) => `${row.firstName} ${row.lastName}`,
  valueSetter: ({ value, row }) => {
    const [firstName, ...rest] = String(value).split(' ');
    return { ...row, firstName, lastName: rest.join(' ') };
  },
}
```

---

## ↕️ Row Reordering

Allows users to rearrange rows by dragging a handle.

### Enable
1. Set `rowReordering={true}` on the grid.
2. Handle the `onRowOrderChange` callback.

```tsx
<DataGrid
  rows={rows}
  rowReordering={true}
  onRowOrderChange={({ oldIndex, targetIndex }) => {
    const newRows = [...rows];
    const [moved] = newRows.splice(oldIndex, 1);
    newRows.splice(targetIndex, 0, moved);
    setRows(newRows);
  }}
/>
```

### What the indices mean
`oldIndex` and `targetIndex` are positions in **your `rows` prop** (v3.0+), so `rows[oldIndex] === params.row` and the splice above always moves the row that was dragged. This holds on every page, with pinned rows, and while the grid is sorted or filtered. (Before v3.0 they were positions in the visible page, which moved the wrong row in all of those cases.)

`params.row` is your own row object, also with `getRowId`.

While the grid is sorted, the new position in `rows` does not change where the row shows up: the sort decides that. Turn sorting off if the drag should visibly move the row.

### Which rows can be dragged
- Every data row you passed in `rows` can be dragged and dropped on.
- Pinned rows (`pinnedRows`) keep their place. They show an empty handle cell, so their cells line up with the header, but cannot be dragged or dropped on.
- Rows the grid makes itself cannot be dragged or dropped on: row-grouping group rows and the tree-data parents generated for missing path segments.
- Only the grid's own row drags are accepted: dropping a file, a text selection or a header on a row does nothing.

---

## ↔️ Column Reordering

Users can drag column headers to change their horizontal order. This is enabled by default.

### Enable / Disable
Use the `disableColumnReorder` prop to control this feature globally.

```tsx
<DataGrid disableColumnReorder={true} />
```

### Controlled Column Order
Manage the order yourself with `columnOrder` and `onColumnOrderModelChange`, which receives the whole new order after every change: a header drag, a drag in the Columns panel, and the panel's **Reset**.

```tsx
const [colOrder, setColOrder] = useState(['id', 'name', 'status']);

<DataGrid
  columnOrder={colOrder}
  onColumnOrderModelChange={setColOrder}
/>
```

`onColumnOrderChange` still fires for every single move, with `{ column, oldIndex, targetIndex }`. The indices are positions in the grid's **full** column order: every current column (hidden columns and the row-grouping `__group__` column included), in its current order. Splicing your `columnOrder` with them is only right when it lists every column; prefer `onColumnOrderModelChange`. The panel's Reset does not fire `onColumnOrderChange`.

Columns missing from `columnOrder` (added later, for example) are still shown, placed by their position in `columns`.

### Non-Reorderable Columns
To prevent all columns from being reordered, use `disableColumnReorder` on the grid. Pinned columns (`pinnedColumns`, and the row-grouping column) keep their place: their headers cannot be dragged, and a header dropped on them does nothing. Unpin a column to move it. `pinnable: false` only stops a column from being pinned; it can still be reordered (v3.0+).

```tsx
// Disable reordering globally
<DataGrid disableColumnReorder />

// Keep a column fixed by pinning it
<DataGrid pinnedColumns={{ left: ['id'] }} />
```

Under `columnGroupingModel`, a column can only be dropped on a column of the same group.
