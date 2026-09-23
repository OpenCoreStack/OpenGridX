import { createContext } from 'react';
import type { GridTheme } from './types';

/** The theme of the closest DataGridThemeProvider, for the values the grid reads in JS (heights). */
export const GridThemeContext = createContext<GridTheme | null>(null);
