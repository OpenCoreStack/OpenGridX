
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
    getRawExportValue,
    hasSelection,
    pickExportedAggregates,
    rowsForExport,
    shouldExportGrouped,
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
import { downloadFile } from './exportRows';

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
