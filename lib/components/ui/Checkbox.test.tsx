import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
