import React, { useMemo } from 'react';
import { formatAggregationValue } from '../../hooks/features/useAggregation';
import type { GridColDef, GridAggregationModel, GridAggregationResult, GridColumnPinning } from '../../types';
import { calculatePinnedPositions, isColumnPinned } from '../../utils/pinning';

interface GridAggregationFooterProps {
    columns: GridColDef[];
    aggregationModel: GridAggregationModel;
    aggregationResult: GridAggregationResult;
    columnWidths: Record<string, number>;
    rowHeight: number;
    checkboxSelection: boolean;
    hasDetailPanel: boolean;
    rowReordering: boolean;
    pinnedColumns?: GridColumnPinning;
}

export function GridAggregationFooter({
    columns,
    aggregationModel,
    aggregationResult,
    columnWidths,
    rowHeight,
    checkboxSelection,
    hasDetailPanel,
    rowReordering,
    pinnedColumns,
}: GridAggregationFooterProps) {
    // Compute sticky left/right pixel offsets for each pinned column.
    // The footer always renders checkbox/detail/reorder spacers unconditionally,
    // so treat pinCheckboxColumn and pinExpandColumn as always true.
    const pinnedOffsets = useMemo(
        () => calculatePinnedPositions(
            columns,
            columnWidths,
            pinnedColumns,
            checkboxSelection,
            true,
            hasDetailPanel,
            true,
            rowReordering,
        ),
        [columns, columnWidths, pinnedColumns, checkboxSelection, hasDetailPanel, rowReordering]
    );

    const lastLeftField  = pinnedColumns?.left?.[pinnedColumns.left.length - 1];
    const firstRightField = pinnedColumns?.right?.[0];

    return (
        <div
            className="ogx__aggregation-footer"
            role="row"
            aria-label="Aggregation totals"
            aria-live="polite"
            style={{ minHeight: `${rowHeight}px` }}
        >
            {checkboxSelection && <div style={{ width: 48, flexShrink: 0 }} />}
            {hasDetailPanel  && <div style={{ width: 48, flexShrink: 0 }} />}
            {rowReordering   && <div style={{ width: 48, flexShrink: 0 }} />}

            {columns.map((col) => {
                const fnName = (aggregationModel as Record<string, string>)[col.field];
                const rawValue = aggregationResult[col.field];
                const colWidth = columnWidths[col.field] ?? (typeof col.width === 'number' ? col.width : 120);

                const pinnedPosition = isColumnPinned(col.field, pinnedColumns);
                const pinnedOffset   = pinnedPosition ? pinnedOffsets[col.field] : undefined;

                const className = [
                    'ogx__aggregation-cell',
                    pinnedPosition === 'left'  && 'ogx__aggregation-cell--pinned-left',
                    pinnedPosition === 'right' && 'ogx__aggregation-cell--pinned-right',
                    pinnedPosition === 'left'  && col.field === lastLeftField   && 'ogx__aggregation-cell--pinned-left-last',
                    pinnedPosition === 'right' && col.field === firstRightField && 'ogx__aggregation-cell--pinned-right-first',
                ].filter(Boolean).join(' ');

                const style: React.CSSProperties = {
                    width: colWidth,
                    minWidth: colWidth,
                    maxWidth: colWidth,
                    textAlign: (col.align as React.CSSProperties['textAlign']) || 'left',
                };
                if (pinnedPosition === 'left'  && pinnedOffset !== undefined) style.left  = pinnedOffset;
                if (pinnedPosition === 'right' && pinnedOffset !== undefined) style.right = pinnedOffset;

                return (
                    <div
                        key={col.field}
                        className={className}
                        role="gridcell"
                        style={style}
                    >
                        {fnName ? (
                            <>
                                <span className="ogx__aggregation-label">{fnName}</span>
                                <span className="ogx__aggregation-value">
                                    {formatAggregationValue(rawValue, fnName)}
                                </span>
                            </>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
