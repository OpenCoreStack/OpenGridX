import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { DataGrid } from './DataGrid';
import { GridToolbar } from '../Toolbar/GridToolbar';
import { validateGridAiState } from '../../ai';
import type { GridAiAssistantOptions, GridAiPromptResult, GridColDef } from '../../types';
import '../../styles/opengridx.css';

// Real engines: focus on open and close, Enter in the input, clicks on chips, and the panel's place
// under the toolbar.

afterEach(() => {
    cleanup();
});

const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 120 },
    { field: 'region', headerName: 'Region', width: 120 },
    { field: 'amount', headerName: 'Amount', type: 'number', width: 120 },
];
const rows = [
    { id: 1, name: 'Ann', region: 'North', amount: 10 },
    { id: 2, name: 'Bob', region: 'South', amount: 30 },
    { id: 3, name: 'Cid', region: 'North', amount: 20 },
];

/** A mock model: always North, biggest first. */
const onPrompt: GridAiAssistantOptions['onPrompt'] = async () => validateGridAiState({
    filterModel: { items: [{ field: 'region', operator: 'equals', value: 'North' }] },
    sortModel: [{ field: 'amount', sort: 'desc' }],
}, columns) as GridAiPromptResult;

const names = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('.ogx__row [data-field="name"]')).map((c) => c.textContent);

function renderGrid(options: GridAiAssistantOptions) {
    return render(
        <div style={{ width: 600 }}>
            <DataGrid rows={rows} columns={columns} height={420} slots={{ toolbar: GridToolbar }} aiAssistant={options} />
        </div>,
    );
}

function prompt(): HTMLInputElement {
    const input = document.querySelector<HTMLInputElement>('.ogx-ai-panel input');
    if (!input) throw new Error('no prompt input');
    return input;
}

describe('aiAssistant panel (browser)', () => {
    it('opens under the toolbar, applies a reply, removes a chip, undoes, and Escape returns focus', async () => {
        const { container, getByRole, queryByRole } = renderGrid({ onPrompt, suggestions: ['North, biggest first'] });
        const button = getByRole('button', { name: 'Ask AI' });
        await userEvent.click(button);
        const dialog = getByRole('dialog', { name: 'Ask AI' });
        await waitFor(() => expect(document.activeElement).toBe(prompt()));

        // Under the toolbar, inside the grid.
        const toolbar = container.querySelector('.ogx-toolbar')!.getBoundingClientRect();
        const panel = dialog.getBoundingClientRect();
        const grid = container.querySelector('.ogx')!.getBoundingClientRect();
        expect(panel.top).toBeGreaterThanOrEqual(toolbar.bottom - 1);
        expect(panel.right).toBeLessThanOrEqual(grid.right + 1);
        expect(panel.height).toBeGreaterThan(0);

        await userEvent.fill(prompt(), 'north, biggest first');
        await userEvent.keyboard('{Enter}');
        await waitFor(() => expect(names(container)).toEqual(['Cid', 'Ann']));
        const chips = () => Array.from(dialog.querySelectorAll('.ogx-ai-chip__label')).map((c) => c.textContent);
        expect(chips()).toEqual(['Region equals North', 'Sort: Amount, descending']);

        await userEvent.click(getByRole('button', { name: 'Remove Region equals North' }));
        await waitFor(() => expect(names(container)).toEqual(['Bob', 'Cid', 'Ann']));
        expect(chips()).toEqual(['Sort: Amount, descending']);

        await userEvent.click(getByRole('button', { name: 'Undo' }));
        await waitFor(() => expect(names(container)).toEqual(['Ann', 'Bob', 'Cid']));
        expect(chips()).toEqual([]);

        // A suggestion chip sends its prompt.
        await userEvent.click(getByRole('button', { name: 'North, biggest first' }));
        await waitFor(() => expect(names(container)).toEqual(['Cid', 'Ann']));

        prompt().focus();
        await userEvent.keyboard('{Escape}');
        expect(queryByRole('dialog')).toBeNull();
        expect(document.activeElement).toBe(button);
        expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('Stop aborts the running request', async () => {
        let signal: AbortSignal | null = null;
        let calls = 0;
        const slow: GridAiAssistantOptions['onPrompt'] = (_p, context) => {
            signal = context.signal;
            calls += 1;
            return new Promise((_, reject) => {
                context.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
            });
        };
        const { container, getByRole } = renderGrid({ onPrompt: slow });
        await userEvent.click(getByRole('button', { name: 'Ask AI' }));
        await userEvent.fill(prompt(), 'anything');
        await userEvent.keyboard('{Enter}');
        await waitFor(() => expect(container.querySelector('.ogx-ai-panel__status')?.textContent).toBe('Thinking…'));
        await userEvent.click(getByRole('button', { name: 'Stop' }));
        await waitFor(() => expect(container.querySelector('.ogx-ai-panel__status')?.textContent).toBe('Stopped'));
        expect(signal!.aborted).toBe(true);
        // The click on Stop does not send the prompt again.
        expect(calls).toBe(1);
        expect(document.activeElement).toBe(prompt());
        expect(names(container)).toEqual(['Ann', 'Bob', 'Cid']);
    });
});
