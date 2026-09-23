import React from 'react';
import { Row } from '../Row/Row';
import { SkeletonRow } from '../SkeletonRow';
import { resolveDetailPanelHeight } from '../../utils/detailPanel';
import type {
    GridRowModel,
    GridRowId,
    GridColDef,
    GridRowParams,
    GridCellParams,
    GridColumnPinning,
    GridDetailPanelParams,
    GridDetailPanelHeight,
    GridRowMeta,
} from '../../types';
import type { GridVisibleRow } from '../../hooks/core/useGridVisibleRows';
import type { UseRowReorderReturn } from '../../hooks/useRowReorder';
import type { GridEditingState } from '../../hooks/features/useGridEditing';
import type { CellColSpanInfo, RowSpanningCaches } from '../../hooks/features/useGridSpanning';

interface RowEditingHandlers {
    editingCell: GridEditingState['editingCell'];
    startCellEdit: (params: { id: GridRowId; field: string; value: unknown }) => void;
    stopCellEdit: (params?: { cancel?: boolean; id?: GridRowId; field?: string }) => void;
    setEditCellValue: (params: { id: GridRowId; field: string; value: unknown }) => void;
}

export interface GridVirtualRowsProps<R extends GridRowModel> {
    virtualContainerHeight: number;
    offsetTop: number;
    effectiveLoading: boolean;
    visibleRows: GridVisibleRow<R>[];
    baseColumns: GridColDef<R>[];
    virtualColumns: GridColDef<R>[];
    viewportWidth: number;
    checkboxSelection: boolean;
    hasDetailPanel: boolean;
    rowReordering: boolean;
    rowHeight: number;
    selectedRowIds: Set<GridRowId>;
    onRowClick: (params: GridRowParams<R>) => void;
    onRowDoubleClick?: (params: GridRowParams<R>) => void;
    onCellClick: (params: GridCellParams<R>) => void;
    onSelectionChange: (rowId: GridRowId, isSelected: boolean) => void;
    columnWidths: Record<string, number>;
    pinnedColumns: GridColumnPinning;
    expandedRowIds: Set<GridRowId>;
    getDetailPanelContent?: (params: GridDetailPanelParams<R>) => React.ReactNode;
    getDetailPanelHeight?: (params: GridDetailPanelParams<R>) => GridDetailPanelHeight;
    onDetailPanelToggle: (rowId: GridRowId) => void;
    /** Receives the rendered height of `'auto'` detail panels. */
    onDetailPanelHeightChange?: (rowId: GridRowId, height: number) => void;
    pinCheckboxColumn?: boolean;
    pinExpandColumn?: boolean;
    rowReorderHandlers: UseRowReorderReturn;
    editingHandlers: RowEditingHandlers;
    isCellEditable?: (params: GridCellParams<R>) => boolean;
    focusedCell: { id: GridRowId; field: string } | null;
    colspanMap?: Map<GridRowId, Record<string, CellColSpanInfo>>;
    rowSpanningCaches?: RowSpanningCaches;
    paginationMode: 'client' | 'server' | 'infinite';
    dataSourceLoading: boolean;
    sortedUnpinnedRowCount: number;
    infiniteScrollSkeletonCount: number;
    unpinnedRowsLength: number;
    /** Last center row index in the render window: skeleton rows render only once it reaches the end of the data. */
    lastRenderedRowIndex: number;
    rowMetaMap: Map<GridRowId, GridRowMeta>;
    loadingOverlay?: React.ReactNode;
}

