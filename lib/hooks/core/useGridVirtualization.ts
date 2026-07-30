import { useMemo } from 'react';
import type { GridRowModel, GridColDef } from '../../types';
import type { LayoutResult } from './useLayout';

export interface UseGridVirtualizationParams<R extends GridRowModel> {
    layout: LayoutResult<R>;
    scrollTop: number;
    scrollLeft: number;
    viewportWidth: number;
    viewportHeight: number;
    autoHeight: boolean;
    rowReordering: boolean;
    hasDetailPanel: boolean;
    checkboxSelection: boolean;
    pinCheckboxColumn: boolean;
    pinExpandColumn: boolean;
}

export interface GridVirtualizationResult<R extends GridRowModel = GridRowModel> {
    renderContext: {
        firstRowIndex: number;
        lastRowIndex: number;
        firstColumnIndex: number;
        lastColumnIndex: number;
    };
    offsetTop: number;
    offsetLeft: number;
    totalHeight: number;
    pinnedTopHeight: number;
    pinnedBottomHeight: number;
    totalWidth: number;
    rowHeights: number[];
    cumulativeHeights: number[];
    virtualColumns: (GridColDef<R> & { width: number })[];
    columnMetrics: {
        leftPinnedWidth: number;
        rightPinnedWidth: number;
        unpinnedAccWidths: number[];
        unpinnedCols: { field: string; width: number }[];
        totalSpecialsWidth: number;
        pinnedSpecialsWidth: number;
    };
}

export function useGridVirtualization<R extends GridRowModel>(
    params: UseGridVirtualizationParams<R>
): GridVirtualizationResult<R> {
    const {
        layout,
        scrollTop,
        scrollLeft,
        viewportWidth: rawViewportWidth,
        viewportHeight: rawViewportHeight,
        autoHeight,
        rowReordering,
        hasDetailPanel,
        checkboxSelection,
        pinCheckboxColumn,
        pinExpandColumn,
    } = params;

    return useMemo<GridVirtualizationResult<R>>(() => {
        const {
            unpinnedAccWidths,
            unpinnedColsWithWidth,
            leftPinnedCols,
            rightPinnedCols,
            totalWidth,
            leftWidth,
            rightWidth,
            unpinnedTotalWidth,
            systemColumnsWidth,
            cumulativeHeights,
            pinnedTopHeight,
            pinnedBottomHeight,
            unpinnedRowsHeight,
            rowHeights,
            unpinnedRowsLength,
        } = layout;

        const viewportWidth  = rawViewportWidth  || 1000;
        const viewportHeight = autoHeight
            ? pinnedTopHeight + unpinnedRowsHeight + pinnedBottomHeight + 50
            : rawViewportHeight || 600;

        const overscanCols = 6;
        const visibleLocalStart = Math.max(0, scrollLeft - leftWidth);
        const visibleLocalEnd   = scrollLeft + viewportWidth - leftWidth;

        let firstUnpinnedIndex = 0;
        let lastUnpinnedIndex  = unpinnedColsWithWidth.length - 1;

        let low = 0, high = unpinnedAccWidths.length - 1;
        while (low <= high) {
            const mid = (low + high) >>> 1;
            if (unpinnedAccWidths[mid] < visibleLocalStart) { low = mid + 1; } else { high = mid - 1; }
        }
        firstUnpinnedIndex = Math.max(0, low - overscanCols);

        for (let i = firstUnpinnedIndex; i < unpinnedAccWidths.length; i++) {
            if ((i === 0 ? 0 : unpinnedAccWidths[i - 1]) > visibleLocalEnd) {
                lastUnpinnedIndex = Math.min(unpinnedColsWithWidth.length - 1, i + overscanCols);
                break;
            }
            lastUnpinnedIndex = Math.min(unpinnedColsWithWidth.length - 1, i + overscanCols);
        }

        const leftSpacerWidth  = firstUnpinnedIndex > 0 ? unpinnedAccWidths[firstUnpinnedIndex - 1] : 0;
        const rightSpacerWidth = unpinnedTotalWidth - unpinnedAccWidths[lastUnpinnedIndex];

        const virtualColumns: (GridColDef<R> & { width: number })[] = [
            ...leftPinnedCols,
            ...(leftSpacerWidth  > 0 ? [{ field: '__spacer_left__',  width: leftSpacerWidth,  isSpacer: true }] : []),
            ...unpinnedColsWithWidth.slice(firstUnpinnedIndex, lastUnpinnedIndex + 1),
            ...(rightSpacerWidth > 0 ? [{ field: '__spacer_right__', width: rightSpacerWidth, isSpacer: true }] : []),
            ...rightPinnedCols,
        ];

        const hasHorizontalScroll = viewportWidth > 0 && totalWidth > viewportWidth;
        const scrollbarBuffer = hasHorizontalScroll ? 16 : 0;
        const totalHeight = pinnedTopHeight + unpinnedRowsHeight + pinnedBottomHeight + scrollbarBuffer + 2;

        const overscanRows = 5;
        let firstRowIndex = 0;
        let lastRowIndex  = unpinnedRowsLength - 1;
        let offsetTop     = 0;

        let rLow = 0, rHigh = cumulativeHeights.length - 1;
        while (rLow <= rHigh) {
            const mid = (rLow + rHigh) >>> 1;
            if (cumulativeHeights[mid] < scrollTop) { rLow = mid + 1; } else { rHigh = mid - 1; }
        }
        firstRowIndex = Math.max(0, rLow - overscanRows);
        offsetTop = firstRowIndex > 0 ? cumulativeHeights[firstRowIndex - 1] : 0;

        for (let i = firstRowIndex; i < cumulativeHeights.length; i++) {
            if (cumulativeHeights[i] >= scrollTop + viewportHeight) {
                lastRowIndex = Math.min(unpinnedRowsLength - 1, i + overscanRows);
                break;
            }
        }

        const pinnedSpecialsWidth =
            (rowReordering ? 48 : 0) +
            (hasDetailPanel && pinExpandColumn ? 48 : 0) +
            (checkboxSelection && pinCheckboxColumn ? 48 : 0);

        return {
            renderContext: {
                firstRowIndex,
                lastRowIndex,
                firstColumnIndex: firstUnpinnedIndex,
                lastColumnIndex:  lastUnpinnedIndex,
            },
            offsetTop,
            offsetLeft: 0,
            totalHeight,
            pinnedTopHeight,
            pinnedBottomHeight,
            totalWidth,
            rowHeights,
            cumulativeHeights,
            virtualColumns,
            columnMetrics: {
                leftPinnedWidth:   leftWidth,
                rightPinnedWidth:  rightWidth,
                unpinnedAccWidths,
                unpinnedCols:      unpinnedColsWithWidth,
                totalSpecialsWidth: systemColumnsWidth,
                pinnedSpecialsWidth,
            },
        };
    }, [
        layout,
        scrollTop,
        scrollLeft,
        rawViewportWidth,
        rawViewportHeight,
        autoHeight,
        rowReordering,
        hasDetailPanel,
        checkboxSelection,
        pinCheckboxColumn,
        pinExpandColumn,
    ]);
}
