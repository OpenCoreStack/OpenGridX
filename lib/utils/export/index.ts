
import type { GridColDef, GridRowId, GridRowModel, GridValidRowModel, GridAggregationModel, GridGroupedExportRow } from '../../types';
import { groupHeaderLabel } from './groupLabel';
import {
    aggregationForExport,
    escapeHTML,
    formatExportAggregate,
    formatExportValue,
    getExportColumns,
    getRawExportValue,
    hasSelection,
    isNonTextValue,
    neutralizeFormula,
    pickExportedAggregates,
    rowsForExport,
    sanitizeSheetName,
    shouldExportGrouped,
    summaryLabelText,
} from './exportShared';

export interface CsvExportOptions<R extends GridValidRowModel = GridRowModel> {
    fileName?: string;
    includeHeaders?: boolean;
    delimiter?: string;
    /**
     * Export only these row IDs. A non-empty selection takes precedence over `groupedRows` (the
     * selected rows are exported flat), and the totals row is recomputed over the selected rows.
     */
    selectedRows?: (string | number)[];
    /**
     * The grid's `getRowId`, when it has one: `selectedRows` holds those ids, and the grid does not
     * copy them onto `row.id` (v3.0+). Defaults to `row.id`.
     */
    getRowId?: (row: R) => GridRowId;
    aggregationResult?: Record<string, unknown> | null;
    aggregationModel?: GridAggregationModel | null;
    /** When provided, emits group headers, leaf rows, subtotals, and a grand total instead of a flat row list. */
    groupedRows?: GridGroupedExportRow[];
    /**
     * Prefix text cells that start with `=`, `+`, `-`, `@`, tab or carriage return with `'`, so
     * spreadsheet apps show them as text instead of running them as formulas (CSV injection).
     * Plain signed numbers are left alone. Default: `true`
     * @since v3.0
     */
    escapeFormulas?: boolean;
    /**
     * Start the file with a UTF-8 byte-order mark, so Excel reads non-ASCII text (é, ü, ₹, 中文)
     * correctly. Default: `true`
     * @since v3.0
     */
    bom?: boolean;
}

/** One exported cell of a data row: its text, and whether that text was formatted from a non-text value. */
interface ExportCell {
    text: string;
    raw: unknown;
}

function exportCell<R extends GridRowModel>(row: R, col: GridColDef<R>): ExportCell {
    const raw = getRawExportValue(row, col);
    return { text: formatExportValue(row, col, raw), raw };
}

/** Aggregate text per export column for one subtotal / total record. */
function aggregateTexts<R extends GridRowModel>(
    exportColumns: GridColDef<R>[],
    aggregates: Record<string, unknown>,
    aggModel: GridAggregationModel,
): string[] {
    return exportColumns.map(col => formatExportAggregate(col, aggModel[col.field], aggregates[col.field], aggregates));
}

const UTF8_BOM = String.fromCharCode(0xfeff);

