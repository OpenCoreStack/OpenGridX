import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import type { GridColDef, GridSortDirection, GridColumnPinning } from '../../types';


interface ColumnMenuProps {
    colDef: GridColDef<any>;
    sortModel?: Array<{ field: string; sort: 'asc' | 'desc' }>;
    onSort?: (field: string, direction: GridSortDirection) => void;
    onHide?: (field: string) => void;
    onPin?: (field: string, side: 'left' | 'right' | null) => void;
    pinnedColumns?: GridColumnPinning;
    onManageColumns?: () => void;
    onClose: () => void;
    anchorEl: HTMLElement | null;
}

function ActiveDotIcon() {
    return (
        <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
            <circle cx="4" cy="4" r="4" />
        </svg>
    );
}

function InactiveDotIcon() {
    return (
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="4" cy="4" r="3" />
        </svg>
    );
}

function ManageColumnsIcon() {
    return (
        <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" width="13" height="13" fill="none">
            <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <rect x="8.5" y="4" width="7" height="16" fill="currentColor" opacity="0.3" />
            <line x1="8.5" y1="4" x2="8.5" y2="20" stroke="currentColor" strokeWidth="1.8" />
            <line x1="15.5" y1="4" x2="15.5" y2="20" stroke="currentColor" strokeWidth="1.8" />
            <line x1="2" y1="9" x2="22" y2="9" stroke="currentColor" strokeWidth="1.2" />
            <line x1="2" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="1.2" />
        </svg>
    );
}

function AscIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
        </svg>
    );
}

function DescIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
        </svg>
    );
}

function UnsortIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

function HideIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

function PinLeftIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            { }
            <line x1="4" y1="2" x2="4" y2="22" />
            { }
            <polyline points="11 8 4 12 11 16" />
            { }
            <line x1="4" y1="12" x2="20" y2="12" />
        </svg>
    );
}

function PinRightIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            { }
            <line x1="20" y1="2" x2="20" y2="22" />
            { }
            <polyline points="13 8 20 12 13 16" />
            { }
            <line x1="20" y1="12" x2="4" y2="12" />
        </svg>
    );
}

function UnpinIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="2" y1="2" x2="22" y2="22" />
            <line x1="4" y1="4" x2="4" y2="20" />
            <line x1="4" y1="12" x2="20" y2="12" />
        </svg>
    );
}

