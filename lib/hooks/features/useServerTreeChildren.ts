import { useEffect, useLayoutEffect, useRef } from 'react';
import type { GridRowId, GridTreeNode } from '../../types';

export interface UseServerTreeChildrenParams {
    /** Tree data with a dataSource: children of lazy nodes come from getRows. */
    enabled: boolean;
    treeNodes: Map<GridRowId, GridTreeNode>;
    isGroupExpanded: (id: GridRowId) => boolean;
    getNodePath: (id: GridRowId) => string[];
    toggleExpansion: (id: GridRowId) => void;
    /** Deduplicates: a path already loading or loaded for the current rows is not requested again. */
    fetchChildren: (parentId: GridRowId, groupKeys: string[], onError?: (error: unknown) => void) => Promise<void>;
}

/** A node the server says has children, none of which are loaded. */
function needsChildren(node: GridTreeNode): boolean {
    return (node.serverChildrenCount ?? 0) > 0 && (node.children?.length ?? 0) === 0;
}

/**
 * Server-side tree data: every expanded node whose children are not loaded gets them from the
 * dataSource. That covers the user expanding a node and a refetch (sort, filter, page) replacing
 * the rows while nodes stay expanded. A node whose children fail to load is collapsed again, so
 * expanding it retries.
 */
export function useServerTreeChildren({
    enabled,
    treeNodes,
    isGroupExpanded,
    getNodePath,
    toggleExpansion,
    fetchChildren,
}: UseServerTreeChildrenParams): void {
    // The failure callback runs after the request, so it reads the expansion state of that moment.
    const expansionRef = useRef({ isGroupExpanded, toggleExpansion });
    useLayoutEffect(() => {
        expansionRef.current = { isGroupExpanded, toggleExpansion };
    });

    useEffect(() => {
        if (!enabled) return;
        treeNodes.forEach((node, id) => {
            if (!needsChildren(node) || !isGroupExpanded(id)) return;
            void fetchChildren(id, getNodePath(id), () => {
                const { isGroupExpanded: isExpanded, toggleExpansion: toggle } = expansionRef.current;
                if (isExpanded(id)) toggle(id);
            });
        });
    }, [enabled, treeNodes, isGroupExpanded, getNodePath, fetchChildren]);
}
