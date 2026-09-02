import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { useLayout } from '../../hooks/core/useLayout';
import { useGridKeyboardNavigation } from '../../hooks/core/useGridKeyboardNavigation';
import { useGridControlledState } from '../../hooks/core/useGridControlledState';
import { useGridRowPipeline } from '../../hooks/core/useGridRowPipeline';
import { useGridVirtualization } from '../../hooks/core/useGridVirtualization';
import { useGridColumns } from '../../hooks/core/useGridColumns';
import { useGridVisibleRows } from '../../hooks/core/useGridVisibleRows';
import { useGridScrollSync } from '../../hooks/core/useGridScrollSync';
import { useGridStateSnapshot } from '../../hooks/core/useGridStateSnapshot';
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
import { useGridDataSource } from '../../hooks/features/useGridDataSource';
import { useAggregation } from '../../hooks/features/useAggregation';
import { usePivot } from '../../hooks/features/usePivot';
import { useGridClipboard } from '../../hooks/features/useGridClipboard';
import { GridListView } from './GridListView';
import { GridPinnedRows } from './GridPinnedRows';
import { GridVirtualRows } from './GridVirtualRows';
import { GridStandaloneColumnPanel } from './GridStandaloneColumnPanel';
import type { DataGridProps, GridRowModel, GridRowId, GridSortDirection, GridColDef, GridRowParams, GridCellParams, GridDataSource, GridAggregationResult, GridFilterModel, GridTreeNode, GridSortItem } from '../../types';

