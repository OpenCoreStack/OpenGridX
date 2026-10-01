# OpenGridX — Changelog

**Package**: `@opencorestack/opengridx`
**License**: MIT © 2026 Open Core Stack

---

## [Unreleased]

### Fixed

- **Boolean editor in Safari** — clicking the edit checkbox closed the editor without toggling the value. Safari does not focus a checkbox on click, so mousedown moved focus to the cell and the blur committed the unchanged value before the click arrived. The checkbox now keeps focus on mousedown. Found by the new package smoke suite (WebKit).

### Internal

- **Community files** — `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1), `CONTRIBUTING.md`, GitHub issue forms (bug report, feature request) and a pull request template.
- **Package smoke suite** (`npm run test:smoke`) — packs the library and installs the tarball into strict-TypeScript React 19 and React 18 apps (`e2e/fixtures/`), builds them and runs Playwright Test in Chromium, Firefox and WebKit: rendering, sorting, quick filter, selection, pagination, a 50,000-row grid filling a flex app shell without a `height` prop, row grouping with aggregation, CSV / XLSX / PDF downloads, editors, pinning, column groups, detail panels and the dark theme. Runs in the new `ci.yml` workflow (pull requests), before `npm publish`, and weekly against the newest dependency versions. See `docs/contributing/testing.md`.

## [3.2.0] — 2026-09-29

### Added

- **Non-blocking `exportToPdf`** — the export now works in ~30 ms slices and yields to the event loop between them, both while formatting rows (including grouped rows and WinAnsi conversion) and while drawing the table: the body is drawn by a series of `jspdf-autotable` calls that continue on the same page with fixed column widths, the header repeated on every new page and the footer only at the end. Pages, row positions, shading and page breaks are unchanged (verified against a single call in Chromium, Firefox and WebKit). Measured with 50,000 grouped rows in Chromium: longest main-thread block 6.3 s → ~0.4–0.6 s (jsPDF's final save, which cannot be split), total time about the same (~6–7 s), file size unchanged.
- **`PdfExportOptions.onProgress`** — `({ phase: 'prepare' | 'render' | 'save', done, total }) => void`; new exported type `PdfExportProgress`.
- **`PdfExportOptions.signal`** — an `AbortSignal`; aborting rejects the promise with a `DOMException` named `'AbortError'` and saves no file.
- **`PdfExportOptions.maxRows`** (default 20,000) — above it a development-mode `console.warn` recommends `exportToCsv` / `exportToExcelAdvanced`. The export still runs; nothing is thrown.
- Demo: the PDF export page has a row-count selector, a progress bar and a Cancel button.

## [3.1.0] — 2026-09-29

### Added

- **`GridColDef.sortComparator(v1, v2, params1, params2)`** — a per-column ascending comparator for client-side sorting, used instead of the built-in type-aware comparison. `v1` / `v2` are the cell values after `valueGetter`, **including `null` / `undefined`** (the comparator decides where empty values go); `params` are the new exported `GridSortCellParams` `{ id, field, row, value }`. The grid negates the result for `desc`. It is used for flat sorting, as one key in a multi-sort chain, to order row-grouping groups by their grouping value (the grouping column's comparator), for tree-data siblings and for pivot row-label columns, so `getAllFilteredRows()`, exports and clipboard follow the same order. A comparator that throws or returns `NaN` reads as `0` with a one-time dev warning. Ignored with `sortingMode="server"`.
- **Auto-size a column to its content** — double-click a column's resize handle (or press Enter with the handle focused) to fit the column to its header and the cells in the current render window (pinned rows included), measured in the DOM and clamped to `minWidth` (default 50px) / `maxWidth`. A flex column gets a fixed width, like after a drag; `resizable: false` columns are never auto-sized; the double-click never sorts. Works for left/right-pinned columns and under column groups. The width goes to `columnWidths` state, so `onStateChange` reports it.
- **`apiRef.current.autosizeColumn(field)`** and **`apiRef.current.autosizeColumns(fields?)`** — the same measurement, programmatically (every column when `fields` is omitted).

### Changed

- Double-clicking a resize handle used to do nothing; it now auto-sizes the column.

---

## [3.0.1] — 2026-09-29

Fixes from a smoke test in a real application (Chromium, Firefox and WebKit).

### Fixed

- **A grid without a `height` prop now fills its container.** Its root was auto-height, so inside a bounded flex layout (a wrapper with `flex: 1; min-height: 0`, with or without `DataGridThemeProvider`) it grew to fit every row and rendered all of them; 50,000 rows froze the tab. The root now gets `height: 100%` and, as a flex item, `flex: 1 1 auto; min-height: 0` (class `ogx--fill`) when neither `height`, `style.height` nor `autoHeight` is set. In an auto-height container it still grows to fit, as before. An explicit `height` is never stretched.
- **The unbounded-container development warning** is only logged when the viewport is at least as tall as the rows it renders, and names the fixes: a definite container height, `min-height: 0` on every flex or grid ancestor up to the sized one, a `height` prop, or `autoHeight`.
- **The list view warns in development when it renders more than 2,000 items.** It does not virtualize; README and the list-view guide now say so and recommend pagination.
- **The whole column resize handle can be grabbed.** The 8px handle straddled the header cell border and the cell's `overflow: hidden` clipped half of it, leaving 3–4px in every engine. It now lies inside its column against the resizing edge (also in the column-group header layout and for right-pinned columns).
- **Right-pinned columns sit at the right edge** when the columns are narrower than the grid, in the header, column-group rows, body, pinned rows and aggregation footer. They used to follow the last unpinned column, leaving a gap on their right.
- **List view, Firefox:** the rows container was a Tab stop of its own (Firefox makes scroll containers focusable), so Tab landed on it instead of the focused row. It now has `tabIndex={-1}`.

### Added

- **Typed `apiRef` row getters.** `GridApi<R>` (default `GridRowModel`) and `useGridApiRef<R>()` type `getRow`, `getAllRows`, `getVisibleRows` and `getAllFilteredRows` as your row type. `DataGridProps.apiRef` accepts a typed or an untyped ref, so existing code compiles unchanged.

### Styling and DOM (check custom CSS)

- New root class `ogx--fill` (`height: 100%; flex: 1 1 auto; min-height: 0`) when no `height`, `style.height` or `autoHeight` is set. CSS that sets the grid's height on `.ogx` still wins only if it is more specific or passed as `style.height` / `height`.
- `.ogx-column-resize-handle` is `right: 0` (was `-4px`) with `justify-content: flex-end`; `.ogx-column-resize-handle--start` is `left: 0` (was `-4px`) with `flex-start`. The visible line stays on the column border.
- `.ogx__header-cell--pinned-right-first`, `.ogx__cell--pinned-right-first`, `.ogx__aggregation-cell--pinned-right-first` and the first right-pinned column-group cell get `margin-left: auto`; with right-pinned columns, `.ogx__content` is `max(100%, <total>px)` wide instead of the column total.
- `.ogx-list-view__rows` has `tabIndex="-1"`.

### Testing

- The browser test suite and CI (deploy and publish workflows) run in Chromium, Firefox and WebKit.

### Documentation

- README `height` row, Getting Started, virtualization, theming, datagrid and pinning docs describe how the grid fills its container.
- PDF export: the `font` option is shown up front with a `₹` example, and the size and time of very large exports are documented (50,000 grouped rows ≈ 120 MB, 10–16 s on the main thread); use CSV or `.xlsx` for large exports.
- README: a rejected `processRowUpdate` keeps the cell in edit mode with the typed value and calls `onProcessRowUpdateError`.

---

## [3.0.0] — 2026-09-24

A correctness release: every feature area was audited against its documentation and the grid's own behaviour. Most changes are bug fixes, but many of them change observable output (formatted text, exported files, callback indices, request ranges), which is why this is a major version.

**Upgrading from 2.x: read [docs/migration/v2-to-v3.md](docs/migration/v2-to-v3.md).** It starts with a table that maps what your app uses to the sections you need.

**React 18 users:** 2.1.0 crashed on React 18 (the build bundled React 19's JSX runtime). 3.0.0 works on React 18 and 19 again; see *Fixed → Build & SSR*.

### Breaking

- **The underscore hierarchy fields are no longer added to rows.** `_hasChildren`, `_treeDepth`, `_isExpanded`, `_groupingField`, `_groupingValue`, `_descendantCount` and `_isGroupRow` (deprecated since 1.1) are gone at runtime; use `params.rowMeta`. TypeScript does not flag reads of them, because `GridRowModel` has an index signature.
- **`params.row` under row grouping and tree data is now the consumer's own row object**, not a per-render copy. Code that mutated `params.row` in a render callback now mutates the source data. As a side effect, rows are no longer re-created on every render.
- **`getRowId` no longer writes an `id` onto your rows.** Rows are stored untouched everywhere (grid, callbacks, `processRowUpdate`, `apiRef`), so `row.id === getRowId(row)` no longer holds. Pass `getRowId` to export functions when exporting `selectedRows`.
- **Grouped-export default labels in `exportToExcelAdvanced` now match the grid.** Without a `groupingValueFormatter`, group headers read `"field: value"` (the grid's documented default) instead of `"Header: value"`. Set `groupingValueFormatter` on the grouping column to control the label in the grid and in every export format.
- **Cells are formatted by column `type` when there is no `valueFormatter`:** `date` shows `toLocaleDateString()`, `boolean` shows Yes/No, `singleSelect` shows the option label and `image` renders an `<img>`. This applies to cells, `params.formattedValue`, list view and text exports.
- **Empty filter values no longer filter**, the quick filter searches only visible filterable columns, and the toolbar search box splits its text into words that must all match.
- **Aggregation ignores blank strings, booleans and arrays** in `sum` / `avg` / `min` / `max`, and `min` / `max` over dates return a `Date` (was epoch milliseconds).
- **CSV files start with a UTF-8 BOM and text that looks like a formula gets a leading `'`** (CSV and basic Excel). Opt out with `bom: false` / `escapeFormulas: false`.
- **A non-empty `selectedRows` now wins over `groupedRows`** in every export: the selection is exported flat and totals are recomputed over it.
- **`exportToExcel` always writes `.xls`**; a `.xlsx` file name is renamed with a warning (the file was always HTML, which Excel rejects under `.xlsx`).
- **Tab leaves the grid in one press** outside edit mode (it used to step through cells). While editing, Tab still moves to the next editable cell.
- **Index values changed meaning:** `colIndex` is absolute among visible data columns (was window-relative), bottom-pinned rows get `rowIndex` after the page rows (were 0..n), `onRowOrderChange` indices are positions in the `rows` prop (were page-local and sorted), and `onColumnOrderChange` indices are positions in the full column order.
- **`isCellEditable` now governs every way of starting an edit** (double-click, Enter, Tab) and `aria-readonly`, not only Tab stops.
- **`processRowUpdate` is called when an edit is lost** (the cell scrolls out, is filtered or paged away, or another cell starts editing). Those edits used to be dropped.
- **Built-in editors commit the column's value type:** `singleSelect` commits the option value (not its string form), `date` commits a `Date` for `Date` cells and `null` when cleared.
- **Pinned columns render in `pinnedColumns.left` / `.right` order**, not column order.
- **Header and top-pinned rows are wrapped in `div.ogx__sticky-top`, bottom-pinned rows and the aggregation footer in `div.ogx__sticky-bottom`.** `.ogx__pinned-rows--top` / `--bottom` are no longer sticky themselves; custom CSS that targets them must move to the wrappers.
- **Group and pivot row ids changed format.** Row-grouping ids for non-string values, tree-data auto-parent ids and pivot row ids use new, collision-free formats; do not parse them.
- **`DataGridThemeProvider` pins a complete light or dark palette** chosen by the new `GridTheme.mode`, whatever the operating-system colour scheme. A provider-wrapped grid no longer switches with the OS.
- **Grid buttons have `type="button"`** (including the exported `Button`), so they never submit an enclosing `<form>`. Pass `type="submit"` explicitly where you want a submit button.
- **`apiRef.current.copySelectedRows()` rejects when the clipboard write fails** (it resolved and logged).
- **`dataSource` requests changed:** `getRows` is now called with all-client modes, infinite scroll requests the gap after the loaded rows, and tree children are requested with `endRow: Number.MAX_SAFE_INTEGER` (was `-1`).
- **Column resizing uses pointer events** (tests that simulate `mousedown` / `mousemove` must use pointer events) and no longer caps widths at 1000px.
- **Removed `GridThemeSkeleton.darkBaseColor` and `darkHighlightColor`**, which had no effect.

