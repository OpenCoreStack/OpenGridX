import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useGridKeyboardNavigation } from './useGridKeyboardNavigation';

// Helper: build a minimal React.KeyboardEvent mock
function keyEvent(key: string): React.KeyboardEvent {
    return {
        key,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        nativeEvent: new KeyboardEvent('keydown', { key }),
        isDefaultPrevented: () => false,
        isPropagationStopped: () => false,
        persist: vi.fn(),
        bubbles: true,
        cancelable: true,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        timeStamp: 0,
        type: 'keydown',
        currentTarget: null,
        target: null,
        shiftKey: false,
        ctrlKey: false,
        metaKey: false,
        altKey: false,
    } as unknown as React.KeyboardEvent;
}

const ROWS = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Carol' },
];

const NAV_COLS = [
    { field: 'name' },
    { field: 'age' },
];

const MOCK_EDITING = {
    editingCell: null,
    startCellEdit: vi.fn(),
    stopCellEdit: vi.fn(),
};

const MOCK_VIRTUALIZATION = {
    cumulativeHeights: [52, 104, 156],
    pinnedTopHeight: 0,
    columnMetrics: null,
};

const BASE_PARAMS = {
    allRenderableRows: ROWS,
    navigationColumns: NAV_COLS,
    checkboxSelection: false,
    selectedRowIds: new Set<number | string>(),
    handleSelectionChange: vi.fn(),
    handleDetailPanelToggle: vi.fn(),
    editingHandlers: MOCK_EDITING,
    setKeyboardMode: vi.fn(),
    sortModel: [],
    handleSort: vi.fn(),
    isCellEditable: undefined,
    pagination: false,
    pageSize: 100,
    virtualization: MOCK_VIRTUALIZATION,
    viewportRef: { current: null } as React.RefObject<HTMLDivElement | null>,
};

describe('useGridKeyboardNavigation — arrow keys', () => {
    it('ArrowDown moves focusedCell to the next row', () => {
        const { result } = renderHook(() => useGridKeyboardNavigation(BASE_PARAMS));
        act(() => { result.current.setFocusedCell({ id: 1, field: 'name' }); });
        act(() => { result.current.handleKeyDown(keyEvent('ArrowDown')); });
        expect(result.current.focusedCell).toEqual({ id: 2, field: 'name' });
    });

    it('ArrowUp at header row does not move above it', () => {
        const { result } = renderHook(() => useGridKeyboardNavigation(BASE_PARAMS));
        // HEADER is the topmost position; ArrowUp from there should not move
        act(() => { result.current.setFocusedCell({ id: 'HEADER', field: 'name' }); });
        act(() => { result.current.handleKeyDown(keyEvent('ArrowUp')); });
        expect(result.current.focusedCell?.id).toBe('HEADER');
    });

    it('ArrowDown at last row — no change', () => {
        const { result } = renderHook(() => useGridKeyboardNavigation(BASE_PARAMS));
        // ROWS has 3 entries; last row id is 3
        const lastRow = ROWS[ROWS.length - 1];
        act(() => { result.current.setFocusedCell({ id: lastRow.id, field: 'name' }); });
        act(() => { result.current.handleKeyDown(keyEvent('ArrowDown')); });
        expect(result.current.focusedCell?.id).toBe(lastRow.id);
    });

    it('ArrowRight moves focusedCell to next column', () => {
        const { result } = renderHook(() => useGridKeyboardNavigation(BASE_PARAMS));
        act(() => { result.current.setFocusedCell({ id: 1, field: 'name' }); });
        act(() => { result.current.handleKeyDown(keyEvent('ArrowRight')); });
        expect(result.current.focusedCell?.field).toBe('age');
    });

    it('ArrowLeft at header first column does not move left', () => {
        const { result } = renderHook(() => useGridKeyboardNavigation(BASE_PARAMS));
        // HEADER + first col is the leftmost position; wrap-left would require r=-2 which is out of bounds
        act(() => { result.current.setFocusedCell({ id: 'HEADER', field: 'name' }); });
        act(() => { result.current.handleKeyDown(keyEvent('ArrowLeft')); });
        expect(result.current.focusedCell?.field).toBe('name');
    });
});

describe('useGridKeyboardNavigation — Home / End', () => {
    it('Home moves to first column', () => {
        const { result } = renderHook(() => useGridKeyboardNavigation(BASE_PARAMS));
        act(() => { result.current.setFocusedCell({ id: 1, field: 'age' }); });
        act(() => { result.current.handleKeyDown(keyEvent('Home')); });
        expect(result.current.focusedCell?.field).toBe('name');
    });

    it('End moves to last column', () => {
        const { result } = renderHook(() => useGridKeyboardNavigation(BASE_PARAMS));
        act(() => { result.current.setFocusedCell({ id: 1, field: 'name' }); });
        act(() => { result.current.handleKeyDown(keyEvent('End')); });
        expect(result.current.focusedCell?.field).toBe('age');
    });
});

describe('useGridKeyboardNavigation — editing', () => {
    it('Enter calls startCellEdit on an editable cell', () => {
        const startCellEdit = vi.fn();
        const params = {
            ...BASE_PARAMS,
            editingHandlers: { ...MOCK_EDITING, startCellEdit },
            navigationColumns: [{ field: 'name', editable: true }],
        };
        const { result } = renderHook(() => useGridKeyboardNavigation(params));
        act(() => { result.current.setFocusedCell({ id: 1, field: 'name' }); });
        act(() => { result.current.handleKeyDown(keyEvent('Enter')); });
        expect(startCellEdit).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1, field: 'name' })
        );
    });

    it('Escape calls stopCellEdit with cancel=true when editing', () => {
        const stopCellEdit = vi.fn();
        const params = {
            ...BASE_PARAMS,
            editingHandlers: {
                editingCell: { id: 1, field: 'name', value: 'Alice' },
                startCellEdit: vi.fn(),
                stopCellEdit,
            },
        };
        const { result } = renderHook(() => useGridKeyboardNavigation(params));
        act(() => { result.current.setFocusedCell({ id: 1, field: 'name' }); });
        act(() => { result.current.handleKeyDown(keyEvent('Escape')); });
        expect(stopCellEdit).toHaveBeenCalledWith({ cancel: true });
    });
});

describe('useGridKeyboardNavigation — selection', () => {
    it('Space toggles checkbox selection on focused row', () => {
        const handleSelectionChange = vi.fn();
        const { result } = renderHook(() => useGridKeyboardNavigation({
            ...BASE_PARAMS,
            checkboxSelection: true,
            handleSelectionChange,
        }));
        // Space only fires handleSelectionChange when field === '__checkbox_col__'
        act(() => { result.current.setFocusedCell({ id: 2, field: '__checkbox_col__' }); });
        act(() => { result.current.handleKeyDown(keyEvent(' ')); });
        expect(handleSelectionChange).toHaveBeenCalledWith(2, true);
    });
});
