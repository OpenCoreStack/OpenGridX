import type React from 'react';
import { CellSelectionStats } from './CellSelectionStats';
import type { GridCellSelectionStats } from '../../hooks/core/useGridCellSelection';
import type { GridApi, GridCellSelectionStatsSlotProps } from '../../types';

interface GridCellSelectionStatsAreaProps {
    stats: GridCellSelectionStats | null;
    apiRef: React.MutableRefObject<GridApi>;
    slot?: React.ComponentType<GridCellSelectionStatsSlotProps & Record<string, unknown>>;
    slotProps?: Partial<GridCellSelectionStatsSlotProps> & Record<string, unknown>;
}

/**
 * The strip under the viewport that holds the status bar. It keeps its height while one cell or
 * none is selected, so the viewport does not resize each time a range starts or ends.
 */
export function GridCellSelectionStatsArea({ stats, apiRef, slot, slotProps }: GridCellSelectionStatsAreaProps) {
    const Component = slot ?? CellSelectionStats;
    return (
        <div className="ogx__cell-selection-stats-area" aria-hidden={stats ? undefined : true}>
            {stats && <Component apiRef={apiRef} {...stats} {...slotProps} />}
        </div>
    );
}
