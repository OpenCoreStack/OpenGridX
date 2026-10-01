import { describe, it, expect } from 'vitest';
import { getHeaderLineClamp, shouldWrapHeaderText } from './headerWrap';

describe('getHeaderLineClamp', () => {
    it('fits 2, 3 and 4 lines at 56, 72 and 88px', () => {
        expect(getHeaderLineClamp(56)).toBe(2);
        expect(getHeaderLineClamp(72)).toBe(3);
        expect(getHeaderLineClamp(88)).toBe(4);
    });

    it('takes a line off for the aggregation label', () => {
        expect(getHeaderLineClamp(72, true)).toBe(2);
    });

    it('never goes below one line', () => {
        expect(getHeaderLineClamp(20)).toBe(1);
        expect(getHeaderLineClamp(56, true)).toBe(1);
        expect(getHeaderLineClamp(Number.NaN)).toBe(1);
    });
});

describe('shouldWrapHeaderText', () => {
    it('lets the column override the grid', () => {
        expect(shouldWrapHeaderText(undefined, undefined)).toBe(false);
        expect(shouldWrapHeaderText(undefined, true)).toBe(true);
        expect(shouldWrapHeaderText(false, true)).toBe(false);
        expect(shouldWrapHeaderText(true, false)).toBe(true);
    });
});
