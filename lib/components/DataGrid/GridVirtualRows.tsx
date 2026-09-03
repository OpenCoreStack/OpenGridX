import React from 'react';
import { Row } from '../Row/Row';
import { SkeletonRow } from '../SkeletonRow';
import { isRowPinned } from '../../utils/pinning';
import type {
    GridRowModel,
    GridRowId,
    GridColDef,
    GridRowParams,
    GridCellParams,
    GridColumnPinning,
    GridRowPinning,
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
    stopCellEdit: (params?: { cancel?: boolean }) => void;
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
    pinnedRows?: GridRowPinning;
    selectedRowIds: Set<GridRowId>;
    onRowClick: (params: GridRowParams<R>) => void;
    onCellClick: (params: GridCellParams<R>) => void;
    onSelectionChange: (rowId: GridRowId, isSelected: boolean) => void;
    columnWidths: Record<string, number>;
    pinnedColumns: GridColumnPinning;
    expandedRowIds: Set<GridRowId>;
    getDetailPanelContent?: (params: GridDetailPanelParams<R>) => React.ReactNode;
    getDetailPanelHeight?: (params: GridDetailPanelParams<R>) => GridDetailPanelHeight;
    onDetailPanelToggle: (rowId: GridRowId) => void;
    pinCheckboxColumn?: boolean;
    pinExpandColumn?: boolean;
    rowReorderHandlers: UseRowReorderReturn;
    editingHandlers: RowEditingHandlers;
    focusedCell: { id: GridRowId; field: string } | null;
    colspanMap?: Map<GridRowId, Record<string, CellColSpanInfo>>;
    rowSpanningCaches?: RowSpanningCaches;
    paginationMode: 'client' | 'server' | 'infinite';
    dataSourceLoading: boolean;
    sortedUnpinnedRowCount: number;
    infiniteScrollSkeletonCount: number;
    unpinnedRowsLength: number;
    rowMetaMap: Map<GridRowId, GridRowMeta>;
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
    pinnedRows,
    selectedRowIds,
    onRowClick,
    onCellClick,
    onSelectionChange,
    columnWidths,
    pinnedColumns,
    expandedRowIds,
    getDetailPanelContent,
    getDetailPanelHeight,
    onDetailPanelToggle,
    pinCheckboxColumn,
    pinExpandColumn,
    rowReorderHandlers,
    editingHandlers,
    focusedCell,
    colspanMap,
    rowSpanningCaches,
    paginationMode,
    dataSourceLoading,
    sortedUnpinnedRowCount,
    infiniteScrollSkeletonCount,
    unpinnedRowsLength,
    rowMetaMap,
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

    const centerRows = visibleRows
        .filter(({ row }) => !isRowPinned(row.id, pinnedRows))
        .filter((item, index, self) =>
            index === self.findIndex(t => t.row.id === item.row.id)
        );

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
                {effectiveLoading && visibleRows.length === 0 ? (
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
                            onCellClick={onCellClick}
                            onSelectionChange={onSelectionChange}
                            columnWidths={columnWidths}
                            pinnedColumns={pinnedColumns}
                            pinnedRows={pinnedRows}
                            hasDetailPanel={hasDetailPanel}
                            isDetailPanelExpanded={expandedRowIds.has(row.id)}
                            detailPanelContent={getDetailPanelContent ? getDetailPanelContent({ row, id: row.id, rowIndex: actualIndex }) : null}
                            detailPanelHeight={getDetailPanelHeight?.({ row, id: row.id, rowIndex: actualIndex }) || 200}
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
                            focusedCellField={focusedCell != null && focusedCell.id === row.id ? focusedCell.field : null}
                            colspanMap={colspanMap}
                            rowSpanningCaches={rowSpanningCaches}
                            rowHeight={rowHeight}
                            rowMeta={rowMetaMap.get(row.id)}
                        />
                    ))
                )}

                {paginationMode === 'infinite' && dataSourceLoading && sortedUnpinnedRowCount > 0 && (
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
