import { describe, it, expect } from 'vitest';
import { filterValueFromInputText, getFilterValueOptions, isSameFilterValue, matchesFilterValueOption } from './filterInput';

describe('filter input helpers', () => {
    it('normalises valueOptions', () => {
        expect(getFilterValueOptions({ valueOptions: ['a', { value: 1, label: 'One' }] })).toEqual([
            { key: '0', value: 'a', label: 'a' },
            { key: '1', value: 1, label: 'One' },
        ]);
        expect(getFilterValueOptions({})).toEqual([]);
    });

    it('matches by value, by text ignoring case, and by a list\'s first entry', () => {
        const [option] = getFilterValueOptions({ valueOptions: [{ value: 1, label: 'One' }] });
        expect(matchesFilterValueOption(option, 1)).toBe(true);
        expect(matchesFilterValueOption(option, '1')).toBe(true);
        expect(matchesFilterValueOption(option, [1, 2])).toBe(true);
        expect(matchesFilterValueOption(option, null)).toBe(false);
        const [text] = getFilterValueOptions({ valueOptions: ['Open'] });
        expect(matchesFilterValueOption(text, 'open')).toBe(true);
    });

    it('reads typed text, splitting lists for isAnyOf', () => {
        expect(filterValueFromInputText(' a , b,, ', 'isAnyOf')).toEqual(['a', 'b']);
        expect(filterValueFromInputText('a,b', 'contains')).toBe('a,b');
    });

    it('compares values, dates and lists', () => {
        expect(isSameFilterValue(new Date(5), new Date(5))).toBe(true);
        expect(isSameFilterValue([1, [2]], [1, [2]])).toBe(true);
        expect(isSameFilterValue([1], [2])).toBe(false);
        expect(isSameFilterValue(NaN, NaN)).toBe(true);
    });
});
