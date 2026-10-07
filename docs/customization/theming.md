# OpenGridX Theming Guide

OpenGridX ships with a complete design-token system built on CSS custom properties (`--ogx-*`). You can theme the grid in two ways:

1. **`DataGridThemeProvider`** — the recommended React API (maps a typed `GridTheme` object → CSS variables)
2. **Raw CSS override** — set any `--ogx-*` variable yourself on a wrapper element or `:root`

---

## Quick Start — `DataGridThemeProvider`

```tsx
import { DataGrid, DataGridThemeProvider } from '@opencorestack/opengridx';
import '@opencorestack/opengridx/styles'; // required: the tokens only take effect through the grid's stylesheet

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

How the provider builds the variables (v3.0+):

- **It pins a complete palette.** It starts from a full light palette (or a full dark one with `mode: 'dark'`) that sets every colour token, neutral scale included, and then applies your keys on top. A light theme therefore stays light, and readable, when the operating system is in dark mode, and a dark theme needs no other CSS.
- **Accents follow `colors.primary`.** The toolbar's primary button, active chips, search focus ring, selected menu items, selected rows and the keyboard focus ring are all derived from the `colors.primary*` tokens (with `var()` / `color-mix()`), so a theme that only sets `colors.primary` recolours all of them. Set the specific `toolbar.*`, `overlays.*` or `grid.*` key to override one.
- **Toolbar tokens follow the grid surface.** Unless you set `toolbar.*`, the toolbar uses the header background, header text and grid border colours.
- **Row and header heights reach the layout.** `grid.rowHeightStandard` / `grid.headerHeight` (and `rowHeightCompact` / `rowHeightComfortable` with `density`) are read by the grid itself, which virtualizes from them. They must be pixel values (`'36px'` or `'36'`); other units are ignored. The `rowHeight` / `headerHeight` props win over the theme.

> **Sizing:** the wrapper `div` (`.ogx-theme-provider`) is a normal auto-height block. A grid without a `height` prop (or with `height="100%"`) fills its parent, which here is the wrapper, so inside a bounded container pass `style={{ height: '100%' }}` (or a `className` that sets a height) to the provider too. Otherwise the wrapper grows to fit every row and row virtualization is effectively off. See [Virtualization → The grid needs a bounded height](../features/virtualization.md#the-grid-needs-a-bounded-height).

---

## Dark Mode

Without a provider, the grid automatically switches to its dark palette via `@media (prefers-color-scheme: dark)`. Inside a `DataGridThemeProvider` the theme decides instead: `darkTheme` (or any theme with `mode: 'dark'`) is dark and every other theme is light, whatever the operating-system setting. To follow the OS with the provider, pick the theme in your app:

```tsx
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
<DataGridThemeProvider theme={prefersDark ? darkTheme : roseTheme}>…</DataGridThemeProvider>
```

If your app manages dark mode manually without the provider (e.g. via a `data-theme` attribute), override the dark tokens with:

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
  mode?:        'light' | 'dark';     // base palette, default 'light'
  colors?:      GridThemeColors;      // primary*, secondary*, success/warning/error/info, white, black, gray: { 50…900 }
  typography?:  GridThemeTypography;
  spacing?:     GridThemeSpacing;
  borders?:     GridThemeBorders;
  shadows?:     GridThemeShadows;
  grid?:        GridThemeGrid;        // surfaces, heights (px), cellPaddingX/Y, cellFontSize, headerFontSize, rangeBackground, rangeBorder, …
  toolbar?:     GridThemeToolbar;
  overlays?:    GridThemeOverlays;
  scrollbar?:   GridThemeScrollbar;
  skeleton?:    GridThemeSkeleton;    // baseColor, highlightColor
  transitions?: GridThemeTransitions;
}
```

