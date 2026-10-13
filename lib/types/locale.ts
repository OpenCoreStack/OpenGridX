import type { GridFilterOperator } from './filtering';
import type { GridRowId } from './rows';

/** Overrideable user-visible strings for internationalisation. All fields are optional; defaults match the built-in English strings. */
export interface GridLocaleText {
    /** Label before the rows-per-page select. Default: `"Rows per page:"` */
    paginationRowsPerPage?: string;
    /** Range label. Receives (from, to, count). Default: `` (f, t, c) => `${f}–${t} of ${c}` `` */
    paginationOf?: (from: number, to: number, count: number) => string;
    /** Page counter label. Receives (page, pageCount). Default: `` (p, pc) => `Page ${p} of ${pc}` `` */
    paginationPage?: (page: number, pageCount: number) => string;
    /** Empty-state label. When set, overrides the `noRowsLabel` prop on DataGrid. Default: `"No Data"` */
    noRowsLabel?: string;
    /**
     * Screen-reader announcement after the cell range changes (`cellSelection`). Receives (cells, rows,
     * columns). Default: `` (c, r, col) => `${c} cells selected, ${r} rows by ${col} columns` `` (singular for 1).
     * @since v3.3
     */
    cellSelectionAnnouncement?: (cellCount: number, rowCount: number, columnCount: number) => string;
    /** Label of the toolbar button that opens the `aiAssistant` panel. Default: `"Ask AI"` @since v3.5 */
    aiAssistantButton?: string;
    /** Header filter cell whose column has a filter the row cannot edit. Default: `"Custom filter"` @since v3.6 */
    headerFilterCustom?: string;
    /** Tooltip of the "Custom filter" cell. Default: `"Set in the filter panel"` @since v3.6 */
    headerFilterCustomTooltip?: string;
    /** `aria-label` of a header filter cell. Receives the column header. Default: `` (h) => `Filter ${h}` `` @since v3.6 */
    headerFilterCellLabel?: (header: string) => string;
    /** `aria-label` of the value input or select. Default: `` (h) => `Filter value for ${h}` `` @since v3.6 */
    headerFilterValueLabel?: (header: string) => string;
    /**
     * `aria-label` of the operator button. Receives the header and the operator's label.
     * Default: `` (h, op) => `Filter operator for ${h}: ${op}` `` @since v3.6
     */
    headerFilterOperatorButtonLabel?: (header: string, operatorLabel: string) => string;
    /** `aria-label` of the operator menu. Default: `` (h) => `Filter operator for ${h}` `` @since v3.6 */
    headerFilterOperatorMenuLabel?: (header: string) => string;
    /** `aria-label` of the clear button. Default: `` (h) => `Clear filter for ${h}` `` @since v3.6 */
    headerFilterClearLabel?: (header: string) => string;
    /** Tooltip of the clear button. Default: `"Clear"` @since v3.6 */
    headerFilterClearTooltip?: string;
    /** Empty choice of the boolean and single-select filters. Default: `"Any"` @since v3.6 */
    headerFilterAny?: string;
    /** "true" choice of the boolean filter. Default: `"Yes"` @since v3.6 */
    headerFilterTrue?: string;
    /** "false" choice of the boolean filter. Default: `"No"` @since v3.6 */
    headerFilterFalse?: string;
    /**
     * Operator names in the header filter menu, tooltips and no-value cells ("Is empty"). Missing
     * operators keep their English name. @since v3.6
     */
    headerFilterOperators?: Partial<Record<GridFilterOperator, string>>;