### Security

- `printGrid` escapes the title, cell values, image URLs and alt text, and error messages in the same-origin print window, and only renders images from `http(s)`, `data:image`, `blob:` and relative URLs.
- `exportToCsv` and `exportToExcel` neutralise spreadsheet formula injection: text starting with `=`, `+`, `-`, `@`, tab or carriage return gets a leading `'`. New option `escapeFormulas` (default `true`).
- `exportToExcelAdvanced` writes object values as text, so `{ formula }`, `{ hyperlink }`, `{ richText }` or `{ error }` objects in row data can no longer become live cells or links.
- Grouped `exportToJson` no longer leaks `exportable: false` columns through subtotals and the grand total.

### Fixed

#### Export

- Grouped CSV, basic Excel, JSON, print and PDF exports ignored `groupingValueFormatter` for group-header labels; all exporters now share one label rule, and `getGroupedExportRows()` entries carry the grid's label as `groupLabel`.
- `exportToExcelAdvanced` dates were shifted by the UTC offset (a day early east of UTC).
- NaN, Infinity and Invalid Date values produced a corrupt xlsx file.
- `selectedRows` was ignored when `groupedRows` was also passed; totals are now recomputed over the selection.
- Exporting a large selection froze the tab.
- CSV did not quote values containing the configured delimiter or a bare carriage return.
- `count` / `unique` totals were formatted as currency or dates.
- A `valueFormatter` that reads other row fields or expects a `Date` aborted exports with totals.
- The first column's aggregate was replaced by the Subtotal / Grand Total / TOTAL label; the label is now prefixed to the value.
- Spacer columns (`isSpacer`) and grid system columns (`__checkbox_col__`, `__expand_col__`, `__reorder_col__`, `__group__`) passed in `columns` were exported; they are always left out.
- A `valueFormatter` placeholder for missing values is exported, as the grid shows it.
- Basic Excel dropped leading zeros and mangled long numeric ids, and wrote invalid sheet names.
- `exportToExcelAdvanced`: `rows: 'selected'` sheets contain only the selection; invalid or duplicate sheet names no longer throw; `embedImage` follows `valueGetter` and falls back to the URL for SVG, WebP and AVIF; ISO date strings and numeric strings become native cells; integers have no trailing "."; totals and the summary sheet are numeric; striped rows have no gaps.
- PDF: non-Latin-1 text was garbled wholesale; `#fff` shorthand colours work; the row count is correct when `groupedRows` is `[]`; the filter summary reflects nested groups, OR and quick search, and wraps.
- JSON aggregation values are numbers, as documented.
- Print keeps group-row highlights on even rows.

#### Filtering & sorting

- Date operators `after`, `onOrAfter`, `before` and `onOrBefore` did not filter (every row passed, with a warning per row).
- Date `is` / `not` compared raw strings; they now match the local calendar day for `Date` values, ISO datetimes and epoch numbers.
- A filter item with no value filtered anyway (`>` meant `> 0`, `=` hid every row).
- Numeric filters treated blank cells as 0; `!=` treats empty cells consistently.
- A `singleSelect` filter set from the panel emptied the grid; the panel now offers the column's `valueOptions`.
- Opening the filter panel rewrote values (an `isAnyOf` array became `"a,b"`) and fired `onFilterModelChange`.
- Editing a panel row deleted filter groups and other conditions on the same column.
- Changing the operator right after typing lost the typed value, and a pending keystroke undid Clear all.
- `valueGetter` columns could not be sorted, filtered or quick-searched (including under tree data and row grouping).
- The quick filter matched the row id, hidden columns, non-column fields, `[object Object]` and `Date.toString()` text; it now matches what cells show.
- A multi-word toolbar search now matches words across columns.
- The row-grouping "Group" column appeared in the filter panel.
- Number columns holding numeric strings sort numerically; NaN and Invalid Date no longer break sorting; accented strings sort next to their base letter.
- Shift-click on a sorted column kept moving it to the end of the sort; column-menu Unsort / Asc / Desc cleared the other sort keys.
- The toolbar search box stole focus back on re-render.
- The boolean filter could not select "true" directly; the panel shows the real operator of programmatic items.
- `initialState.filter` was ignored; the toolbar search and Filters button did nothing without a `filterModel` prop.
- A `valueGetter` or `valueFormatter` that throws no longer crashes the grid once the column is sorted, filtered, quick-filtered, aggregated, grouped or pivoted, or shown in list view: the value reads as `undefined` and a dev warning is logged once per column.
- Text typed into the FilterPanel or the toolbar search box just before the panel closes is no longer lost.

#### Editing

- `isCellEditable` did not block double-click and Enter editing; rejected cells now carry `aria-readonly="true"`.
- `processRowUpdate` ran twice for one commit (Tab, or Enter then blur).
- A slow `processRowUpdate` closed an edit on another cell or discarded text typed meanwhile.
- Clicking inside an open editor committed and closed it; the dropdown editor was unusable with the mouse; clicks inside editors fired `onCellClick` / `onRowClick` and toggled selection.
- An edit was lost when its row scrolled out, was filtered or paged away, or another cell started editing; it is now committed.
- Committing one edit reverted other changes to the row and reset the server row count.
- Tree-data parent rows could not be edited by double-click; Enter opened a useless editor on row-grouping group rows.
- Committing by clicking a control outside the grid stole focus back.
- The `singleSelect` editor committed typed option values as strings and showed no empty choice for an empty or unknown value.
- The date editor was blank for `Date` and ISO datetime values and committed a different kind of value; clearing it commits `null`.
- With a custom `getRowId`, a `processRowUpdate` result without the grid's id was not applied.
- An inline `getRowId` function reverted committed edits on every parent re-render.
- `onRowDoubleClick` did not fire on editable cells.
- The boolean editor did not close on blur; IME composition Enter committed the edit; built-in editors had no accessible name.
- Double-clicking inside an editor discarded the typed value.
- A `processRowUpdate` that returns nothing is now reported clearly and the editor stays open.
- Enter-to-edit starts from the `valueGetter` value.
- Every cell re-rendered on every grid render.

#### Selection & apiRef

- `apiRef` methods `sortColumn`, `setFilterModel`, `setPage`, `setPageSize`, `selectRow` and `selectRows` did not change the grid or fire callbacks; `getSortModel`, `getFilterModel` and `getSelectedRows` returned stale values.
- `apiRef.current.getSelectedRows()` returned the previous selection inside `onRowSelectionModelChange`.
- `getVisibleColumns` included hidden columns and ignored display order; `getVisibleRows` and `getAllFilteredRows` omitted pinned rows; `getAllFilteredRows` missed rows under tree data and row grouping.
- `getGroupedExportRows()` dropped the rows of collapsed groups and ignored sort and filter.
- Select-all selected filtered-out rows, could not be undone with a `dataSource`, and the header checkbox showed the wrong state.
- `disableMultipleRowSelection` was ignored by checkboxes, Space and select-all.
- Selection kept the ids of rows that were removed from `rows`.
- `getRowId` overwrote the row's own `id` field (grid, `dataSource` rows and tree children).
- Duplicate row ids rendered one row twice.
- `onStateChange` looped with inline models; its payload now carries `density` and never contains `__group__`; `initialState.density` is honoured.
- `useGridStateStorage` crashed when storage is blocked, `clearState` was undone, and storage was written on every re-render.
- `useGridApiRef()` did not type-check against the `apiRef` prop under `@types/react` 18.
- Changing `rows` and `columns` together (or leaving pivot mode) ran the new columns against the old rows, crashing `valueGetter`s.
- A controlled `rowSelectionModel` holding an id that is no longer in `rows` fired `onRowSelectionModelChange` on every render and could loop; the pruned selection (and a corrected page) is now reported once, also under StrictMode.
- `getAggregationResult`, `getAggregationModel`, `getGroupedExportRows` and `scrollToIndexes` are available in a parent's `useLayoutEffect`.
- `getVisibleColumns` returns columns in render order (left-pinned, unpinned, right-pinned).
- `apiRef.selectRow` / `selectRows` ignore synthetic ids (group, subtotal, auto-parent and pivot Grand Total rows), and a call that does not change the selection fires nothing. The pivot Grand Total row cannot be selected.

#### Pagination & data source

- The pager total ignored the filter and counted pinned rows.
- Server pagination, sorting or filtering without a `dataSource` re-sliced, re-sorted or re-filtered the rows.
- The `rowCount` prop was read only at mount.
- The default page size could be missing from `pageSizeOptions`.
- `slots.footer` received the page length instead of the server total.
- Shrinking data left the grid on an empty page past the end; it now shows the last page and reports it through `onPaginationModelChange`.
- The rows-per-page select did not show a page size missing from `pageSizeOptions`, had a hard-coded accessible name, and showed "Infinity" for page size 0.
- Infinite scroll skipped rows when the page advanced quickly or while loading; it now requests the missing range without duplicates.
- Infinite scroll: changing sort, filter, `pageSize` or `dataSource` restarts from the first row and reports page 0.
- Server sort or filter with client pagination showed only the first page.
- A `dataSource` with the default (client) modes never loaded its rows.
- The error overlay's Retry reloaded the whole page; it now re-requests rows, and shows the message of any rejected object with a `message`.
- Stale responses overwrote newer ones.
- Inline `filterModel`, `sortModel`, `aggregationModel` or `dataSource` objects refetched on every render and wiped loaded infinite pages.
- An inline `rows={[]}` next to a `dataSource` wiped the fetched rows.
- "No Data" flashed before the first response, and the live region announced "Loading data... No Data".
- Server tree data: children now load with every row, keep the pager total, are not re-filtered or re-sorted under server modes, reload for expanded nodes after a refetch, and a failed children request collapses its node instead of covering the grid.
- `paginationMode="infinite"` combined with `pagination` sliced the rows.
- `loading` with rows present showed nothing; it now shows a progress bar (or `slots.loadingOverlay`) over the rows.
- A `dataSource` response that cannot be processed shows the error overlay instead of loading forever.
- Row grouping with a `paginationMode="server"` `dataSource` loads every row in one request (with a dev warning) instead of grouping only the first page.

