import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { GridRowId, GridRowModel, GridRowOrderChangeParams } from '../types';
import { ROW_DRAG_MIME, hasDragToken, onNativeDragEnd, setDragToken } from '../utils/dragData';

export interface UseRowReorderProps<R extends GridRowModel = GridRowModel> {
    onRowOrderChange?: (params: GridRowOrderChangeParams<R>) => void;
    /**
     * The consumer's rows, in the order the consumer gave them (not the sorted, filtered or
     * paginated view). `oldIndex` / `targetIndex` are positions in this array, and only rows in it
     * can be dragged or dropped on, so grid-made rows (group rows, generated tree parents) cannot.
     */
    rows: R[];
    getRowId?: (row: R) => GridRowId;
    rowReordering?: boolean;
}

export interface UseRowReorderReturn {
    draggedRowId: GridRowId | null;
    dragOverRowId: GridRowId | null;
    /** Whether the row with this id can be dragged and dropped on. */
    canReorderRow: (id: GridRowId) => boolean;
    onDragStart: ((id: GridRowId) => (event: React.DragEvent) => void) | undefined;
    onDragOver: ((id: GridRowId) => (event: React.DragEvent) => void) | undefined;
    onDragEnd: (() => void) | undefined;
    onDrop: ((targetId: GridRowId) => (event: React.DragEvent) => void) | undefined;
}

export function useRowReorder<R extends GridRowModel = GridRowModel>(
    props: UseRowReorderProps<R>
): UseRowReorderReturn {
    const { onRowOrderChange, rows, getRowId, rowReordering = false } = props;
    const [draggedRowId, setDraggedRowId] = useState<GridRowId | null>(null);
    const [dragOverRowId, setDragOverRowId] = useState<GridRowId | null>(null);
    const detachDragEndRef = useRef<() => void>(() => {});

    const indexById = useMemo(() => {
        const map = new Map<GridRowId, number>();
        rows.forEach((row, index) => map.set(getRowId ? getRowId(row) : row.id, index));
        return map;
    }, [rows, getRowId]);

    const canReorderRow = useCallback((id: GridRowId) => indexById.has(id), [indexById]);

    const handleDragEnd = useCallback(() => {
        detachDragEndRef.current();
        detachDragEndRef.current = () => {};
        setDraggedRowId(null);
        setDragOverRowId(null);
    }, []);

    useEffect(() => () => detachDragEndRef.current(), []);

    const handleDragStart = useCallback((id: GridRowId) => (event: React.DragEvent) => {
        if (!rowReordering) return;
        if (!indexById.has(id)) {
            event.preventDefault();
            return;
        }
        detachDragEndRef.current();
        // Ends the drag even if the source row unmounts before the browser's dragend.
        detachDragEndRef.current = onNativeDragEnd(event.currentTarget, handleDragEnd);
        setDraggedRowId(id);
        if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            setDragToken(event, ROW_DRAG_MIME, String(id));
        }
    }, [rowReordering, indexById, handleDragEnd]);

    const handleDragOver = useCallback((id: GridRowId) => (event: React.DragEvent) => {
        if (!rowReordering || draggedRowId === null) return;
        if (!hasDragToken(event, ROW_DRAG_MIME)) {
            // Some other drag (a file, text, a column): any row drag we remember is over.
            handleDragEnd();
            return;
        }
        if (!indexById.has(id)) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';

        if (dragOverRowId !== id) {
            setDragOverRowId(id);
        }
    }, [rowReordering, draggedRowId, dragOverRowId, indexById, handleDragEnd]);

    const handleDrop = useCallback((targetId: GridRowId) => (event: React.DragEvent) => {
        event.preventDefault();
        if (draggedRowId === null || !hasDragToken(event, ROW_DRAG_MIME)) {
            handleDragEnd();
            return;
        }

        const oldIndex = indexById.get(draggedRowId);
        const targetIndex = indexById.get(targetId);
        handleDragEnd();

        if (onRowOrderChange && oldIndex !== undefined && targetIndex !== undefined && oldIndex !== targetIndex) {
            onRowOrderChange({
                row: rows[oldIndex],
                oldIndex,
                targetIndex
            });
        }
    }, [draggedRowId, onRowOrderChange, rows, indexById, handleDragEnd]);

    return {
        draggedRowId,
        dragOverRowId,
        canReorderRow,
        onDragStart: rowReordering ? handleDragStart : undefined,
        onDragOver: rowReordering ? handleDragOver : undefined,
        onDragEnd: rowReordering ? handleDragEnd : undefined,
        onDrop: rowReordering ? handleDrop : undefined,
    };
}
