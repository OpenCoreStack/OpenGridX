import { useMemo } from 'react';
import type { GridColDef, GridRowModel, GridRowId, GridColumnPinning, GridDetailPanelHeight } from '../../types';
import { getPinnedColumnGroups, SYSTEM_COLUMN_WIDTH } from '../../utils/pinning';
import { clampColumnWidth } from '../../utils/columnWidth';
import { getDetailPanelLayoutHeight } from '../../utils/detailPanel';

export interface UseLayoutParams<R extends GridRowModel> {
    rowHeight: number;
    pagination: boolean;
    paginatedUnpinnedRows: R[];
    sortedUnpinnedRows: R[];
    expandedRowIds: Set<GridRowId>;
    getDetailPanelHeight?: (params: { row: R; id: GridRowId; rowIndex: number }) => GridDetailPanelHeight;
    /** Rendered heights of `'auto'` detail panels, by row id (measured by the panels themselves). */
    detailPanelHeights?: Map<GridRowId, number>;
    pinnedTopRowsLength: number;
    pinnedBottomRowsLength: number;
    /** The pinned rows themselves; when given, their expanded detail panels count towards the pinned heights. */
    pinnedTopRows?: R[];
    pinnedBottomRows?: R[];
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
    /** Resolves a row's id (getRowId) for the expanded-detail-panel lookup; defaults to `row.id`. */
    getRowId?: (row: R) => GridRowId;
}

const defaultGetRowId = <R extends GridRowModel>(row: R): GridRowId => row.id;

