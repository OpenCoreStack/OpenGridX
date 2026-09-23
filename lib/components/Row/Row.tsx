
import React, { useId } from 'react';
import { Cell } from '../Cell/Cell';
import { Checkbox } from '../ui/Checkbox';
import { ExpandIcon } from '../ui/ExpandIcon';
import { DragHandleIcon } from '../ui/DragHandleIcon';
import { DetailPanel } from '../DetailPanel/DetailPanel';
import type { GridRowModel, GridColDef, GridRowId, GridColumnPinning, GridRowPinning, GridRowParams, GridCellParams, GridDetailPanelHeight, GridRowMeta } from '../../types';
import type { CellColSpanInfo, RowSpanningCaches } from '../../hooks/features/useGridSpanning';
import { isColumnPinned, calculatePinnedPositions, getPinnedEdgeFields, isRowPinned } from '../../utils/pinning';
import { getCellValue, resolveCellEditable } from '../../utils/editing';
import { getRenderedColumnWidth } from '../../utils/columnWidth';
import { DEFAULT_DETAIL_PANEL_HEIGHT } from '../../utils/detailPanel';

/** Sticky system cells (drag handle, detail toggle, checkbox) sit above scrolled, spanned and focused cells. */
const SYSTEM_CELL_Z_INDEX = 12;


/**
 * Builds the Cell span info for a colSpan origin: the merged width and flex-grow are the sums over
 * the columns it covers, taken from the rendered (layout-resolved) columns. The span never crosses a
 * spacer, so a span cut by the column window only covers what is rendered.
 */
function mergeColSpan<R extends GridRowModel>(
    columns: GridColDef<R>[],
    originIndex: number,
    colSpan: number,
    columnWidths: Record<string, number>,
): CellColSpanInfo {
    let width = 0;
    let flexGrow = 0;
    let covered = 0;
    for (let i = originIndex; i < columns.length && covered < colSpan; i++) {
        const col = columns[i];
        if (col.isSpacer) break;
        width += getRenderedColumnWidth(col, columnWidths);
        flexGrow += col.flex ?? 0;
        covered++;
    }
    return { spannedByColSpan: false, cellProps: { colSpan: covered, width, flexGrow } };
}

export interface RowProps<R extends GridRowModel = GridRowModel> {
    row: R;
    /** The row's id (from getRowId). Defaults to `row.id`; the grid always passes it. */
    rowId?: GridRowId;
    columns: GridColDef<R>[];
    rowIndex: number;
    isSelected?: boolean;
    checkboxSelection?: boolean;
    onRowClick?: (params: GridRowParams<R>) => void;
    onRowDoubleClick?: (params: GridRowParams<R>) => void;
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
    /** Called with the rendered height of an `'auto'` detail panel whenever it changes. */
    onDetailPanelHeightChange?: (rowId: GridRowId, height: number) => void;

    pinCheckboxColumn?: boolean;
    pinExpandColumn?: boolean;

    rowReordering?: boolean;
    onDragStart?: (id: GridRowId) => (event: React.DragEvent) => void;
    onDragOver?: (id: GridRowId) => (event: React.DragEvent) => void;
    onDragEnd?: () => void;
    onDrop?: (targetId: GridRowId) => (event: React.DragEvent) => void;
    isDragging?: boolean;
    isDragOver?: boolean;

    editingCell?: { id: GridRowId; field: string; value: unknown; } | null;
    onEditStart?: (params: { id: GridRowId, field: string, value: unknown }) => void;
    /** `id` / `field` name the cell whose editor asked to stop. */
    onEditStop?: (params?: { cancel?: boolean; id?: GridRowId; field?: string }) => void;
    onEditCellValueChange?: (params: { id: GridRowId, field: string, value: unknown }) => void;
    /** Per-cell editability predicate (`DataGrid.isCellEditable`). */
    isCellEditable?: (params: GridCellParams<R>) => boolean;

    focusedCellField?: string | null;
    isFocusVisible?: boolean;

    colspanMap?: Map<GridRowId, Record<string, CellColSpanInfo>>;
    rowSpanningCaches?: RowSpanningCaches;
    rowHeight?: number;
    rowMeta?: GridRowMeta;
    /** Position of each visible data column in render order, for `colIndex` and `aria-colindex`. */
    columnIndexMap?: Map<string, number>;
    /** 1-based `aria-rowindex` of this row in the whole grid (header rows included). Defaults to `rowIndex + 2`. */
    ariaRowIndex?: number;
}

