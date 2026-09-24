import { useState } from 'react';

function shallowEqualObjects(a: object, b: object): boolean {
    if (a === b) return true;
    const aKeys = Object.keys(a);
    if (aKeys.length !== Object.keys(b).length) return false;
    const aRecord = a as Record<string, unknown>;
    const bRecord = b as Record<string, unknown>;
    return aKeys.every(key => Object.prototype.hasOwnProperty.call(b, key) && Object.is(aRecord[key], bRecord[key]));
}

/** Same length, and each column has the same own properties with identical values (functions by identity). */
export function columnsShallowEqual<C extends object>(a: readonly C[], b: readonly C[]): boolean {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    return a.every((col, index) => shallowEqualObjects(col, b[index]));
}

/**
 * The `columns` prop with a stable identity: while each column definition is shallowly equal to
 * the previous one (same properties, same values, callbacks compared by identity), the previous
 * array is returned. An inline `columns={[...]}` (a new but equal array on every parent render)
 * then does not re-run the filter, sort, aggregation, grouping and spanning passes, which are all
 * memoised on column identity. A changed property, including a new inline callback, is a new array.
 *
 * The previous array is held in state and replaced during render (React's "adjust state when a
 * prop changes" pattern), so no ref is written during render.
 */
export function useStableColumns<T extends readonly object[]>(columns: T): T {
    const [stable, setStable] = useState(columns);
    const same = columnsShallowEqual(stable, columns);
    if (!same) setStable(columns);
    return same ? stable : columns;
}
