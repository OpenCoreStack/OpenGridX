
import React, { useCallback, useRef, useState } from 'react';


export interface ColumnResizeHandleProps {
    field: string;
    currentWidth: number;
    onResize: (field: string, newWidth: number) => void;
    minWidth?: number;
    maxWidth?: number;
}

export function ColumnResizeHandle(props: ColumnResizeHandleProps) {
    const { field, currentWidth, onResize, minWidth = 50, maxWidth = 1000 } = props;
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef<number>(0);
    const startWidthRef = useRef<number>(0);

    const handleMouseDown = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        setIsDragging(true);
        startXRef.current = event.clientX;
        // Use the logical stored width — reliable for pinned, flex, and normal columns
        startWidthRef.current = currentWidth;

        let lastUpdateTime = 0;
        const throttleMs = 16;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = e.clientX - startXRef.current;
            const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));

            const now = Date.now();
            if (now - lastUpdateTime >= throttleMs) {
                onResize(field, newWidth);
                lastUpdateTime = now;
            }
        };

        const handleMouseUp = (e: MouseEvent) => {
            setIsDragging(false);

            const deltaX = e.clientX - startXRef.current;
            const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidthRef.current + deltaX));

            onResize(field, newWidth);

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [field, currentWidth, onResize, minWidth, maxWidth]);

    const handleDoubleClick = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const classNames = [
        'ogx-column-resize-handle',
        isDragging && 'ogx-column-resize-handle--dragging'
    ].filter(Boolean).join(' ');

    return (
        <div
            className={classNames}
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()}
            onDragStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            onDoubleClick={handleDoubleClick}
            role="separator"
            aria-orientation="vertical"
            aria-label={`Resize ${field} column`}
        >
            <div className="ogx-column-resize-handle__line" />
        </div>
    );
}
