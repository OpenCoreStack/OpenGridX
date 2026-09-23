export interface ServerDrivenParams {
    dataSource?: unknown;
    paginationMode?: string;
    sortingMode?: string;
    filterMode?: string;
}

/**
 * True when a dataSource is present and the server shapes the rows: any of pagination (including
 * infinite scroll), sorting or filtering is done on the server. The grid then holds only the rows
 * the server returned, so anything computed over "all rows" (such as aggregation totals) must come
 * from the server. With every mode on 'client' the grid fetches all rows once and computes
 * everything itself.
 */
export function isServerDrivenDataSource({ dataSource, paginationMode, sortingMode, filterMode }: ServerDrivenParams): boolean {
    return Boolean(dataSource) && (
        paginationMode === 'server'
        || paginationMode === 'infinite'
        || sortingMode === 'server'
        || filterMode === 'server'
    );
}

/**
 * `endRow` of a request for every row: sent when the grid pages on the client (`paginationMode`
 * 'client') and when it loads the children of a server-side tree node. `endRow` is exclusive, and
 * `Number.MAX_SAFE_INTEGER` keeps both `rows.slice(startRow, endRow)` and
 * `LIMIT endRow - startRow` returning everything while staying JSON-serializable.
 */
export const GRID_ALL_ROWS_END_ROW = Number.MAX_SAFE_INTEGER;

/** Shown when a failed getRows call gives no usable message. */
export const DATA_SOURCE_ERROR_FALLBACK_MESSAGE = 'An unexpected error occurred while loading the data.';

/**
 * The message of the value a getRows call rejected with: an `Error`, a string, or any object with a
 * string `message` (the usual shape of fetch and HTTP-client errors).
 */
export function getDataSourceErrorMessage(error: unknown): string {
    if (typeof error === 'string' && error) return error;
    if (typeof error === 'object' && error !== null && 'message' in error
        && typeof error.message === 'string' && error.message) {
        return error.message;
    }
    return DATA_SOURCE_ERROR_FALLBACK_MESSAGE;
}
