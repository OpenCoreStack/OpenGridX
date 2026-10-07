import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { useState } from 'react';
import { userEvent } from 'vitest/browser';
import { GlobalSearch } from './GlobalSearch';
import '../../styles/opengridx.css';

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

// The input renders through the shared <Input>: the ref must reach the <input> so expanding and
// clearing still focus it, and the public class stays on the <input>.
describe('GlobalSearch through the shared Input', () => {
    it('keeps ogx-global-search__input on the <input>, inside an .ogx-input-wrapper', () => {
        const { getByLabelText } = render(<Harness />);
        const input = getByLabelText('Global Search');
        expect(input.tagName).toBe('INPUT');
        expect(input.className).toContain('ogx-global-search__input');
        expect(input.parentElement?.className).toContain('ogx-input-wrapper');
        expect(input.closest('.ogx-global-search')).not.toBeNull();
    });

    it('clicking the collapsed search expands it and focuses the input', async () => {
        const { getByLabelText, container } = render(<Harness />);
        const root = container.querySelector<HTMLElement>('.ogx-global-search')!;
        expect(root.className).not.toContain('ogx-global-search--expanded');
        await userEvent.click(root);
        await expect.poll(() => document.activeElement).toBe(getByLabelText('Global Search'));
        expect(root.className).toContain('ogx-global-search--expanded');
    });

    it('the clear button empties the search and returns focus to the input', async () => {
        const { getByLabelText } = render(<Harness />);
        const input = getByLabelText('Global Search') as HTMLInputElement;
        act(() => { input.focus(); });
        await userEvent.keyboard('abc');
        await userEvent.click(getByLabelText('Clear search'));
        expect(input.value).toBe('');
        expect(document.activeElement).toBe(input);
    });

    it('collapses again when an empty search loses focus', async () => {
        const { getByLabelText, getByText, container } = render(<Harness />);
        const root = container.querySelector<HTMLElement>('.ogx-global-search')!;
        act(() => { (getByLabelText('Global Search') as HTMLInputElement).focus(); });
        expect(root.className).toContain('ogx-global-search--expanded');
        act(() => { (getByText(/other/) as HTMLButtonElement).focus(); });
        await wait(200);
        expect(root.className).not.toContain('ogx-global-search--expanded');
    });
});