    // ── Grid and list view (v3.9) ─────────────────────────────────────────────
    /** `aria-label` of the grid when no `aria-label` prop is set. Default: `"Data grid"` @since v3.9 */
    gridLabel?: string;
    /** `aria-label` of the list view when no `aria-label` prop is set. Default: `"Data grid list view"` @since v3.9 */
    listViewLabel?: string;
    /** List view item count. Default: `` (n) => `${n} items` `` (`"1 item"` for 1) @since v3.9 */
    listViewItemCount?: (count: number) => string;
    /** List view page, after `" · "`. Default: `` (p, pc) => `page ${p} of ${pc}` `` @since v3.9 */
    listViewPage?: (page: number, pageCount: number) => string;
    /** List view selected count, after `" · "`. Default: `` (n) => `${n} selected` `` @since v3.9 */
    listViewSelectedCount?: (count: number) => string;
    /** `aria-label` of the loading progress bar. Default: `"Loading data"` @since v3.9 */
    loadingLabel?: string;
    /** Live-region announcement while loading. Default: `"Loading data..."` @since v3.9 */
    liveRegionLoading?: string;
    /** Live-region announcement of a load error. Default: `` (m) => `Error: ${m}` `` @since v3.9 */
    liveRegionError?: (message: string) => string;
    /** Live-region announcement of the filtered row count. Default: `` (n) => `${n} rows found` `` (`"1 row found"`) @since v3.9 */
    liveRegionRowsFound?: (count: number) => string;
    /** Title of the data source error overlay. Default: `"Oops! Something went wrong"` @since v3.9 */
    errorOverlayTitle?: string;
    /** Retry button of the error overlay. Default: `"Retry"` @since v3.9 */
    errorOverlayRetry?: string;
    /** `aria-label` of the aggregation footer row. Default: `"Aggregation totals"` @since v3.9 */
    aggregationFooterLabel?: string;
    /** `aria-label` of a cell whose `renderCell` threw. Default: `` (field) => `Error in cell: ${field}` `` @since v3.9 */
    cellErrorLabel?: (field: string) => string;
    /** Tooltip of such a cell when the error has no message. Default: `"Render error"` @since v3.9 */
    cellErrorTooltip?: string;

    // ── Header (v3.9) ─────────────────────────────────────────────────────────
    /** `aria-label` of the row reorder column header. Default: `"Row reorder handle"` @since v3.9 */
    headerRowReorderLabel?: string;
    /** Tooltip of the row reorder column header. Default: `"Drag to reorder rows"` @since v3.9 */
    headerRowReorderTooltip?: string;
    /** `aria-label` of the detail panel column header. Default: `"Expand row details"` @since v3.9 */
    headerDetailPanelLabel?: string;
    /** `aria-label` of the select-all checkbox. Default: `"Select all rows"` @since v3.9 */
    headerSelectAllLabel?: string;
    /** `aria-label` of the select-all checkbox when every row is selected. Default: `"Deselect all rows"` @since v3.9 */
    headerDeselectAllLabel?: string;
    /**
     * Description of a sorted column with multi-sort. Receives the direction, the 1-based priority and the
     * number of sorted columns. Default: `` (d, p, n) => `Sorted ${d === 'asc' ? 'ascending' : 'descending'}, sort priority ${p} of ${n}` `` @since v3.9
     */
    headerSortDescription?: (direction: 'asc' | 'desc', priority: number, total: number) => string;
    /** `aria-label` of the column menu button. Default: `` (h) => `Open column menu for ${h}` `` @since v3.9 */
    headerColumnMenuButtonLabel?: (header: string) => string;
    /** `aria-label` of a column resize handle. Receives the field. Default: `` (f) => `Resize ${f} column` `` @since v3.9 */
    headerColumnResizeLabel?: (field: string) => string;
    /** `aria-label` of the header filter cell of a column that cannot be filtered. Default: `` (h) => `No filter for ${h}` `` @since v3.9 */
    headerFilterNoFilterLabel?: (header: string) => string;

    // ── Rows (v3.9) ───────────────────────────────────────────────────────────
    /** `aria-label` of a row checkbox. Default: `` (id) => `Select row ${id}` `` @since v3.9 */
    rowSelectLabel?: (id: GridRowId) => string;
    /** `aria-label` of a selected row's checkbox. Default: `` (id) => `Deselect row ${id}` `` @since v3.9 */
    rowDeselectLabel?: (id: GridRowId) => string;
    /** `aria-label` of the row drag handle. Default: `"Drag to reorder row"` @since v3.9 */
    rowReorderLabel?: string;
    /** `aria-label` of the detail panel toggle. Default: `"Expand row details"` @since v3.9 */
    rowDetailPanelExpandLabel?: string;
    /** `aria-label` of an open detail panel's toggle. Default: `"Collapse row details"` @since v3.9 */
    rowDetailPanelCollapseLabel?: string;
    /** `aria-label` of a tree / group expand button. Default: `"Expand row"` @since v3.9 */
    rowExpandLabel?: string;
    /** `aria-label` of an expanded tree / group row's button. Default: `"Collapse row"` @since v3.9 */
    rowCollapseLabel?: string;

