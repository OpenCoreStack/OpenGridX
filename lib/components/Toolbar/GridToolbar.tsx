import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, useContext } from 'react';
import ReactDOM from 'react-dom';
import type { GridColDef, GridAggregationModel, GridPivotModel, GridFilterModel } from '../../types';
import { AGGREGATION_FUNCTIONS } from '../../utils/aggregation';
import type { BuiltInAggFn } from '../../utils/aggregation';
import { getViewportWidth } from '../../utils/viewport';
import { GridToolbarHostContext } from '../../hooks/core/gridToolbarHostContext';
import { PivotPanel, PivotIcon } from './PivotPanel';
import { GlobalSearch } from './GlobalSearch';
import { ColumnVisibilityPanel } from '../ColumnVisibilityPanel/ColumnVisibilityPanel';
import { FilterPanel } from '../FilterPanel/FilterPanel';
import { GridTooltip } from '../Tooltip/Tooltip';

/** Props passed to a custom toolbar button renderer. */
export interface ToolbarButtonRenderProps {
    /** Call this to toggle the associated panel open/closed. */
    onClick: () => void;
    /** Whether the associated panel is currently open. */
    isOpen: boolean;
    /** Number of active items (filters applied, aggregations configured, etc.). */
    activeCount: number;
}

/** Props passed to a custom quick-filter renderer. */
export interface ToolbarQuickFilterRenderProps {
    /** Current search string. */
    value: string;
    /** Call with the new search string when the input changes. */
    onChange: (value: string) => void;
}

export interface GridToolbarProps {
    columns?: GridColDef[];
    /** Original user-defined columns (before pivot transformation).
     *  When provided, the PivotPanel shows these instead of `columns`
     *  to prevent pivot-generated synthetic columns from appearing in
     *  'Available Fields' and causing infinite nested aggregations. */
    baseColumns?: GridColDef[];
    aggregationModel?: GridAggregationModel;
    onAggregationModelChange?: (model: GridAggregationModel) => void;
    pivotModel?: GridPivotModel;
    onPivotModelChange?: (model: GridPivotModel) => void;
    filterModel?: GridFilterModel;
    onFilterModelChange?: (model: GridFilterModel) => void;
    columnVisibilityModel?: Record<string, boolean>;
    onColumnVisibilityModelChange?: (model: Record<string, boolean>) => void;
    onColumnReorder?: (fromField: string, toField: string) => void;
    onColumnOrderReset?: () => void;
    forceColumnsOpen?: boolean;
    onColumnsPanelClose?: () => void;
    children?: React.ReactNode;
    rightContent?: React.ReactNode;
    style?: React.CSSProperties;
    /**
     * Replace the built-in Columns button. The columns panel still opens and
     * closes normally — only the trigger element is replaced.
     */
    renderColumnsButton?: (props: ToolbarButtonRenderProps) => React.ReactNode;
    /**
     * Replace the built-in Filters button. The filter panel still opens and
     * closes normally — only the trigger element is replaced.
     */
    renderFilterButton?: (props: ToolbarButtonRenderProps) => React.ReactNode;
    /**
     * Replace the built-in Aggregation/Summaries button. The aggregation panel
     * still opens and closes normally — only the trigger element is replaced.
     */
    renderAggregationButton?: (props: ToolbarButtonRenderProps) => React.ReactNode;
    /**
     * Render an Export button. There is no built-in export button — this slot
     * inserts your element after the Aggregation button in the toolbar action row.
     */
    renderExportButton?: () => React.ReactNode;
    /**
     * Replace the built-in quick-filter search bar. Receives the current search
     * value and an onChange handler; connect them to your own input element.
     */
    renderQuickFilter?: (props: ToolbarQuickFilterRenderProps) => React.ReactNode;
    /** Additional CSS class applied to the toolbar root element. */
    className?: string;
    /** Show columns with `hideable: false` in the Columns panel as disabled rows. Default: false. */
    showNonHideableColumns?: boolean;
}

const BUILT_IN_AGGREGATION_FUNCTIONS = Object.keys(AGGREGATION_FUNCTIONS) as BuiltInAggFn[];

