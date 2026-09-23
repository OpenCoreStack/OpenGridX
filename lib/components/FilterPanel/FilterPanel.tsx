import React, { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type {
    GridFilterModel,
    GridFilterItem,
    GridFilterGroup,
    GridColDef,
    GridFilterOperator
} from '../../types';
import { getOperatorsForType, NO_VALUE_OPERATORS } from '../../utils/filtering';
import { toLocalDateString } from '../../utils/values';


export interface FilterPanelProps {
    filterModel: GridFilterModel;
    columns: GridColDef[];
    onFilterModelChange: (model: GridFilterModel) => void;
}

type FilterEntry = GridFilterItem | GridFilterGroup;

const DEBOUNCE_MS = 300;

function isFilterItem(entry: FilterEntry): entry is GridFilterItem {
    return 'field' in entry && !('items' in entry);
}

/** The root-level item the panel shows and edits for a column: the first one for that field. */
function getActiveFilter(items: readonly FilterEntry[], field: string): GridFilterItem | undefined {
    return items.find((entry): entry is GridFilterItem => isFilterItem(entry) && entry.field === field);
}

function sameValue(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => sameValue(v, b[i]));
    return false;
}

function sameEntry(a: FilterEntry, b: FilterEntry): boolean {
    if (a === b) return true;
    if (isFilterItem(a) && isFilterItem(b)) {
        return a.id === b.id && a.field === b.field && a.operator === b.operator && sameValue(a.value, b.value);
    }
    if (!isFilterItem(a) && !isFilterItem(b)) {
        return a.id === b.id && a.logicOperator === b.logicOperator && sameEntries(a.items, b.items);
    }
    return false;
}

function sameEntries(a: readonly FilterEntry[], b: readonly FilterEntry[]): boolean {
    if (a === b) return true;
    return a.length === b.length && a.every((entry, i) => sameEntry(entry, b[i]));
}

interface ValueOption {
    key: string;
    value: unknown;
    label: string;
}

function getValueOptions(col: GridColDef): ValueOption[] {
    return (col.valueOptions ?? []).map((option, index) => (
        option !== null && typeof option === 'object'
            ? { key: String(index), value: option.value, label: option.label }
            : { key: String(index), value: option, label: String(option) }
    ));
}

function matchesOption(option: ValueOption, value: unknown): boolean {
    if (Object.is(option.value, value)) return true;
    return value != null && String(option.value).toLowerCase() === String(value).toLowerCase();
}

/** Text shown in the value input for a committed value. Never used to emit anything. */
function toInputText(value: unknown, col: GridColDef): string {
    if (value == null) return '';
    if (col.type === 'date' || value instanceof Date) {
        const day = toLocalDateString(value);
        return day || (typeof value === 'string' ? value : '');
    }
    if (Array.isArray(value)) return value.map(v => String(v)).join(', ');
    return String(value);
}

/** The item value for typed text. isAnyOf takes a comma-separated list. */
function fromInputText(text: string, operator: GridFilterOperator): unknown {
    if (operator === 'isAnyOf') return text.split(',').map(part => part.trim()).filter(part => part !== '');
    return text;
}

/** Carry a value over to a newly picked operator: lists for isAnyOf, scalars for the rest. */
function convertValueForOperator(value: unknown, operator: GridFilterOperator): unknown {
    if (NO_VALUE_OPERATORS.has(operator)) return undefined;
    if (operator === 'isAnyOf') {
        if (value == null || value === '') return [];
        return Array.isArray(value) ? value : [value];
    }
    if (Array.isArray(value)) return value.length > 0 ? value[0] : '';
    return value ?? '';
}

