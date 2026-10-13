
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
    rowsForExport,
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
import { aggregateTexts, exportCell } from './exportRows';

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
