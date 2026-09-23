import React, { useState, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { ColumnVisibilityPanel } from '../ColumnVisibilityPanel/ColumnVisibilityPanel';
import type { GridColDef, GridRowModel, GridColumnGroupingModel } from '../../types';
import { canReorderWithinColumnGroups } from '../../utils/columnGroups';
import { getViewportWidth } from '../../utils/viewport';

export interface GridStandaloneColumnPanelProps<R extends GridRowModel> {
    isOpen: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
    panelRef?: React.RefObject<HTMLDivElement | null>;
    /** Every column, in the grid's current column order. */
    columns: GridColDef<R>[];
    columnVisibilityModel: Record<string, boolean>;
    disableColumnReorder: boolean;
    onClose: () => void;
    onColumnVisibilityChange: (model: Record<string, boolean>) => void;
    /** Moves `fromField` to the position of `toField` in the column order. */
    onColumnMove: (fromField: string, toField: string) => void;
    /** Restores the columns' definition order (the panel's Reset). */
    onColumnOrderReset: () => void;
    /** When set, a column can only be moved within its own column group. */
    columnGroupingModel?: GridColumnGroupingModel;
}

interface PanelPlacement {
    top: number;
    right: number;
    target: Element;
}

export function GridStandaloneColumnPanel<R extends GridRowModel>({
    isOpen,
    containerRef,
    panelRef,
    columns,
    columnVisibilityModel,
    disableColumnReorder,
    onClose,
    onColumnVisibilityChange,
    onColumnMove,
    onColumnOrderReset,
    columnGroupingModel,
}: GridStandaloneColumnPanelProps<R>) {
    // Resolved from the DOM after mount, never during render, so the grid renders on the server.
    const [placement, setPlacement] = useState<PanelPlacement | null>(null);

    useLayoutEffect(() => {
        if (!isOpen || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setPlacement({
            top: rect.top + 8,
            right: getViewportWidth() - rect.right + 8,
            target: containerRef.current.closest('.ogx-theme-provider') || document.body,
        });
    }, [isOpen, containerRef]);

    if (!isOpen || !placement) return null;

    const handleReorder = disableColumnReorder
        ? undefined
        : (fromField: string, toField: string) => {
            if (!canReorderWithinColumnGroups(columnGroupingModel, fromField, toField)) return;
            onColumnMove(fromField, toField);
        };

    return ReactDOM.createPortal(
        <div
            ref={panelRef}
            style={{
                position: 'fixed',
                top: placement.top,
                right: placement.right,
                zIndex: 9999,
                display: 'inline-block',
            }}
        >
            <button
                type="button"
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: -12,
                    right: -12,
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#334155',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: 14,
                    lineHeight: 1,
                    zIndex: 1,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }}
                aria-label="Close"
            >×</button>
            <ColumnVisibilityPanel<R>
                columns={columns}
                visibleColumns={new Set(
                    columns
                        .filter(col => columnVisibilityModel[col.field] !== false)
                        .map(col => col.field)
                )}
                onVisibilityChange={(field, isVisible) => {
                    onColumnVisibilityChange({ ...columnVisibilityModel, [field]: isVisible });
                }}
                onShowAll={() => {
                    const next = { ...columnVisibilityModel };
                    columns.forEach(col => { if (col.hideable !== false) next[col.field] = true; });
                    onColumnVisibilityChange(next);
                }}
                onHideAll={() => {
                    const next = { ...columnVisibilityModel };
                    columns.forEach(col => { if (col.hideable !== false) next[col.field] = false; });
                    onColumnVisibilityChange(next);
                }}
                onColumnReorder={handleReorder}
                onColumnOrderReset={disableColumnReorder ? undefined : onColumnOrderReset}
            />
        </div>,
        placement.target
    );
}
