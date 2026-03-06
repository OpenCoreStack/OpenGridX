
import React from 'react';
import { Cell } from '../Cell/Cell';
import { Checkbox } from '../ui/Checkbox';
import { ExpandIcon } from '../ui/ExpandIcon';
import { DragHandleIcon } from '../ui/DragHandleIcon';
import { DetailPanel } from '../DetailPanel/DetailPanel';
import type { GridRowModel, GridColDef, GridRowId, GridColumnPinning, GridRowPinning, GridRowParams, GridCellParams, GridDetailPanelHeight } from '../../types';
import type { CellColSpanInfo, RowSpanningCaches } from '../../hooks/features/useGridSpanning';
import { isColumnPinned, calculatePinnedPositions, isRowPinned } from '../../utils/pinning';


export interface RowProps<R extends GridRowModel = GridRowModel> {
    row: R;
    columns: GridColDef<R>[];
    rowIndex: number;
    isSelected?: boolean;
    checkboxSelection?: boolean;
    onRowClick?: (params: GridRowParams<R>) => void;
    onCellClick?: (params: GridCellParams<R>) => void;
    onSelectionChange?: (rowId: GridRowId, isSelected: boolean) => void;
    columnWidths?: Record<string, number>;
    pinnedColumns?: GridColumnPinning;
    pinnedRows?: GridRowPinning;

    hasDetailPanel?: boolean;
    isDetailPanelExpanded?: boolean;
    onDetailPanelToggle?: (rowId: GridRowId) => void;
    detailPanelContent?: React.ReactNode;
    detailPanelHeight?: GridDetailPanelHeight;

    pinCheckboxColumn?: boolean;
    pinExpandColumn?: boolean;

    rowReordering?: boolean;
    onDragStart?: (id: GridRowId) => (event: React.DragEvent) => void;
    onDragOver?: (id: GridRowId) => (event: React.DragEvent) => void;
    onDragEnd?: () => void;
    onDrop?: (targetId: GridRowId) => (event: React.DragEvent) => void;
    isDragging?: boolean;
    isDragOver?: boolean;

    editingCell?: { id: GridRowId; field: string; value: any; } | null;
    onEditStart?: (params: { id: GridRowId, field: string, value: any }) => void;
    onEditStop?: (params?: { cancel?: boolean }) => void;
    onEditCellValueChange?: (params: { id: GridRowId, field: string, value: any }) => void;

    focusedCellField?: string | null;
    isFocusVisible?: boolean;

    colspanMap?: Map<GridRowId, Record<string, CellColSpanInfo>>;
    rowSpanningCaches?: RowSpanningCaches;
    rowHeight?: number;
}

