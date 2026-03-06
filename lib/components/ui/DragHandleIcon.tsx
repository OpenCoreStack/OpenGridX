import React from 'react';

export interface DragHandleIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

export const DragHandleIcon: React.FC<DragHandleIconProps> = ({ className = '', ...props }) => {
    return (
        <button
            type="button"
            className={`ogx-drag-handle ${className}`}
            aria-label="Drag to reorder row"
            {...props}
        >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
        </button>
    );
};
