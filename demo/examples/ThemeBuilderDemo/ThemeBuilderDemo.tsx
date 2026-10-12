import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, DataGrid, DataGridThemeProvider, GridToolbar } from '@opencorestack/opengridx';
import type { GridColDef, GridRowSelectionModel, GridTheme } from '@opencorestack/opengridx';
import { DocsLayout } from '../../components/DocsLayout';
import { ContrastBadge, ControlSection } from './ThemeControls';
import {
    CONTROL_GROUPS,
    CONTRAST_PAIRS,
    PRESETS,
    decodeShare,
    encodeShare,
    presetForMode,
    sanitizeTheme,
    themeCode,
    writePaths,
    type CodeTarget,
    type ControlDef,
    type SharedState,
    type ThemeMode,
    type ThemeRecord,
} from './themeBuilderModel';
import './ThemeBuilderDemo.css';

import sourceCode from './ThemeBuilderDemo.tsx?raw';

interface Employee {
    id: number;
    name: string;
    department: string;
    role: string;
    city: string;
    salary: number;
    startDate: string;
}

const NAMES = ['Ava Patel', 'Noah Kim', 'Mia Rossi', 'Liam Chen', 'Zoe Martin', 'Omar Haddad', 'Ella Novak', 'Lucas Silva', 'Ivy Brooks', 'Ethan Wright', 'Sofia Lopez', 'Leo Fischer'];
const DEPARTMENTS = ['Engineering', 'Sales', 'Finance'];
const ROLES = ['Analyst', 'Engineer', 'Manager', 'Designer'];
const CITIES = ['Berlin', 'Austin', 'Lisbon', 'Toronto', 'Pune', 'Osaka'];