    // ── Column menu (v3.9) ────────────────────────────────────────────────────
    /** `aria-label` of the column menu. Default: `` (h) => `Column options for ${h}` `` @since v3.9 */
    columnMenuLabel?: (header: string) => string;
    /** Default: `"Sort Ascending"` @since v3.9 */
    columnMenuSortAscending?: string;
    /** Default: `"Sort Descending"` @since v3.9 */
    columnMenuSortDescending?: string;
    /** Default: `"Unsort"` @since v3.9 */
    columnMenuUnsort?: string;
    /** Section label above the pin items. Default: `"Pin column"` @since v3.9 */
    columnMenuPinColumn?: string;
    /** Default: `"Pin to Left"` @since v3.9 */
    columnMenuPinLeft?: string;
    /** `aria-label` of the item. Default: `"Pin to left"` @since v3.9 */
    columnMenuPinLeftLabel?: string;
    /** Default: `"Pin to Right"` @since v3.9 */
    columnMenuPinRight?: string;
    /** `aria-label` of the item. Default: `"Pin to right"` @since v3.9 */
    columnMenuPinRightLabel?: string;
    /** Default: `"Unpin"` @since v3.9 */
    columnMenuUnpin?: string;
    /** `aria-label` of the item. Default: `"Unpin column"` @since v3.9 */
    columnMenuUnpinLabel?: string;
    /** Default: `"Hide Column"` @since v3.9 */
    columnMenuHideColumn?: string;
    /** `aria-label` of the item. Default: `` (h) => `Hide ${h} column` `` @since v3.9 */
    columnMenuHideColumnLabel?: (header: string) => string;
    /** Default: `"Manage columns"` @since v3.9 */
    columnMenuManageColumns?: string;
    /** `aria-label` of the item. Default: `"Manage all columns"` @since v3.9 */
    columnMenuManageColumnsLabel?: string;

    // ── Columns panel (v3.9) ──────────────────────────────────────────────────
    /** Placeholder of the search box. Default: `"Search"` @since v3.9 */
    columnsPanelSearchPlaceholder?: string;
    /** Tooltip of a drag handle. Default: `"Drag to reorder"` @since v3.9 */
    columnsPanelDragToReorder?: string;
    /** Default: `"Show/Hide All"` @since v3.9 */
    columnsPanelShowHideAll?: string;
    /** Default: `"Reset"` @since v3.9 */
    columnsPanelReset?: string;
    /** `aria-label` of the close button of the panel opened from the column menu. Default: `"Close"` @since v3.9 */
    columnsPanelClose?: string;

    // ── Filter panel (v3.9) ───────────────────────────────────────────────────
    /** `aria-label` of a value input. Default: `` (h) => `Filter value for ${h}` `` @since v3.9 */
    filterPanelValueLabel?: (header: string) => string;
    /** `aria-label` of an operator select. Default: `` (h) => `Filter operator for ${h}` `` @since v3.9 */
    filterPanelOperatorLabel?: (header: string) => string;
    /** `aria-label` of a clear button. Default: `` (h) => `Clear filter for ${h}` `` @since v3.9 */
    filterPanelClearLabel?: (header: string) => string;
    /** Tooltip of a clear button. Default: `"Clear"` @since v3.9 */
    filterPanelClearTooltip?: string;
    /** Empty choice of the boolean and single-select values. Default: `"Any"` @since v3.9 */
    filterPanelAny?: string;
    /** "true" choice of the boolean value. Default: `"true"` @since v3.9 */
    filterPanelTrue?: string;
    /** "false" choice of the boolean value. Default: `"false"` @since v3.9 */
    filterPanelFalse?: string;
    /** Placeholder of a number value. Default: `"Number…"` @since v3.9 */
    filterPanelNumberPlaceholder?: string;
    /** Placeholder of other values. Default: `"Value…"` @since v3.9 */
    filterPanelValuePlaceholder?: string;
    /** Label before the And / Or choice. Default: `"Match:"` @since v3.9 */
    filterPanelMatch?: string;
    /** Default: `"ALL (AND)"` @since v3.9 */
    filterPanelAnd?: string;
    /** Default: `"ANY (OR)"` @since v3.9 */
    filterPanelOr?: string;
    /**
     * Note about conditions the panel cannot show. Default for 1: `"1 more condition (a filter group or a
     * second condition on a column) is applied and not shown here."`, plural otherwise. @since v3.9
     */
    filterPanelHiddenConditions?: (count: number) => string;
    /** Default: `"No filterable columns."` @since v3.9 */
    filterPanelNoColumns?: string;
    /** Operator names in the operator select. Missing operators show their id (`"contains"`). @since v3.9 */
    filterPanelOperators?: Partial<Record<GridFilterOperator, string>>;

