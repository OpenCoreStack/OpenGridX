import ReactDOM from 'react-dom';
import type { GridAggregationModel, GridColDef } from '../../types';
import { getOfferedAggregationFunctions } from '../../utils/aggregation';
import { useGridLocale } from '../DataGrid/gridLocaleContext';
import { SigmaIcon } from './ToolbarIcons';
import { useToolbarPanel } from './useToolbarPanel';

/** The toolbar's Summaries panel: one row of function pills per aggregable column. */
export function AggregationPanel({
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
    const locale = useGridLocale();
    const { panelRef, position: pos, portalContainer } = useToolbarPanel(anchorRef, onClose);

    const panel = (
        <div
            ref={panelRef}
            className="ogx-toolbar__panel"
            role="dialog"
            aria-label={locale.toolbarSummariesPanelLabel}
            style={{ top: pos.top, right: pos.right, left: pos.left, width: 400, maxWidth: 'calc(100vw - 24px)' }}
        >
            <div className="ogx-toolbar__panel-header">
                <span className="ogx-toolbar__panel-title">
                    <SigmaIcon />
                    {locale.toolbarSummaries}
                </span>
                {activeCount > 0 && (
                    <button
                        type="button"
                        className="ogx-toolbar__clear-btn"
                        onClick={onClearAll}
                        title={locale.toolbarSummariesClearAllTooltip}
                    >
                        {locale.toolbarSummariesClearAll}
                    </button>
                )}
            </div>

            <div className="ogx-toolbar__panel-body">
                {aggregableColumns.length === 0 ? (
                    <p className="ogx-toolbar__empty">
                        {locale.toolbarSummariesEmpty}<br />
                        {`${locale.toolbarSummariesEmptyHintBefore} `}<code>aggregable: true</code>{` ${locale.toolbarSummariesEmptyHintAfter}`}
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
                                    {['none', ...getOfferedAggregationFunctions(col)].map((fn) => (
                                        <button
                                            type="button"
                                            key={fn}
                                            className={`ogx-toolbar__pill${currentFn === fn ? ' ogx-toolbar__pill--active' : ''}`}
                                            onClick={() => onFunctionChange(col.field, fn)}
                                            aria-pressed={currentFn === fn}
                                        >
                                            {locale.toolbarAggregationFunction(fn)}
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

    return portalContainer ? ReactDOM.createPortal(panel, portalContainer) : null;
}