#### Row grouping & tree data

- The aggregation footer double-counted expanded groups. Under row grouping it aggregated the *visible* rows: group rows, which already carry their subtotals in the same fields, plus the expanded leaves. Expanding a group inflated `sum`, and `count` / `avg` / `unique` were wrong even when every group was collapsed. The footer, `getAggregationResult()`, the `aggregationResult` / `rowCount` passed to `slots.footer`, and grouped-export grand totals now use the filtered data rows, independent of expansion.
- Group rows lost their label and expand toggle when the first column was hidden, and showed them mid-row when that column was reordered or another column was pinned left; the hierarchy UI now goes on the leftmost column on screen.
- Subtotals, the "(n)" count and `descendantCount` counted filtered-out rows; groups left empty by the filter are hidden.
- `getAggregationPosition` was ignored; it is now called for every group and once with `null` for the grand total.
- `groupingColDef` had no effect under tree data.
- `pinnedRows` disappeared under tree data and row grouping.
- Tree paths containing `/` collided with deeper paths.
- Grouping values `null` and `'null'`, `1` and `'1'` fell into the same group.
- Detail-panel callbacks ran for every rendered row, including group rows; they now run only for expanded data rows, and a throwing `getDetailPanelContent` is contained to its panel.
- A throwing `getDetailPanelHeight`, `groupingValueFormatter` or `getAggregationPosition` falls back to the default instead of crashing.
- `getGroupedExportRows` and `getAllFilteredRows` follow screen order when sorting by the hierarchy column.
- `defaultGroupingExpansionDepth` expands and loads lazy server tree nodes.

#### Aggregation & pivot

- Footer totals now use the column's `valueFormatter` for `sum` / `avg` / `min` / `max`; `count` / `unique` stay plain numbers, and date `min` / `max` show as dates.
- Group rows formatted counts with the column's currency or unit formatter.
- Blank cells, booleans and arrays counted as 0 in `sum` / `avg` / `min` / `max`; `count` / `unique` counted blank strings.
- Aggregates of `valueGetter` columns summed `row[field]` instead of the computed values.
- `aggregable: false` columns were aggregated when `aggregationModel` or `pivotModel` named them.
- Footer totals now come from the server whenever a `dataSource` drives the rows, including infinite scroll and server-only filtering.
- An inline `aggregationModel` refetched `getRows` and cleared server totals on every render; stale server totals no longer show under a new function, filter or sort, while pending, or after a failure.
- Pivot mode crashed with `RangeError` on datasets over ~110k rows with a `min` or `max` value field, and `count` counted numeric values only.
- Pivot: filters and the quick filter apply to source rows, filters on generated value columns apply to pivot rows, and the Grand Total matches the rows shown, stays last when sorting and is not selected by select-all.
- Pivot: `getRowId` collapsed the pivot into one row; `treeData` and `rowGroupingModel` crashed or regrouped it; a `dataSource` produced broken output (pivot is now ignored with a warning).
- Pivot: the same field twice (for example `sum` and `count`) doubled values; a source `valueFormatter` that reads row data crashed the grid.
- Pivot: row-label columns keep the source column's formatter, renderer, type and alignment; column-field headers are formatted; numeric column keys sort numerically.
- Pivot: an empty pivot keeps its value columns and shows the no-rows overlay; a row field named `id` no longer overwrites row ids; pivot rows no longer share ids with source rows.
- Pivot: leaving pivot mode restores the column order; a controlled `columnOrder` no longer puts value columns before the label column, and the Columns panel can reorder generated columns.
- Pivot: `getAggregationResult()` and `slots.footer` no longer report totals over pivot rows, and the Summaries panel no longer lists generated columns.
- PivotPanel: editing or removing one of two chips on the same field affected both; it now follows `aggregable: false`, `availableAggregationFunctions` and `groupable: false`, and its controls have descriptive names.

#### Layout & pinning

- Columns pinned out of column order overlapped or left gaps; header, body, footer and keyboard navigation now agree on `pinnedColumns` order.
- Column widths ignored `minWidth` / `maxWidth` for fixed, resized and pinned columns; percentage widths cascaded; pinned `%`, `flex` and `auto` columns were 100px wide.
- Top-pinned rows covered the header when column groups were used; the aggregation footer was hidden behind bottom-pinned rows.
- Keyboard navigation and `scrollToIndexes` left the target row under the footer or bottom-pinned rows; `scrollToIndexes({ colIndex })` left the column under system or right-pinned columns.
- `'auto'` detail panels are laid out at their real height; `getDetailPanelHeight` returning 0 renders 0px (was 200px).
- `onRowsScrollEnd` fired on every scroll event near the bottom (including horizontal scrolling) and never for a list shorter than the viewport; it now fires once per arrival, in grid and list view.
- The grid re-measures its viewport and restores the scroll position after list view is switched off.
- Infinite-scroll placeholder rows appeared before the last loaded row.
- Row-spanned cells painted over the sticky drag and expand columns.
- A new `overscanRowCount` applied only after scrolling.
- Pinned-section edge classes and shadows were not applied.
- `autoHeight` filtered visible rows in quadratic time.

#### Spanning & column groups

- Body cells lost `flex`, percentage and `auto` widths (misaligned with headers) as soon as any column used `colSpan`.
- `colSpan` / `rowSpan` recomputed on every resize tick (a ~2 s freeze per rows change at 100k rows) and cost time even when unused.
- Spans counted hidden columns, crossed into another pinned section, and crossed between pinned and scrolling rows.
- A span broke when its origin row or column scrolled out of the render window.
- Huge, Infinity, NaN or fractional span values hung or corrupted the grid; `aria-colspan` / `aria-rowspan` report the clamped value.
- A throwing `colSpan` / `rowSpan` callback unmounted the grid; it now falls back to no span with a dev warning. Infinite-scroll placeholder rows are never passed to span callbacks.
- `colSpan` received the raw field value instead of the `valueGetter` result, and a `colIndex` different from `renderCell`'s.
- `colSpan` plus `rowSpan` covered only the origin column in following rows.
- `rowSpan` painted over an expanded detail panel; a merged cell was capped by its origin column's `maxWidth`.
- Keyboard navigation lost focus on covered cells; arrows now cross a merged cell in one step.
- Column group header rows did not follow member columns under `flex` / `%` / `auto` widths, hiding, reordering and pinning; pinned groups scrolled away; non-contiguous groups caused duplicate-key errors.
- `GridColumnGroup.headerClassName` was ignored.
- Group header cells expose `aria-colspan` / `aria-colindex`, filler cells are hidden from assistive technology, and `aria-rowcount` counts group header rows.
- `rowSpan` never starts on or crosses group, subtotal, tree auto-parent or pivot Grand Total rows.

#### Column reorder & resize

- `onRowOrderChange` indices depended on page, sort, filter and pinned rows; rows with id `0` and columns with field `''` could not be reordered.
- With `rowReordering`, pinned rows had no handle cell and misaligned; pinned and group rows could be dragged and dropped onto.
- Row and column drags did not start in Firefox; drags from outside the grid were treated as reorders; a drag broke after its source row scrolled away.
- Header drag-reorder moved the wrong column after columns were added, when `__group__` appeared, or with a partial controlled `columnOrder`; dropping on a pinned column sent the dragged column to the far end.
- `pinnable: false` also blocked drag-reorder.
- Controlled or `initialState` `columnOrder` was ignored when `disableColumnReorder` was set.
- The Manage-columns panel listed columns in definition order, and its Reset did nothing under a controlled `columnOrder`.
- Resize clamped to a hidden 1000px maximum and snapped narrow columns to 50px; a click on the handle resized, sorted or turned a flex column fixed; ending a resize over the header sorted the column; right-pinned columns resized from the wrong edge; a resize kept running after unmount.
- `rowReordering` had no effect but showed handles in pivot mode.

#### Keyboard & accessibility

- Keys typed into inputs inside cells and detail panels were taken by the grid; clicking an input rendered by `renderCell` lost focus.
- Focus was lost when the focused cell scrolled out, on window switch, when tabbing out and back (the last cell is now restored), and when rows or columns were removed, filtered or hidden.
- Tab could not reach detail-panel content.
- Arrow keys stopped on hidden columns and ignored the pinned visual order; Space and arrows at the edges scrolled the viewport.
- ArrowDown onto a row with a tall detail panel scrolled the row out of view; Home onto an unpinned checkbox column did not scroll it into view.
- Enter / Space on the select-all header sorted by `__checkbox_col__` instead of selecting all.
- Keyboard sorting from a header ignored `multiSort` and Shift.
- Reorder, expand and checkbox columns were not real focus stops; pinned rows could not be edited.
- DOM focus did not return to the cell after a re-click or an edit.
- A row with id `"HEADER"` was treated as the header row.
- `aria-rowindex`, `aria-rowcount`, `aria-colindex`, `aria-colcount` and `aria-sort` were wrong; `colIndex` in `onCellClick`, `renderCell`, `cellClassName` and `renderHeader` was relative to the render window.
- The detail panel had an invalid row/gridcell structure.
- A cell whose `renderCell` threw stayed broken; it now recovers when the renderer or value changes.
- `GridTooltip` placement `left` / `right` did not work; it now opens on focus, uses `role="tooltip"` with `aria-describedby`, closes on Escape, uses theme colours and cleans up its timers.
- Columns-panel checkboxes are announced with their column name.

#### Clipboard

- Copy (Ctrl/Cmd+C and `apiRef.copySelectedRows()`) included hidden and `exportable: false` columns in definition order; it now copies the visible columns in screen order.
- Copy read `row[field]` instead of the `valueGetter` value before formatting.
- Values containing tabs, line breaks or quotes broke the pasted table; they are now quoted.
- Only selected rows on the current page and in expanded groups were copied; now every selected row that passes the filter is copied, including pinned rows and collapsed groups.
- Copying right after `selectRows` or from `onRowSelectionModelChange` copied the old selection.
- Focus moved to `<body>` after copying.
- Ctrl+C did not copy with Caps Lock on or with non-Latin keyboard layouts, and it copied while focus was outside the grid or a text selection was active.
- Fields starting with `__` (for example `__typename`) were not copied.
- The Ctrl+C listener was registered more than once.

#### Toolbar, header & list view

