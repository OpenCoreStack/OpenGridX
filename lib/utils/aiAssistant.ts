// Pure helpers of the `aiAssistant` panel: which parts of a reply it may apply, what to restore on
// Undo, the removable chips and what a state looks like without one of them. No AI code: the reply
// was validated by the `/ai` entry point before it reaches the grid.
import type {
    GridAiChip,
    GridAiPart,
    GridAiState,
    GridAiValidationError,
    GridApi,
    GridFilterGroup,
    GridFilterItem,
} from '../types';

export const AI_PARTS: readonly GridAiPart[] = ['filter', 'sort', 'grouping', 'aggregation', 'pivot', 'columnVisibility'];

const PART_KEYS: Record<GridAiPart, keyof GridAiState> = {
    filter: 'filterModel',
    sort: 'sortModel',
    grouping: 'rowGroupingModel',
    aggregation: 'aggregationModel',
    pivot: 'pivotModel',
    columnVisibility: 'columnVisibilityModel',
};

type StateKey = keyof GridAiState;

function keysOf(state: GridAiState): StateKey[] {
    return AI_PARTS.map((part) => PART_KEYS[part]).filter((key) => state[key] !== undefined);
}

/** The parts of `state` that `parts` allows, and an error for each part it does not. */
export function pickAllowedParts(state: GridAiState, parts: readonly GridAiPart[]): { state: GridAiState; errors: GridAiValidationError[] } {
    const picked: GridAiState = {};
    const errors: GridAiValidationError[] = [];
    for (const part of AI_PARTS) {
        const key = PART_KEYS[part];
        if (state[key] === undefined) continue;
        if (parts.includes(part)) Object.assign(picked, { [key]: state[key] });
        else errors.push({ path: key, message: 'Part not allowed' });
    }
    return { state: picked, errors };
}

function isEmptyPart(state: GridAiState, key: StateKey): boolean {
    const value = state[key];
    if (Array.isArray(value)) return value.length === 0;
    if (key === 'filterModel') {
        const model = state.filterModel;
        return !model || ((model.items ?? []).length === 0 && (model.quickFilterValues ?? []).length === 0);
    }
    if (key === 'pivotModel') {
        const model = state.pivotModel;
        return !model || (model.rowFields.length === 0 && model.columnFields.length === 0 && model.valueFields.length === 0);
    }
    return typeof value === 'object' && value !== null && Object.keys(value).length === 0;
}

/** The state key an error path starts with (`'sortModel[0].field'` → `'sortModel'`). */
function errorKey(path: string): string {
    let end = path.length;
    for (const sep of ['.', '[']) {
        const at = path.indexOf(sep);
        if (at >= 0 && at < end) end = at;
    }
    return path.slice(0, end);
}

/**
 * Leaves out a part that is empty only because the validator dropped everything in it (`sortModel`
 * naming an unknown field comes back as `[]`): applying it would clear the grid's model, which the
 * reply did not ask for. An empty part without errors ("clear the sort") is kept.
 */
export function dropEmptiedParts(state: GridAiState, errors: readonly GridAiValidationError[]): GridAiState {
    const failed = new Set(errors.map((error) => errorKey(typeof error.path === 'string' ? error.path : '')));
    const out: GridAiState = {};
    for (const key of keysOf(state)) {
        if (!(failed.has(key) && isEmptyPart(state, key))) Object.assign(out, { [key]: state[key] });
    }
    return out;
}

/** The current values of the parts `state` changes: what Undo restores. */
export function snapshotParts(state: GridAiState, current: GridAiState): GridAiState {
    const snapshot: GridAiState = {};
    for (const key of keysOf(state)) Object.assign(snapshot, { [key]: current[key] });
    return snapshot;
}

/**
 * The models to apply for `applied` over `previous` (the snapshot taken before the reply): column
 * visibility is merged over the previous model; a part removed from `applied` gets its previous value back.
 */
export function effectiveState(applied: GridAiState, previous: GridAiState): GridAiState {
    const out: GridAiState = {};
    for (const key of AI_PARTS.map((part) => PART_KEYS[part])) {
        if (!(key in previous) && applied[key] === undefined) continue;
        if (applied[key] === undefined) Object.assign(out, { [key]: previous[key] });
        else if (key === 'columnVisibilityModel') out.columnVisibilityModel = { ...previous.columnVisibilityModel, ...applied.columnVisibilityModel };
        else Object.assign(out, { [key]: applied[key] });
    }
    return out;
}

type GridAiStateSetters = Pick<GridApi, 'setFilterModel' | 'setSortModel' | 'setRowGroupingModel' | 'setAggregationModel' | 'setPivotModel' | 'setColumnVisibilityModel'>;

/** Applies every part present in `state` through the API (each fires its change callback). */
export function applyGridAiState(api: GridAiStateSetters, state: GridAiState): void {
    if (state.filterModel) api.setFilterModel(state.filterModel);
    if (state.sortModel) api.setSortModel(state.sortModel);
    if (state.rowGroupingModel) api.setRowGroupingModel(state.rowGroupingModel);
    if (state.aggregationModel) api.setAggregationModel(state.aggregationModel);
    if (state.pivotModel) api.setPivotModel(state.pivotModel);
    if (state.columnVisibilityModel) api.setColumnVisibilityModel(state.columnVisibilityModel);
}

