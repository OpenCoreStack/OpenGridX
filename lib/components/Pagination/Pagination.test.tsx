import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

    it('the rows-per-page select shows the real page size when it is not one of the options', () => {
        render(<Pagination page={0} pageSize={20} rowCount={100} onPageChange={NOOP} onPageSizeChange={NOOP} />);
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.value).toBe('20');
        expect(Array.from(select.options).map(o => o.value)).toEqual(['10', '20', '25', '50', '100']);
        expect(screen.getByText('1–20 of 100')).toBeTruthy();
    });

    it('lists each option once when the page size is already an option', () => {
        render(<Pagination page={0} pageSize={25} rowCount={100} onPageChange={NOOP} onPageSizeChange={NOOP} />);
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(Array.from(select.options).map(o => o.value)).toEqual(['10', '25', '50', '100']);
    });

    it('names the rows-per-page select with the localized label', () => {
        render(
            <Pagination page={0} pageSize={10} rowCount={100} onPageChange={NOOP} onPageSizeChange={NOOP}
                localeText={{ paginationRowsPerPage: 'Zeilen pro Seite:' }} />
        );
        expect(screen.getByRole('combobox', { name: 'Zeilen pro Seite:' })).toBeTruthy();
    });

    it('treats a page size of 0 as 1 instead of rendering Infinity', () => {
        render(<Pagination page={0} pageSize={0} rowCount={25} onPageChange={NOOP} onPageSizeChange={NOOP} />);
        const text = document.querySelector('.ogx-pagination')?.textContent ?? '';
        expect(text).not.toMatch(/Infinity|NaN/);
        expect(screen.getByText('1–1 of 25')).toBeTruthy();
        expect(screen.getByText('Page 1 of 25')).toBeTruthy();
    });

    it('shows the last page for a page past the end, and Previous goes to the page before it', () => {
        const onPageChange = vi.fn();
        render(<Pagination page={5} pageSize={10} rowCount={15} onPageChange={onPageChange} onPageSizeChange={NOOP} />);
        expect(screen.getByText('11–15 of 15')).toBeTruthy();
        expect(screen.getByText('Page 2 of 2')).toBeTruthy();
        fireEvent.click(screen.getByLabelText('Go to previous page'));
        expect(onPageChange).toHaveBeenCalledWith(0);
    });

    it('shows the first page for a negative page', () => {
        render(<Pagination page={-2} pageSize={10} rowCount={15} onPageChange={NOOP} onPageSizeChange={NOOP} />);
        expect(screen.getByText('1–10 of 15')).toBeTruthy();
        expect(screen.getByText('Page 1 of 2')).toBeTruthy();
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
