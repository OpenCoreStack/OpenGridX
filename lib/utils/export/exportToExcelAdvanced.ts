
import type { GridColDef, GridRowModel, GridAggregationModel, GridGroupedExportRow } from '../../types';
import { groupHeaderLabel } from './groupLabel';
import {
    aggregationForExport,
    formatExportAggregate,
    formatExportValue,
    getExportColumns,
    getRawExportValue,
    hasSelection,
    isCountAggregation,
    normalizeAggregateValue,
    pickSelectedRows,
    sanitizeSheetName,
} from './exportShared';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExcelColumnStyle {
    /** Numeric format string, e.g. '$#,##0.00', '0.00%', 'yyyy-mm-dd' */
    numFmt?: string;
    /** Override column width (characters). Defaults to colDef.width / 7 */
    width?: number;
    /** Horizontal alignment override */
    alignment?: 'left' | 'center' | 'right';
    /**
     * If true, the cell value (an image URL string, after `valueGetter`) is fetched and embedded
     * as an inline image in the cell. PNG, JPEG and GIF are supported (detected from the bytes).
     * Requires the image server to serve CORS headers. Falls back to the raw URL string if the
     * fetch fails or the image is in another format (a warning is logged to the console).
     */
    embedImage?: boolean;
    /** Width of the embedded image in pixels (default: 40) */
    imageWidth?: number;
    /** Height of the embedded image in pixels (default: 40) */
    imageHeight?: number;
}

export interface ExcelSheetDefinition {
    /**
     * Sheet tab name. Characters Excel rejects (`\ / ? * : [ ]`) become `-`, the name is cut to
     * 31 characters, and a duplicate name gets a " (2)" suffix.
     */
    name: string;
    /** Which rows to include. `'selected'` writes only `selectedRows` (none when nothing is selected). Default: 'all' */
    rows?: 'all' | 'selected';
    /** Include header row. Default: true */
    includeHeaders?: boolean;
    /** Include aggregation totals row at the bottom. Default: false */
    includeSummary?: boolean;
    /** Auto-filter dropdowns on header row. Default: true */
    autoFilter?: boolean;
    /** Freeze the header row. Default: true */
    frozenHeader?: boolean;
    /** Alternate row fill (#hex). Pass false to disable. Default: '#f8fafc' */
    alternateRowColor?: string | false;
}

export interface ExcelAdvancedExportOptions {
    /** Output filename (default: 'export.xlsx') */
    fileName?: string;
    /**
     * Sheet definitions. If omitted, a single 'Data' sheet is created
     * with all rows.
     *
     * Built-in special sheet type: `{ type: 'summary' }` renders a
     * standalone aggregation sheet.
     */
    sheets?: (ExcelSheetDefinition | { type: 'summary'; name?: string })[];
    /** Per-column style overrides, keyed by field name */
    columnStyles?: Record<string, ExcelColumnStyle>;
    /** Header row fill color (default: '#f1f5f9') */
    headerFillColor?: string;
    /** Header row text color (default: '#334155') */
    headerTextColor?: string;
    /** Header row font size (default: 10) */
    headerFontSize?: number;
    /** Body font size (default: 10) */
    bodyFontSize?: number;
    /** Current aggregation result */
    aggregationResult?: Record<string, unknown> | null;
    /** Current aggregation model */
    aggregationModel?: GridAggregationModel | null;
    /** Currently selected row IDs, written by `rows: 'selected'` sheets */
    selectedRows?: (string | number)[];
    /**
     * Grouped row structure, typically from `apiRef.current.getGroupedExportRows()`.
     * When provided, sheets with `rows: 'all'` are written in grouped order: group-header,
     * leaf, group-subtotal and grand-total rows, using Excel row outlining so groups
     * collapse natively. A `grand-total` entry replaces the sheet's `includeSummary` row.
     * Ignored for `rows: 'selected'` sheets.
     * @since v2.1
     */
    groupedRows?: GridGroupedExportRow[];
    /** Fill color for group-header rows in grouped export (default: '#e8eaf6') */
    groupHeaderFillColor?: string;
    /** Fill color for group-subtotal rows in grouped export (default: '#f0f4ff') */
    groupSubtotalFillColor?: string;
}

