
import { useState, useCallback, useRef } from 'react';
import type { GridColDef, GridRowModel, GridColumnOrderChangeParams } from '../types';

export interface UseColumnReorderProps<R extends GridRowModel = GridRowModel> {
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
  const draggedIndexRef = useRef<number>(-1);

  const handleDragStart = useCallback(
    (field: string) => (event: React.DragEvent) => {
      if (disableColumnReorder) return;

      const columnIndex = columns.findIndex(col => col.field === field);
      const column = columns[columnIndex];

      if (column?.pinnable === false) {
        event.preventDefault();
        return;
      }

      setDraggedColumn(field);
      draggedIndexRef.current = columnIndex;

      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', field);
      }
    },
    [columns, disableColumnReorder]
  );

  const handleDragOver = useCallback(
    (field: string) => (event: React.DragEvent) => {
      if (disableColumnReorder || !draggedColumn) return;

      event.preventDefault(); 
      event.dataTransfer.dropEffect = 'move';

      setDragOverColumn(field);
    },
    [draggedColumn, disableColumnReorder]
  );

  const handleDrop = useCallback(
    (targetField: string) => (event: React.DragEvent) => {
      event.preventDefault();

      if (disableColumnReorder || !draggedColumn || draggedColumn === targetField) {
        setDraggedColumn(null);
        setDragOverColumn(null);
        return;
      }

      const oldIndex = columns.findIndex(col => col.field === draggedColumn);
      const targetIndex = columns.findIndex(col => col.field === targetField);

      if (oldIndex === -1 || targetIndex === -1) {
        setDraggedColumn(null);
        setDragOverColumn(null);
        return;
      }

      const column = columns[oldIndex];

      if (onColumnOrderChange) {
        onColumnOrderChange({
          column: column as any,
          oldIndex,
          targetIndex,
        });
      }

      setDraggedColumn(null);
      setDragOverColumn(null);
      draggedIndexRef.current = -1;
    },
    [columns, draggedColumn, disableColumnReorder, onColumnOrderChange]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedColumn(null);
    setDragOverColumn(null);
    draggedIndexRef.current = -1;
  }, []);

  return {
    draggedColumn,
    dragOverColumn,
    onDragStart: disableColumnReorder ? undefined : handleDragStart,
    onDragOver: disableColumnReorder ? undefined : handleDragOver,
    onDragEnd: disableColumnReorder ? undefined : handleDragEnd,
    onDrop: disableColumnReorder ? undefined : handleDrop,
  };
}
