import { useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import type { GridApi, GridRowModel, GridValidRowModel } from '../../types';
import { createGridApiPlaceholder } from './gridApiPlaceholder';

/**
 * Hook to create a ref for the DataGrid API.
 * This ref can be passed to the `apiRef` prop of the `DataGrid` component.
 *
 * `apiRef.current` is never null: until the grid mounts it holds an API whose methods are
 * no-ops (getters return empty values), and the grid swaps in the live API in a layout
 * effect, so it is available to the parent's layout effects and effects.
 *
 * The return type is spelled out so the published declaration is `MutableRefObject<GridApi>`,
 * which matches `DataGridProps.apiRef` under both @types/react 18 and 19. Left to inference,
 * React 19's types emit `RefObject<GridApi>`, which React 18's types treat as read-only and
 * nullable, so `apiRef={useGridApiRef()}` failed to type-check on React 18.
 *
 * Pass your row type to have the row getters typed: `useGridApiRef<Invoice>().current.getRow(id)`
 * returns `Invoice | null`.
 */
export function useGridApiRef<R extends GridValidRowModel = GridRowModel>(): MutableRefObject<GridApi<R>> {
    const [placeholder] = useState(createGridApiPlaceholder<R>);
    return useRef<GridApi<R>>(placeholder);
}
