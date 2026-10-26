import { isRtl, logicalArrowKey } from '../../utils/direction';
import { resolveCellEditable } from '../../utils/editing';
import { getCellValue } from '../../utils/values';
import { isSyntheticRowId } from '../../utils/syntheticRows';
import {
    CHECKBOX_FIELD,
    EXPAND_FIELD,
    REORDER_FIELD,
    classifyKeyTarget,
    findFocusTarget,
    isSystemField,
} from '../../utils/focus';
import type { FocusedCell } from '../../utils/focus';
import { isRangeColumnField } from '../../utils/cellSelection';
import type {
    GridRowModel,
    GridRowId,
    GridColDef,
    GridSortDirection,
} from '../../types';
import type { UseGridKeyboardNavigationParams } from './useGridKeyboardNavigation';

// The grid's keydown handling (arrows, Home / End, PageUp / PageDown, Enter, Escape, Space, Tab,
// Ctrl/Cmd+A, sort and column-menu keys, header filter row, cell range keys). A plain function over an
// explicit context: useGridKeyboardNavigation builds the context from its inputs and calls it, so the
// handler's identity and dependencies are unchanged (R6, 3.10).

/** Everything the keydown handling reads: the hook's inputs (defaults applied) and its focus state. */
export interface GridKeyDownContext<R extends GridRowModel> extends Pick<UseGridKeyboardNavigationParams<R>,
    'allRenderableRows' | 'navigationColumns' | 'editingHandlers' | 'selectedRowIds' | 'handleSelectionChange' | 'handleDetailPanelToggle' | 'setKeyboardMode' | 'sortModel' | 'handleSort' | 'handleSortAdd' | 'isCellEditable' | 'pagination' | 'pageSize' | 'rowMetaMap' | 'onRowActivate' | 'toggleRowExpansion' | 'handleSelectAll' | 'getSpanOrigin' | 'cellSelection'> {
    multiSort: boolean;
    rowSelectionEnabled: boolean;
    multipleRowSelectionEnabled: boolean;
    headerFilters: boolean;
    getRowId: (row: R) => GridRowId;
    focusedCell: FocusedCell | null;
    focusedRowIndex: number;
    getDefaultFocus: () => FocusedCell | null;
    scrollCellIntoView: (rowIndex: number, field: string) => void;
    setFocusedCell: React.Dispatch<React.SetStateAction<FocusedCell | null>>;
    /** Opens the cell context menu (`contextMenu`); absent while it is off. */
    openContextMenuAt?: ((cell: FocusedCell) => void) | null;
}

/** Keys that move focus between cells. */
export const NAVIGATION_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown']);

