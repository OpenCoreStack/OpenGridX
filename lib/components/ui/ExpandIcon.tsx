
import React from 'react';

export interface ExpandIconProps {
    isExpanded: boolean;
    onClick?: (event: React.MouseEvent) => void;
    variant?: 'chevron' | 'plus-minus';
}

export function ExpandIcon({ isExpanded, onClick, variant = 'chevron' }: ExpandIconProps) {
    return (
        <button
            className={`ogx-expand-icon ${isExpanded ? 'ogx-expand-icon--expanded' : ''}`}
            onClick={(e) => {
                if (onClick) {
                    onClick(e);
                }
            }}
            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
            type="button"
        >
            {variant === 'plus-minus' ? (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    { }
                    <path
                        d="M4 8H12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    { }
                    <path
                        d="M8 4V12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            opacity: isExpanded ? 0 : 1,
                            transition: 'opacity 0.2s ease',
                            transformOrigin: 'center'
                        }}
                    />
                </svg>
            ) : (
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                    }}
                >
                    <path
                        d="M6 4L10 8L6 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </button>
    );
}
