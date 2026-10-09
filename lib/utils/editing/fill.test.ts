import { describe, it, expect } from 'vitest';
import {
    computeFillValues,
    detectFillSeries,
    fillHandleCell,
    fillLines,
    fillRangeCorners,
    fillTargetFromPointer,
} from './fill';

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);
const ymd = (values: unknown[]) => values.map(v => {
    const d = v as Date;
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
});

describe('detectFillSeries / computeFillValues', () => {
    it('continues integers with an equal step', () => {
        expect(computeFillValues([2, 4, 6], 2, true)).toEqual([8, 10]);
        expect(computeFillValues([1, 2], 3, true)).toEqual([3, 4, 5]);
        expect(computeFillValues([10, 7], 3, true)).toEqual([4, 1, -2]);
    });

    it('continues decimals without floating-point noise', () => {
        expect(computeFillValues([0.1, 0.2], 3, true)).toEqual([0.3, 0.4, 0.5]);
        expect(computeFillValues([1.5, 2.25, 3], 2, true)).toEqual([3.75, 4.5]);
        expect(computeFillValues([0.1, 0.2, 0.3], 1, true)).toEqual([0.4]);
    });

    it('continues negatives', () => {
        expect(computeFillValues([-3, -1], 3, true)).toEqual([1, 3, 5]);
        expect(computeFillValues([-1.5, -2], 2, true)).toEqual([-2.5, -3]);
    });

    it('repeats the pattern when the steps are not equal', () => {
        expect(detectFillSeries([1, 2, 4], 2)).toBeNull();
        expect(computeFillValues([1, 2, 4], 5, true)).toEqual([1, 2, 4, 1, 2]);
    });

    it('repeats mixed types, strings, booleans and nulls', () => {
        expect(computeFillValues([1, '2'], 3, true)).toEqual([1, '2', 1]);
        expect(computeFillValues([1, day(2026, 1, 1)], 1, true)).toEqual([1]);
        expect(computeFillValues(['a', 'b'], 3, true)).toEqual(['a', 'b', 'a']);
        expect(computeFillValues([true, false], 2, true)).toEqual([true, false]);
        expect(computeFillValues([1, null], 2, true)).toEqual([1, null]);
        expect(computeFillValues([1, Number.NaN], 1, true)).toEqual([1]);
    });

    it('copies a single cell', () => {
        expect(detectFillSeries([5], 3)).toBeNull();
        expect(computeFillValues([5], 3, true)).toEqual([5, 5, 5]);
        expect(computeFillValues(['x'], 2, true)).toEqual(['x', 'x']);
    });

    it('repeats instead of continuing when a series is not allowed (Alt / copy)', () => {
        expect(computeFillValues([2, 4], 3, false)).toEqual([2, 4, 2]);
    });

    it('continues dates by day, across months and daylight-saving changes', () => {
        expect(ymd(computeFillValues([day(2026, 10, 5), day(2026, 10, 6)], 2, true))).toEqual(['2026-10-7', '2026-10-8']);
        expect(ymd(computeFillValues([day(2026, 3, 27), day(2026, 3, 29)], 2, true))).toEqual(['2026-3-31', '2026-4-2']);
        expect(ymd(computeFillValues([day(2026, 1, 10), day(2026, 1, 3)], 1, true))).toEqual(['2025-12-27']);
    });

    it('continues dates by month (same day of the month), clamping to the month end', () => {
        expect(ymd(computeFillValues([day(2026, 1, 15), day(2026, 2, 15)], 3, true))).toEqual(['2026-3-15', '2026-4-15', '2026-5-15']);
        expect(ymd(computeFillValues([day(2025, 10, 31), day(2025, 12, 31)], 2, true))).toEqual(['2026-2-28', '2026-4-30']);
        expect(ymd(computeFillValues([day(2026, 1, 31), day(2026, 3, 31)], 1, true))).toEqual(['2026-5-31']);
        expect(ymd(computeFillValues([day(2025, 12, 31), day(2026, 1, 31)], 1, true))).toEqual(['2026-2-28']);
        expect(ymd(computeFillValues([day(2026, 5, 1), day(2026, 3, 1)], 2, true))).toEqual(['2026-1-1', '2025-11-1']);
    });

    it('repeats dates with unequal steps, and copies Date objects instead of sharing them', () => {
        const a = day(2026, 1, 1);
        const values = computeFillValues([a, day(2026, 1, 2), day(2026, 1, 4)], 3, true);
        expect(ymd(values)).toEqual(['2026-1-1', '2026-1-2', '2026-1-4']);
        expect(values[0]).not.toBe(a);
        expect(computeFillValues([a], 1, true)[0]).not.toBe(a);
    });

    it('continues timestamps with an equal step in milliseconds', () => {
        const t = new Date(2026, 0, 1, 9, 0);
        const values = computeFillValues([t, new Date(2026, 0, 1, 9, 30)], 2, true) as Date[];
        expect(values.map(v => `${v.getHours()}:${v.getMinutes()}`)).toEqual(['10:0', '10:30']);
    });

    it('returns nothing for an empty source or count', () => {
        expect(computeFillValues([], 3, true)).toEqual([]);
        expect(computeFillValues([1, 2], 0, true)).toEqual([]);
    });
});

