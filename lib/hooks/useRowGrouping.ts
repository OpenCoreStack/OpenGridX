import { useState, useMemo, useEffect, useCallback } from 'react';
import type { 
    GridRowModel, 
    GridRowId, 
    GridRowGroupingModel, 
    GridAggregationModel, 
    GridTreeNode,
    GridFilterModel,
    GridSortItem
} from '../types';
import { isRowMatchingFilter } from '../utils/filtering';
import { compareValues } from '../utils/sorting';

export interface UseRowGroupingParams<R extends GridRowModel> {
    rows: R[];
    getRowId: (row: R) => GridRowId;
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

export function useRowGrouping<R extends GridRowModel>(params: UseRowGroupingParams<R>) {
    const { 
        rows, 
        getRowId, 
        rowGroupingModel = [], 
        aggregationModel = {}, 
        defaultGroupingExpansionDepth = 0,
        filterModel,
        sortModel,
        getAggregationPosition = defaultGetAggregationPosition
    } = params;

    const [expandedGroupIds, setExpandedGroupIds] = useState<Set<GridRowId>>(new Set());

    const { treeNodes, rootIds, groupingRows } = useMemo(() => {
        const treeNodes = new Map<GridRowId, GridTreeNode>();
        const groupingRows = new Map<GridRowId, R>();
        const rootIds: GridRowId[] = [];

        if (rowGroupingModel.length === 0) {
            return { treeNodes, rootIds, groupingRows };
        }

        const getGroupId = (field: string, value: any, parentId: GridRowId | null) => {
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
            const groups = new Map<any, R[]>();

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
                const aggregatedValues: Record<string, any> = {};
                if (aggregationModel) {
                    Object.entries(aggregationModel).forEach(([aggField, aggType]) => {
                        const values = groupRowsList.map(r => r[aggField]);
                        if (aggType === 'sum') {
                            aggregatedValues[aggField] = values.reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);
                        } else if (aggType === 'min') {
                            aggregatedValues[aggField] = Math.min(...values.map(v => Number(v) || 0));
                        } else if (aggType === 'max') {
                            aggregatedValues[aggField] = Math.max(...values.map(v => Number(v) || 0));
                        } else if (aggType === 'avg') {
                            const sum = values.reduce((a, b) => (Number(a) || 0) + (Number(b) || 0), 0);
                            aggregatedValues[aggField] = values.length ? sum / values.length : 0;
                        } else if (aggType === 'count') {
                            aggregatedValues[aggField] = values.length;
                        }
                    });
                }

                const groupRow: any = {
                    [field]: rawValue, 
                    ...aggregatedValues, 
                    id: groupId 
                };

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
                    label: `${field}: ${String(rawValue)}` 
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

    }, [rows, rowGroupingModel, aggregationModel, getRowId, getAggregationPosition]);

    useEffect(() => {
        if (defaultGroupingExpansionDepth === -1) {

            const allGroupIds = new Set<GridRowId>();
            treeNodes.forEach((node, id) => {
                if (node.children && node.children.length > 0) {
                    allGroupIds.add(id);
                }
            });
            setExpandedGroupIds(allGroupIds);
        } else if (defaultGroupingExpansionDepth > 0) {
            const depthIds = new Set<GridRowId>();
            treeNodes.forEach((node, id) => {
                if (node.depth < defaultGroupingExpansionDepth && node.children && node.children.length > 0) {
                    depthIds.add(id);
                }
            });
            setExpandedGroupIds(depthIds);
        } else {

            setExpandedGroupIds(new Set());
        }

    }, [rowGroupingModel, defaultGroupingExpansionDepth]);

    const toggleExpansion = useCallback((id: GridRowId) => {
        setExpandedGroupIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

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

            let visibleIds = ids;
            if (filterModel) {
                visibleIds = ids.filter(doesNodeMatchFilter);
            }

            if (sortModel && sortModel.length > 0) {
                visibleIds.sort((aId, bId) => {
                    const rowA = groupingRows.get(aId) || rowLookup.get(aId);
                    const rowB = groupingRows.get(bId) || rowLookup.get(bId);

                    if (!rowA || !rowB) return 0;

                    for (const sortItem of sortModel) {
                        const valA = (rowA as any)[sortItem.field];
                        const valB = (rowB as any)[sortItem.field];
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

                    if (isExpandedGroupIds.has(id) && isGroup) {
                        traverse(node.children!);
                    }
                }
            });
        };

        const isExpandedGroupIds = expandedGroupIds; 

        traverse(rootIds);

        return result;

    }, [rows, getRowId, treeNodes, rootIds, groupingRows, filterModel, sortModel, expandedGroupIds]);

    const getNode = useCallback((id: GridRowId) => treeNodes.get(id), [treeNodes]);

    return useMemo(() => ({
        treeNodes,
        groupingRows,
        toggleExpansion,
        isGroupExpanded,
        getVisibleRows,
        getNode
    }), [treeNodes, groupingRows, toggleExpansion, isGroupExpanded, getVisibleRows, getNode]);
}
