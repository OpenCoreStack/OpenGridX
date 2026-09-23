import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTreeData } from './useTreeData';
import type { GridRowModel, GridRowId } from '../types';

type Row = GridRowModel & { id: number; path: string[]; name: string };

const ROWS: Row[] = [
    { id: 1, path: ['CEO'], name: 'Ada' },
    { id: 2, path: ['CEO', 'CTO'], name: 'Bo' },
    { id: 3, path: ['CEO', 'CTO', 'Dev'], name: 'Cy' },
    { id: 4, path: ['CEO', 'CFO'], name: 'Di' },
];

const getRowId = (r: Row) => r.id;
const getTreeDataPath = (r: Row) => r.path;

const visibleIds = (rows: GridRowModel[] | null) => (rows ?? []).map(r => r.id as GridRowId);

describe('useTreeData — expansion state', () => {
    it('expands to defaultGroupingExpansionDepth on the first render (no effect flash)', () => {
        const { result } = renderHook(() =>
            useTreeData({ rows: ROWS, getRowId, getTreeDataPath, treeData: true, defaultGroupingExpansionDepth: 1 })
        );
        expect(result.current.isGroupExpanded(1)).toBe(true);
        expect(result.current.isGroupExpanded(2)).toBe(false);
        expect(visibleIds(result.current.getVisibleRows())).toEqual([1, 2, 4]);
    });

    it('keeps a user collapse when rows are replaced with edited copies', () => {
        const { result, rerender } = renderHook(
            ({ rows }) => useTreeData({ rows, getRowId, getTreeDataPath, treeData: true, defaultGroupingExpansionDepth: -1 }),
            { initialProps: { rows: ROWS } }
        );
        act(() => { result.current.toggleExpansion(2); });
        expect(result.current.isGroupExpanded(2)).toBe(false);

        rerender({ rows: ROWS.map(r => (r.id === 4 ? { ...r, name: 'Dee' } : r)) });
        expect(result.current.isGroupExpanded(2)).toBe(false);
    });

    it('keeps a lazily expanded node open after its children arrive', () => {
        const lazyRows: Row[] = [
            { id: 1, path: ['CEO'], name: 'Ada' },
            { id: 2, path: ['CEO', 'CTO'], name: 'Bo', serverChildrenCount: 1 },
        ];
        const { result, rerender } = renderHook(
            ({ rows }) => useTreeData({ rows, getRowId, getTreeDataPath, treeData: true, defaultGroupingExpansionDepth: 1 }),
            { initialProps: { rows: lazyRows } }
        );
        act(() => { result.current.toggleExpansion(2); });
        expect(result.current.isGroupExpanded(2)).toBe(true);

        rerender({ rows: [...lazyRows, { id: 3, path: ['CEO', 'CTO', 'Dev'], name: 'Cy' }] });
        expect(result.current.isGroupExpanded(2)).toBe(true);
        expect(visibleIds(result.current.getVisibleRows())).toContain(3);
    });

    it('calls onRowExpansionChange exactly once per expand and never on collapse', () => {
        const onRowExpansionChange = vi.fn();
        const { result } = renderHook(() =>
            useTreeData({ rows: ROWS, getRowId, getTreeDataPath, treeData: true, onRowExpansionChange })
        );
        act(() => { result.current.toggleExpansion(1); });
        expect(onRowExpansionChange).toHaveBeenCalledTimes(1);
        expect(onRowExpansionChange).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));

        act(() => { result.current.toggleExpansion(1); });
        expect(onRowExpansionChange).toHaveBeenCalledTimes(1);
    });

    it('discards user overrides when defaultGroupingExpansionDepth changes', () => {
        const { result, rerender } = renderHook(
            ({ depth }) => useTreeData({ rows: ROWS, getRowId, getTreeDataPath, treeData: true, defaultGroupingExpansionDepth: depth }),
            { initialProps: { depth: -1 } }
        );
        act(() => { result.current.toggleExpansion(1); });
        expect(result.current.isGroupExpanded(1)).toBe(false);

        rerender({ depth: 1 });
        expect(result.current.isGroupExpanded(1)).toBe(true);
    });
});

type FileRow = GridRowModel & { id: GridRowId; path: string[]; title: string; status?: string };
type TreeParams = Parameters<typeof useTreeData<FileRow>>[0];
const getFilePath = (r: FileRow) => r.path;
const getFileId = (r: FileRow) => r.id;

const buildTree = (rows: FileRow[], extra: Partial<TreeParams> = {}) =>
    renderHook(() => useTreeData<FileRow>({
        rows,
        getRowId: getFileId,
        getTreeDataPath: getFilePath,
        treeData: true,
        defaultGroupingExpansionDepth: -1,
        ...extra,
    }));

