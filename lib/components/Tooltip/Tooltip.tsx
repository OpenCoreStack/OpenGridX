import React, { useState, useRef, useLayoutEffect, useEffect, useCallback, useId, cloneElement, isValidElement } from 'react';
import ReactDOM from 'react-dom';
import './Tooltip.css';

export interface GridTooltipProps {
    title: React.ReactNode;
    children: React.ReactElement;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    enterDelay?: number;
    leaveDelay?: number;
}

/** Distance in px between the child and the tooltip. */
const GAP = 8;

interface ChildAriaProps {
    'aria-describedby'?: string;
}

export function GridTooltip({
    title,
    children,
    placement = 'top',
    enterDelay = 200,
    leaveDelay = 0
}: GridTooltipProps) {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    // Resolved when the tooltip opens: the closest DataGridThemeProvider, so the tooltip picks up
    // the theme's --ogx-overlay-* variables like the grid's other popovers, or document.body.
    const [portalTarget, setPortalTarget] = useState<Element | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const childRef = useRef<HTMLElement | null>(null);
    const tooltipId = useId();

    // Viewport coordinates of the anchor point; the tooltip is position: fixed and its CSS
    // transform (per placement) moves it off that point.
    const updateCoords = useCallback(() => {
        if (!childRef.current) return;
        const rect = childRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        switch (placement) {
            case 'bottom': setCoords({ top: rect.bottom + GAP, left: centerX }); break;
            case 'left': setCoords({ top: centerY, left: rect.left - GAP }); break;
            case 'right': setCoords({ top: centerY, left: rect.right + GAP }); break;
            default: setCoords({ top: rect.top - GAP, left: centerX });
        }
    }, [placement]);

    const clearTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = null;
    }, []);

    useLayoutEffect(() => {
        if (!open) return;
        updateCoords();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { clearTimer(); setOpen(false); }
        };
        window.addEventListener('scroll', updateCoords, true);
        window.addEventListener('resize', updateCoords);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, updateCoords, clearTimer]);

    // A pending enter/leave timer must not fire after unmount.
    useEffect(() => clearTimer, [clearTimer]);

    const show = () => {
        clearTimer();
        timerRef.current = setTimeout(() => {
            setPortalTarget(childRef.current?.closest('.ogx-theme-provider') ?? document.body);
            setOpen(true);
        }, enterDelay);
    };

    const hide = () => {
        clearTimer();
        timerRef.current = setTimeout(() => {
            setOpen(false);
        }, leaveDelay);
    };

    const wrapperRef = useCallback((node: HTMLSpanElement | null) => {
        // Use the first real child element for coordinates, not the wrapper span.
        // display:contents would give zero rects; inline-block wrapper gives correct rects
        // but we want coords from the actual child for pixel-perfect placement.
        childRef.current = node ? (node.firstElementChild as HTMLElement) ?? node : null;
    }, []);

    const isShown = open && Boolean(title) && portalTarget !== null;

    // While shown, the child is described by the tooltip (added to any aria-describedby it has).
    let child: React.ReactNode = children;
    if (isShown && isValidElement(children)) {
        const element = children as React.ReactElement<ChildAriaProps>;
        const describedBy = element.props['aria-describedby'];
        child = cloneElement(element, {
            'aria-describedby': describedBy ? `${describedBy} ${tooltipId}` : tooltipId,
        });
    }

    return (
        <>
            <span
                ref={wrapperRef}
                style={{ display: 'inline-block', lineHeight: 0 }}
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
            >
                {child}
            </span>
            {isShown && portalTarget && ReactDOM.createPortal(
                <div
                    id={tooltipId}
                    role="tooltip"
                    className={`ogx-tooltip ogx-tooltip--${placement}`}
                    style={{
                        top: coords.top,
                        left: coords.left,
                        position: 'fixed',
                        zIndex: 99999
                    }}
                >
                    {title}
                </div>,
                portalTarget
            )}
        </>
    );
}
