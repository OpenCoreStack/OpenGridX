import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import type { GridColDef, GridAggregationModel, GridPivotModel, GridFilterModel } from '../../types';
import { PivotPanel, PivotIcon } from './PivotPanel';
import { GlobalSearch } from './GlobalSearch';
import { ColumnVisibilityPanel } from '../ColumnVisibilityPanel/ColumnVisibilityPanel';
import { FilterPanel } from '../FilterPanel/FilterPanel';
import { GridTooltip } from '../Tooltip/Tooltip';

export interface GridToolbarProps {
    columns?: GridColDef[];
    aggregationModel?: GridAggregationModel;
    onAggregationModelChange?: (model: GridAggregationModel) => void;
    pivotModel?: GridPivotModel;
    onPivotModelChange?: (model: GridPivotModel) => void;
    filterModel?: GridFilterModel;
    onFilterModelChange?: (model: GridFilterModel) => void;
    columnVisibilityModel?: Record<string, boolean>;
    onColumnVisibilityModelChange?: (model: Record<string, boolean>) => void;
    onColumnReorder?: (fromField: string, toField: string) => void;
    forceColumnsOpen?: boolean;
    onColumnsPanelClose?: () => void;
    children?: React.ReactNode;
    rightContent?: React.ReactNode;
    style?: React.CSSProperties;
}

const AGGREGATION_FUNCTIONS = ['none', 'sum', 'avg', 'count', 'min', 'max'] as const;

function SigmaIcon() {
    return (
        <svg
            width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M18 4H6l6 8-6 8h12" />
        </svg>
    );
}

function ViewColumnIcon() {
    return (
        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <rect x="8.5" y="4" width="7" height="16" fill="currentColor" opacity="0.25" />
            <line x1="8.5" y1="4" x2="8.5" y2="20" stroke="currentColor" strokeWidth="1.8" />
            <line x1="15.5" y1="4" x2="15.5" y2="20" stroke="currentColor" strokeWidth="1.8" />
            <line x1="2" y1="9" x2="22" y2="9" stroke="currentColor" strokeWidth="1.2" />
            <line x1="2" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="1.2" />
        </svg>
    );
}

function FilterIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    );
}

interface PanelPosition { top: number; right: number; }

