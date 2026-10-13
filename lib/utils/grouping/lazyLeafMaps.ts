import type { GridRowId, GridRowMeta, GridTreeNode } from '../../types';

/** The leaf rows of a grouping: which ids are leaves and the group each belongs to. */
export interface GridLeafIndex {
    readonly size: number;
    has(id: GridRowId): boolean;
    /** The leaf's group id (`null` at the root), or undefined when `id` is not a leaf. */
    parentOf(id: GridRowId): GridRowId | null | undefined;
    keys(): MapIterator<GridRowId>;
}

// Row grouping at 1M rows spent ~300 ms creating one tree node and one row-metadata object per leaf
// row, although only the rendered rows (a few dozen) ever read them. These maps hold real objects
// for the group rows and create a leaf's object the first time it is read, then keep it (so each
// row still has exactly one object, which `params.rowMeta` relies on). Iterating them creates every
// leaf object; nothing in the grid iterates them.

/**
 * `treeNodes` of row grouping: group nodes stored as given, leaf nodes made on first `get` from the
 * leaf index and the (shared) leaf depth.
 */
export class LazyLeafTreeNodes extends Map<GridRowId, GridTreeNode> {
    private readonly leafIndex: GridLeafIndex;
    private readonly leafDepth: number;
    private readonly leaves = new Map<GridRowId, GridTreeNode>();

    constructor(leafIndex: GridLeafIndex, leafDepth: number) {
        super();
        this.leafIndex = leafIndex;
        this.leafDepth = leafDepth;
    }

    override get(id: GridRowId): GridTreeNode | undefined {
        const group = super.get(id);
        if (group !== undefined) return group;
        let leaf = this.leaves.get(id);
        if (leaf === undefined && this.leafIndex.has(id)) {
            leaf = { id, parentId: this.leafIndex.parentOf(id) ?? null, depth: this.leafDepth, groupingKey: '', isExpanded: false };
            this.leaves.set(id, leaf);
        }
        return leaf;
    }

    override has(id: GridRowId): boolean {
        return super.has(id) || this.leafIndex.has(id);
    }

    override get size(): number {
        return super.size + this.leafIndex.size;
    }

    override forEach(callback: (value: GridTreeNode, key: GridRowId, map: Map<GridRowId, GridTreeNode>) => void, thisArg?: unknown): void {
        for (const [id, node] of this.entries()) callback.call(thisArg, node, id, this);
    }

    override *entries(): MapIterator<[GridRowId, GridTreeNode]> {
        yield* super.entries();
        for (const id of this.leafIndex.keys()) yield [id, this.get(id) as GridTreeNode];
    }

    override *keys(): MapIterator<GridRowId> {
        yield* super.keys();
        yield* this.leafIndex.keys();
    }

    override *values(): MapIterator<GridTreeNode> {
        for (const [, node] of this.entries()) yield node;
    }

    override [Symbol.iterator](): MapIterator<[GridRowId, GridTreeNode]> {
        return this.entries();
    }
}

/** The leaf rows' `GridRowMeta`, made on first read: one object per row, kept once made. */
export class LazyLeafMetaMap implements ReadonlyMap<GridRowId, GridRowMeta> {
    private readonly leafIndex: GridLeafIndex;
    private readonly leafDepth: number;
    private readonly made = new Map<GridRowId, GridRowMeta>();

    constructor(leafIndex: GridLeafIndex, leafDepth: number) {
        this.leafIndex = leafIndex;
        this.leafDepth = leafDepth;
    }

    get(id: GridRowId): GridRowMeta | undefined {
        let meta = this.made.get(id);
        if (meta === undefined && this.leafIndex.has(id)) {
            // One object per row (not shared per depth): `params.rowMeta` is public, and a consumer that
            // writes to it must not change other rows.
            meta = { hasChildren: false, treeDepth: this.leafDepth, isGroupRow: false };
            this.made.set(id, meta);
        }
        return meta;
    }

    has(id: GridRowId): boolean {
        return this.leafIndex.has(id);
    }

    get size(): number {
        return this.leafIndex.size;
    }

    forEach(callback: (value: GridRowMeta, key: GridRowId, map: ReadonlyMap<GridRowId, GridRowMeta>) => void, thisArg?: unknown): void {
        for (const id of this.leafIndex.keys()) callback.call(thisArg, this.get(id) as GridRowMeta, id, this);
    }

    *entries(): MapIterator<[GridRowId, GridRowMeta]> {
        for (const id of this.leafIndex.keys()) yield [id, this.get(id) as GridRowMeta];
    }

    keys(): MapIterator<GridRowId> {
        return this.leafIndex.keys();
    }

    *values(): MapIterator<GridRowMeta> {
        for (const id of this.leafIndex.keys()) yield this.get(id) as GridRowMeta;
    }

    [Symbol.iterator](): MapIterator<[GridRowId, GridRowMeta]> {
        return this.entries();
    }
}