function isBuiltInAggregationFunction(fn: string): fn is BuiltInAggFn {
    return Object.prototype.hasOwnProperty.call(AGGREGATION_FUNCTIONS, fn);
}

/**
 * The summary functions offered for a column: its `availableAggregationFunctions` when set,
 * otherwise every built-in one. Names the aggregation engine does not implement are dropped,
 * because choosing one would show the label in the header but never compute a value.
 */
function getAggregationFunctions(col: GridColDef): BuiltInAggFn[] {
    if (!col.availableAggregationFunctions) return BUILT_IN_AGGREGATION_FUNCTIONS;
    return Array.from(new Set(col.availableAggregationFunctions.filter(isBuiltInAggregationFunction)));
}

type ToolbarPanel = 'summaries' | 'pivot' | 'columns' | 'filters';

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
    anchorRef: React.RefObject<HTMLElement | null>;
    aggregationModel: GridAggregationModel;
    aggregableColumns: GridColDef[];
    onFunctionChange: (field: string, fn: string) => void;
    onClearAll: () => void;
    onClose: () => void;
    activeCount: number;
}) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<PanelPosition>({ top: 0, right: 0 });
    const [portalContainer, setPortalContainer] = useState<Element>(document.body);

    useLayoutEffect(() => {
        setPortalContainer(anchorRef.current?.closest('.ogx-theme-provider') ?? document.body);
    }, [anchorRef]);

    const computePos = useCallback((): PanelPosition => {
        if (!anchorRef.current) return { top: 0, right: 0 };
        const rect = anchorRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + 6,
            right: getViewportWidth() - rect.right,
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
                        type="button"
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
                                    {['none', ...getAggregationFunctions(col)].map((fn) => (
                                        <button
                                            type="button"
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

    return ReactDOM.createPortal(panel, portalContainer);
}

function ColumnsPanelWrapper({
    anchorRef,
    columns,
    visibleColumns,
    onVisibilityChange,
    onShowAll,
    onHideAll,
    onColumnReorder,
    onColumnOrderReset,
    onClose,
    showNonHideableColumns,
}: {
    anchorRef: React.RefObject<HTMLElement | null>;
    columns: GridColDef[];
    visibleColumns: Set<string>;
    onVisibilityChange: (field: string, isVisible: boolean) => void;
    onShowAll: () => void;
    onHideAll: () => void;
    onColumnReorder?: (fromField: string, toField: string) => void;
    onColumnOrderReset?: () => void;
    onClose: () => void;
    showNonHideableColumns?: boolean;
}) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<PanelPosition>({ top: 0, right: 0 });
    const [portalContainer, setPortalContainer] = useState<Element>(document.body);

    useLayoutEffect(() => {
        setPortalContainer(anchorRef.current?.closest('.ogx-theme-provider') ?? document.body);
    }, [anchorRef]);

    const computePos = useCallback((): PanelPosition => {
        if (!anchorRef.current) return { top: 0, right: 0 };
        const rect = anchorRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + 6,
            right: getViewportWidth() - rect.right,
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
                onColumnOrderReset={onColumnOrderReset}
                showNonHideableColumns={showNonHideableColumns}
            />
        </div>
    );

    return ReactDOM.createPortal(panel, portalContainer);
}

function FilterPanelWrapper({
    anchorRef,
    columns,
    filterModel,
    onFilterModelChange,
    onClose
}: {
    anchorRef: React.RefObject<HTMLElement | null>;
    columns: GridColDef[];
    filterModel: GridFilterModel;
    onFilterModelChange: (model: GridFilterModel) => void;
    onClose: () => void;
}) {
    const panelRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<PanelPosition>({ top: 0, right: 0 });
    // Stable ref for onClose — prevents the mousedown effect from
    // tearing down and re-registering on every filterModel update,
    // which could fire the close callback during the re-register window.
    const onCloseRef = useRef(onClose);
    useLayoutEffect(() => { onCloseRef.current = onClose; }, [onClose]);
    const [portalContainer, setPortalContainer] = useState<Element>(document.body);

    useLayoutEffect(() => {
        setPortalContainer(anchorRef.current?.closest('.ogx-theme-provider') ?? document.body);
    }, [anchorRef]);

    const computePos = useCallback((): PanelPosition => {
        if (!anchorRef.current) return { top: 0, right: 0 };
        const rect = anchorRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + 6,
            right: getViewportWidth() - rect.right,
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

    // Only Escape key closes the filter panel automatically.
    // Click-outside is intentionally removed: users need to type in filter
    // inputs without the panel closing. There is an explicit Close button.
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onCloseRef.current();
        }
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    // Empty deps — listener is registered once and uses the stable ref
    }, []);

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
            <div className="ogx-toolbar__panel-header">
                <span className="ogx-toolbar__panel-title">
                    <FilterIcon />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ogx-toolbar__panel-count">{activeFilterCount}</span>
                    )}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {activeFilterCount > 0 && (
                        <button
                            type="button"
                            className="ogx-toolbar__clear-btn"
                            onClick={handleClearAll}
                            title="Clear all filters"
                        >
                            Clear all
                        </button>
                    )}
                    <button
                        type="button"
                        className="ogx-toolbar__close-btn"
                        onClick={() => onCloseRef.current()}
                        title="Close filters"
                        aria-label="Close filters panel"
                    >
                        Close
                    </button>
                </div>
            </div>

            <div className="ogx-toolbar__panel-body ogx-toolbar__panel-body--filter">
                <FilterPanel
                    columns={columns}
                    filterModel={filterModel}
                    onFilterModelChange={onFilterModelChange}
                />
            </div>
        </div>
    );

    return ReactDOM.createPortal(panel, portalContainer);
}

