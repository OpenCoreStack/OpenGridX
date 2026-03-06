# OpenGridX Theming Guide

OpenGridX ships with a complete design-token system built on CSS custom properties (`--ogx-*`). You can theme the grid in two ways:

1. **`DataGridThemeProvider`** — the recommended React API (maps a typed `GridTheme` object → CSS variables)
2. **Raw CSS override** — set any `--ogx-*` variable yourself on a wrapper element or `:root`

---

## Quick Start — `DataGridThemeProvider`

```tsx
import { DataGrid, DataGridThemeProvider } from '@opencorestack/opengridx';

const myTheme = {
  colors: {
    primary: '#7c3aed',
    primaryDark: '#5b21b6',
    primaryLight: '#ede9fe',
  },
  grid: {
    background: '#fff',
    headerBackground: '#f5f3ff',
    rowHoverBackground: '#faf5ff',
    rowSelectedBackground: '#ede9fe',
    cellFocusBorder: '#7c3aed',
  },
};

export default function App() {
  return (
    <DataGridThemeProvider theme={myTheme}>
      <DataGrid rows={rows} columns={columns} />
    </DataGridThemeProvider>
  );
}
```

The `DataGridThemeProvider` resolves each key in the `GridTheme` object to its corresponding `--ogx-*` CSS variable and applies it as an inline style on a wrapper `div`. **No CSS-in-JS, no runtime overhead.**

---

## Dark Mode

The grid automatically switches to its dark palette via `@media (prefers-color-scheme: dark)`. If your app manages dark mode manually (e.g. via a `data-theme` attribute), override the dark tokens with:

```css
[data-theme="dark"] {
  --ogx-grid-background: #0f172a;
  --ogx-grid-header-background: #1e293b;
  --ogx-grid-row-text: #cbd5e1;
  --ogx-grid-border-color: #334155;
  /* … etc */
}
```

---

## `GridTheme` Interface Reference

```ts
interface GridTheme {
  colors?:      GridThemeColors;
  typography?:  GridThemeTypography;
  spacing?:     GridThemeSpacing;
  borders?:     GridThemeBorders;
  shadows?:     GridThemeShadows;
  grid?:        GridThemeGrid;
  toolbar?:     GridThemeToolbar;
  overlays?:    GridThemeOverlays;
  scrollbar?:   GridThemeScrollbar;
  skeleton?:    GridThemeSkeleton;
  transitions?: GridThemeTransitions;
}
```

---

## All CSS Tokens

### Colors

| Token | Default (light) | Dark override | Description |
|---|---|---|---|
| `--ogx-color-primary` | `#3b82f6` | `#60a5fa` | Brand / accent color |
| `--ogx-color-primary-dark` | `#2563eb` | `#3b82f6` | Hover / pressed primary |
| `--ogx-color-primary-light` | `#eff6ff` | `#1e3a5f` | Tinted backgrounds |
| `--ogx-color-primary-focus` | `rgba(59,130,246,0.5)` | `rgba(96,165,250,0.4)` | Focus ring color |
| `--ogx-color-secondary` | `#8b5cf6` | — | Secondary accent |
| `--ogx-color-secondary-dark` | `#7c3aed` | — | Hover secondary |
| `--ogx-color-secondary-light` | `#f5f3ff` | — | Tinted secondary backgrounds |
| `--ogx-color-success` | `#10b981` | — | Positive indicators |
| `--ogx-color-warning` | `#f59e0b` | — | Warning indicators |
| `--ogx-color-error` | `#ef4444` | — | Error / destructive |
| `--ogx-color-info` | `#0ea5e9` | — | Informational |
| `--ogx-color-white` | `#ffffff` | `#0f172a` | Pure white (inverted in dark) |
| `--ogx-color-black` | `#0f172a` | `#f8fafc` | Pure black (inverted in dark) |
| `--ogx-color-gray-50` | `#f8fafc` | `#1e293b` | Lightest gray |
| `--ogx-color-gray-100` | `#f1f5f9` | `#334155` | |
| `--ogx-color-gray-200` | `#e2e8f0` | `#475569` | Default borders |
| `--ogx-color-gray-300` | `#cbd5e1` | `#64748b` | |
| `--ogx-color-gray-400` | `#94a3b8` | `#94a3b8` | Muted text |
| `--ogx-color-gray-500` | `#64748b` | `#cbd5e1` | |
| `--ogx-color-gray-600` | `#475569` | `#e2e8f0` | |
| `--ogx-color-gray-700` | `#334155` | `#e2e8f0` | Header text default |
| `--ogx-color-gray-800` | `#1e293b` | `#f1f5f9` | Body text default |
| `--ogx-color-gray-900` | `#0f172a` | `#f8fafc` | Darkest gray |

