import { describe, it, expect } from 'vitest';
import { normalizePageSize, getPageCount, clampPage } from './index';

describe('pagination helpers', () => {
    it('normalizePageSize never returns less than 1', () => {
        expect(normalizePageSize(0)).toBe(1);
        expect(normalizePageSize(-5)).toBe(1);
        expect(normalizePageSize(Number.NaN)).toBe(1);
        expect(normalizePageSize(10.7)).toBe(10);
        expect(normalizePageSize(25)).toBe(25);
    });

    it('getPageCount is at least 1 and finite for any page size', () => {
        expect(getPageCount(0, 10)).toBe(1);
        expect(getPageCount(25, 10)).toBe(3);
        expect(getPageCount(30, 10)).toBe(3);
        expect(getPageCount(25, 0)).toBe(25);
    });

    it('clampPage keeps the page inside 0 … pageCount - 1', () => {
        expect(clampPage(2, 2)).toBe(1);
        expect(clampPage(-1, 3)).toBe(0);
        expect(clampPage(1, 3)).toBe(1);
        expect(clampPage(Number.NaN, 3)).toBe(0);
        expect(clampPage(4, 1)).toBe(0);
    });
});
