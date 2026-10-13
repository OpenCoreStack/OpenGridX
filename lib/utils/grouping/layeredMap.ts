/**
 * A read-only view of two maps with disjoint keys, read as one: `top` first, then `base`. Row
 * grouping keeps one entry per leaf row in `base` (built once per tree) and the group rows in
 * `top` (rebuilt on every expand / collapse), so toggling a group at 1M rows does not copy a
 * 1M-entry map. Iteration yields `base` entries, then `top` entries.
 */
export class LayeredMap<K, V> implements ReadonlyMap<K, V> {
    private readonly base: ReadonlyMap<K, V>;
    private readonly top: ReadonlyMap<K, V>;

    constructor(base: ReadonlyMap<K, V>, top: ReadonlyMap<K, V>) {
        this.base = base;
        this.top = top;
    }

    get size(): number {
        return this.base.size + this.top.size;
    }

    get(key: K): V | undefined {
        const value = this.top.get(key);
        return value !== undefined || this.top.has(key) ? value : this.base.get(key);
    }

    has(key: K): boolean {
        return this.top.has(key) || this.base.has(key);
    }

    forEach(callback: (value: V, key: K, map: ReadonlyMap<K, V>) => void, thisArg?: unknown): void {
        this.base.forEach((value, key) => callback.call(thisArg, value, key, this));
        this.top.forEach((value, key) => callback.call(thisArg, value, key, this));
    }

    *entries(): MapIterator<[K, V]> {
        yield* this.base.entries();
        yield* this.top.entries();
    }

    *keys(): MapIterator<K> {
        yield* this.base.keys();
        yield* this.top.keys();
    }

    *values(): MapIterator<V> {
        yield* this.base.values();
        yield* this.top.values();
    }

    [Symbol.iterator](): MapIterator<[K, V]> {
        return this.entries();
    }
}