export function Row<R extends GridRowModel = GridRowModel>(props: RowProps<R>) {
    const {
        row,
        rowId: rowIdProp,
        columns,
        rowIndex,
        isSelected = false,
        checkboxSelection = false,
        onRowClick,
        onRowDoubleClick,
        onCellClick,
        onSelectionChange,
        columnWidths = {},
        pinnedColumns,
        pinnedRows,
        hasDetailPanel = false,
        isDetailPanelExpanded = false,
        onDetailPanelToggle,
        detailPanelContent,
        detailPanelHeight = DEFAULT_DETAIL_PANEL_HEIGHT,
        onDetailPanelHeightChange,
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
        isCellEditable,

        focusedCellField,
        isFocusVisible,

        colspanMap,
        rowSpanningCaches,
        rowHeight = 52,
        rowMeta,
        columnIndexMap,
        ariaRowIndex,
    } = props;

    const id = rowIdProp ?? row.id;
    // All hooks must come before any early returns (Rules of Hooks).
    // DOM focus is moved onto the focused cell by useGridKeyboardNavigation, not by the row.
    const checkboxId = useId();
    const detailPanelId = useId();

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

    const pinnedEdges = React.useMemo(() => getPinnedEdgeFields(columns, pinnedColumns), [columns, pinnedColumns]);

    const isGroupRow = rowMeta?.hasChildren === true;

    // Which cells may be edited is decided per cell below (resolveCellEditable), not per row:
    // tree-data parents are real rows and stay editable; synthetic group rows never are.
    const handleCellEditStart = React.useCallback((field: string, value: unknown) => {
        onEditStart?.({ id, field, value });
    }, [id, onEditStart]);

    const handleCellValueChange = React.useCallback((field: string, newValue: unknown) => {
        onEditCellValueChange?.({ id, field, value: newValue });
    }, [onEditCellValueChange, id]);

    const handleEditStopWrapper = React.useCallback((cancel?: boolean, field?: string) => {
        onEditStop?.({ cancel, id, field });
    }, [onEditStop, id]);

    // ── Skeleton row (shown during infinite-scroll fetch) ─────────────────────
    if (row._isSkeleton) {
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

    // `.ogx__cell--editing` covers custom renderEditCell editors, which have no .ogx__edit-cell wrapper.
    const handleRowClick = (event: React.MouseEvent) => {

        if ((event.target as HTMLElement).closest('.ogx-checkbox-wrapper, .ogx-expand-icon, .ogx-drag-handle, .ogx__edit-cell, .ogx__cell--editing')) {
            return;
        }
        onRowClick?.({ row, id, rowIndex });
    };

    const handleRowDoubleClick = (event: React.MouseEvent) => {
        if ((event.target as HTMLElement).closest('.ogx-checkbox-wrapper, .ogx-expand-icon, .ogx-drag-handle, .ogx__edit-cell, .ogx__cell--editing')) {
            return;
        }
        onRowDoubleClick?.({ row, id, rowIndex });
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.stopPropagation();
        onSelectionChange?.(id, event.target.checked);
    };

    const handleDetailPanelToggle = (event: React.MouseEvent) => {
        event.stopPropagation();
        onDetailPanelToggle?.(id);
    };

    // aria-colindex: system columns first (reorder, expand, checkbox), then the data columns.
    const reorderColIndex = rowReordering ? 1 : 0;
    const expandColIndex = hasDetailPanel ? reorderColIndex + 1 : reorderColIndex;
    const checkboxColIndex = checkboxSelection ? expandColIndex + 1 : expandColIndex;
    const systemColumnCount = checkboxColIndex;
    const dataColumnCount = columnIndexMap?.size ?? columns.filter(c => !c.isSpacer).length;
    const isHierarchyRow = rowMeta !== undefined;
    const hasChildren = rowMeta?.hasChildren === true;
    // Synthetic group rows are not data rows: they keep the expand column (for alignment)
    // but have no detail panel to toggle.
    const canShowDetailPanel = hasDetailPanel && rowMeta?.isGroupRow !== true;
    const detailPanelExpanded = canShowDetailPanel && isDetailPanelExpanded;

    const rowPinnedPosition = isRowPinned(id, pinnedRows);
    const isRowPinnedTop = rowPinnedPosition === 'top';
    const isRowPinnedBottom = rowPinnedPosition === 'bottom';

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
                onDoubleClick={onRowDoubleClick ? handleRowDoubleClick : undefined}
                role="row"
                aria-rowindex={ariaRowIndex ?? rowIndex + 2}
                aria-selected={isSelected}
                aria-level={isHierarchyRow ? (rowMeta?.treeDepth ?? 0) + 1 : undefined}
                aria-expanded={hasChildren ? rowMeta?.isExpanded === true : undefined}
                data-rowindex={rowIndex}
                onDragOver={onDragOver ? onDragOver(id) : undefined}
                onDrop={onDrop ? onDrop(id) : undefined}
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
                        className={`ogx__cell ogx__cell--drag-handle ${focusedCellField === '__reorder_col__' ? 'ogx__cell--focused' : ''} ${(focusedCellField === '__reorder_col__' && isFocusVisible) ? 'ogx__cell--focus-visible' : ''}`}
                        role="gridcell"
                        aria-label="Drag to reorder row"
                        aria-colindex={reorderColIndex}
                        data-field="__reorder_col__"
                        tabIndex={-1}
                        style={{
                            position: 'sticky',
                            left: 0,
                            zIndex: SYSTEM_CELL_Z_INDEX
                        }}
                        draggable={true}
                        onDragStart={onDragStart ? onDragStart(id) : undefined}
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
                        aria-label={canShowDetailPanel ? (detailPanelExpanded ? 'Collapse row details' : 'Expand row details') : undefined}
                        aria-expanded={canShowDetailPanel ? detailPanelExpanded : undefined}
                        aria-controls={detailPanelExpanded ? detailPanelId : undefined}
                        aria-colindex={expandColIndex}
                        data-field="__expand_col__"
                        style={{
                            position: pinExpandColumn ? 'sticky' : undefined,
                            left: pinExpandColumn ? (rowReordering ? 48 : 0) : undefined,
                            zIndex: pinExpandColumn ? SYSTEM_CELL_Z_INDEX : undefined
                        }}
                        tabIndex={-1}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!canShowDetailPanel) return;
                            onCellClick?.({
                                row,
                                field: '__expand_col__',
                                value: detailPanelExpanded,
                                colDef: { field: '__expand_col__', width: 48 } as unknown as GridColDef<R>,
                                rowIndex,
                                colIndex: -1
                            });
                        }}
                    >
                        {canShowDetailPanel && (
                            <ExpandIcon
                                isExpanded={detailPanelExpanded}
                                onClick={handleDetailPanelToggle}
                                variant="plus-minus"
                                tabIndex={-1}
                            />
                        )}
                    </div>
                )}

                { }
                {checkboxSelection && (
                    <div
                        className={`ogx__cell ogx__cell--checkbox ${pinCheckboxColumn ? 'ogx__cell--pinned-left' : ''
                            } ${focusedCellField === '__checkbox_col__' ? 'ogx__cell--focused' : ''} ${(focusedCellField === '__checkbox_col__' && isFocusVisible) ? 'ogx__cell--focus-visible' : ''
                            }`}
                        role="gridcell"
                        aria-colindex={checkboxColIndex}
                        data-field="__checkbox_col__"
                        style={{
                            position: pinCheckboxColumn ? 'sticky' : undefined,
                            left: pinCheckboxColumn ? ((rowReordering ? 48 : 0) + (hasDetailPanel && pinExpandColumn ? 48 : 0)) : undefined,
                            zIndex: pinCheckboxColumn ? SYSTEM_CELL_Z_INDEX : undefined
                        }}
                        tabIndex={-1}
                        onClick={(e) => {
                            e.stopPropagation();
                            onCellClick?.({
                                row,
                                field: '__checkbox_col__',
                                value: isSelected,
                                colDef: { field: '__checkbox_col__', width: 48 } as unknown as GridColDef<R>,
                                rowIndex,
                                colIndex: -1
                            });
                        }}
                    >
                        <Checkbox
                            id={checkboxId}
                            name={`ogx-select-row-${id}`}
                            checked={isSelected}
                            onChange={handleCheckboxChange}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={isSelected ? `Deselect row ${id}` : `Select row ${id}`}
                            tabIndex={-1}
                            onMouseDown={(e) => e.preventDefault()}
                        />
                    </div>
                )}

                { }
                {columns.map((colDef, localIndex) => {
                    if (colDef.isSpacer) {
                        return (
                            <div
                                key={colDef.field}
                                style={{ width: colDef.width, minWidth: colDef.width, flexShrink: 0 }}
                                aria-hidden="true"
                            />
                        );
                    }
                    const value = getCellValue(row, colDef);
                    const colIndex = columnIndexMap?.get(colDef.field) ?? localIndex;

                    const effectiveWidth = columnWidths[colDef.field] ?? colDef.width;

                    const pinnedPosition = isColumnPinned(colDef.field, pinnedColumns);

                    const isEditable = Boolean(onEditStart) && resolveCellEditable(
                        { row, field: colDef.field, value, colDef, rowIndex, colIndex, rowMeta },
                        isCellEditable
                    );
                    const isEditing = editingCell?.id === id && editingCell?.field === colDef.field;

                    const cellValue = isEditing ? editingCell?.value : value;

                    const storedColSpanInfo = colspanMap?.get(id)?.[colDef.field];
                    const colSpanInfo = storedColSpanInfo && !storedColSpanInfo.spannedByColSpan && storedColSpanInfo.cellProps.colSpan > 1
                        ? mergeColSpan(columns, colIndex, storedColSpanInfo.cellProps.colSpan, columnWidths)
                        : storedColSpanInfo;
                    // A merged cell ends at the last column it covers: a right-pinned one is anchored by
                    // that column's right edge, and it is the left-pinned edge cell if that column is.
                    const lastCoveredField = colSpanInfo && !colSpanInfo.spannedByColSpan
                        ? columns[colIndex + colSpanInfo.cellProps.colSpan - 1]?.field ?? colDef.field
                        : colDef.field;
                    const offsetField = pinnedPosition === 'right' ? lastCoveredField : colDef.field;
                    const pinnedOffset = pinnedPosition ? pinnedPositions[offsetField] : undefined;
                    const isPinnedEdge = (pinnedPosition === 'left' && lastCoveredField === pinnedEdges.lastLeft)
                        || (pinnedPosition === 'right' && colDef.field === pinnedEdges.firstRight);
                    const rowSpan = rowSpanningCaches?.spannedCells[id]?.[colDef.field];
                    const isHiddenByRowSpan = rowSpanningCaches?.hiddenCells[id]?.[colDef.field] || false;

                    return (
                        <Cell
                            key={colDef.field}
                            value={cellValue}
                            row={row}
                            colDef={colDef}
                            rowIndex={rowIndex}
                            colIndex={colIndex}
                            ariaColIndex={systemColumnCount + colIndex + 1}
                            isSelected={isSelected}
                            onCellClick={onCellClick}
                            width={effectiveWidth}
                            pinnedPosition={pinnedPosition}
                            pinnedOffset={pinnedOffset}
                            isPinnedEdge={isPinnedEdge}

                            isFocused={focusedCellField === colDef.field}
                            isFocusVisible={isFocusVisible}

                            isEditable={isEditable}
                            isEditing={isEditing}
                            onCellEditStart={handleCellEditStart}
                            onEditStop={handleEditStopWrapper}
                            onCellValueChange={handleCellValueChange}

                            colSpanInfo={colSpanInfo}
                            rowSpan={rowSpan}
                            isHiddenByRowSpan={isHiddenByRowSpan}
                            rowMeta={rowMeta}
                        />
                    );
                })}
            </div>

            { }
            {canShowDetailPanel && (
                <DetailPanel
                    id={detailPanelId}
                    colSpan={systemColumnCount + dataColumnCount}
                    row={row}
                    rowId={id}
                    rowIndex={rowIndex}
                    content={detailPanelContent}
                    height={detailPanelHeight}
                    isExpanded={detailPanelExpanded}
                    onHeightChange={onDetailPanelHeightChange}
                />
            )}
        </>
    );
}
