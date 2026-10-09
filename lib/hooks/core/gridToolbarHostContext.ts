import { createContext } from 'react';

/**
 * Lets a `GridToolbar` rendered in `slots.toolbar` tell the grid that it will show the Columns
 * panel when the column menu asks for it (through `forceColumnsOpen`). When no toolbar has
 * registered (a custom toolbar that does not render `GridToolbar`, or one that does not forward
 * the grid's props), the column menu's **Manage columns** opens the standalone panel instead.
 */
export interface GridToolbarHost {
    /** Registers a toolbar that can show the Columns panel. Returns the function that unregisters it. */
    registerColumnsPanel: () => () => void;
    /**
     * Registers a toolbar that can show the filter panel when the header filter row asks for it
     * (through `forceFiltersOpen`). Returns the function that unregisters it.
     */
    registerFiltersPanel: () => () => void;
}

export const GridToolbarHostContext = createContext<GridToolbarHost | null>(null);