    // ── Toolbar and search (v3.9) ─────────────────────────────────────────────
    /** `aria-label` of the toolbar. Default: `"Grid toolbar"` @since v3.9 */
    toolbarLabel?: string;
    /** Placeholder of the toolbar search and of `QuickFilter`. Default: `"Search..."` @since v3.9 */
    toolbarSearchPlaceholder?: string;
    /** `aria-label` of the toolbar search. Default: `"Global Search"` @since v3.9 */
    toolbarSearchLabel?: string;
    /** `aria-label` of the search clear button. Default: `"Clear search"` @since v3.9 */
    toolbarSearchClear?: string;
    /** Tooltip of the columns button. Default: `"Columns"` @since v3.9 */
    toolbarColumns?: string;
    /** `aria-label` of the columns button. Default: `"Manage columns"` @since v3.9 */
    toolbarColumnsLabel?: string;
    /** `aria-label` of the columns panel. Default: `"Column visibility"` @since v3.9 */
    toolbarColumnsPanelLabel?: string;
    /** Tooltip of the filters button and title of the filters panel. Default: `"Filters"` @since v3.9 */
    toolbarFilters?: string;
    /** `aria-label` of the filters button and panel. Default: `"Advanced filters"` @since v3.9 */
    toolbarFiltersLabel?: string;
    /** `aria-label` of the active-filters dot. Default: `"Filters active"` @since v3.9 */
    toolbarFiltersActive?: string;
    /** Default: `"Clear all"` @since v3.9 */
    toolbarFiltersClearAll?: string;
    /** Default: `"Clear all filters"` @since v3.9 */
    toolbarFiltersClearAllTooltip?: string;
    /** Default: `"Close"` @since v3.9 */
    toolbarFiltersClose?: string;
    /** Default: `"Close filters"` @since v3.9 */
    toolbarFiltersCloseTooltip?: string;
    /** Default: `"Close filters panel"` @since v3.9 */
    toolbarFiltersCloseLabel?: string;
    /** Tooltip of the pivot button. Default: `"Pivot"` @since v3.9 */
    toolbarPivot?: string;
    /** `aria-label` of the pivot button. Default: `"Configure pivot"` @since v3.9 */
    toolbarPivotLabel?: string;
    /** `aria-label` of the active-pivot dot. Default: `"Pivot active"` @since v3.9 */
    toolbarPivotActive?: string;
    /** Tooltip of the summaries button and title of its panel. Default: `"Summaries"` @since v3.9 */
    toolbarSummaries?: string;
    /** `aria-label` of the summaries button. Default: `"Configure summaries"` @since v3.9 */
    toolbarSummariesLabel?: string;
    /** `aria-label` of the active-summaries dot. Default: `` (n) => `${n} active summaries` `` @since v3.9 */
    toolbarSummariesActive?: (count: number) => string;
    /** `aria-label` of the summaries panel. Default: `"Summaries configuration"` @since v3.9 */
    toolbarSummariesPanelLabel?: string;
    /** Default: `"Clear all"` @since v3.9 */
    toolbarSummariesClearAll?: string;
    /** Default: `"Clear all summaries"` @since v3.9 */
    toolbarSummariesClearAllTooltip?: string;
    /** Default: `"No aggregable columns."` @since v3.9 */
    toolbarSummariesEmpty?: string;
    /** Text before `aggregable: true` in the empty panel. Default: `"Set"` @since v3.9 */
    toolbarSummariesEmptyHintBefore?: string;
    /** Text after `aggregable: true` in the empty panel. Default: `"on a column to enable."` @since v3.9 */
    toolbarSummariesEmptyHintAfter?: string;
    /** Names of the aggregation functions in the summaries panel (`none`, `sum`, …). Missing ones show their id. @since v3.9 */
    toolbarAggregationFunctions?: Partial<Record<string, string>>;

