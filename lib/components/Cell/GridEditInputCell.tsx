import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { GridColDef, GridRenderEditCellParams } from '../../types';

export type GridEditInputCellProps = GridRenderEditCellParams;

type ValueOption = NonNullable<GridColDef['valueOptions']>[number];

/** The accessible name of an editor: its column header, or the field when there is none. */
function editorLabel(colDef: GridColDef): string {
    return colDef.headerName || colDef.field;
}

/** An IME is composing (keyCode 229 covers Safari and older engines): Enter/Escape belong to the IME. */
function isComposing(e: KeyboardEvent): boolean {
    return e.nativeEvent.isComposing || e.keyCode === 229;
}

function makeKeyDownHandler(onCommit: () => void, onCancel: () => void, commitOnEnter = true) {
    return (e: KeyboardEvent) => {
        if (isComposing(e)) {
            e.stopPropagation();
            return;
        }
        if (commitOnEnter && e.key === 'Enter') { e.stopPropagation(); onCommit(); }
        if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
    };
}

// ─── Text / String ────────────────────────────────────────────────────────────
function TextEditor({ value, colDef, onValueChange, onCommit, onCancel }: GridEditInputCellProps) {
    const [local, setLocal] = useState(String(value ?? ''));
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);

    return (
        <input
            ref={ref}
            type="text"
            className="ogx__edit-input"
            aria-label={editorLabel(colDef)}
            value={local}
            onChange={e => { setLocal(e.target.value); onValueChange(e.target.value); }}
            onBlur={onCommit}
            onKeyDown={makeKeyDownHandler(onCommit, onCancel)}
        />
    );
}

// ─── Number ───────────────────────────────────────────────────────────────────
function NumberEditor({ value, colDef, onValueChange, onCommit, onCancel }: GridEditInputCellProps) {
    const [local, setLocal] = useState<string | number>(typeof value === 'number' ? value : '');
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);

    return (
        <input
            ref={ref}
            type="number"
            className="ogx__edit-input ogx__edit-input--number"
            aria-label={editorLabel(colDef)}
            value={local}
            onChange={e => {
                const v = e.target.value === '' ? '' : Number(e.target.value);
                setLocal(v);
                onValueChange(v === '' ? null : v);
            }}
            onBlur={onCommit}
            onKeyDown={makeKeyDownHandler(onCommit, onCancel)}
        />
    );
}

// ─── Boolean ──────────────────────────────────────────────────────────────────
function BooleanEditor({ value, colDef, onValueChange, onCommit, onCancel }: GridEditInputCellProps) {
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => { ref.current?.focus(); }, []);

    const handleChange = () => {
        // The grid records the new value synchronously, so the toggle can be committed straight away.
        onValueChange(!value);
        onCommit();
    };

    return (
        <div className="ogx__edit-boolean">
            <input
                ref={ref}
                type="checkbox"
                className="ogx__edit-checkbox"
                aria-label={editorLabel(colDef)}
                checked={!!value}
                onChange={handleChange}
                onBlur={onCommit}
                onKeyDown={makeKeyDownHandler(onCommit, onCancel, false)}
            />
        </div>
    );
}

// ─── SingleSelect / Enum ──────────────────────────────────────────────────────
const optionValue = (opt: ValueOption): unknown => (typeof opt === 'object' ? opt.value : opt);
const optionLabel = (opt: ValueOption): string => (typeof opt === 'object' ? opt.label : String(opt));

function sameOptionValue(a: unknown, b: unknown): boolean {
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    return Object.is(a, b);
}

