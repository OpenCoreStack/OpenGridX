import { useState, useMemo, useCallback } from 'react';
import type {
    GridRowModel,
    GridRowId,
    GridRowGroupingModel,
    GridAggregationModel,
    GridTreeNode,
    GridFilterModel,
    GridSortItem,
    GridRowMeta,
    GridColDef
} from '../types';
import { createRowFilter } from '../utils/filtering';
import { sortItemsBySortModel, type GridSortValue } from '../utils/sorting';
import { callSafely, getCellValue } from '../utils/values';
import type { GridColumnLookup } from '../utils/columnLookup';
import { computeAggregations } from '../utils/aggregation';

/** Where a group's aggregates are shown: on the group row, on a subtotal row after its children, or not at all. */
export type GridGroupAggregationPosition = 'inline' | 'footer' | null;

export interface UseRowGroupingParams<R extends GridRowModel> {
    rows: R[];
    getRowId: (row: R) => GridRowId;
    columns?: GridColDef<R>[];
    rowGroupingModel?: GridRowGroupingModel;
    aggregationModel?: GridAggregationModel;
    defaultGroupingExpansionDepth?: number;
    filterModel?: GridFilterModel;
    sortModel?: GridSortItem[];
    getAggregationPosition?: (groupNode: GridTreeNode | null) => GridGroupAggregationPosition;
    /** Column definitions, so filter and sort read leaf cells through valueGetter and use the column type. */
    columnLookup?: GridColumnLookup;
    /** 'server': the rows arrive filtered, so the groups are built from them as they are. */
    filterMode?: 'client' | 'server';
    /** 'server': the rows arrive sorted, so groups and leaves keep the order the server sent them in. */
    sortingMode?: 'client' | 'server';
}

// Group rows show their aggregates inline; the grand total (null) is the grid's footer row.
const defaultGetAggregationPosition = (groupNode: GridTreeNode | null): GridGroupAggregationPosition =>
    groupNode === null ? 'footer' : 'inline';

// A getAggregationPosition that throws falls back to the default position for that node.
function callAggregationPosition(
    getAggregationPosition: (groupNode: GridTreeNode | null) => GridGroupAggregationPosition,
    groupNode: GridTreeNode | null,
): GridGroupAggregationPosition {
    return callSafely(
        () => getAggregationPosition(groupNode),
        defaultGetAggregationPosition(groupNode),
        'getAggregationPosition',
        'getAggregationPosition threw; the default position is used',
    );
}

// The group-row label: the column's groupingValueFormatter, or "field: value" (also when it throws).
function formatGroupLabel(colDef: GridColDef | undefined, field: string, value: unknown): string {
    const fallback = `${field}: ${String(value)}`;
    const formatter = colDef?.groupingValueFormatter;
    if (!formatter) return fallback;
    return callSafely(
        () => formatter({ field, value }),
        fallback,
        `groupingValueFormatter:${field}`,
        `groupingValueFormatter for column "${field}" threw; the group is labelled "${field}: value"`,
    );
}

// Stable empty defaults — module-level constants prevent new object identity
// on every render, which would otherwise invalidate useMemo deps and cause
// infinite re-render loops when callers omit optional params.
const EMPTY_ROW_GROUPING_MODEL: GridRowGroupingModel = [];
const EMPTY_AGGREGATION_MODEL: GridAggregationModel = {};
const EMPTY_OVERRIDES: Map<GridRowId, boolean> = new Map();

const FIELD_SEPARATOR = '\u001f';

/** Options of the hierarchy hooks' getVisibleRows. */
export interface GridHierarchyVisibleRowsOptions {
    /** Walk every group regardless of expansion (exports, getAllFilteredRows). */
    expandAll?: boolean;
    /** The column that shows the hierarchy: sorting by it orders group rows by their grouping value / label. */
    labelField?: string;
}

interface ExpansionOverrides {
    configKey: string;
    overrides: Map<GridRowId, boolean>;
}

/**
 * The bucket key of a grouping value. Distinct values never share a key, so `null` and `'null'`,
 * `1` and `'1'`, `true` and `'true'` are separate groups; equal dates share one. Strings keep their
 * own text, so the group ids of string values stay readable.
 */
