import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ColumnResizeHandle } from './ColumnResizeHandle';
import type { ColumnResizeHandleProps } from './ColumnResizeHandle';

function setup(props: Partial<ColumnResizeHandleProps> = {}) {
    const onResize = vi.fn<(field: string, width: number) => void>();
    const utils = render(<ColumnResizeHandle field="f" currentWidth={200} onResize={onResize} {...props} />);
    const handle = utils.container.querySelector('.ogx-column-resize-handle') as HTMLElement;
    return { ...utils, onResize, handle };
}

const pointer = (clientX: number) => ({ clientX, pointerId: 1, button: 0 });

describe('ColumnResizeHandle', () => {
    it('a click without movement does not resize', () => {
        const { handle, onResize } = setup({ currentWidth: 1200 });
        fireEvent.pointerDown(handle, pointer(100));
        fireEvent.pointerUp(handle, pointer(100));
        expect(onResize).not.toHaveBeenCalled();
    });

    it('has no upper limit without maxWidth', () => {
        const { handle, onResize } = setup({ currentWidth: 1200 });
        fireEvent.pointerDown(handle, pointer(100));
        fireEvent.pointerMove(handle, pointer(150));
        fireEvent.pointerUp(handle, pointer(150));
        expect(onResize).toHaveBeenLastCalledWith('f', 1250);
    });

    it('stops at maxWidth and minWidth when given', () => {
        const { handle, onResize } = setup({ currentWidth: 200, minWidth: 120, maxWidth: 260 });
        fireEvent.pointerDown(handle, pointer(100));
        fireEvent.pointerUp(handle, pointer(400));
        expect(onResize).toHaveBeenLastCalledWith('f', 260);
        fireEvent.pointerDown(handle, pointer(100));
        fireEvent.pointerUp(handle, pointer(-400));
        expect(onResize).toHaveBeenLastCalledWith('f', 120);
    });

    it('never snaps a column narrower than 50px up to 50', () => {
        const { handle, onResize } = setup({ currentWidth: 30 });
        fireEvent.pointerDown(handle, pointer(100));
        fireEvent.pointerUp(handle, pointer(90));
        expect(onResize).toHaveBeenLastCalledWith('f', 30);
        fireEvent.pointerDown(handle, pointer(100));
        fireEvent.pointerUp(handle, pointer(110));
        expect(onResize).toHaveBeenLastCalledWith('f', 40);
    });

    it('shrinks to 50px by default', () => {
        const { handle, onResize } = setup({ currentWidth: 200 });
        fireEvent.pointerDown(handle, pointer(300));
        fireEvent.pointerUp(handle, pointer(0));
        expect(onResize).toHaveBeenLastCalledWith('f', 50);
    });

    it('on the start edge (right-pinned column), dragging left widens the column', () => {
        const { handle, onResize } = setup({ currentWidth: 200, edge: 'start' });
        expect(handle.classList.contains('ogx-column-resize-handle--start')).toBe(true);
        fireEvent.pointerDown(handle, pointer(500));
        fireEvent.pointerUp(handle, pointer(440));
        expect(onResize).toHaveBeenLastCalledWith('f', 260);
    });

    it('reports nothing once unmounted mid-drag, and leaves no document listeners', () => {
        const addSpy = vi.spyOn(document, 'addEventListener');
        const { handle, onResize, unmount } = setup();
        fireEvent.pointerDown(handle, pointer(100));
        unmount();
        fireEvent.pointerMove(document, pointer(160));
        fireEvent.pointerUp(document, pointer(160));
        fireEvent.mouseMove(document, { clientX: 170 });
        fireEvent.mouseUp(document, { clientX: 170 });
        expect(onResize).not.toHaveBeenCalled();
        expect(addSpy.mock.calls.map(c => c[0])).not.toContain('mousemove');
        addSpy.mockRestore();
    });

    it('a cancelled pointer (touch turned into a scroll) does not commit', () => {
        const { handle, onResize } = setup();
        fireEvent.pointerDown(handle, pointer(100));
        fireEvent.pointerCancel(handle, pointer(100));
        fireEvent.pointerUp(handle, pointer(150));
        expect(onResize).not.toHaveBeenCalled();
    });

    it('is a focusable separator that reports and changes the width with the arrow keys', () => {
        const { handle, onResize } = setup({ currentWidth: 200, maxWidth: 400 });
        expect(handle.getAttribute('role')).toBe('separator');
        expect(handle.getAttribute('tabindex')).toBe('-1');
        expect(handle.getAttribute('aria-valuenow')).toBe('200');
        expect(handle.getAttribute('aria-valuemax')).toBe('400');
        fireEvent.keyDown(handle, { key: 'ArrowRight' });
        expect(onResize).toHaveBeenLastCalledWith('f', 210);
        fireEvent.keyDown(handle, { key: 'ArrowLeft', shiftKey: true });
        expect(onResize).toHaveBeenLastCalledWith('f', 150);
    });
});