- `slots.toolbar` rejected `memo`, `forwardRef`, class and `lazy` components; switching the toolbar did not remount cleanly; an inline toolbar lost its state.
- `slotProps.toolbar` render props had implicitly-`any` parameters under `strict`; `slots.pagination` typed with `PaginationProps` did not type-check; `groupingColDef` required a `field`.
- The column menu offered Hide for `hideable: false` and pin actions for `pinnable: false` columns (including the grouping column).
- Manage columns worked only once (after the toolbar button or Escape closed the panel) and did nothing with a custom toolbar; it now opens a standalone panel. The Columns panel closes on Escape and `onColumnsPanelClose` fires on every close.
- The Summaries panel offered functions outside `availableAggregationFunctions` and omitted `unique`.
- Toolbar panels misaligned with a classic (non-overlay) scrollbar.
- List view passed loading placeholders to `renderCell`, paged incorrectly under tree data, ignored server totals, never fired `onRowsScrollEnd`, and gave `renderCell` no `value`, `formattedValue`, `colDef` or `rowMeta`; `aria-rowindex` restarted every page.
- List view ignored `loading`, `slots.loadingOverlay`, `slots.noRowsOverlay` and `slots.footer`, and showed "No Data" while loading; `listView` without `listViewColumn` rendered nothing (it now falls back to the grid with a dev warning).
- List view had no expand chevron or depth indent for tree-data and group parents.
- List view: `renderCell` errors are contained, group rows get no checkbox and fall back to their label, and "N items" counts data rows.
- Two column-menu hides or pins in the same tick both apply.

#### Theming

- `DataGridThemeProvider` left part of the palette to the OS colour scheme, so `darkTheme` in a light browser (or light presets in a dark browser) was unreadable.
- Brand presets and `colors.primary` did not recolour the toolbar, filter panel, column menu, selection and focus ring.
- `grid.rowHeight*` and `grid.headerHeight` did not size rows and the header (`compactTheme` now gives 36px rows and a 40px header).
- `toolbar.*`, `scrollbar.*`, `overlays.itemDanger*` and `grid.cellFocusBorder` had no effect.

#### Build & SSR

- **The package works on React 18 again.** The 2.1.0 build bundled React 19's JSX runtime, which React 18 cannot render (`recentlyCreatedOwnerStacks` error on first render). A build check now fails if the JSX runtime is bundled.
- `DataGrid` crashed under server rendering (`renderToString`, Next.js, Remix) because a panel read `document` during render.
- `docs/migration/` now ships in the npm package; the v2 → v3 guide was missing from `node_modules`.

#### Documentation

- The README, `llms.txt` and the AI context file no longer claim the stylesheet loads automatically: `import '@opencorestack/opengridx/styles'` is required.
- The README props tables list only real props, with correct defaults; `llms.txt` examples compile and use real APIs.
- Server-side guides describe the real requests; "millions of rows" is replaced by the browser's height limit (about 645k rows at 52px in Chromium).
- The theming docs no longer reference a non-existent `themes` export; the API reference and component pages were corrected against the code.

### Performance

- Inline `columns` (a new array each render with the same definitions) no longer re-runs client filtering and sorting.
- The quick filter no longer re-reads every cell on each keystroke.
- Faster date formatting.

### Added

- `GridColDef.valueSetter` (`GridValueSetterParams`) maps an edited value back onto the row for editable `valueGetter` columns.
- `renderEditCell` receives `onValueChange`, `onCommit` and `onCancel` (`GridRenderEditCellParams`); errors in custom editors are contained to their cell.
- `formattedValue` and `rowMeta` are passed to `renderEditCell` and to the function form of `cellClassName`, as they already were to `renderCell`.
- Default cell formatting by `GridColDef.type` when there is no `valueFormatter` (see *Breaking*).
- `GridFilterOperator` values `'='`, `'after'`, `'onOrAfter'`, `'before'` and `'onOrBefore'`; a date input and `singleSelect` / multi-select value controls in the filter panel; the panel notes conditions it cannot show.
- `onColumnOrderModelChange(columnOrder)` fires with the whole new order after every change, including the Columns panel's Reset.
- `disableClipboardCopy` prop; Ctrl+C events already handled (`defaultPrevented`) are left alone.
- Export options: `CsvExportOptions.escapeFormulas`, `CsvExportOptions.bom`, `ExcelExportOptions.escapeFormulas`, `PdfExportOptions.font` (a Unicode TrueType font), and `getRowId` on every export function.
- `GridGroupedExportRow.groupLabel`; `GridRowMeta.isGroupFooter` and the `ogx__row--group-footer` class for subtotal rows shown in `'footer'` position.
- Keyboard: Shift+Space selects the focused row, Ctrl/Cmd+A selects all, Alt+ArrowRight / Alt+ArrowLeft expand and collapse, Alt+ArrowDown or Ctrl+Enter opens the column menu, Alt+ArrowLeft / Alt+ArrowRight on a focused header resizes it (Shift for 50px steps).
- Enter on a non-editable cell: on a row with children (group rows, tree-data parents) it only toggles expansion, without firing `onRowClick` or selecting; on any other row it acts like a click (`onRowClick`, click-to-select).
- Keyboard navigation between rows in list view.
- Column resizing by touch and pen; resize separators expose `aria-valuenow` / `aria-valuemin` / `aria-valuemax`.
- `aria-level` / `aria-expanded` on hierarchy rows and `aria-multiselectable` on the grid.
- `GridTheme.mode` (`'light' | 'dark'`), `colors.white`, `colors.black`, `colors.gray` (50–900), `grid.cellFontSize` and `grid.headerFontSize`.
- Type exports: `GridRenderEditCellParams`, `GridValueSetterParams`, `GridThemeToolbar`, `GridThemeOverlays`, `GridThemeScrollbar`, `GridThemeSkeleton`, `GridThemeGrayScale`, `GridGroupedExportRow`, `GridRowScrollEndParams`, `GridColumnOrder`, `GridDataSourceState`, `GridDetailPanelHeight`, `GridAggregationPosition`, `GridSlots`, `GridSlotProps`, and the props types `CellProps`, `RowProps`, `HeaderProps`, `SkeletonProps`, `FilterPanelProps`, `PaginationProps`, `GridTooltipProps`, `ButtonProps`, `InputProps`, `CheckboxProps`.
- `Pagination` component export.
- Optional `rowId` prop on `Row`, and optional `ariaRowIndex` / `ariaColIndex` / `columnIndexMap` props on the exported `Row`, `Cell` and `Header` components.
- Optional props on the exported components: `Cell.isPinnedEdge` (adds the pinned-section edge class), `Cell.valueError` (shows a `valueGetter` error as a cell error), `Row.onDetailPanelHeightChange(rowId, height)` (measured height of an `'auto'` detail panel) and `Row.isCellEditable`.
- Dev warnings: the grid stylesheet is not loaded, `pinnedRows` ignored under hierarchy, content taller than browsers can scroll, duplicate row ids, empty or duplicate tree paths, `valueGetter` + `editable` without `valueSetter`, pivot combined with `dataSource` / tree data / row grouping, `listView` without `listViewColumn`.
- CSS hooks: `ogx__sticky-top`, `ogx__sticky-bottom`, `ogx__header-cell--pinned-left-last`, `ogx__header-cell--pinned-right-first`, `ogx__cell--pinned-left-last`, `ogx__cell--pinned-right-first`, `ogx__aggregation-spacer`, `ogx__aggregation-spacer--pinned`, `ogx__aggregation-footer--loading`, `ogx__loading-bar`, `ogx__loading-overlay--over-rows`, `ogx__loading-overlay--custom`, `ogx__cell-image`, `ogx-list-view__expand`, `ogx-list-view__loading`, `ogx-filter__hidden-note`, `ogx-filter__value-multiselect`, `ogx-col-group-cell--pinned`, `ogx-col-group-cell--pinned-left` / `--pinned-right`, `ogx-column-resize-handle--start`, `ogx-tooltip--left` / `--right`.

### Changed

- Sorting is type- and language-aware (`Intl.Collator` with numeric collation, dates parsed, mixed kinds ordered by kind).
- The quick filter searches only visible, filterable columns, using `valueGetter` and `valueFormatter` text.
- Pinned columns render in `pinnedColumns.left` / `.right` order; the column menu appends, so the most recently pinned column sits next to the scrolling area.
- `onColumnOrderChange` indices are positions in the full current column order (including hidden columns and `__group__`).
- Header drag-reorder works inside a column group when `columnGroupingModel` is set (it was disabled for every column); the toolbar and Columns panel can no longer move a column out of its group.
- A synchronous `processRowUpdate` result is applied in the same event.
- `apiRef.current.copySelectedRows()` rejects when the clipboard write fails.
- `min` / `max` of dates return a `Date`; the default `avg` format in pivot cells is locale-grouped (`56,666.67`); the footer exposes `aria-busy` while server totals load.
- `GridToolbar` shows the Summaries button only when `onAggregationModelChange` is passed; toolbar triggers have `aria-haspopup="dialog"` and `aria-expanded`.
- `GridTooltip` renders into the theme provider (`.ogx-theme-provider`) with `position: fixed` instead of `document.body`.
- `useGridApiRef()` returns a `MutableRefObject<GridApi>` that is never `null` before mount; `GridInitialState` accepts partial `columns`.
- The exported `Header` reports a focused header cell as `focusedCell.id === null` (was `'HEADER'`).
- The exported `Cell` no longer stops propagation of the double-click that starts an edit, so it reaches the row (`onRowDoubleClick`).
- `onStateChange` fires on value changes only (it fired for every new prop identity). With `useGridStateStorage`, remount the grid with `<DataGrid key={storageKey}>` when the key changes; storage is read during the first render, so SSR apps with saved state should render the grid on the client only (see the migration guide, §26).
- `GridAggregationPosition` is `'inline' | 'footer' | null` (it was an unused `'footer' | 'inline' | 'both'`).
- Accent colours use CSS `color-mix()` (Chrome 111+, Safari 16.2+, Firefox 113+); `darkTheme` gives the toolbar a solid `#1e293b` background.

### Typing changes

