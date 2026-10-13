# OpenGridX Roadmap & Feature Status

This document tracks the current status of features in `OpenGridX` and outlines the roadmap for future development.

## ✅ Implemented Features

### Core
*   **Virtualization**: Row virtualization plus horizontal virtualization of unpinned columns. Requires a bounded grid height (see `docs/features/virtualization.md`).
*   **Sorting**: Client-side and server-side multi-column sorting.
*   **Filtering**: Client-side filtering with support for various operators.
*   **Pagination**: Client-side and server-side pagination with customizable page sizes.
*   **Selection**: Row selection (single/multiple) with checkbox support.

### Advanced UI
*   **Advanced Filtering**: Client-side complex filter builder (AND/OR logic, recursive groups).
*   **Column Pinning**: Pin columns to the left or right.
*   **Row Pinning**: Pin rows to the top or bottom.
*   **Column Reordering**: Drag-and-drop column reordering.
*   **Column Resizing**: Interactive column resizing.
*   **Detail Panels**: Expandable rows to show custom detail views.
*   **Row Reordering**: Drag-and-drop row reordering.

### Data Management
*   **Editing**: Inline cell editing with value parsing/formatting.
*   **Tree Data**: Hierarchical data display (Client-side).
*   **Row Grouping**: Grouping rows by column values (Client-side).
*   **Spanning**: Row and Column spanning (Cell merging).
*   **Export**: CSV, JSON, Print, basic Excel (HTML-table). **Advanced Excel Export** via ExcelJS — real `.xlsx` with styled headers, typed cells (number/date/boolean), column widths, frozen rows, auto-filter, alternating row colors, aggregation totals, and multi-sheet workbooks.
*   **Pivot Mode**: Cross-tabulation of data — group rows into columns dynamically with aggregation (Sum, Avg, Count, Min, Max).

### Server-Side Integration
*   **Server-Side Data Source**: Hook-based integration for server-side sorting, filtering, and pagination.
*   **Infinite Scroll**: Automatically load more rows as the user scrolls (`paginationMode='infinite'`).
*   **Server-Side Tree Data**: Lazy loading children nodes, partial hierarchy fetching support.
*   **Server-Side Aggregation**: Sum, Avg, Count, Min, Max — computed server-side over the full dataset, with a sticky footer row and toolbar Σ panel.

### CSS & Theming *(completed 2026-02-19)*
*   **CSS Barrel File** (`lib/styles/opengridx.css`): Single entry point — variables → reset → components.
*   **Consistent Naming Convention**: `--ogx-*` CSS variables, `ogx__` BEM class prefix.
*   **Theming API**: `<DataGridThemeProvider theme={myTheme}>` component mapping a `GridTheme` object to `--ogx-*` CSS variables, with built-in light/dark/compact presets.
*   **Production Build Optimisation**: Code-split demo reduces initial bundle by 98.6% via React.lazy + manualChunks.

### Accessibility & Clipboard *(completed 2026-03-03)*
*   **ARIA roles**: `role="grid"`, `role="row"`, `role="gridcell"`, `role="columnheader"` on correct elements.
*   **ARIA attributes**: `aria-sort`, `aria-selected`, `aria-label`, `aria-expanded`, `aria-readonly`, `aria-haspopup` throughout. v3.0 adds `aria-level` / `aria-expanded` on hierarchy rows, `aria-multiselectable`, and `aria-sort` on the primary sort column only.
*   **Keyboard navigation**: Enter / Escape / Arrow keys / Home / End / PageUp / PageDown, Shift+Space and Ctrl+A selection, Alt+ArrowDown for the column menu; the grid is a single Tab stop (v3.0). See [Keyboard & Accessibility](features/keyboard-navigation.md).
*   **`aria-rowcount` / `aria-rowindex` and `aria-colcount` / `aria-colindex`**: Count header rows and system columns, number rows across pages and pinned rows, and match between header and body cells (corrected in v3.0).
*   **Clipboard**: Full TSV-formatted copy support (Ctrl+C / Cmd+C) for seamless integration with Excel/Google Sheets.

