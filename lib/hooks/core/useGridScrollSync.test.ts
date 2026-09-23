import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGridScrollSync } from './useGridScrollSync';
import type { UseGridScrollSyncParams } from './useGridScrollSync';

describe('useGridScrollSync — overscan', () => {
    it('applies a new overscanRowCount immediately, without waiting for a scroll', () => {
        const { result, rerender } = renderHook((p: UseGridScrollSyncParams) => useGridScrollSync(p), {
            initialProps: { overscanRowCount: 3 },
        });
        expect(result.current.overscanRows).toBe(3);
        rerender({ overscanRowCount: 20 });
        expect(result.current.overscanRows).toBe(20);
        rerender({ overscanRowCount: 1 });
        expect(result.current.overscanRows).toBe(1);
    });
});
