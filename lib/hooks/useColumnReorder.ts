import { useState, useCallback, useRef, useEffect } from 'react';
import type { GridColDef, GridRowModel, GridColumnOrderChangeParams } from '../types';
import { COLUMN_DRAG_MIME, hasDragToken, onNativeDragEnd, setDragToken } from '../utils/dragData';

export interface UseColumnReorderProps<R extends GridRowModel = GridRowModel> {
  /** Every current column, in the grid's column order. Reported indices are positions in it. */
  columns: GridColDef<R>[];
  onColumnOrderChange?: (params: GridColumnOrderChangeParams) => void;
  disableColumnReorder?: boolean;
}

export interface UseColumnReorderReturn {
  draggedColumn: string | null;
  dragOverColumn: string | null;
  onDragStart: ((field: string) => (event: React.DragEvent) => void) | undefined;
  onDragOver: ((field: string) => (event: React.DragEvent) => void) | undefined;
  onDragEnd: (() => void) | undefined;
  onDrop: ((targetField: string) => (event: React.DragEvent) => void) | undefined;
}

export function useColumnReorder<R extends GridRowModel = GridRowModel>(
  props: UseColumnReorderProps<R>
): UseColumnReorderReturn {
  const { columns, onColumnOrderChange, disableColumnReorder = false } = props;

  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const detachDragEndRef = useRef<() => void>(() => {});

  const handleDragEnd = useCallback(() => {
    detachDragEndRef.current();
    detachDragEndRef.current = () => {};
    setDraggedColumn(null);
    setDragOverColumn(null);
  }, []);

  useEffect(() => () => detachDragEndRef.current(), []);

  const handleDragStart = useCallback(
    (field: string) => (event: React.DragEvent) => {
      if (disableColumnReorder) return;
      if (!columns.some(col => col.field === field)) {
        event.preventDefault();
        return;
      }

      detachDragEndRef.current();
      // Ends the drag even if the header unmounts (column virtualization) before dragend.
      detachDragEndRef.current = onNativeDragEnd(event.currentTarget, handleDragEnd);
      setDraggedColumn(field);

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        setDragToken(event, COLUMN_DRAG_MIME, field);
      }
    },
    [columns, disableColumnReorder, handleDragEnd]
  );

  const handleDragOver = useCallback(
    (field: string) => (event: React.DragEvent) => {
      if (disableColumnReorder || draggedColumn === null) return;
      if (!hasDragToken(event, COLUMN_DRAG_MIME)) {
        // Some other drag (a file, text, a row): any column drag we remember is over.
        handleDragEnd();
        return;
      }

      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';

      setDragOverColumn(field);
    },
    [draggedColumn, disableColumnReorder, handleDragEnd]
  );

  const handleDrop = useCallback(
    (targetField: string) => (event: React.DragEvent) => {
      event.preventDefault();
      if (disableColumnReorder || draggedColumn === null || !hasDragToken(event, COLUMN_DRAG_MIME)) {
        handleDragEnd();
        return;
      }

      const oldIndex = columns.findIndex(col => col.field === draggedColumn);
      const targetIndex = columns.findIndex(col => col.field === targetField);
      handleDragEnd();

      if (oldIndex === -1 || targetIndex === -1 || oldIndex === targetIndex) return;

      onColumnOrderChange?.({
        column: columns[oldIndex] as unknown as GridColDef,
        oldIndex,
        targetIndex,
      });
    },
    [columns, draggedColumn, disableColumnReorder, onColumnOrderChange, handleDragEnd]
  );

  return {
    draggedColumn,
    dragOverColumn,
    onDragStart: disableColumnReorder ? undefined : handleDragStart,
    onDragOver: disableColumnReorder ? undefined : handleDragOver,
    onDragEnd: disableColumnReorder ? undefined : handleDragEnd,
    onDrop: disableColumnReorder ? undefined : handleDrop,
  };
}
