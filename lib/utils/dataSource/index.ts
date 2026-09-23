export interface ServerDrivenParams {
    dataSource?: unknown;
    paginationMode?: string;
    sortingMode?: string;
    filterMode?: string;
}

/**
 * True when a dataSource is fetching the grid's rows: any of pagination (including infinite
 * scroll), sorting or filtering is done on the server. The grid then holds only the rows the server
 * returned, so anything computed over "all rows" (such as aggregation totals) must come from the server.
 */
export function isServerDrivenDataSource({ dataSource, paginationMode, sortingMode, filterMode }: ServerDrivenParams): boolean {
    return Boolean(dataSource) && (
        paginationMode === 'server'
        || paginationMode === 'infinite'
        || sortingMode === 'server'
        || filterMode === 'server'
    );
}
