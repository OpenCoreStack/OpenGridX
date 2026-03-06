# 💾 State Persistence

Save and restore the grid's configuration (sorting, filtering, column order, etc.) to provide a consistent experience for returning users.

---

## 🏗️ The `initialState` Prop

You can pre-configure the grid status on mount using the `initialState` prop.

```tsx
<DataGrid
  initialState={{
    sorting: {
      sortModel: [{ field: 'name', sort: 'asc' }]
    }
  }}
/>
```

---

## ⚓ The `useGridStateStorage` Hook

OpenGridX provides a built-in hook to simplify `localStorage` persistence.

```tsx
import { DataGrid, useGridStateStorage } from '@opencorestack/opengridx';

export default function MyGrid() {
  const { initialState, onStateChange } = useGridStateStorage('my-app-storage-key');

  return (
    <DataGrid
      initialState={initialState}
      onStateChange={onStateChange}
      // ...
    />
  );
}
```

---

## 📡 Tracking Changes

Use the `onStateChange` callback to listen for any modifications to the grid state and save them to `localStorage` or a database.

```tsx
<DataGrid
  onStateChange={(state) => {
    localStorage.setItem('grid-state', JSON.stringify(state));
  }}
/>
```

---

## 🧩 Supported State Objects

The following features support state persistence:
- **Sorting**: `sortModel`
- **Filtering**: `filterModel`
- **Pagination**: `paginationModel`
- **Columns**: `columnVisibilityModel`, `columnOrder`, `pinnedColumns`, `columnWidths`
- **Selection**: `rowSelectionModel`
- **Grouping**: `rowGroupingModel`
