import React from 'react';
import { formatAggregationValue } from '../../hooks/features/useAggregation';
import type { GridColDef, GridAggregationModel, GridAggregationResult } from '../../types';

interface GridAggregationFooterProps {
    columns: GridColDef[];
    aggregationModel: GridAggregationModel;
    aggregationResult: GridAggregationResult;
    columnWidths: Record<string, number>;
    rowHeight: number;
    checkboxSelection: boolean;
    hasDetailPanel: boolean;
    rowReordering: boolean;
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
}: GridAggregationFooterProps) {
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

                return (
                    <div
                        key={col.field}
                        className="ogx__aggregation-cell"
                        role="gridcell"
                        style={{
                            width: colWidth,
                            minWidth: colWidth,
                            maxWidth: colWidth,
                            textAlign: (col.align as React.CSSProperties['textAlign']) || 'left',
                        }}
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
