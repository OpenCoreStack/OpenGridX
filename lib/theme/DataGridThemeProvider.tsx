import React from 'react';
import type { GridTheme } from './types';
import { GridThemeContext } from './gridThemeContext';

// Tokens that follow the primary colour. They are written as var() / color-mix() of the primary
// tokens, so a theme that only sets colors.primary* recolours the toolbar, menus, selection and
// focus ring too; a theme can still override any of them directly.
const primaryDerived: Record<string, string> = {
    '--ogx-grid-row-selected-background': 'var(--ogx-color-primary-light)',
    '--ogx-grid-row-selected-hover-background': 'color-mix(in srgb, var(--ogx-color-primary) 14%, var(--ogx-color-primary-light))',
    '--ogx-grid-cell-focus-border': 'var(--ogx-color-primary)',
    '--ogx-range-background': 'color-mix(in srgb, var(--ogx-color-primary) 12%, transparent)',
    '--ogx-range-border': 'var(--ogx-color-primary)',
    '--ogx-fill-handle-color': 'var(--ogx-range-border)',
    '--ogx-toolbar-btn-primary-bg': 'var(--ogx-color-primary)',
    '--ogx-toolbar-btn-primary-hover': 'var(--ogx-color-primary-dark)',
    '--ogx-toolbar-input-focus-border': 'var(--ogx-color-primary)',
    '--ogx-toolbar-input-focus-shadow': '0 0 0 3px color-mix(in srgb, var(--ogx-color-primary) 12%, transparent)',
    '--ogx-toolbar-chip-active-bg': 'color-mix(in srgb, var(--ogx-color-primary) 12%, transparent)',
    '--ogx-toolbar-chip-active-text': 'var(--ogx-color-primary-dark)',
    '--ogx-overlay-item-selected-bg': 'color-mix(in srgb, var(--ogx-color-primary) 8%, transparent)',
    '--ogx-overlay-item-selected-text': 'var(--ogx-color-primary-dark)',
};

// Tokens that follow the grid surface colours, so a theme that sets grid.* restyles the toolbar
// to match unless it sets toolbar.* itself.
const surfaceDerived: Record<string, string> = {
    '--ogx-toolbar-background': 'var(--ogx-grid-header-background)',
    '--ogx-toolbar-text': 'var(--ogx-grid-header-text)',
    '--ogx-toolbar-border': 'var(--ogx-grid-border-color)',
    '--ogx-toolbar-btn-bg': 'transparent',
    '--ogx-toolbar-btn-hover': 'var(--ogx-grid-header-hover-background)',
    '--ogx-toolbar-btn-text': 'var(--ogx-grid-header-text)',
    '--ogx-toolbar-input-bg': 'var(--ogx-grid-background)',
    '--ogx-toolbar-input-text': 'var(--ogx-grid-row-text)',
    '--ogx-toolbar-chip-bg': 'transparent',
    '--ogx-toolbar-chip-text': 'var(--ogx-grid-row-text)',
};

