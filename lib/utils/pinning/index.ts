
import type { GridColDef, GridRowModel, GridColumnPinning, GridRowPinning, GridPinnedPosition, GridRowId } from '../../types';
import { getRenderedColumnWidth } from '../columnWidth';

/** Width of each built-in system column (drag handle, detail-panel toggle, checkbox). */
export const SYSTEM_COLUMN_WIDTH = 48;

export function isColumnPinned(field: string, pinnedColumns?: GridColumnPinning): GridPinnedPosition | null {
    if (!pinnedColumns) return null;

    if (pinnedColumns.left?.includes(field)) {
        return 'left';
    }

    if (pinnedColumns.right?.includes(field)) {
        return 'right';
    }

    return null;
}

/**
 * Splits columns into left-pinned, unpinned and right-pinned groups. The unpinned group keeps
 * column order; the pinned groups follow the order of `pinnedColumns.left` / `.right`, which is
 * the order the grid renders them in.
 */
export function getPinnedColumnGroups<R extends GridRowModel = GridRowModel>(
    columns: GridColDef<R>[],
    pinnedColumns?: GridColumnPinning
): {
    left: GridColDef<R>[];
    center: GridColDef<R>[];
    right: GridColDef<R>[];
} {
    const left: GridColDef<R>[] = [];
    const center: GridColDef<R>[] = [];
    const right: GridColDef<R>[] = [];

    if (!pinnedColumns) {
        return { left, center: columns, right };
    }

    columns.forEach(col => {
        const pinnedPosition = isColumnPinned(col.field, pinnedColumns);

        if (pinnedPosition === 'left') {
            left.push(col);
        } else if (pinnedPosition === 'right') {
            right.push(col);
        } else {
            center.push(col);
        }
    });

    if (pinnedColumns.left) {
        left.sort((a, b) => {
            const aIndex = pinnedColumns.left!.indexOf(a.field);
            const bIndex = pinnedColumns.left!.indexOf(b.field);
            return aIndex - bIndex;
        });
    }

    if (pinnedColumns.right) {
        right.sort((a, b) => {
            const aIndex = pinnedColumns.right!.indexOf(a.field);
            const bIndex = pinnedColumns.right!.indexOf(b.field);
            return aIndex - bIndex;
        });
    }

    return { left, center, right };
}

/**
 * Sticky `left` / `right` offsets of the pinned columns, in pixels. Offsets follow the order of
 * `columns`, which must be the order the cells are rendered in (the grid renders pinned columns
 * in `pinnedColumns.left` / `.right` order), and use each column's rendered width (see
 * `getRenderedColumnWidth`). Left offsets start after the pinned system columns.
 */
export function calculatePinnedPositions<R extends GridRowModel = GridRowModel>(
    columns: GridColDef<R>[],
    columnWidths: Record<string, number>,
    pinnedColumns?: GridColumnPinning,
    checkboxSelection?: boolean,
    pinCheckboxColumn?: boolean,
    hasDetailPanel?: boolean,
    pinExpandColumn?: boolean,
    rowReordering?: boolean
): Record<string, number> {
    const positions: Record<string, number> = {};

    if (!pinnedColumns) return positions;

    let leftOffset =
        (rowReordering ? SYSTEM_COLUMN_WIDTH : 0) +
        (hasDetailPanel && pinExpandColumn ? SYSTEM_COLUMN_WIDTH : 0) +
        (checkboxSelection && pinCheckboxColumn ? SYSTEM_COLUMN_WIDTH : 0);
    const right: GridColDef<R>[] = [];

    columns.forEach(col => {
        if (col.isSpacer) return;
        const side = isColumnPinned(col.field, pinnedColumns);
        if (side === 'left') {
            positions[col.field] = leftOffset;
            leftOffset += getRenderedColumnWidth(col, columnWidths);
        } else if (side === 'right') {
            right.push(col);
        }
    });

    let rightOffset = 0;
    for (let i = right.length - 1; i >= 0; i--) {
        positions[right[i].field] = rightOffset;
        rightOffset += getRenderedColumnWidth(right[i], columnWidths);
    }

    return positions;
}

/**
 * The last rendered left-pinned column and the first rendered right-pinned column: the cells that
 * carry the pinned-section edge classes. `columns` is in render order; spacers are skipped.
 */
export function getPinnedEdgeFields<R extends GridRowModel = GridRowModel>(
    columns: GridColDef<R>[],
    pinnedColumns?: GridColumnPinning
): { lastLeft: string | null; firstRight: string | null } {
    let lastLeft: string | null = null;
    let firstRight: string | null = null;
    if (!pinnedColumns) return { lastLeft, firstRight };
    for (const col of columns) {
        if (col.isSpacer) continue;
        const side = isColumnPinned(col.field, pinnedColumns);
        if (side === 'left') lastLeft = col.field;
        else if (side === 'right' && firstRight === null) firstRight = col.field;
    }
    return { lastLeft, firstRight };
}

