# DataGrid orchestration

`lib/components/DataGrid/DataGrid.tsx` is the orchestration layer: it destructures the props, calls
hooks and pure utils in a fixed order, and renders JSX. Feature logic lives in the hooks and utils
listed here; add new logic there, not in the component.

## Why the order matters

Effects run in the order their hooks are called (within the same phase: layout effects first, then
passive effects). Several hooks install methods on `apiRef` or read state that an earlier hook wrote
in an effect, so **keep the call order when you move or add a hook**. In particular:

- `useGridApiRefBinding` points the consumer's `apiRef` at the live API in a layout effect, before any
  parent layout effect runs.
- `useGridApiMethods` (layout effects) installs the state methods before `useGridAggregationApi`,
  `useGridClipboardApi` and `useGridScrollToIndexesApi` install theirs. `useGridApiMethods`,
  `useGridAggregationApi` and `useGridScrollToIndexesApi` install once per `apiRef` in a layout
  effect and read the latest values from a ref refreshed in a layout effect, so the methods are
  live in a parent's layout effect and never answer from a previous render.
- `useGridCellSelection` runs after `useGridSpanning` (it needs `getSpanOrigin` and the span caches) and
  before `useGridKeyboardNavigation`, which receives its Shift-key handlers. `useGridCellSelectionApi` runs
  after the keyboard hook because it reads and sets `focusedCell`.
- `useGridLiveRowSelection` prunes the selection, and `useGridPageCorrection` corrects a page past the
  end, in effects that run before the later hooks' effects.

## Call order

