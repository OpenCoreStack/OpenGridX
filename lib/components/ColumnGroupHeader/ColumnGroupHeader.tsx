import type { GridColumnGroup, GridColumnGroupingModel, GridColDef, GridRowModel } from '../../types';
import './ColumnGroupHeader.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** All leaf field names reachable from a group node (recursive). */
function collectFields(group: GridColumnGroup): string[] {
    const fields: string[] = [];
    for (const child of group.children) {
        if (typeof child === 'string') {
            fields.push(child);
        } else {
            fields.push(...collectFields(child));
        }
    }
    return fields;
}

/** Maximum nesting depth of any group tree. */
function maxDepth(groups: GridColumnGroupingModel): number {
    let d = 0;
    function walk(g: GridColumnGroup, depth: number) {
        d = Math.max(d, depth);
        for (const child of g.children) {
            if (typeof child !== 'string') walk(child, depth + 1);
        }
    }
    groups.forEach(g => walk(g, 1));
    return d;
}

/**
 * Flattened cell descriptor for one row of group headers.
 * `span` is the pixel width, `level` is 0-indexed depth.
 */
interface GroupCell {
    key: string;
    label: string;
    width: number;          // total pixel width spanned
    isGroup: boolean;       // false → empty "filler" cell for ungrouped columns
    groupId?: string;
    headerClassName?: string;
}

/** Build one row of GroupCell descriptors for a given depth level. */
function buildRow(
    groups: GridColumnGroupingModel,
    leafColumns: string[],
    columnWidths: Record<string, number>,
    level: number,
): GroupCell[] {
    const cells: GroupCell[] = [];

    // Assign each leaf column to the group (at `level`) that contains it, if any.
    // Consecutive columns in the same group merge into one cell.

    // Build a map: field → group-at-this-level
    const fieldToGroup = new Map<string, GridColumnGroup | null>();

    function findGroupAtLevel(
        groups: GridColumnGroupingModel,
        field: string,
        currentLevel: number,
    ): GridColumnGroup | null {
        for (const g of groups) {
            const leafFields = collectFields(g);
            if (!leafFields.includes(field)) continue;
            if (currentLevel === level) return g;
            // Go deeper
            for (const child of g.children) {
                if (typeof child !== 'string') {
                    const found = findGroupAtLevel([child], field, currentLevel + 1);
                    if (found) return found;
                }
            }
            return null;
        }
        return null;
    }

    for (const f of leafColumns) {
        fieldToGroup.set(f, findGroupAtLevel(groups, f, 0));
    }

    // Merge consecutive columns belonging to the same group
    let i = 0;
    while (i < leafColumns.length) {
        const field = leafColumns[i];
        const group = fieldToGroup.get(field) ?? null;

        if (!group) {
            // Ungrouped column — filler cell spanning just this column
            cells.push({
                key: `filler-${field}-${level}`,
                label: '',
                width: columnWidths[field] ?? 100,
                isGroup: false,
            });
            i++;
        } else {
            // Collect all consecutive columns that belong to the same group instance
            let totalWidth = 0;
            let j = i;
            while (j < leafColumns.length && fieldToGroup.get(leafColumns[j]) === group) {
                totalWidth += columnWidths[leafColumns[j]] ?? 100;
                j++;
            }
            cells.push({
                key: `${group.groupId}-${level}`,
                label: group.headerName,
                width: totalWidth,
                isGroup: true,
                groupId: group.groupId,
                headerClassName: group.headerClassName,
            });
            i = j;
        }
    }

    return cells;
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface ColumnGroupHeaderProps<R extends GridRowModel = GridRowModel> {
    columnGroupingModel: GridColumnGroupingModel;
    /** The ordered, effective columns (already filtered for visibility). */
    columns: GridColDef<R>[];
    /** Resolved pixel widths for every column. */
    columnWidths: Record<string, number>;
    /** Whether a checkbox column is prepended. */
    checkboxSelection?: boolean;
    /** Whether a row-reorder handle column is prepended. */
    rowReordering?: boolean;
    /** Whether a detail-panel expand column is prepended. */
    hasDetailPanel?: boolean;
    /** height (px) of each group header row */
    groupHeaderHeight?: number;
}

export function ColumnGroupHeader<R extends GridRowModel = GridRowModel>({
    columnGroupingModel,
    columns,
    columnWidths,
    checkboxSelection = false,
    rowReordering = false,
    hasDetailPanel = false,
    groupHeaderHeight = 36,
}: ColumnGroupHeaderProps<R>) {

    const levels = maxDepth(columnGroupingModel);
    if (levels === 0 || columns.length === 0) return null;

    // Ordered leaf fields (visible columns only)
    const leafFields = columns.map(c => c.field);

    // Width of any prepended utility columns
    const CHECKBOX_W = 52;
    const REORDER_W = 40;
    const EXPAND_W = 52;
    const prefixWidth =
        (checkboxSelection ? CHECKBOX_W : 0) +
        (rowReordering ? REORDER_W : 0) +
        (hasDetailPanel ? EXPAND_W : 0);

    return (
        <>
            {Array.from({ length: levels }, (_, level) => {
                const row = buildRow(
                    columnGroupingModel,
                    leafFields,
                    columnWidths,
                    level,
                );

                return (
                    <div
                        key={`group-row-${level}`}
                        className="ogx-col-group-row"
                        style={{ height: groupHeaderHeight }}
                        role="row"
                        aria-rowindex={level + 1}
                    >
                        {/* Spacer for checkbox / reorder / expand columns */}
                        {prefixWidth > 0 && (
                            <div
                                className="ogx-col-group-cell ogx-col-group-cell--filler"
                                style={{ width: prefixWidth, minWidth: prefixWidth }}
                                role="columnheader"
                            />
                        )}

                        {row.map((cell) => (
                            <div
                                key={cell.key}
                                role="columnheader"
                                aria-colspan={undefined /* pixel-based layout */}
                                className={[
                                    'ogx-col-group-cell',
                                    cell.isGroup
                                        ? 'ogx-col-group-cell--group'
                                        : 'ogx-col-group-cell--filler',
                                    cell.headerClassName ?? '',
                                ].join(' ').trim()}
                                style={{ width: cell.width, minWidth: cell.width }}
                                title={cell.isGroup ? cell.label : undefined}
                            >
                                {cell.isGroup && (
                                    <span className="ogx-col-group-cell__label">
                                        {cell.label}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                );
            })}
        </>
    );
}
