# 🔍 Filtering System

OpenGridX provides a robust filtering system with support for both client-side and server-side operations.

## 📑 Overview
- **Quick Filter**: Search across all columns simultaneously.
- **Column Filters**: Specific operators for different data types (string, number, date, etc.).
- **Multi-Filter Groups**: Support for `AND`/`OR` logic operators.
- **Server-Side Filtering**: Offload complex queries to your backend.

---

## 🛠️ Usage

### Client-Side Filtering (Default)
Simply define your columns with `filterable: true` (which is the default).

```tsx
<DataGrid
  rows={rows}
  columns={[
    { field: 'name', headerName: 'Name' },
    { field: 'age', headerName: 'Age', type: 'number' }
  ]}
/>
```

### Server-Side Filtering
Set `filterMode="server"` and handle the request in your `dataSource`.

```tsx
<DataGrid
  filterMode="server"
  onFilterModelChange={(model) => console.log('Current Filters:', model)}
  dataSource={{
    getRows: async (params) => {
      // params.filterModel contains the items and logic operators
      return fetchRowsFromBackend(params);
    }
  }}
/>
```

---

## ⚙️ Filter Model API

The `GridFilterModel` describes the current state of filters.

```typescript
interface GridFilterModel {
  items?: (GridFilterItem | GridFilterGroup)[];  // Active filter items or groups
  logicOperator?: 'and' | 'or'; // How to combine items
  quickFilterValues?: string[]; // Values for the global search
}

interface GridFilterItem {
  field: string;              // Column to filter
  operator: GridFilterOperator;
  value?: unknown;            // Comparison value
}
```

### Supported Operators
| Type | Operators |
| :--- | :--- |
| **String** | `contains`, `equals`, `startsWith`, `endsWith`, `isEmpty`, `isNotEmpty`, `isAnyOf` |
| **Number** | `equals`, `!=`, `>`, `>=`, `<`, `<=`, `isEmpty`, `isNotEmpty` |
| **Date** | `is`, `not`, `isEmpty`, `isNotEmpty` |
| **Boolean** | `is` |

---

## 🎨 Customizing the Toolbar
The filter panel is accessible through the built-in `GridToolbar`. To use your own toolbar that includes a filter entry point, pass a custom component to the `toolbar` slot:

```tsx
<DataGrid
  slots={{
    toolbar: MyCustomToolbar
  }}
/>
```

The `FilterPanel` component is also exported from `@opencorestack/opengridx` if you need to embed it inside a custom layout.
