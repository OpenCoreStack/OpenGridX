import { describe, it, expect, vi } from 'vitest';
import type React from 'react';
import { handleGridKeyDown, type GridKeyDownContext } from './gridKeyDown';
import type { FocusedCell } from '../../utils/focus';

// handleGridKeyDown is a plain function over an explicit context (R6, 3.10), so key handling can be
// tested without rendering a grid.

type Row = { id: number; name: string };
const rows: Row[] = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }, { id: 3, name: 'c' }];

function context(overrides: Partial<GridKeyDownContext<Row>> = {}): GridKeyDownContext<Row> {
    const focusedCell: FocusedCell = { id: 1, field: 'name' };
    return {
        allRenderableRows: rows,
        navigationColumns: [{ field: 'name' }],
        editingHandlers: { editingCell: null, startCellEdit: vi.fn(), stopCellEdit: vi.fn() },
        selectedRowIds: new Set(),
        handleSelectionChange: vi.fn(),
        handleDetailPanelToggle: vi.fn(),
        setKeyboardMode: vi.fn(),
        sortModel: [],
        handleSort: vi.fn(),
        pagination: false,
        pageSize: 25,
        multiSort: false,
        rowSelectionEnabled: true,
        multipleRowSelectionEnabled: true,
        headerFilters: false,
        getRowId: r => r.id,
        focusedCell,
        focusedRowIndex: 0,
        getDefaultFocus: () => focusedCell,
        scrollCellIntoView: vi.fn(),
        setFocusedCell: vi.fn(),
        ...overrides,
    } as GridKeyDownContext<Row>;
}

function keyEvent(key: string, init: Partial<React.KeyboardEvent> = {}): React.KeyboardEvent {
    const viewport = document.createElement('div');
    viewport.setAttribute('role', 'grid');
    document.body.appendChild(viewport);
    return {
        key, target: viewport, currentTarget: viewport, keyCode: 0, shiftKey: false, ctrlKey: false, metaKey: false, altKey: false,
        nativeEvent: { isComposing: false } as KeyboardEvent,
        preventDefault: vi.fn(), stopPropagation: vi.fn(),
        ...init,
    } as unknown as React.KeyboardEvent;
}

describe('handleGridKeyDown', () => {
    it('ArrowDown moves focus to the next row and scrolls it into view', () => {
        const ctx = context();
        const event = keyEvent('ArrowDown');
        handleGridKeyDown(event, ctx);
        expect(ctx.setFocusedCell).toHaveBeenCalledWith({ id: 2, field: 'name', rowIndex: 1 });
        expect(ctx.scrollCellIntoView).toHaveBeenCalledWith(1, 'name');
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('ArrowUp on the first row moves to the column header', () => {
        const ctx = context();
        handleGridKeyDown(keyEvent('ArrowUp'), ctx);
        expect(ctx.setFocusedCell).toHaveBeenCalledWith({ id: null, field: 'name' });
    });

    it('ignores keys while an IME is composing', () => {
        const ctx = context();
        handleGridKeyDown(keyEvent('ArrowDown', { nativeEvent: { isComposing: true } as KeyboardEvent }), ctx);
        expect(ctx.setFocusedCell).not.toHaveBeenCalled();
    });

    describe('context menu keys', () => {
        it.each([
            ['Shift+F10', keyEvent('F10', { shiftKey: true })],
            ['ContextMenu', keyEvent('ContextMenu')],
        ])('%s on a body cell opens the menu there', (_, event) => {
            const openContextMenuAt = vi.fn();
            handleGridKeyDown(event, context({ openContextMenuAt }));
            expect(openContextMenuAt).toHaveBeenCalledWith({ id: 1, field: 'name' });
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it.each([
            ['header', { id: null, field: 'name' }],
            ['header filter', { id: null, field: 'name', headerFilter: true }],
        ] as const)('does nothing on a %s cell', (_, focusedCell) => {
            const openContextMenuAt = vi.fn();
            const event = keyEvent('ContextMenu');
            handleGridKeyDown(event, context({ openContextMenuAt, focusedCell, headerFilters: true }));
            expect(openContextMenuAt).not.toHaveBeenCalled();
            expect(event.preventDefault).not.toHaveBeenCalled();
        });

        it('does nothing without openContextMenuAt (contextMenu off)', () => {
            const event = keyEvent('F10', { shiftKey: true });
            const ctx = context();
            handleGridKeyDown(event, ctx);
            expect(event.preventDefault).not.toHaveBeenCalled();
            expect(ctx.setFocusedCell).not.toHaveBeenCalled();
        });
    });
});
