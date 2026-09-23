# Migrating from v2 to v3

This guide covers every change in `@opencorestack/opengridx` 3.0.0 that can require action when upgrading from any 2.x release.

Most projects need no code changes. You only need to act if one of these applies:

| If your code… | See |
| :--- | :--- |
| reads `params.row._hasChildren`, `_treeDepth`, `_isExpanded`, `_groupingField`, `_groupingValue`, `_descendantCount` or `_isGroupRow` | [§1](#1-underscore-hierarchy-fields-are-no-longer-added-to-rows) |
| mutates `params.row` inside `renderCell` / `valueFormatter` while row grouping or tree data is on | [§2](#2-params-row-is-now-your-own-row-object) |
| exports grouped data with `exportToExcelAdvanced` and relies on the default group label | [§3](#3-grouped-export-labels-match-the-grid) |

After upgrading, **restart your dev server and clear the bundler cache** (for Vite: `rm -rf node_modules/.vite`, then start with `--force`). If you skip this, Vite can keep serving the old version even though `node_modules` contains the new one, and the old behavior looks like a regression.

---

## 1. Underscore hierarchy fields are no longer added to rows

**What changed:** until v3, `useTreeData` and `useRowGrouping` copied each row and added these fields to the copy before it reached `renderCell`:

`_hasChildren`, `_treeDepth`, `_isExpanded`, `_groupingField`, `_groupingValue`, `_descendantCount`, `_isGroupRow`

They were deprecated in v1.1 and removed from the TypeScript types then. In v3 they are no longer added at runtime either. The same information has been available as `params.rowMeta` since v1.1.

**Who is affected:** code that reads any of these fields. TypeScript does not warn about it, because `GridRowModel` has an index signature. Reading `params.row._hasChildren` type-checks as `unknown` and is simply `undefined` in v3.

**Find it:**

```bash
grep -rnE "\._(hasChildren|treeDepth|isExpanded|groupingField|groupingValue|descendantCount|isGroupRow)\b" src/
```

**Fix it:** read `params.rowMeta` instead. It is `undefined` for flat rows, so always use optional chaining.

| v2 (row field) | v3 (`params.rowMeta`) |
| :--- | :--- |
| `params.row._hasChildren` | `params.rowMeta?.hasChildren` |
| `params.row._treeDepth` | `params.rowMeta?.treeDepth` |
| `params.row._isExpanded` | `params.rowMeta?.isExpanded` |
| `params.row._groupingField` | `params.rowMeta?.groupingField` |
| `params.row._groupingValue` | `params.rowMeta?.groupingValue` |
| `params.row._descendantCount` | `params.rowMeta?.descendantCount` |
| `params.row._isGroupRow` | `params.rowMeta?.isGroupRow` |

`rowMeta` also has `groupLabel`, the formatted label the grid shows for a group row.

```tsx
// v2
renderCell: (params) => {
  const row = params.row as Record<string, unknown>;
  return row._hasChildren ? <strong>{params.value}</strong> : params.value;
}

// v3
renderCell: (params) =>
  params.rowMeta?.hasChildren ? <strong>{params.formattedValue}</strong> : params.formattedValue
```

`rowMeta` (and `formattedValue`) are passed to `renderCell`, `renderEditCell` and the function form of `cellClassName`.

**Tree data:** the parent rows the grid creates for missing path segments used to carry `_isGroupRow: true`. Use `params.rowMeta?.isGroupRow` to recognise them.

---

## 2. `params.row` is now your own row object

**What changed:** because v2 copied every row to attach the underscore fields, `params.row` under row grouping or tree data was a **copy**. In v3 it is the **same object you passed in `rows`**, exactly as it is without grouping. This also stops rows being re-created on every render, so cells re-render less.

**Who is affected:** only code that **mutates** `params.row` (or the `row` passed to `valueGetter` / `valueFormatter`) while grouping or tree data is on. Those mutations used to land on a throwaway copy; now they change your data. Mutating row objects inside render callbacks was never supported, so this should be rare.

**Fix it:** don't mutate rows during render. Derive values instead, or update rows through state and `processRowUpdate`.

If you compare row objects by identity (`===`), grouped and flat rows now behave the same: the grid passes your objects through unchanged.

---

## 3. Grouped export labels match the grid

**What changed:** in v2, group-header labels differed between export formats:

- `exportToExcelAdvanced` used the column's `groupingValueFormatter`, falling back to `"Header: value"` (the column's `headerName`).
- CSV, basic Excel, JSON, print and PDF ignored `groupingValueFormatter` and always wrote `"field: value"`.

In v3 every format writes the label the grid shows. They use, in order:

1. the entry's `groupLabel`, which `apiRef.current.getGroupedExportRows()` now sets from the grid's own label;
2. otherwise the grouping column's `groupingValueFormatter`;
3. otherwise `"field: value"`, the grid's documented default.

**Who is affected:**

- `exportToExcelAdvanced` users grouping by a column **without** a `groupingValueFormatter`. Their headers change from `Department: Engineering` to `dept: Engineering`.
- CSV / basic Excel / JSON / print / PDF users grouping by a column **with** a `groupingValueFormatter`. Their headers now use the formatter, as the grid does.

**Fix it:** to control the label, set `groupingValueFormatter` on the grouping column. It then applies in the grid and in every export format:

```tsx
{ field: 'dept', headerName: 'Department', groupingValueFormatter: ({ value }) => `Department: ${String(value)}` }
```

---

## Checklist

- [ ] Search for `._hasChildren`, `._treeDepth` and the other underscore fields (command in §1) and switch to `params.rowMeta`.
- [ ] Search `renderCell`, `valueGetter` and `valueFormatter` for assignments to `params.row` / `row` under grouping or tree data.
- [ ] If you export grouped data, check the group labels, and set `groupingValueFormatter` where you want a specific label.
- [ ] Restart the dev server and clear the bundler cache (`rm -rf node_modules/.vite`).
- [ ] Run `tsc --noEmit` and your test suite.

For everything else in 3.0.0 (fixes and additions), see [CHANGELOG.md](../../CHANGELOG.md).
