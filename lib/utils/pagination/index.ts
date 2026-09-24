import type { GridLocaleText } from '../../types';

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

export interface GetPaginationRowCountParams {
    paginationMode: 'client' | 'server' | 'infinite';
    /** Whether a `dataSource` is set: its response's `rowCount` then wins over the prop. */
    hasDataSource: boolean;
    /** The server total from the last `dataSource` response, if any. */
    dataSourceRowCount: number | null | undefined;
    /** The `rowCount` prop. */
    rowCountProp: number | undefined;
    /** The filtered, unpinned rows the grid holds. */
    clientRowCount: number;
}

/**
 * What the pager pages through. Client: the filtered, unpinned rows (pinned rows show on every
 * page). Server: the server total, from the dataSource response or the rowCount prop, falling
 * back to the rows the grid holds.
 */
export function getPaginationRowCount(params: GetPaginationRowCountParams): number {
    const { paginationMode, hasDataSource, dataSourceRowCount, rowCountProp, clientRowCount } = params;
    if (paginationMode !== 'server') return clientRowCount;
    return (hasDataSource ? dataSourceRowCount ?? rowCountProp : rowCountProp) ?? clientRowCount;
}

/** The pager's strings out of the grid's `localeText` (undefined when there is none). */
export function pickPaginationLocaleText(
    localeText: GridLocaleText | undefined
): Pick<GridLocaleText, 'paginationRowsPerPage' | 'paginationOf' | 'paginationPage'> | undefined {
    return localeText ? {
        paginationRowsPerPage: localeText.paginationRowsPerPage,
        paginationOf: localeText.paginationOf,
        paginationPage: localeText.paginationPage,
    } : undefined;
}

/** `page` limited to the valid range `0 … pageCount - 1`. */
export function clampPage(page: number, pageCount: number): number {
    if (!Number.isFinite(page)) return 0;
    return Math.min(Math.max(0, Math.floor(page)), Math.max(0, pageCount - 1));
}
