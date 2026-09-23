import type { GridColumnGroup, GridColumnGroupingModel, GridPinnedPosition } from '../types';

/** Number of group header rows a model renders (its maximum nesting depth; 0 when there is none). */
export function getColumnGroupDepth(model?: GridColumnGroupingModel): number {
    if (!model) return 0;
    let depth = 0;
    const walk = (group: GridColumnGroup, level: number) => {
        depth = Math.max(depth, level);
        for (const child of group.children) {
            if (typeof child !== 'string') walk(child, level + 1);
        }
    };
    model.forEach(group => walk(group, 1));
    return depth;
}

/** Maps every leaf field to its group path, outermost group first. */
export function getColumnGroupPaths(model?: GridColumnGroupingModel): Map<string, GridColumnGroup[]> {
    const paths = new Map<string, GridColumnGroup[]>();
    if (!model) return paths;
    const walk = (group: GridColumnGroup, path: GridColumnGroup[]) => {
        const next = [...path, group];
        for (const child of group.children) {
            if (typeof child === 'string') {
                if (!paths.has(child)) paths.set(child, next);
            } else {
                walk(child, next);
            }
        }
    };
    model.forEach(group => walk(group, []));
    return paths;
}

/**
 * Whether moving `fromField` to the position of `toField` keeps every column group contiguous:
 * both fields must sit in the same innermost group (or both be ungrouped).
 */
export function canReorderWithinColumnGroups(model: GridColumnGroupingModel | undefined, fromField: string, toField: string): boolean {
    if (!model || model.length === 0) return true;
    const paths = getColumnGroupPaths(model);
    const from = paths.get(fromField);
    const to = paths.get(toField);
    return (from?.[from.length - 1] ?? null) === (to?.[to.length - 1] ?? null);
}

export interface ColumnGroupRowColumn {
    field: string;
    width: number;
    flex?: number;
    pinned: GridPinnedPosition | null;
    /** Horizontal-virtualization spacer: counts as ungrouped width. */
    isSpacer?: boolean;
}

export interface ColumnGroupRowCell {
    key: string;
    isGroup: boolean;
    label: string;
    headerClassName?: string;
    width: number;
    flexGrow: number;
    /** Data (non-spacer) fields the cell covers, in order. */
    fields: string[];
    /** Index of the first covered data column among all rendered data columns. */
    firstDataIndex: number;
    pinned: GridPinnedPosition | null;
}

/**
 * Builds one group header row (level 0 = outermost). Consecutive columns that share the group at
 * `level` and the same pinned section form one cell; consecutive ungrouped columns form one filler.
 * A group whose columns are not adjacent (hidden columns excepted) renders one cell per run.
 */
export function buildColumnGroupRow(
    columns: ColumnGroupRowColumn[],
    paths: Map<string, GridColumnGroup[]>,
    level: number,
): ColumnGroupRowCell[] {
    const cells: ColumnGroupRowCell[] = [];
    let dataIndex = 0;
    let current: ColumnGroupRowCell | null = null;
    let currentGroup: GridColumnGroup | null = null;

    for (const column of columns) {
        const group = column.isSpacer ? null : (paths.get(column.field)?.[level] ?? null);
        if (current === null || currentGroup !== group || current.pinned !== column.pinned) {
            current = {
                key: `${group ? group.groupId : 'filler'}-${level}-${column.field}`,
                isGroup: group !== null,
                label: group?.headerName ?? '',
                headerClassName: group?.headerClassName,
                width: 0,
                flexGrow: 0,
                fields: [],
                firstDataIndex: dataIndex,
                pinned: column.pinned,
            };
            currentGroup = group;
            cells.push(current);
        }
        current.width += column.width;
        current.flexGrow += column.flex ?? 0;
        if (!column.isSpacer) {
            current.fields.push(column.field);
            dataIndex++;
        }
    }
    return cells;
}
