import { useMemo, useState, useCallback, useEffect } from 'react';
import { GridRowModel, GridRowId, GridTreeNode, GridFilterModel, GridSortItem } from '../types';
import { isRowMatchingFilter } from '../utils/filtering';
import { compareValues } from '../utils/sorting';

interface UseTreeDataProps<R extends GridRowModel> {
    rows: R[];
    getRowId: (row: R) => GridRowId;
    getTreeDataPath?: (row: R) => string[];
    treeData?: boolean;
    defaultGroupingExpansionDepth?: number;
    filterModel?: GridFilterModel;
    sortModel?: GridSortItem[];
    onRowExpansionChange?: (node: GridTreeNode) => void;
}

export function useTreeData<R extends GridRowModel>(props: UseTreeDataProps<R>) {
    const { 
        rows, 
        getRowId,
        getTreeDataPath, 
        treeData = false, 
        defaultGroupingExpansionDepth = 0, 
        filterModel,
        sortModel,
        onRowExpansionChange
    } = props;

    const { treeNodes, rootIds, groupingRows } = useMemo(() => {
        if (!treeData || !getTreeDataPath) {
            return { 
                treeNodes: new Map<GridRowId, GridTreeNode>(), 
                rootIds: [], 
                groupingRows: [] 
            };
        }

        const nodes = new Map<GridRowId, GridTreeNode>();
        const roots: GridRowId[] = [];
        const groupRows: GridRowModel[] = [];
        const pathLookup = new Map<string, GridRowId>();

        const getPathKey = (path: string[]) => path.join('/');

        rows.forEach(row => {
            const id = getRowId(row);
            const path = getTreeDataPath(row);
            const pathKey = getPathKey(path);

            pathLookup.set(pathKey, id);

            nodes.set(id, {
                id,
                parentId: null,
                depth: path.length - 1,
                groupingKey: path[path.length - 1],
                isExpanded: false,
                children: [],
                serverChildrenCount: row.serverChildrenCount
            });
        });

        rows.forEach(row => {
            const id = getRowId(row);
            const path = getTreeDataPath(row);

            if (path.length === 1) {
                roots.push(id);
                return;
            }

            const ensureAncestors = (childPath: string[]) => {
                if (childPath.length <= 1) return;

                const parentPath = childPath.slice(0, -1);
                const parentPathKey = getPathKey(parentPath);
                let parentId = pathLookup.get(parentPathKey);

                if (parentId === undefined) {
                    parentId = `auto-group-${parentPathKey}`;

                    if (!nodes.has(parentId)) {
                        const groupLabel = parentPath[parentPath.length - 1];
                        nodes.set(parentId, {
                            id: parentId,
                            parentId: null, 
                            depth: parentPath.length - 1,
                            groupingKey: groupLabel,
                            isExpanded: false,
                            children: [],
                            label: groupLabel
                        });
                        pathLookup.set(parentPathKey, parentId);

                        const groupRow = { 
                            id: parentId,
                            name: groupLabel, 
                            _isGroupRow: true
                        } as unknown as GridRowModel; 
                        groupRows.push(groupRow);

                        if (parentPath.length === 1) {
                            roots.push(parentId);
                        }

                        ensureAncestors(parentPath);
                    }
                }

                return parentId;
            };

            const parentId = ensureAncestors(path);

            if (parentId !== undefined) {
                const parentNode = nodes.get(parentId);
                const childNode = nodes.get(id);

                if (parentNode && childNode) {
                    childNode.parentId = parentId;
                    parentNode.children = parentNode.children || [];
                    if (!parentNode.children.includes(id)) {
                        parentNode.children.push(id);
                    }
                }
            }
        });

        groupRows.forEach(groupRow => {
            const groupId = groupRow.id;
            const node = nodes.get(groupId);
            if (!node) return;

            const nodePathKey = (groupId as string).replace('auto-group-', '');
            const nodePath = nodePathKey.split('/');

            if (nodePath.length > 1) {
                const parentPath = nodePath.slice(0, -1);
                const parentPathKey = getPathKey(parentPath);
                const parentId = pathLookup.get(parentPathKey);

                if (parentId && nodes.has(parentId)) {
                    node.parentId = parentId;
                    const parentNode = nodes.get(parentId);
                    if (parentNode) {
                        parentNode.children = parentNode.children || [];
                        if (!parentNode.children.includes(groupId)) {
                            parentNode.children.push(groupId);
                        }
                    }
                }
            }
        });

        return { treeNodes: nodes, rootIds: roots, groupingRows: groupRows };

    }, [rows, getTreeDataPath, treeData, getRowId]);

    const initialExpandedIds = useMemo(() => {
        if (!treeData) return new Set<GridRowId>();

        const initialExpanded = new Set<GridRowId>();
        treeNodes.forEach(node => {
            if (node.children && node.children.length > 0) {
                 if (defaultGroupingExpansionDepth === -1 || node.depth < defaultGroupingExpansionDepth) {
                     initialExpanded.add(node.id);
                 }
            }
        });
        return initialExpanded;
    }, [treeNodes, treeData, defaultGroupingExpansionDepth]);

    const [expandedGroupIds, setExpandedGroupIds] = useState<Set<GridRowId>>(new Set());

    useEffect(() => {
        if (initialExpandedIds.size > 0) {
            setExpandedGroupIds(initialExpandedIds);
        }
    }, [initialExpandedIds]);

    const toggleExpansion = useCallback((id: GridRowId) => {
        setExpandedGroupIds(prev => {
            const next = new Set(prev);
            const isExpanding = !next.has(id);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            if (isExpanding && onRowExpansionChange) {
                 const node = treeNodes.get(id);
                 if (node) {
                     onRowExpansionChange(node);
                 }
            }

            return next;
        });
    }, [treeNodes, onRowExpansionChange]);

    const getVisibleRows = useCallback(() => {

        if (!treeData) return null; 

        const rowLookup = new Map<GridRowId, GridRowModel>();
        rows.forEach(r => rowLookup.set(getRowId(r), r));
        groupingRows.forEach(r => rowLookup.set(r.id, r));

        const matchesFilter = (row: GridRowModel) => {
             return isRowMatchingFilter(row, filterModel!);
        };

        const filterCache = new Map<GridRowId, boolean>();

        const isNodeVisible = (id: GridRowId): boolean => {
            if (filterCache.has(id)) return filterCache.get(id)!;

            const row = rowLookup.get(id);
            if (!row) return false;

            const selfMatch = matchesFilter(row);
            if (selfMatch) {
                filterCache.set(id, true);
                return true;
            }

            const node = treeNodes.get(id);
            if (node && node.children) {
                const childMatch = node.children.some(childId => isNodeVisible(childId));
                if (childMatch) {
                     filterCache.set(id, true);
                     return true;
                }
            }

            filterCache.set(id, false);
            return false;
        };

        const sortNodes = (aId: GridRowId, bId: GridRowId) => {
            if (!sortModel || sortModel.length === 0) return 0;
            const rowA = rowLookup.get(aId);
            const rowB = rowLookup.get(bId);
            if (!rowA || !rowB) return 0;

            for (const sortItem of sortModel) {
                 const valA = rowA[sortItem.field];
                 const valB = rowB[sortItem.field];
                 const comp = compareValues(valA, valB, sortItem.sort);
                 if (comp !== 0) return comp;
            }
            return 0;
        };

        const result: GridRowModel[] = [];

        const seenIds = new Set<GridRowId>();

        const traverse = (ids: GridRowId[]) => {

            const visibleIds = ids.filter(id => isNodeVisible(id));

            visibleIds.sort(sortNodes);

            visibleIds.forEach(id => {
                if (seenIds.has(id)) return; 

                const row = rowLookup.get(id);
                const node = treeNodes.get(id);

                if (row && node) {
                    seenIds.add(id); 

                    const enhancedRow = {
                        ...row,
                        _treeDepth: node.depth,
                        _isExpanded: expandedGroupIds.has(id),
                        _hasChildren: (node.children && node.children.length > 0) || (node.serverChildrenCount && node.serverChildrenCount > 0),
                        _descendantCount: node.children ? node.children.length : 0
                    };
                    result.push(enhancedRow);

                    if (expandedGroupIds.has(id) && node.children && node.children.length > 0) {
                        traverse(node.children);
                    }
                }
            });
        };

        traverse(rootIds);
        return result;

    }, [treeData, rows, groupingRows, rootIds, treeNodes, expandedGroupIds, filterModel, sortModel, getRowId]);

    const isGroupExpanded = useCallback((id: GridRowId) => expandedGroupIds.has(id), [expandedGroupIds]);
    const getNode = useCallback((id: GridRowId) => treeNodes.get(id), [treeNodes]);

    const getNodePath = useCallback((id: GridRowId): string[] => {
        const path: string[] = [];
        let currentId: GridRowId | null = id;

        while (currentId !== null) {
            const node = treeNodes.get(currentId);
            if (!node) break;

            path.unshift(node.groupingKey);
            currentId = node.parentId;
        }
        return path;
    }, [treeNodes]);

    return useMemo(() => ({
        treeNodes,
        groupingRows,
        toggleExpansion,
        isGroupExpanded,
        getVisibleRows,
        getNode,
        getNodePath
    }), [treeNodes, groupingRows, toggleExpansion, isGroupExpanded, getVisibleRows, getNode, getNodePath]);
}
