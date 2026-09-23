import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, screen, within } from '@testing-library/react';
import { GridToolbar } from './GridToolbar';
import type { GridToolbarProps } from './GridToolbar';
import { DataGrid } from '../DataGrid/DataGrid';
import type { GridColDef, GridRowModel } from '../../types';

const NOOP = () => {};
const columnsDialog = () => screen.queryByRole('dialog', { name: 'Column visibility' });

function pillsFor(dialog: HTMLElement, label: string): string[] {
    const row = within(dialog).getByTitle(label).closest('.ogx-toolbar__agg-row') as HTMLElement;
    return within(row).getAllByRole('button').map(b => b.textContent ?? '');
}

describe('GridToolbar — Summaries panel', () => {
    it('offers only the functions a column allows', () => {
        render(
            <GridToolbar
                columns={[
                    { field: 'price', type: 'number', availableAggregationFunctions: ['avg', 'max'] },
                    { field: 'qty', type: 'number' },
                ]}
                onAggregationModelChange={NOOP}
            />
        );
        fireEvent.click(screen.getByLabelText('Configure summaries'));
        const dialog = screen.getByRole('dialog', { name: 'Summaries configuration' });
        expect(pillsFor(dialog, 'price')).toEqual(['none', 'avg', 'max']);
    });

    it('offers every built-in function, including unique, when the column does not restrict them', () => {
        render(<GridToolbar columns={[{ field: 'qty', type: 'number' }]} onAggregationModelChange={NOOP} />);
        fireEvent.click(screen.getByLabelText('Configure summaries'));
        const dialog = screen.getByRole('dialog', { name: 'Summaries configuration' });
        expect(pillsFor(dialog, 'qty')).toEqual(['none', 'sum', 'avg', 'count', 'min', 'max', 'unique']);
    });

    it('drops names that are not built-in aggregation functions', () => {
        render(
            <GridToolbar
                columns={[{ field: 'qty', type: 'number', availableAggregationFunctions: ['median', 'sum'] }]}
                onAggregationModelChange={NOOP}
            />
        );
        fireEvent.click(screen.getByLabelText('Configure summaries'));
        const dialog = screen.getByRole('dialog', { name: 'Summaries configuration' });
        expect(pillsFor(dialog, 'qty')).toEqual(['none', 'sum']);
    });

    it('renders no Summaries button without onAggregationModelChange', () => {
        render(<GridToolbar columns={[{ field: 'price', type: 'number' }]} />);
        expect(screen.queryByLabelText('Configure summaries')).toBeNull();
    });

    it('is not offered in pivot mode, where summaries have no effect', () => {
        const cols: GridColDef[] = [
            { field: 'region', headerName: 'Region' },
            { field: 'amount', headerName: 'Amount', type: 'number' },
        ];
        const rows: GridRowModel[] = [{ id: 1, region: 'N', amount: 1 }, { id: 2, region: 'S', amount: 2 }];
        render(
            <DataGrid rows={rows} columns={cols} pivotMode
                pivotModel={{ rowFields: ['region'], columnFields: [], valueFields: [{ field: 'amount', aggFn: 'sum' }] }}
                slots={{ toolbar: GridToolbar as never }} />
        );
        expect(screen.getByLabelText('Configure pivot')).toBeTruthy();
        expect(screen.queryByLabelText('Configure summaries')).toBeNull();
    });
});

describe('GridToolbar — Columns panel', () => {
    it('closes on Escape and reports the close', () => {
        const onColumnsPanelClose = vi.fn();
        render(<GridToolbar columns={[{ field: 'a' }]} onColumnVisibilityModelChange={NOOP} onColumnsPanelClose={onColumnsPanelClose} />);
        fireEvent.click(screen.getByLabelText('Manage columns'));
        expect(columnsDialog()).not.toBeNull();
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(columnsDialog()).toBeNull();
        expect(onColumnsPanelClose).toHaveBeenCalledTimes(1);
    });

    it('reports the close when its button, a custom button or another panel closes it', () => {
        const onColumnsPanelClose = vi.fn();
        const props: GridToolbarProps = {
            columns: [{ field: 'a' }],
            onColumnVisibilityModelChange: NOOP,
            onFilterModelChange: NOOP,
            onColumnsPanelClose,
        };
        const { rerender } = render(<GridToolbar {...props} />);

        fireEvent.click(screen.getByLabelText('Manage columns'));
        fireEvent.click(screen.getByLabelText('Manage columns'));
        expect(columnsDialog()).toBeNull();
        expect(onColumnsPanelClose).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByLabelText('Manage columns'));
        fireEvent.click(screen.getByLabelText('Advanced filters'));
        expect(columnsDialog()).toBeNull();
        expect(onColumnsPanelClose).toHaveBeenCalledTimes(2);

        rerender(<GridToolbar {...props} renderColumnsButton={({ onClick }) => <button type="button" onClick={onClick}>Cols</button>} />);
        fireEvent.click(screen.getByText('Cols'));
        expect(columnsDialog()).not.toBeNull();
        fireEvent.click(screen.getByText('Cols'));
        expect(columnsDialog()).toBeNull();
        expect(onColumnsPanelClose).toHaveBeenCalledTimes(3);
    });

    it('does not report a close for panels that were never open', () => {
        const onColumnsPanelClose = vi.fn();
        render(
            <GridToolbar columns={[{ field: 'a', type: 'number' }]} onColumnVisibilityModelChange={NOOP}
                onAggregationModelChange={NOOP} onColumnsPanelClose={onColumnsPanelClose} />
        );
        fireEvent.click(screen.getByLabelText('Configure summaries'));
        expect(onColumnsPanelClose).not.toHaveBeenCalled();
    });
});

