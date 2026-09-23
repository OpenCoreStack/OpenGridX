import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { DataGrid } from '../DataGrid/DataGrid';
import type { GridColDef } from '../../types';

type Row = { id: number; a: string };
const ROWS: Row[] = [{ id: 1, a: 'a1' }, { id: 2, a: 'a2' }, { id: 3, a: 'a3' }];

afterEach(() => { vi.restoreAllMocks(); });

const quiet = () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
};

describe('CellErrorBoundary recovery', () => {
    it('a fixed renderCell recovers without new row objects', () => {
        quiet();
        const bad: GridColDef<Row>[] = [{ field: 'a', width: 100, renderCell: () => { throw new Error('not ready'); } }];
        const good: GridColDef<Row>[] = [{ field: 'a', width: 100, renderCell: ({ value }) => <span>ok-{String(value)}</span> }];
        const { container, rerender } = render(<DataGrid rows={ROWS} columns={bad} />);
        expect(container.querySelectorAll('.ogx__cell-error')).toHaveLength(3);
        rerender(<DataGrid rows={ROWS} columns={good} />);
        expect(container.querySelectorAll('.ogx__cell-error')).toHaveLength(0);
        expect(container.textContent).toContain('ok-a1');
    });

    it('an unchanged throwing renderer keeps showing the error without retrying on every render', () => {
        quiet();
        const renderCell = vi.fn(() => { throw new Error('broken'); });
        const cols: GridColDef<Row>[] = [{ field: 'a', width: 100, renderCell }];
        const { container, rerender } = render(<DataGrid rows={ROWS} columns={cols} />);
        const calls = renderCell.mock.calls.length;
        rerender(<DataGrid rows={ROWS} columns={cols} />);
        expect(container.querySelectorAll('.ogx__cell-error')).toHaveLength(3);
        expect(renderCell.mock.calls.length).toBe(calls);
    });

    it('the error glyph is not a live region', () => {
        quiet();
        const cols: GridColDef<Row>[] = [{ field: 'a', width: 100, renderCell: () => { throw new Error('x'); } }];
        const { container } = render(<DataGrid rows={ROWS.slice(0, 1)} columns={cols} />);
        const glyph = container.querySelector('.ogx__cell-error')!;
        expect(glyph.getAttribute('role')).not.toBe('status');
        expect(glyph.getAttribute('aria-label')).toBe('Error in cell: a');
    });
});
