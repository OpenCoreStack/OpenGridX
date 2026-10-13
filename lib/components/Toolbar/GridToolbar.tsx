import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import type { GridColDef, GridAggregationModel, GridPivotModel, GridFilterModel } from '../../types';
import { getOfferedAggregationFunctions } from '../../utils/aggregation';
import { GridToolbarHostContext } from '../../hooks/core/gridToolbarHostContext';
import { PivotPanel, PivotIcon } from './PivotPanel';
import { GlobalSearch } from './GlobalSearch';
import { GridTooltip } from '../Tooltip/Tooltip';
import { AiSparkleIcon } from '../AiAssistant/GridAiAssistantPanel';
import { useGridLocale } from '../DataGrid/gridLocaleContext';
import { SigmaIcon, ViewColumnIcon, FilterIcon } from './ToolbarIcons';
import { AggregationPanel } from './AggregationPanel';
import { ColumnsPanelWrapper } from './ColumnsPanelWrapper';
import { FilterPanelWrapper } from './FilterPanelWrapper';

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
    /** Opens the filter panel when it turns true (the grid passes it for the header filter row). @since v3.5 */
    forceFiltersOpen?: boolean;
    /** Called whenever the filter panel closes. @since v3.5 */
    onFiltersPanelClose?: () => void;
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
    /**
     * Opens or closes the `aiAssistant` panel. The grid passes it when `aiAssistant` is set; the
     * **Ask AI** button is shown only with it. Receives the button, which gets focus back on close.
     * @since v3.5
     */
    onAiAssistantToggle?: (trigger: HTMLElement | null) => void;
    /** Whether the `aiAssistant` panel is open. @since v3.5 */
    aiAssistantOpen?: boolean;
    /** Label of the Ask AI button (`localeText.aiAssistantButton`). Default: `"Ask AI"`. @since v3.5 */
    aiAssistantLabel?: string;
}

type ToolbarPanel = 'summaries' | 'pivot' | 'columns' | 'filters';

const EMPTY_PIVOT: GridPivotModel = { rowFields: [], columnFields: [], valueFields: [] };
// Module-level default, so `columns` is the same frozen value on every render (React Compiler).
const NO_COLUMNS: GridColDef[] = [];

