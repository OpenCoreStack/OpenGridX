import React, { useRef, useEffect, useLayoutEffect, useCallback, useMemo, useState } from 'react';
import { useLayout } from '../../hooks/core/useLayout';
import { useGridKeyboardNavigation } from '../../hooks/core/useGridKeyboardNavigation';
import { useGridControlledState } from '../../hooks/core/useGridControlledState';
import { useGridRowPipeline } from '../../hooks/core/useGridRowPipeline';
import { useGridVirtualization } from '../../hooks/core/useGridVirtualization';
import { useGridColumns } from '../../hooks/core/useGridColumns';
import { useGridVisibleRows } from '../../hooks/core/useGridVisibleRows';
import { useGridScrollSync } from '../../hooks/core/useGridScrollSync';
import { useGridStateSnapshot } from '../../hooks/core/useGridStateSnapshot';
import { useGridDevWarnings } from '../../hooks/core/useGridDevWarnings';
import { useGridRowSelection } from '../../hooks/core/useGridRowSelection';
import { useGridApiMethods } from '../../hooks/core/useGridApiMethods';
import { buildGroupedExportRows } from '../../utils/grouping/groupedExportRows';
import { useGridColumnLookup } from '../../hooks/core/useGridColumnLookup';
import { useGridPageCorrection } from '../../hooks/core/useGridPageCorrection';
import { useGridColumnsPanel } from '../../hooks/core/useGridColumnsPanel';
import { GridToolbarHostContext } from '../../hooks/core/gridToolbarHostContext';
import { scrollRowIntoView } from '../../utils/scroll';
import { upsertSortItem } from '../../utils/sorting';
import { GridAggregationFooter } from './GridAggregationFooter';
import { GridEmptyState } from './GridEmptyState';
import { GridErrorOverlay } from './GridErrorOverlay';
import { Header } from '../Header/Header';
import { Pagination } from '../Pagination/Pagination';
import { useDataGrid } from '../../hooks/core/useDataGrid';
import { useRowReorder } from '../../hooks/useRowReorder';
import { useTreeData } from '../../hooks/useTreeData';
import { useRowGrouping } from '../../hooks/useRowGrouping';
import { useGridEditing } from '../../hooks/features/useGridEditing';
import { useGridSpanning } from '../../hooks/features/useGridSpanning';
import { useGridSpanRowWindow, useGridSpanColumnWindow } from '../../hooks/features/useGridSpanRenderWindow';
import { useColumnGroupReorderGuard } from '../../hooks/features/useColumnGroupReorderGuard';
import { canReorderWithinColumnGroups, getColumnGroupDepth } from '../../utils/columnGroups';
import { useGridDataSource } from '../../hooks/features/useGridDataSource';
import { useAggregation, useServerAggregationResults } from '../../hooks/features/useAggregation';
import { useGridPivot } from '../../hooks/features/useGridPivot';
import { PIVOT_GRAND_TOTAL_ID } from '../../utils/pivot';
import { isServerDrivenDataSource } from '../../utils/dataSource';
import { useGridClipboard } from '../../hooks/features/useGridClipboard';
import { GridListView } from './GridListView';
import { GridPinnedRows } from './GridPinnedRows';
import { GridVirtualRows } from './GridVirtualRows';
import { GridStandaloneColumnPanel } from './GridStandaloneColumnPanel';
import type { DataGridProps, GridRowModel, GridRowId, GridSortDirection, GridColDef, GridRowParams, GridCellParams, GridDataSource, GridTreeNode, GridSortItem, GridRowMeta, GridGroupedExportRow } from '../../types';

const EMPTY_ROW_META_MAP: Map<GridRowId, GridRowMeta> = new Map();

