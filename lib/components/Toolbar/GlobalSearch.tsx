import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';


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
    const [isExpanded, setIsExpanded] = useState(() => value.length > 0);
    // Fully uncontrolled: localValue is the single source of truth.
    const [localValue, setLocalValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    // Keep onChange always current without adding it to effect deps
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    // Track the last value we emitted upward
    const lastEmittedRef = useRef(value);
    // Track the last incoming prop value to detect external resets
    const lastIncomingValueRef = useRef(value);
    // Track whether input was focused BEFORE a re-render so we can restore it
    const wasFocusedRef = useRef(false);

    // ── Focus preservation across re-renders ─────────────────────────────────
    // When the parent updates filterModel (triggered by our debounce), React
    // re-renders the entire tree. Even though the input element stays mounted,
    // the browser can lose focus during heavy reconciliation. We detect this
    // via useLayoutEffect (runs synchronously after DOM mutations, before paint)
    // and immediately restore focus without any visual flicker.
    useLayoutEffect(() => {
        if (wasFocusedRef.current && document.activeElement !== inputRef.current) {
            inputRef.current?.focus();
        }
    });

    // ── External reset detection ──────────────────────────────────────────────
    // Only responds when the PARENT programmatically changes the value
    // (e.g. "Clear all filters" button) — not from our own typing.
    useEffect(() => {
        if (value === lastIncomingValueRef.current) return;
        lastIncomingValueRef.current = value;

        if (value !== lastEmittedRef.current) {
            setLocalValue(value);
            lastEmittedRef.current = value;
            if (!value) {
                wasFocusedRef.current = false;
                setIsExpanded(false);
            } else {
                setIsExpanded(true);
            }
        }
    }, [value]);

    // ── Debounced upward notification ─────────────────────────────────────────
    useEffect(() => {
        const handler = setTimeout(() => {
            if (localValue !== lastEmittedRef.current) {
                lastEmittedRef.current = localValue;
                onChangeRef.current(localValue);
            }
        }, debounceMs);
        return () => clearTimeout(handler);
    }, [localValue, debounceMs]);

    const handleExpand = useCallback(() => {
        setIsExpanded(true);
        requestAnimationFrame(() => inputRef.current?.focus());
    }, []);

    const handleClear = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setLocalValue('');
        lastEmittedRef.current = '';
        onChangeRef.current('');
        inputRef.current?.focus();
    }, []);

    const handleFocus = useCallback(() => {
        wasFocusedRef.current = true;
        setIsExpanded(true);
    }, []);

    // Blur: defer 150ms to allow focus to move within the container first
    // (e.g. clicking the clear button) before deciding to collapse.
    const handleBlur = useCallback(() => {
        wasFocusedRef.current = false;
        setTimeout(() => {
            if (
                containerRef.current &&
                document.activeElement &&
                containerRef.current.contains(document.activeElement)
            ) {
                // Focus is still inside — mark as focused again and abort
                wasFocusedRef.current = true;
                return;
            }
            if (!localValue) {
                setIsExpanded(false);
            }
        }, 150);
    }, [localValue]);

    // ── Click outside ─────────────────────────────────────────────────────────
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
            onClick={!isExpanded ? handleExpand : undefined}
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
