
import React from 'react';
import type { GridRowModel, GridRowId, GridDetailPanelHeight } from '../../types';


export interface DetailPanelProps<R extends GridRowModel = GridRowModel> {
    row: R;
    rowId: GridRowId;
    rowIndex: number;
    content: React.ReactNode;
    height: GridDetailPanelHeight;
    isExpanded: boolean;
    /** Referenced by the expand cell's `aria-controls`. */
    id?: string;
    /** Number of grid columns the panel spans (`aria-colspan` of its cell). */
    colSpan?: number;
}

export function DetailPanel<R extends GridRowModel = GridRowModel>(props: DetailPanelProps<R>) {
    const { content, height, isExpanded, id, colSpan } = props;

    if (!isExpanded) {
        return null;
    }

    const style: React.CSSProperties = {
        height: height === 'auto' ? 'auto' : `${height}px`,
        overflow: height === 'auto' ? 'visible' : 'auto'
    };

    // A detail panel sits between rows of the grid, so it is exposed as a row with one cell
    // spanning every column (a bare div is not allowed inside role="rowgroup").
    return (
        <div className="ogx__detail-panel" style={style} role="row" id={id}>
            <div className="ogx__detail-panel-content" role="gridcell" aria-colspan={colSpan}>
                {content}
            </div>
        </div>
    );
}
