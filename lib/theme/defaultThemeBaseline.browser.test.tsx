import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { commands, server, userEvent } from 'vitest/browser';
import '../styles/opengridx.css';
import { DataGrid, DataGridThemeProvider, GridToolbar, darkTheme, compactTheme } from '../index';
import type { DataGridProps } from '../types';
import type { GridTheme } from './types';

// Proof that the theme keys added for the Theme Builder (fonts, header padding, divider and outer
// border widths/colours, grid radius, overlay fonts) change nothing for grids that don't set them.
// Each scenario's computed styles and element boxes are compared with a baseline captured from the
// stylesheet as it was before those variables existed (__baseline__/default-theme.<platform>.<engine>.json).
// A missing baseline file is written and the test fails, so a run never passes without one.

afterEach(() => { cleanup(); });

const rows = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    region: i % 2 ? 'North' : 'South',
    amount: (i + 1) * 10,
    qty: i + 2,
}));
const columns = [
    { field: 'name', headerName: 'Name', width: 140 },
    { field: 'region', headerName: 'Region', width: 120 },
    { field: 'amount', headerName: 'Amount', type: 'number' as const, width: 110 },
    { field: 'qty', headerName: 'Qty', type: 'number' as const, width: 90 },
];

const STYLE_PROPS = [
    'font-family', 'font-weight', 'font-size', 'line-height', 'color', 'background-color',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
    'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
    'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
    'border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius',
];
const PSEUDO_PROPS = ['content', 'width', 'height', 'background-color', 'opacity', 'border-left-width', 'border-right-width'];

const round = (n: number) => Math.round(n * 100) / 100;

const values = (style: CSSStyleDeclaration, props: string[]) => props.map(p => style.getPropertyValue(p)).join(';');

// One line per element, in document order: tag.class [x,y,width,height] style values, then the
// ::before / ::after values when the pseudo-element is rendered.
function snapshot(root: Element): string[] {
    const origin = root.getBoundingClientRect();
    return Array.from(root.querySelectorAll('*')).map((el) => {
        const r = el.getBoundingClientRect();
        const className = typeof el.className === 'string' ? el.className : '';
        const box = [r.left - origin.left, r.top - origin.top, r.width, r.height].map(n => String(round(n))).join(',');
        let line = `${el.tagName.toLowerCase()}.${className} [${box}] ${values(getComputedStyle(el), STYLE_PROPS)}`;
        for (const pseudo of ['::before', '::after'] as const) {
            const ps = getComputedStyle(el, pseudo);
            const content = ps.getPropertyValue('content');
            if (content !== 'none' && content !== 'normal') line += ` ${pseudo} ${values(ps, PSEUDO_PROPS)}`;
        }
        return line;
    });
}

async function settle() {
    for (let i = 0; i < 3; i++) {
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
    for (const animation of document.getAnimations()) animation.finish();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
}

interface Scenario {
    name: string;
    theme: GridTheme | null;
    props: Partial<DataGridProps>;
    open?: (root: HTMLElement) => Promise<void>;
}

const scenarios: Scenario[] = [
    { name: 'plain, no provider', theme: null, props: {} },
    { name: 'plain', theme: {}, props: {} },
    {
        name: 'pinned + column groups + selection',
        theme: {},
        props: {
            checkboxSelection: true,
            rowSelectionModel: [2],
            pinnedColumns: { left: ['name'], right: ['qty'] },
            columnGroupingModel: [{ groupId: 'figures', headerName: 'Figures', children: ['amount', 'qty'] }],
        },
    },
    { name: 'pinned, dark preset', theme: darkTheme, props: { pinnedColumns: { left: ['name'], right: ['qty'] } } },
    { name: 'pinned, compact preset', theme: compactTheme, props: { pinnedColumns: { left: ['name'], right: ['qty'] } } },
    { name: 'header filters', theme: {}, props: { headerFilters: true } },
    {
        name: 'header filter operator menu open',
        theme: {},
        props: { headerFilters: true },
        open: async (root) => {
            await userEvent.click(root.querySelector<HTMLElement>('.ogx__header-filter-operator')!);
        },
    },
    { name: 'aggregation footer', theme: {}, props: { aggregationModel: { amount: 'sum', qty: 'max' }, pinnedColumns: { left: ['name'] } } },
    {
        name: 'toolbar columns panel open',
        theme: {},
        props: { slots: { toolbar: GridToolbar } },
        open: async (root) => {
            await userEvent.click(root.querySelector<HTMLElement>('[aria-label="Manage columns"]')!);
        },
    },
    {
        name: 'toolbar filter panel open',
        theme: {},
        props: { slots: { toolbar: GridToolbar } },
        open: async (root) => {
            await userEvent.click(root.querySelector<HTMLElement>('button[aria-label="Advanced filters"]')!);
        },
    },
    {
        name: 'column menu open',
        theme: {},
        props: {},
        open: async (root) => {
            await userEvent.click(root.querySelector<HTMLElement>('.ogx__menu-icon-btn')!);
        },
    },
];

async function capture(scenario: Scenario): Promise<string[]> {
    const grid = <DataGrid rows={rows} columns={columns} height={360} {...scenario.props} />;
    const { container } = render(
        <div style={{ width: 640, padding: 8, boxSizing: 'border-box' }}>
            {scenario.theme ? <DataGridThemeProvider theme={scenario.theme}>{grid}</DataGridThemeProvider> : grid}
        </div>
    );
    const root = container.firstElementChild as HTMLElement;
    await settle();
    if (scenario.open) {
        await scenario.open(root);
        await settle();
    }
    // Park the pointer outside the grid so no hover style depends on where the last click was.
    await userEvent.hover(document.body, { position: { x: 1, y: 1 } }).catch(() => undefined);
    await settle();
    const result = snapshot(root);
    cleanup();
    return result;
}

describe('default theme renders exactly as before the theme-builder keys', () => {
    // Text metrics and font fallbacks differ per OS, so boxes are only comparable on the platform the
    // baseline was captured on (macOS, where the library is developed). Other platforms skip; CI on
    // Linux still runs every per-key and layout test.
    it.skipIf(server.platform !== 'darwin')('matches the captured baseline in every scenario', async () => {
        const file = `lib/theme/__baseline__/default-theme.${server.platform}.${server.browser}.json`;
        const current: Record<string, string[]> = {};
        for (const scenario of scenarios) current[scenario.name] = await capture(scenario);

        let baselineText: string | null = null;
        try {
            baselineText = await commands.readFile(file);
        } catch {
            baselineText = null;
        }
        if (baselineText === null) {
            await commands.writeFile(file, `${JSON.stringify(current, null, 0)}\n`);
            throw new Error(`No baseline for ${server.browser}; wrote ${file}. Rerun to compare.`);
        }
        const baseline = JSON.parse(baselineText) as typeof current;
        for (const scenario of scenarios) {
            expect(current[scenario.name], scenario.name).toEqual(baseline[scenario.name]);
        }
    });
});
