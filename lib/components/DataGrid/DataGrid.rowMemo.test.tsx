import { describe, it, expect, afterEach } from 'vitest';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import { useState } from 'react';
import { DataGrid } from './DataGrid';
import type { GridColDef } from '../../types';

// Rows are memoised: selecting a row or starting an edit must re-render only the rows it changes
// (P8, 3.9.0). A handler or value that changed identity for every row brought all rows back.

type Row = { id: number; name: string };
const ROWS: Row[] = Array.from({ length: 5 }, (_, i) => ({ id: i, name: `n${i}` }));

afterEach(cleanup);

function setup() {
    // Row calls isCellEditable for each of its cells while it renders (Cell is memoised separately,
    // so renderCell would not show a Row re-render): one call per render of that row.
    const renders = new Map<number, number>();
    const isCellEditable = ({ row }: { row: Row }) => {
        renders.set(row.id, (renders.get(row.id) ?? 0) + 1);
        return true;
    };
    const columns: GridColDef<Row>[] = [{ field: 'name', editable: true }];
    const { container } = render(<DataGrid<Row> rows={ROWS} columns={columns} height={400} isCellEditable={isCellEditable} />);
    const cell = (index: number) => container.querySelectorAll<HTMLElement>('.ogx__rows .ogx__row [data-field="name"]')[index];
    return { renders, cell };
}

describe('row memoisation', () => {
    it('selecting a row does not re-render the other rows', () => {
        const { renders, cell } = setup();
        renders.clear();
        act(() => { fireEvent.click(cell(2)); });
        expect(renders.get(0) ?? 0).toBe(0);
        expect(renders.get(4) ?? 0).toBe(0);
    });

    it('starting an edit does not re-render the other rows', () => {
        const { renders, cell } = setup();
        renders.clear();
        act(() => { fireEvent.doubleClick(cell(1)); });
        expect(renders.get(0) ?? 0).toBe(0);
        expect(renders.get(3) ?? 0).toBe(0);
    });

    it('an inline localeText object of plain strings keeps rows memoised', () => {
        const renders = new Map<number, number>();
        const isCellEditable = ({ row }: { row: Row }) => {
            renders.set(row.id, (renders.get(row.id) ?? 0) + 1);
            return true;
        };
        const columns: GridColDef<Row>[] = [{ field: 'name', editable: true }];
        let bump = () => {};
        function Parent() {
            const [n, setN] = useState(0);
            bump = () => setN(n + 1);
            return (
                <div data-n={n}>
                    <DataGrid<Row> rows={ROWS} columns={columns} height={400} isCellEditable={isCellEditable}
                        localeText={{ noRowsLabel: 'Keine Daten', columnMenuUnsort: 'Unsortiert' }} />
                </div>
            );
        }
        render(<Parent />);
        renders.clear();
        act(() => { bump(); });
        expect(renders.get(0) ?? 0).toBe(0);
        expect(renders.get(4) ?? 0).toBe(0);
    });
});
