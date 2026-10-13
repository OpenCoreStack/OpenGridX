
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
    getExportColumns,
    hasSelection,
    isNonTextValue,
    neutralizeFormula,
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
import { aggregateTexts, downloadFile, exportCell } from './exportRows';

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
                    const text = escapeFormulas ? neutralizeFormula(cell.text, cell.fromNonText) : cell.text;
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
                return field(cell.text, cell.fromNonText);
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
