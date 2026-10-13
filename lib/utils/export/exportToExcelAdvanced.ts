
import type {
    GridColDef,
    GridRowId,
    GridRowModel,
    GridValidRowModel,
    GridAggregationModel,
    GridGroupedExportRow,
} from '../../types';
import { groupHeaderLabel } from './groupLabel';
import {
    aggregationForExport,
    formatExportAggregate,
    getExportColumns,
    hasSelection,
    isCountAggregation,
    normalizeAggregateValue,
    pickSelectedRows,
    sanitizeSheetName,
} from './exportShared';
import {
    AggregateCell,
    toExcelDate,
    dataCellValue,
    INTEGER_FORMAT,
    columnNumFmt,
    cellNumFmt,
    colWidth,
    imageUrlOf,
    fetchImages,
    argb,
    bottomBorder,
    topBorder,
} from './excelCells';

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

export interface ExcelAdvancedExportOptions<R extends GridValidRowModel = GridRowModel> {
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
     * The grid's `getRowId`, when it has one: `selectedRows` holds those ids, and the grid does not
     * copy them onto `row.id` (v3.0+). Defaults to `row.id`.
     */
    getRowId?: (row: R) => GridRowId;
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

// ─── Main export function ─────────────────────────────────────────────────────

/**
 * Export the grid data to a real XLSX file using ExcelJS.
 * Supports: typed cells, styled headers, column widths, frozen rows,
 * auto-filter, alternating row colors, aggregation totals, and multi-sheet.
 *
 * ExcelJS is loaded lazily so it does not affect bundle size for apps
 * that only use CSV/JSON export.
 */
export function exportToExcelAdvanced<R extends GridValidRowModel = GridRowModel>(rows: R[], columns: GridColDef<R>[], options?: ExcelAdvancedExportOptions<R>): Promise<void>;
export function exportToExcelAdvanced<R extends GridValidRowModel = GridRowModel>(rows: R[], columns: GridColDef[], options?: ExcelAdvancedExportOptions<R>): Promise<void>;
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
        getRowId,
        groupedRows,
        groupHeaderFillColor = '#e8eaf6',
        groupSubtotalFillColor = '#f0f4ff',
    } = options;

    // Lazy-load ExcelJS to keep initial bundle lean. The import must stay inside `try`: webpack
    // (Next.js 15, plain webpack 5) and Turbopack (Next.js 16) treat an unresolvable import() in a
    // try block as optional, so apps without the peer still build. Outside `try` the build fails.
    let ExcelJS: typeof import('exceljs');
    try {
        ExcelJS = (await import('exceljs')).default;
    } catch {
        throw new Error("exportToExcelAdvanced requires 'exceljs'. Run: npm install exceljs");
    }
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'OpenGridX';
    workbook.created = new Date();

    const allColumns = columns as unknown as GridColDef<GridRowModel>[];
    const exportColumns: GridColDef<GridRowModel>[] = getExportColumns(allColumns);

    const allRows: GridRowModel[] = rows as GridRowModel[];
    // A 'selected' sheet writes the selection only: an empty selection is an empty sheet.
    const sRows: GridRowModel[] = hasSelection(selectedRows) ? pickSelectedRows(allRows, selectedRows, getRowId) : [];

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
