import type {
    GridAggregationModel,
    GridAggregationResult,
    GridColDef,
    GridGroupedExportRow,
    GridRowId,
    GridRowMeta,
    GridRowModel,
} from '../../types';
import { computeAggregations } from '../aggregation';

export interface BuildGroupedExportRowsParams<R extends GridRowModel> {
    /**
     * The grouped rows in display order with every group expanded: group rows followed by
     * their filtered, sorted descendants (useRowGrouping's getVisibleRows({ expandAll: true })).
     */
    rows: R[];
    getRowId: (row: R) => GridRowId;
    rowMetaMap: Map<GridRowId, GridRowMeta>;
    columns: GridColDef<R>[];
    aggregationModel: GridAggregationModel;
    /** The footer's grand total (already over the filtered data rows); omitted when null. */
    aggregationResult: GridAggregationResult | null;
    /** Groups whose subtotal is hidden (getAggregationPosition returned null for them); no subtotal is written. */
    isSubtotalHidden?: (groupId: GridRowId) => boolean;
}

interface OpenGroup<R> {
    id: GridRowId;
    header: GridGroupedExportRow;
    leaves: R[];
}

/**
 * Flattens the grouping tree for export: group-header, its leaves and nested groups, then
 * its subtotal, and a grand total at the end. The collapsed/expanded state on screen does
 * not matter, and subtotals are computed over the group's filtered leaves (the rows the
 * export contains), so every subtotal agrees with the rows above it.
 */
export function buildGroupedExportRows<R extends GridRowModel>(params: BuildGroupedExportRowsParams<R>): GridGroupedExportRow[] {
    const { rows, getRowId, rowMetaMap, columns, aggregationModel, aggregationResult, isSubtotalHidden } = params;
    const hasAggregation = Object.keys(aggregationModel).length > 0;
    const columnsLookup = new Map(columns.map(col => [col.field, col]));

    const result: GridGroupedExportRow[] = [];
    const open: OpenGroup<R>[] = [];

    const closeGroupsFrom = (depth: number) => {
        while (open.length > 0 && (open[open.length - 1].header.depth >= depth)) {
            const group = open.pop()!;
            if (hasAggregation && !isSubtotalHidden?.(group.id)) {
                result.push({
                    type: 'group-subtotal',
                    depth: group.header.depth,
                    groupField: group.header.groupField,
                    groupValue: group.header.groupValue,
                    groupLabel: group.header.groupLabel,
                    aggregatedValues: computeAggregations(group.leaves, aggregationModel, columnsLookup, 'getGroupedExportRows'),
                });
            }
        }
    };

    for (const row of rows) {
        const id = getRowId(row);
        const meta = rowMetaMap.get(id);
        if (meta?.isGroupFooter) continue;
        if (meta?.isGroupRow) {
            const depth = meta.treeDepth ?? 0;
            closeGroupsFrom(depth);
            const header: GridGroupedExportRow = {
                type: 'group-header',
                depth,
                groupField: meta.groupingField,
                groupValue: meta.groupingValue,
                groupLabel: meta.groupLabel,
            };
            result.push(header);
            open.push({ id, header, leaves: [] });
        } else {
            result.push({ type: 'leaf', depth: meta?.treeDepth ?? open.length, row });
            open.forEach(group => group.leaves.push(row));
        }
    }
    closeGroupsFrom(0);

    if (hasAggregation && aggregationResult) {
        result.push({ type: 'grand-total', depth: 0, aggregatedValues: aggregationResult });
    }
    return result;
}