export function isColumnPinnable<R extends GridRowModel = GridRowModel>(
    colDef: GridColDef<R>
): boolean {
    return colDef.pinnable !== false;
}

export function pinColumn(
    field: string,
    position: GridPinnedPosition,
    currentPinning?: GridColumnPinning
): GridColumnPinning {
    const newPinning: GridColumnPinning = {
        left: [...(currentPinning?.left || [])],
        right: [...(currentPinning?.right || [])]
    };

    newPinning.left = (newPinning.left || []).filter(f => f !== field);
    newPinning.right = (newPinning.right || []).filter(f => f !== field);

    if (position === 'left') {
        if (!newPinning.left) newPinning.left = [];
        newPinning.left.push(field);
    } else {
        if (!newPinning.right) newPinning.right = [];
        newPinning.right.push(field);
    }

    return newPinning;
}

export function unpinColumn(
    field: string,
    currentPinning?: GridColumnPinning
): GridColumnPinning {
    if (!currentPinning) return {};

    return {
        left: currentPinning.left?.filter(f => f !== field) || [],
        right: currentPinning.right?.filter(f => f !== field) || []
    };
}

export function getPinnedColumnsWidth(
    columns: GridColDef[],
    columnWidths: Record<string, number>,
    position: GridPinnedPosition,
    pinnedColumns?: GridColumnPinning
): number {
    if (!pinnedColumns) return 0;

    const pinnedFields = position === 'left' ? pinnedColumns.left : pinnedColumns.right;
    if (!pinnedFields) return 0;

    return pinnedFields.reduce((total, field) => {
        const col = columns.find(c => c.field === field);
        if (!col) return total;

        return total + getRenderedColumnWidth(col, columnWidths);
    }, 0);
}

export function isRowPinned(
    rowId: GridRowId,
    pinnedRows?: GridRowPinning
): 'top' | 'bottom' | null {
    if (!pinnedRows) return null;

    if (pinnedRows.top?.includes(rowId)) {
        return 'top';
    }

    if (pinnedRows.bottom?.includes(rowId)) {
        return 'bottom';
    }

    return null;
}

export function getPinnedRowGroups<R extends GridRowModel = GridRowModel>(
    rows: R[],
    pinnedRows?: GridRowPinning
): {
    top: R[];
    center: R[];
    bottom: R[];
} {
    const top: R[] = [];
    const center: R[] = [];
    const bottom: R[] = [];

    if (!pinnedRows) {
        return { top, center: rows, bottom };
    }

    rows.forEach(row => {
        const pinnedPosition = isRowPinned(row.id, pinnedRows);

        if (pinnedPosition === 'top') {
            top.push(row);
        } else if (pinnedPosition === 'bottom') {
            bottom.push(row);
        } else {
            center.push(row);
        }
    });

    if (pinnedRows.top) {
        top.sort((a, b) => {
            const aIndex = pinnedRows.top!.indexOf(a.id);
            const bIndex = pinnedRows.top!.indexOf(b.id);
            return aIndex - bIndex;
        });
    }

    if (pinnedRows.bottom) {
        bottom.sort((a, b) => {
            const aIndex = pinnedRows.bottom!.indexOf(a.id);
            const bIndex = pinnedRows.bottom!.indexOf(b.id);
            return aIndex - bIndex;
        });
    }

    return { top, center, bottom };
}

export function pinRow(
    rowId: GridRowId,
    position: 'top' | 'bottom',
    currentPinning?: GridRowPinning
): GridRowPinning {
    const newPinning: GridRowPinning = {
        top: [...(currentPinning?.top || [])],
        bottom: [...(currentPinning?.bottom || [])]
    };

    newPinning.top = (newPinning.top || []).filter(id => id !== rowId);
    newPinning.bottom = (newPinning.bottom || []).filter(id => id !== rowId);

    if (position === 'top') {
        if (!newPinning.top) newPinning.top = [];
        newPinning.top.push(rowId);
    } else {
        if (!newPinning.bottom) newPinning.bottom = [];
        newPinning.bottom.push(rowId);
    }

    return newPinning;
}

export function unpinRow(
    rowId: GridRowId,
    currentPinning?: GridRowPinning
): GridRowPinning {
    if (!currentPinning) return {};

    return {
        top: currentPinning.top?.filter(id => id !== rowId) || [],
        bottom: currentPinning.bottom?.filter(id => id !== rowId) || []
    };
}

export function getPinnedRowsCount(
    position: 'top' | 'bottom',
    pinnedRows?: GridRowPinning
): number {
    if (!pinnedRows) return 0;

    const pinnedIds = position === 'top' ? pinnedRows.top : pinnedRows.bottom;
    return pinnedIds?.length || 0;
}
