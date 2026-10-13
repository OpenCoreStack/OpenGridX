import type { GridFilterOperator, GridLocaleText } from '../types';
import { HEADER_FILTER_OPERATOR_LABELS } from './headerFilters';
import { defaultCellSelectionAnnouncement } from './cellSelection';
import { AI_CHIP_TEXTS_EN, type GridAiChipTexts } from './aiAssistant';

/** `localeText` keys that hold a lookup record; the resolved locale has a function for each. */
type GridLocaleRecordKey = 'headerFilterOperators' | 'filterPanelOperators' | 'toolbarAggregationFunctions' | 'pivotAggregationFunctions';
type GridLocaleScalarKey = Exclude<keyof GridLocaleText, GridLocaleRecordKey>;

/** Every `localeText` string with its English default filled in. */
export type GridLocaleScalars = Required<Pick<GridLocaleText, GridLocaleScalarKey>>;

/** The grid's resolved strings: every key of `GridLocaleText`, lookup records turned into functions. */
export interface ResolvedGridLocale extends GridLocaleScalars {
    /** Operator name in the header filter row. */
    headerFilterOperator: (operator: GridFilterOperator) => string;
    /** Operator name in the filter panel's operator select. */
    filterPanelOperator: (operator: GridFilterOperator) => string;
    /** Aggregation function name in the toolbar's summaries panel. */
    toolbarAggregationFunction: (fn: string) => string;
    /** Aggregation function name in the pivot panel. */
    pivotAggregationFunction: (fn: string) => string;
}

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

