import type { GridRowId } from '../../types';

/** Synthetic navigation columns rendered before the data columns, in render order. */
export const REORDER_FIELD = '__reorder_col__';
export const EXPAND_FIELD = '__expand_col__';
export const CHECKBOX_FIELD = '__checkbox_col__';

export const isSystemField = (field: string): boolean =>
    field === REORDER_FIELD || field === EXPAND_FIELD || field === CHECKBOX_FIELD;

/** The grid's logical focus position. */
export interface FocusedCell {
    /** Row id of the focused body cell, or `null` when a column header cell is focused. */
    id: GridRowId | null;
    field: string;
    /** Index in the renderable rows when focus was set; used to pick a neighbour if the row disappears. */
    rowIndex?: number;
}

export const isSameCell = (a: FocusedCell | null, b: FocusedCell | null): boolean =>
    a === b || (a !== null && b !== null && a.id === b.id && a.field === b.field);

/**
 * Where a keydown came from, from the grid's point of view:
 * - `grid`: the viewport or a cell / header cell itself — the grid handles the key;
 * - `control`: a button, link or checkbox inside a cell — navigation keys move grid focus, but
 *   Enter and Space are left to the control;
 * - `editor`: inside the cell being edited;
 * - `foreign`: anything the grid must leave alone — text inputs rendered in cells, detail-panel
 *   content, portals such as the column menu.
 */
export type GridKeyTarget = 'grid' | 'control' | 'editor' | 'foreign';

const NON_TEXT_INPUT_TYPES = new Set(['checkbox', 'radio', 'button', 'submit', 'reset', 'image', 'file', 'color']);
const TEXT_ROLES = new Set(['textbox', 'searchbox', 'combobox', 'listbox', 'slider', 'spinbutton']);

/** True for elements that use typing or arrow keys themselves. */
export function isTextEntryElement(el: Element): boolean {
    const tag = el.tagName;
    if (tag === 'INPUT') return !NON_TEXT_INPUT_TYPES.has((el as HTMLInputElement).type);
    if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if ((el as HTMLElement).isContentEditable || el.closest('[contenteditable]:not([contenteditable="false"])')) return true;
    const role = el.getAttribute('role');
    return role !== null && TEXT_ROLES.has(role);
}

const isElement = (target: EventTarget | null): target is Element =>
    target !== null && (target as Node).nodeType === 1;

/** The cell or header cell of `viewport` (not of a grid nested inside it) that contains `el`, if any. */
function owningCell(el: Element, viewport: HTMLElement): HTMLElement | null {
    const panel = el.closest('.ogx__detail-panel');
    if (panel && viewport.contains(panel)) return null;
    const cell = el.closest<HTMLElement>('[role="gridcell"], [role="columnheader"]');
    if (!cell || cell.closest('.ogx__viewport') !== viewport) return null;
    return cell;
}

export function classifyKeyTarget(target: EventTarget | null, viewport: HTMLElement): GridKeyTarget {
    if (target === viewport) return 'grid';
    if (!isElement(target) || !viewport.contains(target)) return 'foreign';
    const cell = owningCell(target, viewport);
    if (!cell) return 'foreign';
    if (cell.classList.contains('ogx__cell--editing')) return 'editor';
    if (cell === target) return 'grid';
    if (isTextEntryElement(target)) return 'foreign';
    // The select-all checkbox input is the header cell's own focus target.
    if (cell.classList.contains('ogx__header-cell--checkbox')) return 'grid';
    return 'control';
}

/** Resolves the cell that holds `target` to a focus position, or `null` when it is not in a cell. */
export function focusedCellFromElement<T>(
    target: EventTarget | null,
    viewport: HTMLElement,
    rows: ReadonlyArray<T>,
    getRowId: (row: T) => GridRowId
): FocusedCell | null {
    if (!isElement(target)) return null;
    const cell = owningCell(target, viewport);
    const field = cell?.dataset.field;
    if (!cell || !field) return null;
    if (cell.getAttribute('role') === 'columnheader') {
        return cell.parentElement?.classList.contains('ogx__header') ? { id: null, field } : null;
    }
    const rowIndex = Number(cell.parentElement?.getAttribute('data-rowindex'));
    const row = Number.isInteger(rowIndex) ? rows[rowIndex] : undefined;
    return row ? { id: getRowId(row), field, rowIndex } : null;
}

function childWithField(parent: Element | null, field: string): HTMLElement | null {
    if (!parent) return null;
    for (const child of Array.from(parent.children)) {
        if ((child as HTMLElement).dataset.field === field) return child as HTMLElement;
    }
    return null;
}

/** The DOM element that should hold focus for `cell`, or `null` while it is not rendered. */
export function findFocusTarget(viewport: HTMLElement, cell: FocusedCell, rowIndex: number): HTMLElement | null {
    if (cell.id === null) {
        // The header sits in the sticky top block together with the top-pinned rows.
        const header = viewport.querySelector(':scope > .ogx__content > .ogx__sticky-top > .ogx__header-wrap > .ogx__header');
        const el = childWithField(header, cell.field);
        if (el && cell.field === CHECKBOX_FIELD) return el.querySelector('input') ?? el;
        return el;
    }
    if (rowIndex < 0) return null;
    const row = viewport.querySelector(
        `:scope > .ogx__content > .ogx__virtual-container > .ogx__rows > [data-rowindex="${rowIndex}"],` +
        `:scope > .ogx__content > .ogx__sticky-top > .ogx__pinned-rows > [data-rowindex="${rowIndex}"],` +
        `:scope > .ogx__content > .ogx__sticky-bottom > .ogx__pinned-rows > [data-rowindex="${rowIndex}"]`
    );
    return childWithField(row, cell.field);
}
