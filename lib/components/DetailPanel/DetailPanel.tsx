
import React from 'react';
import type { GridRowModel, GridRowId, GridDetailPanelHeight } from '../../types';


export interface DetailPanelProps<R extends GridRowModel = GridRowModel> {
    row: R;
    rowId: GridRowId;
    rowIndex: number;
    content: React.ReactNode;
    height: GridDetailPanelHeight;
    isExpanded: boolean;
}

export function DetailPanel<R extends GridRowModel = GridRowModel>(props: DetailPanelProps<R>) {
    const { content, height, isExpanded } = props;

    if (!isExpanded) {
        return null;
    }

    const style: React.CSSProperties = {
        height: height === 'auto' ? 'auto' : `${height}px`,
        overflow: height === 'auto' ? 'visible' : 'auto'
    };

    return (
        <div className="ogx__detail-panel" style={style}>
            <div className="ogx__detail-panel-content">
                {content}
            </div>
        </div>
    );
}
