import React, { useState, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { ColumnVisibilityPanel } from '../ColumnVisibilityPanel/ColumnVisibilityPanel';
import type { GridColDef, GridRowModel, GridColumnOrderChangeParams } from '../../types';

export interface GridStandaloneColumnPanelProps<R extends GridRowModel> {
    isOpen: boolean;
    containerRef: React.RefObject<HTMLDivElement | null>;
    panelRef?: React.RefObject<HTMLDivElement | null>;
    effectiveColumns: GridColDef<R>[];
    columnVisibilityModel: Record<string, boolean>;
    effectiveColumnOrder: string[];
    columnOrder?: string[];
    disableColumnReorder: boolean;
    onClose: () => void;
    onColumnVisibilityChange: (model: Record<string, boolean>) => void;
    onColumnOrderChange?: (params: GridColumnOrderChangeParams) => void;
    setInternalColumnOrder: React.Dispatch<React.SetStateAction<string[]>>;
}

export function GridStandaloneColumnPanel<R extends GridRowModel>({
    isOpen,
    containerRef,
    panelRef,
    effectiveColumns,
    columnVisibilityModel,
    effectiveColumnOrder,
    columnOrder,
    disableColumnReorder,
    onClose,
    onColumnVisibilityChange,
    onColumnOrderChange,
    setInternalColumnOrder,
}: GridStandaloneColumnPanelProps<R>) {
    const [panelTop, setPanelTop] = useState<number>(16);
    const [panelRight, setPanelRight] = useState<number>(16);
    const [portalTarget, setPortalTarget] = useState<Element>(() => document.body);

    useLayoutEffect(() => {
        if (!isOpen || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setPanelTop(rect.top + 8);
        setPanelRight(window.innerWidth - rect.right + 8);
        setPortalTarget(containerRef.current.closest('.ogx-theme-provider') || document.body);
    }, [isOpen, containerRef]);

    if (!isOpen) return null;

    const handleReorder = disableColumnReorder
        ? undefined
        : (fromField: string, toField: string) => {
            const currentOrder = [...effectiveColumnOrder];
            const fromIdx = currentOrder.indexOf(fromField);
            const toIdx = currentOrder.indexOf(toField);
            if (fromIdx === -1 || toIdx === -1) return;
            const newOrder = [...currentOrder];
            newOrder.splice(fromIdx, 1);
            newOrder.splice(toIdx, 0, fromField);
            if (!columnOrder) setInternalColumnOrder(newOrder);
            onColumnOrderChange?.({
                oldIndex: fromIdx,
                targetIndex: toIdx,
                column: effectiveColumns.find(c => c.field === fromField) as unknown as GridColDef,
            });
        };

    return ReactDOM.createPortal(
        <div
            ref={panelRef}
            style={{
                position: 'fixed',
                top: panelTop,
                right: panelRight,
                zIndex: 9999,
                display: 'inline-block',
            }}
        >
            <button
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
                columns={effectiveColumns}
                visibleColumns={new Set(
                    effectiveColumns
                        .filter(col => columnVisibilityModel[col.field] !== false)
                        .map(col => col.field)
                )}
                onVisibilityChange={(field, isVisible) => {
                    onColumnVisibilityChange({ ...columnVisibilityModel, [field]: isVisible });
                }}
                onShowAll={() => {
                    const next = { ...columnVisibilityModel };
                    effectiveColumns.forEach(col => { if (col.hideable !== false) next[col.field] = true; });
                    onColumnVisibilityChange(next);
                }}
                onHideAll={() => {
                    const next = { ...columnVisibilityModel };
                    effectiveColumns.forEach(col => { if (col.hideable !== false) next[col.field] = false; });
                    onColumnVisibilityChange(next);
                }}
                onColumnReorder={handleReorder}
            />
        </div>,
        portalTarget
    );
}
