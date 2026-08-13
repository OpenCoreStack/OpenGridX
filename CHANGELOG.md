# OpenGridX — Changelog

**Package**: `@opencorestack/opengridx`
**License**: MIT © 2026 Open Core Stack

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