// ─── Cell values ──────────────────────────────────────────────────────────────

/** The only values handed to ExcelJS. Objects are never passed through, because ExcelJS reads
 * `{ formula }`, `{ hyperlink }`, `{ richText }` and `{ error }` objects as live cell content. */
type ExcelCellValue = string | number | boolean | Date | null;

/** A subtotal / total cell value, with the number format it needs when it differs from the column's. */
interface AggregateCell {
    value: ExcelCellValue;
    numFmt?: string;
}

type CellKind = 'number' | 'boolean' | 'date' | 'string';

function cellKind(colDef: GridColDef<GridRowModel>, value: unknown): CellKind {
    if (colDef.type === 'number') return 'number';
    if (colDef.type === 'boolean') return 'boolean';
    if (colDef.type === 'date') return 'date';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    return 'string';
}

/**
 * Excel date serials carry no timezone and are read as wall-clock time, while ExcelJS converts a
 * Date from its UTC instant. Re-anchor the local wall-clock fields at UTC so the cell shows the
 * date and time the grid shows. Invalid dates become null.
 */
function toExcelDate(date: Date): Date | null {
    if (Number.isNaN(date.getTime())) return null;
    return new Date(Date.UTC(
        date.getFullYear(), date.getMonth(), date.getDate(),
        date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds(),
    ));
}

const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/i;
const NUMERIC_STRING = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i;

/** A date-column value as a Date: null when missing or invalid, undefined when not a date at all. */
function dateCellValue(value: unknown): Date | null | undefined {
    if (value instanceof Date) return toExcelDate(value);
    if (typeof value === 'number') return Number.isFinite(value) ? toExcelDate(new Date(value)) : null;
    if (typeof value !== 'string') return undefined;
    const text = value.trim();
    const dateOnly = ISO_DATE_ONLY.exec(text);
    if (dateOnly) {
        // A calendar date: already wall-clock, so build it at UTC directly.
        const [year, month, day] = [Number(dateOnly[1]), Number(dateOnly[2]), Number(dateOnly[3])];
        const date = new Date(Date.UTC(year, month - 1, day));
        return date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : undefined;
    }
    if (ISO_DATE_TIME.test(text)) {
        const date = new Date(text.replace(' ', 'T'));
        return Number.isNaN(date.getTime()) ? undefined : toExcelDate(date);
    }
    return undefined;
}

/**
 * A native value for a number / boolean / date cell: null for an empty cell (missing, NaN,
 * Infinity, Invalid Date), undefined when the value is not of that kind (e.g. 'n/a' in a
 * number column).
 */
function typedCellValue(kind: Exclude<CellKind, 'string'>, value: unknown): number | boolean | Date | null | undefined {
    if (value == null || value === '') return null;
    if (kind === 'number') {
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        if (typeof value === 'bigint') {
            const n = Number(value);
            return Number.isSafeInteger(n) ? n : undefined;
        }
        if (typeof value === 'string' && NUMERIC_STRING.test(value.trim())) {
            const n = Number(value.trim());
            return Number.isFinite(n) ? n : undefined;
        }
        return undefined;
    }
    if (kind === 'boolean') {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            const text = value.trim().toLowerCase();
            if (text === 'true') return true;
            if (text === 'false') return false;
        }
        return undefined;
    }
    return dateCellValue(value);
}

/** Any value as inert cell content: primitives and Dates as themselves, objects as JSON text. */
function inertCellValue(value: unknown): ExcelCellValue {
    if (value == null) return null;
    if (typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (value instanceof Date) return toExcelDate(value);
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value) ?? String(value);
        } catch {
            return String(value);
        }
    }
    return String(value);
}

/**
 * The value of a data cell. Number, boolean and date cells are native (their `valueFormatter` is
 * not used, so Excel's number format applies); a value that is missing or not of the column's
 * kind falls back to the text the grid shows. Other cells get the `valueFormatter` text.
 */
function dataCellValue(row: GridRowModel, col: GridColDef<GridRowModel>): ExcelCellValue {
    const raw = getRawExportValue(row, col);
    const kind = cellKind(col, raw);
    if (kind !== 'string') {
        const typed = typedCellValue(kind, raw);
        if (typed != null) return typed;
        if (!col.valueFormatter) return typed === null ? null : inertCellValue(raw);
    }
    return col.valueFormatter ? formatExportValue(row, col, raw) : inertCellValue(raw);
}