### Advanced Excel Export *(completed 2026-03-03)*
*   **`exportToExcelAdvanced`**: Real `.xlsx` via ExcelJS (lazy-loaded — zero bundle cost unless used).
*   **Features**: Styled headers, typed cells, column widths from `colDef.width`, frozen header row, auto-filter dropdowns, alternating row colors, aggregation totals rows, multi-sheet workbooks, standalone summary sheet.
*   **API**: `ExcelAdvancedExportOptions`, `ExcelSheetDefinition`, `ExcelColumnStyle` — all exported and documented.
*   **Demo**: `AdvancedExcelExportDemo` in demo app (`Data Management` category).
*   **Docs**: `docs/features/export-guide.md` fully updated with feature comparison table and all options.

### Code Quality & Architecture *(completed 2026-07-29 → 2026-07-30)*
*   **DataGrid decomposition**: Extracted `useGridControlledState`, `useGridRowPipeline`, `useGridVirtualization`, `useGridScrollSync`, `useGridVisibleRows`, `useGridColumns` hooks, plus `GridEmptyState`, `GridErrorOverlay`, `GridAggregationFooter`, `GridVirtualRows`, `GridPinnedRows`, `GridStandaloneColumnPanel`, `GridListView` components from `DataGrid.tsx`. Each module has a single clear responsibility with typed params and return interfaces.
*   **Full `any` elimination**: Every `any` across `lib/` replaced with proper types or `unknown`. `GridRowModel` index signature, all cell/value/error params, aggregation functions, slot types, and export utilities are now fully typed. Zero `eslint-disable` suppressions remain — every case fixed at the root.
*   **Regression test suite**: 3 test files covering column-visibility-model persistence, pivot aggregation correctness including grand-total avg and null-value exclusion, and pagination rendering/row key stability.
*   **Pivot null-value fix**: `Number(null) === 0` caused null numeric fields to be silently included as `0` in avg/min/max pivot aggregation. Both the per-row bucket loop and the grand-total bucket loop in `usePivot.ts` now guard with `raw != null` before pushing values.

### Bug Fixes *(completed 2026-07-30)*
*   **`onRowClick` never fired when `onCellClick` was registered**: `Cell.tsx` called `e.stopPropagation()` on every cell click, silently preventing events from reaching the row's `onClick` handler. Removed — both callbacks now fire in natural bubble order.
*   **Column visibility panel order not updating after reorder**: Panel received `effectiveColumns` (pre-ordering, definition order) instead of `orderedColumns`. Fixed — panel list now reflects the live reordered sequence.
*   **Reset button ignoring column sequence**: Reset only restored visibility; column order was left wherever the user dragged it. Added `onColumnOrderReset` callback that restores `internalColumnOrder` to original definition order.
*   **`FilterPanel` debounce stale-closure**: Debounce effect read `item`/`col.field`/`currentOperator` from stale closure, previously suppressed with `eslint-disable`. Replaced with `useLayoutEffect` refs-sync pattern.
*   **`FilterPanelDemo` inaccessible**: Missing `slots={{ toolbar: GridToolbar }}` meant the filter panel had no UI entry point. Fixed; demo also migrated to `DocsLayout`.
*   **`EventsDemo` dead handlers**: Fixed broken `onRowClick`, dead filter/column-order callbacks, and three `any`-typed handler signatures.

---

## 🗓️ Q4 2026 Roadmap (October – December)

**Theme: free spreadsheet editing, with AI you control.** Range selection, paste, undo/redo and a fill handle are paid features in MUI X Premium and AG Grid Enterprise, and clipboard paste (476 👍) and cell range selection (317 👍) are among the most-requested grid features on GitHub. The research behind this plan compared ten competing grids and their AI features.

**Team:** one maintainer plus an AI coding assistant. The plan is sized for that: one headline feature per release, and anything that slips moves to the next release instead of stretching the current one.

**Compatibility:** everything ships in 3.x minor releases. Each new interaction is opt-in through a prop, so existing grids behave exactly as before until the feature is enabled.

### Releases

