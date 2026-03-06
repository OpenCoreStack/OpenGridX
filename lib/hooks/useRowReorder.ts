import { useState, useCallback } from 'react';
import type { GridRowId, GridRowModel, GridRowOrderChangeParams } from '../types';

export interface UseRowReorderProps<R extends GridRowModel = GridRowModel> {
    onRowOrderChange?: (params: GridRowOrderChangeParams<R>) => void;
    rows: R[];
    getRowId?: (row: R) => GridRowId;
    rowReordering?: boolean;
}

export interface UseRowReorderReturn {
    draggedRowId: GridRowId | null;
    dragOverRowId: GridRowId | null;
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

    const getRowIdInternal = useCallback((row: R) => {
        return getRowId ? getRowId(row) : row.id;
    }, [getRowId]);

    const handleDragStart = useCallback((id: GridRowId) => (event: React.DragEvent) => {
        if (!rowReordering) return;
        setDraggedRowId(id);
        event.dataTransfer.effectAllowed = 'move';

    }, [rowReordering]);

    const handleDragOver = useCallback((id: GridRowId) => (event: React.DragEvent) => {
        if (!rowReordering || !draggedRowId) return;
        event.preventDefault(); 
        event.dataTransfer.dropEffect = 'move';

        if (dragOverRowId !== id) {
            setDragOverRowId(id);
        }
    }, [rowReordering, draggedRowId, dragOverRowId]);

    const handleDragEnd = useCallback(() => {
        setDraggedRowId(null);
        setDragOverRowId(null);
    }, []);

    const handleDrop = useCallback((targetId: GridRowId) => (event: React.DragEvent) => {
        event.preventDefault();

        if (!draggedRowId || !onRowOrderChange) {
             handleDragEnd();
             return;
        }

        const oldIndex = rows.findIndex(r => getRowIdInternal(r) === draggedRowId);
        const targetIndex = rows.findIndex(r => getRowIdInternal(r) === targetId);

        if (oldIndex !== -1 && targetIndex !== -1 && oldIndex !== targetIndex) {
             onRowOrderChange({
                 row: rows[oldIndex],
                 oldIndex,
                 targetIndex
             });
        }

        handleDragEnd();
    }, [draggedRowId, onRowOrderChange, rows, getRowIdInternal, handleDragEnd]);

    return {
        draggedRowId,
        dragOverRowId,
        onDragStart: rowReordering ? handleDragStart : undefined,
        onDragOver: rowReordering ? handleDragOver : undefined,
        onDragEnd: rowReordering ? handleDragEnd : undefined,
        onDrop: rowReordering ? handleDrop : undefined,
    };
}
