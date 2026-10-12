/**
 * The tallest element this browser lays out. Browsers cap element heights: Chromium and Safari at
 * about 33.5M px, Firefox at about 17.9M px. Firefox does not clamp an element that is taller — it
 * collapses it, so a grid whose content is taller than the cap cannot be scrolled at all.
 *
 * Measured once per document with an invisible probe (one layout), from the largest candidate down.
 * Returns `Infinity` where there is no layout engine (jsdom, SSR), so nothing is capped there.
 */
const CANDIDATES = [33_554_400, 17_895_000, 10_000_000, 5_000_000] as const;

const cache = new WeakMap<Document, number>();

function measure(doc: Document): number {
    const body = doc.body;
    if (!body) return Infinity;
    const probe = doc.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:absolute;top:0;left:-10000px;width:1px;visibility:hidden;pointer-events:none;';
    body.appendChild(probe);
    try {
        probe.style.height = '100px';
        // No layout engine: every element reads 0 tall.
        if (Math.abs(probe.getBoundingClientRect().height - 100) > 1) return Infinity;
        for (const height of CANDIDATES) {
            probe.style.height = `${height}px`;
            if (Math.abs(probe.getBoundingClientRect().height - height) < 2) return height;
        }
        return CANDIDATES[CANDIDATES.length - 1];
    } finally {
        probe.remove();
    }
}

export function getMaxElementHeight(doc: Document | null | undefined): number {
    if (!doc) return Infinity;
    const known = cache.get(doc);
    if (known !== undefined) return known;
    const height = measure(doc);
    cache.set(doc, height);
    return height;
}

/** How many of the unpinned rows end at or above `limit` px (the rows a user can scroll to). */
export function countReachableRows(cumulativeHeights: readonly number[], limit: number): number {
    if (!Number.isFinite(limit)) return cumulativeHeights.length;
    let lo = 0;
    let hi = cumulativeHeights.length;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (cumulativeHeights[mid] <= limit) lo = mid + 1; else hi = mid;
    }
    return lo;
}
