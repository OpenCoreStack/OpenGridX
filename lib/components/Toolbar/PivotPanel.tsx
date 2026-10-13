import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import type { GridColDef } from '../../types';
import type { GridPivotModel, GridPivotAggFn, GridPivotValueField } from '../../types';
import { getViewportWidth } from '../../utils/viewport';
import { getPanelPosition, type GridPanelPosition } from '../../utils/direction';
import { useGridLocale } from '../DataGrid/gridLocaleContext';

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
    const locale = useGridLocale();
    const panelRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<GridPanelPosition>({ top: 0, right: 0 });
    const [portalContainer, setPortalContainer] = useState<Element | null>(null);

    useLayoutEffect(() => {
        setPortalContainer(anchorRef.current?.closest('.ogx-theme-provider') ?? document.body);
    }, [anchorRef]);

    const computePos = useCallback(() => getPanelPosition(anchorRef.current, getViewportWidth()), [anchorRef]);

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

    const colDefOf = (field: string) => columns.find((c) => c.field === field);
    const colLabel = (field: string) => colDefOf(field)?.headerName ?? field;

    // The same column rules the grid applies elsewhere: availableAggregationFunctions limits the
    // functions, aggregable: false keeps a column out of the values (as in the Summaries panel), and
    // groupable: false keeps it out of the row and column dimensions (as in row grouping).
    const allowedFns = (field: string): GridPivotAggFn[] => {
        const allowed = colDefOf(field)?.availableAggregationFunctions;
        return allowed ? AGG_FNS.filter((fn) => allowed.includes(fn)) : AGG_FNS;
    };
    const canBeValue = (col: GridColDef) =>
        col.aggregable !== false && (col.type === 'number' || col.aggregable === true) && allowedFns(col.field).length > 0;
    const canBeDimension = (col: GridColDef) => col.groupable !== false;

    function addRow(field: string) {
        if (inRow.has(field)) return;
        onChange({ ...model, rowFields: [...model.rowFields, field] });
    }
    function addCol(field: string) {
        if (inCol.has(field)) return;
        onChange({ ...model, columnFields: [...model.columnFields, field] });
    }
    function addValue(field: string) {
        if (inValue.has(field)) return;
        onChange({ ...model, valueFields: [...model.valueFields, { field, aggFn: allowedFns(field)[0] ?? 'sum' }] });
    }
    function removeRow(index: number) {
        onChange({ ...model, rowFields: model.rowFields.filter((_, i) => i !== index) });
    }
    function removeCol(index: number) {
        onChange({ ...model, columnFields: model.columnFields.filter((_, i) => i !== index) });
    }
    // Value chips are addressed by position: one field may appear with several functions.
    function removeValue(index: number) {
        onChange({ ...model, valueFields: model.valueFields.filter((_, i) => i !== index) });
    }
    function changeValueFn(index: number, aggFn: GridPivotAggFn) {
        onChange({
            ...model,
            valueFields: model.valueFields.map((v, i) => i === index ? { ...v, aggFn } : v),
        });
    }
    function reset() {
        onChange({ rowFields: [], columnFields: [], valueFields: [] });
    }

    const totalActive = model.rowFields.length + model.columnFields.length + model.valueFields.length;

    const availableColumns = columns.filter((col) => !isUsed(col.field) && (canBeDimension(col) || canBeValue(col)));

    const panel = (
        <div
            ref={panelRef}
            className="ogx-pivot-panel"
            role="dialog"
            aria-label={locale.pivotPanelLabel}
            style={{ top: pos.top, right: pos.right, left: pos.left }}
        >
            { }
            <div className="ogx-pivot-panel__header">
                <span className="ogx-pivot-panel__title">
                    <PivotIcon />
                    {locale.pivotMode}
                </span>
                {totalActive > 0 && (
                    <button type="button" className="ogx-pivot-panel__reset-btn" onClick={reset} title={locale.pivotResetTooltip}>
                        {locale.pivotReset}
                    </button>
                )}
            </div>

            <div className="ogx-pivot-panel__body">

                { }
                <div className="ogx-pivot-zone">
                    <span className="ogx-pivot-zone__label">
                        <span className="ogx-pivot-zone__dot ogx-pivot-zone__dot--row" />
                        {locale.pivotRowFields}
                    </span>
                    <div
                        className={`ogx-pivot-chips${model.rowFields.length === 0 ? ' ogx-pivot-chips--empty' : ''}`}
                        data-placeholder={locale.pivotRowFieldsPlaceholder}
                    >
                        {model.rowFields.map((f, i) => (
                            <span key={`${i}:${f}`} className="ogx-pivot-chip ogx-pivot-chip--row">
                                {colLabel(f)}
                                <button
                                    type="button"
                                    className="ogx-pivot-chip__remove"
                                    onClick={() => removeRow(i)}
                                    title={locale.pivotRemoveTooltip(colLabel(f))}
                                    aria-label={locale.pivotRemoveRowLabel(colLabel(f))}
                                >×</button>
                            </span>
                        ))}
                    </div>
                </div>

                { }
                <div className="ogx-pivot-zone">
                    <span className="ogx-pivot-zone__label">
                        <span className="ogx-pivot-zone__dot ogx-pivot-zone__dot--col" />
                        {locale.pivotColumnFields}
                    </span>
                    <div
                        className={`ogx-pivot-chips${model.columnFields.length === 0 ? ' ogx-pivot-chips--empty' : ''}`}
                        data-placeholder={locale.pivotColumnFieldsPlaceholder}
                    >
                        {model.columnFields.map((f, i) => (
                            <span key={`${i}:${f}`} className="ogx-pivot-chip ogx-pivot-chip--col">
                                {colLabel(f)}
                                <button
                                    type="button"
                                    className="ogx-pivot-chip__remove"
                                    onClick={() => removeCol(i)}
                                    title={locale.pivotRemoveTooltip(colLabel(f))}
                                    aria-label={locale.pivotRemoveColumnLabel(colLabel(f))}
                                >×</button>
                            </span>
                        ))}
                    </div>
                </div>

                { }
                <div className="ogx-pivot-zone">
                    <span className="ogx-pivot-zone__label">
                        <span className="ogx-pivot-zone__dot ogx-pivot-zone__dot--value" />
                        {locale.pivotValueFields}
                    </span>
                    <div
                        className={`ogx-pivot-chips${model.valueFields.length === 0 ? ' ogx-pivot-chips--empty' : ''}`}
                        data-placeholder={locale.pivotValueFieldsPlaceholder}
                    >
                        {model.valueFields.map((vf: GridPivotValueField, i) => {
                            const allowed = allowedFns(vf.field);
                            const fnOptions = allowed.includes(vf.aggFn) ? allowed : [vf.aggFn, ...allowed];
                            return (
                                <span key={`${i}:${vf.field}:${vf.aggFn}`} className="ogx-pivot-chip ogx-pivot-chip--value">
                                    {colLabel(vf.field)}
                                    <select
                                        className="ogx-pivot-chip__fn-select"
                                        value={vf.aggFn}
                                        onChange={(e) => changeValueFn(i, e.target.value as GridPivotAggFn)}
                                        title={locale.pivotAggregationTooltip}
                                        aria-label={locale.pivotAggregationLabel(colLabel(vf.field))}
                                    >
                                        {fnOptions.map((fn) => (
                                            <option key={fn} value={fn}>{locale.pivotAggregationFunction(fn)}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        className="ogx-pivot-chip__remove"
                                        onClick={() => removeValue(i)}
                                        title={locale.pivotRemoveTooltip(colLabel(vf.field))}
                                        aria-label={locale.pivotRemoveValueLabel(colLabel(vf.field), locale.pivotAggregationFunction(vf.aggFn))}
                                    >×</button>
                                </span>
                            );
                        })}
                    </div>
                </div>

                <hr className="ogx-pivot-panel__divider" />

                { }
                <div>
                    <div className="ogx-pivot-panel__fields-label">{locale.pivotAvailableFields}</div>
                    <div className="ogx-pivot-fields">
                        {availableColumns.map((col) => {
                            const isNum = canBeValue(col);
                            const isDimension = canBeDimension(col);
                            const label = col.headerName ?? col.field;
                            return (
                                <div key={col.field} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <span className={`ogx-pivot-field-btn${isNum ? ' ogx-pivot-field-btn--numeric' : ''}`}>
                                        {label}
                                    </span>
                                    <div className="ogx-pivot-field-actions">
                                        {isDimension && (
                                            <button type="button" className="ogx-pivot-add-btn ogx-pivot-add-btn--row" onClick={() => addRow(col.field)} title={locale.pivotAddRowTooltip} aria-label={locale.pivotAddRowLabel(label)}>{locale.pivotAddRow}</button>
                                        )}
                                        {isDimension && (
                                            <button type="button" className="ogx-pivot-add-btn ogx-pivot-add-btn--col" onClick={() => addCol(col.field)} title={locale.pivotAddColumnTooltip} aria-label={locale.pivotAddColumnLabel(label)}>{locale.pivotAddColumn}</button>
                                        )}
                                        {isNum && (
                                            <button type="button" className="ogx-pivot-add-btn ogx-pivot-add-btn--value" onClick={() => addValue(col.field)} title={locale.pivotAddValueTooltip} aria-label={locale.pivotAddValueLabel(label)}>{locale.pivotAddValue}</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {availableColumns.length === 0 && (
                            <span style={{ fontSize: 12, color: 'var(--ogx-color-gray-400, #94a3b8)' }}>
                                {locale.pivotAllFieldsInUse}
                            </span>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );

    return portalContainer ? ReactDOM.createPortal(panel, portalContainer) : null;
}
