import { amberTheme, compactTheme, darkTheme, emeraldTheme, roseTheme } from '@opencorestack/opengridx';
import type { GridTheme } from '@opencorestack/opengridx';

// Pure model of the Theme Builder page: the controls, their defaults per mode, the theme diff,
// the generated code, the share-link encoding and the WCAG contrast check. No React in here.

export type ThemeMode = 'light' | 'dark';

/** A theme as plain nested string records, the shape every GridTheme section has. */
export type ThemeRecord = Record<string, unknown>;

/** 'toggle' switches a width path between its default and 0 (show / hide a divider). */
export type ControlKind ='color' | 'font' | 'weight' | 'length' | 'text' | 'toggle';

export interface ControlDef {
    id: string;
    label: string;
    kind: ControlKind;
    /** Theme paths the control writes, e.g. ['grid', 'headerText']. The first one is read. */
    paths: [string, string][];
    min?: number;
    max?: number;
}

export interface ControlGroup {
    id: string;
    title: string;
    controls: ControlDef[];
}

const c = (id: string, label: string, kind: ControlKind, path: string, extra: Partial<ControlDef> = {}): ControlDef => {
    const [section, key] = path.split('.');
    return { id, label, kind, paths: [[section, key]], ...extra };
};

export const CONTROL_GROUPS: ControlGroup[] = [
    {
        id: 'brand', title: 'Brand', controls: [
            c('primary', 'Primary colour', 'color', 'colors.primary'),
        ],
    },
    {
        id: 'colours', title: 'Colours', controls: [
            c('background', 'Grid background', 'color', 'grid.background'),
            c('rowText', 'Row text', 'color', 'grid.rowText'),
            c('rowAlternateBackground', 'Alternate row', 'color', 'grid.rowAlternateBackground'),
            c('rowHoverBackground', 'Row hover', 'color', 'grid.rowHoverBackground'),
            c('rowSelectedBackground', 'Selected row', 'color', 'grid.rowSelectedBackground'),
            c('cellFocusBorder', 'Focus ring', 'color', 'grid.cellFocusBorder'),
            c('rangeBackground', 'Range selection', 'color', 'grid.rangeBackground'),
            c('rangeBorder', 'Range outline', 'color', 'grid.rangeBorder'),
        ],
    },
    {
        id: 'header', title: 'Header cell', controls: [
            c('headerBackground', 'Background', 'color', 'grid.headerBackground'),
            c('headerText', 'Text', 'color', 'grid.headerText'),
            c('headerHoverBackground', 'Hover background', 'color', 'grid.headerHoverBackground'),
            c('headerSortedBackground', 'Sorted background', 'color', 'grid.headerSortedBackground'),
            c('headerFontFamily', 'Font', 'font', 'grid.headerFontFamily'),
            c('headerFontWeight', 'Weight', 'weight', 'grid.headerFontWeight'),
            c('headerFontSize', 'Size', 'length', 'grid.headerFontSize', { min: 10, max: 20 }),
        ],
    },
    {
        id: 'body', title: 'Body cell', controls: [
            c('cellFontFamily', 'Font', 'font', 'grid.cellFontFamily'),
            c('cellFontWeight', 'Weight', 'weight', 'grid.cellFontWeight'),
            c('cellFontSize', 'Size', 'length', 'grid.cellFontSize', { min: 10, max: 20 }),
        ],
    },
    {
        id: 'sizes', title: 'Sizes and spacing', controls: [
            c('rowHeightCompact', 'Row height (compact)', 'length', 'grid.rowHeightCompact', { min: 20, max: 60 }),
            c('rowHeightStandard', 'Row height (standard)', 'length', 'grid.rowHeightStandard', { min: 24, max: 96 }),
            c('rowHeightComfortable', 'Row height (comfortable)', 'length', 'grid.rowHeightComfortable', { min: 32, max: 120 }),
            c('headerHeight', 'Header height', 'length', 'grid.headerHeight', { min: 28, max: 96 }),
            c('cellPaddingX', 'Cell padding (horizontal)', 'length', 'grid.cellPaddingX', { min: 0, max: 32 }),
            c('cellPaddingY', 'Cell padding (vertical)', 'length', 'grid.cellPaddingY', { min: 0, max: 20 }),
            c('headerPaddingX', 'Header padding (horizontal)', 'length', 'grid.headerPaddingX', { min: 0, max: 32 }),
        ],
    },
    {
        id: 'borders', title: 'Borders and dividers', controls: [
            c('borderWidth', 'Outer border width', 'length', 'grid.borderWidth', { min: 0, max: 6 }),
            { id: 'borderColor', label: 'Border colour', kind: 'color', paths: [['grid', 'borderColor'], ['borders', 'color']] },
            c('borderRadius', 'Corner radius', 'length', 'grid.borderRadius', { min: 0, max: 24 }),
            c('showColumnDividers', 'Column dividers (body)', 'toggle', 'grid.columnDividerWidth'),
            c('showHeaderDividers', 'Column dividers (header)', 'toggle', 'grid.headerColumnDividerWidth'),
            c('showRowDividers', 'Row dividers', 'toggle', 'grid.rowDividerWidth'),
            c('columnDividerWidth', 'Column divider width', 'length', 'grid.columnDividerWidth', { min: 0, max: 4 }),
            c('headerColumnDividerWidth', 'Header divider width', 'length', 'grid.headerColumnDividerWidth', { min: 0, max: 4 }),
            c('rowDividerWidth', 'Row divider width', 'length', 'grid.rowDividerWidth', { min: 0, max: 4 }),
            c('columnDividerColor', 'Column divider colour', 'color', 'grid.columnDividerColor'),
            c('rowDividerColor', 'Row divider colour', 'color', 'grid.rowDividerColor'),
        ],
    },
    {
        id: 'buttons', title: 'Buttons', controls: [
            c('buttonBackground', 'Toolbar button', 'color', 'toolbar.buttonBackground'),
            c('buttonHoverBackground', 'Toolbar button hover', 'color', 'toolbar.buttonHoverBackground'),
            c('buttonText', 'Toolbar button text', 'color', 'toolbar.buttonText'),
            c('buttonPrimaryBackground', 'Primary button', 'color', 'toolbar.buttonPrimaryBackground'),
            c('buttonPrimaryText', 'Primary button text', 'color', 'toolbar.buttonPrimaryText'),
        ],
    },
    {
        id: 'overlays', title: 'Column menu and panels', controls: [
            c('overlayBackground', 'Background', 'color', 'overlays.background'),
            c('overlayText', 'Text', 'color', 'overlays.text'),
            c('overlayBorder', 'Border', 'color', 'overlays.border'),
            c('overlayShadow', 'Shadow', 'text', 'overlays.shadow'),
            c('itemHoverBackground', 'Item hover', 'color', 'overlays.itemHoverBackground'),
            c('itemSelectedBackground', 'Item selected', 'color', 'overlays.itemSelectedBackground'),
            c('overlayFontFamily', 'Font', 'font', 'overlays.fontFamily'),
            c('overlayFontWeight', 'Weight', 'weight', 'overlays.fontWeight'),
            c('overlayFontSize', 'Size', 'length', 'overlays.fontSize', { min: 10, max: 18 }),
        ],
    },
];

