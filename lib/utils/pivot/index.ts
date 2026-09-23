import type {
    GridColDef,
    GridFilterGroup,
    GridFilterItem,
    GridFilterModel,
    GridPivotAggFn,
    GridPivotModel,
    GridPivotValueField,
    GridRenderCellParams,
    GridRowId,
    GridRowModel,
    GridSortItem,
} from '../../types';
import {
    AGGREGATION_FUNCTIONS,
    formatAggregateForColumn,
    isAggregationAllowed,
    isEmptyAggregateValue,
} from '../aggregation';
import { createRowFilter } from '../filtering';
import { compareValues } from '../sorting';
import { buildColumnLookup } from '../columnLookup';
import { getCellValue } from '../values';

/** Row id of the Grand Total row that closes every pivot. */
export const PIVOT_GRAND_TOTAL_ID = '__pivot_grand_total__';
const GRAND_TOTAL_LABEL = 'Grand Total';

// Joins the values of several column fields into one column key.
const SEP_COL = '\u0000';
// Separates the parts of a generated value-column field: `[colKey␟]field␟aggFn`.
export const PIVOT_FIELD_SEPARATOR = '\u001f';
// A row field named `id` cannot keep its label under `id`, which must stay the unique pivot row id.
const ID_LABEL_KEY = `${PIVOT_FIELD_SEPARATOR}id`;
const labelKey = (field: string) => (field === 'id' ? ID_LABEL_KEY : field);

export interface PivotResult {
    /** Pivot data rows followed by the Grand Total row (omitted when there are no data rows). */
    pivotRows: GridRowModel[];
    /** Row-label columns (one per row field) followed by one value column per column key and value field. */
    pivotColumns: GridColDef[];
    /** The distinct column-field value combinations, in display order. */
    colKeys: string[];
    /** `false` when the model has no usable row field or value field. */
    isValid: boolean;
}

export interface PivotOptions {
    /**
     * Filter applied to the generated pivot rows (conditions on generated value columns). Rows it
     * removes are also left out of the Grand Total, so the total always matches the rows shown.
     */
    outputFilterModel?: GridFilterModel;
    /** Sort applied to the pivot data rows. The Grand Total row always stays last. */
    sortModel?: GridSortItem[];
}

export const EMPTY_PIVOT_RESULT: PivotResult = { pivotRows: [], pivotColumns: [], colKeys: [], isValid: false };

// Groups are keyed by each value's display string, as row grouping does, so 1 and '1' share a group;
// null, undefined and '' all key to '' and form one blank group.
const keyOf = (values: unknown[]): string => values.map((v) => String(v ?? '')).join(SEP_COL);

// The blank group is labelled null whichever blank value was seen first.
const normalizeLabel = (v: unknown): unknown => (v === undefined || v === '' ? null : v);

// Column-field values are ordered by their raw value: numbers and dates numerically, strings
// naturally ('9' before '10'), blanks last.
function compareDimension(a: unknown, b: unknown): number {
    const aBlank = a == null;
    const bBlank = b == null;
    if (aBlank || bBlank) return aBlank === bBlank ? 0 : aBlank ? 1 : -1;
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
    return String(a).localeCompare(String(b), undefined, { numeric: true });
}

function compareTuples(a: unknown[], b: unknown[]): number {
    for (let i = 0; i < a.length; i++) {
        const c = compareDimension(a[i], b[i]);
        if (c !== 0) return c;
    }
    return 0;
}

// A number, or a Date for min / max of dates.
function aggregate(values: unknown[] | undefined, fn: GridPivotAggFn): number | Date | null {
    if (!values || values.length === 0) return null;
    const result = AGGREGATION_FUNCTIONS[fn](values);
    return typeof result === 'number' || result instanceof Date ? result : null;
}

const isFilterGroup = (item: GridFilterItem | GridFilterGroup): item is GridFilterGroup =>
    'logicOperator' in item && 'items' in item;

const hasFilterItems = (model?: GridFilterModel): model is GridFilterModel =>
    Boolean(model && model.items && model.items.length > 0);

