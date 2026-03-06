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
- **Multi-Level Groups**: Nest data as deeply as needed.
- **Aggregation Integration**: Summarize values automatically for each group level.
- **Expansion Control**: Control which groups are expanded by default.

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
By default, OpenGridX creates a `__group__` column. You can customize its appearance:

```tsx
<DataGrid
  groupingColDef={{
    headerName: 'Hierarchy',
    width: 300,
    renderCell: (params) => { /* custom renderer */ }
  }}
/>
```
