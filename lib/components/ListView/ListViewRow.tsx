import React from 'react';
import { formatValueByType, getCellValue } from '../../utils/values';
import type { GridColDef, GridRowModel, GridRowId, GridRowMeta, GridListViewColDef, GridRenderCellParams } from '../../types';

export interface ListViewRowProps<R extends GridRowModel = GridRowModel> {
    row: R;
    /** The row's id (from getRowId). Defaults to `row.id`. */
    rowId?: GridRowId;
    /** Index of the row among the rendered rows; passed to renderCell and the row callbacks. */
    rowIndex: number;
    /** 1-based position of the row in the whole data set. Defaults to rowIndex + 1. */
    ariaRowIndex?: number;
    listViewColumn: GridListViewColDef<R>;
    /** The grid column with the list field, if any: its valueGetter / valueFormatter produce value and formattedValue. */
    gridColumn?: GridColDef<R>;
    /** Tree-data / row-grouping metadata for the row. */
    rowMeta?: GridRowMeta;
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
    ariaRowIndex,
    listViewColumn,
    gridColumn,
    rowMeta,
    isSelected = false,
    checkboxSelection = false,
    rowHeight,
    onRowClick,
    onRowDoubleClick,
    onSelectionChange,
}: ListViewRowProps<R>) {
    const id = rowId ?? row.id;
    const field = listViewColumn.field;
    // Same value and formatting as a grid cell for this field (Cell.tsx).
    const value = getCellValue(row, field, gridColumn as GridColDef | undefined);
    const formattedValue = gridColumn?.valueFormatter
        ? gridColumn.valueFormatter({ value, row, field })
        : formatValueByType(value, gridColumn);

    const params: GridRenderCellParams<R> = {
        row,
        value,
        formattedValue,
        field,
        colDef: gridColumn ?? listViewColumn,
        rowIndex,
        colIndex: 0,
        rowMeta,
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
            aria-rowindex={ariaRowIndex ?? rowIndex + 1}
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
