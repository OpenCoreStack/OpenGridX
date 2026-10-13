import { describe, it, expect } from 'vitest';
import { LazyLeafMetaMap, LazyLeafTreeNodes, type GridLeafIndex } from './lazyLeafMaps';
import type { GridRowId, GridTreeNode } from '../../types';

describe('lazy leaf maps', () => {
    const parents = new Map<GridRowId, GridRowId | null>([[1, 'g1'], [2, 'g1'], [3, 'g2']]);
    const leafParent: GridLeafIndex = {
        get size() { return parents.size; },
        has: id => parents.has(id),
        parentOf: id => parents.get(id),
        keys: () => parents.keys(),
    };

    it('tree nodes: groups as stored, leaves made once on first read', () => {
        const nodes = new LazyLeafTreeNodes(leafParent, 1);
        const group: GridTreeNode = { id: 'g1', parentId: null, depth: 0, groupingKey: 'a', isExpanded: false, children: [1, 2] };
        nodes.set('g1', group);
        expect(nodes.get('g1')).toBe(group);
        const leaf = nodes.get(1);
        expect(leaf).toEqual({ id: 1, parentId: 'g1', depth: 1, groupingKey: '', isExpanded: false });
        expect(nodes.get(1)).toBe(leaf);
        expect(nodes.get(99)).toBeUndefined();
        expect(nodes.has(3)).toBe(true);
        expect(nodes.has(99)).toBe(false);
        expect(nodes.size).toBe(4);
        expect([...nodes.keys()]).toEqual(['g1', 1, 2, 3]);
        expect([...nodes.values()].map(n => n.id)).toEqual(['g1', 1, 2, 3]);
        const seen: GridRowId[] = [];
        nodes.forEach((_n, id) => seen.push(id));
        expect(seen).toEqual(['g1', 1, 2, 3]);
    });

    it('row metadata: one object per leaf, made on first read', () => {
        const metas = new LazyLeafMetaMap(leafParent, 2);
        const m = metas.get(3);
        expect(m).toEqual({ hasChildren: false, treeDepth: 2, isGroupRow: false });
        expect(metas.get(3)).toBe(m);
        expect(metas.get(1)).not.toBe(m);
        expect(metas.get('g1')).toBeUndefined();
        expect(metas.size).toBe(3);
        expect([...metas.keys()]).toEqual([1, 2, 3]);
    });
});
