import { useMemo } from 'react';
import type { GridColDef, GridColumnPinning, GridRowModel } from '../../types';

export interface UseGridGroupingColumnParams<R extends GridRowModel> {
    /** The columns before the grouping column is added (the pivot's columns in pivot mode). */
    baseColumns: GridColDef<R>[];
    pinnedColumns: GridColumnPinning;
    /** Show the synthetic `__group__` column (see `resolveGridModes`). */
    hasGroupingColumn: boolean;
    groupingColDef: Partial<GridColDef<R>> | undefined;
    isTreeData: boolean;
    getTreeDataPath: ((row: R) => string[]) | undefined;
}

export interface UseGridGroupingColumnResult<R extends GridRowModel> {
    /** `baseColumns`, with the `__group__` column first when it is shown. */
    activeColumns: GridColDef<R>[];
    /** `pinnedColumns`, with `__group__` pinned first on the left when it is shown. */
    effectivePinnedColumns: GridColumnPinning;
}

/**
 * The dedicated `__group__` column that `groupingColDef` asks for while row grouping or tree
 * data is active: prepended at position 0 and auto-pinned left.
 *
 * Both results MUST be memoized: a new array/object reference every render cascades through
 * useRowGrouping's memos and effects into an infinite setState loop (Maximum update depth exceeded).
 */
export function useGridGroupingColumn<R extends GridRowModel>(
    params: UseGridGroupingColumnParams<R>
): UseGridGroupingColumnResult<R> {
    const { baseColumns, pinnedColumns, hasGroupingColumn, groupingColDef, isTreeData, getTreeDataPath } = params;

    const effectivePinnedColumns = useMemo(() => (
        hasGroupingColumn
            ? { ...pinnedColumns, left: ['__group__', ...((pinnedColumns?.left ?? []).filter(f => f !== '__group__'))] }
            : pinnedColumns
    ), [hasGroupingColumn, pinnedColumns]);

    const activeColumns = useMemo(() => (
        hasGroupingColumn
            ? [
                {
                    headerName: 'Group',
                    width: 220,
                    // Tree data: a row's own entry in the hierarchy is the last segment of its path.
                    ...(isTreeData && getTreeDataPath ? { valueGetter: ({ row }: { row: R }) => { const path = getTreeDataPath(row); return path[path.length - 1]; } } : {}),
                    ...groupingColDef,
                    field: '__group__',
                    hideable: false,
                    sortable: false,
                    filterable: false,
                    pinnable: false,
                    exportable: false,
                } as unknown as GridColDef<R>,
                ...baseColumns,
              ]
            : baseColumns
    ), [groupingColDef, hasGroupingColumn, isTreeData, getTreeDataPath, baseColumns]);

    return { activeColumns, effectivePinnedColumns };
}
