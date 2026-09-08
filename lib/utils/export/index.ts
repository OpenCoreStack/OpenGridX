
import type { GridColDef, GridRowModel, GridAggregationModel, GridGroupedExportRow } from '../../types';
import { formatAggregationValue } from '../../hooks/features/useAggregation';

export interface CsvExportOptions {
    fileName?: string;
    includeHeaders?: boolean;
    delimiter?: string;
    selectedRows?: (string | number)[];
    aggregationResult?: Record<string, unknown> | null;
    aggregationModel?: GridAggregationModel | null;
    /** When provided, emits group headers, leaf rows, subtotals, and a grand total instead of a flat row list. */
    groupedRows?: GridGroupedExportRow[];
}

export function exportToCsv<R extends GridRowModel>(
    rows: R[],
    columns: GridColDef<R>[],
    options: CsvExportOptions = {}
): void {
    const {
        fileName = 'export.csv',
        includeHeaders = true,
        delimiter = ',',
        selectedRows,
        groupedRows,
    } = options;

    const exportColumns = columns.filter(col => {
        if (col.exportable === false) return false;
        if (col.field === '__check__' || col.field === '__actions__') return false;
        return true;
    });

    let csvContent = '';

    if (groupedRows && groupedRows.length > 0) {
        // Grouped export path
        if (includeHeaders) {
            csvContent += exportColumns.map(col => escapeCSV(col.headerName || col.field)).join(delimiter) + '\n';
        }
        groupedRows.forEach(entry => {
            if (entry.type === 'group-header') {
                const indent = '  '.repeat(entry.depth);
                const label = `${indent}${entry.groupField ?? ''}: ${String(entry.groupValue ?? '')}`;
                const cells = exportColumns.map((_, i) => i === 0 ? escapeCSV(label) : '');
                csvContent += cells.join(delimiter) + '\n';
            } else if (entry.type === 'leaf' && entry.row) {
                const row = entry.row as R;
                const indent = '  '.repeat(entry.depth);
                const cells = exportColumns.map((col, i) => {
                    let value: unknown = (row as GridRowModel)[col.field];
                    if (col.valueGetter) value = col.valueGetter({ row, field: col.field, value });
                    if (col.valueFormatter && value !== undefined && value !== null) {
                        value = col.valueFormatter({ value, row, field: col.field });
                    }
                    return escapeCSV((i === 0 ? indent : '') + String(value ?? ''));
                });
                csvContent += cells.join(delimiter) + '\n';
            } else if (entry.type === 'group-subtotal' && entry.aggregatedValues) {
                const indent = '  '.repeat(entry.depth);
                const aggModel = options.aggregationModel || {};
                const cells = exportColumns.map((col, i) => {
                    if (i === 0) return escapeCSV(`${indent}Subtotal`);
                    const aggVal = entry.aggregatedValues![col.field];
                    if (aggVal !== undefined && aggVal !== null) {
                        let formatted: unknown = aggVal;
                        if (col.valueFormatter) {
                            formatted = col.valueFormatter({ value: aggVal, row: {} as R, field: col.field });
                        } else if (aggModel[col.field]) {
                            formatted = formatAggregationValue(aggVal, aggModel[col.field]);
                        }
                        return escapeCSV(String(formatted));
                    }
                    return '';
                });
                csvContent += cells.join(delimiter) + '\n';
            } else if (entry.type === 'grand-total' && entry.aggregatedValues) {
                const aggModel = options.aggregationModel || {};
                const cells = exportColumns.map((col, i) => {
                    if (i === 0) return escapeCSV('Grand Total');
                    const aggVal = entry.aggregatedValues![col.field];
                    if (aggVal !== undefined && aggVal !== null) {
                        let formatted: unknown = aggVal;
                        if (col.valueFormatter) {
                            formatted = col.valueFormatter({ value: aggVal, row: {} as R, field: col.field });
                        } else if (aggModel[col.field]) {
                            formatted = formatAggregationValue(aggVal, aggModel[col.field]);
                        }
                        return escapeCSV(String(formatted));
                    }
                    return '';
                });
                csvContent += cells.join(delimiter) + '\n';
            }
        });
    } else {
        // Flat export path (existing behavior)
        const rowsToExport = selectedRows && selectedRows.length > 0
            ? rows.filter(r => selectedRows.includes(r.id))
            : rows;

        if (rowsToExport.length === 0) {
            console.warn('No rows to export');
            return;
        }

        if (includeHeaders) {
            csvContent += exportColumns.map(col => escapeCSV(col.headerName || col.field)).join(delimiter) + '\n';
        }

        rowsToExport.forEach(row => {
            const values = exportColumns.map(col => {
                let value: unknown = (row as GridRowModel)[col.field];
                if (col.valueGetter) value = col.valueGetter({ row, field: col.field, value });
                if (col.valueFormatter && value !== undefined && value !== null) {
                    value = col.valueFormatter({ value, row, field: col.field });
                }
                return escapeCSV(String(value ?? ''));
            });
            csvContent += values.join(delimiter) + '\n';
        });

        if (options.aggregationResult) {
            const aggResult = options.aggregationResult;
            const aggModel = options.aggregationModel || {};
            const aggLabels = exportColumns.map(col => escapeCSV(aggModel[col.field] ? aggModel[col.field].toUpperCase() : ''));
            csvContent += aggLabels.join(delimiter) + '\n';
            const aggValues = exportColumns.map(col => {
                const aggVal = aggResult[col.field];
                if (aggVal !== undefined && aggVal !== null) {
                    let formatted: unknown = aggVal;
                    if (col.valueFormatter) formatted = col.valueFormatter({ value: aggVal, row: {} as R, field: col.field });
                    else if (aggModel[col.field]) formatted = formatAggregationValue(aggVal, aggModel[col.field]);
                    return escapeCSV(String(formatted));
                }
                return '';
            });
            csvContent += aggValues.join(delimiter) + '\n';
        }
    }

    downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
}

function escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

export interface ExcelExportOptions {
    fileName?: string;
    sheetName?: string;
    includeHeaders?: boolean;
    selectedRows?: (string | number)[];
    aggregationResult?: Record<string, unknown> | null;
    aggregationModel?: GridAggregationModel | null;
    /** When provided, emits group headers, leaf rows, subtotals, and a grand total instead of a flat row list. */
    groupedRows?: GridGroupedExportRow[];
}

export function exportToExcel<R extends GridRowModel>(
    rows: R[],
    columns: GridColDef<R>[],
    options: ExcelExportOptions = {}
): void {
    const {
        fileName = 'export.xls',
        sheetName = 'Sheet1',
        includeHeaders = true,
        selectedRows,
        groupedRows,
    } = options;

    const exportColumns = columns.filter(col => {
        if (col.exportable === false) return false;
        if (col.field === '__check__' || col.field === '__actions__') return false;
        return true;
    });

    const header = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'
        + '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>'
        + `<x:Name>${sheetName}</x:Name>`
        + '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->'
        + '<meta charset="UTF-8"></head><body><table border="1">';

    let html = header;

    if (includeHeaders) {
        html += '<thead><tr>';
        exportColumns.forEach(col => { html += `<th>${escapeHTML(col.headerName || col.field)}</th>`; });
        html += '</tr></thead>';
    }

    html += '<tbody>';

    if (groupedRows && groupedRows.length > 0) {
        const aggModel = options.aggregationModel || {};
        groupedRows.forEach(entry => {
            if (entry.type === 'group-header') {
                const indent = '  '.repeat(entry.depth * 2);
                const label = `${indent}${entry.groupField ?? ''}: ${String(entry.groupValue ?? '')}`;
                html += `<tr style="font-weight:bold;background:#e8eaf6;">`;
                html += `<td colspan="${exportColumns.length}">${escapeHTML(label)}</td>`;
                html += '</tr>';
            } else if (entry.type === 'leaf' && entry.row) {
                const row = entry.row as R;
                const indent = '  '.repeat(entry.depth * 2);
                html += '<tr>';
                exportColumns.forEach((col, i) => {
                    let value: unknown = (row as GridRowModel)[col.field];
                    if (col.valueGetter) value = col.valueGetter({ row, field: col.field, value });
                    if (col.valueFormatter && value !== undefined && value !== null) {
                        value = col.valueFormatter({ value, row, field: col.field });
                    }
                    html += `<td>${escapeHTML((i === 0 ? indent : '') + String(value ?? ''))}</td>`;
                });
                html += '</tr>';
            } else if ((entry.type === 'group-subtotal' || entry.type === 'grand-total') && entry.aggregatedValues) {
                const isGrand = entry.type === 'grand-total';
                const indent = isGrand ? '' : '  '.repeat(entry.depth * 2);
                const label = isGrand ? 'Grand Total' : `${indent}Subtotal`;
                html += `<tr style="font-weight:bold;background:#f5f5f5;">`;
                exportColumns.forEach((col, i) => {
                    if (i === 0) { html += `<td>${escapeHTML(label)}</td>`; return; }
                    const aggVal = entry.aggregatedValues![col.field];
                    if (aggVal !== undefined && aggVal !== null) {
                        let formatted: unknown = aggVal;
                        if (col.valueFormatter) formatted = col.valueFormatter({ value: aggVal, row: {} as R, field: col.field });
                        else if (aggModel[col.field]) formatted = formatAggregationValue(aggVal, aggModel[col.field]);
                        html += `<td style="text-align:right;">${escapeHTML(String(formatted))}</td>`;
                    } else {
                        html += '<td></td>';
                    }
                });
                html += '</tr>';
            }
        });
    } else {
        const rowsToExport = selectedRows && selectedRows.length > 0
            ? rows.filter(r => selectedRows.includes(r.id))
            : rows;

        if (rowsToExport.length === 0) {
            console.warn('No rows to export');
            return;
        }

        rowsToExport.forEach(row => {
            html += '<tr>';
            exportColumns.forEach(col => {
                let value: unknown = (row as GridRowModel)[col.field];
                if (col.valueGetter) value = col.valueGetter({ row, field: col.field, value });
                if (col.valueFormatter && value !== undefined && value !== null) {
                    value = col.valueFormatter({ value, row, field: col.field });
                }
                html += `<td>${escapeHTML(String(value ?? ''))}</td>`;
            });
            html += '</tr>';
        });

        if (options.aggregationResult) {
            const aggResult = options.aggregationResult;
            const aggModel = options.aggregationModel || {};
            html += '<tr style="font-size: 11px; color: #666; background-color: #f5f5f5;">';
            exportColumns.forEach(col => {
                html += aggModel[col.field]
                    ? `<td style="text-align:right;font-weight:bold;">${escapeHTML(aggModel[col.field].toUpperCase())}</td>`
                    : '<td></td>';
            });
            html += '</tr><tr style="font-weight:bold;background-color:#f5f5f5;">';
            exportColumns.forEach(col => {
                const aggVal = aggResult[col.field];
                if (aggVal !== undefined && aggVal !== null) {
                    let formatted: unknown = aggVal;
                    if (col.valueFormatter) formatted = col.valueFormatter({ value: aggVal, row: {} as R, field: col.field });
                    else if (aggModel[col.field]) formatted = formatAggregationValue(aggVal, aggModel[col.field]);
                    html += `<td style="text-align:right;">${escapeHTML(String(formatted))}</td>`;
                } else {
                    html += '<td></td>';
                }
            });
            html += '</tr>';
        }
    }

    html += '</tbody></table></body></html>';
    downloadFile(html, fileName, 'application/vnd.ms-excel');
}