const EMPTY_PIVOT: GridPivotModel = { rowFields: [], columnFields: [], valueFields: [] };

export function GridToolbar({
    columns = [],
    baseColumns,
    aggregationModel = {},
    onAggregationModelChange,
    pivotModel,
    onPivotModelChange,
    filterModel,
    onFilterModelChange,
    columnVisibilityModel = {},
    onColumnVisibilityModelChange,
    onColumnReorder,
    onColumnOrderReset,
    forceColumnsOpen,
    onColumnsPanelClose,
    children,
    rightContent,
    style,
    renderColumnsButton,
    renderFilterButton,
    renderAggregationButton,
    renderExportButton,
    renderQuickFilter,
    className,
    showNonHideableColumns,
}: GridToolbarProps) {
    // At most one panel is open. Every way the Columns panel closes (its button, a custom
    // button, another panel opening, click-outside, Escape) reports onColumnsPanelClose, so the
    // grid can ask for it again with forceColumnsOpen.
    const [openPanel, setOpenPanel] = useState<ToolbarPanel | null>(null);
    const aggOpen = openPanel === 'summaries';
    const pivotOpen = openPanel === 'pivot';
    const colsOpen = openPanel === 'columns';
    const filterOpen = openPanel === 'filters';

    const switchPanel = (next: ToolbarPanel | null) => {
        if (openPanel === 'columns' && next !== 'columns') onColumnsPanelClose?.();
        setOpenPanel(next);
    };
    const togglePanel = (panel: ToolbarPanel) => switchPanel(openPanel === panel ? null : panel);
    const closePanel = (panel: ToolbarPanel) => { if (openPanel === panel) switchPanel(null); };

    useEffect(() => {
        if (forceColumnsOpen) setOpenPanel('columns');
    }, [forceColumnsOpen]);

    // Tell the grid this toolbar shows the Columns panel for the column menu; it can only do so
    // when the grid's forceColumnsOpen reaches it and the Columns panel is enabled.
    const toolbarHost = useContext(GridToolbarHostContext);
    const hostsColumnsPanel = forceColumnsOpen !== undefined && Boolean(onColumnVisibilityModelChange);
    useEffect(() => {
        if (!toolbarHost || !hostsColumnsPanel) return undefined;
        return toolbarHost.registerColumnsPanel();
    }, [toolbarHost, hostsColumnsPanel]);

    const aggButtonRef = useRef<HTMLButtonElement>(null);
    const pivotButtonRef = useRef<HTMLButtonElement>(null);
    const colsButtonRef = useRef<HTMLButtonElement>(null);
    const filterButtonRef = useRef<HTMLButtonElement>(null);

    // Wrapper div refs — used as panel anchors when a custom button renderer
    // is provided (the custom element doesn't expose a ref to us).
    const colsWrapperRef = useRef<HTMLDivElement>(null);
    const filterWrapperRef = useRef<HTMLDivElement>(null);
    const aggWrapperRef = useRef<HTMLDivElement>(null);

    const currentPivotModel = pivotModel ?? EMPTY_PIVOT;
    const pivotActive = currentPivotModel.rowFields.length > 0
        || currentPivotModel.columnFields.length > 0
        || currentPivotModel.valueFields.length > 0;

    // aggregationModel keys name source columns, so generated pivot columns (absent from baseColumns)
    // are never offered: a summary on them would do nothing and leave a stray key in the model.
    const baseFields = baseColumns ? new Set(baseColumns.map((c) => c.field)) : null;
    const aggregableColumns = columns.filter(
        (c) => c.aggregable !== false && (c.type === 'number' || c.aggregable === true)
            && getAggregationFunctions(c).length > 0
            && (!baseFields || baseFields.has(c.field))
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

        // Each whitespace-separated word is its own term; a row matches when every term is found
        // in some column, so "john london" finds first = John, city = London.
        const values = value.trim().split(/\s+/).filter(Boolean);
        const nextModel = {
            ...(filterModel || {}),
            quickFilterValues: values,
            items: filterModel?.items || []
        };
        onFilterModelChange(nextModel);
    }, [filterModel, onFilterModelChange]);

    const searchValue = (filterModel?.quickFilterValues ?? []).join(' ');
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
        <div className={['ogx-toolbar', className].filter(Boolean).join(' ')} role="toolbar" aria-label="Grid toolbar" style={style}>
            {/* Left slot — custom content */}
            {children && <div className="ogx-toolbar__left">{children}</div>}

            {/* Spacer */}
            <div className="ogx-toolbar__spacer" />

            {/* Right: built-in buttons */}
            <div className="ogx-toolbar__actions">
                {onFilterModelChange && (
                    <div className="ogx-toolbar__dropdown-wrapper" style={{ marginRight: 4 }}>
                        {renderQuickFilter
                            ? renderQuickFilter({ value: searchValue, onChange: handleSearchChange })
                            : (
                                <GlobalSearch
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    placeholder="Search..."
                                />
                            )
                        }
                    </div>
                )}

                {/* Columns Button */}
                {onColumnVisibilityModelChange && (
                    <div ref={colsWrapperRef} className="ogx-toolbar__dropdown-wrapper" style={{ marginRight: 4 }}>
                        {renderColumnsButton
                            ? renderColumnsButton({
                                onClick: () => togglePanel('columns'),
                                isOpen: colsOpen,
                                activeCount: columns.length - visibleColumns.size,
                            })
                            : (
                                <GridTooltip title="Columns">
                                    <button
                                        type="button"
                                        ref={colsButtonRef}
                                        className={`ogx-toolbar__icon-btn${colsOpen ? ' ogx-toolbar__icon-btn--active' : ''}`}
                                        aria-label="Manage columns"
                                        aria-haspopup="dialog"
                                        aria-expanded={colsOpen}
                                        onClick={() => togglePanel('columns')}
                                    >
                                        <ViewColumnIcon />
                                    </button>
                                </GridTooltip>
                            )
                        }
                        {colsOpen && (
                            <ColumnsPanelWrapper
                                anchorRef={renderColumnsButton ? colsWrapperRef : colsButtonRef}
                                columns={columns}
                                visibleColumns={visibleColumns}
                                onVisibilityChange={handleVisibilityChange}
                                onShowAll={handleShowAllColumns}
                                onHideAll={handleHideAllColumns}
                                onColumnReorder={onColumnReorder}
                                onColumnOrderReset={onColumnOrderReset}
                                onClose={() => closePanel('columns')}
                                showNonHideableColumns={showNonHideableColumns}
                            />
                        )}
                    </div>
                )}

                {/* Filters Button */}
                {onFilterModelChange && (
                    <div ref={filterWrapperRef} className="ogx-toolbar__dropdown-wrapper" style={{ marginRight: 4 }}>
                        {renderFilterButton
                            ? renderFilterButton({
                                onClick: () => togglePanel('filters'),
                                isOpen: filterOpen,
                                activeCount: activeFilterCount,
                            })
                            : (
                                <GridTooltip title="Filters">
                                    <button
                                        type="button"
                                        ref={filterButtonRef}
                                        className={`ogx-toolbar__icon-btn${filterOpen ? ' ogx-toolbar__icon-btn--active' : ''}`}
                                        aria-label="Advanced filters"
                                        aria-haspopup="dialog"
                                        aria-expanded={filterOpen}
                                        onClick={() => togglePanel('filters')}
                                    >
                                        <FilterIcon />
                                        {activeFilterCount > 0 && (
                                            <span className="ogx-toolbar__dot" aria-label="Filters active" />
                                        )}
                                    </button>
                                </GridTooltip>
                            )
                        }
                        {filterOpen && (
                            <FilterPanelWrapper
                                anchorRef={renderFilterButton ? filterWrapperRef : filterButtonRef}
                                columns={columns}
                                filterModel={filterModel || { items: [] }}
                                onFilterModelChange={onFilterModelChange}
                                onClose={() => closePanel('filters')}
                            />
                        )}
                    </div>
                )}

                {/* Pivot button */}
                {onPivotModelChange && (
                    <div className="ogx-toolbar__dropdown-wrapper" style={{ marginRight: 4 }}>
                        <GridTooltip title="Pivot">
                            <button
                                type="button"
                                ref={pivotButtonRef}
                                className={`ogx-toolbar__icon-btn${pivotOpen ? ' ogx-toolbar__icon-btn--active' : ''}`}
                                aria-label="Configure pivot"
                                aria-haspopup="dialog"
                                aria-expanded={pivotOpen}
                                onClick={() => togglePanel('pivot')}
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
                                columns={baseColumns ?? columns}
                                model={currentPivotModel}
                                onChange={(m) => { onPivotModelChange?.(m); }}
                                onClose={() => closePanel('pivot')}
                            />
                        )}
                    </div>
                )}

                {/* Summaries button */}
                {onAggregationModelChange && (
                    <div ref={aggWrapperRef} className="ogx-toolbar__dropdown-wrapper" style={{ marginRight: 4 }}>
                        {renderAggregationButton
                            ? renderAggregationButton({
                                onClick: () => togglePanel('summaries'),
                                isOpen: aggOpen,
                                activeCount,
                            })
                            : (
                                <GridTooltip title="Summaries">
                                    <button
                                        type="button"
                                        ref={aggButtonRef}
                                        className={`ogx-toolbar__icon-btn${aggOpen ? ' ogx-toolbar__icon-btn--active' : ''}`}
                                        aria-label="Configure summaries"
                                        aria-haspopup="dialog"
                                        aria-expanded={aggOpen}
                                        onClick={() => togglePanel('summaries')}
                                    >
                                        <SigmaIcon />
                                        {activeCount > 0 && (
                                            <span className="ogx-toolbar__dot" aria-label={`${activeCount} active summaries`} />
                                        )}
                                    </button>
                                </GridTooltip>
                            )
                        }

                        {aggOpen && (
                            <AggregationPanel
                                anchorRef={renderAggregationButton ? aggWrapperRef : aggButtonRef}
                                aggregationModel={aggregationModel}
                                aggregableColumns={aggregableColumns}
                                onFunctionChange={handleFunctionChange}
                                onClearAll={clearAllAgg}
                                onClose={() => closePanel('summaries')}
                                activeCount={activeCount}
                            />
                        )}
                    </div>
                )}

                {/* Export button slot */}
                {renderExportButton && renderExportButton()}

                {rightContent}
            </div>
        </div>
    );
}