- Rows can be typed with your own interfaces and type aliases: every public generic is constrained by the new `GridValidRowModel` (`object`) instead of `GridRowModel`, and an untyped `GridColDef[]` can be passed next to typed rows. The README example now compiles under `strict`.
- `DataGrid` and the export functions, `usePivot` and `useAggregation` have a typed and an untyped-columns overload. Use `DataGridProps<R>` rather than `React.ComponentProps<typeof DataGrid>`.
- `GridColDef` row callbacks are declared as methods, so `GridColDef<Row>` is assignable to `GridColDef` when `Row` is a type alias or extends `GridRowModel`. For an interface without an index signature it is not: type the array as `GridColDef<Row>[]`, or leave the columns untyped and use the untyped-columns overload.
- Calling `col.renderEditCell(params)` yourself with a `GridRenderCellParams` is now a type error: its parameter is `GridRenderEditCellParams` (the old params plus `onValueChange`, `onCommit`, `onCancel`).
- `usePivot` is declared to return `PivotResult`; `UsePivotReturn` is now a type alias of it (same fields, no declaration merging).
- Exported `Header`: `focusedCell.id` is `GridRowId | null`. Exported `Cell`: `onEditStop(cancel?, field?)`. Exported `Row`: `onEditStop` params gain optional `id` / `field`; `rowSpanningCaches.hiddenCellOriginMap` is `Record<GridRowId, Record<string, GridRowId>>` (was `Record<number, Record<string, number>>`).
- Slots are typed with the props the grid passes: new `GridToolbarSlotProps`, `GridPaginationSlotProps`, `GridOverlaySlotProps`, `GridFooterSlotProps`. Known `slotProps` keys are type-checked.
- Export option types are generic (`CsvExportOptions<R>`, …), so `getRowId` receives your row type.
- New root exports: `GridValidRowModel`, `DataGridUntypedColumnsProps` and the slot props types.
- Removed unused, never-exported internal types (`GridEditCellProps`, `GridRowModes`, `GridRowModesModel`, `GridDetailPanelContent`, `GridDetailPanelState`, `GridVirtualizationState`, `GridRenderContext`, `GridAggregationFunction`).
- The repository is type-checked in CI (`npm run typecheck`: library, tests and demo).

### Removed

- `GridThemeSkeleton.darkBaseColor` and `GridThemeSkeleton.darkHighlightColor` (they had no effect).
- The runtime underscore hierarchy fields on rows (see *Breaking*).
- The OS dark-mode (`prefers-color-scheme`) rules for the expand icon and detail panel; the theme palette colours them.

---

## [2.1.0] — 2026-09-23

Fixes from a consumer defect report (migration of an ERP report writer from ag-grid) plus issues found while verifying it.

### Fixed

- **Row-grouping subtotals were wrong when data contained nulls** — `useRowGrouping` had its own copy of the aggregation functions that coerced `null` to `0` (`Number(v) || 0`). For `[10, null, 20]` a group showed `min` 0, `avg` 10 and `count` 3. It also ignored `unique` and `availableAggregationFunctions`. Group rows now use the same shared functions as the footer (`lib/utils/aggregation`), giving 10 / 15 / 2. Grouped exports (`getGroupedExportRows`) inherit the fix.
- **`min` / `max` could throw `RangeError` on very large datasets** — `Math.min(...values)` exceeds the engine's argument limit at roughly 120k values. Replaced with loops.
- **Expanded groups collapsed on every data change** — any new `rows` array (an inline edit, a live refresh) or a new-but-equal `rowGroupingModel` array reset expansion to the default. User choices are now overrides keyed by the grouping config, and are discarded only when `rowGroupingModel` or `defaultGroupingExpansionDepth` changes value.
- **`getVisibleRows` sorted the memoized tree's child arrays in place** under row grouping; it now sorts a copy.
- **Tree data reset user expansion whenever rows changed** (when `defaultGroupingExpansionDepth` was non-zero). With server-side tree data, a lazily expanded node could collapse as soon as its children arrived. Tree data now uses the same override model as row grouping, and the default expansion applies on the first render instead of after an effect.
- **`onRowExpansionChange` (server-side child fetch) was called inside a React state updater**, which React may run twice (always in StrictMode). It is now called exactly once per expand.
- **`useTreeData().getVisibleRows()` crashed when `filterModel` was omitted**, although the param is optional.
- **Rows were drawn in the wrong place when rows were pinned to the top.** `useGridVisibleRows` subtracted the pinned count from render-window indices that already exclude pinned rows. With N top-pinned rows, every row past the first screen was drawn N rows too low, and the bottom N rows of the viewport were left blank.
- **Keyboard navigation and `apiRef.scrollToIndexes` left the target row hidden below the fold.** The scroll math ignored the sticky header, so the row ended up about one header height below the visible area. Keyboard navigation also mapped pinned rows onto the wrong layout index. Both now share `scrollRowIntoView` and never scroll to pinned rows, which are always visible.
- **`valueFormatter` was dropped for every column once row grouping was on** — the injected hierarchy renderers fell back to the raw value. They now render the formatted value. *(Report D3)*
- **`slots.footer`, `slots.noRowsOverlay` and `slots.loadingOverlay` were typed and documented but never rendered.** All three are now wired. `footer` replaces the pagination area, as documented, and also receives `aggregationResult`, `rowCount`, `paginationModel`, `onPaginationModelChange` and `apiRef`. *(Report D2)*

### Added

- **`onRowDoubleClick`** on `DataGridProps`, in grid and list view. *(Report D6)*
- **`GridRenderCellParams.formattedValue`** — the `valueFormatter` output, now passed to `renderCell`.
- **`ColumnVisibilityPanel` and `ColumnVisibilityPanelProps` exported**, as the docs already claimed. *(Report D5)*
- **`ExcelAdvancedExportOptions.groupedRows`** — grouped reports in `exportToExcelAdvanced`, with Excel row outlining, numeric subtotals that keep `numFmt`, and `groupHeaderFillColor` / `groupSubtotalFillColor`. *(Report D7)*
- **Development-mode warnings** (skipped when `NODE_ENV === 'production'`):
  - when the grid renders every row of a dataset larger than 200 rows because its container has no bounded height *(root cause of report D1)*;
  - when `pagination` is passed with an active `rowGroupingModel` *(report D4)*.
- **Real-browser test project** — Vitest browser mode with Playwright/Chromium (`npm run test:browser`; `npm test` stays on jsdom). `@vitest/browser-playwright` and `playwright` are now declared devDependencies.
- **CI:** `.github/workflows/npm-publish.yml` runs unit and browser tests before publishing. It previously ran only lint and build, so a failing test could not block a release.

### Documentation

- `features/virtualization.md` — new "The grid needs a bounded height" section. It explains the flex `min-height: 0` trap and replaces the claim that grouping "works seamlessly" with virtualization. Report D1 turned out to be this: grouped rows *are* virtualized (a 25,000-row group renders ~20 DOM rows in a bounded container, verified in Chromium), but an unbounded container renders everything, and pagination had been hiding it. Also corrects the claims that columns are not virtualized and that the default overscan is 5.
- `features/tree-data-grouping.md`, `features/sorting-pagination.md` — pagination is ignored under row grouping (report D4); expansion and aggregation semantics.
- `features/export-guide.md` — CSV and basic Excel append **two** aggregation rows, labels then values (report D8); grouped advanced-Excel export.
- `customization/slots-api.md` — `footer` props. `components/column-visibility.md` — the examples showed `<ColumnVisibilityPanel />` with no props, which cannot work; replaced with real usage.
- `roadmap.md` — removed "upcoming" items that had already shipped (npm publishing, native PDF export, GitHub Pages deployment).

---

## [2.0.4] — 2026-09-10

### Added

- **Adaptive overscan based on scroll velocity** — `useGridScrollSync` now tracks scroll velocity (px/ms) on every scroll event and maps it to a dynamic overscan tier (3 / 5 / 12 / 20 / 30 rows). All three values (`scrollTop`, `scrollLeft`, `overscanRows`) are bundled into a single state update per RAF frame so `useGridVirtualization` recomputes exactly once per frame. 200 ms after scrolling stops, the overscan decays back to the floor set by `overscanRowCount`.
- **`overscanRowCount` prop** — new `DataGridProps` field (`number`, default `3`). Sets the minimum overscan floor; the adaptive algorithm always produces a value ≥ this prop. Increasing it pre-renders more rows at rest; decreasing it saves idle memory.

---

## [2.0.3] — 2026-09-10

### Documentation

Comprehensive accuracy audit — 32 issues corrected across 19 files:

- **Wrong defaults corrected**: `pageSizeOptions` (`[10,25,50]` → `[10,25,50,100]`), `pinCheckboxColumn`/`pinExpandColumn` (`false` → `true`), `noRowsLabel` (`'No rows'` → `'No Data'`) — in `API_REFERENCE.md`, `components/datagrid.md`, `features/sorting-pagination.md`, `features/selection.md`, `components/empty-state.md`
- **Missing API surface added**: `getAllFilteredRows()` and `getGroupedExportRows()` added to `GridApi` table; `groupLabel` field added to `GridRowMeta`; `groupedRows` option added to `PdfExportOptions`; `'unique'` added to aggregation function type in `components/aggregation-footer.md`
- **Non-existent API removed or corrected**: `'both'` is not a valid `getAggregationPosition` return (valid: `'inline' | 'footer' | null`); `disableColumnResize` DataGrid prop, `columnResizeHandle`/`columnVisibilityPanel`/`columnGroupHeader`/`tooltip` slots, `onColumnWidthChange` callback, `disableReorder` on `GridColDef`, `showQuickFilter` in `GridToolbarProps`, `toolbar`/`toolbarProps` DataGrid props — all documented as real but never existed; corrected throughout
- **Stale content updated**: `use-grid-scroll-sync.md` and `use-grid-virtualization.md` params/returns updated from old `scrollPosRef`/`scrollTick` pattern to current `scrollTop`/`scrollLeft`; `grid-row-meta.md` updated from "will be removed in v2" to "was removed in v2" *(correction, 2026-09-16: this specific change was itself inaccurate — the shim was never actually removed in v2.0; reverted to reflect that it is still present and deprecated)*; `roadmap.md` column virtualization claim corrected; `virtualization.md` "Aui DataGrid" placeholder fixed and `density` prop section added; `upgrade-guide` version and slots API corrected

---

## [2.0.2] — 2026-09-10

### Fixed

- **Infinite re-render loop with `rowGroupingModel` + `groupingColDef`** — when both were active,
  `activeColumns` and `effectivePinnedColumns` were rebuilt as new object/array references on every
  render. The new references cascaded through `useRowGrouping`'s memoized values and a `useEffect`
  that called `setExpandedGroupIds`, triggering a render → new references → effect → `setState`
  cycle that never settled (`Maximum update depth exceeded`). Both values are now wrapped in
  `useMemo` so their references only change when their actual inputs change.

---

## [2.0.1] — 2026-09-08

### Documentation

- **`unique` aggregation function documented in changelog** — `unique` (count of distinct non-null
  values via `Set`) has been a built-in aggregation function since v1. The v2.0.0 changelog entry
  for `availableAggregationFunctions` now explicitly lists all six built-in names: `sum`, `avg`,
  `count`, `min`, `max`, `unique`.

---

## [2.0.0] — 2026-09-08

### Breaking

- **Removed dead public API:** `onPinnedRowsChange` and `onRowGroupingModelChange` are removed from
  `DataGridProps`. Both props accepted callbacks that were never invoked — no pin/unpin-row UI and no
  drag-to-group UI exist. Callers that passed these callbacks should simply remove them; grid
  behavior is unchanged.

### Added

- **`density` wired** — `density?: 'compact' | 'standard' | 'comfortable'` now sets the
  `--ogx-row-height` CSS variable (compact = 32 px, standard = `rowHeight`, comfortable = 72 px).
  Previously accepted but silently discarded.
