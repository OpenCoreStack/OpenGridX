import { describe, it, expect } from 'vitest';
import { getRowIndex } from './rowIndex';

type Row = { id: number; v: string };
const make = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: i * 10, v: String(i) }));

describe('getRowIndex', () => {
    it('maps ids in order with first indices', () => {
        const getId = (r: Row) => r.id;
        const rows = [{ id: 1, v: 'a' }, { id: 2, v: 'b' }, { id: 1, v: 'dup' }];
        const { rowIds, rowIndexById } = getRowIndex(rows, getId, 'v');
        expect(rowIds).toEqual([1, 2, 1]);
        expect(rowIndexById.get(1)).toBe(0);
        expect(rowIndexById.get(2)).toBe(1);
    });

    it('reuses the previous result when an edit replaced row objects in place', () => {
        const getId = (r: Row) => r.id;
        const rows = make(5);
        const first = getRowIndex(rows, getId, 'v');
        const edited = rows.slice();
        edited[2] = { ...edited[2], v: 'changed' };
        expect(getRowIndex(edited, getId, 'v')).toBe(first);
    });

    it('rebuilds when rows move, change id, or the count changes', () => {
        const getId = (r: Row) => r.id;
        const rows = make(4);
        const first = getRowIndex(rows, getId, 'v');
        const swapped = [rows[1], rows[0], rows[2], rows[3]];
        const second = getRowIndex(swapped, getId, 'v');
        expect(second).not.toBe(first);
        expect(second.rowIds).toEqual([10, 0, 20, 30]);
        const rekeyed = swapped.slice();
        rekeyed[3] = { id: 99, v: 'x' };
        expect(getRowIndex(rekeyed, getId, 'v').rowIds).toEqual([10, 0, 20, 99]);
        expect(getRowIndex(rows.slice(0, 2), getId, 'v').rowIds).toEqual([0, 10]);
    });

    it('keeps views and resolvers apart', () => {
        const getId = (r: Row) => r.id;
        const other = (r: Row) => r.v;
        const rows = make(3);
        expect(getRowIndex(rows, getId, 'a').rowIds).toEqual([0, 10, 20]);
        expect(getRowIndex(rows, other, 'a').rowIds).toEqual(['0', '1', '2']);
        expect(getRowIndex(rows.slice(1), getId, 'b').rowIds).toEqual([10, 20]);
        expect(getRowIndex(rows, getId, 'a').rowIds).toEqual([0, 10, 20]);
    });
});
