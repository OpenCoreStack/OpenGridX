import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import type React from 'react';
import type { GridApi, GridColDef } from '../../types';

// On Apple platforms Ctrl+click opens the context menu, so a Ctrl+left press inside the cell range
// keeps the range (no focus move, no range drag) as a right press does. Elsewhere Ctrl+click is a
// selection gesture and is left alone. The platform is read once when the module loads, so each
// case loads the grid afresh with a stubbed `navigator.platform`.

type Row = { id: number; name: string; age: number };
const ROWS: Row[] = [{ id: 1, name: 'a', age: 1 }, { id: 2, name: 'b', age: 2 }, { id: 3, name: 'c', age: 3 }];
const COLS: GridColDef<Row>[] = [{ field: 'name', width: 100 }, { field: 'age', type: 'number', width: 100 }];

const realPlatform = Object.getOwnPropertyDescriptor(Navigator.prototype, 'platform');
afterEach(() => {
    cleanup();
    if (realPlatform) Object.defineProperty(navigator, 'platform', realPlatform);
    vi.resetModules();
});

async function setup(platform: string) {
    Object.defineProperty(navigator, 'platform', { value: platform, configurable: true });
    vi.resetModules();
    const { DataGrid } = await import('./DataGrid');
    const { useGridApiRef } = await import('../../hooks/core/useGridApiRef');
    const holder: { api: React.MutableRefObject<GridApi> | null } = { api: null };
    function Harness() {
        const apiRef = useGridApiRef();
        holder.api = apiRef;
        return <DataGrid<Row> rows={ROWS} columns={COLS} apiRef={apiRef} height={400} contextMenu cellSelection />;
    }
    const { container } = render(<Harness />);
    act(() => {
        holder.api!.current.setCellSelectionModel([{ anchor: { id: 1, field: 'name' }, head: { id: 2, field: 'age' } }]);
    });
    const cell = (rowIndex: number, field: string) =>
        container.querySelector(`[role="row"][data-rowindex="${rowIndex}"] [data-field="${field}"]`) as HTMLElement;
    /** Fires mousedown; true when the grid suppressed its default. */
    const press = (el: Element, init: MouseEventInit) => !fireEvent.mouseDown(el, init);
    return { cell, press };
}

describe('context menu press inside a cell range', () => {
    it('on an Apple platform a Ctrl+left press inside the range is a menu press', async () => {
        const { cell, press } = await setup('MacIntel');
        expect(press(cell(1, 'age'), { button: 0, ctrlKey: true })).toBe(true);
        expect(press(cell(1, 'age'), { button: 2 })).toBe(true);
        // A plain left press and a press outside the range are untouched.
        expect(press(cell(1, 'age'), { button: 0 })).toBe(false);
        expect(press(cell(2, 'age'), { button: 0, ctrlKey: true })).toBe(false);
    });

    it('elsewhere a Ctrl+left press is left to selection; a right press still keeps the range', async () => {
        const { cell, press } = await setup('Win32');
        expect(press(cell(1, 'age'), { button: 0, ctrlKey: true })).toBe(false);
        expect(press(cell(1, 'age'), { button: 2 })).toBe(true);
    });
});
