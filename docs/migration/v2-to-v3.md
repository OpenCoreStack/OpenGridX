# Migrating from v2 to v3

This guide covers every change in `@opencorestack/opengridx` 3.0.0 that can require action when upgrading from any 2.x release. 3.0.0 is mostly a correctness release: nearly every item below is a bug fix. They are listed here because they change what your users see, what files contain, or what your callbacks receive, and code written around the old behaviour can break.

Use the table to find the sections that apply to you. Sections are ordered by how many apps they are likely to affect. The full list of fixes is in [CHANGELOG.md](../../CHANGELOG.md).

## Who needs to do what

| If your app… | Go to |
| :--- | :--- |
| has columns with `type: 'date'`, `'boolean'`, `'singleSelect'` or `'image'` and no `valueFormatter` / `renderCell` | [§1](#1-cells-are-formatted-by-column-type) |
| passes `getRowId`, or reads `row.id` on rows that have their own key field | [§2](#2-getrowid-no-longer-writes-an-id-onto-rows) |
| reads `params.row._hasChildren`, `_treeDepth`, `_isGroupRow` or another underscore field | [§3](#3-underscore-hierarchy-fields-are-no-longer-added-to-rows) |
| mutates `params.row` inside `renderCell` / `valueGetter` / `valueFormatter` under grouping or tree data, mutates `columns` in place, or has a `valueGetter` that is impure or can throw | [§4](#4-paramsrow-is-now-your-own-row-object) |
| builds filter items in code, relies on empty filter values, or uses the toolbar search / `renderQuickFilter` | [§5](#5-filtering) |
| sorts numeric strings, dates stored as strings, accented text, or uses the column menu with multi-sort | [§6](#6-sorting) |
| relies on Tab moving between cells, on Enter in a non-editable cell, or on `colIndex` / `rowIndex` / `aria-*` values | [§7](#7-keyboard-focus-and-aria) |
| uses `pagination`, `rowCount`, `pageSizeOptions` or `onPaginationModelChange` | [§8](#8-pagination) |
| uses checkbox selection, select-all, `disableMultipleRowSelection` or a controlled `rowSelectionModel` | [§9](#9-selection) |
| calls `apiRef.current.*` methods (setters, `getAllFilteredRows`, `getVisibleRows`, `getVisibleColumns`) | [§10](#10-apiref) |
| edits cells: `processRowUpdate`, `isCellEditable`, `renderEditCell`, `singleSelect` / `date` / `boolean` editors | [§11](#11-editing) |
| exports CSV, Excel, JSON, print or PDF files, or parses them downstream | [§12](#12-exports) |
| shows aggregation totals (footer, group rows, `getAggregationResult()`) | [§13](#13-aggregation-values) |
| uses row grouping or tree data, parses group row ids, or uses `getAggregationPosition` | [§14](#14-row-grouping-and-tree-data) |
| passes a `dataSource`, uses infinite scroll or server-side pagination / sorting / filtering | [§15](#15-server-side-data-and-infinite-scroll) |
| pins columns or rows, sets column widths, uses detail panels, `onRowsScrollEnd`, or has CSS for pinned rows | [§16](#16-layout-and-pinning) |
| uses `onRowOrderChange`, `onColumnOrderChange`, a controlled `columnOrder`, or tests column resizing | [§17](#17-row-and-column-reordering-and-resizing) |
| has a `<form>` around the grid, uses the exported `Button` / `Checkbox` / `GridTooltip`, or a custom toolbar | [§18](#18-toolbar-buttons-and-ui-components) |
| copies rows with Ctrl+C or `apiRef.current.copySelectedRows()` | [§19](#19-clipboard) |
| uses `DataGridThemeProvider`, a preset theme, or theme heights | [§20](#20-theming) |
| uses `pivotMode` | [§21](#21-pivot-mode) |
| uses `colSpan`, `rowSpan` or `columnGroupingModel` | [§22](#22-cell-spanning-and-column-groups) |
| uses `listView` | [§23](#23-list-view) |
| has custom CSS targeting `ogx__*` / `ogx-*` classes or grid DOM structure | [§24](#24-dom-and-css-class-changes) |
| relies on TypeScript types of rows, columns or props | [§25](#25-typing-changes) |
| persists grid state: `onStateChange`, `initialState`, `useGridStateStorage` (including with SSR) | [§26](#26-state-persistence) |

---

## Before you start

### Clear the bundler cache

After upgrading, **restart your dev server and clear the bundler cache** (for Vite: `rm -rf node_modules/.vite`, then start with `--force`). If you skip this, Vite can keep serving the old version even though `node_modules` contains the new one, and the old behaviour looks like a regression.

### Import the stylesheet

The stylesheet is **not** loaded by the JavaScript entry. It never was: some v2 docs said it was imported automatically, which was wrong. Import it once, in your app's root file:

```tsx
import '@opencorestack/opengridx/styles';
```

Without it the grid is unstyled and its viewport has no bounded height, so **every row renders** (virtualization is effectively off). If your v2 app looked fine, you already have this import. In development, 3.0.0 logs a warning when the stylesheet is not loaded.

> **3.0.1 note — height.** Without a `height` prop the grid now fills its container (root class `ogx--fill`: `height: 100%`, and as a flex item `flex: 1 1 auto; min-height: 0`). In 3.0.0 the root was auto-height, so inside a bounded flex layout it grew to fit every row. The container still needs a bounded height (a definite height, or `min-height: 0` on every flex / grid ancestor up to the sized one); in an auto-height container the grid still grows to fit. An explicit `height`, `style.height` or `autoHeight` is never stretched. The unbounded-container dev warning is only logged when the viewport really is as tall as its rows.

### Know the size limit

A single scrolling grid tops out at about 645,000 rows at the default 52px row height in Chromium (the browser's maximum element height). Above that, use pagination or a `dataSource`. The grid logs a dev warning when content is taller than browsers can scroll.

---

## 1. Cells are formatted by column type

**What changed:** columns with a `type` and no `valueFormatter` are now formatted for display. This applies to cells, `params.formattedValue`, list view, and the CSV, basic Excel, print and PDF exports.

| `type` | v2 showed | v3 shows |
| :--- | :--- | :--- |
| `'date'` | `String(value)`, e.g. `Mon Mar 04 2024 00:00:00 GMT+0100` | `value.toLocaleDateString()`, e.g. `3/4/2024` |
| `'boolean'` | `true` / `false` | `Yes` / `No` |
| `'singleSelect'` | the raw value, e.g. `2` | the matching `valueOptions` label |
| `'image'` (no `renderCell`) | the URL as text | `<img class="ogx__cell-image">` |

**Who is affected:** apps whose tests, snapshots or downstream parsers expect the old text, and apps that post-process `params.formattedValue`.

**How to find it:** `grep -rnE "type: *['\"](date|boolean|singleSelect|image)['\"]" src/`

**Fix it:** if you want a different format, add a `valueFormatter`; it always wins over the default.

```tsx
import type { GridColDef } from '@opencorestack/opengridx';

const columns: GridColDef[] = [
  {
    field: 'createdAt',
    type: 'date',
    valueFormatter: ({ value }) => (value instanceof Date ? value.toISOString().slice(0, 10) : ''),
  },
  { field: 'active', type: 'boolean', valueFormatter: ({ value }) => (value ? 'true' : 'false') },
];
```

---

## 2. getRowId no longer writes an id onto rows

**What changed:** in v2, `getRowId` rows were copied and `id` was overwritten with `getRowId(row)`. In v3 rows are stored untouched and keyed by `getRowId` internally. Everywhere you receive a row (`params.row`, `onRowClick`, `processRowUpdate`, `apiRef`, `dataSource` rows, tree children), it is your own object.

| | v2 | v3 |
| :--- | :--- | :--- |
| `row.id` with `getRowId={(r) => r.sku}` | `r.sku` (overwritten) | your row's own `id` (often `undefined`) |
| `row.id === getRowId(row)` | always true | not guaranteed |
| Exporting `selectedRows` | matched on `row.id` | matched on `row.id` unless you pass `getRowId` |
| Duplicate ids | later row won and rendered twice | first row kept, dev warning |
| Inline `getRowId={(r) => r.sku}` | reset the row store on every render | only a new `rows` array or changed ids reset it |

**Who is affected:** apps that pass `getRowId` and then read `row.id`, and apps that export the selection with `getRowId`.

**How to find it:** `grep -rn "getRowId" src/`, then check for `.id` reads on rows in the same components.

**Fix it:** use your own key, and pass `getRowId` to exports.

```tsx
import { exportToCsv } from '@opencorestack/opengridx';
import type { GridApi, GridColDef, GridRowModel } from '@opencorestack/opengridx';

interface Product extends GridRowModel { sku: string; name: string }

const getRowId = (row: GridRowModel): string => String(row.sku);

function exportSelection(api: GridApi, rows: Product[], columns: GridColDef<Product>[]): void {
  exportToCsv(rows, columns, { selectedRows: api.getSelectedRows(), getRowId });
}
```

---

## 3. Underscore hierarchy fields are no longer added to rows

**What changed:** until v3, `useTreeData` and `useRowGrouping` copied each row and added these fields to the copy before it reached `renderCell`:

`_hasChildren`, `_treeDepth`, `_isExpanded`, `_groupingField`, `_groupingValue`, `_descendantCount`, `_isGroupRow`

They were deprecated in v1.1 and removed from the TypeScript types then. In v3 they are no longer added at runtime either. The same information has been available as `params.rowMeta` since v1.1.

**Who is affected:** code that reads any of these fields. TypeScript does not warn about it, because `GridRowModel` has an index signature. Reading `params.row._hasChildren` type-checks as `unknown` and is simply `undefined` in v3.

**How to find it:**

```bash
grep -rnE "_(hasChildren|treeDepth|isExpanded|groupingField|groupingValue|descendantCount|isGroupRow)\b" src/
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

`rowMeta` also has `groupLabel`, the formatted label the grid shows for a group row, and (new) `isGroupFooter` for subtotal rows.

```tsx
import type { GridColDef } from '@opencorestack/opengridx';

// v2: undefined in v3
const nameV2: GridColDef = {
  field: 'name',
  renderCell: (params) => {
    const row = params.row as Record<string, unknown>;
    return row._hasChildren ? <strong>{params.formattedValue}</strong> : params.formattedValue;
  },
};

// v3
const name: GridColDef = {
  field: 'name',
  renderCell: (params) =>
    params.rowMeta?.hasChildren ? <strong>{params.formattedValue}</strong> : params.formattedValue,
};
```

`rowMeta` (and `formattedValue`) are passed to `renderCell`, `renderEditCell` and the function form of `cellClassName`.

**Tree data:** the parent rows the grid creates for missing path segments used to carry `_isGroupRow: true`. Use `params.rowMeta?.isGroupRow` to recognise them (see also [§14](#14-row-grouping-and-tree-data)).

---

## 4. params.row is now your own row object

**What changed:** because v2 copied every row to attach the underscore fields, `params.row` under row grouping or tree data was a **copy**. In v3 it is the **same object you passed in `rows`**, exactly as it is without grouping. This also stops rows being re-created on every render, so cells re-render less.

**Who is affected:** only code that **mutates** `params.row` (or the `row` passed to `valueGetter` / `valueFormatter`) while grouping or tree data is on. Those mutations used to land on a throwaway copy; now they change your data. Mutating row objects inside render callbacks was never supported, so this should be rare.

**How to find it:** search `renderCell`, `valueGetter` and `valueFormatter` bodies for `params.row.x =` or `row.x =`.

**Fix it:** don't mutate rows during render. Derive values instead, or update rows through state and `processRowUpdate`.

If you compare row objects by identity (`===`), grouped and flat rows now behave the same: the grid passes your objects through unchanged.

### Column definitions and value getters

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| Inline `columns` (a new array each render) | every render re-ran filtering and sorting | reused while the definitions are shallow-equal, so mutating a column object **in place** is not detected |
| Quick filter text | re-read every cell per keystroke | cached per row object, so a `valueGetter` must be pure (same row object, same result) |
| A `valueGetter` / `valueFormatter` that throws | crashed the grid once the column was sorted, filtered, aggregated, grouped, pivoted or shown in list view | the value reads as `undefined`, with a dev warning once per column |

**Fix it:** pass a new column object (or a new array with new objects) when a definition changes; keep `valueGetter` free of side effects and outside state, and replace a row object when its data changes.

---

## 5. Filtering

### Empty filter values no longer filter

**What changed:** a filter item whose value is empty (`undefined`, `null`, `''`, whitespace, `[]`) is now inactive, whatever the operator. Operators that take no value (`isEmpty`, `isNotEmpty`) still apply.

| Filter item | v2 | v3 |
| :--- | :--- | :--- |
| `{ operator: 'equals', value: null }` | kept only null cells | no filter |
| `{ operator: '=', value: '' }` | hid every row | no filter |
| `{ operator: '>', value: '' }` | meant `> 0` | no filter |
| `{ operator: 'contains', value: '' }` | hid null cells | no filter |
| `{ operator: 'isAnyOf', value: [] }` | hid every row | no filter |
| `{ operator: 'isAnyOf', value: 'a' }` (not an array) | matched nothing | treated as `['a']` |

**Fix it:** to match empty cells, use `isEmpty`, not an empty value.

### Numeric and date operators

| Case | v2 | v3 |
| :--- | :--- | :--- |
| blank / whitespace cell with `>`, `<`, `=` … | treated as `0` | empty: never matches |
| boolean cell with a numeric operator | `1` / `0` | never matches |
| `!=` and null / blank cells | `!= 0` excluded null | always included |
| `after` / `onOrAfter` / `before` / `onOrBefore` | ignored (every row passed, warning per row) | filter by date |
| `is` / `not` on `type: 'date'` | raw string comparison | local calendar day, for `Date`, ISO strings and epoch numbers |

`GridFilterOperator` gained `'='`, `'after'`, `'onOrAfter'`, `'before'` and `'onOrBefore'`. **Exhaustive `switch` statements over `GridFilterOperator` need the new cases.**

### Quick filter and toolbar search

| | v2 | v3 |
| :--- | :--- | :--- |
| What is searched | every value on the row: id, hidden columns, fields that are not columns | visible, filterable columns only |
| Value searched | raw value (objects as `[object Object]`, dates as `Date.toString()`) | `valueGetter` result formatted by `valueFormatter` (dates as `YYYY-MM-DD`; objects skipped) |
| Toolbar search `"north 2024"` | one phrase | two words, both must match (in any columns) |
| `renderQuickFilter` `value` | `quickFilterValues[0]` | all terms joined by spaces |
| Toolbar search and Filters button without a `filterModel` prop | did nothing unless you wired `onFilterModelChange` | filter the grid themselves |
| `initialState.filter` | ignored | applied |

**Who is affected:** apps that relied on searching hidden columns or ids. **Fix it:** to make a column searchable, it must be visible and `filterable` (the default). To search a value that is not shown, add a column for it.

### Filter panel

- Opening the panel no longer emits `onFilterModelChange` or rewrites values (an `isAnyOf` array used to become `"a,b"`).
- Editing a condition replaces it in place (it moved to the end) and no longer drops filter groups or other conditions on the same column.
- `singleSelect` columns get a select (multi-select for `isAnyOf`, which emits an array); typed option values are preserved. Boolean "Any" removes the item. Date columns get `<input type="date">`. Clearing a text value keeps the item with value `''`.
- The panel shows a note when the model has conditions it cannot display (nested groups).
- The row-grouping `__group__` column is always `filterable: false`; `groupingColDef` cannot override it.

---

## 6. Sorting

**What changed:** the comparator is type-aware and locale-aware.

| Case | v2 | v3 |
| :--- | :--- | :--- |
| numeric strings in `type: 'number'` | compared as text (`"10" < "9"`) | compared as numbers |
| date strings in `type: 'date'` | compared as text | parsed and compared as dates |
| text | code-point order | `Intl.Collator` with numeric collation: accents next to their base letter, `item9 < item10` |
| `NaN` / Invalid Date | broke the sort | sorted with nulls (last ascending, first descending) |
| mixed numbers and strings | undefined order | numbers first |
| `valueGetter` columns | not sortable | sort by the computed value |

Multi-sort:

| Action | v2 | v3 |
| :--- | :--- | :--- |
| Shift-click (or `multiSort`) on the primary sort column | moved it to the end | keeps its priority |
| Column menu **Unsort** | cleared every sort key | removes only that column |
| Column menu **Asc / Desc** on a sorted column, or with `multiSort` | replaced the model | keeps the other keys |
| Enter / Space on a header with `multiSort` or Shift | always replaced | appends, like a click |
| Header click that clears the sort of one column while several are sorted | cleared every sort key | removes only that column |
| `apiRef.current.sortColumn()` | did not update the grid | replaces the model like a header click (appends under `multiSort`) |

**Who is affected:** apps with snapshot tests of sorted output, or server code that expects the old client order.

**Fix it:** update the snapshots. There is no per-column comparator; to sort by a different key, return that key from a `valueGetter` and format it for display with `valueFormatter` (or sort on the server with `sortingMode="server"`):

```tsx
import type { GridColDef, GridRowModel } from '@opencorestack/opengridx';

interface Ticket extends GridRowModel { id: number; priority: 'low' | 'medium' | 'high' }

const RANK: Record<Ticket['priority'], number> = { low: 0, medium: 1, high: 2 };
const LABEL = ['low', 'medium', 'high'] as const;

const priority: GridColDef<Ticket> = {
  field: 'priority',
  type: 'number',
  valueGetter: ({ row }) => RANK[row.priority],
  valueFormatter: ({ value }) => LABEL[Number(value)] ?? '',
};
```

---

## 7. Keyboard, focus and ARIA

**What changed:**

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| Tab outside edit mode | moved between editable and system cells | **leaves the grid** in one press (Shift+Tab leaves backwards); focus returns to the last cell when you tab back in |
| Tab while editing | next editable cell | unchanged |
| Enter on a non-editable cell | nothing | on a row with children (group rows, tree-data parents): toggles expansion only, no `onRowClick` and no selection; on any other row: behaves like a click (`onRowClick`, click-to-select) |
| Enter on an editable cell | starts editing | unchanged |
| Header `focusedCell` (exported `Header` prop) | `{ id: 'HEADER', field }` | `{ id: null, field }` |
| Ctrl/Cmd+C | copied even when focus was outside the grid | only from a focused grid, never over a text selection |
| Focus ring on blur | stayed | hidden, but the focused cell is remembered |
| `Cell` / `Row` / `Header` components | moved DOM focus themselves | the grid owns focus (standalone users must focus cells themselves) |

New shortcuts: Shift+Space selects the focused row, Ctrl/Cmd+A selects all, Alt+ArrowRight / Alt+ArrowLeft expand and collapse, Alt+ArrowDown or Ctrl/Cmd+Enter opens a header's column menu, Alt+ArrowLeft / Alt+ArrowRight on a focused header resizes it.

Indices:

| Value | v2 | v3 |
| :--- | :--- | :--- |
| `colIndex` in `GridCellParams`, `renderCell`, `cellClassName`, `renderHeader`, `data-colindex` | relative to the rendered window (changed while scrolling horizontally) | absolute among visible data columns in render order, left-pinned first |
| `rowIndex` of bottom-pinned rows (`onRowClick`, `getDetailPanelContent`, `data-rowindex`, stripe class) | `0..n`, colliding with page rows | `topPinned + pageRows + i` |
| `aria-rowindex` | page-local; bottom-pinned rows restarted at 1 | global, 1 = header row, group rows counted |
| `aria-colindex` | window-relative | absolute, system columns counted |
| `aria-colcount` | all columns | visible columns, including `__group__` and pivot columns |
| `aria-sort` | every sorted column | the primary sort column only; others get an `aria-description` with their priority |

Also: the detail panel is `role="row"` > `role="gridcell"`; `ExpandIcon` has `tabIndex={-1}`; the `CellErrorBoundary` glyph is `role="img"` (was `status`); hierarchy rows get `aria-level` / `aria-expanded`; the grid gets `aria-multiselectable`.

**Who is affected:** apps (and end-user docs) that describe Tab navigation, apps with `onRowClick` handlers that must not fire from the keyboard, code that stores `colIndex` or `rowIndex`, and accessibility tests.

**How to find it:** `grep -rnE "colIndex|rowIndex|data-(col|row)index|aria-(row|col)index|['\"]HEADER['\"]" src/`

**Fix it:** key your logic on `field` and row `id`, not on indices. If you stored `colIndex` to look up a column, use `params.field`. Enter on an ordinary row now fires `onRowClick` like a click, so make that handler safe to run from the keyboard. On a tree-data parent, Enter only expands or collapses; it does not fire `onRowClick` or select the row (a mouse click on it does both).

---

## 8. Pagination

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| Client-side total | all stored rows, including pinned and filtered-out | filtered, unpinned rows |
| Current page after data shrinks | stale, empty page | last page, and `onPaginationModelChange({ ...model, page: last })` fires once |
| `rowCount` prop | read at mount only | read live; a `dataSource` response's `rowCount` wins |
| Default `pageSize` when 100 is not in `pageSizeOptions` | 100 (not in the list) | the first option |
| `pageSize` missing from `pageSizeOptions` | select showed a blank value | shown as an extra option |
| Rows-per-page select accessible name | hard-coded "Rows per page" | `localeText.paginationRowsPerPage` |
| `paginationMode="server"` (and server sort / filter) without a `dataSource` | the grid re-sliced / re-sorted / re-filtered your server page | rows are shown as given |
| `slots.footer` `rowCount` | page length | server total |
| `slots.footer` `rowCount` in a flat grid | included pinned rows | excludes pinned rows (under tree data or grouping it counts data rows) |
| `pagination` with `paginationMode="infinite"` | sliced rows | pager and slicing ignored |

**Who is affected:** controlled `paginationModel` users (you now receive a page correction and must adopt it), and server-paginated grids that relied on the grid's extra slicing.

**Fix it:** in controlled mode, always store the model passed to `onPaginationModelChange`:

```tsx
import { useState } from 'react';
import { DataGrid } from '@opencorestack/opengridx';
import type { GridColDef, GridPaginationModel, GridRowModel } from '@opencorestack/opengridx';

export function Orders({ rows, columns }: { rows: GridRowModel[]; columns: GridColDef[] }) {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 25 });
  return (
    <DataGrid
      rows={rows}
      columns={columns}
      pagination
      pageSizeOptions={[25, 50, 100]}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
    />
  );
}
```

---

## 9. Selection

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| Select-all checkbox | replaced the selection with every stored row, including filtered-out rows | adds the filtered rows; deselect removes only those |
| Header checkbox state | counted stale ids and group ids | reflects the filtered rows only |
| `disableMultipleRowSelection` | honoured by row click only | also caps checkboxes, Space and `apiRef`; removes the select-all checkbox |
| Rows removed from `rows` | their ids stayed selected | pruned; `onRowSelectionModelChange` fires once with the pruned model |
| An action that leaves the selection as it was (for example Ctrl/Cmd+A when every row is already selected, or `apiRef.current.selectRow(id, true)` on a selected row) | UI handlers fired `onRowSelectionModelChange` with an identical model | does not fire |
| `apiRef.current.selectRow(s)` with a synthetic id (group, subtotal, auto-parent, pivot Grand Total) or with no effect | selected it / fired | ignored; fires nothing |
| Clicking an already-selected row | deselected it and fired | unchanged: deselects it and fires |
| `apiRef.current.getSelectedRows()` inside `onRowSelectionModelChange` | previous selection | the new selection |
| Group rows | had a checkbox | no checkbox, never selected |
| Exported `Header` | always rendered select-all | renders it only when `onSelectAll` is passed |

Pruning applies when the grid owns the rows: no `dataSource`, client pagination and filtering, not pivot mode.

**Who is affected:** controlled `rowSelectionModel` users, and apps that expected select-all to include hidden rows.

**Fix it:** with a controlled model, adopt whatever `onRowSelectionModelChange` passes you (including the pruned model). If you need "select every row including filtered-out ones", set the model yourself from your data.

---

## 10. apiRef

**What changed:** in v2 several `apiRef` methods wrote to an internal store the grid did not render from. In v3 they drive the grid and fire the matching callbacks.

| Method | v2 | v3 |
| :--- | :--- | :--- |
| `sortColumn`, `setFilterModel`, `setPage`, `setPageSize`, `selectRow`, `selectRows` | no visible effect, no callbacks | change the grid and fire `onSortModelChange` / `onFilterModelChange` / `onPaginationModelChange` / `onRowSelectionModelChange` |
| `getSortModel`, `getFilterModel`, `getSelectedRows` | stale | live |
| `getVisibleRows`, `getAllFilteredRows` | excluded pinned rows | include pinned rows |
| `getAllFilteredRows` under grouping / tree data | the visible hierarchy, including group rows | every filtered data row, in fully expanded order |
| `getAllFilteredRows` under tree data with a filter | — | only the rows that match (not their unmatched ancestors); follows screen order when sorting by the hierarchy column |
| `getVisibleColumns` | included hidden columns, definition order | visible columns in render order: left-pinned, unpinned, right-pinned |
| `getGroupedExportRows` | dropped collapsed groups' rows, ignored sort and filter | includes collapsed groups, follows sort and filter, subtotals over exported rows |
| `getAggregationModel` | the internal object | a content-equal copy |
| `copySelectedRows` | resolved and logged on failure | rejects (see [§19](#19-clipboard)) |
| `useGridApiRef().current` before mount | `null` | a no-op API; the live API is installed in a layout effect |

**Who is affected:** apps that call a setter and then also update their own state "because the grid ignored it". With a controlled prop, the setter now fires your change callback, so both paths run.

**How to find it:** `grep -rnE "apiRef\.current[?!]?\.(sortColumn|setFilterModel|setPage|setPageSize|selectRows?|getAllFilteredRows|getVisibleRows|getVisibleColumns)" src/`

**Fix it:** call the setter and let your change callback update controlled state; remove duplicate `setState` calls.

> **3.0.1 note — typed row getters.** `useGridApiRef<MyRow>()` returns a `GridApi<MyRow>` whose `getRow`, `getAllRows`, `getVisibleRows` and `getAllFilteredRows` return `MyRow`, so the casts v2 needed can go. `useGridApiRef()` without a type argument and `DataGridProps.apiRef` with an untyped ref still compile.

---

## 11. Editing

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| `isCellEditable` | only decided Tab stops | also governs double-click, Enter and `aria-readonly`; returning `true` for a column without `editable` no longer makes it a Tab stop |
| Row-grouping group rows, auto-created tree parents | Enter opened an editor whose value was discarded | not editable |
| Tree-data parent rows | Enter only | Enter and double-click |
| `processRowUpdate` per commit | sometimes twice (Tab; Enter then blur) | exactly once |
| Edit when the cell unmounts (scroll, filter, page) or another edit starts | dropped | committed: `processRowUpdate` is called |
| Synchronous `processRowUpdate` result | applied after a microtask | applied in the same event |
| `processRowUpdate` returns a non-object | `TypeError` about `.id` | `onProcessRowUpdateError` receives an `Error` whose message starts with `[OpenGridX] processRowUpdate must return the updated row object (or a Promise of it)`; the editor stays open |
| `singleSelect` editor commit | option value as a string (`"2"`) | the original option value (`2`, or the object) |
| `date` editor on `Date` cells | opened blank, committed `'YYYY-MM-DD'` | shows the date, commits a `Date`; ISO datetimes keep their time; clearing commits `null` (was `''`) |
| `boolean` editor | committed on `setTimeout(0)`, stayed open on blur | commits synchronously and on blur |
| Enter during IME composition | committed | ignored |
| `onRowDoubleClick` on editable cells | suppressed | fires for the double-click that opens the editor (not inside an open editor) |
| `onCellClick` / `onRowClick` for clicks inside an editor | fired | do not fire |
| Focus after commit | always refocused the grid viewport | refocuses the grid only if focus was lost to `<body>` |
| `valueGetter` + `editable` without `valueSetter` | wrote `row[field]` silently | still writes `row[field]`, with a dev warning once per column |

**Who is affected:** anyone with `processRowUpdate` that has side effects (API calls): it now also runs for edits that used to be lost, so make sure it is safe to call when the user scrolls away. Apps with string-parsing workarounds for `singleSelect` or date values.

**How to find it:** `grep -rnE "processRowUpdate|isCellEditable|renderEditCell|Number\(newRow|parseInt\(newRow" src/`

**Fix it:** remove value-type workarounds, and add a `valueSetter` for editable computed columns:

```tsx
import type { GridColDef, GridRowModel } from '@opencorestack/opengridx';

interface Person extends GridRowModel { id: number; first: string; last: string }

const fullName: GridColDef<Person> = {
  field: 'fullName',
  editable: true,
  valueGetter: ({ row }) => `${row.first} ${row.last}`,
  valueSetter: ({ value, row }) => {
    const [first = '', ...rest] = String(value ?? '').split(' ');
    return { ...row, first, last: rest.join(' ') };
  },
};
```

Custom editors now get callbacks, so they no longer need to reach into grid internals:

```tsx
import type { GridColDef } from '@opencorestack/opengridx';

const notes: GridColDef = {
  field: 'notes',
  editable: true,
  renderEditCell: ({ value, onValueChange, onCommit, onCancel }) => (
    <textarea
      aria-label="Notes"
      value={String(value ?? '')}
      onChange={(e) => onValueChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) onCommit();
        if (e.key === 'Escape') onCancel();
      }}
    />
  ),
};
```

The type of `renderEditCell`'s parameter is now `GridRenderEditCellParams`, a superset of `GridRenderCellParams`, so existing editors still type-check.

For the exported `Cell` / `Row` components: `Cell.onEditStop` gains an optional second argument `field`; `Cell` no longer stops propagation of the double-click that starts an edit (so it reaches the row and `onRowDoubleClick`); `Row.onEditStop` params gain optional `id` / `field`; new optional `Row.isCellEditable`; pinned rows report `aria-readonly`. See [§25](#25-typing-changes) for the type-level details.

---

## 12. Exports

### Grouped export labels match the grid

In v2, group-header labels differed between export formats: `exportToExcelAdvanced` used the column's `groupingValueFormatter`, falling back to `"Header: value"` (the column's `headerName`), while CSV, basic Excel, JSON, print and PDF ignored `groupingValueFormatter` and always wrote `"field: value"`.

In v3 every format writes the label the grid shows. They use, in order:

1. the entry's `groupLabel`, which `apiRef.current.getGroupedExportRows()` now sets from the grid's own label;
2. otherwise the grouping column's `groupingValueFormatter`;
3. otherwise `"field: value"`, the grid's documented default.

**Who is affected:** `exportToExcelAdvanced` users grouping by a column **without** a `groupingValueFormatter` (headers change from `Department: Engineering` to `dept: Engineering`), and CSV / basic Excel / JSON / print / PDF users grouping by a column **with** one (headers now use the formatter).

**Fix it:** set `groupingValueFormatter` on the grouping column. It then applies in the grid and in every export format:

```tsx
import type { GridColDef } from '@opencorestack/opengridx';

const dept: GridColDef = {
  field: 'dept',
  headerName: 'Department',
  groupingValueFormatter: ({ value }) => `Department: ${String(value)}`,
};
```

### File contents

| Change | v2 | v3 | Opt out / fix |
| :--- | :--- | :--- | :--- |
| CSV byte-order mark | none | starts with `EF BB BF` | `bom: false` |
| Text starting with `=` `+` `-` `@` tab or CR (CSV, basic Excel) | written raw | prefixed with `'` (`-abc` → `'-abc`; negative numbers unchanged) | `escapeFormulas: false` |
| Non-empty `selectedRows` together with `groupedRows` | exported every grouped row | exports only the selection, flat | pass `selectedRows: []` to export grouped |
| `selectedRows` with `aggregationResult` / `aggregationModel` | totals over all rows | totals recomputed over the selection | pre-filter rows yourself to keep your own totals |
| `valueFormatter` for `null` / `undefined` | skipped (empty cell) | called; its placeholder is exported | return `''` for empty values |
| `count` / `unique` totals | ran the column formatter (`$2.00`) | plain numbers (`2`) | — |
| Aggregate formatter `row` argument | `{}` | the record of aggregated values | — |
| Date `min` / `max` into the formatter | epoch ms | `Date` | — |
| Throwing formatter on a total | export threw | falls back to the default format | — |
| First column with an aggregate | label replaced the value | `Subtotal: 300`, `Grand Total: …`, PDF `TOTAL: 30` | — |
| `isSpacer` columns | exported | excluded everywhere | — |
| Grid system columns passed in `columns` (`__checkbox_col__`, `__expand_col__`, `__reorder_col__`, `__group__`) | exported unless `exportable: false` | always excluded (grouped exports write labels from `groupedRows`) | — |
| Type-based default formatting | none | see [§1](#1-cells-are-formatted-by-column-type) | add a `valueFormatter` |

### Format-specific changes

| Function | Change |
| :--- | :--- |
| `exportToExcel` | A `.xlsx` file name downloads as `.xls` with a warning (the file is HTML; Excel refuses it as `.xlsx`). Sheet names are sanitised (`\ / ? * : [ ]` → `-`, 31 characters). Text cells are marked as text, so `00501` keeps its leading zeros. |
| `exportToJson` | Flat `aggregation.values` are raw numbers (were locale strings like `"8,320,000"`). Grouped subtotals and grand total contain only exported columns. |
| `printGrid` | Image URLs other than `http(s)`, `data:image`, `blob:` and relative are printed as text; missing alt text falls back to the field name (was `"undefined"`). |
| `exportToExcelAdvanced` | Dates carry the local wall-clock date (east of UTC they showed the previous day). ISO strings and epoch numbers in date columns become date cells; numeric strings in number columns become numbers; `'true'` / `'false'` in boolean columns become booleans; NaN / Infinity / Invalid Date become empty cells; objects become JSON text (formula / hyperlink objects are no longer live). |
| `exportToExcelAdvanced` | Default `numFmt` is `#,##0` for integers and `#,##0.##` otherwise; number columns get no column-level `numFmt`; `count` / `unique` use `#,##0`; `includeSummary` and the summary sheet are numeric. |
| `exportToExcelAdvanced` | `rows: 'selected'` with no selection writes a header-only sheet (was all rows), and its `includeSummary` is recomputed over the selection. Invalid or duplicate sheet names are sanitised (`X-Y`, `Data (2)`) instead of throwing. `embedImage` reads the URL after `valueGetter`; SVG / WebP / AVIF write the URL as text (were broken `.png`). |
| `exportToPdf` | Characters outside WinAnsi print as `?` with a console warning; pass `font` (a Unicode `.ttf`, base64) to print them. U+202F / U+2212 become a space / `-`. The filter line joins with ` AND ` / ` OR ` (was ` • `), shows groups and the search, skips value-less rules. An invalid `headerTextColor` falls back to white (was indigo). Title and filter line wrap. A custom `JsPDF` must provide `splitTextToSize`, `addFileToVFS` and `addFont`. |

**Who is affected:** anything that parses exported files: importers, diff-based tests, scripts that read CSV without handling a BOM, and workflows that open basic Excel exports under a `.xlsx` name.

**How to find it:** `grep -rnE "exportTo(Csv|Excel|ExcelAdvanced|Json|Pdf)|printGrid" src/`

**Fix it:** strip the BOM in CSV parsers (or pass `bom: false`), pass `getRowId` with `selectedRows` ([§2](#2-getrowid-no-longer-writes-an-id-onto-rows)), rename `.xlsx` to `.xls` for `exportToExcel` (or use `exportToExcelAdvanced` for real `.xlsx`):

```tsx
import { exportToCsv, exportToExcel } from '@opencorestack/opengridx';
import type { GridColDef, GridRowModel } from '@opencorestack/opengridx';

function exportAll(rows: GridRowModel[], columns: GridColDef[]): void {
  exportToCsv(rows, columns, { fileName: 'orders.csv', bom: false, escapeFormulas: true });
  exportToExcel(rows, columns, { fileName: 'orders.xls' });
}
```

---

## 13. Aggregation values

| Case | v2 | v3 |
| :--- | :--- | :--- |
| Blank strings, booleans, arrays in `sum` / `avg` / `min` / `max` | counted as 0 (`avg([10, '', 20])` = 10; `sum` over a boolean column = count of `true`) | ignored (`avg` = 15; boolean `sum` = 0) |
| `count` / `unique` | counted `''` and whitespace-only strings | skip them |
| `min` / `max` over dates | epoch ms | `Date`, in `getAggregationResult()`, group-row `aggregatedValues`, `getGroupedExportRows()`, pivot cells and `usePivot` rows |
| `valueGetter` columns | aggregated `row[field]` (usually 0) | aggregate the computed value |
| `aggregable: false` with a model entry | summed anyway | ignored (footer, group rows, pivot, exports) |
| Footer `sum` / `avg` / `min` / `max` text | `formatAggregationValue` | the column's `valueFormatter` (with `row` = the aggregation result); falls back if it throws |
| Group rows: `count` / `unique` | ran the column formatter (`$2.00`) | plain (`2`) |
| Group rows: aggregated column without formatter | `3000` | locale number `3,000` |
| Under grouping: footer totals | aggregated the visible rows (double-counted expanded groups) | the filtered data rows, independent of expansion |
| Server-driven footer (infinite mode, `filterMode="server"` only) | summed the loaded rows | server totals, or `—` |
| Server totals while a new `getAggregations` is pending or after it failed | previous result | `{}` (shown as `—`); `isLoading` / `error` follow the current request |

**Who is affected:** apps that display or test totals, and code that treats `min` / `max` results as numbers.

**How to find it:** `grep -rnE "getAggregationResult|aggregationModel|aggregatedValues" src/`

**Fix it:** handle `Date` results:

```ts
function toTimestamp(value: unknown): number | null {
  if (value instanceof Date) return value.getTime();
  return typeof value === 'number' ? value : null;
}
```

If you want blanks counted as zero, store `0` in the data or compute the value in a `valueGetter`.

---

## 14. Row grouping and tree data

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| `renderCell` for synthetic rows (group rows, subtotal rows, auto-created tree parents) | not called | called; return `undefined` to keep the default rendering |
| Click on a real tree-data parent row | toggled expansion | selects the row and fires `onRowClick` (the chevron, Enter and Alt+Arrow keys expand) |
| Click on a row-grouping group row | toggled | unchanged; does not fire `onRowClick` |
| Auto-created tree parent row object | carried the segment name | `{ id }` only; use `rowMeta.groupLabel` for the label |
| Subtotals, "(n)" count, `descendantCount` | counted filtered-out rows | only rows that pass the filter; groups left empty are hidden; tree `descendantCount` is recursive |
| `getAggregationPosition` | ignored | honoured; called for each group and once with `null` for the grand total (return `null` for it to hide the footer) |
| Group row ids for non-string values | `auto-group-<field>-<String(value)>-<parent>` | the value part is a typed key (`\u001fnumber:1`, `\u001fnull`, `\u001fdate:<ms>`), so `1` and `'1'` are different groups; string values unchanged |
| Tree auto-parent ids | `auto-group-a/b` | `auto-group-["a","b"]` (JSON path, so segments may contain `/`) |
| Group rows | had a checkbox, could get a detail panel | no checkbox, no detail panel, not editable |
| `treeData` without `getTreeDataPath` | undefined behaviour | rows shown flat |
| `pinnedRows` under tree data or grouping | vanished, leaving a gap | stay in the hierarchy, with a dev warning |
| Server `sortingMode` / `filterMode` | the hierarchy still filtered and sorted client-side | not re-filtered or re-sorted |
| `groupingColDef` under `treeData` | ignored | adds the pinned `__group__` column, which takes the hierarchy toggle |
| Row grouping with a `paginationMode="server"` `dataSource` | grouped only the first page | one request for `[0, Number.MAX_SAFE_INTEGER)`, with a dev warning; make sure your server can return every row |

**Who is affected:** apps with custom `renderCell` that assume it only runs for data rows, apps that parse group ids, and apps whose tree parents were expected to expand on click.

**How to find it:** `grep -rnE "auto-group-|getAggregationPosition|isGroupRow" src/`

**Fix it:** guard `renderCell`, and never parse ids; use `rowMeta`:

```tsx
import type { GridColDef } from '@opencorestack/opengridx';

const amount: GridColDef = {
  field: 'amount',
  renderCell: (params) => {
    if (params.rowMeta?.isGroupRow) return undefined; // keep the grid's group rendering
    return <span className="amount">{params.formattedValue}</span>;
  },
};

const groupKey = (meta: { groupingField?: string; groupingValue?: unknown } | undefined) =>
  meta ? `${meta.groupingField ?? ''}=${String(meta.groupingValue)}` : null;
```

Make `getAggregationPosition` handle `null`:

```tsx
import type { GridTreeNode } from '@opencorestack/opengridx';

const getAggregationPosition = (node: GridTreeNode | null): 'inline' | 'footer' | null =>
  node === null ? 'footer' : node.isExpanded ? 'footer' : 'inline';
```

Keep `getTreeDataPath` stable (module scope or `useCallback`); a new function rebuilds the tree.

---

## 15. Server-side data and infinite scroll

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| `dataSource` with every mode `'client'` | `getRows` never called | called once with `{ startRow: 0, endRow: Number.MAX_SAFE_INTEGER }` |
| Server sort / filter with client pagination | refetched per page, showed one page | all rows requested once; page changes do not refetch |
| Infinite scroll request range | `[page * pageSize, page * pageSize + pageSize)` (could skip rows) | `[rows loaded so far, (page + 1) * pageSize)` |
| Infinite scroll after sort / filter / `pageSize` / `dataSource` change | continued from the current page | restarts at row 0 and fires `onPaginationModelChange({ ...model, page: 0 })` |
| Tree children request | `endRow: -1` | `endRow: Number.MAX_SAFE_INTEGER`, plus `aggregationModel` |
| Server tree with `defaultGroupingExpansionDepth` | lazy nodes stayed collapsed | nodes to that depth auto-expand and load, one request per node (`-1` expands everything, which can mean many requests) |
| Tree children request fails | error overlay covered the grid | node collapses, error logged |
| Retry button | `window.location.reload()` | re-runs `getRows`; hidden without a `dataSource` |
| When a refetch happens | any new object identity (`filterModel`, `sortModel`, `aggregationModel`, `dataSource`) | a new `getRows` function or changed content |
| `loading` / `aria-busy` | after the 300 ms debounce | from the moment a request is scheduled |
| Live-region error fallback | `Error: Unknown error` | `Error: An unexpected error occurred while loading the data.` |
| Inline `rows={[]}` next to a `dataSource` | wiped fetched rows | ignored |

**Who is affected:** every `getRows` implementation that validates `startRow` / `endRow`, treats `endRow: -1` as "all", or assumes page-aligned requests.

**How to find it:** `grep -rnE "getRows|endRow|startRow|paginationMode[=:{ ]*['\"]infinite" src/`

**Fix it:** slice by the requested range, whatever it is:

```ts
import type { GridGetRowsParams, GridGetRowsResponse, GridRowModel } from '@opencorestack/opengridx';

async function getRows(params: GridGetRowsParams): Promise<GridGetRowsResponse> {
  const all: GridRowModel[] = await fetchSortedFiltered(params); // your server call
  const end = Math.min(params.endRow, all.length);
  return { rows: all.slice(params.startRow, end), rowCount: all.length };
}

declare function fetchSortedFiltered(params: GridGetRowsParams): Promise<GridRowModel[]>;
```

Keep `getRows` stable (`useCallback` or module scope) if you do not want a refetch.

---

## 16. Layout and pinning

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| Pinned column order | cells in column order, offsets in pinned order (overlaps) | `pinnedColumns.left` / `.right` order; the column menu appends, so the most recently pinned column sits next to the scrolling area |
| Pinned `'30%'` / `'auto'` / `flex` / no width | 100px | sized like unpinned columns |
| Fixed or resized widths outside `minWidth` / `maxWidth` | layout used the raw width, CSS clamped only the cell | layout clamps |
| Several `%` columns | cascaded | share the width left after fixed-width columns |
| `getDetailPanelHeight` returns `0` | 200px | 0px |
| `getDetailPanelHeight` returns `'auto'` | 200px | measured height |
| Detail height without `getDetailPanelHeight` | 200px (docs said `'auto'`) | 200px (docs corrected) |
| Detail callbacks | called for every rendered row, including group rows | only for expanded data rows; group-row ids in `detailPanelExpandedRowIds` are ignored |
| `onRowsScrollEnd` | fired on every scroll event near the bottom (including horizontal), never for a short list | once per arrival; re-armed when you leave the zone or `rowCount` changes; also fires after mount or a rows change when the end is already in view |
| Sticky header and pinned rows | `.ogx__pinned-rows--top` / `--bottom` were sticky | wrapped in `div.ogx__sticky-top` / `div.ogx__sticky-bottom` (see [§24](#24-dom-and-css-class-changes)) |
| z-index of sticky body system cells | 4 / 5 / 11 | 12; header drag / expand cells have no inline z-index |
| Returning from list view | scroll reset | scroll position restored |
| Right-pinned columns when columns are narrower than the grid | followed the last unpinned column | at the grid's right edge (3.0.1; free space sits before the right-pinned section) |
| No `height` prop | auto height (3.0.0) | fills the container, `ogx--fill` (3.0.1; see [Before you start](#import-the-stylesheet)) |

**Who is affected:** apps with `onRowsScrollEnd` loaders that relied on repeated firing, apps with custom z-index or sticky CSS, and apps whose pinned columns were pinned out of column order.

**How to find it:** `grep -rnE "pinnedColumns|onRowsScrollEnd|getDetailPanelHeight|ogx__pinned-rows" src/`

**Fix it:** list pinned fields in the order you want them on screen; guard `onRowsScrollEnd` loaders against concurrent calls rather than relying on repeat events.

```tsx
import { DataGrid } from '@opencorestack/opengridx';
import type { GridColDef, GridRowModel } from '@opencorestack/opengridx';

export function Pinned({ rows, columns }: { rows: GridRowModel[]; columns: GridColDef[] }) {
  // Left to right on screen: id, then name.
  return <DataGrid rows={rows} columns={columns} pinnedColumns={{ left: ['id', 'name'], right: ['actions'] }} />;
}
```

---

## 17. Row and column reordering and resizing

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| `onRowOrderChange` `oldIndex` / `targetIndex` | page-local, in sorted / filtered order, pinned rows excluded | positions in your `rows` prop |
| Group rows, auto-created tree parents | draggable | not draggable or droppable |
| Pinned rows with `rowReordering` | no handle cell (misaligned) | empty `.ogx__cell--drag-handle` (`draggable=false`) |
| `rowReordering` in pivot mode | handles shown | no effect |
| `onColumnOrderChange` indices | varied by path | positions in the full current column order (hidden columns and `__group__` included) |
| Keeping a controlled `columnOrder` in sync | `onColumnOrderChange` only | use the new `onColumnOrderModelChange(columnOrder)` |
| Columns panel **Reset** | fired `onColumnOrderChange` (or nothing) | fires `onColumnOrderModelChange` |
| Pinned headers | draggable, drop targets | neither |
| `pinnable: false` | also blocked drag-reorder | only blocks pinning |
| `disableColumnReorder` + `columnOrder` | order ignored | order applied |
| Resize limits | 50–1000px | `minWidth ?? 50` (never above the current width), no maximum unless `maxWidth` |
| Click on the resize handle without moving | resized / sorted | nothing |
| Resize events | mouse events on `document` | pointer events with capture on the handle (touch and pen work) |
| Right-pinned column resize | right edge | left edge (`ogx-column-resize-handle--start`); drag left to widen |
| Resize handle position | straddled the cell border (`right: -4px`); half was clipped, 3–4px grabbable | inside its own header cell against the resizing edge (`right: 0` / `left: 0`), all 8px grabbable (3.0.1) |
| `dragstart` data types | `text/plain` | `application/x-ogx-row` / `application/x-ogx-column` plus `text/plain` |
| Toolbar, pivot and standalone panels | portal mounted in render | mounted one layout effect later (invisible to users; matters for tests) |

**Who is affected:** apps that added page offsets to `onRowOrderChange` indices, apps with a controlled `columnOrder`, and tests that simulate resizing with mouse events.

**How to find it:** `grep -rnE "onRowOrderChange|onColumnOrderChange|columnOrder=|mousedown|fireEvent\.mouse(Down|Move|Up)" src/`

**Fix it:** remove page-offset workarounds, and switch controlled column order to the model callback:

```tsx
import { useState } from 'react';
import { DataGrid } from '@opencorestack/opengridx';
import type { GridColDef, GridColumnOrder, GridRowModel, GridRowOrderChangeParams } from '@opencorestack/opengridx';

export function Reorderable({ initialRows, columns }: { initialRows: GridRowModel[]; columns: GridColDef[] }) {
  const [rows, setRows] = useState(initialRows);
  const [columnOrder, setColumnOrder] = useState<GridColumnOrder>(columns.map((c) => c.field));

  const onRowOrderChange = ({ oldIndex, targetIndex }: GridRowOrderChangeParams) => {
    setRows((prev) => {
      const next = [...prev];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      rowReordering
      onRowOrderChange={onRowOrderChange}
      columnOrder={columnOrder}
      onColumnOrderModelChange={setColumnOrder}
    />
  );
}
```

In tests, resize with `fireEvent.pointerDown` / `pointerMove` / `pointerUp` on the handle instead of mouse events.

---

## 18. Toolbar, buttons and UI components

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| Grid buttons and the exported `Button` | default `type="submit"`: clicking a toolbar or pager button inside a `<form>` submitted it | `type="button"`; pass `type="submit"` explicitly |
| Exported `Checkbox` | added `aria-label` "Select" / "Deselect" / "Select some" | no default label; pass `label` or `aria-label` |
| `GridTooltip` | rendered into `document.body`, `position: absolute` | renders into `.ogx-theme-provider`, `position: fixed`, opens on focus, child gets `aria-describedby` |
| Column menu | offered Hide on `hideable: false`, pinning on `pinnable: false` | omits them |
| Manage columns with a custom `slots.toolbar` that does not render `GridToolbar` | did nothing | opens a standalone panel |
| `onColumnsPanelClose` | fired only on click outside | fires on every close (Escape, button) |
| Standalone `GridToolbar` without `onAggregationModelChange` | showed Summaries | hides it; pills include `unique` and respect `availableAggregationFunctions` |
| Toolbar triggers | no popup ARIA | `aria-haspopup="dialog"`, `aria-expanded` |
| `loading` with rows present | nothing shown | progress bar (or `slots.loadingOverlay`) over the rows |

**Who is affected:** apps with a form around the grid that relied on a grid button submitting it (unlikely; the usual symptom was accidental submits), apps using the exported `Checkbox` without a label, and CSS or tests that look for tooltips under `body`.

**How to find it:** `grep -rnE "<(Button|Checkbox|GridTooltip)\b" src/`

**Fix it:**

```tsx
import { Button, Checkbox } from '@opencorestack/opengridx';

export function Actions({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <>
      <Checkbox checked={checked} onChange={onToggle} aria-label="Select order" />
      <Button type="submit">Save</Button>
    </>
  );
}
```

---

## 19. Clipboard

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| `apiRef.current.copySelectedRows()` on failure | resolved, logged | **rejects**; Ctrl+C still only logs |
| Copied columns | every column definition, in definition order, hidden included | visible columns in screen order (left-pinned first); `exportable: false` dropped |
| Copied rows | selected rows on the current page, in expanded groups | every selected row that passes the filter (other pages, pinned rows, collapsed groups) |
| Values with tab, newline, CR or `"` | raw | wrapped in quotes, inner quotes doubled |
| Fields starting with `__` | dropped | copied, unless system or `exportable: false` |
| `valueGetter` columns | copied `row[field]` | copied the getter value; `valueFormatter` is called for null / undefined (a throw gives an empty cell) |
| `execCommand` fallback | ran on every copy | only when `navigator.clipboard` is missing or rejects |
| Ctrl+C already `preventDefault`ed by your handler | copied anyway | left alone |
| Formulas | not neutralised | still not neutralised (copying is not a file export) |

New: `disableClipboardCopy` turns off the Ctrl/Cmd+C handler (the `apiRef` method still works).

**Fix it:**

```ts
import type { GridApi } from '@opencorestack/opengridx';

async function copy(api: GridApi): Promise<boolean> {
  try {
    await api.copySelectedRows();
    return true;
  } catch {
    return false; // clipboard permission denied or unavailable
  }
}
```

---

## 20. Theming

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| `DataGridThemeProvider` palette | partly followed the OS colour scheme (`darkTheme` in a light browser was unreadable) | pins a complete palette chosen by `GridTheme.mode` (`'light'` default), whatever the OS |
| Brand presets / `colors.primary` | did not recolour toolbar, filter panel, column menu, selection, focus | recolour them |
| `grid.rowHeightStandard` / `rowHeightCompact` / `rowHeightComfortable` / `headerHeight` | no effect | size rows and header (props `rowHeight` / `headerHeight` still win); `compactTheme` gives 36px rows, 40px header, 12px text |
| `toolbar.*`, `scrollbar.*`, `overlays.itemDanger*`, `grid.cellFocusBorder` | no effect | applied |
| Provider toolbar colours | fixed | follow `grid.headerBackground` / `headerText` / `borderColor` unless `toolbar.*` is set |
| `darkTheme` toolbar | transparent | `#1e293b`, hover `#334155` |
| Expanded, unfocused quick search | no border | input border (primary only while focused) |
| Accent colours | fixed colours | CSS `color-mix()`: Chrome 111+, Safari 16.2+, Firefox 113+ |
| `skeleton.darkBaseColor` / `darkHighlightColor` | typed, no effect | removed |

**Who is affected:** apps that wrap the grid in `DataGridThemeProvider` and expected it to switch with the OS, apps using `compactTheme` (rows get shorter), and apps that must support browsers older than the versions above.

**How to find it:** `grep -rnE "DataGridThemeProvider|compactTheme|darkBaseColor|darkHighlightColor" src/`

**Fix it:** pick the theme yourself from the colour scheme, and delete the removed skeleton keys:

```tsx
import { useSyncExternalStore, type ReactNode } from 'react';
import { DataGridThemeProvider, darkTheme } from '@opencorestack/opengridx';
import type { GridTheme } from '@opencorestack/opengridx';

const query = '(prefers-color-scheme: dark)';
const subscribe = (cb: () => void) => {
  const mql = window.matchMedia(query);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};
const lightTheme: GridTheme = { mode: 'light' };

export function ThemedGrid({ children }: { children: ReactNode }) {
  const dark = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
  return <DataGridThemeProvider theme={dark ? darkTheme : lightTheme}>{children}</DataGridThemeProvider>;
}
```

---

## 21. Pivot mode

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| Pivot row ids | `0`, `1`, `2` … (collided with source row ids) | `__pivot_row__:["North"]` (JSON of the row-field values) |
| Filters and quick filter | applied to pivot rows | source-column filters and the quick filter apply to source rows (quick filter searches all filterable source columns); filters on generated value columns apply to pivot rows; OR across both kinds acts like AND |
| Grand Total row | could move when sorting, was selected by select-all | always last, never selectable (click, select-all, `apiRef`); absent when there are no rows |
| `getRowId` | applied to pivot rows (collapsed them into one) | ignored for pivot rows |
| `treeData` / `rowGroupingModel` | crashed or regrouped | turned off while pivoting, with a dev warning |
| `dataSource` | broken output | pivot ignored, with a dev warning |
| `getAggregationResult()` / `slots.footer` | totals over pivot rows | `null` |
| Empty result | columns disappeared | value columns stay; no-rows overlay shows |
| Row-label columns | lost formatter / renderer / type / alignment; hidden with their source | keep them; `hideable: false`; ignore `columnVisibilityModel` |
| Column keys | text order | natural order (numbers numerically); header labels formatted; a blank group label is `null` |
| Column order | controlled `columnOrder` could put value columns first | pivot columns have their own order; a controlled `columnOrder` is ignored for them; leaving pivot restores your order |
| `groupable: false` / `aggregable: false` fields | used | skipped as row / column fields and as values; PivotPanel does not offer them |
| Default `avg` format | raw | locale-grouped (`56,666.67`) |

`usePivot`: `UsePivotReturn` is now a type alias with the same shape; `pivotRows` has no Grand Total when there are no rows.

**Who is affected:** apps that store pivot row ids or rely on selection in pivot mode. **Fix it:** do not persist pivot row ids across pivot model changes; read the row-field values from the row instead.

---

## 22. Cell spanning and column groups

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| Hidden columns inside a `colSpan` | counted (width, `aria-colspan`, next visible column shifted) | skipped: the span covers the next visible columns |
| `colSpan` next to a pinned column | could cover a column in another section | clamped to its own pinned section |
| `rowSpan` across pinned and scrolling rows | crossed | clamped to its row section and to the first row with an expanded detail panel |
| `rowSpan` at group boundaries | could start on or cross group, subtotal, auto-parent and pivot Grand Total rows | stops at them |
| `colSpan` `params.value` / `params.colIndex` | raw `row[field]`; index counted system columns in unpinned order | `valueGetter` result; rendered data-column index, left-pinned first (same as `renderCell`) |
| Span values `1.5` / `Infinity` / `NaN` | fractional ARIA / hang | `1` / to the end / no span |
| Throwing span callback | unmounted the grid | span 1 for that cell, dev warning |
| `colSpan` + `rowSpan` | only the origin column hidden in following rows | the whole rectangle is covered |
| Merged cell width | capped by the origin column's `min/maxWidth` | not capped |
| Render window | spans crossing the window edge were cut | extra rows / columns rendered so spans stay intact |
| Column group header rows | did not follow widths, hiding, reordering, pinning | follow the rendered columns; a split group shows one labelled cell per run |
| Header drag-reorder with `columnGroupingModel` | disabled for every column | allowed within the same innermost group; toolbar and Columns panel get the same restriction |
| Keyboard | focus lost on covered cells | ArrowRight / ArrowDown from a span origin skip covered cells; moving into a covered cell focuses the origin |
| `GridColumnGroup.headerClassName` | ignored (documented as a background colour) | CSS class added to the group's header cells |

CSS: `.ogx-col-group-row` no longer has `overflow: hidden`; new `ogx-col-group-cell--pinned`, `--pinned-left`, `--pinned-right`; filler cells lost `role="columnheader"`; `aria-rowcount` includes the group depth. The unexported `ColumnGroupHeader` component was deleted.

**Who is affected:** apps whose span callbacks count on hidden columns or read `params.colIndex`. **Fix it:** compute spans from `params.field` and `params.value`.

---

## 23. List view

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| `renderCell` params | `value` undefined; no `formattedValue` / `rowMeta`; `colDef` was `{ field }` | real values, `formattedValue`, `rowMeta` and the column definition |
| `slots.footer` | not rendered | rendered, replaces the list pagination |
| `loading`, `slots.loadingOverlay`, `slots.noRowsOverlay` | ignored; "No Data" while loading | honoured |
| `listView` without `listViewColumn` | empty | falls back to the grid, with a dev warning |
| Row checkboxes | Tab stops | not Tab stops; rows are focusable, arrow keys move between rows, Shift+Space selects |
| Empty state | `role="status"` | no `role="status"` |
| `aria-rowindex` / `aria-rowcount` | restarted at 2 every page / page size | absolute / total |
| Tree data and grouping | no expand control | expand chevron and depth indent (`.ogx-list-view__expand`) |
| Summary and paging with a `dataSource` | loaded rows | server total |
| `onRowsScrollEnd` | never fired | fires once per arrival at the bottom, like the grid view |
| Large lists | not virtualized | still not virtualized; 3.0.1 warns in development above 2,000 rendered items — use pagination |
| Tab in Firefox | — | lands on the focused row, not the rows container (3.0.1, `tabIndex={-1}` on `.ogx-list-view__rows`) |

---

## 24. DOM and CSS class changes

`ogx__*` / `ogx-*` class names and the grid's DOM structure are public API: consumers style and test against them. These changed in 3.0.0.

### Structure

| Change | v2 | v3 | Action |
| :--- | :--- | :--- | :--- |
| Sticky header and top-pinned rows | `.ogx__pinned-rows--top` was sticky | header + top-pinned rows inside `div.ogx__sticky-top` | move `position` / `top` / `z-index` rules to `.ogx__sticky-top` |
| Bottom-pinned rows and aggregation footer | `.ogx__pinned-rows--bottom` was sticky | inside `div.ogx__sticky-bottom` | move rules to `.ogx__sticky-bottom` |
| Empty-state overlay | before top-pinned rows | after them | adjust sibling selectors |
| Aggregation footer | cells for hidden columns; spacers not sticky | rendered from visible columns; spacers `.ogx__aggregation-spacer` (sticky: `--pinned`) | update selectors that count footer cells |
| Tooltip | child of `body` | child of `.ogx-theme-provider`, `position: fixed` | update tooltip selectors |
| Detail panel | `role` mismatch | `role="row"` > `role="gridcell"` | update a11y test queries |
| Column group filler cells | `role="columnheader"` | no role, hidden from AT | update a11y test queries |
| Sticky body system cells z-index | 4 / 5 / 11 | 12 | re-check custom overlays above the grid body |
| Columns panel item | `<label class="ogx-column-visibility-panel__item-label">` wrapping the checkbox and a `<span class="ogx-column-visibility-panel__label">` | `<div class="ogx-column-visibility-panel__item-label">` with the checkbox and a `<label for> class="ogx-column-visibility-panel__label"` | update selectors and test queries that expect a `label` / `span` |
| Double-click on an editable cell (exported `Cell`) | propagation stopped when it started an edit | bubbles to the row | remove workarounds for the missing `onRowDoubleClick` / row `dblclick` |

### Added classes

| Class | On |
| :--- | :--- |
| `ogx__sticky-top`, `ogx__sticky-bottom` | sticky wrappers |
| `ogx__header-cell--pinned-left-last`, `ogx__header-cell--pinned-right-first` | pinned-section edge header cells |
| `ogx__cell--pinned-left-last`, `ogx__cell--pinned-right-first` | pinned-section edge body cells |
| `ogx__aggregation-spacer`, `ogx__aggregation-spacer--pinned` | footer spacers |
| `ogx__aggregation-footer--loading` | footer while server totals load |
| `ogx__loading-bar`, `ogx__loading-overlay--over-rows`, `ogx__loading-overlay--custom` | loading over existing rows |
| `ogx__row--group-footer` | subtotal rows in `'footer'` position |
| `ogx__cell-image` | default `<img>` for `type: 'image'` |
| `ogx-column-resize-handle--start` | resize handle on the left edge (right-pinned columns) |
| `ogx--fill` (3.0.1) | grid root when no `height`, `style.height` or `autoHeight` is set |
| `ogx-col-group-cell--pinned`, `ogx-col-group-cell--pinned-left`, `ogx-col-group-cell--pinned-right` | pinned column-group cells |
| `ogx-filter__hidden-note`, `ogx-filter__value-multiselect` | filter panel |
| `ogx-list-view__expand`, `ogx-list-view__loading` | list view |
| `ogx-tooltip--left`, `ogx-tooltip--right` | tooltip placements |
| `ogx-column-visibility-panel__item-label` | Columns panel item row; the class existed in v2 but had no stylesheet rule |

### Changed or removed rules

| Class | Change |
| :--- | :--- |
| `.ogx__pinned-rows--top`, `.ogx__pinned-rows--bottom` | no longer `position: sticky` |
| `.ogx-col-group-row` | no longer `overflow: hidden` |
| `.ogx__cell--drag-handle` | now also rendered (empty, `draggable=false`) on pinned rows |
| `.ogx-expand-icon`, `.ogx__detail-panel` | their `prefers-color-scheme: dark` rules were removed; the theme palette colours them |
| `.ogx-global-search--expanded` | shows the input border while expanded and unfocused; the primary border and focus shadow moved to `:focus-within` |
| `.ogx__cell--focused`, `.ogx__header-cell--focused`, `.ogx__header-cell--focus-visible` | outline colour reads `--ogx-grid-cell-focus-border` (falls back to `--ogx-color-primary`) |
| `.ogx__header-cell--drag-over` | background `--ogx-color-primary-light` (was the undefined `--ogx-color-blue-50`) |
| `.ogx-column-resize-handle` | `touch-action: none`; a `:focus-visible` line colour; 3.0.1: `right: 0` (was `-4px`), `justify-content: flex-end`; `--start` is `left: 0`, `flex-start` |
| `.ogx__header-cell--pinned-right-first`, `.ogx__cell--pinned-right-first`, `.ogx__aggregation-cell--pinned-right-first`, first right-pinned `.ogx-col-group-cell` (3.0.1) | `margin-left: auto`; `.ogx__content` width is `max(100%, <total>px)` when right-pinned columns exist |
| `.ogx-list-view__row` | `:focus-visible` outline (rows are focusable) |
| `.ogx-toolbar` and its buttons / chips, `.ogx-global-search`, scrollbars, filter-panel delete button | read the `--ogx-toolbar-*`, `--ogx-scrollbar-*` and `--ogx-overlay-item-danger-*` variables the theme provider sets (the filter-panel delete button used `--ogx-toolbar-btn-danger-*`); fallbacks match the v2 colours except the danger-button hover |

**How to find it:** `grep -rnE "ogx(__|-)[a-z-]+" src/ --include='*.css' --include='*.scss' --include='*.ts' --include='*.tsx'`

---

## 25. Typing changes

Most of these make code compile that did not compile before. A few make code that used to compile (unchecked) into a type error, because the types now describe what the grid actually passes.

### Your own row types now work

**What changed:** every public generic is constrained by `GridValidRowModel` (`object`) instead of `GridRowModel`. Interfaces and type aliases can be used as the row type without `extends GridRowModel` or an index signature, and an untyped `GridColDef[]` can be passed next to typed rows. The default row type is still `GridRowModel`, so untyped code is unchanged.

| | v2 | v3 |
| :--- | :--- | :--- |
| `interface Employee { id: number; name: string }` as the row type | error: does not satisfy `GridRowModel` | compiles |
| `const columns: GridColDef[] = …` with `rows: Employee[]` | TS2322 (the README example failed under `strict`) | compiles |
| `renderCell` / `valueGetter` / `valueSetter` params with `GridColDef<Employee>` | only via index-signature workarounds | typed as `Employee` |
| `getRowId` option of the export functions | `(row: GridRowModel)` | `(row: R)` |

**Fix it:** remove workarounds such as `extends GridRowModel`, `[key: string]: unknown` added only for the grid, or `as unknown as GridColDef[]` casts.

```tsx
import { DataGrid } from '@opencorestack/opengridx';
import type { GridColDef } from '@opencorestack/opengridx';

interface Employee { id: number; name: string; salary: number }

const columns: GridColDef<Employee>[] = [
  { field: 'name', headerName: 'Name' },
  { field: 'salary', valueFormatter: ({ row }) => `$${row.salary.toLocaleString()}` },
];

export function Staff({ rows }: { rows: Employee[] }) {
  return <DataGrid rows={rows} columns={columns} />;
}
```

### `DataGrid` has two overloads

`DataGrid` is declared with a typed overload (`DataGridProps<R>`) and an untyped-columns overload (`DataGridUntypedColumnsProps<R>`). As a result, `React.ComponentProps<typeof DataGrid>` now resolves to the untyped overload. **Use `DataGridProps<R>`** when you need the props type (for a wrapper component, for example).

```tsx
import { DataGrid } from '@opencorestack/opengridx';
import type { DataGridProps, GridValidRowModel } from '@opencorestack/opengridx';

export function MyGrid<R extends GridValidRowModel>(props: DataGridProps<R>) {
  return <DataGrid {...props} density="compact" />;
}
```

### Slots are typed with the props the grid passes

Each slot has an exported props type: `GridToolbarSlotProps`, `GridPaginationSlotProps`, `GridOverlaySlotProps` and `GridFooterSlotProps`. Slot components are checked against them.

| | v2 | v3 |
| :--- | :--- | :--- |
| `slots.footer: ({ rowCount }: { rowCount: number }) => …` | error (slots were `ComponentType<Record<string, unknown>>`) | compiles, `rowCount` is checked |
| Inline `slots.toolbar: (props) => …` | `props` untyped | `props` is `GridToolbarSlotProps` |
| A class / `memo` / `forwardRef` slot typed `Record<string, unknown>` | compiled | type it with the slot's props type |
| Known keys in `slotProps.toolbar` / `pagination` / `footer` | unchecked | checked (extra keys still allowed) |

### Other type-level changes

- `groupingColDef` is `Partial<GridColDef<R>>`: `field` is no longer required (a dummy `field` still type-checks and is ignored).
- `GridAggregationPosition` is `'inline' | 'footer' | null` (it was an unexported, unused `'footer' | 'inline' | 'both'`).
- `useGridApiRef()` returns `MutableRefObject<GridApi>`, which type-checks against the `apiRef` prop under `@types/react` 18.
- `GridInitialState` is an interface that accepts partial `columns`.
- `GridFilterOperator` has five new members (see [§5](#5-filtering)); exhaustive `switch` statements need the new cases.
- `renderEditCell` takes `GridRenderEditCellParams` (a superset of the old params). Existing editors still type-check, but **calling** `col.renderEditCell(params)` yourself with a `GridRenderCellParams` is now a type error: pass a `GridRenderEditCellParams` (add `onValueChange`, `onCommit`, `onCancel`).
- `GridColDef<Row>` is assignable to `GridColDef` when `Row` is a type alias or extends `GridRowModel`. It is **not** when `Row` is an interface without an index signature: type the array as `GridColDef<Row>[]` instead of `GridColDef[]`, or keep the columns untyped and use the untyped-columns overload.
- `usePivot` is declared to return `PivotResult`; `UsePivotReturn` is now a type alias of it (same fields). An alias cannot be augmented with declaration merging.
- Exported `Header`: `focusedCell.id` is `GridRowId | null` (a header cell has `id: null`, was the string `'HEADER'`). Code that assigns it to `string | number` needs a `null` check.
- Exported `Cell`: `onEditStop` is `(cancel?: boolean, field?: string) => void`. Exported `Row`: `onEditStop` params are `{ cancel?, id?, field? }`, and `rowSpanningCaches.hiddenCellOriginMap` is `Record<GridRowId, Record<string, GridRowId>>` (was `Record<number, Record<string, number>>`).
- New optional props on the exported components: `Cell.isPinnedEdge`, `Cell.valueError`, `Row.onDetailPanelHeightChange`, `Row.isCellEditable`, `Row.rowId`, and `ariaRowIndex` / `ariaColIndex` / `columnIndexMap` on `Row`, `Cell` and `Header`.
- The export option types are generic (`CsvExportOptions<R>`, `PdfExportOptions<R>`, …) and `UseAggregationParams<R>.columns` is `GridColDef<R>[]` (an overload still accepts `GridColDef[]`).
- `GridApi` is not generic: its methods still return `GridRowModel`. `params.value` is still `unknown`; read typed values from `params.row`.
- Removed unused, never-exported types from `lib/types`: `GridEditCellProps`, `GridRowModes`, `GridRowModesModel`, `GridDetailPanelContent`, `GridDetailPanelState`, `GridVirtualizationState`, `GridRenderContext`, `GridAggregationFunction`.

---

## 26. State persistence

**What changed:**

| Behaviour | v2 | v3 |
| :--- | :--- | :--- |
| When `onStateChange` fires | on every new prop identity, so inline models (`sortModel={[…]}`) or storing the state in parent state could loop | once on mount, then only when the state's value changes |
| `onStateChange` payload | no `density` | includes `density: { density }` |
| `columns.pinnedColumns` / `columns.columnOrder` in the payload | could contain the synthetic `__group__` column | only your own columns |
| `initialState.density` | ignored | applied (the `density` prop still wins) |
| `useGridStateStorage` when storage is blocked (cookie blocking, sandboxed iframes) | threw | no persistence, no error |
| `useGridStateStorage` `clearState()` | undone by the next debounced write or the flush on unmount | final: removes the saved state and cancels any pending write |
| `useGridStateStorage` writes | on every re-render | only after a state change (debounced), plus a pending write on unmount |

**Who is affected:** apps that save grid state, and in particular:

- **The storage key can change** (per user, per view) while the grid stays mounted. The grid reads `initialState` only when it mounts, so remount it with the key: `<DataGrid key={storageKey} … />`. Without the remount the grid keeps its current state and its next change is saved under the new key.
- **You call `clearState()`** and expect the grid to reset. It does not reset the mounted grid, and the grid's next state change is saved again. Remount the grid to start from defaults.
- **Server-side rendering.** `useGridStateStorage` reads storage during the first render. On the server there is no storage, so the server renders the default state while the client's first render uses the saved state: a hydration mismatch. When users can have saved state, render the grid on the client only.

**How to find it:** `grep -rnE "onStateChange|useGridStateStorage|initialState" src/`

**Fix it:** remount with the key, and render a persisted grid on the client only in an SSR app:

```tsx
import { useSyncExternalStore } from 'react';
import { DataGrid, useGridStateStorage } from '@opencorestack/opengridx';
import type { GridColDef, GridRowModel } from '@opencorestack/opengridx';

interface OrdersGridProps { userId: string; rows: GridRowModel[]; columns: GridColDef[] }

const subscribe = () => () => {};
// false on the server and during hydration, true after it.
const useIsClient = () => useSyncExternalStore(subscribe, () => true, () => false);

function SavedOrdersGrid({ userId, rows, columns }: OrdersGridProps) {
  const storageKey = `orders-grid-${userId}`;
  const { initialState, onStateChange } = useGridStateStorage(storageKey);
  return (
    <DataGrid
      key={storageKey}
      rows={rows}
      columns={columns}
      initialState={initialState}
      onStateChange={onStateChange}
    />
  );
}

export function OrdersGrid(props: OrdersGridProps) {
  return useIsClient() ? <SavedOrdersGrid {...props} /> : null;
}
```

In Next.js you can instead load the component with `dynamic(() => import('./OrdersGrid'), { ssr: false })`.

---

## Removed or renamed API

| Removed / renamed | Replacement |
| :--- | :--- |
| Runtime `row._hasChildren`, `_treeDepth`, `_isExpanded`, `_groupingField`, `_groupingValue`, `_descendantCount`, `_isGroupRow` | `params.rowMeta.*` ([§3](#3-underscore-hierarchy-fields-are-no-longer-added-to-rows)) |
| `row.id` written by `getRowId` | your own key; `getRowId` option on exports ([§2](#2-getrowid-no-longer-writes-an-id-onto-rows)) |
| `GridThemeSkeleton.darkBaseColor`, `darkHighlightColor` | pick a dark theme via `GridTheme.mode` / `darkTheme` |
| Header `focusedCell.id === 'HEADER'` | `focusedCell.id === null` |
| Default `aria-label` on `Checkbox` | pass `label` / `aria-label` |
| Default `type="submit"` on `Button` | pass `type="submit"` |
| OS-following palette inside `DataGridThemeProvider` | choose the theme yourself ([§20](#20-theming)) |
| `exportToExcel` writing `.xlsx` names | `.xls`, or `exportToExcelAdvanced` for real `.xlsx` |
| `endRow: -1` in tree-children requests | `endRow: Number.MAX_SAFE_INTEGER` |

## New API you may want

| API | What it does |
| :--- | :--- |
| `GridColDef.valueSetter` | write edits of computed columns back onto the row |
| `renderEditCell` `onValueChange` / `onCommit` / `onCancel` | build custom editors without internals |
| `onColumnOrderModelChange` | receive the whole column order after every change |
| `disableClipboardCopy` | let your own Ctrl/Cmd+C handler own the shortcut |
| `CsvExportOptions.bom`, `.escapeFormulas`; `ExcelExportOptions.escapeFormulas` | control BOM and formula escaping |
| `getRowId` on every export's options | match `selectedRows` when rows are keyed by `getRowId` |
| `PdfExportOptions.font` | print non-Latin-1 text in PDFs |
| `GridFilterOperator` `'='`, `'after'`, `'onOrAfter'`, `'before'`, `'onOrBefore'` | numeric equality and date ranges |
| `GridTheme.mode`, `colors.white` / `black` / `gray`, `grid.cellFontSize` / `headerFontSize` | complete palettes and font sizes |
| `GridRowMeta.isGroupFooter` | recognise subtotal rows in `'footer'` position |
| `GridGroupedExportRow.groupLabel` | the grid's group label on export rows |
| Keyboard: Shift+Space, Ctrl/Cmd+A, Alt+Arrow expand / collapse, Alt+ArrowDown column menu, Alt+Arrow header resize | keyboard parity with the mouse |
| `Pagination` component and props types (`CellProps`, `RowProps`, `HeaderProps`, `SkeletonProps`, `FilterPanelProps`, `PaginationProps`, `GridTooltipProps`, `ButtonProps`, `InputProps`, `CheckboxProps`) | typed custom slots and wrappers |
| Type exports `GridRenderEditCellParams`, `GridValueSetterParams`, `GridGroupedExportRow`, `GridRowScrollEndParams`, `GridColumnOrder`, `GridDataSourceState`, `GridDetailPanelHeight`, `GridAggregationPosition`, `GridSlots`, `GridSlotProps`, `GridThemeToolbar`, `GridThemeOverlays`, `GridThemeScrollbar`, `GridThemeSkeleton`, `GridThemeGrayScale` | import instead of redeclaring |

---

## Checklist

- [ ] Restart the dev server and clear the bundler cache (`rm -rf node_modules/.vite`).
- [ ] Confirm `import '@opencorestack/opengridx/styles'` is in your app root.
- [ ] Check columns with `type: 'date' | 'boolean' | 'singleSelect' | 'image'`; add a `valueFormatter` where you want the old text (§1).
- [ ] With `getRowId`: stop reading `row.id`; pass `getRowId` to exports of `selectedRows` (§2).
- [ ] Replace underscore hierarchy fields with `params.rowMeta` (§3) and remove writes to `params.row` in render callbacks; replace column objects instead of mutating them and keep `valueGetter` pure (§4).
- [ ] Review programmatic filter items with empty values, exhaustive `GridFilterOperator` switches, and search expectations (§5).
- [ ] Update sorted-output snapshots; where you need a custom order, use a `valueGetter` that returns the sort key (§6).
- [ ] Update keyboard docs/tests for Tab and Enter; stop storing `colIndex` / `rowIndex` (§7).
- [ ] In controlled pagination and selection, adopt the models the callbacks pass you (§8, §9).
- [ ] Remove duplicate state updates around `apiRef` setters (§10).
- [ ] Make `processRowUpdate` safe to run for edits committed on scroll-away; drop value-type workarounds; add `valueSetter` for computed editable columns (§11).
- [ ] Re-check exported files: BOM, `'` prefixes, selection vs grouped, `.xls` name, xlsx cell types, PDF fonts (§12).
- [ ] Handle `Date` results from `min` / `max`; re-check totals with blank cells (§13).
- [ ] Guard `renderCell` for synthetic rows; stop parsing group ids; handle `null` in `getAggregationPosition` (§14).
- [ ] Make `getRows` honour any `startRow` / `endRow`, including `Number.MAX_SAFE_INTEGER` (§15).
- [ ] Order `pinnedColumns` as you want them on screen; move sticky CSS to `.ogx__sticky-top` / `.ogx__sticky-bottom` (§16, §24).
- [ ] Remove page offsets from `onRowOrderChange`; use `onColumnOrderModelChange`; switch resize tests to pointer events (§17).
- [ ] Label exported `Checkbox`es; pass `type="submit"` where a `Button` should submit (§18).
- [ ] Wrap `copySelectedRows()` in `try` / `catch` (§19).
- [ ] Choose light or dark theme yourself; remove `darkBaseColor` / `darkHighlightColor`; check `compactTheme` heights (§20).
- [ ] Run `tsc --noEmit` and your test suite (§25).
- [ ] With persisted state: remount the grid when the storage key changes, and render it client-only under SSR (§26).
