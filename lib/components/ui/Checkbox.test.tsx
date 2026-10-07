import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import type React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './Checkbox';

describe('Checkbox accessible name', () => {
    it('is not overridden by a generic Select/Deselect label', () => {
        render(<><span id="price-name">Price</span><Checkbox checked aria-labelledby="price-name" onChange={() => {}} /></>);
        const box = screen.getByRole('checkbox', { name: 'Price' });
        expect(box.hasAttribute('aria-label')).toBe(false);
    });

    it('comes from the label prop', () => {
        render(<Checkbox label="Active" checked={false} onChange={() => {}} />);
        expect(screen.getByRole('checkbox', { name: 'Active' })).toBeTruthy();
    });

    it('uses an explicit aria-label', () => {
        render(<Checkbox aria-label="Select all rows" checked={false} onChange={() => {}} />);
        expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeTruthy();
    });

    it('can be referenced by an external <label htmlFor>', () => {
        render(<><label htmlFor="cb-x">Remember me</label><Checkbox id="cb-x" checked={false} onChange={() => {}} /></>);
        expect(screen.getByRole('checkbox', { name: 'Remember me' })).toBeTruthy();
    });
});

describe('Checkbox props and refs', () => {
    it('forwards ref to the <input> and still sets inputRef', () => {
        const ref = createRef<HTMLInputElement>();
        const inputRef = createRef<HTMLInputElement>();
        render(<Checkbox ref={ref} inputRef={inputRef} aria-label="A" checked={false} onChange={() => {}} />);
        const box = screen.getByRole('checkbox', { name: 'A' });
        expect(ref.current).toBe(box);
        expect(inputRef.current).toBe(box);
        expect(Checkbox.displayName).toBe('Checkbox');
    });

    it('puts className on the label and inputClassName on the <input>', () => {
        render(<Checkbox className="outer" inputClassName="inner" aria-label="A" checked={false} onChange={() => {}} />);
        const box = screen.getByRole('checkbox');
        expect(box.className).toBe('ogx-checkbox__input inner');
        expect(box.closest('label')!.className).toContain('outer');
    });

    it('passes onMouseDown and tabIndex through to the <input>', () => {
        const onMouseDown = vi.fn((e: React.MouseEvent) => e.preventDefault());
        render(<Checkbox aria-label="A" tabIndex={-1} onMouseDown={onMouseDown} checked={false} onChange={() => {}} />);
        const box = screen.getByRole('checkbox');
        expect(box.tabIndex).toBe(-1);
        fireEvent.mouseDown(box);
        expect(onMouseDown).toHaveBeenCalledTimes(1);
    });
});
