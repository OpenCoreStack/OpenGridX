
import React from 'react';
import type { GridColDef, GridRowModel, GridPinnedPosition, GridCellParams, GridRowMeta } from '../../types';
import type { CellColSpanInfo } from '../../hooks/features/useGridSpanning';

import { GridEditInputCell } from './GridEditInputCell';
import { CellErrorBoundary } from './CellErrorBoundary';

export interface CellProps<R extends GridRowModel = GridRowModel> {
    onCellClick?: (params: GridCellParams<R>) => void;
    onCellEditStart?: (field: string, value: unknown) => void;
    onCellValueChange?: (field: string, newValue: unknown) => void;
    value: unknown;
    row: R;
    colDef: GridColDef<R>;
    rowIndex: number;
    colIndex: number;
    isSelected?: boolean;
    onClick?: (event: React.MouseEvent) => void;
    width?: number;
    pinnedPosition?: GridPinnedPosition | null;
    pinnedOffset?: number;

    isFocused?: boolean;
    isFocusVisible?: boolean;

    isEditable?: boolean;
    isEditing?: boolean;
    onEditStart?: () => void;
    onEditStop?: (cancel?: boolean) => void;
    onValueChange?: (newValue: unknown) => void;

    colSpanInfo?: CellColSpanInfo;
    rowSpan?: number;
    isHiddenByRowSpan?: boolean;
    rowMeta?: GridRowMeta;
}

