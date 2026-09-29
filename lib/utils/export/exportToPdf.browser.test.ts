import { describe, it, expect, vi, afterEach } from 'vitest';
import { exportToPdf, runPdfExport } from './exportToPdf';
import type { GridColDef, GridGroupedExportRow, GridRowModel, PdfExportOptions } from '../../types';

/**
 * Real jsPDF + jspdf-autotable (devDependencies). The saved file is captured from the Blob that
 * jsPDF hands to URL.createObjectURL; the download click is stubbed.
 */
function captureSaves(): { blobs: Blob[] } {
    const saved = { blobs: [] as Blob[] };
    vi.spyOn(URL, 'createObjectURL').mockImplementation((obj: Blob | MediaSource) => {
        if (obj instanceof Blob) saved.blobs.push(obj);
        return 'blob:captured';
    });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    return saved;
}

afterEach(() => {
    vi.restoreAllMocks();
});

const columns: GridColDef[] = [
    { field: 'name', width: 160 },
    { field: 'dept', width: 120 },
    { field: 'salary', type: 'number', width: 100, valueFormatter: ({ value }) => `$${String(value)}` },
    { field: 'email', width: 200 },
];

function groupedEntries(leaves: number, perGroup: number): GridGroupedExportRow[] {
    const out: GridGroupedExportRow[] = [];
    for (let g = 0; g * perGroup < leaves; g++) {
        out.push({ type: 'group-header', depth: 0, groupField: 'dept', groupValue: `Dept ${g}` });
        for (let i = g * perGroup; i < Math.min(leaves, (g + 1) * perGroup); i++) {
            out.push({ type: 'leaf', depth: 1, row: { id: i, name: `Person ${i}`, dept: `Dept ${g}`, salary: 1000 + i, email: `p${i}@example.com` } });
        }
        out.push({ type: 'group-subtotal', depth: 0, groupField: 'dept', groupValue: `Dept ${g}`, aggregatedValues: { salary: g } });
    }
    out.push({ type: 'grand-total', depth: 0, aggregatedValues: { salary: 42 } });
    return out;
}

const leafRows = (entries: GridGroupedExportRow[]): GridRowModel[] =>
    entries.filter(e => e.type === 'leaf' && e.row).map(e => e.row as GridRowModel);

/** Page count plus every drawing operator (text, positions, rectangles, lines), without redundant state changes. */
async function drawing(blob: Blob): Promise<string> {
    const text = await blob.text();
    const pages = (text.match(/\/Type \/Page\b/g) ?? []).length;
    const ops = text.split('\n').filter(line => / (Td|Tj|TJ|re|l|m)$/.test(line));
    return `pages=${pages}\n${ops.join('\n')}`;
}

describe('exportToPdf with real jsPDF', () => {
    it('keeps the main thread responsive while exporting ~5k grouped rows', async () => {
        const saved = captureSaves();
        const entries = groupedEntries(5000, 50);
        // Warm-up: the first call loads and evaluates jsPDF, which is not part of the export itself.
        await exportToPdf(leafRows(entries).slice(0, 2), columns);

        let last = performance.now();
        let longest = 0;
        let where = '';
        let current = '';
        const heartbeat = setInterval(() => {
            const t = performance.now();
            if (t - last > longest) { longest = t - last; where = current; }
            last = t;
        }, 5);
        const phases = new Set<string>();
        try {
            await exportToPdf(leafRows(entries), columns, {
                groupedRows: entries,
                aggregationModel: { salary: 'sum' },
                title: 'Heartbeat',
                onProgress: p => { phases.add(p.phase); current = `${p.phase}:${p.done}`; },
            });
        } finally {
            longest = Math.max(longest, performance.now() - last);
            clearInterval(heartbeat);
        }
        expect(phases).toEqual(new Set(['prepare', 'render', 'save']));
        expect(saved.blobs).toHaveLength(2);
        // `where` is the last progress event before the longest gap ended.
        expect(longest, `longest gap ${Math.round(longest)}ms, ended during ${where}`).toBeLessThan(200);
    }, 60_000);

    it('draws the same pages when the body is split into many autoTable calls', async () => {
        const saved = captureSaves();
        // Row i of the wrapped variant spans 1 to 4 lines, so rows split across pages too.
        const wrapColumns: GridColDef[] = [
            ...columns.slice(0, 3),
            { field: 'email', width: 60, valueFormatter: ({ value, row }) => `${String(value)} `.repeat(1 + (Number((row as GridRowModel).id) % 7)) },
        ];
        // Several sizes and chunk sizes so chunk boundaries and the footer land at different spots on the page.
        for (const [leaves, cols] of [[301, columns], [347, columns], [389, wrapColumns]] as const) {
            const entries = groupedEntries(leaves, 23);
            const variants: PdfExportOptions[] = [
                { groupedRows: entries, aggregationModel: { salary: 'sum' }, title: 'Grouped' },
                { aggregationModel: { salary: 'sum' }, aggregationResult: { salary: 7 } },
            ];
            for (const options of variants) {
                saved.blobs.length = 0;
                await runPdfExport(leafRows(entries), cols, options, { sliceMs: Number.POSITIVE_INFINITY, renderChunkRows: Number.MAX_SAFE_INTEGER, adaptive: false });
                for (let size = 2; size <= 64; size += 2) {
                    await runPdfExport(leafRows(entries), cols, options, { sliceMs: 0, renderChunkRows: size, adaptive: false });
                }
                const [single, ...chunked] = await Promise.all(saved.blobs.map(drawing));
                expect(Number(/pages=(\d+)/.exec(single)?.[1])).toBeGreaterThan(1);
                chunked.forEach((out, index) => {
                    expect(out, `leaves=${leaves} chunk=${2 + index * 2} ${options.groupedRows ? 'grouped' : 'flat'}`).toBe(single);
                });
            }
        }
    }, 120_000);

    it('rejects with an AbortError and saves nothing when aborted mid-render', async () => {
        const saved = captureSaves();
        const controller = new AbortController();
        const entries = groupedEntries(2000, 50);
        const promise = runPdfExport(leafRows(entries), columns, {
            groupedRows: entries,
            signal: controller.signal,
            onProgress: p => { if (p.phase === 'render' && p.done > 0) controller.abort(); },
        }, { sliceMs: 0, renderChunkRows: 100, adaptive: false });
        await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
        expect(saved.blobs).toHaveLength(0);
    });
});