export function handleGridKeyDown<R extends GridRowModel>(event: React.KeyboardEvent, context: GridKeyDownContext<R>): void {
    const { focusedCell, focusedRowIndex, allRenderableRows, navigationColumns, editingHandlers, selectedRowIds, handleSelectionChange, handleDetailPanelToggle, setKeyboardMode, sortModel, handleSort, handleSortAdd, multiSort, isCellEditable, pagination, pageSize, rowMetaMap, onRowActivate, toggleRowExpansion, handleSelectAll, rowSelectionEnabled, multipleRowSelectionEnabled, getDefaultFocus, scrollCellIntoView, getSpanOrigin, getRowId, cellSelection, headerFilters, setFocusedCell, openContextMenuAt } = context;
        const viewport = event.currentTarget as HTMLElement;
        const targetKind = classifyKeyTarget(event.target, viewport);
        if (targetKind === 'foreign') return;
        setKeyboardMode(true);

        // While an IME is composing, Enter / Escape / arrows confirm or navigate candidates.
        if (event.nativeEvent?.isComposing || event.keyCode === 229) return;

        // In a right-to-left grid ArrowLeft moves to the column on the left: the next column.
        const key = logicalArrowKey(event.key, isRtl(viewport));
        const isSpace = key === ' ' || key === 'Spacebar';
        const isEditing = Boolean(editingHandlers.editingCell);

        // Row positions: rows from 0, the column header row at `headerRow`, and the header filter
        // row (when rendered) at -1, between the header and the rows.
        const headerRow = headerFilters ? -2 : -1;
        const moveTo = (r: number, c: number) => {
            const col = navigationColumns[c];
            if (!col || r < headerRow || r >= allRenderableRows.length) return;
            if (r === headerRow) setFocusedCell({ id: null, field: col.field });
            else if (r < 0) setFocusedCell({ id: null, field: col.field, headerFilter: true });
            else setFocusedCell({ id: getRowId(allRenderableRows[r]), field: col.field, rowIndex: r });
            scrollCellIntoView(r, col.field);
        };

        if (!focusedCell) {
            if (!NAVIGATION_KEYS.has(key)) return;
            const initial = getDefaultFocus();
            if (!initial) return;
            event.preventDefault();
            setFocusedCell(initial);
            scrollCellIntoView(initial.rowIndex ?? -1, initial.field);
            return;
        }

        const { id, field } = focusedCell;
        // Shift+F10 / the ContextMenu key: the cell context menu on a body cell.
        if (key === 'ContextMenu' || (key === 'F10' && event.shiftKey)) {
            if (id === null || !openContextMenuAt || isEditing) return;
            event.preventDefault();
            openContextMenuAt({ id, field });
            return;
        }
        const onHeaderFilter = id === null && Boolean(focusedCell.headerFilter);
        const rowIndex = id !== null ? focusedRowIndex : onHeaderFilter ? -1 : headerRow;
        const colIndex = navigationColumns.findIndex(c => c.field === field);
        const systemColumnCount = navigationColumns.filter(c => isSystemField(c.field)).length;
        const isSyntheticRow = (rowId: GridRowId) => isSyntheticRowId(rowId, rowMetaMap);
        // Same rule and starting value as double-click (see Row / resolveCellEditable).
        const isEditableCell = (row: R, r: number, c: number) => {
            const colDef = navigationColumns[c] as GridColDef<R>;
            if (isSystemField(colDef.field)) return false;
            return resolveCellEditable({
                row,
                field: colDef.field,
                value: getCellValue(row, colDef.field, colDef),
                colDef,
                rowIndex: r,
                colIndex: c - systemColumnCount,
                rowMeta: rowMetaMap?.get(getRowId(row)),
            }, isCellEditable);
        };

        // Next editable data cell in reading order, for Tab while editing.
        const findNextEditable = (deltaCol: number) => {
            let r = rowIndex;
            let c = colIndex;
            const maxSteps = (allRenderableRows.length + 1) * navigationColumns.length;
            for (let steps = 0; steps < maxSteps; steps++) {
                c += deltaCol;
                if (c >= navigationColumns.length) { c = 0; r++; }
                else if (c < 0) { c = navigationColumns.length - 1; r--; }
                if (r < 0 || r >= allRenderableRows.length) return null;

                const row = allRenderableRows[r];
                // Cells covered by a span are not stops; their origin is.
                if (getSpanOrigin?.(getRowId(row), navigationColumns[c].field)) continue;
                if (isEditableCell(row, r, c)) return { r, c };
            }
            return null;
        };

        if (isEditing) {
            if (key === 'Enter') {
                event.preventDefault();
                editingHandlers.stopCellEdit();
            } else if (key === 'Escape') {
                event.preventDefault();
                editingHandlers.stopCellEdit({ cancel: true });
            } else if (key === 'Tab' && id !== null) {
                // No next editable cell: the browser moves focus on and the editor commits on blur.
                const next = findNextEditable(event.shiftKey ? -1 : 1);
                if (next) {
                    event.preventDefault();
                    editingHandlers.stopCellEdit();
                    moveTo(next.r, next.c);
                }
            }
            return;
        }

        // Tab is not captured outside edit mode: the grid is a single tab stop and Tab leaves it
        // (or reaches focusable content inside cells and detail panels).
        if (key === 'Escape' && cellSelection?.collapseSelection()) {
            event.preventDefault();
            return;
        }
        if (key === 'Tab' || key === 'Escape') return;
        // Enter and Space activate a control rendered inside a cell.
        if (targetKind === 'control' && (key === 'Enter' || isSpace)) return;

        if ((event.ctrlKey || event.metaKey) && (key === 'a' || key === 'A')) {
            if (cellSelection) {
                if (cellSelection.selectAllCells()) event.preventDefault();
                return;
            }
            if (!rowSelectionEnabled || !multipleRowSelectionEnabled || !handleSelectAll) return;
            event.preventDefault();
            handleSelectAll(true);
            return;
        }

        // A filter cell handles Enter, Space and typing itself (HeaderFilterCell).
        if (onHeaderFilter && (key === 'Enter' || isSpace)) return;
        if (id === null) {
            if (key === 'Enter' || isSpace) {
                event.preventDefault();
                if (field === CHECKBOX_FIELD) {
                    // Same as clicking the select-all checkbox.
                    findFocusTarget(viewport, focusedCell, -1)?.click();
                    return;
                }
                const col = navigationColumns[colIndex];
                if (!col || isSystemField(field) || col.sortable === false) return;
                const currentSort = sortModel.find(item => item.field === field);
                const direction: GridSortDirection = currentSort ? (currentSort.sort === 'asc' ? 'desc' : null) : 'asc';
                if ((multiSort || event.shiftKey) && handleSortAdd) handleSortAdd(field, direction);
                else handleSort(field, direction);
                return;
            }
        } else if (key === 'Enter' || isSpace) {
            event.preventDefault();
            const row = allRenderableRows[rowIndex];
            if (field === CHECKBOX_FIELD) {
                handleSelectionChange(id, !selectedRowIds.has(id));
                return;
            }
            if (field === EXPAND_FIELD) {
                if (!event.shiftKey) handleDetailPanelToggle(id);
                return;
            }
            if (isSpace) {
                // Shift+Space selects the row; plain Space only must not scroll the viewport.
                if (event.shiftKey && rowSelectionEnabled && !isSyntheticRow(id)) {
                    handleSelectionChange(id, !selectedRowIds.has(id));
                }
                return;
            }
            if (field === REORDER_FIELD) return;
            if (isEditableCell(row, rowIndex, colIndex)) {
                editingHandlers.startCellEdit({ id, field, value: getCellValue(row, field, navigationColumns[colIndex] as GridColDef<R>) });
                return;
            }
            // A row with children toggles, so keyboard users can expand a tree-data parent even
            // though clicking it selects it. Others: the keyboard equivalent of clicking the row.
            if (toggleRowExpansion && rowMetaMap?.get(id)?.hasChildren) {
                toggleRowExpansion(id);
                return;
            }
            onRowActivate?.({ row, id, rowIndex });
            return;
        }

        // Treegrid shortcuts: Alt+ArrowRight expands, Alt+ArrowLeft collapses the focused row.
        if (event.altKey && (key === 'ArrowRight' || key === 'ArrowLeft') && toggleRowExpansion && id !== null) {
            event.preventDefault();
            const meta = rowMetaMap?.get(id);
            if (meta?.hasChildren && Boolean(meta.isExpanded) !== (key === 'ArrowRight')) toggleRowExpansion(id);
            return;
        }

        if (!NAVIGATION_KEYS.has(key)) return;
        // Prevent native scrolling even when the focus cannot move (grid edges).
        event.preventDefault();

        const lastRow = allRenderableRows.length - 1;
        const lastCol = navigationColumns.length - 1;
        const withModifier = event.ctrlKey || event.metaKey;
        const page = pagination ? pageSize : 10;

        // Shift+navigation on a data cell extends the cell range; focus stays on its anchor.
        if (cellSelection && event.shiftKey && id !== null && isRangeColumnField(field)
            && cellSelection.extendSelection(key, withModifier, page, focusedCell)) {
            return;
        }

        const step = (r: number, c: number): { r: number; c: number } => {
            switch (key) {
                case 'ArrowRight': return c + 1 > lastCol ? { r: r + 1, c: 0 } : { r, c: c + 1 };
                case 'ArrowLeft': return c - 1 < 0 ? { r: r - 1, c: lastCol } : { r, c: c - 1 };
                case 'ArrowDown': return { r: r + 1, c };
                case 'ArrowUp': return { r: r - 1, c };
                case 'Home': return { r: withModifier ? headerRow : r, c: 0 };
                case 'End': return { r: withModifier ? lastRow : r, c: lastCol };
                case 'PageUp': return { r: Math.max(headerRow, r - page), c };
                default: return { r: Math.min(lastRow, r + page), c };
            }
        };
        const inGrid = ({ r, c }: { r: number; c: number }) => r >= headerRow && r <= lastRow && c >= 0 && c <= lastCol;
        const spanOriginAt = ({ r, c }: { r: number; c: number }) =>
            r >= 0 ? getSpanOrigin?.(getRowId(allRenderableRows[r]), navigationColumns[c].field) ?? null : null;

        let next = step(rowIndex, colIndex);
        // Arrow keys step over the cells of the focused span (its own merged area) ...
        if (key.startsWith('Arrow')) {
            for (let origin = inGrid(next) ? spanOriginAt(next) : null;
                origin && origin.rowId === id && origin.field === field;
                origin = inGrid(next) ? spanOriginAt(next) : null) {
                next = step(next.r, next.c);
            }
        }
        if (!inGrid(next)) return;
        // ... then land on the origin of whatever span covers the target cell.
        const origin = spanOriginAt(next);
        if (origin) {
            const originRow = allRenderableRows.findIndex(r => getRowId(r) === origin.rowId);
            const originCol = navigationColumns.findIndex(c => c.field === origin.field);
            if (originRow !== -1 && originCol !== -1) next = { r: originRow, c: originCol };
        }
        if (next.r === rowIndex && next.c === colIndex) return;
        moveTo(next.r, next.c);
}
