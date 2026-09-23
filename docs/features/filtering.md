# 🔍 Filtering System

OpenGridX provides a robust filtering system with support for both client-side and server-side operations.

## 📑 Overview
- **Quick Filter**: Search across all visible, filterable columns at once.
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

The filter model can be controlled (`filterModel` + `onFilterModelChange`) or left to the grid. Uncontrolled, the grid keeps its own filter model: the toolbar search and filter panel (`slots={{ toolbar: GridToolbar }}`) and `apiRef.current.setFilterModel()` change it, `onFilterModelChange` reports each change, and `initialState.filter.filterModel` sets the starting filter (which is how [state persistence](./state-persistence.md) restores it).

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  slots={{ toolbar: GridToolbar }}          // search + filters work without any filter props
  initialState={{ filter: { filterModel: { items: [{ field: 'age', operator: '>', value: 30 }] } } }}
/>
```

### Server-Side Filtering
Set `filterMode="server"` and handle the request in your `dataSource`. The grid does not re-filter the rows it receives. Without a `dataSource`, fetch the filtered rows yourself from `onFilterModelChange` and pass them as `rows`.

```tsx
<DataGrid
  rows={[]}
  columns={columns}
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

The filter panel offers these operators per column `type` (the first one is the default):

| Type | Operators |
| :--- | :--- |
| **String** (default) | `contains`, `equals`, `startsWith`, `endsWith`, `isEmpty`, `isNotEmpty` |
| **Number** | `=`, `!=`, `>`, `>=`, `<`, `<=`, `isEmpty`, `isNotEmpty` |
| **Date** | `is`, `not`, `after`, `onOrAfter`, `before`, `onOrBefore`, `isEmpty`, `isNotEmpty` |
| **Boolean** | `is` |
| **singleSelect** | `isAnyOf`, `is`, `not` |

Every operator in `GridFilterOperator` also works in a programmatic `filterModel` on any column; the panel shows such an operator as it is.

### How values are matched

- **Empty values do not filter.** An item whose `value` is `undefined`, `null`, a blank string or an empty array is ignored, so picking an operator before typing (or clearing the input) leaves the grid unfiltered. `isEmpty` / `isNotEmpty` need no value.
- **Computed columns.** Cells are read through the column's `valueGetter`, so a computed column filters by the value it displays.
- **Text operators** (`contains`, `equals`, `startsWith`, `endsWith`, `is`, `not`) compare case-insensitively.
- **Number operators** compare numerically and accept numeric strings. A blank cell is empty, not `0`: it never matches `=`, `>`, `<` … and always matches `!=`.
- **Date operators** compare local calendar days. Cells and values can be `Date` objects, epoch milliseconds or date strings; a `'YYYY-MM-DD'` string is read as a local date (not UTC midnight). `not` matches empty cells; the other date operators never do.
- **`isAnyOf`** takes an array of allowed values. A single value is treated as a one-element list; an empty array does not filter.

### Quick Filter

`quickFilterValues` is a list of terms. A row matches when **every** term is found (case-insensitive substring) in at least one searched column.

- Only **visible** columns with `filterable !== false` are searched. The row `id` and fields that are not columns are not searched.
- Each column is searched by its value after `valueGetter` and, when the column has a `valueFormatter`, by the formatted text as well. `Date` values are searched as `YYYY-MM-DD`; objects are skipped.
- The toolbar search box splits what the user types on whitespace, so `john london` becomes `['john', 'london']` and matches a row with first name John and city London.

---

## 🎨 Customizing the Toolbar
The filter panel is accessible through the built-in `GridToolbar`. To use your own toolbar that includes a filter entry point, pass a custom component to the `toolbar` slot:

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  slots={{
    toolbar: MyCustomToolbar
  }}
/>
```

The `FilterPanel` component is also exported from `@opencorestack/opengridx` if you need to embed it inside a custom layout. See [`<FilterPanel />`](../components/filter-panel.md) for how it edits the model.
