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
        selectedRowIds: new Set<GridRowId>(),
        columns: COLUMNS,
        getVisibleRows: () => ROWS,
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
            useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([99]) }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(writeText).not.toHaveBeenCalled();
    });

    it('copies a header row followed by the selected rows as TSV', async () => {
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1, 3]) }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nAlice\t30\nCarol\t50');
    });

    it('orders copied rows by visible-row order, not selection order', async () => {
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([3, 1]) }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nAlice\t30\nCarol\t50');
    });

    it('follows the column array order', async () => {
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                selectedRowIds: new Set<GridRowId>([2]),
                columns: [COLUMNS[1], COLUMNS[0]],
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Age\tName\n40\tBob');
    });

    it('falls back to the field name when headerName is missing or empty', async () => {
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                selectedRowIds: new Set<GridRowId>([1]),
                columns: [{ field: 'name' }, { field: 'age', headerName: '' }],
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('name\tage\nAlice\t30');
    });

    it('excludes internal columns whose field starts with "__"', async () => {
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                selectedRowIds: new Set<GridRowId>([1]),
                columns: [
                    { field: '__checkbox_col__' },
                    { field: '__group__', headerName: 'Group' },
                    ...COLUMNS,
                ],
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nAlice\t30');
    });

    it('applies valueFormatter with value, row and field', async () => {
        const valueFormatter = vi.fn(({ value }: { value: unknown }) => `${String(value)} yrs`);
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                selectedRowIds: new Set<GridRowId>([2]),
                columns: [COLUMNS[0], { ...COLUMNS[1], valueFormatter }],
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
                selectedRowIds: new Set<GridRowId>([1]),
                getVisibleRows: () => rows,
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\n\t');
    });

    it('keeps falsy but meaningful values (0, false, negative numbers)', async () => {
        const rows: GridRowModel[] = [{ id: 1, name: false, age: 0 }, { id: 2, name: 'x', age: -5 }];
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                selectedRowIds: new Set<GridRowId>([1, 2]),
                getVisibleRows: () => rows,
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
                selectedRowIds: new Set<GridRowId>(['B-2']),
                getVisibleRows: () => rows,
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
                selectedRowIds: new Set<GridRowId>([0]),
                getVisibleRows: () => rows,
            }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nZero\t0');
    });

    it('compares ids strictly (string "1" does not select numeric id 1)', async () => {
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>(['1']) }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(writeText).not.toHaveBeenCalled();
    });

    it('reads visible rows lazily at copy time', async () => {
        let rows: GridRowModel[] = [];
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({
                selectedRowIds: new Set<GridRowId>([1]),
                getVisibleRows: () => rows,
            }))
        );
        rows = [{ id: 1, name: 'Late', age: 7 }];
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nLate\t7');
    });

    it('uses the latest props after a rerender', async () => {
        const { result, rerender } = renderHook((p: Params) => useGridClipboard(p), {
            initialProps: makeParams({ selectedRowIds: new Set<GridRowId>([1]) }),
        });
        rerender(makeParams({ selectedRowIds: new Set<GridRowId>([2]) }));
        await act(async () => { await result.current.copySelectedRows(); });
        expect(copiedText()).toBe('Name\tAge\nBob\t40');
    });
});

