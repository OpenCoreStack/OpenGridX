import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { findRecreatedFunctionKeys, useGridLocaleTextWarning, LOCALE_TEXT_WARN_RENDERS } from './useGridLocaleTextWarning';
import type { GridLocaleText } from '../../types';

const hoisted = (n: number) => `${n} rows found`;

describe('findRecreatedFunctionKeys', () => {
    it('reports a function re-created with the same source', () => {
        const make = (): GridLocaleText => ({ liveRegionRowsFound: n => `${n} found`, paginationRowsPerPage: 'Rows' });
        expect(findRecreatedFunctionKeys(make(), make())).toEqual(['liveRegionRowsFound']);
    });

    it('ignores the same function, a changed source and string entries', () => {
        expect(findRecreatedFunctionKeys({ liveRegionRowsFound: hoisted }, { liveRegionRowsFound: hoisted })).toEqual([]);
        expect(findRecreatedFunctionKeys({ liveRegionRowsFound: n => `${n} a` }, { liveRegionRowsFound: n => `${n} b` })).toEqual([]);
        expect(findRecreatedFunctionKeys({ paginationRowsPerPage: 'a' }, { paginationRowsPerPage: 'b' })).toEqual([]);
        expect(findRecreatedFunctionKeys(undefined, { liveRegionRowsFound: hoisted })).toEqual([]);
    });
});

describe('useGridLocaleTextWarning', () => {
    afterEach(() => vi.restoreAllMocks());

    const inline = (): GridLocaleText => ({ liveRegionRowsFound: n => `${n} found` });

    it('warns once after repeated renders that re-create a function', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const { rerender } = renderHook(({ text }) => useGridLocaleTextWarning(text), { initialProps: { text: inline() } });
        for (let i = 0; i < LOCALE_TEXT_WARN_RENDERS - 1; i++) rerender({ text: inline() });
        expect(warn).not.toHaveBeenCalled();
        rerender({ text: inline() });
        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain('`liveRegionRowsFound`');
        for (let i = 0; i < 5; i++) rerender({ text: inline() });
        expect(warn).toHaveBeenCalledTimes(1);
    });

    it('stays silent for a stable localeText', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const text: GridLocaleText = { liveRegionRowsFound: hoisted };
        const { rerender } = renderHook(({ t }) => useGridLocaleTextWarning(t), { initialProps: { t: text } });
        for (let i = 0; i < 6; i++) rerender({ t: { ...text } });
        expect(warn).not.toHaveBeenCalled();
    });
});
