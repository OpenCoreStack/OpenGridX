import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { GridTooltip } from './Tooltip';

const tooltips = () => Array.from(document.querySelectorAll<HTMLElement>('.ogx-tooltip'));
const RECT = DOMRect.fromRect({ x: 200, y: 100, width: 60, height: 30 });

function renderTooltip(ui: React.ReactElement) {
    const result = render(ui);
    const button = screen.getByRole('button');
    button.getBoundingClientRect = () => RECT;
    return { ...result, button };
}

describe('GridTooltip', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('shows on hover after the enter delay', () => {
        const { button } = renderTooltip(<GridTooltip title="Export"><button>btn</button></GridTooltip>);
        fireEvent.mouseEnter(button);
        expect(tooltips()).toHaveLength(0);
        act(() => { vi.advanceTimersByTime(200); });
        expect(tooltips().map(t => t.textContent)).toEqual(['Export']);
        fireEvent.mouseLeave(button);
        act(() => { vi.advanceTimersByTime(0); });
        expect(tooltips()).toHaveLength(0);
    });

    it('shows when the child receives keyboard focus and hides on blur', () => {
        const { button } = renderTooltip(<GridTooltip title="Export"><button>btn</button></GridTooltip>);
        act(() => { button.focus(); });
        act(() => { vi.advanceTimersByTime(200); });
        expect(tooltips().map(t => t.textContent)).toEqual(['Export']);
        act(() => { button.blur(); });
        act(() => { vi.advanceTimersByTime(0); });
        expect(tooltips()).toHaveLength(0);
    });

    it('is exposed as role="tooltip" and describes the child while open', () => {
        const { button } = renderTooltip(
            <GridTooltip title="Export"><button aria-describedby="hint">btn</button></GridTooltip>
        );
        expect(button.getAttribute('aria-describedby')).toBe('hint');
        fireEvent.mouseEnter(button);
        act(() => { vi.advanceTimersByTime(200); });
        const tip = screen.getByRole('tooltip');
        expect(tip.id).toBeTruthy();
        expect(button.getAttribute('aria-describedby')).toBe(`hint ${tip.id}`);
        fireEvent.mouseLeave(button);
        act(() => { vi.advanceTimersByTime(0); });
        expect(button.getAttribute('aria-describedby')).toBe('hint');
    });

    it('closes on Escape', () => {
        const { button } = renderTooltip(<GridTooltip title="Export"><button>btn</button></GridTooltip>);
        fireEvent.mouseEnter(button);
        act(() => { vi.advanceTimersByTime(200); });
        expect(tooltips()).toHaveLength(1);
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(tooltips()).toHaveLength(0);
    });

    it('clears a pending timer when it unmounts', () => {
        const { button, unmount } = renderTooltip(<GridTooltip title="Export"><button>btn</button></GridTooltip>);
        const before = vi.getTimerCount();
        fireEvent.mouseEnter(button);
        expect(vi.getTimerCount()).toBe(before + 1);
        unmount();
        expect(vi.getTimerCount()).toBe(before);
    });

    it.each([
        ['top', { top: '92px', left: '230px' }],
        ['bottom', { top: '138px', left: '230px' }],
        ['left', { top: '115px', left: '192px' }],
        ['right', { top: '115px', left: '268px' }],
    ] as const)('places the %s tooltip beside the child', (placement, expected) => {
        const { button } = renderTooltip(<GridTooltip title="tip" placement={placement}><button>btn</button></GridTooltip>);
        fireEvent.mouseEnter(button);
        act(() => { vi.advanceTimersByTime(200); });
        const tip = tooltips()[0];
        expect(tip.classList.contains(`ogx-tooltip--${placement}`)).toBe(true);
        expect(tip.style.position).toBe('fixed');
        expect({ top: tip.style.top, left: tip.style.left }).toEqual(expected);
    });

    it('renders inside the closest theme provider so it picks up the theme colours', () => {
        const { button } = renderTooltip(
            <div className="ogx-theme-provider"><GridTooltip title="Export"><button>btn</button></GridTooltip></div>
        );
        fireEvent.mouseEnter(button);
        act(() => { vi.advanceTimersByTime(200); });
        expect(tooltips()[0].closest('.ogx-theme-provider')).not.toBeNull();
    });
});
