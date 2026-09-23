import React from 'react';
import { Pagination } from '../Pagination/Pagination';
import { ListViewRow } from '../ListView/ListViewRow';
import { getPageCount, normalizePageSize } from '../../utils/pagination';
import { getRowsScrollEndParams } from '../../utils/scroll/scrollEnd';
import type {
    GridColDef,
    GridRowModel,
    GridRowId,
    GridRowMeta,
    GridRowParams,
    GridListViewColDef,
    GridPaginationModel,
    GridLocaleText,
    GridRowScrollEndParams,
} from '../../types';

export interface GridListViewProps<R extends GridRowModel> {
    ariaLabel?: string;
    /** Pinned-top rows, the current page and pinned-bottom rows: what the grid view renders. */
    allRenderableRows: R[];
    filteredRows: R[];
    /** Number of rows at the start of allRenderableRows that are pinned to the top. */
    pinnedTopRowCount: number;
    /** Number of rows at the end of allRenderableRows that are pinned to the bottom. */
    pinnedBottomRowCount: number;
    /** Filtered, unpinned rows across all pages (the rows pagination splits into pages). */
    unpinnedRowCount: number;
    pagination: boolean;
    effectivePaginationModel: GridPaginationModel;
    /** The page actually shown (the requested page clamped to the last page). */
    currentPage: number;
    pageSizeOptions: number[];
    selectedRowIds: Set<GridRowId>;
    listViewColumn: GridListViewColDef<R>;
    /** Grid columns by field; a list field that names one gets its valueGetter / valueFormatter. */
    columnsByField: ReadonlyMap<string, GridColDef>;
    rowMetaMap: Map<GridRowId, GridRowMeta>;
    noRowsLabel: string;
    rowHeight: number;
    checkboxSelection: boolean;
    paginationMode: 'client' | 'server' | 'infinite';
    /** The grid's pagination total; used in server mode. */
    serverRowCount: number;
    paginationSlot?: React.ComponentType<Record<string, unknown>>;
    paginationSlotProps?: Record<string, unknown>;
    localeText?: Pick<GridLocaleText, 'paginationRowsPerPage' | 'paginationOf' | 'paginationPage'>;
    onRowClick: (params: GridRowParams<R>) => void;
    onRowDoubleClick?: (params: GridRowParams<R>) => void;
    onSelectionChange: (rowId: GridRowId, isSelected: boolean) => void;
    onPaginationModelChange: (model: GridPaginationModel) => void;
    onRowsScrollEnd?: (params: GridRowScrollEndParams) => void;
    /** Resolves a row's id; defaults to `row.id`. */
    getRowId?: (row: R) => GridRowId;
    /** Whether several rows can be selected (aria-multiselectable). */
    multiselectable?: boolean;
    /** The grid is loading (the `loading` prop or a data source fetch). */
    loading?: boolean;
    /** Rendered `slots.loadingOverlay`, shown instead of the rows while loading with no rows. */
    loadingOverlay?: React.ReactNode;
    /** Rendered `slots.noRowsOverlay`, shown instead of the default empty state. */
    noRowsOverlay?: React.ReactNode;
    /** False when `slots.footer` replaces the pagination area. Defaults to true. */
    showPaginationControls?: boolean;
    /** Whether rows can be selected (Shift+Space toggles the focused row). */
    selectable?: boolean;
    /** Expands / collapses a tree-data parent or group row (Enter, Space, Alt+ArrowRight / Alt+ArrowLeft). */
    onToggleExpansion?: (id: GridRowId) => void;
}

const defaultGetRowId = <R extends GridRowModel>(row: R): GridRowId => row.id;