/**
 * Splits a filter model for pivot mode. Conditions on generated value columns (fields the source
 * columns do not have) can only be evaluated on pivot rows; everything else, including the quick
 * filter and conditions on row-field columns, is applied to the source rows before pivoting.
 */
export function splitPivotFilterModel(
    filterModel: GridFilterModel,
    sourceFields: ReadonlySet<string>,
): { source: GridFilterModel; output: GridFilterModel } {
    const isGenerated = (field: string) => !sourceFields.has(field) && field.includes(PIVOT_FIELD_SEPARATOR);
    const targetsPivotRows = (item: GridFilterItem | GridFilterGroup): boolean =>
        isFilterGroup(item)
            ? item.items.length > 0 && item.items.every(targetsPivotRows)
            : isGenerated(item.field);

    const sourceItems: (GridFilterItem | GridFilterGroup)[] = [];
    const outputItems: (GridFilterItem | GridFilterGroup)[] = [];
    for (const item of filterModel.items ?? []) {
        (targetsPivotRows(item) ? outputItems : sourceItems).push(item);
    }
    return {
        source: { ...filterModel, items: sourceItems },
        output: { items: outputItems, logicOperator: filterModel.logicOperator },
    };
}

interface GroupEntry {
    labels: unknown[];
    /** First source row of the group: the `row` given to the row-field column's formatter and renderer. */
    sample: GridRowModel;
    /** Column key → value field → raw values. */
    cells: Map<string, Map<string, unknown[]>>;
}

interface ColumnKeyInfo {
    values: unknown[];
    /** First source row with this column key: the `row` given to the header label's formatter. */
    sample?: GridRowModel;
}

/**
 * Builds pivot rows and columns from source rows. Values are read through each column's
 * `valueGetter`, aggregated with the shared `lib/utils/aggregation` functions, and formatted with
 * `formatAggregateForColumn` (the source column's `valueFormatter` for sum / avg / min / max, with the
 * pivot row as its `row`, as for group rows and exports). Row and column fields on a
 * `groupable: false` column, and value fields on an `aggregable: false` column or whose function
 * the column's `availableAggregationFunctions` does not allow, are skipped.
 */
