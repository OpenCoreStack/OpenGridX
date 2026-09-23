
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
    /**
     * The cell is the last left-pinned or first right-pinned cell of its row: it gets
     * `ogx__cell--pinned-left-last` / `ogx__cell--pinned-right-first` (the section edge shadow).
     */
    isPinnedEdge?: boolean;

    isFocused?: boolean;
    isFocusVisible?: boolean;

    /** Whether this cell may enter edit mode (column, row and `isCellEditable` already resolved). */
    isEditable?: boolean;
    isEditing?: boolean;
    onEditStart?: () => void;
    /** Ends this cell's edit. `field` identifies the cell, so a late call cannot end another cell's edit. */
    onEditStop?: (cancel?: boolean, field?: string) => void;
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
        isPinnedEdge,
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
            return colDef.cellClassName({ value, formattedValue, row, field: colDef.field, colDef, rowIndex, colIndex, rowMeta }) || '';
        }
        return colDef.cellClassName;
    }, [colDef, value, formattedValue, row, rowIndex, colIndex, rowMeta]);

    const field = colDef.field;
    const handleCommit = React.useCallback(() => { onEditStop?.(false, field); }, [onEditStop, field]);
    const handleCancel = React.useCallback(() => { onEditStop?.(true, field); }, [onEditStop, field]);

    const cellRef = React.useRef<HTMLDivElement>(null);

    React.useLayoutEffect(() => {
        if (isFocused && cellRef.current) {
            cellRef.current.focus({ preventScroll: true });
        }
    }, [isFocused]);

    // A cell that unmounts while editing (scrolled out of the render window, filtered or paged away)
    // gets no blur, so its edit would be left open with no editor. Commit it instead, as blur would.
    // Deferred to a microtask so React StrictMode's simulated unmount + remount does not commit.
    const editorMountedRef = React.useRef(false);
    React.useEffect(() => {
        if (!isEditing || !onEditStop) return;
        editorMountedRef.current = true;
        return () => {
            editorMountedRef.current = false;
            queueMicrotask(() => {
                if (!editorMountedRef.current) onEditStop(false, field);
            });
        };
    }, [isEditing, onEditStop, field]);

    if (colSpanInfo?.spannedByColSpan) {
        return null;
    }

    const colSpan = colSpanInfo?.cellProps.colSpan ?? 1;
    const isColSpanOrigin = colSpan > 1;
    // A merged cell takes the summed widths of the columns it covers (computed by Row from the
    // resolved layout widths); the origin column's own min/max width does not apply to it.
    const cellWidth = (isColSpanOrigin ? colSpanInfo?.cellProps.width : undefined) ?? width ?? colDef.width ?? 100;
    const sizeStyle: React.CSSProperties = {
        width: 'var(--width)',
        '--width': typeof cellWidth === 'number' ? `${cellWidth}px` : cellWidth,
        flexGrow: (isColSpanOrigin ? colSpanInfo?.cellProps.flexGrow : undefined) ?? colDef.flex ?? 0,
        flexShrink: 0,
        flexBasis: 'auto',
        boxSizing: 'border-box',
        minWidth: isColSpanOrigin ? undefined : colDef.minWidth,
        maxWidth: isColSpanOrigin ? undefined : colDef.maxWidth,
    } as React.CSSProperties;

    if (isHiddenByRowSpan) {
        // Keeps the covered column's slot so the rest of the row stays under its headers.
        return (
            <div
                className="ogx__cell ogx__cell--hidden"
                style={sizeStyle}
                role="presentation"
                data-field={colDef.field}
                data-colindex={colIndex}
            />
        );
    }

    const handleClick = (e: React.MouseEvent) => {
        // Clicks inside an open editor (placing the caret, opening a select) belong to the editor:
        // treating them as cell clicks would move focus to the grid and commit the edit.
        if (isEditing) return;
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

    // The double-click is left to bubble so the row's onRowDoubleClick still fires.
    const handleDoubleClick = () => {
        // Double-clicking inside an open editor (to select a word) must not restart the edit.
        if (isEditing || !isEditable) return;
        if (onCellEditStart) {
            onCellEditStart(colDef.field, value);
        } else {
            onEditStart?.();
        }
    };

    const renderEditCell = colDef.renderEditCell;

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
        isPinned && isPinnedEdge && `ogx__cell--pinned-${pinnedPosition}-${pinnedPosition === 'left' ? 'last' : 'first'}`,
        isEditing && 'ogx__cell--editing',
        (rowSpanProp && rowSpanProp > 1) && 'ogx__cell--spanned',
        resolvedCellClassName
    ].filter(Boolean).join(' ');

    const rowSpan = rowSpanProp || 1;

    const style: React.CSSProperties = {
        ...sizeStyle,
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
                    renderEditCell ? (
                        <CellErrorBoundary
                            field={colDef.field}
                            resetKey={row}
                            renderFn={() => renderEditCell({
                                value,
                                formattedValue,
                                row,
                                field: colDef.field,
                                colDef,
                                rowIndex,
                                colIndex,
                                rowMeta,
                                onValueChange: handleValueChange,
                                onCommit: handleCommit,
                                onCancel: handleCancel,
                            })}
                        />
                    ) : (
                        <GridEditInputCell
                            value={value}
                            formattedValue={formattedValue}
                            row={row}
                            field={colDef.field}
                            colDef={colDef as unknown as GridColDef}
                            rowIndex={rowIndex}
                            colIndex={colIndex}
                            rowMeta={rowMeta}
                            onValueChange={handleValueChange}
                            onCommit={handleCommit}
                            onCancel={handleCancel}
                        />
                    )
                ) : colDef.renderCell ? (
                    <CellErrorBoundary
                        field={colDef.field}
                        resetKey={row}
                        renderFn={() => colDef.renderCell!({
                            value,
                            formattedValue,
                            row,
                            field: colDef.field,
                            colDef,
                            rowIndex,
                            colIndex,
                            rowMeta,
                        })}
                    />
                ) : (
                    formattedValue
                )}
            </div>
        </div>
    );
}

export const Cell = React.memo(CellImpl) as typeof CellImpl;
