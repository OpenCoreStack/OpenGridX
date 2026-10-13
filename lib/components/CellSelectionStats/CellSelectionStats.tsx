import { formatAggregationValue } from '../../utils/aggregation';
import type { GridCellSelectionStatsSlotProps } from '../../types';
import { useGridLocale } from '../DataGrid/gridLocaleContext';

export type CellSelectionStatsProps = GridCellSelectionStatsSlotProps & Record<string, unknown>;

/**
 * The status bar of `showCellSelectionStats`: count of non-empty cells, and the sum and average of
 * the numeric cells of the selected range. Replace it with `slots.cellSelectionStats`, or wrap it.
 * @since v3.3
 */
export function CellSelectionStats({ count, sum, average }: CellSelectionStatsProps) {
    const locale = useGridLocale();
    return (
        <div className="ogx__cell-selection-stats">
            <span className="ogx__cell-selection-stat">
                <span className="ogx__cell-selection-stat-label">{locale.cellSelectionStatsCount}</span>
                <span className="ogx__cell-selection-stat-value" data-stat="count">{count.toLocaleString()}</span>
            </span>
            {sum !== null && (
                <span className="ogx__cell-selection-stat">
                    <span className="ogx__cell-selection-stat-label">{locale.cellSelectionStatsSum}</span>
                    <span className="ogx__cell-selection-stat-value" data-stat="sum">{formatAggregationValue(sum, 'sum')}</span>
                </span>
            )}
            {average !== null && (
                <span className="ogx__cell-selection-stat">
                    <span className="ogx__cell-selection-stat-label">{locale.cellSelectionStatsAverage}</span>
                    <span className="ogx__cell-selection-stat-value" data-stat="average">{formatAggregationValue(average, 'avg')}</span>
                </span>
            )}
        </div>
    );
}
