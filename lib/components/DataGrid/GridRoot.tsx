import React from 'react';
import { GridToolbarHostContext } from '../../hooks/core/gridToolbarHostContext';
import { GridToolbarSlot } from './GridToolbarSlot';
import { GridAiAssistantArea } from '../AiAssistant/GridAiAssistantArea';
import { GridStandaloneColumnPanel, type GridStandaloneColumnPanelProps } from './GridStandaloneColumnPanel';
import { GridListView, type GridListViewProps } from './GridListView';
import { GridViewport, type GridViewportProps } from './GridViewport';
import { GridCellSelectionStatsArea } from '../CellSelectionStats/GridCellSelectionStatsArea';
import { GridPaginationArea } from './GridPaginationArea';
import { GridLiveRegion } from './GridLiveRegion';
import { GridLoadingOverlay } from './GridLoadingOverlay';
import { GridErrorOverlay } from './GridErrorOverlay';
import { pickPaginationLocaleText } from '../../utils/pagination';
import type { DataGridProps, GridApi, GridColDef, GridRowModel } from '../../types';
import type { UseGridAiAssistantResult } from '../../hooks/features/useGridAiAssistant';
import type { useGridToolbarProps } from '../../hooks/core/useGridToolbarProps';

/**
 * Named after the `DataGrid` values they carry. The viewport's props are passed through to
 * `GridViewport`; the list view, footer and panels read some of them too.
 */
export interface GridRootProps<R extends GridRowModel> extends Omit<GridViewportProps<R>, 'loadingOverlay' | 'noRowsOverlay'> {
    containerRef: React.RefObject<HTMLDivElement | null>;
    className: string;
    autoHeight: boolean;
    height: DataGridProps<R>['height'];
    style: DataGridProps<R>['style'];
    hasRowSpanning: boolean;
    listView: boolean;
    headerFilterHeight: number;
    slots: DataGridProps<R>['slots'];
    slotProps: DataGridProps<R>['slotProps'];
    toolbarProps: ReturnType<typeof useGridToolbarProps>;
    aiAssistantPanel: UseGridAiAssistantResult;
    // Standalone columns panel
    orderedColumns: GridColDef<R>[];
    columnVisibilityModel: GridStandaloneColumnPanelProps<R>['columnVisibilityModel'];
    disableColumnReorder: boolean;
    handleColumnVisibilityModelChange: GridStandaloneColumnPanelProps<R>['onColumnVisibilityChange'];
    moveColumn: GridStandaloneColumnPanelProps<R>['onColumnMove'];
    resetColumnOrder: GridStandaloneColumnPanelProps<R>['onColumnOrderReset'];
    // List view
    listViewColumn: DataGridProps<R>['listViewColumn'];
    allRenderableRows: R[];
    dataRows: R[];
    pagination: boolean;
    effectivePaginationModel: GridListViewProps<R>['effectivePaginationModel'];
    currentPage: number;
    pageSizeOptions: number[];
    columnsByField: GridListViewProps<R>['columnsByField'];
    paginationRowCount: number;
    handlePaginationModelChange: GridListViewProps<R>['onPaginationModelChange'];
    onRowsScrollEnd: GridListViewProps<R>['onRowsScrollEnd'];
    toggleExpansion: GridListViewProps<R>['onToggleExpansion'];
    // Footer and status
    showCellSelectionStats: boolean;
    apiRef: React.MutableRefObject<GridApi>;
    hasAggregation: boolean;
    isHierarchyEnabled: boolean;
    dataSourceError: unknown;
    filteredRowCount: number;
    /** Retries a failed dataSource load; undefined without a dataSource. */
    onRetry: (() => void) | undefined;
}

/**
 * The grid's root element and everything in it: the toolbar, the AI assistant panel, the standalone
 * columns panel, the list view or the viewport, the cell selection stats, the footer slot or the pager,
 * the live region and the loading and error overlays.
 */
