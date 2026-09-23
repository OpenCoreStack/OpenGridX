import { useRef, useState } from 'react';
import type { GridApi } from '../../types';
import { createGridApiPlaceholder } from './gridApiPlaceholder';

/**
 * Hook to create a ref for the DataGrid API.
 * This ref can be passed to the `apiRef` prop of the `DataGrid` component.
 *
 * `apiRef.current` is never null: until the grid mounts it holds an API whose methods are
 * no-ops (getters return empty values), and the grid swaps in the live API in a layout
 * effect, so it is available to the parent's layout effects and effects.
 */
export function useGridApiRef() {
    const [placeholder] = useState(createGridApiPlaceholder);
    return useRef<GridApi>(placeholder);
}
