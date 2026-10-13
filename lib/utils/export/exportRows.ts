// Shared by the CSV, HTML-Excel, JSON and print exporters: one data cell's text, the aggregate texts
// of a total row, and the browser download.

import type {
    GridColDef,
    GridRowId,
    GridRowModel,
    GridValidRowModel,
    GridAggregationModel,
    GridGroupedExportRow,
} from '../../types';
import {
    formatExportAggregate,
    formatExportValue,
    getRawExportValue,
    isTrustedNonText,
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
export interface ExportCell {
    text: string;
    raw: unknown;
    /** The text came from the grid's own formatting of a number, date or boolean (see `isTrustedNonText`). */
    fromNonText: boolean;
}

export function exportCell<R extends GridRowModel>(row: R, col: GridColDef<R>): ExportCell {
    const raw = getRawExportValue(row, col);
    const text = formatExportValue(row, col, raw);
    return { text, raw, fromNonText: isTrustedNonText(raw, text, !!col.valueFormatter) };
}

/** Aggregate text per export column for one subtotal / total record. */
export function aggregateTexts<R extends GridRowModel>(
    exportColumns: GridColDef<R>[],
    aggregates: Record<string, unknown>,
    aggModel: GridAggregationModel,
): string[] {
    return exportColumns.map(col => formatExportAggregate(col, aggModel[col.field], aggregates[col.field], aggregates));
}

export function downloadFile(content: string, fileName: string, mimeType: string): void {
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
