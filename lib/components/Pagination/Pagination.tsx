
import React, { useId } from 'react';
import { Button } from '../ui/Button';
import { normalizePageSize, getPageCount, clampPage } from '../../utils/pagination';
import type { GridLocaleText } from '../../types';
import { useGridLocale } from '../DataGrid/gridLocaleContext';

export interface PaginationProps {
    page: number;
    pageSize: number;
    rowCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    pageSizeOptions?: number[];
    showFirstButton?: boolean;
    showLastButton?: boolean;
    localeText?: Pick<GridLocaleText, 'paginationRowsPerPage' | 'paginationOf' | 'paginationPage'>;
}

export function Pagination(props: PaginationProps) {
    const pageSizeId = useId();
    const locale = useGridLocale();
    const {
        page,
        pageSize,
        rowCount,
        onPageChange,
        onPageSizeChange,
        pageSizeOptions = [10, 25, 50, 100],
        showFirstButton = true,
        showLastButton = true,
        localeText,
    } = props;

    const safePageSize = normalizePageSize(pageSize);
    const pageCount = getPageCount(rowCount, safePageSize);
    const currentPage = clampPage(page, pageCount);

    // The select must be able to show the size in use, even when it is not one of the options
    // (e.g. the default 100 with pageSizeOptions={[10, 25, 50]}); otherwise it displays the first
    // option and choosing that option fires no change event.
    const selectOptions = pageSizeOptions.includes(safePageSize)
        ? pageSizeOptions
        : [...pageSizeOptions, safePageSize].sort((a, b) => a - b);

    const firstRowIndex = currentPage * safePageSize;
    const lastRowIndex = Math.min(firstRowIndex + safePageSize, rowCount);
    // An explicit `localeText` prop (standalone use) wins over the grid's strings.
    const rowsPerPageLabel = localeText?.paginationRowsPerPage ?? locale.paginationRowsPerPage;
    const ofLabel = (localeText?.paginationOf ?? locale.paginationOf)(rowCount === 0 ? 0 : firstRowIndex + 1, lastRowIndex, rowCount);
    const pageLabel = (localeText?.paginationPage ?? locale.paginationPage)(currentPage + 1, pageCount);

    const handleFirstPage = () => {
        onPageChange(0);
    };

    const handlePreviousPage = () => {
        onPageChange(Math.max(0, currentPage - 1));
    };

    const handleNextPage = () => {
        onPageChange(Math.min(pageCount - 1, currentPage + 1));
    };

    const handleLastPage = () => {
        onPageChange(pageCount - 1);
    };

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPageSize = parseInt(event.target.value, 10);
        onPageSizeChange(newPageSize);

    };

    const isFirstPage = currentPage === 0;
    const isLastPage = currentPage >= pageCount - 1;

    return (
        <div className="ogx-pagination" role="navigation" aria-label={locale.paginationLabel}>
            { }
            <div className="ogx-pagination__page-size">
                <label htmlFor={pageSizeId} className="ogx-pagination__label">
                    {rowsPerPageLabel}
                </label>
                <select
                    id={pageSizeId}
                    className="ogx-pagination__select"
                    value={safePageSize}
                    onChange={handlePageSizeChange}
                >
                    {selectOptions.map(option => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>

            { }
            <div className="ogx-pagination__info" aria-live="polite" aria-atomic="true">
                {ofLabel}
            </div>

            { }
            <div className="ogx-pagination__actions">
                {showFirstButton && (
                    <Button
                        variant="text"
                        size="small"
                        onClick={handleFirstPage}
                        disabled={isFirstPage}
                        aria-label={locale.paginationFirstPageLabel}
                        title={locale.paginationFirstPageTooltip}
                    >
                        <svg className="ogx-pagination__icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" />
                        </svg>
                    </Button>
                )}

                <Button
                    variant="text"
                    size="small"
                    onClick={handlePreviousPage}
                    disabled={isFirstPage}
                    aria-label={locale.paginationPreviousPageLabel}
                    title={locale.paginationPreviousPageTooltip}
                >
                    <svg className="ogx-pagination__icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </Button>

                <div className="ogx-pagination__page-info" aria-current="page">
                    {pageLabel}
                </div>

                <Button
                    variant="text"
                    size="small"
                    onClick={handleNextPage}
                    disabled={isLastPage}
                    aria-label={locale.paginationNextPageLabel}
                    title={locale.paginationNextPageTooltip}
                >
                    <svg className="ogx-pagination__icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                </Button>

                {showLastButton && (
                    <Button
                        variant="text"
                        size="small"
                        onClick={handleLastPage}
                        disabled={isLastPage}
                        aria-label={locale.paginationLastPageLabel}
                        title={locale.paginationLastPageTooltip}
                    >
                        <svg className="ogx-pagination__icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" />
                        </svg>
                    </Button>
                )}
            </div>
        </div>
    );
}