export function DataGrid<R extends GridRowModel = GridRowModel>(props: DataGridProps<R>) {
    const {
        rows,
        columns,
        getRowId,
        rowHeight = 52,
        headerHeight = 56,
        autoHeight = false,
        checkboxSelection = false,
        rowSelectionModel: propRowSelectionModel,
        onRowSelectionModelChange: propOnRowSelectionModelChange,
        onRowClick,
        onCellClick,

        filterModel: propFilterModel,
        onFilterModelChange,
        sortModel: propSortModel,
        onSortModelChange,
        pagination: propPagination = false,
        paginationModel = { page: 0, pageSize: 100 },
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

        rowGroupingModel: propRowGroupingModel,

        aggregationModel: propAggregationModel,
        onAggregationModelChange,
        getAggregationPosition,

        isCellEditable,
        processRowUpdate,
        onProcessRowUpdateError,

        dataSource,
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
        apiRef: propApiRef,
    } = props;

    // Stable defaults
    const defaultFilterModel: GridFilterModel = useMemo(() => ({ items: [] }), []);
    const filterModel = (propFilterModel || defaultFilterModel) as GridFilterModel;

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
        rowSelectionModel: propRowSelectionModel,
        onRowSelectionModelChange: propOnRowSelectionModelChange,
    });

    const {
        sortModel,
        isSortControlled,
        setInternalSortModel,
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
        isSelectionControlled,
        setInternalRowSelectionModel,
    } = controlledState;

    const onRowSelectionModelChange = propOnRowSelectionModelChange;

    const pivot = usePivot(rows as GridRowModel[], columns as unknown as GridColDef[], currentPivotModel, pivotMode);

    const activeRows = (pivotMode && pivot.isValid ? pivot.pivotRows : rows) as unknown as R[];
    const activeColumns = (pivotMode && pivot.isValid ? pivot.pivotColumns : columns) as unknown as GridColDef<R>[];

    const [serverAggregationResults, setServerAggregationResults] = useState<GridAggregationResult | null>(null);

    useEffect(() => {
        setServerAggregationResults(null);
    }, [aggregationModel]);

    const viewportRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const defaultGetRowId = useCallback((row: R) => row.id, []);
    const effectiveGetRowId = getRowId || defaultGetRowId;

    // Normalize rows so every row has `id === getRowId(row)`.
    // createInitialState and SET_ROWS both key the internal store by row.id,
    // so rows without a native id field collide on undefined without this.
    // When getRowId is the default (row) => row.id this is a no-op per row.
    const normalizedRows = useMemo(
        () => activeRows.map(row => {
            const id = effectiveGetRowId(row);
            return id === row.id ? row : ({ ...row, id } as R);
        }),
        [activeRows, effectiveGetRowId]
    );

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
        rows: normalizedRows,
        columns: activeColumns,
        rowHeight,
        headerHeight,
        rowCount: propRowCount,
        columnVisibilityModel,
        initialState: props.initialState
    });
    const {
        state,
        apiRef,
        setRows,
        setColumns,
        setDimensions,
        setDataSourceLoading,
        setDataSourceError,
        setRowCount
    } = gridData;

    const { scrollTop, scrollLeft, handleScroll } = useGridScrollSync({ onRowsScrollEnd });

    useEffect(() => {
        if (propApiRef) {
            propApiRef.current = apiRef.current;
        }
    }, [propApiRef, apiRef]);

    const { copySelectedRows } = useGridClipboard({
        selectedRowIds,
        columns: activeColumns as unknown as GridColDef[],
        getVisibleRows: () => apiRef.current.getVisibleRows(),
        getRowId: effectiveGetRowId as unknown as (row: GridRowModel) => GridRowId,
    });

    // Expose on apiRef for programmatic use
    useEffect(() => {
        apiRef.current.copySelectedRows = copySelectedRows;
        apiRef.current.getSelectedRows = () => Array.from(selectedRowIds);
    }, [copySelectedRows, selectedRowIds, apiRef]);

    const isInternalLoading = state.dataSource.loading;
    const effectiveLoading = loading || isInternalLoading;

    const effectiveRows = useMemo(() => {
        return state.rows.allRows.map(id => state.rows.idRowsLookup.get(id)!) as R[];
    }, [state.rows]);

    const treeDataHandlers = useTreeData({
        rows: effectiveRows,
        getRowId: effectiveGetRowId,
        getTreeDataPath,
        treeData,
        defaultGroupingExpansionDepth,
        filterModel,

        sortModel,
        onRowExpansionChange: handleNodeExpansion
    });

    useEffect(() => {
        treeDataRef.current = treeDataHandlers;
    }, [treeDataHandlers]);

    const rowGroupingHandlers = useRowGrouping({
        rows: effectiveRows,
        getRowId: effectiveGetRowId,
        rowGroupingModel,
        aggregationModel,
        defaultGroupingExpansionDepth,
        filterModel,
        sortModel,
        getAggregationPosition
    });

    const editingHandlers = useGridEditing({
        rows: effectiveRows,
        getRowId: effectiveGetRowId,
        processRowUpdate,
        onProcessRowUpdateError,
        onRowChange: (updatedRow) => {
            // Dispatch a proper state update so React re-renders with the new row value
            const { dispatch } = gridData;
            const currentRows = Array.from(gridData.state.rows.idRowsLookup.values());
            const nextRows = currentRows.map(r =>
                r.id === updatedRow.id ? updatedRow : r
            );
            dispatch({ type: 'SET_ROWS', payload: nextRows });
        },
    });

    const isTreeData = treeData;
    const isRowGrouping = !!(rowGroupingModel && rowGroupingModel.length > 0);
    const isHierarchyEnabled = isTreeData || isRowGrouping;
    const activeHierarchyHandlers = isTreeData ? treeDataHandlers : (isRowGrouping ? rowGroupingHandlers : null);

    const pagination = propPagination && !isRowGrouping;

    const handleRowClick = useCallback((params: GridRowParams<R>) => {
        const { row, id } = params;

        if (isHierarchyEnabled && row._hasChildren) {
            activeHierarchyHandlers?.toggleExpansion(id);
            return;
        }

        onRowClick?.(params);
    }, [isHierarchyEnabled, activeHierarchyHandlers, onRowClick]);

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
            setRows(normalizedRows);
        }
    }, [normalizedRows, setRows, dataSource]);

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
        pivotMode,
        checkboxSelection,
        hasDetailPanel,
        rowReordering,
        initialState,
        setColumns,
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
    });

    const rowPipeline = useGridRowPipeline<GridRowModel>({
        effectiveRows: effectiveRows as GridRowModel[],
        activeHierarchyHandlers: activeHierarchyHandlers as { getVisibleRows: () => GridRowModel[] } | null,
        filterMode,
        filterModel,
        dataSource: dataSource as GridDataSource<GridRowModel> | undefined,
        sortModel,
        sortingMode,
        pagination,
        paginationMode,
        effectivePaginationModel,
        pinnedRows,
        isLoading: state.dataSource.loading,
        pageSize: effectivePaginationModel.pageSize,
    });
    const filteredRows        = rowPipeline.filteredRows        as R[];
    const pinnedTopRows       = rowPipeline.pinnedTopRows       as R[];
    const pinnedBottomRows    = rowPipeline.pinnedBottomRows    as R[];
    const sortedUnpinnedRows  = rowPipeline.sortedUnpinnedRows  as R[];
    const paginatedUnpinnedRows = rowPipeline.paginatedUnpinnedRows as R[];
    const allRenderableRows   = rowPipeline.allRenderableRows   as R[];

    useEffect(() => {
        gridData.apiRef.current.getVisibleRows = () => pagination ? paginatedUnpinnedRows : sortedUnpinnedRows;
        gridData.apiRef.current.getVisibleColumns = () => effectiveColumns as unknown as GridColDef[];
    }, [sortedUnpinnedRows, paginatedUnpinnedRows, pagination, effectiveColumns, gridData.apiRef]);

    const rowReorderHandlers = useRowReorder({
        rows: pagination ? paginatedUnpinnedRows : sortedUnpinnedRows,
        getRowId: (row) => row.id,
        onRowOrderChange,
        rowReordering
    });

    const spanning = useGridSpanning(
        allRenderableRows,
        navigationColumns,
        columnWidths
    );

    const { aggregationResult } = useAggregation({
        rows: filteredRows,
        aggregationModel,
        isServerSide: !!(dataSource && (paginationMode === 'server' || sortingMode === 'server')),
        dataSource,
        filterModel,
        sortModel,
        serverAggregationResults,
    });

    const hasAggregation = Object.keys(aggregationModel).length > 0;

    useEffect(() => {
        gridData.apiRef.current.getAggregationResult = () => hasAggregation ? aggregationResult : null;
        gridData.apiRef.current.getAggregationModel = () => hasAggregation ? aggregationModel : null;
    }, [aggregationResult, aggregationModel, hasAggregation, gridData.apiRef]);

    const layout = useLayout({
        rowHeight,
        pagination,
        paginatedUnpinnedRows,
        sortedUnpinnedRows,
        expandedRowIds,
        getDetailPanelHeight,
        pinnedTopRowsLength: pinnedTopRows.length,
        pinnedBottomRowsLength: pinnedBottomRows.length,
        visibleOrderedColumns,
        pinnedColumns,
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
    });

    // Merge layout-computed widths (which include flex resolution) with user-resize
    // overrides. The footer and other consumers that receive `columnWidths` only get
    // the resize-override map, which has no entry for flex columns that haven't been
    // manually resized — causing them to fall back to the raw `col.width` prop instead
    // of the actual rendered width.
    const resolvedColumnWidths = useMemo(() => {
        const result: Record<string, number> = {};
        for (const col of [...layout.leftPinnedCols, ...layout.unpinnedColsWithWidth, ...layout.rightPinnedCols]) {
            if (!col.isSpacer) result[col.field] = col.width;
        }
        return { ...result, ...columnWidths };
    }, [layout.leftPinnedCols, layout.unpinnedColsWithWidth, layout.rightPinnedCols, columnWidths]);

    useEffect(() => {
        gridData.apiRef.current.scrollToIndexes = ({ rowIndex, colIndex }) => {
            const el = viewportRef.current;
            if (!el) return;

            if (rowIndex !== undefined && rowIndex >= 0) {
                const rowTop = rowIndex > 0 ? layout.cumulativeHeights[rowIndex - 1] : 0;
                const rowBottom = layout.cumulativeHeights[rowIndex] ?? rowTop;
                const { scrollTop, clientHeight } = el;
                if (rowTop < scrollTop) {
                    el.scrollTop = rowTop;
                } else if (rowBottom > scrollTop + clientHeight) {
                    el.scrollTop = rowBottom - clientHeight;
                }
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

    const handleSelectionChange = useCallback((rowId: GridRowId, isSelected: boolean) => {
        const newSelection = new Set(selectedRowIds);
        if (isSelected) {
            newSelection.add(rowId);
        } else {
            newSelection.delete(rowId);
        }
        const newSelectionArray = Array.from(newSelection);

        if (!isSelectionControlled) {
            setInternalRowSelectionModel(newSelectionArray);
        }
        onRowSelectionModelChange?.(newSelectionArray);
    }, [selectedRowIds, isSelectionControlled, onRowSelectionModelChange, setInternalRowSelectionModel]);

    const handleSelectAll = useCallback((isSelected: boolean) => {
        let newSelection: GridRowId[] = [];
        if (isSelected) {
            newSelection = effectiveRows.map((row: GridRowModel) => row.id);
        }

        if (!isSelectionControlled) {
            setInternalRowSelectionModel(newSelection);
        }
        onRowSelectionModelChange?.(newSelection);
    }, [effectiveRows, isSelectionControlled, onRowSelectionModelChange, setInternalRowSelectionModel]);

    const handleSort = useCallback((field: string, direction: GridSortDirection) => {
        const newSortModel = direction ? [{ field, sort: direction }] : [];

        if (!isSortControlled) {
            setInternalSortModel(newSortModel as GridSortItem[]);
        }
        onSortModelChange?.(newSortModel as GridSortItem[]);
    }, [isSortControlled, onSortModelChange, setInternalSortModel]);

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
    });

    const handleCellClick = useCallback((params: GridCellParams<R>) => {
        setKeyboardMode(false);
        setFocusedCell({ id: params.row.id, field: params.field });

        gridRef.current?.focus({ preventScroll: true });
        onCellClick?.(params);
    }, [onCellClick, setKeyboardMode, setFocusedCell]);

    const prevEditingCellRef = useRef(editingHandlers.editingCell);
    useEffect(() => {
        const wasEditing = Boolean(prevEditingCellRef.current);
        const isEditing = Boolean(editingHandlers.editingCell);

        if (wasEditing && !isEditing) {

            gridRef.current?.focus({ preventScroll: true });
        }

        prevEditingCellRef.current = editingHandlers.editingCell;
    }, [editingHandlers.editingCell]);

    const visibleRows = useGridVisibleRows<R>({
        renderContext: virtualization.renderContext,
        pinnedTopRows,
        pinnedBottomRows,
        paginatedUnpinnedRows,
        sortedUnpinnedRows,
        pagination,
    });


    const allSelected = rows.length > 0 && selectedRowIds.size === rows.length;
    const someSelected = selectedRowIds.size > 0 && selectedRowIds.size < rows.length;

    const hasRowSpanning = React.useMemo(() => effectiveColumns.some(c => !!c.rowSpan), [effectiveColumns]);
    const [columnsPanelOpen, setColumnsPanelOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const standalonePanelRef = React.useRef<HTMLDivElement>(null);

    const toolbarProps = React.useMemo(() => {
        if (!slots?.toolbar) return null;
        const reorderHandler = disableColumnReorder
            ? undefined
            : (fromField: string, toField: string) => {
                const currentOrder = [...effectiveColumnOrder];
                const fromIdx = currentOrder.indexOf(fromField);
                const toIdx = currentOrder.indexOf(toField);
                if (fromIdx === -1 || toIdx === -1) return;
                const newOrder = [...currentOrder];
                newOrder.splice(fromIdx, 1);
                newOrder.splice(toIdx, 0, fromField);
                if (!columnOrder) setInternalColumnOrder(newOrder);
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
            onFilterModelChange,
            columnVisibilityModel,
            onColumnVisibilityModelChange: handleColumnVisibilityModelChange,
            onColumnReorder: reorderHandler,
            onColumnOrderReset: disableColumnReorder ? undefined : () => setInternalColumnOrder(columns.map(c => c.field)),
            forceColumnsOpen: columnsPanelOpen,
            onColumnsPanelClose: () => setColumnsPanelOpen(false),
            ...slotProps?.toolbar,
        };
    }, [
        slots?.toolbar, disableColumnReorder, effectiveColumnOrder, orderedColumns, effectiveColumns,
        columnOrder, onColumnOrderChange, setInternalColumnOrder, gridData.apiRef,
        columns, aggregationModel, handleAggregationModelChange, pivotMode,
        propPivotModel, onPivotModelChange, currentPivotModel, handlePivotModelChange,
        filterModel, onFilterModelChange, columnVisibilityModel,
        handleColumnVisibilityModelChange, columnsPanelOpen, slotProps?.toolbar,
    ]);

    // Click-outside handler for standalone column panel
    useEffect(() => {
        if (!columnsPanelOpen || slots?.toolbar) return;
        function handleClickOutside(e: MouseEvent) {
            if (standalonePanelRef.current && !standalonePanelRef.current.contains(e.target as Node)) {
                setColumnsPanelOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [columnsPanelOpen, slots?.toolbar]);

    return (
        <div
            ref={containerRef}
            className={['ogx', className, autoHeight && 'ogx--auto-height', hasRowSpanning && 'ogx--row-spanning', listView && 'ogx--list-view'].filter(Boolean).join(' ')}
            style={{
                ...style,
                height: height ?? style?.height,
                '--ogx-row-height': `${rowHeight}px`,
                '--ogx-header-height': `${headerHeight}px`
            } as unknown as React.CSSProperties}
            aria-busy={effectiveLoading}
        >
            {toolbarProps && <StableToolbar {...toolbarProps} />}

            {!slots?.toolbar && (
                <GridStandaloneColumnPanel<R>
                    isOpen={columnsPanelOpen}
                    containerRef={containerRef}
                    panelRef={standalonePanelRef}
                    effectiveColumns={effectiveColumns}
                    columnVisibilityModel={columnVisibilityModel}
                    effectiveColumnOrder={effectiveColumnOrder}
                    columnOrder={columnOrder}
                    disableColumnReorder={disableColumnReorder}
                    onClose={() => setColumnsPanelOpen(false)}
                    onColumnVisibilityChange={handleColumnVisibilityModelChange}
                    onColumnOrderChange={onColumnOrderChange}
                    setInternalColumnOrder={setInternalColumnOrder}
                />
            )}

            {listView && listViewColumn && (
                <GridListView<R>
                    ariaLabel={ariaLabel}
                    allRenderableRows={allRenderableRows}
                    filteredRows={filteredRows}
                    pagination={pagination}
                    effectivePaginationModel={effectivePaginationModel}
                    pageSizeOptions={pageSizeOptions}
                    selectedRowIds={selectedRowIds}
                    listViewColumn={listViewColumn}
                    noRowsLabel={noRowsLabel}
                    rowHeight={rowHeight}
                    checkboxSelection={checkboxSelection}
                    paginationMode={paginationMode}
                    dataSource={dataSource}
                    serverRowCount={state.pagination.rowCount || 0}
                    paginationSlot={slots?.pagination}
                    paginationSlotProps={slotProps?.pagination}
                    onRowClick={handleRowClick}
                    onSelectionChange={handleSelectionChange}
                    onPaginationModelChange={handlePaginationModelChange}
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
                    aria-rowcount={filteredRows.length + 1}
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
                            columns={virtualization.virtualColumns}
                            allColumns={effectiveColumns}
                            columnGroupingModel={columnGroupingModel}
                            checkboxSelection={checkboxSelection}
                            allSelected={allSelected}
                            someSelected={someSelected}
                            onSelectAll={handleSelectAll}
                            sortModel={sortModel}
                            onSort={handleSort}

                            onColumnResize={handleColumnResize}
                            columnWidths={columnWidths}
                            pinnedColumns={pinnedColumns}

                            focusedCell={focusedCell}
                            onHeaderClick={(field) => {
                                setFocusedCell({ id: 'HEADER', field });
                                setKeyboardMode(false);
                                gridRef.current?.focus({ preventScroll: true });
                            }}
                            onDragStart={columnGroupingModel ? undefined : columnReorderHandlers.onDragStart}
                            onDragOver={columnGroupingModel ? undefined : columnReorderHandlers.onDragOver}
                            onDragEnd={columnGroupingModel ? undefined : columnReorderHandlers.onDragEnd}
                            onDrop={columnGroupingModel ? undefined : columnReorderHandlers.onDrop}
                            draggedColumn={columnGroupingModel ? undefined : columnReorderHandlers.draggedColumn}
                            dragOverColumn={columnGroupingModel ? undefined : columnReorderHandlers.dragOverColumn}
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
                            onManageColumns={() => setColumnsPanelOpen(true)}
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
                            <GridEmptyState noRowsLabel={noRowsLabel} width={virtualization.totalWidth} />
                        )}

                        <GridPinnedRows<R>
                            rows={pinnedTopRows}
                            position="top"
                            columns={virtualization.virtualColumns}
                            selectedRowIds={selectedRowIds}
                            checkboxSelection={checkboxSelection}
                            onRowClick={handleRowClick}
                            onCellClick={handleCellClick}
                            onSelectionChange={handleSelectionChange}
                            columnWidths={columnWidths}
                            pinnedColumns={pinnedColumns}
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
                            rowSpanningCaches={spanning.rowSpanningState.caches}
                            rowHeight={rowHeight}
                        />

                        <GridVirtualRows<R>
                            virtualContainerHeight={virtualization.totalHeight - virtualization.pinnedTopHeight - virtualization.pinnedBottomHeight}
                            offsetTop={virtualization.offsetTop}
                            effectiveLoading={effectiveLoading}
                            visibleRows={visibleRows}
                            baseColumns={columns as unknown as GridColDef<R>[]}
                            virtualColumns={virtualization.virtualColumns}
                            viewportWidth={state.dimensions.viewportWidth}
                            checkboxSelection={checkboxSelection}
                            hasDetailPanel={hasDetailPanel}
                            rowReordering={rowReordering}
                            rowHeight={rowHeight}
                            pinnedRows={pinnedRows}
                            selectedRowIds={selectedRowIds}
                            onRowClick={handleRowClick}
                            onCellClick={handleCellClick}
                            onSelectionChange={handleSelectionChange}
                            columnWidths={columnWidths}
                            pinnedColumns={pinnedColumns}
                            expandedRowIds={expandedRowIds}
                            getDetailPanelContent={getDetailPanelContent}
                            getDetailPanelHeight={getDetailPanelHeight}
                            onDetailPanelToggle={handleDetailPanelToggle}
                            pinCheckboxColumn={pinCheckboxColumn}
                            pinExpandColumn={pinExpandColumn}
                            rowReorderHandlers={rowReorderHandlers}
                            editingHandlers={editingHandlers}
                            focusedCell={focusedCell}
                            colspanMap={spanning.colspanMap}
                            rowSpanningCaches={spanning.rowSpanningState.caches}
                            paginationMode={paginationMode}
                            dataSourceLoading={state.dataSource.loading}
                            sortedUnpinnedRowCount={sortedUnpinnedRows.length}
                            infiniteScrollSkeletonCount={Math.min(effectivePaginationModel.pageSize, 20)}
                            unpinnedRowsLength={layout.unpinnedRowsLength}
                        />

                        <GridPinnedRows<R>
                            rows={pinnedBottomRows}
                            position="bottom"
                            columns={virtualization.virtualColumns}
                            selectedRowIds={selectedRowIds}
                            checkboxSelection={checkboxSelection}
                            onRowClick={handleRowClick}
                            onCellClick={handleCellClick}
                            onSelectionChange={handleSelectionChange}
                            columnWidths={columnWidths}
                            pinnedColumns={pinnedColumns}
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
                            rowSpanningCaches={spanning.rowSpanningState.caches}
                            rowHeight={rowHeight}
                        />

                        {/* Aggregation Footer Row — suppressed in pivot mode because pivot rows
                             already contain pre-aggregated values with synthetic field keys
                             (e.g. 'Q1\u001frevenue\u001fsum') that don't match aggregationModel keys. */}
                        {hasAggregation && !pivotMode && (
                            <GridAggregationFooter
                                columns={orderedColumns as unknown as GridColDef[]}
                                aggregationModel={aggregationModel}
                                aggregationResult={aggregationResult}
                                columnWidths={resolvedColumnWidths}
                                rowHeight={rowHeight}
                                checkboxSelection={checkboxSelection}
                                hasDetailPanel={hasDetailPanel}
                                rowReordering={rowReordering}
                                pinnedColumns={pinnedColumns}
                            />
                        )}

                    </div>
                </div>
            )}

            {!listView && pagination && (() => {
                const PaginationComponent = slots?.pagination || Pagination;
                return (
                    <PaginationComponent
                        page={effectivePaginationModel.page}
                        pageSize={effectivePaginationModel.pageSize}
                        rowCount={state.pagination.rowCount}
                        pageSizeOptions={pageSizeOptions}
                        onPageChange={(newPage: number) => handlePaginationModelChange({ ...effectivePaginationModel, page: newPage })}
                        onPageSizeChange={(newPageSize: number) => handlePaginationModelChange({ ...effectivePaginationModel, pageSize: newPageSize, page: 0 })}
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
                        ? noRowsLabel
                        : (filterModel && ((filterModel.quickFilterValues?.length || 0) > 0 || (filterModel.items?.length || 0) > 0))
                            ? `${filteredRows.length} ${filteredRows.length === 1 ? 'row' : 'rows'} found`
                            : ''
                )}
            </div>

            <GridErrorOverlay error={state.dataSource.error} />
        </div>
    );
}
