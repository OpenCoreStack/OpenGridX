import { useCallback } from 'react';
import type { RefObject } from 'react';
import type { FocusedCell } from '../../utils/focus';
import type { GridCellParams, GridRowId, GridRowModel } from '../../types';

/**
 * Keyboard-mode flag: toggled via a DOM class name on the grid root, with no React state, so
 * the focus ring appears instantly without a re-render cycle.
 */
export function useGridKeyboardMode(containerRef: RefObject<HTMLDivElement | null>): (on: boolean) => void {
    return useCallback((on: boolean) => {
        containerRef.current?.classList.toggle('ogx--kb', on);
    }, [containerRef]);
}

export interface UseGridPointerFocusHandlersParams<R extends GridRowModel> {
    ensureGridFocus: () => void;
    setKeyboardMode: (on: boolean) => void;
    setFocusedCell: React.Dispatch<React.SetStateAction<FocusedCell | null>>;
    getRowId: (row: GridRowModel) => GridRowId;
    onCellClick: ((params: GridCellParams<R>) => void) | undefined;
}

export interface UseGridPointerFocusHandlersResult<R extends GridRowModel> {
    handleCellClick: (params: GridCellParams<R>) => void;
    handleHeaderClick: (field: string) => void;
}

/** Cell and header clicks move grid focus there and leave keyboard mode. */
export function useGridPointerFocusHandlers<R extends GridRowModel>(
    params: UseGridPointerFocusHandlersParams<R>
): UseGridPointerFocusHandlersResult<R> {
    const { ensureGridFocus, setKeyboardMode, setFocusedCell, getRowId, onCellClick } = params;

    const handleCellClick = useCallback((cellParams: GridCellParams<R>) => {
        // Focus stays where the click put it (the cell, or a control rendered inside it).
        ensureGridFocus();
        setKeyboardMode(false);
        setFocusedCell({ id: getRowId(cellParams.row), field: cellParams.field, rowIndex: cellParams.rowIndex });
        onCellClick?.(cellParams);
    }, [onCellClick, setKeyboardMode, setFocusedCell, ensureGridFocus, getRowId]);

    const handleHeaderClick = useCallback((field: string) => {
        ensureGridFocus();
        setFocusedCell({ id: null, field });
        setKeyboardMode(false);
    }, [ensureGridFocus, setFocusedCell, setKeyboardMode]);

    return { handleCellClick, handleHeaderClick };
}
