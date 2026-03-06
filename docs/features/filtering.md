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
  items: GridFilterItem[];    // Active filter items
  logicOperator?: 'and' | 'or'; // How to combine items
  quickFilterValues?: string[]; // Values for the global search
}

interface GridFilterItem {
  field: string;              // Column to filter
  operator: GridFilterOperator;
  value?: any;                // Comparison value
}
```

### Supported Operators
| Type | Operators |
| :--- | :--- |
| **String** | `contains`, `equals`, `startsWith`, `endsWith`, `isEmpty`, `isNotEmpty` |
| **Number** | `=`, `!=`, `>`, `>=`, `<`, `<=`, `isEmpty`, `isNotEmpty` |
| **Date** | `is`, `not`, `after`, `before`, `isEmpty`, `isNotEmpty` |
| **Boolean** | `is` |

---

## 🎨 Customizing Filter Components
You can replace the default filter panel via the `slots` API:

```tsx
<DataGrid
  slots={{
    filterPanel: MyCustomFilterPanel
  }}
/>
```