| Release | Target | Headline | Also in it |
| :--- | :--- | :--- | :--- |
| **3.3.0** ✅ | shipped 7 Oct | **Cell range selection** (opt-in `cellSelection` prop): mouse drag, Shift+click, Shift+arrows; Ctrl+C / Cmd+C copies the block as TSV | Selection status bar (count, sum, average of selected cells); wrapped header text; React Compiler compatibility check |
| **3.4.0** ✅ | shipped 8 Oct | **Paste from Excel / Google Sheets** into the selection, through `processRowUpdate` (values parsed per column type or `valueParser`, non-editable cells skipped, `onClipboardPaste` summary); **Delete clears a range**; built-in inputs and editors use the shared `Input` / `Checkbox` (`Input variant="cell"`). **Undo / redo** for cell edits and pastes (Ctrl+Z, Ctrl+Shift+Z / Ctrl+Y, `apiRef.undo()` / `redo()`) | **AI toolkit, part 1** in a new `@opencorestack/opengridx/ai` entry point: `getGridAiSchema(columns)` (JSON Schema of the filter, sort, grouping, aggregation, pivot and visibility models the columns allow) and `validateGridAiState(json, columns)` (drops unknown fields and operators, coerces values, returns errors) |
| **3.5.0** ✅ | shipped 9 Oct | **AI toolkit, part 2**: `aiAssistant={{ onPrompt }}` Ask AI panel (chips, Undo, voice) that calls the app's own model through `createGridAiPromptHandler`; only validated replies apply; `createGridAgentTools(apiRef, columns)` (plain tool objects for CopilotKit, the Vercel AI SDK, provider tool calling or WebMCP) | **Header filter row** (`headerFilters`); **fill handle** (series, Alt copy, Ctrl/Cmd+D / R); `rowGroupingModel` controlled/uncontrolled pair |
| **3.5.1** ✅ | shipped 10 Oct | **Content height capped to the browser's limit** (Firefox collapsed grids taller than ~17.9M px) | Dev warning names the reachable row count |
| **3.6.0** ✅ | shipped 12 Oct | **Sorting 3–5× faster** (typed-array keys) | Next.js `'use client'` banner; optional peers safe in webpack / Turbopack; **RTL parts 1 and 2** (pinned columns); header filter `localeText` |
| **3.7.0** ✅ | shipped 13 Oct | **Theme Builder** demo page + 16 theme keys | `DataGrid.tsx` split (`GridRoot` / `GridViewport`, composite hooks); types split per domain; demo smoke test |
| **3.7.1** ✅ | shipped 13 Oct | Audit fixes: exports survive a throwing `valueGetter`; **formula escaping of `valueFormatter` text** (security) | Quick filter matches shown text; date paste fixes; list view theme; CSS reset scoped to the grid |
| **3.8.0** ✅ | shipped 13 Oct | **Edits at 1M rows 10–20× faster** (in-place row store; edit ~35 ms, paste ~45 ms) | Group expand ~2×, collapse ~1 ms |
| **3.8.1** ✅ | shipped 13 Oct | **Grid buttons keep their own styles** (AI panel, toolbar active states) | Exact `bigint` sort; stricter number text; dead-code cleanup; every export documented |
| **3.9.0** ✅ | shipped 13 Oct | **`localeText` for every UI string** (~200 keys) | 9 theme keys + Theme Builder controls; rows stay memoised through selection and editing; demo sidebar by priority |
| **3.9.1** ✅ | shipped 13 Oct | **npm package no longer ships 1.6 MB of test baselines** | `check:package` guard in CI; version badges read `package.json`; docs brought up to date |
| 3.10.0 | open | AI change chips translatable | Backlog work below |
| Freeze | 19 Dec – 5 Jan | Bug fixes only | — |

### Now: backlog first (feature hold since 13 Oct)

New features (the *Next* list below) wait until the open fixes, refactors and performance work are done. Tracked in [`superpowers/plans/2026-10-13-audit-tracker.md`](superpowers/plans/2026-10-13-audit-tracker.md):

