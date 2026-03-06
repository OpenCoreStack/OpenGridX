
import type { GridColDef, GridRowModel, GridAggregationModel } from '../../types';
import { formatAggregationValue } from '../../hooks/features/useAggregation';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExcelColumnStyle {
    /** Numeric format string, e.g. '$#,##0.00', '0.00%', 'yyyy-mm-dd' */
    numFmt?: string;
    /** Override column width (characters). Defaults to colDef.width / 7 */
    width?: number;
    /** Horizontal alignment override */
    alignment?: 'left' | 'center' | 'right';
    /**
     * If true, the cell value (expected to be an image URL string) will be
     * fetched and embedded as an inline image in the cell.
     * Requires the image server to serve CORS headers. Falls back to the
     * raw URL string if the fetch fails (a warning is logged to the console).
     */
    embedImage?: boolean;
    /** Width of the embedded image in pixels (default: 40) */
    imageWidth?: number;
    /** Height of the embedded image in pixels (default: 40) */
    imageHeight?: number;
}

export interface ExcelSheetDefinition {
    /** Sheet tab name (max 31 chars) */
    name: string;
    /** Which rows to include. Default: 'all' */
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
    aggregationResult?: Record<string, any> | null;
    /** Current aggregation model */
    aggregationModel?: GridAggregationModel | null;
    /** Currently selected row IDs */
    selectedRows?: (string | number)[];
}

// ─── Cell type inference ──────────────────────────────────────────────────────

function inferCellType(colDef: GridColDef<any>, value: any): 'number' | 'boolean' | 'date' | 'string' {
    if (colDef.type === 'number') return 'number';
    if (colDef.type === 'boolean') return 'boolean';
    if (colDef.type === 'date') return 'date';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    return 'string';
}

// ─── Default numFmt per column type ──────────────────────────────────────────

function defaultNumFmt(colDef: GridColDef<any>): string | undefined {
    if (colDef.type === 'number') return '#,##0.##';
    if (colDef.type === 'date') return 'yyyy-mm-dd';
    return undefined;
}

// ─── Column display width (chars) ────────────────────────────────────────────

function colWidth(colDef: GridColDef<any>, override?: number): number {
    if (override != null) return override;
    const px = (colDef.width ?? 120) as number;
    return Math.min(60, Math.max(8, (px - 5) / 7));
}

// ─── Image helpers ────────────────────────────────────────────────────────────

type SupportedImageExt = 'png' | 'jpeg' | 'gif';

function imageExtension(url: string, contentType?: string | null): SupportedImageExt {
    const ct = contentType ?? '';
    if (ct.includes('jpeg') || ct.includes('jpg')) return 'jpeg';
    if (ct.includes('gif')) return 'gif';
    const path = url.split('?')[0].toLowerCase();
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'jpeg';
    if (path.endsWith('.gif')) return 'gif';
    return 'png';
}

/**
 * Fetch a list of image URLs in parallel.
 * CORS failures are logged and skipped — raw URL text is written to the cell
 * instead so data is never silently lost.
 */
