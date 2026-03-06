import { useEffect, useRef, useState } from 'react';
import type { GridRenderCellParams } from '../../types';

export interface GridEditInputCellProps extends GridRenderCellParams {
    onValueChange: (value: any) => void;
    onCommit: () => void;
    onCancel: () => void;
}

// ─── Text / String ────────────────────────────────────────────────────────────
function TextEditor({ value, onValueChange, onCommit, onCancel }: GridEditInputCellProps) {
    const [local, setLocal] = useState(String(value ?? ''));
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);

    return (
        <input
            ref={ref}
            type="text"
            className="ogx__edit-input"
            value={local}
            onChange={e => { setLocal(e.target.value); onValueChange(e.target.value); }}
            onBlur={onCommit}
            onKeyDown={e => {
                if (e.key === 'Enter') { e.stopPropagation(); onCommit(); }
                if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
            }}
        />
    );
}

// ─── Number ───────────────────────────────────────────────────────────────────
function NumberEditor({ value, onValueChange, onCommit, onCancel }: GridEditInputCellProps) {
    const [local, setLocal] = useState(value ?? '');
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);

    return (
        <input
            ref={ref}
            type="number"
            className="ogx__edit-input ogx__edit-input--number"
            value={local}
            onChange={e => {
                const v = e.target.value === '' ? '' : Number(e.target.value);
                setLocal(v);
                onValueChange(v === '' ? null : v);
            }}
            onBlur={onCommit}
            onKeyDown={e => {
                if (e.key === 'Enter') { e.stopPropagation(); onCommit(); }
                if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
            }}
        />
    );
}

// ─── Boolean ──────────────────────────────────────────────────────────────────
function BooleanEditor({ value, onValueChange, onCommit, onCancel }: GridEditInputCellProps) {
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => { ref.current?.focus(); }, []);

    const handleChange = () => {
        const next = !value;
        onValueChange(next);
        // Commit immediately on toggle
        setTimeout(onCommit, 0);
    };

    return (
        <div className="ogx__edit-boolean">
            <input
                ref={ref}
                type="checkbox"
                className="ogx__edit-checkbox"
                checked={!!value}
                onChange={handleChange}
                onKeyDown={e => {
                    if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
                }}
            />
        </div>
    );
}

// ─── SingleSelect / Enum ──────────────────────────────────────────────────────
function SelectEditor({ value, colDef, onValueChange, onCommit, onCancel }: GridEditInputCellProps) {
    const ref = useRef<HTMLSelectElement>(null);
    useEffect(() => { ref.current?.focus(); }, []);

    const options = colDef.valueOptions ?? [];

    return (
        <select
            ref={ref}
            className="ogx__edit-select"
            value={value ?? ''}
            onChange={e => { onValueChange(e.target.value); }}
            onBlur={onCommit}
            onKeyDown={e => {
                if (e.key === 'Enter') { e.stopPropagation(); onCommit(); }
                if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
            }}
        >
            {options.map(opt => {
                const v = typeof opt === 'object' ? opt.value : opt;
                const l = typeof opt === 'object' ? opt.label : String(opt);
                return <option key={String(v)} value={String(v)}>{l}</option>;
            })}
        </select>
    );
}

// ─── Date ─────────────────────────────────────────────────────────────────────
function DateEditor({ value, onValueChange, onCommit, onCancel }: GridEditInputCellProps) {
    const [local, setLocal] = useState(value ?? '');
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => { ref.current?.focus(); }, []);

    return (
        <input
            ref={ref}
            type="date"
            className="ogx__edit-input"
            value={local}
            onChange={e => { setLocal(e.target.value); onValueChange(e.target.value); }}
            onBlur={onCommit}
            onKeyDown={e => {
                if (e.key === 'Enter') { e.stopPropagation(); onCommit(); }
                if (e.key === 'Escape') { e.stopPropagation(); onCancel(); }
            }}
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
