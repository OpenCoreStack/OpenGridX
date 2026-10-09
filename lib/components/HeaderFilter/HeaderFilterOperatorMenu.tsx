import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import type { GridFilterOperator } from '../../types';
import { HEADER_FILTER_OPERATOR_LABELS } from '../../utils/headerFilters';
import { getViewportHeight, getViewportWidth } from '../../utils/viewport';

export interface HeaderFilterOperatorMenuProps {
    anchorEl: HTMLElement;
    /** Column header name, for the menu's label. */
    columnLabel: string;
    operators: GridFilterOperator[];
    current: GridFilterOperator;
    onSelect: (operator: GridFilterOperator) => void;
    /** `restoreFocus`: the menu was left from the keyboard or by choosing an item. */
    onClose: (restoreFocus: boolean) => void;
}

const HIDDEN_STYLE: React.CSSProperties = { position: 'fixed', zIndex: 1300, top: 0, left: 0, visibility: 'hidden' };

const itemsOf = (menu: HTMLElement | null): HTMLElement[] =>
    menu ? Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitemradio"]')) : [];

/** The operator menu of a header filter cell: a menu of radio items, portalled out of the header. */
export function HeaderFilterOperatorMenu({ anchorEl, columnLabel, operators, current, onSelect, onClose }: HeaderFilterOperatorMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>(HIDDEN_STYLE);

    useLayoutEffect(() => {
        const menu = menuRef.current;
        if (!menu) return;
        const anchor = anchorEl.getBoundingClientRect();
        const box = menu.getBoundingClientRect();
        const margin = 8;
        let left = Math.min(anchor.left, getViewportWidth() - box.width - margin);
        if (left < margin) left = margin;
        let top = anchor.bottom + 4;
        if (top + box.height + margin > getViewportHeight()) top = anchor.top - box.height - 4;
        setStyle({ position: 'fixed', zIndex: 1300, top, left, visibility: 'visible' });
    }, [anchorEl]);

    // Focus the checked item once the menu is positioned (a hidden element cannot take focus).
    const isPositioned = style.visibility === 'visible';
    useLayoutEffect(() => {
        if (!isPositioned) return;
        const items = itemsOf(menuRef.current);
        (items.find(item => item.getAttribute('aria-checked') === 'true') ?? items[0])?.focus({ preventScroll: true });
    }, [isPositioned]);

    const onCloseRef = useRef(onClose);
    useLayoutEffect(() => { onCloseRef.current = onClose; });

    useEffect(() => {
        const doc = anchorEl.ownerDocument;
        const view = doc.defaultView;
        function handleMouseDown(event: MouseEvent) {
            const target = event.target as Node;
            if (menuRef.current?.contains(target) || anchorEl.contains(target)) return;
            onCloseRef.current(false);
        }
        // The menu floats at a fixed position: it closes rather than drift away from its cell.
        function handleScroll(event: Event) {
            if (menuRef.current?.contains(event.target as Node)) return;
            onCloseRef.current(false);
        }
        function handleResize() { onCloseRef.current(false); }
        doc.addEventListener('mousedown', handleMouseDown);
        view?.addEventListener('scroll', handleScroll, true);
        view?.addEventListener('resize', handleResize);
        return () => {
            doc.removeEventListener('mousedown', handleMouseDown);
            view?.removeEventListener('scroll', handleScroll, true);
            view?.removeEventListener('resize', handleResize);
        };
    }, [anchorEl]);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        // The menu is portalled: keys must not reach the cell or the grid through the React tree.
        event.stopPropagation();
        const items = itemsOf(menuRef.current);
        const index = items.indexOf(event.target as HTMLElement);
        let next = -1;
        switch (event.key) {
            case 'ArrowDown': next = index + 1 >= items.length ? 0 : index + 1; break;
            case 'ArrowUp': next = index <= 0 ? items.length - 1 : index - 1; break;
            case 'Home': next = 0; break;
            case 'End': next = items.length - 1; break;
            case 'Escape':
            case 'Tab':
                event.preventDefault();
                onClose(true);
                return;
            default:
                return;
        }
        event.preventDefault();
        items[next]?.focus();
    };

    return ReactDOM.createPortal(
        <div
            ref={menuRef}
            className="ogx-column-menu ogx__header-filter-menu"
            style={style}
            role="menu"
            aria-label={`Filter operator for ${columnLabel}`}
            onKeyDown={handleKeyDown}
        >
            {operators.map(op => (
                <button
                    key={op}
                    type="button"
                    role="menuitemradio"
                    aria-checked={op === current}
                    tabIndex={-1}
                    className={`ogx-menu-item${op === current ? ' ogx-menu-item--active' : ''}`}
                    onClick={() => onSelect(op)}
                >
                    {HEADER_FILTER_OPERATOR_LABELS[op] ?? op}
                </button>
            ))}
        </div>,
        anchorEl.closest('.ogx-theme-provider') ?? anchorEl.ownerDocument.body
    );
}
