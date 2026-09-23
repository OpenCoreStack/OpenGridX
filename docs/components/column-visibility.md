# `<ColumnVisibilityPanel />`

The `ColumnVisibilityPanel` provides an interactive list for users to toggle the visibility of specific columns within the grid. This is essential for managing dense datasets where only a subset of information is needed at once.

## 📑 Overview
- **Auto-Generating List**: It automatically builds a list of all togglable columns from the grid's state.
- **Searchable Interface**: Includes a quick search to find specific columns in grids with many fields.
- **Toggle State**: Synchronizes instantly with the grid's `columnVisibilityModel`.
- **Exclusion Logic**: Automatically hides special internal columns (e.g., checkboxes) and columns marked with `hideable: false`.

---

## 🛠️ Usage

The grid's toolbar and header menu already include this panel. Import it yourself (exported since v2.1) only when you want the list somewhere else, such as a sidebar or modal. It is a controlled component: you own the visibility model and pass it in.

```tsx
import { useMemo, useState } from 'react';
import { DataGrid, ColumnVisibilityPanel } from '@opencorestack/opengridx';
import type { GridColDef } from '@opencorestack/opengridx';

function Report({ rows, columns }: { rows: Row[]; columns: GridColDef<Row>[] }) {
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const visibleColumns = useMemo(
    () => new Set(columns.filter(c => visibility[c.field] !== false).map(c => c.field)),
    [columns, visibility],
  );
  const setAll = (visible: boolean) =>
    setVisibility(Object.fromEntries(columns.filter(c => c.hideable !== false).map(c => [c.field, visible])));

  return (
    <div style={{ display: 'flex' }}>
      <aside className="my-column-sidebar">
        <ColumnVisibilityPanel
          columns={columns}
          visibleColumns={visibleColumns}
          onVisibilityChange={(field, isVisible) => setVisibility(v => ({ ...v, [field]: isVisible }))}
          onShowAll={() => setAll(true)}
          onHideAll={() => setAll(false)}
        />
      </aside>
      <DataGrid rows={rows} columns={columns} columnVisibilityModel={visibility} onColumnVisibilityModelChange={setVisibility} />
    </div>
  );
}
```

### Props (`ColumnVisibilityPanelProps`)

| Prop | Type | Description |
| :--- | :--- | :--- |
| `columns` | `GridColDef[]` | Columns to list |
| `visibleColumns` | `Set<string>` | Fields currently visible |
| `onVisibilityChange` | `(field, isVisible) => void` | Toggle one column |
| `onShowAll` / `onHideAll` | `() => void` | Bulk actions (only `hideable` columns are affected) |
| `onColumnReorder` | `(fromField, toField) => void` | Optional — enables drag-to-reorder in the list |
| `onColumnOrderReset` | `() => void` | Optional — shows a reset-order action |
| `showNonHideableColumns` | `boolean` | Show `hideable: false` columns as disabled rows. Default `false` |

---

## ⚙️ How it Works

1. **Column Resolution**: The panel retrieves all columns defined in the `DataGrid`.
2. **Filtration**: It ignores columns that should not be visible in the list:
   - Columns starting with `__` (internal types).
   - Columns explicitly marked as `hideable: false` in the `GridColDef`.
3. **State Management**: When a user toggles a switch, it triggers an update to the grid's `columnVisibilityModel`, causing the grid to re-render only the affected columns.

---

## 🎨 Controlling Visibility Programmatically

The built-in panel cannot be replaced through the slots API. To drive visibility from outside, use the controlled props, optionally together with a standalone `ColumnVisibilityPanel` as shown above:

```tsx
<DataGrid
  columnVisibilityModel={model}
  onColumnVisibilityModelChange={setModel}
/>
```

## 📝 Best Practices
- **Logical Grouping**: Ensure your columns have clear, human-readable `headerName` values so they are easily identifiable in the list.
- **Persistent State**: Use `onColumnVisibilityModelChange` to save column preferences to local storage or a database so the user's layout is preserved.
