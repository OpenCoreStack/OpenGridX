import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGridClipboard } from './useGridClipboard';
import type { GridColDef, GridRowId, GridRowModel } from '../../types';

type Params = Parameters<typeof useGridClipboard>[0];

const ROWS: GridRowModel[] = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 40 },
    { id: 3, name: 'Carol', age: 50 },
];

const COLUMNS: GridColDef[] = [
    { field: 'name', headerName: 'Name' },
    { field: 'age', headerName: 'Age' },
];

const defaultGetRowId = (row: GridRowModel): GridRowId => row.id;

function makeParams(overrides: Partial<Params> = {}): Params {
    return {
        getSelectedRowIds: () => new Set<GridRowId>(),
        getColumns: () => COLUMNS,
        getRows: () => ROWS,
        getRowId: defaultGetRowId,
        ...overrides,
    };
}

let writeText: ReturnType<typeof vi.fn<(text: string) => Promise<void>>>;

function setClipboard(value: unknown): void {
    Object.defineProperty(navigator, 'clipboard', { value, configurable: true, writable: true });
}

function setExecCommand(impl: ((command: string) => boolean) | undefined): void {
    Object.defineProperty(document, 'execCommand', { value: impl, configurable: true, writable: true });
}

function copiedText(): string {
    expect(writeText).toHaveBeenCalledTimes(1);
    return writeText.mock.calls[0][0];
}

async function flush(): Promise<void> {
    await act(async () => {
        await Promise.resolve();
    });
}

function pressCtrlC(init: KeyboardEventInit = {}): void {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true, ...init }));
}

beforeEach(() => {
    writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
    setClipboard({ writeText });
    // jsdom has no working execCommand; default to "fallback unavailable".
    setExecCommand(undefined);
});

afterEach(() => {
    setClipboard(undefined);
    setExecCommand(undefined);
    vi.restoreAllMocks();
    document.body.innerHTML = '';
});

