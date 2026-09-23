import { describe, it, expect, vi, afterEach } from 'vitest';
import { printGrid } from './index';
import type { GridColDef, GridGroupedExportRow } from '../../types';

/**
 * printGrid writes its HTML into a same-origin popup. Here the popup is replaced by a stub that
 * captures the final document, which is then rendered in a real iframe so CSS and scripts behave
 * as they would in the print window.
 */
async function renderPrintHtml(run: () => Promise<void>): Promise<HTMLIFrameElement> {
    const writes: string[] = [];
    const fakeWindow = {
        closed: false,
        document: { write: (s: string) => { writes.push(s); }, open: () => {}, close: () => {}, title: '', body: { innerHTML: '' } },
        focus: () => {},
        print: () => {},
        close: () => { fakeWindow.closed = true; },
        onload: null,
    };
    vi.spyOn(window, 'open').mockReturnValue(fakeWindow as unknown as Window);
    await run();

    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    await new Promise<void>(resolve => {
        iframe.onload = () => resolve();
        iframe.srcdoc = writes[writes.length - 1];
    });
    return iframe;
}

afterEach(() => {
    vi.restoreAllMocks();
    document.querySelectorAll('iframe').forEach(f => f.remove());
});

describe('printGrid in a real browser', () => {
    it('keeps the group-row highlight on even rows, where the stripe rule also matches', async () => {
        const cols: GridColDef[] = [{ field: 'name' }];
        const groupedRows: GridGroupedExportRow[] = [
            { type: 'group-header', depth: 0, groupField: 'dept', groupValue: 'A' },
            { type: 'leaf', depth: 1, row: { id: 1, name: 'x' } },
            { type: 'group-header', depth: 0, groupField: 'dept', groupValue: 'B' }, // 3rd row
            { type: 'group-subtotal', depth: 0, groupField: 'dept', groupValue: 'B', aggregatedValues: {} }, // 4th row
            { type: 'group-header', depth: 0, groupField: 'dept', groupValue: 'C' }, // 5th row
            { type: 'grand-total', depth: 0, aggregatedValues: {} }, // 6th row
        ];
        const iframe = await renderPrintHtml(() => printGrid([], cols, { groupedRows }));
        const doc = iframe.contentDocument!;
        const bg = (el: Element) => iframe.contentWindow!.getComputedStyle(el).backgroundColor;
        const headers = Array.from(doc.querySelectorAll('tr.group-header'));
        expect(headers.map(bg)).toEqual(['rgb(232, 234, 246)', 'rgb(232, 234, 246)', 'rgb(232, 234, 246)']);
        expect(bg(doc.querySelector('tr.group-subtotal')!)).toBe('rgb(240, 244, 255)');
        expect(bg(doc.querySelector('tr.grand-total')!)).toBe('rgb(245, 245, 245)');

        // Swap the order so a header lands on an even row, which the stripe rule targets.
        const evenHeader = await renderPrintHtml(() => printGrid([], cols, {
            groupedRows: [
                { type: 'leaf', depth: 0, row: { id: 1, name: 'x' } },
                { type: 'group-header', depth: 0, groupField: 'dept', groupValue: 'A' },
            ],
        }));
        const header = evenHeader.contentDocument!.querySelector('tr.group-header')!;
        expect(evenHeader.contentWindow!.getComputedStyle(header).backgroundColor).toBe('rgb(232, 234, 246)');
    });

    it('does not run script from the title, image cells or alt text', async () => {
        const probe = window as unknown as Record<string, unknown>;
        delete probe.__ogxPwned;
        const cols: GridColDef[] = [{ field: 'avatar', type: 'image', headerName: 'A" onload="parent.__ogxPwned=3' }];
        const iframe = await renderPrintHtml(() => printGrid(
            [{ id: 1, avatar: 'x" onerror="parent.__ogxPwned=1' }, { id: 2, avatar: 'javascript:parent.__ogxPwned=2' }],
            cols,
            '</title><script>parent.__ogxPwned=4</script>',
        ));
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(probe.__ogxPwned).toBeUndefined();
        expect(iframe.contentDocument!.querySelectorAll('script')).toHaveLength(0);
        expect(iframe.contentDocument!.title).toBe('</title><script>parent.__ogxPwned=4</script>');
    });
});