export function computePivot(
    rows: GridRowModel[],
    columns: GridColDef[],
    model: GridPivotModel,
    options: PivotOptions = {},
): PivotResult {
    const colDefMap = new Map(columns.map((c) => [c.field, c]));
    const isGroupable = (f: string) => colDefMap.get(f)?.groupable !== false;
    const rowFields = model.rowFields.filter(isGroupable);
    const columnFields = model.columnFields.filter(isGroupable);

    const seenValueFields = new Set<string>();
    const valueFields: GridPivotValueField[] = model.valueFields.filter((vf) => {
        if (!isAggregationAllowed(colDefMap.get(vf.field), vf.aggFn)) return false;
        const id = `${vf.field}${PIVOT_FIELD_SEPARATOR}${vf.aggFn}`;
        if (seenValueFields.has(id)) return false;
        seenValueFields.add(id);
        return true;
    });

    if (rowFields.length === 0 || valueFields.length === 0) return EMPTY_PIVOT_RESULT;

    const hasColFields = columnFields.length > 0;
    // Raw values are collected once per distinct field, however many functions use it.
    const valueSourceFields = Array.from(new Set(valueFields.map((vf) => vf.field)));
    const get = (row: GridRowModel, field: string) => getCellValue(row, field, colDefMap.get(field));

    const groups = new Map<string, GroupEntry>();
    // Without column fields there is exactly one column key, present even when there is no data.
    const colKeyInfo = new Map<string, ColumnKeyInfo>(hasColFields ? [] : [['', { values: [] }]]);

    for (const row of rows) {
        const labelValues = rowFields.map((f) => get(row, f));
        const rk = keyOf(labelValues);
        let entry = groups.get(rk);
        if (!entry) {
            entry = { labels: labelValues.map(normalizeLabel), sample: row, cells: new Map() };
            groups.set(rk, entry);
        }

        const colValues = columnFields.map((f) => get(row, f));
        const ck = hasColFields ? keyOf(colValues) : '';
        const info = colKeyInfo.get(ck);
        if (!info) colKeyInfo.set(ck, { values: colValues.map(normalizeLabel), sample: row });
        else if (!info.sample) info.sample = row;

        let cell = entry.cells.get(ck);
        if (!cell) {
            cell = new Map();
            entry.cells.set(ck, cell);
        }
        for (const f of valueSourceFields) {
            const v = get(row, f);
            if (isEmptyAggregateValue(v)) continue;
            let bucket = cell.get(f);
            if (!bucket) {
                bucket = [];
                cell.set(f, bucket);
            }
            bucket.push(v);
        }
    }

    const colKeys = Array.from(colKeyInfo.keys()).sort((a, b) =>
        compareTuples(colKeyInfo.get(a)!.values, colKeyInfo.get(b)!.values));

    const cellField = (ck: string, vf: GridPivotValueField) => hasColFields
        ? `${ck}${PIVOT_FIELD_SEPARATOR}${vf.field}${PIVOT_FIELD_SEPARATOR}${vf.aggFn}`
        : `${vf.field}${PIVOT_FIELD_SEPARATOR}${vf.aggFn}`;

    // ── Data rows ────────────────────────────────────────────────────────────
    const entryByRowId = new Map<GridRowId, GroupEntry>();
    let kept: { row: GridRowModel; entry: GroupEntry }[] = [];
    let index = 0;
    for (const entry of groups.values()) {
        const row: GridRowModel = { id: index };
        rowFields.forEach((f, i) => { row[labelKey(f)] = entry.labels[i]; });
        row.id = index++;
        for (const ck of colKeys) {
            const cell = entry.cells.get(ck);
            for (const vf of valueFields) row[cellField(ck, vf)] = aggregate(cell?.get(vf.field), vf.aggFn);
        }
        entryByRowId.set(row.id, entry);
        kept.push({ row, entry });
    }

    // Generated value columns are numeric (or dates for min / max of dates); row-label columns keep
    // their source column's type, so filtering and sorting compare them the way the grid does.
    const isRowField = (field: string) => rowFields.includes(field);
    const typeOf = (field: string): GridColDef['type'] => (isRowField(field) ? colDefMap.get(field)?.type : 'number');

    const { outputFilterModel, sortModel } = options;
    if (hasFilterItems(outputFilterModel)) {
        const generatedColumns: GridColDef[] = [];
        for (const ck of colKeys) for (const vf of valueFields) generatedColumns.push({ field: cellField(ck, vf), type: 'number' });
        const predicate = createRowFilter(outputFilterModel, buildColumnLookup(generatedColumns));
        if (predicate) kept = kept.filter(({ row }) => predicate(row));
    }

    const sortValue = (row: GridRowModel, field: string) =>
        field === 'id' && isRowField('id') ? row[ID_LABEL_KEY] : row[field];
    if (sortModel && sortModel.length > 0) {
        kept = [...kept].sort((a, b) => {
            for (const item of sortModel) {
                const c = compareValues(sortValue(a.row, item.field), sortValue(b.row, item.field), item.sort, typeOf(item.field));
                if (c !== 0) return c;
            }
            return 0;
        });
    }

    // ── Grand Total: aggregated from the raw values of the rows shown ────────
    const pivotRows = kept.map((k) => k.row);
    if (kept.length > 0) {
        const total: GridRowModel = { id: PIVOT_GRAND_TOTAL_ID };
        rowFields.forEach((f, i) => { total[labelKey(f)] = i === 0 ? GRAND_TOTAL_LABEL : ''; });
        total.id = PIVOT_GRAND_TOTAL_ID;
        for (const ck of colKeys) {
            for (const f of valueSourceFields) {
                const values: unknown[] = [];
                for (const { entry } of kept) {
                    const bucket = entry.cells.get(ck)?.get(f);
                    if (bucket) for (const v of bucket) values.push(v);
                }
                for (const vf of valueFields) {
                    if (vf.field === f) total[cellField(ck, vf)] = aggregate(values, vf.aggFn);
                }
            }
        }
        pivotRows.push(total);
    }

    // ── Columns ──────────────────────────────────────────────────────────────
    const firstSample = kept[0]?.entry.sample;
    const groupSample = (id: GridRowId | undefined): GridRowModel | undefined =>
        id === PIVOT_GRAND_TOTAL_ID ? firstSample : id === undefined ? undefined : entryByRowId.get(id)?.sample;

    const pivotColumns: GridColDef[] = rowFields.map((f) => buildRowFieldColumn(f, colDefMap.get(f), groupSample));

    for (const ck of colKeys) {
        const info = colKeyInfo.get(ck)!;
        const colLabel = hasColFields
            ? columnFields.map((f, i) => {
                const def = colDefMap.get(f);
                const shown = formatDimension(def, f, info.values[i], info.sample);
                return def?.headerName ? `${def.headerName}: ${shown}` : shown;
            }).join(' / ')
            : '';

        for (const vf of valueFields) {
            const orig = colDefMap.get(vf.field);
            const labelBase = vf.headerName ?? orig?.headerName ?? vf.field;
            pivotColumns.push({
                field: cellField(ck, vf),
                headerName: colLabel ? `${colLabel} — ${labelBase} (${vf.aggFn})` : `${labelBase} (${vf.aggFn})`,
                width: 140,
                type: 'number',
                align: 'right',
                headerAlign: 'right',
                sortable: true,
                valueFormatter: ({ value, row }) => formatAggregateForColumn(value, vf.aggFn, orig, row),
            });
        }
    }

    return { pivotRows, pivotColumns, colKeys, isValid: true };
}

