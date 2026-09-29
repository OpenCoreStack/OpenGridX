import React, { useCallback, useEffect, useRef, useState } from 'react';
import { clampResizeWidth } from './clampResizeWidth';


export interface ColumnResizeHandleProps {
    field: string;
    currentWidth: number;
    onResize: (field: string, newWidth: number) => void;
    /** Fits the column to its content: called on double-click and on Enter. */
    onAutosize?: (field: string) => void;
    /** Defaults to 50 (the layout's default minimum), or the current width if that is smaller. */
    minWidth?: number;
    /** Defaults to no limit. */
    maxWidth?: number;
    /**
     * Which edge of the column the handle sits on. `'start'` (the left edge) is for right-pinned
     * columns, which are anchored on the right and grow leftwards. Default `'end'`.
     */
    edge?: 'start' | 'end';
}

interface ActiveResize {
    pointerId: number;
    startX: number;
    startWidth: number;
    lastUpdate: number;
    moved: boolean;
}

const THROTTLE_MS = 16;

function preventMouseDefault(event: React.MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
}

/** Swallows the click the browser synthesizes after a drag, so ending a resize never sorts. */
function suppressNextClick(): void {
    const swallow = (event: MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();
    };
    window.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
}

export function ColumnResizeHandle(props: ColumnResizeHandleProps) {
    const { field, currentWidth, onResize, onAutosize, minWidth, maxWidth, edge = 'end' } = props;
    const [isDragging, setIsDragging] = useState(false);
    const activeRef = useRef<ActiveResize | null>(null);

    // A resize in progress ends with the handle: nothing is reported after unmount.
    useEffect(() => () => { activeRef.current = null; }, []);

    const widthAt = useCallback((active: ActiveResize, clientX: number) => {
        const deltaX = clientX - active.startX;
        const raw = active.startWidth + (edge === 'start' ? -deltaX : deltaX);
        return clampResizeWidth(raw, active.startWidth, minWidth, maxWidth);
    }, [edge, minWidth, maxWidth]);

    const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;
        event.stopPropagation();

        activeRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            // The logical stored width: reliable for pinned, flex, and normal columns.
            startWidth: currentWidth,
            lastUpdate: 0,
            moved: false,
        };
        setIsDragging(true);
        // Keeps pointermove / pointerup coming to the handle wherever the pointer goes (also touch and pen).
        try {
            event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
            // The pointer is no longer active (synthetic events); moves over the handle still work.
        }
    }, [currentWidth]);

    const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
        const active = activeRef.current;
        if (!active || event.pointerId !== active.pointerId) return;
        if (event.clientX !== active.startX) active.moved = true;
        if (!active.moved) return;

        const now = Date.now();
        if (now - active.lastUpdate >= THROTTLE_MS) {
            active.lastUpdate = now;
            onResize(field, widthAt(active, event.clientX));
        }
    }, [field, onResize, widthAt]);

    const finish = useCallback((event: React.PointerEvent<HTMLDivElement>, commit: boolean) => {
        const active = activeRef.current;
        if (!active || event.pointerId !== active.pointerId) return;
        activeRef.current = null;
        setIsDragging(false);
        if (active.moved || event.clientX !== active.startX) {
            // The drag may end over the header cell, which would take the synthesized click as a sort.
            suppressNextClick();
            if (commit) onResize(field, widthAt(active, event.clientX));
        }
    }, [field, onResize, widthAt]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' && onAutosize) {
            event.preventDefault();
            event.stopPropagation();
            onAutosize(field);
            return;
        }
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        event.stopPropagation();
        const step = (event.shiftKey ? 50 : 10) * (event.key === 'ArrowRight' ? 1 : -1);
        onResize(field, clampResizeWidth(currentWidth + step, currentWidth, minWidth, maxWidth));
    }, [field, currentWidth, onResize, onAutosize, minWidth, maxWidth]);

    const handleDoubleClick = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        onAutosize?.(field);
    }, [field, onAutosize]);

    const classNames = [
        'ogx-column-resize-handle',
        edge === 'start' && 'ogx-column-resize-handle--start',
        isDragging && 'ogx-column-resize-handle--dragging'
    ].filter(Boolean).join(' ');

    return (
        <div
            className={classNames}
            onPointerDown={handlePointerDown}
            // The mouse's default action would start dragging the (draggable) header or select text.
            onMouseDown={preventMouseDefault}
            onPointerMove={handlePointerMove}
            onPointerUp={(e) => finish(e, true)}
            onPointerCancel={(e) => finish(e, false)}
            onClick={(e) => e.stopPropagation()}
            onDragStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            onDoubleClick={handleDoubleClick}
            onKeyDown={handleKeyDown}
            role="separator"
            aria-orientation="vertical"
            aria-label={`Resize ${field} column`}
            aria-valuenow={Math.round(currentWidth)}
            aria-valuemin={Math.round(Math.min(minWidth ?? 50, currentWidth))}
            aria-valuemax={maxWidth}
            tabIndex={-1}
        >
            <div className="ogx-column-resize-handle__line" />
        </div>
    );
}
