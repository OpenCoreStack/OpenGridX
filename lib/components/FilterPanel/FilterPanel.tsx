import React, { useCallback, useEffect, useRef, useState } from 'react';
import type {
    GridFilterModel,
    GridFilterItem,
    GridColDef,
    GridFilterOperator
} from '../../types';
import { getOperatorsForType } from '../../utils/filtering';


interface FilterPanelProps {
    filterModel: GridFilterModel;
    columns: GridColDef[];
    onFilterModelChange: (model: GridFilterModel) => void;
}

const NO_VALUE_OPERATORS = new Set(['isEmpty', 'isNotEmpty']);

function getActiveFilter(items: GridFilterItem[], field: string): GridFilterItem | undefined {
    return items.find(item => 'field' in item && item.field === field) as GridFilterItem | undefined;
}

const FilterRow: React.FC<{
    col: GridColDef;
    item: GridFilterItem | undefined;
    onChange: (item: GridFilterItem | null) => void;
}> = ({ col, item, onChange }) => {
    const operators = getOperatorsForType(col.type);
    const isActive = !!item;
    const currentOperator = item?.operator ?? operators[0];

    // Local input state to prevent full filter-panel re-render on every keystroke
    const [localValue, setLocalValue] = useState(item?.value ?? '');
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // Sync when the external item changes (e.g. operator change, clear)
    const prevItemValue = useRef(item?.value);
    useEffect(() => {
        if (item?.value !== prevItemValue.current) {
            prevItemValue.current = item?.value;
            setLocalValue(item?.value ?? '');
        }
    }, [item?.value]);

    // Debounce propagating the value upward (300ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            const currentValue = item?.value ?? '';
            if (localValue !== currentValue) {
                onChangeRef.current({
                    id: item?.id ?? `${col.field}-${Date.now()}`,
                    field: col.field,
                    operator: currentOperator as GridFilterOperator,
                    value: localValue,
                });
            }
        }, 300);
        return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localValue]);

    const handleOperatorChange = (op: string) => {
        const noValue = NO_VALUE_OPERATORS.has(op);
        const newItem: GridFilterItem = {
            id: item?.id ?? `${col.field}-${Date.now()}`,
            field: col.field,
            operator: op as GridFilterOperator,
            value: noValue ? undefined : (item?.value ?? (col.type === 'boolean' ? 'true' : '')),
        };
        onChange(newItem);
    };

    const handleClear = () => {
        setLocalValue('');
        onChange(null);
    };

    const isNoValue = NO_VALUE_OPERATORS.has(String(currentOperator));
    const isBoolean = col.type === 'boolean';
    const showValue = !isNoValue;

    return (
        <div className={`ogx-filter__row${isActive ? ' ogx-filter__row--active' : ''}`}>
            { }
            <span className="ogx-filter__col-label" title={col.field}>
                {col.headerName || col.field}
            </span>

            { }
            <div className="ogx-filter__controls">
                { }
                <select
                    id={`ogx-filter-op-${col.field}`}
                    name={`filter-op-${col.field}`}
                    className={`ogx-filter__op-select${isActive ? ' ogx-filter__op-select--active' : ''}`}
                    value={String(currentOperator)}
                    onChange={(e) => handleOperatorChange(e.target.value)}
                    aria-label={`Filter operator for ${col.headerName || col.field}`}
                >
                    {operators.map(op => (
                        <option key={op} value={op}>{op}</option>
                    ))}
                </select>

                { }
                {showValue && isBoolean && (
                    <select
                        id={`ogx-filter-val-${col.field}`}
                        name={`filter-val-${col.field}`}
                        className={`ogx-filter__value-input ogx-filter__value-select${isActive ? ' ogx-filter__value-input--active' : ''}`}
                        value={String(item?.value ?? 'true')}
                        onChange={(e) => {
                            setLocalValue(e.target.value);
                            onChange({
                                id: item?.id ?? `${col.field}-${Date.now()}`,
                                field: col.field,
                                operator: currentOperator as GridFilterOperator,
                                value: e.target.value,
                            });
                        }}
                        aria-label={`Filter value for ${col.headerName || col.field}`}
                    >
                        <option value="true">true</option>
                        <option value="false">false</option>
                    </select>
                )}

                {showValue && !isBoolean && (
                    <input
                        id={`ogx-filter-val-${col.field}`}
                        name={`filter-val-${col.field}`}
                        className={`ogx-filter__value-input${isActive ? ' ogx-filter__value-input--active' : ''}`}
                        type="text"
                        value={localValue}
                        onChange={(e) => setLocalValue(e.target.value)}
                        placeholder={col.type === 'number' ? 'Number…' : 'Value…'}
                        aria-label={`Filter value for ${col.headerName || col.field}`}
                    />
                )}

                {/* Clear button — only when active */}
                {isActive && (
                    <button
                        className="ogx-filter__row-clear"
                        onClick={handleClear}
                        aria-label={`Clear filter for ${col.headerName || col.field}`}
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
    const items: GridFilterItem[] = (filterModel.items ?? []) as GridFilterItem[];
    const logicOperator = filterModel.logicOperator ?? 'and';

    const handleItemChange = useCallback((field: string, newItem: GridFilterItem | null) => {
        const rest = items.filter(i => 'field' in i && (i as GridFilterItem).field !== field);
        const next: GridFilterItem[] = newItem ? [...rest, newItem] : rest;
        onFilterModelChange({ ...filterModel, items: next });
    }, [items, filterModel, onFilterModelChange]);

    const handleLogicChange = useCallback((op: 'and' | 'or') => {
        onFilterModelChange({ ...filterModel, logicOperator: op });
    }, [filterModel, onFilterModelChange]);

    const filterableColumns = columns.filter(col => col.filterable !== false);

    return (
        <>
            { }
            {items.length > 1 && (
                <div className="ogx-filter__logic-bar">
                    <span className="ogx-filter__logic-label">Match:</span>
                    <button
                        className={`ogx-filter__logic-pill${logicOperator === 'and' ? ' ogx-filter__logic-pill--active' : ''}`}
                        onClick={() => handleLogicChange('and')}
                        aria-pressed={logicOperator === 'and'}
                    >
                        ALL (AND)
                    </button>
                    <button
                        className={`ogx-filter__logic-pill${logicOperator === 'or' ? ' ogx-filter__logic-pill--active' : ''}`}
                        onClick={() => handleLogicChange('or')}
                        aria-pressed={logicOperator === 'or'}
                    >
                        ANY (OR)
                    </button>
                </div>
            )}

            { }
            {filterableColumns.length === 0 ? (
                <div className="ogx-filter__empty">No filterable columns.</div>
            ) : (
                filterableColumns.map(col => (
                    <FilterRow
                        key={col.field}
                        col={col}
                        item={getActiveFilter(items, col.field)}
                        onChange={(item) => handleItemChange(col.field, item)}
                    />
                ))
            )}
        </>
    );
};
