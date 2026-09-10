# `useGridScrollSync`

Internal hook. Manages all scroll-related state and the `handleScroll` callback for the grid viewport — including RAF-batched tick updates that trigger virtualization recomputes and the `onRowsScrollEnd` threshold check for infinite scroll.

**File:** `lib/hooks/core/useGridScrollSync.ts`

---

## Purpose

Before extraction, three pieces of scroll logic lived inline in `DataGrid.tsx`:
1. `scrollPosRef` / `scrollRafRef` / `scrollTick` state setup (~5 lines)
2. A cleanup effect canceling the pending RAF on unmount (~4 lines)
3. `handleScroll` callback with RAF scheduling and scroll-end threshold (~22 lines)

Extracting them gives the scroll logic its own test surface and removes 31 lines from `DataGrid.tsx`.

---

## Parameters

```ts
interface UseGridScrollSyncParams {
    onRowsScrollEnd?: (params: GridRowScrollEndParams) => void;
    /** Minimum overscan rows — the adaptive algorithm never goes below this. Defaults to 3. */
    overscanRowCount?: number;
}
```

---

## Returns

```ts
interface UseGridScrollSyncResult {
    scrollTop: number;
    scrollLeft: number;
    /** Dynamically computed overscan row count based on current scroll velocity. */
    overscanRows: number;
    handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}
```

| Return | Used by |
|--------|---------|
| `scrollTop` | `useGridVirtualization` — vertical scroll offset for computing the visible row window |
| `scrollLeft` | `useGridVirtualization` — horizontal scroll offset for computing the visible column window |
| `overscanRows` | `useGridVirtualization` — adaptive overscan count, set from current scroll velocity |
| `handleScroll` | Passed to the viewport `<div onScroll={handleScroll}>` |

---

## RAF batching pattern

`handleScroll` fires on every scroll event (can be 60+ per second). Rather than recomputing the virtual window on every event, the hook schedules a single RAF per frame:

```
scroll event → measure velocity → cancel pending RAF → schedule new RAF
  → RAF fires → setScrollState({ scrollTop, scrollLeft, overscanRows })
```

All three values are bundled into a single `setScrollState` call so `useGridVirtualization` recomputes exactly once per frame. Scroll velocity (px/ms) is computed as `deltaPos / deltaTime` from the previous scroll event, then mapped to an overscan tier via `velocityToOverscan()`:

| Velocity (px/ms) | `overscanRows` |
|---|---|
| < 0.5 | 3 |
| 0.5 – 3 | 5 |
| 3 – 15 | 12 |
| 15 – 40 | 20 |
| > 40 | 30 |

The result is always `Math.max(computed, overscanRowCount)` so the prop floor is respected.

---

## Decay timer

200 ms after the last scroll event, a `setTimeout` callback resets `overscanRows` back to `overscanRowCount`. This prevents the grid from holding a large overscan buffer while the user is idle.

---

## `onRowsScrollEnd` threshold

When the viewport scrolls to within 100px of the bottom (`scrollHeight - scrollTop - clientHeight < 100`), the hook calls `onRowsScrollEnd` synchronously (not RAF-batched) so the consumer can load the next page immediately.

---

## Cleanup

The hook registers a single `useEffect` with an empty dependency array to cancel any pending RAF and decay timer on unmount:

```ts
useEffect(() => {
    return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        if (decayRef.current !== null) clearTimeout(decayRef.current);
    };
}, []);
```

This prevents a `setState` call on an unmounted component if the grid is removed mid-scroll.

---

## 🔗 Related
- [useGridVirtualization](use-grid-virtualization.md)
- [useGridStateSnapshot](use-grid-state-snapshot.md)
