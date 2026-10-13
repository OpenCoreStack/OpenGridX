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
});
