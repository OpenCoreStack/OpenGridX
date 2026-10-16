import { useEffect, useRef } from 'react';
import type { GridLocaleText } from '../../types';

/** Renders in a row that must re-create the same function before the warning fires. */
export const LOCALE_TEXT_WARN_RENDERS = 3;

/**
 * Keys whose function is a new object with the same source as before: an inline arrow re-created on
 * render. A function with different source is a real change and is not reported.
 */
export function findRecreatedFunctionKeys(prev: GridLocaleText | undefined, next: GridLocaleText | undefined): string[] {
    if (!prev || !next || prev === next) return [];
    const before = prev as Record<string, unknown>;
    const after = next as Record<string, unknown>;
    return Object.keys(after).filter(key => {
        const a = before[key];
        const b = after[key];
        return typeof a === 'function' && typeof b === 'function' && a !== b && a.toString() === b.toString();
    });
}

/**
 * Dev-only: warns once when `localeText` keeps re-creating the same function entries. The locale is
 * read from context by every rendered row, so each such render re-renders all of them. The functions
 * are not made stable here: a function that reads changed state (a new language) must still update the rows.
 */
export function useGridLocaleTextWarning(localeText: GridLocaleText | undefined): void {
    const prevRef = useRef(localeText);
    const streakRef = useRef(0);
    const warnedRef = useRef(false);

    useEffect(() => {
        if (process.env.NODE_ENV === 'production' || warnedRef.current) return;
        const keys = findRecreatedFunctionKeys(prevRef.current, localeText);
        prevRef.current = localeText;
        streakRef.current = keys.length > 0 ? streakRef.current + 1 : 0;
        if (streakRef.current < LOCALE_TEXT_WARN_RENDERS) return;
        warnedRef.current = true;
        console.warn(
            `[OpenGridX] \`localeText\` re-creates ${keys.map(key => `\`${key}\``).join(', ')} on every render, ` +
            'so every rendered row re-renders with it. Define these functions outside the component or in `useMemo`. ' +
            'See docs/performance.md.'
        );
    }, [localeText]);
}
