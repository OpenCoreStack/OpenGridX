import React from 'react';
import { Pagination } from '../Pagination/Pagination';
import { ListViewRow } from '../ListView/ListViewRow';
import type {
    GridRowModel,
    GridRowId,
    GridRowParams,
    GridListViewColDef,
    GridPaginationModel,
    GridDataSource,
} from '../../types';

export interface GridListViewProps<R extends GridRowModel> {
    ariaLabel?: string;
    allRenderableRows: R[];
    filteredRows: R[];
    pagination: boolean;
    effectivePaginationModel: GridPaginationModel;
    pageSizeOptions: number[];
    selectedRowIds: Set<GridRowId>;
    listViewColumn: GridListViewColDef<R>;
    noRowsLabel: string;
    rowHeight: number;
    checkboxSelection: boolean;
    paginationMode: 'client' | 'server' | 'infinite';
    dataSource?: GridDataSource<R>;
    serverRowCount: number;
    paginationSlot?: React.ComponentType<Record<string, unknown>>;
    paginationSlotProps?: Record<string, unknown>;
    onRowClick: (params: GridRowParams<R>) => void;
    onSelectionChange: (rowId: GridRowId, isSelected: boolean) => void;
    onPaginationModelChange: (model: GridPaginationModel) => void;
}

export function GridListView<R extends GridRowModel>({
    ariaLabel,
    allRenderableRows,
    filteredRows,
    pagination,
    effectivePaginationModel,
    pageSizeOptions,
    selectedRowIds,
    listViewColumn,
    noRowsLabel,
    rowHeight,
    checkboxSelection,
    paginationMode,
    dataSource,
    serverRowCount,
    paginationSlot,
    paginationSlotProps,
    onRowClick,
    onSelectionChange,
    onPaginationModelChange,
}: GridListViewProps<R>) {
    const PaginationComponent = paginationSlot || Pagination;

    const totalRowCount = (paginationMode === 'server' && dataSource)
        ? (serverRowCount || 0)
        : filteredRows.length;

    return (
        <div
            className="ogx-list-view"
            role="grid"
            aria-label={ariaLabel || 'Data grid list view'}
            aria-rowcount={allRenderableRows.length + 1}
        >
            <div className="ogx-list-view__toolbar">
                <span>
                    {filteredRows.length} {filteredRows.length === 1 ? 'item' : 'items'}
                    {pagination ? ` · page ${effectivePaginationModel.page + 1} of ${Math.ceil(filteredRows.length / effectivePaginationModel.pageSize) || 1}` : ''}
                    {selectedRowIds.size > 0 ? ` · ${selectedRowIds.size} selected` : ''}
                </span>
            </div>

            <div className="ogx-list-view__rows">
                {allRenderableRows.length === 0 ? (
                    <div className="ogx-list-view__empty" aria-live="polite" role="status">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M3 9h18M9 21V9" />
                        </svg>
                        {noRowsLabel}
                    </div>
                ) : (
                    allRenderableRows.map((row, idx) => (
                        <ListViewRow<R>
                            key={row.id}
                            row={row}
                            rowIndex={idx}
                            listViewColumn={listViewColumn}
                            isSelected={selectedRowIds.has(row.id)}
                            checkboxSelection={checkboxSelection}
                            rowHeight={rowHeight}
                            onRowClick={(r) => onRowClick({ row: r, id: r.id, rowIndex: idx })}
                            onSelectionChange={onSelectionChange}
                        />
                    ))
                )}
            </div>

            {pagination && (
                <PaginationComponent
                    page={effectivePaginationModel.page}
                    pageSize={effectivePaginationModel.pageSize}
                    rowCount={totalRowCount}
                    pageSizeOptions={pageSizeOptions}
                    onPageChange={(newPage: number) => onPaginationModelChange({ ...effectivePaginationModel, page: newPage })}
                    onPageSizeChange={(newPageSize: number) => onPaginationModelChange({ ...effectivePaginationModel, pageSize: newPageSize, page: 0 })}
                    {...paginationSlotProps}
                />
            )}
        </div>
    );
}