    // ── Pivot panel (v3.9) ────────────────────────────────────────────────────
    /** `aria-label` of the panel. Default: `"Pivot configuration"` @since v3.9 */
    pivotPanelLabel?: string;
    /** Default: `"Pivot Mode"` @since v3.9 */
    pivotMode?: string;
    /** Default: `"Reset"` @since v3.9 */
    pivotReset?: string;
    /** Default: `"Reset pivot"` @since v3.9 */
    pivotResetTooltip?: string;
    /** Default: `"Row Fields"` @since v3.9 */
    pivotRowFields?: string;
    /** Default: `"Column Fields"` @since v3.9 */
    pivotColumnFields?: string;
    /** Default: `"Value Fields (aggregated)"` @since v3.9 */
    pivotValueFields?: string;
    /** Default: `"Add fields here — each becomes a row label"` @since v3.9 */
    pivotRowFieldsPlaceholder?: string;
    /** Default: `"Add fields here — unique values become column headers"` @since v3.9 */
    pivotColumnFieldsPlaceholder?: string;
    /** Default: `"Add numeric fields here — values are aggregated"` @since v3.9 */
    pivotValueFieldsPlaceholder?: string;
    /** Tooltip of a chip's remove button. Default: `` (h) => `Remove ${h}` `` @since v3.9 */
    pivotRemoveTooltip?: (header: string) => string;
    /** Default: `` (h) => `Remove ${h} from Row Fields` `` @since v3.9 */
    pivotRemoveRowLabel?: (header: string) => string;
    /** Default: `` (h) => `Remove ${h} from Column Fields` `` @since v3.9 */
    pivotRemoveColumnLabel?: (header: string) => string;
    /** Receives the header and the function's name. Default: `` (h, fn) => `Remove ${h} (${fn}) from Value Fields` `` @since v3.9 */
    pivotRemoveValueLabel?: (header: string, aggregationFunction: string) => string;
    /** Tooltip of a value field's function select. Default: `"Aggregation function"` @since v3.9 */
    pivotAggregationTooltip?: string;
    /** Default: `` (h) => `Aggregation function for ${h}` `` @since v3.9 */
    pivotAggregationLabel?: (header: string) => string;
    /** Names of the aggregation functions in the pivot panel. Missing ones show the id in upper case (`"SUM"`). @since v3.9 */
    pivotAggregationFunctions?: Partial<Record<string, string>>;
    /** Default: `"Available Fields"` @since v3.9 */
    pivotAvailableFields?: string;
    /** Default: `"All fields are in use."` @since v3.9 */
    pivotAllFieldsInUse?: string;
    /** Default: `"Row"` @since v3.9 */
    pivotAddRow?: string;
    /** Default: `"Col"` @since v3.9 */
    pivotAddColumn?: string;
    /** Default: `"Val"` @since v3.9 */
    pivotAddValue?: string;
    /** Default: `"Add to Row Fields"` @since v3.9 */
    pivotAddRowTooltip?: string;
    /** Default: `"Add to Column Fields"` @since v3.9 */
    pivotAddColumnTooltip?: string;
    /** Default: `"Add to Value Fields"` @since v3.9 */
    pivotAddValueTooltip?: string;
    /** Default: `` (h) => `Add ${h} to Row Fields` `` @since v3.9 */
    pivotAddRowLabel?: (header: string) => string;
    /** Default: `` (h) => `Add ${h} to Column Fields` `` @since v3.9 */
    pivotAddColumnLabel?: (header: string) => string;
    /** Default: `` (h) => `Add ${h} to Value Fields` `` @since v3.9 */
    pivotAddValueLabel?: (header: string) => string;

