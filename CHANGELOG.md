# OpenGridX — Changelog

**Package**: `@opencorestack/opengridx`
**License**: MIT © 2026 Open Core Stack

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