function groupKeyOf(value: unknown): string {
    if (typeof value === 'string') return value;
    if (value === null) return `${FIELD_SEPARATOR}null`;
    if (value === undefined) return `${FIELD_SEPARATOR}undefined`;
    if (value instanceof Date) return `${FIELD_SEPARATOR}date:${value.getTime()}`;
    if (typeof value === 'object') {
        try {
            return `${FIELD_SEPARATOR}object:${JSON.stringify(value)}`;
        } catch {
            return `${FIELD_SEPARATOR}object:${String(value)}`;
        }
    }
    return `${FIELD_SEPARATOR}${typeof value}:${String(value)}`;
}

const groupIdOf = (field: string, key: string, parentId: GridRowId | null): string =>
    `auto-group-${field}-${key}-${parentId ?? 'root'}`;

/** The id of the subtotal row shown after a group's children when its aggregates are in 'footer' position. */
const footerIdOf = (groupId: GridRowId): string => `${groupId}${FIELD_SEPARATOR}footer`;

interface GroupRowVariants<R> {
    /** The group row carrying its aggregates. */
    inline: R;
    /** The group row without aggregates ('footer' and null positions). */
    bare: R;
    /** The subtotal row, when there is an aggregation model. */
    footer: R | null;
}

interface GroupingBuild<R extends GridRowModel> {
    treeNodes: Map<GridRowId, GridTreeNode>;
    rootIds: GridRowId[];
    groupIds: GridRowId[];
    groupRowVariants: Map<GridRowId, GroupRowVariants<R>>;
    /** Synthetic rows by id: every group row (with its aggregates) and every subtotal row. */
    groupingRows: Map<GridRowId, R>;
    /** The leaf rows in the tree, by id. */
    rowLookup: Map<GridRowId, R>;
}

const encodePosition = (position: GridGroupAggregationPosition): string =>
    position === 'footer' ? 'f' : position === null ? 'n' : 'i';

const decodePosition = (code: string | undefined): GridGroupAggregationPosition =>
    code === 'f' ? 'footer' : code === 'n' ? null : 'inline';