export const ALL_CONTROLS: ControlDef[] = CONTROL_GROUPS.flatMap(g => g.controls);

export const FONT_OPTIONS: { label: string; value: string }[] = [
    { label: 'Grid font (default)', value: '' },
    { label: 'System UI', value: 'system-ui, -apple-system, "Segoe UI", sans-serif' },
    { label: 'Inter', value: "'Inter', sans-serif" },
    { label: 'Roboto', value: 'Roboto, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Monospace', value: "ui-monospace, 'JetBrains Mono', Menlo, monospace" },
];

export const WEIGHT_OPTIONS = ['300', '400', '500', '600', '700', '800'];

// ── Reading and writing theme paths ────────────────────────────────────────────────────────────

export function readPath(theme: ThemeRecord, [section, key]: [string, string]): string | undefined {
    const s = theme[section];
    if (!s || typeof s !== 'object') return undefined;
    const v = (s as Record<string, unknown>)[key];
    return typeof v === 'string' ? v : undefined;
}

/** Returns a copy of `theme` with each path set to `value`, or removed when `value` is undefined. */
export function writePaths(theme: ThemeRecord, paths: [string, string][], value: string | undefined): ThemeRecord {
    const next: ThemeRecord = { ...theme };
    for (const [section, key] of paths) {
        const s = { ...((next[section] as Record<string, unknown> | undefined) ?? {}) };
        if (value === undefined) delete s[key];
        else s[key] = value;
        if (Object.keys(s).length === 0) delete next[section];
        else next[section] = s;
    }
    return next;
}

// ── Defaults (what the grid draws when a key is unset) ─────────────────────────────────────────

type Getter = (path: string) => string;

