import React from 'react';
import { Header, type HeaderProps } from '../Header/Header';
import { GridPinnedRows, type GridPinnedRowsProps } from './GridPinnedRows';
import { GridVirtualRows, type GridVirtualRowsProps } from './GridVirtualRows';
import { GridEmptyState } from './GridEmptyState';
import { GridAggregationFooter } from './GridAggregationFooter';
import { useGridLocale } from './gridLocaleContext';
import type { GridAggregationModel, GridAggregationResult, GridColDef, GridColumnPinning, GridRowId, GridRowModel } from '../../types';
import type { GridAriaRowLayout } from '../../utils/aria';
import type { UseGridCellSelectionReturn } from '../../hooks/core/useGridCellSelection';
import type { UseGridKeyboardNavigationReturn } from '../../hooks/core/useGridKeyboardNavigation';
import type { UseGridRowSelectionReturn } from '../../hooks/core/useGridRowSelection';
import type { UseGridColumnsPanelResult } from '../../hooks/core/useGridColumnsPanel';
import type { UseGridViewportResult } from '../../hooks/core/useGridViewport';
import type { GridVirtualizationResult } from '../../hooks/core/useGridVirtualization';
import type { UseColumnReorderReturn } from '../../hooks/useColumnReorder';
import type { GridSpanningResult } from '../../hooks/features/useGridSpanning';
import { untypedColumns } from '../../utils/untypedColumns';

/** The props the row renderers (top-pinned, centre and bottom-pinned rows) all take. */
export type GridRowRenderProps<R extends GridRowModel> = Pick<GridVirtualRowsProps<R>,
    'rowReordering' | 'columnIndexMap' | 'editingHandlers' | 'isCellEditable' | 'selectedRowIds' | 'checkboxSelection' |
    'onRowClick' | 'onRowDoubleClick' | 'onCellClick' | 'onSelectionChange' | 'columnWidths' | 'pinnedColumns' |
    'hasDetailPanel' | 'expandedRowIds' | 'getDetailPanelContent' | 'getDetailPanelHeight' | 'onDetailPanelToggle' |
    'onDetailPanelHeightChange' | 'pinCheckboxColumn' | 'pinExpandColumn' | 'focusedCell' | 'colspanMap' |
    'rowSpanningCaches' | 'rowHeight' | 'rowMetaMap' | 'cellRange' | 'cellRangeHasRowSpan' | 'fillHandle'>;

