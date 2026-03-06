import React, { useState, useEffect, useRef } from 'react';


interface GlobalSearchProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
}

function SearchIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

export function GlobalSearch({ value = '', onChange, placeholder = 'Search...', debounceMs = 250 }: GlobalSearchProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync local value with prop
    useEffect(() => {
        setLocalValue(value);
        if (value && !isExpanded) {
            setIsExpanded(true);
        }
    }, [value, isExpanded]);

    // Debounce change
    useEffect(() => {
        const handler = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue);
            }
        }, debounceMs);
        return () => clearTimeout(handler);
    }, [localValue, onChange, debounceMs, value]);

    const handleFocus = () => {
        setIsExpanded(true);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLocalValue('');
        inputRef.current?.focus();
        onChange(''); // Immediate clear
    };

    // Close on blur if empty
    const handleBlur = () => {
        if (!localValue) {
            setIsExpanded(false);
        }
    };

    // Click outside to collapse if empty
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (!localValue) {
                    setIsExpanded(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [localValue]);

    return (
        <div
            ref={containerRef}
            className={`ogx-global-search${isExpanded ? ' ogx-global-search--expanded' : ''}`}
            onClick={() => {
                if (!isExpanded) {
                    setIsExpanded(true);

                    setTimeout(() => inputRef.current?.focus(), 50);
                }
            }}
        >
            <div className="ogx-global-search__icon-wrapper">
                <SearchIcon />
            </div>
            <input
                ref={inputRef}
                id="ogx-global-search-input"
                name="ogx-global-search"
                className="ogx-global-search__input"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder}
                aria-label="Global Search"
                autoComplete="off"
            />
            {localValue && (
                <button className="ogx-global-search__clear" onClick={handleClear} aria-label="Clear search">
                    <CloseIcon />
                </button>
            )}
        </div>
    );
}
