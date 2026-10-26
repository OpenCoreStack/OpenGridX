# DataGrid orchestration

`lib/components/DataGrid/DataGrid.tsx` is the orchestration layer: it destructures the props, calls
hooks and pure utils in a fixed order, and renders `GridRoot` with one props object. Feature logic lives
in the hooks and utils listed here; add new logic there, not in the component.

Some contiguous runs of hooks are wrapped in a **composite hook** (`hooks/core/`) that calls its members in
the same order, so `DataGrid.tsx` calls one hook where the table below lists several (marked with the
composite's name). A composite only ever wraps consecutive steps: a hook that has to run between two of its
members goes inside it at that position, never before or after the composite.

| Composite | Steps |
| :--- | :--- |
| `useGridEditPipeline` | 12a–13 |
| `useGridSelectionAndStateApi` | 23–24 |
| `useGridViewApis` | 30–31a |
| `useGridScrollViewport` | 32–33 |
| `useGridRangeEditing` | 36a–36d |
| `useGridRenderWindow` | 38–41 |
| `useGridToolbarStack` | 44–46 |

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
- `useGridBatchEdit` is created before `useGridEditing` (single edits store through it, so an undo right after an
  edit reads the stored row before the next render). The history hook needs the focus and selection hooks, so it runs
  late (36c); commits reach it through `useGridEditCommitChannel` (12a), whose listener it sets in a layout effect.
  `useGridClipboardPaste` (36b) and `useGridUndoRedo` listen for keys on the grid root with native listeners, which
  fire before React's delegated `onKeyDown` of the viewport; they act only on cell targets with no editor open.
  `useGridFillHandle` (36d) does the same for Ctrl/Cmd+D and Ctrl/Cmd+R; its fills commit through the batch edit
  with source `'fill'`, so the history records them like a paste.
- `useGridLiveRowSelection` prunes the selection, and `useGridPageCorrection` corrects a page past the
  end, in effects that run before the later hooks' effects.

## Call order

| # | Hook / util | File | Produces |
| :- | :--- | :--- | :--- |
| 0 | `useStableColumns` | `hooks/core/useStableColumns.ts` | The `columns` prop with a stable identity while every column is shallowly equal (inline columns do not re-run the row passes) |
| 1 | `useGridControlledState` | `hooks/core/useGridControlledState.ts` | Controlled/uncontrolled sort, filter, aggregation, row grouping (v3.5), visibility, pinning, pivot, pagination, selection, density, cell selection (v3.3) |
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
| 12a | `useGridEditCommitChannel` (in `useGridEditPipeline`) | `hooks/core/useGridUndoRedo.ts` | Stable `emit` / `setListener` pair: the commit paths below report stored changes through `emit`, and `useGridUndoRedo` (36c) registers the listener (v3.4) |
| 12b | `useGridBatchEdit` (in `useGridEditPipeline`) | `hooks/features/useGridBatchEdit.ts` | Batch edits (v3.4): `applyEdits` runs `valueSetter` → `processRowUpdate` once per row (rows in parallel, failures isolated and sent to `onProcessRowUpdateError`) and stores every successful row in one `replaceRows` update; `getRow` sees rows stored since the last render; `storeRow` stores a single edit |
| 13 | `useGridEditing` (in `useGridEditPipeline`) | `hooks/features/useGridEditing.ts` | Cell editing state and handlers; stores through `useGridBatchEdit.storeRow` and reports the committed change to the channel |
| 14 | `useGridLiveRowSelection` | `hooks/core/useGridLiveRowSelection.ts` | Selection without removed rows |
| 15 | `useGridDataSource` | `hooks/features/useGridDataSource.ts` | Server fetching |
| 16 | `useServerTreeChildren` | `hooks/features/useServerTreeChildren.ts` | Lazy server tree children |
| 17 | `useGridDetailPanel` | `hooks/core/useGridDetailPanel.ts` | Detail-panel expansion, toggle, measured heights |
| 18 | `useGridColumns` | `hooks/core/useGridColumns.tsx` | Effective/ordered/visible columns, widths, reorder |
| 19 | `useGridStateSnapshot` | `hooks/core/useGridStateSnapshot.ts` | `onStateChange` delivery |
| 20 | `useGridRowPipeline` | `hooks/core/useGridRowPipeline.ts` | Filter → pin → sort → paginate |
| 21 | `useGridPageCorrection` | `hooks/core/useGridPageCorrection.ts` | Moves a page left past the end back to the last page |
| 22 | `getPaginationRowCount` (pure) | `utils/pagination/index.ts` | What the pager pages through |
| 23 | `useGridRowInteractions` (in `useGridSelectionAndStateApi`) | `hooks/core/useGridRowInteractions.ts` | Row selection, `handleRowClick`, `handleSelectionChange` |
| 24 | `useGridApiMethods` (in `useGridSelectionAndStateApi`) | `hooks/core/useGridApiMethods.ts` | State API methods (`getAllFilteredRows` via `utils/gridApiRows.ts`); since v3.5 also `setSortModel`, `setRowGroupingModel`, `setAggregationModel`, `setColumnVisibilityModel`, `setPivotModel` and `getGridAiState` |
| 25 | `useRowReorder` | `hooks/useRowReorder.ts` | Row drag-reorder |
| 26 | `useAggregation` | `hooks/features/useAggregation.ts` | Footer aggregation result |
| 27 | `useGridAggregationApi` | `hooks/core/useGridAggregationApi.ts` | `getAggregationResult`, `getAggregationModel`, `getGroupedExportRows` |
| 28 | `useLayout` | `hooks/core/useLayout.ts` | Row heights, pinned column split, widths |
| 29 | `useGridSpanning` | `hooks/features/useGridSpanning.ts` | Row/column spans |
| 29a | `useGridCellSelection` | `hooks/core/useGridCellSelection.ts` | Cell range (v3.3): the model's range resolved against `allRenderableRows` and the data columns of `navigationColumns` (grown over spans), the render rectangle, pointer drag with auto-scroll and Shift+click, the Shift-key handlers for the keyboard hook, copy text, status-bar totals and the debounced live-region text. Inert while `cellSelection` is off |
| 30 | `useGridClipboardApi` (in `useGridViewApis`) | `hooks/core/useGridClipboardApi.ts` | Ctrl/Cmd+C and `copySelectedRows`; with `cellSelection` the shortcut copies the range (`getCellRangeCopyText`) |
| 31 | `useGridScrollToIndexesApi` (in `useGridViewApis`) | `hooks/core/useGridScrollToIndexesApi.ts` | `scrollToIndexes` |
| 31a | `useGridColumnAutosize` (in `useGridViewApis`) | `hooks/core/useGridColumnAutosize.ts` | `autosizeColumn` / `autosizeColumns` on the API, and the resize handle's auto-size handler (v3.1) |
| 32 | `useGridViewport` (in `useGridScrollViewport`) | `hooks/core/useGridViewport.ts` | Scroll sync, viewport measurement, viewport callback ref |
| 32a | `useGridMaxContentHeight` (in `useGridScrollViewport`) | `hooks/core/useGridMaxContentHeight.ts` | The tallest element this browser lays out (`utils/maxElementHeight.ts`, measured once per document after mount; `undefined` until then, `Infinity` without a layout engine) |
| 33 | `useGridVirtualization` (in `useGridScrollViewport`) | `hooks/core/useGridVirtualization.ts` | Render window; `virtualContainerHeight` caps the rows' container to `maxContentHeight` (Firefox collapses taller elements) |
| 34 | `useGridSortHandlers` | `hooks/core/useGridHeaderHandlers.ts` | Header sort / shift-sort |
| 35 | `useGridKeyboardNavigation` | `hooks/core/useGridKeyboardNavigation.ts` | Focus and keyboard handling; takes `cellSelection.keyboard` (Shift+navigation, Escape, Ctrl/Cmd+A) |
| 36 | `useGridPointerFocusHandlers` | `hooks/core/useGridFocusHandlers.ts` | Cell and header click focus |
| 36a | `useGridCellSelectionApi` (in `useGridRangeEditing`) | `hooks/core/useGridCellSelectionApi.ts` | Keeps the range anchor and the focused cell together (layout effect: a new anchor moves focus; focus moved to another data cell collapses the range), clears a range whose corner is gone (`'dataChange'`), and installs `getCellSelectionModel`, `setCellSelectionModel`, `selectCellRange`, `clearCellSelection`, `getSelectedCells`, `copySelectedCells` (once per `apiRef`, reading the latest values from a ref) |
| 36b | `useGridClipboardPaste` (in `useGridRangeEditing`) | `hooks/core/useGridClipboardPaste.ts` | Paste and range clear (v3.4): `paste` and Delete/Backspace listeners on the grid root (only for cell targets, not editors or nested grids), TSV parsing (`utils/parsing.ts`), placement against the renderable rows and range columns (`utils/editing/targets.ts`), the batch edit, the new selection, `onBeforeClipboardPaste` / `onClipboardPaste`, and `apiRef.pasteText`. Inert without `cellSelection` except for `pasteText` |
| 36c | `useGridUndoRedo` (in `useGridRangeEditing`) | `hooks/core/useGridUndoRedo.ts` | History (v3.4, `undoRedo`): records the channel's changes, replays them as batch edits with an `expect` value per cell (stale cells skipped), queues undo/redo, selects and scrolls to the affected cells, Ctrl/Cmd+Z / Shift+Z / Ctrl+Y on the grid root, `onHistoryChange`, and `apiRef.undo` / `redo` / `canUndo` / `canRedo` / `clearHistory` |
| 36d | `useGridFillHandle` (in `useGridRangeEditing`) | `hooks/core/useGridFillHandle.ts` | Fill handle (v3.5, `cellSelection` without `disableFillHandle`): where the handle is drawn (`rowRenderProps.fillHandle`, the range's bottom-right cell or its span origin), a `pointerdown` listener on the viewport for `.ogx__cell-fill-handle` that runs `cellSelection.startTrackedDrag` (the range drag's hit testing, auto-scroll and slow-machine fallback, on pointer events so touch works), the fill itself (`utils/editing/fill.ts`: series detection, lines, `GridColDef.fillValue`) as one batch edit with source `'fill'`, the new selection, `onFill`, and Ctrl/Cmd+D / Ctrl/Cmd+R on the grid root |
| 37 | `useGridColumnMenuHandlers` | `hooks/core/useGridHeaderHandlers.ts` | Column menu Hide / Pin (`pinColumnTo` in `utils/pinning`) |
| 37a | `useGridContextMenu` | `hooks/features/useGridContextMenu.ts` | Cell context menu (v3.11, `contextMenu`): a native `contextmenu` listener on the grid root (attached only with `contextMenu`) resolves the body cell from `data-field` and the row's `data-rowindex` (an index into `allRenderableRows`, read through a latest-ref; covered span cells resolve to the origin), keeps a range that contains the cell or moves focus and collapses the range to it, builds Copy / Copy with headers (/ Undo / Redo with `undoRedo`), passes them through `getContextMenuItems` (contained) and opens `GridContextMenu` (rendered by `GridRoot`). An empty list keeps the browser menu. Installs `apiRef.openContextMenu` / `closeContextMenu`; returns `openAt(cell)` for the keyboard. Needs the cell selection API and undo/redo (36a–36c) |
| 38 | `useGridAriaRows` (in `useGridRenderWindow`) | `hooks/core/useGridAriaRows.ts` | `aria-rowcount` and `aria-rowindex` bases |
| 39 | `useGridSpanRowWindow` (in `useGridRenderWindow`) | `hooks/features/useGridSpanRenderWindow.ts` | Render window widened to whole row spans |
| 40 | `useGridVisibleRows` (in `useGridRenderWindow`) | `hooks/core/useGridVisibleRows.ts` | Pinned + virtual centre rows to render |
| 41 | `useGridSpanColumnWindow` (in `useGridRenderWindow`) | `hooks/features/useGridSpanRenderWindow.ts` | Columns to render, widened to whole column spans |
| 42 | `useGridDevWarnings` | `hooks/core/useGridDevWarnings.ts` | Dev-only warnings |
| 43 | `useColumnGroupReorderGuard` | `hooks/features/useColumnGroupReorderGuard.ts` | Header drag-reorder kept inside column groups |
| 44 | `useGridColumnsPanel` (in `useGridToolbarStack`) | `hooks/core/useGridColumnsPanel.ts` | Columns panel (toolbar or standalone) |
| 45 | `useGridStylesheetWarning` (in `useGridToolbarStack`) | `hooks/core/useGridDevWarnings.ts` | Warns when the stylesheet is missing |
| 45a | `useGridAiAssistant` (in `useGridToolbarStack`) | `hooks/features/useGridAiAssistant.ts` | The `aiAssistant` panel (v3.5): open state, the request and its `AbortController` (Stop), applying a branded reply through the `apiRef` setters of step 24 (`utils/aiAssistant.ts`: allowed parts, the Undo snapshot, chips, chip removal), the live-region status, and `apiRef.openAiAssistant` / `closeAiAssistant`. Inert without `aiAssistant`; it runs before step 46 because the toolbar gets its Ask AI button from it |
| 46 | `useGridToolbarProps` (in `useGridToolbarStack`) | `hooks/core/useGridToolbarProps.ts` | Props for `slots.toolbar` |

## Rendered components

`DataGrid.tsx` renders `GridRoot` (`components/DataGrid/GridRoot.tsx`): the root element with, in this order,
`GridToolbarSlot`, `GridAiAssistantArea` (the `aiAssistant` panel or `slots.aiAssistantPanel` while open, anchored under the toolbar), `GridStandaloneColumnPanel`, `GridListView` (list view) or `GridViewport` (`components/DataGrid/GridViewport.tsx`, the `role="grid"` viewport:
`Header`, `GridPinnedRows` top, `GridEmptyState`, `GridVirtualRows`, `GridPinnedRows` bottom,
`GridAggregationFooter`), `GridCellSelectionStatsArea` (`showCellSelectionStats` with `cellSelection`), then `slots.footer` or `GridPaginationArea`, `GridLiveRegion`,
`GridLoadingOverlay` and `GridErrorOverlay`. `GridRoot` also provides `GridLocaleContext` (v3.9) around all of them: `localeText`, kept stable while shallowly equal (`useShallowStableValue`), resolved once by `resolveGridLocale` (`lib/utils/gridLocale.ts`); components and `Row` read it with `useGridLocale()` instead of a prop, so `Row` gets no prop that changes per render. `GridRoot` builds the overlay slot elements and passes the
rest of its props on to `GridViewport`. The props all three row renderers take alike are built once in
`GridViewport` (`rowRenderProps`) and spread into each. `rowRenderProps.cellRange` is the cell range's
render rectangle; each row renderer turns it into a per-row `cellRange` (`getRowCellRange`), `null` for rows
outside it, and `Row` is memoised with a value comparison of that prop, so a drag only re-renders the rows the
range enters or leaves. The same rule holds for every row prop (v3.9): `editingCell` goes only to the row being
edited, `focusedCellField` only to the focused row, and the row click and checkbox handlers keep one identity
(`useGridRowInteractions` reads the latest handlers when called). `DataGrid.rowMemo.test.tsx` guards it. `rowRenderProps.fillHandle` (v3.5) adds `fillHandleCol` to the one row that draws the fill
handle (a single selected cell gets an empty column interval, so it draws the handle but no range).
