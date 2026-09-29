import { describe, it, expect, expectTypeOf } from 'vitest';
import { render, renderHook } from '@testing-library/react';
import type { MutableRefObject } from 'react';
import { DataGrid } from '../../components/DataGrid/DataGrid';
import { useGridApiRef } from './useGridApiRef';
import type { GridApi, GridColDef, GridRowModel } from '../../types';

// Checked by `npm run typecheck` (tsconfig.test.json); the runtime assertions only keep the file a test.

interface Invoice { id: number; customer: string; amount: number }

const rows: Invoice[] = [{ id: 1, customer: 'Acme', amount: 10 }];
const columns: GridColDef<Invoice>[] = [{ field: 'customer' }, { field: 'amount', type: 'number' }];

describe('GridApi row type', () => {
    it('types the row getters with the row type passed to useGridApiRef', () => {
        const { result } = renderHook(() => useGridApiRef<Invoice>());
        const api = result.current.current;
        expectTypeOf(api.getRow).returns.toEqualTypeOf<Invoice | null>();
        expectTypeOf(api.getAllRows).returns.toEqualTypeOf<Invoice[]>();
        expectTypeOf(api.getVisibleRows).returns.toEqualTypeOf<Invoice[]>();
        expectTypeOf(api.getAllFilteredRows).returns.toEqualTypeOf<Invoice[]>();

        render(<DataGrid rows={rows} columns={columns} apiRef={result.current} />);
        expect(result.current.current.getRow(1)?.customer).toBe('Acme');
    });

    it('keeps an untyped useGridApiRef() and GridApi working with typed rows', () => {
        const { result } = renderHook(() => useGridApiRef());
        expectTypeOf(result.current).toEqualTypeOf<MutableRefObject<GridApi>>();
        expectTypeOf(result.current.current.getRow).returns.toEqualTypeOf<GridRowModel | null>();

        // An untyped apiRef must not widen the row type inferred from `rows`: `params.row` stays an Invoice.
        render(
            <DataGrid rows={rows} apiRef={result.current}
                columns={[{ field: 'amount', renderCell: params => params.row.amount.toFixed(2) }]} />
        );
        expect(result.current.current.getAllRows()).toHaveLength(1);
    });
});
