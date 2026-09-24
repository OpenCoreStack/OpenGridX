import { useMemo, useState, useCallback, useEffect } from 'react';
import type { GridRowModel, GridRowId, GridTreeNode, GridFilterModel, GridSortItem, GridRowMeta } from '../types';
import { createRowFilter } from '../utils/filtering';
import { sortItemsBySortModel, type GridSortValue } from '../utils/sorting';
import { getCellValue } from '../utils/values';
import type { GridColumnLookup } from '../utils/columnLookup';
import type { GridHierarchyVisibleRowsOptions } from './useRowGrouping';

const EMPTY_OVERRIDES: Map<GridRowId, boolean> = new Map();

interface ExpansionOverrides {
    configKey: string;
    overrides: Map<GridRowId, boolean>;
}

interface UseTreeDataProps<R extends GridRowModel> {
    rows: R[];
    getRowId: (row: R) => GridRowId;
    /**
     * Returns the hierarchy path of a row. Keep it stable (module scope or useCallback): a new
     * function identity rebuilds the whole tree, because the grid cannot tell whether it returns
     * the same paths without calling it for every row.
     */
    getTreeDataPath?: (row: R) => string[];
    treeData?: boolean;
    defaultGroupingExpansionDepth?: number;
    filterModel?: GridFilterModel;
    sortModel?: GridSortItem[];
    onRowExpansionChange?: (node: GridTreeNode) => void;
    /** Column definitions, so filter and sort read cells through valueGetter and use the column type. */
    columnLookup?: GridColumnLookup;
    /** 'server': the rows arrive filtered, so the tree is not filtered again on the client. */
    filterMode?: 'client' | 'server';
    /** 'server': the rows arrive sorted, so siblings keep the order the server sent them in. */
    sortingMode?: 'client' | 'server';
}

/**
 * The lookup key of a tree path. JSON keeps segments apart, so a segment containing '/' (a file
 * name, a URL) never collides with a deeper path: ['a/b'] and ['a', 'b'] are different nodes.
 */
const pathKeyOf = (path: readonly string[]): string => JSON.stringify(path);

/** The id of the parent row the grid creates for a path segment that has no row of its own. */
const autoParentIdOf = (pathKey: string): string => `auto-group-${pathKey}`;

const MAX_IDS_IN_WARNING = 5;
const formatIds = (ids: readonly GridRowId[]): string =>
    ids.slice(0, MAX_IDS_IN_WARNING).map(id => JSON.stringify(id)).join(', ') + (ids.length > MAX_IDS_IN_WARNING ? ', …' : '');

interface TreeBuild {
    treeNodes: Map<GridRowId, GridTreeNode>;
    rootIds: GridRowId[];
    /** The rows created for path segments that have no row of their own (`{ id }` only). */
    groupingRows: GridRowModel[];
    syntheticIds: Set<GridRowId>;
    /** Every row in the tree (consumer rows and auto-created parents), by id. */
    rowLookup: Map<GridRowId, GridRowModel>;
    /** Development warnings about the paths (empty paths, duplicate paths). */
    issues: string[];
}

const EMPTY_BUILD: TreeBuild = {
    treeNodes: new Map(),
    rootIds: [],
    groupingRows: [],
    syntheticIds: new Set(),
    rowLookup: new Map(),
    issues: [],
};

/**
 * Builds the tree in one linear pass over the rows (each child is attached exactly once, so no
 * membership scans). Rows keep their order among siblings; an auto-created parent takes the position
 * of the first row under it.
 */
