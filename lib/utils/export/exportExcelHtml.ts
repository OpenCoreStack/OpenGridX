
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
    escapeHTML,
    getExportColumns,
    hasSelection,
    isNonTextValue,
    neutralizeFormula,
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
import {
    aggregateTexts,
    downloadFile,
    exportCell,
    type ExportCell,
} from './exportRows';

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
        const content = prefix + cellText(cell.text, cell.fromNonText);
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
