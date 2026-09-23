import { useLayoutEffect, useRef } from 'react';
import type {
    GridApi,
    GridColDef,
    GridFilterModel,
    GridPaginationModel,
    GridRowId,
    GridRowModel,
    GridSortDirection,
    GridSortItem,
} from '../../types';
import { nextSelectionForRows } from './useGridRowSelection';

export interface UseGridApiMethodsParams {
    apiRef: React.MutableRefObject<GridApi>;

    sortModel: GridSortItem[];
    /** Mirrors a header click: multiSort merges into the model, otherwise the model is replaced. */
    multiSort: boolean;
    onSortModelChange: (model: GridSortItem[]) => void;

    filterModel: GridFilterModel;
    onFilterModelChange: (model: GridFilterModel) => void;

    paginationModel: GridPaginationModel;
    onPaginationModelChange: (model: GridPaginationModel) => void;

    selectedRowIds: Set<GridRowId>;
    onRowSelectionModelChange: (model: GridRowId[]) => void;
    disableMultipleRowSelection: boolean;

    /** Rows on screen: pinned top, the current page (or all rows), pinned bottom. */
    getVisibleRows: () => GridRowModel[];
    /** Every row that passes the filter, ignoring pagination and hierarchy expansion. */
    getAllFilteredRows: () => GridRowModel[];
    /** Columns on screen, in display order. */
    visibleColumns: GridColDef[];
}

export function nextSortModelForColumn(
    current: GridSortItem[],
    field: string,
    direction: GridSortDirection,
    multiSort: boolean
): GridSortItem[] {
    if (!direction) return current.filter(item => item.field !== field);
    if (!multiSort) return [{ field, sort: direction }];
    const index = current.findIndex(item => item.field === field);
    if (index === -1) return [...current, { field, sort: direction }];
    const next = [...current];
    next[index] = { field, sort: direction };
    return next;
}

/**
 * Installs the parts of the imperative API that read or change the state the grid renders
 * from (sort, filter, pagination, selection, visible rows and columns). Setters go through
 * the same handlers as the UI, so controlled props and change callbacks behave the same way.
 *
 * The methods read the latest values from a ref refreshed in a layout effect. A setter also
 * writes its result into that ref, so consecutive calls in one tick (selectRow(1);
 * selectRow(2)) build on each other instead of on the last render.
 */
export function useGridApiMethods(params: UseGridApiMethodsParams): void {
    const { apiRef } = params;
    const latestRef = useRef(params);

    useLayoutEffect(() => {
        latestRef.current = params;
    });

    useLayoutEffect(() => {
        const api = apiRef.current;
        const latest = () => latestRef.current;

        api.getSortModel = () => latest().sortModel;
        api.sortColumn = (field, direction) => {
            const { sortModel, multiSort, onSortModelChange } = latest();
            const next = nextSortModelForColumn(sortModel, field, direction, multiSort);
            latestRef.current = { ...latest(), sortModel: next };
            onSortModelChange(next);
        };

        api.getFilterModel = () => latest().filterModel;
        api.setFilterModel = (model) => {
            latestRef.current = { ...latest(), filterModel: model };
            latest().onFilterModelChange(model);
        };

        const setPaginationModel = (model: GridPaginationModel) => {
            latestRef.current = { ...latest(), paginationModel: model };
            latest().onPaginationModelChange(model);
        };
        api.setPage = (page) => setPaginationModel({ ...latest().paginationModel, page });
        api.setPageSize = (pageSize) => setPaginationModel({ ...latest().paginationModel, pageSize, page: 0 });

        const setSelection = (ids: GridRowId[], isSelected: boolean) => {
            const { selectedRowIds, disableMultipleRowSelection, onRowSelectionModelChange } = latest();
            const next = nextSelectionForRows(selectedRowIds, ids, isSelected, disableMultipleRowSelection);
            latestRef.current = { ...latest(), selectedRowIds: new Set(next) };
            onRowSelectionModelChange(next);
        };
        api.getSelectedRows = () => Array.from(latest().selectedRowIds);
        api.selectRow = (id, isSelected = true) => setSelection([id], isSelected);
        api.selectRows = (ids, isSelected = true) => setSelection(ids, isSelected);

        api.getVisibleRows = () => latest().getVisibleRows();
        api.getAllFilteredRows = () => latest().getAllFilteredRows();
        api.getVisibleColumns = () => latest().visibleColumns;
    }, [apiRef]);
}
