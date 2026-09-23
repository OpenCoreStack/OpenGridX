import React from 'react';

interface GridLoadingOverlayProps {
    /** `slots.loadingOverlay`, rendered centred over the rows on a dimmed backdrop. */
    overlay?: React.ReactNode;
}

/**
 * Shown while the grid is loading but already has rows (a reload, a server sort or filter): the
 * rows stay visible and interactive, and a progress bar runs along the top of the grid. A custom
 * `slots.loadingOverlay` is shown centred instead. With no rows yet, the body shows skeleton rows
 * or the loading overlay in place of the rows, so this is not rendered.
 */
export function GridLoadingOverlay({ overlay }: GridLoadingOverlayProps) {
    if (overlay) {
        return (
            <div className="ogx__loading-overlay ogx__loading-overlay--over-rows ogx__loading-overlay--custom">
                {overlay}
            </div>
        );
    }
    return (
        <div className="ogx__loading-overlay ogx__loading-overlay--over-rows">
            <div className="ogx__loading-bar" role="progressbar" aria-label="Loading data" />
        </div>
    );
}
