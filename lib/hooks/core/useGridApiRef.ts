import { useRef } from 'react';
import type { GridApi } from '../../types';

/**
 * Hook to create a ref for the DataGrid API.
 * This ref can be passed to the `apiRef` prop of the `DataGrid` component.
 */
export function useGridApiRef() {
    return useRef<GridApi>(null!);
}
