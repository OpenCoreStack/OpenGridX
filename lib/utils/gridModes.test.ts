import { describe, it, expect } from 'vitest';
import { resolveGridModes, EMPTY_ROW_GROUPING_MODEL, type ResolveGridModesParams } from './gridModes';

const base: ResolveGridModesParams = {
    rowGroupingModel: EMPTY_ROW_GROUPING_MODEL,
    treeData: false,
    hasTreeDataPath: false,
    isPivotActive: false,
    rowReordering: false,
    hasGroupingColDef: false,
    pagination: false,
    paginationMode: 'client',
    listView: false,
    hasListViewColumn: false,
};

describe('resolveGridModes', () => {
    it('turns nothing on by default', () => {
        expect(resolveGridModes(base)).toEqual({
            rowReordering: false,
            hierarchyRowGroupingModel: EMPTY_ROW_GROUPING_MODEL,
            isTreeDataRequested: false,
            isTreeData: false,
            isRowGrouping: false,
            isHierarchyEnabled: false,
            hasGroupingColumn: false,
            pagination: false,
            listView: false,
        });
    });

    it('builds tree data only when getTreeDataPath is present', () => {
        const withoutPath = resolveGridModes({ ...base, treeData: true });
        expect(withoutPath.isTreeDataRequested).toBe(true);
        expect(withoutPath.isTreeData).toBe(false);
        expect(withoutPath.isHierarchyEnabled).toBe(false);

        const withPath = resolveGridModes({ ...base, treeData: true, hasTreeDataPath: true });
        expect(withPath.isTreeData).toBe(true);
        expect(withPath.isHierarchyEnabled).toBe(true);
    });

    it('passes the grouping model through by reference and turns pagination off while grouping', () => {
        const model = ['country'];
        const modes = resolveGridModes({ ...base, rowGroupingModel: model, pagination: true });
        expect(modes.hierarchyRowGroupingModel).toBe(model);
        expect(modes.isRowGrouping).toBe(true);
        expect(modes.isHierarchyEnabled).toBe(true);
        expect(modes.pagination).toBe(false);
    });

    it('lets the pivot override row reordering, tree data and row grouping', () => {
        const modes = resolveGridModes({
            ...base,
            isPivotActive: true,
            rowReordering: true,
            treeData: true,
            hasTreeDataPath: true,
            rowGroupingModel: ['country'],
            hasGroupingColDef: true,
        });
        expect(modes.rowReordering).toBe(false);
        expect(modes.hierarchyRowGroupingModel).toBe(EMPTY_ROW_GROUPING_MODEL);
        expect(modes.isTreeDataRequested).toBe(false);
        expect(modes.isTreeData).toBe(false);
        expect(modes.isRowGrouping).toBe(false);
        expect(modes.hasGroupingColumn).toBe(false);
    });

    it('shows the grouping column only with groupingColDef and an active hierarchy', () => {
        expect(resolveGridModes({ ...base, hasGroupingColDef: true }).hasGroupingColumn).toBe(false);
        expect(resolveGridModes({ ...base, hasGroupingColDef: true, rowGroupingModel: ['a'] }).hasGroupingColumn).toBe(true);
        expect(resolveGridModes({ ...base, hasGroupingColDef: true, treeData: true, hasTreeDataPath: true }).hasGroupingColumn).toBe(true);
    });

    it('has no pages in infinite mode', () => {
        expect(resolveGridModes({ ...base, pagination: true }).pagination).toBe(true);
        expect(resolveGridModes({ ...base, pagination: true, paginationMode: 'server' }).pagination).toBe(true);
        expect(resolveGridModes({ ...base, pagination: true, paginationMode: 'infinite' }).pagination).toBe(false);
    });

    it('shows list view only with a listViewColumn', () => {
        expect(resolveGridModes({ ...base, listView: true }).listView).toBe(false);
        expect(resolveGridModes({ ...base, listView: true, hasListViewColumn: true }).listView).toBe(true);
    });
});
