import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
    it('is a plain button by default, so it never submits an enclosing form', () => {
        render(<Button>Go</Button>);
        expect((screen.getByRole('button', { name: 'Go' }) as HTMLButtonElement).type).toBe('button');
    });

    it('keeps an explicit type', () => {
        render(<Button type="submit">Save</Button>);
        expect((screen.getByRole('button', { name: 'Save' }) as HTMLButtonElement).type).toBe('submit');
    });
});