export function GridListView<R extends GridRowModel>({
    ariaLabel,
    allRenderableRows,
    filteredRows,
    pinnedTopRowCount,
    pinnedBottomRowCount,
    unpinnedRowCount,
    pagination,
    effectivePaginationModel,
    currentPage,
    pageSizeOptions,
    selectedRowIds,
    listViewColumn,
    columnsByField,
    rowMetaMap,
    noRowsLabel,
    rowHeight,
    checkboxSelection,
    paginationMode,
    serverRowCount,
    paginationSlot,
    paginationSlotProps,
    localeText,
    onRowClick,
    onRowDoubleClick,
    onSelectionChange,
    onPaginationModelChange,
    onRowsScrollEnd,
    getRowId = defaultGetRowId,
    multiselectable = false,
    loading = false,
    loadingOverlay,
    noRowsOverlay,
    showPaginationControls = true,
    selectable = false,
    onToggleExpansion,
}: GridListViewProps<R>) {
    const PaginationComponent = paginationSlot || Pagination;

    // Roving tab stop: the list is one Tab stop, on the last focused row (the first row until then,
    // or when that row is no longer rendered).
    const rowsRef = React.useRef<HTMLDivElement>(null);
    const [focusedRowId, setFocusedRowId] = React.useState<GridRowId | null>(null);
    const focusedIndex = focusedRowId === null ? -1 : allRenderableRows.findIndex(row => getRowId(row) === focusedRowId);
    const tabStopIndex = focusedIndex === -1 ? 0 : focusedIndex;

    const focusRow = (index: number) => {
        const row = allRenderableRows[index];
        if (!row) return;
        setFocusedRowId(getRowId(row));
        rowsRef.current?.querySelector<HTMLElement>(`:scope > [role="row"][data-rowindex="${index}"]`)?.focus();
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement;
        // Keys pressed in content rendered inside a row (inputs, buttons) belong to that content.
        if (target.getAttribute('role') !== 'row' || target.parentElement !== rowsRef.current) return;
        const index = Number(target.getAttribute('data-rowindex'));
        const row = allRenderableRows[index];
        if (!row) return;
        const id = getRowId(row);
        const last = allRenderableRows.length - 1;
        const meta = rowMetaMap.get(id);
        const canToggle = Boolean(meta?.hasChildren && onToggleExpansion);
        if (event.altKey && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
            event.preventDefault();
            if (canToggle && (event.key === 'ArrowRight') !== (meta?.isExpanded === true)) onToggleExpansion?.(id);
            return;
        }
        switch (event.key) {
            case 'ArrowDown': event.preventDefault(); focusRow(Math.min(index + 1, last)); return;
            case 'ArrowUp': event.preventDefault(); focusRow(Math.max(index - 1, 0)); return;
            case 'Home': event.preventDefault(); focusRow(0); return;
            case 'End': event.preventDefault(); focusRow(last); return;
            case 'PageDown': event.preventDefault(); focusRow(Math.min(index + 10, last)); return;
            case 'PageUp': event.preventDefault(); focusRow(Math.max(index - 10, 0)); return;
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (event.key === ' ' && event.shiftKey) {
                    // Synthetic group rows are not data, so they are not selectable.
                    if (selectable && !meta?.isGroupRow) onSelectionChange(id, !selectedRowIds.has(id));
                    return;
                }
                // A row with children (tree-data parent or group row) expands / collapses, as Enter does in
                // the grid view; any other row acts as clicked (onRowClick and click selection).
                if (canToggle) onToggleExpansion?.(id);
                else onRowClick({ row, id, rowIndex: index });
                return;
            default:
        }
    };

    // Under server pagination only the current page is loaded; the server reports the total.
    const isServerPaged = paginationMode === 'server';
    // Rows split into pages (pinned rows stay on every page, as in the grid view).
    const pagedRowCount = isServerPaged ? (serverRowCount || 0) : unpinnedRowCount;
    const itemCount = isServerPaged ? (serverRowCount || 0) : filteredRows.length;
    const pageSize = normalizePageSize(effectivePaginationModel.pageSize);
    const pageCount = getPageCount(pagedRowCount, pageSize);

    // aria-rowindex is 1-based over the whole data set (the list view has no header row):
    // pinned-top rows, then the unpinned rows across all pages, then pinned-bottom rows.
    const pageOffset = pagination ? currentPage * pageSize : 0;
    const centerRowsOnPage = allRenderableRows.length - pinnedTopRowCount - pinnedBottomRowCount;
    const ariaRowIndex = (idx: number): number => {
        if (idx < pinnedTopRowCount) return idx + 1;
        const centerIdx = idx - pinnedTopRowCount;
        if (centerIdx < centerRowsOnPage) return pinnedTopRowCount + pageOffset + centerIdx + 1;
        return pinnedTopRowCount + pagedRowCount + (centerIdx - centerRowsOnPage) + 1;
    };

    const handleScroll = onRowsScrollEnd
        ? (event: React.UIEvent<HTMLDivElement>) => {
            const params = getRowsScrollEndParams(event.currentTarget);
            if (params) onRowsScrollEnd(params);
        }
        : undefined;

    return (
        <div
            className="ogx-list-view"
            role="grid"
            aria-label={ariaLabel || 'Data grid list view'}
            aria-rowcount={itemCount}
            aria-multiselectable={multiselectable}
        >
            <div className="ogx-list-view__toolbar">
                <span>
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    {pagination ? ` · page ${currentPage + 1} of ${pageCount}` : ''}
                    {selectedRowIds.size > 0 ? ` · ${selectedRowIds.size} selected` : ''}
                </span>
            </div>

            <div className="ogx-list-view__rows" onScroll={handleScroll} onKeyDown={handleKeyDown} ref={rowsRef}>
                {allRenderableRows.length === 0 && loading ? (
                    // The grid's live region announces loading; the list shows no "No Data" meanwhile.
                    <div className="ogx-list-view__loading">
                        {loadingOverlay ?? <div className="ogx__loading-bar" role="progressbar" aria-label="Loading data" />}
                    </div>
                ) : allRenderableRows.length === 0 && noRowsOverlay ? (
                    <div className="ogx-list-view__empty">{noRowsOverlay}</div>
                ) : allRenderableRows.length === 0 ? (
                    <div className="ogx-list-view__empty">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M3 9h18M9 21V9" />
                        </svg>
                        {noRowsLabel}
                    </div>
                ) : (
                    allRenderableRows.map((row, idx) => {
                        const id = getRowId(row);
                        return (
                        <ListViewRow<R>
                            key={id}
                            row={row}
                            rowId={id}
                            rowIndex={idx}
                            ariaRowIndex={ariaRowIndex(idx)}
                            listViewColumn={listViewColumn}
                            gridColumn={columnsByField.get(listViewColumn.field) as GridColDef<R> | undefined}
                            rowMeta={rowMetaMap.get(id)}
                            isSelected={selectedRowIds.has(id)}
                            checkboxSelection={checkboxSelection}
                            rowHeight={rowHeight}
                            onRowClick={(r) => onRowClick({ row: r, id, rowIndex: idx })}
                            onRowDoubleClick={onRowDoubleClick ? (r) => onRowDoubleClick({ row: r, id, rowIndex: idx }) : undefined}
                            onSelectionChange={onSelectionChange}
                            tabIndex={idx === tabStopIndex ? 0 : -1}
                            onToggleExpansion={onToggleExpansion}
                            onFocus={(rowIndex) => setFocusedRowId(getRowId(allRenderableRows[rowIndex]))}
                        />
                        );
                    })
                )}
            </div>

            {pagination && showPaginationControls && (
                <PaginationComponent
                    page={currentPage}
                    pageSize={effectivePaginationModel.pageSize}
                    rowCount={pagedRowCount}
                    pageSizeOptions={pageSizeOptions}
                    onPageChange={(newPage: number) => onPaginationModelChange({ ...effectivePaginationModel, page: newPage })}
                    onPageSizeChange={(newPageSize: number) => onPaginationModelChange({ ...effectivePaginationModel, pageSize: newPageSize, page: 0 })}
                    localeText={localeText}
                    {...paginationSlotProps}
                />
            )}
        </div>
    );
}
