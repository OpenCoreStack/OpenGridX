import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { useState } from 'react';
import { GlobalSearch } from './GlobalSearch';

// Runs in real Chromium: the bug is about where focus ends up, which jsdom only approximates.

afterEach(() => {
    cleanup();
});

function Harness() {
    const [value, setValue] = useState('');
    const [clicks, setClicks] = useState(0);
    return (
        <div>
            <GlobalSearch value={value} onChange={setValue} debounceMs={10} />
            <button type="button" onClick={() => setClicks(n => n + 1)}>other {clicks}</button>
        </div>
    );
}

const wait = (ms: number) => act(() => new Promise<void>(resolve => { setTimeout(resolve, ms); }));

describe('GlobalSearch focus', () => {
    it('does not pull focus back into the input after the user moves on from the clear button', async () => {
        const { getByLabelText, getByText } = render(<Harness />);
        const input = getByLabelText('Global Search') as HTMLInputElement;

        act(() => { input.focus(); });
        const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        act(() => {
            setValue?.call(input, 'abc');
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await wait(50); // debounce commits the search

        const clear = getByLabelText('Clear search') as HTMLButtonElement;
        act(() => { clear.focus(); }); // Tab to the clear button
        await wait(200); // the blur check runs while focus is still inside the search box

        const other = getByText(/other/) as HTMLButtonElement;
        act(() => { other.focus(); }); // Tab away
        act(() => { other.click(); }); // any re-render
        await wait(20);

        expect(document.activeElement).toBe(other);
    });

    it('keeps focus in the input while its own search commits and re-renders the parent', async () => {
        const { getByLabelText } = render(<Harness />);
        const input = getByLabelText('Global Search') as HTMLInputElement;
        act(() => { input.focus(); });
        const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        act(() => {
            setValue?.call(input, 'ab');
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await wait(50);
        expect(document.activeElement).toBe(input);
        expect(input.value).toBe('ab');
    });
});
