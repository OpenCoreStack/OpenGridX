import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import './Tooltip.css';

interface GridTooltipProps {
    title: React.ReactNode;
    children: React.ReactElement;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    enterDelay?: number;
    leaveDelay?: number;
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
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const childRef = useRef<HTMLElement | null>(null);

    const updateCoords = useCallback(() => {
        if (!childRef.current) return;
        const rect = childRef.current.getBoundingClientRect();

        let t = 0;
        let l = 0;

        // Note: These calculations are for positioning absolute relative to document.body
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        if (placement === 'top') {
            t = rect.top + scrollY - 8;
            l = rect.left + scrollX + rect.width / 2;
        } else if (placement === 'bottom') {
            t = rect.bottom + scrollY + 8;
            l = rect.left + scrollX + rect.width / 2;
        }

        setCoords({ top: t, left: l });
    }, [placement]);

    useLayoutEffect(() => {
        if (open) {
            updateCoords();
            window.addEventListener('scroll', updateCoords, true);
            window.addEventListener('resize', updateCoords);
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
        };
    }, [open, updateCoords]);

    const handleMouseEnter = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setOpen(true);
        }, enterDelay);
    };

    const handleMouseLeave = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
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

    return (
        <>
            <span
                ref={wrapperRef}
                style={{ display: 'inline-block', lineHeight: 0 }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </span>
            {open && title && ReactDOM.createPortal(
                <div
                    className={`ogx-tooltip ogx-tooltip--${placement}`}
                    style={{
                        top: coords.top,
                        left: coords.left,
                        position: 'absolute',
                        zIndex: 99999
                    }}
                >
                    {title}
                </div>,
                document.body
            )}
        </>
    );
}
