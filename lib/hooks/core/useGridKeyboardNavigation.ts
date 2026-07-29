import { useState, useCallback } from 'react';
import type { GridRowModel, GridRowId, GridColDef, GridCellParams, GridSortItem, GridSortDirection } from '../../types';
import type { GridEditingState } from '../features/useGridEditing';

interface ColumnMetrics {
    leftPinnedWidth: number;
    rightPinnedWidth: number;
    unpinnedAccWidths: number[];
    unpinnedCols: { field: string }[];
    totalSpecialsWidth: number;
    pinnedSpecialsWidth: number;
}

interface VirtualizationSnapshot {
    cumulativeHeights: number[];
    pinnedTopHeight: number;
    columnMetrics: ColumnMetrics | null;
}

export interface UseGridKeyboardNavigationParams<R extends GridRowModel> {
    allRenderableRows: R[];
    navigationColumns: { field: string; editable?: boolean; sortable?: boolean }[];
    checkboxSelection: boolean;
    selectedRowIds: Set<GridRowId>;
    handleSelectionChange: (id: GridRowId, selected: boolean) => void;
    handleDetailPanelToggle: (id: GridRowId) => void;
    editingHandlers: {
        editingCell: GridEditingState['editingCell'];
        startCellEdit: (params: { id: GridRowId; field: string; value: unknown }) => void;
        stopCellEdit: (params?: { cancel?: boolean }) => void;
    };
    setKeyboardMode: (mode: boolean) => void;
    sortModel: GridSortItem[];
    handleSort: (field: string, direction: GridSortDirection) => void;
    isCellEditable?: (params: GridCellParams<R>) => boolean;
    pagination: boolean;
    pageSize: number;
    virtualization: VirtualizationSnapshot;
    viewportRef: React.RefObject<HTMLDivElement | null>;
}

export interface FocusedCell {
    id: GridRowId;
    field: string;
}

export interface UseGridKeyboardNavigationReturn {
    focusedCell: FocusedCell | null;
    setFocusedCell: React.Dispatch<React.SetStateAction<FocusedCell | null>>;
    handleFocus: (event: React.FocusEvent<HTMLDivElement>) => void;
    handleBlur: (event: React.FocusEvent<HTMLDivElement>) => void;
    handleKeyDown: (event: React.KeyboardEvent) => void;
}

