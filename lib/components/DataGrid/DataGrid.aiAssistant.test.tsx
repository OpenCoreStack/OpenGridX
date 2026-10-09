import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import { GridToolbar } from '../Toolbar/GridToolbar';
import { useGridApiRef } from '../../hooks/core/useGridApiRef';
import { validateGridAiState, createGridAiPromptHandler } from '../../ai';
import type { GridAiAssistantOptions, GridAiPromptContext, GridAiPromptResult, GridApi, GridColDef } from '../../types';

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

const firstColumnTexts = (container: HTMLElement) =>
    Array.from(container.querySelectorAll('.ogx__row:not(.ogx__row--group) [data-field="name"]')).map((c) => c.textContent);

function reply(json: unknown, message?: string): GridAiPromptResult {
    const result: GridAiPromptResult = validateGridAiState(json, columns);
    if (message) result.message = message;
    return result;
}

function Grid(props: Partial<React.ComponentProps<typeof DataGrid>> & { onApi?: (api: React.MutableRefObject<GridApi>) => void }) {
    const { onApi, ...rest } = props;
    const apiRef = useGridApiRef();
    onApi?.(apiRef);
    return <DataGrid rows={rows} columns={columns} height={400} apiRef={apiRef} slots={{ toolbar: GridToolbar }} {...rest} />;
}

/** The panel's status line (the live region repeats it). */
function statusOf(text: string) {
    const status = document.querySelector('.ogx-ai-panel__status');
    if (status?.textContent !== text) throw new Error(`status is "${status?.textContent}", expected "${text}"`);
    return status;
}

async function ask(prompt: string) {
    fireEvent.change(screen.getByRole('textbox', { name: 'Prompt' }), { target: { value: prompt } });
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }));
}