*   **Refactors** (no behaviour change): about 40 `as unknown as` casts (R4), files over 600 lines such as `GridToolbar.tsx` (R5), hooks with very wide parameter lists such as keyboard navigation (R6).
*   **Performance**: ✅ select-all at 1M rows ~260 → ~130 ms (3.10, no API change). ❌ The time-sliced filter / sort pipeline is closed: it was 1.5–2× slower in total (target ≤ 20 %) and the remaining 1M-row sort pause is better served by a `dataSource`; see the [proposal's status](superpowers/specs/2026-10-12-nonblocking-pipeline-proposal.md).
*   **Demo**: syntax highlighting in the source viewer.
*   **Bundle size (4.0)**: an app using only `DataGrid` ships 87 KB gzipped; opt-in [feature modules](superpowers/specs/2026-10-13-feature-modules-proposal.md) would save ~20 KB. Breaking, so planned for 4.0.

### Across the quarter

*   ✅ **Published benchmark** (done 9 Oct): reproducible 10k / 100k / 500k / 1M-row numbers (scroll frame times, sort, filter and grouping time, memory, the reachable row) in [`docs/performance.md`](performance.md#benchmarks); rerun with `npm run bench`.
*   ✅ **Next.js App Router guide** (done 12 Oct): [`docs/features/nextjs.md`](features/nextjs.md), verified with `next build` / `next start` on Next.js 15.5 and 16.4. The ES bundle now starts with `'use client'`.
*   ✅ **RTL check** (done 12 Oct): [`docs/features/rtl.md`](features/rtl.md). Fixed: text alignment, horizontal scrolling and column virtualization, arrow keys, the resize and fill handles, range outlines and auto-scroll, toolbar panel placement; pinned columns followed in RTL part 2.
*   **Demo site**: ✅ source viewer on every example (`DocsLayout` with Vite `?raw`); syntax highlighting still open.

### Definition of done for each feature

*   A short design note in `docs/superpowers/specs/` before coding starts (API, keyboard behaviour, ARIA).
*   Unit tests, browser tests in Chromium, Firefox and WebKit, and a scenario in the package smoke suite.
*   Keyboard-only and screen-reader pass: the grid stays a single Tab stop and announces selection changes.
*   API reference, feature guide, demo page, CHANGELOG and `llms.txt` updated (the wiki follows automatically).
*   Bundle budget: the core bundle grows only by the feature itself; the `/ai` entry point has no dependencies and adds nothing when it is not imported.

### Rules for the AI toolkit

*   OpenGridX never calls an AI service and never bundles an AI SDK. The app passes a function that calls whichever model it uses.
*   By default only column definitions and grid state are sent, never row data. Example values are opt-in per column and documented as real data.
*   Model output is always validated against the schema (the grid applies only a validated, branded result), and every change it makes is shown as a removable chip with one-click undo.
*   The schema carries a `schemaVersion`, since apps will cache prompts against it.

### Risks

*   **Range selection touches focus and keyboard handling**, where most v3.0 fixes landed. It is opt-in and gets the longest test cycle; if it slips, 3.4.0 moves rather than shipping paste on an unstable base.
*   **Undo must cover rejected updates**: a `processRowUpdate` that throws or a paste that partly fails must leave the history consistent.
*   **Wrong AI filters** that look plausible: the validator, visible chips and undo are required, not optional.

## 🔭 Next (Q1 2027) — on hold until the backlog above is closed


*   **Row reordering inside tree data and row groups**, touch-friendly (MUI #4821, 405 👍, not in MUI X).
*   **Find & highlight** (Ctrl+F through cells), **right-click context menu**, **Excel-style value (set) filter**.
*   **Calculated columns** (`[price] * [qty]` defined by users).
*   **Interactive pivot builder**: drag-and-drop panel for pivot and grouping.
*   **Sparklines** and a charts adapter that passes grid state to any chart library.
*   **AI toolkit, part 3**: smart paste (unstructured text → pending rows) and `apiRef.getAiContext()` for "summarise selection"; an `opengridx-mcp` docs server for coding assistants.
*   **Tailwind / shadcn theme preset**, sticky header against page scroll.
*   ✅ **RTL, part 2** (done 12 Oct, [`rtl.md`](features/rtl.md)): pinned columns and pinned system columns with logical sticky offsets and mirrored shadows, column menu pinning by screen side, mirrored pagination arrows and tree chevrons, a direction change on a mounted grid, column reorder by drag checked. Remaining: the bidi-mirrored header filter operator symbols (the menu labels became `localeText` keys in 3.9).

### Not planned

*   **Spreadsheet formulas** (`=SUM(A1:A9)`): a formula engine is a product of its own; calculated columns cover most of the need.
*   **AI on every cell**: the cost grows with each row and results are not reproducible.
*   **Built-in semantic search or anomaly detection**: large models and app-specific logic; better built by the app on top of the grid.
*   **Scaled scrolling past ~645,000 rows** and **list-view virtualization**: revisit if users ask.

## ✅ Implemented Features (Recent)

### 3.3 – 3.9 *(2026-10-07 → 2026-10-13)*
- Spreadsheet editing (range selection, paste, undo / redo, fill handle), the AI toolkit (schema, validator, Ask AI panel, agent tools), header filters, the 1M-row benchmark and height cap, 3–5× faster sorting, RTL, the Theme Builder, a full audit with security and correctness fixes, 10–20× faster edits at 1M rows and `localeText` for every string. See the release table above and [CHANGELOG.md](../CHANGELOG.md).

### 3.x releases *(2026-09-29 → 2026-10-01)*
- **3.0.0** correctness release (rows never modified, typed generics, React 18 support), **3.0.1** fill-height layout fix, **3.1.0** `sortComparator` and column auto-size, **3.2.0** non-blocking PDF export, **3.2.1** Safari boolean editor fix, **3.2.2** linear-time export regexes. Details in [CHANGELOG.md](../CHANGELOG.md); upgrade guide in [migration/v2-to-v3.md](migration/v2-to-v3.md).
- Package smoke suite against the packed tarball in React 18 and 19 apps, pull-request CI, community files and a wiki generated from these docs.

### Consumer defect fixes *(v2.1.0, 2026-09-23)*
- Row-grouping subtotals now use the shared aggregation functions (nulls ignored, `unique` supported, `availableAggregationFunctions` honoured); `min`/`max` no longer overflow the call stack on very large datasets.
- Group and tree-data expansion state survives row updates, including server-side lazily loaded children.
- Rows are positioned correctly when rows are pinned to the top; keyboard navigation and `scrollToIndexes` keep the target row fully visible below the sticky header.
- `valueFormatter` applies under row grouping; `formattedValue` is passed to `renderCell`.
- `slots.footer`, `slots.noRowsOverlay` and `slots.loadingOverlay` are rendered (they were typed but ignored).
- New `onRowDoubleClick`; `ColumnVisibilityPanel` exported; `exportToExcelAdvanced` accepts `groupedRows`.
- Dev-mode warnings for an unbounded grid container and for `pagination` with row grouping.
- Real-browser test project (Vitest browser mode + Playwright; Chromium, Firefox and WebKit), `npm run test:browser`; the npm publish workflow now runs unit and browser tests before publishing.
- Already shipped, previously listed as upcoming: npm publishing (since 0.1.0), native PDF export (v1.2.1), GitHub Pages deployment.

### Library Hardening *(completed 2026-09-02)*
- **`GridRowMeta`**: Hierarchy metadata (`hasChildren`, `treeDepth`, `groupingField`, `groupingValue`, `descendantCount`, `isExpanded`, `isGroupRow`) moved from `GridRowModel` into a separate `Map<GridRowId, GridRowMeta>`. Exposed as `params.rowMeta` in `renderCell`. The runtime shim (underscore-prefixed fields on copied row objects) was kept through v2.x and removed in v3.0 — see `docs/migration/v2-to-v3.md`.
- **`CellErrorBoundary`**: Custom `renderCell` errors are now caught per-cell. Failing cells show a `⚠` indicator with the error as a tooltip; the rest of the grid renders normally.
- **`GridLocaleText` / `localeText` prop**: All user-visible pagination strings (`paginationRowsPerPage`, `paginationOf`, `paginationPage`, `noRowsLabel`) are now overrideable for internationalisation.
- **Core hook tests**: `useGridRowPipeline`, `useGridControlledState`, `useGridKeyboardNavigation` now have full test coverage (25 new tests).
- **`CLAUDE.md`**: Root-level AI context file auto-loaded by Claude Code and other AI coding assistants.

*   **Demo app**: 56 pages in 13 categories ordered by what developers look for first (3.9), a per-page table of contents, the source viewer on every example, and public deployment on GitHub Pages with a smoke test of every route. Syntax highlighting is still open.
*   **Quickstart & Installation Guides**: Comprehensive onboarding documentation for developers.