const DEFAULT_LIGHT: Record<string, string | ((get: Getter) => string)> = {
    'colors.primary': '#3b82f6',
    'grid.background': '#ffffff',
    'grid.borderColor': '#e2e8f0',
    'borders.color': '#e2e8f0',
    'grid.rowText': '#1e293b',
    'grid.rowAlternateBackground': 'transparent',
    'grid.rowHoverBackground': '#f8fafc',
    'grid.rowSelectedBackground': '#eff6ff',
    'grid.cellFocusBorder': get => get('colors.primary'),
    'grid.rangeBackground': get => `color-mix(in srgb, ${get('colors.primary')} 12%, transparent)`,
    'grid.rangeBorder': get => get('colors.primary'),
    'grid.headerBackground': '#f8fafc',
    'grid.headerText': '#334155',
    'grid.headerHoverBackground': '#f1f5f9',
    'grid.headerSortedBackground': '#f8fafc',
    'grid.headerFontFamily': '',
    'grid.headerFontWeight': '600',
    'grid.headerFontSize': '13px',
    'grid.cellFontFamily': '',
    'grid.cellFontWeight': '400',
    'grid.cellFontSize': '13px',
    'grid.rowHeightCompact': '32px',
    'grid.rowHeightStandard': '52px',
    'grid.rowHeightComfortable': '72px',
    'grid.headerHeight': '56px',
    'grid.cellPaddingX': '10px',
    'grid.cellPaddingY': '8px',
    'grid.headerPaddingX': get => get('grid.cellPaddingX'),
    'grid.borderWidth': '1px',
    'grid.borderRadius': '12px',
    'grid.columnDividerWidth': '1px',
    'grid.headerColumnDividerWidth': '1px',
    'grid.rowDividerWidth': '1px',
    'grid.columnDividerColor': get => get('grid.borderColor'),
    'grid.rowDividerColor': get => get('grid.borderColor'),
    'toolbar.buttonBackground': 'transparent',
    'toolbar.buttonHoverBackground': get => get('grid.headerHoverBackground'),
    'toolbar.buttonText': get => get('grid.headerText'),
    'toolbar.buttonPrimaryBackground': get => get('colors.primary'),
    'toolbar.buttonPrimaryText': '#ffffff',
    'overlays.background': '#ffffff',
    'overlays.text': '#1e293b',
    'overlays.border': '#e2e8f0',
    'overlays.shadow': '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)',
    'overlays.itemHoverBackground': '#f8fafc',
    'overlays.itemSelectedBackground': get => `color-mix(in srgb, ${get('colors.primary')} 8%, transparent)`,
    'overlays.fontFamily': '',
    'overlays.fontWeight': '400',
    'overlays.fontSize': '12px',
};

const DEFAULT_DARK: Record<string, string | ((get: Getter) => string)> = {
    ...DEFAULT_LIGHT,
    'colors.primary': '#60a5fa',
    'grid.background': '#0f172a',
    'grid.borderColor': '#334155',
    'borders.color': '#334155',
    'grid.rowText': '#cbd5e1',
    'grid.rowAlternateBackground': '#162032',
    'grid.rowHoverBackground': '#1e293b',
    'grid.rowSelectedBackground': '#1e3a5f',
    'grid.headerBackground': '#1e293b',
    'grid.headerText': '#e2e8f0',
    'grid.headerHoverBackground': '#334155',
    'grid.headerSortedBackground': '#1e3a5f',
    'overlays.background': '#1e293b',
    'overlays.text': '#cbd5e1',
    'overlays.border': '#334155',
    'overlays.shadow': '0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.2)',
    'overlays.itemHoverBackground': '#334155',
};

/** The value the grid uses for `path` under `theme`: the theme's own, else the default for its mode. */
export function effectiveValue(theme: ThemeRecord, path: string): string {
    const seen = new Set<string>();
    const get: Getter = (p) => {
        const [section, key] = p.split('.');
        const own = readPath(theme, [section, key]);
        if (own !== undefined) return own;
        if (seen.has(p)) return '';
        seen.add(p);
        const table = theme.mode === 'dark' ? DEFAULT_DARK : DEFAULT_LIGHT;
        const d = table[p];
        return typeof d === 'function' ? d(get) : d ?? '';
    };
    return get(path);
}

/** The value `path` takes when the theme leaves it unset (derived defaults follow the theme's other values). */
export function defaultValue(theme: ThemeRecord, path: string): string {
    const [section, key] = path.split('.');
    return effectiveValue(writePaths(theme, [[section, key]], undefined), path);
}

export const pathOf = (control: ControlDef) => control.paths[0].join('.');

