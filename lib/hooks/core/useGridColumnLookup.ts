import { useMemo } from 'react';
import type { GridColDef, GridRowModel } from '../../types';
import { buildColumnLookup, type GridColumnLookup } from '../../utils/columnLookup';

const SEPARATOR = '\u0000';

/**
 * The column lookup used by client-side filtering, sorting and the quick filter.
 *
 * Its identity changes only when the columns change or the set of hidden columns changes, so an
 * inline `columnVisibilityModel` object (a new reference on every parent render) does not re-run
 * the filter and sort passes.
 */
export function useGridColumnLookup<R extends GridRowModel>(
    columns: GridColDef<R>[],
    columnVisibilityModel: Record<string, boolean>,
): GridColumnLookup {
    const hiddenFieldsKey = columns
        .filter(col => columnVisibilityModel[col.field] === false)
        .map(col => col.field)
        .join(SEPARATOR);

    return useMemo(() => {
        const hidden: Record<string, boolean> = {};
        if (hiddenFieldsKey) {
            for (const field of hiddenFieldsKey.split(SEPARATOR)) hidden[field] = false;
        }
        return buildColumnLookup(columns as unknown as GridColDef[], hidden);
    }, [columns, hiddenFieldsKey]);
}
