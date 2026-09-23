import { useRef, useEffect, useLayoutEffect } from 'react';
import type { GridState, GridDensityState } from '../../state/types';
import type {
    GridSortItem,
    GridFilterModel,
    GridPaginationModel,
    GridColumnPinning,
} from '../../types';

/** Grid-owned columns that must never leak into the public state (and so into storage). */
const SYNTHETIC_FIELDS: ReadonlySet<string> = new Set(['__group__']);
const isUserField = (field: string) => !SYNTHETIC_FIELDS.has(field);

function withoutSyntheticKeys<T>(record: Record<string, T>): Record<string, T> {
    const keys = Object.keys(record);
    if (keys.every(isUserField)) return record;
    return Object.fromEntries(Object.entries(record).filter(([field]) => isUserField(field)));
}

function userPinnedColumns(pinned: GridColumnPinning): GridColumnPinning {
    const result: GridColumnPinning = { ...pinned };
    if (pinned.left) result.left = pinned.left.filter(isUserField);
    if (pinned.right) result.right = pinned.right.filter(isUserField);
    return result;
}

export interface UseGridStateSnapshotParams {
    onStateChange?: (state: GridState) => void;
    sortModel: GridSortItem[];
    filterModel: GridFilterModel;
    effectivePaginationModel: GridPaginationModel;
    columnWidths: Record<string, number>;
    effectiveColumnOrder: string[];
    columnVisibilityModel: Record<string, boolean>;
    /** The user's pins (not the grid's effective pins, which add the synthetic group column). */
    pinnedColumns: GridColumnPinning;
    density: GridDensityState['density'];
}

/**
 * Emits the public GridState through onStateChange whenever its *value* changes.
 * Inline model props get a new identity on every parent render, so the comparison is
 * structural; otherwise an onStateChange that stores state in the parent re-renders
 * the parent, which creates new inline props, which fires onStateChange again, forever.
 */
export function useGridStateSnapshot(params: UseGridStateSnapshotParams): void {
    const {
        onStateChange,
        sortModel,
        filterModel,
        effectivePaginationModel,
        columnWidths,
        effectiveColumnOrder,
        columnVisibilityModel,
        pinnedColumns,
        density,
    } = params;

    const onStateChangeRef = useRef(onStateChange);
    useLayoutEffect(() => {
        onStateChangeRef.current = onStateChange;
    });

    const lastEmittedRef = useRef<string | null>(null);

    useEffect(() => {
        if (!onStateChangeRef.current) return;

        const snapshot: GridState = {
            sorting: { sortModel: sortModel as { field: string; sort: 'asc' | 'desc' }[] },
            filter: { filterModel },
            pagination: { paginationModel: effectivePaginationModel },
            columns: {
                columnWidths: withoutSyntheticKeys(columnWidths),
                columnOrder: effectiveColumnOrder.filter(isUserField),
                columnVisibilityModel: withoutSyntheticKeys(columnVisibilityModel),
                pinnedColumns: userPinnedColumns(pinnedColumns),
            },
            density: { density },
        };

        // The snapshot only holds plain data, so its JSON is a faithful value key.
        const serialized = JSON.stringify(snapshot);
        if (serialized === lastEmittedRef.current) return;
        lastEmittedRef.current = serialized;

        onStateChangeRef.current(snapshot);
    }, [
        sortModel,
        filterModel,
        effectivePaginationModel,
        columnWidths,
        effectiveColumnOrder,
        columnVisibilityModel,
        pinnedColumns,
        density,
    ]);
}
