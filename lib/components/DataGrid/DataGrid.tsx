import React, { useRef, useMemo } from 'react';
import { useLayout } from '../../hooks/core/useLayout';
import { useGridKeyboardNavigation } from '../../hooks/core/useGridKeyboardNavigation';
import { useGridControlledState } from '../../hooks/core/useGridControlledState';
import { useGridThemeDimensions } from '../../hooks/core/useGridThemeDimensions';
import { useGridRowPipeline } from '../../hooks/core/useGridRowPipeline';
import { useGridVirtualization } from '../../hooks/core/useGridVirtualization';
import { useGridColumns } from '../../hooks/core/useGridColumns';
import { useGridVisibleRows } from '../../hooks/core/useGridVisibleRows';
import { useGridViewport } from '../../hooks/core/useGridViewport';
import { useGridDetailPanel } from '../../hooks/core/useGridDetailPanel';
import { useGridStateSnapshot } from '../../hooks/core/useGridStateSnapshot';
import { useGridDevWarnings, useGridStylesheetWarning } from '../../hooks/core/useGridDevWarnings';
import { useGridRowInteractions } from '../../hooks/core/useGridRowInteractions';
import { useGridLiveRowSelection } from '../../hooks/core/useGridLiveRowSelection';
import { useGridApiMethods } from '../../hooks/core/useGridApiMethods';
import { useGridColumnLookup } from '../../hooks/core/useGridColumnLookup';
import { useGridPageCorrection } from '../../hooks/core/useGridPageCorrection';
import { useGridColumnsPanel } from '../../hooks/core/useGridColumnsPanel';
import { GridToolbarHostContext } from '../../hooks/core/gridToolbarHostContext';
import { GridToolbarSlot } from './GridToolbarSlot';
import { GridAggregationFooter } from './GridAggregationFooter';
import { GridEmptyState } from './GridEmptyState';
import { GridErrorOverlay } from './GridErrorOverlay';
import { Header } from '../Header/Header';
import { useDataGrid } from '../../hooks/core/useDataGrid';
import { useRowReorder } from '../../hooks/useRowReorder';
import { useGridHierarchy } from '../../hooks/core/useGridHierarchy';
import { useGridEditing } from '../../hooks/features/useGridEditing';
import { useGridSpanning } from '../../hooks/features/useGridSpanning';
import { useGridSpanRowWindow, useGridSpanColumnWindow } from '../../hooks/features/useGridSpanRenderWindow';
import { useColumnGroupReorderGuard } from '../../hooks/features/useColumnGroupReorderGuard';
import { useGridDataSource } from '../../hooks/features/useGridDataSource';
import { useServerTreeChildren } from '../../hooks/features/useServerTreeChildren';
import { useAggregation, useServerAggregationResults } from '../../hooks/features/useAggregation';
import { useGridPivot } from '../../hooks/features/useGridPivot';
import { isServerDrivenDataSource } from '../../utils/dataSource';
import { GridListView } from './GridListView';
import { GridLoadingOverlay } from './GridLoadingOverlay';
import { GridPinnedRows } from './GridPinnedRows';
import { GridVirtualRows } from './GridVirtualRows';
import { GridStandaloneColumnPanel } from './GridStandaloneColumnPanel';
import { resolveGridModes, EMPTY_ROW_GROUPING_MODEL } from '../../utils/gridModes';
import { useGridGroupingColumn } from '../../hooks/core/useGridGroupingColumn';
import { useGridRowIdOf, getDefaultRowId } from '../../hooks/core/useGridRowIdOf';
import { useGridApiRefBinding } from '../../hooks/core/useGridApiRefBinding';
import { collectAllFilteredRows } from '../../utils/gridApiRows';
import { useGridAggregationApi } from '../../hooks/core/useGridAggregationApi';
import { useGridClipboardApi } from '../../hooks/core/useGridClipboardApi';
import { useGridScrollToIndexesApi } from '../../hooks/core/useGridScrollToIndexesApi';
import { useGridSortHandlers, useGridColumnMenuHandlers } from '../../hooks/core/useGridHeaderHandlers';
import { useGridKeyboardMode, useGridPointerFocusHandlers } from '../../hooks/core/useGridFocusHandlers';
import { getPaginationRowCount, pickPaginationLocaleText } from '../../utils/pagination';
import { GridPaginationArea } from './GridPaginationArea';
import { GridLiveRegion } from './GridLiveRegion';
import { useGridAriaRows } from '../../hooks/core/useGridAriaRows';
import { useGridToolbarProps } from '../../hooks/core/useGridToolbarProps';
import type { DataGridProps, DataGridUntypedColumnsProps, GridValidRowModel, GridRowModel, GridRowId, GridColDef } from '../../types';