/** The built-in English strings. */
export const GRID_LOCALE_EN: GridLocaleScalars = {
    paginationRowsPerPage: 'Rows per page:',
    paginationOf: (from, to, count) => (count === 0 ? `0 of ${count}` : `${from}–${to} of ${count}`),
    paginationPage: (page, pageCount) => `Page ${page} of ${pageCount}`,
    noRowsLabel: 'No Data',
    cellSelectionAnnouncement: defaultCellSelectionAnnouncement,
    aiAssistantButton: 'Ask AI',
    headerFilterCustom: 'Custom filter',
    headerFilterCustomTooltip: 'Set in the filter panel',
    headerFilterCellLabel: h => `Filter ${h}`,
    headerFilterValueLabel: h => `Filter value for ${h}`,
    headerFilterOperatorButtonLabel: (h, op) => `Filter operator for ${h}: ${op}`,
    headerFilterOperatorMenuLabel: h => `Filter operator for ${h}`,
    headerFilterClearLabel: h => `Clear filter for ${h}`,
    headerFilterClearTooltip: 'Clear',
    headerFilterAny: 'Any',
    headerFilterTrue: 'Yes',
    headerFilterFalse: 'No',

    gridLabel: 'Data grid',
    listViewLabel: 'Data grid list view',
    listViewItemCount: n => `${n} ${plural(n, 'item', 'items')}`,
    listViewPage: (p, pc) => `page ${p} of ${pc}`,
    listViewSelectedCount: n => `${n} selected`,
    loadingLabel: 'Loading data',
    liveRegionLoading: 'Loading data...',
    liveRegionError: m => `Error: ${m}`,
    liveRegionRowsFound: n => `${n} ${plural(n, 'row', 'rows')} found`,
    errorOverlayTitle: 'Oops! Something went wrong',
    errorOverlayRetry: 'Retry',
    aggregationFooterLabel: 'Aggregation totals',
    cellErrorLabel: field => `Error in cell: ${field}`,
    cellErrorTooltip: 'Render error',

    headerRowReorderLabel: 'Row reorder handle',
    headerRowReorderTooltip: 'Drag to reorder rows',
    headerDetailPanelLabel: 'Expand row details',
    headerSelectAllLabel: 'Select all rows',
    headerDeselectAllLabel: 'Deselect all rows',
    headerSortDescription: (d, p, n) => `Sorted ${d === 'asc' ? 'ascending' : 'descending'}, sort priority ${p} of ${n}`,
    headerColumnMenuButtonLabel: h => `Open column menu for ${h}`,
    headerColumnResizeLabel: f => `Resize ${f} column`,
    headerFilterNoFilterLabel: h => `No filter for ${h}`,

    rowSelectLabel: id => `Select row ${id}`,
    rowDeselectLabel: id => `Deselect row ${id}`,
    rowReorderLabel: 'Drag to reorder row',
    rowDetailPanelExpandLabel: 'Expand row details',
    rowDetailPanelCollapseLabel: 'Collapse row details',
    rowExpandLabel: 'Expand row',
    rowCollapseLabel: 'Collapse row',

    columnMenuLabel: h => `Column options for ${h}`,
    columnMenuSortAscending: 'Sort Ascending',
    columnMenuSortDescending: 'Sort Descending',
    columnMenuUnsort: 'Unsort',
    columnMenuPinColumn: 'Pin column',
    columnMenuPinLeft: 'Pin to Left',
    columnMenuPinLeftLabel: 'Pin to left',
    columnMenuPinRight: 'Pin to Right',
    columnMenuPinRightLabel: 'Pin to right',
    columnMenuUnpin: 'Unpin',
    columnMenuUnpinLabel: 'Unpin column',
    columnMenuHideColumn: 'Hide Column',
    columnMenuHideColumnLabel: h => `Hide ${h} column`,
    columnMenuManageColumns: 'Manage columns',
    columnMenuManageColumnsLabel: 'Manage all columns',

    columnsPanelSearchPlaceholder: 'Search',
    columnsPanelDragToReorder: 'Drag to reorder',
    columnsPanelShowHideAll: 'Show/Hide All',
    columnsPanelReset: 'Reset',
    columnsPanelClose: 'Close',

    filterPanelValueLabel: h => `Filter value for ${h}`,
    filterPanelOperatorLabel: h => `Filter operator for ${h}`,
    filterPanelClearLabel: h => `Clear filter for ${h}`,
    filterPanelClearTooltip: 'Clear',
    filterPanelAny: 'Any',
    filterPanelTrue: 'true',
    filterPanelFalse: 'false',
    filterPanelNumberPlaceholder: 'Number…',
    filterPanelValuePlaceholder: 'Value…',
    filterPanelMatch: 'Match:',
    filterPanelAnd: 'ALL (AND)',
    filterPanelOr: 'ANY (OR)',
    filterPanelHiddenConditions: n => (n === 1
        ? '1 more condition (a filter group or a second condition on a column) is applied and not shown here.'
        : `${n} more conditions (filter groups or further conditions on a column) are applied and not shown here.`),
    filterPanelNoColumns: 'No filterable columns.',

    toolbarLabel: 'Grid toolbar',
    toolbarSearchPlaceholder: 'Search...',
    toolbarSearchLabel: 'Global Search',
    toolbarSearchClear: 'Clear search',
    toolbarColumns: 'Columns',
    toolbarColumnsLabel: 'Manage columns',
    toolbarColumnsPanelLabel: 'Column visibility',
    toolbarFilters: 'Filters',
    toolbarFiltersLabel: 'Advanced filters',
    toolbarFiltersActive: 'Filters active',
    toolbarFiltersClearAll: 'Clear all',
    toolbarFiltersClearAllTooltip: 'Clear all filters',
    toolbarFiltersClose: 'Close',
    toolbarFiltersCloseTooltip: 'Close filters',
    toolbarFiltersCloseLabel: 'Close filters panel',
    toolbarPivot: 'Pivot',
    toolbarPivotLabel: 'Configure pivot',
    toolbarPivotActive: 'Pivot active',
    toolbarSummaries: 'Summaries',
    toolbarSummariesLabel: 'Configure summaries',
    toolbarSummariesActive: n => `${n} active summaries`,
    toolbarSummariesPanelLabel: 'Summaries configuration',
    toolbarSummariesClearAll: 'Clear all',
    toolbarSummariesClearAllTooltip: 'Clear all summaries',
    toolbarSummariesEmpty: 'No aggregable columns.',
    toolbarSummariesEmptyHintBefore: 'Set',
    toolbarSummariesEmptyHintAfter: 'on a column to enable.',

    pivotPanelLabel: 'Pivot configuration',
    pivotMode: 'Pivot Mode',
    pivotReset: 'Reset',
    pivotResetTooltip: 'Reset pivot',
    pivotRowFields: 'Row Fields',
    pivotColumnFields: 'Column Fields',
    pivotValueFields: 'Value Fields (aggregated)',
    pivotRowFieldsPlaceholder: 'Add fields here — each becomes a row label',
    pivotColumnFieldsPlaceholder: 'Add fields here — unique values become column headers',
    pivotValueFieldsPlaceholder: 'Add numeric fields here — values are aggregated',
    pivotRemoveTooltip: h => `Remove ${h}`,
    pivotRemoveRowLabel: h => `Remove ${h} from Row Fields`,
    pivotRemoveColumnLabel: h => `Remove ${h} from Column Fields`,
    pivotRemoveValueLabel: (h, fn) => `Remove ${h} (${fn}) from Value Fields`,
    pivotAggregationTooltip: 'Aggregation function',
    pivotAggregationLabel: h => `Aggregation function for ${h}`,
    pivotAvailableFields: 'Available Fields',
    pivotAllFieldsInUse: 'All fields are in use.',
    pivotAddRow: 'Row',
    pivotAddColumn: 'Col',
    pivotAddValue: 'Val',
    pivotAddRowTooltip: 'Add to Row Fields',
    pivotAddColumnTooltip: 'Add to Column Fields',
    pivotAddValueTooltip: 'Add to Value Fields',
    pivotAddRowLabel: h => `Add ${h} to Row Fields`,
    pivotAddColumnLabel: h => `Add ${h} to Column Fields`,
    pivotAddValueLabel: h => `Add ${h} to Value Fields`,

    aiAssistantTitle: 'Ask AI',
    aiAssistantClose: 'Close',
    aiAssistantPromptLabel: 'Prompt',
    aiAssistantPlaceholder: 'Ask about this table…',
    aiAssistantStartDictation: 'Dictate a prompt',
    aiAssistantStopDictation: 'Stop dictation',
    aiAssistantAsk: 'Ask',
    aiAssistantStop: 'Stop',
    aiAssistantSuggestions: 'Suggestions',
    aiAssistantAppliedChanges: 'Applied changes',
    aiAssistantRemoveChange: label => `Remove ${label}`,
    aiAssistantUndo: 'Undo',
    aiAssistantIgnored: 'Ignored',
    aiAssistantIgnoredItem: m => `Ignored: ${m}`,
    aiAssistantEarlier: 'Earlier',
    aiAssistantThinking: 'Thinking…',
    aiAssistantStopped: 'Stopped',
    aiAssistantUndone: 'Undone',
    aiAssistantChangeRemoved: 'Change removed',
    aiAssistantApplied: (count, ignored) => {
        const applied = count === 0 ? 'No changes' : `Applied ${count} ${plural(count, 'change', 'changes')}`;
        return ignored > 0 ? `${applied}, ${ignored} ignored` : applied;
    },
    aiAssistantNotValidated: 'The reply was not validated',
    aiAssistantFailed: m => `The assistant could not answer: ${m}`,
    aiAssistantUnknownError: 'Unknown error',
    aiAssistantChipSearch: AI_CHIP_TEXTS_EN.search,
    aiAssistantChipNoFilters: AI_CHIP_TEXTS_EN.noFilters,
    aiAssistantChipSort: AI_CHIP_TEXTS_EN.sort,
    aiAssistantChipNoSorting: AI_CHIP_TEXTS_EN.noSorting,
    aiAssistantChipGroup: AI_CHIP_TEXTS_EN.group,
    aiAssistantChipNoGrouping: AI_CHIP_TEXTS_EN.noGrouping,
    aiAssistantChipSummary: AI_CHIP_TEXTS_EN.summary,
    aiAssistantChipNoSummaries: AI_CHIP_TEXTS_EN.noSummaries,
    aiAssistantChipPivot: AI_CHIP_TEXTS_EN.pivot,
    aiAssistantChipNoPivot: AI_CHIP_TEXTS_EN.noPivot,
    aiAssistantChipVisibility: AI_CHIP_TEXTS_EN.visibility,

    paginationLabel: 'Pagination',
    paginationFirstPageLabel: 'Go to first page',
    paginationFirstPageTooltip: 'First page',
    paginationPreviousPageLabel: 'Go to previous page',
    paginationPreviousPageTooltip: 'Previous page',
    paginationNextPageLabel: 'Go to next page',
    paginationNextPageTooltip: 'Next page',
    paginationLastPageLabel: 'Go to last page',
    paginationLastPageTooltip: 'Last page',

    cellSelectionStatsCount: 'Count',
    cellSelectionStatsSum: 'Sum',
    cellSelectionStatsAverage: 'Average',
};

