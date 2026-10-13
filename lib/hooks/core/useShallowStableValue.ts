import { useState } from 'react';

/** Equal when both hold the same keys with `Object.is`-equal values, one level of plain records deep. */
function isShallowEqual(a: unknown, b: unknown, depth = 1): boolean {
    if (Object.is(a, b)) return true;
    if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) || Array.isArray(b)) return false;
    const ra = a as Record<string, unknown>;
    const rb = b as Record<string, unknown>;
    const keys = Object.keys(ra);
    if (keys.length !== Object.keys(rb).length) return false;
    return keys.every(key => Object.prototype.hasOwnProperty.call(rb, key)
        && (Object.is(ra[key], rb[key]) || (depth > 0 && isShallowEqual(ra[key], rb[key], depth - 1))));
}

/**
 * `value`, or the previous one while the new one holds the same entries. A consumer passing an
 * inline object (`localeText={{ … }}`) then keeps one identity across renders, so what is memoised
 * on it (the resolved locale, and every row that reads it) does not update needlessly. Functions
 * inside are compared by identity: an inline function still counts as a change.
 */
export function useShallowStableValue<T>(value: T): T {
    const [stable, setStable] = useState(value);
    if (stable !== value && !isShallowEqual(stable, value)) {
        // Adjusting state while rendering (React's documented pattern for derived state).
        setStable(value);
        return value;
    }
    return stable;
}