- **`disableRowSelectionOnClick`** — clicking a row no longer triggers selection when this prop is
  `true`. Previously wired to internal state only; `onRowSelectionModelChange` is now also fired.
- **`disableMultipleRowSelection`** — clicking a row while this prop is `true` caps selection to
  that single row (deselects others). Clicking an already-selected row deselects it.
- **`groupingColDef` implemented** — passing `groupingColDef` when `rowGroupingModel` is active now
  creates a dedicated `__group__` column at position 0, auto-pinned left. Previously the prop was
  accepted but had no runtime effect.
- **`groupable: false` honored** — columns with `groupable: false` are now skipped when building the
  grouping tree in `useRowGrouping`. Previously this flag was silently ignored.
- **`groupingValueFormatter` on `GridColDef`** — new optional field
  `groupingValueFormatter?: (params: { field: string; value: unknown }) => string` customizes the
  label shown for group-header rows at that level. The formatted string flows through
  `GridRowMeta.groupLabel`. Falls back to `"${field}: ${value}"` when omitted.
- **`availableAggregationFunctions` honored** — per-column `availableAggregationFunctions?: string[]`
  now gates which aggregation functions are computed in `useAggregation`. Functions not in the
  allowed list are skipped for that field. Built-in function names (all available since v1):
  `sum`, `avg`, `count`, `min`, `max`, `unique` (count of distinct non-null values).
- **`multiSort` prop** — new `multiSort?: boolean` on `DataGrid`. When `true`, every click on a
  sortable column header appends/cycles that column in the sort model instead of replacing it — no
  Shift key required. Shift+click continues to work as an append gesture regardless of this prop.
- **Multi-sort shift-click** — shift-clicking a column header appends the column to `sortModel`
  rather than replacing it. A numbered priority badge appears next to the sort arrow when more than
  one sort key is active. Plain click still replaces with a single-key sort (unless `multiSort` is set).
- **`description` tooltip** — `description?: string` on `GridColDef` now renders as the native
  `title` attribute on the header cell, providing a browser tooltip on hover.

---

## [1.3.0] — 2026-09-08

### Added
- **Grouped export** — all five export functions (`exportToCsv`, `exportToExcel`, `exportToJson`,
  `printGrid`, `exportToPdf`) now accept an optional `groupedRows?: GridGroupedExportRow[]` option.
  When provided, the export preserves the row-grouping structure: group-header rows, indented leaf
  rows, per-group subtotals, and a grand total footer. Flat behavior is unchanged when the option
  is absent, making this a fully backward-compatible addition.
- **`GridApi.getGroupedExportRows()`** — new method that returns a flat ordered list of
  `GridGroupedExportRow` entries (types: `group-header | leaf | group-subtotal | grand-total`)
  by traversing the active row-grouping tree. Returns `null` when row grouping is not active.
- **`GridGroupedExportRow` type** — new public interface describing each entry in the grouped
  export list (`type`, `depth`, `groupField?`, `groupValue?`, `aggregatedValues?`, `row?`).

---

## [1.2.3] — 2026-09-08

### Fixed
- `GridToolbar` Columns panel — columns with `hideable: false` are now excluded from
  the panel list by default. Previously they appeared as permanently disabled rows,
  adding visual noise for no benefit (users can never toggle them). The column still
  renders normally in the grid body and in exports — only the Columns panel list changes.

### Added
- `GridToolbarProps.showNonHideableColumns?: boolean` — opt-out prop. Set to `true` to
  restore the old behavior and show `hideable: false` columns in the panel as disabled
  rows. Default: `false`. No other API surface changed; this is a backward-compatible
  addition.

---

## [1.2.2] — 2026-09-08

### Fixed
- `CellErrorBoundary` — moved `renderFn()` call into a module-scope `CellRenderTarget`
  child component so the throw happens in a descendant; a boundary cannot catch errors
  thrown inside its own `render()`.
- `CellErrorBoundary` — changed `resetKey` from `value` to `row` object reference so the
  boundary resets whenever fresh row objects are provided, not just when the cell value
  changes. Enables "Restore" to clear error state correctly.
- `exportToPdf` — aggregation footer now computed directly from the exported rows in the
  demo, bypassing the `useEffect`-based `getAggregationResult()` path that could silently
  return `null` due to stale closures.
- `exportToPdf` — aggregation footer text color is now explicitly `[0, 0, 0]` (black) to
  prevent text from appearing invisible against the light gray footer background.
- `exportToPdf` — switched to standalone `autoTable(doc, opts)` function to avoid
  unreliable ESM prototype patching in Vite dynamic imports.

### Added
- `GridApi.getAllFilteredRows()` — returns all filtered and sorted rows regardless of
  pagination. Use this in export handlers to include every row, not just the current page.
- `CellErrorBoundaryDemo` — 100 rows, 10 specific rows throw on demand (rows 10, 20 … 100),
  with correct Restore behaviour.

---

## [1.2.1] — 2026-09-07

### Fixed
- `CellErrorBoundary` now accepts a `renderFn: () => React.ReactNode` prop and calls it
  inside its own `render()`, so React correctly catches thrown errors from `renderCell`.
  Previously the call happened in the parent's render phase — before the boundary — causing
  the entire app to crash instead of showing a per-cell error indicator.
- `exportToPdf` double-cast through `unknown` to satisfy the installed `jspdf` TypeScript
  types (the library's class does not expose `autoTable`/`lastAutoTable` in its official
  type definitions).
- Added `jspdf` and `jspdf-autotable` to `devDependencies` so local development and demo
  builds work without a manual `npm install`.
- Deploy workflow now copies `index.html` → `404.html` so GitHub Pages serves the SPA for
  direct URL access to any demo route.

---

## [1.2.0] — 2026-09-03

### Added
- `exportToPdf(rows, columns, options?)` — generate a styled PDF report from grid data.
  Optional peer deps required: `npm install jspdf jspdf-autotable`.
  Features: optional branded header (logo, title, filter summary, row count), multi-page
  data table with repeating column headers, alternating row shading, aggregation footer row.
  See `docs/features/pdf-export.md`.
- New exported type: `PdfExportOptions`

---

## [1.1.0] — 2026-09-02

### Added
- `GridRowMeta` interface — hierarchy metadata (`hasChildren`, `treeDepth`, `isExpanded`, etc.) now available via `params.rowMeta` in `renderCell`. See `docs/architecture/grid-row-meta.md`.
- `GridLocaleText` interface and `localeText` prop on `DataGrid` — override all pagination strings for i18n.
- `CellErrorBoundary` — `renderCell` errors are now caught per-cell; the grid continues rendering. Fallback shows `⚠` in the affected cell.
- 25 new unit tests for `useGridRowPipeline`, `useGridControlledState`, and `useGridKeyboardNavigation`.
- `CLAUDE.md` at project root — AI coding assistant context file.
- `docs/architecture/grid-row-meta.md` — architecture doc for `GridRowMeta` and `rowMetaMap` data flow.

### Changed
- `GridRowModel` no longer declares `_hasChildren`, `_treeDepth`, `_isExpanded`, `_groupingField`, `_groupingValue`, `_descendantCount` as typed properties. These fields remain on the row object at runtime (backward-compat shim; scheduled for removal in v2.0 at the time of this release — see correction below). Access hierarchy metadata via `params.rowMeta` instead.

### Deprecated
- `params.row._hasChildren` etc. — use `params.rowMeta?.hasChildren`. Runtime shim scheduled for removal in v2.0 at the time of this release.

> **Correction (added retroactively):** the runtime shim removal described above did not ship in v2.0.0–v2.0.4. The underscore fields are still injected at runtime as of v2.0.4. Removal is deferred to a future major version. See `docs/architecture/grid-row-meta.md`.

---

## [1.0.6] — August 13, 2026 ✨

### Added
- **Toolbar render prop slots**: `GridToolbar` now accepts render props to replace individual toolbar controls without replacing the entire toolbar. All panels (columns, filters, aggregation) continue to open and close normally — only the trigger element is swapped.
  - `renderColumnsButton(props)` — replace the Columns icon button
  - `renderFilterButton(props)` — replace the Filters icon button; receives `activeCount`
  - `renderAggregationButton(props)` — replace the Summaries icon button; receives `activeCount`
  - `renderExportButton()` — inject an Export button after the Aggregation button (no built-in exists)
  - `renderQuickFilter(props)` — replace the built-in `GlobalSearch` input; receives `value` and `onChange`
- **`GridToolbar.className`**: Accepts an additional CSS class on the toolbar root `<div>` for full visual override without replacing the component.
- **Exported types**: `ToolbarButtonRenderProps` and `ToolbarQuickFilterRenderProps` are now exported from the package for TypeScript consumers.
- **Toolbar Customization demo**: new demo page at `/toolbar-customization` showing a branded dark toolbar and a plain light toolbar, each using all five render props.

---

## [1.0.5] — August 12, 2026 🐛

### Fixed
- **Aggregation footer width misalignment with `flex` columns**: When a `GridColDef` used `flex` (with or without a `width` fallback), the aggregation footer cells used `columnWidths` to resolve rendered widths. That map is a user-resize override cache — it contains no entry for columns that have not been manually resized, so flex-columns fell back to their raw `col.width` prop value, producing cells that were narrower than the actual column. Fixed by computing `resolvedColumnWidths` in `DataGrid` that seeds from the layout-computed flex widths (`unpinnedColsWithWidth`, `leftPinnedCols`, `rightPinnedCols`) and then overlays any user-resize overrides. `GridAggregationFooter` now receives `resolvedColumnWidths` instead of `columnWidths`.

---

## [1.0.4] — July 30, 2026 🐛

### Fixed
- **`getRowId` not applied to internal row store**: `DataGrid` derived `effectiveGetRowId` correctly but never used it before rows entered the internal state. `createInitialState` and the `SET_ROWS` reducer both indexed by `row.id` directly, so any consumer passing rows without a native `id` field would silently collide all rows on `undefined` in the lookup map, produce `undefined` React keys, and trigger a "Each child in a list should have a unique key prop" warning. Fixed by normalizing `activeRows` through `effectiveGetRowId` into `normalizedRows` (via `useMemo`) immediately after `effectiveGetRowId` is derived. The normalization is a no-op when the default `(row) => row.id` is used, so there is no overhead for the common case.

---

## [1.0.3] — July 30, 2026 📚

### Fixed
- **API reference expanded to full surface coverage**: `docs/API_REFERENCE.md` grew from 188 to 1,132 lines. Added 8 new top-level sections — server-side data source (`GridDataSource`, `GridGetRowsParams`, `GridGetRowsResponse`), all event callback param types (`GridRowParams`, `GridCellParams`, `GridColumnOrderChangeParams`, `GridRowOrderChangeParams`, `GridDetailPanelParams`), column and row pinning types, full filter model deep reference (per-type operator table, `GridFilterGroup` nesting), grid state and initial state slice reference, aggregation reference (all 6 built-in functions, `getAggregationPosition` semantics), row grouping, column group headers, and list view. DataGrid props section restructured into 13 feature-area sub-tables covering every previously undocumented prop. Developers building server-side sorting + aggregation + pinned columns no longer need to read TypeScript source.