export function DataGrid<R extends GridRowModel = GridRowModel>(props: DataGridProps<R>) {
    const {
        rows,
        columns,
        getRowId,
        rowHeight = 52,
        headerHeight = 56,
        autoHeight = false,
        density,
        checkboxSelection = false,
        disableRowSelectionOnClick = false,
        disableMultipleRowSelection = false,
        rowSelectionModel: propRowSelectionModel,
        onRowSelectionModelChange: propOnRowSelectionModelChange,
        onRowClick,
        onRowDoubleClick,
        onCellClick,

        filterModel: propFilterModel,
        onFilterModelChange,
        sortModel: propSortModel,
        onSortModelChange,
        pagination: propPagination = false,
        paginationModel,
        onPaginationModelChange,
        pageSizeOptions = [10, 25, 50, 100],
        pinnedColumns: propPinnedColumns,
        onPinnedColumnsChange,
        pinnedRows,

        getDetailPanelContent,
        getDetailPanelHeight,
        detailPanelExpandedRowIds: controlledExpandedRowIds,
        onDetailPanelExpandedRowIdsChange,
        pinCheckboxColumn = true,
        pinExpandColumn = true,
        disableColumnReorder = false,
        columnOrder,
        onColumnOrderChange,
        height,
        rowReordering = false,
        onRowOrderChange,
        loading = false,

        treeData = false,
        getTreeDataPath,
        defaultGroupingExpansionDepth,
        groupingColDef,

        rowGroupingModel: propRowGroupingModel,

        aggregationModel: propAggregationModel,
        onAggregationModelChange,
        getAggregationPosition,

        isCellEditable,
        processRowUpdate,
        onProcessRowUpdateError,

        dataSource,
        multiSort = false,
        sortingMode = 'client',
        filterMode = 'client',
        paginationMode = 'client',
        rowCount: propRowCount,

        slots,
        slotProps,

        pivotMode = false,
        pivotModel: propPivotModel,
        onPivotModelChange,

        className = '',
        style,
        onRowsScrollEnd,
        ariaLabel,
        initialState,
        onStateChange,
        // Column Visibility
        columnVisibilityModel: propColumnVisibilityModel,
        onColumnVisibilityModelChange,
        listView = false,
        listViewColumn,
        columnGroupingModel,
        noRowsLabel = 'No Data',
        localeText,
        apiRef: propApiRef,
        overscanRowCount = 3,
    } = props;

    const effectiveNoRowsLabel = localeText?.noRowsLabel ?? noRowsLabel;

    // Stable defaults
    const defaultRowGroupingModel = useMemo(() => [], []);
    const rowGroupingModel = propRowGroupingModel || defaultRowGroupingModel;

    // ─── Stabilize toolbar component identity ────────────────────────────────
    // Problem: demos/users often define their toolbar as an inline function
    // INSIDE their component body, e.g.:
    //   const MyToolbar = (props) => <GridToolbar {...props} />  // inside render!
    // This creates a NEW function reference on every parent re-render. React
    // reconciles by component *identity*, so a new reference = unmount old
    // toolbar + mount fresh one = all toolbar state (search expansion, filter
    // open, typed text) is destroyed on every keystroke.
    //
    // Fix: a stable wrapper component created ONCE via useRef. Its identity
    // never changes, so React keeps it mounted. It reads the latest toolbar
    // from a separate ref that is updated on every render, so the rendered
    // output is always current — zero stale closures.
    const latestToolbarRef = useRef(slots?.toolbar);
    latestToolbarRef.current = slots?.toolbar;
    // The wrapper itself has a stable identity (created once via useRef).
    // We call latestToolbarRef.current(props) as a PLAIN FUNCTION — not via
    // React.createElement — so React never sees a changing component type.
    // The elements the toolbar function returns are reconciled normally, so
    // GridToolbar's internal state (filterOpen, search expansion) is preserved
    // even when the toolbar is defined as an inline function inside the parent.
    const StableToolbar = useRef((props: Record<string, unknown>) => {
        const Toolbar = latestToolbarRef.current;
        return Toolbar ? (Toolbar as (p: typeof props) => React.ReactElement | null)(props) : null;
    }).current;

    const controlledState = useGridControlledState({
        initialState,
        sortModel: propSortModel,
        onSortModelChange,
        filterModel: propFilterModel,
        onFilterModelChange,
        aggregationModel: propAggregationModel,
        onAggregationModelChange,
        columnVisibilityModel: propColumnVisibilityModel,
        onColumnVisibilityModelChange,
        pinnedColumns: propPinnedColumns,
        onPinnedColumnsChange,
        pivotModel: propPivotModel,
        onPivotModelChange,
        paginationModel,
        onPaginationModelChange,
        pageSizeOptions,
        rowSelectionModel: propRowSelectionModel,
        onRowSelectionModelChange: propOnRowSelectionModelChange,
        density,
    });

    const {
        sortModel,
        isSortControlled,
        setInternalSortModel,
        handleSortModelChange,
        filterModel,
        handleFilterModelChange,
        aggregationModel,
        handleAggregationModelChange,
        columnVisibilityModel,
        handleColumnVisibilityModelChange,
        pinnedColumns,
        handlePinnedColumnsChange,
        currentPivotModel,
        handlePivotModelChange,
        effectivePaginationModel,
        handlePaginationModelChange,
        selectedRowIds,
        handleRowSelectionModelChange,
        density: effectiveDensity,
    } = controlledState;

    const pivot = useGridPivot({
        rows: rows as GridRowModel[],
        columns: columns as unknown as GridColDef[],
        pivotMode,
        pivotModel: currentPivotModel,
        filterModel,
        sortModel,
        hasDataSource: Boolean(dataSource),
        hierarchyRequested: treeData || rowGroupingModel.length > 0,
    });
    const isPivotActive = pivot.isActive;
    // Pivot rows are already grouped by the pivot row fields; tree data and row grouping would regroup them.
    const hierarchyRowGroupingModel = isPivotActive ? defaultRowGroupingModel : rowGroupingModel;
    const isTreeData = treeData && !isPivotActive;

    const effectiveRowHeight = effectiveDensity === 'compact' ? 32 : effectiveDensity === 'comfortable' ? 72 : rowHeight;

    const activeRows = pivot.rows as unknown as R[];
    const baseColumns = pivot.columns as unknown as GridColDef<R>[];

    // When groupingColDef is provided and row grouping is active, prepend a
    // dedicated synthetic __group__ column at position 0 (pinned-left).
    const isRowGroupingActive = hierarchyRowGroupingModel.length > 0;

    // Auto-pin __group__ column to the left when groupingColDef is active.
    // Both values MUST be memoized: without useMemo they produce a new array/object
    // reference every render, which cascades through useRowGrouping's memos and
    // effects into an infinite setState loop (Maximum update depth exceeded).
    const effectivePinnedColumns = useMemo(() => (
        (groupingColDef && isRowGroupingActive)
            ? { ...pinnedColumns, left: ['__group__', ...((pinnedColumns?.left ?? []).filter(f => f !== '__group__'))] }
            : pinnedColumns
    ), [groupingColDef, isRowGroupingActive, pinnedColumns]);

    const activeColumns = useMemo(() => (
        (groupingColDef && isRowGroupingActive)
            ? [
                {
                    headerName: 'Group',
                    width: 220,
                    ...groupingColDef,
                    field: '__group__',
                    hideable: false,
                    sortable: false,
                    filterable: false,
                    pinnable: false,
                    exportable: false,
                } as unknown as GridColDef<R>,
                ...baseColumns,
              ]
            : baseColumns
    ), [groupingColDef, isRowGroupingActive, baseColumns]);

    const columnLookup = useGridColumnLookup(activeColumns, columnVisibilityModel);

    // getRows-provided totals, dropped as soon as the aggregation model they were computed for changes.
    const [serverAggregationResults, setServerAggregationResults] = useServerAggregationResults(aggregationModel);

    const viewportRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Rows are stored and handed to consumers untouched: getRowId only decides the internal
    // key. Pivot rows are the grid's own and carry their own ids, so a getRowId written for
    // the source rows does not apply to them.
    const defaultGetRowId = useCallback((row: R) => row.id, []);
    const effectiveGetRowId = (!isPivotActive && getRowId) || defaultGetRowId;

    // Keyboard-mode flag: toggled via DOM classname — no React state needed
    // so the ring appears instantly without a re-render cycle.
    const setKeyboardMode = useCallback((on: boolean) => {
        containerRef.current?.classList.toggle('ogx--kb', on);
    }, []);

    const dataSourceRef = useRef<GridDataSource<R> | undefined>(dataSource);
    dataSourceRef.current = dataSource;

    const fetchChildrenRef = useRef<((parentId: GridRowId, groupKeys: string[]) => Promise<void>) | null>(null);
    const treeDataRef = useRef<ReturnType<typeof useTreeData> | null>(null);

    const handleNodeExpansion = useCallback((node: GridTreeNode) => {
        if (dataSourceRef.current && treeData) {

            if ((node.serverChildrenCount ?? 0) > 0 && (node.children ?? []).length === 0) {

                const groupKeys = treeDataRef.current?.getNodePath(node.id) || [node.groupingKey];
                fetchChildrenRef.current?.(node.id, groupKeys);
            }
        }
    }, [treeData]);

    const gridData = useDataGrid({
        rows: activeRows,
        getRowId: effectiveGetRowId,
        columns: activeColumns,
        rowHeight: effectiveRowHeight,
        headerHeight,
        columnVisibilityModel,
        initialState: props.initialState
    });
    const {
        state,
        apiRef,
        setRows,
        replaceRow,
        setColumns,
        setDimensions,
        setDataSourceLoading,
        setDataSourceError,
        setRowCount
    } = gridData;

    // The key of any row the grid renders: stored rows resolve through the store, and
    // grid-made rows (group rows, skeletons, generated tree parents) through their own `id`.
    const getRowIdOf = useCallback(
        (row: GridRowModel): GridRowId => state.rows.idByRow.get(row) ?? row.id,
        [state.rows.idByRow]
    );
    // Same resolver with a stable identity, for event handlers only (it reads the last
    // committed store), so column definitions are not rebuilt on every rows change.
    const getRowIdOfRef = useRef(getRowIdOf);
    useLayoutEffect(() => { getRowIdOfRef.current = getRowIdOf; });
    const getRowIdOfInEvents = useCallback((row: GridRowModel) => getRowIdOfRef.current(row), []);

    const { scrollTop, scrollLeft, overscanRows, handleScroll } = useGridScrollSync({ onRowsScrollEnd, overscanRowCount });

    // Layout effect: the live API must be in place before the parent's layout effects run.
    useLayoutEffect(() => {
        if (propApiRef) {
            propApiRef.current = apiRef.current;
        }
    }, [propApiRef, apiRef]);

    const { copySelectedRows } = useGridClipboard({
        selectedRowIds,
        columns: activeColumns as unknown as GridColDef[],
        getVisibleRows: () => apiRef.current.getVisibleRows(),
        getRowId: getRowIdOf,
    });

    // Expose on apiRef for programmatic use
    useEffect(() => {
        apiRef.current.copySelectedRows = copySelectedRows;
    }, [copySelectedRows, apiRef]);

    const isInternalLoading = state.dataSource.loading;
    const effectiveLoading = loading || isInternalLoading;

    const effectiveRows = useMemo(() => {
        return state.rows.allRows.map(id => state.rows.idRowsLookup.get(id)!) as R[];
    }, [state.rows]);

    const treeDataHandlers = useTreeData({
        rows: effectiveRows,
        getRowId: getRowIdOf,
        getTreeDataPath,
        treeData: isTreeData,
        defaultGroupingExpansionDepth,
        filterModel,

        sortModel,
        onRowExpansionChange: handleNodeExpansion,
        columnLookup,
    });

    useEffect(() => {
        treeDataRef.current = treeDataHandlers;
    }, [treeDataHandlers]);

    const rowGroupingHandlers = useRowGrouping({
        rows: effectiveRows,
        getRowId: getRowIdOf,
        columns: activeColumns,
        rowGroupingModel: hierarchyRowGroupingModel,
        aggregationModel,
        defaultGroupingExpansionDepth,
        filterModel,
        sortModel,
        getAggregationPosition,
        columnLookup,
    });

    const editingHandlers = useGridEditing({
        rows: effectiveRows,
        getRowId: getRowIdOf,
        columns: activeColumns,
        processRowUpdate,
        onProcessRowUpdateError,
        onRowChange: (updatedRow, rowId) => {
            // Replaces the edited row in the *current* store, under the edited row's id: this runs
            // after an awaited processRowUpdate, by which time the rows prop (or a dataSource
            // fetch) may have replaced the rows this render saw. The returned row is stored as is
            // (the grid never writes an id onto it), even if it does not carry its key itself.
            replaceRow(rowId, updatedRow);
        },
    });

    const isRowGrouping = hierarchyRowGroupingModel.length > 0;
    const isHierarchyEnabled = isTreeData || isRowGrouping;
    const activeHierarchyHandlers = isTreeData ? treeDataHandlers : (isRowGrouping ? rowGroupingHandlers : null);

    const rowMetaMap = useMemo<Map<GridRowId, GridRowMeta>>(() => {
        if (isTreeData) return treeDataHandlers.rowMetaMap;
        if (isRowGrouping) return rowGroupingHandlers.rowMetaMap;
        return EMPTY_ROW_META_MAP;
    }, [isTreeData, treeDataHandlers.rowMetaMap, isRowGrouping, rowGroupingHandlers.rowMetaMap]);

    const pagination = propPagination && !isRowGrouping;

    const dataSourceHandlers = useGridDataSource({
        dataSource,
        sortModel,
        filterModel,
        paginationModel: effectivePaginationModel,
        paginationMode,
        sortingMode,
        filterMode,
        aggregationModel,
        setRows,
        setRowCount,
        setDataSourceLoading,
        setDataSourceError,
        onAggregationResults: setServerAggregationResults,
    });

    useEffect(() => {
        if (dataSourceHandlers.fetchChildren) {
            fetchChildrenRef.current = dataSourceHandlers.fetchChildren;
        }
    }, [dataSourceHandlers.fetchChildren]);

    useEffect(() => {
        if (!dataSource) {
            setRows(activeRows);
        }
    }, [activeRows, setRows, dataSource]);

    // ── Detail panel (hoisted — hasDetailPanel feeds into useGridColumns) ──────
    const hasDetailPanel = Boolean(getDetailPanelContent);
    const [internalExpandedRowIds, setInternalExpandedRowIds] = useState<Set<GridRowId>>(new Set());
    const expandedRowIds = controlledExpandedRowIds ?? internalExpandedRowIds;

    const handleDetailPanelToggle = useCallback((rowId: GridRowId) => {
        const newExpandedRowIds = new Set(expandedRowIds);
        if (newExpandedRowIds.has(rowId)) {
            newExpandedRowIds.delete(rowId);
        } else {
            newExpandedRowIds.add(rowId);
        }
        if (controlledExpandedRowIds === undefined) {
            setInternalExpandedRowIds(newExpandedRowIds);
        }
        onDetailPanelExpandedRowIdsChange?.(newExpandedRowIds);
    }, [expandedRowIds, controlledExpandedRowIds, onDetailPanelExpandedRowIdsChange]);

    // ── Column management ─────────────────────────────────────────────────────
    const {
        effectiveColumns,
        orderedColumns,
        visibleOrderedColumns,
        navigationColumns,
        columnWidths,
        effectiveColumnOrder,
        setInternalColumnOrder,
        columnReorderHandlers,
        handleColumnResize,
    } = useGridColumns<R>({
        activeColumns,
        isHierarchyEnabled,
        isRowGrouping,
        isTreeData,
        activeHierarchyHandlers,
        columnVisibilityModel,
        columnOrder,
        onColumnOrderChange,
        disableColumnReorder,
        pivotMode: isPivotActive,
        checkboxSelection,
        hasDetailPanel,
        rowReordering,
        initialState,
        setColumns,
        pinnedColumns: effectivePinnedColumns,
        getRowId: getRowIdOfInEvents,
        aggregationModel,
        groupingRows: isRowGrouping ? rowGroupingHandlers.groupingRows : undefined,
    });

    useGridStateSnapshot({
        onStateChange,
        sortModel,
        filterModel,
        effectivePaginationModel,
        columnWidths,
        effectiveColumnOrder,
        columnVisibilityModel,
        pinnedColumns,
        density: effectiveDensity,
    });

    const rowPipeline = useGridRowPipeline<GridRowModel>({
        effectiveRows: effectiveRows as GridRowModel[],
        activeHierarchyHandlers: activeHierarchyHandlers as { getVisibleRows: () => GridRowModel[] } | null,
        filterMode,
        filterModel: pivot.pipelineFilterModel,
        sortModel: pivot.pipelineSortModel,
        sortingMode,
        pagination,
        paginationMode,
        effectivePaginationModel,
        pinnedRows,
        getRowId: getRowIdOf,
        columnLookup,
    });
    const filteredRows        = rowPipeline.filteredRows        as R[];
    const dataRows            = rowPipeline.dataRows            as R[];
    const pinnedTopRows       = rowPipeline.pinnedTopRows       as R[];
    const pinnedBottomRows    = rowPipeline.pinnedBottomRows    as R[];
    const sortedUnpinnedRows  = rowPipeline.sortedUnpinnedRows  as R[];
    const paginatedUnpinnedRows = rowPipeline.paginatedUnpinnedRows as R[];
    const allRenderableRows   = rowPipeline.allRenderableRows   as R[];

    useGridPageCorrection({
        paginationModel: effectivePaginationModel,
        currentPage: rowPipeline.currentPage,
        enabled: pagination && !effectiveLoading && sortedUnpinnedRows.length > 0,
        onPaginationModelChange: handlePaginationModelChange,
    });

    // What the pager pages through. Client: the filtered, unpinned rows (pinned rows show on
    // every page). Server: the server total, from the dataSource response or the rowCount prop.
    const paginationRowCount = paginationMode === 'server'
        ? ((dataSource ? state.pagination.rowCount ?? propRowCount : propRowCount) ?? sortedUnpinnedRows.length)
        : sortedUnpinnedRows.length;

    // Select-all acts on, and the header checkbox reflects, the data rows that pass the
    // filter: never rows hidden by it, synthetic group rows, the pivot grand total, or stale
    // ids in the selection.
    const selectableRowIds = useMemo(() => {
        const ids = dataRows.map(getRowIdOf);
        return isPivotActive ? ids.filter(id => id !== PIVOT_GRAND_TOTAL_ID) : ids;
    }, [dataRows, getRowIdOf, isPivotActive]);
    const rowSelection = useGridRowSelection({
        selectedRowIds,
        onSelectionModelChange: handleRowSelectionModelChange,
        disableMultipleRowSelection,
        selectableRowIds,
    });

    const handleRowClick = useCallback((params: GridRowParams<R>) => {
        const { id } = params;

        if (isHierarchyEnabled && rowMetaMap.get(id)?.hasChildren) {
            activeHierarchyHandlers?.toggleExpansion(id);
            return;
        }

        onRowClick?.(params);

        if (!disableRowSelectionOnClick) {
            rowSelection.clickRow(id);
        }
    }, [isHierarchyEnabled, activeHierarchyHandlers, onRowClick, rowMetaMap, disableRowSelectionOnClick, rowSelection]);

    useGridApiMethods({
        apiRef: gridData.apiRef,
        sortModel,
        multiSort,
        onSortModelChange: handleSortModelChange,
        filterModel,
        onFilterModelChange: handleFilterModelChange,
        paginationModel: effectivePaginationModel,
        onPaginationModelChange: handlePaginationModelChange,
        selectedRowIds,
        onRowSelectionModelChange: handleRowSelectionModelChange,
        disableMultipleRowSelection,
        getVisibleRows: () => [...pinnedTopRows, ...(pagination ? paginatedUnpinnedRows : sortedUnpinnedRows), ...pinnedBottomRows],
        getAllFilteredRows: () => {
            const hierarchyRows = activeHierarchyHandlers?.getVisibleRows({ expandAll: true }) as R[] | null | undefined;
            if (!hierarchyRows) return [...pinnedTopRows, ...sortedUnpinnedRows, ...pinnedBottomRows];
            return hierarchyRows.filter(row => !rowMetaMap.get(getRowIdOf(row))?.isGroupRow);
        },
        visibleColumns: visibleOrderedColumns as unknown as GridColDef[],
    });

    const rowReorderHandlers = useRowReorder({
        rows: pagination ? paginatedUnpinnedRows : sortedUnpinnedRows,
        getRowId: getRowIdOf,
        onRowOrderChange,
        rowReordering
    });

    const { aggregationResult, isLoading: isAggregationLoading } = useAggregation({
        rows: dataRows,
        columns: activeColumns as unknown as GridColDef[],
        aggregationModel,
        // Same rule useGridDataSource fetches by: when the server drives the rows, the grid only holds
        // some of them, so client totals would be partial.
        isServerSide: isServerDrivenDataSource({ dataSource, paginationMode, sortingMode, filterMode }),
        dataSource,
        filterModel,
        sortModel,
        serverAggregationResults,
    });

    // In pivot mode the pivot's own Grand Total row is the aggregate; aggregationModel keys name source
    // fields that the pivot rows do not have.
    const hasAggregation = Object.keys(aggregationModel).length > 0 && !isPivotActive;

    useEffect(() => {
        gridData.apiRef.current.getAggregationResult = () => hasAggregation ? aggregationResult : null;
        gridData.apiRef.current.getAggregationModel = () => hasAggregation ? aggregationModel : null;
        gridData.apiRef.current.getGroupedExportRows = (): GridGroupedExportRow[] | null => {
            if (!isRowGrouping) return null;
            // Every group expanded, filtered and sorted like the screen: collapsed groups still
            // export their rows.
            return buildGroupedExportRows<R>({
                rows: (rowGroupingHandlers.getVisibleRows({ expandAll: true }) ?? []) as R[],
                getRowId: getRowIdOf,
                rowMetaMap,
                columns: activeColumns,
                aggregationModel,
                aggregationResult: hasAggregation ? aggregationResult : null,
            });
        };
    }, [aggregationResult, aggregationModel, hasAggregation, gridData.apiRef, isRowGrouping, rowGroupingHandlers, rowMetaMap, activeColumns, getRowIdOf]);

    const layout = useLayout({
        rowHeight: effectiveRowHeight,
        pagination,
        paginatedUnpinnedRows,
        sortedUnpinnedRows,
        expandedRowIds,
        getDetailPanelHeight,
        pinnedTopRowsLength: pinnedTopRows.length,
        pinnedBottomRowsLength: pinnedBottomRows.length,
        visibleOrderedColumns,
        pinnedColumns: effectivePinnedColumns,
        columnWidths,
        viewportWidth: state.dimensions.viewportWidth || 1000,
        checkboxSelection,
        hasDetailPanel,
        rowReordering,
        pinCheckboxColumn,
        pinExpandColumn,
        autoHeight,
        paginationMode,
        isLoading: state.dataSource.loading,
        pageSize: effectivePaginationModel.pageSize,
        getRowId: getRowIdOf,
    });

    const spanning = useGridSpanning<R>({
        pinnedTopRows,
        centerRows: pagination ? paginatedUnpinnedRows : sortedUnpinnedRows,
        pinnedBottomRows,
        columns: visibleOrderedColumns,
        leftPinnedColumns: layout.leftPinnedCols,
        unpinnedColumns: layout.unpinnedColsWithWidth,
        rightPinnedColumns: layout.rightPinnedCols,
        expandedRowIds: hasDetailPanel ? expandedRowIds : undefined,
        rowMetaMap,
        getRowId: getRowIdOf,
    });

    // Rendered data columns with their layout-resolved widths, in render order (column group header rows).
    const renderedDataColumns = useMemo(
        () => [...layout.leftPinnedCols, ...layout.unpinnedColsWithWidth, ...layout.rightPinnedCols],
        [layout.leftPinnedCols, layout.unpinnedColsWithWidth, layout.rightPinnedCols]
    );

    useEffect(() => {
        gridData.apiRef.current.scrollToIndexes = ({ rowIndex, colIndex }) => {
            const el = viewportRef.current;
            if (!el) return;

            if (rowIndex !== undefined && rowIndex >= 0) {
                scrollRowIntoView(el, rowIndex, layout.cumulativeHeights, layout.pinnedBottomHeight);
            }

            if (colIndex !== undefined && colIndex >= 0) {
                // colIndex is an index into all data columns: leftPinned + unpinned + rightPinned
                const allDataCols = [...layout.leftPinnedCols, ...layout.unpinnedColsWithWidth, ...layout.rightPinnedCols];
                const targetCol = allDataCols[colIndex];
                if (!targetCol) return;
                const unpinnedIndex = layout.unpinnedColsWithWidth.findIndex(c => c.field === targetCol.field);
                if (unpinnedIndex === -1) return; // pinned column — always visible, no scroll needed
                const colLocalLeft = unpinnedIndex > 0 ? layout.unpinnedAccWidths[unpinnedIndex - 1] : 0;
                const colLocalRight = layout.unpinnedAccWidths[unpinnedIndex] ?? colLocalLeft;
                const colRight = layout.leftWidth + colLocalRight;
                const { scrollLeft, clientWidth } = el;
                if (colLocalLeft < scrollLeft) {
                    el.scrollLeft = colLocalLeft;
                } else if (colRight > scrollLeft + clientWidth) {
                    el.scrollLeft = colRight - clientWidth;
                }
            }
        };
    }, [layout, viewportRef, gridData.apiRef]);

    const virtualization = useGridVirtualization({
        layout,
        scrollTop,
        scrollLeft,
        viewportWidth: state.dimensions.viewportWidth,
        viewportHeight: state.dimensions.viewportHeight,
        autoHeight,
        rowReordering,
        hasDetailPanel,
        checkboxSelection,
        pinCheckboxColumn,
        pinExpandColumn,
        overscanRows,
    });


    useEffect(() => {
        if (!viewportRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions(width, height);
            }
        });

        resizeObserver.observe(viewportRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [setDimensions]);

    // Row checkbox / Space key. Honors disableMultipleRowSelection like a row click does.
    const handleSelectionChange = rowSelection.toggleRow;

    const handleSort = useCallback((field: string, direction: GridSortDirection) => {
        const newSortModel = direction ? [{ field, sort: direction }] : [];

        if (!isSortControlled) {
            setInternalSortModel(newSortModel as GridSortItem[]);
        }
        onSortModelChange?.(newSortModel as GridSortItem[]);
    }, [isSortControlled, onSortModelChange, setInternalSortModel]);

    const handleSortAdd = useCallback((field: string, direction: GridSortDirection) => {
        const newSortModel = upsertSortItem(sortModel, field, direction);

        if (!isSortControlled) {
            setInternalSortModel(newSortModel);
        }
        onSortModelChange?.(newSortModel);
    }, [sortModel, isSortControlled, onSortModelChange, setInternalSortModel]);

    const { focusedCell, setFocusedCell, handleFocus, handleBlur, handleKeyDown } = useGridKeyboardNavigation({
        allRenderableRows,
        navigationColumns,
        checkboxSelection,
        selectedRowIds,
        handleSelectionChange,
        handleDetailPanelToggle,
        editingHandlers,
        setKeyboardMode,
        sortModel,
        handleSort,
        isCellEditable,
        pagination,
        pageSize: effectivePaginationModel.pageSize,
        virtualization,
        viewportRef,
        pinnedTopRowCount: pinnedTopRows.length,
        getRowId: getRowIdOf,
        rowMetaMap,
        getSpanOrigin: spanning.getSpanOrigin,
    });

    const handleCellClick = useCallback((params: GridCellParams<R>) => {
        setKeyboardMode(false);
        setFocusedCell({ id: getRowIdOf(params.row), field: params.field });

        gridRef.current?.focus({ preventScroll: true });
        onCellClick?.(params);
    }, [onCellClick, setKeyboardMode, setFocusedCell, getRowIdOf]);

    const prevEditingCellRef = useRef(editingHandlers.editingCell);
    useEffect(() => {
        const wasEditing = Boolean(prevEditingCellRef.current);
        const isEditing = Boolean(editingHandlers.editingCell);

        if (wasEditing && !isEditing) {
            // Only reclaim focus the editor took with it (focus is on <body> once the editor unmounts).
            // If the edit ended because the user moved focus somewhere else, leave it there.
            const active = document.activeElement;
            if (!active || active === document.body) {
                gridRef.current?.focus({ preventScroll: true });
            }
        }

        prevEditingCellRef.current = editingHandlers.editingCell;
    }, [editingHandlers.editingCell]);

    const spanRowWindow = useGridSpanRowWindow({
        spanning,
        renderContext: virtualization.renderContext,
        offsetTop: virtualization.offsetTop,
        cumulativeHeights: layout.cumulativeHeights,
    });

    const visibleRows = useGridVisibleRows<R>({
        renderContext: spanRowWindow.renderContext,
        pinnedTopRows,
        pinnedBottomRows,
        paginatedUnpinnedRows,
        sortedUnpinnedRows,
        pagination,
        getRowId: getRowIdOf,
    });

    const renderColumns = useGridSpanColumnWindow<R>({
        spanning,
        firstColumnIndex: virtualization.renderContext.firstColumnIndex,
        lastColumnIndex: virtualization.renderContext.lastColumnIndex,
        virtualColumns: virtualization.virtualColumns,
        layout,
        rows: visibleRows,
    });

    useGridDevWarnings({
        paginationRequested: propPagination,
        isRowGrouping,
        autoHeight,
        viewportHeight: state.dimensions.viewportHeight,
        renderedRowCount: visibleRows.length,
        totalRowCount: pinnedTopRows.length + (pagination ? paginatedUnpinnedRows.length : sortedUnpinnedRows.length) + pinnedBottomRows.length,
    });

    const { allSelected, someSelected } = rowSelection;

    // Header drag-reorder keeps a column inside its column group (and ungrouped columns outside groups).
    const headerReorderHandlers = useColumnGroupReorderGuard(columnGroupingModel, columnReorderHandlers);

    const hasRowSpanning = React.useMemo(() => effectiveColumns.some(c => !!c.rowSpan), [effectiveColumns]);
    const columnsPanel = useGridColumnsPanel();
    const containerRef = React.useRef<HTMLDivElement>(null);

    const NoRowsOverlaySlot = slots?.noRowsOverlay;
    const LoadingOverlaySlot = slots?.loadingOverlay;
    const FooterSlot = slots?.footer;

    const toolbarProps = React.useMemo(() => {
        if (!slots?.toolbar) return null;
        const reorderHandler = disableColumnReorder
            ? undefined
            : (fromField: string, toField: string) => {
                if (!canReorderWithinColumnGroups(columnGroupingModel, fromField, toField)) return;
                const currentOrder = [...effectiveColumnOrder];
                const fromIdx = currentOrder.indexOf(fromField);
                const toIdx = currentOrder.indexOf(toField);
                if (fromIdx === -1 || toIdx === -1) return;
                const newOrder = [...currentOrder];
                newOrder.splice(fromIdx, 1);
                newOrder.splice(toIdx, 0, fromField);
                // A controlled columnOrder names source columns; generated pivot columns keep their own order.
                if (isPivotActive || !columnOrder) setInternalColumnOrder(newOrder);
                const col = effectiveColumns.find(c => c.field === fromField);
                if (col) onColumnOrderChange?.({ oldIndex: fromIdx, targetIndex: toIdx, column: col as unknown as GridColDef });
            };
        return {
            apiRef: gridData.apiRef,
            columns: orderedColumns as unknown as GridColDef[],
            baseColumns: columns as unknown as GridColDef[],
            aggregationModel,
            onAggregationModelChange: handleAggregationModelChange,
            ...(pivotMode || propPivotModel || onPivotModelChange ? {
                pivotModel: currentPivotModel,
                onPivotModelChange: handlePivotModelChange,
            } : {}),
            filterModel,
            onFilterModelChange: handleFilterModelChange,
            columnVisibilityModel,
            onColumnVisibilityModelChange: handleColumnVisibilityModelChange,
            onColumnReorder: reorderHandler,
            onColumnOrderReset: disableColumnReorder ? undefined : () => setInternalColumnOrder(columns.map(c => c.field)),
            forceColumnsOpen: columnsPanel.toolbarPanelRequested,
            onColumnsPanelClose: columnsPanel.closeToolbarPanel,
            ...slotProps?.toolbar,
        };
    }, [
        slots?.toolbar, disableColumnReorder, effectiveColumnOrder, orderedColumns, effectiveColumns,
        columnOrder, onColumnOrderChange, setInternalColumnOrder, gridData.apiRef,
        columns, aggregationModel, handleAggregationModelChange, pivotMode, isPivotActive,
        propPivotModel, onPivotModelChange, currentPivotModel, handlePivotModelChange,
        filterModel, handleFilterModelChange, columnVisibilityModel,
        handleColumnVisibilityModelChange, columnsPanel.toolbarPanelRequested, columnsPanel.closeToolbarPanel, slotProps?.toolbar, columnGroupingModel,
    ]);

    return (
        <div
            ref={containerRef}
            className={['ogx', className, autoHeight && 'ogx--auto-height', hasRowSpanning && 'ogx--row-spanning', listView && 'ogx--list-view'].filter(Boolean).join(' ')}
            style={{
                ...style,
                height: height ?? style?.height,
                '--ogx-row-height': `${effectiveRowHeight}px`,
                '--ogx-header-height': `${headerHeight}px`
            } as unknown as React.CSSProperties}
            aria-busy={effectiveLoading}
        >
            {toolbarProps && (
                <GridToolbarHostContext.Provider value={columnsPanel.toolbarHost}>
                    <StableToolbar {...toolbarProps} />
                </GridToolbarHostContext.Provider>
            )}

            {/* Used by the column menu's Manage columns when no GridToolbar can show the panel */}
            <GridStandaloneColumnPanel<R>
                isOpen={columnsPanel.standalonePanelOpen}
                containerRef={containerRef}
                panelRef={columnsPanel.standalonePanelRef}
                effectiveColumns={effectiveColumns}
                columnVisibilityModel={columnVisibilityModel}
                effectiveColumnOrder={effectiveColumnOrder}
                columnOrder={isPivotActive ? undefined : columnOrder}
                disableColumnReorder={disableColumnReorder}
                onClose={columnsPanel.closeStandalonePanel}
                onColumnVisibilityChange={handleColumnVisibilityModelChange}
                onColumnOrderChange={onColumnOrderChange}
                setInternalColumnOrder={setInternalColumnOrder}
                columnGroupingModel={columnGroupingModel}
            />


            {listView && listViewColumn && (
                <GridListView<R>
                    ariaLabel={ariaLabel}
                    allRenderableRows={allRenderableRows}
                    filteredRows={filteredRows}
                    pinnedTopRowCount={pinnedTopRows.length}
                    pinnedBottomRowCount={pinnedBottomRows.length}
                    unpinnedRowCount={sortedUnpinnedRows.length}
                    pagination={pagination}
                    effectivePaginationModel={effectivePaginationModel}
                    currentPage={rowPipeline.currentPage}
                    pageSizeOptions={pageSizeOptions}
                    selectedRowIds={selectedRowIds}
                    listViewColumn={listViewColumn}
                    columnsByField={columnLookup.byField}
                    rowMetaMap={rowMetaMap}
                    noRowsLabel={effectiveNoRowsLabel}
                    rowHeight={effectiveRowHeight}
                    checkboxSelection={checkboxSelection}
                    paginationMode={paginationMode}
                    serverRowCount={paginationRowCount}
                    paginationSlot={slots?.pagination}
                    paginationSlotProps={slotProps?.pagination}
                    localeText={localeText ? {
                        paginationRowsPerPage: localeText.paginationRowsPerPage,
                        paginationOf: localeText.paginationOf,
                        paginationPage: localeText.paginationPage,
                    } : undefined}
                    onRowClick={handleRowClick}
                    onRowDoubleClick={onRowDoubleClick}
                    onSelectionChange={handleSelectionChange}
                    onPaginationModelChange={handlePaginationModelChange}
                    onRowsScrollEnd={onRowsScrollEnd}
                    getRowId={getRowIdOf}
                />
            )}

            {/* ══════════════════════════════════════════════════════════════
                STANDARD GRID VIEWPORT (hidden when listView=true)
            ══════════════════════════════════════════════════════════════ */}
            {!listView && (
                <div
                    ref={(el) => {
                        viewportRef.current = el;
                        gridRef.current = el;
                    }}
                    className="ogx__viewport"
                    onScroll={handleScroll}
                    role="grid"
                    aria-label={ariaLabel || 'Data grid'}
                    aria-rowcount={filteredRows.length + 1 + getColumnGroupDepth(columnGroupingModel)}
                    aria-colcount={
                        columns.length +
                        (checkboxSelection ? 1 : 0) +
                        (hasDetailPanel ? 1 : 0) +
                        (rowReordering ? 1 : 0)
                    }
                    aria-busy={effectiveLoading}
                    tabIndex={0}
                    onKeyDownCapture={() => { setKeyboardMode(true); }}
                    onMouseDownCapture={() => { setKeyboardMode(false); }}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                >
                    <div
                        ref={contentRef}
                        className="ogx__content"
                        style={{
                            width: virtualization.totalWidth
                        }}
                        role="presentation"
                    >
                        { }
                        <Header
                            columns={renderColumns}
                            allColumns={renderedDataColumns}
                            columnGroupingModel={columnGroupingModel}
                            checkboxSelection={checkboxSelection}
                            allSelected={allSelected}
                            someSelected={someSelected}
                            onSelectAll={rowSelection.selectAll}
                            sortModel={sortModel}
                            onSort={handleSort}
                            onSortAdd={handleSortAdd}
                            multiSort={multiSort}

                            onColumnResize={handleColumnResize}
                            columnWidths={columnWidths}
                            pinnedColumns={effectivePinnedColumns}

                            focusedCell={focusedCell}
                            onHeaderClick={(field) => {
                                setFocusedCell({ id: 'HEADER', field });
                                setKeyboardMode(false);
                                gridRef.current?.focus({ preventScroll: true });
                            }}
                            onDragStart={headerReorderHandlers.onDragStart}
                            onDragOver={headerReorderHandlers.onDragOver}
                            onDragEnd={headerReorderHandlers.onDragEnd}
                            onDrop={headerReorderHandlers.onDrop}
                            draggedColumn={headerReorderHandlers.draggedColumn}
                            dragOverColumn={headerReorderHandlers.dragOverColumn}
                            rowReordering={rowReordering}
                            hasDetailPanel={hasDetailPanel}
                            pinCheckboxColumn={pinCheckboxColumn}
                            pinExpandColumn={pinExpandColumn}
                            aggregationModel={aggregationModel}
                            onHideColumn={(field) => {
                                handleColumnVisibilityModelChange({
                                    ...columnVisibilityModel,
                                    [field]: false,
                                });
                            }}
                            onManageColumns={columnsPanel.openColumnsPanel}
                            onPinColumn={(field, side) => {
                                const left = [...(pinnedColumns?.left ?? [])];
                                const right = [...(pinnedColumns?.right ?? [])];

                                const cleanLeft = left.filter(f => f !== field);
                                const cleanRight = right.filter(f => f !== field);
                                if (side === 'left') {
                                    handlePinnedColumnsChange({ left: [...cleanLeft, field], right: cleanRight });
                                } else if (side === 'right') {
                                    handlePinnedColumnsChange({ left: cleanLeft, right: [...cleanRight, field] });
                                } else {
                                    handlePinnedColumnsChange({ left: cleanLeft, right: cleanRight });
                                }
                            }}
                        />

                        {/* Empty State Overlay (Standard View) — showing after header */}
                        {!effectiveLoading && !state.dataSource.error && filteredRows.length === 0 && (
                            <GridEmptyState
                                noRowsLabel={effectiveNoRowsLabel}
                                width={virtualization.totalWidth}
                                overlay={NoRowsOverlaySlot ? <NoRowsOverlaySlot {...slotProps?.noRowsOverlay} /> : undefined}
                            />
                        )}

                        <GridPinnedRows<R>
                            rows={pinnedTopRows}
                            position="top"
                            columns={renderColumns}
                            selectedRowIds={selectedRowIds}
                            checkboxSelection={checkboxSelection}
                            onRowClick={handleRowClick}
                            onRowDoubleClick={onRowDoubleClick}
                            onCellClick={handleCellClick}
                            onSelectionChange={handleSelectionChange}
                            columnWidths={columnWidths}
                            pinnedColumns={effectivePinnedColumns}
                            pinnedRows={pinnedRows}
                            hasDetailPanel={hasDetailPanel}
                            expandedRowIds={expandedRowIds}
                            getDetailPanelContent={getDetailPanelContent}
                            getDetailPanelHeight={getDetailPanelHeight}
                            onDetailPanelToggle={handleDetailPanelToggle}
                            pinCheckboxColumn={pinCheckboxColumn}
                            pinExpandColumn={pinExpandColumn}
                            focusedCell={focusedCell}
                            colspanMap={spanning.colspanMap}
                            rowSpanningCaches={spanning.rowSpanningCaches}
                            rowHeight={effectiveRowHeight}
                            rowMetaMap={rowMetaMap}
                            getRowId={getRowIdOf}
                        />

                        <GridVirtualRows<R>
                            virtualContainerHeight={virtualization.totalHeight - virtualization.pinnedTopHeight - virtualization.pinnedBottomHeight}
                            offsetTop={spanRowWindow.offsetTop}
                            effectiveLoading={effectiveLoading}
                            visibleRows={visibleRows}
                            baseColumns={columns as unknown as GridColDef<R>[]}
                            virtualColumns={renderColumns}
                            viewportWidth={state.dimensions.viewportWidth}
                            checkboxSelection={checkboxSelection}
                            hasDetailPanel={hasDetailPanel}
                            rowReordering={rowReordering}
                            rowHeight={effectiveRowHeight}
                            pinnedRows={pinnedRows}
                            selectedRowIds={selectedRowIds}
                            onRowClick={handleRowClick}
                            onRowDoubleClick={onRowDoubleClick}
                            onCellClick={handleCellClick}
                            onSelectionChange={handleSelectionChange}
                            columnWidths={columnWidths}
                            pinnedColumns={effectivePinnedColumns}
                            expandedRowIds={expandedRowIds}
                            getDetailPanelContent={getDetailPanelContent}
                            getDetailPanelHeight={getDetailPanelHeight}
                            onDetailPanelToggle={handleDetailPanelToggle}
                            pinCheckboxColumn={pinCheckboxColumn}
                            pinExpandColumn={pinExpandColumn}
                            rowReorderHandlers={rowReorderHandlers}
                            editingHandlers={editingHandlers}
                            isCellEditable={isCellEditable}
                            focusedCell={focusedCell}
                            colspanMap={spanning.colspanMap}
                            rowSpanningCaches={spanning.rowSpanningCaches}
                            paginationMode={paginationMode}
                            dataSourceLoading={state.dataSource.loading}
                            sortedUnpinnedRowCount={sortedUnpinnedRows.length}
                            infiniteScrollSkeletonCount={Math.min(effectivePaginationModel.pageSize, 20)}
                            unpinnedRowsLength={layout.unpinnedRowsLength}
                            rowMetaMap={rowMetaMap}
                            loadingOverlay={LoadingOverlaySlot ? <LoadingOverlaySlot {...slotProps?.loadingOverlay} /> : undefined}
                        />

                        <GridPinnedRows<R>
                            rows={pinnedBottomRows}
                            position="bottom"
                            columns={renderColumns}
                            selectedRowIds={selectedRowIds}
                            checkboxSelection={checkboxSelection}
                            onRowClick={handleRowClick}
                            onRowDoubleClick={onRowDoubleClick}
                            onCellClick={handleCellClick}
                            onSelectionChange={handleSelectionChange}
                            columnWidths={columnWidths}
                            pinnedColumns={effectivePinnedColumns}
                            pinnedRows={pinnedRows}
                            hasDetailPanel={hasDetailPanel}
                            expandedRowIds={expandedRowIds}
                            getDetailPanelContent={getDetailPanelContent}
                            getDetailPanelHeight={getDetailPanelHeight}
                            onDetailPanelToggle={handleDetailPanelToggle}
                            pinCheckboxColumn={pinCheckboxColumn}
                            pinExpandColumn={pinExpandColumn}
                            focusedCell={focusedCell}
                            colspanMap={spanning.colspanMap}
                            rowSpanningCaches={spanning.rowSpanningCaches}
                            rowHeight={effectiveRowHeight}
                            rowMetaMap={rowMetaMap}
                            getRowId={getRowIdOf}
                        />

                        {/* Aggregation Footer Row — laid out from the same virtual columns as the rows, so
                             hidden, pinned and scrolled columns line up. Off in pivot mode (hasAggregation). */}
                        {hasAggregation && (
                            <GridAggregationFooter
                                columns={virtualization.virtualColumns as unknown as GridColDef[]}
                                aggregationModel={aggregationModel}
                                aggregationResult={aggregationResult}
                                columnWidths={columnWidths}
                                rowHeight={effectiveRowHeight}
                                checkboxSelection={checkboxSelection}
                                hasDetailPanel={hasDetailPanel}
                                rowReordering={rowReordering}
                                pinCheckboxColumn={pinCheckboxColumn}
                                pinExpandColumn={pinExpandColumn}
                                pinnedColumns={effectivePinnedColumns}
                                loading={isAggregationLoading}
                            />
                        )}

                    </div>
                </div>
            )}

            {!listView && FooterSlot && (
                <FooterSlot
                    apiRef={gridData.apiRef}
                    aggregationModel={aggregationModel}
                    aggregationResult={hasAggregation ? aggregationResult : null}
                    rowCount={paginationMode === 'server' ? paginationRowCount : dataRows.length}
                    pagination={pagination}
                    paginationModel={effectivePaginationModel}
                    pageSizeOptions={pageSizeOptions}
                    onPaginationModelChange={handlePaginationModelChange}
                    {...slotProps?.footer}
                />
            )}

            {!listView && !FooterSlot && pagination && (() => {
                const PaginationComponent = slots?.pagination || Pagination;
                return (
                    <PaginationComponent
                        page={rowPipeline.currentPage}
                        pageSize={effectivePaginationModel.pageSize}
                        rowCount={paginationRowCount}
                        pageSizeOptions={pageSizeOptions}
                        onPageChange={(newPage: number) => handlePaginationModelChange({ ...effectivePaginationModel, page: newPage })}
                        onPageSizeChange={(newPageSize: number) => handlePaginationModelChange({ ...effectivePaginationModel, pageSize: newPageSize, page: 0 })}
                        localeText={localeText ? {
                            paginationRowsPerPage: localeText.paginationRowsPerPage,
                            paginationOf: localeText.paginationOf,
                            paginationPage: localeText.paginationPage,
                        } : undefined}
                        {...slotProps?.pagination}
                    />
                );
            })()}

            {/* Accessibility Live Region */}
            <div className="ogx-aria-live-status" role="status" aria-live="polite">
                {effectiveLoading ? 'Loading data...' : ''}
                {state.dataSource.error ? `Error: ${state.dataSource.error instanceof Error ? state.dataSource.error.message : 'Unknown error'}` : ''}
                {!loading && !state.dataSource.error && (
                    filteredRows.length === 0
                        ? effectiveNoRowsLabel
                        : (filterModel && ((filterModel.quickFilterValues?.length || 0) > 0 || (filterModel.items?.length || 0) > 0))
                            ? `${dataRows.length} ${dataRows.length === 1 ? 'row' : 'rows'} found`
                            : ''
                )}
            </div>

            <GridErrorOverlay error={state.dataSource.error} />
        </div>
    );
}
