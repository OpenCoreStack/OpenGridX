import React from 'react';
import { Row } from '../Row/Row';
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
    pinCheckboxColumn?: boolean;
    pinExpandColumn?: boolean;
    focusedCell: { id: GridRowId; field: string } | null;
    colspanMap?: Map<GridRowId, Record<string, CellColSpanInfo>>;
    rowSpanningCaches?: RowSpanningCaches;
    rowHeight: number;
    rowMetaMap: Map<GridRowId, GridRowMeta>;
    /** Resolves a row's id; defaults to `row.id`. */
    getRowId?: (row: R) => GridRowId;
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
    pinCheckboxColumn,
    pinExpandColumn,
    focusedCell,
    colspanMap,
    rowSpanningCaches,
    rowHeight,
    rowMetaMap,
    getRowId = defaultGetRowId,
}: GridPinnedRowsProps<R>) {
    if (rows.length === 0) return null;

    return (
        <div className={`ogx__pinned-rows ogx__pinned-rows--${position}`} role="rowgroup">
            {rows.map((row, index) => {
                const id = getRowId(row);
                return (
                <Row<R>
                    key={id}
                    row={row}
                    rowId={id}
                    columns={columns}
                    rowIndex={index}
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
                    detailPanelContent={getDetailPanelContent ? getDetailPanelContent({ row, id, rowIndex: index }) : null}
                    detailPanelHeight={getDetailPanelHeight?.({ row, id, rowIndex: index }) || 200}
                    onDetailPanelToggle={onDetailPanelToggle}
                    pinCheckboxColumn={pinCheckboxColumn}
                    pinExpandColumn={pinExpandColumn}
                    focusedCellField={focusedCell?.id === id ? focusedCell.field : null}
                    colspanMap={colspanMap}
                    rowSpanningCaches={rowSpanningCaches}
                    rowHeight={rowHeight}
                    rowMeta={rowMetaMap.get(id)}
                />
                );
            })}
        </div>
    );
}
