import { useCallback, useRef } from 'react';

/**
 * Returns a callback ref that measures the element it is attached to with a ResizeObserver and
 * reports its content size. Every element that mounts is observed (the grid viewport unmounts in
 * list view and a new one mounts when list view is switched off); a detached element is released.
 */
export function useGridViewportSize(
    setDimensions: (width: number, height: number) => void,
): (element: HTMLElement | null) => void {
    const observerRef = useRef<ResizeObserver | null>(null);

    return useCallback((element: HTMLElement | null) => {
        observerRef.current?.disconnect();
        observerRef.current = null;
        if (!element || typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setDimensions(width, height);
            }
        });
        observer.observe(element);
        observerRef.current = observer;
    }, [setDimensions]);
}