describe('useGridClipboard — clipboard write strategy', () => {
    it('resolves and logs an error when navigator.clipboard.writeText rejects and no fallback worked', async () => {
        writeText.mockImplementation(() => Promise.reject(new Error('denied')));
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1]) }))
        );
        await act(async () => {
            await expect(result.current.copySelectedRows()).resolves.toBeUndefined();
        });
        expect(consoleError).toHaveBeenCalledWith('[OpenGridX] Failed to copy to clipboard:', expect.any(Error));
    });

    it('does not log when writeText rejects but the execCommand fallback succeeded', async () => {
        writeText.mockImplementation(() => Promise.reject(new Error('denied')));
        const execCommand = vi.fn(() => true);
        setExecCommand(execCommand);
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1]) }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(execCommand).toHaveBeenCalledWith('copy');
        expect(consoleError).not.toHaveBeenCalled();
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
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1]) }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(execCommand).toHaveBeenCalledWith('copy');
        expect(copiedValue).toBe('Name\tAge\nAlice\t30');
        expect(consoleError).not.toHaveBeenCalled();
    });

    it('removes the temporary textarea after the fallback copy', async () => {
        setExecCommand(() => true);
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1]) }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(document.querySelectorAll('textarea')).toHaveLength(0);
    });

    it('removes the temporary textarea even when execCommand throws', async () => {
        setExecCommand(() => { throw new Error('boom'); });
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1]) }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(document.querySelectorAll('textarea')).toHaveLength(0);
        // The Clipboard API is still attempted after the fallback throws.
        expect(copiedText()).toBe('Name\tAge\nAlice\t30');
    });

    it('logs an error when neither the Clipboard API nor the fallback is available', async () => {
        setClipboard(undefined);
        setExecCommand(() => false);
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1]) }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(consoleError).toHaveBeenCalledWith(
            '[OpenGridX] Failed to copy to clipboard:',
            expect.objectContaining({ message: 'Clipboard API not available and fallback failed.' })
        );
    });

    it('treats a clipboard object without writeText as unavailable', async () => {
        setClipboard({});
        setExecCommand(() => false);
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const { result } = renderHook(() =>
            useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1]) }))
        );
        await act(async () => { await result.current.copySelectedRows(); });
        expect(consoleError).toHaveBeenCalledTimes(1);
    });
});

describe('useGridClipboard — keyboard shortcut', () => {
    it('copies on Ctrl+C', async () => {
        renderHook(() => useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1]) })));
        pressCtrlC();
        await flush();
        expect(copiedText()).toBe('Name\tAge\nAlice\t30');
    });

    it('copies on Cmd+C (metaKey)', async () => {
        renderHook(() => useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1]) })));
        pressCtrlC({ ctrlKey: false, metaKey: true });
        await flush();
        expect(writeText).toHaveBeenCalledTimes(1);
    });

    it('ignores plain "c" and other Ctrl shortcuts', async () => {
        renderHook(() => useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1]) })));
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
        renderHook(() => useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1]) })));
        const input = document.createElement('input');
        input.type = type;
        document.body.appendChild(input);
        input.focus();
        pressCtrlC();
        await flush();
        expect(writeText).not.toHaveBeenCalled();
    });

    it('does not intercept Ctrl+C inside a textarea or select', async () => {
        renderHook(() => useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1]) })));
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
        renderHook(() => useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1]) })));
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
        renderHook(() => useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1]) })));
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
            initialProps: makeParams({ selectedRowIds: new Set<GridRowId>([1]) }),
        });
        rerender(makeParams({ selectedRowIds: new Set<GridRowId>([3]) }));
        pressCtrlC();
        await flush();
        expect(copiedText()).toBe('Name\tAge\nCarol\t50');
    });

    it('removes the keydown listener on unmount', async () => {
        const removeSpy = vi.spyOn(window, 'removeEventListener');
        const { unmount } = renderHook(() =>
            useGridClipboard(makeParams({ selectedRowIds: new Set<GridRowId>([1]) }))
        );
        unmount();
        expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        pressCtrlC();
        await flush();
        expect(writeText).not.toHaveBeenCalled();
    });

    it('keeps a stable copySelectedRows identity while inputs are unchanged', () => {
        const params = makeParams({ selectedRowIds: new Set<GridRowId>([1]) });
        const { result, rerender } = renderHook((p: Params) => useGridClipboard(p), { initialProps: params });
        const first = result.current.copySelectedRows;
        rerender(params);
        expect(result.current.copySelectedRows).toBe(first);
    });
});
