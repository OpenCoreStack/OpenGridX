// Icons of the toolbar buttons and panel titles.

export function SigmaIcon() {
    return (
        <svg
            width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M18 4H6l6 8-6 8h12" />
        </svg>
    );
}

export function ViewColumnIcon() {
    return (
        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <rect x="8.5" y="4" width="7" height="16" fill="currentColor" opacity="0.25" />
            <line x1="8.5" y1="4" x2="8.5" y2="20" stroke="currentColor" strokeWidth="1.8" />
            <line x1="15.5" y1="4" x2="15.5" y2="20" stroke="currentColor" strokeWidth="1.8" />
            <line x1="2" y1="9" x2="22" y2="9" stroke="currentColor" strokeWidth="1.2" />
            <line x1="2" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="1.2" />
        </svg>
    );
}

export function FilterIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    );
}
