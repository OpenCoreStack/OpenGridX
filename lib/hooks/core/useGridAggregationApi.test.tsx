import { describe, it, expect, afterEach } from 'vitest';
import { useLayoutEffect } from 'react';
import { render, cleanup } from '@testing-library/react';
import { DataGrid } from '../../components/DataGrid/DataGrid';
import { useGridApiRef } from './useGridApiRef';
import { createGridApiPlaceholder } from './gridApiPlaceholder';
import type { GridColDef, GridAggregationModel, GridApi } from '../../types';

type Row = { id: number; team: string; age: number };
const ROWS: Row[] = [
    { id: 1, team: 'A', age: 1 },
    { id: 2, team: 'B', age: 2 },
    { id: 3, team: 'A', age: 3 },
];
const COLUMNS: GridColDef<Row>[] = [
    { field: 'team', headerName: 'Team', width: 100 },
    { field: 'age', headerName: 'Age', type: 'number', width: 80 },
];

afterEach(cleanup);

const PLACEHOLDER_SCROLL = createGridApiPlaceholder().scrollToIndexes.toString();

// The live API must be in place before the parent's layout effects run (API_REFERENCE), and a
// method must never answer from a previous render.
describe('aggregation and scroll apiRef methods are live in the parent\'s layout effects', () => {
    it('on mount: getAggregationResult / getAggregationModel / getGroupedExportRows / scrollToIndexes', () => {
        const seen: { result: unknown; model: unknown; grouped: unknown; scroll: GridApi['scrollToIndexes'] }[] = [];
        function Parent() {
            const apiRef = useGridApiRef();
            useLayoutEffect(() => {
                seen.push({
                    result: apiRef.current.getAggregationResult(),
                    model: apiRef.current.getAggregationModel(),
                    grouped: apiRef.current.getGroupedExportRows(),
                    scroll: apiRef.current.scrollToIndexes,
                });
            }, [apiRef]);
            return <DataGrid<Row> apiRef={apiRef} rows={ROWS} columns={COLUMNS} rowGroupingModel={['team']} aggregationModel={{ age: 'sum' }} />;
        }
        render(<Parent />);
        expect(seen[0].model).toEqual({ age: 'sum' });
        expect(seen[0].result).toEqual({ age: 6 });
        expect(seen[0].grouped).not.toBeNull();
        expect(seen[0].scroll.toString()).not.toBe(PLACEHOLDER_SCROLL);
    });

    it('after an update: getAggregationModel and getAggregationResult reflect the new model in a layout effect', () => {
        const seen: unknown[] = [];
        function Parent({ model }: { model: GridAggregationModel }) {
            const apiRef = useGridApiRef();
            useLayoutEffect(() => {
                seen.push([apiRef.current.getAggregationModel(), apiRef.current.getAggregationResult()]);
            }, [apiRef, model]);
            return <DataGrid<Row> apiRef={apiRef} rows={ROWS} columns={COLUMNS} aggregationModel={model} />;
        }
        const { rerender } = render(<Parent model={{ age: 'sum' }} />);
        rerender(<Parent model={{ age: 'max' }} />);
        expect(seen[seen.length - 1]).toEqual([{ age: 'max' }, { age: 3 }]);
    });
});
