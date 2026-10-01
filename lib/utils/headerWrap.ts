/**
 * Line height of a wrapped header title in pixels. Must match `line-height` of
 * `.ogx__header-cell--wrap .ogx__header-cell-title` in Header.css.
 */
export const HEADER_WRAP_LINE_HEIGHT = 16;

/** Vertical padding of a header cell (`--ogx-grid-cell-padding-y`, 8px by default), top plus bottom. */
const HEADER_VERTICAL_PADDING = 16;

/**
 * How many lines a wrapped header title may take inside a header of `headerHeight` pixels: 2 at 56px,
 * 3 at 72px, 4 at 88px. One line less when the aggregation label sits under the title. Never below 1.
 */
export function getHeaderLineClamp(headerHeight: number, hasAggregationLabel = false): number {
    const available = Number.isFinite(headerHeight) ? headerHeight - HEADER_VERTICAL_PADDING : 0;
    const lines = Math.floor(available / HEADER_WRAP_LINE_HEIGHT) - (hasAggregationLabel ? 1 : 0);
    return Math.max(1, lines);
}

/** Whether a column's header title wraps: the column's own `wrapHeaderText` wins over the grid's. */
export function shouldWrapHeaderText(columnWrap: boolean | undefined, gridWrap: boolean | undefined): boolean {
    return columnWrap ?? gridWrap ?? false;
}