describe('useGridClipboard — copySelectedRows content', () => {
    it('does nothing when no rows are selected', async () => {
        const { result } = renderHook(() => useGridClipboard(makeParams()));
        await act(async () => { await result.current.copySelectedRows(); });
        expect(writeText).not.toHaveBeenCalled();
    });

    it('does nothing when none of the selected ids are in the visible rows', async () => {
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([99]) }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(writeText).not.toHaveBeenCalled();
    });

    it('copies a header row followed by the selected rows as TSV', async () => {
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1, 3]) }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nAlice\t30\nCarol\t50');
    });

    it('orders copied rows by visible-row order, not selection order', async () => {
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([3, 1]) }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nAlice\t30\nCarol\t50');
    });

    it('follows the column array order', async () => {
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                getSelectedRowIds: () => new Set<GridRowId>([2]),
                getColumns: () => [COLUMNS[1], COLUMNS[0]],
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Age\tName\n40\tBob');
    });

    it('falls back to the field name when headerName is missing or empty', async () => {
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                getSelectedRowIds: () => new Set<GridRowId>([1]),
                getColumns: () => [{ field: 'name' }, { field: 'age', headerName: '' }],
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('name\tage\nAlice\t30');
    });

    it('excludes system columns and exportable: false columns', async () => {
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                getSelectedRowIds: () => new Set<GridRowId>([1]),
                getColumns: () => [
                    { field: '__checkbox_col__' },
                    { field: '__group__', headerName: 'Group', exportable: false },
                    ...COLUMNS,
                    { field: 'actions', headerName: 'Actions', exportable: false },
                ],
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nAlice\t30');
    });

    it('keeps a consumer column whose field starts with "__"', async () => {
        const rows: GridRowModel[] = [{ id: 1, __typename: 'User', name: 'Alice', age: 30 }];
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                getSelectedRowIds: () => new Set<GridRowId>([1]),
                getRows: () => rows,
                getColumns: () => [{ field: '__typename', headerName: 'Type' }, ...COLUMNS],
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Type\tName\tAge\nUser\tAlice\t30');
    });

    it('applies valueGetter before valueFormatter', async () => {
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                getSelectedRowIds: () => new Set<GridRowId>([1]),
                getColumns: () => [
                    ...COLUMNS,
                    {
                        field: 'label',
                        headerName: 'Label',
                        valueGetter: ({ row }) => `${String(row.name)}-${String(row.age)}`,
                        valueFormatter: ({ value }) => `[${String(value)}]`,
                    },
                ],
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\tLabel\nAlice\t30\t[Alice-30]');
    });

    it('quotes fields holding a tab, line break or double quote, doubling inner quotes', async () => {
        const rows: GridRowModel[] = [{ id: 1, name: 'A\tB', age: 'say "hi"', note: 'line1\nline2' }];
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                getSelectedRowIds: () => new Set<GridRowId>([1]),
                getRows: () => rows,
                getColumns: () => [...COLUMNS, { field: 'note', headerName: 'Note\r' }],
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\t"Note\r"\n"A\tB"\t"say ""hi"""\t"line1\nline2"');
    });

    it('applies valueFormatter with value, row and field', async () => {
        const valueFormatter = vi.fn(({ value }: { value: unknown }) => `${String(value)} yrs`);
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                getSelectedRowIds: () => new Set<GridRowId>([2]),
                getColumns: () => [COLUMNS[0], { ...COLUMNS[1], valueFormatter }],
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nBob\t40 yrs');
        expect(valueFormatter).toHaveBeenCalledWith({ value: 40, row: ROWS[1], field: 'age' });
    });

    it('writes an empty cell for null and undefined values', async () => {
        const rows: GridRowModel[] = [{ id: 1, name: null, age: undefined }];
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                getSelectedRowIds: () => new Set<GridRowId>([1]),
                getRows: () => rows,
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\n\t');
    });

    it('keeps falsy but meaningful values (0, false, negative numbers)', async () => {
        const rows: GridRowModel[] = [{ id: 1, name: false, age: 0 }, { id: 2, name: 'x', age: -5 }];
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                getSelectedRowIds: () => new Set<GridRowId>([1, 2]),
                getRows: () => rows,
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nfalse\t0\nx\t-5');
    });

    it('matches rows through the supplied getRowId', async () => {
        const rows: GridRowModel[] = [
            { id: 1, sku: 'A-1', name: 'Alpha', age: 1 },
            { id: 2, sku: 'B-2', name: 'Beta', age: 2 },
        ];
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                getSelectedRowIds: () => new Set<GridRowId>(['B-2']),
                getRows: () => rows,
                getRowId: (row) => row.sku as GridRowId,
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nBeta\t2');
    });

    it('supports a row whose id is 0', async () => {
        const rows: GridRowModel[] = [{ id: 0, name: 'Zero', age: 0 }];
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                getSelectedRowIds: () => new Set<GridRowId>([0]),
                getRows: () => rows,
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nZero\t0');
    });

    it('compares ids strictly (string "1" does not select numeric id 1)', async () => {
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({ getSelectedRowIds: () => new Set<GridRowId>(['1']) }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(writeText).not.toHaveBeenCalled();
    });

    it('reads visible rows lazily at copy time', async () => {
        let rows: GridRowModel[] = [];
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                getSelectedRowIds: () => new Set<GridRowId>([1]),
                getRows: () => rows,
            }))
        );
        rows = [{ id: 1, name: 'Late', age: 7 }];
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nLate\t7');
    });

    it('uses the latest props after a rerender', async () => {
        const { result, rerender } = renderHook((p: Params) => useGridClipboard(p), {
            initialProps: makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1]) }),
        });
        rerender(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([2]) }));
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nBob\t40');
    });
});

