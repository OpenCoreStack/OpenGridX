import { describe, it, expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
    it('forwards ref to the <input>', () => {
        const ref = createRef<HTMLInputElement>();
        render(<Input ref={ref} aria-label="Name" />);
        expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Name' }));
        ref.current?.focus();
        expect(document.activeElement).toBe(ref.current);
    });

    it('accepts a callback ref', () => {
        let element: HTMLInputElement | null = null;
        render(<Input ref={(el) => { element = el; }} aria-label="Name" />);
        expect(element).toBe(screen.getByRole('textbox'));
    });

    it('has a displayName', () => {
        expect(Input.displayName).toBe('Input');
    });

    it('puts className on the wrapper and inputClassName on the <input>', () => {
        render(<Input className="outer" inputClassName="inner other" aria-label="Name" />);
        const input = screen.getByRole('textbox');
        expect(input.className).toBe('ogx-input inner other');
        const wrapper = input.parentElement!;
        expect(wrapper.classList.contains('ogx-input-wrapper')).toBe(true);
        expect(wrapper.classList.contains('outer')).toBe(true);
        expect(wrapper.classList.contains('inner')).toBe(false);
    });

    it('defaults to the field variant', () => {
        render(<Input aria-label="Name" />);
        expect(screen.getByRole('textbox').parentElement!.className).toBe('ogx-input-wrapper');
    });

    it('adds ogx-input-wrapper--cell for the cell variant', () => {
        render(<Input variant="cell" aria-label="Name" />);
        expect(screen.getByRole('textbox').parentElement!.classList.contains('ogx-input-wrapper--cell')).toBe(true);
    });

    it('renders start and end adornments around the input', () => {
        render(<Input startAdornment="$" endAdornment="kg" aria-label="Price" />);
        const wrapper = screen.getByRole('textbox').parentElement!;
        const children = Array.from(wrapper.children);
        expect(children).toHaveLength(3);
        expect(children[0].className).toContain('ogx-input__adornment--start');
        expect(children[0].textContent).toBe('$');
        expect(children[1].tagName).toBe('INPUT');
        expect(children[2].className).toContain('ogx-input__adornment--end');
        expect(children[2].textContent).toBe('kg');
    });

    it('marks an error on the wrapper and as aria-invalid, in either variant', () => {
        const { rerender } = render(<Input error aria-label="Name" />);
        const input = screen.getByRole('textbox');
        expect(input.parentElement!.classList.contains('ogx-input-wrapper--error')).toBe(true);
        expect(input.getAttribute('aria-invalid')).toBe('true');

        rerender(<Input error variant="cell" aria-label="Name" />);
        expect(input.parentElement!.classList.contains('ogx-input-wrapper--error')).toBe(true);
        expect(input.parentElement!.classList.contains('ogx-input-wrapper--cell')).toBe(true);

        rerender(<Input variant="cell" aria-label="Name" />);
        expect(input.parentElement!.classList.contains('ogx-input-wrapper--error')).toBe(false);
        expect(input.hasAttribute('aria-invalid')).toBe(false);
    });

    it('passes other props to the <input> and marks the wrapper disabled', () => {
        render(<Input id="x" name="n" type="number" disabled aria-label="Qty" />);
        const input = screen.getByRole('spinbutton', { name: 'Qty' }) as HTMLInputElement;
        expect(input.id).toBe('x');
        expect(input.name).toBe('n');
        expect(input.disabled).toBe(true);
        expect(input.parentElement!.classList.contains('ogx-input-wrapper--disabled')).toBe(true);
    });
});