export function ColumnMenu({ colDef, sortModel, onSort, onHide, onPin, pinnedColumns, onManageColumns, onClose, anchorEl }: ColumnMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({ position: 'fixed', zIndex: 1300, top: 0, left: 0, visibility: 'hidden' });

    React.useLayoutEffect(() => {
        if (!anchorEl || !menuRef.current) return;

        const anchorRect = anchorEl.getBoundingClientRect();
        const menuRect = menuRef.current.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const margin = 8;

        let left = anchorRect.left;
        if (left + menuRect.width + margin > vw) {
            left = vw - menuRect.width - margin;
        }
        if (left < margin) left = margin;

        let top = anchorRect.bottom + 4;
        if (top + menuRect.height + margin > vh) {
            top = anchorRect.top - menuRect.height - 4;
        }

        setStyle({ position: 'fixed', zIndex: 1300, top, left, visibility: 'visible' });
    }, [anchorEl]);


    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current && !menuRef.current.contains(event.target as Node) &&
                anchorEl && !anchorEl.contains(event.target as Node)
            ) onClose();
        }
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKey);
        };
    }, [anchorEl, onClose]);

    const handleSort = (direction: GridSortDirection) => { onSort?.(colDef.field, direction); onClose(); };
    const handleHide = () => { onHide?.(colDef.field); onClose(); };
    const handlePin = (side: 'left' | 'right' | null) => { onPin?.(colDef.field, side); onClose(); };

    const currentSort = sortModel?.find(item => item.field === colDef.field)?.sort;
    const isUnsorted = currentSort === undefined || currentSort === null;

    const isPinnedLeft = pinnedColumns?.left?.includes(colDef.field) ?? false;
    const isPinnedRight = pinnedColumns?.right?.includes(colDef.field) ?? false;
    const isUnpinned = !isPinnedLeft && !isPinnedRight;

    const colLabel = colDef.headerName || colDef.field;

    return ReactDOM.createPortal(
        <div ref={menuRef} className="ogx-column-menu" style={style} role="menu" aria-label={`Column options for ${colLabel}`}>

            { }
            {onSort && (
                <>
                    <button className={`ogx-menu-item${currentSort === 'asc' ? ' ogx-menu-item--active' : ''}`}
                        onClick={() => handleSort('asc')} role="menuitemradio" aria-checked={currentSort === 'asc'}>
                        <span className="ogx-menu-item__indicator" aria-hidden="true">{currentSort === 'asc' ? <ActiveDotIcon /> : <InactiveDotIcon />}</span>
                        <span className="ogx-menu-item__icon" aria-hidden="true"><AscIcon /></span>
                        Sort Ascending
                    </button>
                    <button className={`ogx-menu-item${currentSort === 'desc' ? ' ogx-menu-item--active' : ''}`}
                        onClick={() => handleSort('desc')} role="menuitemradio" aria-checked={currentSort === 'desc'}>
                        <span className="ogx-menu-item__indicator" aria-hidden="true">{currentSort === 'desc' ? <ActiveDotIcon /> : <InactiveDotIcon />}</span>
                        <span className="ogx-menu-item__icon" aria-hidden="true"><DescIcon /></span>
                        Sort Descending
                    </button>
                    <button className={`ogx-menu-item${isUnsorted ? ' ogx-menu-item--active' : ''}`}
                        onClick={() => handleSort(null)} role="menuitemradio" aria-checked={isUnsorted}>
                        <span className="ogx-menu-item__indicator" aria-hidden="true">{isUnsorted ? <ActiveDotIcon /> : <InactiveDotIcon />}</span>
                        <span className="ogx-menu-item__icon" aria-hidden="true"><UnsortIcon /></span>
                        Unsort
                    </button>
                    <div className="ogx-menu-divider" />
                </>
            )}

            { }
            <div className="ogx-menu-section-label" aria-hidden="true">Pin column</div>
            <button className={`ogx-menu-item${isPinnedLeft ? ' ogx-menu-item--active' : ''}`}
                onClick={() => handlePin('left')} role="menuitemradio" aria-checked={isPinnedLeft} aria-label="Pin to left">
                <span className="ogx-menu-item__indicator" aria-hidden="true">{isPinnedLeft ? <ActiveDotIcon /> : <InactiveDotIcon />}</span>
                <span className="ogx-menu-item__icon" aria-hidden="true"><PinLeftIcon /></span>
                Pin to Left
            </button>
            <button className={`ogx-menu-item${isPinnedRight ? ' ogx-menu-item--active' : ''}`}
                onClick={() => handlePin('right')} role="menuitemradio" aria-checked={isPinnedRight} aria-label="Pin to right">
                <span className="ogx-menu-item__indicator" aria-hidden="true">{isPinnedRight ? <ActiveDotIcon /> : <InactiveDotIcon />}</span>
                <span className="ogx-menu-item__icon" aria-hidden="true"><PinRightIcon /></span>
                Pin to Right
            </button>
            <button className={`ogx-menu-item${isUnpinned ? ' ogx-menu-item--active' : ''}`}
                onClick={() => handlePin(null)} role="menuitemradio" aria-checked={isUnpinned} aria-label="Unpin column">
                <span className="ogx-menu-item__indicator" aria-hidden="true">{isUnpinned ? <ActiveDotIcon /> : <InactiveDotIcon />}</span>
                <span className="ogx-menu-item__icon" aria-hidden="true"><UnpinIcon /></span>
                Unpin
            </button>
            <div className="ogx-menu-divider" />

            { }
            <button className="ogx-menu-item" onClick={handleHide} role="menuitem" aria-label={`Hide ${colLabel} column`}>
                <span className="ogx-menu-item__indicator" aria-hidden="true" />
                <span className="ogx-menu-item__icon" aria-hidden="true"><HideIcon /></span>
                Hide Column
            </button>

            <div className="ogx-menu-divider" />
            <button className="ogx-menu-item" onClick={() => { onManageColumns?.(); onClose(); }} role="menuitem" aria-label="Manage all columns">
                <span className="ogx-menu-item__indicator" aria-hidden="true" />
                <span className="ogx-menu-item__icon" aria-hidden="true"><ManageColumnsIcon /></span>
                Manage columns
            </button>
        </div>,
        document.body
    );
}