const FilterRow: React.FC<{
    col: GridColDef;
    item: GridFilterItem | undefined;
    /** Changes when the filter model is changed from outside the panel. */
    resetToken: number;
    onChange: (item: GridFilterItem | null) => void;
}> = ({ col, item, resetToken, onChange }) => {
    const filterId = useId();
    const typeOperators = getOperatorsForType(col.type);
    const defaultOperator = typeOperators[0];
    const currentOperator: GridFilterOperator = item?.operator ?? defaultOperator;
    // An operator set programmatically that the column type does not list is still shown, so the
    // select reflects the filter that is really applied.
    const operators = typeOperators.includes(currentOperator) ? typeOperators : [currentOperator, ...typeOperators];
    const isActive = !!item;
    const label = col.headerName || col.field;

    // Text typed but not committed yet (debounced). null while the input shows the committed value,
    // so opening the panel never re-emits (and never stringifies) an existing value.
    const [draft, setDraft] = useState<string | null>(null);

    // An outside change (Clear all, programmatic reset) discards pending typing.
    const [seenResetToken, setSeenResetToken] = useState(resetToken);
    if (seenResetToken !== resetToken) {
        setSeenResetToken(resetToken);
        setDraft(null);
    }

    const onChangeRef = useRef(onChange);
    const itemRef = useRef(item);
    const colRef = useRef(col);
    useLayoutEffect(() => {
        onChangeRef.current = onChange;
        itemRef.current = item;
        colRef.current = col;
    });

    const buildItem = useCallback((operator: GridFilterOperator, value: unknown): GridFilterItem => ({
        id: itemRef.current?.id ?? `${col.field}-${Date.now()}`,
        field: col.field,
        operator,
        value,
    }), [col.field]);

    useEffect(() => {
        if (draft === null) return;
        const handle = setTimeout(() => {
            const current = itemRef.current;
            const unchanged = current ? draft === toInputText(current.value, colRef.current) : draft.trim() === '';
            if (!unchanged) {
                const operator = current?.operator ?? defaultOperator;
                onChangeRef.current(buildItem(operator, fromInputText(draft, operator)));
            }
            setDraft(null);
        }, DEBOUNCE_MS);
        return () => clearTimeout(handle);
    }, [draft, defaultOperator, buildItem]);

    const handleOperatorChange = (op: GridFilterOperator) => {
        // Keep what the user typed even if the debounce has not committed it yet.
        const value = draft !== null ? fromInputText(draft, op) : item?.value;
        setDraft(null);
        onChange(buildItem(op, convertValueForOperator(value, op)));
    };

    const handleClear = () => {
        setDraft(null);
        onChange(null);
    };

    const showValue = !NO_VALUE_OPERATORS.has(currentOperator);
    const valueOptions = getValueOptions(col);
    const valueClassName = `ogx-filter__value-input${isActive ? ' ogx-filter__value-input--active' : ''}`;
    const valueLabel = `Filter value for ${label}`;

    let valueControl: React.ReactNode = null;
    if (showValue && col.type === 'boolean') {
        valueControl = (
            <select
                id={`${filterId}-val`}
                name={`filter-val-${col.field}`}
                className={`${valueClassName} ogx-filter__value-select`}
                value={item?.value == null ? '' : String(item.value)}
                onChange={(e) => {
                    if (e.target.value === '') onChange(null);
                    else onChange(buildItem(currentOperator, e.target.value));
                }}
                aria-label={valueLabel}
            >
                <option value="">Any</option>
                <option value="true">true</option>
                <option value="false">false</option>
            </select>
        );
    } else if (showValue && col.type === 'singleSelect' && valueOptions.length > 0 && currentOperator === 'isAnyOf') {
        const selected = Array.isArray(item?.value) ? item.value : item?.value == null || item.value === '' ? [] : [item.value];
        valueControl = (
            <select
                id={`${filterId}-val`}
                name={`filter-val-${col.field}`}
                className={`${valueClassName} ogx-filter__value-multiselect`}
                multiple
                size={Math.min(valueOptions.length, 4)}
                value={valueOptions.filter(o => selected.some(v => matchesOption(o, v))).map(o => o.key)}
                onChange={(e) => {
                    const keys = new Set(Array.from(e.target.selectedOptions, option => option.value));
                    onChange(buildItem('isAnyOf', valueOptions.filter(o => keys.has(o.key)).map(o => o.value)));
                }}
                aria-label={valueLabel}
            >
                {valueOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
        );
    } else if (showValue && col.type === 'singleSelect' && valueOptions.length > 0 && (currentOperator === 'is' || currentOperator === 'not')) {
        const current = valueOptions.find(o => matchesOption(o, item?.value));
        valueControl = (
            <select
                id={`${filterId}-val`}
                name={`filter-val-${col.field}`}
                className={`${valueClassName} ogx-filter__value-select`}
                value={current?.key ?? ''}
                onChange={(e) => {
                    const option = valueOptions.find(o => o.key === e.target.value);
                    onChange(buildItem(currentOperator, option ? option.value : ''));
                }}
                aria-label={valueLabel}
            >
                <option value="">Any</option>
                {valueOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
        );
    } else if (showValue) {
        valueControl = (
            <input
                id={`${filterId}-val`}
                name={`filter-val-${col.field}`}
                className={valueClassName}
                type={col.type === 'date' ? 'date' : 'text'}
                value={draft ?? toInputText(item?.value, col)}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={col.type === 'number' ? 'Number…' : 'Value…'}
                aria-label={valueLabel}
            />
        );
    }

    return (
        <div className={`ogx-filter__row${isActive ? ' ogx-filter__row--active' : ''}`}>
            <span className="ogx-filter__col-label" title={col.field}>
                {label}
            </span>

            <div className="ogx-filter__controls">
                <select
                    id={`${filterId}-op`}
                    name={`filter-op-${col.field}`}
                    className={`ogx-filter__op-select${isActive ? ' ogx-filter__op-select--active' : ''}`}
                    value={currentOperator}
                    onChange={(e) => handleOperatorChange(e.target.value as GridFilterOperator)}
                    aria-label={`Filter operator for ${label}`}
                >
                    {operators.map(op => (
                        <option key={op} value={op}>{op}</option>
                    ))}
                </select>

                {valueControl}

                {/* Clear button — only when active */}
                {isActive && (
                    <button
                        type="button"
                        className="ogx-filter__row-clear"
                        onClick={handleClear}
                        aria-label={`Clear filter for ${label}`}
                        title="Clear"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
};

// ── Root panel ────────────────────────────────────────────────────────────────

export const FilterPanel: React.FC<FilterPanelProps> = ({ filterModel, columns, onFilterModelChange }) => {
    const items = useMemo<FilterEntry[]>(() => filterModel.items ?? [], [filterModel.items]);
    const logicOperator = filterModel.logicOperator ?? 'and';

    // Detect changes made outside the panel (Clear all, a programmatic model) so rows can drop
    // typing that has not been committed yet. The panel's own edits are recognised by content,
    // so a parent that re-creates an equal model object does not count as a change.
    const [lastEmittedItems, setLastEmittedItems] = useState<FilterEntry[] | null>(null);
    const [seenItems, setSeenItems] = useState(items);
    const [resetToken, setResetToken] = useState(0);
    if (seenItems !== items) {
        setSeenItems(items);
        const changed = !sameEntries(seenItems, items);
        const own = lastEmittedItems !== null && sameEntries(lastEmittedItems, items);
        if (changed && !own) setResetToken(token => token + 1);
    }

    // Replace only the item the row displays. Groups and other items (including further
    // conditions on the same field) pass through untouched.
    const handleItemChange = useCallback((field: string, newItem: GridFilterItem | null) => {
        const index = items.findIndex(entry => isFilterItem(entry) && entry.field === field);
        let next: FilterEntry[];
        if (index === -1) {
            if (!newItem) return;
            next = [...items, newItem];
        } else if (newItem) {
            next = items.map((entry, i) => (i === index ? newItem : entry));
        } else {
            next = items.filter((_, i) => i !== index);
        }
        setLastEmittedItems(next);
        onFilterModelChange({ ...filterModel, items: next });
    }, [items, filterModel, onFilterModelChange]);

    const handleLogicChange = useCallback((op: 'and' | 'or') => {
        onFilterModelChange({ ...filterModel, logicOperator: op });
    }, [filterModel, onFilterModelChange]);

    const filterableColumns = columns.filter(col => col.filterable !== false);
    const shownCount = filterableColumns.filter(col => getActiveFilter(items, col.field)).length;
    const notShownCount = items.length - shownCount;

    return (
        <>
            {items.length > 1 && (
                <div className="ogx-filter__logic-bar">
                    <span className="ogx-filter__logic-label">Match:</span>
                    <button
                        type="button"
                        className={`ogx-filter__logic-pill${logicOperator === 'and' ? ' ogx-filter__logic-pill--active' : ''}`}
                        onClick={() => handleLogicChange('and')}
                        aria-pressed={logicOperator === 'and'}
                    >
                        ALL (AND)
                    </button>
                    <button
                        type="button"
                        className={`ogx-filter__logic-pill${logicOperator === 'or' ? ' ogx-filter__logic-pill--active' : ''}`}
                        onClick={() => handleLogicChange('or')}
                        aria-pressed={logicOperator === 'or'}
                    >
                        ANY (OR)
                    </button>
                </div>
            )}

            {notShownCount > 0 && (
                <div className="ogx-filter__hidden-note" role="note">
                    {notShownCount === 1
                        ? '1 more condition (a filter group or a second condition on a column) is applied and not shown here.'
                        : `${notShownCount} more conditions (filter groups or further conditions on a column) are applied and not shown here.`}
                </div>
            )}

            {filterableColumns.length === 0 ? (
                <div className="ogx-filter__empty">No filterable columns.</div>
            ) : (
                filterableColumns.map(col => (
                    <FilterRow
                        key={col.field}
                        col={col}
                        item={getActiveFilter(items, col.field)}
                        resetToken={resetToken}
                        onChange={(item) => handleItemChange(col.field, item)}
                    />
                ))
            )}
        </>
    );
};
