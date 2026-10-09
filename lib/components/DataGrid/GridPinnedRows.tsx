import React from 'react';
import { Row } from '../Row/Row';
import { DetailPanelContent } from '../DetailPanel/DetailPanelContent';
import { callGetDetailPanelHeight, resolveDetailPanelHeight } from '../../utils/detailPanel';
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
import type { CellColSpanInfo, RowSpanningCaches } from '../../hooks/features/useGridSpanning';
import type { GridDisplayCellRange } from '../../hooks/core/useGridCellSelection';
import { getRowCellRange } from '../../utils/cellSelection';
import type { GridFillHandlePosition } from '../../utils/cellSelection';
import type { GridEditingState } from '../../hooks/features/useGridEditing';

interface PinnedRowEditingHandlers {
    editingCell: GridEditingState['editingCell'];
    startCellEdit: (params: { id: GridRowId; field: string; value: unknown }) => void;
    stopCellEdit: (params?: { cancel?: boolean; id?: GridRowId; field?: string }) => void;
    setEditCellValue: (params: { id: GridRowId; field: string; value: unknown }) => void;
}

export interface GridPinnedRowsProps<R extends GridRowModel> {
    rows: R[];
    position: 'top' | 'bottom';
    columns: GridColDef<R>[];
    selectedRowIds: Set<GridRowId>;
    checkboxSelection: boolean;
    onRowClick: (params: GridRowParams<R>) => void;
    onRowDoubleClick?: (params: GridRowParams<R>) => void;
    onCellClick: (params: GridCellParams<R>) => void;
    onSelectionChange: (rowId: GridRowId, isSelected: boolean) => void;
    columnWidths: Record<string, number>;
    pinnedColumns: GridColumnPinning;
    pinnedRows?: GridRowPinning;
    hasDetailPanel: boolean;
    expandedRowIds: Set<GridRowId>;
    getDetailPanelContent?: (params: GridDetailPanelParams<R>) => React.ReactNode;
    getDetailPanelHeight?: (params: GridDetailPanelParams<R>) => GridDetailPanelHeight;
    onDetailPanelToggle: (rowId: GridRowId) => void;
    /** Receives the rendered height of `'auto'` detail panels. */
    onDetailPanelHeightChange?: (rowId: GridRowId, height: number) => void;
    pinCheckboxColumn?: boolean;
    pinExpandColumn?: boolean;
    focusedCell: { id: GridRowId | null; field: string } | null;
    colspanMap?: Map<GridRowId, Record<string, CellColSpanInfo>>;
    rowSpanningCaches?: RowSpanningCaches;
    rowHeight: number;
    rowMetaMap: Map<GridRowId, GridRowMeta>;
    /** Resolves a row's id; defaults to `row.id`. */
    getRowId?: (row: R) => GridRowId;
    /** Index of the first of these rows in the grid's renderable rows (top-pinned + centre + bottom-pinned). */
    rowIndexOffset?: number;
    /** `aria-rowindex` of the first of these rows. */
    ariaRowIndexBase?: number;
    columnIndexMap?: Map<string, number>;
    /** The selected cell range to draw (`cellSelection`), in renderable-row / data-column indices. */
    cellRange?: GridDisplayCellRange | null;
    /** The grid has row spans: rows tell their cells how far the range bottom is. */
    cellRangeHasRowSpan?: boolean;
    /** Where the fill handle is drawn (v3.5), or null. */
    fillHandle?: GridFillHandlePosition | null;
    /** Pinned rows are edited like any other row. */
    editingHandlers?: PinnedRowEditingHandlers;
    isCellEditable?: (params: GridCellParams<R>) => boolean;
    /**
     * Renders the (empty, non-draggable) reorder cell so the row lines up with the header and the
     * centre rows. Pinned rows cannot be dragged.
     */
    rowReordering?: boolean;
}

const defaultGetRowId = <R extends GridRowModel>(row: R): GridRowId => row.id;

export function GridPinnedRows<R extends GridRowModel>({
    rows,
    position,
    columns,
    selectedRowIds,
    checkboxSelection,
    onRowClick,
    onRowDoubleClick,
    onCellClick,
    onSelectionChange,
    columnWidths,
    pinnedColumns,
    pinnedRows,
    hasDetailPanel,
    expandedRowIds,
    getDetailPanelContent,
    getDetailPanelHeight,
    onDetailPanelToggle,
    onDetailPanelHeightChange,
    pinCheckboxColumn,
    pinExpandColumn,
    focusedCell,
    colspanMap,
    rowSpanningCaches,
    rowHeight,
    rowMetaMap,
    getRowId = defaultGetRowId,
    rowIndexOffset = 0,
    ariaRowIndexBase,
    columnIndexMap,
    editingHandlers,
    isCellEditable,
    rowReordering = false,
    cellRange,
    cellRangeHasRowSpan = false,
    fillHandle,
}: GridPinnedRowsProps<R>) {
    if (rows.length === 0) return null;

    return (
        <div className={`ogx__pinned-rows ogx__pinned-rows--${position}`} role="rowgroup">
            {rows.map((row, index) => {
                const id = getRowId(row);
                const rowIndex = rowIndexOffset + index;
                return (
                <Row<R>
                    key={id}
                    row={row}
                    rowId={id}
                    columns={columns}
                    rowIndex={rowIndex}
                    ariaRowIndex={ariaRowIndexBase !== undefined ? ariaRowIndexBase + index : undefined}
                    columnIndexMap={columnIndexMap}
                    isSelected={selectedRowIds.has(id)}
                    checkboxSelection={checkboxSelection}
                    onRowClick={onRowClick}
                    onRowDoubleClick={onRowDoubleClick}
                    onCellClick={onCellClick}
                    onSelectionChange={onSelectionChange}
                    columnWidths={columnWidths}
                    pinnedColumns={pinnedColumns}
                    pinnedRows={pinnedRows}
                    hasDetailPanel={hasDetailPanel}
                    isDetailPanelExpanded={expandedRowIds.has(id)}
                    detailPanelContent={expandedRowIds.has(id) && getDetailPanelContent ? <DetailPanelContent<R> getContent={getDetailPanelContent} params={{ row, id, rowIndex }} /> : null}
                    detailPanelHeight={expandedRowIds.has(id) ? resolveDetailPanelHeight(callGetDetailPanelHeight(getDetailPanelHeight, { row, id, rowIndex })) : undefined}
                    onDetailPanelHeightChange={onDetailPanelHeightChange}
                    onDetailPanelToggle={onDetailPanelToggle}
                    pinCheckboxColumn={pinCheckboxColumn}
                    pinExpandColumn={pinExpandColumn}
                    focusedCellField={focusedCell?.id === id ? focusedCell.field : null}
                    colspanMap={colspanMap}
                    rowSpanningCaches={rowSpanningCaches}
                    rowHeight={rowHeight}
                    rowMeta={rowMetaMap.get(id)}
                    editingCell={editingHandlers?.editingCell}
                    onEditStart={editingHandlers?.startCellEdit}
                    onEditStop={editingHandlers?.stopCellEdit}
                    onEditCellValueChange={editingHandlers?.setEditCellValue}
                    isCellEditable={isCellEditable}
                    rowReordering={rowReordering}
                    cellRange={getRowCellRange(cellRange, rowIndex, cellRangeHasRowSpan, fillHandle)}
                />
                );
            })}
        </div>
    );
}