export function useRowGrouping<R extends GridRowModel>(params: UseRowGroupingParams<R>) {
    const {
        rows,
        getRowId,
        columns,
        rowGroupingModel = EMPTY_ROW_GROUPING_MODEL,
        aggregationModel = EMPTY_AGGREGATION_MODEL,
        defaultGroupingExpansionDepth = 0,
        filterModel,
        sortModel,
        getAggregationPosition = defaultGetAggregationPosition,
        columnLookup,
        filterMode = 'client',
        sortingMode = 'client',
    } = params;

    // Keyed by value, so an inline `rowGroupingModel={['region']}` or aggregation model does not
    // rebuild (and re-aggregate) every group on each parent render.
    const requestedModelKey = rowGroupingModel.join(FIELD_SEPARATOR);
    const requestedModel = useMemo<GridRowGroupingModel>(
        () => (requestedModelKey === '' ? [] : requestedModelKey.split(FIELD_SEPARATOR)),
        [requestedModelKey]
    );
    const aggregationModelKey = JSON.stringify(Object.entries(aggregationModel));
    const stableAggregationModel = useMemo<GridAggregationModel>(
        () => Object.fromEntries(JSON.parse(aggregationModelKey) as Array<[string, string]>),
        [aggregationModelKey]
    );
    const hasAggregation = Object.keys(stableAggregationModel).length > 0;

    const columnsLookup = useMemo(() => {
        const map = new Map<string, GridColDef<R>>();
        (columns ?? []).forEach(col => map.set(col.field, col));
        return map;
    }, [columns]);

    const isActive = requestedModel.length > 0;

    // Fields with `groupable: false` are dropped before building, so the remaining levels keep their
    // depths (indent, defaultGroupingExpansionDepth and export depth) as if the field was never listed.
    const groupingFields = useMemo(
        () => requestedModel.filter(field => columnsLookup.get(field)?.groupable !== false),
        [requestedModel, columnsLookup]
    );
    const groupingFieldsKey = groupingFields.join(FIELD_SEPARATOR);

    // User expand/collapse choices are stored as overrides on top of the depth-based
    // default, keyed by the grouping config. Rebuilding the tree (row edits, new rows
    // arrays) keeps them because group ids are deterministic; changing the grouping
    // config itself discards them.
    const configKey = `${groupingFieldsKey}|${defaultGroupingExpansionDepth}`;
    const [expansionState, setExpansionState] = useState<ExpansionOverrides>(() => ({
        configKey,
        overrides: new Map(),
    }));
    const overrides = expansionState.configKey === configKey ? expansionState.overrides : EMPTY_OVERRIDES;

    // Groups hold only the rows that pass the filter, so group subtotals, the "(n)" counts and the set
    // of groups all describe what is shown. With filterMode 'server' the rows already are the result.
    // null = every row passes.
    const matchingRows = useMemo<Set<R> | null>(() => {
        if (!isActive || filterMode === 'server') return null;
        const rowFilter = createRowFilter(filterModel, columnLookup);
        return rowFilter ? new Set(rows.filter(row => rowFilter(row))) : null;
    }, [isActive, rows, filterMode, filterModel, columnLookup]);

    const build = useMemo<GroupingBuild<R>>(() => {
        const treeNodes = new Map<GridRowId, GridTreeNode>();
        const rootIds: GridRowId[] = [];
        const groupIds: GridRowId[] = [];
        const groupRowVariants = new Map<GridRowId, GroupRowVariants<R>>();
        const groupingRows = new Map<GridRowId, R>();
        const rowLookup = new Map<GridRowId, R>();

        if (!isActive) {
            return { treeNodes, rootIds, groupIds, groupRowVariants, groupingRows, rowLookup };
        }

        const groupRows = (currentRows: R[], depth: number, parentId: GridRowId | null): GridRowId[] => {
            if (depth >= groupingFields.length) {
                const leaves = matchingRows ? currentRows.filter(row => matchingRows.has(row)) : currentRows;
                return leaves.map(row => {
                    const id = getRowId(row);
                    rowLookup.set(id, row);
                    treeNodes.set(id, {
                        id,
                        parentId,
                        depth,
                        groupingKey: '',
                        isExpanded: false
                    });
                    return id;
                });
            }

            const field = groupingFields[depth];
            const colDef = columnsLookup.get(field);

            // Bucket by the value the cell shows (through valueGetter), keyed so distinct values stay apart.
            const buckets = new Map<string, { value: unknown; rows: R[] }>();
            for (const row of currentRows) {
                const value = getCellValue(row, field, colDef as GridColDef | undefined);
                const key = groupKeyOf(value);
                let bucket = buckets.get(key);
                if (!bucket) {
                    bucket = { value, rows: [] };
                    buckets.set(key, bucket);
                }
                bucket.rows.push(row);
            }

            const ids: GridRowId[] = [];
            buckets.forEach((bucket, key) => {
                // Group order is the order of first appearance among all rows, so filtering never
                // reorders the groups; a group with no matching row is left out.
                const matching = matchingRows ? bucket.rows.filter(row => matchingRows.has(row)) : bucket.rows;
                if (matching.length === 0) return;
                const groupId = groupIdOf(field, key, parentId);
                ids.push(groupId);
                groupIds.push(groupId);

                // Aggregated over this group's (filtered) leaf rows.
                const aggregatedValues: Record<string, unknown> = hasAggregation
                    ? computeAggregations(matching, stableAggregationModel, columnsLookup, 'useRowGrouping')
                    : {};

                const inline = { [field]: bucket.value, ...aggregatedValues, id: groupId } as unknown as R;
                const bare = { [field]: bucket.value, id: groupId } as unknown as R;
                const footer = hasAggregation
                    ? ({ ...aggregatedValues, id: footerIdOf(groupId) } as unknown as R)
                    : null;
                groupRowVariants.set(groupId, { inline, bare, footer });
                groupingRows.set(groupId, inline);
                if (footer) groupingRows.set(footer.id, footer);

                const treeNode: GridTreeNode = {
                    id: groupId,
                    parentId,
                    depth,
                    groupingKey: String(bucket.value),
                    groupingField: field,
                    groupingValue: bucket.value,
                    aggregatedValues,
                    isExpanded: false,
                    children: [],
                    label: formatGroupLabel(colDef, field, bucket.value),
                    descendantCount: matching.length,
                };
                treeNodes.set(groupId, treeNode);
                treeNode.children = groupRows(bucket.rows, depth + 1, groupId);
            });
            return ids;
        };

        rootIds.push(...groupRows(rows, 0, null));
        return { treeNodes, rootIds, groupIds, groupRowVariants, groupingRows, rowLookup };
    }, [isActive, rows, matchingRows, groupingFields, hasAggregation, stableAggregationModel, getRowId, columnsLookup]);

    const { treeNodes, rootIds, groupIds, groupRowVariants, groupingRows, rowLookup } = build;

    const isDefaultExpanded = useCallback((node: GridTreeNode | undefined) => (
        Boolean(node?.children && node.children.length > 0) &&
        (defaultGroupingExpansionDepth === -1 || (node?.depth ?? 0) < defaultGroupingExpansionDepth)
    ), [defaultGroupingExpansionDepth]);

    const expandedGroupIds = useMemo<Set<GridRowId>>(() => {
        const ids = new Set<GridRowId>();
        treeNodes.forEach((node, id) => {
            if (!node.children || node.children.length === 0) return;
            if (overrides.get(id) ?? isDefaultExpanded(node)) ids.add(id);
        });
        return ids;
    }, [treeNodes, overrides, isDefaultExpanded]);

    const toggleExpansion = useCallback((id: GridRowId) => {
        setExpansionState(prev => {
            const base = prev.configKey === configKey ? prev.overrides : EMPTY_OVERRIDES;
            const current = base.get(id) ?? isDefaultExpanded(treeNodes.get(id));
            const next = new Map(base);
            next.set(id, !current);
            return { configKey, overrides: next };
        });
    }, [configKey, treeNodes, isDefaultExpanded]);

    const isGroupExpanded = useCallback((id: GridRowId) => {
        return expandedGroupIds.has(id);
    }, [expandedGroupIds]);

    // getAggregationPosition runs once per group per render (it receives the group's current
    // expansion state), but only its answers are memoized on, so an inline callback does not
    // rebuild the rows or the row metadata.
    const positionsKey = hasAggregation
        ? groupIds.map(id => {
            const node = treeNodes.get(id);
            return node ? encodePosition(callAggregationPosition(getAggregationPosition, { ...node, isExpanded: expandedGroupIds.has(id) })) : 'i';
        }).join('')
        : '';
    const aggregationPositions = useMemo<Map<GridRowId, GridGroupAggregationPosition>>(() => {
        const map = new Map<GridRowId, GridGroupAggregationPosition>();
        groupIds.forEach((id, index) => map.set(id, decodePosition(positionsKey[index])));
        return map;
    }, [groupIds, positionsKey]);

    /** Where the grand total goes: `null` hides the grid's aggregation footer. */
    const rootAggregationPosition: GridGroupAggregationPosition = hasAggregation ? callAggregationPosition(getAggregationPosition, null) : 'footer';

    const isClientSort = sortingMode !== 'server' && Boolean(sortModel && sortModel.length > 0);

    /**
     * The rows to render, in order. `labelField` is the column that shows the group labels: sorting
     * by it orders the groups by their grouping value (a group row has no value of its own there).
     */
    const getVisibleRows = useCallback((options?: GridHierarchyVisibleRowsOptions): R[] | null => {
        if (!isActive) return null;
        const labelField = options?.labelField;
        const expandAll = options?.expandAll ?? false;

        const activeSortModel = isClientSort && sortModel ? sortModel : [];

        const readSortValue = (id: GridRowId, sortItem: GridSortItem): GridSortValue => {
            const node = treeNodes.get(id);
            if (node && groupRowVariants.has(id)) {
                const groupingField = node.groupingField ?? '';
                if (sortItem.field === groupingField || sortItem.field === labelField) {
                    return { value: node.groupingValue, type: columnLookup?.byField.get(groupingField)?.type };
                }
                if (node.aggregatedValues && Object.prototype.hasOwnProperty.call(node.aggregatedValues, sortItem.field)) {
                    return { value: node.aggregatedValues[sortItem.field], type: columnLookup?.byField.get(sortItem.field)?.type };
                }
                return { value: undefined };
            }
            const row = rowLookup.get(id);
            const colDef = columnLookup?.byField.get(sortItem.field);
            return { value: row ? getCellValue(row, sortItem.field, colDef) : undefined, type: colDef?.type };
        };

        const result: R[] = [];
        const seenIds = new Set<GridRowId>();

        const traverse = (ids: readonly GridRowId[]) => {
            const ordered = activeSortModel.length > 0 ? sortItemsBySortModel(ids, activeSortModel, readSortValue) : ids;
            for (const id of ordered) {
                if (seenIds.has(id)) continue;
                seenIds.add(id);

                const variants = groupRowVariants.get(id);
                if (!variants) {
                    // Hierarchy info travels in rowMetaMap; the consumer's row object is passed through unchanged.
                    const row = rowLookup.get(id);
                    if (row) result.push(row);
                    continue;
                }

                const node = treeNodes.get(id);
                const isExpanded = expandedGroupIds.has(id);
                // null is a position ("hidden"), so no `??` default here.
                const position = aggregationPositions.has(id) ? aggregationPositions.get(id) ?? null : 'inline';
                // 'footer' moves the aggregates below the children; while collapsed there is no
                // subtotal row, so they stay on the group row instead of disappearing.
                const showInline = position === 'inline' || (position === 'footer' && !isExpanded);
                result.push(showInline ? variants.inline : variants.bare);

                if ((isExpanded || expandAll) && node?.children) {
                    traverse(node.children);
                    // expandAll (exports) walks the data only; exporters write their own subtotals.
                    if (isExpanded && !expandAll && position === 'footer' && variants.footer) result.push(variants.footer);
                }
            }
        };

        traverse(rootIds);
        return result;
    }, [isActive, isClientSort, sortModel, treeNodes, groupRowVariants, rowLookup, columnLookup, expandedGroupIds, aggregationPositions, rootIds]);

    const getNode = useCallback((id: GridRowId) => treeNodes.get(id), [treeNodes]);

    const rowMetaMap = useMemo<Map<GridRowId, GridRowMeta>>(() => {
        const map = new Map<GridRowId, GridRowMeta>();
        treeNodes.forEach((node, id) => {
            const variants = groupRowVariants.get(id);
            if (!variants) {
                map.set(id, {
                    hasChildren: false,
                    treeDepth: node.depth,
                    isGroupRow: false,
                });
                return;
            }
            const groupMeta: GridRowMeta = {
                hasChildren: true,
                treeDepth: node.depth,
                groupingField: node.groupingField,
                groupingValue: node.groupingValue,
                groupLabel: node.label,
                descendantCount: node.descendantCount,
                isGroupRow: true,
                isExpanded: expandedGroupIds.has(id),
            };
            map.set(id, groupMeta);
            if (variants.footer && aggregationPositions.get(id) === 'footer') {
                map.set(variants.footer.id, {
                    ...groupMeta,
                    hasChildren: false,
                    treeDepth: node.depth + 1,
                    isExpanded: undefined,
                    isGroupFooter: true,
                });
            }
        });
        return map;
    }, [treeNodes, groupRowVariants, expandedGroupIds, aggregationPositions]);

    return useMemo(() => ({
        treeNodes,
        groupingRows,
        toggleExpansion,
        isGroupExpanded,
        getVisibleRows,
        getNode,
        rowMetaMap,
        aggregationPositions,
        rootAggregationPosition,
    }), [treeNodes, groupingRows, toggleExpansion, isGroupExpanded, getVisibleRows, getNode, rowMetaMap, aggregationPositions, rootAggregationPosition]);
}