---

## [1.0.2] — July 30, 2026 📚

### Fixed
- **`GridColDef` documentation**: Added all previously undocumented column properties — `flex`, `minWidth`, `maxWidth`, `align`, `headerAlign`, `description`, `editable`, `renderHeader`, `renderEditCell`, `cellClassName`, `headerClassName`, `disableColumnMenu`, `groupable`, `aggregable`, `availableAggregationFunctions`, `valueOptions` (for `singleSelect`), `colSpan`, `rowSpan`. Both `README.md` and `docs/API_REFERENCE.md` now carry the complete table.
- **Hooks documentation**: Expanded the stubs in `docs/API_REFERENCE.md` into full reference entries. `usePivot` (was entirely missing), `useGridStateStorage` (was one sentence — now has a full options + return table and code example), `useAggregation` (now has params/return tables and built-in function list), `useGridApiRef` (corrected description and added usage example).

---

## [1.0.1] — July 30, 2026 📚

### Fixed
- **Bundled documentation accuracy**: All doc files shipped inside the npm package (`docs/`) have been corrected to match the actual v1.0.0 API. Key fixes: removed non-existent `pageSize` standalone prop (correct API is `paginationModel` + `pageSizeOptions`), fixed `height` type to `number | string`, corrected `onColumnOrderChange` params shape, removed non-existent `isRowSelectable` and `reorderable` props, fixed `GridFilterModel.items` type, added missing `GridApi` methods (`getFilterModel`, `getAllColumns`, `setPageSize`, `getAggregationResult`, `getAggregationModel`, `copySelectedRows`), and corrected `GridInitialState` persisted state fields. AI agents (Cursor, Copilot, Windsurf) reading bundled docs will now generate accurate code.
- **README API reference**: Same prop and type corrections applied — complete `apiRef` method list, new prop tables for Events, Columns, Pinning, Inline Editing, Row Reordering, and updated comparison table.

---

## [1.0.0] — July 30, 2026 🚀

First stable public release. All 32 demo pages ship with a live source viewer. npm publish workflow is live.

### Added
- **npm publish workflow**: GitHub Actions workflow (`.github/workflows/npm-publish.yml`) triggers on any `v*.*.*` tag push — runs lint, build, then `npm publish`. The package is now publicly available as `@opencorestack/opengridx` on the npm registry.
- **Source viewer on all 32 demos**: Every demo page now uses `DocsLayout` with a collapsible "View Source" tab showing the full component source code. Previously only 7 of 32 demos had this; the remaining 25 have been migrated.

### Changed
- **Version**: `0.1.x` pre-release series → `1.0.0` stable. The public API (`DataGridProps`, `GridColDef`, `GridApi`, all hooks and types) is now considered stable.
- **Demo consistency**: All 32 demos share the same `DocsLayout` shell — consistent title, description, live preview, and source viewer. Inline `<h1>` / `<h2>` + `<p>` manual headers removed from every migrated demo.

### Fixed (during migration)
- `PivotModeDemo` — `apiRef: any`, `fallbackRows: any[]`, `props: any` toolbar → fully typed
- `InfiniteScrollDemo` — introduced `PersonRow` interface, all `any` in data source and sort params replaced
- `ServerSideAggregationDemo` — `(a as any)[field]` field access → `keyof Employee` keyed access
- `AggregationFooter` + `ServerSideAggregationDemo` — `valueFormatter: { value: any }` → `unknown` with narrowing
- `SlotsDemo` — added `EmployeeRow` interface, `renderCell: (params: any)` × 2 replaced
- `CRUDTutorial` — `renderCell: (params: any)` → `GridRenderCellParams<User>`
- `RealEstatePortfolio` — `useState<any>` for pinnedColumns → `useState<GridColumnPinning>`
- `ExportDemo` — `apiRef: any` → `ReturnType<typeof useGridApiRef>`, `rowsToPrint: any[]` → typed
- `CustomPagination` — `(props: any)` component signature → explicit typed interface
- `Editing` — `handleProcessRowUpdate = (newRow: any)` → `MockRow` inferred from data

---

## [0.1.10] — July 30, 2026 🐛🔒

### Fixed
- **`onRowClick` never fired when `onCellClick` was registered**: `Cell.tsx` was calling `e.stopPropagation()` inside its click handler whenever `onCellClick` was provided. This silently ate the event before it could bubble to the row's `onClick` handler, making `onRowClick` permanently unreachable from cell clicks. Removed the stopPropagation — both callbacks now fire in the natural bubble order (cell first, then row), matching standard data grid behavior.
- **Column visibility panel list not updating after column reorder**: The toolbar was receiving `effectiveColumns` (the pre-ordering array, in original definition order) instead of `orderedColumns` (the reordered array). After a drag-reorder in the panel, the grid columns reordered correctly but the panel list stayed frozen in definition order. Fixed `toolbarProps.columns` to use `orderedColumns`.
- **Reset button ignoring column sequence**: The Reset button in the column visibility panel called `onShowAll` only (restoring visibility), leaving any user-reordered sequence in place. Added `onColumnOrderReset` prop threaded from `ColumnVisibilityPanel` → `ColumnsPanelWrapper` → `GridToolbar` → `DataGrid`. DataGrid provides `() => setInternalColumnOrder(columns.map(c => c.field))` to restore original definition order on reset.
- **`FilterPanelDemo` filter panel inaccessible**: The demo had no `slots={{ toolbar: GridToolbar }}`, so the toolbar never rendered and the filter icon never appeared. Added the toolbar slot and rewrote the demo to use `DocsLayout` (consistent with all other demos).
- **`EventsDemo` event handlers never fired**: `onRowClick` was broken by the stopPropagation bug above. `onFilterModelChange` and `onColumnOrderChange` were dead — no toolbar existed to trigger them. Fixed by adding `slots={{ toolbar: GridToolbar }}`. Also replaced three `any`-typed handler signatures with `GridSortItem[]`, `GridFilterModel`, and `GridColumnOrderChangeParams`.
- **`FilterPanel` debounce stale-closure bug**: The 300 ms debounce `useEffect` read `item`, `col.field`, and `currentOperator` directly from closure (stale values after operator or field changes), suppressed with `eslint-disable-next-line`. Replaced with a refs-sync pattern (`useLayoutEffect` writing `itemRef`, `colFieldRef`, `operatorRef` each render) so the effect reads current values without the lint suppression and without stale closures.

### Changed
- **Type safety — full `any` elimination**: Every `any` across `lib/` replaced with explicit types or `unknown`. Key changes: `GridRowModel` index signature `any → unknown` (with explicit internal row fields added to the type), all cell/value/error params typed as `unknown`, aggregation functions typed as `(values: unknown[]) => unknown`, `GridAggregationResult` typed as `Record<string, unknown>`, slot component types use `Record<string, unknown>`, export utilities narrowed with `instanceof Error` guards.
- **No more lint suppressions**: Removed all `eslint-disable-next-line react-hooks/exhaustive-deps` comments — every case fixed at the root cause rather than suppressed. Methods include: state refactors (`scrollTick` anti-pattern → `scrollTop`/`scrollLeft` state), ref patterns for stable callbacks, and correct dep arrays.
- **DataGrid.tsx continued decomposition**: Further hooks and components extracted — `useGridScrollSync` (RAF-batched scroll state), `useGridVirtualization`, `useGridVisibleRows`, `useGridColumns`, `GridAggregationFooter`, `GridEmptyState`, `GridErrorOverlay`, `GridVirtualRows`, `GridPinnedRows`, `GridStandaloneColumnPanel`, `GridListView`. Each module has a single clear responsibility and typed params/return interface.

---

## [0.1.9] — July 29, 2026 🛠️✨

### Added
- **`GridApi.scrollToIndexes`**: New imperative API method `apiRef.current.scrollToIndexes({ rowIndex?, colIndex? })` scrolls the viewport to bring any row and/or column into view. Column index addresses all data columns (left-pinned + unpinned + right-pinned); pinned columns are always visible so they are silently skipped. Row scrolling accounts for variable-height rows (expanded detail panels, grouped rows).
- **`useGridKeyboardNavigation` hook**: Extracted ~370 lines of keyboard navigation state and handlers from `DataGrid.tsx` into a standalone `useGridKeyboardNavigation` hook. Fixes a previously dead code path where pressing Enter/Space on a header cell never triggered column sort (the edit handler ran first). The hook is part of the public `lib/` source.
- **`useLayout` hook**: Extracted all layout-computation logic from `DataGrid.tsx` into a standalone `useLayout` hook, reducing the main component by ~350 lines.
- **Test suite**: Added Vitest + `@testing-library/react` infrastructure with 65 unit tests covering `filterRows`, `sortRows`, `useAggregation`, and a DataGrid smoke test.
- **ScrollToIndexes demo**: New `/scroll-to` demo page showcasing the `scrollToIndexes` API with live row/column index controls.

### Fixed
- **Excel export file format error**: `exportToExcel` generates an HTML-table file with `application/vnd.ms-excel` MIME type (the legacy XLS trick). All demo call-sites were passing explicit `.xlsx` filenames, causing Excel 2007+ to reject the download with "file format or file extension is not valid". Changed all `exportToExcel` usages to `.xls`. `exportToExcelAdvanced` (ExcelJS, real OOXML) is unaffected and correctly keeps `.xlsx`.
- **Keyboard sort on column headers**: Enter/Space on a focused header cell now correctly triggers sort. Previously the generic Enter-edit handler ran first, making header sort unreachable via keyboard.
- **ESLint errors**: Resolved all lint errors across the library — hooks called after conditional early returns (`Cell.tsx`, `Row.tsx`), ref mutations in the render phase moved to `useLayoutEffect`, and portal targets reading `ref.current` during render moved to `useState + useLayoutEffect`.

---

## [0.1.8] — March 18, 2026 🐛✨

### Fixed
- **Toolbar Component Identity:** Fixed a major bug where defining the `GridToolbar` within a component's render body produced a new React component reference on every render, causing the toolbar to constantly unmount and remount (destroying all internal states like open panels or typed search text). Replaced `React.createElement` with direct function invocation in the `StableWrapper` to bypass React's component-identity check and persist internal DOM state.
- **Global Search Focus Preservation:** Refactored `GlobalSearch` into an uncontrolled component to prevent continuous data re-renders from stealing focus. Added a `useLayoutEffect` to automatically restore browser focus to the input field if a React virtual DOM diff incidentally drops it mid-keystroke.
- **Filter Panel Auto-Dismiss:** The Advanced Filter panel no longer collapses indiscriminately when clicking into numeric filter fields or during parent re-renders. Implemented a stable callback ref that prevents the underlying event listeners from rehooking during typing. Click-outside auto-close has been structurally disabled in favor of an explicit "Close" button.
- **Pivot Mode Aggregation:** Addressed a critical bug where `aggregationModel` was trying to read base columns (e.g. `revenue`) on pivot rows that use synthetic column keys (e.g. `Q1\u001frevenue\u001fsum`), resulting in broken totals.
  - The aggregation footer now renders synthetic pivot totals correctly.
  - The `GridToolbar` now actively provisions `effectiveColumns` to the `AggregationPanel` to allow users to build summaries on pivot dimensions.
  - Added a built-in "Grand Total" row appended directly to the `usePivot` output to generate automatic baseline column totals.
