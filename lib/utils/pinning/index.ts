
import type { GridColDef, GridRowModel, GridColumnPinning, GridRowPinning, GridPinnedPosition, GridRowId } from '../../types';

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

    const groups = getPinnedColumnGroups(columns, pinnedColumns);

    let leftOffset = 0;

    if (rowReordering) {
        leftOffset += 48;
    }

    if (hasDetailPanel && pinExpandColumn) {
        leftOffset += 48; 
    }

    if (checkboxSelection && pinCheckboxColumn) {
        leftOffset += 48; 
    }

    groups.left.forEach(col => {
        positions[col.field] = leftOffset;
        const width = columnWidths[col.field] ?? col.width ?? 100;
        leftOffset += width;
    });

    let rightOffset = 0;

    [...groups.right].reverse().forEach(col => {
        const width = columnWidths[col.field] ?? col.width ?? 100;
        positions[col.field] = rightOffset;
        rightOffset += width;
    });

    return positions;
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

        const width = columnWidths[field] ?? col.width ?? 100;
        return total + width;
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
