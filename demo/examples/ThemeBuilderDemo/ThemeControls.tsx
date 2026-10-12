import { useId, useState } from 'react';
import { Button, Checkbox, Input } from '@opencorestack/opengridx';
import {
    AA_NORMAL,
    FONT_OPTIONS,
    WEIGHT_OPTIONS,
    contrastRatio,
    defaultValue,
    effectiveValue,
    isValidColor,
    isZeroWidth,
    pathOf,
    readPath,
    toHex6,
    type ControlDef,
    type ControlGroup,
    type ContrastPair,
    type ThemeRecord,
} from './themeBuilderModel';

type OnChange = (control: ControlDef, value: string | undefined) => void;

interface ControlProps {
    control: ControlDef;
    theme: ThemeRecord;
    onChange: OnChange;
}

/** A text field that keeps what is typed until it is valid; invalid text is shown but not applied. */
function DraftField({ id, value, valid, onCommit, placeholder, ariaLabel }: {
    id?: string;
    value: string;
    valid: (v: string) => boolean;
    onCommit: (v: string) => void;
    placeholder?: string;
    ariaLabel: string;
}) {
    const [draft, setDraft] = useState<string | null>(null);
    const shown = draft ?? value;
    const invalid = draft !== null && !valid(draft);
    return (
        <Input
            id={id}
            className="tb-field__text"
            value={shown}
            error={invalid}
            placeholder={placeholder}
            aria-label={ariaLabel}
            aria-invalid={invalid || undefined}
            onChange={(e) => {
                const v = e.target.value;
                setDraft(v);
                if (valid(v)) onCommit(v.trim());
            }}
            onBlur={() => setDraft(null)}
            onKeyDown={(e) => { if (e.key === 'Enter') setDraft(null); }}
        />
    );
}

function ColorInput({ control, theme, onChange }: ControlProps) {
    const value = effectiveValue(theme, pathOf(control));
    const id = useId();
    return (
        <div className="tb-field__row">
            <input
                id={id}
                type="color"
                className="tb-swatch"
                value={toHex6(value) ?? '#000000'}
                aria-label={`${control.label} colour picker`}
                onChange={(e) => onChange(control, e.target.value)}
            />
            <DraftField value={value} valid={isValidColor} onCommit={(v) => onChange(control, v)} ariaLabel={`${control.label} value`} />
        </div>
    );
}

const CUSTOM = '__custom__';

function FontInput({ control, theme, onChange }: ControlProps) {
    const value = readPath(theme, control.paths[0]) ?? '';
    const known = FONT_OPTIONS.some(o => o.value === value);
    const [customChosen, setCustomChosen] = useState(false);
    const isCustom = customChosen || !known;
    return (
        <div className="tb-field__stack">
            <select
                className="tb-select"
                aria-label={`${control.label} family`}
                value={isCustom ? CUSTOM : value}
                onChange={(e) => {
                    if (e.target.value === CUSTOM) {
                        setCustomChosen(true);
                        return;
                    }
                    setCustomChosen(false);
                    onChange(control, e.target.value || undefined);
                }}
            >
                {FONT_OPTIONS.map(o => <option key={o.label} value={o.value}>{o.label}</option>)}
                <option value={CUSTOM}>Custom…</option>
            </select>
            {isCustom && (
                <DraftField
                    value={value}
                    valid={(v) => v.trim().length > 0}
                    placeholder="e.g. 'Source Sans 3', sans-serif"
                    onCommit={(v) => onChange(control, v)}
                    ariaLabel={`${control.label} custom family`}
                />
            )}
        </div>
    );
}

