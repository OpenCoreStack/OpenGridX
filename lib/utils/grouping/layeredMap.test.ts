import { describe, it, expect } from 'vitest';
import { LayeredMap } from './layeredMap';

describe('LayeredMap', () => {
    const base = new Map([['a', 1], ['b', 2]]);
    const top = new Map([['g', 10]]);
    const map = new LayeredMap(base, top);

    it('reads both layers', () => {
        expect(map.get('a')).toBe(1);
        expect(map.get('g')).toBe(10);
        expect(map.get('x')).toBeUndefined();
        expect(map.has('b')).toBe(true);
        expect(map.has('g')).toBe(true);
        expect(map.has('x')).toBe(false);
        expect(map.size).toBe(3);
    });

    it('iterates base then top', () => {
        expect([...map]).toEqual([['a', 1], ['b', 2], ['g', 10]]);
        expect([...map.keys()]).toEqual(['a', 'b', 'g']);
        expect([...map.values()]).toEqual([1, 2, 10]);
        const seen: string[] = [];
        map.forEach((v, k, m) => { seen.push(`${k}${v}`); expect(m).toBe(map); });
        expect(seen).toEqual(['a1', 'b2', 'g10']);
    });

    it('prefers top, including an explicit undefined', () => {
        const layered = new LayeredMap(new Map<string, number | undefined>([['k', 1]]), new Map([['k', undefined]]));
        expect(layered.get('k')).toBeUndefined();
    });
});
