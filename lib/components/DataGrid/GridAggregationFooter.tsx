import React, { useMemo } from 'react';
import { formatAggregateForColumn } from '../../utils/aggregation';
import type { GridColDef, GridAggregationModel, GridAggregationResult, GridColumnPinning } from '../../types';
import { calculatePinnedPositions, isColumnPinned } from '../../utils/pinning';

const SYSTEM_COLUMN_WIDTH = 48;

interface GridAggregationFooterProps {
    /**
     * The columns exactly as the rows lay them out: visible only, pinned-left first and pinned-right
     * last, with the horizontal-virtualization spacers (`virtualization.virtualColumns`).
     */
    columns: GridColDef[];
    aggregationModel: GridAggregationModel;
    aggregationResult: GridAggregationResult;
    /** User resize overrides, as passed to the rows. */
    columnWidths: Record<string, number>;
    rowHeight: number;
    checkboxSelection: boolean;
    hasDetailPanel: boolean;
    rowReordering: boolean;
    pinCheckboxColumn?: boolean;
    pinExpandColumn?: boolean;
    pinnedColumns?: GridColumnPinning;
    /** A server aggregation request is in flight. */
    loading?: boolean;
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
    pinCheckboxColumn = true,
    pinExpandColumn = true,
    pinnedColumns,
    loading = false,
}: GridAggregationFooterProps) {
    // Same offsets as Row, so pinned totals sit exactly under their pinned body cells.
    const pinnedOffsets = useMemo(
        () => calculatePinnedPositions(
            columns,
            columnWidths,
            pinnedColumns,
            checkboxSelection,
            pinCheckboxColumn,
            hasDetailPanel,
            pinExpandColumn,
            rowReordering,
        ),
        [columns, columnWidths, pinnedColumns, checkboxSelection, pinCheckboxColumn, hasDetailPanel, pinExpandColumn, rowReordering]
    );

    const lastLeftField  = pinnedColumns?.left?.[pinnedColumns.left.length - 1];
    const firstRightField = pinnedColumns?.right?.[0];

    // System-column spacers stick exactly where Row sticks its drag handle, expand and checkbox cells.
    const expandLeft = rowReordering ? SYSTEM_COLUMN_WIDTH : 0;
    const checkboxLeft = expandLeft + (hasDetailPanel && pinExpandColumn ? SYSTEM_COLUMN_WIDTH : 0);
    const spacer = (key: string, pinned: boolean, left: number) => (
        <div
            key={key}
            className={`ogx__aggregation-spacer${pinned ? ' ogx__aggregation-spacer--pinned' : ''}`}
            style={pinned ? { left } : undefined}
            aria-hidden="true"
        />
    );

    return (
        <div
            className={`ogx__aggregation-footer${loading ? ' ogx__aggregation-footer--loading' : ''}`}
            role="row"
            aria-label="Aggregation totals"
            aria-live="polite"
            aria-busy={loading || undefined}
            style={{ minHeight: `${rowHeight}px` }}
        >
            {rowReordering && spacer('__reorder_col__', true, 0)}
            {hasDetailPanel && spacer('__expand_col__', pinExpandColumn, expandLeft)}
            {checkboxSelection && spacer('__checkbox_col__', pinCheckboxColumn, checkboxLeft)}

            {columns.map((col) => {
                if (col.isSpacer) {
                    const width = typeof col.width === 'number' ? col.width : 0;
                    return <div key={col.field} style={{ width, minWidth: width, flexShrink: 0 }} aria-hidden="true" />;
                }

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
                                    {formatAggregateForColumn(rawValue, fnName, col, aggregationResult)}
                                </span>
                            </>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
