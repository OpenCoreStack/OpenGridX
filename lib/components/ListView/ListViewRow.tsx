import React from 'react';
import { formatValueByType, getCellValue, getFormattedValue } from '../../utils/values';
import { ExpandIcon } from '../ui/ExpandIcon';
import { Checkbox } from '../ui/Checkbox';
import { CellErrorBoundary } from '../Cell/CellErrorBoundary';
import { isSyntheticRowId } from '../../utils/syntheticRows';
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
    /** Roving tab stop: 0 for the one row the list's Tab stop lands on, -1 for the others. */
    tabIndex?: number;
    /** Called when the row element itself receives focus. */
    onFocus?: (rowIndex: number) => void;
    /** Expands / collapses a row with children. When set, hierarchy rows get an expand chevron. */
    onToggleExpansion?: (rowId: GridRowId) => void;
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
    tabIndex = -1,
    onFocus,
    onToggleExpansion,
}: ListViewRowProps<R>) {
    const id = rowId ?? row.id;
    const field = listViewColumn.field;
    // Same value and formatting as a grid cell for this field (Cell.tsx). A valueGetter or
    // valueFormatter that throws reads as undefined / the unformatted value instead of crashing.
    const value = getCellValue(row, field, gridColumn);
    const formattedValue = getFormattedValue(row, field, value, gridColumn) ?? formatValueByType(value, gridColumn);
    // Row-grouping headers, subtotals and auto-created tree parents are not data rows.
    const isSyntheticRow = rowMeta?.isGroupRow === true || isSyntheticRowId(id);

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
            aria-level={rowMeta?.treeDepth !== undefined ? rowMeta.treeDepth + 1 : undefined}
            aria-expanded={rowMeta?.hasChildren ? rowMeta.isExpanded === true : undefined}
            data-rowindex={rowIndex}
            tabIndex={tabIndex}
            onFocus={onFocus ? (e) => { if (e.target === e.currentTarget) onFocus(rowIndex); } : undefined}
        >
            {checkboxSelection && (
                <div className="ogx-list-view__checkbox" onClick={(e) => e.stopPropagation()}>
                    {!isSyntheticRow && <Checkbox
                        checked={isSelected}
                        onChange={handleCheckboxChange}
                        aria-label={`Select row ${id}`}
                        // Not a Tab stop of its own: the list is one Tab stop, Shift+Space selects the focused row.
                        tabIndex={-1}
                    />}
                </div>
            )}
            {rowMeta && onToggleExpansion && (
                // Tree data / row grouping: indentation by depth, and a chevron on rows with children
                // (not a Tab stop: Enter or Alt+Arrow toggle the focused row).
                <div
                    className="ogx-list-view__expand"
                    style={{ paddingLeft: (rowMeta.treeDepth ?? 0) * 16 }}
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                >
                    {rowMeta.hasChildren && (
                        <ExpandIcon isExpanded={rowMeta.isExpanded === true} onClick={() => onToggleExpansion(id)} tabIndex={-1} />
                    )}
                </div>
            )}
            <div className="ogx-list-view__cell" role="gridcell">
                <CellErrorBoundary
                    field={field}
                    resetKey={row}
                    renderFn={() => {
                        const content = listViewColumn.renderCell(params);
                        // A group row whose renderCell has nothing for it still shows its label.
                        return content === undefined && isSyntheticRow ? rowMeta?.groupLabel : content;
                    }}
                />
            </div>
        </div>
    );
}
