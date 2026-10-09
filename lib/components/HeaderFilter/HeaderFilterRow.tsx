import { useCallback, useLayoutEffect, useRef } from 'react';
import type { GridColDef, GridColumnPinning, GridFilterItem, GridFilterModel } from '../../types';
import { isColumnPinned, SYSTEM_COLUMN_WIDTH } from '../../utils/pinning';
import { CHECKBOX_FIELD, EXPAND_FIELD, REORDER_FIELD } from '../../utils/focus';
import { getHeaderFilterState, hasHeaderFilter, setHeaderFilterItem } from '../../utils/headerFilters';
import { getHeaderColumnStyle } from '../Header/headerColumnStyle';
import { HeaderFilterCell } from './HeaderFilterCell';

export interface HeaderFilterRowProps {
    /** The rendered columns of the column header row (render window with spacers), in render order. */
    columns: GridColDef[];
    columnWidths: Record<string, number>;
    pinnedColumns?: GridColumnPinning;
    /** Sticky offsets of the pinned columns (`calculatePinnedPositions`). */
    pinnedPositions: Record<string, number>;
    pinnedEdges: { lastLeft: string | null; firstRight: string | null };
    rowReordering: boolean;
    hasDetailPanel: boolean;
    checkboxSelection: boolean;
    pinExpandColumn: boolean;
    pinCheckboxColumn: boolean;
    columnIndexMap?: Map<string, number>;
    /** `aria-rowindex` of the row: right after the column header row. */
    ariaRowIndex: number;
    filterModel?: GridFilterModel;
    onFilterModelChange?: (model: GridFilterModel) => void;
    onOpenFilterPanel?: () => void;
    /** Field of the focused filter cell, or null. */
    focusedField: string | null;
}

function SystemFilterCell({ field, ariaColIndex, sticky, left, focused }: {
    field: string;
    ariaColIndex: number;
    sticky: boolean;
    left: number;
    focused: boolean;
}) {
    return (
        <div
            className={[
                'ogx__header-filter-cell',
                'ogx__header-filter-cell--system',
                sticky && 'ogx__header-filter-cell--pinned ogx__header-filter-cell--pinned-left',
                focused && 'ogx__header-filter-cell--focused',
            ].filter(Boolean).join(' ')}
            style={{
                width: SYSTEM_COLUMN_WIDTH,
                minWidth: SYSTEM_COLUMN_WIDTH,
                maxWidth: SYSTEM_COLUMN_WIDTH,
                position: sticky ? 'sticky' : undefined,
                left: sticky ? left : undefined,
            }}
            role="columnheader"
            aria-colindex={ariaColIndex}
            data-field={field}
            tabIndex={-1}
        />
    );
}

/**
 * The header filter row (`headerFilters`): one cell per rendered column, laid out like the column
 * header row above it, so pinned and virtualized columns line up. It edits the shared filter model
 * through the root-level items it owns (`header:<field>`).
 */
export function HeaderFilterRow(props: HeaderFilterRowProps) {
    const {
        columns, columnWidths, pinnedColumns, pinnedPositions, pinnedEdges, rowReordering, hasDetailPanel,
        checkboxSelection, pinExpandColumn, pinCheckboxColumn, columnIndexMap, ariaRowIndex, filterModel,
        onFilterModelChange, onOpenFilterPanel, focusedField,
    } = props;

    // Cells commit from timers and unmount cleanups: they read the newest model, and two commits
    // before the next render build on each other.
    const latestRef = useRef({ filterModel, onFilterModelChange });
    useLayoutEffect(() => {
        latestRef.current = { filterModel, onFilterModelChange };
    });
    const handleItemChange = useCallback((field: string, item: GridFilterItem | null) => {
        const { filterModel: current, onFilterModelChange: emit } = latestRef.current;
        if (!emit) return;
        const next = setHeaderFilterItem(current, field, item);
        if (next === current) return;
        latestRef.current = { filterModel: next, onFilterModelChange: emit };
        emit(next);
    }, []);

    const reorderColIndex = rowReordering ? 1 : 0;
    const expandColIndex = hasDetailPanel ? reorderColIndex + 1 : reorderColIndex;
    const checkboxColIndex = checkboxSelection ? expandColIndex + 1 : expandColIndex;
    const systemColumnCount = checkboxColIndex;
    const expandLeft = rowReordering ? SYSTEM_COLUMN_WIDTH : 0;
    const checkboxLeft = expandLeft + (hasDetailPanel && pinExpandColumn ? SYSTEM_COLUMN_WIDTH : 0);

    return (
        <div className="ogx__header-filter-row" role="row" aria-rowindex={ariaRowIndex}>
            {rowReordering && (
                <SystemFilterCell field={REORDER_FIELD} ariaColIndex={reorderColIndex} sticky left={0} focused={focusedField === REORDER_FIELD} />
            )}
            {hasDetailPanel && (
                <SystemFilterCell field={EXPAND_FIELD} ariaColIndex={expandColIndex} sticky={pinExpandColumn} left={expandLeft} focused={focusedField === EXPAND_FIELD} />
            )}
            {checkboxSelection && (
                <SystemFilterCell field={CHECKBOX_FIELD} ariaColIndex={checkboxColIndex} sticky={pinCheckboxColumn} left={checkboxLeft} focused={focusedField === CHECKBOX_FIELD} />
            )}
            {columns.map((colDef, index) => {
                if (colDef.isSpacer) {
                    return (
                        <div
                            key={colDef.field}
                            style={{ width: colDef.width, minWidth: colDef.width, flexShrink: 0 }}
                            aria-hidden="true"
                        />
                    );
                }
                const pinnedPosition = isColumnPinned(colDef.field, pinnedColumns);
                const style = getHeaderColumnStyle(colDef, columnWidths, pinnedPosition, pinnedPosition ? pinnedPositions[colDef.field] : undefined);
                const ariaColIndex = systemColumnCount + (columnIndexMap?.get(colDef.field) ?? index) + 1;
                const className = [
                    pinnedPosition && 'ogx__header-filter-cell--pinned',
                    pinnedPosition && `ogx__header-filter-cell--pinned-${pinnedPosition}`,
                    pinnedPosition === 'left' && colDef.field === pinnedEdges.lastLeft && 'ogx__header-filter-cell--pinned-left-last',
                    pinnedPosition === 'right' && colDef.field === pinnedEdges.firstRight && 'ogx__header-filter-cell--pinned-right-first',
                    focusedField === colDef.field && 'ogx__header-filter-cell--focused',
                ].filter(Boolean).join(' ');

                if (!hasHeaderFilter(colDef)) {
                    return (
                        <div
                            key={colDef.field}
                            className={`ogx__header-filter-cell ogx__header-filter-cell--empty ${className}`}
                            style={style}
                            role="columnheader"
                            aria-label={`No filter for ${colDef.headerName || colDef.field}`}
                            aria-colindex={ariaColIndex}
                            data-field={colDef.field}
                            tabIndex={-1}
                        />
                    );
                }
                return (
                    <HeaderFilterCell
                        key={colDef.field}
                        colDef={colDef}
                        state={getHeaderFilterState(filterModel, colDef.field)}
                        style={style}
                        className={className}
                        ariaColIndex={ariaColIndex}
                        onItemChange={handleItemChange}
                        onOpenFilterPanel={onOpenFilterPanel}
                    />
                );
            })}
        </div>
    );
}
