import React from 'react';
import { CellErrorBoundary } from '../Cell/CellErrorBoundary';
import type { GridDetailPanelParams, GridRowModel } from '../../types';

interface DetailPanelContentProps<R extends GridRowModel> {
    getContent: (params: GridDetailPanelParams<R>) => React.ReactNode;
    params: GridDetailPanelParams<R>;
}

/**
 * Calls `getDetailPanelContent` while rendering, below an error boundary, so a throwing callback
 * shows an error marker in that one panel instead of unmounting the grid. The row lists render it
 * only for an expanded row, so the callback never runs for collapsed rows.
 */
export function DetailPanelContent<R extends GridRowModel>({ getContent, params }: DetailPanelContentProps<R>) {
    return <CellErrorBoundary field="detail panel" renderFn={() => getContent(params)} resetKey={params.row} />;
}