// ─── Number formats ──────────────────────────────────────────────────────────

const INTEGER_FORMAT = '#,##0';
const DECIMAL_FORMAT = '#,##0.##';

/**
 * Default format for a number-column value. '#,##0.##' alone shows whole numbers with a trailing
 * decimal point in Excel ("5."), so whole numbers get '#,##0'.
 */
function defaultNumberFormat(value: number): string {
    return Number.isInteger(value) ? INTEGER_FORMAT : DECIMAL_FORMAT;
}

function columnNumFmt(colDef: GridColDef<GridRowModel>, style: ExcelColumnStyle | undefined): string | undefined {
    if (style?.numFmt) return style.numFmt;
    if (colDef.type === 'date') return 'yyyy-mm-dd';
    return undefined;
}

/** The number format for a native cell value, or undefined to keep the column's format. */
function cellNumFmt(colDef: GridColDef<GridRowModel>, style: ExcelColumnStyle | undefined, value: ExcelCellValue): string | undefined {
    if (style?.numFmt || typeof value !== 'number' || colDef.type !== 'number') return undefined;
    return defaultNumberFormat(value);
}

// ─── Column display width (chars) ────────────────────────────────────────────

function colWidth(colDef: GridColDef<GridRowModel>, override?: number): number {
    if (override != null) return override;
    const px = (colDef.width ?? 120) as number;
    return Math.min(60, Math.max(8, (px - 5) / 7));
}

// ─── Image helpers ────────────────────────────────────────────────────────────

type SupportedImageExt = 'png' | 'jpeg' | 'gif';

/**
 * The image format from the file's magic bytes. Excel can only show PNG, JPEG and GIF here; SVG,
 * WebP, AVIF and anything else return null so the URL text is written instead.
 */
function detectImageExtension(bytes: Uint8Array): SupportedImageExt | null {
    if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png';
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
    if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'gif';
    return null;
}

/** The image URL of an embedImage cell: the cell value after `valueGetter`. */
function imageUrlOf(row: GridRowModel, col: GridColDef<GridRowModel>): string | null {
    const value = getRawExportValue(row, col);
    return typeof value === 'string' && value ? value : null;
}

/**
 * Fetch a list of image URLs in parallel.
 * CORS failures and unsupported formats are logged and skipped — raw URL text is written to the
 * cell instead so data is never silently lost.
 */
async function fetchImages(
    urls: string[]
): Promise<Map<string, { buffer: ArrayBuffer; extension: SupportedImageExt }>> {
    const settled = await Promise.allSettled(
        urls.map(async (url) => {
            let bytes: Uint8Array;
            if (url.startsWith('data:')) {
                // ── data: URI — decode base64 directly, no network needed ──────────
                const b64 = url.slice(url.indexOf(',') + 1);
                const binary = atob(b64);
                bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            } else {
                // ── Remote URL — fetch with CORS ──────────────────────────────────
                const res = await fetch(url, { mode: 'cors' });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                bytes = new Uint8Array(await res.arrayBuffer());
            }
            const ext = detectImageExtension(bytes);
            if (!ext) throw new Error('unsupported image format (only PNG, JPEG and GIF can be embedded)');
            return { url, buffer: bytes.slice().buffer, ext };
        })
    );
    const map = new Map<string, { buffer: ArrayBuffer; extension: SupportedImageExt }>();
    settled.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            map.set(result.value.url, { buffer: result.value.buffer, extension: result.value.ext });
        } else {
            console.warn(
                `[exportToExcelAdvanced] Cannot embed image "${urls[i]}" ` +
                `(CORS/network error or unsupported format — raw URL written as fallback):`,
                result.reason
            );
        }
    });
    return map;
}

// ─── Main export function ─────────────────────────────────────────────────────

/**
 * Export the grid data to a real XLSX file using ExcelJS.
 * Supports: typed cells, styled headers, column widths, frozen rows,
 * auto-filter, alternating row colors, aggregation totals, and multi-sheet.
 *
 * ExcelJS is loaded lazily so it does not affect bundle size for apps
 * that only use CSV/JSON export.
 */
