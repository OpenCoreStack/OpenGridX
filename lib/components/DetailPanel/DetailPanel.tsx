
import React from 'react';
import type { GridRowModel, GridRowId, GridDetailPanelHeight } from '../../types';


export interface DetailPanelProps<R extends GridRowModel = GridRowModel> {
    row: R;
    rowId: GridRowId;
    rowIndex: number;
    content: React.ReactNode;
    height: GridDetailPanelHeight;
    isExpanded: boolean;
    /**
     * Called with the panel's rendered height when `height` is `'auto'`: once when it mounts and
     * again whenever its size changes, so the grid can lay the rows below it out correctly.
     */
    onHeightChange?: (rowId: GridRowId, height: number) => void;
}

export function DetailPanel<R extends GridRowModel = GridRowModel>(props: DetailPanelProps<R>) {
    const { rowId, content, height, isExpanded, onHeightChange } = props;
    const panelRef = React.useRef<HTMLDivElement>(null);
    const isAuto = height === 'auto';

    // Measured before paint, so the grid re-lays out rows under the panel before they are shown.
    React.useLayoutEffect(() => {
        const el = panelRef.current;
        if (!el || !isAuto || !isExpanded || !onHeightChange) return;
        const report = () => {
            // Not laid out (hidden ancestor, or no layout engine): keep the previous height.
            if (el.getClientRects().length === 0) return;
            onHeightChange(rowId, el.offsetHeight);
        };
        report();
        if (typeof ResizeObserver === 'undefined') return;
        const observer = new ResizeObserver(report);
        observer.observe(el);
        return () => observer.disconnect();
    }, [isAuto, isExpanded, onHeightChange, rowId]);

    if (!isExpanded) {
        return null;
    }

    const style: React.CSSProperties = {
        height: isAuto ? 'auto' : `${height}px`,
        overflow: isAuto ? 'visible' : 'auto'
    };

    return (
        <div ref={panelRef} className="ogx__detail-panel" style={style}>
            <div className="ogx__detail-panel-content">
                {content}
            </div>
        </div>
    );
}
