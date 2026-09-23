import { useMemo } from 'react';
import type { GridRowId, GridColDef, GridRowModel, GridRenderCellParams, GridRowMeta } from '../../types';

type ColumnKey = string;

/**
 * Column-span information for one cell.
 *
 * Only span origins (colSpan > 1) and the cells they cover have an entry; every other cell has none
 * and renders at its own resolved width. `leftVisibleCellIndex` / `rightVisibleCellIndex` are indices
 * into the rendered data columns (left-pinned, then unpinned, then right-pinned).
 *
 * The hook stores only `colSpan` for an origin. `Row` adds the merged `width` and `flexGrow` from the
 * columns it renders, so resizing a column never recomputes the spans.
 */
export type CellColSpanInfo =
    | {
        spannedByColSpan: true;
        rightVisibleCellIndex: number;
        leftVisibleCellIndex: number;
    }
    | {
        spannedByColSpan: false;
        cellProps: {
            colSpan: number;
            width?: number;
            flexGrow?: number;
        };
    };

export type ColspanMap = Map<GridRowId, Record<ColumnKey, CellColSpanInfo>>;

export interface RowSpanningCaches {
    /** Row id → field → number of rows the origin cell spans (only entries > 1). */
    spannedCells: Record<GridRowId, Record<ColumnKey, number>>;
    /** Row id → field → `true` for cells covered by a row span that starts in a row above. */
    hiddenCells: Record<GridRowId, Record<ColumnKey, boolean>>;
    /** Row id → field → id of the row whose span covers the hidden cell. */
    hiddenCellOriginMap: Record<GridRowId, Record<ColumnKey, GridRowId>>;
}

/** The top-left cell of a merged area. */
export interface GridSpanOrigin {
    rowId: GridRowId;
    field: string;
}

export interface UseGridSpanningParams<R extends GridRowModel> {
    /** Row sections as they are rendered. A span never crosses from one section into another. */
    pinnedTopRows: R[];
    /** The scrolling rows that are rendered: the current page when paginated. */
    centerRows: R[];
    pinnedBottomRows: R[];
    /** Visible data columns; used to look up the column definitions (colSpan, rowSpan, valueGetter). */
    columns: GridColDef<R>[];
    /**
     * Rendered data columns per pinned section, in render order (the layout output). Only their
     * fields and order matter here, so a width change does not recompute the spans.
     */
    leftPinnedColumns: GridColDef<R>[];
    unpinnedColumns: GridColDef<R>[];
    rightPinnedColumns: GridColDef<R>[];
    /** Rows whose detail panel is expanded. A row span ends at such a row, above its panel. */
    expandedRowIds?: Set<GridRowId>;
    rowMetaMap?: Map<GridRowId, GridRowMeta>;
    /** Resolves a row's id (the grid's getRowId); span caches are keyed by it. Defaults to `row.id`. */
    getRowId?: (row: R) => GridRowId;
}

const defaultGetRowId = <R extends GridRowModel>(row: R): GridRowId => row.id;

export interface GridSpanningResult {
    hasColSpan: boolean;
    hasRowSpan: boolean;
    colspanMap: ColspanMap;
    rowSpanningCaches: RowSpanningCaches;
    /** For a cell covered by a colSpan or rowSpan, the origin cell of that span; otherwise `null`. */
    getSpanOrigin: (rowId: GridRowId, field: string) => GridSpanOrigin | null;
    /**
     * Unpinned column index ranges merged by colSpan in a row, as flat pairs
     * `[first0, last0, first1, last1, …]` in the unpinned-column index space.
     */
    getUnpinnedColSpanRanges: (rowId: GridRowId) => readonly number[] | undefined;
    /**
     * For a center (scrolling) row index, the index of the earliest row whose row span reaches it,
     * or the index itself when no span from above reaches it.
     */
    getCenterRowSpanStart: (centerRowIndex: number) => number;
}

interface SpanColumn<R extends GridRowModel> {
    colDef: GridColDef<R>;
    field: string;
    /** Exclusive end of this column's pinned section, as an index into the rendered columns. */
    sectionEnd: number;
    hasColSpan: boolean;
    hasRowSpan: boolean;
}

interface SpanComputation {
    colspanMap: ColspanMap;
    rowSpanningCaches: RowSpanningCaches;
    /** For hidden cells whose origin sits in another column (colSpan × rowSpan rectangles). */
    hiddenOriginFields: Map<GridRowId, Record<ColumnKey, string>>;
    unpinnedRanges: Map<GridRowId, number[]>;
    centerRowSpanStart: Map<number, number>;
}

