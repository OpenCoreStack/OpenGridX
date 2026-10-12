import type { GridFilterOperator } from './filtering';

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
}
