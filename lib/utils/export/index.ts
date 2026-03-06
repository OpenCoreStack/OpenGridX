
import type { GridColDef, GridRowModel, GridAggregationModel } from '../../types';
import { formatAggregationValue } from '../../hooks/features/useAggregation';

export interface CsvExportOptions {
    fileName?: string;
    includeHeaders?: boolean;
    delimiter?: string;
    selectedRows?: (string | number)[];
    aggregationResult?: Record<string, any> | null;
    aggregationModel?: GridAggregationModel | null;
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
        selectedRows
    } = options;

    const rowsToExport = selectedRows && selectedRows.length > 0
        ? rows.filter(r => selectedRows.includes(r.id))
        : rows;

    if (rowsToExport.length === 0) {
        console.warn('No rows to export');
        return;
    }

    const exportColumns = columns.filter(col => {

        if (col.field === '__check__' || col.field === '__actions__') return false;
        return true;
    });

    let csvContent = '';

    // Add headers
    if (includeHeaders) {
        const headers = exportColumns.map(col => escapeCSV(col.headerName || col.field));
        csvContent += headers.join(delimiter) + '\n';
    }

    rowsToExport.forEach(row => {
        const values = exportColumns.map(col => {
            let value: any = row[col.field as keyof R];

            if (col.valueGetter) {
                value = col.valueGetter({ row, field: col.field, value });
            }

            if (col.valueFormatter && value !== undefined && value !== null) {
                value = col.valueFormatter({ value, row, field: col.field });
            }

            return escapeCSV(String(value ?? ''));
        });
        csvContent += values.join(delimiter) + '\n';
    });

    // Add Aggregation
    if (options.aggregationResult) {
        const aggResult = options.aggregationResult;
        const aggModel = options.aggregationModel || {};
        
        // Print Aggregation Function Labels
        const aggLabels = exportColumns.map((col) => {
            if (aggModel[col.field]) {
                return escapeCSV(aggModel[col.field].toUpperCase());
            }
            return escapeCSV('');
        });
        csvContent += aggLabels.join(delimiter) + '\n';

        // Print Aggregation Values
        const aggValues = exportColumns.map((col) => {
            const aggVal = aggResult[col.field];
            if (aggVal !== undefined && aggVal !== null) {
                let formatted = aggVal;
                if (col.valueFormatter) {
                    formatted = col.valueFormatter({ value: aggVal, row: {} as R, field: col.field });
                } else if (aggModel[col.field]) {
                    formatted = formatAggregationValue(aggVal, aggModel[col.field]);
                }
                return escapeCSV(String(formatted));
            }
            return escapeCSV('');
        });
        csvContent += aggValues.join(delimiter) + '\n';
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
    aggregationResult?: Record<string, any> | null;
    aggregationModel?: GridAggregationModel | null;
}