function valueText(value: unknown): string {
    if (Array.isArray(value)) return value.map(valueText).join(', ');
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return value === undefined || value === null ? '' : String(value);
}

function filterLabel(node: GridFilterItem | GridFilterGroup, label: (field: string) => string): string {
    if ('items' in node) return `(${node.items.map((child) => filterLabel(child, label)).join(` ${node.logicOperator} `)})`;
    return [label(node.field), node.operator, valueText(node.value)].filter(Boolean).join(' ');
}

const FN_LABELS: Record<string, string> = { sum: 'Sum', avg: 'Average', count: 'Count', min: 'Min', max: 'Max', unique: 'Unique' };

/** One chip per change: filter item, quick-filter words, sort key, grouping field, aggregation, visibility change, pivot. */
export function buildAiChips(applied: GridAiState, label: (field: string) => string): GridAiChip[] {
    const chips: GridAiChip[] = [];
    const { filterModel, sortModel, rowGroupingModel, aggregationModel, pivotModel, columnVisibilityModel } = applied;
    if (filterModel) {
        const items = filterModel.items ?? [];
        items.forEach((item, i) => chips.push({ id: `filter:${i}`, part: 'filter', label: filterLabel(item, label) }));
        const words = filterModel.quickFilterValues ?? [];
        if (words.length > 0) chips.push({ id: 'filter:quick', part: 'filter', label: `Search: ${words.join(' ')}` });
        if (items.length === 0 && words.length === 0) chips.push({ id: 'filter:clear', part: 'filter', label: 'No filters' });
    }
    if (sortModel) {
        sortModel.forEach((s, i) => chips.push({ id: `sort:${i}`, part: 'sort', label: `Sort: ${label(s.field)}, ${s.sort === 'desc' ? 'descending' : 'ascending'}` }));
        if (sortModel.length === 0) chips.push({ id: 'sort:clear', part: 'sort', label: 'No sorting' });
    }
    if (rowGroupingModel) {
        rowGroupingModel.forEach((field, i) => chips.push({ id: `grouping:${i}`, part: 'grouping', label: `Group: ${label(field)}` }));
        if (rowGroupingModel.length === 0) chips.push({ id: 'grouping:clear', part: 'grouping', label: 'No grouping' });
    }
    if (aggregationModel) {
        const fields = Object.keys(aggregationModel);
        fields.forEach((field) => {
            const fn = aggregationModel[field];
            chips.push({ id: `aggregation:${field}`, part: 'aggregation', label: `${FN_LABELS[fn] ?? fn}: ${label(field)}` });
        });
        if (fields.length === 0) chips.push({ id: 'aggregation:clear', part: 'aggregation', label: 'No summaries' });
    }
    if (pivotModel) {
        const fields = [...pivotModel.rowFields, ...pivotModel.columnFields, ...pivotModel.valueFields.map((v) => v.field)];
        chips.push({ id: 'pivot', part: 'pivot', label: fields.length > 0 ? `Pivot: ${fields.map(label).join(', ')}` : 'No pivot' });
    }
    if (columnVisibilityModel) {
        for (const field of Object.keys(columnVisibilityModel)) {
            chips.push({ id: `columnVisibility:${field}`, part: 'columnVisibility', label: `${columnVisibilityModel[field] ? 'Show' : 'Hide'}: ${label(field)}` });
        }
    }
    return chips;
}

/**
 * `applied` without the change a chip stands for. A part left with no change is dropped, so
 * `effectiveState` gives it its value from before the reply.
 */
export function removeAiChip(applied: GridAiState, id: string): GridAiState {
    const next: GridAiState = { ...applied };
    const sep = id.indexOf(':');
    const part = sep < 0 ? id : id.slice(0, sep);
    const rest = sep < 0 ? '' : id.slice(sep + 1);
    const index = Number(rest);
    if (part === 'filter' && next.filterModel) {
        const model = { ...next.filterModel };
        if (rest === 'quick') delete model.quickFilterValues;
        else if (rest === 'clear') model.items = [];
        else model.items = (model.items ?? []).filter((_, i) => i !== index);
        if ((model.items ?? []).length === 0 && (model.quickFilterValues ?? []).length === 0) delete next.filterModel;
        else next.filterModel = model;
    } else if (part === 'sort' && next.sortModel) {
        next.sortModel = next.sortModel.filter((_, i) => i !== index);
        if (next.sortModel.length === 0 || rest === 'clear') delete next.sortModel;
    } else if (part === 'grouping' && next.rowGroupingModel) {
        next.rowGroupingModel = next.rowGroupingModel.filter((_, i) => i !== index);
        if (next.rowGroupingModel.length === 0 || rest === 'clear') delete next.rowGroupingModel;
    } else if (part === 'aggregation' && next.aggregationModel) {
        const model = { ...next.aggregationModel };
        delete model[rest];
        if (Object.keys(model).length === 0) delete next.aggregationModel;
        else next.aggregationModel = model;
    } else if (part === 'columnVisibility' && next.columnVisibilityModel) {
        const model = { ...next.columnVisibilityModel };
        delete model[rest];
        if (Object.keys(model).length === 0) delete next.columnVisibilityModel;
        else next.columnVisibilityModel = model;
    } else if (part === 'pivot') {
        delete next.pivotModel;
    }
    return next;
}
