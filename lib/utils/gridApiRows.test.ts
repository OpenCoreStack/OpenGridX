import { describe, it, expect } from 'vitest';
import { collectAllFilteredRows } from './gridApiRows';
import type { GridRowId, GridRowMeta, GridRowModel } from '../types';

const row = (id: number): GridRowModel => ({ id });
const getRowId = (r: GridRowModel): GridRowId => r.id as GridRowId;

describe('collectAllFilteredRows', () => {
    it('returns pinned top, every unpinned row, then pinned bottom when the rows are flat', () => {
        expect(collectAllFilteredRows({
            hierarchyHandlers: null,
            pinnedTopRows: [row(1)],
            sortedUnpinnedRows: [row(2), row(3)],
            pinnedBottomRows: [row(4)],
            rowMetaMap: new Map(),
            getRowId,
        }).map(getRowId)).toEqual([1, 2, 3, 4]);
    });

    it('expands the hierarchy and leaves synthetic group rows out', () => {
        const leaves = [row(1), row(2)];
        const rowMetaMap = new Map<GridRowId, GridRowMeta>([[-1, { isGroupRow: true }]]);
        const calls: Array<{ expandAll?: boolean } | undefined> = [];
        const result = collectAllFilteredRows({
            hierarchyHandlers: {
                getVisibleRows: (options) => { calls.push(options); return [row(-1), ...leaves]; },
            },
            pinnedTopRows: [row(9)],
            sortedUnpinnedRows: [],
            pinnedBottomRows: [],
            rowMetaMap,
            getRowId,
        });
        expect(calls).toEqual([{ expandAll: true }]);
        expect(result).toEqual(leaves);
    });

    it('falls back to the flat rows when the hierarchy has no rows to give', () => {
        expect(collectAllFilteredRows({
            hierarchyHandlers: { getVisibleRows: () => null },
            pinnedTopRows: [],
            sortedUnpinnedRows: [row(5)],
            pinnedBottomRows: [],
            rowMetaMap: new Map(),
            getRowId,
        }).map(getRowId)).toEqual([5]);
    });
});
