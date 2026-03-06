# `<ColumnVisibilityPanel />`

The `ColumnVisibilityPanel` provides an interactive list for users to toggle the visibility of specific columns within the grid. This is essential for managing dense datasets where only a subset of information is needed at once.

## 📑 Overview
- **Auto-Generating List**: It automatically builds a list of all togglable columns from the grid's state.
- **Searchable Interface**: Includes a quick search to find specific columns in grids with many fields.
- **Toggle State**: Synchronizes instantly with the grid's `columnVisibilityModel`.
- **Exclusion Logic**: Automatically hides special internal columns (e.g., checkboxes) and columns marked with `hideable: false`.

---

## 🛠️ Usage

### Toolbar Integration
The most common way to use the visibility panel is within a dropdown menu in the grid's toolbar.

```tsx
import { ColumnVisibilityPanel } from '@opencorestack/opengridx';

// In your Toolbar component
<Dropdown content={<ColumnVisibilityPanel />}>
  <button>Columns</button>
</Dropdown>
```

### Direct Integration
You can also render it persistently beside the grid or within a custom modal.

```tsx
<div className="my-column-sidebar">
  <ColumnVisibilityPanel />
</div>
```

---

## ⚙️ How it Works

1. **Column Resolution**: The panel retrieves all columns defined in the `DataGrid`.
2. **Filtration**: It ignores columns that should not be visible in the list:
   - Columns starting with `__` (internal types).
   - Columns explicitly marked as `hideable: false` in the `GridColDef`.
3. **State Management**: When a user toggles a switch, it triggers an update to the grid's `columnVisibilityModel`, causing the grid to re-render only the affected columns.

---

## 🎨 Slot Implementation
In advanced scenarios, you can replace the default panel with your own implementation using the `columnVisibilityPanel` slot.

```tsx
<DataGrid
  slots={{
    columnVisibilityPanel: MyCustomVisibilityPanel
  }}
/>
```

## 📝 Best Practices
- **Logical Grouping**: Ensure your columns have clear, human-readable `headerName` values so they are easily identifiable in the list.
- **Persistent State**: Use `onColumnVisibilityModelChange` to save column preferences to local storage or a database so the user's layout is preserved.