export function GridVirtualRows<R extends GridRowModel>({
    virtualContainerHeight,
    offsetTop,
    effectiveLoading,
    visibleRows,
    baseColumns,
    virtualColumns,
    viewportWidth,
    checkboxSelection,
    hasDetailPanel,
    rowReordering,
    rowHeight,
    selectedRowIds,
    onRowClick,
    onRowDoubleClick,
    onCellClick,
    onSelectionChange,
    columnWidths,
    pinnedColumns,
    expandedRowIds,
    getDetailPanelContent,
    getDetailPanelHeight,
    onDetailPanelToggle,
    onDetailPanelHeightChange,
    pinCheckboxColumn,
    pinExpandColumn,
    rowReorderHandlers,
    editingHandlers,
    isCellEditable,
    focusedCell,
    colspanMap,
    rowSpanningCaches,
    paginationMode,
    dataSourceLoading,
    sortedUnpinnedRowCount,
    infiniteScrollSkeletonCount,
    unpinnedRowsLength,
    lastRenderedRowIndex,
    rowMetaMap,
    loadingOverlay,
}: GridVirtualRowsProps<R>) {
    const skeletonColumns: GridColDef<R>[] = baseColumns.length > 0
        ? baseColumns
        : (() => {
            const availableWidth = (viewportWidth || 1000) -
                (checkboxSelection ? 48 : 0) -
                (hasDetailPanel ? 48 : 0) -
                (rowReordering ? 48 : 0);
            const columnWidth = 150;
            const columnCount = Math.max(1, Math.ceil(availableWidth / columnWidth));
            return Array.from({ length: columnCount }, (_, i) => ({
                field: `placeholder_${i}`,
                headerName: '',
                width: columnWidth,
            })) as GridColDef<R>[];
        })();

    // Pinned rows render in GridPinnedRows; ids are already unique (useGridVisibleRows de-duplicates).
    const centerRows = visibleRows.filter(item => !item.pinned);
    // Placeholders stand in for the next page, after the last data row: only draw them once the
    // render window reaches it, or they would follow the window into the middle of the data.
    const showInfiniteSkeletons = paginationMode === 'infinite' && dataSourceLoading && sortedUnpinnedRowCount > 0
        && lastRenderedRowIndex >= unpinnedRowsLength - 1;

    return (
        <div
            className="ogx__virtual-container"
            style={{ height: `${virtualContainerHeight}px` }}
            role="presentation"
        >
            <div
                className="ogx__rows"
                style={{ transform: `translateY(${offsetTop}px)` }}
                role="rowgroup"
            >
                {effectiveLoading && visibleRows.length === 0 && loadingOverlay ? (
                    <div className="ogx__loading-overlay" style={{ width: viewportWidth || undefined }}>{loadingOverlay}</div>
                ) : effectiveLoading && visibleRows.length === 0 ? (
                    Array.from({ length: 10 }).map((_, index) => (
                        <SkeletonRow
                            key={`skeleton-${index}`}
                            columns={skeletonColumns as unknown as GridColDef[]}
                            rowHeight={rowHeight}
                            checkboxSelection={checkboxSelection}
                            hasDetailPanel={hasDetailPanel}
                            rowReordering={rowReordering}
                        />
                    ))
                ) : (
                    centerRows.map(({ row, rowIndex: actualIndex }) => (
                        <Row<R>
                            key={row.id}
                            row={row}
                            columns={virtualColumns}
                            rowIndex={actualIndex}
                            isSelected={selectedRowIds.has(row.id)}
                            checkboxSelection={checkboxSelection}
                            onRowClick={onRowClick}
                            onRowDoubleClick={onRowDoubleClick}
                            onCellClick={onCellClick}
                            onSelectionChange={onSelectionChange}
                            columnWidths={columnWidths}
                            pinnedColumns={pinnedColumns}
                            hasDetailPanel={hasDetailPanel}
                            isDetailPanelExpanded={expandedRowIds.has(row.id)}
                            detailPanelContent={getDetailPanelContent ? getDetailPanelContent({ row, id: row.id, rowIndex: actualIndex }) : null}
                            detailPanelHeight={resolveDetailPanelHeight(getDetailPanelHeight?.({ row, id: row.id, rowIndex: actualIndex }))}
                            onDetailPanelHeightChange={onDetailPanelHeightChange}
                            onDetailPanelToggle={onDetailPanelToggle}
                            pinCheckboxColumn={pinCheckboxColumn}
                            pinExpandColumn={pinExpandColumn}
                            rowReordering={rowReordering}
                            onDragStart={rowReorderHandlers.onDragStart}
                            onDragOver={rowReorderHandlers.onDragOver}
                            onDragEnd={rowReorderHandlers.onDragEnd}
                            onDrop={rowReorderHandlers.onDrop}
                            isDragging={rowReorderHandlers.draggedRowId === row.id}
                            isDragOver={rowReorderHandlers.dragOverRowId === row.id}
                            editingCell={editingHandlers.editingCell}
                            onEditStart={editingHandlers.startCellEdit}
                            onEditStop={editingHandlers.stopCellEdit}
                            onEditCellValueChange={editingHandlers.setEditCellValue}
                            isCellEditable={isCellEditable}
                            focusedCellField={focusedCell != null && focusedCell.id === row.id ? focusedCell.field : null}
                            colspanMap={colspanMap}
                            rowSpanningCaches={rowSpanningCaches}
                            rowHeight={rowHeight}
                            rowMeta={rowMetaMap.get(row.id)}
                        />
                    ))
                )}

                {showInfiniteSkeletons && (
                    <div className="ogx__skeleton-group">
                        {Array.from({ length: infiniteScrollSkeletonCount }).map((_, i) => (
                            <Row<R>
                                key={`__skeleton_${i}__`}
                                row={{ id: `__skeleton_${i}__`, _isSkeleton: true } as unknown as R}
                                columns={virtualColumns}
                                rowIndex={unpinnedRowsLength + i}
                                rowHeight={rowHeight}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
