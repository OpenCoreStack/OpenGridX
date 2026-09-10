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
}
```

---

## Returns

```ts
interface UseGridScrollSyncResult {
    scrollTop: number;
    scrollLeft: number;
    handleScroll: (event: React.UIEvent<HTMLDivElement>) => void;
}
```

| Return | Used by |
|--------|---------|
| `scrollTop` | `useGridVirtualization` — vertical scroll offset for computing the visible row window |
| `scrollLeft` | `useGridVirtualization` — horizontal scroll offset for computing the visible column window |
| `handleScroll` | Passed to the viewport `<div onScroll={handleScroll}>` |

---

## RAF batching pattern

`handleScroll` fires on every scroll event (can be 60+ per second). Rather than recomputing the virtual window on every event, the hook schedules a single RAF per frame:

```
scroll event → cancel pending RAF → schedule new RAF → RAF fires → setScrollPos({scrollTop, scrollLeft})
```

The state update (`setScrollPos`) causes `useGridVirtualization` to recompute the render window at most once per animation frame, capping recompute cost to ~60Hz regardless of scroll event frequency. The returned `scrollTop`/`scrollLeft` values are the latest committed scroll position.

---

## `onRowsScrollEnd` threshold

When the viewport scrolls to within 100px of the bottom (`scrollHeight - scrollTop - clientHeight < 100`), the hook calls `onRowsScrollEnd` synchronously (not RAF-batched) so the consumer can load the next page immediately.

---

## Cleanup

The hook registers a single `useEffect` with an empty dependency array to cancel any pending RAF on unmount:

```ts
useEffect(() => {
    return () => {
        if (scrollRafRef.current !== null) cancelAnimationFrame(scrollRafRef.current);
    };
}, []);
```

This prevents a `setState` call on an unmounted component if the grid is removed mid-scroll.

---

## 🔗 Related
- [useGridVirtualization](use-grid-virtualization.md)
- [useGridStateSnapshot](use-grid-state-snapshot.md)
