import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { ListViewRow } from '../ListView/ListViewRow';
import type { GridState } from '../../state/types';
import { Header } from '../Header/Header';
import { Row } from '../Row/Row';
import { SkeletonRow } from '../SkeletonRow';
import { Pagination } from '../Pagination/Pagination';
import { useDataGrid } from '../../hooks/core/useDataGrid';
import { useColumnReorder } from '../../hooks/useColumnReorder';
import { useRowReorder } from '../../hooks/useRowReorder';
import { useTreeData } from '../../hooks/useTreeData';
import { useRowGrouping } from '../../hooks/useRowGrouping';
import { useGridEditing } from '../../hooks/features/useGridEditing';
import { useGridSpanning } from '../../hooks/features/useGridSpanning';
import { useGridDataSource } from '../../hooks/features/useGridDataSource';
import { useAggregation, formatAggregationValue } from '../../hooks/features/useAggregation';
import { usePivot } from '../../hooks/features/usePivot';
import { useGridClipboard } from '../../hooks/features/useGridClipboard';
import { ExpandIcon } from '../ui/ExpandIcon';
import { ColumnVisibilityPanel } from '../ColumnVisibilityPanel/ColumnVisibilityPanel';
import { getPinnedRowGroups, isRowPinned, isColumnPinned } from '../../utils/pinning';
import { sortRows } from '../../utils/sorting';
import { filterRows } from '../../utils/filtering';
import type { DataGridProps, GridRowModel, GridRowId, GridSortDirection, GridColumnOrderChangeParams, GridColDef, GridRenderCellParams, GridRowParams, GridCellParams, GridPaginationModel, GridDataSource, GridAggregationResult, GridAggregationModel, GridPivotModel, GridColumnPinning, GridFilterModel } from '../../types';
import '../../styles/opengridx.css';

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

    const [internalSortModel, setInternalSortModel] = useState<{ field: string; sort: 'asc' | 'desc' }[]>(
        () => initialState?.sorting?.sortModel ?? []
    );
    const isSortControlled = propSortModel !== undefined;
    const sortModel = isSortControlled ? propSortModel : internalSortModel;

    const defaultRowGroupingModel = useMemo(() => [], []);
    const rowGroupingModel = propRowGroupingModel || defaultRowGroupingModel;
    const isAggregationControlled = propAggregationModel !== undefined;

    // ─── Stabilize toolbar component identity ────────────────────────────────
    // If the consumer passes an inline arrow function as slots.toolbar (e.g.
    // `slots={{ toolbar: (p) => <GridToolbar {...p}/> }}`), a new function is
    // created on every parent render. React reconciles by component *identity*,
    // so a changed reference means it unmounts the old toolbar and mounts a new
    // one — destroying focus, replaying animations, etc.
    // useMemo with an empty dep-array gives React a stable identity. If the
    // caller genuinely changes slots.toolbar (e.g. swaps to a different UI),
    // the new value IS used; we just don't thrash for incidental re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const StableToolbar = useMemo(() => slots?.toolbar, [slots?.toolbar]);
    const [internalAggregationModel, setInternalAggregationModel] = useState<GridAggregationModel>(
        () => propAggregationModel ?? {}
    );
    const aggregationModel = isAggregationControlled ? propAggregationModel : internalAggregationModel;

    const handleAggregationModelChange = useCallback((model: GridAggregationModel) => {
        if (!isAggregationControlled) {
            setInternalAggregationModel(model);
        }
        onAggregationModelChange?.(model);
    }, [isAggregationControlled, onAggregationModelChange]);

    const [internalColumnVisibilityModel, setInternalColumnVisibilityModel] = useState<Record<string, boolean>>(
        () => initialState?.columns?.columnVisibilityModel ?? {}
    );
    const isColumnVisibilityControlled = propColumnVisibilityModel !== undefined;
    const columnVisibilityModel = isColumnVisibilityControlled ? propColumnVisibilityModel : internalColumnVisibilityModel;

    const handleColumnVisibilityModelChange = useCallback((model: Record<string, boolean>) => {
        if (!isColumnVisibilityControlled) {
            setInternalColumnVisibilityModel(model);
        }
        onColumnVisibilityModelChange?.(model);
    }, [isColumnVisibilityControlled, onColumnVisibilityModelChange]);

    const [internalPinnedColumns, setInternalPinnedColumns] = useState<GridColumnPinning>(
        () => initialState?.columns?.pinnedColumns ?? {}
    );
    const isPinnedColumnsControlled = propPinnedColumns !== undefined;
    const pinnedColumns = isPinnedColumnsControlled ? propPinnedColumns : internalPinnedColumns;

    const handlePinnedColumnsChange = useCallback((model: GridColumnPinning) => {
        if (!isPinnedColumnsControlled) {
            setInternalPinnedColumns(model);
        }
        onPinnedColumnsChange?.(model);
    }, [isPinnedColumnsControlled, onPinnedColumnsChange]);

    const EMPTY_PIVOT_MODEL: GridPivotModel = useMemo(() => ({ rowFields: [], columnFields: [], valueFields: [] }), []);
    const [internalPivotModel, setInternalPivotModel] = useState<GridPivotModel>(propPivotModel ?? EMPTY_PIVOT_MODEL);
    const currentPivotModel = propPivotModel ?? internalPivotModel;
    const handlePivotModelChange = useCallback((model: GridPivotModel) => {
        setInternalPivotModel(model);
        onPivotModelChange?.(model);
    }, [onPivotModelChange]);
    const pivot = usePivot(rows as GridRowModel[], columns as unknown as GridColDef[], currentPivotModel, pivotMode);

    const activeRows = (pivotMode && pivot.isValid ? pivot.pivotRows : rows) as unknown as R[];
    const activeColumns = (pivotMode && pivot.isValid ? pivot.pivotColumns : columns) as unknown as GridColDef<R>[];

    const [serverAggregationResults, setServerAggregationResults] = useState<GridAggregationResult | null>(null);

    useEffect(() => {
        setServerAggregationResults(null);
    }, [aggregationModel]);

    const [internalPaginationModel, setInternalPaginationModel] = useState(
        () => initialState?.pagination?.paginationModel ?? paginationModel
    );
    const isPaginationControlled = props.paginationModel !== undefined;
    const effectivePaginationModel = isPaginationControlled ? paginationModel : internalPaginationModel;

    const handlePaginationModelChange = useCallback((newModel: GridPaginationModel) => {
        if (!isPaginationControlled) {
            setInternalPaginationModel(newModel);
        }
        onPaginationModelChange?.(newModel);
    }, [isPaginationControlled, onPaginationModelChange]);

    const [internalRowSelectionModel, setInternalRowSelectionModel] = useState<GridRowId[]>([]);
    const isSelectionControlled = propRowSelectionModel !== undefined;
    const rowSelectionModel = isSelectionControlled ? propRowSelectionModel : internalRowSelectionModel;
    const selectedRowIds = useMemo(() => new Set(rowSelectionModel), [rowSelectionModel]);
    const onRowSelectionModelChange = propOnRowSelectionModelChange;

    const viewportRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const defaultGetRowId = useCallback((row: R) => row.id, []);
    const effectiveGetRowId = getRowId || defaultGetRowId;

    const [focusedCell, setFocusedCell] = useState<{ id: GridRowId; field: string } | null>(null);

    // Keyboard-mode flag: toggled via DOM classname — no React state needed
    // so the ring appears instantly without a re-render cycle.
    const setKeyboardMode = useCallback((on: boolean) => {
        containerRef.current?.classList.toggle('ogx--kb', on);
    }, []);

    const dataSourceRef = useRef<GridDataSource<R> | undefined>(dataSource);
    dataSourceRef.current = dataSource;

    const fetchChildrenRef = useRef<((parentId: GridRowId, groupKeys: string[]) => Promise<void>) | null>(null);
    const treeDataRef = useRef<any>(null);

    const handleNodeExpansion = useCallback((node: any) => {
        if (dataSourceRef.current && treeData) {

            if (node.serverChildrenCount > 0 && node.children.length === 0) {

                const groupKeys = treeDataRef.current?.getNodePath(node.id) || [node.groupingKey];
                fetchChildrenRef.current?.(node.id, groupKeys);
            }
        }
    }, [treeData]);

    const gridData = useDataGrid({
        rows: activeRows,
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
        setScroll,
        setDimensions,
        setDataSourceLoading,
        setDataSourceError,
        setRowCount
    } = gridData;

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
                (r as any).id === (updatedRow as any).id ? updatedRow : r
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
        const rowData = row as any;

        if (isHierarchyEnabled && rowData._hasChildren) {
            activeHierarchyHandlers?.toggleExpansion(id);
            return;
        }

        onRowClick?.(params);
    }, [isHierarchyEnabled, activeHierarchyHandlers, onRowClick]);

    const effectiveColumns = useMemo(() => {
        if (!isHierarchyEnabled) return activeColumns;

        return activeColumns.map((col, index) => {

            if (index === 0) {
                return {
                    ...col,
                    renderCell: (params: GridRenderCellParams<R>) => {
                        const { _treeDepth, _hasChildren, _isExpanded, _groupingField, _groupingValue, _descendantCount } = params.row as any;
                        const depth = _treeDepth || 0;
                        const paddingLeft = depth * 24;

                        let content = col.renderCell ? col.renderCell(params) : params.value;

                        if (isTreeData && _hasChildren && params.row._isGroupRow) {
                            content = (
                                <div className="ogx__group-cell-content">
                                    {params.value}
                                    {_descendantCount !== undefined && _descendantCount > 0 ? ` (${_descendantCount})` : ''}
                                </div>
                            );
                        }

                        // For row grouping, override the first column content to show the group label
                        if (isRowGrouping && _hasChildren && _groupingField) {
                            content = (
                                <div className="ogx__group-cell-content">
                                    {col.field === _groupingField ? '' : `${_groupingField}: `}
                                    {String(_groupingValue)}
                                    {_descendantCount !== undefined ? ` (${_descendantCount})` : ''}
                                </div>
                            );
                        }

                        return (
                            <div style={{ display: 'flex', alignItems: 'center', paddingLeft, width: '100%', height: '100%' }}>
                                <div
                                    style={{
                                        marginRight: 4,
                                        width: 24,
                                        height: 24,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: _hasChildren ? 'pointer' : 'default',
                                        flexShrink: 0
                                    }}
                                >

                                    {_hasChildren ? (
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                activeHierarchyHandlers?.toggleExpansion(params.row.id);
                                            }}
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                            }}
                                            style={{
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                pointerEvents: 'auto',
                                                zIndex: 10,
                                                position: 'relative'
                                            }}
                                        >
                                            <ExpandIcon
                                                isExpanded={_isExpanded}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    activeHierarchyHandlers?.toggleExpansion(params.row.id);
                                                }}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {content}
                                </div>
                            </div>
                        );
                    }
                };
            }

            return {
                ...col,
                renderCell: (params: GridRenderCellParams<R>) => {
                    const { _hasChildren, _groupingField } = params.row as any;

                    if (isRowGrouping && _hasChildren) {

                        if (col.field === _groupingField) {
                            return null;
                        }

                        if (params.value !== undefined && params.value !== null) {
                            return col.renderCell ? col.renderCell(params) : params.value;
                        }

                        return null;
                    }

                    return col.renderCell ? col.renderCell(params) : params.value;
                }
            };
        }) as GridColDef<R>[];
    }, [activeColumns, isHierarchyEnabled, isRowGrouping, activeHierarchyHandlers]);

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

    const [columnWidths, setColumnWidths] = useState<Record<string, number>>(
        () => initialState?.columns?.columnWidths ?? {}
    );

    const [internalColumnOrder, setInternalColumnOrder] = useState<string[]>(() =>
        initialState?.columns?.columnOrder ?? activeColumns.map(col => col.field)
    );

    const effectiveColumnOrder = columnOrder || internalColumnOrder;

    useEffect(() => {
        if (!dataSource) {
            setRows(activeRows);
        }
    }, [activeRows, setRows, dataSource]);

    useEffect(() => {
        setColumns(activeColumns as any);
    }, [activeColumns, setColumns]);

    useEffect(() => {
        if (pivotMode) {
            setInternalColumnOrder(activeColumns.map(col => col.field));
        }
    }, [pivotMode, activeColumns]);

    const orderedColumns = useMemo(() => {
        if (disableColumnReorder) return effectiveColumns as GridColDef<R>[];

        const orderMap = new Map(effectiveColumnOrder.map((field, index) => [field, index]));
        return [...(effectiveColumns as GridColDef<R>[])].sort((a, b) => {
            const aIndex = orderMap.get(a.field) ?? effectiveColumns.indexOf(a);
            const bIndex = orderMap.get(b.field) ?? effectiveColumns.indexOf(b);
            return aIndex - bIndex;
        });
    }, [effectiveColumns, effectiveColumnOrder, disableColumnReorder]);

    const visibleOrderedColumns = useMemo(() => {
        return orderedColumns.filter(col => columnVisibilityModel[col.field] !== false);
    }, [orderedColumns, columnVisibilityModel]);

    const columnReorderHandlers = useColumnReorder({
        columns: orderedColumns,
        onColumnOrderChange: useCallback((params: GridColumnOrderChangeParams) => {
            const { oldIndex, targetIndex } = params;

            const newOrder = [...effectiveColumnOrder];
            const [movedField] = newOrder.splice(oldIndex, 1);
            newOrder.splice(targetIndex, 0, movedField);

            if (!columnOrder) {
                setInternalColumnOrder(newOrder);
            }

            onColumnOrderChange?.(params);
        }, [effectiveColumnOrder, columnOrder, onColumnOrderChange]),
        disableColumnReorder,
    });

    const [internalExpandedRowIds, setInternalExpandedRowIds] = useState<Set<GridRowId>>(new Set());
    const expandedRowIds = controlledExpandedRowIds ?? internalExpandedRowIds;
    const hasDetailPanel = Boolean(getDetailPanelContent);

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

    const navigationColumns = useMemo(() => {
        const cols: { field: string; editable?: boolean }[] = [];
        if (rowReordering) cols.push({ field: '__reorder_col__' });
        if (hasDetailPanel) cols.push({ field: '__expand_col__' });
        if (checkboxSelection) cols.push({ field: '__checkbox_col__' });
        return [...cols, ...orderedColumns];
    }, [orderedColumns, checkboxSelection, hasDetailPanel, rowReordering]);

    const handleColumnResize = useCallback((field: string, newWidth: number) => {
        setColumnWidths(prev => ({ ...prev, [field]: newWidth }));
    }, []);

    const onStateChangeRef = useRef(onStateChange);
    onStateChangeRef.current = onStateChange;

    useEffect(() => {
        if (!onStateChangeRef.current) return;

        const snapshot: GridState = {
            sorting: { sortModel: sortModel as { field: string; sort: 'asc' | 'desc' }[] },
            filter: { filterModel },
            pagination: { paginationModel: effectivePaginationModel },
            columns: {
                columnWidths,
                columnOrder: effectiveColumnOrder,
                columnVisibilityModel,
                pinnedColumns: pinnedColumns,
            },
        };

        onStateChangeRef.current(snapshot);
    }, [
        sortModel,
        filterModel,
        effectivePaginationModel,
        columnWidths,
        effectiveColumnOrder,
        columnVisibilityModel,
        pinnedColumns,
    ]);

    const baseRows = useMemo(() => {
        return effectiveRows;
    }, [effectiveRows]);

    const filteredRows = useMemo(() => {
        if (activeHierarchyHandlers) {

            return (activeHierarchyHandlers.getVisibleRows() || []) as R[];
        }

        if (filterMode === 'server' && dataSource) {
            return baseRows;
        }

        return filterRows(baseRows, filterModel);
    }, [baseRows, filterModel, activeHierarchyHandlers, filterMode, dataSource]);

    const { top: pinnedTopRows, center: unpinnedRows, bottom: pinnedBottomRows } = useMemo(() => {
        if (activeHierarchyHandlers) {

            return { top: [], center: filteredRows, bottom: [] };
        }
        return getPinnedRowGroups(filteredRows, pinnedRows);
    }, [filteredRows, pinnedRows, activeHierarchyHandlers]);

    const sortedUnpinnedRows = useMemo(() => {
        if (activeHierarchyHandlers) {
            return unpinnedRows;
        }

        if (sortingMode === 'server' && dataSource) {
            return unpinnedRows;
        }

        return sortRows(unpinnedRows, sortModel);
    }, [unpinnedRows, sortModel, activeHierarchyHandlers, sortingMode, dataSource]);

    const paginatedUnpinnedRows = useMemo(() => {
        if (!pagination) return sortedUnpinnedRows;

        if (paginationMode === 'server' && dataSource) {
            return sortedUnpinnedRows;
        }

        const start = effectivePaginationModel.page * effectivePaginationModel.pageSize;
        const end = start + effectivePaginationModel.pageSize;
        return sortedUnpinnedRows.slice(start, end);
    }, [sortedUnpinnedRows, pagination, effectivePaginationModel.page, effectivePaginationModel.pageSize, paginationMode, dataSource]);

    useEffect(() => {
        gridData.apiRef.current.getVisibleRows = () => sortedUnpinnedRows;
        gridData.apiRef.current.getVisibleColumns = () => effectiveColumns as any[];
    }, [sortedUnpinnedRows, effectiveColumns, gridData.apiRef]);

    const rowReorderHandlers = useRowReorder({
        rows: pagination ? paginatedUnpinnedRows : sortedUnpinnedRows,
        getRowId: (row) => row.id,
        onRowOrderChange,
        rowReordering
    });

    const allRenderableRows = useMemo(() => {

        if (activeHierarchyHandlers) {
            return unpinnedRows;
        }
        const centerRows = pagination ? paginatedUnpinnedRows : sortedUnpinnedRows;
        const base = [...pinnedTopRows, ...centerRows, ...pinnedBottomRows];

        // Append skeleton rows while an infinite-scroll fetch is in flight
        if (paginationMode === 'infinite' && state.dataSource.loading && base.length > 0) {
            const skeletonCount = Math.min(effectivePaginationModel.pageSize, 20);
            const skeletons = Array.from({ length: skeletonCount }, (_, i) => ({
                id: `__skeleton_${i}__`,
                _isSkeleton: true,
            }));
            return [...base, ...skeletons] as typeof base;
        }

        return base;
    }, [pinnedTopRows, paginatedUnpinnedRows, sortedUnpinnedRows, pinnedBottomRows, pagination,
        activeHierarchyHandlers, unpinnedRows, paginationMode, state.dataSource.loading,
        effectivePaginationModel.pageSize]);

    const spanning = useGridSpanning(
        allRenderableRows,
        navigationColumns,
        columnWidths
    );

    const { aggregationResult } = useAggregation({
        rows: filteredRows,
        aggregationModel,
        isServerSide: !!(dataSource && (paginationMode === 'server' || sortingMode === 'server')),
        dataSource: dataSource as any,
        filterModel,
        sortModel,
        serverAggregationResults,
    });

    const hasAggregation = Object.keys(aggregationModel).length > 0;

    useEffect(() => {
        gridData.apiRef.current.getAggregationResult = () => hasAggregation ? aggregationResult : null;
        gridData.apiRef.current.getAggregationModel = () => hasAggregation ? aggregationModel : null;
    }, [aggregationResult, aggregationModel, hasAggregation, gridData.apiRef]);

    const layout = useMemo(() => {
        const baseRowHeight = rowHeight;

        const unpinnedRows = pagination ? paginatedUnpinnedRows : sortedUnpinnedRows;
        const rowHeights = unpinnedRows.map((row, index) => {
            let height = baseRowHeight;
            if (expandedRowIds.has(row.id)) {
                const detailHeight = getDetailPanelHeight?.({ row, id: row.id, rowIndex: pinnedTopRows.length + index }) ?? 200;
                height += typeof detailHeight === 'number' ? detailHeight : parseInt(String(detailHeight), 10) || 200;
            }
            return height;
        });

        const cumulativeHeights = rowHeights.reduce((acc, height, index) => {
            acc.push((acc[index - 1] || 0) + height);
            return acc;
        }, [] as number[]);

        const skeletonCount = (paginationMode === 'infinite' && state.dataSource.loading && (unpinnedRows.length > 0))
            ? Math.min(effectivePaginationModel.pageSize, 20)
            : 0;
        const skeletonRowsHeight = skeletonCount * baseRowHeight;
        const unpinnedRowsHeight = (cumulativeHeights[cumulativeHeights.length - 1] || 0) + skeletonRowsHeight;
        const pinnedTopHeight = pinnedTopRows.length * baseRowHeight;
        const pinnedBottomHeight = pinnedBottomRows.length * baseRowHeight;

        const rawLeftPinnedCols: GridColDef<R>[] = [];
        const rawRightPinnedCols: GridColDef<R>[] = [];
        const unpinnedCols: GridColDef<R>[] = [];
        const unpinnedColWidths: number[] = [];

        visibleOrderedColumns.forEach(col => {
            const pinned = isColumnPinned(col.field, pinnedColumns);
            if (pinned === 'left') {
                rawLeftPinnedCols.push(col);
            } else if (pinned === 'right') {
                rawRightPinnedCols.push(col);
            } else {
                unpinnedCols.push(col);
            }
        });

        const viewportWidth = state.dimensions.viewportWidth || 1000;
        const systemColumnsWidth = (checkboxSelection ? 48 : 0) + (hasDetailPanel ? 48 : 0) + (rowReordering ? 48 : 0);

        const getColWidth = (c: GridColDef<R>) => columnWidths[c.field] ?? c.width;

        const parseWidth = (width: number | string | undefined): { type: 'fixed' | 'percentage' | 'auto', value: number } => {
            if (width === undefined) return { type: 'auto', value: 0 };
            if (typeof width === 'number') return { type: 'fixed', value: width };
            if (typeof width === 'string') {
                if (width.toLowerCase() === 'auto') return { type: 'auto', value: 0 };
                if (width.endsWith('%')) {
                    const percentage = parseFloat(width);
                    return { type: 'percentage', value: percentage };
                }
                const floatVal = parseFloat(width);
                if (!isNaN(floatVal)) return { type: 'fixed', value: floatVal };
            }
            return { type: 'fixed', value: 100 };
        };

        const leftWidth = rawLeftPinnedCols.reduce((sum, c) => {
            const parsed = parseWidth(getColWidth(c));
            return sum + (parsed.type === 'fixed' ? parsed.value : 100);
        }, 0);
        const rightWidth = rawRightPinnedCols.reduce((sum, c) => {
            const parsed = parseWidth(getColWidth(c));
            return sum + (parsed.type === 'fixed' ? parsed.value : 100);
        }, 0);

        const naturalFlexWidth = unpinnedCols.reduce((sum, col) => {
            if (col.flex && col.flex > 0) {
                const minWidth = col.minWidth ?? 150;
                const width = typeof col.width === 'number' ? col.width : 150;
                return sum + (minWidth || width);
            }
            const parsed = parseWidth(getColWidth(col));
            if (parsed.type === 'fixed') return sum + parsed.value;
            if (parsed.type === 'percentage') return sum + 100;
            return sum + (col.minWidth ?? 150);
        }, 0);

        const availableWidth = Math.max(
            viewportWidth - systemColumnsWidth - leftWidth - rightWidth,
            naturalFlexWidth
        );

        const fixedWidthCols: Array<{ col: GridColDef<R>, width: number }> = [];
        const percentageCols: Array<{ col: GridColDef<R>, percentage: number }> = [];
        const flexCols: Array<{ col: GridColDef<R>, flex: number }> = [];
        let totalFlexUnits = 0;

        unpinnedCols.forEach(col => {
            const parsed = parseWidth(getColWidth(col));

            if (col.flex && col.flex > 0) {
                flexCols.push({ col, flex: col.flex });
                totalFlexUnits += col.flex;
                return;
            }

            if (parsed.type === 'fixed') {
                fixedWidthCols.push({ col, width: parsed.value });
            } else if (parsed.type === 'percentage') {
                percentageCols.push({ col, percentage: parsed.value });
            } else {

                const implicitFlex = 1;
                flexCols.push({ col, flex: implicitFlex });
                totalFlexUnits += implicitFlex;
            }
        });

        const fixedWidth = fixedWidthCols.reduce((sum, { width }) => sum + width, 0);

        let remainingSpaceForFlex = Math.max(0, availableWidth - fixedWidth);

        const percentageWidthMap = new Map<string, number>();
        percentageCols.forEach(({ col, percentage }) => {
            const calculatedWidth = (percentage / 100) * remainingSpaceForFlex;
            percentageWidthMap.set(col.field, calculatedWidth);

            remainingSpaceForFlex -= calculatedWidth;
        });

        remainingSpaceForFlex = Math.max(0, remainingSpaceForFlex);

        const finalFlexWidths = new Map<string, number>();

        const flexItems = flexCols.map(f => ({
            ...f,
            minWidth: f.col.minWidth ?? 50,
            maxWidth: f.col.maxWidth ?? Infinity,
            frozen: false,
            computedWidth: 0
        }));

        const solveFlexAllocation = () => {

            let iterations = 0;
            const maxIterations = flexItems.length * 2;

            while (iterations < maxIterations) {
                iterations++;

                const unfrozen = flexItems.filter(f => !f.frozen);

                if (unfrozen.length === 0) break;

                const unfrozenFlexTotal = unfrozen.reduce((sum, f) => sum + f.flex, 0);

                const frozenWidthTotal = flexItems.reduce((sum, f) => f.frozen ? sum + f.computedWidth : sum, 0);
                const currentFreeSpace = Math.max(0, remainingSpaceForFlex - frozenWidthTotal);

                if (unfrozenFlexTotal <= 0) {
                    unfrozen.forEach(f => {
                        f.computedWidth = f.minWidth;
                        f.frozen = true;
                    });
                    break;
                }

                const pixelsPerFlex = currentFreeSpace / unfrozenFlexTotal;

                let totalViolation = 0;
                const minViolators: typeof flexItems = [];
                const maxViolators: typeof flexItems = [];

                unfrozen.forEach(f => {
                    const rawWidth = pixelsPerFlex * f.flex;

                    if (rawWidth < f.minWidth) {
                        const diff = f.minWidth - rawWidth;
                        totalViolation += diff;
                        minViolators.push(f);
                    } else if (rawWidth > f.maxWidth) {
                        const diff = f.maxWidth - rawWidth;
                        totalViolation += diff;
                        maxViolators.push(f);
                    } else {

                        f.computedWidth = rawWidth;
                    }
                });

                if (minViolators.length === 0 && maxViolators.length === 0) {
                    unfrozen.forEach(f => f.frozen = true);
                    break;
                }

                if (totalViolation > 0) {
                    minViolators.forEach(f => {
                        f.computedWidth = f.minWidth;
                        f.frozen = true;
                    });
                } else if (totalViolation < 0) {
                    maxViolators.forEach(f => {
                        f.computedWidth = f.maxWidth;
                        f.frozen = true;
                    });
                } else {

                    minViolators.forEach(f => { f.computedWidth = f.minWidth; f.frozen = true; });
                    maxViolators.forEach(f => { f.computedWidth = f.maxWidth; f.frozen = true; });
                }
            }
        };

        solveFlexAllocation();
        flexItems.forEach(f => finalFlexWidths.set(f.col.field, f.computedWidth));

        const computedWidthMap = new Map<string, number>();

        unpinnedCols.forEach(col => {
            let computedWidth: number;

            if (finalFlexWidths.has(col.field)) {
                computedWidth = finalFlexWidths.get(col.field)!;
            } else {
                const fixedCol = fixedWidthCols.find(f => f.col.field === col.field);
                const pctCol = percentageCols.find(p => p.col.field === col.field);

                if (fixedCol) {
                    computedWidth = fixedCol.width;
                } else if (pctCol) {
                    const rawPctWidth = percentageWidthMap.get(col.field) || 0;
                    computedWidth = Math.max(col.minWidth ?? 50, rawPctWidth || 100);
                } else {
                    computedWidth = 100;
                }
            }

            unpinnedColWidths.push(computedWidth);
            computedWidthMap.set(col.field, computedWidth);
        });

        const unpinnedColsWithWidth = unpinnedCols.map(col => {
            const flexItem = flexItems.find(f => f.col.field === col.field);
            return {
                ...col,
                width: computedWidthMap.get(col.field) ?? (typeof col.width === 'number' ? col.width : 100),
                flex: flexItem ? flexItem.flex : col.flex
            };
        });

        const baseLeftZ = 11;
        const leftPinnedCols = rawLeftPinnedCols.map((col, i) => {
            const parsed = parseWidth(getColWidth(col));
            const numericWidth = parsed.type === 'fixed' ? parsed.value : 100;
            return {
                ...col,
                width: numericWidth,
                zIndex: baseLeftZ + i
            };
        });

        const baseRightZ = 11;
        const rightPinnedCols = rawRightPinnedCols.map((col, i) => {
            const parsed = parseWidth(getColWidth(col));
            const numericWidth = parsed.type === 'fixed' ? parsed.value : 100;
            return {
                ...col,
                width: numericWidth,
                zIndex: baseRightZ + (rawRightPinnedCols.length - 1 - i)
            };
        });

        const unpinnedTotalWidth = unpinnedColWidths.reduce((sum, w) => sum + w, 0);
        const totalWidth = leftWidth + unpinnedTotalWidth + rightWidth + systemColumnsWidth;

        const unpinnedAccWidths = unpinnedColWidths.reduce((acc, w, i) => {
            acc.push((acc[i - 1] || 0) + w);
            return acc;
        }, [] as number[]);

        return {
            rowHeights,
            cumulativeHeights,
            unpinnedRowsHeight,
            pinnedTopHeight,
            pinnedBottomHeight,
            leftPinnedCols,
            rightPinnedCols,
            unpinnedColsWithWidth,
            unpinnedColWidths,
            unpinnedAccWidths,
            totalWidth,
            leftWidth,
            rightWidth,
            unpinnedTotalWidth,
            systemColumnsWidth,
            pinnedTopRowsLength: pinnedTopRows.length,
            pinnedBottomRowsLength: pinnedBottomRows.length,
            unpinnedRowsLength: unpinnedRows.length
        };
    }, [
        rowHeight,
        pagination,
        paginatedUnpinnedRows,
        sortedUnpinnedRows,
        expandedRowIds,
        getDetailPanelHeight,
        pinnedTopRows.length,
        pinnedBottomRows.length,
        expandedRowIds,
        getDetailPanelHeight,
        pinnedTopRows.length,
        pinnedBottomRows.length,
        visibleOrderedColumns,
        pinnedColumns,
        columnWidths,
        state.dimensions.viewportWidth,
        checkboxSelection,
        hasDetailPanel,
        rowReordering,
        pinCheckboxColumn,
        pinExpandColumn,
        autoHeight,
        paginationMode,
        state.dataSource.loading,
        effectivePaginationModel.pageSize
    ]);

    const virtualization = useMemo(() => {
        const {
            unpinnedAccWidths,
            unpinnedColsWithWidth,
            leftPinnedCols,
            rightPinnedCols,
            totalWidth,
            leftWidth,
            rightWidth,
            unpinnedTotalWidth,
            systemColumnsWidth,
            cumulativeHeights,
            pinnedTopHeight,
            pinnedBottomHeight,
            unpinnedRowsHeight,
            rowHeights,
            unpinnedRowsLength
        } = layout;

        const scrollLeft = state.virtualization.scrollLeft;
        const scrollTop = state.virtualization.scrollTop;
        const viewportWidth = state.dimensions.viewportWidth || 1000;
        const viewportHeight = autoHeight ? (pinnedTopHeight + unpinnedRowsHeight + pinnedBottomHeight + 50) : (state.dimensions.viewportHeight || 600);

        const overscanCols = 6;

        const visibleLocalStart = Math.max(0, scrollLeft - leftWidth);
        const visibleLocalEnd = scrollLeft + viewportWidth - leftWidth;

        let firstUnpinnedIndex = 0;
        let lastUnpinnedIndex = unpinnedColsWithWidth.length - 1;

        let low = 0, high = unpinnedAccWidths.length - 1;
        while (low <= high) {
            const mid = (low + high) >>> 1;
            if (unpinnedAccWidths[mid] < visibleLocalStart) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        firstUnpinnedIndex = Math.max(0, low - overscanCols);

        for (let i = firstUnpinnedIndex; i < unpinnedAccWidths.length; i++) {
            if ((i === 0 ? 0 : unpinnedAccWidths[i - 1]) > visibleLocalEnd) {
                lastUnpinnedIndex = Math.min(unpinnedColsWithWidth.length - 1, i + overscanCols);
                break;
            }
            lastUnpinnedIndex = Math.min(unpinnedColsWithWidth.length - 1, i + overscanCols);
        }

        const leftSpacerWidth = firstUnpinnedIndex > 0 ? unpinnedAccWidths[firstUnpinnedIndex - 1] : 0;
        const rightSpacerWidth = unpinnedTotalWidth - unpinnedAccWidths[lastUnpinnedIndex];

        const virtualColumns: any[] = [
            ...leftPinnedCols,
            ...(leftSpacerWidth > 0 ? [{ field: '__spacer_left__', width: leftSpacerWidth, isSpacer: true }] : []),
            ...unpinnedColsWithWidth.slice(firstUnpinnedIndex, lastUnpinnedIndex + 1),
            ...(rightSpacerWidth > 0 ? [{ field: '__spacer_right__', width: rightSpacerWidth, isSpacer: true }] : []),
            ...rightPinnedCols
        ];

        const hasHorizontalScroll = viewportWidth > 0 && totalWidth > viewportWidth;
        const scrollbarBuffer = hasHorizontalScroll ? 16 : 0;
        const totalHeight = pinnedTopHeight + unpinnedRowsHeight + pinnedBottomHeight + scrollbarBuffer + 2;

        const overscanRows = 5;
        let firstRowIndex = 0;
        let lastRowIndex = unpinnedRowsLength - 1;
        let offsetTop = 0;

        let rLow = 0, rHigh = cumulativeHeights.length - 1;
        while (rLow <= rHigh) {
            const mid = (rLow + rHigh) >>> 1;
            if (cumulativeHeights[mid] < scrollTop) {
                rLow = mid + 1;
            } else {
                rHigh = mid - 1;
            }
        }
        firstRowIndex = Math.max(0, rLow - overscanRows);
        offsetTop = firstRowIndex > 0 ? cumulativeHeights[firstRowIndex - 1] : 0;

        for (let i = firstRowIndex; i < cumulativeHeights.length; i++) {
            if (cumulativeHeights[i] >= scrollTop + viewportHeight) {
                lastRowIndex = Math.min(unpinnedRowsLength - 1, i + overscanRows);
                break;
            }
        }

        return {
            renderContext: {
                firstRowIndex,
                lastRowIndex,
                firstColumnIndex: firstUnpinnedIndex,
                lastColumnIndex: lastUnpinnedIndex
            },
            offsetTop,
            offsetLeft: 0,
            totalHeight,
            pinnedTopHeight,
            pinnedBottomHeight,
            totalWidth,
            rowHeights,
            cumulativeHeights,
            virtualColumns,
            columnMetrics: {
                leftPinnedWidth: leftWidth,
                rightPinnedWidth: rightWidth,
                unpinnedAccWidths,
                unpinnedCols: unpinnedColsWithWidth,
                totalSpecialsWidth: systemColumnsWidth,
                pinnedSpecialsWidth: (rowReordering ? 48 : 0) + (hasDetailPanel && pinExpandColumn ? 48 : 0) + (checkboxSelection && pinCheckboxColumn ? 48 : 0)
            }
        };
    }, [
        layout,
        state.virtualization.scrollTop,
        state.virtualization.scrollLeft,
        state.dimensions.viewportHeight,
        state.dimensions.viewportWidth,
        autoHeight
    ]);

    const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        const target = event.currentTarget;
        setScroll(target.scrollTop, target.scrollLeft);

        if (onRowsScrollEnd) {
            const { scrollTop, scrollHeight, clientHeight } = target;
            const scrollThreshold = 100;

            if (scrollHeight - scrollTop - clientHeight < scrollThreshold) {

                onRowsScrollEnd({
                    visibleTop: scrollTop,
                    visibleBottom: scrollTop + clientHeight,
                    viewportHeight: clientHeight
                });
            }
        }
    }, [setScroll, onRowsScrollEnd]);

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
    }, [selectedRowIds, isSelectionControlled, onRowSelectionModelChange]);

    const handleSelectAll = useCallback((isSelected: boolean) => {
        let newSelection: GridRowId[] = [];
        if (isSelected) {
            newSelection = baseRows.map(row => row.id);
        }

        if (!isSelectionControlled) {
            setInternalRowSelectionModel(newSelection);
        }
        onRowSelectionModelChange?.(newSelection);
    }, [rows, isSelectionControlled, onRowSelectionModelChange]);

    const handleSort = useCallback((field: string, direction: GridSortDirection) => {
        const newSortModel = direction ? [{ field, sort: direction }] : [];

        if (!isSortControlled) {
            setInternalSortModel(newSortModel as any);
        }
        onSortModelChange?.(newSortModel as any);
    }, [isSortControlled, onSortModelChange]);

    const handleCellClick = useCallback((params: GridCellParams<R>) => {
        setKeyboardMode(false);
        setFocusedCell({ id: params.row.id, field: params.field });

        gridRef.current?.focus({ preventScroll: true });
        onCellClick?.(params);
    }, [onCellClick, setKeyboardMode]);

    const prevEditingCellRef = useRef(editingHandlers.editingCell);
    useEffect(() => {
        const wasEditing = Boolean(prevEditingCellRef.current);
        const isEditing = Boolean(editingHandlers.editingCell);

        if (wasEditing && !isEditing) {

            gridRef.current?.focus({ preventScroll: true });
        }

        prevEditingCellRef.current = editingHandlers.editingCell;
    }, [editingHandlers.editingCell]);

    const visibleRows = useMemo(() => {
        const { firstRowIndex, lastRowIndex } = virtualization.renderContext;

        const topPinnedCount = pinnedTopRows.length;

        const topPinned = pinnedTopRows.map((row, index) => ({ row, rowIndex: index }));
        const bottomPinned = pinnedBottomRows.map((row, index) => ({
            row,
            rowIndex: topPinnedCount + (pagination ? paginatedUnpinnedRows.length : sortedUnpinnedRows.length) + index
        }));

        const centerStartIndex = Math.max(0, firstRowIndex - topPinnedCount);
        const centerEndIndex = Math.min(
            pagination ? paginatedUnpinnedRows.length : sortedUnpinnedRows.length,
            lastRowIndex - topPinnedCount + 1
        );

        const centerRows = (pagination ? paginatedUnpinnedRows : sortedUnpinnedRows)
            .slice(centerStartIndex, centerEndIndex)
            .map((row, index) => ({
                row,
                rowIndex: topPinnedCount + centerStartIndex + index
            }));

        const combined = [...topPinned, ...centerRows, ...bottomPinned];

        const seenIds = new Set<GridRowId>();
        const deduplicated = combined.filter(item => {
            if (seenIds.has(item.row.id)) {
                return false;
            }
            seenIds.add(item.row.id);
            return true;
        });

        return deduplicated;
    }, [virtualization.renderContext, pinnedTopRows, pinnedBottomRows, paginatedUnpinnedRows, sortedUnpinnedRows, pagination,
        paginationMode, state.dataSource.loading, effectivePaginationModel.pageSize, rowHeight]);


    const allSelected = rows.length > 0 && selectedRowIds.size === rows.length;
    const someSelected = selectedRowIds.size > 0 && selectedRowIds.size < rows.length;

    const handleFocus = useCallback((event: React.FocusEvent<HTMLDivElement>) => {

        if (event.target === event.currentTarget) {
            setFocusedCell(prev => {
                if (prev) return prev;

                if (checkboxSelection) {
                    return { id: 'HEADER', field: '__checkbox_col__' };
                }

                const firstRow = allRenderableRows[0];
                const firstCol = navigationColumns[0];
                if (firstRow && firstCol) {
                    return { id: firstRow.id, field: firstCol.field };
                }
                return null;
            });
        }
    }, [allRenderableRows, navigationColumns]);

    const handleBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {

        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setFocusedCell(null);
        }
    }, []);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        setKeyboardMode(true);

        if (!focusedCell) return;

        const { id, field } = focusedCell;

        const isEditing = Boolean(editingHandlers.editingCell);

        if (event.key === 'Enter') {
            event.preventDefault();
            if (isEditing) {
                editingHandlers.stopCellEdit();
            } else {

                const col = navigationColumns.find(c => c.field === field);
                if (col?.editable) {
                    const row = allRenderableRows.find(r => r.id === id);
                    if (row) {
                        editingHandlers.startCellEdit({
                            id,
                            field,
                            value: (row as any)[field]
                        });
                    }
                }
            }
            return;
        }

        if (event.key === ' ' || event.key === 'Spacebar') {
            if (!isEditing) {
                if (field === '__checkbox_col__') {
                    event.preventDefault();
                    handleSelectionChange(id, !selectedRowIds.has(id));
                    return;
                }
                if (field === '__expand_col__') {
                    event.preventDefault();
                    handleDetailPanelToggle(id);
                    return;
                }
            }
        }

        if (id === 'HEADER' && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();

            const col = navigationColumns.find(c => c.field === field);
            if (col && (col as any).sortable !== false) {
                const currentSort = sortModel.find(item => item.field === field);
                let newDirection: GridSortDirection = 'asc';

                if (currentSort) {
                    if (currentSort.sort === 'asc') {
                        newDirection = 'desc';
                    } else {
                        newDirection = null;
                    }
                }
                handleSort(field, newDirection);
            }
            return;
        }

        if (event.key === 'Escape') {
            if (isEditing) {
                event.preventDefault();
                editingHandlers.stopCellEdit({ cancel: true });
            }
            return;
        }

        if (isEditing && event.key !== 'Tab') {
            return;
        }

        const isHeader = id === 'HEADER';
        const rowIndex = isHeader ? -1 : allRenderableRows.findIndex(r => r.id === id);
        const colIndex = navigationColumns.findIndex(c => c.field === field);

        if (!isHeader && rowIndex === -1) return;
        if (colIndex === -1) return;

        // Find the next FOCUSABLE cell (any cell — editability not required for arrow navigation)
        const findNextCell = (
            startRow: number,
            startCol: number,
            deltaRow: number,
            deltaCol: number,
            wrapRow: boolean,
            allowHeader: boolean = false
        ) => {
            let r = startRow + deltaRow;
            let c = startCol + deltaCol;

            if (wrapRow && deltaCol !== 0) {
                if (deltaCol > 0 && c >= navigationColumns.length) { c = 0; r++; }
                else if (deltaCol < 0 && c < 0) { c = navigationColumns.length - 1; r--; }
            }

            if (!wrapRow && (c < 0 || c >= navigationColumns.length)) return null;
            if (r < (allowHeader ? -1 : 0) || r >= allRenderableRows.length) return null;

            return { r, c };
        };

        // Find the next EDITABLE cell (for Tab key navigation)
        const findNextEditable = (
            startRow: number,
            startCol: number,
            deltaRow: number,
            deltaCol: number,
            wrapRow: boolean,
            allowHeader: boolean = false
        ) => {
            let r = startRow;
            let c = startCol;
            let steps = 0;

            const maxSteps = allRenderableRows.length * navigationColumns.length + navigationColumns.length;

            while (steps < maxSteps) {
                steps++;

                r += deltaRow;
                c += deltaCol;

                if (wrapRow && deltaCol !== 0) {
                    if (deltaCol > 0) {
                        if (c >= navigationColumns.length) { c = 0; r++; }
                    } else {
                        if (c < 0) { c = navigationColumns.length - 1; r--; }
                    }
                } else {
                    if (c < 0 || c >= navigationColumns.length) return null;
                }

                if (r < -1 || r >= allRenderableRows.length) return null;

                if (r === -1) {
                    if (!allowHeader) continue;
                    const col = navigationColumns[c];
                    const isSortable = (col as any).sortable !== false;
                    const isInteractive = ['__checkbox_col__'].includes(col.field) || isSortable;
                    if (isInteractive) return { r, c };
                    continue;
                }

                const row = allRenderableRows[r];
                const col = navigationColumns[c];

                const isInteractable = ['__checkbox_col__', '__expand_col__', '__reorder_col__'].includes(col.field);
                let isEditable = col.editable || isInteractable;

                if (isCellEditable && !isInteractable) {
                    try {
                        isEditable = isCellEditable({
                            row,
                            field: col.field,
                            value: (row as any)[col.field],
                            colDef: col,
                            rowIndex: r,
                            colIndex: c
                        });
                    } catch (e) {
                        console.error('Error in isCellEditable:', e);
                    }
                }

                if (isEditable) return { r, c };
            }
            return null;
        };

        let nextRowIndex = rowIndex;
        let nextColIndex = colIndex;
        let handled = false;

        if (event.key === 'Tab') {
            // Tab moves to next EDITABLE cell
            const dir = event.shiftKey ? -1 : 1;
            const res = findNextEditable(rowIndex, colIndex, 0, dir, true, false);
            if (res) {
                nextRowIndex = res.r;
                nextColIndex = res.c;
                handled = true;
            }
        } else if (event.key === 'ArrowRight') {
            const res = findNextCell(rowIndex, colIndex, 0, 1, true, true);
            if (res) { nextRowIndex = res.r; nextColIndex = res.c; handled = true; }
        } else if (event.key === 'ArrowLeft') {
            const res = findNextCell(rowIndex, colIndex, 0, -1, true, true);
            if (res) { nextRowIndex = res.r; nextColIndex = res.c; handled = true; }
        } else if (event.key === 'ArrowDown') {
            const res = findNextCell(rowIndex, colIndex, 1, 0, false, true);
            if (res) { nextRowIndex = res.r; nextColIndex = res.c; handled = true; }
        } else if (event.key === 'ArrowUp') {
            const res = findNextCell(rowIndex, colIndex, -1, 0, false, true);
            if (res) { nextRowIndex = res.r; nextColIndex = res.c; handled = true; }
        } else if (event.key === 'Home') {
            if (event.ctrlKey || event.metaKey) {
                nextRowIndex = -1;
                nextColIndex = 0;
            } else {
                nextColIndex = 0;
            }
            handled = true;
        } else if (event.key === 'End') {
            if (event.ctrlKey || event.metaKey) {
                nextRowIndex = allRenderableRows.length - 1;
                nextColIndex = navigationColumns.length - 1;
            } else {
                nextColIndex = navigationColumns.length - 1;
            }
            handled = true;
        } else if (event.key === 'PageUp') {
            const pageSize = pagination ? effectivePaginationModel.pageSize : 10;
            nextRowIndex = Math.max(-1, nextRowIndex - pageSize);
            handled = true;
        } else if (event.key === 'PageDown') {
            const pageSize = pagination ? effectivePaginationModel.pageSize : 10;
            nextRowIndex = Math.min(allRenderableRows.length - 1, nextRowIndex + pageSize);
            handled = true;
        }

        if (handled) {
            event.preventDefault();

            if (isEditing && event.key === 'Tab') {
                editingHandlers.stopCellEdit();
            }

            if (nextRowIndex >= -1 && nextRowIndex < allRenderableRows.length &&
                nextColIndex >= 0 && nextColIndex < navigationColumns.length) {

                const nextCol = navigationColumns[nextColIndex];

                if (nextRowIndex === -1) {
                    setFocusedCell({ id: 'HEADER', field: nextCol.field });
                } else {
                    const nextRow = allRenderableRows[nextRowIndex];
                    setFocusedCell({ id: nextRow.id, field: nextCol.field });
                }

                if (viewportRef.current) {
                    const { cumulativeHeights, pinnedTopHeight } = virtualization;
                    const { clientHeight, clientWidth, scrollTop, scrollLeft } = viewportRef.current;

                    const rowTop = nextRowIndex === 0 ? 0 : cumulativeHeights[nextRowIndex - 1];
                    const rowBottom = cumulativeHeights[nextRowIndex];
                    const pinnedOffset = pinnedTopHeight;
                    const visibleTop = scrollTop + pinnedOffset;
                    const visibleBottom = scrollTop + clientHeight;

                    let newScrollTop = scrollTop;
                    if (rowTop < visibleTop) {
                        newScrollTop = Math.max(0, rowTop - pinnedOffset);
                    } else if (rowBottom > visibleBottom) {
                        newScrollTop = rowBottom - clientHeight;
                    }

                    if (newScrollTop !== scrollTop) {
                        viewportRef.current.scrollTop = newScrollTop;
                    }

                    if (virtualization.columnMetrics) {
                        const { leftPinnedWidth, rightPinnedWidth, unpinnedAccWidths, unpinnedCols, totalSpecialsWidth, pinnedSpecialsWidth } = virtualization.columnMetrics;
                        const field = nextCol.field;
                        const unpinnedIndex = unpinnedCols.findIndex((c: any) => c.field === field);

                        if (unpinnedIndex !== -1) {
                            const colLeft = totalSpecialsWidth + leftPinnedWidth + (unpinnedIndex > 0 ? unpinnedAccWidths[unpinnedIndex - 1] : 0);
                            const colRight = totalSpecialsWidth + leftPinnedWidth + unpinnedAccWidths[unpinnedIndex];

                            const visibleStart = scrollLeft + pinnedSpecialsWidth + leftPinnedWidth;
                            const visibleEnd = scrollLeft + clientWidth - rightPinnedWidth;

                            let newScrollLeft = scrollLeft;

                            if (colLeft < visibleStart) {
                                newScrollLeft = Math.max(0, colLeft - pinnedSpecialsWidth - leftPinnedWidth);
                            } else if (colRight > visibleEnd) {
                                newScrollLeft = colRight - clientWidth + rightPinnedWidth;
                            }

                            if (newScrollLeft !== scrollLeft) {
                                viewportRef.current.scrollLeft = newScrollLeft;
                            }
                        }
                    }
                }
            }
        }
    }, [focusedCell, allRenderableRows, navigationColumns, editingHandlers, virtualization, selectedRowIds, handleSelectionChange, handleDetailPanelToggle]);

    const hasRowSpanning = React.useMemo(() => effectiveColumns.some(c => !!c.rowSpan), [effectiveColumns]);
    const [columnsPanelOpen, setColumnsPanelOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Click-outside handler for standalone column panel
    useEffect(() => {
        if (!columnsPanelOpen || slots?.toolbar) return;
        function handleClickOutside(e: MouseEvent) {
            const panel = document.getElementById('ogx-standalone-col-panel');
            if (panel && !panel.contains(e.target as Node)) {
                setColumnsPanelOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [columnsPanelOpen, slots?.toolbar]);

    return (
        <div
            ref={containerRef}
            className={`ogx ${className} ${autoHeight ? 'ogx--auto-height' : ''} ${hasRowSpanning ? 'ogx--row-spanning' : ''} ${listView ? 'ogx--list-view' : ''}`}
            style={{
                ...style,
                height: height ?? style?.height,
                '--ogx-row-height': `${rowHeight}px`,
                '--ogx-header-height': `${headerHeight}px`
            } as any}
            aria-busy={effectiveLoading}
        >
            { }
            {StableToolbar && (() => {
                const toolbarProps = {
                    apiRef: gridData.apiRef,
                    columns: effectiveColumns,
                    aggregationModel,
                    onAggregationModelChange: handleAggregationModelChange,

                    ...(pivotMode ? {
                        pivotModel: currentPivotModel,
                        onPivotModelChange: handlePivotModelChange,
                    } : {}),

                    filterModel,
                    onFilterModelChange,

                    columnVisibilityModel,
                    onColumnVisibilityModelChange: handleColumnVisibilityModelChange,

                    forceColumnsOpen: columnsPanelOpen,
                    onColumnsPanelClose: () => setColumnsPanelOpen(false),

                    ...slotProps?.toolbar,
                };
                return <StableToolbar {...toolbarProps} />;
            })()}

            {/* Fallback standalone column panel when no toolbar is present */}
            {!slots?.toolbar && columnsPanelOpen && ReactDOM.createPortal(
                <div
                    id="ogx-standalone-col-panel"
                    style={(() => {
                        const rect = containerRef.current?.getBoundingClientRect();
                        return {
                            position: 'fixed',
                            top: rect ? rect.top + 8 : 16,
                            right: rect ? window.innerWidth - rect.right + 8 : 16,
                            zIndex: 9999,
                            display: 'inline-block',
                        };
                    })()}
                >
                    <button
                        onClick={() => setColumnsPanelOpen(false)}
                        style={{
                            position: 'absolute',
                            top: -12,
                            right: -12,
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#334155',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: 14,
                            lineHeight: 1,
                            zIndex: 1,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                        }}
                        aria-label="Close"
                    >×</button>
                    <ColumnVisibilityPanel
                        columns={effectiveColumns}
                        visibleColumns={new Set(
                            effectiveColumns
                                .filter(col => columnVisibilityModel[col.field] !== false)
                                .map(col => col.field)
                        )}
                        onVisibilityChange={(field, isVisible) => {
                            handleColumnVisibilityModelChange({ ...columnVisibilityModel, [field]: isVisible });
                        }}
                        onShowAll={() => {
                            const next = { ...columnVisibilityModel };
                            effectiveColumns.forEach(col => { if (col.hideable !== false) next[col.field] = true; });
                            handleColumnVisibilityModelChange(next);
                        }}
                        onHideAll={() => {
                            const next = { ...columnVisibilityModel };
                            effectiveColumns.forEach(col => { if (col.hideable !== false) next[col.field] = false; });
                            handleColumnVisibilityModelChange(next);
                        }}
                    />
                </div>,
                document.body
            )}

            {/* ═══════════════════════════════════════════════════════════════
                LIST VIEW — single-column card layout
            ═══════════════════════════════════════════════════════════════ */}
            {listView && listViewColumn && (
                <div
                    className="ogx-list-view"
                    role="grid"
                    aria-label={ariaLabel || 'Data grid list view'}
                    aria-rowcount={allRenderableRows.length + 1}
                >
                    {/* Info bar */}
                    <div className="ogx-list-view__toolbar">
                        <span>
                            {filteredRows.length} {filteredRows.length === 1 ? 'item' : 'items'}
                            {pagination ? ` · page ${effectivePaginationModel.page + 1} of ${Math.ceil(filteredRows.length / effectivePaginationModel.pageSize) || 1}` : ''}
                            {selectedRowIds.size > 0 ? ` · ${selectedRowIds.size} selected` : ''}
                        </span>
                    </div>

                    {/* Scrollable rows — pagination stays OUTSIDE this div */}
                    <div className="ogx-list-view__rows">
                        {allRenderableRows.length === 0 ? (
                            <div className="ogx-list-view__empty" aria-live="polite" role="status">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M3 9h18M9 21V9" />
                                </svg>
                                {noRowsLabel}
                            </div>
                        ) : (
                            allRenderableRows.map((row, idx) => (
                                <ListViewRow<R>
                                    key={row.id}
                                    row={row as R}
                                    rowIndex={idx}
                                    listViewColumn={listViewColumn as any}
                                    isSelected={selectedRowIds.has(row.id)}
                                    checkboxSelection={checkboxSelection}
                                    rowHeight={rowHeight}
                                    onRowClick={(r) => handleRowClick({ row: r, id: r.id, rowIndex: idx })}
                                    onSelectionChange={handleSelectionChange}
                                />
                            ))
                        )}
                    </div>

                    {/* Pagination in list view — use filteredRows.length as total since state.pagination.rowCount is only set for server-side */}
                    {pagination && (() => {
                        const PaginationComponent = slots?.pagination || Pagination;
                        const totalRowCount = (paginationMode === 'server' && dataSource)
                            ? (state.pagination.rowCount || 0)
                            : filteredRows.length;
                        const paginationProps = {
                            page: effectivePaginationModel.page,
                            pageSize: effectivePaginationModel.pageSize,
                            rowCount: totalRowCount,
                            pageSizeOptions: pageSizeOptions,
                            onPageChange: (newPage: number) => handlePaginationModelChange({ ...effectivePaginationModel, page: newPage }),
                            onPageSizeChange: (newPageSize: number) => handlePaginationModelChange({ ...effectivePaginationModel, pageSize: newPageSize, page: 0 }),
                            ...slotProps?.pagination
                        };
                        return <PaginationComponent {...paginationProps} />;
                    })()}
                </div>
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
                            allColumns={effectiveColumns as any}
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
                            <div className="ogx__empty" style={{ width: virtualization.totalWidth }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <path d="M3 9h18M9 21V9" />
                                </svg>
                                <span>{noRowsLabel}</span>
                            </div>
                        )}

                        { }
                        {pinnedTopRows.length > 0 && (
                            <div className="ogx__pinned-rows ogx__pinned-rows--top" role="rowgroup">
                                {pinnedTopRows.map((row, index) => (
                                    <Row
                                        key={row.id}
                                        row={row}
                                        columns={virtualization.virtualColumns}
                                        rowIndex={index}
                                        isSelected={selectedRowIds.has(row.id)}
                                        checkboxSelection={checkboxSelection}
                                        onRowClick={handleRowClick}
                                        onCellClick={handleCellClick}
                                        onSelectionChange={handleSelectionChange}
                                        columnWidths={columnWidths}
                                        pinnedColumns={pinnedColumns}
                                        pinnedRows={pinnedRows}

                                        hasDetailPanel={hasDetailPanel}
                                        isDetailPanelExpanded={expandedRowIds.has(row.id)}
                                        detailPanelContent={getDetailPanelContent ? getDetailPanelContent({ row, id: row.id, rowIndex: index }) : null}
                                        detailPanelHeight={getDetailPanelHeight?.({ row, id: row.id, rowIndex: index }) || 200}
                                        onDetailPanelToggle={handleDetailPanelToggle}
                                        pinCheckboxColumn={pinCheckboxColumn}
                                        pinExpandColumn={pinExpandColumn}

                                        focusedCellField={focusedCell?.id === row.id ? focusedCell.field : null}

                                        colspanMap={spanning.colspanMap}
                                        rowSpanningCaches={spanning.rowSpanningState.caches}
                                        rowHeight={rowHeight}
                                    />
                                ))}
                            </div>
                        )}

                        { }
                        <div
                            className="ogx__virtual-container"
                            style={{
                                height: `${virtualization.totalHeight - virtualization.pinnedTopHeight - virtualization.pinnedBottomHeight}px`
                            }}
                            role="presentation"
                        >
                            { }
                            <div
                                className="ogx__rows"
                                style={{
                                    transform: `translateY(${virtualization.renderContext.firstRowIndex * rowHeight}px)`
                                }}
                                role="rowgroup"
                            >
                                {effectiveLoading && visibleRows.length === 0 ? (

                                    (() => {

                                        const skeletonColumns = columns.length > 0
                                            ? columns
                                            : (() => {

                                                const availableWidth = (state.dimensions.viewportWidth || 1000) -
                                                    (checkboxSelection ? 48 : 0) -
                                                    (getDetailPanelContent ? 48 : 0) -
                                                    (rowReordering ? 48 : 0);

                                                const columnWidth = 150;
                                                const columnCount = Math.max(1, Math.ceil(availableWidth / columnWidth));

                                                return Array.from({ length: columnCount }, (_, i) => ({
                                                    field: `placeholder_${i}`,
                                                    headerName: '',
                                                    width: columnWidth
                                                }));
                                            })();

                                        return Array.from({ length: 10 }).map((_, index) => (
                                            <SkeletonRow
                                                key={`skeleton-${index}`}
                                                columns={skeletonColumns}
                                                rowHeight={rowHeight}
                                                checkboxSelection={checkboxSelection}
                                                hasDetailPanel={!!getDetailPanelContent}
                                                rowReordering={rowReordering}
                                            />
                                        ));
                                    })()
                                ) : (
                                    visibleRows
                                        .filter(({ row }) => !isRowPinned(row.id, pinnedRows))
                                        // Defensive deduplication to prevent React key collision
                                        .filter((item, index, self) =>
                                            index === self.findIndex(t => t.row.id === item.row.id)
                                        )
                                        .map(({ row, rowIndex: actualIndex }) => {
                                            return (
                                                <Row
                                                    key={`${row.id}-${virtualization.totalWidth}`}
                                                    row={row}
                                                    columns={virtualization.virtualColumns}
                                                    rowIndex={actualIndex}
                                                    isSelected={selectedRowIds.has(row.id)}
                                                    checkboxSelection={checkboxSelection}
                                                    onRowClick={handleRowClick}
                                                    onCellClick={handleCellClick}
                                                    onSelectionChange={handleSelectionChange}
                                                    columnWidths={columnWidths}
                                                    pinnedColumns={pinnedColumns}
                                                    pinnedRows={pinnedRows}
                                                    // Detail Panel
                                                    hasDetailPanel={hasDetailPanel}
                                                    isDetailPanelExpanded={expandedRowIds.has(row.id)}
                                                    detailPanelContent={getDetailPanelContent ? getDetailPanelContent({ row, id: row.id, rowIndex: actualIndex }) : null}
                                                    detailPanelHeight={getDetailPanelHeight?.({ row, id: row.id, rowIndex: actualIndex }) || 200}
                                                    onDetailPanelToggle={handleDetailPanelToggle}
                                                    pinCheckboxColumn={pinCheckboxColumn}
                                                    pinExpandColumn={pinExpandColumn}
                                                    // Row Reordering
                                                    rowReordering={rowReordering}
                                                    onDragStart={rowReorderHandlers.onDragStart}
                                                    onDragOver={rowReorderHandlers.onDragOver}
                                                    onDragEnd={rowReorderHandlers.onDragEnd}
                                                    onDrop={rowReorderHandlers.onDrop}
                                                    isDragging={rowReorderHandlers.draggedRowId === row.id}
                                                    isDragOver={rowReorderHandlers.dragOverRowId === row.id}
                                                    // Editing
                                                    editingCell={editingHandlers.editingCell}
                                                    onEditStart={editingHandlers.startCellEdit}
                                                    onEditStop={editingHandlers.stopCellEdit}
                                                    onEditCellValueChange={editingHandlers.setEditCellValue}
                                                    // Focus
                                                    focusedCellField={focusedCell != null && focusedCell.id === row.id ? focusedCell.field : null}
                                                    // Spanning
                                                    colspanMap={spanning.colspanMap}
                                                    rowSpanningCaches={spanning.rowSpanningState.caches}
                                                    rowHeight={rowHeight}
                                                />
                                            );
                                        })
                                )}

                                {/* Infinite Scroll Skeletons (Inline with flow, inside translateY container) */}
                                {paginationMode === 'infinite' && state.dataSource.loading && sortedUnpinnedRows.length > 0 && (() => {
                                    const skeletonCount = Math.min(effectivePaginationModel.pageSize, 20);
                                    // The virtual container translates its children down by `firstRowIndex * rowHeight`. 
                                    // Since these skeletons are at the VERY BOTTOM of all rows, their actual array index
                                    // is precisely after the last real row.
                                    const startIdx = layout.unpinnedRowsLength;

                                    // However, they are rendered INSIDE the translateY block. The real rows handled this nicely
                                    // because they just layout one after another. Skeletons can do exactly the same, EXCEPT we might
                                    // need to offset them so they sit at the bottom.
                                    return (
                                        <div className="ogx__skeleton-group">
                                            {Array.from({ length: skeletonCount }).map((_, i) => (
                                                <Row
                                                    key={`__skeleton_${i}__`}
                                                    row={{ id: `__skeleton_${i}__`, _isSkeleton: true } as any}
                                                    columns={virtualization.virtualColumns}
                                                    rowIndex={startIdx + i}
                                                    rowHeight={rowHeight}
                                                />
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>

                        </div>

                        {/* Pinned Bottom Rows */}
                        {pinnedBottomRows.length > 0 && (
                            <div className="ogx__pinned-rows ogx__pinned-rows--bottom" role="rowgroup">
                                {pinnedBottomRows.map((row, index) => (
                                    <Row
                                        key={row.id}
                                        row={row}
                                        columns={virtualization.virtualColumns}
                                        rowIndex={index}
                                        isSelected={selectedRowIds.has(row.id)}
                                        checkboxSelection={checkboxSelection}
                                        onRowClick={handleRowClick}
                                        onCellClick={handleCellClick}
                                        onSelectionChange={handleSelectionChange}
                                        columnWidths={columnWidths}
                                        pinnedColumns={pinnedColumns}
                                        pinnedRows={pinnedRows}
                                        // Detail Panel
                                        hasDetailPanel={hasDetailPanel}
                                        isDetailPanelExpanded={expandedRowIds.has(row.id)}
                                        detailPanelContent={getDetailPanelContent ? getDetailPanelContent({ row, id: row.id, rowIndex: index }) : null}
                                        detailPanelHeight={getDetailPanelHeight?.({ row, id: row.id, rowIndex: index }) || 200}
                                        onDetailPanelToggle={handleDetailPanelToggle}
                                        pinCheckboxColumn={pinCheckboxColumn}
                                        pinExpandColumn={pinExpandColumn}
                                        // Focus
                                        focusedCellField={focusedCell?.id === row.id ? focusedCell.field : null}
                                        // Spanning
                                        colspanMap={spanning.colspanMap}
                                        rowSpanningCaches={spanning.rowSpanningState.caches}
                                        rowHeight={rowHeight}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Aggregation Footer Row */}
                        {hasAggregation && (
                            <div
                                className="ogx__aggregation-footer"
                                role="row"
                                aria-label="Aggregation totals"
                                aria-live="polite"
                                style={{
                                    minHeight: `${rowHeight}px`
                                }}
                            >
                                {checkboxSelection && (
                                    <div style={{ width: 48, flexShrink: 0 }} />
                                )}
                                {hasDetailPanel && (
                                    <div style={{ width: 48, flexShrink: 0 }} />
                                )}
                                {rowReordering && (
                                    <div style={{ width: 48, flexShrink: 0 }} />
                                )}
                                {orderedColumns.map((col) => {
                                    const fnName = (aggregationModel as Record<string, string>)[col.field];
                                    const rawValue = aggregationResult[col.field];
                                    const colWidth = columnWidths[col.field] ?? (typeof col.width === 'number' ? col.width : 120);

                                    return (
                                        <div
                                            key={col.field}
                                            className="ogx__aggregation-cell"
                                            role="gridcell"
                                            style={{
                                                width: colWidth,
                                                minWidth: colWidth,
                                                maxWidth: colWidth,
                                                textAlign: (col.align as React.CSSProperties['textAlign']) || 'left',
                                            }}
                                        >
                                            {fnName ? (
                                                <>
                                                    <span className="ogx__aggregation-label">
                                                        {fnName}
                                                    </span>
                                                    <span className="ogx__aggregation-value">
                                                        {formatAggregationValue(rawValue, fnName)}
                                                    </span>
                                                </>
                                            ) : null}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* Pagination — shared between grid and list view when not inside list view block */}
            {!listView && pagination && (() => {
                const PaginationComponent = slots?.pagination || Pagination;
                const paginationProps = {
                    page: effectivePaginationModel.page,
                    pageSize: effectivePaginationModel.pageSize,
                    rowCount: state.pagination.rowCount,
                    pageSizeOptions: pageSizeOptions,
                    onPageChange: (newPage: number) => handlePaginationModelChange({ ...effectivePaginationModel, page: newPage }),
                    onPageSizeChange: (newPageSize: number) => handlePaginationModelChange({ ...effectivePaginationModel, pageSize: newPageSize, page: 0 }),
                    ...slotProps?.pagination
                };

                return <PaginationComponent {...paginationProps} />;
            })()}

            {/* Accessibility Live Region */}
            <div className="ogx-aria-live-status" role="status" aria-live="polite">
                {effectiveLoading ? 'Loading data...' : ''}
                {state.dataSource.error ? `Error: ${state.dataSource.error.message || 'Unknown error'}` : ''}
                {!loading && !state.dataSource.error && (
                    filteredRows.length === 0
                        ? noRowsLabel
                        : (filterModel && ((filterModel.quickFilterValues?.length || 0) > 0 || (filterModel.items?.length || 0) > 0))
                            ? `${filteredRows.length} ${filteredRows.length === 1 ? 'row' : 'rows'} found`
                            : ''
                )}
            </div>

            {state.dataSource.error && (
                <div className="ogx-error-overlay" aria-live="assertive" role="alert">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--ogx-color-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div className="ogx-error-overlay__title">
                        Oops! Something went wrong
                    </div>
                    <div className="ogx-error-overlay__message">
                        {state.dataSource.error.message || 'An unexpected error occurred while loading the data.'}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="ogx-button ogx-button--primary"
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}