describe('useTreeData — path segments', () => {
    it('keeps the subtree of an auto-created parent whose name contains a slash', () => {
        const rows: FileRow[] = [
            { id: 1, path: ['Docs'], title: 'Docs' },
            { id: 2, path: ['Docs', 'a/b', 'file.txt'], title: 'file.txt' },
        ];
        const { result } = buildTree(rows);
        const visible = result.current.getVisibleRows() ?? [];
        expect(visible).toHaveLength(3);
        expect(visible[0].id).toBe(1);
        expect(visible[2].id).toBe(2);
        const autoId = visible[1].id;
        expect(result.current.rowMetaMap.get(autoId)).toMatchObject({ isGroupRow: true, groupLabel: 'a/b', treeDepth: 1 });
        expect(result.current.getNode(autoId)?.parentId).toBe(1);
    });

    it('does not merge the path ["a/b"] with ["a", "b"]', () => {
        const rows: FileRow[] = [
            { id: 1, path: ['a'], title: 'a' },
            { id: 2, path: ['a', 'b'], title: 'b' },
            { id: 3, path: ['a/b'], title: 'a/b' },
            { id: 4, path: ['a', 'b', 'c'], title: 'c' },
        ];
        const { result } = buildTree(rows);
        expect(result.current.getNode(4)?.parentId).toBe(2);
        expect(result.current.getNode(3)?.children).toEqual([]);
        expect(visibleIds(result.current.getVisibleRows())).toEqual([1, 2, 4, 3]);
    });

    it('links nested auto-created parents to each other', () => {
        const rows: FileRow[] = [{ id: 1, path: ['Root', 'Sub', 'leaf.txt'], title: 'leaf.txt' }];
        const { result } = buildTree(rows);
        const visible = result.current.getVisibleRows() ?? [];
        expect(visible.map(r => result.current.rowMetaMap.get(r.id)?.groupLabel ?? r.title)).toEqual(['Root', 'Sub', 'leaf.txt']);
    });
});

describe('useTreeData — auto-created parents', () => {
    it('gives an auto-created parent its label in rowMeta and injects no data fields', () => {
        const rows: FileRow[] = [{ id: 1, path: ['Folder', 'file.txt'], title: 'file.txt' }];
        const { result } = buildTree(rows);
        const auto = result.current.groupingRows[0];
        expect(Object.keys(auto)).toEqual(['id']);
        expect(result.current.rowMetaMap.get(auto.id)).toMatchObject({ isGroupRow: true, groupLabel: 'Folder', hasChildren: true, descendantCount: 1 });
    });

    it('sorts auto-created parents by their label when sorting by the label column', () => {
        const rows: FileRow[] = [
            { id: 1, path: ['Bravo', 'b.txt'], title: 'b.txt' },
            { id: 2, path: ['Alpha', 'a.txt'], title: 'a.txt' },
        ];
        const { result } = buildTree(rows, { sortModel: [{ field: 'title', sort: 'asc' }] });
        const labels = (result.current.getVisibleRows({ labelField: 'title' }) ?? [])
            .map(r => result.current.rowMetaMap.get(r.id)?.groupLabel ?? r.title);
        expect(labels).toEqual(['Alpha', 'a.txt', 'Bravo', 'b.txt']);
    });

    it('never matches a filter by itself: it is shown only for matching rows under it', () => {
        const rows: FileRow[] = [
            { id: 1, path: ['Folder', 'a.txt'], title: 'a.txt', status: 'done' },
            { id: 2, path: ['Folder', 'b.txt'], title: 'b.txt', status: 'done' },
        ];
        const isEmpty = buildTree(rows, { filterModel: { items: [{ field: 'status', operator: 'isEmpty' }] } });
        expect(isEmpty.result.current.getVisibleRows()).toEqual([]);
        const quick = buildTree(rows, { filterModel: { items: [], quickFilterValues: ['group'] } });
        expect(quick.result.current.getVisibleRows()).toEqual([]);
        const match = buildTree(rows, { filterModel: { items: [{ field: 'title', operator: 'equals', value: 'b.txt' }] } });
        expect((match.result.current.getVisibleRows() ?? []).map(r => r.title ?? 'auto')).toEqual(['auto', 'b.txt']);
    });
});