export function GridRoot<R extends GridRowModel>(props: GridRootProps<R>) {
    const {
        containerRef, className, autoHeight, height, style, hasRowSpanning, listView, headerFilterHeight, slots, slotProps,
        toolbarProps, aiAssistantPanel, orderedColumns, columnVisibilityModel, disableColumnReorder,
        handleColumnVisibilityModelChange, moveColumn, resetColumnOrder, listViewColumn, allRenderableRows, dataRows,
        pagination, effectivePaginationModel, currentPage, pageSizeOptions, columnsByField,
        paginationRowCount, handlePaginationModelChange,
        onRowsScrollEnd, toggleExpansion, showCellSelectionStats, apiRef, hasAggregation, isHierarchyEnabled,
        dataSourceError, filteredRowCount, onRetry,
        ...viewport
    } = props;
    const {
        effectiveRowHeight, headerHeight, showHeaderFilters, effectiveLoading, columnsPanel, columnGroupingModel, ariaLabel,
        pinnedTopRows, pinnedBottomRows, sortedUnpinnedRowCount, effectiveNoRowsLabel, checkboxSelection, paginationMode,
        localeText, getRowIdOf, rowSelectionEnabled, disableMultipleRowSelection, cellSelection, aggregationModel,
        aggregationResult, filterModel, selectedRowIds, rowMetaMap, handleRowClick, onRowDoubleClick, handleSelectionChange,
    } = viewport;

    const NoRowsOverlaySlot = slots?.noRowsOverlay;
    const LoadingOverlaySlot = slots?.loadingOverlay;
    const loadingOverlay = LoadingOverlaySlot ? <LoadingOverlaySlot {...slotProps?.loadingOverlay} /> : undefined;
    const noRowsOverlay = NoRowsOverlaySlot ? <NoRowsOverlaySlot {...slotProps?.noRowsOverlay} /> : undefined;
    const FooterSlot = slots?.footer;
    // Loading with rows on screen: the rows stay and an indicator runs over them. With no rows the
    // body shows skeletons or the loading overlay instead, and infinite scroll appends skeleton rows.
    const showLoadingOverRows = effectiveLoading && allRenderableRows.length > 0 && paginationMode !== 'infinite';
    const ToolbarSlot = slots?.toolbar;

    return (
        <div
            ref={containerRef}
            className={['ogx', className, autoHeight && 'ogx--auto-height', !autoHeight && height === undefined && style?.height === undefined && 'ogx--fill', hasRowSpanning && 'ogx--row-spanning', listView && 'ogx--list-view'].filter(Boolean).join(' ')}
            style={{
                ...style,
                height: height ?? style?.height,
                '--ogx-row-height': `${effectiveRowHeight}px`,
                '--ogx-header-height': `${headerHeight}px`,
                ...(showHeaderFilters ? { '--ogx-header-filter-height': `${headerFilterHeight}px` } : undefined),
            } as unknown as React.CSSProperties}
            aria-busy={effectiveLoading}
        >
            {ToolbarSlot && toolbarProps && (
                <GridToolbarHostContext.Provider value={columnsPanel.toolbarHost}>
                    <GridToolbarSlot component={ToolbarSlot} toolbarProps={toolbarProps} />
                </GridToolbarHostContext.Provider>
            )}

            {aiAssistantPanel.panelProps && (
                <GridAiAssistantArea
                    panelProps={aiAssistantPanel.panelProps}
                    slot={slots?.aiAssistantPanel}
                    slotProps={slotProps?.aiAssistantPanel}
                />
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
                    dataRowCount={dataRows.length}
                    pinnedTopRowCount={pinnedTopRows.length}
                    pinnedBottomRowCount={pinnedBottomRows.length}
                    unpinnedRowCount={sortedUnpinnedRowCount}
                    pagination={pagination}
                    effectivePaginationModel={effectivePaginationModel}
                    currentPage={currentPage}
                    pageSizeOptions={pageSizeOptions}
                    selectedRowIds={selectedRowIds}
                    listViewColumn={listViewColumn}
                    columnsByField={columnsByField}
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
                    onToggleExpansion={toggleExpansion}
                    loading={effectiveLoading}
                    loadingOverlay={loadingOverlay}
                    noRowsOverlay={noRowsOverlay}
                    showPaginationControls={!FooterSlot}
                />
            )}

            {/* Standard grid viewport (hidden when listView=true) */}
            {!listView && <GridViewport<R> {...viewport} loadingOverlay={loadingOverlay} noRowsOverlay={noRowsOverlay} />}

            {cellSelection.enabled && showCellSelectionStats && (
                <GridCellSelectionStatsArea
                    stats={cellSelection.stats}
                    apiRef={apiRef}
                    slot={slots?.cellSelectionStats}
                    slotProps={slotProps?.cellSelectionStats}
                />
            )}

            {FooterSlot && (
                <FooterSlot
                    apiRef={apiRef}
                    aggregationModel={aggregationModel}
                    aggregationResult={hasAggregation ? aggregationResult : null}
                    rowCount={isHierarchyEnabled && paginationMode !== 'server' ? dataRows.length : paginationRowCount}
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
                    page={currentPage}
                    paginationModel={effectivePaginationModel}
                    rowCount={paginationRowCount}
                    pageSizeOptions={pageSizeOptions}
                    onPaginationModelChange={handlePaginationModelChange}
                    localeText={localeText}
                />
            )}

            <GridLiveRegion
                loading={effectiveLoading}
                error={dataSourceError}
                noRowsLabel={effectiveNoRowsLabel}
                filteredRowCount={filteredRowCount}
                dataRowCount={dataRows.length}
                filterModel={filterModel}
                cellSelectionAnnouncement={cellSelection.announcement}
                aiAssistantAnnouncement={aiAssistantPanel.announcement}
            />

            {showLoadingOverRows && (
                <GridLoadingOverlay overlay={loadingOverlay} />
            )}

            <GridErrorOverlay error={dataSourceError} onRetry={onRetry} />
        </div>
    );
}
