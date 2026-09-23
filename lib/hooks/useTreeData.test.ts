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