// The complete light palette. The provider pins every colour token, so a light theme stays light
// (and readable) when the operating system is in dark mode, where :root switches to dark values.
const lightBase: Record<string, string> = {
    '--ogx-color-primary': '#3b82f6',
    '--ogx-color-primary-dark': '#2563eb',
    '--ogx-color-primary-light': '#eff6ff',
    '--ogx-color-primary-focus': 'rgba(59, 130, 246, 0.5)',

    '--ogx-color-secondary': '#8b5cf6',
    '--ogx-color-secondary-dark': '#7c3aed',
    '--ogx-color-secondary-light': '#f5f3ff',

    '--ogx-color-white': '#ffffff',
    '--ogx-color-black': '#0f172a',
    '--ogx-color-gray-50': '#f8fafc',
    '--ogx-color-gray-100': '#f1f5f9',
    '--ogx-color-gray-200': '#e2e8f0',
    '--ogx-color-gray-300': '#cbd5e1',
    '--ogx-color-gray-400': '#94a3b8',
    '--ogx-color-gray-500': '#64748b',
    '--ogx-color-gray-600': '#475569',
    '--ogx-color-gray-700': '#334155',
    '--ogx-color-gray-800': '#1e293b',
    '--ogx-color-gray-900': '#0f172a',

    '--ogx-border-color': '#e2e8f0',
    '--ogx-border-color-hover': '#cbd5e1',

    '--ogx-shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '--ogx-shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    '--ogx-shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',

    '--ogx-grid-background': '#ffffff',
    '--ogx-grid-border-color': '#e2e8f0',
    '--ogx-grid-header-background': '#f8fafc',
    '--ogx-grid-header-text': '#334155',
    '--ogx-grid-header-hover-background': '#f1f5f9',
    '--ogx-grid-header-sorted-background': '#f8fafc',
    '--ogx-grid-row-text': '#1e293b',
    '--ogx-grid-row-hover-background': '#f8fafc',
    '--ogx-grid-row-alternate-background': 'transparent',

    '--ogx-checkbox-bg': '#ffffff',
    '--ogx-checkbox-border': '#94a3b8',

    '--ogx-grid-pinned-left-shadow': '4px 0 24px -4px rgba(0, 0, 0, 0.05)',
    '--ogx-grid-pinned-right-shadow': '-4px 0 24px -4px rgba(0, 0, 0, 0.05)',

    // Toolbars
    ...surfaceDerived,
    '--ogx-toolbar-btn-primary-text': '#ffffff',
    '--ogx-toolbar-btn-danger-bg': 'rgba(239, 68, 68, 0.08)',
    '--ogx-toolbar-btn-danger-hover': 'rgba(239, 68, 68, 0.15)',
    '--ogx-toolbar-btn-danger-text': '#ef4444',
    '--ogx-toolbar-input-border': '#cbd5e1',

    // Overlays & Menus
    '--ogx-overlay-background': '#ffffff',
    '--ogx-overlay-text': '#1e293b',
    '--ogx-overlay-border': '#e2e8f0',
    '--ogx-overlay-shadow': '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)',
    '--ogx-overlay-item-hover-bg': '#f8fafc',
    '--ogx-overlay-item-hover-text': '#0f172a',
    '--ogx-overlay-item-danger-bg': 'rgba(239, 68, 68, 0.08)',
    '--ogx-overlay-item-danger-text': '#ef4444',

    // Scrollbars
    '--ogx-scrollbar-thumb': '#cbd5e1',
    '--ogx-scrollbar-track': 'transparent',
    '--ogx-scrollbar-size': '8px',

    // Skeletons
    '--ogx-skeleton-base': '#f1f5f9',
    '--ogx-skeleton-highlight': '#ffffff',

    ...primaryDerived,
};

// The complete dark palette (theme.mode === 'dark'): the values the stylesheet uses under
// prefers-color-scheme: dark, plus the toolbar, overlay, scrollbar and skeleton tokens.
const darkBase: Record<string, string> = {
    ...lightBase,
    '--ogx-color-primary': '#60a5fa',
    '--ogx-color-primary-dark': '#3b82f6',
    '--ogx-color-primary-light': '#1e3a5f',
    '--ogx-color-primary-focus': 'rgba(96, 165, 250, 0.4)',

    '--ogx-color-white': '#0f172a',
    '--ogx-color-black': '#f8fafc',
    '--ogx-color-gray-50': '#1e293b',
    '--ogx-color-gray-100': '#334155',
    '--ogx-color-gray-200': '#475569',
    '--ogx-color-gray-300': '#64748b',
    '--ogx-color-gray-400': '#94a3b8',
    '--ogx-color-gray-500': '#cbd5e1',
    '--ogx-color-gray-600': '#e2e8f0',
    '--ogx-color-gray-700': '#e2e8f0',
    '--ogx-color-gray-800': '#f1f5f9',
    '--ogx-color-gray-900': '#f8fafc',

    '--ogx-border-color': '#334155',
    '--ogx-border-color-hover': '#475569',

    '--ogx-shadow-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    '--ogx-shadow-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    '--ogx-shadow-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3)',

    '--ogx-grid-background': '#0f172a',
    '--ogx-grid-border-color': '#334155',
    '--ogx-grid-header-background': '#1e293b',
    '--ogx-grid-header-text': '#e2e8f0',
    '--ogx-grid-header-hover-background': '#334155',
    '--ogx-grid-header-sorted-background': '#1e3a5f',
    '--ogx-grid-row-text': '#cbd5e1',
    '--ogx-grid-row-hover-background': '#1e293b',
    '--ogx-grid-row-alternate-background': '#162032',

    '--ogx-checkbox-bg': '#1e293b',
    '--ogx-checkbox-border': '#64748b',

    '--ogx-grid-pinned-left-shadow': '4px 0 24px -4px rgba(0, 0, 0, 0.3)',
    '--ogx-grid-pinned-right-shadow': '-4px 0 24px -4px rgba(0, 0, 0, 0.3)',

    '--ogx-toolbar-btn-danger-bg': 'rgba(239, 68, 68, 0.15)',
    '--ogx-toolbar-btn-danger-hover': 'rgba(239, 68, 68, 0.25)',
    '--ogx-toolbar-btn-danger-text': '#fca5a5',
    '--ogx-toolbar-input-border': '#334155',

    '--ogx-overlay-background': '#1e293b',
    '--ogx-overlay-text': '#cbd5e1',
    '--ogx-overlay-border': '#334155',
    '--ogx-overlay-shadow': '0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.2)',
    '--ogx-overlay-item-hover-bg': '#334155',
    '--ogx-overlay-item-hover-text': '#f1f5f9',
    '--ogx-overlay-item-danger-bg': 'rgba(239, 68, 68, 0.15)',
    '--ogx-overlay-item-danger-text': '#fca5a5',

    '--ogx-scrollbar-thumb': '#475569',

    '--ogx-skeleton-base': '#1e293b',
    '--ogx-skeleton-highlight': '#334155',

    ...primaryDerived,
    // On a dark surface the lighter primary reads better than primary-dark.
    '--ogx-toolbar-chip-active-text': 'var(--ogx-color-primary)',
    '--ogx-overlay-item-selected-text': 'var(--ogx-color-primary)',
};