describe('useTreeData — descendantCount and hasChildren', () => {
    it('counts descendants at every depth', () => {
        const rows: FileRow[] = [
            { id: 1, path: ['A'], title: 'A' },
            { id: 2, path: ['A', 'B'], title: 'B' },
            { id: 3, path: ['A', 'B', 'C'], title: 'C' },
        ];
        const { result } = buildTree(rows);
        expect(result.current.rowMetaMap.get(1)?.descendantCount).toBe(2);
        expect(result.current.rowMetaMap.get(2)?.descendantCount).toBe(1);
        expect(result.current.rowMetaMap.get(3)?.descendantCount).toBe(0);
    });

    it('does not count auto-created parents as descendants', () => {
        const rows: FileRow[] = [
            { id: 1, path: ['G', 'B'], title: 'B' },
            { id: 2, path: ['G', 'B', 'C'], title: 'C' },
            { id: 3, path: ['G', 'X', 'Y'], title: 'Y' },
        ];
        const { result } = buildTree(rows);
        const g = result.current.groupingRows.find(r => result.current.rowMetaMap.get(r.id)?.groupLabel === 'G');
        expect(g).toBeDefined();
        expect(result.current.rowMetaMap.get(g!.id)?.descendantCount).toBe(3);
    });

    it('drops the toggle of a parent whose children are all filtered out', () => {
        const rows: FileRow[] = [
            { id: 1, path: ['Eng'], title: 'Eng' },
            { id: 2, path: ['Eng', 'alice'], title: 'alice' },
        ];
        const { result } = buildTree(rows, { filterModel: { items: [{ field: 'title', operator: 'contains', value: 'Eng' }] } });
        expect(visibleIds(result.current.getVisibleRows())).toEqual([1]);
        expect(result.current.rowMetaMap.get(1)).toMatchObject({ hasChildren: false, descendantCount: 0 });
    });

    it('keeps the toggle of a lazy node whose children are not loaded yet', () => {
        const rows: FileRow[] = [{ id: 1, path: ['Root'], title: 'Root', serverChildrenCount: 3 }];
        const { result } = buildTree(rows);
        expect(result.current.rowMetaMap.get(1)).toMatchObject({ hasChildren: true, descendantCount: undefined });
    });
});

describe('useTreeData — invalid paths', () => {
    it('shows a row with an empty path as a top-level row and warns', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const rows: FileRow[] = [{ id: 1, path: [], title: 'orphan' }, { id: 2, path: ['x'], title: 'x' }];
        const { result } = buildTree(rows);
        expect(visibleIds(result.current.getVisibleRows())).toEqual([1, 2]);
        expect(warn.mock.calls.some(c => String(c[0]).includes('empty path'))).toBe(true);
        warn.mockRestore();
    });

    it('attaches the children of a duplicated path to the first row with it and warns', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const rows: FileRow[] = [
            { id: 1, path: ['A'], title: 'A-first' },
            { id: 2, path: ['A', 'c'], title: 'child' },
            { id: 3, path: ['A'], title: 'A-second' },
        ];
        const { result } = buildTree(rows);
        expect(result.current.getNode(2)?.parentId).toBe(1);
        expect(visibleIds(result.current.getVisibleRows())).toEqual([1, 2, 3]);
        expect(warn.mock.calls.some(c => String(c[0]).includes('same path'))).toBe(true);
        warn.mockRestore();
    });

    it('warns and builds nothing when treeData has no getTreeDataPath', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const { result } = renderHook(() => useTreeData<FileRow>({ rows: [{ id: 1, path: ['x'], title: 'x' }], getRowId: getFileId, treeData: true }));
        expect(result.current.getVisibleRows()).toBeNull();
        expect(warn.mock.calls.some(c => String(c[0]).includes('without getTreeDataPath'))).toBe(true);
        warn.mockRestore();
    });
});

describe('useTreeData — server filtering and sorting', () => {
    const rows: FileRow[] = [
        { id: 1, path: ['Zeta'], title: 'Zeta' },
        { id: 2, path: ['Alpha'], title: 'Alpha' },
    ];

    it("does not filter again on the client with filterMode 'server'", () => {
        const { result } = buildTree(rows, { filterMode: 'server', filterModel: { items: [], quickFilterValues: ['finance'] } });
        expect(visibleIds(result.current.getVisibleRows())).toEqual([1, 2]);
    });

    it("keeps the server's order with sortingMode 'server'", () => {
        const { result } = buildTree(rows, { sortingMode: 'server', sortModel: [{ field: 'title', sort: 'asc' }] });
        expect(visibleIds(result.current.getVisibleRows())).toEqual([1, 2]);
    });

    it('still filters and sorts on the client by default', () => {
        const sorted = buildTree(rows, { sortModel: [{ field: 'title', sort: 'asc' }] });
        expect(visibleIds(sorted.result.current.getVisibleRows())).toEqual([2, 1]);
        const filtered = buildTree(rows, { filterModel: { items: [], quickFilterValues: ['zet'] } });
        expect(visibleIds(filtered.result.current.getVisibleRows())).toEqual([1]);
    });
});

describe('useTreeData — build cost', () => {
    it('builds one parent with 100k children in linear time', () => {
        const rows: FileRow[] = [{ id: 'root', path: ['root'], title: 'root' }];
        for (let i = 1; i <= 100_000; i++) rows.push({ id: `row-${i}`, path: ['root', `f${i}`], title: `f${i}` });
        const t0 = performance.now();
        const { result } = renderHook(() => useTreeData<FileRow>({ rows, getRowId: getFileId, getTreeDataPath: getFilePath, treeData: true }));
        const elapsed = performance.now() - t0;
        expect(result.current.getNode('root')?.children).toHaveLength(100_000);
        // The quadratic build took ~14 s for this shape; the linear one takes well under a second.
        expect(elapsed).toBeLessThan(3000);
    }, 60_000);
});
