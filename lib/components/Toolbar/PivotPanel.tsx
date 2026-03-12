import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import type { GridColDef } from '../../types';
import type { GridPivotModel, GridPivotAggFn, GridPivotValueField } from '../../types';

const AGG_FNS: GridPivotAggFn[] = ['sum', 'avg', 'count', 'min', 'max'];

export function PivotIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.25" />
            <path d="M17 14v-4M17 10l-2 2 2 2" />
        </svg>
    );
}

export interface PivotPanelProps {
    anchorRef: React.RefObject<HTMLButtonElement | null>;
    columns: GridColDef[];
    model: GridPivotModel;
    onChange: (model: GridPivotModel) => void;
    onClose: () => void;
}

export function PivotPanel({ anchorRef, columns, model, onChange, onClose }: PivotPanelProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ top: 0, right: 0 });

    const computePos = useCallback(() => {
        if (!anchorRef.current) return { top: 0, right: 0 };
        const rect = anchorRef.current.getBoundingClientRect();
        return { top: rect.bottom + 6, right: window.innerWidth - rect.right };
    }, [anchorRef]);

    useEffect(() => {
        setPos(computePos());
        const update = () => setPos(computePos());
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [computePos]);

    useEffect(() => {
        function onClick(e: MouseEvent) {
            if (
                panelRef.current && !panelRef.current.contains(e.target as Node) &&
                anchorRef.current && !anchorRef.current.contains(e.target as Node)
            ) onClose();
        }
        function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [anchorRef, onClose]);

    const inRow = new Set(model.rowFields);
    const inCol = new Set(model.columnFields);
    const inValue = new Set(model.valueFields.map((v) => v.field));
    const isUsed = (f: string) => inRow.has(f) || inCol.has(f) || inValue.has(f);

    function addRow(field: string) {
        if (inRow.has(field)) return;
        onChange({ ...model, rowFields: [...model.rowFields, field] });
    }
    function addCol(field: string) {
        if (inCol.has(field)) return;
        onChange({ ...model, columnFields: [...model.columnFields, field] });
    }
    function addValue(field: string, aggFn: GridPivotAggFn = 'sum') {
        if (inValue.has(field)) return;
        onChange({ ...model, valueFields: [...model.valueFields, { field, aggFn }] });
    }
    function removeRow(field: string) {
        onChange({ ...model, rowFields: model.rowFields.filter((f) => f !== field) });
    }
    function removeCol(field: string) {
        onChange({ ...model, columnFields: model.columnFields.filter((f) => f !== field) });
    }
    function removeValue(field: string) {
        onChange({ ...model, valueFields: model.valueFields.filter((v) => v.field !== field) });
    }
    function changeValueFn(field: string, aggFn: GridPivotAggFn) {
        onChange({
            ...model,
            valueFields: model.valueFields.map((v) => v.field === field ? { ...v, aggFn } : v),
        });
    }
    function reset() {
        onChange({ rowFields: [], columnFields: [], valueFields: [] });
    }

    const numericFields = new Set(columns.filter((c) => c.type === 'number' || c.aggregable).map((c) => c.field));

    const totalActive = model.rowFields.length + model.columnFields.length + model.valueFields.length;

    const colLabel = (field: string) =>
        columns.find((c) => c.field === field)?.headerName ?? field;

    const panel = (
        <div
            ref={panelRef}
            className="ogx-pivot-panel"
            role="dialog"
            aria-label="Pivot configuration"
            style={{ top: pos.top, right: pos.right }}
        >
            { }
            <div className="ogx-pivot-panel__header">
                <span className="ogx-pivot-panel__title">
                    <PivotIcon />
                    Pivot Mode
                </span>
                {totalActive > 0 && (
                    <button className="ogx-pivot-panel__reset-btn" onClick={reset} title="Reset pivot">
                        Reset
                    </button>
                )}
            </div>

            <div className="ogx-pivot-panel__body">

                { }
                <div className="ogx-pivot-zone">
                    <span className="ogx-pivot-zone__label">
                        <span className="ogx-pivot-zone__dot ogx-pivot-zone__dot--row" />
                        Row Fields
                    </span>
                    <div
                        className={`ogx-pivot-chips${model.rowFields.length === 0 ? ' ogx-pivot-chips--empty' : ''}`}
                        data-placeholder="Add fields here — each becomes a row label"
                    >
                        {model.rowFields.map((f) => (
                            <span key={f} className="ogx-pivot-chip ogx-pivot-chip--row">
                                {colLabel(f)}
                                <button className="ogx-pivot-chip__remove" onClick={() => removeRow(f)} title={`Remove ${colLabel(f)}`}>×</button>
                            </span>
                        ))}
                    </div>
                </div>

                { }
                <div className="ogx-pivot-zone">
                    <span className="ogx-pivot-zone__label">
                        <span className="ogx-pivot-zone__dot ogx-pivot-zone__dot--col" />
                        Column Fields
                    </span>
                    <div
                        className={`ogx-pivot-chips${model.columnFields.length === 0 ? ' ogx-pivot-chips--empty' : ''}`}
                        data-placeholder="Add fields here — unique values become column headers"
                    >
                        {model.columnFields.map((f) => (
                            <span key={f} className="ogx-pivot-chip ogx-pivot-chip--col">
                                {colLabel(f)}
                                <button className="ogx-pivot-chip__remove" onClick={() => removeCol(f)} title={`Remove ${colLabel(f)}`}>×</button>
                            </span>
                        ))}
                    </div>
                </div>

                { }
                <div className="ogx-pivot-zone">
                    <span className="ogx-pivot-zone__label">
                        <span className="ogx-pivot-zone__dot ogx-pivot-zone__dot--value" />
                        Value Fields (aggregated)
                    </span>
                    <div
                        className={`ogx-pivot-chips${model.valueFields.length === 0 ? ' ogx-pivot-chips--empty' : ''}`}
                        data-placeholder="Add numeric fields here — values are aggregated"
                    >
                        {model.valueFields.map((vf: GridPivotValueField) => (
                            <span key={vf.field} className="ogx-pivot-chip ogx-pivot-chip--value">
                                {colLabel(vf.field)}
                                <select
                                    className="ogx-pivot-chip__fn-select"
                                    value={vf.aggFn}
                                    onChange={(e) => changeValueFn(vf.field, e.target.value as GridPivotAggFn)}
                                    title="Aggregation function"
                                >
                                    {AGG_FNS.map((fn) => (
                                        <option key={fn} value={fn}>{fn.toUpperCase()}</option>
                                    ))}
                                </select>
                                <button className="ogx-pivot-chip__remove" onClick={() => removeValue(vf.field)} title={`Remove ${colLabel(vf.field)}`}>×</button>
                            </span>
                        ))}
                    </div>
                </div>

                <hr className="ogx-pivot-panel__divider" />

                { }
                <div>
                    <div className="ogx-pivot-panel__fields-label">Available Fields</div>
                    <div className="ogx-pivot-fields">
                        {columns.map((col) => {
                            const isNum = numericFields.has(col.field);
                            const used = isUsed(col.field);
                            if (used) return null;
                            return (
                                <div key={col.field} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <span className={`ogx-pivot-field-btn${isNum ? ' ogx-pivot-field-btn--numeric' : ''}`}>
                                        {col.headerName ?? col.field}
                                    </span>
                                    <div className="ogx-pivot-field-actions">
                                        <button className="ogx-pivot-add-btn ogx-pivot-add-btn--row" onClick={() => addRow(col.field)} title="Add to Row Fields">Row</button>
                                        <button className="ogx-pivot-add-btn ogx-pivot-add-btn--col" onClick={() => addCol(col.field)} title="Add to Column Fields">Col</button>
                                        {isNum && (
                                            <button className="ogx-pivot-add-btn ogx-pivot-add-btn--value" onClick={() => addValue(col.field)} title="Add to Value Fields">Val</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {columns.every((col) => isUsed(col.field)) && (
                            <span style={{ fontSize: 12, color: 'var(--ogx-color-gray-400, #94a3b8)' }}>
                                All fields are in use.
                            </span>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );

    return ReactDOM.createPortal(panel, anchorRef.current?.closest('.ogx-theme-provider') || document.body);
}
