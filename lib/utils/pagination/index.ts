/**
 * Page-size and page-index arithmetic shared by the row pipeline, the pager and the list view,
 * so all three agree on which page is shown.
 */

/** A usable page size: a whole number of at least 1. A size of 0, a negative size or NaN would divide by zero. */
export function normalizePageSize(pageSize: number): number {
    return pageSize >= 1 ? Math.floor(pageSize) : 1;
}

/** The number of pages needed for `rowCount` rows; at least 1, so an empty grid still has page 1. */
export function getPageCount(rowCount: number, pageSize: number): number {
    return Math.max(1, Math.ceil(Math.max(0, rowCount) / normalizePageSize(pageSize)));
}

/** `page` limited to the valid range `0 … pageCount - 1`. */
export function clampPage(page: number, pageCount: number): number {
    if (!Number.isFinite(page)) return 0;
    return Math.min(Math.max(0, Math.floor(page)), Math.max(0, pageCount - 1));
}