### Typography

| Token | Default | Description |
|---|---|---|
| `--ogx-font-family` | `'Inter', system-ui, sans-serif` | Primary UI font |
| `--ogx-font-family-mono` | `'JetBrains Mono', 'Fira Code', monospace` | Monospace (code cells, IDs) |
| `--ogx-font-size-xs` | `0.75rem` (12px) | Extra-small |
| `--ogx-font-size-sm` | `0.875rem` (14px) | Small |
| `--ogx-font-size-md` | `1rem` (16px) | Medium |
| `--ogx-font-size-lg` | `1.125rem` (18px) | Large |
| `--ogx-font-size-xl` | `1.25rem` (20px) | Extra-large |
| `--ogx-font-weight-light` | `300` | |
| `--ogx-font-weight-regular` | `400` | |
| `--ogx-font-weight-medium` | `500` | |
| `--ogx-font-weight-semibold` | `600` | |
| `--ogx-font-weight-bold` | `700` | |
| `--ogx-line-height-tight` | `1.2` | |
| `--ogx-line-height-normal` | `1.5` | |
| `--ogx-line-height-relaxed` | `1.75` | |

### Spacing

| Token | Default | Description |
|---|---|---|
| `--ogx-spacing-xs` | `0.25rem` (4px) | |
| `--ogx-spacing-sm` | `0.5rem` (8px) | |
| `--ogx-spacing-md` | `1rem` (16px) | |
| `--ogx-spacing-lg` | `1.5rem` (24px) | |
| `--ogx-spacing-xl` | `2rem` (32px) | |
| `--ogx-spacing-xxl` | `3rem` (48px) | |

### Borders

| Token | Default | Description |
|---|---|---|
| `--ogx-border-width-thin` | `1px` | |
| `--ogx-border-width-medium` | `2px` | |
| `--ogx-border-width-thick` | `3px` | |
| `--ogx-border-radius-sm` | `4px` | |
| `--ogx-border-radius-md` | `8px` | |
| `--ogx-border-radius-lg` | `12px` | |
| `--ogx-border-radius-xl` | `16px` | |
| `--ogx-border-radius-round` | `50%` | Circular |
| `--ogx-border-color` | `var(--ogx-color-gray-200)` | Default border color |
| `--ogx-border-color-hover` | `var(--ogx-color-gray-300)` | Border on hover |

### Shadows

| Token | Default | Description |
|---|---|---|
| `--ogx-shadow-sm` | `0 1px 2px rgba(0,0,0,.05)` | Subtle lift |
| `--ogx-shadow-md` | `0 4px 6px -1px ...` | Card-level |
| `--ogx-shadow-lg` | `0 10px 15px -3px ...` | Overlay |
| `--ogx-shadow-xl` | `0 20px 25px -5px ...` | Modal |

### Grid Layout

| Token | Default | Description |
|---|---|---|
| `--ogx-row-height` | `52px` | Default row height |
| `--ogx-header-height` | `56px` | Column header row height |
| `--ogx-grid-row-height-compact` | `32px` | Compact density preset |
| `--ogx-grid-row-height-standard` | `52px` | Standard density preset |
| `--ogx-grid-row-height-comfortable` | `72px` | Comfortable density preset |
| `--ogx-grid-header-height` | `56px` | Header height (grid-specific) |
| `--ogx-grid-cell-padding-x` | `10px` | Horizontal cell padding |
| `--ogx-grid-cell-padding-y` | `8px` | Vertical cell padding |
| `--ogx-grid-cell-font-size` | `13px` | Body cell font size |
| `--ogx-grid-header-font-size` | `13px` | Header cell font size |
| `--ogx-grid-line-height` | `var(--ogx-line-height-normal)` | Row line height |

### Grid Colors