describe('fillTargetFromPointer', () => {
    const source = { top: 2, bottom: 3, left: 1, right: 2 };

    it('extends in the direction of the larger pointer offset', () => {
        expect(fillTargetFromPointer(source, { row: 6, col: 4 }, 30, 80)).toEqual({ rect: { ...source, bottom: 6 }, direction: 'down' });
        expect(fillTargetFromPointer(source, { row: 6, col: 4 }, 120, 80)).toEqual({ rect: { ...source, right: 4 }, direction: 'right' });
        expect(fillTargetFromPointer(source, { row: 0, col: 1 }, 0, -90)).toEqual({ rect: { ...source, top: 0 }, direction: 'up' });
        expect(fillTargetFromPointer(source, { row: 3, col: 0 }, -150, 0)).toEqual({ rect: { ...source, left: 0 }, direction: 'left' });
    });

    it('follows the only side the cell lies beyond, whatever the pointer offsets', () => {
        // Down and to the left within the source columns: still a fill down.
        expect(fillTargetFromPointer(source, { row: 5, col: 1 }, -60, 30)).toEqual({ rect: { ...source, bottom: 5 }, direction: 'down' });
        expect(fillTargetFromPointer(source, { row: 2, col: 9 }, 0, -40)).toEqual({ rect: { ...source, right: 9 }, direction: 'right' });
    });

    it('is null while the pointer stays over the source', () => {
        expect(fillTargetFromPointer(source, { row: 3, col: 2 }, 2, 2)).toBeNull();
        expect(fillTargetFromPointer(source, { row: 2, col: 1 }, -90, -40)).toBeNull();
    });
});

describe('fillLines', () => {
    it('reads the source towards the filled cells', () => {
        const source = { top: 2, bottom: 3, left: 0, right: 1 };
        expect(fillLines(source, { ...source, bottom: 5 }, 'down')).toEqual([
            { line: 0, source: [2, 3], targets: [4, 5] },
            { line: 1, source: [2, 3], targets: [4, 5] },
        ]);
        expect(fillLines(source, { ...source, top: 0 }, 'up')[0]).toEqual({ line: 0, source: [3, 2], targets: [1, 0] });
        expect(fillLines(source, { ...source, right: 3 }, 'right')).toEqual([
            { line: 2, source: [0, 1], targets: [2, 3] },
            { line: 3, source: [0, 1], targets: [2, 3] },
        ]);
        expect(fillLines({ ...source, left: 2, right: 3 }, { ...source, left: 0, right: 3 }, 'left')[0])
            .toEqual({ line: 2, source: [3, 2], targets: [1, 0] });
    });
});

describe('fillRangeCorners', () => {
    it('keeps the anchor when it is a corner of the new range', () => {
        expect(fillRangeCorners({ top: 0, bottom: 5, left: 1, right: 2 }, 'down', { row: 0, col: 1 }))
            .toEqual({ anchor: { row: 0, col: 1 }, head: { row: 5, col: 2 } });
    });

    it('moves the anchor to the source side otherwise', () => {
        expect(fillRangeCorners({ top: 0, bottom: 5, left: 1, right: 2 }, 'down', { row: 1, col: 2 }))
            .toEqual({ anchor: { row: 0, col: 2 }, head: { row: 5, col: 1 } });
        expect(fillRangeCorners({ top: 0, bottom: 5, left: 1, right: 2 }, 'up', { row: 4, col: 1 }))
            .toEqual({ anchor: { row: 5, col: 1 }, head: { row: 0, col: 2 } });
        expect(fillRangeCorners({ top: 0, bottom: 1, left: 0, right: 4 }, 'right', { row: 1, col: 1 }))
            .toEqual({ anchor: { row: 1, col: 0 }, head: { row: 0, col: 4 } });
    });
});

describe('fillHandleCell', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const rowIdAt = (r: number) => ids[r];

    it('is the bottom-right cell', () => {
        expect(fillHandleCell({ top: 0, bottom: 2, left: 0, right: 1 }, rowIdAt, ['x', 'y'])).toEqual({ row: 2, field: 'y' });
    });

    it('is the origin of a span covering the corner', () => {
        const origin = (rowId: string | number, field: string) => (rowId === 'c' && field === 'y' ? { rowId: 'b', field: 'x' } : null);
        expect(fillHandleCell({ top: 0, bottom: 2, left: 0, right: 1 }, rowIdAt, ['x', 'y'], origin)).toEqual({ row: 1, field: 'x' });
    });

    it('is null when the corner is not displayed', () => {
        expect(fillHandleCell({ top: 0, bottom: 7, left: 0, right: 1 }, rowIdAt, ['x', 'y'])).toBeNull();
    });
});
