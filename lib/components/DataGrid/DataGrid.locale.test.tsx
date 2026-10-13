import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataGrid } from './DataGrid';
import { GridToolbar } from '../Toolbar/GridToolbar';
import { ColumnVisibilityPanel } from '../ColumnVisibilityPanel/ColumnVisibilityPanel';
import type { GridColDef, GridLocaleText } from '../../types';

const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', width: 120 },
    { field: 'amount', headerName: 'Amount', type: 'number', width: 120, aggregable: true },
];
const rows = [
    { id: 1, name: 'Ann', amount: 10 },
    { id: 2, name: 'Bob', amount: 30 },
    { id: 3, name: 'Cid', amount: 20 },
];

const FR: GridLocaleText = {
    columnMenuSortAscending: 'Tri croissant',
    columnMenuHideColumnLabel: h => `Masquer la colonne ${h}`,
    toolbarLabel: 'Barre d’outils',
    toolbarSearchPlaceholder: 'Rechercher…',
    toolbarFiltersLabel: 'Filtres avancés',
    toolbarFilters: 'Filtres',
    filterPanelOperatorLabel: h => `Opérateur pour ${h}`,
    filterPanelOperators: { contains: 'contient' },
    paginationNextPageLabel: 'Page suivante',
    rowSelectLabel: id => `Sélectionner la ligne ${id}`,
    headerSelectAllLabel: 'Tout sélectionner',
    toolbarPivotLabel: 'Configurer le pivot',
    pivotMode: 'Mode pivot',
    pivotAvailableFields: 'Champs disponibles',
    aiAssistantTitle: 'Demander à l’IA',
    aiAssistantPromptLabel: 'Question',
    aiAssistantButton: 'IA',
    gridLabel: 'Grille',
};

describe('localeText for the UI strings (v3.9)', () => {
    it('keeps the English defaults without localeText', () => {
        render(<DataGrid rows={rows} columns={columns} height={300} checkboxSelection pagination slots={{ toolbar: GridToolbar }} />);
        expect(screen.getByRole('grid', { name: 'Data grid' })).toBeTruthy();
        expect(screen.getByRole('toolbar', { name: 'Grid toolbar' })).toBeTruthy();
        expect(screen.getByLabelText('Select row 1')).toBeTruthy();
        expect(screen.getByLabelText('Go to next page')).toBeTruthy();
    });

    it('applies overrides to the grid, toolbar, rows and pagination', () => {
        render(<DataGrid rows={rows} columns={columns} height={300} checkboxSelection pagination localeText={FR} slots={{ toolbar: GridToolbar }} />);
        expect(screen.getByRole('grid', { name: 'Grille' })).toBeTruthy();
        expect(screen.getByRole('toolbar', { name: 'Barre d’outils' })).toBeTruthy();
        expect(screen.getByPlaceholderText('Rechercher…')).toBeTruthy();
        expect(screen.getByLabelText('Sélectionner la ligne 2')).toBeTruthy();
        expect(screen.getByLabelText('Tout sélectionner')).toBeTruthy();
        expect(screen.getByLabelText('Page suivante')).toBeTruthy();
        // Keys left out stay English.
        expect(screen.getByLabelText('Go to previous page')).toBeTruthy();
    });

    it('applies overrides to the column menu', () => {
        render(<DataGrid rows={rows} columns={columns} height={300} localeText={FR} />);
        fireEvent.click(screen.getByLabelText('Open column menu for Name'));
        expect(screen.getByRole('menuitemradio', { name: 'Tri croissant' })).toBeTruthy();
        expect(screen.getByRole('menuitem', { name: 'Masquer la colonne Name' })).toBeTruthy();
        expect(screen.getByRole('menuitemradio', { name: /Sort Descending/ })).toBeTruthy();
    });

    it('applies overrides to the filter panel', () => {
        render(<DataGrid rows={rows} columns={columns} height={300} localeText={FR} slots={{ toolbar: GridToolbar }} />);
        fireEvent.click(screen.getByRole('button', { name: 'Filtres avancés' }));
        const operator = screen.getByLabelText('Opérateur pour Name') as HTMLSelectElement;
        expect(Array.from(operator.options).map(o => o.textContent)).toContain('contient');
    });

    it('applies overrides to the pivot panel', () => {
        render(<DataGrid rows={rows} columns={columns} height={300} localeText={FR} pivotModel={{ rowFields: [], columnFields: [], valueFields: [] }} slots={{ toolbar: GridToolbar }} />);
        fireEvent.click(screen.getByRole('button', { name: 'Configurer le pivot' }));
        expect(screen.getByText('Mode pivot')).toBeTruthy();
        expect(screen.getByText('Champs disponibles')).toBeTruthy();
    });

    it('applies overrides to the AI assistant panel', () => {
        render(
            <DataGrid rows={rows} columns={columns} height={300} localeText={FR} slots={{ toolbar: GridToolbar }}
                aiAssistant={{ onPrompt: () => Promise.resolve({ state: {}, errors: [] }) }} />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'IA' }));
        expect(screen.getByRole('dialog', { name: 'Demander à l’IA' })).toBeTruthy();
        expect(screen.getByRole('textbox', { name: 'Question' })).toBeTruthy();
    });

    it('falls back to English for components used outside a grid', () => {
        render(
            <ColumnVisibilityPanel columns={columns} visibleColumns={new Set(['name'])} onVisibilityChange={() => undefined}
                onShowAll={() => undefined} onHideAll={() => undefined} />,
        );
        expect(screen.getByPlaceholderText('Search')).toBeTruthy();
        expect(screen.getByText('Show/Hide All')).toBeTruthy();
    });
});