afterEach(() => {
    vi.restoreAllMocks();
    delete (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
});

describe('aiAssistant', () => {
    it('adds nothing without the prop', () => {
        const { container } = render(<Grid />);
        expect(screen.queryByRole('button', { name: 'Ask AI' })).toBeNull();
        expect(container.querySelector('.ogx-ai-anchor')).toBeNull();
    });

    it('opens from the toolbar, applies a validated reply with chips, and passes the context', async () => {
        const onPrompt = vi.fn(async (_prompt: string, _context: GridAiPromptContext) => reply({ sortModel: [{ field: 'amount', sort: 'desc' }], filterModel: { items: [{ field: 'region', operator: 'equals', value: 'North' }] } }, 'Biggest North orders first.'));
        const onApply = vi.fn();
        const onSort = vi.fn();
        const { container } = render(<Grid aiAssistant={{ onPrompt, suggestions: ['Top by amount'] }} onAiAssistantApply={onApply} onSortModelChange={onSort} />);
        const button = screen.getByRole('button', { name: 'Ask AI' });
        expect(button.getAttribute('aria-expanded')).toBe('false');
        fireEvent.click(button);
        const dialog = screen.getByRole('dialog', { name: 'Ask AI' });
        expect(button.getAttribute('aria-expanded')).toBe('true');
        expect(document.activeElement).toBe(within(dialog).getByRole('textbox', { name: 'Prompt' }));
        expect(within(dialog).getByRole('button', { name: 'Top by amount' })).toBeTruthy();

        await ask('north, biggest first');
        await waitFor(() => expect(statusOf('Applied 2 changes')).toBeTruthy());
        expect(onPrompt).toHaveBeenCalledTimes(1);
        const [prompt, context] = onPrompt.mock.calls[0];
        expect(prompt).toBe('north, biggest first');
        expect(context.currentState.sortModel).toEqual([]);
        expect(context.history).toEqual([]);
        expect(context.signal.aborted).toBe(false);

        expect(firstColumnTexts(container)).toEqual(['Cid', 'Ann']);
        expect(onSort).toHaveBeenCalledWith([{ field: 'amount', sort: 'desc' }]);
        expect(onApply).toHaveBeenCalledTimes(1);
        const chips = within(screen.getByRole('list', { name: 'Applied changes' })).getAllByRole('listitem').map((li) => li.querySelector('.ogx-ai-chip__label')?.textContent);
        expect(chips).toEqual(['Region equals North', 'Sort: Amount, descending']);
        expect(screen.getByText('Biggest North orders first.')).toBeTruthy();
        expect(container.querySelector('.ogx-aria-live-status')?.textContent).toContain('Applied 2 changes');
        // The session's prompts.
        expect(screen.getByRole('button', { name: 'north, biggest first' })).toBeTruthy();
    });

    it('removing a chip re-applies without it; Undo restores the state from before the reply', async () => {
        const onPrompt = vi.fn(async () => reply({ sortModel: [{ field: 'amount', sort: 'desc' }], filterModel: { items: [{ field: 'region', operator: 'equals', value: 'North' }] }, columnVisibilityModel: { region: false } }));
        const { container } = render(<Grid aiAssistant={{ onPrompt }} sortModel={undefined} initialState={{ sorting: { sortModel: [{ field: 'name', sort: 'desc' }] } }} />);
        expect(firstColumnTexts(container)).toEqual(['Cid', 'Bob', 'Ann']);
        fireEvent.click(screen.getByRole('button', { name: 'Ask AI' }));
        await ask('x');
        await waitFor(() => expect(statusOf('Applied 3 changes')).toBeTruthy());
        expect(firstColumnTexts(container)).toEqual(['Cid', 'Ann']);
        expect(container.querySelector('[role="columnheader"][data-field="region"]')).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Remove Region equals North' }));
        // The filter part is gone: back to no filter, the sort stays.
        expect(firstColumnTexts(container)).toEqual(['Bob', 'Cid', 'Ann']);
        expect(screen.queryByRole('button', { name: 'Remove Region equals North' })).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Remove Hide: Region' }));
        expect(container.querySelector('[data-field="region"]')).not.toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
        expect(firstColumnTexts(container)).toEqual(['Cid', 'Bob', 'Ann']);
        expect(screen.queryByRole('list', { name: 'Applied changes' })).toBeNull();
        expect(statusOf('Undone')).toBeTruthy();
    });

    it('does not apply an unbranded result, says so and warns', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const onError = vi.fn();
        const onSort = vi.fn();
        const onPrompt = vi.fn(async () => ({ state: { sortModel: [{ field: 'amount', sort: 'desc' as const }] }, errors: [] }));
        const { container } = render(<Grid aiAssistant={{ onPrompt }} onAiAssistantError={onError} onSortModelChange={onSort} />);
        fireEvent.click(screen.getByRole('button', { name: 'Ask AI' }));
        await ask('sort');
        await waitFor(() => expect(statusOf('The reply was not validated')).toBeTruthy());
        expect(onSort).not.toHaveBeenCalled();
        expect(firstColumnTexts(container)).toEqual(['Ann', 'Bob', 'Cid']);
        expect(onError).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls.some(([text]) => String(text).includes('not validated'))).toBe(true);
    });

    it('a copied state is not applied either', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const onPrompt = vi.fn(async () => {
            const r = reply({ sortModel: [{ field: 'amount', sort: 'desc' }] });
            return { ...r, state: { ...r.state } };
        });
        render(<Grid aiAssistant={{ onPrompt }} />);
        fireEvent.click(screen.getByRole('button', { name: 'Ask AI' }));
        await ask('sort');
        await waitFor(() => expect(statusOf('The reply was not validated')).toBeTruthy());
    });

    it('lists ignored errors, and drops parts outside `parts`', async () => {
        const onPrompt = vi.fn(async () => reply({ sortModel: [{ field: 'revnue', sort: 'asc' }], rowGroupingModel: ['region'] }));
        const onGrouping = vi.fn();
        render(<Grid aiAssistant={{ onPrompt, parts: ['sort', 'filter'] }} onRowGroupingModelChange={onGrouping} />);
        fireEvent.click(screen.getByRole('button', { name: 'Ask AI' }));
        await ask('x');
        await waitFor(() => expect(screen.getByText('Ignored: Unknown field "revnue"')).toBeTruthy());
        expect(screen.getByText('Ignored: Part not allowed')).toBeTruthy();
        expect(onGrouping).not.toHaveBeenCalled();
        expect(screen.getByText('No sorting')).toBeTruthy();
    });

    it('reports a failing onPrompt', async () => {
        const onError = vi.fn();
        render(<Grid aiAssistant={{ onPrompt: async () => { throw new Error('quota'); } }} onAiAssistantError={onError} />);
        fireEvent.click(screen.getByRole('button', { name: 'Ask AI' }));
        await ask('x');
        await waitFor(() => expect(statusOf('The assistant could not answer: quota')).toBeTruthy());
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'quota' }));
    });

    it('Stop aborts the signal; Escape closes and returns focus to the button', async () => {
        let signal: AbortSignal | null = null;
        const onPrompt: GridAiAssistantOptions['onPrompt'] = (_p, context) => {
            signal = context.signal;
            return new Promise(() => undefined);
        };
        render(<Grid aiAssistant={{ onPrompt }} />);
        const button = screen.getByRole('button', { name: 'Ask AI' });
        fireEvent.click(button);
        await ask('slow');
        expect(statusOf('Thinking…')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Stop' }));
        expect(signal!.aborted).toBe(true);
        expect(statusOf('Stopped')).toBeTruthy();

        fireEvent.keyDown(screen.getByRole('textbox', { name: 'Prompt' }), { key: 'Escape' });
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(document.activeElement).toBe(button);
    });

    it('works with createGridAiPromptHandler and apiRef.openAiAssistant without a toolbar', async () => {
        let api!: React.MutableRefObject<GridApi>;
        const callModel = vi.fn(async () => '```json\n{"rowGroupingModel":["region"]}\n```');
        const onPrompt = createGridAiPromptHandler({ columns, callModel });
        const { container } = render(<Grid slots={{}} onApi={(a) => { api = a; }} aiAssistant={{ onPrompt }} />);
        expect(screen.queryByRole('button', { name: 'Ask AI' })).toBeNull();
        act(() => api.current.openAiAssistant());
        await ask('group by region');
        await waitFor(() => expect(container.querySelectorAll('.ogx__row--group')).toHaveLength(2));
        act(() => api.current.closeAiAssistant());
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('hides the microphone without speech recognition and starts it only on click', () => {
        const { unmount } = render(<Grid aiAssistant={{ onPrompt: async () => reply({}) }} />);
        fireEvent.click(screen.getByRole('button', { name: 'Ask AI' }));
        expect(screen.queryByRole('button', { name: 'Dictate a prompt' })).toBeNull();
        unmount();

        const start = vi.fn();
        const created = vi.fn();
        class FakeRecognition {
            lang = '';
            interimResults = true;
            maxAlternatives = 0;
            onresult: ((event: { results: { transcript: string }[][] }) => void) | null = null;
            onend: (() => void) | null = null;
            onerror: (() => void) | null = null;
            constructor() { created(); }
            start() { start(); }
            stop() { this.onend?.(); }
            abort() { this.onend?.(); }
        }
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition = FakeRecognition;
        render(<Grid aiAssistant={{ onPrompt: async () => reply({}) }} />);
        fireEvent.click(screen.getByRole('button', { name: 'Ask AI' }));
        const mic = screen.getByRole('button', { name: 'Dictate a prompt' });
        expect(created).not.toHaveBeenCalled();
        fireEvent.click(mic);
        expect(start).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button', { name: 'Stop dictation' }).getAttribute('aria-pressed')).toBe('true');
    });

    it('voice: false hides the microphone', () => {
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition = class {};
        render(<Grid aiAssistant={{ onPrompt: async () => reply({}), voice: false }} />);
        fireEvent.click(screen.getByRole('button', { name: 'Ask AI' }));
        expect(screen.queryByRole('button', { name: 'Dictate a prompt' })).toBeNull();
    });

    it('slots.aiAssistantPanel replaces the panel', () => {
        function MyPanel(props: { placeholder: string; close: () => void }) {
            return <div role="dialog" aria-label="Mine">{props.placeholder}<button onClick={props.close}>Done</button></div>;
        }
        render(<Grid aiAssistant={{ onPrompt: async () => reply({}), placeholder: 'Type here' }} slots={{ toolbar: GridToolbar, aiAssistantPanel: MyPanel }} localeText={{ aiAssistantButton: 'Assistant' }} />);
        fireEvent.click(screen.getByRole('button', { name: 'Assistant' }));
        expect(screen.getByRole('dialog', { name: 'Mine' }).textContent).toContain('Type here');
        fireEvent.click(screen.getByRole('button', { name: 'Done' }));
        expect(screen.queryByRole('dialog')).toBeNull();
    });
});