All sub-theme types (`GridThemeColors`, `GridThemeGrayScale`, `GridThemeTypography`, `GridThemeSpacing`, `GridThemeBorders`, `GridThemeShadows`, `GridThemeGrid`, `GridThemeToolbar`, `GridThemeOverlays`, `GridThemeScrollbar`, `GridThemeSkeleton`, `GridThemeTransitions`) are exported from the package.

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
| `--ogx-font-family` | `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', …, sans-serif` | Primary UI font |
| `--ogx-font-family-mono` | `'JetBrains Mono', 'Fira Code', 'Courier New', Courier, monospace` | Monospace (code cells, IDs) |
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
| `--ogx-row-height` | `52px` | Row height. The grid sets it inline on `.ogx` from the `rowHeight` / `density` props (or the provider's `grid.rowHeight*`); read it in custom CSS, don't set it. |
| `--ogx-header-height` | `56px` | Column header row height; set inline by the grid like `--ogx-row-height`. |
| `--ogx-grid-row-height-compact` | `32px` | Informational copy of the theme's `grid.rowHeightCompact`; the grid reads the theme value, not this variable |
| `--ogx-grid-row-height-standard` | `52px` | Informational copy of `grid.rowHeightStandard` |
| `--ogx-grid-row-height-comfortable` | `72px` | Informational copy of `grid.rowHeightComfortable` |
| `--ogx-grid-header-height` | `56px` | Informational copy of `grid.headerHeight` |
| `--ogx-grid-cell-padding-x` | `10px` | Horizontal cell padding |
| `--ogx-grid-cell-padding-y` | `8px` | Vertical cell padding |
| `--ogx-grid-cell-font-size` | `13px` | Body cell font size (`grid.cellFontSize`) |
| `--ogx-grid-header-font-size` | `13px` | Header cell font size (`grid.headerFontSize`) |
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
| `--ogx-range-background` | `rgba(59, 130, 246, 0.12)` | `rgba(96, 165, 250, 0.18)` | Tint over a selected cell range (`cellSelection`, v3.3). Theme key `grid.rangeBackground` |
| `--ogx-range-border` | `var(--ogx-color-primary)` | `#60a5fa` | Outline of a selected cell range, drawn as an inset box-shadow on `ogx__cell--range-top/-bottom/-left/-right` (v3.3). Theme key `grid.rangeBorder` |
| `--ogx-grid-pinned-left-shadow` | `4px 0 24px...` | (darker) | Shadow on left-pinned columns |
| `--ogx-grid-pinned-right-shadow` | `-4px 0 24px...` | (darker) | Shadow on right-pinned columns |
| `--ogx-checkbox-bg` | — | `#1e293b` | Checkbox background (dark only) |
| `--ogx-checkbox-border` | — | `#64748b` | Checkbox border (dark only) |

### Toolbar, Overlay and Scrollbar Colors

Read with a fallback, so a grid without a provider looks the same as before. Inside a provider they come from `toolbar.*`, `overlays.*` and `scrollbar.*`, or from the derivations described above.

| Token | Theme key | Default | Used by |
|---|---|---|---|
| `--ogx-toolbar-background` / `-text` / `-border` | `toolbar.background` / `text` / `border` | header background / header text / grid border | Toolbar bar |
| `--ogx-toolbar-btn-bg` / `-btn-hover` / `-btn-text` | `toolbar.buttonBackground` / `buttonHoverBackground` / `buttonText` | transparent / header hover / header text | Toolbar icon buttons |
| `--ogx-toolbar-btn-primary-bg` / `-hover` / `-text` | `toolbar.buttonPrimary*` | primary / primary-dark / white | Active summary pills |
| `--ogx-toolbar-btn-danger-bg` / `-hover` / `-text` | `toolbar.buttonDanger*` | red tints | Clear buttons |
| `--ogx-toolbar-input-bg` / `-text` / `-border` | `toolbar.inputBackground` / `inputText` / `inputBorder` | grid background / row text / gray-300 | Quick search |
| `--ogx-toolbar-input-focus-border` / `-focus-shadow` | `toolbar.inputFocus*` | primary / 12% primary | Focused quick search |
| `--ogx-toolbar-chip-bg` / `-text` | `toolbar.chipBackground` / `chipText` | transparent / row text | Summary pills |
| `--ogx-toolbar-chip-active-bg` / `-text` | `toolbar.chipActive*` | 12% primary / primary-dark | Active pills, filter chips, pivot chips |
| `--ogx-overlay-*` | `overlays.*` | white surface, gray border | Menus, panels, tooltips |
| `--ogx-overlay-item-selected-bg` / `-text` | `overlays.itemSelected*` | 8% primary / primary-dark | Selected menu item |
| `--ogx-overlay-item-danger-bg` / `-text` | `overlays.itemDanger*` | red tints | Remove-condition button in the filter panel |
| `--ogx-scrollbar-thumb` / `-track` / `-size` | `scrollbar.thumbColor` / `trackColor` / `size` | gray-300 / transparent / 8px | Grid viewport scrollbars |
| `--ogx-skeleton-base` / `-highlight` | `skeleton.baseColor` / `highlightColor` | light grays | Loading skeleton rows |

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

OpenGridX exports five presets as named exports:

```tsx
import { DataGridThemeProvider, darkTheme } from '@opencorestack/opengridx';
// Also: roseTheme, emeraldTheme, amberTheme, compactTheme

<DataGridThemeProvider theme={darkTheme}>
  <DataGrid ... />
</DataGridThemeProvider>
```

| Preset | What it sets |
|---|---|
| `darkTheme` | `mode: 'dark'` plus a dark grid, toolbar and overlay palette |
| `roseTheme`, `emeraldTheme`, `amberTheme` | A brand primary colour and tinted header / selection backgrounds on the light palette |
| `compactTheme` | 36px rows, 40px header (28px rows with `density="compact"`), tighter cell padding and 12px cell / header text |

Presets are plain objects, so you can combine them: `theme={{ ...compactTheme, ...roseTheme, grid: { ...compactTheme.grid, ...roseTheme.grid } }}`.

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
