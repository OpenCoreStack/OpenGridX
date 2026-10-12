import React, { useRef, useMemo } from 'react';
import { useLayout } from '../../hooks/core/useLayout';
import { useGridKeyboardNavigation } from '../../hooks/core/useGridKeyboardNavigation';
import { useGridControlledState } from '../../hooks/core/useGridControlledState';
import { useGridThemeDimensions } from '../../hooks/core/useGridThemeDimensions';
import { useGridRowPipeline, type GridRowPipelineResult } from '../../hooks/core/useGridRowPipeline';
import { countReachableRows } from '../../utils/maxElementHeight';
import { useGridColumns } from '../../hooks/core/useGridColumns';
import { useGridDetailPanel } from '../../hooks/core/useGridDetailPanel';
import { useGridStateSnapshot } from '../../hooks/core/useGridStateSnapshot';
import { useGridDevWarnings, useGridStylesheetWarning } from '../../hooks/core/useGridDevWarnings';
import { useGridLiveRowSelection } from '../../hooks/core/useGridLiveRowSelection';
import { useGridSelectionAndStateApi } from '../../hooks/core/useGridSelectionAndStateApi';
import { useGridColumnLookup } from '../../hooks/core/useGridColumnLookup';
import { useGridPageCorrection } from '../../hooks/core/useGridPageCorrection';
import { useGridColumnsPanel } from '../../hooks/core/useGridColumnsPanel';
import { useDataGrid } from '../../hooks/core/useDataGrid';
import { useRowReorder } from '../../hooks/useRowReorder';
import { useGridHierarchy } from '../../hooks/core/useGridHierarchy';
import { useGridRenderWindow } from '../../hooks/core/useGridRenderWindow';
import { useGridRangeEditing } from '../../hooks/core/useGridRangeEditing';
import { useGridScrollViewport } from '../../hooks/core/useGridScrollViewport';
import { useGridViewApis } from '../../hooks/core/useGridViewApis';
import { useGridEditPipeline } from '../../hooks/core/useGridEditPipeline';
import { useGridSpanning } from '../../hooks/features/useGridSpanning';
import { useColumnGroupReorderGuard } from '../../hooks/features/useColumnGroupReorderGuard';
import { useGridDataSource } from '../../hooks/features/useGridDataSource';
import { useServerTreeChildren } from '../../hooks/features/useServerTreeChildren';
import { useAggregation, useServerAggregationResults } from '../../hooks/features/useAggregation';
import { useGridPivot } from '../../hooks/features/useGridPivot';
import { isServerDrivenDataSource } from '../../utils/dataSource';
import { GridRoot, type GridRootProps } from './GridRoot';
import { resolveGridModes } from '../../utils/gridModes';
import { useGridGroupingColumn } from '../../hooks/core/useGridGroupingColumn';
import { useGridRowIdOf, getDefaultRowId } from '../../hooks/core/useGridRowIdOf';
import { useGridApiRefBinding } from '../../hooks/core/useGridApiRefBinding';
import { collectAllFilteredRows } from '../../utils/gridApiRows';
import { NO_AGGREGATION_MODEL } from '../../utils/aggregation';
import { isSyntheticRowId } from '../../utils/syntheticRows';
import { useStableColumns } from '../../hooks/core/useStableColumns';
import { useGridAggregationApi } from '../../hooks/core/useGridAggregationApi';
import { useGridCellSelection } from '../../hooks/core/useGridCellSelection';
import { useGridSortHandlers, useGridColumnMenuHandlers } from '../../hooks/core/useGridHeaderHandlers';
import { useGridKeyboardMode, useGridPointerFocusHandlers } from '../../hooks/core/useGridFocusHandlers';
import { getPaginationRowCount } from '../../utils/pagination';
import { useGridToolbarProps } from '../../hooks/core/useGridToolbarProps';
import { useGridAiAssistant } from '../../hooks/features/useGridAiAssistant';
import { DEFAULT_HEADER_FILTER_HEIGHT } from '../../utils/headerFilters';
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
        rows, columns: columnsProp, getRowId, rowHeight: rowHeightProp, headerHeight: headerHeightProp,
        wrapHeaderText = false, headerFilters = false, headerFilterHeight = DEFAULT_HEADER_FILTER_HEIGHT,
        autoHeight = false, density, height, className = '', style, ariaLabel, loading = false,
        // Selection
        checkboxSelection = false, disableRowSelectionOnClick = false, disableMultipleRowSelection = false,
        disableClipboardCopy = false, cellSelection: cellSelectionProp = false,
        cellSelectionModel: propCellSelectionModel, onCellSelectionModelChange, showCellSelectionStats = false,
        rowSelectionModel: propRowSelectionModel, onRowSelectionModelChange: propOnRowSelectionModelChange,
        onRowClick, onRowDoubleClick, onCellClick,
        // Filter, sort, pagination, pinning
        filterModel: propFilterModel, onFilterModelChange, sortModel: propSortModel, onSortModelChange,
        pagination: propPagination = false, paginationModel, onPaginationModelChange,
        pageSizeOptions = [10, 25, 50, 100],
        pinnedColumns: propPinnedColumns, onPinnedColumnsChange, pinnedRows,
        // Detail panel, column order, row reorder
        getDetailPanelContent, getDetailPanelHeight, detailPanelExpandedRowIds: controlledExpandedRowIds,
        onDetailPanelExpandedRowIdsChange, pinCheckboxColumn = true, pinExpandColumn = true,
        disableColumnReorder = false, columnOrder, onColumnOrderChange, onColumnOrderModelChange,
        rowReordering: rowReorderingProp = false, onRowOrderChange,
        // Tree data, row grouping, aggregation
        treeData = false, getTreeDataPath, defaultGroupingExpansionDepth, groupingColDef,
        rowGroupingModel: propRowGroupingModel, onRowGroupingModelChange,
        aggregationModel: propAggregationModel, onAggregationModelChange, getAggregationPosition,
        // Editing (paste, undo/redo and fill handle props are read by useGridRangeEditing)
        isCellEditable, processRowUpdate, onProcessRowUpdateError,
        // Server data
        dataSource, multiSort = false, sortingMode = 'client', filterMode = 'client', paginationMode = 'client',
        rowCount: propRowCount,
        slots, slotProps,
        pivotMode = false, pivotModel: propPivotModel, onPivotModelChange,
        onRowsScrollEnd, initialState, onStateChange,
        columnVisibilityModel: propColumnVisibilityModel, onColumnVisibilityModelChange,
        listView: listViewRequested = false, listViewColumn, columnGroupingModel,
        noRowsLabel = 'No Data', localeText, apiRef: propApiRef, overscanRowCount = 3,
        aiAssistant, onAiAssistantApply, onAiAssistantError,
    } = props;
    // Equal inline column definitions keep one identity, so the row passes memoised on it do not re-run.
    const columns = useStableColumns(columnsProp);

    const effectiveNoRowsLabel = localeText?.noRowsLabel ?? noRowsLabel;

    const controlledState = useGridControlledState({
        initialState,
        sortModel: propSortModel,
        onSortModelChange,
        filterModel: propFilterModel,
        onFilterModelChange,
        aggregationModel: propAggregationModel,
        onAggregationModelChange,
        rowGroupingModel: propRowGroupingModel,
        onRowGroupingModelChange,
        columnVisibilityModel: propColumnVisibilityModel,
        onColumnVisibilityModelChange,
        pinnedColumns: propPinnedColumns,
        onPinnedColumnsChange,
        pivotModel: propPivotModel,
        onPivotModelChange, paginationModel, onPaginationModelChange, pageSizeOptions,
        rowSelectionModel: propRowSelectionModel,
        onRowSelectionModelChange: propOnRowSelectionModelChange,
        density,
        cellSelectionModel: propCellSelectionModel,
        onCellSelectionModelChange,
    });

    const {
        sortModel, handleSortModelChange, filterModel,
        handleFilterModelChange, aggregationModel, handleAggregationModelChange, columnVisibilityModel,
        handleColumnVisibilityModelChange, pinnedColumns, handlePinnedColumnsChange, currentPivotModel,
        handlePivotModelChange, effectivePaginationModel, handlePaginationModelChange,
        selectedRowIds: selectionModelRowIds,
        handleRowSelectionModelChange,
        density: effectiveDensity,
        rowGroupingModel,
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
    // The header filter row filters the source columns; pivot columns are generated, so it is off then.
    const showHeaderFilters = headerFilters && !isPivotActive;
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
        state, apiRef, setRows, replaceRows, setColumns, setDimensions, setDataSourceLoading, setDataSourceError,
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
        getTreeDataPath, isTreeDataRequested, isTreeData,
        columns: activeColumns,
        rowGroupingModel: hierarchyRowGroupingModel,
        isRowGrouping, aggregationModel, defaultGroupingExpansionDepth, filterModel, sortModel,
        getAggregationPosition, columnLookup, filterMode, sortingMode,
    });

    // Steps 12a–13: the edit commit channel, the batch edit and single-cell editing.
    const { editCommitChannel, batchEdit, editingHandlers } = useGridEditPipeline<R>({
        rowsLookup: state.rows.idRowsLookup as unknown as ReadonlyMap<GridRowId, R>,
        rows: effectiveRows,
        getRowId: getRowIdOf,
        columns: activeColumns,
        processRowUpdate,
        onProcessRowUpdateError,
        replaceRows: replaceRows as unknown as (rows: ReadonlyMap<GridRowId, R>) => void,
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
        dataSource, sortModel, filterModel,
        paginationModel: effectivePaginationModel,
        paginationMode, sortingMode, filterMode, aggregationModel,
        rowGroupingActive: isRowGrouping,
        getRowId: effectiveGetRowId as unknown as (row: GridRowModel) => GridRowId,
        setRows, setRowCount, setDataSourceLoading, setDataSourceError,
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
        controlledExpandedRowIds, onDetailPanelExpandedRowIdsChange, rowMetaMap,
    });

    // ── Column management ─────────────────────────────────────────────────────
    const {
        effectiveColumns, hierarchyField, orderedColumns, visibleOrderedColumns, renderOrderedColumns, navigationColumns, columnIndexMap,
        columnWidths, effectiveColumnOrder, columnReorderHandlers, moveColumn, resetColumnOrder, handleColumnResize,
    } = useGridColumns<R>({
        activeColumns, isHierarchyEnabled, isRowGrouping, isTreeData, activeHierarchyHandlers,
        columnVisibilityModel, columnOrder, onColumnOrderChange, onColumnOrderModelChange, disableColumnReorder,
        pivotMode: isPivotActive,
        checkboxSelection, hasDetailPanel, rowReordering, initialState, setColumns,
        pinnedColumns: effectivePinnedColumns,
        getRowId: getRowIdOfInEvents,
        aggregationModel,
        groupingRows: isRowGrouping ? rowGroupingHandlers.groupingRows : undefined,
    });

    useGridStateSnapshot({
        onStateChange, sortModel, filterModel, effectivePaginationModel, columnWidths, effectiveColumnOrder,
        columnVisibilityModel, pinnedColumns,
        density: effectiveDensity,
    });

    const rowPipeline = useGridRowPipeline<GridRowModel>({
        effectiveRows: effectiveRows as GridRowModel[],
        activeHierarchyHandlers,
        filterMode,
        filterModel: pivot.pipelineFilterModel,
        sortModel: pivot.pipelineSortModel,
        sortingMode, pagination, paginationMode, effectivePaginationModel, pinnedRows,
        getRowId: getRowIdOf,
        columnLookup,
        hierarchyField,
    });
    const {
        filteredRows, dataRows, pinnedTopRows, pinnedBottomRows, sortedUnpinnedRows, paginatedUnpinnedRows, allRenderableRows,
    } = rowPipeline as unknown as GridRowPipelineResult<R>;
    // The unpinned rows on screen: the current page, or every row without pagination.
    const centerRows = pagination ? paginatedUnpinnedRows : sortedUnpinnedRows;

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

    // Steps 23–24: row selection and click handlers, then the state API methods.
    const { rowSelection, handleRowClick, handleSelectionChange } = useGridSelectionAndStateApi<R>({
        controlledState,
        interactions: {
            dataRows,
            getRowId: getRowIdOf,
            isPivotActive, disableRowSelectionOnClick, isHierarchyEnabled, rowMetaMap, activeHierarchyHandlers, onRowClick,
        },
        api: {
            apiRef: gridData.apiRef,
            multiSort, selectedRowIds, disableMultipleRowSelection,
            isSyntheticRowId: (id) => isSyntheticRowId(id, rowMetaMap),
            getVisibleRows: () => [...pinnedTopRows, ...centerRows, ...pinnedBottomRows],
            getAllFilteredRows: () => collectAllFilteredRows<GridRowModel>({
                hierarchyHandlers: activeHierarchyHandlers,
                pinnedTopRows,
                sortedUnpinnedRows,
                pinnedBottomRows,
                rowMetaMap,
                getRowId: getRowIdOf,
                hierarchyField,
                dataRows,
            }),
            visibleColumns: renderOrderedColumns as unknown as GridColDef[],
        },
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
        // The pivot's Grand Total row is the aggregate in pivot mode: nothing to total here.
        aggregationModel: isPivotActive ? NO_AGGREGATION_MODEL : aggregationModel,
        // When the server drives the rows (paginates, sorts or filters them), the grid only holds
        // the rows it returned, so client totals would be partial.
        isServerSide: isServerDrivenDataSource({ dataSource, paginationMode, sortingMode, filterMode }),
        dataSource, filterModel, sortModel, serverAggregationResults,
    });

    // In pivot mode the pivot's own Grand Total row is the aggregate; aggregationModel keys name source
    // fields that the pivot rows do not have.
    const hasAggregation = Object.keys(aggregationModel).length > 0 && !isPivotActive;

    useGridAggregationApi<R>({
        apiRef, hasAggregation, aggregationResult, aggregationModel, isRowGrouping, rowGroupingHandlers, rowMetaMap,
        columns: activeColumns,
        getRowId: getRowIdOf,
        hierarchyField,
    });

    const layout = useLayout({
        rowHeight: effectiveRowHeight,
        pagination, paginatedUnpinnedRows, sortedUnpinnedRows, expandedRowIds, getDetailPanelHeight,
        detailPanelHeights,
        pinnedTopRowsLength: pinnedTopRows.length,
        pinnedBottomRowsLength: pinnedBottomRows.length,
        pinnedTopRows, pinnedBottomRows, visibleOrderedColumns,
        pinnedColumns: effectivePinnedColumns,
        columnWidths,
        viewportWidth: state.dimensions.viewportWidth || 1000,
        checkboxSelection, hasDetailPanel, rowReordering, pinCheckboxColumn, pinExpandColumn, autoHeight,
        paginationMode,
        isLoading: state.dataSource.loading,
        pageSize: effectivePaginationModel.pageSize,
        getRowId: getRowIdOf,
    });

    const spanning = useGridSpanning<R>({
        pinnedTopRows, centerRows, pinnedBottomRows,
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

    // Cell range selection (cellSelection): the range, pointer drag and Shift-keys, copy text, totals.
    const cellSelection = useGridCellSelection<R>({
        enabled: cellSelectionProp && !listView,
        model: controlledState.cellSelectionModel,
        onModelChange: controlledState.handleCellSelectionModelChange,
        getPendingModel: controlledState.getPendingCellSelectionModel,
        allRenderableRows,
        getRowId: getRowIdOf,
        navigationColumns,
        columnIndexMap,
        spanning,
        rowMetaMap,
        layout,
        rowHeight: effectiveRowHeight,
        pinnedTopRowCount: pinnedTopRows.length,
        viewportRef,
        containerRef,
        localeText,
        showStats: showCellSelectionStats,
    });

    // Steps 30–31a: copy, scrollToIndexes and column auto-size on the API.
    const handleColumnAutosize = useGridViewApis<R>({
        apiRef, containerRef, viewportRef,
        copyColumns: renderedDataColumns as unknown as GridColDef[],
        getRowId: getRowIdOf as unknown as (row: GridRowModel) => GridRowId,
        disableClipboardCopy,
        getCellRangeCopyText: cellSelection.enabled ? cellSelection.getCopyText : undefined,
        layout,
        rowHeight: effectiveRowHeight,
        orderedColumns,
        onColumnResize: handleColumnResize,
    });

    // Steps 32–33: scroll sync, viewport measurement and the render window.
    const { handleScroll, setViewportElement, maxContentHeight, virtualization } = useGridScrollViewport<R>({
        viewport: { onRowsScrollEnd, overscanRowCount, autoHeight, setDimensions },
        viewportRef, containerRef, layout,
        viewportWidth: state.dimensions.viewportWidth,
        viewportHeight: state.dimensions.viewportHeight,
        virtualization: { autoHeight, rowReordering, hasDetailPanel, checkboxSelection, pinCheckboxColumn, pinExpandColumn },
    });


    const { handleSort, handleSortAdd } = useGridSortHandlers({ sortModel, onSortModelChange: handleSortModelChange });

    const rowSelectionEnabled = checkboxSelection || !disableRowSelectionOnClick;
    const {
        focusedCell, setFocusedCell, viewportTabIndex, ensureGridFocus, handleFocus, handleBlur, handleKeyDown,
        handleMouseDownCapture,
    } = useGridKeyboardNavigation({
        allRenderableRows, navigationColumns, checkboxSelection, selectedRowIds, handleSelectionChange,
        handleDetailPanelToggle, editingHandlers, setKeyboardMode, sortModel, handleSort, handleSortAdd, multiSort,
        isCellEditable, pagination,
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
        cellSelection: cellSelection.keyboard,
        headerFilters: showHeaderFilters,
    });

    const { handleCellClick, handleHeaderClick } = useGridPointerFocusHandlers<R>({
        ensureGridFocus, setKeyboardMode, setFocusedCell, getRowId: getRowIdOf, onCellClick,
    });
    // Steps 36a–36d: the cell selection API, paste and range clear, undo/redo, the fill handle.
    const fillHandle = useGridRangeEditing<R>({
        props, apiRef, containerRef, viewportRef,
        selection: cellSelection,
        model: controlledState.cellSelectionModel,
        getPendingModel: controlledState.getPendingCellSelectionModel,
        focusedCell, setFocusedCell, allRenderableRows,
        getRowId: getRowIdOf,
        navigationColumns: navigationColumns as unknown as GridColDef<R>[],
        columnIndexMap, isCellEditable, rowMetaMap,
        getSpanOrigin: spanning.getSpanOrigin,
        isEditing: editingHandlers.editingCell !== null,
        batchEdit,
        channel: editCommitChannel,
        layout,
        rowHeight: effectiveRowHeight,
        pinnedTopRowCount: pinnedTopRows.length,
    });

    const { handleHideColumn, handlePinColumn } = useGridColumnMenuHandlers({
        columnVisibilityModel,
        onColumnVisibilityModelChange: handleColumnVisibilityModelChange,
        pinnedColumns,
        onPinnedColumnsChange: handlePinnedColumnsChange,
    });

    // Steps 38–41: aria row bases, the span-widened row window, the rows and the columns to render.
    const { ariaRows, spanRowWindow, visibleRows, renderColumns } = useGridRenderWindow<R>({
        aria: {
            columnGroupingModel,
            headerFilterRow: showHeaderFilters,
            pinnedTopCount: pinnedTopRows.length,
            pinnedBottomCount: pinnedBottomRows.length,
            pagination,
            paginationMode,
            paginationModel: effectivePaginationModel,
            paginationRowCount,
            paginatedUnpinnedRowCount: paginatedUnpinnedRows.length,
            sortedUnpinnedRowCount: sortedUnpinnedRows.length,
        },
        spanning, virtualization, layout,
        pinnedTopRows, pinnedBottomRows, paginatedUnpinnedRows, sortedUnpinnedRows, pagination,
        getRowId: getRowIdOf,
    });

    useGridDevWarnings({
        paginationRequested: propPagination,
        isRowGrouping,
        autoHeight,
        viewportHeight: state.dimensions.viewportHeight,
        renderedRowCount: visibleRows.length,
        totalRowCount: pinnedTopRows.length + centerRows.length + pinnedBottomRows.length,
        pinnedRowsIgnored: isHierarchyEnabled && Boolean(pinnedRows?.top?.length || pinnedRows?.bottom?.length),
        scrollHeight: virtualization.totalHeight,
        maxContentHeight,
        reachableRowCount: countReachableRows(virtualization.cumulativeHeights, virtualization.virtualContainerHeight),
        unpinnedRowCount: virtualization.cumulativeHeights.length,
        listViewWithoutColumn: listViewRequested && !listViewColumn,
        listViewRowCount: listView && listViewColumn ? allRenderableRows.length : 0,
    });

    // Header drag-reorder keeps a column inside its column group (and ungrouped columns outside groups).
    const headerReorderHandlers = useColumnGroupReorderGuard(columnGroupingModel, columnReorderHandlers);

    const hasRowSpanning = React.useMemo(() => effectiveColumns.some(c => !!c.rowSpan), [effectiveColumns]);
    const columnsPanel = useGridColumnsPanel();
    useGridStylesheetWarning(containerRef);

    // The aiAssistant prompt panel (v3.5): applies validated replies through apiRef; apiRef.openAiAssistant.
    const aiAssistantPanel = useGridAiAssistant({
        apiRef,
        options: aiAssistant,
        columns: activeColumns as unknown as GridColDef[],
        onApply: onAiAssistantApply,
        onError: onAiAssistantError,
    });

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
        disableColumnReorder, columnGroupingModel, moveColumn, resetColumnOrder,
        forceColumnsOpen: columnsPanel.toolbarPanelRequested,
        onColumnsPanelClose: columnsPanel.closeToolbarPanel,
        aiAssistantEnabled: aiAssistantPanel.enabled,
        aiAssistantOpen: aiAssistantPanel.open,
        onAiAssistantToggle: aiAssistantPanel.togglePanel,
        aiAssistantLabel: localeText?.aiAssistantButton,
        forceFiltersOpen: columnsPanel.toolbarFiltersRequested,
        onFiltersPanelClose: columnsPanel.closeToolbarFiltersPanel,
    });

    // Props the row renderers (top-pinned, centre and bottom-pinned rows) all take.
    const rowRenderProps = {
        rowReordering, columnIndexMap, editingHandlers, isCellEditable, selectedRowIds, checkboxSelection,
        onRowClick: handleRowClick,
        onRowDoubleClick,
        onCellClick: handleCellClick,
        onSelectionChange: handleSelectionChange,
        columnWidths,
        pinnedColumns: effectivePinnedColumns,
        hasDetailPanel, expandedRowIds, getDetailPanelContent, getDetailPanelHeight,
        onDetailPanelToggle: handleDetailPanelToggle,
        onDetailPanelHeightChange: reportDetailPanelHeight,
        pinCheckboxColumn, pinExpandColumn, focusedCell,
        colspanMap: spanning.colspanMap,
        rowSpanningCaches: spanning.rowSpanningCaches,
        rowHeight: effectiveRowHeight,
        rowMetaMap,
        cellRange: cellSelection.displayRange,
        cellRangeHasRowSpan: cellSelection.hasRowSpan,
        fillHandle: fillHandle.handle,
    };

    const rootProps: GridRootProps<R> = {
        setViewportElement, handleScroll, ariaLabel, ariaRows,
        navigationColumnCount: navigationColumns.length,
        rowSelectionEnabled, disableMultipleRowSelection, cellSelection, effectiveLoading, viewportTabIndex, setKeyboardMode,
        handleMouseDownCapture, handleKeyDown, handleFocus, handleBlur, effectivePinnedColumns, virtualization, renderColumns,
        renderedDataColumns, columnGroupingModel, checkboxSelection, rowSelection, sortModel, handleSort, handleSortAdd,
        multiSort, handleColumnResize, handleColumnAutosize, columnWidths, focusedCell, columnIndexMap, handleHeaderClick,
        headerReorderHandlers, rowReordering, hasDetailPanel, pinCheckboxColumn, pinExpandColumn, aggregationModel,
        handleHideColumn, columnsPanel, handlePinColumn, wrapHeaderText, headerHeight, showHeaderFilters, filterModel,
        handleFilterModelChange, localeText, rowRenderProps, pinnedTopRows, pinnedBottomRows, pinnedRows, getRowIdOf,
        showEmptyState: !effectiveLoading && !state.dataSource.error && filteredRows.length === 0,
        effectiveNoRowsLabel, spanRowWindow, visibleRows,
        baseColumns: columns as unknown as GridColDef<R>[],
        viewportWidth: state.dimensions.viewportWidth,
        rowReorderHandlers, paginationMode,
        dataSourceLoading: state.dataSource.loading,
        sortedUnpinnedRowCount: sortedUnpinnedRows.length,
        pageSize: effectivePaginationModel.pageSize,
        unpinnedRowsLength: layout.unpinnedRowsLength,
        showAggregationFooter: hasAggregation && rowGroupingHandlers.rootAggregationPosition !== null,
        aggregationResult, effectiveRowHeight, isAggregationLoading,
        containerRef, className, autoHeight, height, style, hasRowSpanning, listView, headerFilterHeight, slots, slotProps,
        toolbarProps, aiAssistantPanel, orderedColumns, columnVisibilityModel, disableColumnReorder,
        handleColumnVisibilityModelChange, moveColumn, resetColumnOrder, listViewColumn, allRenderableRows, dataRows,
        pagination, effectivePaginationModel,
        currentPage: rowPipeline.currentPage,
        pageSizeOptions, selectedRowIds,
        columnsByField: columnLookup.byField,
        rowMetaMap, paginationRowCount, handleRowClick, onRowDoubleClick, handleSelectionChange, handlePaginationModelChange,
        onRowsScrollEnd,
        toggleExpansion: activeHierarchyHandlers?.toggleExpansion,
        showCellSelectionStats,
        apiRef: gridData.apiRef,
        hasAggregation, isHierarchyEnabled,
        dataSourceError: state.dataSource.error,
        filteredRowCount: filteredRows.length,
        onRetry: dataSource ? dataSourceHandlers.fetchRows : undefined,
    };

    return <GridRoot<R> {...rootProps} />;
}