const EMPTY_COLSPAN_MAP: ColspanMap = new Map();
const EMPTY_ROW_SPANNING_CACHES: RowSpanningCaches = { spannedCells: {}, hiddenCells: {}, hiddenCellOriginMap: {} };
const identityRowStart = (centerRowIndex: number) => centerRowIndex;
const noOrigin = () => null;
const noRanges = () => undefined;

const EMPTY_RESULT: GridSpanningResult = {
    hasColSpan: false,
    hasRowSpan: false,
    colspanMap: EMPTY_COLSPAN_MAP,
    rowSpanningCaches: EMPTY_ROW_SPANNING_CACHES,
    getSpanOrigin: noOrigin,
    getUnpinnedColSpanRanges: noRanges,
    getCenterRowSpanStart: identityRowStart,
};

const FIELD_SEPARATOR = '\u0000';
const SECTION_SEPARATOR = '\u0001';

/**
 * Normalises a span value: integers ≥ 1 pass through, fractions are floored, `Infinity` means
 * "to the end of the section" (clamped later), and anything else (NaN, ≤ 0, non-numbers) is 1.
 */
export function normalizeSpan(value: unknown): number {
    if (typeof value !== 'number' || Number.isNaN(value)) return 1;
    if (value === Infinity) return Number.MAX_SAFE_INTEGER;
    if (!Number.isFinite(value)) return 1;
    const span = Math.floor(value);
    return span < 1 ? 1 : span;
}

function sectionKey<R extends GridRowModel>(columns: GridColDef<R>[]): string {
    return columns.map(c => c.field).join(FIELD_SEPARATOR);
}

/**
 * Computes column and row spans for the rendered rows and columns.
 *
 * - Spans are computed over the rendered data columns only (hidden columns are skipped) and stop at a
 *   pinned-column section boundary; they are computed per row section (pinned top, center, pinned
 *   bottom) and never cross into another section.
 * - An origin with colSpan c and rowSpan r covers the whole c × r rectangle. A cell covered by a
 *   colSpan is not evaluated as a rowSpan origin, a colSpan stops before a cell that a row span from
 *   above already covers, and a row span ends at a row whose detail panel is expanded.
 * - Span values are normalised (see `normalizeSpan`) and clamped to what exists, so the work is
 *   O(rows × columns) at most, and zero when no column declares a span.
 * - A span callback (or the valueGetter feeding it) that throws is treated as span 1, with a
 *   development warning, instead of unmounting the grid.
 *
 * The result is derived during render (memoised on rows and column structure), not set in an effect.
 */
export function useGridSpanning<R extends GridRowModel>(params: UseGridSpanningParams<R>): GridSpanningResult {
    const {
        pinnedTopRows,
        centerRows,
        pinnedBottomRows,
        columns,
        leftPinnedColumns,
        unpinnedColumns,
        rightPinnedColumns,
        expandedRowIds,
        rowMetaMap,
        getRowId = defaultGetRowId,
    } = params;

    const hasColSpan = useMemo(() => columns.some(c => c.colSpan !== undefined && c.colSpan !== null), [columns]);
    const hasRowSpan = useMemo(() => columns.some(c => c.rowSpan !== undefined && c.rowSpan !== null), [columns]);
    const hasSpans = hasColSpan || hasRowSpan;

    // Only the order and pinned section of the rendered columns matter; a string key keeps the span
    // computation from re-running on every column-resize tick (the layout arrays are rebuilt then).
    const structureKey = hasSpans
        ? [leftPinnedColumns, unpinnedColumns, rightPinnedColumns].map(sectionKey).join(SECTION_SEPARATOR)
        : '';

    const spanColumns = useMemo<{ columns: SpanColumn<R>[]; leftCount: number; unpinnedCount: number }>(() => {
        if (!structureKey) return { columns: [], leftCount: 0, unpinnedCount: 0 };
        const byField = new Map(columns.map(c => [c.field, c]));
        const sections = structureKey.split(SECTION_SEPARATOR).map(s => (s ? s.split(FIELD_SEPARATOR) : []));
        const result: SpanColumn<R>[] = [];
        let end = 0;
        for (const fields of sections) {
            end += fields.length;
            for (const field of fields) {
                const colDef = byField.get(field) ?? ({ field } as GridColDef<R>);
                result.push({
                    colDef,
                    field,
                    sectionEnd: end,
                    hasColSpan: colDef.colSpan !== undefined && colDef.colSpan !== null,
                    hasRowSpan: colDef.rowSpan !== undefined && colDef.rowSpan !== null,
                });
            }
        }
        return { columns: result, leftCount: sections[0].length, unpinnedCount: sections[1].length };
    }, [structureKey, columns]);

    const computation = useMemo<SpanComputation | null>(() => {
        if (!hasSpans || spanColumns.columns.length === 0) return null;
        const out: SpanComputation = {
            colspanMap: new Map(),
            rowSpanningCaches: { spannedCells: {}, hiddenCells: {}, hiddenCellOriginMap: {} },
            hiddenOriginFields: new Map(),
            unpinnedRanges: new Map(),
            centerRowSpanStart: new Map(),
        };
        const warned = new Set<string>();
        const context = { spanColumns, expandedRowIds, rowMetaMap, getRowId, warned, out };
        computeSection(pinnedTopRows, 0, false, context);
        computeSection(centerRows, pinnedTopRows.length, true, context);
        computeSection(pinnedBottomRows, pinnedTopRows.length + centerRows.length, false, context);
        return out;
    }, [hasSpans, spanColumns, pinnedTopRows, centerRows, pinnedBottomRows, expandedRowIds, rowMetaMap, getRowId]);

    return useMemo<GridSpanningResult>(() => {
        if (!computation) return EMPTY_RESULT;
        const { colspanMap, rowSpanningCaches, hiddenOriginFields, unpinnedRanges, centerRowSpanStart } = computation;
        const renderedColumns = spanColumns.columns;
        return {
            hasColSpan,
            hasRowSpan,
            colspanMap,
            rowSpanningCaches,
            getSpanOrigin: (rowId, field) => {
                const colSpanInfo = colspanMap.get(rowId)?.[field];
                if (colSpanInfo?.spannedByColSpan) return { rowId, field: renderedColumns[colSpanInfo.leftVisibleCellIndex].field };
                const originRowId = rowSpanningCaches.hiddenCellOriginMap[rowId]?.[field];
                if (originRowId === undefined) return null;
                return { rowId: originRowId, field: hiddenOriginFields.get(rowId)?.[field] ?? field };
            },
            getUnpinnedColSpanRanges: (rowId) => unpinnedRanges.get(rowId),
            getCenterRowSpanStart: (centerRowIndex) => centerRowSpanStart.get(centerRowIndex) ?? centerRowIndex,
        };
    }, [computation, hasColSpan, hasRowSpan, spanColumns]);
}