describe('useGridClipboard — clipboard write strategy', () => {
    const selectOne = () => makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1]) });

    it('rejects when navigator.clipboard.writeText rejects and the fallback fails', async () => {
        writeText.mockImplementation(() => Promise.reject(new Error('denied')));
        const { result } = renderHook(() => useGridClipboard(selectOne()));
        await act(async () => {
            await expect(result.current.copySelectedRows()).rejects.toThrow('denied');
        });
    });

    it('resolves when writeText rejects but the execCommand fallback succeeds', async () => {
        writeText.mockImplementation(() => Promise.reject(new Error('denied')));
        const execCommand = vi.fn(() => true);
        setExecCommand(execCommand);
        const { result } = renderHook(() => useGridClipboard(selectOne()));
        await act(async () => {
            await expect(result.current.copySelectedRows()).resolves.toBeUndefined();
        });
        expect(execCommand).toHaveBeenCalledWith('copy');
    });

    it('uses the Clipboard API alone when it is available', async () => {
        const execCommand = vi.fn(() => true);
        setExecCommand(execCommand);
        const { result } = renderHook(() => useGridClipboard(selectOne()));
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nAlice\t30');
        expect(execCommand).not.toHaveBeenCalled();
    });

    it('uses the execCommand fallback when the Clipboard API is absent', async () => {
        setClipboard(undefined);
        let copiedValue = '';
        const execCommand = vi.fn(() => {
            const el = document.activeElement;
            if (el instanceof HTMLTextAreaElement) copiedValue = el.value;
            return true;
        });
        setExecCommand(execCommand);
        const { result } = renderHook(() => useGridClipboard(selectOne()));
        await act(async () => { await result.current.copySelectedRows(); });
        expect(execCommand).toHaveBeenCalledWith('copy');
        expect(copiedValue).toBe('Name\tAge\nAlice\t30');
    });

    it('gives focus back to the element that had it after the fallback copy', async () => {
        setClipboard(undefined);
        setExecCommand(() => true);
        const button = document.createElement('button');
        document.body.appendChild(button);
        button.focus();
        const { result } = renderHook(() => useGridClipboard(selectOne()));
        await act(async () => { await result.current.copySelectedRows(); });
        expect(document.activeElement).toBe(button);
    });

    it('removes the temporary textarea after the fallback copy', async () => {
        setClipboard(undefined);
        setExecCommand(() => true);
        const { result } = renderHook(() => useGridClipboard(selectOne()));
        await act(async () => { await result.current.copySelectedRows(); });
        expect(document.querySelectorAll('textarea')).toHaveLength(0);
    });

    it('removes the temporary textarea and restores focus even when execCommand throws', async () => {
        setClipboard(undefined);
        setExecCommand(() => { throw new Error('boom'); });
        const button = document.createElement('button');
        document.body.appendChild(button);
        button.focus();
        const { result } = renderHook(() => useGridClipboard(selectOne()));
        await act(async () => {
            await expect(result.current.copySelectedRows()).rejects.toThrow('boom');
        });
        expect(document.querySelectorAll('textarea')).toHaveLength(0);
        expect(document.activeElement).toBe(button);
    });

    it('rejects when neither the Clipboard API nor the fallback is available', async () => {
        setClipboard(undefined);
        setExecCommand(() => false);
        const { result } = renderHook(() => useGridClipboard(selectOne()));
        await act(async () => {
            await expect(result.current.copySelectedRows()).rejects.toThrow('Clipboard API not available and fallback failed.');
        });
    });

    it('treats a clipboard object without writeText as unavailable', async () => {
        setClipboard({});
        setExecCommand(() => false);
        const { result } = renderHook(() => useGridClipboard(selectOne()));
        await act(async () => {
            await expect(result.current.copySelectedRows()).rejects.toThrow();
        });
    });

    it('logs instead of rejecting when the Ctrl+C copy fails', async () => {
        writeText.mockImplementation(() => Promise.reject(new Error('denied')));
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        renderHook(() => useGridClipboard(selectOne()));
        pressCtrlC();
        await flush();
        expect(consoleError).toHaveBeenCalledWith('[OpenGridX] Failed to copy to clipboard:', expect.any(Error));
    });
});

