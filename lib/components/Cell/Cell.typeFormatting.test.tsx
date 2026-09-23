import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DataGrid } from '../DataGrid/DataGrid';
import { formatValueByType } from '../../utils/values';
import type { GridColDef, GridRowModel } from '../../types';

type TRow = GridRowModel & { d: Date | string | null; b: boolean | null; s: number; img: string };
const COLS: GridColDef<TRow>[] = [
    { field: 'd', headerName: 'Date', type: 'date' },
    { field: 'b', headerName: 'Active', type: 'boolean' },
    { field: 's', headerName: 'Status', type: 'singleSelect', valueOptions: [{ value: 1, label: 'Draft' }, { value: 2, label: 'Active' }] },
    { field: 'img', headerName: 'Avatar', type: 'image' },
];

const cellText = (container: HTMLElement, field: string, rowIndex = 0) =>
    container.querySelector(`[role="row"][data-rowindex="${rowIndex}"] [data-field="${field}"]`)?.textContent;

describe('default cell formatting by column type', () => {
    it('shows a date as a local calendar date, a boolean as Yes / No and a singleSelect value as its label', () => {
        const date = new Date(2024, 0, 2);
        const rows: TRow[] = [{ id: 1, d: date, b: true, s: 2, img: '' }, { id: 2, d: '2024-03-05', b: false, s: 1, img: '' }];
        const { container } = render(<DataGrid rows={rows} columns={COLS} />);
        expect(cellText(container, 'd')).toBe(date.toLocaleDateString());
        expect(cellText(container, 'b')).toBe('Yes');
        expect(cellText(container, 's')).toBe('Active');
        expect(cellText(container, 'd', 1)).toBe(new Date(2024, 2, 5).toLocaleDateString());
        expect(cellText(container, 'b', 1)).toBe('No');
        expect(cellText(container, 's', 1)).toBe('Draft');
    });

    it('renders an image column as an <img>', () => {
        const rows: TRow[] = [{ id: 1, d: null, b: null, s: 1, img: 'https://example.com/a.png' }];
        const { container } = render(<DataGrid rows={rows} columns={COLS} />);
        const img = container.querySelector<HTMLImageElement>('[data-field="img"] img');
        expect(img?.getAttribute('src')).toBe('https://example.com/a.png');
        expect(img?.getAttribute('alt')).toBe('Avatar');
    });

    it('passes the type-formatted text to renderCell as formattedValue', () => {
        const cols: GridColDef<TRow>[] = [
            { field: 's', type: 'singleSelect', valueOptions: [{ value: 0, label: 'Low' }], renderCell: p => <span>[{p.formattedValue}]</span> },
            { field: 'b', type: 'boolean', renderCell: p => <span>[{p.formattedValue}]</span> },
        ];
        const { container } = render(<DataGrid rows={[{ id: 1, d: null, b: true, s: 0, img: '' }]} columns={cols} />);
        expect(cellText(container, 's')).toBe('[Low]');
        expect(cellText(container, 'b')).toBe('[Yes]');
    });

    it('leaves a valueFormatter in charge', () => {
        const cols: GridColDef<TRow>[] = [{ field: 'b', type: 'boolean', valueFormatter: ({ value }) => (value ? 'on' : 'off') }];
        const { container } = render(<DataGrid rows={[{ id: 1, d: null, b: true, s: 0, img: '' }]} columns={cols} />);
        expect(cellText(container, 'b')).toBe('on');
    });
});

describe('formatValueByType', () => {
    it('shows unparsable dates, unknown options and null as expected', () => {
        expect(formatValueByType('not a date', { type: 'date' })).toBe('not a date');
        expect(formatValueByType(9, { type: 'singleSelect', valueOptions: [{ value: 1, label: 'One' }] })).toBe('9');
        expect(formatValueByType('1', { type: 'singleSelect', valueOptions: [{ value: 1, label: 'One' }] })).toBe('One');
        expect(formatValueByType(null, { type: 'boolean' })).toBe('');
        expect(formatValueByType(1234.5, { type: 'number' })).toBe('1234.5');
    });
});
