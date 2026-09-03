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
}

export function GridPinnedRows<R extends GridRowModel>({
    rows,
    position,
    columns,
    selectedRowIds,
    checkboxSelection,
    onRowClick,
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
}: GridPinnedRowsProps<R>) {
    if (rows.length === 0) return null;

    return (
        <div className={`ogx__pinned-rows ogx__pinned-rows--${position}`} role="rowgroup">
            {rows.map((row, index) => (
                <Row<R>
                    key={row.id}
                    row={row}
                    columns={columns}
                    rowIndex={index}
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
                    detailPanelContent={getDetailPanelContent ? getDetailPanelContent({ row, id: row.id, rowIndex: index }) : null}
                    detailPanelHeight={getDetailPanelHeight?.({ row, id: row.id, rowIndex: index }) || 200}
                    onDetailPanelToggle={onDetailPanelToggle}
                    pinCheckboxColumn={pinCheckboxColumn}
                    pinExpandColumn={pinExpandColumn}
                    focusedCellField={focusedCell?.id === row.id ? focusedCell.field : null}
                    colspanMap={colspanMap}
                    rowSpanningCaches={rowSpanningCaches}
                    rowHeight={rowHeight}
                    rowMeta={rowMetaMap.get(row.id)}
                />
            ))}
        </div>
    );
}