- **Exporting Selected Rows:** Corrected data omission in the Demo files where print exports were grabbing the entire dataset instead of respecting active row selection. Used `apiRef.current.getSelectedRows()` to extract standard export data without requiring explicit prop-threading.

---

## [0.1.7] — March 13, 2026 🐛✨

### Added
- **`exportable` Property**: Added `exportable?: boolean` to `GridColDef`. This allows excluding specific columns (like action buttons, menus, or images) from all export formats (CSV, Excel, JSON, and Print).
- **AI-Native Integration**: The published npm package now includes raw source code (`lib/`) and full documentation (`docs/`). This allows AI agents (Cursor, Windsurf, Copilot) to "see" the implementation patterns and documentation inside `node_modules`, leading to significantly better code generation for downstream users.

### Fixed
- Fixed an issue where the main wrapper `className` would erroneously include extra whitespace (e.g. `ogx    `) when no optional classes were active.
- Fixed an issue where `onRowOrderChange` drag-and-drop visuals didn't actually update in the `EventsDemo` component examples because it was referencing a static array instead of React State.
- Corrected a TypeScript regression where `headerClassName` comment structure was accidentally broken during the previous update.

### Changed
- Refined the npm package publication files: `docs/research` and `docs/assets` (large binary images) are now excluded to keep the package size lean while retaining all high-value documentation for humans and AI.


## [0.1.6] — March 12, 2026 🎨

### Added
- Complete theming support for all advanced dropdown panels (Column Visibiity, Filter Editor, Pivot Mode, Global Search) so they correctly adapt to custom themes via `<DataGridThemeProvider>`.
- Aggregation, Pivot, filtering, and export capability options now appear directly in the `ThemingDemo` example.

### Changed
- Replaced the hardcoded portal mounting (`document.body`) on popovers to instead intelligently hunt for `.ogx-theme-provider` to organically inherit user themes in overlay panels.
- Fixed GlobalSearch input focus shadow not fully respecting CSS variables.

---

## [0.1.5] — March 10, 2026 🐛

### Fixed
- Exported missing public types (`GridSortItem`, `GridApi`, `GridRowSelectionModel`, `GridColumnVisibilityModel`, etc.) in `lib/index.ts` to prevent developers from having to derive them manually using `NonNullable`.

---

## [0.1.4] — March 10, 2026 ✨

### Added
- **Column Visibility Reorder**: Added a drag handle to the `ColumnVisibilityPanel` letting users seamlessly reorder columns directly via the Visibility Panel dropdown checkbox list. Uses native HTML Drag and Drop API with no external dependencies.
- Added `onColumnReorder` support to `ColumnVisibilityPanel` and `GridToolbar`.

### Fixed
- `import '@opencorestack/opengridx/styles'` now resolves correctly in TypeScript projects. The `./styles` subpath export in `package.json` now includes a `types` pointer to `dist/opengridx.css.d.ts`, eliminating the "Cannot find module" TS error.
- `build:lib` script now copies `opengridx.css.d.ts` into `dist/` automatically so it's always included in published packages.

---

## [0.1.3] — March 10, 2026 🐛✨

### Added
- `llms.txt` bundled inside the npm package — a machine-readable AI agent API context file with complete props reference, type definitions, and usage examples. Located at `node_modules/@opencorestack/opengridx/llms.txt` after installation.

### Fixed
- CSS now explicitly imported at the barrel entry (`lib/index.ts`), ensuring styles are never silently dropped by bundlers (Vite, Webpack, Next.js App Router) that don't auto-resolve side-effect CSS from library packages.
- Column resize: `ColumnResizeHandle` now uses the logical stored width (`currentWidth` prop) instead of reading DOM `getBoundingClientRect()`, fixing resize jitter and incorrect delta calculations on second+ drag.
- Pinned column resize: Resizing a pinned (sticky) column no longer corrupts its displayed width — the DOM measurement was previously offset by the sticky `left`/`right` position, causing an erroneous width jump on first drag.

### Docs
- Updated `README.md` to accurately describe CSS handling and provide a clear fallback import instruction for all environments.

---

## [0.1.2] — March 6, 2026 🐛

### Fixed
- Cell editing state now correctly pushes to internal state (`baseRows`) instead of being overridden by rigid `props.rows` bindings, preventing data loss on successive edits.

---

## [0.1.1] — March 6, 2026 🔧

### Fixed
- ExcelJS correctly marked as external in Vite build config (consistent with `peerDependencies`)
- Clipboard programmatic copy button now correctly reads live selection state via `apiRef.getSelectedRows()`
- `Ctrl+C` keyboard shortcut now works when grid checkboxes are focused

### Improved
- Package size reduced from 8.4 MB → 1.8 MB unpacked (ExcelJS no longer bundled)
- README rewritten with Getting Started first, basic example, and full API reference table
- Cleaned devDependencies (removed unused `strip-comment`, `strip-comments`)

---

## [0.1.0] — March 6, 2026 🚀

> **Status: ✅ RELEASE READY — 100% feature-complete for v0.1.0 scope**

This is the initial public release of OpenGridX. All planned v0.1.0 features are implemented, tested, and included in the production bundle.

### ✅ Core Features
- **High-Performance Virtualization** — Custom row + column virtual scrolling engine, 60fps at 100k+ rows
- **Multi-Column Sorting** — Client-side and server-side; stable multi-field sort
- **Advanced Filtering** — 11+ operators (contains, equals, startsWith, etc.) with AND/OR filter builder UI
- **Pagination** — Client-side and server-side modes with configurable page sizes
- **Row Selection** — Single and multi-row checkbox selection with `rowSelectionModel` controlled/uncontrolled API

### ✅ Advanced UI & Layout
- **Column Pinning** — Left and right sticky columns with correct z-index layering
- **Row Pinning** — Top and bottom pinned rows with visual separation
- **Column Resizing** — Throttled drag-to-resize at 60fps with minimum width enforcement
- **Column Reordering** — Drag-and-drop column reorder
- **Row Reordering** — Drag-and-drop row reorder with `onRowOrderChange` callback
- **Detail Panels** — Expandable master-detail rows via `getDetailPanelContent`
- **Cell & Row Spanning** — `colSpan` and `rowSpan` support for merged-cell layouts
- **List View Mode** — Card-based responsive layout via `listView` / `listViewColumn`
- **Column Grouping** — Multi-level column header groups via `columnGroupingModel`
- **Toolbar** — Built-in toolbar with column visibility, filter, and density controls; fully replaceable via `slots`

### ✅ Data Management
- **Inline Cell Editing** — Double-click or Enter to edit; `editable` per column; `processRowUpdate` callback
- **Tree Data** — Client-side hierarchical rows via `treeData` + `getTreeDataPath`
- **Row Grouping** — Group rows by column value with collapsible groups and aggregation summaries
- **Aggregation** — SUM, AVG, COUNT, MIN, MAX in group footers and global sticky footer
- **Pivot Mode** — Multidimensional data pivoting via `pivotMode` + `pivotModel`

### ✅ Server-Side Integration
- **Data Source API** — `useGridDataSource` hook for unified server-side fetching
- **Server-Side Sorting, Filtering & Pagination** — All offloaded cleanly to the backend
- **Infinite Scroll** — Viewport-triggered batch-loading (`paginationMode="infinite"`)
- **Server-Side Tree Data** — Lazy children loading via `dataSource.getChildren`
- **Server-Side Aggregation** — Fetch summary totals directly from API responses

### ✅ Export
- **CSV Export** — `exportToCsv()` utility, respects `valueFormatter`
- **Excel Export** — Basic `.xlsx` via `exportToExcel()`; advanced pixel-perfect image-embedded export via `exportToExcelAdvanced()` (lazy-loads ExcelJS)
- **JSON Export** — `exportToJson()`
- **Print** — `printGrid()` with print-optimised CSS

### ✅ Clipboard
- **Keyboard Copy** — `Ctrl+C` / `Cmd+C` copies selected rows as TSV (tab-separated values)
- **Programmatic Copy** — `apiRef.current.copySelectedRows()` for button-triggered copying
- **Excel/Sheets Compatible** — TSV output pastes cleanly into any spreadsheet app
- **Smart Focus Handling** — Does not intercept `Ctrl+C` in text inputs; correctly handles checkbox-focused grid cells

### ✅ Theming
- **`DataGridThemeProvider`** — React context-based global theming
- **5 Built-in Themes** — `darkTheme`, `roseTheme`, `emeraldTheme`, `amberTheme`, `compactTheme`
- **CSS Variables** — Full `--ogx-*` token system; Shadow DOM compatible
- **`cellClassName` / `headerClassName`** — Per-column custom class injection

### ✅ Accessibility (WCAG 2.1 AA)
- Semantic ARIA roles: `grid`, `row`, `gridcell`, `columnheader`
- `aria-sort`, `aria-selected`, `aria-expanded`, `aria-readonly`, `aria-label` throughout
- Full keyboard navigation: Arrow keys, Tab, Enter, Escape, Home/End, PageUp/PageDown
- Visible focus ring in keyboard mode (CSS classname-toggled, zero React state overhead)

### ✅ State Persistence
- **`initialState` prop** — Restore column widths, visibility, sort, and filter on mount
- **`useGridStateStorage(key)` hook** — Auto-saves to `localStorage`; pluggable storage backend

### ✅ Developer Experience
- **`apiRef`** — Full imperative API: `getSelectedRows`, `copySelectedRows`, `selectRow`, `sortColumn`, `setFilterModel`, `getVisibleRows`, `scrollToIndexes`, and more
- **`slots` System** — Replace Toolbar, Pagination, NoRowsOverlay, LoadingOverlay, Footer
- **`slotProps`** — Pass custom props to slot components
- **TypeScript** — 100% typed; full `index.d.ts` output via `vite-plugin-dts`
- **Zero UI Dependencies** — No Ant Design, MUI, or Radix. Pure React + vanilla CSS (BEM)

### 📦 Bundle
| Artifact | Minified | Gzipped |
|---|---|---|
| `opengridx.es.js` (ES Module) | 226 KB | **52 KB** |
| `opengridx.umd.js` (UMD) | 1,089 KB | 315 KB |
| `opengridx.css` | 59 KB | **10 KB** |
| `exceljs` (lazy, Excel export only) | 1,385 KB | 302 KB |

---

## 🗺️ Planned for v0.2.0

- **Rich Excel Styling** — Bold headers, background fill, border styles natively via ExcelJS (no post-processing)
- **Cell Range Clipboard** — Select a rectangular cell region (mouse drag), copy to clipboard, paste from Excel back into editable cells

---

*Last Updated: March 18, 2026*