| Token | Default (light) | Dark override | Description |
|---|---|---|---|
| `--ogx-grid-background` | `#ffffff` | `#0f172a` | Grid body background |
| `--ogx-grid-border-color` | `#e2e8f0` | `#334155` | Cell border lines |
| `--ogx-grid-header-background` | `#f8fafc` | `#1e293b` | Header row background |
| `--ogx-grid-header-text` | `#334155` | `#e2e8f0` | Header label color |
| `--ogx-grid-header-hover-background` | `#f1f5f9` | `#334155` | Header hover state |
| `--ogx-grid-header-sorted-background` | `#f8fafc` | `#1e3a5f` | Sorted column header tint |
| `--ogx-grid-row-text` | `#1e293b` | `#cbd5e1` | Default body cell text |
| `--ogx-grid-row-hover-background` | `#f8fafc` | `#1e293b` | Row hover highlight |
| `--ogx-grid-row-alternate-background` | `var(--ogx-grid-background)` | `#162032` | Striped row alternate |
| `--ogx-grid-row-selected-background` | `#eff6ff` | `#1e3a5f` | Selected row fill |
| `--ogx-grid-row-selected-hover-background` | `#dbeafe` | `#1d4ed8` | Selected row hover |
| `--ogx-grid-cell-focus-border` | `#3b82f6` | `#60a5fa` | Keyboard focus ring |
| `--ogx-grid-pinned-left-shadow` | `4px 0 24px...` | (darker) | Shadow on left-pinned columns |
| `--ogx-grid-pinned-right-shadow` | `-4px 0 24px...` | (darker) | Shadow on right-pinned columns |
| `--ogx-checkbox-bg` | — | `#1e293b` | Checkbox background (dark only) |
| `--ogx-checkbox-border` | — | `#64748b` | Checkbox border (dark only) |

### Transitions

| Token | Default | Description |
|---|---|---|
| `--ogx-transition-duration-fast` | `150ms` | Quick micro-interactions |
| `--ogx-transition-duration-normal` | `250ms` | Standard UI transitions |
| `--ogx-transition-duration-slow` | `350ms` | Deliberate animations |
| `--ogx-transition-easing` | `cubic-bezier(0.4,0,0.2,1)` | Material easing curve |

### Z-index Scale

| Token | Default | Use |
|---|---|---|
| `--ogx-z-index-base` | `0` | |
| `--ogx-z-index-sticky` | `1020` | Sticky/pinned columns |
| `--ogx-z-index-fixed` | `1030` | Fixed elements |
| `--ogx-z-index-dropdown` | `1000` | Inline dropdowns |
| `--ogx-z-index-modal-backdrop` | `1040` | |
| `--ogx-z-index-modal` | `1050` | |
| `--ogx-z-index-popover` | `1060` | Column menus |
| `--ogx-z-index-tooltip` | `1070` | Tooltips |

---

## CSS-Only Override (no React)

You can theme the grid without the `DataGridThemeProvider` by overriding variables on any ancestor element:

```css
/* App-level override */
.my-grid-container {
  --ogx-color-primary: #059669;
  --ogx-color-primary-light: #d1fae5;
  --ogx-grid-header-background: #f0fdf4;
  --ogx-grid-row-selected-background: #d1fae5;
  --ogx-grid-cell-focus-border: #059669;
}
```

```tsx
<div className="my-grid-container">
  <DataGrid rows={rows} columns={columns} />
</div>
```

---

## Built-in Presets

OpenGridX ships with two presets accessible from `'opengridx'`:

```tsx
import { DataGridThemeProvider, themes } from '@opencorestack/opengridx';

// Available: themes.light, themes.dark, themes.compact, themes.comfortable
<DataGridThemeProvider theme={themes.dark}>
  <DataGrid ... />
</DataGridThemeProvider>
```

---

## Example: Custom Purple Theme

```tsx
const purpleTheme: GridTheme = {
  colors: {
    primary: '#7c3aed',
    primaryDark: '#5b21b6',
    primaryLight: '#ede9fe',
    primaryFocus: 'rgba(124,58,237,0.4)',
  },
  grid: {
    headerBackground: '#f5f3ff',
    headerText: '#4c1d95',
    headerHoverBackground: '#ede9fe',
    headerSortedBackground: '#ddd6fe',
    rowSelectedBackground: '#ede9fe',
    rowSelectedHoverBackground: '#ddd6fe',
    cellFocusBorder: '#7c3aed',
  },
};
```

---

## CSS Architecture Notes

- All tokens are defined in `lib/styles/base/variables.css`
- The dark mode overrides are in the same file under `@media (prefers-color-scheme: dark)`
- The CSS entry point for the entire library is `lib/styles/opengridx.css` (single barrel import)
- BEM class prefix: `ogx__` (e.g. `ogx__cell`, `ogx__header-cell`)
- Variable prefix: `--ogx-` (e.g. `--ogx-color-primary`)
