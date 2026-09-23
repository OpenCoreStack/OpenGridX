import { useMemo } from 'react';
import type { GridColDef, GridRowId, GridRowModel } from '../../types';
import type { GridSpanningResult } from './useGridSpanning';

interface RowRenderContext {
    firstRowIndex: number;
    lastRowIndex: number;
    firstColumnIndex: number;
    lastColumnIndex: number;
}

export interface UseGridSpanRowWindowParams {
    spanning: GridSpanningResult;
    renderContext: RowRenderContext;
    offsetTop: number;
    /** Cumulative heights of the center rows (layout output). */
    cumulativeHeights: number[];
}

/**
 * Extends the vertical render window back to the origin row of any row span that reaches the first
 * rendered row. Only the origin renders the merged content, so without this the visible part of a
 * span whose origin has scrolled above the overscan window would be blank.
 */
export function useGridSpanRowWindow(params: UseGridSpanRowWindowParams): { renderContext: RowRenderContext; offsetTop: number } {
    const { spanning, renderContext, offsetTop, cumulativeHeights } = params;

    return useMemo(() => {
        if (!spanning.hasRowSpan) return { renderContext, offsetTop };
        let first = Math.max(0, renderContext.firstRowIndex);
        for (let start = spanning.getCenterRowSpanStart(first); start < first; start = spanning.getCenterRowSpanStart(first)) {
            first = start;
        }
        if (first >= renderContext.firstRowIndex) return { renderContext, offsetTop };
        return {
            renderContext: { ...renderContext, firstRowIndex: first },
            offsetTop: first > 0 ? cumulativeHeights[first - 1] ?? 0 : 0,
        };
    }, [spanning, renderContext, offsetTop, cumulativeHeights]);
}

interface ColumnLayout<R extends GridRowModel> {
    leftPinnedCols: GridColDef<R>[];
    unpinnedColsWithWidth: (GridColDef<R> & { width: number })[];
    rightPinnedCols: GridColDef<R>[];
    unpinnedAccWidths: number[];
    unpinnedTotalWidth: number;
}

export interface UseGridSpanColumnWindowParams<R extends GridRowModel> {
    spanning: GridSpanningResult;
    /** Unpinned column window chosen by the virtualization. */
    firstColumnIndex: number;
    lastColumnIndex: number;
    virtualColumns: GridColDef<R>[];
    layout: ColumnLayout<R>;
    /** Rows that will be rendered, with their resolved id (rows do not have to carry it in `row.id`). */
    rows: { row: R; id?: GridRowId }[];
}

/**
 * Widens the horizontal render window so every colSpan in the rendered rows is either fully inside
 * it or fully outside it. A span origin left of the window would otherwise render nothing while its
 * covered columns render nothing either, shifting the rest of the row left; a span that runs past
 * the right edge would overflow the right spacer.
 */
export function useGridSpanColumnWindow<R extends GridRowModel>(params: UseGridSpanColumnWindowParams<R>): GridColDef<R>[] {
    const { spanning, firstColumnIndex, lastColumnIndex, virtualColumns, layout, rows } = params;

    return useMemo(() => {
        if (!spanning.hasColSpan || layout.unpinnedColsWithWidth.length === 0) return virtualColumns;

        let first = firstColumnIndex;
        let last = lastColumnIndex;
        let changed = true;
        while (changed) {
            changed = false;
            for (const { row, id } of rows) {
                const ranges = spanning.getUnpinnedColSpanRanges(id ?? row.id);
                if (!ranges) continue;
                for (let k = 0; k < ranges.length; k += 2) {
                    const start = ranges[k];
                    const end = ranges[k + 1];
                    if (end < first || start > last) continue;
                    if (start < first) { first = start; changed = true; }
                    if (end > last) { last = end; changed = true; }
                }
            }
        }

        if (first === firstColumnIndex && last === lastColumnIndex) return virtualColumns;

        const { leftPinnedCols, unpinnedColsWithWidth, rightPinnedCols, unpinnedAccWidths, unpinnedTotalWidth } = layout;
        const leftSpacerWidth = first > 0 ? unpinnedAccWidths[first - 1] : 0;
        const rightSpacerWidth = unpinnedTotalWidth - unpinnedAccWidths[last];
        return [
            ...leftPinnedCols,
            ...(leftSpacerWidth > 0 ? [{ field: '__spacer_left__', width: leftSpacerWidth, isSpacer: true } as GridColDef<R>] : []),
            ...unpinnedColsWithWidth.slice(first, last + 1),
            ...(rightSpacerWidth > 0 ? [{ field: '__spacer_right__', width: rightSpacerWidth, isSpacer: true } as GridColDef<R>] : []),
            ...rightPinnedCols,
        ];
    }, [spanning, firstColumnIndex, lastColumnIndex, virtualColumns, layout, rows]);
}
