import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Pagination } from './Pagination';

const NOOP = () => {};

describe('Pagination', () => {
    it('renders "0 of 0" when rowCount is 0', () => {
        render(
            <Pagination
                page={0}
                pageSize={10}
                rowCount={0}
                onPageChange={NOOP}
                onPageSizeChange={NOOP}
            />
        );
        expect(screen.getByText('0 of 0')).toBeTruthy();
    });

    it('calls localeText.paginationOf with (0, 0, 0) when rowCount is 0', () => {
        const paginationOf = vi.fn().mockReturnValue('custom empty');
        render(
            <Pagination
                page={0}
                pageSize={10}
                rowCount={0}
                onPageChange={NOOP}
                onPageSizeChange={NOOP}
                localeText={{ paginationOf }}
            />
        );
        expect(paginationOf).toHaveBeenCalledWith(0, 0, 0);
        expect(screen.getByText('custom empty')).toBeTruthy();
    });

    it('renders correct row range label for non-empty data', () => {
        render(
            <Pagination
                page={0}
                pageSize={10}
                rowCount={25}
                onPageChange={NOOP}
                onPageSizeChange={NOOP}
            />
        );
        expect(screen.getByText('1–10 of 25')).toBeTruthy();
    });

    it('calls localeText.paginationOf with correct args for non-empty data', () => {
        const paginationOf = vi.fn().mockReturnValue('custom range');
        render(
            <Pagination
                page={1}
                pageSize={10}
                rowCount={25}
                onPageChange={NOOP}
                onPageSizeChange={NOOP}
                localeText={{ paginationOf }}
            />
        );
        expect(paginationOf).toHaveBeenCalledWith(11, 20, 25);
    });
});
