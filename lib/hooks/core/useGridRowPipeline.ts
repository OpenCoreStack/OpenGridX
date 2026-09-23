import { useMemo } from 'react';
import { filterRows } from '../../utils/filtering';
import { sortRows } from '../../utils/sorting';
import { getPinnedRowGroups } from '../../utils/pinning';
import { normalizePageSize, getPageCount, clampPage } from '../../utils/pagination';
import type { GridColumnLookup } from '../../utils/columnLookup';
import type { GridRowModel, GridFilterModel, GridSortItem, GridPaginationModel, GridRowPinning, GridDataSource } from '../../types';

interface HierarchyHandlers<R extends GridRowModel> {
    getVisibleRows: () => R[];
}

export interface UseGridRowPipelineParams<R extends GridRowModel> {
    effectiveRows: R[];
    activeHierarchyHandlers: HierarchyHandlers<R> | null;
    filterMode: string;
    filterModel: GridFilterModel;
    dataSource?: GridDataSource<R>;
    sortModel: GridSortItem[];
    sortingMode: string;
    pagination: boolean;
    paginationMode: string;
    effectivePaginationModel: GridPaginationModel;
    pinnedRows?: GridRowPinning;
    /**
     * Column definitions for client-side filtering and sorting: cells are read through
     * `valueGetter`, `type` drives numeric/date comparison, and the quick filter searches only
     * the visible, filterable columns. Without it, `row[field]` is read directly.
     */
    columnLookup?: GridColumnLookup;
}

export interface GridRowPipelineResult<R extends GridRowModel> {
    filteredRows: R[];
    /**
     * The filtered data rows, independent of hierarchy expansion. Under row grouping and tree
     * data, filteredRows is the visible hierarchy instead (group rows that already carry their
     * subtotals plus whichever children are expanded), so anything that totals or counts rows
     * must use dataRows.
     */
    dataRows: R[];
    pinnedTopRows: R[];
    unpinnedRows: R[];
    pinnedBottomRows: R[];
    sortedUnpinnedRows: R[];
    paginatedUnpinnedRows: R[];
    /**
     * The page the rows are sliced at: `effectivePaginationModel.page` clamped to the last page
     * when the grid pages client-side, so a page left past the end after the rows shrink shows
     * the last page instead of nothing. Under server pagination it is the requested page.
     */
    currentPage: number;
    /**
     * Pinned-top rows, the rows on the current page (all rows without pagination) and
     * pinned-bottom rows: exactly the rows the grid view renders. Loading placeholders for
     * infinite scroll are not included; GridVirtualRows draws those itself.
     */
    allRenderableRows: R[];
}

export function useGridRowPipeline<R extends GridRowModel>(
    params: UseGridRowPipelineParams<R>
): GridRowPipelineResult<R> {
    const {
        effectiveRows,
        activeHierarchyHandlers,
        filterMode,
        filterModel,
        dataSource,
        sortModel,
        sortingMode,
        pagination,
        paginationMode,
        effectivePaginationModel,
        pinnedRows,
        columnLookup,
    } = params;

    const filteredRows = useMemo<R[]>(() => {
        if (activeHierarchyHandlers) return (activeHierarchyHandlers.getVisibleRows() || []) as R[];
        if (filterMode === 'server' && dataSource) return effectiveRows;
        return filterRows(effectiveRows, filterModel, columnLookup) as R[];
    }, [effectiveRows, filterModel, activeHierarchyHandlers, filterMode, dataSource, columnLookup]);

    const dataRows = useMemo<R[]>(() => {
        if (!activeHierarchyHandlers) return filteredRows;
        if (filterMode === 'server' && dataSource) return effectiveRows;
        return filterRows(effectiveRows, filterModel, columnLookup) as R[];
    }, [activeHierarchyHandlers, filteredRows, filterMode, dataSource, effectiveRows, filterModel, columnLookup]);

    const { top: pinnedTopRows, center: unpinnedRows, bottom: pinnedBottomRows } = useMemo(() => {
        if (activeHierarchyHandlers) return { top: [] as R[], center: filteredRows, bottom: [] as R[] };
        return getPinnedRowGroups(filteredRows, pinnedRows);
    }, [filteredRows, pinnedRows, activeHierarchyHandlers]);

    const sortedUnpinnedRows = useMemo<R[]>(() => {
        if (activeHierarchyHandlers) return unpinnedRows;
        if (sortingMode === 'server' && dataSource) return unpinnedRows;
        return sortRows(unpinnedRows, sortModel, columnLookup) as R[];
    }, [unpinnedRows, sortModel, activeHierarchyHandlers, sortingMode, dataSource, columnLookup]);

    const isClientPaged = pagination && !(paginationMode === 'server' && dataSource);
    const pageSize = normalizePageSize(effectivePaginationModel.pageSize);
    const currentPage = isClientPaged
        ? clampPage(effectivePaginationModel.page, getPageCount(sortedUnpinnedRows.length, pageSize))
        : effectivePaginationModel.page;

    const paginatedUnpinnedRows = useMemo<R[]>(() => {
        if (!isClientPaged) return sortedUnpinnedRows;
        const start = currentPage * pageSize;
        return sortedUnpinnedRows.slice(start, start + pageSize);
    }, [sortedUnpinnedRows, isClientPaged, currentPage, pageSize]);

    const allRenderableRows = useMemo<R[]>(() => {
        const centerRows = pagination ? paginatedUnpinnedRows : sortedUnpinnedRows;
        return [...pinnedTopRows, ...centerRows, ...pinnedBottomRows];
    }, [pinnedTopRows, paginatedUnpinnedRows, sortedUnpinnedRows, pinnedBottomRows, pagination]);

    return {
        filteredRows,
        dataRows,
        pinnedTopRows,
        unpinnedRows,
        pinnedBottomRows,
        sortedUnpinnedRows,
        paginatedUnpinnedRows,
        currentPage,
        allRenderableRows,
    };
}