function buildTree<R extends GridRowModel>(
    rows: readonly R[],
    getRowId: (row: R) => GridRowId,
    getTreeDataPath: (row: R) => string[],
): TreeBuild {
    const treeNodes = new Map<GridRowId, GridTreeNode>();
    const rootIds: GridRowId[] = [];
    const groupingRows: GridRowModel[] = [];
    const syntheticIds = new Set<GridRowId>();
    const rowLookup = new Map<GridRowId, GridRowModel>();
    const pathLookup = new Map<string, GridRowId>();
    const issues: string[] = [];

    const ids: GridRowId[] = new Array(rows.length);
    const paths: string[][] = new Array(rows.length);
    const emptyPathIds: GridRowId[] = [];
    const duplicatePaths = new Map<string, GridRowId[]>();

    // Pass 1: register every row and its path, so a parent row listed after its children is found.
    rows.forEach((row, index) => {
        const id = getRowId(row);
        const rawPath: unknown = getTreeDataPath(row);
        const path = Array.isArray(rawPath) ? rawPath.map(segment => String(segment)) : [];
        ids[index] = id;
        paths[index] = path;
        rowLookup.set(id, row);

        if (path.length === 0) {
            emptyPathIds.push(id);
        } else {
            const key = pathKeyOf(path);
            const owner = pathLookup.get(key);
            if (owner === undefined) {
                pathLookup.set(key, id);
            } else {
                // Children attach to the first row with this path; the others render as childless siblings.
                const clash = duplicatePaths.get(key) ?? [owner];
                clash.push(id);
                duplicatePaths.set(key, clash);
            }
        }

        treeNodes.set(id, {
            id,
            parentId: null,
            depth: Math.max(path.length - 1, 0),
            groupingKey: path[path.length - 1] ?? '',
            isExpanded: false,
            children: [],
            serverChildrenCount: row.serverChildrenCount,
        });
    });

    // The node for a path (length >= 1), creating auto parents for segments that have no row.
    const ensureNode = (path: string[]): GridRowId => {
        const key = pathKeyOf(path);
        const existing = pathLookup.get(key);
        if (existing !== undefined) return existing;

        const id = autoParentIdOf(key);
        const label = path[path.length - 1];
        const node: GridTreeNode = {
            id,
            parentId: null,
            depth: path.length - 1,
            groupingKey: label,
            isExpanded: false,
            children: [],
            label,
        };
        treeNodes.set(id, node);
        pathLookup.set(key, id);
        syntheticIds.add(id);
        const groupRow: GridRowModel = { id };
        groupingRows.push(groupRow);
        rowLookup.set(id, groupRow);

        if (path.length === 1) {
            rootIds.push(id);
        } else {
            const parentId = ensureNode(path.slice(0, -1));
            node.parentId = parentId;
            treeNodes.get(parentId)?.children?.push(id);
        }
        return id;
    };

    // Pass 2: link every row to its parent, in row order.
    rows.forEach((_, index) => {
        const id = ids[index];
        const path = paths[index];
        if (path.length <= 1) {
            rootIds.push(id);
            return;
        }
        const parentId = ensureNode(path.slice(0, -1));
        const node = treeNodes.get(id);
        if (node) node.parentId = parentId;
        treeNodes.get(parentId)?.children?.push(id);
    });

    if (emptyPathIds.length > 0) {
        issues.push(`[OpenGridX] treeData: getTreeDataPath returned an empty path for row(s) ${formatIds(emptyPathIds)}. They are shown as top-level rows.`);
    }
    duplicatePaths.forEach((clash, key) => {
        issues.push(`[OpenGridX] treeData: rows ${formatIds(clash)} have the same path ${key}. Rows under that path are attached to row ${JSON.stringify(clash[0])}.`);
    });

    return { treeNodes, rootIds, groupingRows, syntheticIds, rowLookup, issues };
}

interface TreeVisibility {
    /** Nodes shown under the filter: rows that match, and the ancestors of rows that match. */
    visible: Set<GridRowId>;
    /** Each node's children that are visible. */
    visibleChildren: Map<GridRowId, GridRowId[]>;
    /** Visible consumer rows below each node, at any depth (auto-created parents are not counted). */
    descendantCounts: Map<GridRowId, number>;
}

