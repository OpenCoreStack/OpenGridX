import ReactDOM from 'react-dom';
import type { GridColDef } from '../../types';
import { ColumnVisibilityPanel } from '../ColumnVisibilityPanel/ColumnVisibilityPanel';
import { useGridLocale } from '../DataGrid/gridLocaleContext';
import { useToolbarPanel } from './useToolbarPanel';

/** The toolbar's Columns panel: `ColumnVisibilityPanel` in a positioned, portalled popover. */
export function ColumnsPanelWrapper({
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
    const locale = useGridLocale();
    const { panelRef, position: pos, portalContainer } = useToolbarPanel(anchorRef, onClose);

    const panel = (
        <div
            ref={panelRef}
            className="ogx-toolbar__panel"
            role="dialog"
            aria-label={locale.toolbarColumnsPanelLabel}
            style={{ top: pos.top, right: pos.right, left: pos.left, width: 280, padding: 0 }}
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

    return portalContainer ? ReactDOM.createPortal(panel, portalContainer) : null;
}
