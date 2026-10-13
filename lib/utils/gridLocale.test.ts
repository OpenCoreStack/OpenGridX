import { describe, it, expect } from 'vitest';
import { GRID_LOCALE_EN, resolveGridLocale } from './gridLocale';
import { resolveHeaderFilterLocale } from './headerFilterLocale';
import { defaultCellSelectionAnnouncement } from './cellSelection';

describe('resolveGridLocale', () => {
    it('defaults to the built-in English strings', () => {
        const locale = resolveGridLocale();
        expect(locale.columnMenuSortAscending).toBe('Sort Ascending');
        expect(locale.toolbarSearchPlaceholder).toBe('Search...');
        expect(locale.filterPanelNoColumns).toBe('No filterable columns.');
        expect(locale.pivotMode).toBe('Pivot Mode');
        expect(locale.aiAssistantTitle).toBe('Ask AI');
        expect(locale.paginationFirstPageLabel).toBe('Go to first page');
        expect(locale.noRowsLabel).toBe('No Data');
        expect(locale.rowSelectLabel(7)).toBe('Select row 7');
        expect(locale.rowDeselectLabel('a')).toBe('Deselect row a');
        expect(locale.columnMenuHideColumnLabel('Name')).toBe('Hide Name column');
        expect(locale.headerSortDescription('desc', 2, 3)).toBe('Sorted descending, sort priority 2 of 3');
        expect(locale.liveRegionRowsFound(1)).toBe('1 row found');
        expect(locale.liveRegionRowsFound(4)).toBe('4 rows found');
        expect(locale.listViewItemCount(1)).toBe('1 item');
        expect(locale.aiAssistantApplied(0, 0)).toBe('No changes');
        expect(locale.aiAssistantApplied(1, 0)).toBe('Applied 1 change');
        expect(locale.aiAssistantApplied(3, 1)).toBe('Applied 3 changes, 1 ignored');
        expect(locale.pivotRemoveValueLabel('Amount', 'SUM')).toBe('Remove Amount (SUM) from Value Fields');
        expect(locale.filterPanelHiddenConditions(2)).toBe('2 more conditions (filter groups or further conditions on a column) are applied and not shown here.');
    });

    it('keeps the existing pagination and announcement defaults', () => {
        const locale = resolveGridLocale();
        expect(locale.paginationOf(1, 10, 25)).toBe('1–10 of 25');
        expect(locale.paginationOf(0, 0, 0)).toBe('0 of 0');
        expect(locale.paginationPage(2, 3)).toBe('Page 2 of 3');
        expect(locale.cellSelectionAnnouncement).toBe(defaultCellSelectionAnnouncement);
    });

    it('turns lookup records into functions with English fallbacks', () => {
        const locale = resolveGridLocale();
        expect(locale.filterPanelOperator('contains')).toBe('contains');
        expect(locale.toolbarAggregationFunction('sum')).toBe('sum');
        expect(locale.pivotAggregationFunction('avg')).toBe('AVG');
        expect(locale.headerFilterOperator('isEmpty')).toBe(resolveHeaderFilterLocale(undefined).operator('isEmpty'));
    });

    it('lets overrides win and keeps defaults for the rest', () => {
        const locale = resolveGridLocale({
            columnMenuSortAscending: 'Tri croissant',
            rowSelectLabel: id => `Sélectionner la ligne ${id}`,
            filterPanelOperators: { contains: 'contient' },
            pivotAggregationFunctions: { sum: 'Somme' },
            toolbarAggregationFunctions: { none: 'aucune' },
            columnMenuUnsort: undefined,
        });
        expect(locale.columnMenuSortAscending).toBe('Tri croissant');
        expect(locale.columnMenuUnsort).toBe('Unsort');
        expect(locale.columnMenuSortDescending).toBe('Sort Descending');
        expect(locale.rowSelectLabel(3)).toBe('Sélectionner la ligne 3');
        expect(locale.filterPanelOperator('contains')).toBe('contient');
        expect(locale.filterPanelOperator('equals')).toBe('equals');
        expect(locale.pivotAggregationFunction('sum')).toBe('Somme');
        expect(locale.pivotAggregationFunction('max')).toBe('MAX');
        expect(locale.toolbarAggregationFunction('none')).toBe('aucune');
    });

    it('passes the arguments to function overrides', () => {
        const calls: unknown[][] = [];
        const locale = resolveGridLocale({
            headerSortDescription: (...args) => { calls.push(args); return 'x'; },
            aiAssistantApplied: (...args) => { calls.push(args); return 'y'; },
        });
        expect(locale.headerSortDescription('asc', 1, 2)).toBe('x');
        expect(locale.aiAssistantApplied(4, 2)).toBe('y');
        expect(calls).toEqual([['asc', 1, 2], [4, 2]]);
    });

    it('does not change the English table', () => {
        resolveGridLocale({ gridLabel: 'Grille' });
        expect(GRID_LOCALE_EN.gridLabel).toBe('Data grid');
    });
});

describe('AI change chip texts (v3.10)', () => {
    it('defaults to the English chips and takes overrides', async () => {
        const { buildAiChips } = await import('./aiAssistant');
        const { aiChipTextsOf } = await import('./gridLocale');
        const state = { sortModel: [{ field: 'amount', sort: 'desc' as const }], rowGroupingModel: [], aggregationModel: { amount: 'avg' } };
        const en = buildAiChips(state, f => f, aiChipTextsOf(resolveGridLocale(undefined))).map(c => c.label);
        expect(en).toEqual(['Sort: amount, descending', 'No grouping', 'Average: amount']);
        const fr = buildAiChips(state, f => f, aiChipTextsOf(resolveGridLocale({
            aiAssistantChipSort: (f, d) => `Tri : ${f}, ${d === 'desc' ? 'décroissant' : 'croissant'}`,
            aiAssistantChipNoGrouping: 'Aucun regroupement',
            aiAssistantChipSummary: (fn, f) => `${fn === 'avg' ? 'Moyenne' : fn} : ${f}`,
        }))).map(c => c.label);
        expect(fr).toEqual(['Tri : amount, décroissant', 'Aucun regroupement', 'Moyenne : amount']);
    });
});