describe('GridToolbar — trigger buttons', () => {
    it('expose the open state and the dialog they control', () => {
        render(
            <GridToolbar columns={[{ field: 'a', type: 'number' }]} onColumnVisibilityModelChange={NOOP}
                onFilterModelChange={NOOP} onAggregationModelChange={NOOP} onPivotModelChange={NOOP} />
        );
        for (const label of ['Manage columns', 'Advanced filters', 'Configure pivot', 'Configure summaries']) {
            const btn = screen.getByLabelText(label);
            expect(btn.getAttribute('aria-haspopup')).toBe('dialog');
            expect(btn.getAttribute('aria-expanded')).toBe('false');
            fireEvent.click(btn);
            expect(btn.getAttribute('aria-expanded')).toBe('true');
        }
    });
});

describe('GridToolbar — panel position', () => {
    const innerWidth = window.innerWidth;
    afterEach(() => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: innerWidth });
        Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 0 });
    });

    it('aligns the panel with its button when the page has a vertical scrollbar', () => {
        // A classic 17px scrollbar: the viewport that `right` is measured from is clientWidth wide.
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1017 });
        Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 1000 });
        render(<GridToolbar columns={[{ field: 'a', type: 'number' }]} onAggregationModelChange={NOOP} />);
        const btn = screen.getByLabelText('Configure summaries');
        btn.getBoundingClientRect = () => DOMRect.fromRect({ x: 900, y: 10, width: 40, height: 30 });
        fireEvent.click(btn);
        const panel = screen.getByRole('dialog', { name: 'Summaries configuration' });
        expect(panel.style.right).toBe('60px');
    });
});

describe('DataGrid column menu — Manage columns', () => {
    const cols: GridColDef[] = [{ field: 'name', headerName: 'Name' }, { field: 'age', headerName: 'Age' }];
    const rows: GridRowModel[] = [{ id: 1, name: 'a', age: 1 }];

    function manageColumns(container: HTMLElement) {
        fireEvent.click(container.querySelector('[data-field="name"] .ogx__menu-icon-btn') as HTMLElement);
        fireEvent.click(screen.getByRole('menuitem', { name: 'Manage all columns' }));
    }

    it('reopens the toolbar panel after the toolbar button closed it', () => {
        const { container } = render(<DataGrid rows={rows} columns={cols} slots={{ toolbar: GridToolbar as never }} />);
        manageColumns(container);
        expect(columnsDialog()).not.toBeNull();

        const btn = screen.getByLabelText('Manage columns');
        fireEvent.mouseDown(btn);
        fireEvent.click(btn);
        expect(columnsDialog()).toBeNull();

        manageColumns(container);
        expect(columnsDialog()).not.toBeNull();
    });

    it('reopens the toolbar panel after Escape closed it', () => {
        const { container } = render(<DataGrid rows={rows} columns={cols} slots={{ toolbar: GridToolbar as never }} />);
        manageColumns(container);
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(columnsDialog()).toBeNull();
        manageColumns(container);
        expect(columnsDialog()).not.toBeNull();
    });

    it('opens the standalone panel when the toolbar slot does not render GridToolbar', () => {
        function MyToolbar() { return <div>custom</div>; }
        const { container } = render(<DataGrid rows={rows} columns={cols} slots={{ toolbar: MyToolbar as never }} />);
        manageColumns(container);
        expect(document.querySelector('.ogx-column-visibility-panel')).not.toBeNull();
    });

    it('opens the standalone panel when the toolbar renders GridToolbar without the grid props', () => {
        function MyToolbar() { return <GridToolbar columns={cols} onColumnVisibilityModelChange={NOOP} />; }
        const { container } = render(<DataGrid rows={rows} columns={cols} slots={{ toolbar: MyToolbar as never }} />);
        manageColumns(container);
        expect(document.querySelectorAll('.ogx-column-visibility-panel')).toHaveLength(1);
        expect(columnsDialog()).toBeNull();
    });

    it('uses the toolbar panel, not the standalone one, when the toolbar forwards the grid props', () => {
        function MyToolbar(props: GridToolbarProps) { return <GridToolbar {...props} />; }
        const { container } = render(<DataGrid rows={rows} columns={cols} slots={{ toolbar: MyToolbar as never }} />);
        manageColumns(container);
        expect(columnsDialog()).not.toBeNull();
        expect(document.querySelectorAll('.ogx-column-visibility-panel')).toHaveLength(1);
    });

    it('closes the standalone panel on Escape and reopens it', () => {
        const { container } = render(<DataGrid rows={rows} columns={cols} />);
        manageColumns(container);
        expect(document.querySelector('.ogx-column-visibility-panel')).not.toBeNull();
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(document.querySelector('.ogx-column-visibility-panel')).toBeNull();
        manageColumns(container);
        expect(document.querySelector('.ogx-column-visibility-panel')).not.toBeNull();
    });
});
