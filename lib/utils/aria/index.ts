export interface GridAriaRowLayoutParams {
    /** Header rows: the column header row plus any column-group rows. */
    headerRowCount: number;
    pinnedTopCount: number;
    pinnedBottomCount: number;
    /** Centre rows rendered for the current page. */
    pageRowCount: number;
    /** Centre rows across every page (the server's rowCount under server pagination). */
    totalCenterRowCount: number;
    /** Centre rows on the pages before the current one. */
    pageOffset: number;
}

export interface GridAriaRowLayout {
    /** `aria-rowcount` of the grid. */
    rowCount: number;
    /** `aria-rowindex` of the first top-pinned row. */
    topBase: number;
    /** Added to a centre row's `rowIndex` (which counts top-pinned rows) to get its `aria-rowindex`. */
    centerOffset: number;
    /** `aria-rowindex` of the first bottom-pinned row. */
    bottomBase: number;
    /** `rowIndex` of the first bottom-pinned row (top-pinned + centre rows of this page). */
    bottomRowIndexOffset: number;
}

/**
 * Row positions for assistive technology. Header rows come first; data rows are numbered across
 * the whole dataset, so page 2 does not restart at 1 and bottom-pinned rows follow every page.
 */
export function getAriaRowLayout(params: GridAriaRowLayoutParams): GridAriaRowLayout {
    const { headerRowCount, pinnedTopCount, pinnedBottomCount, pageRowCount, totalCenterRowCount, pageOffset } = params;
    return {
        rowCount: headerRowCount + pinnedTopCount + totalCenterRowCount + pinnedBottomCount,
        topBase: headerRowCount + 1,
        centerOffset: headerRowCount + pageOffset + 1,
        bottomBase: headerRowCount + pinnedTopCount + totalCenterRowCount + 1,
        bottomRowIndexOffset: pinnedTopCount + pageRowCount,
    };
}