function computeVisibility(build: TreeBuild, rowFilter: ((row: GridRowModel) => boolean) | null): TreeVisibility {
    const { treeNodes, rootIds, syntheticIds, rowLookup } = build;
    const visible = new Set<GridRowId>();
    const visibleChildren = new Map<GridRowId, GridRowId[]>();
    const descendantCounts = new Map<GridRowId, number>();

    const visit = (id: GridRowId): boolean => {
        const node = treeNodes.get(id);
        if (!node) return false;
        const shownChildren: GridRowId[] = [];
        let count = 0;
        for (const childId of node.children ?? []) {
            if (visit(childId)) {
                shownChildren.push(childId);
                count += (syntheticIds.has(childId) ? 0 : 1) + (descendantCounts.get(childId) ?? 0);
            }
        }
        visibleChildren.set(id, shownChildren);
        descendantCounts.set(id, count);

        // An auto-created parent has no data of its own: it is shown only for the rows under it.
        const row = rowLookup.get(id);
        const selfMatch = !syntheticIds.has(id) && row !== undefined && (rowFilter ? rowFilter(row) : true);
        const isVisible = selfMatch || shownChildren.length > 0;
        if (isVisible) visible.add(id);
        return isVisible;
    };

    rootIds.forEach(visit);
    return { visible, visibleChildren, descendantCounts };
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
        onRowExpansionChange,
        columnLookup,
        filterMode = 'client',
        sortingMode = 'client',
    } = props;

    const isActive = treeData && Boolean(getTreeDataPath);

    const build = useMemo<TreeBuild>(() => {
        if (!treeData || !getTreeDataPath) return EMPTY_BUILD;
        return buildTree(rows, getRowId, getTreeDataPath);
    }, [rows, getTreeDataPath, treeData, getRowId]);

    const { treeNodes, rootIds, groupingRows, syntheticIds, rowLookup } = build;

    // Development warnings, logged once per distinct problem rather than on every render.
    const issuesKey = build.issues.join('\n');
    useEffect(() => {
        if (process.env.NODE_ENV === 'production' || !issuesKey) return;
        issuesKey.split('\n').forEach(message => console.warn(message));
    }, [issuesKey]);

    const isMissingPathGetter = treeData && !getTreeDataPath;
    useEffect(() => {
        if (process.env.NODE_ENV === 'production' || !isMissingPathGetter) return;
        console.warn('[OpenGridX] treeData is set without getTreeDataPath, so the rows are shown as a flat list. Pass getTreeDataPath={(row) => row.path} to build the tree.');
    }, [isMissingPathGetter]);

    const rowFilter = useMemo(
        () => (filterMode === 'server' ? null : createRowFilter(filterModel, columnLookup)),
        [filterMode, filterModel, columnLookup]
    );

    const visibility = useMemo(() => computeVisibility(build, rowFilter), [build, rowFilter]);

    // Same model as useRowGrouping: depth-based default plus user overrides keyed by config.
    // Rebuilding the tree (row edits, lazily loaded children) keeps the user's choices.
    const configKey = `${treeData}|${defaultGroupingExpansionDepth}`;
    const [expansionState, setExpansionState] = useState<ExpansionOverrides>(() => ({
        configKey,
        overrides: new Map(),
    }));
    const overrides = expansionState.configKey === configKey ? expansionState.overrides : EMPTY_OVERRIDES;

    // A lazy server node (serverChildrenCount > 0, children not loaded yet) is expandable too, so
    // the default depth expands it and useServerTreeChildren loads its children.
    const isDefaultExpanded = useCallback((node: GridTreeNode | undefined) => (
        ((node?.children?.length ?? 0) > 0 || (node?.serverChildrenCount ?? 0) > 0) &&
        (defaultGroupingExpansionDepth === -1 || (node?.depth ?? 0) < defaultGroupingExpansionDepth)
    ), [defaultGroupingExpansionDepth]);

    const expandedGroupIds = useMemo<Set<GridRowId>>(() => {
        const ids = new Set<GridRowId>();
        if (!isActive) return ids;
        treeNodes.forEach((node, id) => {
            // A lazily loaded node can be expanded before it has any children, so an
            // explicit override counts even when children is still empty.
            if (overrides.get(id) ?? isDefaultExpanded(node)) ids.add(id);
        });
        return ids;
    }, [isActive, treeNodes, overrides, isDefaultExpanded]);

    const toggleExpansion = useCallback((id: GridRowId) => {
        const isExpanding = !expandedGroupIds.has(id);
        setExpansionState(prev => {
            const base = prev.configKey === configKey ? prev.overrides : EMPTY_OVERRIDES;
            const next = new Map(base);
            next.set(id, isExpanding);
            return { configKey, overrides: next };
        });
        // Called outside the state updater: updaters may run twice, and this can trigger a server fetch.
        if (isExpanding && onRowExpansionChange) {
            const node = treeNodes.get(id);
            if (node) onRowExpansionChange(node);
        }
    }, [expandedGroupIds, configKey, treeNodes, onRowExpansionChange]);

    const isClientSort = sortingMode !== 'server' && Boolean(sortModel && sortModel.length > 0);

    /**
     * The rows to render, in order. `labelField` is the column that shows the hierarchy (toggle,
     * indent and the labels of auto-created parents): sorting by it orders auto-created parents by
     * their label, since they have no cell values of their own.
     */
    const getVisibleRows = useCallback((options?: GridHierarchyVisibleRowsOptions): GridRowModel[] | null => {
        if (!isActive) return null;
        const labelField = options?.labelField;
        const expandAll = options?.expandAll ?? false;

        const { visible, visibleChildren } = visibility;
        const activeSortModel = isClientSort && sortModel ? sortModel : [];

        const readSortValue = (id: GridRowId, sortItem: GridSortItem): GridSortValue => {
            if (syntheticIds.has(id)) {
                return { value: sortItem.field === labelField ? treeNodes.get(id)?.label : undefined };
            }
            const row = rowLookup.get(id);
            const colDef = columnLookup?.byField.get(sortItem.field);
            return { value: row ? getCellValue(row, sortItem.field, colDef) : undefined, type: colDef?.type };
        };

        const result: GridRowModel[] = [];
        const seenIds = new Set<GridRowId>();

        const traverse = (ids: readonly GridRowId[]) => {
            const shown = ids.filter(id => visible.has(id));
            const ordered = activeSortModel.length > 0 ? sortItemsBySortModel(shown, activeSortModel, readSortValue) : shown;
            for (const id of ordered) {
                if (seenIds.has(id)) continue;
                const row = rowLookup.get(id);
                if (!row) continue;
                seenIds.add(id);
                // Hierarchy info travels in rowMetaMap; the consumer's row object is passed through unchanged.
                result.push(row);
                const children = visibleChildren.get(id);
                if (children && children.length > 0 && (expandAll || expandedGroupIds.has(id))) {
                    traverse(children);
                }
            }
        };

        traverse(rootIds);
        return result;
    }, [isActive, visibility, isClientSort, sortModel, syntheticIds, treeNodes, rowLookup, columnLookup, rootIds, expandedGroupIds]);

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

    const rowMetaMap = useMemo<Map<GridRowId, GridRowMeta>>(() => {
        const map = new Map<GridRowId, GridRowMeta>();
        const { visibleChildren, descendantCounts } = visibility;
        treeNodes.forEach((node, id) => {
            // A lazy node whose children are not loaded yet still has children on the server.
            const isUnloadedLazyNode = (node.children?.length ?? 0) === 0 && (node.serverChildrenCount ?? 0) > 0;
            const isSynthetic = syntheticIds.has(id);
            const meta: GridRowMeta = {
                // Based on the children the filter leaves visible, so no toggle expands to nothing.
                hasChildren: (visibleChildren.get(id)?.length ?? 0) > 0 || isUnloadedLazyNode,
                treeDepth: node.depth,
                descendantCount: isUnloadedLazyNode ? undefined : (descendantCounts.get(id) ?? 0),
                isGroupRow: isSynthetic,
                isExpanded: expandedGroupIds.has(id),
            };
            if (isSynthetic) meta.groupLabel = node.label;
            map.set(id, meta);
        });
        return map;
    }, [treeNodes, syntheticIds, visibility, expandedGroupIds]);

    return useMemo(() => ({
        treeNodes,
        groupingRows,
        toggleExpansion,
        isGroupExpanded,
        getVisibleRows,
        getNode,
        getNodePath,
        rowMetaMap,
    }), [treeNodes, groupingRows, toggleExpansion, isGroupExpanded, getVisibleRows, getNode, getNodePath, rowMetaMap]);
}