export function exportToExcel<R extends GridRowModel>(
    rows: R[],
    columns: GridColDef<R>[],
    options: ExcelExportOptions = {}
): void {
    const {
        fileName = 'export.xlsx',
        sheetName = 'Sheet1',
        includeHeaders = true,
        selectedRows
    } = options;

    const rowsToExport = selectedRows && selectedRows.length > 0
        ? rows.filter(r => selectedRows.includes(r.id))
        : rows;

    if (rowsToExport.length === 0) {
        console.warn('No rows to export');
        return;
    }

    const exportColumns = columns.filter(col => {
        if (col.field === '__check__' || col.field === '__actions__') return false;
        return true;
    });

    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    html += '<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
    html += `<x:Name>${sheetName}</x:Name>`;
    html += '<x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
    html += '<meta charset="UTF-8"></head><body>';
    html += '<table border="1">';

    if (includeHeaders) {
        html += '<thead><tr>';
        exportColumns.forEach(col => {
            html += `<th>${escapeHTML(col.headerName || col.field)}</th>`;
        });
        html += '</tr></thead>';
    }

    html += '<tbody>';
    rowsToExport.forEach(row => {
        html += '<tr>';
        exportColumns.forEach(col => {
            let value: any = row[col.field as keyof R];

            if (col.valueGetter) {
                value = col.valueGetter({ row, field: col.field, value });
            }

            if (col.valueFormatter && value !== undefined && value !== null) {
                value = col.valueFormatter({ value, row, field: col.field });
            }

            html += `<td>${escapeHTML(String(value ?? ''))}</td>`;
        });
    });

    if (options.aggregationResult) {
        const aggResult = options.aggregationResult;
        const aggModel = options.aggregationModel || {};

        html += '<tr style="font-size: 11px; color: #666; background-color: #f5f5f5;">';
        exportColumns.forEach((col) => {
            if (aggModel[col.field]) {
                html += `<td style="text-align: right; font-weight: bold;">${escapeHTML(aggModel[col.field].toUpperCase())}</td>`;
            } else {
                html += `<td></td>`;
            }
        });
        html += '</tr>';

        html += '<tr style="font-weight: bold; background-color: #f5f5f5;">';
        exportColumns.forEach((col) => {
            const aggVal = aggResult[col.field];
            if (aggVal !== undefined && aggVal !== null) {
                let formatted = aggVal;
                if (col.valueFormatter) {
                    formatted = col.valueFormatter({ value: aggVal, row: {} as R, field: col.field });
                } else if (aggModel[col.field]) {
                    formatted = formatAggregationValue(aggVal, aggModel[col.field]);
                }
                html += `<td style="text-align: right;">${escapeHTML(String(formatted))}</td>`;
            } else {
                html += `<td></td>`;
            }
        });
        html += '</tr>';
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
    aggregationResult?: Record<string, any> | null;
    aggregationModel?: GridAggregationModel | null;
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
        selectedRows
    } = options;

    // Filter rows if selection is active
    const rowsToExport = selectedRows && selectedRows.length > 0
        ? rows.filter(r => selectedRows.includes(r.id))
        : rows;

    if (rowsToExport.length === 0) {
        console.warn('No rows to export');
        return;
    }

    // Filter columns
    const exportColumns = columns.filter(col => {
        if (col.field === '__check__' || col.field === '__actions__') return false;
        return true;
    });

    // Build JSON data
    const data = rowsToExport.map(row => {
        const obj: any = {};
        exportColumns.forEach(col => {
            let value: any = row[col.field as keyof R];

            // Use valueGetter if available
            if (col.valueGetter) {
                value = col.valueGetter({ row, field: col.field, value });
            }

            obj[col.field] = value;
        });
        return obj;
    });

    let outData: any = data;

    if (options.aggregationResult) {
        const aggResult = options.aggregationResult;
        const aggModel = options.aggregationModel || {};
        
        const summaryLabelObj: any = {};
        exportColumns.forEach((col) => {
            if (aggModel[col.field]) {
               summaryLabelObj[col.field] = aggModel[col.field].toUpperCase();
            }
        });

        const summaryDataObj: any = {};
        exportColumns.forEach((col) => {
            if (aggResult[col.field] !== undefined && aggResult[col.field] !== null) {
               let aggVal = aggResult[col.field];
               if (col.valueFormatter) {
                   aggVal = col.valueFormatter({ value: aggVal, row: {} as R, field: col.field });
               } else if (aggModel[col.field]) {
                   aggVal = formatAggregationValue(aggVal, aggModel[col.field]);
               }
               summaryDataObj[col.field] = aggVal;
            }
        });

        outData = {
            data: data,
            aggregation: {
                labels: summaryLabelObj,
                values: summaryDataObj
            }
        };
    }

    const jsonContent = pretty ? JSON.stringify(outData, null, 2) : JSON.stringify(outData);

    // Download file
    downloadFile(jsonContent, fileName, 'application/json;charset=utf-8;');
}

// ============================================================================
// Print
// ============================================================================

