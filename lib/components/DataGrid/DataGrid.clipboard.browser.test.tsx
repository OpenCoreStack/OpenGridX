import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { DataGrid } from '../../index';
import type { GridColDef } from '../../types';

// Real Chromium: real focus and a real document.execCommand('copy').

type Row = { id: number; name: string };
const ROWS: Row[] = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
const COLS: GridColDef<Row>[] = [{ field: 'name', headerName: 'Name' }];

afterEach(() => {
    cleanup();
    // Drop the own property so Navigator.prototype's clipboard getter applies again.
    Reflect.deleteProperty(navigator, 'clipboard');
});

const cellByText = (c: HTMLElement, text: string) =>
    Array.from(c.querySelectorAll<HTMLElement>('[role="gridcell"]')).find(el => el.textContent === text) ?? null;

const activeText = () => (document.activeElement as HTMLElement | null)?.textContent ?? '';

describe('copy fallback and focus', () => {
    it('keeps focus on the grid cell after the execCommand fallback, so arrow keys still move', async () => {
        // No async Clipboard API (as on plain http): the textarea fallback runs.
        Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true, writable: true });
        const { container } = render(
            <div style={{ height: 300, width: 400, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, minHeight: 0 }}>
                    <DataGrid rows={ROWS} columns={COLS} height="100%" />
                </div>
            </div>
        );
        await expect.poll(() => cellByText(container, 'Alice')).not.toBeNull();
        await userEvent.click(cellByText(container, 'Alice')!);
        await expect.poll(activeText).toBe('Alice');
        const focused = document.activeElement;

        await userEvent.keyboard('{Control>}c{/Control}');
        expect(document.activeElement).toBe(focused);
        expect(document.querySelectorAll('body > textarea')).toHaveLength(0);

        await userEvent.keyboard('{ArrowDown}');
        await expect.poll(activeText).toBe('Bob');
    });
});
