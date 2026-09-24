import { useLayoutEffect, useRef } from 'react';
import type {
    GridApi,
    GridColDef,
    GridFilterModel,
    GridPaginationModel,
    GridRowId,
    GridRowModel,
    GridSortItem,
} from '../../types';
import { isSameSelection, nextSelectionForRows } from './useGridRowSelection';
import { nextSortModelForColumn } from './useGridHeaderHandlers';

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
    /**
     * A selection change made since the last commit (see useGridControlledState), or null. It
     * wins over `selectedRowIds`, so the API is current inside onRowSelectionModelChange.
     */
    getPendingRowSelectionModel?: () => GridRowId[] | null;
    onRowSelectionModelChange: (model: GridRowId[]) => void;
    disableMultipleRowSelection: boolean;
    /**
     * Rows the grid made (group headers, subtotals, auto-created parents, the pivot Grand Total):
     * `selectRow` / `selectRows` ignore their ids, as the checkbox, click and keyboard paths do.
     */
    isSyntheticRowId?: (id: GridRowId) => boolean;

    /** Rows on screen: pinned top, the current page (or all rows), pinned bottom. */
    getVisibleRows: () => GridRowModel[];
    /** Every row that passes the filter, ignoring pagination and hierarchy expansion. */
    getAllFilteredRows: () => GridRowModel[];
    /** Columns on screen, in display order. */
    visibleColumns: GridColDef[];
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

        const currentSelection = (): Set<GridRowId> => {
            const pending = latest().getPendingRowSelectionModel?.();
            return pending ? new Set(pending) : latest().selectedRowIds;
        };
        const setSelection = (ids: GridRowId[], isSelected: boolean) => {
            const { disableMultipleRowSelection, onRowSelectionModelChange, isSyntheticRowId } = latest();
            const dataIds = isSyntheticRowId ? ids.filter(id => !isSyntheticRowId(id)) : ids;
            if (dataIds.length === 0) return;
            const current = currentSelection();
            const next = nextSelectionForRows(current, dataIds, isSelected, disableMultipleRowSelection);
            // Like the UI paths, a call that changes nothing (selecting a selected row) reports nothing.
            if (isSameSelection(current, next)) return;
            latestRef.current = { ...latest(), selectedRowIds: new Set(next) };
            onRowSelectionModelChange(next);
        };
        api.getSelectedRows = () => Array.from(currentSelection());
        api.selectRow = (id, isSelected = true) => setSelection([id], isSelected);
        api.selectRows = (ids, isSelected = true) => setSelection(ids, isSelected);

        api.getVisibleRows = () => latest().getVisibleRows();
        api.getAllFilteredRows = () => latest().getAllFilteredRows();
        api.getVisibleColumns = () => latest().visibleColumns;
    }, [apiRef]);
}