function formatDimension(def: GridColDef | undefined, field: string, value: unknown, sample?: GridRowModel): string {
    if (def?.valueFormatter && sample) return def.valueFormatter({ value, row: sample, field });
    return value == null ? '' : String(value);
}

// A row-label column keeps how the source column displays its values (formatter, renderer, type,
// alignment) and is always shown: the row fields are what the pivot rows are labelled by.
function buildRowFieldColumn(
    field: string,
    orig: GridColDef | undefined,
    groupSample: (id: GridRowId | undefined) => GridRowModel | undefined,
): GridColDef {
    const col: GridColDef = {
        field,
        headerName: orig?.headerName ?? field,
        width: orig?.width ?? 140,
        sortable: true,
        hideable: false,
    };
    if (orig) {
        if (orig.type !== undefined) col.type = orig.type;
        if (orig.align !== undefined) col.align = orig.align;
        if (orig.headerAlign !== undefined) col.headerAlign = orig.headerAlign;
        if (orig.description !== undefined) col.description = orig.description;
        if (orig.minWidth !== undefined) col.minWidth = orig.minWidth;
        if (orig.maxWidth !== undefined) col.maxWidth = orig.maxWidth;
        if (orig.valueOptions !== undefined) col.valueOptions = orig.valueOptions;
    }
    if (field === 'id') col.valueGetter = ({ row }) => row[ID_LABEL_KEY];

    const isTotal = (row: GridRowModel | undefined) => row?.id === PIVOT_GRAND_TOTAL_ID;
    const sourceFormatter = orig?.valueFormatter;
    if (sourceFormatter) {
        col.valueFormatter = ({ value, row }) => isTotal(row)
            ? String(value ?? '')
            : sourceFormatter({ value, row: groupSample(row?.id) ?? row, field });
    }
    const sourceRenderer = orig?.renderCell;
    if (sourceRenderer) {
        col.renderCell = (params: GridRenderCellParams) => isTotal(params.row)
            ? (params.formattedValue ?? String(params.value ?? ''))
            : sourceRenderer({ ...params, row: groupSample(params.row.id) ?? params.row });
    }
    return col;
}
