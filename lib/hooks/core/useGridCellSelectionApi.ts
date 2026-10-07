import { useLayoutEffect, useRef } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import { isSameCell } from '../../utils/focus';
import type { FocusedCell } from '../../utils/focus';
import { isRangeColumnField, isSameCoordinates } from '../../utils/cellSelection';
import { writeToClipboard } from '../features/useGridClipboard';
import type { UseGridCellSelectionReturn } from './useGridCellSelection';
import type { GridApi, GridCellCoordinates, GridCellSelectionModel } from '../../types';

export interface UseGridCellSelectionApiParams {
    apiRef: MutableRefObject<GridApi>;
    selection: UseGridCellSelectionReturn;
    /** The rendered model (controlled or internal). */
    model: GridCellSelectionModel;
    getPendingModel: () => GridCellSelectionModel | null;
    focusedCell: FocusedCell | null;
    setFocusedCell: React.Dispatch<React.SetStateAction<FocusedCell | null>>;
    /** The grid root: its `ogx--kb` class tells a keyboard focus move from a pointer one. */
    containerRef: RefObject<HTMLDivElement | null>;
}

/**
 * Runs after useGridKeyboardNavigation. Keeps the range's anchor and the focused cell together:
 * a new anchor (pointer, keyboard, API or a controlled model) moves focus there, and focus moved
 * to another data cell (plain arrows, Tab back in) collapses the range to it. Clears a range whose
 * corner is no longer displayed (`reason: 'dataChange'`). Installs the cell selection API methods.
 */
export function useGridCellSelectionApi(params: UseGridCellSelectionApiParams): void {
    const { apiRef } = params;
    const latestRef = useRef(params);
    useLayoutEffect(() => {
        latestRef.current = params;
    });

    const previousAnchorRef = useRef<GridCellCoordinates | null>(null);
    const previousFocusRef = useRef<FocusedCell | null>(null);
    const reportedDataChangeRef = useRef<GridCellSelectionModel | null>(null);

    const { selection, model, focusedCell, setFocusedCell, containerRef } = params;
    const anchor = selection.range?.anchor ?? null;
    const anchorRow = selection.resolved?.anchorRow;

    useLayoutEffect(() => {
        selection.reportFocus(focusedCell);
        const anchorChanged = !isSameCoordinates(previousAnchorRef.current, anchor);
        const focusChanged = !isSameCell(previousFocusRef.current, focusedCell);
        previousAnchorRef.current = anchor;
        previousFocusRef.current = focusedCell;
        if (!selection.enabled) return;

        if (selection.range && !selection.resolved) {
            // A corner's row or column is no longer displayed. Reported once per model.
            if (reportedDataChangeRef.current !== model) {
                reportedDataChangeRef.current = model;
                selection.setModel([], 'dataChange');
            }
            return;
        }
        if (anchorChanged && anchor) {
            if (!focusedCell || focusedCell.id !== anchor.id || focusedCell.field !== anchor.field) {
                setFocusedCell({ id: anchor.id, field: anchor.field, rowIndex: anchorRow });
            }
            return;
        }
        if (focusChanged && focusedCell && focusedCell.id !== null && isRangeColumnField(focusedCell.field)
            && !isSameCoordinates(anchor, { id: focusedCell.id, field: focusedCell.field })) {
            const cell = { id: focusedCell.id, field: focusedCell.field };
            const byKeyboard = containerRef.current?.classList.contains('ogx--kb') ?? false;
            selection.setModel([{ anchor: cell, head: cell }], byKeyboard ? 'keyboard' : 'pointer');
        }
    }, [selection, model, anchor, anchorRow, focusedCell, setFocusedCell, containerRef]);

    useLayoutEffect(() => {
        const api = apiRef.current;
        const current = () => latestRef.current;
        api.getCellSelectionModel = () => {
            const { selection: s, getPendingModel, model: rendered } = current();
            return s.enabled ? (getPendingModel() ?? rendered) : [];
        };
        api.setCellSelectionModel = (next) => {
            current().selection.setModel(next, 'api');
        };
        api.selectCellRange = (rangeAnchor, head) => {
            current().selection.setModel([{ anchor: rangeAnchor, head }], 'api');
        };
        api.clearCellSelection = () => {
            current().selection.setModel([], 'clear');
        };
        api.getSelectedCells = () => current().selection.getSelectedCells();
        api.copySelectedCells = async () => {
            const { selection: s } = current();
            if (!s.enabled) return;
            const text = s.getCopyText();
            if (text !== null) await writeToClipboard(text);
        };
    }, [apiRef]);
}
