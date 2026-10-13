import { createContext, useContext } from 'react';
import { resolveGridLocale, type ResolvedGridLocale } from '../../utils/gridLocale';

/**
 * The grid's resolved `localeText`, provided once by `GridRoot`. Components rendered outside a grid
 * (the exported `ColumnVisibilityPanel`, `GridToolbar`, `FilterPanel`, …) get the English default.
 */
export const GridLocaleContext = createContext<ResolvedGridLocale>(resolveGridLocale(undefined));

/** The strings of the enclosing grid, English outside one. */
export function useGridLocale(): ResolvedGridLocale {
    return useContext(GridLocaleContext);
}
