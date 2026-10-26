import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { GridContextMenu } from './GridContextMenu';
import { cleanContextMenuEntries } from './menuEntries';
import type { GridContextMenuEntry } from '../../types';

afterEach(() => vi.restoreAllMocks());

function setup(entries: GridContextMenuEntry[], onClose = vi.fn(), anchorCell: HTMLElement | null = null) {
    render(<GridContextMenu entries={entries} x={10} y={10} anchorCell={anchorCell} onClose={onClose} label="Cell menu" />);
    return onClose;
}

describe('GridContextMenu', () => {
    it('renders labels, shortcut text, a separator and the aria-label', () => {
        setup([{ id: 'a', label: 'Copy', shortcut: 'Ctrl+C' }, 'divider', { id: 'b', label: 'Paste' }]);
        expect(screen.getByRole('menu', { name: 'Cell menu' })).toBeTruthy();
        expect(screen.getByRole('menuitem', { name: /Copy/ })).toBeTruthy();
        expect(screen.getByText('Ctrl+C').className).toContain('ogx-context-menu__shortcut');
        expect(screen.getByRole('separator')).toBeTruthy();
        expect(screen.getByRole('menuitem', { name: 'Paste' })).toBeTruthy();
    });

    it('ignores a click on a disabled item', () => {
        const onClick = vi.fn();
        const onClose = setup([{ id: 'a', label: 'Copy', disabled: true, onClick }]);
        const item = screen.getByRole('menuitem', { name: 'Copy' });
        expect(item.getAttribute('aria-disabled')).toBe('true');
        fireEvent.click(item);
        expect(onClick).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('closes first, then runs onClick', () => {
        const order: string[] = [];
        const onClose = vi.fn(() => order.push('close'));
        setup([{ id: 'a', label: 'Copy', onClick: () => order.push('click') }], onClose);
        fireEvent.click(screen.getByRole('menuitem', { name: 'Copy' }));
        expect(order).toEqual(['close', 'click']);
    });

    it('restores focus to the anchor cell', () => {
        const cell = document.createElement('div');
        cell.tabIndex = 0;
        document.body.appendChild(cell);
        setup([{ id: 'a', label: 'Copy' }], vi.fn(), cell);
        fireEvent.click(screen.getByRole('menuitem', { name: 'Copy' }));
        expect(document.activeElement).toBe(cell);
        cell.remove();
    });

    it('contains a throwing onClick and warns once', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        setup([{ id: 'boom-once', label: 'Boom', onClick: () => { throw new Error('x'); } }]);
        const item = screen.getByRole('menuitem', { name: 'Boom' });
        expect(() => fireEvent.click(item)).not.toThrow();
        expect(() => fireEvent.click(item)).not.toThrow();
        expect(warn).toHaveBeenCalledTimes(1);
    });
});

describe('cleanContextMenuEntries', () => {
    const a = { id: 'a', label: 'A' };
    const b = { id: 'b', label: 'B' };
    it('removes leading, trailing and consecutive dividers', () => {
        expect(cleanContextMenuEntries(['divider', a, 'divider', 'divider', b, 'divider'])).toEqual([a, 'divider', b]);
    });
    it('returns an empty list for only dividers', () => {
        expect(cleanContextMenuEntries(['divider', 'divider'])).toEqual([]);
    });
});
