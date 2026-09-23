import React from 'react';
import type { GridColDef, GridRowModel, GridRowId, GridListViewColDef, GridRenderCellParams } from '../../types';

export interface ListViewRowProps<R extends GridRowModel = GridRowModel> {
    row: R;
    /** The row's id (from getRowId). Defaults to `row.id`. */
    rowId?: GridRowId;
    rowIndex: number;
    listViewColumn: GridListViewColDef<R>;
    isSelected?: boolean;
    checkboxSelection?: boolean;
    rowHeight?: number;
    onRowClick?: (row: R) => void;
    onRowDoubleClick?: (row: R) => void;
    onSelectionChange?: (rowId: GridRowId, isSelected: boolean) => void;
}

export function ListViewRow<R extends GridRowModel = GridRowModel>({
    row,
    rowId,
    rowIndex,
    listViewColumn,
    isSelected = false,
    checkboxSelection = false,
    rowHeight,
    onRowClick,
    onRowDoubleClick,
    onSelectionChange,
}: ListViewRowProps<R>) {
    const id = rowId ?? row.id;
    const params: GridRenderCellParams<R> = {
        row,
        value: undefined,
        field: listViewColumn.field,
        colDef: { field: listViewColumn.field } as unknown as GridColDef<R>,
        rowIndex,
        colIndex: 0,
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        onSelectionChange?.(id, e.target.checked);
    };

    return (
        <div
            className={`ogx-list-view__row${isSelected ? ' ogx-list-view__row--selected' : ''}`}
            style={rowHeight ? { minHeight: rowHeight } : undefined}
            onClick={() => onRowClick?.(row)}
            onDoubleClick={onRowDoubleClick ? () => onRowDoubleClick(row) : undefined}
            role="row"
            aria-rowindex={rowIndex + 2}
            aria-selected={isSelected}
        >
            {checkboxSelection && (
                <div className="ogx-list-view__checkbox" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={handleCheckboxChange}
                        aria-label={`Select row ${id}`}
                    />
                </div>
            )}
            <div className="ogx-list-view__cell" role="gridcell">
                {listViewColumn.renderCell(params)}
            </div>
        </div>
    );
}
