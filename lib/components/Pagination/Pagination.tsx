
import React from 'react';
import { Button } from '../ui/Button';

export interface PaginationProps {
    page: number;
    pageSize: number;
    rowCount: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    pageSizeOptions?: number[];
    showFirstButton?: boolean;
    showLastButton?: boolean;
}

export function Pagination(props: PaginationProps) {
    const {
        page,
        pageSize,
        rowCount,
        onPageChange,
        onPageSizeChange,
        pageSizeOptions = [10, 25, 50, 100],
        showFirstButton = true,
        showLastButton = true
    } = props;

    const pageCount = Math.max(1, Math.ceil(rowCount / pageSize));
    const currentPage = Math.min(page, pageCount - 1);

    const firstRowIndex = currentPage * pageSize;
    const lastRowIndex = Math.min(firstRowIndex + pageSize, rowCount);
    const displayedRows = rowCount === 0 ? 0 : `${firstRowIndex + 1}–${lastRowIndex}`;

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
        <div className="ogx-pagination" role="navigation" aria-label="Pagination">
            { }
            <div className="ogx-pagination__page-size">
                <label htmlFor="page-size-select" className="ogx-pagination__label">
                    Rows per page:
                </label>
                <select
                    id="page-size-select"
                    className="ogx-pagination__select"
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    aria-label="Rows per page"
                >
                    {pageSizeOptions.map(option => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>

            { }
            <div className="ogx-pagination__info" aria-live="polite" aria-atomic="true">
                {displayedRows} of {rowCount}
            </div>

            { }
            <div className="ogx-pagination__actions">
                {showFirstButton && (
                    <Button
                        variant="text"
                        size="small"
                        onClick={handleFirstPage}
                        disabled={isFirstPage}
                        aria-label="Go to first page"
                        title="First page"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" />
                        </svg>
                    </Button>
                )}

                <Button
                    variant="text"
                    size="small"
                    onClick={handlePreviousPage}
                    disabled={isFirstPage}
                    aria-label="Go to previous page"
                    title="Previous page"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                </Button>

                <div className="ogx-pagination__page-info" aria-current="page">
                    Page {currentPage + 1} of {pageCount}
                </div>

                <Button
                    variant="text"
                    size="small"
                    onClick={handleNextPage}
                    disabled={isLastPage}
                    aria-label="Go to next page"
                    title="Next page"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                </Button>

                {showLastButton && (
                    <Button
                        variant="text"
                        size="small"
                        onClick={handleLastPage}
                        disabled={isLastPage}
                        aria-label="Go to last page"
                        title="Last page"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" />
                        </svg>
                    </Button>
                )}
            </div>
        </div>
    );
}