export interface PrintOptions {
    title?: string;
    selectedRows?: (string | number)[];
    aggregationResult?: Record<string, any> | null;
    aggregationModel?: GridAggregationModel | null;
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
        let aggregationResult: Record<string, any> | null = null;
        let aggregationModel: GridAggregationModel | null = null;

        if (typeof titleOrOptions === 'string') {
            title = titleOrOptions;
        } else if (typeof titleOrOptions === 'object') {
            title = titleOrOptions.title || 'Print';
            selectedRows = titleOrOptions.selectedRows;
            aggregationResult = titleOrOptions.aggregationResult || null;
            aggregationModel = titleOrOptions.aggregationModel || null;
        }

        // Filter rows if selection is active
        const rowsToExport = selectedRows && selectedRows.length > 0
            ? rows.filter(r => selectedRows.includes(r.id))
            : rows;

        if (rowsToExport.length === 0) {
            printWindow.document.body.innerHTML = '<h3>No rows to export</h3>';
            return;
        }

        // Filter columns
        const exportColumns = columns.filter(col => {
            if (col.field === '__check__' || col.field === '__actions__') return false;
            return true;
        });

        // Build HTML
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title || 'Print'}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { font-size: 24px; margin-bottom: 20px; }
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    @media print {
                        body { margin: 0; }
                        @page { margin: 1cm; }
                    }
                </style>
            </head>
            <body>
        `;

        if (title) {
            html += `<h1>${escapeHTML(title)}</h1>`;
        }

        html += '<table>';

        // Headers
        html += '<thead><tr>';
        exportColumns.forEach(col => {
            html += `<th>${escapeHTML(col.headerName || col.field)}</th>`;
        });
        html += '</tr></thead>';

        // Rows
        html += '<tbody>';

        // Process rows (potential bottleneck logic here)
        rowsToExport.forEach(row => {
            html += '<tr>';
            exportColumns.forEach(col => {
                let value: any = row[col.field as keyof R];

                if (col.valueGetter) {
                    value = col.valueGetter({ row, field: col.field, value });
                }

                if (col.valueFormatter && value !== undefined && value !== null) {
                    value = col.valueFormatter({ value, row, field: col.field });
                }

                if (col.type === 'image' && value) {
                    html += `<td><div style="display:flex;justify-content:center;"><img src="${value}" alt="${col.headerName}" style="max-height: 40px; border-radius: 4px;"></div></td>`;
                } else {
                    html += `<td>${escapeHTML(String(value ?? ''))}</td>`;
                }
            });
            html += '</tr>';
        });

        if (aggregationResult) {
            const aggModel = aggregationModel || {};
            html += '<tfoot><tr style="font-size: 11px; color: #666; background-color: #f5f5f5;">';
            exportColumns.forEach((col) => {
                if (aggModel[col.field]) {
                    html += `<td style="text-align: right; font-weight: bold;">${escapeHTML(aggModel[col.field].toUpperCase())}</td>`;
                } else {
                    html += `<td></td>`;
                }
            });
            html += '</tr><tr style="font-weight: bold; background-color: #f5f5f5;">';
            exportColumns.forEach((col) => {
                const aggVal = aggregationResult![col.field];
                if (aggVal !== undefined && aggVal !== null) {
                    let formatted = aggVal;
                    if (col.valueFormatter) {
                        formatted = col.valueFormatter({ value: aggVal, row: {} as R, field: col.field });
                    } else if (aggModel[col.field]) {
                        formatted = formatAggregationValue(aggVal, aggModel[col.field]);
                    }
                    html += `<td style="text-align: right;">${escapeHTML(String(formatted))}</td>`;
                } else {
                    html += `<td></td>`;
                }
            });
            html += '</tr></tfoot>';
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

    } catch (e: any) {
        console.error('Print generation failed:', e);
        if (printWindow && !printWindow.closed) {
            printWindow.document.body.innerHTML = `<div style="color: red; padding: 20px;"><h3>Error Generating Print Preview</h3><p>${e.message}</p></div>`;
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