function WeightInput({ control, theme, onChange }: ControlProps) {
    const own = readPath(theme, control.paths[0]);
    const fallback = defaultValue(theme, pathOf(control));
    return (
        <select
            className="tb-select"
            aria-label={control.label}
            value={own ?? ''}
            onChange={(e) => onChange(control, e.target.value || undefined)}
        >
            <option value="">Default ({fallback})</option>
            {WEIGHT_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
    );
}

function LengthInput({ control, theme, onChange }: ControlProps) {
    const value = effectiveValue(theme, pathOf(control));
    const n = Number.parseFloat(value);
    const id = useId();
    return (
        <div className="tb-field__row">
            <input
                id={id}
                type="range"
                className="tb-range"
                min={control.min ?? 0}
                max={control.max ?? 40}
                step={1}
                value={Number.isFinite(n) ? n : 0}
                aria-label={control.label}
                onChange={(e) => onChange(control, `${e.target.value}px`)}
            />
            <output htmlFor={id} className="tb-range__value">{Number.isFinite(n) ? `${n}px` : value}</output>
        </div>
    );
}

function TextInput({ control, theme, onChange }: ControlProps) {
    return (
        <DraftField
            value={effectiveValue(theme, pathOf(control))}
            valid={(v) => v.trim().length > 0}
            onCommit={(v) => onChange(control, v)}
            ariaLabel={control.label}
        />
    );
}

export function ContrastBadge({ pair, theme }: { pair: ContrastPair; theme: ThemeRecord }) {
    const ratio = contrastRatio(
        effectiveValue(theme, pair.text),
        effectiveValue(theme, pair.background),
        effectiveValue(theme, 'grid.background'),
    );
    if (ratio === null) return <span className="tb-contrast tb-contrast--unknown">{pair.label}: not checked</span>;
    const ok = ratio >= AA_NORMAL;
    return (
        <span className={`tb-contrast ${ok ? 'tb-contrast--ok' : 'tb-contrast--warn'}`} title={ok ? 'Meets WCAG AA for normal text' : 'Below WCAG AA (4.5:1) for normal text'}>
            {ok ? '✓' : '⚠'} {pair.label}: {ratio.toFixed(2)}:1{ok ? ' AA' : ' (below AA)'}
        </span>
    );
}

export function ThemeControl({ control, theme, onChange, contrast }: ControlProps & { contrast: ContrastPair[] }) {
    const own = readPath(theme, control.paths[0]);
    const overridden = own !== undefined;

    if (control.kind === 'toggle') {
        const shown = !isZeroWidth(effectiveValue(theme, pathOf(control)));
        return (
            <div className="tb-field tb-field--toggle">
                <Checkbox
                    label={`Show ${control.label.toLowerCase()}`}
                    checked={shown}
                    onChange={(e) => onChange(control, e.target.checked ? undefined : '0')}
                />
            </div>
        );
    }

    return (
        <div className={`tb-field${overridden ? ' tb-field--changed' : ''}`}>
            <div className="tb-field__head">
                <span className="tb-field__label">{control.label}</span>
                <Button
                    size="small"
                    className="tb-reset"
                    disabled={!overridden}
                    aria-label={`Reset ${control.label} to its default`}
                    title="Reset to default"
                    onClick={() => onChange(control, undefined)}
                >
                    Reset
                </Button>
            </div>
            {control.kind === 'color' && <ColorInput control={control} theme={theme} onChange={onChange} />}
            {control.kind === 'font' && <FontInput control={control} theme={theme} onChange={onChange} />}
            {control.kind === 'weight' && <WeightInput control={control} theme={theme} onChange={onChange} />}
            {control.kind === 'length' && <LengthInput control={control} theme={theme} onChange={onChange} />}
            {control.kind === 'text' && <TextInput control={control} theme={theme} onChange={onChange} />}
            {contrast.map(pair => <ContrastBadge key={pair.label} pair={pair} theme={theme} />)}
        </div>
    );
}

export function ControlSection({ group, theme, onChange, contrastFor, defaultOpen }: {
    group: ControlGroup;
    theme: ThemeRecord;
    onChange: OnChange;
    contrastFor: (path: string) => ContrastPair[];
    defaultOpen: boolean;
}) {
    const changed = group.controls.filter(ctl => readPath(theme, ctl.paths[0]) !== undefined).length;
    return (
        <details className="tb-group" open={defaultOpen}>
            <summary className="tb-group__summary">
                <span>{group.title}</span>
                {changed > 0 && <span className="tb-group__count" aria-label={`${changed} changed`}>{changed}</span>}
            </summary>
            <div className="tb-group__body">
                {group.controls.map(ctl => (
                    <ThemeControl key={ctl.id} control={ctl} theme={theme} onChange={onChange} contrast={contrastFor(pathOf(ctl))} />
                ))}
            </div>
        </details>
    );
}
