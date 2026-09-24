import { describe, it, expect } from 'vitest';
import { normalizePageSize, getPageCount, clampPage, getPaginationRowCount, pickPaginationLocaleText } from './index';

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

describe('getPaginationRowCount', () => {
    const base = { hasDataSource: false, dataSourceRowCount: undefined, rowCountProp: undefined, clientRowCount: 7 };

    it('counts the rows the grid holds outside server pagination', () => {
        expect(getPaginationRowCount({ ...base, paginationMode: 'client', rowCountProp: 100 })).toBe(7);
        expect(getPaginationRowCount({ ...base, paginationMode: 'infinite', rowCountProp: 100 })).toBe(7);
    });

    it('uses the rowCount prop under server pagination without a dataSource', () => {
        expect(getPaginationRowCount({ ...base, paginationMode: 'server', rowCountProp: 100, dataSourceRowCount: 50 })).toBe(100);
        expect(getPaginationRowCount({ ...base, paginationMode: 'server' })).toBe(7);
    });

    it('prefers the dataSource total, then the prop, then the held rows', () => {
        const server = { ...base, paginationMode: 'server' as const, hasDataSource: true };
        expect(getPaginationRowCount({ ...server, dataSourceRowCount: 50, rowCountProp: 100 })).toBe(50);
        expect(getPaginationRowCount({ ...server, dataSourceRowCount: null, rowCountProp: 100 })).toBe(100);
        expect(getPaginationRowCount({ ...server })).toBe(7);
        expect(getPaginationRowCount({ ...server, dataSourceRowCount: 0, rowCountProp: 100 })).toBe(0);
    });
});

describe('pickPaginationLocaleText', () => {
    it('returns undefined without localeText', () => {
        expect(pickPaginationLocaleText(undefined)).toBeUndefined();
    });

    it('keeps only the pager strings', () => {
        const paginationOf = (f: number, t: number, c: number) => `${f}-${t}/${c}`;
        expect(pickPaginationLocaleText({ paginationRowsPerPage: 'Rows', paginationOf, noRowsLabel: 'Empty' })).toEqual({
            paginationRowsPerPage: 'Rows',
            paginationOf,
            paginationPage: undefined,
        });
    });
});
