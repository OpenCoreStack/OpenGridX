import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getViewportWidth } from '../../utils/viewport';
import { getPanelPosition, type GridPanelPosition } from '../../utils/direction';

export interface UseToolbarPanelOptions {
    /** Close when the user presses the mouse outside the panel and its button. Default: true. */
    closeOnOutsideClick?: boolean;
}

export interface UseToolbarPanelResult {
    panelRef: React.RefObject<HTMLDivElement | null>;
    /** Where to place the panel: under its button, kept on screen (`getPanelPosition`). */
    position: GridPanelPosition;
    /** The element to portal into: the enclosing theme provider (so its tokens apply), else `document.body`. */
    portalContainer: Element | null;
}

/**
 * What every toolbar panel needs: a portal target, a position under its button that follows page
 * scroll and resize, and closing on Escape (and, by default, on a press outside it). `onClose` is
 * read through a ref, so the listeners are registered once and a re-render never leaves a window in
 * which a close could be lost or fired twice.
 */
export function useToolbarPanel(
    anchorRef: React.RefObject<HTMLElement | null>,
    onClose: () => void,
    { closeOnOutsideClick = true }: UseToolbarPanelOptions = {},
): UseToolbarPanelResult {
    const panelRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<GridPanelPosition>({ top: 0, right: 0 });
    const [portalContainer, setPortalContainer] = useState<Element | null>(null);
    const onCloseRef = useRef(onClose);
    useLayoutEffect(() => { onCloseRef.current = onClose; });

    useLayoutEffect(() => {
        setPortalContainer(anchorRef.current?.closest('.ogx-theme-provider') ?? document.body);
    }, [anchorRef]);

    const computePosition = useCallback(() => getPanelPosition(anchorRef.current, getViewportWidth()), [anchorRef]);

    useEffect(() => {
        setPosition(computePosition());
        const update = () => setPosition(computePosition());
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [computePosition]);

    useEffect(() => {
        if (!closeOnOutsideClick) return undefined;
        function handleMouseDown(e: MouseEvent) {
            const target = e.target as Node;
            if (panelRef.current && !panelRef.current.contains(target) && anchorRef.current && !anchorRef.current.contains(target)) {
                onCloseRef.current();
            }
        }
        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [anchorRef, closeOnOutsideClick]);

    useEffect(() => {
        function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onCloseRef.current(); }
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    return { panelRef, position, portalContainer };
}