export interface LayoutResult<R extends GridRowModel> {
    rowHeights: number[];
    cumulativeHeights: number[];
    unpinnedRowsHeight: number;
    pinnedTopHeight: number;
    pinnedBottomHeight: number;
    /** Left-pinned columns in render order (`pinnedColumns.left` order) with resolved widths. */
    leftPinnedCols: (GridColDef<R> & { width: number; zIndex: number })[];
    /** Right-pinned columns in render order (`pinnedColumns.right` order) with resolved widths. */
    rightPinnedCols: (GridColDef<R> & { width: number; zIndex: number })[];
    unpinnedColsWithWidth: (GridColDef<R> & { width: number })[];
    unpinnedColWidths: number[];
    unpinnedAccWidths: number[];
    totalWidth: number;
    leftWidth: number;
    rightWidth: number;
    unpinnedTotalWidth: number;
    /** Width of all system columns (drag handle, detail toggle, checkbox). */
    systemColumnsWidth: number;
    /** Width of the system columns that stay sticky on horizontal scroll. */
    pinnedSystemColumnsWidth: number;
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

type WidthSpec =
    | { kind: 'fixed'; width: number }
    | { kind: 'percentage'; percentage: number }
    | { kind: 'flex'; flex: number };

/**
 * Resolves every visible column to a pixel width. Pinned and unpinned columns follow the same
 * rules, and every width is clamped to the column's minWidth / maxWidth (as the cell CSS is):
 * - a number (or a manual resize) is used as is;
 * - percentages are all taken of the same base: the data area left after the fixed-width columns;
 * - flex and 'auto' columns share what is left after that.
 */
function resolveColumnWidths<R extends GridRowModel>(
    columns: GridColDef<R>[],
    columnWidths: Record<string, number>,
    dataAreaWidth: number,
): { widths: Map<string, number>; flexByField: Map<string, number> } {
    const specs = new Map<string, WidthSpec>();
    columns.forEach(col => {
        const hasManualWidth = Object.prototype.hasOwnProperty.call(columnWidths, col.field);
        if (!hasManualWidth && col.flex && col.flex > 0) {
            specs.set(col.field, { kind: 'flex', flex: col.flex });
            return;
        }
        const parsed = parseWidth(columnWidths[col.field] ?? col.width);
        if (parsed.type === 'fixed') {
            specs.set(col.field, { kind: 'fixed', width: clampColumnWidth(parsed.value, col.minWidth, col.maxWidth) });
        } else if (parsed.type === 'percentage') {
            specs.set(col.field, { kind: 'percentage', percentage: parsed.value });
        } else {
            specs.set(col.field, { kind: 'flex', flex: 1 });
        }
    });

    // Widths the columns need before any sharing, so an overflowing grid scrolls instead of squashing.
    const naturalWidth = columns.reduce((sum, col) => {
        const spec = specs.get(col.field)!;
        if (spec.kind === 'fixed') return sum + spec.width;
        if (spec.kind === 'percentage') return sum + 100;
        if (col.flex && col.flex > 0) {
            const minWidth = col.minWidth ?? 150;
            return sum + (minWidth || (typeof col.width === 'number' ? col.width : 150));
        }
        return sum + (col.minWidth ?? 150);
    }, 0);

    const availableWidth = Math.max(dataAreaWidth, naturalWidth);
    const fixedWidth = columns.reduce((sum, col) => {
        const spec = specs.get(col.field)!;
        return spec.kind === 'fixed' ? sum + spec.width : sum;
    }, 0);

    const widths = new Map<string, number>();
    const percentageBase = Math.max(0, availableWidth - fixedWidth);
    let percentageTotal = 0;
    columns.forEach(col => {
        const spec = specs.get(col.field)!;
        if (spec.kind === 'fixed') {
            widths.set(col.field, spec.width);
        } else if (spec.kind === 'percentage') {
            const raw = (spec.percentage / 100) * percentageBase;
            const width = clampColumnWidth(raw > 0 ? raw : 100, col.minWidth ?? 50, col.maxWidth);
            widths.set(col.field, width);
            percentageTotal += width;
        }
    });

    const freeSpace = Math.max(0, percentageBase - percentageTotal);
    const flexByField = new Map<string, number>();
    const flexItems = columns.flatMap(col => {
        const spec = specs.get(col.field)!;
        if (spec.kind !== 'flex') return [];
        flexByField.set(col.field, spec.flex);
        return [{
            field: col.field,
            flex: spec.flex,
            minWidth: col.minWidth ?? 50,
            maxWidth: col.maxWidth ?? Infinity,
            frozen: false,
            computedWidth: 0,
        }];
    });

    // Distributes the free space by flex weight, freezing items that hit their min/max and
    // redistributing, the way CSS flexbox resolves flexible lengths.
    let iterations = 0;
    const maxIterations = flexItems.length * 2;
    while (iterations < maxIterations) {
        iterations++;
        const unfrozen = flexItems.filter(f => !f.frozen);
        if (unfrozen.length === 0) break;

        const unfrozenFlexTotal = unfrozen.reduce((sum, f) => sum + f.flex, 0);
        const frozenWidthTotal = flexItems.reduce((sum, f) => f.frozen ? sum + f.computedWidth : sum, 0);
        const currentFreeSpace = Math.max(0, freeSpace - frozenWidthTotal);

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
            unfrozen.forEach(f => { f.frozen = true; });
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
    flexItems.forEach(f => widths.set(f.field, f.computedWidth));

    return { widths, flexByField };
}

export function useLayout<R extends GridRowModel>(params: UseLayoutParams<R>): LayoutResult<R> {
    const {
        rowHeight,
        pagination,
        paginatedUnpinnedRows,
        sortedUnpinnedRows,
        expandedRowIds,
        getDetailPanelHeight,
        detailPanelHeights,
        pinnedTopRowsLength,
        pinnedBottomRowsLength,
        pinnedTopRows,
        pinnedBottomRows,
        visibleOrderedColumns,
        pinnedColumns,
        columnWidths,
        viewportWidth,
        checkboxSelection,
        hasDetailPanel,
        rowReordering,
        pinCheckboxColumn,
        pinExpandColumn,
        paginationMode,
        isLoading,
        pageSize,
        getRowId = defaultGetRowId,
    } = params;

    return useMemo<LayoutResult<R>>(() => {
        const unpinnedRows = pagination ? paginatedUnpinnedRows : sortedUnpinnedRows;

        const heightOf = (row: R, rowIndex: number) => {
            const id = getRowId(row);
            if (!expandedRowIds.has(id)) return rowHeight;
            const panelHeight = getDetailPanelHeight?.({ row, id, rowIndex });
            return rowHeight + getDetailPanelLayoutHeight(panelHeight, detailPanelHeights?.get(id));
        };

        const rowHeights = unpinnedRows.map((row, index) => heightOf(row, pinnedTopRowsLength + index));

        const cumulativeHeights = rowHeights.reduce((acc, height, index) => {
            acc.push((acc[index - 1] || 0) + height);
            return acc;
        }, [] as number[]);

        const skeletonCount = (paginationMode === 'infinite' && isLoading && unpinnedRows.length > 0)
            ? Math.min(pageSize, 20)
            : 0;
        const unpinnedRowsHeight = (cumulativeHeights[cumulativeHeights.length - 1] || 0) + skeletonCount * rowHeight;
        // Pinned rows are indexed from 0 within their section (as GridPinnedRows renders them).
        const pinnedBlockHeight = (rows: R[] | undefined, count: number) =>
            rows ? rows.reduce((sum, row, index) => sum + heightOf(row, index), 0) : count * rowHeight;
        const pinnedTopHeight = pinnedBlockHeight(pinnedTopRows, pinnedTopRowsLength);
        const pinnedBottomHeight = pinnedBlockHeight(pinnedBottomRows, pinnedBottomRowsLength);

        // Pinned columns render in pinnedColumns.left / .right order; unpinned ones in column order.
        const { left: rawLeftPinnedCols, center: unpinnedCols, right: rawRightPinnedCols } =
            getPinnedColumnGroups(visibleOrderedColumns, pinnedColumns);

        const systemColumnsWidth =
            (checkboxSelection ? SYSTEM_COLUMN_WIDTH : 0) +
            (hasDetailPanel ? SYSTEM_COLUMN_WIDTH : 0) +
            (rowReordering ? SYSTEM_COLUMN_WIDTH : 0);
        const pinnedSystemColumnsWidth =
            (rowReordering ? SYSTEM_COLUMN_WIDTH : 0) +
            (hasDetailPanel && pinExpandColumn ? SYSTEM_COLUMN_WIDTH : 0) +
            (checkboxSelection && pinCheckboxColumn ? SYSTEM_COLUMN_WIDTH : 0);

        const { widths, flexByField } = resolveColumnWidths(
            [...rawLeftPinnedCols, ...unpinnedCols, ...rawRightPinnedCols],
            columnWidths,
            viewportWidth - systemColumnsWidth,
        );
        const widthOf = (col: GridColDef<R>) => widths.get(col.field) ?? 100;
        const withWidth = (col: GridColDef<R>) => ({
            ...col,
            width: widthOf(col),
            flex: flexByField.get(col.field) ?? col.flex,
        });

        const baseLeftZ = 11;
        const leftPinnedCols = rawLeftPinnedCols.map((col, i) => ({ ...withWidth(col), zIndex: baseLeftZ + i }));

        const baseRightZ = 11;
        const rightPinnedCols = rawRightPinnedCols.map((col, i) => ({
            ...withWidth(col),
            zIndex: baseRightZ + (rawRightPinnedCols.length - 1 - i),
        }));

        const unpinnedColsWithWidth = unpinnedCols.map(withWidth);
        const unpinnedColWidths = unpinnedColsWithWidth.map(col => col.width);

        const leftWidth = leftPinnedCols.reduce((sum, col) => sum + col.width, 0);
        const rightWidth = rightPinnedCols.reduce((sum, col) => sum + col.width, 0);
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
            pinnedSystemColumnsWidth,
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
        detailPanelHeights,
        pinnedTopRowsLength,
        pinnedBottomRowsLength,
        pinnedTopRows,
        pinnedBottomRows,
        visibleOrderedColumns,
        pinnedColumns,
        columnWidths,
        viewportWidth,
        checkboxSelection,
        hasDetailPanel,
        rowReordering,
        pinCheckboxColumn,
        pinExpandColumn,
        paginationMode,
        isLoading,
        pageSize,
        getRowId,
    ]);
}
