import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MAX_SCROLLABLE_HEIGHT, useGridDevWarnings, type UseGridDevWarningsParams } from './useGridDevWarnings';

const base: UseGridDevWarningsParams = {
    paginationRequested: false,
    isRowGrouping: false,
    autoHeight: false,
    viewportHeight: 600,
    renderedRowCount: 20,
    totalRowCount: 1_000_000,
};

function heightWarnings(warn: { mock: { calls: unknown[][] } }): string[] {
    return warn.mock.calls.map((c: unknown[]) => String(c[0])).filter((m: string) => m.includes('grid content is'));
}

describe('useGridDevWarnings: content taller than the browser lays out', () => {
    afterEach(() => vi.restoreAllMocks());

    it('names the reachable rows and points to dataSource and its guide', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        renderHook(() => useGridDevWarnings({
            ...base,
            scrollHeight: 52_000_000,
            maxContentHeight: 33_554_428,
            reachableRowCount: 645_277,
            unpinnedRowCount: 1_000_000,
        }));
        const [message] = heightWarnings(warn);
        expect(message).toContain('Only the first 645,277 of 1,000,000 rows can be scrolled to');
        expect(message).toContain('`dataSource`');
        expect(message).toContain('docs/features/data-source.md');
        expect(message).toContain('docs/features/virtualization.md#the-browser-height-limit');
    });

    it('falls back to the lowest known cap where the limit was not measured', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        renderHook(() => useGridDevWarnings({ ...base, scrollHeight: MAX_SCROLLABLE_HEIGHT + 1, maxContentHeight: Infinity }));
        expect(heightWarnings(warn)).toHaveLength(1);
        expect(heightWarnings(warn)[0]).toContain('The last rows may not be reachable by scrolling.');
    });

    it('stays quiet while the content fits', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        renderHook(() => useGridDevWarnings({ ...base, scrollHeight: 15_600_000, maxContentHeight: 17_895_697 }));
        expect(heightWarnings(warn)).toEqual([]);
    });
});
