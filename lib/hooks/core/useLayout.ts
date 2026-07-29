import { useMemo } from 'react';
import type { GridColDef, GridRowModel, GridRowId, GridColumnPinning, GridDetailPanelHeight } from '../../types';
import { isColumnPinned } from '../../utils/pinning';

export interface UseLayoutParams<R extends GridRowModel> {
    rowHeight: number;
    pagination: boolean;
    paginatedUnpinnedRows: R[];
    sortedUnpinnedRows: R[];
    expandedRowIds: Set<GridRowId>;
    getDetailPanelHeight?: (params: { row: R; id: GridRowId; rowIndex: number }) => GridDetailPanelHeight;
    pinnedTopRowsLength: number;
    pinnedBottomRowsLength: number;
    visibleOrderedColumns: GridColDef<R>[];
    pinnedColumns?: GridColumnPinning;
    columnWidths: Record<string, number>;
    viewportWidth: number;
    checkboxSelection: boolean;
    hasDetailPanel: boolean;
    rowReordering: boolean;
    pinCheckboxColumn: boolean;
    pinExpandColumn: boolean;
    autoHeight: boolean;
    paginationMode: string;
    isLoading: boolean;
    pageSize: number;
}

export interface LayoutResult<R extends GridRowModel> {
    rowHeights: number[];
    cumulativeHeights: number[];
    unpinnedRowsHeight: number;
    pinnedTopHeight: number;
    pinnedBottomHeight: number;
    leftPinnedCols: (GridColDef<R> & { width: number; zIndex: number })[];
    rightPinnedCols: (GridColDef<R> & { width: number; zIndex: number })[];
    unpinnedColsWithWidth: (GridColDef<R> & { width: number })[];
    unpinnedColWidths: number[];
    unpinnedAccWidths: number[];
    totalWidth: number;
    leftWidth: number;
    rightWidth: number;
    unpinnedTotalWidth: number;
    systemColumnsWidth: number;
    pinnedTopRowsLength: number;
    pinnedBottomRowsLength: number;
    unpinnedRowsLength: number;
}

function parseWidth(width: number | string | undefined): { type: 'fixed' | 'percentage' | 'auto'; value: number } {
    if (width === undefined) return { type: 'auto', value: 0 };
    if (typeof width === 'number') return { type: 'fixed', value: width };
    if (typeof width === 'string') {
        if (width.toLowerCase() === 'auto') return { type: 'auto', value: 0 };
        if (width.endsWith('%')) {
            const percentage = parseFloat(width);
            return { type: 'percentage', value: percentage };
        }
        const floatVal = parseFloat(width);
        if (!isNaN(floatVal)) return { type: 'fixed', value: floatVal };
    }
    return { type: 'fixed', value: 100 };
}