    // ── AI assistant panel (v3.9) ─────────────────────────────────────────────
    /** Panel title and `aria-label`. Default: `"Ask AI"` @since v3.9 */
    aiAssistantTitle?: string;
    /** `aria-label` of the close button. Default: `"Close"` @since v3.9 */
    aiAssistantClose?: string;
    /** `aria-label` of the prompt input. Default: `"Prompt"` @since v3.9 */
    aiAssistantPromptLabel?: string;
    /** Placeholder of the prompt input; `aiAssistant.placeholder` wins. Default: `"Ask about this table…"` @since v3.9 */
    aiAssistantPlaceholder?: string;
    /** Default: `"Dictate a prompt"` @since v3.9 */
    aiAssistantStartDictation?: string;
    /** Default: `"Stop dictation"` @since v3.9 */
    aiAssistantStopDictation?: string;
    /** Default: `"Ask"` @since v3.9 */
    aiAssistantAsk?: string;
    /** Default: `"Stop"` @since v3.9 */
    aiAssistantStop?: string;
    /** Default: `"Suggestions"` @since v3.9 */
    aiAssistantSuggestions?: string;
    /** Default: `"Applied changes"` @since v3.9 */
    aiAssistantAppliedChanges?: string;
    /** `aria-label` of a chip's remove button. Default: `` (label) => `Remove ${label}` `` @since v3.9 */
    aiAssistantRemoveChange?: (label: string) => string;
    /** Default: `"Undo"` @since v3.9 */
    aiAssistantUndo?: string;
    /** `aria-label` of the ignored list. Default: `"Ignored"` @since v3.9 */
    aiAssistantIgnored?: string;
    /** An ignored item. Default: `` (message) => `Ignored: ${message}` `` @since v3.9 */
    aiAssistantIgnoredItem?: (message: string) => string;
    /** Default: `"Earlier"` @since v3.9 */
    aiAssistantEarlier?: string;
    /** Status while a request runs. Default: `"Thinking…"` @since v3.9 */
    aiAssistantThinking?: string;
    /** Default: `"Stopped"` @since v3.9 */
    aiAssistantStopped?: string;
    /** Default: `"Undone"` @since v3.9 */
    aiAssistantUndone?: string;
    /** Default: `"Change removed"` @since v3.9 */
    aiAssistantChangeRemoved?: string;
    /**
     * Status after a reply. Receives the applied and ignored counts. Default: `"No changes"`,
     * `"Applied 1 change"`, `"Applied 3 changes, 1 ignored"` @since v3.9
     */
    aiAssistantApplied?: (applied: number, ignored: number) => string;
    /** Status when a reply was not validated. Default: `"The reply was not validated"` @since v3.9 */
    aiAssistantNotValidated?: string;
    /** Status when the request failed. Default: `` (m) => `The assistant could not answer: ${m}` `` @since v3.9 */
    aiAssistantFailed?: (message: string) => string;
    /** Error text when a failed request has no message. Default: `"Unknown error"` @since v3.9 */
    aiAssistantUnknownError?: string;

    // ── Pagination (v3.9) ─────────────────────────────────────────────────────
    /** `aria-label` of the pagination bar. Default: `"Pagination"` @since v3.9 */
    paginationLabel?: string;
    /** Default: `"Go to first page"` @since v3.9 */
    paginationFirstPageLabel?: string;
    /** Default: `"First page"` @since v3.9 */
    paginationFirstPageTooltip?: string;
    /** Default: `"Go to previous page"` @since v3.9 */
    paginationPreviousPageLabel?: string;
    /** Default: `"Previous page"` @since v3.9 */
    paginationPreviousPageTooltip?: string;
    /** Default: `"Go to next page"` @since v3.9 */
    paginationNextPageLabel?: string;
    /** Default: `"Next page"` @since v3.9 */
    paginationNextPageTooltip?: string;
    /** Default: `"Go to last page"` @since v3.9 */
    paginationLastPageLabel?: string;
    /** Default: `"Last page"` @since v3.9 */
    paginationLastPageTooltip?: string;

    // ── Cell selection stats (v3.9) ───────────────────────────────────────────
    /** Default: `"Count"` @since v3.9 */
    cellSelectionStatsCount?: string;
    /** Default: `"Sum"` @since v3.9 */
    cellSelectionStatsSum?: string;
    /** Default: `"Average"` @since v3.9 */
    cellSelectionStatsAverage?: string;
}