const GRAY_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

function themeToCSS(theme: GridTheme): Record<string, string> {
    const vars: Record<string, string> = {};

    function set(cssVar: string, value: string | undefined) {
        if (value !== undefined) {
            vars[cssVar] = value;
        }
    }

    if (theme.colors) {
        const c = theme.colors;
        set('--ogx-color-primary', c.primary);
        set('--ogx-color-primary-dark', c.primaryDark);
        set('--ogx-color-primary-light', c.primaryLight);
        set('--ogx-color-primary-focus', c.primaryFocus);
        set('--ogx-color-secondary', c.secondary);
        set('--ogx-color-secondary-dark', c.secondaryDark);
        set('--ogx-color-secondary-light', c.secondaryLight);
        set('--ogx-color-success', c.success);
        set('--ogx-color-warning', c.warning);
        set('--ogx-color-error', c.error);
        set('--ogx-color-info', c.info);
        set('--ogx-color-white', c.white);
        set('--ogx-color-black', c.black);
        if (c.gray) {
            for (const step of GRAY_STEPS) set(`--ogx-color-gray-${step}`, c.gray[step]);
        }
    }

    if (theme.typography) {
        const t = theme.typography;
        set('--ogx-font-family', t.fontFamily);
        set('--ogx-font-family-mono', t.fontFamilyMono);
        set('--ogx-font-size-xs', t.fontSizeXs);
        set('--ogx-font-size-sm', t.fontSizeSm);
        set('--ogx-font-size-md', t.fontSizeMd);
        set('--ogx-font-size-lg', t.fontSizeLg);
        set('--ogx-font-size-xl', t.fontSizeXl);
    }

    if (theme.spacing) {
        const s = theme.spacing;
        set('--ogx-spacing-xs', s.xs);
        set('--ogx-spacing-sm', s.sm);
        set('--ogx-spacing-md', s.md);
        set('--ogx-spacing-lg', s.lg);
        set('--ogx-spacing-xl', s.xl);
        set('--ogx-spacing-xxl', s.xxl);
    }

    if (theme.borders) {
        const b = theme.borders;
        set('--ogx-border-width-thin', b.widthThin);
        set('--ogx-border-width-medium', b.widthMedium);
        set('--ogx-border-width-thick', b.widthThick);
        set('--ogx-border-radius-sm', b.radiusSm);
        set('--ogx-border-radius-md', b.radiusMd);
        set('--ogx-border-radius-lg', b.radiusLg);
        set('--ogx-border-radius-xl', b.radiusXl);
        set('--ogx-border-color', b.color);
        set('--ogx-border-color-hover', b.colorHover);
    }

    if (theme.shadows) {
        const sh = theme.shadows;
        set('--ogx-shadow-sm', sh.sm);
        set('--ogx-shadow-md', sh.md);
        set('--ogx-shadow-lg', sh.lg);
        set('--ogx-shadow-xl', sh.xl);
    }

    if (theme.grid) {
        const g = theme.grid;
        // Row and header heights also reach the grid's layout through GridThemeContext
        // (useGridThemeDimensions); these variables serve custom CSS outside the grid.
        set('--ogx-grid-row-height-compact', g.rowHeightCompact);
        set('--ogx-grid-row-height-standard', g.rowHeightStandard);
        set('--ogx-row-height', g.rowHeightStandard);
        set('--ogx-grid-row-height-comfortable', g.rowHeightComfortable);
        set('--ogx-grid-header-height', g.headerHeight);
        set('--ogx-header-height', g.headerHeight);
        set('--ogx-grid-cell-padding-x', g.cellPaddingX);
        set('--ogx-grid-cell-padding-y', g.cellPaddingY);
        set('--ogx-grid-cell-font-size', g.cellFontSize);
        set('--ogx-grid-header-font-size', g.headerFontSize);
        set('--ogx-grid-background', g.background);
        set('--ogx-grid-border-color', g.borderColor);
        set('--ogx-grid-header-background', g.headerBackground);
        set('--ogx-grid-header-text', g.headerText);
        set('--ogx-grid-header-hover-background', g.headerHoverBackground);
        set('--ogx-grid-header-sorted-background', g.headerSortedBackground);
        set('--ogx-grid-row-text', g.rowText);
        set('--ogx-grid-row-hover-background', g.rowHoverBackground);
        set('--ogx-grid-row-alternate-background', g.rowAlternateBackground);
        set('--ogx-grid-row-selected-background', g.rowSelectedBackground);
        set('--ogx-grid-row-selected-hover-background', g.rowSelectedHoverBackground);
        set('--ogx-grid-cell-focus-border', g.cellFocusBorder);
        set('--ogx-range-background', g.rangeBackground);
        set('--ogx-range-border', g.rangeBorder);
        set('--ogx-fill-handle-color', g.fillHandleColor);
        set('--ogx-grid-pinned-left-shadow', g.pinnedLeftShadow);
        set('--ogx-grid-pinned-right-shadow', g.pinnedRightShadow);
        set('--ogx-checkbox-bg', g.checkboxBg);
        set('--ogx-checkbox-border', g.checkboxBorder);
    }

    if (theme.transitions) {
        const tr = theme.transitions;
        set('--ogx-transition-duration-fast', tr.durationFast);
        set('--ogx-transition-duration-normal', tr.durationNormal);
        set('--ogx-transition-duration-slow', tr.durationSlow);
        set('--ogx-transition-easing', tr.easing);
    }

    if (theme.toolbar) {
        const tb = theme.toolbar;
        set('--ogx-toolbar-background', tb.background);
        set('--ogx-toolbar-text', tb.text);
        set('--ogx-toolbar-border', tb.border);
        set('--ogx-toolbar-btn-bg', tb.buttonBackground);
        set('--ogx-toolbar-btn-hover', tb.buttonHoverBackground);
        set('--ogx-toolbar-btn-text', tb.buttonText);
        set('--ogx-toolbar-btn-primary-bg', tb.buttonPrimaryBackground);
        set('--ogx-toolbar-btn-primary-hover', tb.buttonPrimaryHoverBackground);
        set('--ogx-toolbar-btn-primary-text', tb.buttonPrimaryText);
        set('--ogx-toolbar-btn-danger-bg', tb.buttonDangerBackground);
        set('--ogx-toolbar-btn-danger-hover', tb.buttonDangerHoverBackground);
        set('--ogx-toolbar-btn-danger-text', tb.buttonDangerText);
        set('--ogx-toolbar-input-bg', tb.inputBackground);
        set('--ogx-toolbar-input-text', tb.inputText);
        set('--ogx-toolbar-input-border', tb.inputBorder);
        set('--ogx-toolbar-input-focus-border', tb.inputFocusBorder);
        set('--ogx-toolbar-input-focus-shadow', tb.inputFocusShadow);
        set('--ogx-toolbar-chip-bg', tb.chipBackground);
        set('--ogx-toolbar-chip-text', tb.chipText);
        set('--ogx-toolbar-chip-active-bg', tb.chipActiveBackground);
        set('--ogx-toolbar-chip-active-text', tb.chipActiveText);
    }

    if (theme.overlays) {
        const o = theme.overlays;
        set('--ogx-overlay-background', o.background);
        set('--ogx-overlay-text', o.text);
        set('--ogx-overlay-border', o.border);
        set('--ogx-overlay-shadow', o.shadow);
        set('--ogx-overlay-item-hover-bg', o.itemHoverBackground);
        set('--ogx-overlay-item-hover-text', o.itemHoverText);
        set('--ogx-overlay-item-selected-bg', o.itemSelectedBackground);
        set('--ogx-overlay-item-selected-text', o.itemSelectedText);
        set('--ogx-overlay-item-danger-bg', o.itemDangerBackground);
        set('--ogx-overlay-item-danger-text', o.itemDangerText);
    }

    if (theme.scrollbar) {
        const scr = theme.scrollbar;
        set('--ogx-scrollbar-thumb', scr.thumbColor);
        set('--ogx-scrollbar-track', scr.trackColor);
        set('--ogx-scrollbar-size', scr.size);
    }

    if (theme.skeleton) {
        const sk = theme.skeleton;
        set('--ogx-skeleton-base', sk.baseColor);
        set('--ogx-skeleton-highlight', sk.highlightColor);
    }

    return vars;
}

export interface DataGridThemeProviderProps {
    theme: GridTheme;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function DataGridThemeProvider({
    theme,
    children,
    className,
    style
}: DataGridThemeProviderProps) {
    const cssVars = React.useMemo(
        () => ({ ...(theme.mode === 'dark' ? darkBase : lightBase), ...themeToCSS(theme) }),
        [theme],
    );

    return (
        <GridThemeContext.Provider value={theme}>
            <div
                className={`ogx-theme-provider ${className || ''}`.trim()}
                style={{ ...style, ...cssVars } as React.CSSProperties}
            >
                {children}
            </div>
        </GridThemeContext.Provider>
    );
}
