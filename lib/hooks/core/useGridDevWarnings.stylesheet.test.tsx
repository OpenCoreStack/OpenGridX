import { describe, it, expect, vi, afterEach, beforeEach, type MockInstance } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { DataGrid } from '../../components/DataGrid/DataGrid';
import { resetGridStylesheetWarning } from './useGridDevWarnings';

const rows = [{ id: 1, name: 'a' }];
const columns = [{ field: 'name' }];
const STYLESHEET_MESSAGE = 'grid stylesheet is not loaded';

function stylesheetWarnings(warn: MockInstance<typeof console.warn>): number {
    return warn.mock.calls.filter(([msg]) => String(msg).includes(STYLESHEET_MESSAGE)).length;
}

describe('missing stylesheet dev warning', () => {
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

    it('stays quiet under jsdom, which never applies the library CSS', () => {
        render(<DataGrid rows={rows} columns={columns} height={300} />);
        expect(stylesheetWarnings(warn)).toBe(0);
    });

    it('warns once when a browser renders the grid without the stylesheet', () => {
        vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 Chrome/140');
        render(<DataGrid rows={rows} columns={columns} height={300} />);
        render(<DataGrid rows={rows} columns={columns} height={300} />);
        expect(stylesheetWarnings(warn)).toBe(1);
        expect(String(warn.mock.calls.find(([msg]) => String(msg).includes(STYLESHEET_MESSAGE))?.[0]))
            .toContain("import '@opencorestack/opengridx/styles'");
    });

    it('does not warn when the stylesheet lays the grid root out as flex', () => {
        vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 Chrome/140');
        const style = document.createElement('style');
        style.setAttribute('data-test-ogx', '');
        style.textContent = '.ogx { display: flex; flex-direction: column; }';
        document.head.appendChild(style);
        render(<DataGrid rows={rows} columns={columns} height={300} />);
        expect(stylesheetWarnings(warn)).toBe(0);
    });
});
