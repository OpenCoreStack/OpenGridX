import React, { useId } from 'react';
import { Checkbox } from '../ui/Checkbox';
import { ColumnResizeHandle } from '../ColumnResizeHandle/ColumnResizeHandle';
import type { GridColDef, GridRowModel, GridSortDirection, GridColumnPinning, GridAggregationModel, GridColumnGroupingModel } from '../../types';
import { isColumnPinned, calculatePinnedPositions } from '../../utils/pinning';
import { buildColumnGroupRow, getColumnGroupDepth, getColumnGroupPaths } from '../../utils/columnGroups';
import { ColumnMenu } from './ColumnMenu';


function MenuIcon() {
    return (
        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
        </svg>
    );
}

function SwapIcon() {
    return (
        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"></path>
        </svg>
    );
}


// ─── Props ────────────────────────────────────────────────────────────────────

export interface HeaderProps<R extends GridRowModel = GridRowModel> {
    columns: GridColDef<R>[];
    /**
     * Every rendered data column in render order (left-pinned, unpinned, right-pinned) with its
     * resolved width. Column group header rows are laid out over these; defaults to `columns`.
     */
    allColumns?: GridColDef<R>[];
    columnGroupingModel?: GridColumnGroupingModel;
    checkboxSelection?: boolean;
    allSelected?: boolean;
    someSelected?: boolean;
    onSelectAll?: (isSelected: boolean) => void;
    onSort?: (field: string, direction: GridSortDirection) => void;
    sortModel?: Array<{ field: string; sort: 'asc' | 'desc' }>;
    onColumnResize?: (field: string, newWidth: number) => void;
    columnWidths?: Record<string, number>;
    pinnedColumns?: GridColumnPinning;
    hasDetailPanel?: boolean;
    pinCheckboxColumn?: boolean;
    pinExpandColumn?: boolean;
    rowReordering?: boolean;
    aggregationModel?: GridAggregationModel;

    draggedColumn?: string | null;
    dragOverColumn?: string | null;
    onDragStart?: (field: string) => (event: React.DragEvent) => void;
    onDragOver?: (field: string) => (event: React.DragEvent) => void;
    onDragEnd?: () => void;
    onDrop?: (targetField: string) => (event: React.DragEvent) => void;
    focusedCell?: { id: string | number; field: string } | null;
    onHeaderClick?: (field: string) => void;
    onSortAdd?: (field: string, direction: GridSortDirection) => void;
    multiSort?: boolean;
    onHideColumn?: (field: string) => void;
    onPinColumn?: (field: string, side: 'left' | 'right' | null) => void;
    onManageColumns?: () => void;
}