const ROWS: Employee[] = Array.from({ length: 36 }, (_, i) => ({
    id: i + 1,
    name: NAMES[i % NAMES.length],
    department: DEPARTMENTS[i % DEPARTMENTS.length],
    role: ROLES[(i * 7) % ROLES.length],
    city: CITIES[(i * 5) % CITIES.length],
    salary: 52000 + ((i * 7919) % 61) * 1000,
    startDate: `20${String(15 + (i % 10)).padStart(2, '0')}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
}));

const COLUMNS: GridColDef<Employee>[] = [
    { field: 'name', headerName: 'Name', width: 160 },
    { field: 'department', headerName: 'Department', width: 140 },
    { field: 'role', headerName: 'Role', width: 120 },
    { field: 'city', headerName: 'City', width: 120 },
    {
        field: 'salary', headerName: 'Salary', type: 'number', width: 120,
        valueFormatter: ({ value }) => typeof value === 'number' ? `$${value.toLocaleString('en-US')}` : '',
    },
    { field: 'startDate', headerName: 'Start date', width: 120 },
];

const PINNED = { left: ['name'] };
const GROUPING = ['department'];
const GROUPING_COL = { headerName: 'Department', width: 170 };
// The grouping column shows the department, so its own column is hidden while grouped.
const HIDE_DEPARTMENT = { department: false };
const SHOW_ALL = {};

const INITIAL: SharedState = { light: {}, dark: { mode: 'dark' }, mode: 'light' };

function readHash(): SharedState {
    if (typeof window === 'undefined') return INITIAL;
    return decodeShare(window.location.hash) ?? INITIAL;
}

async function copyText(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // Fall through to the selection-based copy below.
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
        ok = document.execCommand('copy');
    } catch {
        ok = false;
    }
    area.remove();
    return ok;
}

function downloadText(fileName: string, text: string) {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/typescript' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** The whole theme of the edited mode as JSON; remounted (by key) when the theme changes elsewhere. */
function JsonEditor({ theme, onApply }: { theme: ThemeRecord; onApply: (next: ThemeRecord) => void }) {
    const [draft, setDraft] = useState(() => JSON.stringify(theme, null, 2));
    const [error, setError] = useState<string | null>(null);
    const apply = () => {
        try {
            const parsed: unknown = JSON.parse(draft);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('The theme must be a JSON object.');
            setError(null);
            onApply(sanitizeTheme(parsed));
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Invalid JSON');
        }
    };
    return (
        <div className="tb-json">
            <textarea
                className="tb-json__area"
                spellCheck={false}
                value={draft}
                aria-label="Theme JSON"
                aria-invalid={error !== null || undefined}
                onChange={(e) => setDraft(e.target.value)}
            />
            <div className="tb-json__actions">
                <Button variant="contained" color="primary" size="small" onClick={apply}>Apply JSON</Button>
                {error && <span className="tb-json__error" role="alert">{error}</span>}
            </div>
        </div>
    );
}

const contrastFor = (path: string) => CONTRAST_PAIRS.filter(p => p.text === path);

export default function ThemeBuilderDemo() {
    const [state, setState] = useState<SharedState>(readHash);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [target, setTarget] = useState<CodeTarget>('both');
    const [status, setStatus] = useState('');
    const [density, setDensity] = useState<'compact' | 'standard' | 'comfortable'>('standard');
    const [grouped, setGrouped] = useState(true);
    const [selection, setSelection] = useState<GridRowSelectionModel>([4]);
    const previewRef = useRef<HTMLDivElement>(null);

    const { mode } = state;
    const theme = state[mode];
    const code = themeCode(state, target);

    const setTheme = (next: ThemeRecord) => setState(s => ({ ...s, [s.mode]: s.mode === 'dark' ? { ...next, mode: 'dark' } : withoutMode(next) }));
    const onControlChange = (control: ControlDef, value: string | undefined) => setTheme(writePaths(theme, control.paths, value));

    const flash = (message: string) => setStatus(message);

    const copy = async () => {
        flash(await copyText(code) ? 'Theme code copied.' : 'Copy failed: select the code below and copy it.');
    };
    const download = () => {
        downloadText(target === 'dark' ? 'my-dark-theme.ts' : 'my-theme.ts', code);
        flash('Theme file downloaded.');
    };
    const share = async () => {
        const hash = encodeShare(state);
        const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${hash}`;
        window.history.replaceState(window.history.state, '', `#${hash}`);
        flash(await copyText(url) ? 'Share link copied; the address bar holds it too.' : 'The address bar now holds the share link.');
    };
    const loadPreset = (presetTheme: GridTheme, id: string) => {
        const slot: ThemeMode = id === 'dark' ? 'dark' : mode;
        setState(s => ({ ...s, mode: slot, [slot]: presetForMode(presetTheme, slot) }));
        flash(`Loaded the ${id} preset into the ${slot} theme.`);
    };
    const resetMode = () => {
        setState(s => ({ ...s, [s.mode]: s.mode === 'dark' ? { mode: 'dark' } : {} }));
        flash(`Reset the ${mode} theme.`);
    };
    const openColumnMenu = () => {
        const button = previewRef.current?.querySelector<HTMLElement>('.ogx__header-cell[data-field="role"] .ogx__menu-icon-btn')
            ?? previewRef.current?.querySelector<HTMLElement>('.ogx__menu-icon-btn');
        button?.click();
    };

    const controls = (
        <div className="tb-controls__inner">
            <div className="tb-controls__top">
                <span className="tb-controls__title">Editing the {mode} theme</span>
                <Button size="small" variant="outlined" onClick={resetMode}>Reset all</Button>
            </div>
            {CONTROL_GROUPS.map((group, i) => (
                <ControlSection
                    key={group.id}
                    group={group}
                    theme={theme}
                    onChange={onControlChange}
                    contrastFor={contrastFor}
                    defaultOpen={i < 3}
                />
            ))}
            <details className="tb-group">
                <summary className="tb-group__summary"><span>Advanced (JSON)</span></summary>
                <div className="tb-group__body">
                    <p className="tb-hint">Every <code>GridTheme</code> key of the {mode} theme, including those without a control above.</p>
                    <JsonEditor key={`${mode}:${JSON.stringify(theme)}`} theme={theme} onApply={setTheme} />
                </div>
            </details>
        </div>
    );

    return (
        <DocsLayout
            title="Theme Builder"
            description={<>Restyle a live grid with controls, for light and dark mode separately, and copy the result as a ready-to-paste <code>GridTheme</code>. Only values that differ from the defaults are written. See also the <Link to="/theming">Theming</Link> page and <code>docs/customization/theming.md</code>.</>}
            sourceCode={sourceCode}
        >
            <div className={`tb${drawerOpen ? ' tb--drawer-open' : ''}`}>
                <div className="tb__bar">
                    <div className="tb-segment" role="group" aria-label="Theme being edited">
                        {(['light', 'dark'] as const).map(m => (
                            <button
                                key={m}
                                type="button"
                                className={`tb-segment__btn${mode === m ? ' tb-segment__btn--on' : ''}`}
                                aria-pressed={mode === m}
                                onClick={() => setState(s => ({ ...s, mode: m }))}
                            >
                                {m === 'light' ? 'Light' : 'Dark'}
                            </button>
                        ))}
                    </div>
                    <div className="tb-presets" role="group" aria-label="Start from a preset">
                        <span className="tb-presets__label">Start from</span>
                        {PRESETS.map(p => (
                            <Button key={p.id} size="small" variant="outlined" aria-label={`Start from the ${p.label} preset`} onClick={() => loadPreset(p.theme, p.id)}>{p.label}</Button>
                        ))}
                    </div>
                    <Button className="tb-drawer-toggle" size="small" variant="contained" color="primary" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(o => !o)}>
                        {drawerOpen ? 'Close controls' : 'Controls'}
                    </Button>
                </div>

                <div className="tb__layout">
                    <aside className="tb-controls" aria-label="Theme controls">
                        <div className="tb-controls__drawer-head">
                            <span>Theme controls</span>
                            <Button size="small" onClick={() => setDrawerOpen(false)}>Close</Button>
                        </div>
                        {controls}
                    </aside>
                    {drawerOpen && <div className="tb-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true" />}

                    <section className="tb-main" aria-label="Preview and output">
                        <div className="tb-preview__bar">
                            <label className="tb-inline">
                                Density
                                <select className="tb-select" value={density} onChange={(e) => setDensity(e.target.value as typeof density)}>
                                    <option value="compact">Compact</option>
                                    <option value="standard">Standard</option>
                                    <option value="comfortable">Comfortable</option>
                                </select>
                            </label>
                            <label className="tb-inline">
                                <input type="checkbox" checked={grouped} onChange={(e) => setGrouped(e.target.checked)} />
                                Group by department
                            </label>
                            <Button size="small" variant="outlined" onClick={openColumnMenu}>Show the column menu</Button>
                        </div>
                        <div ref={previewRef} className={`tb-preview tb-preview--${mode}`}>
                            <DataGridThemeProvider theme={theme as GridTheme}>
                                <DataGrid
                                    rows={ROWS}
                                    columns={COLUMNS}
                                    height={480}
                                    density={density}
                                    checkboxSelection
                                    rowSelectionModel={selection}
                                    onRowSelectionModelChange={setSelection}
                                    pinnedColumns={PINNED}
                                    columnVisibilityModel={grouped ? HIDE_DEPARTMENT : SHOW_ALL}
                                    rowGroupingModel={grouped ? GROUPING : []}
                                    groupingColDef={GROUPING_COL}
                                    defaultGroupingExpansionDepth={1}
                                    slots={{ toolbar: GridToolbar }}
                                />
                            </DataGridThemeProvider>
                        </div>

                        <div className="tb-output">
                            <div className="tb-output__actions">
                                <label className="tb-inline">
                                    Export
                                    <select className="tb-select" value={target} onChange={(e) => setTarget(e.target.value as CodeTarget)}>
                                        <option value="light">Light theme</option>
                                        <option value="dark">Dark theme</option>
                                        <option value="both">Both</option>
                                    </select>
                                </label>
                                <Button size="small" variant="contained" color="primary" onClick={copy}>Copy theme</Button>
                                <Button size="small" variant="outlined" onClick={download}>Download .ts</Button>
                                <Button size="small" variant="outlined" onClick={share}>Share via URL</Button>
                                <span className="tb-status" role="status" aria-live="polite">{status}</span>
                            </div>
                            <div className="tb-contrast-list" aria-label="Contrast checks">
                                <span className="tb-contrast-list__title">Contrast (WCAG AA, {mode})</span>
                                {CONTRAST_PAIRS.map(pair => <ContrastBadge key={pair.label} pair={pair} theme={theme} />)}
                            </div>
                            <pre className="tb-code" aria-label="Generated theme code"><code>{code}</code></pre>
                        </div>
                    </section>
                </div>
            </div>
        </DocsLayout>
    );
}

function withoutMode(theme: ThemeRecord): ThemeRecord {
    const copy = { ...theme };
    delete copy.mode;
    return copy;
}
