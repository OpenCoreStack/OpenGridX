import { describe, it, expect } from 'vitest';
import { pinColumnTo } from './index';

describe('pinColumnTo', () => {
    it('appends the field to the chosen side and removes it from the other', () => {
        expect(pinColumnTo({ left: ['a'], right: ['b'] }, 'b', 'left')).toEqual({ left: ['a', 'b'], right: [] });
        expect(pinColumnTo({ left: ['a', 'c'], right: ['b'] }, 'a', 'right')).toEqual({ left: ['c'], right: ['b', 'a'] });
    });

    it('moves an already pinned field to the end of its side', () => {
        expect(pinColumnTo({ left: ['a', 'b'] }, 'a', 'left')).toEqual({ left: ['b', 'a'], right: [] });
    });

    it('unpins the field with null', () => {
        expect(pinColumnTo({ left: ['a', 'b'], right: ['c'] }, 'b', null)).toEqual({ left: ['a'], right: ['c'] });
        expect(pinColumnTo({ left: ['a'], right: ['c'] }, 'c', null)).toEqual({ left: ['a'], right: [] });
    });

    it('starts from an empty model', () => {
        expect(pinColumnTo(undefined, 'a', 'right')).toEqual({ left: [], right: ['a'] });
        expect(pinColumnTo({}, 'a', null)).toEqual({ left: [], right: [] });
    });

    it('does not mutate the model it is given', () => {
        const model = { left: ['a'], right: ['b'] };
        pinColumnTo(model, 'b', 'left');
        expect(model).toEqual({ left: ['a'], right: ['b'] });
    });
});
