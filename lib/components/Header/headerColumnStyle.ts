import type React from 'react';
import type { GridColDef, GridRowModel } from '../../types';

/**
 * Width, flex and sticky offset of a data column's cell in a header row. The column header row
 * and the header filter row both use it, so their cells line up whatever the pinning and widths.
 */
export function getHeaderColumnStyle<R extends GridRowModel>(
    colDef: GridColDef<R>,
    columnWidths: Record<string, number>,
    pinnedPosition: 'left' | 'right' | null,
    pinnedOffset: number | undefined,
): React.CSSProperties {
    const style: React.CSSProperties = {
        width: columnWidths[colDef.field] ?? colDef.width ?? 100,
        minWidth: colDef.minWidth,
        maxWidth: colDef.maxWidth,
        flexGrow: colDef.flex ?? 0,
        flexShrink: 0,
        flexBasis: 'auto',
        boxSizing: 'border-box',
        position: pinnedPosition ? 'sticky' : 'relative',
    };
    if (pinnedPosition === 'left') style.left = pinnedOffset;
    else if (pinnedPosition === 'right') style.right = pinnedOffset;
    return style;
}

