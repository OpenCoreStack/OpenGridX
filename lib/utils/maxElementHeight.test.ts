import { describe, it, expect } from 'vitest';
import { countReachableRows, getMaxElementHeight } from './maxElementHeight';

describe('countReachableRows', () => {
    const heights = [52, 104, 156, 208, 260];
    it('counts the rows whose bottom edge is at or above the limit', () => {
        expect(countReachableRows(heights, 156)).toBe(3);
        expect(countReachableRows(heights, 155)).toBe(2);
        expect(countReachableRows(heights, 0)).toBe(0);
        expect(countReachableRows(heights, 10_000)).toBe(5);
    });
    it('counts every row without a cap', () => {
        expect(countReachableRows(heights, Infinity)).toBe(5);
        expect(countReachableRows([], 100)).toBe(0);
    });
});

describe('getMaxElementHeight', () => {
    it('is Infinity where there is no layout engine (jsdom) or no document', () => {
        expect(getMaxElementHeight(document)).toBe(Infinity);
        expect(getMaxElementHeight(null)).toBe(Infinity);
    });
});
