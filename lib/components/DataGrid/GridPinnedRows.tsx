import React from 'react';
import { Row } from '../Row/Row';
import { DetailPanelContent } from '../DetailPanel/DetailPanelContent';
import { resolveDetailPanelHeight } from '../../utils/detailPanel';
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
    /** Pinned rows are edited like any other row. */
    editingHandlers?: PinnedRowEditingHandlers;
    isCellEditable?: (params: GridCellParams<R>) => boolean;
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
}: GridPinnedRowsProps<R>) {
    if (rows.length === 0) return null;

    // Detail callbacks run only for an expanded data row: never for collapsed rows or synthetic group rows.
    const showDetail = (id: GridRowId) => expandedRowIds.has(id) && rowMetaMap.get(id)?.isGroupRow !== true;

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
                    detailPanelContent={showDetail(id) && getDetailPanelContent ? <DetailPanelContent<R> getContent={getDetailPanelContent} params={{ row, id, rowIndex }} /> : null}
                    detailPanelHeight={resolveDetailPanelHeight(showDetail(id) ? getDetailPanelHeight?.({ row, id, rowIndex }) : undefined)}
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
                />
                );
            })}
        </div>
    );
}