interface SectionContext<R extends GridRowModel> {
    spanColumns: { columns: SpanColumn<R>[]; leftCount: number; unpinnedCount: number };
    expandedRowIds?: Set<GridRowId>;
    rowMetaMap?: Map<GridRowId, GridRowMeta>;
    getRowId: (row: R) => GridRowId;
    warned: Set<string>;
    out: SpanComputation;
}

function computeSection<R extends GridRowModel>(
    rows: R[],
    rowIndexOffset: number,
    isCenter: boolean,
    context: SectionContext<R>,
): void {
    const { spanColumns, expandedRowIds, rowMetaMap, getRowId, warned, out } = context;
    const { columns, leftCount, unpinnedCount } = spanColumns;
    const columnCount = columns.length;
    const { colspanMap, rowSpanningCaches, hiddenOriginFields, unpinnedRanges, centerRowSpanStart } = out;

    // Per column: the (section-local) row index until which a row span from above covers it, and
    // the origin of that span. `coverEnd` is the furthest such row over all columns.
    const coveredUntil = new Int32Array(columnCount);
    const coverOriginRow: GridRowId[] = new Array(columnCount);
    const coverOriginField: string[] = new Array(columnCount);
    const coverOriginIndex = new Int32Array(columnCount);
    let coverEnd = 0;

    const spanColumnIndices: number[] = [];
    columns.forEach((column, index) => {
        if (column.hasColSpan || column.hasRowSpan) spanColumnIndices.push(index);
    });

    const markHidden = (rowId: GridRowId, r: number, i: number) => {
        const field = columns[i].field;
        setRecord(rowSpanningCaches.hiddenCells, rowId, field, true);
        setRecord(rowSpanningCaches.hiddenCellOriginMap, rowId, field, coverOriginRow[i]);
        if (coverOriginField[i] !== field) setRecord(hiddenOriginFields, rowId, field, coverOriginField[i]);
        if (isCenter) {
            const start = centerRowSpanStart.get(r);
            if (start === undefined || coverOriginIndex[i] < start) centerRowSpanStart.set(r, coverOriginIndex[i]);
        }
    };

    /** Evaluates the spans of the cell at column `i` (not covered from above); returns the columns it takes. */
    const processCell = (row: R, r: number, i: number): number => {
        const column = columns[i];
        const rowId = getRowId(row);
        const cellParams = buildParams(row, rowId, column.colDef, rowIndexOffset + r, i, rowMetaMap, warned);

        let colSpan = 1;
        if (column.hasColSpan) {
            const limit = Math.min(evaluateSpan(column.colDef.colSpan, cellParams, 'colSpan', column.field, warned), column.sectionEnd - i);
            while (colSpan < limit && coveredUntil[i + colSpan] <= r) colSpan++;
        }

        let rowSpan = 1;
        if (column.hasRowSpan) {
            rowSpan = Math.min(evaluateSpan(column.colDef.rowSpan, cellParams, 'rowSpan', column.field, warned), rows.length - r);
            if (rowSpan > 1 && expandedRowIds && expandedRowIds.size > 0) {
                for (let k = 0; k < rowSpan - 1; k++) {
                    if (expandedRowIds.has(getRowId(rows[r + k]))) {
                        rowSpan = k + 1;
                        break;
                    }
                }
            }
        }

        if (colSpan > 1) {
            setRecord(colspanMap, rowId, column.field, { spannedByColSpan: false, cellProps: { colSpan } });
            for (let j = 1; j < colSpan; j++) {
                const covered = columns[i + j];
                setRecord(colspanMap, rowId, covered.field, {
                    spannedByColSpan: true,
                    leftVisibleCellIndex: i,
                    rightVisibleCellIndex: i + colSpan - 1,
                });
            }
            if (i >= leftCount && i < leftCount + unpinnedCount) {
                let ranges = unpinnedRanges.get(rowId);
                if (!ranges) {
                    ranges = [];
                    unpinnedRanges.set(rowId, ranges);
                }
                ranges.push(i - leftCount, i + colSpan - 1 - leftCount);
            }
        }

        if (rowSpan > 1) {
            setRecord(rowSpanningCaches.spannedCells, rowId, column.field, rowSpan);
            for (let j = i; j < i + colSpan; j++) {
                coveredUntil[j] = r + rowSpan;
                coverOriginRow[j] = rowId;
                coverOriginField[j] = column.field;
                coverOriginIndex[j] = r;
            }
            if (r + rowSpan > coverEnd) coverEnd = r + rowSpan;
        }

        return colSpan;
    };

    for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row._isSkeleton) continue;

        if (coverEnd <= r) {
            // Nothing is covered from above: only the columns that declare a span need a look.
            let next = 0;
            for (const i of spanColumnIndices) {
                if (i >= next) next = i + processCell(row, r, i);
            }
            continue;
        }

        let i = 0;
        while (i < columnCount) {
            if (coveredUntil[i] > r) {
                markHidden(getRowId(row), r, i);
                i++;
            } else if (columns[i].hasColSpan || columns[i].hasRowSpan) {
                i += processCell(row, r, i);
            } else {
                i++;
            }
        }
    }
}