async function fetchImages(
    urls: string[]
): Promise<Map<string, { buffer: ArrayBuffer; extension: SupportedImageExt }>> {
    const settled = await Promise.allSettled(
        urls.map(async (url) => {
            // ── data: URI — decode base64 directly, no network needed ──────────
            if (url.startsWith('data:')) {
                const commaIdx = url.indexOf(',');
                const header   = url.slice(0, commaIdx);
                const b64      = url.slice(commaIdx + 1);
                const binary   = atob(b64);
                const uint8    = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) uint8[i] = binary.charCodeAt(i);
                const mimeMatch = header.match(/data:([^;,]+)/);
                const mime = mimeMatch?.[1] ?? 'image/png';
                let ext: SupportedImageExt = 'png';
                if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpeg';
                else if (mime.includes('gif')) ext = 'gif';
                return { url, buffer: uint8.buffer as ArrayBuffer, ext };
            }

            // ── Remote URL — fetch with CORS ──────────────────────────────────
            const res = await fetch(url, { mode: 'cors' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buffer = await res.arrayBuffer();
            const ext = imageExtension(url, res.headers.get('content-type'));
            return { url, buffer, ext };
        })
    );
    const map = new Map<string, { buffer: ArrayBuffer; extension: SupportedImageExt }>();
    settled.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            map.set(result.value.url, { buffer: result.value.buffer, extension: result.value.ext });
        } else {
            console.warn(
                `[exportToExcelAdvanced] Cannot embed image "${urls[i]}" ` +
                `(CORS/network error — raw URL written as fallback):`,
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
    } = options;

    // Lazy-load ExcelJS to keep initial bundle lean
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'OpenGridX';
    workbook.created = new Date();

    // Filter system columns — cast to GridColDef<any> to avoid generic covariance issues
    const exportColumns: GridColDef<any>[] = (columns as GridColDef<any>[]).filter(col =>
        col.field !== '__check__' &&
        col.field !== '__actions__' &&
        !(col as any).isSpacer
    );

    const allRows: any[] = rows as any[];
    const sRows: any[] = (selectedRows && selectedRows.length > 0
        ? rows.filter(r => selectedRows.includes(r.id))
        : rows) as any[];

    // Normalise sheet definitions
    const resolvedSheets: (ExcelSheetDefinition | { type: 'summary'; name?: string })[] =
        sheetDefs ?? [{ name: 'Data', rows: 'all', includeHeaders: true, includeSummary: false }];

    // Workbook-level image cache — one fetch per URL, reused across multiple sheets
    const imageCache = new Map<string, number>();

    // ─── Build each sheet ────────────────────────────────────────────────────

    for (const sheetDef of resolvedSheets) {

        // ── Summary-only sheet ───────────────────────────────────────────────
        if ('type' in sheetDef && sheetDef.type === 'summary') {
            if (!aggregationResult || !aggregationModel) continue;
            const ws = workbook.addWorksheet(sheetDef.name ?? 'Summary');

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
                const fn = aggregationModel![col.field];
                const val = aggregationResult![col.field];
                if (fn == null || val == null) return;
                let formatted = val;
                if (col.valueFormatter) {
                    formatted = col.valueFormatter({ value: val, row: {} as R, field: col.field });
                } else {
                    formatted = formatAggregationValue(val, fn);
                }
                const row = ws.addRow([col.headerName ?? col.field, fn.toUpperCase(), formatted]);
                row.getCell(3).alignment = { horizontal: 'right' };
                row.getCell(3).font = { bold: true, size: bodyFontSize };
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

        const rowsToExport = rowScope === 'selected' ? sRows : allRows;

        // ─ Pre-fetch images for this sheet ──────────────────────────────────────────
        const imageColumns = exportColumns.filter(col => columnStyles[col.field]?.embedImage);
        if (imageColumns.length > 0) {
            const urlsNeeded: string[] = [];
            const seen = new Set<string>();
            rowsToExport.forEach(row => {
                imageColumns.forEach(col => {
                    const val = (row as any)[col.field];
                    if (typeof val === 'string' && val && !imageCache.has(val) && !seen.has(val)) {
                        urlsNeeded.push(val);
                        seen.add(val);
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

        const ws = workbook.addWorksheet(name);

        // ── Set column definitions ───────────────────────────────────────────
        ws.columns = exportColumns.map(col => ({
            key: col.field,
            width: colWidth(col, columnStyles[col.field]?.width),
            style: {
                numFmt: columnStyles[col.field]?.numFmt ?? defaultNumFmt(col),
            }
        }));

        // ── Header row ───────────────────────────────────────────────────────
        if (includeHeaders) {
            const headerValues = exportColumns.map(col => col.headerName ?? col.field);
            const headerRow = ws.addRow(headerValues);
            headerRow.height = 20;

            headerRow.eachCell((cell, colIndex) => {
                const colDef = exportColumns[colIndex - 1];
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(headerFillColor) } };
                cell.font = { bold: true, size: headerFontSize, color: { argb: argb(headerTextColor) } };
                cell.alignment = {
                    horizontal: columnStyles[colDef?.field]?.alignment ??
                        (colDef?.type === 'number' ? 'right' : 'left'),
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

        rowsToExport.forEach((row, rowIdx) => {
            const cellValues = exportColumns.map(col => {
                // Image columns: write empty string; image placed below
                if (columnStyles[col.field]?.embedImage) return '';

                let value: any = (row as any)[col.field];
                if (col.valueGetter) {
                    value = col.valueGetter({ row, field: col.field, value });
                }
                const cellType = inferCellType(col, value);
                if (cellType === 'string' && col.valueFormatter && value != null) {
                    value = col.valueFormatter({ value, row, field: col.field });
                }
                return value;
            });

            const dataRow = ws.addRow(cellValues);
            dataRow.font = { size: bodyFontSize };

            // Alternate row background
            if (alternateRowColor && rowIdx % 2 === 1) {
                dataRow.eachCell(cell => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(alternateRowColor) } };
                });
            }

            // Per-cell alignment and explicit web-like borders
            dataRow.eachCell((cell, colIndex) => {
                const colDef = exportColumns[colIndex - 1];
                if (!colDef) return;
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
                    const url    = (row as any)[col.field];
                    const imgId  = typeof url === 'string' ? imageCache.get(url) : undefined;

                    if (imgId === undefined) {
                        // Fetch failed — write URL text so data isn't lost
                        dataRow.getCell(colIdx + 1).value = typeof url === 'string' ? url : '';
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
                    } as any);
                });
            } else {
                dataRow.height = 16;
            }

            excelRowIdx++;
        });

        // ── Aggregation totals row ────────────────────────────────────────────
        if (includeSummary && aggregationResult && aggregationModel) {
            // Label row
            const labelValues = exportColumns.map(col => {
                const fn = aggregationModel![col.field];
                return fn ? fn.toUpperCase() : '';
            });
            const labelRow = ws.addRow(labelValues);
            labelRow.height = 16;
            labelRow.font = { size: bodyFontSize - 1, italic: true, color: { argb: 'FF94a3b8' } };
            labelRow.eachCell(cell => {
                cell.alignment = { horizontal: 'right', vertical: 'middle' };
                cell.border = { top: { style: 'thin', color: { argb: 'FFcbd5e1' } } };
            });

            // Value row
            const totalValues = exportColumns.map(col => {
                const fn = aggregationModel![col.field];
                const val = aggregationResult![col.field];
                if (fn == null || val == null) return '';
                if (col.valueFormatter) {
                    return col.valueFormatter({ value: val, row: {} as R, field: col.field });
                }
                return formatAggregationValue(val, fn);
            });
            const totalRow = ws.addRow(totalValues);
            totalRow.height = 18;
            totalRow.font = { bold: true, size: bodyFontSize, color: { argb: argb(headerTextColor) } };
            totalRow.eachCell(cell => {
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
