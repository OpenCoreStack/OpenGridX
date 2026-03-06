import React from 'react';
import type { GridRowModel, GridRowId, GridListViewColDef, GridRenderCellParams } from '../../types';

export interface ListViewRowProps<R extends GridRowModel = GridRowModel> {
    row: R;
    rowIndex: number;
    listViewColumn: GridListViewColDef<R>;
    isSelected?: boolean;
    checkboxSelection?: boolean;
    rowHeight?: number;
    onRowClick?: (row: R) => void;
    onSelectionChange?: (rowId: GridRowId, isSelected: boolean) => void;
}

export function ListViewRow<R extends GridRowModel = GridRowModel>({
    row,
    rowIndex,
    listViewColumn,
    isSelected = false,
    checkboxSelection = false,
    rowHeight,
    onRowClick,
    onSelectionChange,
}: ListViewRowProps<R>) {
    const params: GridRenderCellParams<R> = {
        row,
        value: undefined,
        field: listViewColumn.field,
        colDef: { field: listViewColumn.field } as any,
        rowIndex,
        colIndex: 0,
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        onSelectionChange?.(row.id, e.target.checked);
    };

    return (
        <div
            className={`ogx-list-view__row${isSelected ? ' ogx-list-view__row--selected' : ''}`}
            style={rowHeight ? { minHeight: rowHeight } : undefined}
            onClick={() => onRowClick?.(row)}
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
                        aria-label={`Select row ${row.id}`}
                    />
                </div>
            )}
            <div className="ogx-list-view__cell" role="gridcell">
                {listViewColumn.renderCell(params)}
            </div>
        </div>
    );
}