export const isZeroWidth = (v: string) => /^0(px)?$/.test(v.trim());

// ── Presets ────────────────────────────────────────────────────────────────────────────────────

export const PRESETS: { id: string; label: string; theme: GridTheme }[] = [
    { id: 'default', label: 'Default', theme: {} },
    { id: 'dark', label: 'Dark', theme: darkTheme },
    { id: 'rose', label: 'Rose', theme: roseTheme },
    { id: 'emerald', label: 'Emerald', theme: emeraldTheme },
    { id: 'amber', label: 'Amber', theme: amberTheme },
    { id: 'compact', label: 'Compact', theme: compactTheme },
];

/** A preset loaded into the light or dark slot: its keys, with the slot's mode. */
export function presetForMode(preset: GridTheme, mode: ThemeMode): ThemeRecord {
    const copy = JSON.parse(JSON.stringify(preset)) as ThemeRecord;
    delete copy.mode;
    return mode === 'dark' ? { mode: 'dark', ...copy } : copy;
}

// ── Diff against the defaults, and code generation ─────────────────────────────────────────────

/** Drops every value equal to the default for its mode and every empty section. */
export function diffFromDefaults(theme: ThemeRecord): ThemeRecord {
    const out: ThemeRecord = {};
    for (const [section, value] of Object.entries(theme)) {
        if (section === 'mode') {
            if (value === 'dark') out.mode = 'dark';
            continue;
        }
        if (!value || typeof value !== 'object') continue;
        const kept: Record<string, unknown> = {};
        for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
            if (typeof v === 'string') {
                const path = `${section}.${key}`;
                const known = path in DEFAULT_LIGHT;
                if (known && normalise(v) === normalise(defaultValue(theme, path))) continue;
                kept[key] = v;
            } else if (v && typeof v === 'object') {
                kept[key] = v;
            }
        }
        if (Object.keys(kept).length > 0) out[section] = kept;
    }
    return out;
}

const normalise = (v: string) => v.trim().toLowerCase().replace(/\s+/g, ' ');

const IDENT = /^[A-Za-z_$][\w$]*$|^\d+$/;

/** Formats a value as a TypeScript literal: unquoted identifier keys, single-quoted strings. */
export function toTsLiteral(value: unknown, indent = 0): string {
    const pad = '  '.repeat(indent);
    if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    if (value && typeof value === 'object') {
        const entries = Object.entries(value as Record<string, unknown>);
        if (entries.length === 0) return '{}';
        const lines = entries.map(([k, v]) => `${pad}  ${IDENT.test(k) ? k : `'${k}'`}: ${toTsLiteral(v, indent + 1)},`);
        return `{\n${lines.join('\n')}\n${pad}}`;
    }
    return String(value);
}

export type CodeTarget = 'light' | 'dark' | 'both';

export function themeCode(themes: Record<ThemeMode, ThemeRecord>, target: CodeTarget): string {
    const parts = ["import type { GridTheme } from '@opencorestack/opengridx';", ''];
    if (target !== 'dark') parts.push(`export const myTheme: GridTheme = ${toTsLiteral(diffFromDefaults(themes.light))};`);
    if (target === 'both') parts.push('');
    if (target !== 'light') parts.push(`export const myDarkTheme: GridTheme = ${toTsLiteral(diffFromDefaults({ ...themes.dark, mode: 'dark' }))};`);
    return `${parts.join('\n')}\n`;
}

// ── Share link (#theme=…) ──────────────────────────────────────────────────────────────────────

export interface SharedState {
    light: ThemeRecord;
    dark: ThemeRecord;
    mode: ThemeMode;
}

const toBase64Url = (text: string) => {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (text: string) => {
    const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
    return new TextDecoder().decode(Uint8Array.from(binary, ch => ch.charCodeAt(0)));
};

export function encodeShare(state: SharedState): string {
    return `theme=${toBase64Url(JSON.stringify({
        l: diffFromDefaults(state.light),
        d: diffFromDefaults({ ...state.dark, mode: 'dark' }),
        m: state.mode,
    }))}`;
}

/** Keeps only string values in (at most two levels of) nested plain objects. */
export function sanitizeTheme(value: unknown, depth = 0): ThemeRecord {
    const out: ThemeRecord = {};
    if (!value || typeof value !== 'object' || Array.isArray(value)) return out;
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (typeof v === 'string') out[k] = v;
        else if (depth < 2 && v && typeof v === 'object' && !Array.isArray(v)) out[k] = sanitizeTheme(v, depth + 1);
    }
    return out;
}

