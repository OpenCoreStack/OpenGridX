import React from 'react';
import { Checkbox } from '../ui/Checkbox';
import { ColumnResizeHandle } from '../ColumnResizeHandle/ColumnResizeHandle';
import type { GridColDef, GridRowModel, GridSortDirection, GridColumnPinning, GridAggregationModel, GridColumnGroup, GridColumnGroupingModel } from '../../types';
import { isColumnPinned, calculatePinnedPositions } from '../../utils/pinning';
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


// ─── Group header helpers ─────────────────────────────────────────────────────

/** Collect all leaf field names from a group node (recursive). */
function collectGroupFields(group: GridColumnGroup): string[] {
    const out: string[] = [];
    for (const child of group.children) {
        if (typeof child === 'string') out.push(child);
        else out.push(...collectGroupFields(child));
    }
    return out;
}

/** Max nesting depth of the group tree (1 = single level). */
function groupTreeDepth(groups: GridColumnGroupingModel): number {
    let d = 0;
    function walk(g: GridColumnGroup, depth: number) {
        d = Math.max(d, depth);
        for (const c of g.children) if (typeof c !== 'string') walk(c, depth + 1);
    }
    groups.forEach(g => walk(g, 1));
    return d;
}

interface GroupCell { key: string; label: string; width: number; isGroup: boolean; }

/**
 * Builds the flat array of GroupCell descriptors for one row (level).
 * level 0 = top-most group row.
 * allFields is the ORDERED list of all visible columns (including spacers).
 */
function buildGroupRow(
    groups: GridColumnGroupingModel,
    allFields: { field: string; width: number }[],
    level: number,
): GroupCell[] {
    // Map each field → the group that owns it at `level`
    function findAtLevel(g: GridColumnGroup, field: string, cur: number): GridColumnGroup | null {
        if (!collectGroupFields(g).includes(field)) return null;
        if (cur === level) return g;
        for (const child of g.children) {
            if (typeof child !== 'string') {
                const found = findAtLevel(child, field, cur + 1);
                if (found) return found;
            }
        }
        return null;
    }

    const fieldGroup = new Map<string, GridColumnGroup | null>();
    for (const f of allFields) {
        let found: GridColumnGroup | null = null;
        for (const g of groups) {
            found = findAtLevel(g, f.field, 0);
            if (found) break;
        }
        fieldGroup.set(f.field, found);
    }

    const cells: GroupCell[] = [];
    let i = 0;
    while (i < allFields.length) {
        const item = allFields[i];
        const group = fieldGroup.get(item.field) ?? null;
        const w = item.width;

        if (!group) {
            cells.push({ key: `fg-${item.field}-${level}`, label: '', width: w, isGroup: false });
            i++;
        } else {
            let totalW = 0;
            let j = i;
            while (j < allFields.length && fieldGroup.get(allFields[j].field) === group) {
                totalW += allFields[j].width;
                j++;
            }
            cells.push({ key: `${group.groupId}-${level}`, label: group.headerName, width: totalW, isGroup: true });
            i = j;
        }
    }
    return cells;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface HeaderProps<R extends GridRowModel = GridRowModel> {
    columns: GridColDef<R>[];
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
        onHideColumn,
        onPinColumn,
        onManageColumns,
    } = props;

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

    const handleColumnClick = (colDef: GridColDef<R>) => () => {
        if (colDef.sortable === false || !onSort) return;

        const currentSort = sortModel.find(item => item.field === colDef.field);
        let newDirection: GridSortDirection = 'asc';

        if (currentSort) {
            if (currentSort.sort === 'asc') {
                newDirection = 'desc';
            } else {
                newDirection = null;
            }
        }

        onSort(colDef.field, newDirection);
    };

    const getSortIcon = (field: string) => {
        const sortItem = sortModel.find(item => item.field === field);
        if (!sortItem) return null;

        return (
            <span className={`ogx__sort-icon ogx__sort-icon--${sortItem.sort}`} aria-hidden="true" />
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

    const groupDepth = columnGroupingModel ? groupTreeDepth(columnGroupingModel) : 0;

    // All non-spacer fields in order (for group-span math) with their effective physical width
    const allCols = allColumns ?? columns;
    const allLeafFields = allCols
        .filter(c => !(c as any).isSpacer)
        .map(c => ({
            field: c.field,
            width: columnWidths[c.field] ?? c.width ?? 100
        }));

    // --- CHECKBOX / DETAIL / REORDER prefix width (for group filler) ---
    const CHECKBOX_W = 48;
    const REORDER_W = 48;
    const EXPAND_W = 48;
    const prefixWidth =
        (rowReordering ? REORDER_W : 0) +
        (hasDetailPanel ? EXPAND_W : 0) +
        (checkboxSelection ? CHECKBOX_W : 0);

    return (
        // Outer sticky wrapper — both group rows AND column header row live here
        // so they ALL stay sticky together and scroll horizontally as one unit.
        <div className="ogx__header-wrap">
            {/* ── Group header rows ── */}
            {groupDepth > 0 && Array.from({ length: groupDepth }, (_, level) => {
                const row = buildGroupRow(
                    columnGroupingModel!,
                    allLeafFields,
                    level,
                );
                return (
                    <div key={`ogx-grp-${level}`} className="ogx-col-group-row" role="row">
                        {/* Filler for checkbox / reorder / detailPanel prefix */}
                        {prefixWidth > 0 && (
                            <div
                                className="ogx-col-group-cell ogx-col-group-cell--filler"
                                style={{ width: prefixWidth, minWidth: prefixWidth, flexShrink: 0 }}
                                role="columnheader"
                            />
                        )}
                        {row.map(cell => (
                            <div
                                key={cell.key}
                                role="columnheader"
                                className={`ogx-col-group-cell ${cell.isGroup ? 'ogx-col-group-cell--group' : 'ogx-col-group-cell--filler'}`}
                                style={{ width: cell.width, minWidth: cell.width, flexShrink: 0 }}
                                title={cell.isGroup ? cell.label : undefined}
                            >
                                {cell.isGroup && (
                                    <span className="ogx-col-group-cell__label">{cell.label}</span>
                                )}
                            </div>
                        ))}
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
                        <Checkbox
                            id="ogx-select-all"
                            name="ogx-select-all"
                            checked={allSelected}
                            indeterminate={someSelected}
                            onChange={(e) => onSelectAll?.(e.target.checked)}
                            aria-label={allSelected ? 'Deselect all rows' : 'Select all rows'}
                            tabIndex={focusedCell?.id === 'HEADER' && focusedCell.field === '__checkbox_col__' ? 0 : -1}
                            onMouseDown={(e) => e.preventDefault()}
                            inputRef={(el) => { cellRefs.current['__checkbox_col__'] = el; }}
                        />
                    </div>
                )}

                {columns.map((colDef, index) => {
                    if ((colDef as any).isSpacer) {
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
                        ? colDef.renderHeader({ field: colDef.field, colDef: colDef as any, colIndex: index })
                        : colDef.headerName || colDef.field;

                    const handleHeaderClick = (e: React.MouseEvent) => {
                        if ((e.target as HTMLElement).closest('.ogx-column-resize-handle')) {
                            e.stopPropagation();
                            return;
                        }
                        onHeaderClick?.(colDef.field);
                        if (isSortable) {
                            handleColumnClick(colDef)();
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
                        colDef={menuOpenParams.colDef}
                        sortModel={sortModel}
                        onSort={onSort}
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
