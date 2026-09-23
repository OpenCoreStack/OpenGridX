import { describe, it, expect } from 'vitest';
import { AGGREGATION_FUNCTIONS } from './index';

describe('AGGREGATION_FUNCTIONS', () => {
    it('computes min / max over more values than a spread argument list allows', () => {
        const values = Array.from({ length: 300_000 }, (_, i) => i);
        expect(AGGREGATION_FUNCTIONS.min(values)).toBe(0);
        expect(AGGREGATION_FUNCTIONS.max(values)).toBe(299_999);
    });

    it('returns null for min / max / avg when there are no numeric values', () => {
        expect(AGGREGATION_FUNCTIONS.min([null, undefined])).toBeNull();
        expect(AGGREGATION_FUNCTIONS.max([])).toBeNull();
        expect(AGGREGATION_FUNCTIONS.avg(['x'])).toBeNull();
    });
});