/** Named after the `DataGrid` values they carry. */
export interface GridViewportProps<R extends GridRowModel> {
    // The viewport element
    setViewportElement: UseGridViewportResult['setViewportElement'];
    handleScroll: UseGridViewportResult['handleScroll'];
    ariaLabel: string | undefined;
    ariaRows: GridAriaRowLayout;
    navigationColumnCount: number;
    rowSelectionEnabled: boolean;
    disableMultipleRowSelection: boolean;
    cellSelection: UseGridCellSelectionReturn;
    effectiveLoading: boolean;
    viewportTabIndex: number;
    setKeyboardMode: (on: boolean) => void;
    handleMouseDownCapture: UseGridKeyboardNavigationReturn['handleMouseDownCapture'];
    handleKeyDown: UseGridKeyboardNavigationReturn['handleKeyDown'];
    handleFocus: UseGridKeyboardNavigationReturn['handleFocus'];
    handleBlur: UseGridKeyboardNavigationReturn['handleBlur'];
    effectivePinnedColumns: GridColumnPinning;
    virtualization: GridVirtualizationResult<R>;
    // Header
    renderColumns: GridColDef<R>[];
    renderedDataColumns: GridColDef<R>[];
    columnGroupingModel: HeaderProps<R>['columnGroupingModel'];
    checkboxSelection: boolean;
    rowSelection: UseGridRowSelectionReturn;
    sortModel: HeaderProps<R>['sortModel'];
    handleSort: HeaderProps<R>['onSort'];
    handleSortAdd: HeaderProps<R>['onSortAdd'];
    multiSort: boolean;
    handleColumnResize: HeaderProps<R>['onColumnResize'];
    handleColumnAutosize: HeaderProps<R>['onColumnAutosize'];
    columnWidths: Record<string, number>;
    focusedCell: UseGridKeyboardNavigationReturn['focusedCell'];
    columnIndexMap: Map<string, number>;
    handleHeaderClick: HeaderProps<R>['onHeaderClick'];
    headerReorderHandlers: UseColumnReorderReturn;
    rowReordering: boolean;
    hasDetailPanel: boolean;
    pinCheckboxColumn: boolean;
    pinExpandColumn: boolean;
    aggregationModel: GridAggregationModel;
    handleHideColumn: HeaderProps<R>['onHideColumn'];
    columnsPanel: UseGridColumnsPanelResult;
    handlePinColumn: HeaderProps<R>['onPinColumn'];
    wrapHeaderText: boolean;
    headerHeight: number;
    showHeaderFilters: boolean;
    filterModel: HeaderProps<R>['filterModel'];
    handleFilterModelChange: HeaderProps<R>['onFilterModelChange'];
    localeText: HeaderProps<R>['localeText'];
    // Rows
    editingHandlers: GridRowRenderProps<R>['editingHandlers'];
    isCellEditable: GridRowRenderProps<R>['isCellEditable'];
    selectedRowIds: GridRowRenderProps<R>['selectedRowIds'];
    handleRowClick: GridRowRenderProps<R>['onRowClick'];
    onRowDoubleClick: GridRowRenderProps<R>['onRowDoubleClick'];
    handleCellClick: GridRowRenderProps<R>['onCellClick'];
    handleSelectionChange: GridRowRenderProps<R>['onSelectionChange'];
    expandedRowIds: GridRowRenderProps<R>['expandedRowIds'];
    getDetailPanelContent: GridRowRenderProps<R>['getDetailPanelContent'];
    getDetailPanelHeight: GridRowRenderProps<R>['getDetailPanelHeight'];
    handleDetailPanelToggle: GridRowRenderProps<R>['onDetailPanelToggle'];
    reportDetailPanelHeight: GridRowRenderProps<R>['onDetailPanelHeightChange'];
    spanning: Pick<GridSpanningResult, 'colspanMap' | 'rowSpanningCaches'>;
    rowMetaMap: GridRowRenderProps<R>['rowMetaMap'];
    fillHandle: { handle: GridRowRenderProps<R>['fillHandle'] };
    pinnedTopRows: R[];
    pinnedBottomRows: R[];
    pinnedRows: GridPinnedRowsProps<R>['pinnedRows'];
    getRowIdOf: (row: R) => GridRowId;
    showEmptyState: boolean;
    effectiveNoRowsLabel: string;
    noRowsOverlay: React.ReactNode;
    loadingOverlay: React.ReactNode;
    spanRowWindow: { renderContext: { lastRowIndex: number }; offsetTop: number };
    visibleRows: GridVirtualRowsProps<R>['visibleRows'];
    baseColumns: GridColDef<R>[];
    viewportWidth: number;
    rowReorderHandlers: GridVirtualRowsProps<R>['rowReorderHandlers'];
    paginationMode: GridVirtualRowsProps<R>['paginationMode'];
    dataSourceLoading: boolean;
    sortedUnpinnedRowCount: number;
    pageSize: number;
    unpinnedRowsLength: number;
    // Aggregation footer
    showAggregationFooter: boolean;
    aggregationResult: GridAggregationResult;
    effectiveRowHeight: number;
    isAggregationLoading: boolean;
}

/**
 * The standard (non-list) view: the scrolling `role="grid"` viewport with the header, pinned rows, the
 * empty state, the virtual centre rows and the aggregation footer.
 */
