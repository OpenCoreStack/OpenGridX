import React, { useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import type { GridContextMenuEntry, GridContextMenuItem } from '../../types';
import { getViewportWidth, getViewportHeight } from '../../utils/viewport';
import { getPointMenuPosition, isRtl } from '../../utils/direction';
import { attempt } from '../../utils/attempt';
import { warnCallbackFailure } from '../../utils/values';
import { useMenuKeyboard } from '../ui/useMenuKeyboard';
import { cleanContextMenuEntries } from './menuEntries';

export interface GridContextMenuProps {
    entries: readonly GridContextMenuEntry[];
    /** Viewport coordinates the menu opens at. */
    x: number;
    y: number;
    /** The cell the menu was opened on: focus returns to it and its theme provider hosts the menu. */
    anchorCell: HTMLElement | null;
    onClose: () => void;
    /** Accessible name of the menu. */
    label: string;
}

const HIDDEN_STYLE: React.CSSProperties = { position: 'fixed', zIndex: 1300, top: 0, left: 0, visibility: 'hidden' };

/** A menu rendered at a point (the grid's context menu). Presentational: the grid decides when it opens. */
export function GridContextMenu({ entries, x, y, anchorCell, onClose, label }: GridContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>(HIDDEN_STYLE);
    const cleaned = useMemo(() => cleanContextMenuEntries(entries), [entries]);

    React.useLayoutEffect(() => {
        const menu = menuRef.current;
        if (!menu) return;
        const rect = menu.getBoundingClientRect();
        const { top, left } = getPointMenuPosition(
            x, y,
            { width: rect.width, height: rect.height },
            { width: getViewportWidth(), height: getViewportHeight() },
            isRtl(anchorCell),
        );
        setStyle({ position: 'fixed', zIndex: 1300, top, left, visibility: 'visible' });
    }, [x, y, anchorCell]);

    const { close, handleMenuKeyDown } = useMenuKeyboard({
        menuRef,
        isPositioned: style.visibility === 'visible',
        onClose,
        getRestoreTarget: () => anchorCell,
    });

    const handleItemClick = (item: GridContextMenuItem) => {
        if (item.disabled) return;
        close(true);
        const result = attempt(() => item.onClick?.());
        if (!result.ok) {
            warnCallbackFailure(`contextMenu:${item.id}`, `context menu item "${item.id}" onClick threw`, result.error);
        }
    };

    return ReactDOM.createPortal(
        <div ref={menuRef} className="ogx-column-menu ogx-context-menu" style={style} role="menu" aria-label={label} onKeyDown={handleMenuKeyDown}>
            {cleaned.map((entry, index) => {
                if (entry === 'divider') {
                    return <div key={`divider-${index}`} className="ogx-menu-divider" role="separator" />;
                }
                const className = [
                    'ogx-menu-item',
                    'ogx-context-menu__item',
                    entry.danger ? 'ogx-context-menu__item--danger' : '',
                    entry.disabled ? 'ogx-context-menu__item--disabled' : '',
                ].filter(Boolean).join(' ');
                return (
                    <button
                        key={entry.id}
                        type="button"
                        role="menuitem"
                        className={className}
                        aria-disabled={entry.disabled ? true : undefined}
                        onClick={() => handleItemClick(entry)}
                    >
                        <span className="ogx-menu-item__icon" aria-hidden="true">{entry.icon}</span>
                        <span className="ogx-context-menu__label">{entry.label}</span>
                        {entry.shortcut ? <span className="ogx-context-menu__shortcut">{entry.shortcut}</span> : null}
                    </button>
                );
            })}
        </div>,
        (anchorCell?.closest('.ogx-theme-provider') || document.body),
    );
}
