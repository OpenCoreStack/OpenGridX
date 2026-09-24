import React from 'react';
import { Pagination } from '../Pagination/Pagination';
import { pickPaginationLocaleText } from '../../utils/pagination';
import type { GridLocaleText, GridPaginationModel, GridPaginationSlotProps } from '../../types';

interface GridPaginationAreaProps {
    /** `slots.pagination`; the built-in `Pagination` otherwise. */
    paginationSlot?: React.ComponentType<GridPaginationSlotProps & Record<string, unknown>>;
    /** `slotProps.pagination`, merged over the grid's props. */
    paginationSlotProps?: Partial<GridPaginationSlotProps> & Record<string, unknown>;
    /** The page shown (clamped by the row pipeline). */
    page: number;
    paginationModel: GridPaginationModel;
    rowCount: number;
    pageSizeOptions: number[];
    onPaginationModelChange: (model: GridPaginationModel) => void;
    localeText?: GridLocaleText;
}

/** The grid's pager below the viewport: a page change keeps the page size, a page-size change returns to page 0. */
export function GridPaginationArea({
    paginationSlot,
    paginationSlotProps,
    page,
    paginationModel,
    rowCount,
    pageSizeOptions,
    onPaginationModelChange,
    localeText,
}: GridPaginationAreaProps) {
    const PaginationComponent = paginationSlot || Pagination;
    return (
        <PaginationComponent
            page={page}
            pageSize={paginationModel.pageSize}
            rowCount={rowCount}
            pageSizeOptions={pageSizeOptions}
            onPageChange={(newPage: number) => onPaginationModelChange({ ...paginationModel, page: newPage })}
            onPageSizeChange={(newPageSize: number) => onPaginationModelChange({ ...paginationModel, pageSize: newPageSize, page: 0 })}
            localeText={pickPaginationLocaleText(localeText)}
            {...paginationSlotProps}
        />
    );
}
