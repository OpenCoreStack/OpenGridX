# Migrating from v1 to v2

This guide covers every change that requires action when upgrading `@opencorestack/opengridx` from any v1.x release to v2.0.0.

---

## 1. Remove two dead callback props

These props existed in v1 but their callbacks were **never called** — no UI existed to trigger them. They have been removed from `DataGridProps` in v2.

| Removed prop | Why | Fix |
| :--- | :--- | :--- |
| `onPinnedRowsChange` | No pin/unpin-row UI exists | Delete the prop from your JSX |
| `onRowGroupingModelChange` | No drag-to-group UI exists | Delete the prop from your JSX |

**TypeScript will give a compile error at every call site.** Runtime behavior is unchanged — these callbacks were never invoked, so removing them has no effect.

```tsx
// v1 — remove these props:
<DataGrid
  onPinnedRowsChange={handlePinnedRowsChange}      // ❌ delete
  onRowGroupingModelChange={handleGroupingChange}  // ❌ delete
/>

// v2:
<DataGrid />
```

---

## 2. Audit columns with `groupable: false`

In v1 the `groupable: false` flag on a `GridColDef` was **silently ignored** — the column was still grouped if it appeared in `rowGroupingModel`. In v2 the flag is enforced: that field is skipped entirely when building the group tree.

**Action required only if** you have a column with `groupable: false` that also appears in `rowGroupingModel`.

```tsx
// If you have this in v1 and the column was grouping:
{ field: 'id', groupable: false }
// ...and rowGroupingModel includes 'id'

// v2: 'id' is now silently skipped from grouping.
// Either remove 'id' from rowGroupingModel, or remove groupable:false.
```

---

## 3. Audit columns with `availableAggregationFunctions`

In v1 `availableAggregationFunctions` on a `GridColDef` was **silently ignored** — all configured aggregation functions ran regardless. In v2 this list is enforced: any function in `aggregationModel` that is not in `availableAggregationFunctions` for that field is skipped.

**Action required only if** you have `availableAggregationFunctions` set AND the active `aggregationModel` for that field uses a function not in that list.

```tsx
// v1: both 'sum' and 'avg' aggregations ran, regardless of this list
{ field: 'salary', availableAggregationFunctions: ['sum'] }
// ...with aggregationModel: { salary: 'avg' }

// v2: 'avg' is skipped for 'salary' because it is not in the allowed list.
// Fix: either add 'avg' to availableAggregationFunctions, or change aggregationModel.
```

---

## 4. `groupingColDef` now creates a real column

In v1 passing `groupingColDef` had no runtime effect. In v2, when `rowGroupingModel` is active, `groupingColDef` creates a dedicated `__group__` column at position 0, auto-pinned left.

**Action required only if** you were passing `groupingColDef` expecting it to be a no-op.

```tsx
// v1: this prop was accepted but did nothing
<DataGrid groupingColDef={{ headerName: 'Group', width: 200 }} rowGroupingModel={['dept']} />

// v2: this creates a pinned __group__ column at position 0.
// If you don't want the dedicated column, remove groupingColDef.
```

---

## New features (no migration needed)

These are purely additive — existing v1 code continues to work unchanged.

| Feature | Prop | Notes |
| :--- | :--- | :--- |
| Multi-sort single-click | `multiSort` | `false` by default; Shift+click always worked |
| Multi-sort shift-click | (built-in) | Shift+click now appends; previously behaved like a plain click |
| Row density wired | `density` | Was accepted but ignored in v1 |
| Click-to-select control | `disableRowSelectionOnClick` | Was accepted but ignored in v1; `onRowSelectionModelChange` now fires correctly |
| Single-row selection cap | `disableMultipleRowSelection` | Was accepted but ignored in v1 |
| Group label formatter | `groupingValueFormatter` on `GridColDef` | New field, no v1 code has it |
| Header tooltip | `description` on `GridColDef` | Was in types but not rendered in v1; now renders as `title` attribute |
| Pagination fixed | (bug fix) | Uncontrolled pagination navigation now works; controlled usage unchanged |

---

## Quick checklist

- [ ] Search codebase for `onPinnedRowsChange` — delete every occurrence
- [ ] Search codebase for `onRowGroupingModelChange` — delete every occurrence
- [ ] Search codebase for `groupable: false` — verify those fields are not in `rowGroupingModel`
- [ ] Search codebase for `availableAggregationFunctions` — verify the list covers what `aggregationModel` actually uses
- [ ] Search codebase for `groupingColDef` — verify you want the `__group__` column it now creates
- [ ] Run TypeScript (`tsc --noEmit`) — compiler will flag any remaining type errors
