
import React from 'react';
import type { GridColDef, GridRowModel, GridPinnedPosition, GridCellParams, GridRowMeta } from '../../types';
import type { CellColSpanInfo } from '../../hooks/features/useGridSpanning';

import { GridEditInputCell } from './GridEditInputCell';
import { CellErrorBoundary } from './CellErrorBoundary';
import { formatValueByType } from '../../utils/values';
import { attempt } from '../../utils/attempt';
import { RANGE_BOTTOM, RANGE_CELL, RANGE_FILL_HANDLE, RANGE_LEFT, RANGE_RIGHT, RANGE_TOP } from '../../utils/cellSelection';

export interface CellProps<R extends GridRowModel = GridRowModel> {
    onCellClick?: (params: GridCellParams<R>) => void;
    onCellEditStart?: (field: string, value: unknown) => void;
    onCellValueChange?: (field: string, newValue: unknown) => void;
    value: unknown;
    row: R;
    colDef: GridColDef<R>;
    rowIndex: number;
    colIndex: number;
    /** 1-based `aria-colindex` (system columns included). Defaults to `colIndex + 1`. */
    ariaColIndex?: number;
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
    /** The error the column's valueGetter threw for this cell (computed by Row); shown as a cell error. */
    valueError?: unknown;
    /**
     * Place of the cell in the selected cell range (`cellSelection`), as bit flags: in range 1, top
     * edge 2, bottom 4, left 8, right 16; 32 draws the fill handle (v3.5). 0 or absent: not in a range.
     * @since v3.3
     */
    rangeFlags?: number;
}

interface FormattedValue {
    formattedValue: string;
    error?: unknown;
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
        ariaColIndex,
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
        rowMeta,
        valueError,
        rangeFlags = 0,
    } = props;

    // All hooks must come before any early returns (Rules of Hooks)
    const handleValueChange = React.useCallback((newValue: unknown) => {
        if (onCellValueChange) {
            onCellValueChange(colDef.field, newValue);
        } else {
            onValueChange?.(newValue);
        }
    }, [onCellValueChange, onValueChange, colDef.field]);

    // A valueFormatter that throws is contained to its cell (shown as a cell error), like renderCell.
    // Synthetic rows (group, subtotal, auto-created tree parent) have no value in most columns: the
    // formatter, written for data rows, is only called for the values they do hold.
    const isSyntheticRow = rowMeta?.isGroupRow === true;
    const { formattedValue, error: formatError } = React.useMemo<FormattedValue>(() => {
        const formatter = colDef.valueFormatter;
        if (formatter && !(isSyntheticRow && value == null)) {
            const result = attempt(() => formatter({ value, row, field: colDef.field }));
            return result.ok
                ? { formattedValue: result.value }
                : { formattedValue: '', error: result.error ?? new Error('valueFormatter failed') };
        }

        // Without a formatter the column type decides: locale date, Yes / No, singleSelect label.
        return { formattedValue: formatValueByType(value, colDef) };
    }, [value, row, colDef, isSyntheticRow]);

    const resolvedCellClassName = React.useMemo(() => {
        if (!colDef.cellClassName) return '';
        const getClassName = colDef.cellClassName;
        if (typeof getClassName === 'function') {
            const result = attempt(() => getClassName({ value, formattedValue, row, field: colDef.field, colDef, rowIndex, colIndex, rowMeta }));
            return (result.ok && result.value) || '';
        }
        return colDef.cellClassName;
    }, [colDef, value, formattedValue, row, rowIndex, colIndex, rowMeta]);

    const cellError = valueError ?? formatError;

    const field = colDef.field;
    const handleCommit = React.useCallback(() => { onEditStop?.(false, field); }, [onEditStop, field]);
    const handleCancel = React.useCallback(() => { onEditStop?.(true, field); }, [onEditStop, field]);

    // A failed renderCell is retried when the row, the renderer or the value changes.
    const errorResetKey = React.useMemo(() => [row, colDef.renderCell, value], [row, colDef.renderCell, value]);

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
        (rangeFlags & RANGE_CELL) !== 0 && 'ogx__cell--range',
        (rangeFlags & RANGE_TOP) !== 0 && 'ogx__cell--range-top',
        (rangeFlags & RANGE_BOTTOM) !== 0 && 'ogx__cell--range-bottom',
        (rangeFlags & RANGE_LEFT) !== 0 && 'ogx__cell--range-left',
        (rangeFlags & RANGE_RIGHT) !== 0 && 'ogx__cell--range-right',
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
            className={classNames}
            style={style}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            role="gridcell"
            aria-colindex={ariaColIndex ?? colIndex + 1}
            aria-readonly={!isEditable || undefined}
            tabIndex={-1}
            data-field={colDef.field}
            data-colindex={colIndex}
            {...(colSpan > 1 ? { 'aria-colspan': colSpan } : {})}
            {...(rowSpan > 1 ? { 'aria-rowspan': rowSpan } : {})}
            {...((rangeFlags & RANGE_CELL) !== 0 ? { 'aria-selected': true } : {})}
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
                ) : cellError !== undefined ? (
                    <CellErrorBoundary
                        field={colDef.field}
                        resetKey={row}
                        renderFn={() => { throw cellError; }}
                    />
                ) : colDef.renderCell ? (
                    <CellErrorBoundary
                        field={colDef.field}
                        resetKey={errorResetKey}
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
                ) : colDef.type === 'image' && typeof value === 'string' && value !== '' ? (
                    <img className="ogx__cell-image" src={value} alt={colDef.headerName ?? colDef.field} loading="lazy" />
                ) : (
                    formattedValue
                )}
            </div>
            {(rangeFlags & RANGE_FILL_HANDLE) !== 0 && !isEditing && (
                <div className="ogx__cell-fill-handle" aria-hidden="true" />
            )}
        </div>
    );
}

export const Cell = React.memo(CellImpl) as typeof CellImpl;
