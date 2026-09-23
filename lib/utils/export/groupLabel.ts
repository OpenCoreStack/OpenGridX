import type { GridColDef, GridGroupedExportRow, GridRowModel } from '../../types';

/**
 * The label for a grouped-export group-header row, matching what the grid shows:
 * the entry's own groupLabel (set by getGroupedExportRows), else the grouping column's
 * groupingValueFormatter, else the documented "field: value" default.
 */
export function groupHeaderLabel<R extends GridRowModel>(entry: GridGroupedExportRow, columns: GridColDef<R>[]): string {
    if (entry.groupLabel !== undefined) return entry.groupLabel;
    const field = entry.groupField ?? '';
    const formatter = columns.find(col => col.field === field)?.groupingValueFormatter;
    if (formatter) return formatter({ field, value: entry.groupValue });
    return `${field}: ${String(entry.groupValue ?? '')}`;
}
