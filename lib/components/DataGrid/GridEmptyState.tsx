interface GridEmptyStateProps {
    noRowsLabel: string;
    width: number;
}

export function GridEmptyState({ noRowsLabel, width }: GridEmptyStateProps) {
    return (
        <div className="ogx__empty" style={{ width }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
            </svg>
            <span>{noRowsLabel}</span>
        </div>
    );
}
