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
import { isRowMatchingFilter } from '../utils/filtering';
import { compareValues } from '../utils/sorting';
import { computeAggregations } from '../utils/aggregation';

export interface UseRowGroupingParams<R extends GridRowModel> {
    rows: R[];
    getRowId: (row: R) => GridRowId;
    columns?: GridColDef<R>[];
    rowGroupingModel?: GridRowGroupingModel;
    aggregationModel?: GridAggregationModel;
    defaultGroupingExpansionDepth?: number;
    filterModel?: GridFilterModel;
    sortModel?: GridSortItem[];
    getAggregationPosition?: (groupNode: GridTreeNode | null) => 'inline' | 'footer' | null;
}

const defaultGetAggregationPosition = (groupNode: GridTreeNode | null): 'inline' | 'footer' | null => {

    return groupNode?.depth === -1 ? 'footer' : 'inline';
};

// Stable empty defaults — module-level constants prevent new object identity
// on every render, which would otherwise invalidate useMemo deps and cause
// infinite re-render loops when callers omit optional params.
const EMPTY_ROW_GROUPING_MODEL: GridRowGroupingModel = [];
const EMPTY_AGGREGATION_MODEL: GridAggregationModel = {};
const EMPTY_OVERRIDES: Map<GridRowId, boolean> = new Map();

