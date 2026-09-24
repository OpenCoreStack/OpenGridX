import { describe, it, expect, vi, afterEach, beforeEach, type MockInstance } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { DataGrid } from '../../components/DataGrid/DataGrid';
import { resetGridStylesheetWarning } from './useGridDevWarnings';
// The stylesheet's text, not injected: each test decides whether the page has it.
import stylesheet from '../../styles/opengridx.css?inline';

const rows = Array.from({ length: 50 }, (_, i) => ({ id: i, name: `row ${i}` }));
const columns = [{ field: 'name' }];

function stylesheetWarned(warn: MockInstance<typeof console.warn>): boolean {
    return warn.mock.calls.some(([msg]) => String(msg).includes('grid stylesheet is not loaded'));
}

describe('missing stylesheet dev warning (real browser)', () => {
    let warn: MockInstance<typeof console.warn>;

    beforeEach(() => {
        resetGridStylesheetWarning();
        warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        document.head.querySelectorAll('style[data-test-ogx]').forEach(el => el.remove());
    });

    it('warns when the grid renders without the stylesheet', () => {
        render(<DataGrid rows={rows} columns={columns} height={300} />);
        expect(stylesheetWarned(warn)).toBe(true);
    });

    it('does not warn when the stylesheet is loaded, also with autoHeight and list view', () => {
        const style = document.createElement('style');
        style.setAttribute('data-test-ogx', '');
        style.textContent = stylesheet;
        document.head.appendChild(style);
        render(<DataGrid rows={rows} columns={columns} height={300} />);
        render(<DataGrid rows={rows} columns={columns} autoHeight />);
        render(<DataGrid rows={rows} columns={columns} height={300} listView listViewColumn={{ field: 'card', renderCell: p => String(p.row.name) }} />);
        expect(stylesheetWarned(warn)).toBe(false);
    });
});
