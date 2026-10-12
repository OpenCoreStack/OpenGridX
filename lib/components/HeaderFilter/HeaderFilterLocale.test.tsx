import { describe, it, expect } from 'vitest';
import { render, fireEvent, screen, within } from '@testing-library/react';
import { DataGrid } from '../DataGrid/DataGrid';
import type { GridColDef, GridFilterModel, GridLocaleText } from '../../types';
import { resolveHeaderFilterLocale } from '../../utils/headerFilterLocale';

type Row = { id: number; name: string; paid: boolean; status: string };

const ROWS: Row[] = [{ id: 1, name: 'Anna', paid: true, status: 'Open' }];
const COLS: GridColDef<Row>[] = [
    { field: 'name', headerName: 'Name', width: 120 },
    { field: 'paid', headerName: 'Paid', type: 'boolean', width: 100 },
    { field: 'status', headerName: 'Status', type: 'singleSelect', valueOptions: ['Open', 'Closed'], width: 110 },
];

const GERMAN: GridLocaleText = {
    headerFilterCustom: 'Eigener Filter',
    headerFilterCustomTooltip: 'Im Filterbereich festgelegt',
    headerFilterCellLabel: h => `${h} filtern`,
    headerFilterValueLabel: h => `Filterwert für ${h}`,
    headerFilterOperatorButtonLabel: (h, op) => `Operator für ${h}: ${op}`,
    headerFilterOperatorMenuLabel: h => `Operatoren für ${h}`,
    headerFilterClearLabel: h => `Filter für ${h} löschen`,
    headerFilterClearTooltip: 'Löschen',
    headerFilterAny: 'Alle',
    headerFilterTrue: 'Ja',
    headerFilterFalse: 'Nein',
    headerFilterOperators: { contains: 'Enthält', isEmpty: 'Ist leer' },
};

const cell = (c: HTMLElement, field: string) =>
    c.querySelector(`.ogx__header-filter-row [data-field="${field}"]`) as HTMLElement;

function renderGrid(filterModel: GridFilterModel, localeText: GridLocaleText | undefined = GERMAN) {
    return render(
        <DataGrid rows={ROWS} columns={COLS} headerFilters filterModel={filterModel} onFilterModelChange={() => undefined} localeText={localeText} />,
    );
}

describe('header filter row — localeText', () => {
    it('uses the cell, value, operator, clear and select keys', () => {
        const { container } = renderGrid({ items: [{ id: 'header:name', field: 'name', operator: 'contains', value: 'a' }] });
        const name = cell(container, 'name');
        expect(name.getAttribute('aria-label')).toBe('Name filtern');
        expect(within(name).getByRole('textbox').getAttribute('aria-label')).toBe('Filterwert für Name');
        const operator = within(name).getByRole('button', { name: 'Operator für Name: Enthält' });
        expect(operator.getAttribute('title')).toBe('Enthält');
        const clear = within(name).getByRole('button', { name: 'Filter für Name löschen' });
        expect(clear.getAttribute('title')).toBe('Löschen');

        const paid = within(cell(container, 'paid')).getByRole('combobox');
        expect(Array.from(paid.querySelectorAll('option')).map(o => o.textContent)).toEqual(['Alle', 'Ja', 'Nein']);
        const status = within(cell(container, 'status')).getByRole('combobox');
        expect(status.querySelector('option')!.textContent).toBe('Alle');
    });

    it('uses the operator menu label and operator names', () => {
        const { container } = renderGrid({ items: [] });
        fireEvent.click(within(cell(container, 'name')).getByRole('button', { name: /Operator für Name/ }));
        const menu = screen.getByRole('menu', { name: 'Operatoren für Name' });
        const names = within(menu).getAllByRole('menuitemradio').map(b => b.textContent);
        expect(names).toContain('Enthält');
        expect(names).toContain('Ist leer');
        // Operators without a translation keep their English name.
        expect(names).toContain('Starts with');
    });

    it('uses the operator name in a no-value cell', () => {
        const { container } = renderGrid({ items: [{ id: 'header:name', field: 'name', operator: 'isEmpty' }] });
        expect(cell(container, 'name').textContent).toContain('Ist leer');
    });

    it('uses the custom filter keys', () => {
        const { container } = renderGrid({ logicOperator: 'or', items: [{ field: 'name', operator: 'contains', value: 'a' }, { field: 'paid', operator: 'is', value: true }] });
        const custom = cell(container, 'name').querySelector('.ogx__header-filter-custom')!;
        expect(custom.textContent).toBe('Eigener Filter');
        expect(custom.getAttribute('title')).toBe('Im Filterbereich festgelegt');
    });

    it('defaults to the English text', () => {
        const english = resolveHeaderFilterLocale(undefined);
        expect([english.custom, english.customTooltip, english.clearTooltip, english.any, english.yes, english.no])
            .toEqual(['Custom filter', 'Set in the filter panel', 'Clear', 'Any', 'Yes', 'No']);
        expect(english.cellLabel('Qty')).toBe('Filter Qty');
        expect(english.valueLabel('Qty')).toBe('Filter value for Qty');
        expect(english.operatorButtonLabel('Qty', 'Equals')).toBe('Filter operator for Qty: Equals');
        expect(english.operatorMenuLabel('Qty')).toBe('Filter operator for Qty');
        expect(english.clearLabel('Qty')).toBe('Clear filter for Qty');
        expect(english.operator('contains')).toBe('Contains');

        const { container } = renderGrid({ items: [] }, {});
        expect(cell(container, 'name').getAttribute('aria-label')).toBe('Filter Name');
    });
});