interface ExpansionOverrides {
    configKey: string;
    overrides: Map<GridRowId, boolean>;
}

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
        getAggregationPosition = defaultGetAggregationPosition
    } = params;

    const columnsLookup = useMemo(() => {
        const map = new Map<string, GridColDef<R>>();
        (columns ?? []).forEach(col => map.set(col.field, col));
        return map;
    }, [columns]);

    // User expand/collapse choices are stored as overrides on top of the depth-based
    // default, keyed by the grouping config. Rebuilding the tree (row edits, new rows
    // arrays) keeps them because group ids are deterministic; changing the grouping
    // config itself discards them.
    const configKey = `${rowGroupingModel.join('\u001f')}|${defaultGroupingExpansionDepth}`;
    const [expansionState, setExpansionState] = useState<ExpansionOverrides>(() => ({
        configKey,
        overrides: new Map(),
    }));
    const overrides = expansionState.configKey === configKey ? expansionState.overrides : EMPTY_OVERRIDES;

    const { treeNodes, rootIds, groupingRows } = useMemo(() => {
        const treeNodes = new Map<GridRowId, GridTreeNode>();
        const groupingRows = new Map<GridRowId, R>();
        const rootIds: GridRowId[] = [];

        if (rowGroupingModel.length === 0) {
            return { treeNodes, rootIds, groupingRows };
        }

        const getGroupId = (field: string, value: unknown, parentId: GridRowId | null) => {
            return `auto-group-${field}-${value}-${parentId || 'root'}`;
        };

        const groupRows = (
            currentRows: R[], 
            depth: number, 
            parentId: GridRowId | null
        ) => {
            if (depth >= rowGroupingModel.length) {

                return currentRows.map(row => {
                    const id = getRowId(row);
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

            const field = rowGroupingModel[depth];

            // Skip fields where the column has explicitly opted out of grouping.
            const colDef = columnsLookup.get(field);
            if (colDef && colDef.groupable === false) {
                return groupRows(currentRows, depth + 1, parentId);
            }

            const groups = new Map<string, R[]>();

            // Group current rows by value of the current field
            currentRows.forEach(row => {
                const value = row[field];
                const key = String(value); // reliable map key
                if (!groups.has(key)) {
                    groups.set(key, []);
                }
                groups.get(key)!.push(row);
            });

            const groupIds: GridRowId[] = [];

            // Create group rows
            groups.forEach((groupRowsList, key) => {
                // Use the raw value from the first row of the group for the groupingValue
                const firstRow = groupRowsList[0];
                const rawValue = firstRow[field];

                const groupId = getGroupId(field, key, parentId);
                groupIds.push(groupId);

                // Calculate Aggregations for this group
                const aggregatedValues: Record<string, unknown> =
                    computeAggregations(groupRowsList, aggregationModel, columnsLookup, 'useRowGrouping');

                const groupRow = {
                    [field]: rawValue,
                    ...aggregatedValues,
                    id: groupId
                } as unknown as R;

                groupingRows.set(groupId, groupRow);

                const treeNode: GridTreeNode = {
                    id: groupId,
                    parentId,
                    depth,
                    groupingKey: key,
                    groupingField: field,
                    groupingValue: rawValue,
                    aggregatedValues,
                    isExpanded: false,
                    children: [], 
                    label: colDef?.groupingValueFormatter
                        ? colDef.groupingValueFormatter({ field, value: rawValue })
                        : `${field}: ${String(rawValue)}` 
                };

                treeNode.aggregationPosition = getAggregationPosition(treeNode);

                treeNodes.set(groupId, treeNode);

                const childrenIds = groupRows(groupRowsList, depth + 1, groupId);
                treeNodes.get(groupId)!.children = childrenIds;

                const descendantCount = groupRowsList.length;
                treeNodes.get(groupId)!.descendantCount = descendantCount;
            });

            return groupIds;
        };

        const topLevelIds = groupRows(rows, 0, null);
        rootIds.push(...topLevelIds);

        return { treeNodes, rootIds, groupingRows };

    }, [rows, rowGroupingModel, aggregationModel, getRowId, getAggregationPosition, columnsLookup]);

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

    const getVisibleRows = useCallback(() => {
        if (rowGroupingModel.length === 0) return null;

        const result: R[] = [];
        const seenIds = new Set<GridRowId>();

        const rowLookup = new Map<GridRowId, R>();
        rows.forEach(r => rowLookup.set(getRowId(r), r));

        const doesNodeMatchFilter = (nodeId: GridRowId): boolean => {
            const node = treeNodes.get(nodeId);
            if (!node) return false;

            if (!node.children || node.children.length === 0) {

                const row = rowLookup.get(nodeId);
                if (!row) return false;

                if (filterModel) {
                    if (!isRowMatchingFilter(row, filterModel)) return false;
                }
                return true;
            }

            return node.children.some(childId => doesNodeMatchFilter(childId));
        };

        const traverse = (ids: GridRowId[]) => {

            // Copy before sorting: ids may be node.children / rootIds from the memoized tree.
            const visibleIds = filterModel ? ids.filter(doesNodeMatchFilter) : [...ids];

            if (sortModel && sortModel.length > 0) {
                visibleIds.sort((aId, bId) => {
                    const rowA = groupingRows.get(aId) || rowLookup.get(aId);
                    const rowB = groupingRows.get(bId) || rowLookup.get(bId);

                    if (!rowA || !rowB) return 0;

                    for (const sortItem of sortModel) {
                        const valA = rowA[sortItem.field];
                        const valB = rowB[sortItem.field];
                        const compareResult = compareValues(valA, valB, sortItem.sort);
                        if (compareResult !== 0) return compareResult;
                    }
                    return 0;
                });
            }

            visibleIds.forEach(id => {
                if (seenIds.has(id)) return; 

                const node = treeNodes.get(id);
                const isGroup = node?.children && node.children.length > 0;

                const row = isGroup ? groupingRows.get(id) : rowLookup.get(id);

                if (row && node) {
                     seenIds.add(id);

                     const enhancedRow = {
                        ...row,
                        _treeDepth: node.depth,
                        _isExpanded: expandedGroupIds.has(id),
                        _hasChildren: isGroup,
                        _groupingField: node.groupingField,
                        _groupingValue: node.groupingValue,
                        _descendantCount: node.descendantCount
                    };
                    result.push(enhancedRow);

                    if (expandedGroupIds.has(id) && isGroup) {
                        traverse(node.children!);
                    }
                }
            });
        };

        traverse(rootIds);

        return result;

    }, [rows, getRowId, treeNodes, rootIds, groupingRows, filterModel, sortModel, expandedGroupIds, rowGroupingModel]);

    const getNode = useCallback((id: GridRowId) => treeNodes.get(id), [treeNodes]);

    const rowMetaMap = useMemo<Map<GridRowId, GridRowMeta>>(() => {
        const map = new Map<GridRowId, GridRowMeta>();
        treeNodes.forEach((node, id) => {
            const isGroup = Boolean(node.children && node.children.length > 0);
            map.set(id, {
                hasChildren: isGroup,
                treeDepth: node.depth,
                groupingField: node.groupingField,
                groupingValue: node.groupingValue,
                groupLabel: node.label,
                descendantCount: node.descendantCount,
                isGroupRow: isGroup,
                isExpanded: isGroup ? expandedGroupIds.has(id) : undefined,
            });
        });
        return map;
    }, [treeNodes, expandedGroupIds]);

    return useMemo(() => ({
        treeNodes,
        groupingRows,
        toggleExpansion,
        isGroupExpanded,
        getVisibleRows,
        getNode,
        rowMetaMap,
    }), [treeNodes, groupingRows, toggleExpansion, isGroupExpanded, getVisibleRows, getNode, rowMetaMap]);
}
