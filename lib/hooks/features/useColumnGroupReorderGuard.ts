import { useMemo } from 'react';
import type { GridColumnGroupingModel } from '../../types';
import type { UseColumnReorderReturn } from '../useColumnReorder';
import { canReorderWithinColumnGroups } from '../../utils/columnGroups';

/**
 * Header drag-reorder under `columnGroupingModel`: a column can be dropped only onto a column of the
 * same innermost group (or, for an ungrouped column, onto another ungrouped column), so a drag can
 * never split a group. A disallowed target is not a drop target (no dragover `preventDefault`, no
 * highlight) and a drop on it only ends the drag.
 */
export function useColumnGroupReorderGuard(
    columnGroupingModel: GridColumnGroupingModel | undefined,
    handlers: UseColumnReorderReturn,
): UseColumnReorderReturn {
    const { draggedColumn, onDragOver, onDrop, onDragEnd } = handlers;

    const guarded = useMemo(() => {
        if (!columnGroupingModel || columnGroupingModel.length === 0) return null;
        const allowed = (target: string) =>
            draggedColumn === null || canReorderWithinColumnGroups(columnGroupingModel, draggedColumn, target);
        return {
            onDragOver: onDragOver && ((field: string) => (allowed(field) ? onDragOver(field) : () => {})),
            onDrop: onDrop && ((field: string) => (allowed(field)
                ? onDrop(field)
                : (event: React.DragEvent) => {
                    event.preventDefault();
                    onDragEnd?.();
                })),
        };
    }, [columnGroupingModel, draggedColumn, onDragOver, onDrop, onDragEnd]);

    return guarded ? { ...handlers, ...guarded } : handlers;
}