export function exportToCsv<R extends GridValidRowModel = GridRowModel>(rows: R[], columns: GridColDef<R>[], options?: CsvExportOptions<R>): void;
export function exportToCsv<R extends GridValidRowModel = GridRowModel>(rows: R[], columns: GridColDef[], options?: CsvExportOptions<R>): void;
export function exportToCsv<R extends GridRowModel>(
    rows: R[],
    columns: GridColDef<R>[],
    options: CsvExportOptions<R> = {}
): void {
    const {
        fileName = 'export.csv',
        includeHeaders = true,
        delimiter = ',',
        selectedRows,
        groupedRows,
        escapeFormulas = true,
        bom = true,
    } = options;

    const exportColumns = getExportColumns(columns);
    const aggModel = options.aggregationModel || {};
    const field = (text: string, fromNonText = false): string =>
        escapeCSV(escapeFormulas ? neutralizeFormula(text, fromNonText) : text, delimiter);
    const headerLine = () => exportColumns.map(col => field(col.headerName || col.field)).join(delimiter) + '\n';

    let csvContent = '';

    if (shouldExportGrouped(groupedRows, selectedRows)) {
        // Grouped export path
        if (includeHeaders) csvContent += headerLine();
        groupedRows.forEach(entry => {
            const indent = '  '.repeat(entry.depth);
            if (entry.type === 'group-header') {
                const labelText = groupHeaderLabel(entry, columns);
                const label = escapeCSV(indent + (escapeFormulas ? neutralizeFormula(labelText) : labelText), delimiter);
                csvContent += exportColumns.map((_, i) => (i === 0 ? label : '')).join(delimiter) + '\n';
            } else if (entry.type === 'leaf' && entry.row) {
                const row = entry.row as R;
                const cells = exportColumns.map((col, i) => {
                    const cell = exportCell(row, col);
                    const text = escapeFormulas ? neutralizeFormula(cell.text, isNonTextValue(cell.raw)) : cell.text;
                    return escapeCSV((i === 0 ? indent : '') + text, delimiter);
                });
                csvContent += cells.join(delimiter) + '\n';
            } else if ((entry.type === 'group-subtotal' || entry.type === 'grand-total') && entry.aggregatedValues) {
                const values = entry.aggregatedValues;
                const label = entry.type === 'grand-total' ? 'Grand Total' : `${indent}Subtotal`;
                const texts = aggregateTexts(exportColumns, values, aggModel);
                const cells = exportColumns.map((col, i) => (i === 0
                    ? escapeCSV(summaryLabelText(label, texts[0]), delimiter)
                    : field(texts[i], isNonTextValue(values[col.field]))));
                csvContent += cells.join(delimiter) + '\n';
            }
        });
    } else {
        const rowsToExport = rowsForExport(rows, selectedRows, options.getRowId);

        if (rowsToExport.length === 0) {
            console.warn('No rows to export');
            return;
        }

        if (includeHeaders) csvContent += headerLine();

        rowsToExport.forEach(row => {
            const values = exportColumns.map(col => {
                const cell = exportCell(row, col);
                return field(cell.text, isNonTextValue(cell.raw));
            });
            csvContent += values.join(delimiter) + '\n';
        });

        const aggResult = aggregationForExport(rowsToExport, hasSelection(selectedRows), columns, options.aggregationResult, options.aggregationModel);
        if (aggResult) {
            const aggLabels = exportColumns.map(col => field(aggModel[col.field] ? aggModel[col.field].toUpperCase() : ''));
            csvContent += aggLabels.join(delimiter) + '\n';
            const texts = aggregateTexts(exportColumns, aggResult, aggModel);
            csvContent += exportColumns.map((col, i) => field(texts[i], isNonTextValue(aggResult[col.field]))).join(delimiter) + '\n';
        }
    }

    downloadFile((bom ? UTF8_BOM : '') + csvContent, fileName, 'text/csv;charset=utf-8;');
}

