
import React, { useState, useCallback } from 'react';
import { Input } from '../ui/Input';

export interface QuickFilterProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
}

export function QuickFilter(props: QuickFilterProps) {
    const {
        value = '',
        onChange,
        placeholder = 'Search...',
        debounceMs = 300
    } = props;

    const [localValue, setLocalValue] = useState(value);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setLocalValue(newValue);

        // Clear existing timeout
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Set new timeout for debounced onChange
        const newTimeoutId = setTimeout(() => {
            onChange(newValue);
        }, debounceMs);

        setTimeoutId(newTimeoutId);
    }, [timeoutId, onChange, debounceMs]);

    const handleClear = useCallback(() => {
        setLocalValue('');
        onChange('');
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
    }, [onChange, timeoutId]);

    const searchIcon = (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
    );

    const clearIcon = localValue ? (
        <button
            className="ogx-quick-filter__clear"
            onClick={handleClear}
            aria-label="Clear search"
            type="button"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
        </button>
    ) : null;

    return (
        <div className="ogx-quick-filter">
            <Input
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
                startAdornment={searchIcon}
                endAdornment={clearIcon}
                fullWidth
            />
        </div>
    );
}
