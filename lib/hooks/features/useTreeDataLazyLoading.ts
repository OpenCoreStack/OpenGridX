import { useEffect, useRef } from 'react';
import type { GridRowId, GridTreeNode } from '../../types';

export interface UseTreeDataLazyLoadingParams {
    /** Tree data backed by a `dataSource`: children of `serverChildrenCount` nodes are fetched on demand. */
    enabled: boolean;
    treeNodes: Map<GridRowId, GridTreeNode>;
    isGroupExpanded: (id: GridRowId) => boolean;
    getNodePath: (id: GridRowId) => string[];
    fetchChildren?: (parentId: GridRowId, groupKeys: string[]) => Promise<void>;
}

type FetchState = 'pending' | { settledFor: Map<GridRowId, GridTreeNode> };

/**
 * Fetches the children of every expanded lazy node (`serverChildrenCount > 0`) that has none loaded:
 * when the user expands it, and again after a server re-fetch (a sort or filter change) replaces the
 * rows and drops the children loaded before. A node is fetched at most once per version of the tree,
 * so a server that returns no children for it is not asked again until the rows change.
 */
export function useTreeDataLazyLoading(params: UseTreeDataLazyLoadingParams): void {
    const { enabled, treeNodes, isGroupExpanded, getNodePath, fetchChildren } = params;

    const fetchStatesRef = useRef<Map<GridRowId, FetchState>>(new Map());
    const latestTreeNodesRef = useRef(treeNodes);

    useEffect(() => {
        latestTreeNodesRef.current = treeNodes;
        const fetchStates = fetchStatesRef.current;
        if (!enabled || !fetchChildren) {
            fetchStates.clear();
            return;
        }

        fetchStates.forEach((_, id) => {
            if (!treeNodes.has(id)) fetchStates.delete(id);
        });

        treeNodes.forEach((node, id) => {
            const needsChildren = (node.serverChildrenCount ?? 0) > 0
                && (node.children?.length ?? 0) === 0
                && isGroupExpanded(id);
            const state = fetchStates.get(id);
            if (!needsChildren) {
                if (state !== 'pending') fetchStates.delete(id);
                return;
            }
            if (state === 'pending') return;
            if (state && state.settledFor === treeNodes) return;

            fetchStates.set(id, 'pending');
            fetchChildren(id, getNodePath(id)).finally(() => {
                fetchStates.set(id, { settledFor: latestTreeNodesRef.current });
            });
        });
    }, [enabled, treeNodes, isGroupExpanded, getNodePath, fetchChildren]);
}
