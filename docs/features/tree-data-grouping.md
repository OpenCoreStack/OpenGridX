# 🌳 Tree Data & Row Grouping

Display complex, hierarchical data structures with ease.

---

## 📂 Row Grouping

Row grouping allows you to categorize rows based on common column values.

### Usage
```tsx
<DataGrid
  rows={rows}
  rowGroupingModel={['department', 'role']}
/>
```

### Features
- **Multi-Level Groups**: Nest data as deeply as needed — one level per field in `rowGroupingModel`, in order.
- **Aggregation Integration**: Summarize values automatically for each group level.
- **Expansion Control**: Control which groups are expanded by default.

### Behaviour to know about

- **Pagination is ignored** while `rowGroupingModel` is active. All groups render in one scrollable, virtualized view, so the grid needs a bounded height ([Virtualization](./virtualization.md#the-grid-needs-a-bounded-height)). A development-mode warning is logged if you pass `pagination` too.
- **Expansion state survives data updates** (row grouping and tree data). Groups and nodes the user expanded or collapsed stay that way when `rows` changes: inline edits, live refreshes, new array identities, and lazily loaded server-side children. The state resets to `defaultGroupingExpansionDepth` only when `rowGroupingModel` or `defaultGroupingExpansionDepth` changes value.
- **Group aggregation uses the same functions as the footer.** `sum`, `avg`, `count`, `min`, `max` and `unique` ignore `null`/`undefined`, so a group of `[10, null, 20]` gives `min` 10, `avg` 15 and `count` 2. `availableAggregationFunctions` on a column is honoured for group rows too.
- **`valueFormatter` applies to grouped rows** the same as flat rows (fixed in v2.1; earlier versions rendered raw values for every column once grouping was on).

---

## 🌿 Tree Data

Tree data is used for data that has a natural parent-child relationship (e.g., an organizational chart or file system).

### Implementation
1. Enable `treeData={true}`.
2. Provide a `getTreeDataPath` function to define the hierarchy.

```tsx
<DataGrid
  treeData
  getTreeDataPath={(row) => row.hierarchyPath} // e.g. ['CEO', 'VP Engineering', 'Manager']
/>
```

---

## ⚙️ API Reference

### Props
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rowGroupingModel` | `string[]` | `[]` | Fields to group by (in order). |
| `treeData` | `boolean` | `false` | Enable tree data mode. |
| `getTreeDataPath` | `(row) => string[]` | `undefined` | Function to get the path for a row. |
| `defaultGroupingExpansionDepth` | `number` | `0` | How many levels to expand on load. |
| `groupingColDef` | `GridColDef` | `undefined` | Custom configuration for the generated group column. |

---

## 🎨 Customizing the Group Column

When `rowGroupingModel` is active, pass `groupingColDef` to configure a dedicated `__group__` column that is prepended at position 0 and auto-pinned left, separate from your data columns. It accepts any `GridColDef` fields except `field` (always `'__group__'`).

```tsx
<DataGrid
  rows={rows}
  columns={columns}
  rowGroupingModel={['department']}
  groupingColDef={{
    headerName: 'Department Group',
    width: 240,
  }}
/>
```

Without `groupingColDef`, the group toggle is overlaid on the first data column. With it, the group indicator always appears in its own fixed column regardless of your `columns` order.

---

## 🏷️ Customizing Group Labels (`groupingValueFormatter`)

By default each group-header row displays `"field: value"`. Use `groupingValueFormatter` on a `GridColDef` to override the label for that grouping level:

```tsx
const columns: GridColDef[] = [
  {
    field: 'department',
    headerName: 'Department',
    groupingValueFormatter: ({ value }) => `📁 ${String(value)}`,
  },
  { field: 'name', headerName: 'Name' },
  { field: 'salary', headerName: 'Salary' },
];

<DataGrid rows={rows} columns={columns} rowGroupingModel={['department']} />
// Group headers now show: "📁 Engineering", "📁 HR", etc.
```

---

## 🚫 Preventing a Column from Being Grouped (`groupable: false`)

Set `groupable: false` on a `GridColDef` to prevent that field from being used as a grouping dimension. The column still renders normally, but the grid skips it when building the group tree:

```tsx
const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', groupable: false },
  { field: 'department', headerName: 'Department' },
];

// Even if rowGroupingModel includes 'id', it will be silently skipped.
<DataGrid rows={rows} columns={columns} rowGroupingModel={['id', 'department']} />
// Result: grouped by 'department' only — 'id' is skipped.
```