| # | Hook / util | File | Produces |
| :- | :--- | :--- | :--- |
| 0 | `useStableColumns` | `hooks/core/useStableColumns.ts` | The `columns` prop with a stable identity while every column is shallowly equal (inline columns do not re-run the row passes) |
| 1 | `useGridControlledState` | `hooks/core/useGridControlledState.ts` | Controlled/uncontrolled sort, filter, aggregation, visibility, pinning, pivot, pagination, selection, density, cell selection (v3.3) |
| 2 | `useGridPivot` | `hooks/features/useGridPivot.ts` | Pivot rows/columns (or the source ones) and the pipeline filter/sort models |
| 3 | `resolveGridModes` (pure) | `utils/gridModes.ts` | Which features are in effect: tree data, row grouping, pagination, row reordering, list view, grouping column |
| 4 | `useGridThemeDimensions` | `hooks/core/useGridThemeDimensions.ts` | Row and header heights (props → theme provider → defaults) |
| 5 | `useGridGroupingColumn` | `hooks/core/useGridGroupingColumn.ts` | `activeColumns` with the `__group__` column, and its auto-pin |
| 6 | `useGridColumnLookup` | `hooks/core/useGridColumnLookup.ts` | Column lookup for filtering/sorting |
| 7 | `useServerAggregationResults` | `hooks/features/useAggregation.ts` | Server-provided totals |
| 8 | `useGridKeyboardMode` | `hooks/core/useGridFocusHandlers.ts` | `setKeyboardMode` (toggles `ogx--kb` on the root) |
| 9 | `useDataGrid` | `hooks/core/useDataGrid.ts` | Row store, dimensions, data-source state, the live `apiRef` |
| 10 | `useGridRowIdOf` | `hooks/core/useGridRowIdOf.ts` | `getRowIdOf` and its stable event-handler twin |
| 11 | `useGridApiRefBinding` | `hooks/core/useGridApiRefBinding.ts` | Binds the `apiRef` prop (layout effect) |
| 12 | `useGridHierarchy` | `hooks/core/useGridHierarchy.ts` | `useTreeData` + `useRowGrouping`, the active handlers and `rowMetaMap` |
| 13 | `useGridEditing` | `hooks/features/useGridEditing.ts` | Cell editing state and handlers |
| 14 | `useGridLiveRowSelection` | `hooks/core/useGridLiveRowSelection.ts` | Selection without removed rows |
| 15 | `useGridDataSource` | `hooks/features/useGridDataSource.ts` | Server fetching |
| 16 | `useServerTreeChildren` | `hooks/features/useServerTreeChildren.ts` | Lazy server tree children |
| 17 | `useGridDetailPanel` | `hooks/core/useGridDetailPanel.ts` | Detail-panel expansion, toggle, measured heights |
| 18 | `useGridColumns` | `hooks/core/useGridColumns.tsx` | Effective/ordered/visible columns, widths, reorder |
| 19 | `useGridStateSnapshot` | `hooks/core/useGridStateSnapshot.ts` | `onStateChange` delivery |
| 20 | `useGridRowPipeline` | `hooks/core/useGridRowPipeline.ts` | Filter → pin → sort → paginate |
| 21 | `useGridPageCorrection` | `hooks/core/useGridPageCorrection.ts` | Moves a page left past the end back to the last page |
| 22 | `getPaginationRowCount` (pure) | `utils/pagination/index.ts` | What the pager pages through |
| 23 | `useGridRowInteractions` | `hooks/core/useGridRowInteractions.ts` | Row selection, `handleRowClick`, `handleSelectionChange` |
| 24 | `useGridApiMethods` | `hooks/core/useGridApiMethods.ts` | State API methods (`getAllFilteredRows` via `utils/gridApiRows.ts`) |
| 25 | `useRowReorder` | `hooks/useRowReorder.ts` | Row drag-reorder |
| 26 | `useAggregation` | `hooks/features/useAggregation.ts` | Footer aggregation result |
| 27 | `useGridAggregationApi` | `hooks/core/useGridAggregationApi.ts` | `getAggregationResult`, `getAggregationModel`, `getGroupedExportRows` |
| 28 | `useLayout` | `hooks/core/useLayout.ts` | Row heights, pinned column split, widths |
| 29 | `useGridSpanning` | `hooks/features/useGridSpanning.ts` | Row/column spans |
| 29a | `useGridCellSelection` | `hooks/core/useGridCellSelection.ts` | Cell range (v3.3): the model's range resolved against `allRenderableRows` and the data columns of `navigationColumns` (grown over spans), the render rectangle, pointer drag with auto-scroll and Shift+click, the Shift-key handlers for the keyboard hook, copy text, status-bar totals and the debounced live-region text. Inert while `cellSelection` is off |
| 30 | `useGridClipboardApi` | `hooks/core/useGridClipboardApi.ts` | Ctrl/Cmd+C and `copySelectedRows`; with `cellSelection` the shortcut copies the range (`getCellRangeCopyText`) |
| 31 | `useGridScrollToIndexesApi` | `hooks/core/useGridScrollToIndexesApi.ts` | `scrollToIndexes` |
| 31a | `useGridColumnAutosize` | `hooks/core/useGridColumnAutosize.ts` | `autosizeColumn` / `autosizeColumns` on the API, and the resize handle's auto-size handler (v3.1) |
| 32 | `useGridViewport` | `hooks/core/useGridViewport.ts` | Scroll sync, viewport measurement, viewport callback ref |
| 33 | `useGridVirtualization` | `hooks/core/useGridVirtualization.ts` | Render window |
| 34 | `useGridSortHandlers` | `hooks/core/useGridHeaderHandlers.ts` | Header sort / shift-sort |
| 35 | `useGridKeyboardNavigation` | `hooks/core/useGridKeyboardNavigation.ts` | Focus and keyboard handling; takes `cellSelection.keyboard` (Shift+navigation, Escape, Ctrl/Cmd+A) |
| 36 | `useGridPointerFocusHandlers` | `hooks/core/useGridFocusHandlers.ts` | Cell and header click focus |
| 36a | `useGridCellSelectionApi` | `hooks/core/useGridCellSelectionApi.ts` | Keeps the range anchor and the focused cell together (layout effect: a new anchor moves focus; focus moved to another data cell collapses the range), clears a range whose corner is gone (`'dataChange'`), and installs `getCellSelectionModel`, `setCellSelectionModel`, `selectCellRange`, `clearCellSelection`, `getSelectedCells`, `copySelectedCells` (once per `apiRef`, reading the latest values from a ref) |
| 37 | `useGridColumnMenuHandlers` | `hooks/core/useGridHeaderHandlers.ts` | Column menu Hide / Pin (`pinColumnTo` in `utils/pinning`) |
| 38 | `useGridAriaRows` | `hooks/core/useGridAriaRows.ts` | `aria-rowcount` and `aria-rowindex` bases |
| 39 | `useGridSpanRowWindow` | `hooks/features/useGridSpanRenderWindow.ts` | Render window widened to whole row spans |
| 40 | `useGridVisibleRows` | `hooks/core/useGridVisibleRows.ts` | Pinned + virtual centre rows to render |
| 41 | `useGridSpanColumnWindow` | `hooks/features/useGridSpanRenderWindow.ts` | Columns to render, widened to whole column spans |
| 42 | `useGridDevWarnings` | `hooks/core/useGridDevWarnings.ts` | Dev-only warnings |
| 43 | `useColumnGroupReorderGuard` | `hooks/features/useColumnGroupReorderGuard.ts` | Header drag-reorder kept inside column groups |
| 44 | `useGridColumnsPanel` | `hooks/core/useGridColumnsPanel.ts` | Columns panel (toolbar or standalone) |
| 45 | `useGridStylesheetWarning` | `hooks/core/useGridDevWarnings.ts` | Warns when the stylesheet is missing |
| 46 | `useGridToolbarProps` | `hooks/core/useGridToolbarProps.ts` | Props for `slots.toolbar` |

## Rendered components

`GridToolbarSlot`, `GridStandaloneColumnPanel`, `GridListView` (list view) or the viewport
(`Header`, `GridPinnedRows` top, `GridEmptyState`, `GridVirtualRows`, `GridPinnedRows` bottom,
`GridAggregationFooter`), `GridCellSelectionStatsArea` (`showCellSelectionStats` with `cellSelection`), then `slots.footer` or `GridPaginationArea`, `GridLiveRegion`,
`GridLoadingOverlay` and `GridErrorOverlay`. The props all three row renderers take alike are built
once in `DataGrid.tsx` (`rowRenderProps`) and spread into each. `rowRenderProps.cellRange` is the cell range's
render rectangle; each row renderer turns it into a per-row `cellRange` (`getRowCellRange`), `null` for rows
outside it, and `Row` is memoised with a value comparison of that prop, so a drag only re-renders the rows the
range enters or leaves.
