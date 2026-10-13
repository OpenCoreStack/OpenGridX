import ReactDOM from 'react-dom';
import type { GridColDef, GridFilterModel } from '../../types';
import { FilterPanel } from '../FilterPanel/FilterPanel';
import { useGridLocale } from '../DataGrid/gridLocaleContext';
import { FilterIcon } from './ToolbarIcons';
import { useToolbarPanel } from './useToolbarPanel';

/** The toolbar's Filters panel: `FilterPanel` with a count, Clear all and Close. */
export function FilterPanelWrapper({
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
    const locale = useGridLocale();
    // Escape closes it; a press outside does not: users type in its inputs, and it has a Close button.
    const { panelRef, position: pos, portalContainer } = useToolbarPanel(anchorRef, onClose, { closeOnOutsideClick: false });

    const activeFilterCount = filterModel.items?.length ?? 0;

    const handleClearAll = () => {
        onFilterModelChange({ ...filterModel, items: [], logicOperator: 'and' });
    };

    const panel = (
        <div
            ref={panelRef}
            className="ogx-toolbar__panel ogx-toolbar__panel--filter"
            role="dialog"
            aria-label={locale.toolbarFiltersLabel}
            style={{ top: pos.top, right: pos.right, left: pos.left, width: 540, maxWidth: 'calc(100vw - 24px)' }}
        >
            <div className="ogx-toolbar__panel-header">
                <span className="ogx-toolbar__panel-title">
                    <FilterIcon />
                    {locale.toolbarFilters}
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
                            title={locale.toolbarFiltersClearAllTooltip}
                        >
                            {locale.toolbarFiltersClearAll}
                        </button>
                    )}
                    <button
                        type="button"
                        className="ogx-toolbar__close-btn"
                        onClick={onClose}
                        title={locale.toolbarFiltersCloseTooltip}
                        aria-label={locale.toolbarFiltersCloseLabel}
                    >
                        {locale.toolbarFiltersClose}
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

    return portalContainer ? ReactDOM.createPortal(panel, portalContainer) : null;
}