export async function exportToExcelAdvanced<R extends GridRowModel>(
    rows: R[],
    columns: GridColDef<R>[],
    options: ExcelAdvancedExportOptions = {}
): Promise<void> {
    const {
        fileName = 'export.xlsx',
        sheets: sheetDefs,
        columnStyles = {},
        headerFillColor = '#f1f5f9',
        headerTextColor = '#334155',
        headerFontSize = 10,
        bodyFontSize = 10,
        aggregationResult = null,
        aggregationModel = null,
        selectedRows,
        groupedRows,
        groupHeaderFillColor = '#e8eaf6',
        groupSubtotalFillColor = '#f0f4ff',
    } = options;

    // Lazy-load ExcelJS to keep initial bundle lean
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'OpenGridX';
    workbook.created = new Date();

    const allColumns = columns as unknown as GridColDef<GridRowModel>[];
    const exportColumns: GridColDef<GridRowModel>[] = getExportColumns(allColumns);

    const allRows: GridRowModel[] = rows as GridRowModel[];
    // A 'selected' sheet writes the selection only: an empty selection is an empty sheet.
    const sRows: GridRowModel[] = hasSelection(selectedRows) ? pickSelectedRows(allRows, selectedRows) : [];

    // Normalise sheet definitions
    const resolvedSheets: (ExcelSheetDefinition | { type: 'summary'; name?: string })[] =
        sheetDefs ?? [{ name: 'Data', rows: 'all', includeHeaders: true, includeSummary: false }];
    const usedSheetNames = new Set<string>();

    // Workbook-level image cache — one fetch per URL, reused across multiple sheets
    const imageCache = new Map<string, number>();

    /**
     * A subtotal / total cell. Numbers stay numeric: `count` / `unique` in a plain integer format
     * (not the column's date or currency format), `min` / `max` of a date column as a date, and
     * other numbers in the column's format. Anything else is the formatted text.
     */
    const aggregateCell = (col: GridColDef<GridRowModel>, values: Record<string, unknown>): AggregateCell => {
        const raw = values[col.field];
        const fnName = aggregationModel?.[col.field];
        if (raw == null) return { value: null };
        const normalized = normalizeAggregateValue(col, fnName, raw);
        if (typeof normalized === 'number') {
            if (!Number.isFinite(normalized)) return { value: null };
            if (isCountAggregation(fnName)) return { value: normalized, numFmt: INTEGER_FORMAT };
            return { value: normalized, numFmt: cellNumFmt(col, columnStyles[col.field], normalized) };
        }
        if (normalized instanceof Date) return { value: toExcelDate(normalized) };
        return { value: formatExportAggregate(col, fnName, raw, values) };
    };

    // ─── Build each sheet ────────────────────────────────────────────────────

    for (const sheetDef of resolvedSheets) {

        // ── Summary-only sheet ───────────────────────────────────────────────
        if ('type' in sheetDef && sheetDef.type === 'summary') {
            if (!aggregationResult || !aggregationModel) continue;
            const ws = workbook.addWorksheet(sanitizeSheetName(sheetDef.name ?? 'Summary', usedSheetNames));

            // Title row
            ws.addRow(['Summary / Aggregation Totals']);
            ws.getRow(1).font = { bold: true, size: headerFontSize + 2, color: { argb: argb(headerTextColor) } };
            ws.addRow([]);

            // Header: Field | Function | Value
            const hdr = ws.addRow(['Column', 'Function', 'Value']);
            hdr.eachCell(cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(headerFillColor) } };
                cell.font = { bold: true, size: headerFontSize, color: { argb: argb(headerTextColor) } };
                cell.border = bottomBorder();
            });

            exportColumns.forEach(col => {
                const fn = aggregationModel[col.field];
                if (fn == null || aggregationResult[col.field] == null) return;
                const { value, numFmt } = aggregateCell(col, aggregationResult);
                const row = ws.addRow([col.headerName ?? col.field, fn.toUpperCase(), value]);
                const valueCell = row.getCell(3);
                const format = numFmt ?? columnNumFmt(col, columnStyles[col.field]);
                if (format) valueCell.numFmt = format;
                valueCell.alignment = { horizontal: 'right' };
                valueCell.font = { bold: true, size: bodyFontSize };
            });

            ws.getColumn(1).width = 20;
            ws.getColumn(2).width = 12;
            ws.getColumn(3).width = 18;
            continue;
        }

        // ── Data sheet ───────────────────────────────────────────────────────
        const def = sheetDef as ExcelSheetDefinition;
        const {
            name = 'Data',
            rows: rowScope = 'all',
            includeHeaders = true,
            includeSummary = false,
            autoFilter = true,
            frozenHeader = true,
            alternateRowColor = '#f8fafc',
        } = def;

        const useGrouped = rowScope === 'all' && Boolean(groupedRows && groupedRows.length > 0);
        const rowsToExport = rowScope === 'selected'
            ? sRows
            : useGrouped
                ? groupedRows!.flatMap(e => (e.type === 'leaf' && e.row ? [e.row] : []))
                : allRows;

        // ─ Pre-fetch images for this sheet ──────────────────────────────────────────
        const imageColumns = exportColumns.filter(col => columnStyles[col.field]?.embedImage);
        if (imageColumns.length > 0) {
            const urlsNeeded: string[] = [];
            const seen = new Set<string>();
            rowsToExport.forEach(row => {
                imageColumns.forEach(col => {
                    const url = imageUrlOf(row, col);
                    if (url && !imageCache.has(url) && !seen.has(url)) {
                        urlsNeeded.push(url);
                        seen.add(url);
                    }
                });
            });
            if (urlsNeeded.length > 0) {
                const fetched = await fetchImages(urlsNeeded);
                for (const [url, { buffer, extension }] of fetched) {
                    const imgId = workbook.addImage({ buffer, extension });
                    imageCache.set(url, imgId);
                }
            }
        }

        const ws = workbook.addWorksheet(sanitizeSheetName(name, usedSheetNames));

        // ── Set column definitions ───────────────────────────────────────────
        ws.columns = exportColumns.map(col => ({
            key: col.field,
            width: colWidth(col, columnStyles[col.field]?.width),
            style: {
                numFmt: columnNumFmt(col, columnStyles[col.field]),
            }
        }));

        /** Every cell of a row, including empty ones (ExcelJS eachCell skips them). */
        const forEachColumnCell = (row: import('exceljs').Row, fn: (cell: import('exceljs').Cell, colDef: GridColDef<GridRowModel>, colIndex: number) => void) => {
            exportColumns.forEach((colDef, i) => fn(row.getCell(i + 1), colDef, i + 1));
        };

        // ── Header row ───────────────────────────────────────────────────────
        if (includeHeaders) {
            const headerValues = exportColumns.map(col => col.headerName ?? col.field);
            const headerRow = ws.addRow(headerValues);
            headerRow.height = 20;

            forEachColumnCell(headerRow, (cell, colDef) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(headerFillColor) } };
                cell.font = { bold: true, size: headerFontSize, color: { argb: argb(headerTextColor) } };
                cell.alignment = {
                    horizontal: columnStyles[colDef.field]?.alignment ??
                        (colDef.type === 'number' ? 'right' : 'left'),
                    vertical: 'middle'
                };
                cell.border = bottomBorder();
            });

            if (autoFilter) {
                ws.autoFilter = {
                    from: { row: 1, column: 1 },
                    to: { row: 1, column: exportColumns.length }
                };
            }

            if (frozenHeader) {
                ws.views = [{ state: 'frozen', ySplit: 1, showGridLines: false }];
            } else {
                ws.views = [{ showGridLines: false }];
            }
        }

        // ── Data rows ────────────────────────────────────────────────────────
        // ExcelJS addImage tl.row is 0-based.
        // Header occupies index 0 when present; first data row is at index 1.
        let excelRowIdx = includeHeaders ? 1 : 0;

        const writeDataRow = (row: GridRowModel, rowIdx: number, outlineLevel: number) => {
            const cellValues = exportColumns.map(col => {
                // Image columns: write empty string; image placed below
                if (columnStyles[col.field]?.embedImage) return '';
                return dataCellValue(row, col);
            });

            const dataRow = ws.addRow(cellValues);
            dataRow.font = { size: bodyFontSize };
            if (outlineLevel > 0) dataRow.outlineLevel = outlineLevel;

            const striped = Boolean(alternateRowColor) && rowIdx % 2 === 1;

            // Per-cell number format, stripe, alignment and web-like borders (empty cells included)
            forEachColumnCell(dataRow, (cell, colDef, colIndex) => {
                const numFmt = cellNumFmt(colDef, columnStyles[colDef.field], cellValues[colIndex - 1]);
                if (numFmt) cell.numFmt = numFmt;
                if (striped && alternateRowColor) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(alternateRowColor) } };
                }
                cell.alignment = {
                    horizontal: columnStyles[colDef.field]?.alignment ?? (colDef.type === 'number' ? 'right' : 'left'),
                    vertical: 'middle',
                };
                cell.border = { bottom: { style: 'thin', color: { argb: 'FFf1f5f9' } } }; // Slate 50
            });

            // ── Embed images for this row ─────────────────────────────────────
            //
            // ExcelJS images are floating objects anchored at tl.{col,row}.
            // Both values accept fractions (0–1 represents one cell length).
            // Adding an offset fraction shifts the anchor rightward / downward,
            // letting us centre the image inside its cell.

            if (imageColumns.length > 0) {
                // Pre-compute the final row height so vertical centring is exact.
                const maxImgH = imageColumns.reduce((max, col) => {
                    return Math.max(max, columnStyles[col.field]?.imageHeight ?? 40);
                }, 0);
                // ExcelJS row height = points; 1 pt ≈ 1.333 px at 96 dpi
                const rowHeightPt = Math.ceil(maxImgH / 1.333);
                const rowHeightPx = rowHeightPt * 1.333;
                dataRow.height = rowHeightPt;

                imageColumns.forEach(col => {
                    const colIdx = exportColumns.indexOf(col);
                    const url    = imageUrlOf(row, col);
                    const imgId  = url ? imageCache.get(url) : undefined;

                    if (imgId === undefined) {
                        // Fetch failed or unsupported format — write URL text so data isn't lost
                        dataRow.getCell(colIdx + 1).value = url ?? '';
                        return;
                    }

                    const style = columnStyles[col.field];
                    const imgW  = style?.imageWidth  ?? 40;
                    const imgH  = style?.imageHeight ?? 40;

                    // ── Horizontal centre within the column ───────────────────
                    // ws.getColumn uses 1-based index; width is in Excel "chars".
                    // Excel column width in pixels for Calibri 11 (MaxDigitWidth=7, Padding=5).
                    const colWidthChars = (ws.getColumn(colIdx + 1).width ?? 8) as number;
                    const colWidthPx    = colWidthChars * 7 + 5;
                    const hGapPx        = Math.max(0, colWidthPx - imgW) / 2;

                    // ── Vertical centre within the row ────────────────────────
                    const vGapPx        = Math.max(0, rowHeightPx - imgH) / 2;

                    // ExcelJS native offsets are in EMUs (1 pixel = 9525 EMUs).
                    // This provides absolute pixel precision regardless of cell size.
                    ws.addImage(imgId, {
                        tl: {
                            col: colIdx,
                            row: excelRowIdx,
                            nativeColOff: Math.floor(hGapPx * 9525),
                            nativeRowOff: Math.floor(vGapPx * 9525),
                        },
                        ext: { width: imgW, height: imgH },
                        editAs: 'oneCell',
                    } as unknown as import('exceljs').ImageRange);
                });
            } else {
                dataRow.height = 16;
            }

            excelRowIdx++;
        };

        const groupLabel = (entry: GridGroupedExportRow): string => groupHeaderLabel(entry, allColumns);

        const writeSummaryRow = (label: string, values: Record<string, unknown>, fill: string, outlineLevel: number, bold: boolean) => {
            const cells = exportColumns.map((col, i): AggregateCell => (i === 0 && values[col.field] == null ? { value: label } : aggregateCell(col, values)));
            const summaryRow = ws.addRow(cells.map(c => c.value));
            summaryRow.height = 18;
            if (outlineLevel > 0) summaryRow.outlineLevel = outlineLevel;
            summaryRow.font = { bold, italic: !bold, size: bodyFontSize, color: { argb: argb(headerTextColor) } };
            forEachColumnCell(summaryRow, (cell, colDef, colIndex) => {
                const numFmt = cells[colIndex - 1].numFmt;
                if (numFmt) cell.numFmt = numFmt;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(fill) } };
                cell.alignment = { horizontal: colIndex === 1 ? 'left' : (colDef.type === 'number' ? 'right' : 'left'), vertical: 'middle' };
                cell.border = topBorder();
            });
            excelRowIdx++;
        };

        let wroteGrandTotal = false;

        if (useGrouped) {
            let stripe = 0;
            groupedRows!.forEach(entry => {
                if (entry.type === 'group-header') {
                    const groupHeaderRow = ws.addRow([groupLabel(entry)]);
                    groupHeaderRow.height = 18;
                    if (entry.depth > 0) groupHeaderRow.outlineLevel = entry.depth;
                    groupHeaderRow.font = { bold: true, size: bodyFontSize, color: { argb: argb(headerTextColor) } };
                    for (let c = 1; c <= exportColumns.length; c++) {
                        groupHeaderRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(groupHeaderFillColor) } };
                    }
                    groupHeaderRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', indent: entry.depth };
                    excelRowIdx++;
                    stripe = 0;
                } else if (entry.type === 'leaf' && entry.row) {
                    writeDataRow(entry.row, stripe++, entry.depth);
                } else if (entry.type === 'group-subtotal' && entry.aggregatedValues) {
                    writeSummaryRow('Subtotal', entry.aggregatedValues, groupSubtotalFillColor, entry.depth, false);
                } else if (entry.type === 'grand-total' && entry.aggregatedValues) {
                    writeSummaryRow('Grand Total', entry.aggregatedValues, headerFillColor, 0, true);
                    wroteGrandTotal = true;
                }
            });
            ws.properties.outlineProperties = { summaryBelow: true, summaryRight: false };
        } else {
            rowsToExport.forEach((row, rowIdx) => writeDataRow(row, rowIdx, 0));
        }

        // ── Aggregation totals row ────────────────────────────────────────────
        // A 'selected' sheet's totals are recomputed over the rows it contains.
        const sheetTotals = aggregationForExport(rowsToExport, rowScope === 'selected', allColumns, aggregationResult, aggregationModel);
        if (includeSummary && !wroteGrandTotal && sheetTotals && aggregationModel) {
            // Label row
            const labelValues = exportColumns.map(col => {
                const fn = aggregationModel[col.field];
                return fn ? fn.toUpperCase() : '';
            });
            const labelRow = ws.addRow(labelValues);
            labelRow.height = 16;
            labelRow.font = { size: bodyFontSize - 1, italic: true, color: { argb: 'FF94a3b8' } };
            forEachColumnCell(labelRow, cell => {
                cell.alignment = { horizontal: 'right', vertical: 'middle' };
                cell.border = { top: { style: 'thin', color: { argb: 'FFcbd5e1' } } };
            });

            // Value row
            const totals = exportColumns.map((col): AggregateCell => (aggregationModel[col.field] == null ? { value: null } : aggregateCell(col, sheetTotals)));
            const totalRow = ws.addRow(totals.map(t => t.value));
            totalRow.height = 18;
            totalRow.font = { bold: true, size: bodyFontSize, color: { argb: argb(headerTextColor) } };
            forEachColumnCell(totalRow, (cell, _colDef, colIndex) => {
                const numFmt = totals[colIndex - 1].numFmt;
                if (numFmt) cell.numFmt = numFmt;
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(headerFillColor) } };
                cell.alignment = { horizontal: 'right', vertical: 'middle' };
                cell.border = topBorder();
            });
        }
    }

    // ─── Write & download ────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert '#rrggbb' or '#rgb' to ExcelJS ARGB 'FFrrggbb' */
function argb(hex: string): string {
    const clean = hex.replace('#', '');
    if (clean.length === 3) {
        return 'FF' + clean.split('').map(c => c + c).join('');
    }
    if (clean.length === 6) {
        return 'FF' + clean;
    }
    return 'FF' + clean.padEnd(6, '0');
}

function bottomBorder(): Partial<import('exceljs').Borders> {
    return { bottom: { style: 'medium', color: { argb: 'FFcbd5e1' } } };
}

function topBorder(): Partial<import('exceljs').Borders> {
    return { top: { style: 'medium', color: { argb: 'FFcbd5e1' } } };
}
