import React, { useState, useCallback, useRef } from 'react';
import type { GridRowId, GridRowModel } from '../../types';

export interface GridEditingState {
    editingCell: {
        id: GridRowId;
        field: string;
        value: unknown;
        originalValue: unknown;
    } | null;
}

export interface UseGridEditingParams<R extends GridRowModel> {
    rows: R[];
    getRowId: (row: R) => GridRowId;
    processRowUpdate?: (newRow: R, oldRow: R) => R | Promise<R>;
    onProcessRowUpdateError?: (error: unknown) => void;
    onRowChange?: (newRow: R) => void;
}

type EditingCellState = GridEditingState['editingCell'];

export function useGridEditing<R extends GridRowModel>(params: UseGridEditingParams<R>) {
    const {
        rows,
        getRowId,
        processRowUpdate,
        onProcessRowUpdateError,
        onRowChange
    } = params;

    const [editingCell, setEditingCellState] = useState<EditingCellState>(null);
    const editingCellRef = useRef<EditingCellState>(null);

    const setEditingCell = useCallback((val: React.SetStateAction<EditingCellState>) => {
        setEditingCellState(val);
        editingCellRef.current = typeof val === 'function' ? val(editingCellRef.current) : val;
    }, []);

    const startCellEdit = useCallback((editParams: { id: GridRowId; field: string; value: unknown }) => {
        setEditingCell({
            id: editParams.id,
            field: editParams.field,
            value: editParams.value,
            originalValue: editParams.value
        });
    }, [setEditingCell]);

    const stopCellEdit = useCallback(async (stopParams?: { cancel?: boolean }) => {
        const currentCell = editingCellRef.current;
        if (!currentCell) return;

        if (stopParams?.cancel) {
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
            onProcessRowUpdateError?.(error);
        }

    }, [setEditingCell, rows, getRowId, processRowUpdate, onRowChange, onProcessRowUpdateError]);

    const setEditCellValue = useCallback((editParams: { id: GridRowId; field: string; value: unknown }) => {
        if (editingCell && editingCell.id === editParams.id && editingCell.field === editParams.field) {
            setEditingCell(prev => prev ? { ...prev, value: editParams.value } : null);
        }
    }, [editingCell, setEditingCell]);

    return {
        editingCell,
        startCellEdit,
        stopCellEdit,
        setEditCellValue
    };
}