export function useLayout<R extends GridRowModel>(params: UseLayoutParams<R>): LayoutResult<R> {
    const {
        rowHeight,
        pagination,
        paginatedUnpinnedRows,
        sortedUnpinnedRows,
        expandedRowIds,
        getDetailPanelHeight,
        pinnedTopRowsLength,
        pinnedBottomRowsLength,
        visibleOrderedColumns,
        pinnedColumns,
        columnWidths,
        viewportWidth,
        checkboxSelection,
        hasDetailPanel,
        rowReordering,
        pinCheckboxColumn,
        pinExpandColumn,
        autoHeight,
        paginationMode,
        isLoading,
        pageSize,
    } = params;

    return useMemo<LayoutResult<R>>(() => {
        const unpinnedRows = pagination ? paginatedUnpinnedRows : sortedUnpinnedRows;

        const rowHeights = unpinnedRows.map((row, index) => {
            let height = rowHeight;
            if (expandedRowIds.has(row.id)) {
                const detailHeight = getDetailPanelHeight?.({ row, id: row.id, rowIndex: pinnedTopRowsLength + index }) ?? 200;
                height += typeof detailHeight === 'number' ? detailHeight : parseInt(String(detailHeight), 10) || 200;
            }
            return height;
        });

        const cumulativeHeights = rowHeights.reduce((acc, height, index) => {
            acc.push((acc[index - 1] || 0) + height);
            return acc;
        }, [] as number[]);

        const skeletonCount = (paginationMode === 'infinite' && isLoading && unpinnedRows.length > 0)
            ? Math.min(pageSize, 20)
            : 0;
        const unpinnedRowsHeight = (cumulativeHeights[cumulativeHeights.length - 1] || 0) + skeletonCount * rowHeight;
        const pinnedTopHeight = pinnedTopRowsLength * rowHeight;
        const pinnedBottomHeight = pinnedBottomRowsLength * rowHeight;

        const rawLeftPinnedCols: GridColDef<R>[] = [];
        const rawRightPinnedCols: GridColDef<R>[] = [];
        const unpinnedCols: GridColDef<R>[] = [];
        const unpinnedColWidths: number[] = [];

        visibleOrderedColumns.forEach(col => {
            const pinned = isColumnPinned(col.field, pinnedColumns);
            if (pinned === 'left') {
                rawLeftPinnedCols.push(col);
            } else if (pinned === 'right') {
                rawRightPinnedCols.push(col);
            } else {
                unpinnedCols.push(col);
            }
        });

        const systemColumnsWidth = (checkboxSelection ? 48 : 0) + (hasDetailPanel ? 48 : 0) + (rowReordering ? 48 : 0);

        const getColWidth = (c: GridColDef<R>) => columnWidths[c.field] ?? c.width;

        const leftWidth = rawLeftPinnedCols.reduce((sum, c) => {
            const parsed = parseWidth(getColWidth(c));
            return sum + (parsed.type === 'fixed' ? parsed.value : 100);
        }, 0);
        const rightWidth = rawRightPinnedCols.reduce((sum, c) => {
            const parsed = parseWidth(getColWidth(c));
            return sum + (parsed.type === 'fixed' ? parsed.value : 100);
        }, 0);

        const naturalFlexWidth = unpinnedCols.reduce((sum, col) => {
            const hasManualWidth = Object.prototype.hasOwnProperty.call(columnWidths, col.field);
            if (!hasManualWidth && col.flex && col.flex > 0) {
                const minWidth = col.minWidth ?? 150;
                const w = typeof col.width === 'number' ? col.width : 150;
                return sum + (minWidth || w);
            }
            const parsed = parseWidth(getColWidth(col));
            if (parsed.type === 'fixed') return sum + parsed.value;
            if (parsed.type === 'percentage') return sum + 100;
            return sum + (col.minWidth ?? 150);
        }, 0);

        const availableWidth = Math.max(
            viewportWidth - systemColumnsWidth - leftWidth - rightWidth,
            naturalFlexWidth
        );

        const fixedWidthCols: Array<{ col: GridColDef<R>; width: number }> = [];
        const percentageCols: Array<{ col: GridColDef<R>; percentage: number }> = [];
        const flexCols: Array<{ col: GridColDef<R>; flex: number }> = [];

        unpinnedCols.forEach(col => {
            const hasManualWidth = Object.prototype.hasOwnProperty.call(columnWidths, col.field);
            const parsed = parseWidth(getColWidth(col));

            if (!hasManualWidth && col.flex && col.flex > 0) {
                flexCols.push({ col, flex: col.flex });
                return;
            }

            if (parsed.type === 'fixed') {
                fixedWidthCols.push({ col, width: parsed.value });
            } else if (parsed.type === 'percentage') {
                percentageCols.push({ col, percentage: parsed.value });
            } else {
                flexCols.push({ col, flex: 1 });
            }
        });

        const fixedWidth = fixedWidthCols.reduce((sum, { width }) => sum + width, 0);
        let remainingSpaceForFlex = Math.max(0, availableWidth - fixedWidth);

        const percentageWidthMap = new Map<string, number>();
        percentageCols.forEach(({ col, percentage }) => {
            const calculatedWidth = (percentage / 100) * remainingSpaceForFlex;
            percentageWidthMap.set(col.field, calculatedWidth);
            remainingSpaceForFlex -= calculatedWidth;
        });
        remainingSpaceForFlex = Math.max(0, remainingSpaceForFlex);

        const finalFlexWidths = new Map<string, number>();
        const flexItems = flexCols.map(f => ({
            ...f,
            minWidth: f.col.minWidth ?? 50,
            maxWidth: f.col.maxWidth ?? Infinity,
            frozen: false,
            computedWidth: 0
        }));

        const solveFlexAllocation = () => {
            let iterations = 0;
            const maxIterations = flexItems.length * 2;

            while (iterations < maxIterations) {
                iterations++;
                const unfrozen = flexItems.filter(f => !f.frozen);
                if (unfrozen.length === 0) break;

                const unfrozenFlexTotal = unfrozen.reduce((sum, f) => sum + f.flex, 0);
                const frozenWidthTotal = flexItems.reduce((sum, f) => f.frozen ? sum + f.computedWidth : sum, 0);
                const currentFreeSpace = Math.max(0, remainingSpaceForFlex - frozenWidthTotal);

                if (unfrozenFlexTotal <= 0) {
                    unfrozen.forEach(f => { f.computedWidth = f.minWidth; f.frozen = true; });
                    break;
                }

                const pixelsPerFlex = currentFreeSpace / unfrozenFlexTotal;
                let totalViolation = 0;
                const minViolators: typeof flexItems = [];
                const maxViolators: typeof flexItems = [];

                unfrozen.forEach(f => {
                    const rawWidth = pixelsPerFlex * f.flex;
                    if (rawWidth < f.minWidth) {
                        totalViolation += f.minWidth - rawWidth;
                        minViolators.push(f);
                    } else if (rawWidth > f.maxWidth) {
                        totalViolation += f.maxWidth - rawWidth;
                        maxViolators.push(f);
                    } else {
                        f.computedWidth = rawWidth;
                    }
                });

                if (minViolators.length === 0 && maxViolators.length === 0) {
                    unfrozen.forEach(f => f.frozen = true);
                    break;
                }

                if (totalViolation > 0) {
                    minViolators.forEach(f => { f.computedWidth = f.minWidth; f.frozen = true; });
                } else if (totalViolation < 0) {
                    maxViolators.forEach(f => { f.computedWidth = f.maxWidth; f.frozen = true; });
                } else {
                    minViolators.forEach(f => { f.computedWidth = f.minWidth; f.frozen = true; });
                    maxViolators.forEach(f => { f.computedWidth = f.maxWidth; f.frozen = true; });
                }
            }
        };

        solveFlexAllocation();
        flexItems.forEach(f => finalFlexWidths.set(f.col.field, f.computedWidth));

        const computedWidthMap = new Map<string, number>();
        unpinnedCols.forEach(col => {
            let computedWidth: number;
            if (finalFlexWidths.has(col.field)) {
                computedWidth = finalFlexWidths.get(col.field)!;
            } else {
                const fixedCol = fixedWidthCols.find(f => f.col.field === col.field);
                const pctCol = percentageCols.find(p => p.col.field === col.field);
                if (fixedCol) {
                    computedWidth = fixedCol.width;
                } else if (pctCol) {
                    const rawPctWidth = percentageWidthMap.get(col.field) || 0;
                    computedWidth = Math.max(col.minWidth ?? 50, rawPctWidth || 100);
                } else {
                    computedWidth = 100;
                }
            }
            unpinnedColWidths.push(computedWidth);
            computedWidthMap.set(col.field, computedWidth);
        });

        const unpinnedColsWithWidth = unpinnedCols.map(col => {
            const flexItem = flexItems.find(f => f.col.field === col.field);
            return {
                ...col,
                width: computedWidthMap.get(col.field) ?? (typeof col.width === 'number' ? col.width : 100),
                flex: flexItem ? flexItem.flex : col.flex
            };
        });

        const baseLeftZ = 11;
        const leftPinnedCols = rawLeftPinnedCols.map((col, i) => {
            const parsed = parseWidth(getColWidth(col));
            return { ...col, width: parsed.type === 'fixed' ? parsed.value : 100, zIndex: baseLeftZ + i };
        });

        const baseRightZ = 11;
        const rightPinnedCols = rawRightPinnedCols.map((col, i) => {
            const parsed = parseWidth(getColWidth(col));
            return {
                ...col,
                width: parsed.type === 'fixed' ? parsed.value : 100,
                zIndex: baseRightZ + (rawRightPinnedCols.length - 1 - i)
            };
        });

        const unpinnedTotalWidth = unpinnedColWidths.reduce((sum, w) => sum + w, 0);
        const totalWidth = leftWidth + unpinnedTotalWidth + rightWidth + systemColumnsWidth;
        const unpinnedAccWidths = unpinnedColWidths.reduce((acc, w, i) => {
            acc.push((acc[i - 1] || 0) + w);
            return acc;
        }, [] as number[]);

        return {
            rowHeights,
            cumulativeHeights,
            unpinnedRowsHeight,
            pinnedTopHeight,
            pinnedBottomHeight,
            leftPinnedCols,
            rightPinnedCols,
            unpinnedColsWithWidth,
            unpinnedColWidths,
            unpinnedAccWidths,
            totalWidth,
            leftWidth,
            rightWidth,
            unpinnedTotalWidth,
            systemColumnsWidth,
            pinnedTopRowsLength,
            pinnedBottomRowsLength,
            unpinnedRowsLength: unpinnedRows.length,
        };
    }, [
        rowHeight,
        pagination,
        paginatedUnpinnedRows,
        sortedUnpinnedRows,
        expandedRowIds,
        getDetailPanelHeight,
        pinnedTopRowsLength,
        pinnedBottomRowsLength,
        visibleOrderedColumns,
        pinnedColumns,
        columnWidths,
        viewportWidth,
        checkboxSelection,
        hasDetailPanel,
        rowReordering,
        pinCheckboxColumn,
        pinExpandColumn,
        autoHeight,
        paginationMode,
        isLoading,
        pageSize,
    ]);
}
