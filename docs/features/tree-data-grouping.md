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
- **The expand toggle, indentation and group label sit in the leftmost column on screen**, after column order, visibility and pinning are applied — not in whichever column is first in `columns`. Hiding or moving that column no longer leaves group rows without a label or toggle (fixed in v3.0).
- **Keyboard and screen readers** (v3.0): **Enter** on a non-editable cell of a group row or a tree-data parent expands or collapses it, and **Alt+ArrowRight** / **Alt+ArrowLeft** expand / collapse it. Rows expose `aria-level` (depth + 1), and rows with children expose `aria-expanded`. The expand buttons inside cells are not separate Tab stops. See [Keyboard & Accessibility](keyboard-navigation.md).
- **`valueFormatter` applies to grouped rows** the same as flat rows (fixed in v2.1; earlier versions rendered raw values for every column once grouping was on).
- **Group subtotals and the `(n)` count follow the filter.** They cover only the leaf rows that pass the current filter, and groups with no matching row are left out (v3.0; before, they counted hidden rows too). Groups keep their order of first appearance while filtering.
- **Grouping values are compared by value, not by text**: `null` and `'null'`, `1` and `'1'`, `true` and `'true'` are separate groups; equal dates share one. A column with a `valueGetter` is grouped by the value it computes.
- **`groupable: false`** fields are dropped from the model before grouping, so the other levels keep their depth, indentation, `defaultGroupingExpansionDepth` and export depth.
- **Sorting the column that shows the group labels orders the groups by their grouping value**; sorting an aggregated column orders them by the aggregate.
- **Group rows are synthetic.** They have no selection checkbox and no detail panel, their ids never appear in the selection model, clicking them toggles them (without `onRowClick`), and a column's `valueGetter` is not called for them. `renderCell` *is* called for them: see [GridRowMeta](../architecture/grid-row-meta.md#accessing-metadata-in-rendercell).
- **Server modes**: with `filterMode="server"` / `sortingMode="server"` the grid does not filter or sort the rows again on the client, in row grouping and tree data as in a flat grid.
- **Pass stable callbacks.** `rowGroupingModel` and `aggregationModel` are compared by value, so inline arrays and objects are fine, but a new `getTreeDataPath` or `columns` identity on every render rebuilds the whole hierarchy. Define them at module scope or memoize them.

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

### Behaviour to know about

- **Path segments can contain any character**, including `/`: `['a/b']` and `['a', 'b']` are different paths.
- **Missing parents are created for you.** A path segment with no row of its own gets a synthetic parent row (`rowMeta.isGroupRow`, label in `rowMeta.groupLabel`, row object `{ id }`) shown in the toggle column as `label (n)`, whatever that column is called. It is shown only when a row under it passes the filter, and sorting the toggle column orders it by its label.
- **Parents that are your own rows behave like any row**: clicking one fires `onRowClick` and selects it; its chevron expands it. (Before v3.0 a click toggled it and never fired `onRowClick`.) From the keyboard it expands with Enter or Alt+ArrowRight (see below) and **Shift+Space** selects it.
- **`descendantCount`** (the `(n)`) counts the rows below a node at any depth that pass the filter. A parent whose children are all filtered out is shown without a toggle.
- **Invalid paths are reported in development**: a row whose path is empty is shown as a top-level row, rows sharing a path attach their children to the first of them, and `treeData` without `getTreeDataPath` shows the rows flat. Each logs a `console.warn`.
- **Pagination** pages the flattened visible tree; keyboard navigation stays on the current page.
- **Lazy (server) trees**: the children of an expanded node with `serverChildrenCount` are fetched when it is expanded, and fetched again after a server re-fetch (a sort or filter change) replaces the rows.

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

Without `groupingColDef`, the group toggle is overlaid on the leftmost column on screen. With it, the group indicator always appears in its own fixed column regardless of your `columns` order. A `renderCell` in `groupingColDef` renders the group rows' label cell (return `undefined` to keep the default label).

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