export function useGridKeyboardNavigation<R extends GridRowModel>(
    params: UseGridKeyboardNavigationParams<R>
): UseGridKeyboardNavigationReturn {
    const {
        allRenderableRows,
        navigationColumns,
        checkboxSelection,
        selectedRowIds,
        handleSelectionChange,
        handleDetailPanelToggle,
        editingHandlers,
        setKeyboardMode,
        sortModel,
        handleSort,
        isCellEditable,
        pagination,
        pageSize,
        virtualization,
        viewportRef,
    } = params;

    const [focusedCell, setFocusedCell] = useState<FocusedCell | null>(null);

    const handleFocus = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            setFocusedCell(prev => {
                if (prev) return prev;
                if (checkboxSelection) {
                    return { id: 'HEADER', field: '__checkbox_col__' };
                }
                const firstRow = allRenderableRows[0];
                const firstCol = navigationColumns[0];
                if (firstRow && firstCol) {
                    return { id: firstRow.id, field: firstCol.field };
                }
                return null;
            });
        }
    }, [allRenderableRows, navigationColumns, checkboxSelection]);

    const handleBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setFocusedCell(null);
        }
    }, []);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        setKeyboardMode(true);

        if (!focusedCell) return;

        const { id, field } = focusedCell;
        const isEditing = Boolean(editingHandlers.editingCell);

        if (id === 'HEADER' && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            const col = navigationColumns.find(c => c.field === field);
            if (col && col.sortable !== false) {
                const currentSort = sortModel.find(item => item.field === field);
                let newDirection: GridSortDirection = 'asc';
                if (currentSort) {
                    newDirection = currentSort.sort === 'asc' ? 'desc' : null;
                }
                handleSort(field, newDirection);
            }
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            if (isEditing) {
                editingHandlers.stopCellEdit();
            } else {
                const col = navigationColumns.find(c => c.field === field);
                if (col?.editable) {
                    const row = allRenderableRows.find(r => r.id === id);
                    if (row) {
                        editingHandlers.startCellEdit({ id, field, value: (row as R & Record<string, unknown>)[field] });
                    }
                }
            }
            return;
        }

        if (event.key === ' ' || event.key === 'Spacebar') {
            if (!isEditing) {
                if (field === '__checkbox_col__') {
                    event.preventDefault();
                    handleSelectionChange(id, !selectedRowIds.has(id));
                    return;
                }
                if (field === '__expand_col__') {
                    event.preventDefault();
                    handleDetailPanelToggle(id);
                    return;
                }
            }
        }

        if (event.key === 'Escape') {
            if (isEditing) {
                event.preventDefault();
                editingHandlers.stopCellEdit({ cancel: true });
            }
            return;
        }

        if (isEditing && event.key !== 'Tab') return;

        const isHeader = id === 'HEADER';
        const rowIndex = isHeader ? -1 : allRenderableRows.findIndex(r => r.id === id);
        const colIndex = navigationColumns.findIndex(c => c.field === field);

        if (!isHeader && rowIndex === -1) return;
        if (colIndex === -1) return;

        const findNextCell = (
            startRow: number,
            startCol: number,
            deltaRow: number,
            deltaCol: number,
            wrapRow: boolean,
            allowHeader = false
        ) => {
            let r = startRow + deltaRow;
            let c = startCol + deltaCol;

            if (wrapRow && deltaCol !== 0) {
                if (deltaCol > 0 && c >= navigationColumns.length) { c = 0; r++; }
                else if (deltaCol < 0 && c < 0) { c = navigationColumns.length - 1; r--; }
            }

            if (!wrapRow && (c < 0 || c >= navigationColumns.length)) return null;
            if (r < (allowHeader ? -1 : 0) || r >= allRenderableRows.length) return null;

            return { r, c };
        };

        const findNextEditable = (
            startRow: number,
            startCol: number,
            deltaRow: number,
            deltaCol: number,
            wrapRow: boolean,
            allowHeader = false
        ) => {
            let r = startRow;
            let c = startCol;
            let steps = 0;
            const maxSteps = allRenderableRows.length * navigationColumns.length + navigationColumns.length;

            while (steps < maxSteps) {
                steps++;
                r += deltaRow;
                c += deltaCol;

                if (wrapRow && deltaCol !== 0) {
                    if (deltaCol > 0) {
                        if (c >= navigationColumns.length) { c = 0; r++; }
                    } else {
                        if (c < 0) { c = navigationColumns.length - 1; r--; }
                    }
                } else {
                    if (c < 0 || c >= navigationColumns.length) return null;
                }

                if (r < -1 || r >= allRenderableRows.length) return null;

                if (r === -1) {
                    if (!allowHeader) continue;
                    const col = navigationColumns[c];
                    const isSortable = col.sortable !== false;
                    if (['__checkbox_col__'].includes(col.field) || isSortable) return { r, c };
                    continue;
                }

                const row = allRenderableRows[r];
                const col = navigationColumns[c];
                const isInteractable = ['__checkbox_col__', '__expand_col__', '__reorder_col__'].includes(col.field);
                let cellEditable = col.editable || isInteractable;

                if (isCellEditable && !isInteractable) {
                    try {
                        cellEditable = isCellEditable({
                            row,
                            field: col.field,
                            value: (row as R & Record<string, unknown>)[col.field],
                            colDef: col as GridColDef<R>,
                            rowIndex: r,
                            colIndex: c
                        });
                    } catch {
                        // isCellEditable threw — treat cell as non-editable
                    }
                }

                if (cellEditable) return { r, c };
            }
            return null;
        };

        let nextRowIndex = rowIndex;
        let nextColIndex = colIndex;
        let handled = false;

        if (event.key === 'Tab') {
            const dir = event.shiftKey ? -1 : 1;
            const res = findNextEditable(rowIndex, colIndex, 0, dir, true, false);
            if (res) { nextRowIndex = res.r; nextColIndex = res.c; handled = true; }
        } else if (event.key === 'ArrowRight') {
            const res = findNextCell(rowIndex, colIndex, 0, 1, true, true);
            if (res) { nextRowIndex = res.r; nextColIndex = res.c; handled = true; }
        } else if (event.key === 'ArrowLeft') {
            const res = findNextCell(rowIndex, colIndex, 0, -1, true, true);
            if (res) { nextRowIndex = res.r; nextColIndex = res.c; handled = true; }
        } else if (event.key === 'ArrowDown') {
            const res = findNextCell(rowIndex, colIndex, 1, 0, false, true);
            if (res) { nextRowIndex = res.r; nextColIndex = res.c; handled = true; }
        } else if (event.key === 'ArrowUp') {
            const res = findNextCell(rowIndex, colIndex, -1, 0, false, true);
            if (res) { nextRowIndex = res.r; nextColIndex = res.c; handled = true; }
        } else if (event.key === 'Home') {
            nextColIndex = 0;
            if (event.ctrlKey || event.metaKey) nextRowIndex = -1;
            handled = true;
        } else if (event.key === 'End') {
            nextColIndex = navigationColumns.length - 1;
            if (event.ctrlKey || event.metaKey) nextRowIndex = allRenderableRows.length - 1;
            handled = true;
        } else if (event.key === 'PageUp') {
            const pg = pagination ? pageSize : 10;
            nextRowIndex = Math.max(-1, nextRowIndex - pg);
            handled = true;
        } else if (event.key === 'PageDown') {
            const pg = pagination ? pageSize : 10;
            nextRowIndex = Math.min(allRenderableRows.length - 1, nextRowIndex + pg);
            handled = true;
        }

        if (handled) {
            event.preventDefault();

            if (isEditing && event.key === 'Tab') {
                editingHandlers.stopCellEdit();
            }

            if (nextRowIndex >= -1 && nextRowIndex < allRenderableRows.length &&
                nextColIndex >= 0 && nextColIndex < navigationColumns.length) {

                const nextCol = navigationColumns[nextColIndex];

                if (nextRowIndex === -1) {
                    setFocusedCell({ id: 'HEADER', field: nextCol.field });
                } else {
                    setFocusedCell({ id: allRenderableRows[nextRowIndex].id, field: nextCol.field });
                }

                const el = viewportRef.current;
                if (el) {
                    const { cumulativeHeights, pinnedTopHeight, columnMetrics } = virtualization;
                    const { clientHeight, clientWidth, scrollTop, scrollLeft } = el;

                    const rowTop = nextRowIndex <= 0 ? 0 : cumulativeHeights[nextRowIndex - 1];
                    const rowBottom = cumulativeHeights[nextRowIndex];
                    const visibleTop = scrollTop + pinnedTopHeight;
                    const visibleBottom = scrollTop + clientHeight;

                    let newScrollTop = scrollTop;
                    if (rowTop < visibleTop) {
                        newScrollTop = Math.max(0, rowTop - pinnedTopHeight);
                    } else if (rowBottom > visibleBottom) {
                        newScrollTop = rowBottom - clientHeight;
                    }
                    if (newScrollTop !== scrollTop) el.scrollTop = newScrollTop;

                    if (columnMetrics) {
                        const { leftPinnedWidth, rightPinnedWidth, unpinnedAccWidths, unpinnedCols, totalSpecialsWidth, pinnedSpecialsWidth } = columnMetrics;
                        const unpinnedIndex = unpinnedCols.findIndex(c => c.field === nextCol.field);

                        if (unpinnedIndex !== -1) {
                            const colLeft = totalSpecialsWidth + leftPinnedWidth + (unpinnedIndex > 0 ? unpinnedAccWidths[unpinnedIndex - 1] : 0);
                            const colRight = totalSpecialsWidth + leftPinnedWidth + unpinnedAccWidths[unpinnedIndex];
                            const visibleStart = scrollLeft + pinnedSpecialsWidth + leftPinnedWidth;
                            const visibleEnd = scrollLeft + clientWidth - rightPinnedWidth;

                            let newScrollLeft = scrollLeft;
                            if (colLeft < visibleStart) {
                                newScrollLeft = Math.max(0, colLeft - pinnedSpecialsWidth - leftPinnedWidth);
                            } else if (colRight > visibleEnd) {
                                newScrollLeft = colRight - clientWidth + rightPinnedWidth;
                            }
                            if (newScrollLeft !== scrollLeft) el.scrollLeft = newScrollLeft;
                        }
                    }
                }
            }
        }
    }, [
        focusedCell,
        allRenderableRows,
        navigationColumns,
        editingHandlers,
        virtualization,
        selectedRowIds,
        handleSelectionChange,
        handleDetailPanelToggle,
        setKeyboardMode,
        sortModel,
        handleSort,
        isCellEditable,
        pagination,
        pageSize,
        viewportRef,
    ]);

    return { focusedCell, setFocusedCell, handleFocus, handleBlur, handleKeyDown };
}