function CellImpl<R extends GridRowModel = GridRowModel>(props: CellProps<R>) {
    const {
        onCellClick,
        onCellEditStart,
        onCellValueChange,
        value,
        row,
        colDef,
        rowIndex,
        colIndex,
        isSelected,
        onClick,
        width,
        pinnedPosition,
        pinnedOffset,
        isFocused,
        isFocusVisible,
        isEditable,
        isEditing,
        onEditStart,
        onEditStop,
        onValueChange,

        colSpanInfo,
        rowSpan: rowSpanProp,
        isHiddenByRowSpan,
        rowMeta
    } = props;

    // All hooks must come before any early returns (Rules of Hooks)
    const handleValueChange = React.useCallback((newValue: unknown) => {
        if (onCellValueChange) {
            onCellValueChange(colDef.field, newValue);
        } else {
            onValueChange?.(newValue);
        }
    }, [onCellValueChange, onValueChange, colDef.field]);

    const formattedValue = React.useMemo(() => {
        if (colDef.valueFormatter) {
            return colDef.valueFormatter({
                value,
                row,
                field: colDef.field
            });
        }

        if (value === null || value === undefined) {
            return '';
        }

        return String(value);
    }, [value, row, colDef]);

    const resolvedCellClassName = React.useMemo(() => {
        if (!colDef.cellClassName) return '';
        if (typeof colDef.cellClassName === 'function') {
            return colDef.cellClassName({ value, row, field: colDef.field, colDef, rowIndex, colIndex }) || '';
        }
        return colDef.cellClassName;
    }, [colDef, value, row, rowIndex, colIndex]);

    const cellRef = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(() => {
        if (isFocused && cellRef.current) {
            cellRef.current.focus({ preventScroll: true });
        }
    }, [isFocused]);

    if (colSpanInfo?.spannedByColSpan) {
        return null;
    }

    if (isHiddenByRowSpan) {
        return (
            <div
                className="ogx__cell ogx__cell--hidden"
                style={{ width: width ?? colDef.width ?? 100 }}
                role="presentation"
                data-field={colDef.field}
                data-colindex={colIndex}
            />
        );
    }

    const handleClick = (e: React.MouseEvent) => {
        if (onCellClick) {
            onCellClick({
                row,
                field: colDef.field,
                value,
                colDef,
                rowIndex,
                colIndex
            });
        }
        onClick?.(e);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (isEditable && (onEditStart || onCellEditStart)) {
            e.stopPropagation();
            if (onCellEditStart) {
                onCellEditStart(colDef.field, value);
            } else {
                onEditStart?.();
            }
        }
    };

    const isPinned = pinnedPosition !== null && pinnedPosition !== undefined;

    const classNames = [
        'ogx__cell',
        `ogx__cell--align-${colDef.align || 'left'}`,
        isSelected && 'ogx__cell--selected',
        isFocused && 'ogx__cell--focused',
        (isFocused && isFocusVisible) && 'ogx__cell--focus-visible',
        colDef.type && `ogx__cell--type-${colDef.type}`,
        isPinned && 'ogx__cell--pinned',
        isPinned && `ogx__cell--pinned-${pinnedPosition}`,
        isEditing && 'ogx__cell--editing',
        (rowSpanProp && rowSpanProp > 1) && 'ogx__cell--spanned',
        resolvedCellClassName
    ].filter(Boolean).join(' ');

    const colSpan = colSpanInfo?.cellProps?.colSpan || 1;
    const rowSpan = rowSpanProp || 1;
    const cellWidth = colSpanInfo?.cellProps?.width ?? width ?? colDef.width ?? 100;

    const style: React.CSSProperties = {
        width: 'var(--width)',
        '--width': typeof cellWidth === 'number' ? `${cellWidth}px` : cellWidth,
        flexGrow: colDef.flex ?? 0,
        flexShrink: 0,
        flexBasis: colDef.flex ? 'auto' : 'auto',
        boxSizing: 'border-box',
        minWidth: colDef.minWidth,
        maxWidth: colDef.maxWidth,
        position: isPinned ? 'sticky' : undefined,
        zIndex: colDef.zIndex ?? (isPinned ? 3 : undefined),
        padding: isEditing ? 0 : undefined
    } as React.CSSProperties;

    if (rowSpan > 1) {
        style.height = `calc(var(--height) * ${rowSpan} - var(--border-width, 1px))`;
        style.zIndex = 10;
        if (isPinned) {
            style.zIndex = 40;
        }
    }

    if (isPinned && pinnedOffset !== undefined) {
        if (pinnedPosition === 'left') {
            style.left = pinnedOffset;
        } else {
            style.right = pinnedOffset;
        }
    }

    return (
        <div
            ref={cellRef}
            className={classNames}
            style={style}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            role="gridcell"
            aria-colindex={colIndex + 1}
            aria-readonly={!isEditable || undefined}
            tabIndex={-1}
            data-field={colDef.field}
            data-colindex={colIndex}
            {...(colSpan > 1 ? { 'aria-colspan': colSpan } : {})}
            {...(rowSpan > 1 ? { 'aria-rowspan': rowSpan } : {})}
        >
            <div className="ogx__cell-content">
                {isEditing && (onCellValueChange || onValueChange) && onEditStop ? (
                    colDef.renderEditCell ? (
                        colDef.renderEditCell({
                            value,
                            row,
                            field: colDef.field,
                            colDef,
                            rowIndex,
                            colIndex
                        }) as React.ReactNode
                    ) : (
                        <GridEditInputCell
                            value={value}
                            row={row}
                            field={colDef.field}
                            colDef={colDef as unknown as GridColDef}
                            rowIndex={rowIndex}
                            colIndex={colIndex}
                            onValueChange={handleValueChange}
                            onCommit={() => onEditStop()}
                            onCancel={() => onEditStop(true)}
                        />
                    )
                ) : colDef.renderCell ? (
                    <CellErrorBoundary field={colDef.field} resetKey={value}>
                        {colDef.renderCell({
                            value,
                            row,
                            field: colDef.field,
                            colDef,
                            rowIndex,
                            colIndex,
                            rowMeta,
                        }) as React.ReactNode}
                    </CellErrorBoundary>
                ) : (
                    formattedValue as React.ReactNode
                )}
            </div>
        </div>
    );
}

export const Cell = React.memo(CellImpl) as typeof CellImpl;