function AggregationPanel({
    anchorRef,
    aggregationModel,
    aggregableColumns,
    onFunctionChange,
    onClearAll,
    onClose,
    activeCount,
}: {
    anchorRef: React.RefObject<HTMLButtonElement | null>;
    aggregationModel: GridAggregationModel;
    aggregableColumns: GridColDef[];
    onFunctionChange: (field: string, fn: string) => void;
    onClearAll: () => void;
    onClose: () => void;
    activeCount: number;
}) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<PanelPosition>({ top: 0, right: 0 });

    const computePos = useCallback((): PanelPosition => {
        if (!anchorRef.current) return { top: 0, right: 0 };
        const rect = anchorRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + 6,
            right: window.innerWidth - rect.right,
        };
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
        function handleClick(e: MouseEvent) {
            if (
                panelRef.current && !panelRef.current.contains(e.target as Node) &&
                anchorRef.current && !anchorRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [anchorRef, onClose]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    const panel = (
        <div
            ref={panelRef}
            className="ogx-toolbar__panel"
            role="dialog"
            aria-label="Summaries configuration"
            style={{ top: pos.top, right: pos.right, width: 400, maxWidth: 'calc(100vw - 24px)' }}
        >
            <div className="ogx-toolbar__panel-header">
                <span className="ogx-toolbar__panel-title">
                    <SigmaIcon />
                    Summaries
                </span>
                {activeCount > 0 && (
                    <button
                        className="ogx-toolbar__clear-btn"
                        onClick={onClearAll}
                        title="Clear all summaries"
                    >
                        Clear all
                    </button>
                )}
            </div>

            <div className="ogx-toolbar__panel-body">
                {aggregableColumns.length === 0 ? (
                    <p className="ogx-toolbar__empty">
                        No aggregable columns.<br />
                        Set <code>aggregable: true</code> on a column to enable.
                    </p>
                ) : (
                    aggregableColumns.map((col) => {
                        const currentFn = aggregationModel[col.field] || 'none';
                        return (
                            <div key={col.field} className="ogx-toolbar__agg-row">
                                <span className="ogx-toolbar__agg-label" title={col.field}>
                                    {col.headerName || col.field}
                                </span>
                                <div className="ogx-toolbar__agg-pills">
                                    {AGGREGATION_FUNCTIONS.map((fn) => (
                                        <button
                                            key={fn}
                                            className={`ogx-toolbar__pill${currentFn === fn ? ' ogx-toolbar__pill--active' : ''}`}
                                            onClick={() => onFunctionChange(col.field, fn)}
                                            aria-pressed={currentFn === fn}
                                        >
                                            {fn}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );

    return ReactDOM.createPortal(panel, anchorRef.current?.closest('.ogx-theme-provider') || document.body);
}

function ColumnsPanelWrapper({
    anchorRef,
    columns,
    visibleColumns,
    onVisibilityChange,
    onShowAll,
    onHideAll,
    onColumnReorder,
    onClose
}: {
    anchorRef: React.RefObject<HTMLButtonElement | null>;
    columns: GridColDef[];
    visibleColumns: Set<string>;
    onVisibilityChange: (field: string, isVisible: boolean) => void;
    onShowAll: () => void;
    onHideAll: () => void;
    onColumnReorder?: (fromField: string, toField: string) => void;
    onClose: () => void;
}) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<PanelPosition>({ top: 0, right: 0 });

    const computePos = useCallback((): PanelPosition => {
        if (!anchorRef.current) return { top: 0, right: 0 };
        const rect = anchorRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + 6,
            right: window.innerWidth - rect.right,
        };
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
        function handleClick(e: MouseEvent) {
            if (
                panelRef.current && !panelRef.current.contains(e.target as Node) &&
                anchorRef.current && !anchorRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [anchorRef, onClose]);

    const panel = (
        <div
            ref={panelRef}
            className="ogx-toolbar__panel"
            role="dialog"
            aria-label="Column visibility"
            style={{ top: pos.top, right: pos.right, width: 280, padding: 0 }}
        >
            <ColumnVisibilityPanel
                columns={columns}
                visibleColumns={visibleColumns}
                onVisibilityChange={onVisibilityChange}
                onShowAll={onShowAll}
                onHideAll={onHideAll}
                onColumnReorder={onColumnReorder}
            />
        </div>
    );

    return ReactDOM.createPortal(panel, anchorRef.current?.closest('.ogx-theme-provider') || document.body);
}

function FilterPanelWrapper({
    anchorRef,
    columns,
    filterModel,
    onFilterModelChange,
    onClose
}: {
    anchorRef: React.RefObject<HTMLButtonElement | null>;
    columns: GridColDef[];
    filterModel: GridFilterModel;
    onFilterModelChange: (model: GridFilterModel) => void;
    onClose: () => void;
}) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<PanelPosition>({ top: 0, right: 0 });

    const computePos = useCallback((): PanelPosition => {
        if (!anchorRef.current) return { top: 0, right: 0 };
        const rect = anchorRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + 6,
            right: window.innerWidth - rect.right,
        };
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
        function handleClick(e: MouseEvent) {
            if (
                panelRef.current && !panelRef.current.contains(e.target as Node) &&
                anchorRef.current && !anchorRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        }
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [anchorRef, onClose]);

    const activeFilterCount = filterModel.items?.length ?? 0;

    const handleClearAll = () => {
        onFilterModelChange({ ...filterModel, items: [], logicOperator: 'and' });
    };

    const panel = (
        <div
            ref={panelRef}
            className="ogx-toolbar__panel ogx-toolbar__panel--filter"
            role="dialog"
            aria-label="Advanced filters"
            style={{ top: pos.top, right: pos.right, width: 540, maxWidth: 'calc(100vw - 24px)' }}
        >
            { }
            <div className="ogx-toolbar__panel-header">
                <span className="ogx-toolbar__panel-title">
                    <FilterIcon />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ogx-toolbar__panel-count">{activeFilterCount}</span>
                    )}
                </span>
                {activeFilterCount > 0 && (
                    <button
                        className="ogx-toolbar__clear-btn"
                        onClick={handleClearAll}
                        title="Clear all filters"
                    >
                        Clear all
                    </button>
                )}
            </div>

            { }
            <div className="ogx-toolbar__panel-body ogx-toolbar__panel-body--filter">
                <FilterPanel
                    columns={columns}
                    filterModel={filterModel}
                    onFilterModelChange={onFilterModelChange}
                />
            </div>
        </div>
    );

    return ReactDOM.createPortal(panel, anchorRef.current?.closest('.ogx-theme-provider') || document.body);
}

const EMPTY_PIVOT: GridPivotModel = { rowFields: [], columnFields: [], valueFields: [] };

export function GridToolbar({
    columns = [],
    aggregationModel = {},
    onAggregationModelChange,
    pivotModel,
    onPivotModelChange,
    filterModel,
    onFilterModelChange,
    columnVisibilityModel = {},
    onColumnVisibilityModelChange,
    onColumnReorder,
    forceColumnsOpen,
    onColumnsPanelClose,
    children,
    rightContent,
    style,
}: GridToolbarProps) {
    const [aggOpen, setAggOpen] = useState(false);
    const [pivotOpen, setPivotOpen] = useState(false);
    const [colsOpen, setColsOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        if (forceColumnsOpen) {
            setColsOpen(true);
            setAggOpen(false);
            setPivotOpen(false);
            setFilterOpen(false);
        }
    }, [forceColumnsOpen]);

    const aggButtonRef = useRef<HTMLButtonElement>(null);
    const pivotButtonRef = useRef<HTMLButtonElement>(null);
    const colsButtonRef = useRef<HTMLButtonElement>(null);
    const filterButtonRef = useRef<HTMLButtonElement>(null);

    const currentPivotModel = pivotModel ?? EMPTY_PIVOT;
    const pivotActive = currentPivotModel.rowFields.length > 0
        || currentPivotModel.columnFields.length > 0
        || currentPivotModel.valueFields.length > 0;

    const aggregableColumns = columns.filter(
        (c) => c.aggregable !== false && (c.type === 'number' || c.aggregable === true)
    );

    const activeCount = Object.keys(aggregationModel).filter(
        (f) => aggregationModel[f] && aggregationModel[f] !== 'none'
    ).length;

    const handleFunctionChange = useCallback(
        (field: string, fn: string) => {
            if (!onAggregationModelChange) return;
            const next = { ...aggregationModel };
            if (fn === 'none') {
                delete next[field];
            } else {
                next[field] = fn;
            }
            onAggregationModelChange(next);
        },
        [aggregationModel, onAggregationModelChange]
    );

    const clearAllAgg = useCallback(() => {
        onAggregationModelChange?.({});
    }, [onAggregationModelChange]);

    const handleSearchChange = useCallback((value: string) => {
        if (!onFilterModelChange) return;

        const values = value ? [value] : [];
        const nextModel = {
            ...(filterModel || {}),
            quickFilterValues: values,
            items: filterModel?.items || []
        };
        onFilterModelChange(nextModel);
    }, [filterModel, onFilterModelChange]);

    const searchValue = filterModel?.quickFilterValues?.[0] || '';
    const activeFilterCount = (filterModel?.items?.length || 0);

    // Column Visibility Logic
    const visibleColumns = new Set(
        columns
            .filter(col => columnVisibilityModel[col.field] !== false) // default true
            .map(col => col.field)
    );

    const handleVisibilityChange = useCallback((field: string, isVisible: boolean) => {
        if (!onColumnVisibilityModelChange) return;
        const next = { ...columnVisibilityModel, [field]: isVisible };
        onColumnVisibilityModelChange(next);
    }, [columnVisibilityModel, onColumnVisibilityModelChange]);

    // Batch show/hide — build one full model so no stale-closure overwrites
    const handleShowAllColumns = useCallback(() => {
        if (!onColumnVisibilityModelChange) return;
        const next = { ...columnVisibilityModel };
        columns.forEach(col => {
            if (col.hideable !== false) next[col.field] = true;
        });
        onColumnVisibilityModelChange(next);
    }, [columns, columnVisibilityModel, onColumnVisibilityModelChange]);

    const handleHideAllColumns = useCallback(() => {
        if (!onColumnVisibilityModelChange) return;
        const next = { ...columnVisibilityModel };
        columns.forEach(col => {
            if (col.hideable !== false) next[col.field] = false;
        });
        onColumnVisibilityModelChange(next);
    }, [columns, columnVisibilityModel, onColumnVisibilityModelChange]);

    return (
        <div className="ogx-toolbar" role="toolbar" aria-label="Grid toolbar" style={style}>
            {/* Left slot — custom content */}
            {children && <div className="ogx-toolbar__left">{children}</div>}

            {/* Spacer */}
            <div className="ogx-toolbar__spacer" />

            {/* Right: built-in buttons */}
            <div className="ogx-toolbar__actions">
                {onFilterModelChange && (
                    <div className="ogx-toolbar__dropdown-wrapper" style={{ marginRight: 4 }}>
                        <GlobalSearch
                            value={searchValue}
                            onChange={handleSearchChange}
                            placeholder="Search..."
                        />
                    </div>
                )}

                {/* Columns Button */}
                {onColumnVisibilityModelChange && (
                    <div className="ogx-toolbar__dropdown-wrapper" style={{ marginRight: 4 }}>
                        <GridTooltip title="Columns">
                            <button
                                ref={colsButtonRef}
                                className={`ogx-toolbar__icon-btn${colsOpen ? ' ogx-toolbar__icon-btn--active' : ''}`}
                                aria-label="Manage columns"
                                onClick={() => {
                                    setColsOpen(!colsOpen);
                                    setAggOpen(false);
                                    setPivotOpen(false);
                                    setFilterOpen(false);
                                }}
                            >
                                <ViewColumnIcon />
                            </button>
                        </GridTooltip>
                        {colsOpen && (
                            <ColumnsPanelWrapper
                                anchorRef={colsButtonRef}
                                columns={columns}
                                visibleColumns={visibleColumns}
                                onVisibilityChange={handleVisibilityChange}
                                onShowAll={handleShowAllColumns}
                                onHideAll={handleHideAllColumns}
                                onColumnReorder={onColumnReorder}
                                onClose={() => { setColsOpen(false); onColumnsPanelClose?.(); }}
                            />
                        )}
                    </div>
                )}

                {/* Filters Button */}
                {onFilterModelChange && (
                    <div className="ogx-toolbar__dropdown-wrapper" style={{ marginRight: 4 }}>
                        <GridTooltip title="Filters">
                            <button
                                ref={filterButtonRef}
                                className={`ogx-toolbar__icon-btn${filterOpen ? ' ogx-toolbar__icon-btn--active' : ''}`}
                                aria-label="Advanced filters"
                                onClick={() => {
                                    setFilterOpen(!filterOpen);
                                    setAggOpen(false);
                                    setPivotOpen(false);
                                    setColsOpen(false);
                                }}
                            >
                                <FilterIcon />
                                {activeFilterCount > 0 && (
                                    <span className="ogx-toolbar__dot" aria-label="Filters active" />
                                )}
                            </button>
                        </GridTooltip>
                        {filterOpen && (
                            <FilterPanelWrapper
                                anchorRef={filterButtonRef}
                                columns={columns}
                                filterModel={filterModel || { items: [] }}
                                onFilterModelChange={onFilterModelChange}
                                onClose={() => setFilterOpen(false)}
                            />
                        )}
                    </div>
                )}

                {/* Pivot button */}
                {onPivotModelChange && (
                    <div className="ogx-toolbar__dropdown-wrapper" style={{ marginRight: 4 }}>
                        <GridTooltip title="Pivot">
                            <button
                                ref={pivotButtonRef}
                                id="ogx-pivot-btn"
                                className={`ogx-toolbar__icon-btn${pivotOpen ? ' ogx-toolbar__icon-btn--active' : ''}`}
                                aria-label="Configure pivot"
                                aria-expanded={pivotOpen}
                                aria-controls="ogx-pivot-panel"
                                onClick={() => {
                                    setPivotOpen(!pivotOpen);
                                    setAggOpen(false);
                                    setColsOpen(false);
                                    setFilterOpen(false);
                                }}
                            >
                                <PivotIcon />
                                {pivotActive && (
                                    <span className="ogx-toolbar__dot" aria-label="Pivot active" />
                                )}
                            </button>
                        </GridTooltip>

                        {pivotOpen && (
                            <PivotPanel
                                anchorRef={pivotButtonRef}
                                columns={columns}
                                model={currentPivotModel}
                                onChange={(m) => { onPivotModelChange?.(m); }}
                                onClose={() => setPivotOpen(false)}
                            />
                        )}
                    </div>
                )}

                {/* Summaries button */}
                <div className="ogx-toolbar__dropdown-wrapper" style={{ marginRight: 4 }}>
                    <GridTooltip title="Summaries">
                        <button
                            ref={aggButtonRef}
                            id="ogx-aggregation-btn"
                            className={`ogx-toolbar__icon-btn${aggOpen ? ' ogx-toolbar__icon-btn--active' : ''}`}
                            aria-label="Configure summaries"
                            aria-expanded={aggOpen}
                            aria-controls="ogx-aggregation-panel"
                            onClick={() => {
                                setAggOpen(!aggOpen);
                                setPivotOpen(false);
                                setColsOpen(false);
                                setFilterOpen(false);
                            }}
                        >
                            <SigmaIcon />
                            {activeCount > 0 && (
                                <span className="ogx-toolbar__dot" aria-label={`${activeCount} active summaries`} />
                            )}
                        </button>
                    </GridTooltip>

                    {aggOpen && (
                        <AggregationPanel
                            anchorRef={aggButtonRef}
                            aggregationModel={aggregationModel}
                            aggregableColumns={aggregableColumns}
                            onFunctionChange={handleFunctionChange}
                            onClearAll={clearAllAgg}
                            onClose={() => setAggOpen(false)}
                            activeCount={activeCount}
                        />
                    )}
                </div>

                {rightContent}
            </div>
        </div>
    );
}
