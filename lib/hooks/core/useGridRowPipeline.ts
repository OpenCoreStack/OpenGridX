import { useMemo } from 'react';
import { filterRows } from '../../utils/filtering';
import { sortRows } from '../../utils/sorting';
import { getPinnedRowGroups } from '../../utils/pinning';
import { normalizePageSize, getPageCount, clampPage } from '../../utils/pagination';
import type { GridColumnLookup } from '../../utils/columnLookup';
import type { GridRowModel, GridRowId, GridFilterModel, GridSortItem, GridPaginationModel, GridRowPinning } from '../../types';

interface HierarchyHandlers<R extends GridRowModel> {
    /** `labelField` is the column showing the hierarchy, so sorting by it can order group rows by their labels. */
    getVisibleRows: (options?: { labelField?: string; expandAll?: boolean }) => R[] | null;
}

export interface UseGridRowPipelineParams<R extends GridRowModel> {
    effectiveRows: R[];
    activeHierarchyHandlers: HierarchyHandlers<R> | null;
    filterMode: string;
    filterModel: GridFilterModel;
    sortModel: GridSortItem[];
    sortingMode: string;
    pagination: boolean;
    paginationMode: string;
    effectivePaginationModel: GridPaginationModel;
    pinnedRows?: GridRowPinning;
    /** Resolves a row's id for pinnedRows lookups; defaults to `row.id`. */
    getRowId?: (row: R) => GridRowId;
    /**
     * Column definitions for client-side filtering and sorting: cells are read through
     * `valueGetter`, `type` drives numeric/date comparison, and the quick filter searches only
     * the visible, filterable columns. Without it, `row[field]` is read directly.
     */
    columnLookup?: GridColumnLookup;
    /** Tree data / row grouping: the column that shows the expand toggle and group labels. */
    hierarchyField?: string;
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
        sortModel,
        sortingMode,
        pagination,
        paginationMode,
        effectivePaginationModel,
        pinnedRows,
        getRowId,
        columnLookup,
        hierarchyField,
    } = params;

    // Server modes mean "the rows are already filtered/sorted/paged", with or without a
    // dataSource (a consumer can fetch pages itself from onPaginationModelChange etc.).
    const filteredRows = useMemo<R[]>(() => {
        if (activeHierarchyHandlers) return (activeHierarchyHandlers.getVisibleRows({ labelField: hierarchyField }) || []) as R[];
        if (filterMode === 'server') return effectiveRows;
        return filterRows(effectiveRows, filterModel, columnLookup) as R[];
    }, [effectiveRows, filterModel, activeHierarchyHandlers, hierarchyField, filterMode, columnLookup]);

    const dataRows = useMemo<R[]>(() => {
        if (!activeHierarchyHandlers) return filteredRows;
        if (filterMode === 'server') return effectiveRows;
        return filterRows(effectiveRows, filterModel, columnLookup) as R[];
    }, [activeHierarchyHandlers, filteredRows, filterMode, effectiveRows, filterModel, columnLookup]);

    const { top: pinnedTopRows, center: unpinnedRows, bottom: pinnedBottomRows } = useMemo(() => {
        if (activeHierarchyHandlers) return { top: [] as R[], center: filteredRows, bottom: [] as R[] };
        return getPinnedRowGroups(filteredRows, pinnedRows, getRowId);
    }, [filteredRows, pinnedRows, activeHierarchyHandlers, getRowId]);

    const sortedUnpinnedRows = useMemo<R[]>(() => {
        if (activeHierarchyHandlers) return unpinnedRows;
        if (sortingMode === 'server') return unpinnedRows;
        return sortRows(unpinnedRows, sortModel, columnLookup, getRowId) as R[];
    }, [unpinnedRows, sortModel, activeHierarchyHandlers, sortingMode, columnLookup, getRowId]);

    const isClientPaged = pagination && paginationMode !== 'server';
    const pageSize = normalizePageSize(effectivePaginationModel.pageSize);
    const currentPage = isClientPaged
        ? clampPage(effectivePaginationModel.page, getPageCount(sortedUnpinnedRows.length, pageSize))
        : effectivePaginationModel.page;

    const paginatedUnpinnedRows = useMemo<R[]>(() => {
        if (!isClientPaged) return sortedUnpinnedRows;
        const start = currentPage * pageSize;
        return sortedUnpinnedRows.slice(start, start + pageSize);
    }, [sortedUnpinnedRows, isClientPaged, currentPage, pageSize]);

    // What keyboard navigation walks: the rendered rows. With tree data and pagination that is the
    // current page, the same as a flat grid (hierarchy modes have no pinned rows).
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