function SelectEditor({ value, colDef, onValueChange, onCommit, onCancel }: GridEditInputCellProps) {
    const ref = useRef<HTMLSelectElement>(null);
    useEffect(() => { ref.current?.focus(); }, []);

    const options = colDef.valueOptions ?? [];
    const keys = options.map(opt => String(optionValue(opt)));
    let selectedIndex = options.findIndex(opt => sameOptionValue(optionValue(opt), value));
    if (selectedIndex === -1 && value !== null && value !== undefined) {
        // Loose match so a string '2' in the row still selects the numeric option 2.
        selectedIndex = keys.indexOf(String(value));
    }
    // With no matching option the browser would show the first option as chosen while the value
    // is still null, and re-picking that option fires no change event. Show an empty choice instead.
    const showEmptyChoice = selectedIndex === -1;

    return (
        <select
            ref={ref}
            className="ogx__edit-select"
            aria-label={editorLabel(colDef)}
            value={showEmptyChoice ? '' : keys[selectedIndex]}
            onChange={e => {
                const index = keys.indexOf(e.target.value);
                // Commit the option's own value (a number stays a number), not the DOM string.
                onValueChange(index === -1 ? null : optionValue(options[index]));
            }}
            onBlur={onCommit}
            onKeyDown={makeKeyDownHandler(onCommit, onCancel)}
        >
            {showEmptyChoice && <option value="" />}
            {options.map((opt, i) => (
                <option key={i} value={keys[i]}>{optionLabel(opt)}</option>
            ))}
        </select>
    );
}

// ─── Date ─────────────────────────────────────────────────────────────────────
const pad2 = (n: number) => String(n).padStart(2, '0');
const ISO_DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})/;

/** The `YYYY-MM-DD` an `<input type="date">` needs; Dates use their local calendar day. */
function toDateInputValue(value: unknown): string {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime())
            ? ''
            : `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
    }
    if (typeof value === 'string') {
        const iso = ISO_DATE_PREFIX.exec(value);
        if (iso) return iso[1];
        return value === '' ? '' : toDateInputValue(new Date(value));
    }
    if (typeof value === 'number') return toDateInputValue(new Date(value));
    return '';
}

/**
 * Turns the picked `YYYY-MM-DD` back into the kind of value the cell held: a Date stays a Date
 * (keeping its time of day), a timestamp stays a timestamp, an ISO date-time string keeps its time
 * part. A cleared input commits `null`.
 */
function fromDateInputValue(picked: string, original: unknown): unknown {
    if (picked === '') return null;
    const [year, month, day] = picked.split('-').map(Number);
    const withDay = (base: Date) => {
        const next = new Date(base.getTime());
        next.setFullYear(year, month - 1, day);
        return next;
    };
    if (original instanceof Date && !Number.isNaN(original.getTime())) return withDay(original);
    if (typeof original === 'number' && Number.isFinite(original)) return withDay(new Date(original)).getTime();
    if (typeof original === 'string' && ISO_DATE_PREFIX.test(original) && original.length > 10) {
        return picked + original.slice(10);
    }
    return picked;
}

function DateEditor({ value, colDef, onValueChange, onCommit, onCancel }: GridEditInputCellProps) {
    // The value the edit started from decides the type that is committed back.
    const [initialValue] = useState(value);
    const [local, setLocal] = useState(() => toDateInputValue(value));
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => { ref.current?.focus(); }, []);

    return (
        <input
            ref={ref}
            type="date"
            className="ogx__edit-input"
            aria-label={editorLabel(colDef)}
            value={local}
            onChange={e => { setLocal(e.target.value); onValueChange(fromDateInputValue(e.target.value, initialValue)); }}
            onBlur={onCommit}
            onKeyDown={makeKeyDownHandler(onCommit, onCancel)}
        />
    );
}

// ─── Router ───────────────────────────────────────────────────────────────────
export function GridEditInputCell(props: GridEditInputCellProps) {
    const { colDef } = props;

    switch (colDef.type) {
        case 'number':
            return <div className="ogx__edit-cell"><NumberEditor {...props} /></div>;
        case 'boolean':
            return <div className="ogx__edit-cell"><BooleanEditor {...props} /></div>;
        case 'singleSelect':
            return <div className="ogx__edit-cell"><SelectEditor {...props} /></div>;
        case 'date':
            return <div className="ogx__edit-cell"><DateEditor {...props} /></div>;
        default:
            return <div className="ogx__edit-cell"><TextEditor {...props} /></div>;
    }
}