const SCALAR_KEYS = Object.keys(GRID_LOCALE_EN) as GridLocaleScalarKey[];

function pickScalar<K extends GridLocaleScalarKey>(target: GridLocaleScalars, localeText: GridLocaleText, key: K): void {
    const value = localeText[key];
    if (value !== undefined) target[key] = value as GridLocaleScalars[K];
}

/** The AI assistant's change-chip texts out of a resolved locale. */
export function aiChipTextsOf(locale: ResolvedGridLocale): GridAiChipTexts {
    return {
        operator: op => locale.filterPanelOperator(op as GridFilterOperator),
        search: locale.aiAssistantChipSearch,
        noFilters: locale.aiAssistantChipNoFilters,
        sort: locale.aiAssistantChipSort,
        noSorting: locale.aiAssistantChipNoSorting,
        group: locale.aiAssistantChipGroup,
        noGrouping: locale.aiAssistantChipNoGrouping,
        summary: locale.aiAssistantChipSummary,
        noSummaries: locale.aiAssistantChipNoSummaries,
        pivot: locale.aiAssistantChipPivot,
        noPivot: locale.aiAssistantChipNoPivot,
        visibility: locale.aiAssistantChipVisibility,
    };
}

/**
 * Fills every string `localeText` leaves out with its English default. Pure; memoise the result
 * per `localeText` object.
 */
export function resolveGridLocale(localeText?: GridLocaleText): ResolvedGridLocale {
    const scalars: GridLocaleScalars = { ...GRID_LOCALE_EN };
    if (localeText) SCALAR_KEYS.forEach(key => pickScalar(scalars, localeText, key));
    const headerFilterOperators = localeText?.headerFilterOperators;
    const filterPanelOperators = localeText?.filterPanelOperators;
    const toolbarFunctions = localeText?.toolbarAggregationFunctions;
    const pivotFunctions = localeText?.pivotAggregationFunctions;
    return {
        ...scalars,
        headerFilterOperator: op => headerFilterOperators?.[op] ?? HEADER_FILTER_OPERATOR_LABELS[op] ?? op,
        filterPanelOperator: op => filterPanelOperators?.[op] ?? op,
        toolbarAggregationFunction: fn => toolbarFunctions?.[fn] ?? fn,
        pivotAggregationFunction: fn => pivotFunctions?.[fn] ?? fn.toUpperCase(),
    };
}
