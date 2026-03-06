import { useState, useCallback, useRef } from 'react';
import type { GridRowId, GridRowModel } from '../../types';

export interface GridEditingState {

    editingCell: {
        id: GridRowId;
        field: string;
        value: any;
        originalValue: any;
    } | null;
}

export interface UseGridEditingParams<R extends GridRowModel> {
    rows: R[];
    getRowId: (row: R) => GridRowId;
    processRowUpdate?: (newRow: R, oldRow: R) => R | Promise<R>;
    onProcessRowUpdateError?: (error: any) => void;
    onRowChange?: (newRow: R) => void; 
}

export function useGridEditing<R extends GridRowModel>(params: UseGridEditingParams<R>) {
    const { 
        rows, 
        getRowId, 
        processRowUpdate, 
        onProcessRowUpdateError,
        onRowChange 
    } = params;

    const [editingCell, setEditingCellState] = useState<GridEditingState['editingCell']>(null);
    const editingCellRef = useRef<GridEditingState['editingCell']>(null);

    const setEditingCell = useCallback((val: any) => {
        setEditingCellState(val);
        editingCellRef.current = typeof val === 'function' ? val(editingCellRef.current) : val;
    }, []);

    const startCellEdit = useCallback((params: { id: GridRowId, field: string, value: any }) => {
        setEditingCell({
            id: params.id,
            field: params.field,
            value: params.value,
            originalValue: params.value
        });
    }, []);

    const stopCellEdit = useCallback(async (params?: { cancel?: boolean }) => {
        const currentCell = editingCellRef.current;
        if (!currentCell) return;

        if (params?.cancel) {
            setEditingCell(null);
            return;
        }

        const { id, field, value, originalValue } = currentCell;

        if (value === originalValue) {
            setEditingCell(null);
            return;
        }

        const existingRow = rows.find(r => getRowId(r) === id);
        if (!existingRow) {
             setEditingCell(null);
             return;
        }

        const newRow = { ...existingRow, [field]: value };

        try {
            if (processRowUpdate) {
                const processedRow = await processRowUpdate(newRow, existingRow);
                onRowChange?.(processedRow);
            } else {
                onRowChange?.(newRow);
            }
            setEditingCell(null);
        } catch (error) {
            if (onProcessRowUpdateError) {
                onProcessRowUpdateError(error);
            }
        }

    }, [editingCell, rows, getRowId, processRowUpdate, onRowChange, onProcessRowUpdateError]);

    const setEditCellValue = useCallback((params: { id: GridRowId, field: string, value: any }) => {
        if (editingCell && editingCell.id === params.id && editingCell.field === params.field) {
            setEditingCell((prev: any) => prev ? { ...prev, value: params.value } : null);
        }
    }, [editingCell]);

    return {
        editingCell,
        startCellEdit,
        stopCellEdit,
        setEditCellValue
    };
}
