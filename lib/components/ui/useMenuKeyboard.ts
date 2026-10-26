import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

export interface UseMenuKeyboardOptions {
    /** The menu's root element; its `menuitem` / `menuitemradio` descendants are the navigable items. */
    menuRef: React.RefObject<HTMLElement | null>;
    /** True once the menu is placed and visible: the first item takes focus then (a hidden element cannot). */
    isPositioned: boolean;
    onClose: () => void;
    /** The element that gets focus when the menu closes from the keyboard or by choosing an item. */
    getRestoreTarget: () => HTMLElement | null;
    /** A press on this element does not count as "outside" (the control that opened the menu). */
    ignoreTarget?: HTMLElement | null;
}

export interface UseMenuKeyboardResult {
    /** Closes the menu; with `restoreFocus`, focus first goes to the restore target. */
    close: (restoreFocus: boolean) => void;
    handleMenuKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

const menuItemsOf = (menu: HTMLElement | null): HTMLElement[] =>
    menu ? Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"], [role="menuitemradio"]')) : [];

/**
 * Keyboard and dismissal behaviour shared by the grid's menus (WAI-ARIA menu pattern): focus the
 * first item once positioned, ArrowUp/Down (wrapping) / Home / End, Tab and Escape close with focus
 * restore, a press outside closes, scroll and resize close. `onClose` and `getRestoreTarget` are
 * read through refs, so listeners are registered once and never miss or double a close.
 */
export function useMenuKeyboard({ menuRef, isPositioned, onClose, getRestoreTarget, ignoreTarget }: UseMenuKeyboardOptions): UseMenuKeyboardResult {
    const onCloseRef = useRef(onClose);
    const getRestoreTargetRef = useRef(getRestoreTarget);
    useLayoutEffect(() => {
        onCloseRef.current = onClose;
        getRestoreTargetRef.current = getRestoreTarget;
    });

    const close = useCallback((restoreFocus: boolean) => {
        if (restoreFocus) getRestoreTargetRef.current()?.focus({ preventScroll: true });
        onCloseRef.current();
    }, []);

    const handleMenuKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        const items = menuItemsOf(menuRef.current);
        const current = items.indexOf(event.target as HTMLElement);
        let next = -1;
        if (event.key === 'ArrowDown') next = current + 1 >= items.length ? 0 : current + 1;
        else if (event.key === 'ArrowUp') next = current <= 0 ? items.length - 1 : current - 1;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = items.length - 1;
        else if (event.key === 'Tab') {
            event.preventDefault();
            close(true);
            return;
        } else {
            return;
        }
        event.preventDefault();
        items[next]?.focus();
    }, [menuRef, close]);

    useLayoutEffect(() => {
        if (isPositioned) menuItemsOf(menuRef.current)[0]?.focus({ preventScroll: true });
    }, [isPositioned, menuRef]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (menuRef.current && !menuRef.current.contains(target) && !ignoreTarget?.contains(target)) onCloseRef.current();
        }
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') close(true);
        }
        // Closing on any scroll or resize keeps the menu from floating detached from where it opened
        function handleDismiss() {
            onCloseRef.current();
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKey);
        window.addEventListener('scroll', handleDismiss, true);
        window.addEventListener('resize', handleDismiss);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKey);
            window.removeEventListener('scroll', handleDismiss, true);
            window.removeEventListener('resize', handleDismiss);
        };
    }, [menuRef, ignoreTarget, close]);

    return { close, handleMenuKeyDown };
}