export function Header<R extends GridRowModel = GridRowModel>(props: HeaderProps<R>) {
    const {
        columns,
        allColumns,
        columnGroupingModel,
        checkboxSelection = false,
        allSelected = false,
        someSelected = false,
        onSelectAll,
        onSort,
        sortModel = [],
        onColumnResize,
        columnWidths = {},
        pinnedColumns,
        hasDetailPanel = false,
        pinCheckboxColumn = true,
        pinExpandColumn = true,
        rowReordering = false,
        aggregationModel,
        draggedColumn,
        dragOverColumn,
        onDragStart,
        onDragOver,
        onDragEnd,
        onDrop,
        focusedCell,
        onHeaderClick,
        onSortAdd,
        multiSort = false,
        onHideColumn,
        onPinColumn,
        onManageColumns,
    } = props;

    const selectAllId = useId();
    const cellRefs = React.useRef<Record<string, HTMLElement | null>>({});
    const [menuOpenParams, setMenuOpenParams] = React.useState<{ colDef: GridColDef<R>; anchorEl: HTMLElement } | null>(null);

    const handleMenuOpen = (colDef: GridColDef<R>) => (event: React.MouseEvent) => {
        event.stopPropagation();
        setMenuOpenParams({ colDef, anchorEl: event.currentTarget as HTMLElement });
    };

    const handleMenuClose = () => {
        setMenuOpenParams(null);
    };

    React.useLayoutEffect(() => {
        if (focusedCell?.id === 'HEADER') {
            const element = cellRefs.current[focusedCell.field];
            if (element) {
                element.focus();
            }
        }
    }, [focusedCell]);

    const handleColumnClick = (colDef: GridColDef<R>) => (e: React.MouseEvent) => {
        if (colDef.sortable === false) return;

        const currentSort = sortModel.find(item => item.field === colDef.field);
        let newDirection: GridSortDirection = 'asc';

        if (currentSort) {
            if (currentSort.sort === 'asc') {
                newDirection = 'desc';
            } else {
                newDirection = null;
            }
        }

        if ((e.shiftKey || multiSort) && onSortAdd) {
            onSortAdd(colDef.field, newDirection);
        } else if (onSort) {
            onSort(colDef.field, newDirection);
        }
    };

    // Column menu: act on this column only. "Unsort" removes just this key, and picking a direction
    // for a column that is already sorted keeps the other keys. A new sort replaces the model
    // unless multiSort is on, matching a plain header click.
    const handleMenuSort = (field: string, direction: GridSortDirection) => {
        const isSorted = sortModel.some(item => item.field === field);
        const keepOtherKeys = direction === null || isSorted || multiSort;
        if (onSortAdd && (keepOtherKeys || !onSort)) {
            onSortAdd(field, direction);
        } else {
            onSort?.(field, direction);
        }
    };

    const getSortIcon = (field: string) => {
        const sortItem = sortModel.find(item => item.field === field);
        if (!sortItem) return null;

        const sortIndex = sortModel.length > 1 ? sortModel.indexOf(sortItem) + 1 : null;

        return (
            <span className={`ogx__sort-icon ogx__sort-icon--${sortItem.sort}`} aria-hidden="true">
                {sortIndex !== null && (
                    <span className="ogx__sort-badge">{sortIndex}</span>
                )}
            </span>
        );
    };

    const pinnedPositions = React.useMemo(() => {
        return calculatePinnedPositions(
            columns,
            columnWidths,
            pinnedColumns,
            checkboxSelection,
            pinCheckboxColumn,
            hasDetailPanel,
            pinExpandColumn,
            rowReordering
        );
    }, [columns, columnWidths, pinnedColumns, checkboxSelection, pinCheckboxColumn, hasDetailPanel, pinExpandColumn, rowReordering]);

    const groupDepth = getColumnGroupDepth(columnGroupingModel);
    const groupPaths = React.useMemo(() => getColumnGroupPaths(columnGroupingModel), [columnGroupingModel]);

    // Group rows are laid out over every rendered data column (not just the horizontal render
    // window), in render order and with the layout-resolved widths, so they line up with the headers.
    const groupColumns = React.useMemo(() => {
        if (groupDepth === 0) return [];
        return (allColumns ?? columns).map(c => ({
            field: c.field,
            width: c.isSpacer ? Number(c.width) || 0 : (columnWidths[c.field] ?? (typeof c.width === 'number' ? c.width : 100)),
            flex: c.isSpacer ? 0 : c.flex,
            pinned: c.isSpacer ? null : isColumnPinned(c.field, pinnedColumns),
            isSpacer: c.isSpacer,
        }));
    }, [groupDepth, allColumns, columns, columnWidths, pinnedColumns]);

    // --- CHECKBOX / DETAIL / REORDER prefix width (for group filler) ---
    const CHECKBOX_W = 48;
    const REORDER_W = 48;
    const EXPAND_W = 48;
    const prefixWidth =
        (rowReordering ? REORDER_W : 0) +
        (hasDetailPanel ? EXPAND_W : 0) +
        (checkboxSelection ? CHECKBOX_W : 0);
    // The prefix filler sticks with the system columns when all of them are pinned.
    const isPrefixPinned =
        (rowReordering || hasDetailPanel || checkboxSelection) &&
        (!hasDetailPanel || pinExpandColumn) &&
        (!checkboxSelection || pinCheckboxColumn);
    const systemColumnCount = (rowReordering ? 1 : 0) + (hasDetailPanel ? 1 : 0) + (checkboxSelection ? 1 : 0);

    return (
        // Outer sticky wrapper — both group rows AND column header row live here
        // so they ALL stay sticky together and scroll horizontally as one unit.
        <div className="ogx__header-wrap">
            {/* ── Group header rows ── */}
            {groupDepth > 0 && Array.from({ length: groupDepth }, (_, level) => {
                const cells = buildColumnGroupRow(groupColumns, groupPaths, level);
                return (
                    <div key={`ogx-grp-${level}`} className="ogx-col-group-row" role="row">
                        {/* Filler for checkbox / reorder / detailPanel prefix */}
                        {prefixWidth > 0 && (
                            <div
                                className={`ogx-col-group-cell ogx-col-group-cell--filler${isPrefixPinned ? ' ogx-col-group-cell--pinned ogx-col-group-cell--pinned-left' : ''}`}
                                style={{
                                    width: prefixWidth,
                                    minWidth: prefixWidth,
                                    flexShrink: 0,
                                    position: isPrefixPinned ? 'sticky' : undefined,
                                    left: isPrefixPinned ? 0 : undefined,
                                }}
                                aria-hidden="true"
                            />
                        )}
                        {cells.map(cell => {
                            const pinnedClass = cell.pinned ? ` ogx-col-group-cell--pinned ogx-col-group-cell--pinned-${cell.pinned}` : '';
                            const style: React.CSSProperties = {
                                width: cell.width,
                                minWidth: cell.width,
                                flexShrink: 0,
                                flexGrow: cell.flexGrow,
                            };
                            if (cell.pinned === 'left') {
                                style.position = 'sticky';
                                style.left = pinnedPositions[cell.fields[0]];
                            } else if (cell.pinned === 'right') {
                                style.position = 'sticky';
                                style.right = pinnedPositions[cell.fields[cell.fields.length - 1]];
                            }
                            if (!cell.isGroup) {
                                return (
                                    <div
                                        key={cell.key}
                                        className={`ogx-col-group-cell ogx-col-group-cell--filler${pinnedClass}`}
                                        style={style}
                                        aria-hidden="true"
                                    />
                                );
                            }
                            return (
                                <div
                                    key={cell.key}
                                    role="columnheader"
                                    aria-colspan={cell.fields.length}
                                    aria-colindex={systemColumnCount + cell.firstDataIndex + 1}
                                    className={`ogx-col-group-cell ogx-col-group-cell--group${pinnedClass}${cell.headerClassName ? ` ${cell.headerClassName}` : ''}`}
                                    style={style}
                                    title={cell.label}
                                >
                                    <span className="ogx-col-group-cell__label">{cell.label}</span>
                                </div>
                            );
                        })}
                    </div>
                );
            })}

            {/* ── Column header row ── */}
            <div className="ogx__header" role="row">
                { }
                {rowReordering && (
                    <div
                        className="ogx__header-cell ogx__header-cell--pinned ogx__header-cell--pinned-left"
                        role="columnheader"
                        aria-label="Row reorder handle"
                        title="Drag to reorder rows"
                        style={{
                            minWidth: 48,
                            maxWidth: 48,
                            position: 'sticky',
                            left: 0,
                            zIndex: 4
                        }}
                    />
                )}

                { }
                {hasDetailPanel && (
                    <div
                        className={`ogx__header-cell ogx__header-cell--expand ${pinExpandColumn ? 'ogx__header-cell--pinned ogx__header-cell--pinned-left' : ''
                            }`}
                        role="columnheader"
                        aria-label="Expand row details"
                        style={{
                            minWidth: 48,
                            maxWidth: 48,
                            position: pinExpandColumn ? 'sticky' : undefined,
                            left: pinExpandColumn ? (rowReordering ? 48 : 0) : undefined,
                            zIndex: pinExpandColumn ? 5 : undefined
                        }}
                    >
                        { }
                    </div>
                )}

                { }
                {checkboxSelection && (
                    <div
                        className={`ogx__header-cell ogx__header-cell--checkbox ${pinCheckboxColumn ? 'ogx__header-cell--pinned ogx__header-cell--pinned-left' : ''
                            }`}
                        role="columnheader"
                        style={{
                            position: pinCheckboxColumn ? 'sticky' : undefined,
                            left: pinCheckboxColumn ? ((rowReordering ? 48 : 0) + (hasDetailPanel && pinExpandColumn ? 48 : 0)) : undefined,

                        }}
                    >
                        {/* No select-all without a handler (single-row selection has none). */}
                        {onSelectAll && (
                            <Checkbox
                                id={selectAllId}
                                name={selectAllId}
                                checked={allSelected}
                                indeterminate={someSelected}
                                onChange={(e) => onSelectAll(e.target.checked)}
                                aria-label={allSelected ? 'Deselect all rows' : 'Select all rows'}
                                tabIndex={focusedCell?.id === 'HEADER' && focusedCell.field === '__checkbox_col__' ? 0 : -1}
                                onMouseDown={(e) => e.preventDefault()}
                                inputRef={(el) => { cellRefs.current['__checkbox_col__'] = el; }}
                            />
                        )}
                    </div>
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
                    const isSortable = colDef.sortable !== false;
                    const isSorted = sortModel.some(item => item.field === colDef.field);
                    const isResizable = colDef.resizable !== false;
                    const pinnedPosition = isColumnPinned(colDef.field, pinnedColumns);
                    const isPinned = pinnedPosition !== null;
                    const isDragging = draggedColumn === colDef.field;
                    const isDragOver = dragOverColumn === colDef.field;

                    const classNames = [
                        'ogx__header-cell',
                        `ogx__header-cell--align-${colDef.headerAlign || colDef.align || 'left'}`,
                        isSortable && 'ogx__header-cell--sortable',
                        isSorted && 'ogx__header-cell--sorted',
                        isPinned && `ogx__header-cell--pinned`,
                        isPinned && `ogx__header-cell--pinned-${pinnedPosition}`,
                        isDragging && 'ogx__header-cell--dragging',
                        isDragOver && 'ogx__header-cell--drag-over',
                        (focusedCell?.id === 'HEADER' && focusedCell.field === colDef.field) && 'ogx__header-cell--focused',
                        colDef.headerClassName
                    ].filter(Boolean).join(' ');

                    const effectiveWidth = columnWidths[colDef.field] ?? colDef.width ?? 100;

                    const style: React.CSSProperties = {
                        width: effectiveWidth,
                        minWidth: colDef.minWidth,
                        maxWidth: colDef.maxWidth,
                        flexGrow: colDef.flex ?? 0,
                        flexShrink: 0,
                        flexBasis: colDef.flex ? 'auto' : 'auto',
                        boxSizing: 'border-box',
                        position: isPinned ? 'sticky' : 'relative',
                        zIndex: colDef.zIndex,
                        opacity: isDragging ? 0.5 : 1
                    };

                    if (isPinned && pinnedPosition) {
                        const offset = pinnedPositions[colDef.field];
                        if (pinnedPosition === 'left') {
                            style.left = offset;
                        } else {
                            style.right = offset;
                        }
                    }

                    const headerContent = colDef.renderHeader
                        ? colDef.renderHeader({ field: colDef.field, colDef: colDef as unknown as GridColDef, colIndex: index })
                        : colDef.headerName || colDef.field;

                    const handleHeaderClick = (e: React.MouseEvent) => {
                        if ((e.target as HTMLElement).closest('.ogx-column-resize-handle')) {
                            e.stopPropagation();
                            return;
                        }
                        onHeaderClick?.(colDef.field);
                        if (isSortable) {
                            handleColumnClick(colDef)(e);
                        }
                    };

                    const handleDragStart = onDragStart ? onDragStart(colDef.field) : undefined;
                    const handleDragOver = onDragOver ? onDragOver(colDef.field) : undefined;
                    const handleDrop = onDrop ? onDrop(colDef.field) : undefined;

                    return (
                        <div
                            key={colDef.field}
                            className={classNames}
                            style={style}
                            title={colDef.description}
                            onClick={handleHeaderClick}
                            role="columnheader"
                            draggable={!!onDragStart}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={onDragEnd}
                            onDrop={handleDrop}
                            aria-sort={
                                isSortable
                                    ? (isSorted
                                        ? sortModel.find(item => item.field === colDef.field)?.sort === 'asc'
                                            ? 'ascending'
                                            : 'descending'
                                        : 'none')
                                    : undefined
                            }
                            aria-colindex={index + 1 + (checkboxSelection ? 1 : 0)}
                            data-field={colDef.field}
                            tabIndex={-1}
                            ref={(el) => { cellRefs.current[colDef.field] = el; }}
                        >
                            <div className="ogx__header-cell-content">
                                {isDragging && (
                                    <div className="ogx__header-drag-icon">
                                        <SwapIcon />
                                    </div>
                                )}
                                <div className="ogx__header-cell-title-wrapper">
                                    <span className="ogx__header-cell-title">
                                        {headerContent}
                                    </span>
                                    {aggregationModel && aggregationModel[colDef.field] && (
                                        <span className="ogx__header-cell-aggregation">
                                            {aggregationModel[colDef.field]}
                                        </span>
                                    )}
                                </div>
                                {isSortable && getSortIcon(colDef.field)}
                                {!colDef.disableColumnMenu && (
                                    <button
                                        className="ogx__menu-icon-btn"
                                        onClick={handleMenuOpen(colDef)}
                                        aria-label={`Open column menu for ${colDef.headerName || colDef.field}`}
                                        aria-haspopup="menu"
                                        tabIndex={-1}
                                    >
                                        <MenuIcon />
                                    </button>
                                )}
                            </div>

                            { }
                            {isResizable && onColumnResize && (
                                <ColumnResizeHandle
                                    field={colDef.field}
                                    currentWidth={effectiveWidth}
                                    onResize={onColumnResize}
                                    minWidth={colDef.minWidth}
                                    maxWidth={colDef.maxWidth}
                                />
                            )}
                        </div>
                    );
                })}

                {menuOpenParams && (
                    <ColumnMenu
                        colDef={menuOpenParams.colDef as unknown as GridColDef<GridRowModel>}
                        sortModel={sortModel}
                        onSort={onSort || onSortAdd ? handleMenuSort : undefined}
                        onHide={onHideColumn}
                        onPin={onPinColumn}
                        pinnedColumns={pinnedColumns}
                        onManageColumns={onManageColumns}
                        onClose={handleMenuClose}
                        anchorEl={menuOpenParams.anchorEl}
                    />
                )}
            </div>{/* end .ogx__header */}
        </div>
    );
}
