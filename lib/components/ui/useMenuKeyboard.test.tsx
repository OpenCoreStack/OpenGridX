import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRef, useState } from 'react';
import { useMenuKeyboard } from './useMenuKeyboard';

interface HarnessProps {
    onClose: () => void;
    isPositioned?: boolean;
}

function Harness({ onClose, isPositioned = true }: HarnessProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const restoreRef = useRef<HTMLButtonElement>(null);
    const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
    const { handleMenuKeyDown } = useMenuKeyboard({
        menuRef,
        isPositioned,
        onClose,
        getRestoreTarget: () => restoreRef.current,
        ignoreTarget: anchor,
    });
    return (
        <div>
            <button ref={restoreRef} type="button">restore</button>
            <button ref={setAnchor} type="button">anchor</button>
            <div ref={menuRef} role="menu" onKeyDown={handleMenuKeyDown}>
                <button role="menuitem">one</button>
                <button role="menuitem">two</button>
                <button role="menuitem">three</button>
            </div>
            <p>outside</p>
        </div>
    );
}

describe('useMenuKeyboard', () => {
    it('focuses the first item once positioned', () => {
        render(<Harness onClose={vi.fn()} />);
        expect(document.activeElement).toBe(screen.getByText('one'));
    });

    it('does not focus before it is positioned', () => {
        render(<Harness onClose={vi.fn()} isPositioned={false} />);
        expect(document.activeElement).not.toBe(screen.getByText('one'));
    });

    it('ArrowDown from the last item wraps to the first, ArrowUp from the first to the last', () => {
        render(<Harness onClose={vi.fn()} />);
        screen.getByText('three').focus();
        fireEvent.keyDown(screen.getByText('three'), { key: 'ArrowDown' });
        expect(document.activeElement).toBe(screen.getByText('one'));
        fireEvent.keyDown(screen.getByText('one'), { key: 'ArrowUp' });
        expect(document.activeElement).toBe(screen.getByText('three'));
    });

    it('Home and End jump to the ends', () => {
        render(<Harness onClose={vi.fn()} />);
        fireEvent.keyDown(screen.getByText('one'), { key: 'End' });
        expect(document.activeElement).toBe(screen.getByText('three'));
        fireEvent.keyDown(screen.getByText('three'), { key: 'Home' });
        expect(document.activeElement).toBe(screen.getByText('one'));
    });

    it('Escape closes and focuses the restore target', () => {
        const onClose = vi.fn();
        render(<Harness onClose={onClose} />);
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(document.activeElement).toBe(screen.getByText('restore'));
    });

    it('Tab closes with focus restore', () => {
        const onClose = vi.fn();
        render(<Harness onClose={onClose} />);
        fireEvent.keyDown(screen.getByText('one'), { key: 'Tab' });
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(document.activeElement).toBe(screen.getByText('restore'));
    });

    it('an outside mousedown closes, but not on the ignored target or inside the menu', () => {
        const onClose = vi.fn();
        render(<Harness onClose={onClose} />);
        fireEvent.mouseDown(screen.getByText('anchor'));
        fireEvent.mouseDown(screen.getByText('two'));
        expect(onClose).not.toHaveBeenCalled();
        fireEvent.mouseDown(screen.getByText('outside'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('scroll and resize close', () => {
        const onClose = vi.fn();
        render(<Harness onClose={onClose} />);
        fireEvent.scroll(window);
        fireEvent(window, new Event('resize'));
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('calls the latest onClose without re-registering', () => {
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = render(<Harness onClose={first} />);
        rerender(<Harness onClose={second} />);
        fireEvent.mouseDown(screen.getByText('outside'));
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });
});
