import { describe, it, expect } from 'vitest';
import { getPanelPosition, getPointMenuPosition, getScrollStart, isRtl, logicalArrowKey, setScrollStart } from './direction';

describe('direction utils', () => {
    it('swaps ArrowLeft and ArrowRight only for right-to-left', () => {
        expect(logicalArrowKey('ArrowLeft', true)).toBe('ArrowRight');
        expect(logicalArrowKey('ArrowRight', true)).toBe('ArrowLeft');
        expect(logicalArrowKey('ArrowUp', true)).toBe('ArrowUp');
        expect(logicalArrowKey('ArrowLeft', false)).toBe('ArrowLeft');
    });

    it('reads direction from the computed style', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);
        expect(isRtl(el)).toBe(false);
        el.style.direction = 'rtl';
        expect(isRtl(el)).toBe(true);
        expect(isRtl(null)).toBe(false);
        el.remove();
    });

    it('counts the scroll offset from the inline start', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);
        el.scrollLeft = 0;
        setScrollStart(el, 0);
        expect(getScrollStart(el)).toBe(0);
        el.style.direction = 'rtl';
        // jsdom stores scrollLeft as set: a right-to-left offset of 0 stays 0.
        setScrollStart(el, 0);
        expect(el.scrollLeft === 0 || Object.is(el.scrollLeft, -0)).toBe(true);
        el.remove();
    });

    it('anchors a panel to the right edge of its button, or the left edge right to left', () => {
        expect(getPanelPosition(null, 1000)).toEqual({ top: 0, right: 0 });
        const button = document.createElement('button');
        document.body.appendChild(button);
        button.getBoundingClientRect = () => ({ left: 100, right: 140, top: 10, bottom: 40, width: 40, height: 30, x: 100, y: 10, toJSON: () => ({}) });
        expect(getPanelPosition(button, 1000)).toEqual({ top: 46, right: 860 });
        button.style.direction = 'rtl';
        expect(getPanelPosition(button, 1000)).toEqual({ top: 46, left: 100 });
        button.remove();
    });

    it('places a point menu at the pointer, flipping towards the end when it would overflow', () => {
        const menu = { width: 200, height: 300 };
        const viewport = { width: 1000, height: 800 };
        expect(getPointMenuPosition(100, 100, menu, viewport, false)).toEqual({ left: 100, top: 100 });
        expect(getPointMenuPosition(900, 100, menu, viewport, false)).toEqual({ left: 700, top: 100 });
        expect(getPointMenuPosition(100, 700, menu, viewport, false)).toEqual({ left: 100, top: 400 });
    });

    it('opens a right-to-left point menu towards the inline start, keeping it on screen', () => {
        const menu = { width: 200, height: 300 };
        const viewport = { width: 1000, height: 800 };
        expect(getPointMenuPosition(500, 100, menu, viewport, true)).toEqual({ left: 300, top: 100 });
        expect(getPointMenuPosition(100, 100, menu, viewport, true)).toEqual({ left: 100, top: 100 });
    });

    it('uses the 8 px margin when a point menu is taller than the viewport', () => {
        const position = getPointMenuPosition(100, 100, { width: 200, height: 900 }, { width: 1000, height: 800 }, false);
        expect(position.top).toBe(8);
    });
});