/** Quote a CSV field when it contains the delimiter, a quote, or a line break (LF or a bare CR). */
function escapeCSV(value: string, delimiter: string): string {
    if ((delimiter !== '' && value.includes(delimiter)) || value.includes('"') || value.includes('\n') || value.includes('\r')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

export interface ExcelExportOptions<R extends GridValidRowModel = GridRowModel> {
    /**
     * Output filename. The file is an HTML table that Excel opens as a legacy `.xls` workbook, so a
     * `.xlsx` extension is replaced with `.xls` (Excel refuses HTML content named `.xlsx`). Use
     * `exportToExcelAdvanced` for a real `.xlsx`. Default: `'export.xls'`
     */
    fileName?: string;
    /** Sheet tab name. Characters Excel rejects are replaced and the name is cut to 31 characters. Default: `'Sheet1'` */
    sheetName?: string;
    includeHeaders?: boolean;
    /**
     * Export only these row IDs. A non-empty selection takes precedence over `groupedRows` (the
     * selected rows are exported flat), and the totals rows are recomputed over the selected rows.
     */
    selectedRows?: (string | number)[];
    /**
     * The grid's `getRowId`, when it has one: `selectedRows` holds those ids, and the grid does not
     * copy them onto `row.id` (v3.0+). Defaults to `row.id`.
     */
    getRowId?: (row: R) => GridRowId;
    aggregationResult?: Record<string, unknown> | null;
    aggregationModel?: GridAggregationModel | null;
    /** When provided, emits group headers, leaf rows, subtotals, and a grand total instead of a flat row list. */
    groupedRows?: GridGroupedExportRow[];
    /**
     * Prefix text cells that start with `=`, `+`, `-`, `@`, tab or carriage return with `'`, so
     * Excel does not run them as formulas. Default: `true`
     * @since v3.0
     */
    escapeFormulas?: boolean;
}

/** Excel's text number format: the cell keeps its text as typed (leading zeros, long ids, "1-2"). */
const XLS_TEXT_CLASS = 'ogx-xls-text';

/**
 * Whether an HTML-Excel data cell should be marked as text. Number, date and boolean columns, and
 * values that are numbers, dates or booleans, are left for Excel to type.
 */
function isXlsTextCell<R extends GridRowModel>(col: GridColDef<R>, raw: unknown): boolean {
    return col.type !== 'number' && col.type !== 'date' && col.type !== 'boolean' && !isNonTextValue(raw);
}

function xlsFileName(fileName: string): string {
    if (!/\.xlsx$/i.test(fileName)) return fileName;
    const corrected = fileName.replace(/\.xlsx$/i, '.xls');
    console.warn(
        `[exportToExcel] "${fileName}" renamed to "${corrected}": exportToExcel writes an HTML table that Excel ` +
        'refuses to open as .xlsx. Use exportToExcelAdvanced for a real .xlsx file.'
    );
    return corrected;
}

export function exportToExcel<R extends GridValidRowModel = GridRowModel>(rows: R[], columns: GridColDef<R>[], options?: ExcelExportOptions<R>): void;
export function exportToExcel<R extends GridValidRowModel = GridRowModel>(rows: R[], columns: GridColDef[], options?: ExcelExportOptions<R>): void;
export function exportToExcel<R extends GridRowModel>(
    rows: R[],
    columns: GridColDef<R>[],
    options: ExcelExportOptions<R> = {}
): void {
    const {
        fileName = 'export.xls',
        sheetName = 'Sheet1',
        includeHeaders = true,
        selectedRows,
        groupedRows,
        escapeFormulas = true,
    } = options;

    const exportColumns = getExportColumns(columns);
    const aggModel = options.aggregationModel || {};
    const cellText = (text: string, fromNonText = false): string =>
        escapeHTML(escapeFormulas ? neutralizeFormula(text, fromNonText) : text);
    const textTd = (html: string): string => `<td class="${XLS_TEXT_CLASS}">${html}</td>`;

    const header = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'
        + '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>'
        + `<x:Name>${escapeHTML(sanitizeSheetName(sheetName))}</x:Name>`
        + '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->'
        + `<meta charset="UTF-8"><style>.${XLS_TEXT_CLASS}{mso-number-format:"\\@";}</style></head><body><table border="1">`;

    let html = header;

    if (includeHeaders) {
        html += '<thead><tr>';
        exportColumns.forEach(col => { html += `<th class="${XLS_TEXT_CLASS}">${cellText(col.headerName || col.field)}</th>`; });
        html += '</tr></thead>';
    }

    html += '<tbody>';

    const dataCell = (cell: ExportCell, col: GridColDef<R>, prefix = ''): string => {
        const content = prefix + cellText(cell.text, isNonTextValue(cell.raw));
        return isXlsTextCell(col, cell.raw) ? textTd(content) : `<td>${content}</td>`;
    };

    if (shouldExportGrouped(groupedRows, selectedRows)) {
        groupedRows.forEach(entry => {
            const indent = '  '.repeat(entry.depth * 2);
            if (entry.type === 'group-header') {
                html += `<tr style="font-weight:bold;background:#e8eaf6;">`;
                html += `<td colspan="${exportColumns.length}" class="${XLS_TEXT_CLASS}">${escapeHTML(indent)}${cellText(groupHeaderLabel(entry, columns))}</td>`;
                html += '</tr>';
            } else if (entry.type === 'leaf' && entry.row) {
                const row = entry.row as R;
                html += '<tr>';
                exportColumns.forEach((col, i) => { html += dataCell(exportCell(row, col), col, i === 0 ? escapeHTML(indent) : ''); });
                html += '</tr>';
            } else if ((entry.type === 'group-subtotal' || entry.type === 'grand-total') && entry.aggregatedValues) {
                const values = entry.aggregatedValues;
                const label = entry.type === 'grand-total' ? 'Grand Total' : `${indent}Subtotal`;
                const texts = aggregateTexts(exportColumns, values, aggModel);
                html += `<tr style="font-weight:bold;background:#f5f5f5;">`;
                exportColumns.forEach((col, i) => {
                    if (i === 0) { html += textTd(escapeHTML(summaryLabelText(label, texts[0]))); return; }
                    html += texts[i] ? `<td style="text-align:right;">${cellText(texts[i], isNonTextValue(values[col.field]))}</td>` : '<td></td>';
                });
                html += '</tr>';
            }
        });
    } else {
        const rowsToExport = rowsForExport(rows, selectedRows, options.getRowId);

        if (rowsToExport.length === 0) {
            console.warn('No rows to export');
            return;
        }

        rowsToExport.forEach(row => {
            html += '<tr>';
            exportColumns.forEach(col => { html += dataCell(exportCell(row, col), col); });
            html += '</tr>';
        });

        const aggResult = aggregationForExport(rowsToExport, hasSelection(selectedRows), columns, options.aggregationResult, options.aggregationModel);
        if (aggResult) {
            html += '<tr style="font-size: 11px; color: #666; background-color: #f5f5f5;">';
            exportColumns.forEach(col => {
                html += aggModel[col.field]
                    ? `<td style="text-align:right;font-weight:bold;">${escapeHTML(aggModel[col.field].toUpperCase())}</td>`
                    : '<td></td>';
            });
            html += '</tr><tr style="font-weight:bold;background-color:#f5f5f5;">';
            const texts = aggregateTexts(exportColumns, aggResult, aggModel);
            exportColumns.forEach((col, i) => {
                html += texts[i] ? `<td style="text-align:right;">${cellText(texts[i], isNonTextValue(aggResult[col.field]))}</td>` : '<td></td>';
            });
            html += '</tr>';
        }
    }

    html += '</tbody></table></body></html>';
    downloadFile(html, xlsFileName(fileName), 'application/vnd.ms-excel');
}

// ============================================================================
// JSON Export
// ============================================================================

export interface JsonExportOptions<R extends GridValidRowModel = GridRowModel> {
    fileName?: string;
    pretty?: boolean;
    /**
     * Export only these row IDs. A non-empty selection takes precedence over `groupedRows` (the
     * selected rows are exported flat), and the aggregation values are recomputed over them.
     */
    selectedRows?: (string | number)[];
    /**
     * The grid's `getRowId`, when it has one: `selectedRows` holds those ids, and the grid does not
     * copy them onto `row.id` (v3.0+). Defaults to `row.id`.
     */
    getRowId?: (row: R) => GridRowId;
    aggregationResult?: Record<string, unknown> | null;
    aggregationModel?: GridAggregationModel | null;
    /** When provided, emits a nested grouping tree instead of a flat array. */
    groupedRows?: GridGroupedExportRow[];
}

/**
 * Export data to JSON format. Values are written raw (after `valueGetter`, without
 * `valueFormatter`), including aggregation values, so the output can be parsed as data.
 */
export function exportToJson<R extends GridValidRowModel = GridRowModel>(rows: R[], columns: GridColDef<R>[], options?: JsonExportOptions<R>): void;
export function exportToJson<R extends GridValidRowModel = GridRowModel>(rows: R[], columns: GridColDef[], options?: JsonExportOptions<R>): void;
export function exportToJson<R extends GridRowModel>(
    rows: R[],
    columns: GridColDef<R>[],
    options: JsonExportOptions<R> = {}
): void {
    const {
        fileName = 'export.json',
        pretty = true,
        selectedRows,
        groupedRows,
    } = options;

    const exportColumns = getExportColumns(columns);

    type GroupNode = {
        group: string;
        field: string;
        value: unknown;
        rows: Record<string, unknown>[];
        subtotals?: Record<string, unknown>;
        children?: GroupNode[];
    };

    type JsonPayload =
        | Record<string, unknown>[]
        | { data: Record<string, unknown>[]; aggregation: { labels: Record<string, unknown>; values: Record<string, unknown> } }
        | { groups: GroupNode[]; grandTotal?: Record<string, unknown> };

    const rowObject = (row: R): Record<string, unknown> => {
        const obj: Record<string, unknown> = {};
        exportColumns.forEach(col => { obj[col.field] = getRawExportValue(row, col); });
        return obj;
    };

    let outData: JsonPayload;

    if (shouldExportGrouped(groupedRows, selectedRows)) {
        // Build nested tree from the flat ordered list
        const stack: GroupNode[] = [];
        const roots: GroupNode[] = [];
        let grandTotal: Record<string, unknown> | undefined;

        groupedRows.forEach(entry => {
            if (entry.type === 'group-header') {
                const node: GroupNode = {
                    group: groupHeaderLabel(entry, columns),
                    field: entry.groupField ?? '',
                    value: entry.groupValue,
                    rows: [],
                    children: [],
                };
                while (stack.length > entry.depth) stack.pop();
                if (stack.length === 0) {
                    roots.push(node);
                } else {
                    (stack[stack.length - 1].children ??= []).push(node);
                }
                stack.push(node);
            } else if (entry.type === 'leaf' && entry.row) {
                if (stack.length > 0) stack[stack.length - 1].rows.push(rowObject(entry.row as R));
            } else if (entry.type === 'group-subtotal' && entry.aggregatedValues && stack.length > 0) {
                stack[stack.length - 1].subtotals = pickExportedAggregates(entry.aggregatedValues, exportColumns);
                stack.pop();
            } else if (entry.type === 'grand-total' && entry.aggregatedValues) {
                grandTotal = pickExportedAggregates(entry.aggregatedValues, exportColumns);
            }
        });

        outData = grandTotal ? { groups: roots, grandTotal } : { groups: roots };
    } else {
        const rowsToExport = rowsForExport(rows, selectedRows, options.getRowId);

        if (rowsToExport.length === 0) {
            console.warn('No rows to export');
            return;
        }

        const data = rowsToExport.map(rowObject);

        const aggResult = aggregationForExport(rowsToExport, hasSelection(selectedRows), columns, options.aggregationResult, options.aggregationModel);
        if (aggResult) {
            const aggModel = options.aggregationModel || {};
            const summaryLabelObj: Record<string, unknown> = {};
            exportColumns.forEach(col => { if (aggModel[col.field]) summaryLabelObj[col.field] = aggModel[col.field].toUpperCase(); });
            const summaryDataObj: Record<string, unknown> = {};
            exportColumns.forEach(col => {
                if (aggResult[col.field] !== undefined && aggResult[col.field] !== null) summaryDataObj[col.field] = aggResult[col.field];
            });
            outData = { data, aggregation: { labels: summaryLabelObj, values: summaryDataObj } };
        } else {
            outData = data;
        }
    }

    downloadFile(pretty ? JSON.stringify(outData, null, 2) : JSON.stringify(outData), fileName, 'application/json;charset=utf-8;');
}

// ============================================================================
// Print
// ============================================================================

export interface PrintOptions<R extends GridValidRowModel = GridRowModel> {
    title?: string;
    /**
     * Print only these row IDs. A non-empty selection takes precedence over `groupedRows` (the
     * selected rows are printed flat), and the totals are recomputed over the selected rows.
     */
    selectedRows?: (string | number)[];
    /**
     * The grid's `getRowId`, when it has one: `selectedRows` holds those ids, and the grid does not
     * copy them onto `row.id` (v3.0+). Defaults to `row.id`.
     */
    getRowId?: (row: R) => GridRowId;
    aggregationResult?: Record<string, unknown> | null;
    aggregationModel?: GridAggregationModel | null;
    /** When provided, emits group headers, leaf rows, subtotals, and a grand total instead of a flat row list. */
    groupedRows?: GridGroupedExportRow[];
}

const SAFE_IMAGE_URL = /^(?:https?:|data:image\/|blob:)/i;
const URL_SCHEME = /^[a-z][a-z\d+.-]*:/i;

/**
 * The URL to use as an `<img src>` in the print window, or null when it is not an image URL:
 * http(s), `data:image/…`, `blob:` and relative URLs are allowed; `javascript:`, `data:text/html`,
 * `file:` and other schemes are not.
 */
function printableImageUrl(value: string): string | null {
    const url = value.trim();
    if (!url) return null;
    if (SAFE_IMAGE_URL.test(url)) return url;
    return URL_SCHEME.test(url) ? null : url;
}

/**
 * Open print dialog with formatted table
 */
export function printGrid<R extends GridValidRowModel = GridRowModel>(rows: R[], columns: GridColDef<R>[], titleOrOptions?: string | PrintOptions<R>): Promise<void>;
export function printGrid<R extends GridValidRowModel = GridRowModel>(rows: R[], columns: GridColDef[], titleOrOptions?: string | PrintOptions<R>): Promise<void>;
export async function printGrid<R extends GridRowModel>(
    rows: R[],
    columns: GridColDef<R>[],
    titleOrOptions?: string | PrintOptions<R>
): Promise<void> {
    // 1. Open window immediately to resolve user activation constraints and provide feedback
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
        console.error('Failed to open print window. Please check your popup blocker settings.');
        return;
    }

    // 2. Show loading state
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Preparing Print...</title>
            <style>
                body { font-family: sans-serif; height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; background: #f5f5f5; }
                .loader { text-align: center; }
                .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        </head>
        <body>
            <div class="loader">
                <div class="spinner"></div>
                <h2>Generating Print Preview...</h2>
                <p>Processing data, please wait.</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();

    // 3. Yield to main thread to allow the new window to render its loading state
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        let title = 'Print';
        let selectedRows: (string | number)[] | undefined;
        let getRowId: ((row: R) => GridRowId) | undefined;
        let aggregationResult: Record<string, unknown> | null = null;
        let aggregationModel: GridAggregationModel | null = null;

        let groupedRows: GridGroupedExportRow[] | undefined;

        if (typeof titleOrOptions === 'string') {
            title = titleOrOptions;
        } else if (typeof titleOrOptions === 'object') {
            title = titleOrOptions.title || 'Print';
            selectedRows = titleOrOptions.selectedRows;
            getRowId = titleOrOptions.getRowId;
            aggregationResult = titleOrOptions.aggregationResult || null;
            aggregationModel = titleOrOptions.aggregationModel || null;
            groupedRows = titleOrOptions.groupedRows;
        }

        const exportColumns = getExportColumns(columns);
        const aggModel = aggregationModel || {};

        // Group-row rules are qualified with `tr` so they outrank the stripe rule, which has the same
        // specificity, by coming later.
        let html = `<!DOCTYPE html><html><head><title>${escapeHTML(title || 'Print')}</title><style>
            body{font-family:Arial,sans-serif;margin:20px;}
            h1{font-size:24px;margin-bottom:20px;}
            table{border-collapse:collapse;width:100%;}
            th,td{border:1px solid #ddd;padding:8px;text-align:left;}
            th{background-color:#f5f5f5;font-weight:bold;}
            tr:nth-child(even){background-color:#f9f9f9;}
            tr.group-header{background:#e8eaf6;font-weight:bold;}
            tr.group-subtotal{background:#f0f4ff;font-style:italic;}
            tr.grand-total{background:#f5f5f5;font-weight:bold;}
            @media print{body{margin:0;}@page{margin:1cm;}}
        </style></head><body>`;

        if (title) html += `<h1>${escapeHTML(title)}</h1>`;
        html += '<table><thead><tr>';
        exportColumns.forEach(col => { html += `<th>${escapeHTML(col.headerName || col.field)}</th>`; });
        html += '</tr></thead><tbody>';

        const dataCell = (row: R, col: GridColDef<R>, prefixHtml = '', centerImage = false): string => {
            const { text } = exportCell(row, col);
            const src = col.type === 'image' ? printableImageUrl(text) : null;
            if (src !== null) {
                const img = `<img src="${escapeHTML(src)}" alt="${escapeHTML(col.headerName || col.field)}" style="max-height:40px;border-radius:4px;">`;
                return centerImage ? `<td><div style="display:flex;justify-content:center;">${img}</div></td>` : `<td>${img}</td>`;
            }
            return `<td>${prefixHtml}${escapeHTML(text)}</td>`;
        };

        if (shouldExportGrouped(groupedRows, selectedRows)) {
            groupedRows.forEach(entry => {
                const indent = '&nbsp;'.repeat(entry.depth * 4);
                if (entry.type === 'group-header') {
                    html += `<tr class="group-header"><td colspan="${exportColumns.length}">${indent}${escapeHTML(groupHeaderLabel(entry, columns))}</td></tr>`;
                } else if (entry.type === 'leaf' && entry.row) {
                    const row = entry.row as R;
                    html += '<tr>';
                    exportColumns.forEach((col, i) => { html += dataCell(row, col, i === 0 ? indent : ''); });
                    html += '</tr>';
                } else if ((entry.type === 'group-subtotal' || entry.type === 'grand-total') && entry.aggregatedValues) {
                    const isGrand = entry.type === 'grand-total';
                    const texts = aggregateTexts(exportColumns, entry.aggregatedValues, aggModel);
                    html += `<tr class="${isGrand ? 'grand-total' : 'group-subtotal'}">`;
                    exportColumns.forEach((_, i) => {
                        if (i === 0) {
                            html += `<td>${isGrand ? '' : indent}${escapeHTML(summaryLabelText(isGrand ? 'Grand Total' : 'Subtotal', texts[0]))}</td>`;
                            return;
                        }
                        html += texts[i] ? `<td style="text-align:right;">${escapeHTML(texts[i])}</td>` : '<td></td>';
                    });
                    html += '</tr>';
                }
            });
        } else {
            const rowsToExport = rowsForExport(rows, selectedRows, getRowId);

            if (rowsToExport.length === 0) {
                printWindow.document.body.innerHTML = '<h3>No rows to export</h3>';
                return;
            }

            rowsToExport.forEach(row => {
                html += '<tr>';
                exportColumns.forEach(col => { html += dataCell(row, col, '', true); });
                html += '</tr>';
            });

            const aggResult = aggregationForExport(rowsToExport, hasSelection(selectedRows), columns, aggregationResult, aggregationModel);
            if (aggResult) {
                html += '<tfoot><tr style="font-size:11px;color:#666;background-color:#f5f5f5;">';
                exportColumns.forEach(col => {
                    html += aggModel[col.field]
                        ? `<td style="text-align:right;font-weight:bold;">${escapeHTML(aggModel[col.field].toUpperCase())}</td>`
                        : '<td></td>';
                });
                html += '</tr><tr style="font-weight:bold;background-color:#f5f5f5;">';
                aggregateTexts(exportColumns, aggResult, aggModel).forEach(text => {
                    html += text ? `<td style="text-align:right;">${escapeHTML(text)}</td>` : '<td></td>';
                });
                html += '</tr></tfoot>';
            }
        }

        html += '</tbody></table></body></html>';

        // Write the HTML content
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();

        // Set the document title explicitly (fixes about:blank issue)
        printWindow.document.title = title || 'Print Preview';

        printWindow.focus();

        let hasPrinted = false;

        printWindow.onload = () => {
            if (!hasPrinted) {
                hasPrinted = true;
                printWindow.print();

                setTimeout(() => {
                    printWindow.close();
                }, 100);
            }
        };

        setTimeout(() => {
            if (!hasPrinted && printWindow && !printWindow.closed) {
                hasPrinted = true;
                printWindow.print();
                setTimeout(() => {
                    if (!printWindow.closed) printWindow.close();
                }, 100);
            }
        }, 500);

    } catch (e) {
        console.error('Print generation failed:', e);
        if (printWindow && !printWindow.closed) {
            const message = e instanceof Error ? e.message : String(e);
            printWindow.document.body.innerHTML = `<div style="color: red; padding: 20px;"><h3>Error Generating Print Preview</h3><p>${escapeHTML(message)}</p></div>`;
        }
    }
}

function downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export { exportToPdf } from './exportToPdf';
export type { PdfExportOptions, PdfExportProgress } from '../../types';