function escapeHTML(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ============================================================================
// JSON Export
// ============================================================================

export interface JsonExportOptions {
    fileName?: string;
    pretty?: boolean;
    selectedRows?: (string | number)[];
    aggregationResult?: Record<string, unknown> | null;
    aggregationModel?: GridAggregationModel | null;
    /** When provided, emits a nested grouping tree instead of a flat array. */
    groupedRows?: GridGroupedExportRow[];
}

/**
 * Export data to JSON format
 */
export function exportToJson<R extends GridRowModel>(
    rows: R[],
    columns: GridColDef<R>[],
    options: JsonExportOptions = {}
): void {
    const {
        fileName = 'export.json',
        pretty = true,
        selectedRows,
        groupedRows,
    } = options;

    const exportColumns = columns.filter(col => {
        if (col.exportable === false) return false;
        if (col.field === '__check__' || col.field === '__actions__') return false;
        return true;
    });

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

    let outData: JsonPayload;

    if (groupedRows && groupedRows.length > 0) {
        // Build nested tree from the flat ordered list
        const stack: GroupNode[] = [];
        const roots: GroupNode[] = [];
        let grandTotal: Record<string, unknown> | undefined;

        groupedRows.forEach(entry => {
            if (entry.type === 'group-header') {
                const node: GroupNode = {
                    group: `${entry.groupField ?? ''}: ${String(entry.groupValue ?? '')}`,
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
                const row = entry.row as R;
                const obj: Record<string, unknown> = {};
                exportColumns.forEach(col => {
                    let value: unknown = (row as GridRowModel)[col.field];
                    if (col.valueGetter) value = col.valueGetter({ row, field: col.field, value });
                    obj[col.field] = value;
                });
                if (stack.length > 0) stack[stack.length - 1].rows.push(obj);
            } else if (entry.type === 'group-subtotal' && entry.aggregatedValues && stack.length > 0) {
                stack[stack.length - 1].subtotals = { ...entry.aggregatedValues };
                stack.pop();
            } else if (entry.type === 'grand-total' && entry.aggregatedValues) {
                grandTotal = { ...entry.aggregatedValues };
            }
        });

        outData = grandTotal ? { groups: roots, grandTotal } : { groups: roots };
    } else {
        const rowsToExport = selectedRows && selectedRows.length > 0
            ? rows.filter(r => selectedRows.includes(r.id))
            : rows;

        if (rowsToExport.length === 0) {
            console.warn('No rows to export');
            return;
        }

        const data = rowsToExport.map(row => {
            const obj: Record<string, unknown> = {};
            exportColumns.forEach(col => {
                let value: unknown = (row as GridRowModel)[col.field];
                if (col.valueGetter) value = col.valueGetter({ row, field: col.field, value });
                obj[col.field] = value;
            });
            return obj;
        });

        if (options.aggregationResult) {
            const aggResult = options.aggregationResult;
            const aggModel = options.aggregationModel || {};
            const summaryLabelObj: Record<string, unknown> = {};
            exportColumns.forEach(col => { if (aggModel[col.field]) summaryLabelObj[col.field] = aggModel[col.field].toUpperCase(); });
            const summaryDataObj: Record<string, unknown> = {};
            exportColumns.forEach(col => {
                if (aggResult[col.field] !== undefined && aggResult[col.field] !== null) {
                    let aggVal: unknown = aggResult[col.field];
                    if (col.valueFormatter) aggVal = col.valueFormatter({ value: aggVal, row: {} as R, field: col.field });
                    else if (aggModel[col.field]) aggVal = formatAggregationValue(aggVal, aggModel[col.field]);
                    summaryDataObj[col.field] = aggVal;
                }
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

export interface PrintOptions {
    title?: string;
    selectedRows?: (string | number)[];
    aggregationResult?: Record<string, unknown> | null;
    aggregationModel?: GridAggregationModel | null;
    /** When provided, emits group headers, leaf rows, subtotals, and a grand total instead of a flat row list. */
    groupedRows?: GridGroupedExportRow[];
}

/**
 * Open print dialog with formatted table
 */
export async function printGrid<R extends GridRowModel>(
    rows: R[],
    columns: GridColDef<R>[],
    titleOrOptions?: string | PrintOptions
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
        let aggregationResult: Record<string, unknown> | null = null;
        let aggregationModel: GridAggregationModel | null = null;

        let groupedRows: GridGroupedExportRow[] | undefined;

        if (typeof titleOrOptions === 'string') {
            title = titleOrOptions;
        } else if (typeof titleOrOptions === 'object') {
            title = titleOrOptions.title || 'Print';
            selectedRows = titleOrOptions.selectedRows;
            aggregationResult = titleOrOptions.aggregationResult || null;
            aggregationModel = titleOrOptions.aggregationModel || null;
            groupedRows = titleOrOptions.groupedRows;
        }

        const exportColumns = columns.filter(col => {
            if (col.exportable === false) return false;
            if (col.field === '__check__' || col.field === '__actions__') return false;
            return true;
        });

        let html = `<!DOCTYPE html><html><head><title>${title || 'Print'}</title><style>
            body{font-family:Arial,sans-serif;margin:20px;}
            h1{font-size:24px;margin-bottom:20px;}
            table{border-collapse:collapse;width:100%;}
            th,td{border:1px solid #ddd;padding:8px;text-align:left;}
            th{background-color:#f5f5f5;font-weight:bold;}
            tr:nth-child(even){background-color:#f9f9f9;}
            .group-header{background:#e8eaf6;font-weight:bold;}
            .group-subtotal{background:#f0f4ff;font-style:italic;}
            .grand-total{background:#f5f5f5;font-weight:bold;}
            @media print{body{margin:0;}@page{margin:1cm;}}
        </style></head><body>`;

        if (title) html += `<h1>${escapeHTML(title)}</h1>`;
        html += '<table><thead><tr>';
        exportColumns.forEach(col => { html += `<th>${escapeHTML(col.headerName || col.field)}</th>`; });
        html += '</tr></thead><tbody>';

        if (groupedRows && groupedRows.length > 0) {
            const aggModel = aggregationModel || {};
            groupedRows.forEach(entry => {
                if (entry.type === 'group-header') {
                    const indent = '&nbsp;'.repeat(entry.depth * 4);
                    const label = `${indent}${escapeHTML(entry.groupField ?? '')}: ${escapeHTML(String(entry.groupValue ?? ''))}`;
                    html += `<tr class="group-header"><td colspan="${exportColumns.length}">${label}</td></tr>`;
                } else if (entry.type === 'leaf' && entry.row) {
                    const row = entry.row as R;
                    const indent = '&nbsp;'.repeat(entry.depth * 4);
                    html += '<tr>';
                    exportColumns.forEach((col, i) => {
                        let value: unknown = (row as GridRowModel)[col.field];
                        if (col.valueGetter) value = col.valueGetter({ row, field: col.field, value });
                        if (col.valueFormatter && value !== undefined && value !== null) {
                            value = col.valueFormatter({ value, row, field: col.field });
                        }
                        if (col.type === 'image' && value) {
                            html += `<td><img src="${value}" style="max-height:40px;border-radius:4px;"></td>`;
                        } else {
                            html += `<td>${(i === 0 ? indent : '') + escapeHTML(String(value ?? ''))}</td>`;
                        }
                    });
                    html += '</tr>';
                } else if ((entry.type === 'group-subtotal' || entry.type === 'grand-total') && entry.aggregatedValues) {
                    const isGrand = entry.type === 'grand-total';
                    const indent = isGrand ? '' : '&nbsp;'.repeat(entry.depth * 4);
                    const label = isGrand ? 'Grand Total' : `${indent}Subtotal`;
                    const cls = isGrand ? 'grand-total' : 'group-subtotal';
                    html += `<tr class="${cls}">`;
                    exportColumns.forEach((col, i) => {
                        if (i === 0) { html += `<td>${label}</td>`; return; }
                        const aggVal = entry.aggregatedValues![col.field];
                        if (aggVal !== undefined && aggVal !== null) {
                            let formatted: unknown = aggVal;
                            if (col.valueFormatter) formatted = col.valueFormatter({ value: aggVal, row: {} as R, field: col.field });
                            else if (aggModel[col.field]) formatted = formatAggregationValue(aggVal, aggModel[col.field]);
                            html += `<td style="text-align:right;">${escapeHTML(String(formatted))}</td>`;
                        } else {
                            html += '<td></td>';
                        }
                    });
                    html += '</tr>';
                }
            });
        } else {
            const rowsToExport = selectedRows && selectedRows.length > 0
                ? rows.filter(r => selectedRows.includes(r.id))
                : rows;

            if (rowsToExport.length === 0) {
                printWindow.document.body.innerHTML = '<h3>No rows to export</h3>';
                return;
            }

            rowsToExport.forEach(row => {
                html += '<tr>';
                exportColumns.forEach(col => {
                    let value: unknown = (row as GridRowModel)[col.field];
                    if (col.valueGetter) value = col.valueGetter({ row, field: col.field, value });
                    if (col.valueFormatter && value !== undefined && value !== null) {
                        value = col.valueFormatter({ value, row, field: col.field });
                    }
                    if (col.type === 'image' && value) {
                        html += `<td><div style="display:flex;justify-content:center;"><img src="${value}" alt="${col.headerName}" style="max-height:40px;border-radius:4px;"></div></td>`;
                    } else {
                        html += `<td>${escapeHTML(String(value ?? ''))}</td>`;
                    }
                });
                html += '</tr>';
            });

            if (aggregationResult) {
                const aggModel = aggregationModel || {};
                html += '<tfoot><tr style="font-size:11px;color:#666;background-color:#f5f5f5;">';
                exportColumns.forEach(col => {
                    html += aggModel[col.field]
                        ? `<td style="text-align:right;font-weight:bold;">${escapeHTML(aggModel[col.field].toUpperCase())}</td>`
                        : '<td></td>';
                });
                html += '</tr><tr style="font-weight:bold;background-color:#f5f5f5;">';
                exportColumns.forEach(col => {
                    const aggVal = aggregationResult![col.field];
                    if (aggVal !== undefined && aggVal !== null) {
                        let formatted: unknown = aggVal;
                        if (col.valueFormatter) formatted = col.valueFormatter({ value: aggVal, row: {} as R, field: col.field });
                        else if (aggModel[col.field]) formatted = formatAggregationValue(aggVal, aggModel[col.field]);
                        html += `<td style="text-align:right;">${escapeHTML(String(formatted))}</td>`;
                    } else {
                        html += '<td></td>';
                    }
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
            printWindow.document.body.innerHTML = `<div style="color: red; padding: 20px;"><h3>Error Generating Print Preview</h3><p>${message}</p></div>`;
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
export type { PdfExportOptions } from '../../types';