export function decodeShare(hash: string): SharedState | null {
    const match = /(?:^#?|&)theme=([A-Za-z0-9_-]+)/.exec(hash);
    if (!match) return null;
    try {
        const parsed = JSON.parse(fromBase64Url(match[1])) as { l?: unknown; d?: unknown; m?: unknown };
        const light = sanitizeTheme(parsed.l);
        delete light.mode;
        return {
            light,
            dark: { ...sanitizeTheme(parsed.d), mode: 'dark' },
            mode: parsed.m === 'dark' ? 'dark' : 'light',
        };
    } catch {
        return null;
    }
}

// ── Colours and WCAG contrast ──────────────────────────────────────────────────────────────────

export interface Rgba { r: number; g: number; b: number; a: number }

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Parses #rgb, #rrggbb, #rrggbbaa, rgb()/rgba(), 'transparent' and
 * `color-mix(in srgb, <colour> N%, transparent)`. Other syntaxes return null.
 */
export function parseColor(input: string): Rgba | null {
    const v = input.trim().toLowerCase();
    if (v === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
    const hex = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(v);
    if (hex) {
        let h = hex[1];
        if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
        return {
            r: parseInt(h.slice(0, 2), 16),
            g: parseInt(h.slice(2, 4), 16),
            b: parseInt(h.slice(4, 6), 16),
            a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
        };
    }
    const rgb = /^rgba?\(([^)]*)\)$/.exec(v);
    if (rgb) {
        const nums = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number);
        if (nums.length < 3 || nums.some(Number.isNaN)) return null;
        return { r: clamp(nums[0], 0, 255), g: clamp(nums[1], 0, 255), b: clamp(nums[2], 0, 255), a: nums.length > 3 ? clamp(nums[3], 0, 1) : 1 };
    }
    const mix = /^color-mix\(in srgb,\s*(.+?)\s+(\d+(?:\.\d+)?)%,\s*transparent\s*\)$/.exec(v);
    if (mix) {
        const base = parseColor(mix[1]);
        return base ? { ...base, a: base.a * Number(mix[2]) / 100 } : null;
    }
    return null;
}

export const isValidColor = (input: string) => parseColor(input) !== null;

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, '0');

/** #rrggbb for the colour picker (alpha dropped); null when the value can't be parsed. */
export function toHex6(input: string): string | null {
    const c = parseColor(input);
    return c ? `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}` : null;
}

/** `top` drawn over the opaque `bottom`. */
function over(top: Rgba, bottom: Rgba): Rgba {
    const a = top.a;
    return { r: top.r * a + bottom.r * (1 - a), g: top.g * a + bottom.g * (1 - a), b: top.b * a + bottom.b * (1 - a), a: 1 };
}

function luminance({ r, g, b }: Rgba): number {
    const ch = (x: number) => {
        const s = x / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

/**
 * WCAG contrast ratio of `text` on `background`; a translucent background is drawn over `base`
 * (the grid background) first. Null when a colour can't be parsed.
 */
export function contrastRatio(text: string, background: string, base = '#ffffff'): number | null {
    const t = parseColor(text);
    const bg = parseColor(background);
    const b = parseColor(base);
    if (!t || !bg || !b) return null;
    const ground = over(bg, over(b, { r: 255, g: 255, b: 255, a: 1 }));
    const fg = over(t, ground);
    const [hi, lo] = [luminance(fg), luminance(ground)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

export interface ContrastPair {
    label: string;
    text: string;
    background: string;
}

/** Text/background pairs checked against WCAG AA (4.5:1 for normal text). */
export const CONTRAST_PAIRS: ContrastPair[] = [
    { label: 'Header text on header', text: 'grid.headerText', background: 'grid.headerBackground' },
    { label: 'Row text on grid', text: 'grid.rowText', background: 'grid.background' },
    { label: 'Row text on alternate row', text: 'grid.rowText', background: 'grid.rowAlternateBackground' },
    { label: 'Row text on selected row', text: 'grid.rowText', background: 'grid.rowSelectedBackground' },
    { label: 'Primary button text', text: 'toolbar.buttonPrimaryText', background: 'toolbar.buttonPrimaryBackground' },
    { label: 'Toolbar button text', text: 'toolbar.buttonText', background: 'grid.headerBackground' },
    { label: 'Menu text on menu', text: 'overlays.text', background: 'overlays.background' },
];

/** Contrast checks shown next to a control: those whose text or background is that control's path. */
export const pairsFor = (path: string) => CONTRAST_PAIRS.filter(p => p.text === path || p.background === path);

export const AA_NORMAL = 4.5;
