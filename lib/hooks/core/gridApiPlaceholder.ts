import type { GridApi, GridRowModel, GridValidRowModel } from '../../types';

const noop = () => {};

/**
 * A complete GridApi whose methods are safe no-ops. `useGridApiRef()` starts with one so
 * `apiRef.current` is never null (its type says it is not) before the grid has mounted;
 * the grid replaces it with the live API when it mounts.
 */
export function createGridApiPlaceholder<R extends GridValidRowModel = GridRowModel>(): GridApi<R> {
    return {
        getRow: () => null,
        getAllRows: () => [],
        getVisibleRows: () => [],
        getAllFilteredRows: () => [],
        getGroupedExportRows: () => null,
        getAggregationResult: () => null,
        getAggregationModel: () => null,
        getColumn: () => null,
        getAllColumns: () => [],
        getVisibleColumns: () => [],
        selectRow: noop,
        selectRows: noop,
        getSelectedRows: () => [],
        sortColumn: noop,
        getSortModel: () => [],
        setFilterModel: noop,
        getFilterModel: () => ({ items: [] }),
        setPage: noop,
        setPageSize: noop,
        scrollToIndexes: noop,
        autosizeColumn: noop,
        autosizeColumns: noop,
        copySelectedRows: () => Promise.resolve(),
    };
}
