import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { GridColDef, GridFilterItem, GridFilterOperator } from '../../types';
import { filterValueToInputText, NO_VALUE_OPERATORS } from '../../utils/filtering';
import {
    HEADER_FILTER_DEBOUNCE_MS,
    HEADER_FILTER_OPERATOR_LABELS,
    HEADER_FILTER_OPERATOR_SYMBOLS,
    buildHeaderFilterItem,
    convertHeaderFilterValue,
    getHeaderFilterDefaultOperator,
    getHeaderFilterOperators,
    type GridHeaderFilterState,
} from '../../utils/headerFilters';
import { Input } from '../ui/Input';
import { HeaderFilterOperatorMenu } from './HeaderFilterOperatorMenu';

export interface HeaderFilterCellProps {
    colDef: GridColDef;
    /** What the cell shows: the item it owns, or "Custom filter". */
    state: GridHeaderFilterState;
    style: React.CSSProperties;
    /** Classes for pinning and focus, added to `ogx__header-filter-cell`. */
    className: string;
    ariaColIndex: number;
    /** Stores (or removes, with null) the cell's own filter item. Must keep its identity. */
    onItemChange: (field: string, item: GridFilterItem | null) => void;
    onOpenFilterPanel?: () => void;
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
    const single = Array.isArray(value) ? value[0] : value;
    if (Object.is(option.value, single)) return true;
    return single != null && String(option.value).toLowerCase() === String(single).toLowerCase();
}

/** The item value for typed text. isAnyOf takes a comma-separated list. */
function fromInputText(text: string, operator: GridFilterOperator): unknown {
    if (operator === 'isAnyOf') return text.split(',').map(part => part.trim()).filter(part => part !== '');
    return text;
}

function sameValue(a: unknown, b: unknown): boolean {
    if (Object.is(a, b)) return true;
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => sameValue(v, b[i]));
    return false;
}

function sameItem(a: GridFilterItem | undefined, b: GridFilterItem | undefined): boolean {
    if (a === b) return true;
    if (!a || !b) return false;
    return a.operator === b.operator && sameValue(a.value, b.value);
}

function ClearIcon() {
    return (
        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
    );
}