export function GridViewport<R extends GridRowModel>(props: GridViewportProps<R>) {
    const locale = useGridLocale();
    const {
        setViewportElement, handleScroll, ariaLabel, ariaRows, navigationColumnCount, rowSelectionEnabled,
        disableMultipleRowSelection, cellSelection, effectiveLoading, viewportTabIndex, setKeyboardMode,
        handleMouseDownCapture, handleKeyDown, handleFocus, handleBlur, effectivePinnedColumns, virtualization,
        renderColumns, renderedDataColumns, columnGroupingModel, checkboxSelection, rowSelection, sortModel, handleSort,
        handleSortAdd, multiSort, handleColumnResize, handleColumnAutosize, columnWidths, focusedCell, columnIndexMap,
        handleHeaderClick, headerReorderHandlers, rowReordering, hasDetailPanel, pinCheckboxColumn, pinExpandColumn,
        aggregationModel, handleHideColumn, columnsPanel, handlePinColumn, wrapHeaderText, headerHeight, showHeaderFilters,
        filterModel, handleFilterModelChange, localeText, editingHandlers, isCellEditable, selectedRowIds, handleRowClick,
        onRowDoubleClick, handleCellClick, handleSelectionChange, expandedRowIds, getDetailPanelContent, getDetailPanelHeight,
        handleDetailPanelToggle, reportDetailPanelHeight, spanning, rowMetaMap, fillHandle, pinnedTopRows, pinnedBottomRows, pinnedRows,
        getRowIdOf, showEmptyState, effectiveNoRowsLabel, noRowsOverlay, loadingOverlay, spanRowWindow, visibleRows,
        baseColumns, viewportWidth, rowReorderHandlers, paginationMode, dataSourceLoading, sortedUnpinnedRowCount,
        pageSize, unpinnedRowsLength, showAggregationFooter, aggregationResult, effectiveRowHeight, isAggregationLoading,
    } = props;
    const { allSelected, someSelected } = rowSelection;

    // Props the row renderers (top-pinned, centre and bottom-pinned rows) all take.
    const rowRenderProps: GridRowRenderProps<R> = {
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

    return (
        <div
            ref={setViewportElement}
            className="ogx__viewport"
            onScroll={handleScroll}
            role="grid"
            aria-label={ariaLabel || locale.gridLabel}
            aria-rowcount={ariaRows.rowCount}
            aria-colcount={navigationColumnCount}
            aria-multiselectable={(rowSelectionEnabled && !disableMultipleRowSelection) || cellSelection.enabled}
            aria-busy={effectiveLoading}
            tabIndex={viewportTabIndex}
            onKeyDownCapture={() => { setKeyboardMode(true); }}
            onMouseDownCapture={handleMouseDownCapture}
            onMouseDown={cellSelection.handleMouseDown}
            onClickCapture={cellSelection.handleClickCapture}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
        >
            <div
                className="ogx__content"
                style={{
                    // With right-pinned columns the content spans at least the viewport, so they sit at its right edge.
                    width: effectivePinnedColumns?.right?.length
                        ? `max(100%, ${virtualization.totalWidth}px)`
                        : virtualization.totalWidth
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
                        onColumnAutosize={handleColumnAutosize}
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
                        wrapHeaderText={wrapHeaderText}
                        headerHeight={headerHeight}
                        headerFilters={showHeaderFilters}
                        filterModel={filterModel}
                        onFilterModelChange={handleFilterModelChange}
                        onOpenFilterPanel={columnsPanel.openFiltersPanel}
                        localeText={localeText}
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
                {showEmptyState && (
                    <GridEmptyState
                        noRowsLabel={effectiveNoRowsLabel}
                        width={virtualization.totalWidth}
                        overlay={noRowsOverlay}
                    />
                )}

                <GridVirtualRows<R>
                    {...rowRenderProps}
                    virtualContainerHeight={virtualization.virtualContainerHeight}
                    offsetTop={spanRowWindow.offsetTop}
                    effectiveLoading={effectiveLoading}
                    visibleRows={visibleRows}
                    baseColumns={baseColumns}
                    virtualColumns={renderColumns}
                    viewportWidth={viewportWidth}
                    rowReorderHandlers={rowReorderHandlers}
                    paginationMode={paginationMode}
                    dataSourceLoading={dataSourceLoading}
                    sortedUnpinnedRowCount={sortedUnpinnedRowCount}
                    infiniteScrollSkeletonCount={Math.min(pageSize, 20)}
                    unpinnedRowsLength={unpinnedRowsLength}
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
                    {showAggregationFooter && (
                        <GridAggregationFooter
                            columns={untypedColumns(virtualization.virtualColumns)}
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
    );
}