function buildParams<R extends GridRowModel>(
    row: R,
    rowId: GridRowId,
    colDef: GridColDef<R>,
    rowIndex: number,
    colIndex: number,
    rowMetaMap: Map<GridRowId, GridRowMeta> | undefined,
    warned: Set<string>,
): GridRenderCellParams<R> {
    const raw = row[colDef.field as keyof R];
    let value: unknown = raw;
    if (colDef.valueGetter) {
        try {
            value = colDef.valueGetter({ row, field: colDef.field, value: raw });
        } catch (error) {
            warnOnce(warned, `valueGetter:${colDef.field}`, `valueGetter for column "${colDef.field}" threw while computing its span`, error);
            value = undefined;
        }
    }
    return { row, value, field: colDef.field, colDef, rowIndex, colIndex, rowMeta: rowMetaMap?.get(rowId) };
}

function evaluateSpan<R extends GridRowModel>(
    spec: GridColDef<R>['colSpan'],
    cellParams: GridRenderCellParams<R>,
    kind: 'colSpan' | 'rowSpan',
    field: string,
    warned: Set<string>,
): number {
    if (typeof spec === 'number') return normalizeSpan(spec);
    if (typeof spec !== 'function') return 1;
    try {
        return normalizeSpan(spec(cellParams));
    } catch (error) {
        warnOnce(warned, `${kind}:${field}`, `${kind} for column "${field}" threw; the cell is rendered without a span`, error);
        return 1;
    }
}

function warnOnce(warned: Set<string>, key: string, message: string, error: unknown): void {
    if (process.env.NODE_ENV === 'production' || warned.has(key)) return;
    warned.add(key);
    console.warn(`[OpenGridX] ${message}.`, error);
}

function setRecord<V>(
    target: Map<GridRowId, Record<ColumnKey, V>> | Record<GridRowId, Record<ColumnKey, V>>,
    rowId: GridRowId,
    field: string,
    value: V,
): void {
    if (target instanceof Map) {
        let record = target.get(rowId);
        if (!record) {
            record = {};
            target.set(rowId, record);
        }
        record[field] = value;
        return;
    }
    let record = target[rowId];
    if (!record) {
        record = {};
        target[rowId] = record;
    }
    record[field] = value;
}