/**
 * The grid. `R` is your row type: any object type (an interface works), inferred from `rows`. `columns`
 * can be typed for it (`GridColDef<R>[]`, so callbacks see `params.row` as `R`) or untyped (`GridColDef[]`).
 */
export function DataGrid<R extends GridValidRowModel = GridRowModel>(props: DataGridProps<R>): React.JSX.Element;
export function DataGrid<R extends GridValidRowModel = GridRowModel>(props: DataGridUntypedColumnsProps<R>): React.JSX.Element;
// Internally every row is read as a GridRowModel (a record keyed by field): the overloads above are the
// public signatures, and a consumer's row objects are passed through untouched.
export function DataGrid<R extends GridRowModel = GridRowModel>(props: DataGridProps<R>): React.JSX.Element {
    const {
        rows,
        columns,
        getRowId,
        rowHeight: rowHeightProp,
        headerHeight: headerHeightProp,
        autoHeight = false,
        density,
        checkboxSelection = false,
        disableRowSelectionOnClick = false,
        disableMultipleRowSelection = false,
        disableClipboardCopy = false,
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
        onColumnOrderModelChange,
        height,
        rowReordering: rowReorderingProp = false,
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
        listView: listViewRequested = false,
        listViewColumn,
        columnGroupingModel,
        noRowsLabel = 'No Data',
        localeText,
        apiRef: propApiRef,
        overscanRowCount = 3,
    } = props;

    const effectiveNoRowsLabel = localeText?.noRowsLabel ?? noRowsLabel;
    const rowGroupingModel = propRowGroupingModel || EMPTY_ROW_GROUPING_MODEL;

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
        selectedRowIds: selectionModelRowIds,
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
    const {
        rowReordering, hierarchyRowGroupingModel, isTreeDataRequested, isTreeData,
        isRowGrouping, isHierarchyEnabled, hasGroupingColumn, pagination, listView,
    } = resolveGridModes({
        rowGroupingModel,
        treeData,
        hasTreeDataPath: Boolean(getTreeDataPath),
        isPivotActive,
        rowReordering: rowReorderingProp,
        hasGroupingColDef: Boolean(groupingColDef),
        pagination: propPagination,
        paginationMode,
        listView: listViewRequested,
        hasListViewColumn: Boolean(listViewColumn),
    });

    // Props, then the enclosing DataGridThemeProvider's heights, then the defaults (52 / 56).
    const { rowHeight: effectiveRowHeight, headerHeight } = useGridThemeDimensions({
        rowHeight: rowHeightProp, headerHeight: headerHeightProp, density: effectiveDensity,
    });

    const activeRows = pivot.rows as unknown as R[];
    const baseColumns = pivot.columns as unknown as GridColDef<R>[];

    const { activeColumns, effectivePinnedColumns } = useGridGroupingColumn<R>({
        baseColumns, pinnedColumns, hasGroupingColumn, groupingColDef, isTreeData, getTreeDataPath,
    });

    const columnLookup = useGridColumnLookup(activeColumns, columnVisibilityModel);

    // getRows-provided totals, dropped as soon as the aggregation model they were computed for changes.
    const [serverAggregationResults, setServerAggregationResults] = useServerAggregationResults(aggregationModel);

    const containerRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);

    // Rows are stored and handed to consumers untouched: getRowId only decides the internal
    // key. Pivot rows are the grid's own and carry their own ids, so a getRowId written for
    // the source rows does not apply to them.
    const effectiveGetRowId = (!isPivotActive && getRowId) || getDefaultRowId;

    const setKeyboardMode = useGridKeyboardMode(containerRef);

    const gridData = useDataGrid({
        rows: activeRows,
        getRowId: effectiveGetRowId,
        columns: activeColumns,
        rowHeight: effectiveRowHeight,
        headerHeight,
        columnVisibilityModel,
        initialState: props.initialState,
        syncRows: !dataSource,
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

    const { getRowIdOf, getRowIdOfInEvents } = useGridRowIdOf(state.rows.idByRow);
    useGridApiRefBinding(propApiRef, apiRef);

    const isInternalLoading = state.dataSource.loading;
    const effectiveLoading = loading || isInternalLoading;

    const effectiveRows = useMemo(() => {
        return state.rows.allRows.map(id => state.rows.idRowsLookup.get(id)!) as R[];
    }, [state.rows]);

    const { treeDataHandlers, rowGroupingHandlers, activeHierarchyHandlers, rowMetaMap } = useGridHierarchy<R>({
        rows: effectiveRows,
        getRowId: getRowIdOf,
        getTreeDataPath,
        isTreeDataRequested,
        isTreeData,
        columns: activeColumns,
        rowGroupingModel: hierarchyRowGroupingModel,
        isRowGrouping,
        aggregationModel,
        defaultGroupingExpansionDepth,
        filterModel,
        sortModel,
        getAggregationPosition,
        columnLookup,
        filterMode,
        sortingMode,
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

    // The selection without ids of removed rows. Only client-owned rows are pruned: a server page
    // or a pivot of the rows does not hold every row a selection may name.
    const selectedRowIds = useGridLiveRowSelection({
        selectedRowIds: selectionModelRowIds,
        rowsLookup: state.rows.idRowsLookup,
        rowMetaMap,
        enabled: !dataSource && !isPivotActive && paginationMode === 'client' && filterMode === 'client',
        onSelectionModelChange: handleRowSelectionModelChange,
    });

    const dataSourceHandlers = useGridDataSource({
        dataSource,
        sortModel,
        filterModel,
        paginationModel: effectivePaginationModel,
        paginationMode,
        sortingMode,
        filterMode,
        aggregationModel,
        getRowId: effectiveGetRowId as unknown as (row: GridRowModel) => GridRowId,
        setRows,
        setRowCount,
        setDataSourceLoading,
        setDataSourceError,
        onAggregationResults: setServerAggregationResults,
        onPaginationModelChange: handlePaginationModelChange,
    });

    useServerTreeChildren({
        enabled: isTreeData && Boolean(dataSource),
        treeNodes: treeDataHandlers.treeNodes,
        isGroupExpanded: treeDataHandlers.isGroupExpanded,
        getNodePath: treeDataHandlers.getNodePath,
        toggleExpansion: treeDataHandlers.toggleExpansion,
        fetchChildren: dataSourceHandlers.fetchChildren,
    });

    // ── Detail panel (hoisted — hasDetailPanel feeds into useGridColumns) ──────
    const {
        hasDetailPanel, expandedRowIds, handleDetailPanelToggle, detailPanelHeights, reportDetailPanelHeight,
    } = useGridDetailPanel({
        hasDetailPanel: Boolean(getDetailPanelContent),
        controlledExpandedRowIds,
        onDetailPanelExpandedRowIdsChange,
        rowMetaMap,
    });

    // ── Column management ─────────────────────────────────────────────────────
    const {
        effectiveColumns,
        hierarchyField,
        orderedColumns,
        visibleOrderedColumns,
        navigationColumns,
        columnIndexMap,
        columnWidths,
        effectiveColumnOrder,
        columnReorderHandlers,
        moveColumn,
        resetColumnOrder,
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
        onColumnOrderModelChange,
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
        activeHierarchyHandlers: activeHierarchyHandlers as { getVisibleRows: (options?: { labelField?: string; expandAll?: boolean }) => GridRowModel[] | null } | null,
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
        hierarchyField,
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

    const paginationRowCount = getPaginationRowCount({
        paginationMode,
        hasDataSource: Boolean(dataSource),
        dataSourceRowCount: state.pagination.rowCount,
        rowCountProp: propRowCount,
        clientRowCount: sortedUnpinnedRows.length,
    });

    const { rowSelection, handleRowClick, handleSelectionChange } = useGridRowInteractions<R>({
        dataRows,
        getRowId: getRowIdOf,
        isPivotActive,
        selectedRowIds,
        onSelectionModelChange: handleRowSelectionModelChange,
        disableMultipleRowSelection,
        disableRowSelectionOnClick,
        isHierarchyEnabled,
        rowMetaMap,
        activeHierarchyHandlers,
        onRowClick,
    });

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
        getPendingRowSelectionModel: controlledState.getPendingRowSelectionModel,
        onRowSelectionModelChange: handleRowSelectionModelChange,
        disableMultipleRowSelection,
        getVisibleRows: () => [...pinnedTopRows, ...(pagination ? paginatedUnpinnedRows : sortedUnpinnedRows), ...pinnedBottomRows],
        getAllFilteredRows: () => collectAllFilteredRows<GridRowModel>({
            hierarchyHandlers: activeHierarchyHandlers,
            pinnedTopRows,
            sortedUnpinnedRows,
            pinnedBottomRows,
            rowMetaMap,
            getRowId: getRowIdOf,
        }),
        visibleColumns: visibleOrderedColumns as unknown as GridColDef[],
    });

    // Indices address the consumer's own rows, whatever the sort, filter, page or pinning.
    const rowReorderHandlers = useRowReorder({
        rows: effectiveRows,
        getRowId: getRowIdOf,
        onRowOrderChange,
        rowReordering
    });

    const { aggregationResult, isLoading: isAggregationLoading } = useAggregation({
        rows: dataRows,
        columns: activeColumns as unknown as GridColDef[],
        aggregationModel,
        // When the server drives the rows (paginates, sorts or filters them), the grid only holds
        // the rows it returned, so client totals would be partial.
        isServerSide: isServerDrivenDataSource({ dataSource, paginationMode, sortingMode, filterMode }),
        dataSource,
        filterModel,
        sortModel,
        serverAggregationResults,
    });

    // In pivot mode the pivot's own Grand Total row is the aggregate; aggregationModel keys name source
    // fields that the pivot rows do not have.
    const hasAggregation = Object.keys(aggregationModel).length > 0 && !isPivotActive;

    useGridAggregationApi<R>({
        apiRef,
        hasAggregation,
        aggregationResult,
        aggregationModel,
        isRowGrouping,
        rowGroupingHandlers,
        rowMetaMap,
        columns: activeColumns,
        getRowId: getRowIdOf,
    });

    const layout = useLayout({
        rowHeight: effectiveRowHeight,
        pagination,
        paginatedUnpinnedRows,
        sortedUnpinnedRows,
        expandedRowIds,
        getDetailPanelHeight,
        detailPanelHeights,
        pinnedTopRowsLength: pinnedTopRows.length,
        pinnedBottomRowsLength: pinnedBottomRows.length,
        pinnedTopRows,
        pinnedBottomRows,
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

    useGridClipboardApi({
        apiRef,
        columns: renderedDataColumns as unknown as GridColDef[],
        getRowId: getRowIdOf,
        containerRef,
        disableKeyboardShortcut: disableClipboardCopy,
    });
    useGridScrollToIndexesApi<R>({ apiRef, viewportRef, layout, rowHeight: effectiveRowHeight });

    const { scrollTop, scrollLeft, overscanRows, handleScroll, setViewportElement } = useGridViewport({
        onRowsScrollEnd, overscanRowCount, rowCount: layout.unpinnedRowsLength, autoHeight, setDimensions, viewportRef,
    });

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


    const { handleSort, handleSortAdd } = useGridSortHandlers({
        sortModel, isSortControlled, setInternalSortModel, onSortModelChange,
    });

    const rowSelectionEnabled = checkboxSelection || !disableRowSelectionOnClick;
    const {
        focusedCell,
        setFocusedCell,
        viewportTabIndex,
        ensureGridFocus,
        handleFocus,
        handleBlur,
        handleKeyDown,
        handleMouseDownCapture,
    } = useGridKeyboardNavigation({
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
        handleSortAdd,
        multiSort,
        isCellEditable,
        pagination,
        pageSize: effectivePaginationModel.pageSize,
        virtualization,
        viewportRef,
        pinnedTopRowCount: pinnedTopRows.length,
        getRowId: getRowIdOf,
        rowMetaMap,
        getSpanOrigin: spanning.getSpanOrigin,
        onRowActivate: handleRowClick,
        toggleRowExpansion: activeHierarchyHandlers?.toggleExpansion,
        handleSelectAll: rowSelection.selectAll,
        rowSelectionEnabled,
        multipleRowSelectionEnabled: !disableMultipleRowSelection,
        pinCheckboxColumn,
        pinExpandColumn,
        rowHeight: effectiveRowHeight,
    });

    const { handleCellClick, handleHeaderClick } = useGridPointerFocusHandlers<R>({
        ensureGridFocus, setKeyboardMode, setFocusedCell, getRowId: getRowIdOf, onCellClick,
    });
    const { handleHideColumn, handlePinColumn } = useGridColumnMenuHandlers({
        columnVisibilityModel,
        onColumnVisibilityModelChange: handleColumnVisibilityModelChange,
        pinnedColumns,
        onPinnedColumnsChange: handlePinnedColumnsChange,
    });

    const ariaRows = useGridAriaRows({
        columnGroupingModel,
        pinnedTopCount: pinnedTopRows.length,
        pinnedBottomCount: pinnedBottomRows.length,
        pagination,
        paginationMode,
        paginationModel: effectivePaginationModel,
        paginationRowCount,
        paginatedUnpinnedRowCount: paginatedUnpinnedRows.length,
        sortedUnpinnedRowCount: sortedUnpinnedRows.length,
    });

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
        pinnedRowsIgnored: isHierarchyEnabled && Boolean(pinnedRows?.top?.length || pinnedRows?.bottom?.length),
        scrollHeight: virtualization.totalHeight,
        listViewWithoutColumn: listViewRequested && !listViewColumn,
    });

    const { allSelected, someSelected } = rowSelection;

    // Header drag-reorder keeps a column inside its column group (and ungrouped columns outside groups).
    const headerReorderHandlers = useColumnGroupReorderGuard(columnGroupingModel, columnReorderHandlers);

    const hasRowSpanning = React.useMemo(() => effectiveColumns.some(c => !!c.rowSpan), [effectiveColumns]);
    const columnsPanel = useGridColumnsPanel();
    useGridStylesheetWarning(containerRef);

    const NoRowsOverlaySlot = slots?.noRowsOverlay;
    const LoadingOverlaySlot = slots?.loadingOverlay;
    const loadingOverlay = LoadingOverlaySlot ? <LoadingOverlaySlot {...slotProps?.loadingOverlay} /> : undefined;
    const noRowsOverlay = NoRowsOverlaySlot ? <NoRowsOverlaySlot {...slotProps?.noRowsOverlay} /> : undefined;
    const FooterSlot = slots?.footer;
    // Loading with rows on screen: the rows stay and an indicator runs over them. With no rows the
    // body shows skeletons or the loading overlay instead, and infinite scroll appends skeleton rows.
    const showLoadingOverRows = effectiveLoading && allRenderableRows.length > 0 && paginationMode !== 'infinite';
    const ToolbarSlot = slots?.toolbar;

    const toolbarProps = useGridToolbarProps<R>({
        toolbar: slots?.toolbar,
        toolbarSlotProps: slotProps?.toolbar,
        apiRef,
        orderedColumns,
        baseColumns: columns,
        aggregationModel,
        onAggregationModelChange: handleAggregationModelChange,
        pivotMode,
        pivotModelProp: propPivotModel,
        onPivotModelChangeProp: onPivotModelChange,
        pivotModel: currentPivotModel,
        onPivotModelChange: handlePivotModelChange,
        filterModel,
        onFilterModelChange: handleFilterModelChange,
        columnVisibilityModel,
        onColumnVisibilityModelChange: handleColumnVisibilityModelChange,
        disableColumnReorder,
        columnGroupingModel,
        moveColumn,
        resetColumnOrder,
        forceColumnsOpen: columnsPanel.toolbarPanelRequested,
        onColumnsPanelClose: columnsPanel.closeToolbarPanel,
    });

    // Props the row renderers (top-pinned, centre and bottom-pinned rows) all take.
    const rowRenderProps = {
        rowReordering,
        columnIndexMap,
        editingHandlers,
        isCellEditable,
        selectedRowIds,
        checkboxSelection,
        onRowClick: handleRowClick,
        onRowDoubleClick,
        onCellClick: handleCellClick,
        onSelectionChange: handleSelectionChange,
        columnWidths,
        pinnedColumns: effectivePinnedColumns,
        hasDetailPanel,
        expandedRowIds,
        getDetailPanelContent,
        getDetailPanelHeight,
        onDetailPanelToggle: handleDetailPanelToggle,
        onDetailPanelHeightChange: reportDetailPanelHeight,
        pinCheckboxColumn,
        pinExpandColumn,
        focusedCell,
        colspanMap: spanning.colspanMap,
        rowSpanningCaches: spanning.rowSpanningCaches,
        rowHeight: effectiveRowHeight,
        rowMetaMap,
    };

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
            {ToolbarSlot && toolbarProps && (
                <GridToolbarHostContext.Provider value={columnsPanel.toolbarHost}>
                    <GridToolbarSlot component={ToolbarSlot} toolbarProps={toolbarProps} />
                </GridToolbarHostContext.Provider>
            )}

            {/* Used by the column menu's Manage columns when no GridToolbar can show the panel */}
            <GridStandaloneColumnPanel<R>
                isOpen={columnsPanel.standalonePanelOpen}
                containerRef={containerRef}
                panelRef={columnsPanel.standalonePanelRef}
                columns={orderedColumns}
                columnVisibilityModel={columnVisibilityModel}
                disableColumnReorder={disableColumnReorder}
                onClose={columnsPanel.closeStandalonePanel}
                onColumnVisibilityChange={handleColumnVisibilityModelChange}
                onColumnMove={moveColumn}
                onColumnOrderReset={resetColumnOrder}
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
                    localeText={pickPaginationLocaleText(localeText)}
                    onRowClick={handleRowClick}
                    onRowDoubleClick={onRowDoubleClick}
                    onSelectionChange={handleSelectionChange}
                    onPaginationModelChange={handlePaginationModelChange}
                    onRowsScrollEnd={onRowsScrollEnd}
                    getRowId={getRowIdOf}
                    multiselectable={rowSelectionEnabled && !disableMultipleRowSelection}
                    selectable={rowSelectionEnabled}
                    onToggleExpansion={activeHierarchyHandlers?.toggleExpansion}
                    loading={effectiveLoading}
                    loadingOverlay={loadingOverlay}
                    noRowsOverlay={noRowsOverlay}
                    showPaginationControls={!FooterSlot}
                />
            )}

            {/* ══════════════════════════════════════════════════════════════
                STANDARD GRID VIEWPORT (hidden when listView=true)
            ══════════════════════════════════════════════════════════════ */}
            {!listView && (
                <div
                    ref={setViewportElement}
                    className="ogx__viewport"
                    onScroll={handleScroll}
                    role="grid"
                    aria-label={ariaLabel || 'Data grid'}
                    aria-rowcount={ariaRows.rowCount}
                    aria-colcount={navigationColumns.length}
                    aria-multiselectable={rowSelectionEnabled && !disableMultipleRowSelection}
                    aria-busy={effectiveLoading}
                    tabIndex={viewportTabIndex}
                    onKeyDownCapture={() => { setKeyboardMode(true); }}
                    onMouseDownCapture={handleMouseDownCapture}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                >
                    <div
                        className="ogx__content"
                        style={{
                            width: virtualization.totalWidth
                        }}
                        role="presentation"
                    >
                        {/* Header and top-pinned rows stick together, so pinned rows sit below every header row. */}
                        <div className="ogx__sticky-top" role="presentation">
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
                                columnIndexMap={columnIndexMap}
                                onHeaderClick={handleHeaderClick}
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
                                onHideColumn={handleHideColumn}
                                onManageColumns={columnsPanel.openColumnsPanel}
                                onPinColumn={handlePinColumn}
                            />

                            <GridPinnedRows<R>
                                {...rowRenderProps}
                                rows={pinnedTopRows}
                                position="top"
                                ariaRowIndexBase={ariaRows.topBase}
                                columns={renderColumns}
                                pinnedRows={pinnedRows}
                                getRowId={getRowIdOf}
                            />
                        </div>

                        {/* Empty State Overlay (Standard View) — showing after header */}
                        {!effectiveLoading && !state.dataSource.error && filteredRows.length === 0 && (
                            <GridEmptyState
                                noRowsLabel={effectiveNoRowsLabel}
                                width={virtualization.totalWidth}
                                overlay={noRowsOverlay}
                            />
                        )}

                        <GridVirtualRows<R>
                            {...rowRenderProps}
                            virtualContainerHeight={virtualization.totalHeight - virtualization.pinnedTopHeight - virtualization.pinnedBottomHeight}
                            offsetTop={spanRowWindow.offsetTop}
                            effectiveLoading={effectiveLoading}
                            visibleRows={visibleRows}
                            baseColumns={columns as unknown as GridColDef<R>[]}
                            virtualColumns={renderColumns}
                            viewportWidth={state.dimensions.viewportWidth}
                            rowReorderHandlers={rowReorderHandlers}
                            paginationMode={paginationMode}
                            dataSourceLoading={state.dataSource.loading}
                            sortedUnpinnedRowCount={sortedUnpinnedRows.length}
                            infiniteScrollSkeletonCount={Math.min(effectivePaginationModel.pageSize, 20)}
                            unpinnedRowsLength={layout.unpinnedRowsLength}
                            lastRenderedRowIndex={spanRowWindow.renderContext.lastRowIndex}
                            ariaRowIndexOffset={ariaRows.centerOffset}
                            loadingOverlay={loadingOverlay}
                        />

                        {/* Bottom-pinned rows and the aggregation footer stick together, footer last. */}
                        <div className="ogx__sticky-bottom" role="presentation">
                            <GridPinnedRows<R>
                                {...rowRenderProps}
                                rows={pinnedBottomRows}
                                position="bottom"
                                rowIndexOffset={ariaRows.bottomRowIndexOffset}
                                ariaRowIndexBase={ariaRows.bottomBase}
                                columns={renderColumns}
                                pinnedRows={pinnedRows}
                                getRowId={getRowIdOf}
                            />

                            {/* Aggregation Footer Row — laid out from the same virtual columns as the rows, so
                                 hidden, pinned and scrolled columns line up. Off in pivot mode (hasAggregation). */}
                            {hasAggregation && rowGroupingHandlers.rootAggregationPosition !== null && (
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
                </div>
            )}

            {FooterSlot && (
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

            {!listView && !FooterSlot && pagination && (
                <GridPaginationArea
                    paginationSlot={slots?.pagination}
                    paginationSlotProps={slotProps?.pagination}
                    page={rowPipeline.currentPage}
                    paginationModel={effectivePaginationModel}
                    rowCount={paginationRowCount}
                    pageSizeOptions={pageSizeOptions}
                    onPaginationModelChange={handlePaginationModelChange}
                    localeText={localeText}
                />
            )}

            <GridLiveRegion
                loading={effectiveLoading}
                error={state.dataSource.error}
                noRowsLabel={effectiveNoRowsLabel}
                filteredRowCount={filteredRows.length}
                dataRowCount={dataRows.length}
                filterModel={filterModel}
            />

            {showLoadingOverRows && (
                <GridLoadingOverlay overlay={loadingOverlay} />
            )}

            <GridErrorOverlay error={state.dataSource.error} onRetry={dataSource ? dataSourceHandlers.fetchRows : undefined} />
        </div>
    );
}
