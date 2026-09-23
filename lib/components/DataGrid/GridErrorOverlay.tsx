import { getDataSourceErrorMessage } from '../../utils/dataSource';

interface GridErrorOverlayProps {
    error: unknown;
    /** Runs the failed request again. Without it, no Retry button is shown. */
    onRetry?: () => void;
}

export function GridErrorOverlay({ error, onRetry }: GridErrorOverlayProps) {
    if (!error) return null;
    const message = getDataSourceErrorMessage(error);
    return (
        <div className="ogx-error-overlay" aria-live="assertive" role="alert">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--ogx-color-error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="ogx-error-overlay__title">
                Oops! Something went wrong
            </div>
            <div className="ogx-error-overlay__message">
                {message}
            </div>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="ogx-button ogx-button--primary"
                >
                    Retry
                </button>
            )}
        </div>
    );
}