export function Row<R extends GridRowModel = GridRowModel>(props: RowProps<R>) {
    const {
        row,
        columns,
        rowIndex,
        isSelected = false,
        checkboxSelection = false,
        onRowClick,
        onCellClick,
        onSelectionChange,
        columnWidths = {},
        pinnedColumns,
        pinnedRows,
        hasDetailPanel = false,
        isDetailPanelExpanded = false,
        onDetailPanelToggle,
        detailPanelContent,
        detailPanelHeight = 200,
        pinCheckboxColumn = true,
        pinExpandColumn = true,
        rowReordering = false,
        onDragStart,
        onDragOver,
        onDragEnd,
        onDrop,
        isDragging,
        isDragOver,

        editingCell,
        onEditStart,
        onEditStop,
        onEditCellValueChange,

        focusedCellField,
        isFocusVisible,

        colspanMap,
        rowSpanningCaches,
        rowHeight = 52
    } = props;

    const expandCellRef = React.useRef<HTMLDivElement>(null);
    const checkboxCellRef = React.useRef<HTMLDivElement>(null);

    // ── Skeleton row (shown during infinite-scroll fetch) ─────────────────────
    if ((row as any)._isSkeleton) {
        // Render shimmer placeholders — one per visible column, matching row height
        const cellCount = Math.max(columns.length, 5);
        return (
            <div
                className="ogx__row ogx__row--skeleton"
                role="row"
                aria-hidden="true"
                style={{ height: rowHeight, minHeight: rowHeight }}
            >
                {Array.from({ length: cellCount }).map((_, i) => (
                    <div key={i} className="ogx__skeleton-cell">
                        <div className="ogx__skeleton-bar" />
                    </div>
                ))}
            </div>
        );
    }

    React.useLayoutEffect(() => {
        if (focusedCellField === '__expand_col__' && expandCellRef.current) {
            expandCellRef.current.focus({ preventScroll: true });
        }
        if (focusedCellField === '__checkbox_col__' && checkboxCellRef.current) {
            checkboxCellRef.current.focus({ preventScroll: true });
        }
    }, [focusedCellField]);

    const handleRowClick = (event: React.MouseEvent) => {

        if ((event.target as HTMLElement).closest('.ogx-checkbox-wrapper, .ogx-expand-icon, .ogx-drag-handle, .ogx__edit-cell')) {
            return;
        }
        onRowClick?.({ row, id: row.id, rowIndex });
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        onSelectionChange?.(row.id, event.target.checked);
    };

    const handleDetailPanelToggle = (event: React.MouseEvent) => {
        event.stopPropagation();
        onDetailPanelToggle?.(row.id);
    };

    const pinnedPositions = React.useMemo(() => {
        return calculatePinnedPositions(
            columns,
            columnWidths,
            pinnedColumns,
            checkboxSelection,
            pinCheckboxColumn,
            hasDetailPanel,
            pinExpandColumn,
            rowReordering
        );
    }, [columns, columnWidths, pinnedColumns, checkboxSelection, pinCheckboxColumn, hasDetailPanel, pinExpandColumn, rowReordering]);

    const rowPinnedPosition = isRowPinned(row.id, pinnedRows);
    const isRowPinnedTop = rowPinnedPosition === 'top';
    const isRowPinnedBottom = rowPinnedPosition === 'bottom';

    const isGroupRow = (row as any)._hasChildren === true;

    const handleCellEditStart = React.useCallback((field: string, value: any) => {
        if (!isGroupRow) {
            onEditStart?.({ id: row.id, field, value });
        }
    }, [isGroupRow, row.id, onEditStart]);

    const handleCellValueChange = React.useCallback((field: string, newValue: any) => {
        onEditCellValueChange?.({ id: row.id, field, value: newValue });
    }, [onEditCellValueChange, row.id]);

    const handleEditStopWrapper = React.useCallback((cancel?: boolean) => {
        onEditStop?.({ cancel });
    }, [onEditStop]);

    const classNames = [
        'ogx__row',
        isSelected && 'ogx__row--selected',
        rowIndex % 2 === 0 && 'ogx__row--even',
        rowIndex % 2 === 1 && 'ogx__row--odd',
        isRowPinnedTop && 'ogx__row--pinned-top',
        isRowPinnedBottom && 'ogx__row--pinned-bottom',
        isDragging && 'ogx__row--dragging',
        isDragOver && 'ogx__row--drag-over',
        isGroupRow && 'ogx__row--group'
    ].filter(Boolean).join(' ');

    return (
        <>
            <div
                className={classNames}
                onClick={handleRowClick}
                role="row"
                aria-rowindex={rowIndex + 1}
                aria-selected={isSelected}
                data-rowindex={rowIndex}
                onDragOver={onDragOver ? onDragOver(row.id) : undefined}
                onDrop={onDrop ? onDrop(row.id) : undefined}
                style={{
                    maxHeight: `${rowHeight}px`,
                    minHeight: `${rowHeight}px`,
                    '--height': `${rowHeight}px`,
                    '--border-width': '1px'
                } as React.CSSProperties}
            >
                { }
                {rowReordering && (
                    <div
                        className="ogx__cell ogx__cell--drag-handle"
                        role="gridcell"
                        aria-label="Drag to reorder row"
                        style={{
                            position: 'sticky',
                            left: 0,
                            zIndex: 4
                        }}
                        draggable={true}
                        onDragStart={onDragStart ? onDragStart(row.id) : undefined}
                        onDragEnd={onDragEnd}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <DragHandleIcon />
                    </div>
                )}

                { }
                {hasDetailPanel && (
                    <div
                        className={`ogx__cell ogx__cell--expand ${pinExpandColumn ? 'ogx__cell--pinned-left' : ''
                            } ${focusedCellField === '__expand_col__' ? 'ogx__cell--focused' : ''} ${(focusedCellField === '__expand_col__' && isFocusVisible) ? 'ogx__cell--focus-visible' : ''
                            }`}
                        role="gridcell"
                        aria-label={isDetailPanelExpanded ? 'Collapse row details' : 'Expand row details'}
                        aria-expanded={isDetailPanelExpanded}
                        style={{
                            position: pinExpandColumn ? 'sticky' : undefined,
                            left: pinExpandColumn ? (rowReordering ? 48 : 0) : undefined,
                            zIndex: pinExpandColumn ? 5 : undefined
                        }}
                        ref={expandCellRef}
                        tabIndex={-1}
                        onClick={(e) => {
                            e.stopPropagation();
                            onCellClick?.({
                                row,
                                field: '__expand_col__',
                                value: isDetailPanelExpanded,
                                colDef: { field: '__expand_col__', width: 48 } as any,
                                rowIndex,
                                colIndex: -1
                            });
                        }}
                    >
                        <ExpandIcon
                            isExpanded={isDetailPanelExpanded}
                            onClick={handleDetailPanelToggle}
                            variant="plus-minus"
                        />
                    </div>
                )}

                { }
                {checkboxSelection && (
                    <div
                        className={`ogx__cell ogx__cell--checkbox ${pinCheckboxColumn ? 'ogx__cell--pinned-left' : ''
                            } ${focusedCellField === '__checkbox_col__' ? 'ogx__cell--focused' : ''} ${(focusedCellField === '__checkbox_col__' && isFocusVisible) ? 'ogx__cell--focus-visible' : ''
                            }`}
                        role="gridcell"
                        style={{
                            position: pinCheckboxColumn ? 'sticky' : undefined,
                            left: pinCheckboxColumn ? ((rowReordering ? 48 : 0) + (hasDetailPanel && pinExpandColumn ? 48 : 0)) : undefined,
                            zIndex: pinCheckboxColumn ? 11 : undefined
                        }}
                        ref={checkboxCellRef}
                        tabIndex={-1}
                        onClick={(e) => {
                            e.stopPropagation();
                            onCellClick?.({
                                row,
                                field: '__checkbox_col__',
                                value: isSelected,
                                colDef: { field: '__checkbox_col__', width: 48 } as any,
                                rowIndex,
                                colIndex: -1
                            });
                        }}
                    >
                        <Checkbox
                            id={`ogx-select-row-${row.id}`}
                            name={`ogx-select-row-${row.id}`}
                            checked={isSelected}
                            onChange={handleCheckboxChange}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={isSelected ? `Deselect row ${row.id}` : `Select row ${row.id}`}
                            tabIndex={-1}
                            onMouseDown={(e) => e.preventDefault()}
                        />
                    </div>
                )}

                { }
                {columns.map((colDef, colIndex) => {
                    if ((colDef as any).isSpacer) {
                        return (
                            <div
                                key={colDef.field}
                                style={{ width: colDef.width, minWidth: colDef.width, flexShrink: 0 }}
                                aria-hidden="true"
                            />
                        );
                    }
                    const value = colDef.valueGetter
                        ? colDef.valueGetter({ row, field: colDef.field, value: row[colDef.field] })
                        : row[colDef.field];

                    const effectiveWidth = columnWidths[colDef.field] ?? colDef.width;

                    const pinnedPosition = isColumnPinned(colDef.field, pinnedColumns);
                    const pinnedOffset = pinnedPosition ? pinnedPositions[colDef.field] : undefined;

                    const isEditing = editingCell?.id === row.id && editingCell?.field === colDef.field;

                    const cellValue = isEditing ? editingCell?.value : value;

                    const colSpanInfo = colspanMap?.get(row.id)?.[colDef.field];
                    const rowSpan = rowSpanningCaches?.spannedCells[row.id]?.[colDef.field];
                    const isHiddenByRowSpan = rowSpanningCaches?.hiddenCells[row.id]?.[colDef.field] || false;

                    return (
                        <Cell
                            key={colDef.field}
                            value={cellValue}
                            row={row}
                            colDef={colDef}
                            rowIndex={rowIndex}
                            colIndex={colIndex}
                            isSelected={isSelected}
                            onCellClick={onCellClick}
                            width={effectiveWidth}
                            pinnedPosition={pinnedPosition}
                            pinnedOffset={pinnedOffset}

                            isFocused={focusedCellField === colDef.field}
                            isFocusVisible={isFocusVisible}

                            isEditable={colDef.editable}
                            isEditing={isEditing}
                            onCellEditStart={handleCellEditStart}
                            onEditStop={handleEditStopWrapper}
                            onCellValueChange={handleCellValueChange}

                            colSpanInfo={colSpanInfo}
                            rowSpan={rowSpan}
                            isHiddenByRowSpan={isHiddenByRowSpan}
                        />
                    );
                })}
            </div>

            { }
            {hasDetailPanel && (
                <DetailPanel
                    row={row}
                    rowId={row.id}
                    rowIndex={rowIndex}
                    content={detailPanelContent}
                    height={detailPanelHeight}
                    isExpanded={isDetailPanelExpanded}
                />
            )}
        </>
    );
}
