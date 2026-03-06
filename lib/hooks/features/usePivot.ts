
import { useMemo } from 'react';
import type { GridColDef, GridRowModel } from '../../types';
import type { GridPivotModel, GridPivotAggFn } from '../../types';

function aggregate(values: number[], fn: GridPivotAggFn): number | null {
    const nums = values.filter((v) => v != null && !isNaN(v));
    if (nums.length === 0) return null;
    switch (fn) {
        case 'sum':   return nums.reduce((a, b) => a + b, 0);
        case 'avg':   return nums.reduce((a, b) => a + b, 0) / nums.length;
        case 'count': return nums.length;
        case 'min':   return Math.min(...nums);
        case 'max':   return Math.max(...nums);
    }
}

function makeKey(row: GridRowModel, fields: string[]): string {
    return fields.map((f) => String(row[f] ?? '')).join('\u0000');
}

export interface UsePivotReturn {
    pivotRows:    GridRowModel[];
    pivotColumns: GridColDef[];
        colKeys:      string[];
        isValid:      boolean;
}

export function usePivot(
    rawRows:  GridRowModel[],
    rawCols:  GridColDef[],
    model:    GridPivotModel,
    enabled:  boolean,
): UsePivotReturn {
    return useMemo<UsePivotReturn>(() => {
        const empty: UsePivotReturn = { pivotRows: [], pivotColumns: [], colKeys: [], isValid: false };

        if (!enabled) return empty;

        const { rowFields, columnFields, valueFields } = model;
        if (rowFields.length === 0 || valueFields.length === 0) return empty;

        const colDefMap = new Map(rawCols.map((c) => [c.field, c]));

        const colKeySet = new Set<string>();
        for (const row of rawRows) {
            colKeySet.add(makeKey(row, columnFields));
        }
        const colKeys = Array.from(colKeySet).sort();   

        const outerMap = new Map<string, {
            labelValues: Record<string, any>;
            bucket:      Map<string, Map<string, number[]>>;
        }>();

        for (const row of rawRows) {
            const rk = makeKey(row, rowFields);
            if (!outerMap.has(rk)) {
                const labelValues: Record<string, any> = {};
                for (const f of rowFields) labelValues[f] = row[f];
                outerMap.set(rk, { labelValues, bucket: new Map() });
            }
            const entry = outerMap.get(rk)!;

            const ck = makeKey(row, columnFields);
            if (!entry.bucket.has(ck)) entry.bucket.set(ck, new Map());
            const colBucket = entry.bucket.get(ck)!;

            for (const vf of valueFields) {
                const v = Number(row[vf.field]);
                if (!colBucket.has(vf.field)) colBucket.set(vf.field, []);
                if (!isNaN(v)) colBucket.get(vf.field)!.push(v);
            }
        }

        let rowIndex = 0;
        const pivotRows: GridRowModel[] = [];

        for (const [, entry] of outerMap) {
            const pivotRow: GridRowModel = { id: rowIndex++, ...entry.labelValues };

            for (const ck of colKeys) {
                const colBucket = entry.bucket.get(ck);
                for (const vf of valueFields) {
                    const cellKey = columnFields.length > 0
                        ? `${ck}\u001f${vf.field}\u001f${vf.aggFn}`
                        : `${vf.field}\u001f${vf.aggFn}`;
                    const values = colBucket?.get(vf.field) ?? [];
                    pivotRow[cellKey] = values.length > 0 ? aggregate(values, vf.aggFn) : null;
                }
            }

            pivotRows.push(pivotRow);
        }

        const pivotColumns: GridColDef[] = [];

        for (const f of rowFields) {
            const orig = colDefMap.get(f);
            pivotColumns.push({
                field:      f,
                headerName: orig?.headerName ?? f,
                width:      orig?.width as number ?? 140,
                sortable:   true,
            });
        }

        for (const ck of colKeys) {

            const colLabel = columnFields.length > 0
                ? ck.split('\u0000').map((v, i) => {
                    const def = colDefMap.get(columnFields[i]);
                    return def?.headerName ? `${def.headerName}: ${v}` : v;
                  }).join(' / ')
                : '';

            for (const vf of valueFields) {
                const orig       = colDefMap.get(vf.field);
                const cellKey    = columnFields.length > 0
                    ? `${ck}\u001f${vf.field}\u001f${vf.aggFn}`
                    : `${vf.field}\u001f${vf.aggFn}`;
                const labelBase  = vf.headerName ?? orig?.headerName ?? vf.field;
                const headerName = colLabel
                    ? `${colLabel} — ${labelBase} (${vf.aggFn})`
                    : `${labelBase} (${vf.aggFn})`;

                pivotColumns.push({
                    field:       cellKey,
                    headerName,
                    width:       140,
                    type:        'number',
                    align:       'right',
                    headerAlign: 'right',
                    sortable:    true,
                    valueFormatter: ({ value }) => {
                        if (value == null) return '—';
                        const n = Number(value);
                        if (vf.aggFn === 'avg') return n.toFixed(2);
                        if (vf.aggFn === 'count') return n.toLocaleString();
                        if (orig?.valueFormatter) return orig.valueFormatter({ value, row: {} as any, field: vf.field });
                        return n.toLocaleString();
                    },
                });
            }
        }

        return { pivotRows, pivotColumns, colKeys, isValid: true };
    }, [rawRows, rawCols, model, enabled]);
}
