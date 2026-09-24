import { describe, it, expect, vi, afterEach } from 'vitest';
import { StrictMode } from 'react';
import { render, act, fireEvent, cleanup } from '@testing-library/react';
import { GlobalSearch } from './GlobalSearch';

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

describe('GlobalSearch keeps typing that is still debouncing when it unmounts', () => {
    it('sends the pending text once on unmount', () => {
        vi.useFakeTimers();
        const onChange = vi.fn();
        const { getByLabelText, unmount } = render(<GlobalSearch value="" onChange={onChange} debounceMs={250} />);
        act(() => { fireEvent.change(getByLabelText('Global Search'), { target: { value: 'ada' } }); });
        act(() => { vi.advanceTimersByTime(100); });
        unmount();
        act(() => { vi.runAllTimers(); });
        expect(onChange.mock.calls).toEqual([['ada']]);
    });

    it('sends nothing on unmount when nothing is pending (also under StrictMode)', () => {
        vi.useFakeTimers();
        const onChange = vi.fn();
        const { getByLabelText, unmount } = render(<StrictMode><GlobalSearch value="x" onChange={onChange} debounceMs={250} /></StrictMode>);
        act(() => { fireEvent.change(getByLabelText('Global Search'), { target: { value: 'ada' } }); });
        act(() => { vi.runAllTimers(); });
        unmount();
        expect(onChange.mock.calls).toEqual([['ada']]);
    });
});