/** One cell of the header filter row: operator button, value control and clear button. */
export function HeaderFilterCell({ colDef, state, style, className, ariaColIndex, onItemChange, onOpenFilterPanel }: HeaderFilterCellProps) {
    const label = colDef.headerName || colDef.field;
    const item = state.kind === 'editable' ? state.item : undefined;
    const operator: GridFilterOperator = item?.operator ?? getHeaderFilterDefaultOperator(colDef);
    const valueOptions = getValueOptions(colDef);
    const usesSelect = colDef.type === 'boolean' || (colDef.type === 'singleSelect' && valueOptions.length > 0);
    const showsValue = !NO_VALUE_OPERATORS.has(operator);

    // Text typed but not committed yet (debounced); null while the input shows the committed value.
    const [draft, setDraft] = useState<string | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    // The last item this cell reported (null: removed). Its own change arriving late (a parent that
    // stores the model asynchronously) is not mistaken for a change made elsewhere.
    const [lastEmitted, setLastEmitted] = useState<GridFilterItem | null | undefined>(undefined);
    // A change made elsewhere (filter panel, Clear all, apiRef) discards typing not committed yet.
    const [seenItem, setSeenItem] = useState(item);
    if (seenItem !== item) {
        setSeenItem(item);
        const own = lastEmitted !== undefined && sameItem(lastEmitted ?? undefined, item);
        if (!sameItem(seenItem, item) && !own) setDraft(null);
    }

    const cellRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);
    const customRef = useRef<HTMLButtonElement>(null);
    const operatorRef = useRef<HTMLButtonElement>(null);

    const latestRef = useRef({ item, colDef, onItemChange });
    useLayoutEffect(() => {
        latestRef.current = { item, colDef, onItemChange };
    });

    // Commits typed text unless it matches what the item already holds.
    const commitText = useCallback((text: string) => {
        const { item: current, colDef: col, onItemChange: emit } = latestRef.current;
        const unchanged = current ? text === filterValueToInputText(current.value, col.type) : text.trim() === '';
        if (unchanged) return;
        const op = current?.operator ?? getHeaderFilterDefaultOperator(col);
        const next = buildHeaderFilterItem(col, op, fromInputText(text, op));
        setLastEmitted(next);
        emit(col.field, next);
    }, []);

    // Typing still waiting for the debounce is committed if the cell unmounts meanwhile (its column
    // scrolled out of the render window, the row turned off).
    const pendingRef = useRef<string | null>(null);
    useLayoutEffect(() => {
        pendingRef.current = draft;
    });
    useEffect(() => () => {
        const pending = pendingRef.current;
        pendingRef.current = null;
        if (pending !== null) commitText(pending);
    }, [commitText]);

    useEffect(() => {
        if (draft === null) return undefined;
        const handle = setTimeout(() => {
            pendingRef.current = null;
            commitText(draft);
            setDraft(null);
        }, HEADER_FILTER_DEBOUNCE_MS);
        return () => clearTimeout(handle);
    }, [draft, commitText]);

    const focusCell = () => cellRef.current?.focus({ preventScroll: true });
    const focusControl = () => (inputRef.current ?? selectRef.current)?.focus({ preventScroll: true });

    const report = (next: GridFilterItem | null) => {
        setLastEmitted(next);
        onItemChange(colDef.field, next);
    };

    const setValue = (value: unknown) => {
        setDraft(null);
        report(buildHeaderFilterItem(colDef, operator, value));
    };

    const clear = () => {
        setDraft(null);
        report(null);
    };

    const openMenu = () => { if (operatorRef.current) setMenuAnchor(operatorRef.current); };

    const closeMenu = (restoreFocus: boolean) => {
        setMenuAnchor(null);
        if (!restoreFocus) return;
        if (inputRef.current || selectRef.current) focusControl();
        else focusCell();
    };

    const selectOperator = (op: GridFilterOperator) => {
        // Keep what was typed even if the debounce has not committed it yet.
        const value = draft !== null ? fromInputText(draft, op) : item?.value;
        setDraft(null);
        setMenuAnchor(null);
        report(buildHeaderFilterItem(colDef, op, convertHeaderFilterValue(value, op)));
        // The value control may only mount with the new operator (from isEmpty), so focus after commit.
        requestAnimationFrame(() => {
            if (inputRef.current || selectRef.current) focusControl();
            else focusCell();
        });
    };

    const isCustom = state.kind === 'custom';
    const isTextInput = !isCustom && showsValue && !usesSelect;

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const cell = event.currentTarget;
        const target = event.target as Node;
        // Keys from the portalled operator menu reach this handler through the React tree only.
        if (!cell.contains(target)) return;
        if (event.nativeEvent.isComposing) return;
        const { key } = event;
        const onCell = target === cell;

        const opensMenu = (event.altKey && key === 'ArrowDown') || ((event.ctrlKey || event.metaKey) && key === 'Enter');
        // Alt+ArrowDown in a select opens its own list.
        if (opensMenu && !isCustom && target !== selectRef.current) {
            event.preventDefault();
            event.stopPropagation();
            openMenu();
            return;
        }
        if (!onCell) {
            if (key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                focusCell();
            }
            return;
        }
        if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
            event.preventDefault();
            event.stopPropagation();
            if (isCustom) customRef.current?.click();
            else if (inputRef.current || selectRef.current) focusControl();
            else openMenu();
            return;
        }
        if ((key === 'Delete' || key === 'Backspace') && item) {
            event.preventDefault();
            event.stopPropagation();
            clear();
            return;
        }
        // Typing on the cell starts a new value in its text box.
        if (isTextInput && colDef.type !== 'date' && key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            event.stopPropagation();
            inputRef.current?.focus({ preventScroll: true });
            setDraft(key);
        }
    };

    let content: React.ReactNode = null;
    if (isCustom) {
        content = onOpenFilterPanel ? (
            <button
                ref={customRef}
                type="button"
                className="ogx__header-filter-custom"
                tabIndex={-1}
                onClick={onOpenFilterPanel}
                title="Set in the filter panel"
            >
                Custom filter
            </button>
        ) : (
            <span className="ogx__header-filter-custom" title="Set in the filter panel">Custom filter</span>
        );
    } else {
        let valueControl: React.ReactNode;
        if (!showsValue) {
            valueControl = <span className="ogx__header-filter-operator-label">{HEADER_FILTER_OPERATOR_LABELS[operator] ?? operator}</span>;
        } else if (colDef.type === 'boolean') {
            valueControl = (
                <select
                    ref={selectRef}
                    className="ogx__header-filter-select"
                    tabIndex={-1}
                    value={item?.value == null || item.value === '' ? '' : String(item.value)}
                    onChange={(e) => setValue(e.target.value === '' ? '' : e.target.value === 'true')}
                    aria-label={`Filter value for ${label}`}
                >
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            );
        } else if (usesSelect) {
            const selected = valueOptions.find(o => matchesOption(o, item?.value));
            valueControl = (
                <select
                    ref={selectRef}
                    className="ogx__header-filter-select"
                    tabIndex={-1}
                    value={selected?.key ?? ''}
                    onChange={(e) => {
                        const option = valueOptions.find(o => o.key === e.target.value);
                        setValue(convertHeaderFilterValue(option ? option.value : '', operator));
                    }}
                    aria-label={`Filter value for ${label}`}
                >
                    <option value="">Any</option>
                    {valueOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
            );
        } else {
            valueControl = (
                <Input
                    ref={inputRef}
                    className="ogx__header-filter-input-wrapper"
                    inputClassName="ogx__header-filter-input"
                    type={colDef.type === 'date' ? 'date' : 'text'}
                    inputMode={colDef.type === 'number' ? 'decimal' : undefined}
                    tabIndex={-1}
                    autoComplete="off"
                    value={draft ?? filterValueToInputText(item?.value, colDef.type)}
                    onChange={(e) => setDraft(e.target.value)}
                    aria-label={`Filter value for ${label}`}
                />
            );
        }
        const operatorLabel = HEADER_FILTER_OPERATOR_LABELS[operator] ?? operator;
        content = (
            <>
                <button
                    ref={operatorRef}
                    type="button"
                    className={`ogx__header-filter-operator${menuAnchor ? ' ogx__header-filter-operator--open' : ''}`}
                    tabIndex={-1}
                    aria-haspopup="menu"
                    aria-expanded={menuAnchor !== null}
                    aria-label={`Filter operator for ${label}: ${operatorLabel}`}
                    title={operatorLabel}
                    onClick={() => (menuAnchor ? setMenuAnchor(null) : openMenu())}
                >
                    {HEADER_FILTER_OPERATOR_SYMBOLS[operator] ?? '?'}
                </button>
                {valueControl}
                {item && (
                    <button
                        type="button"
                        className="ogx__header-filter-clear"
                        tabIndex={-1}
                        aria-label={`Clear filter for ${label}`}
                        title="Clear"
                        onClick={() => { clear(); focusCell(); }}
                    >
                        <ClearIcon />
                    </button>
                )}
                {menuAnchor && (
                    <HeaderFilterOperatorMenu
                        anchorEl={menuAnchor}
                        columnLabel={label}
                        operators={getHeaderFilterOperators(colDef)}
                        current={operator}
                        onSelect={selectOperator}
                        onClose={closeMenu}
                    />
                )}
            </>
        );
    }

    const classNames = [
        'ogx__header-filter-cell',
        item && 'ogx__header-filter-cell--active',
        isCustom && 'ogx__header-filter-cell--custom',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div
            ref={cellRef}
            className={classNames}
            style={style}
            role="columnheader"
            aria-label={`Filter ${label}`}
            aria-colindex={ariaColIndex}
            data-field={colDef.field}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
        >
            {content}
        </div>
    );
}