export function GridToolbar({
    columns = NO_COLUMNS,
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
    forceFiltersOpen,
    onFiltersPanelClose,
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
    onAiAssistantToggle,
    aiAssistantOpen = false,
    aiAssistantLabel: aiAssistantLabelProp,
}: GridToolbarProps) {
    const locale = useGridLocale();
    const aiAssistantLabel = aiAssistantLabelProp ?? locale.aiAssistantButton;
    // At most one panel is open. Every way the Columns panel closes (its button, a custom
    // button, another panel opening, click-outside, Escape) reports onColumnsPanelClose, so the
    // grid can ask for it again with forceColumnsOpen.
    const [openPanel, setOpenPanel] = useState<ToolbarPanel | null>(forceColumnsOpen ? 'columns' : null);
    const aggOpen = openPanel === 'summaries';
    const pivotOpen = openPanel === 'pivot';
    const colsOpen = openPanel === 'columns';
    const filterOpen = openPanel === 'filters';

    const switchPanel = (next: ToolbarPanel | null) => {
        if (openPanel === 'columns' && next !== 'columns') onColumnsPanelClose?.();
        if (openPanel === 'filters' && next !== 'filters') onFiltersPanelClose?.();
        setOpenPanel(next);
    };
    const togglePanel = (panel: ToolbarPanel) => switchPanel(openPanel === panel ? null : panel);
    const closePanel = (panel: ToolbarPanel) => { if (openPanel === panel) switchPanel(null); };

    // forceColumnsOpen turning true opens the Columns panel. Adjusted during render (not in an
    // effect) so the panel opens in the same commit.
    const [seenForceColumnsOpen, setSeenForceColumnsOpen] = useState(forceColumnsOpen);
    if (seenForceColumnsOpen !== forceColumnsOpen) {
        setSeenForceColumnsOpen(forceColumnsOpen);
        if (forceColumnsOpen) setOpenPanel('columns');
    }
    // forceFiltersOpen turning true opens the filter panel, the same way.
    const [seenForceFiltersOpen, setSeenForceFiltersOpen] = useState(forceFiltersOpen);
    if (seenForceFiltersOpen !== forceFiltersOpen) {
        setSeenForceFiltersOpen(forceFiltersOpen);
        if (forceFiltersOpen && onFilterModelChange) setOpenPanel('filters');
    }

    // Tell the grid this toolbar shows the Columns panel for the column menu; it can only do so
    // when the grid's forceColumnsOpen reaches it and the Columns panel is enabled.
    const toolbarHost = useContext(GridToolbarHostContext);
    const hostsColumnsPanel = forceColumnsOpen !== undefined && Boolean(onColumnVisibilityModelChange);
    useEffect(() => {
        if (!toolbarHost || !hostsColumnsPanel) return undefined;
        return toolbarHost.registerColumnsPanel();
    }, [toolbarHost, hostsColumnsPanel]);
    const hostsFiltersPanel = forceFiltersOpen !== undefined && Boolean(onFilterModelChange);
    useEffect(() => {
        if (!toolbarHost || !hostsFiltersPanel) return undefined;
        return toolbarHost.registerFiltersPanel();
    }, [toolbarHost, hostsFiltersPanel]);

    const aggButtonRef = useRef<HTMLButtonElement>(null);
    const aiButtonRef = useRef<HTMLButtonElement>(null);
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
            && getOfferedAggregationFunctions(c).length > 0
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
        <div className={['ogx-toolbar', className].filter(Boolean).join(' ')} role="toolbar" aria-label={locale.toolbarLabel} style={style}>
            {/* Left slot — custom content */}
            {children && <div className="ogx-toolbar__left">{children}</div>}

            {/* Spacer */}
            <div className="ogx-toolbar__spacer" />

            {/* Right: built-in buttons */}
            <div className="ogx-toolbar__actions">
                {onAiAssistantToggle && (
                    <div className="ogx-toolbar__dropdown-wrapper" style={{ marginRight: 4 }}>
                        <button
                            type="button"
                            ref={aiButtonRef}
                            className={`ogx-toolbar__icon-btn ogx-toolbar__ai-btn${aiAssistantOpen ? ' ogx-toolbar__icon-btn--active' : ''}`}
                            aria-haspopup="dialog"
                            aria-expanded={aiAssistantOpen}
                            onClick={() => {
                                switchPanel(null);
                                onAiAssistantToggle(aiButtonRef.current);
                            }}
                        >
                            <AiSparkleIcon />
                            {aiAssistantLabel}
                        </button>
                    </div>
                )}
                {onFilterModelChange && (
                    <div className="ogx-toolbar__dropdown-wrapper" style={{ marginRight: 4 }}>
                        {renderQuickFilter
                            ? renderQuickFilter({ value: searchValue, onChange: handleSearchChange })
                            : (
                                <GlobalSearch
                                    value={searchValue}
                                    onChange={handleSearchChange}
                                    placeholder={locale.toolbarSearchPlaceholder}
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
                                <GridTooltip title={locale.toolbarColumns}>
                                    <button
                                        type="button"
                                        ref={colsButtonRef}
                                        className={`ogx-toolbar__icon-btn${colsOpen ? ' ogx-toolbar__icon-btn--active' : ''}`}
                                        aria-label={locale.toolbarColumnsLabel}
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
                                <GridTooltip title={locale.toolbarFilters}>
                                    <button
                                        type="button"
                                        ref={filterButtonRef}
                                        className={`ogx-toolbar__icon-btn${filterOpen ? ' ogx-toolbar__icon-btn--active' : ''}`}
                                        aria-label={locale.toolbarFiltersLabel}
                                        aria-haspopup="dialog"
                                        aria-expanded={filterOpen}
                                        onClick={() => togglePanel('filters')}
                                    >
                                        <FilterIcon />
                                        {activeFilterCount > 0 && (
                                            <span className="ogx-toolbar__dot" aria-label={locale.toolbarFiltersActive} />
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
                        <GridTooltip title={locale.toolbarPivot}>
                            <button
                                type="button"
                                ref={pivotButtonRef}
                                className={`ogx-toolbar__icon-btn${pivotOpen ? ' ogx-toolbar__icon-btn--active' : ''}`}
                                aria-label={locale.toolbarPivotLabel}
                                aria-haspopup="dialog"
                                aria-expanded={pivotOpen}
                                onClick={() => togglePanel('pivot')}
                            >
                                <PivotIcon />
                                {pivotActive && (
                                    <span className="ogx-toolbar__dot" aria-label={locale.toolbarPivotActive} />
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
                                <GridTooltip title={locale.toolbarSummaries}>
                                    <button
                                        type="button"
                                        ref={aggButtonRef}
                                        className={`ogx-toolbar__icon-btn${aggOpen ? ' ogx-toolbar__icon-btn--active' : ''}`}
                                        aria-label={locale.toolbarSummariesLabel}
                                        aria-haspopup="dialog"
                                        aria-expanded={aggOpen}
                                        onClick={() => togglePanel('summaries')}
                                    >
                                        <SigmaIcon />
                                        {activeCount > 0 && (
                                            <span className="ogx-toolbar__dot" aria-label={locale.toolbarSummariesActive(activeCount)} />
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
