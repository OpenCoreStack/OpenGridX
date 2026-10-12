/** Unique identifier for a row (string or number). */
export type GridRowId = string | number;

/** Base interface for a grid row data object. */
export interface GridRowModel {
  /** Uniquely identifies the row. */
  id: GridRowId;
  /** Internal: row is a skeleton placeholder during infinite-scroll loading. */
  _isSkeleton?: boolean;
  /** Internal: server-reported child count for lazy-loaded tree nodes. */
  serverChildrenCount?: number;
  /** Any other dynamic row properties. */
  [key: string]: unknown;
}

/**
 * The constraint on the row type `R` of the generic grid types (`DataGridProps<R>`, `GridColDef<R>`,
 * `GridRenderCellParams<R>` …): any object type. Your own interfaces and type aliases can be used as `R`
 * directly; they do not need an index signature or to extend `GridRowModel`. Rows without an `id`
 * field need `getRowId`. `GridRowModel` stays the default `R` (rows with any keys, read as `unknown`).
 * @since v3.0
 */
export type GridValidRowModel = object;

/**
 * Hierarchy metadata for a row. Exposed via `params.rowMeta` in `renderCell`.
 * Not present (`undefined`) for flat rows with no active tree-data or row-grouping.
 *
 * @since v1.1 — replaces the `_hasChildren` / `_treeDepth` / `_groupingField` etc.
 * fields that were injected onto row objects. Since v3.0 those fields are no longer
 * added at runtime: row objects reach `renderCell` exactly as you passed them.
 */
export interface GridRowMeta {
    /** The row has children to show: the expand toggle is rendered for it. */
    hasChildren?: boolean;
    treeDepth?: number;
    groupingField?: string;
    groupingValue?: unknown;
    /** The label the grid shows for a synthetic row: the group label, or the path segment of an auto-created tree parent. */
    groupLabel?: string;
    /**
     * Data rows below this row at any depth that pass the active filter (row-grouping leaves, or
     * tree-data rows; auto-created tree parents are not counted). The "(n)" shown next to group labels.
     */
    descendantCount?: number;
    isExpanded?: boolean;
    /**
     * The row is synthetic: a row-grouping group row, a group subtotal row, or a tree-data parent the
     * grid created for a path segment with no row of its own. Synthetic rows are never selected,
     * edited or given a detail panel, and `valueGetter` is not called for them.
     */
    isGroupRow?: boolean;
    /**
     * The row is the subtotal row of the group described by `groupingField` / `groupingValue`, shown
     * after the group's children when `getAggregationPosition` returns `'footer'` for it.
     * @since v3.0
     */
    isGroupFooter?: boolean;
}

/** Represents a row node in the grid's hierarchical tree structure. */
export interface GridTreeNode {
    /** Unique ID of the row. */
    id: GridRowId;
    /** ID of the parent node, or null if root. */
    parentId: GridRowId | null;
    /** Current depth in the tree (0 for root). */
    depth: number;
    /** The key used for grouping at this level. */
    groupingKey: string;

    /** The field this node is grouping by. */
    groupingField?: string;
    /** The actual value being grouped. */
    groupingValue?: unknown;

    /** Computed aggregation results for this group. */
    aggregatedValues?: Record<string, unknown>;
    /** Position of the aggregation row relative to the group. */
    aggregationPosition?: 'inline' | 'footer' | null; 
    /** Current expansion state. */
    isExpanded: boolean;
    /** IDs of the direct child nodes. */
    children?: GridRowId[];
    /** Display label for the group. */
    label?: string;

    /** Row grouping: the number of leaf rows in the group that pass the active filter (recursive). */
    descendantCount?: number;

    /** Count of children on the server (for lazy loading). */
    serverChildrenCount?: number;
}

/** Configuration for pinning rows to the grid viewport. */
export interface GridRowPinning {
    /** Row IDs to pin to the top. */
    top?: GridRowId[];
    /** Row IDs to pin to the bottom. */
    bottom?: GridRowId[];
}

export interface GridRowOrderChangeParams<R extends GridValidRowModel = GridRowModel> {
  row: R;
  oldIndex: number; 
  targetIndex: number; 
}

export interface GridPinnedRows<R extends GridValidRowModel = GridRowModel> {
  top?: R[];
  bottom?: R[];
}

export interface GridRowScrollEndParams {
  visibleTop: number;
  visibleBottom: number;
  viewportHeight: number;
}

export interface GridRowParams<R extends GridValidRowModel = GridRowModel> {
  row: R;
  id: GridRowId;
  rowIndex: number;
}

export interface GridDetailPanelParams<R extends GridValidRowModel = GridRowModel> {
  row: R;
  id: GridRowId;
  rowIndex: number;
}

export type GridDetailPanelHeight = number | 'auto';