describe('useGridClipboard — keyboard shortcut', () => {
    it('copies on Ctrl+C', async () => {
        renderHook(() => useGridClipboard(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1]) })));
        pressCtrlC();
        await flush();
        expect(copiedText()).toBe('Name\tAge\nAlice\t30');
    });

    it('copies on Cmd+C (metaKey)', async () => {
        renderHook(() => useGridClipboard(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1]) })));
        pressCtrlC({ ctrlKey: false, metaKey: true });
        await flush();
        expect(writeText).toHaveBeenCalledTimes(1);
    });

    it.each([
        ['Caps Lock (key "C")', { key: 'C' }],
        ['a Cyrillic layout (key "с" on KeyC)', { key: 'с', code: 'KeyC' }],
    ])('copies on Ctrl+C with %s', async (_label, init) => {
        renderHook(() => useGridClipboard(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1]) })));
        pressCtrlC(init);
        await flush();
        expect(writeText).toHaveBeenCalledTimes(1);
    });

    it('ignores Ctrl+Shift+C, Ctrl+Alt+C and a Latin letter on KeyC (Dvorak "j")', async () => {
        renderHook(() => useGridClipboard(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1]) })));
        pressCtrlC({ key: 'C', shiftKey: true });
        pressCtrlC({ altKey: true });
        pressCtrlC({ key: 'j', code: 'KeyC' });
        await flush();
        expect(writeText).not.toHaveBeenCalled();
    });

    it('leaves a Ctrl+C that another handler already handled (defaultPrevented)', async () => {
        renderHook(() => useGridClipboard(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1]) })));
        const event = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true, bubbles: true, cancelable: true });
        event.preventDefault();
        window.dispatchEvent(event);
        await flush();
        expect(writeText).not.toHaveBeenCalled();
    });

    it('does not listen for Ctrl+C with disableKeyboardShortcut, while copySelectedRows still works', async () => {
        const { result } = renderHook(() => useGridClipboard(makeParams({
            getSelectedRowIds: () => new Set<GridRowId>([1]),
            disableKeyboardShortcut: true,
        })));
        pressCtrlC();
        await flush();
        expect(writeText).not.toHaveBeenCalled();
        await act(async () => { await result.current.copySelectedRows(); });
        expect(writeText).toHaveBeenCalledTimes(1);
    });

    it('ignores plain "c" and other Ctrl shortcuts', async () => {
        renderHook(() => useGridClipboard(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1]) })));
        pressCtrlC({ ctrlKey: false });
        pressCtrlC({ key: 'v' });
        pressCtrlC({ key: 'x' });
        await flush();
        expect(writeText).not.toHaveBeenCalled();
    });

    it('does nothing on Ctrl+C when nothing is selected', async () => {
        renderHook(() => useGridClipboard(makeParams()));
        pressCtrlC();
        await flush();
        expect(writeText).not.toHaveBeenCalled();
    });

    it.each(['text', 'number', 'search', 'email'])('does not intercept Ctrl+C inside an <input type="%s">', async (type) => {
        renderHook(() => useGridClipboard(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1]) })));
        const input = document.createElement('input');
        input.type = type;
        document.body.appendChild(input);
        input.focus();
        pressCtrlC();
        await flush();
        expect(writeText).not.toHaveBeenCalled();
    });

    it('does not intercept Ctrl+C inside a textarea or select', async () => {
        renderHook(() => useGridClipboard(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1]) })));
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.focus();
        pressCtrlC();
        const select = document.createElement('select');
        document.body.appendChild(select);
        select.focus();
        pressCtrlC();
        await flush();
        expect(writeText).not.toHaveBeenCalled();
    });

    it('does not intercept Ctrl+C in a contentEditable element', async () => {
        renderHook(() => useGridClipboard(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1]) })));
        const div = document.createElement('div');
        div.tabIndex = 0;
        Object.defineProperty(div, 'isContentEditable', { value: true });
        document.body.appendChild(div);
        div.focus();
        pressCtrlC();
        await flush();
        expect(writeText).not.toHaveBeenCalled();
    });

    it.each(['checkbox', 'radio'])('still copies when an <input type="%s"> (row checkbox) has focus', async (type) => {
        renderHook(() => useGridClipboard(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1]) })));
        const input = document.createElement('input');
        input.type = type;
        document.body.appendChild(input);
        input.focus();
        pressCtrlC();
        await flush();
        expect(writeText).toHaveBeenCalledTimes(1);
    });

    it('uses the latest selection after a rerender', async () => {
        const { rerender } = renderHook((p: Params) => useGridClipboard(p), {
            initialProps: makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1]) }),
        });
        rerender(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([3]) }));
        pressCtrlC();
        await flush();
        expect(copiedText()).toBe('Name\tAge\nCarol\t50');
    });

    it('removes the keydown listener on unmount', async () => {
        const removeSpy = vi.spyOn(window, 'removeEventListener');
        const { unmount } = renderHook(() =>
            useGridClipboard(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1]) }))
        );
        unmount();
        expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        pressCtrlC();
        await flush();
        expect(writeText).not.toHaveBeenCalled();
    });

    it('keeps one keydown listener and a stable copySelectedRows across rerenders with new props', () => {
        const addSpy = vi.spyOn(window, 'addEventListener');
        const { result, rerender } = renderHook((p: Params) => useGridClipboard(p), {
            initialProps: makeParams({ getSelectedRowIds: () => new Set<GridRowId>([1]) }),
        });
        const first = result.current.copySelectedRows;
        rerender(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([2]) }));
        rerender(makeParams({ getSelectedRowIds: () => new Set<GridRowId>([3]) }));
        expect(result.current.copySelectedRows).toBe(first);
        expect(addSpy.mock.calls.filter(call => call[0] === 'keydown')).toHaveLength(1);
    });
});
