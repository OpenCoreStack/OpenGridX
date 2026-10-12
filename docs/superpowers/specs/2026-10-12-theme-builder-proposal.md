# Theme Builder demo page — proposal

Status: **proposal, awaiting approval** · Target: next minor (with the new theme keys it needs)

## Goal

A demo page, **Theme Builder** (`/theme-builder`), where anyone can restyle a live grid with controls instead of code, for light and dark mode separately, and copy the result as a ready-to-paste `GridTheme` object.

## What the user can change

Each control maps to an existing `GridTheme` key, or a **new** one (marked **new**). The page edits a light theme and a dark theme side by side, with a "Light / Dark" switch for which one is being edited and previewed.

| Group | Controls | Theme keys |
| :--- | :--- | :--- |
| **Colours** | Grid background, border colour, row text, alternate row, row hover, selected row, focus ring, range selection | `grid.background`, `grid.borderColor` / `borders.color`, `grid.rowText`, `grid.rowAlternateBackground`, `grid.rowHoverBackground`, `grid.rowSelectedBackground`, `grid.cellFocusBorder`, `grid.rangeBackground` / `rangeBorder` |
| **Header cell** | Background, text colour, hover and sorted background; font family, **weight**, size | `grid.headerBackground`, `headerText`, `headerHoverBackground`, `headerSortedBackground`, `grid.headerFontSize`, **new** `grid.headerFontFamily`, **new** `grid.headerFontWeight` |
| **Body cell** | Font family, **weight**, size; horizontal padding | **new** `grid.cellFontFamily`, **new** `grid.cellFontWeight`, `grid.cellFontSize`, `grid.cellPaddingX` |
| **Sizes** | Row height (compact / standard / comfortable), header height, border radius | `grid.rowHeightCompact` / `Standard` / `Comfortable`, `grid.headerHeight`, `borders.radiusMd` |
| **Buttons** | Toolbar button background, hover, text; primary button background and text | `toolbar.buttonBackground`, `buttonHoverBackground`, `buttonText`, `buttonPrimaryBackground`, `buttonPrimaryText` |
| **Column menu and panels** | Background, text, border, shadow, item hover / selected; font family, weight, size | `overlays.background`, `text`, `border`, `shadow`, `itemHoverBackground`, `itemSelectedBackground`, **new** `overlays.fontFamily`, **new** `overlays.fontWeight`, **new** `overlays.fontSize` |
| **Brand** | Primary colour (drives the derived tokens) | `colors.primary` |

**New keys (library change, additive):** 8 theme keys and their CSS variables.
- **Header:** `--ogx-grid-header-font-family`, `--ogx-grid-header-font-weight`
- **Body cells:** `--ogx-grid-cell-font-family`, `--ogx-grid-cell-font-weight`
- **Column menu and panels:** `--ogx-overlay-font-family`, `--ogx-overlay-font-weight`, `--ogx-overlay-font-size`

**Defaults:** each falls back to today's value. Grids that don't set the new keys look exactly as they do now, and a layout test proves it.

## Page layout

- **Left panel:** the controls, grouped as in the table and collapsible. Each control has a reset to its default.
  - **Colours:** a colour picker plus a hex text field.
  - **Fonts:** a family dropdown (system UI, Inter, Roboto, Georgia, monospace, or a custom text entry), a weight dropdown (300–800) and a size slider in px.
  - **Sizes:** sliders.
- **Right side, the live preview:**
  - a real `DataGrid` with a toolbar, a pinned column, a selected row, grouping and the column menu opened by a button;
  - it re-renders on every change through `DataGridThemeProvider`, with the mode set by the switch.
- **Starting points:** the 5 built-in presets (default, dark, rose, emerald, amber, compact). "Start from…" loads one into the editor.
- **Output:**
  - **Copy theme:** copies `const myTheme: GridTheme = { … }` for light, dark, or both, with only the values that differ from the default.
  - **Download theme:** saves the same code as a `.ts` file.
  - **Share via URL:** puts the theme into the page's `#hash`, so a link reopens the same theme.
- **Contrast check:** a WCAG AA hint next to each text/background pair, for example header text on header background. It shows a warning, never blocks.

## Workflow (how it gets built)

1. **Approve this proposal**, including the 8 new theme keys.
2. **Library step**, one agent:
   - add the new keys to `GridTheme`, the CSS variables, the `DataGridThemeProvider` mapping, every built-in preset (same values as today) and the CSS rules that read them;
   - tests: unit tests for the provider mapping, a browser test that the fonts apply to header cells, body cells and the column menu, and an LTR layout test showing no change for existing themes;
   - docs: `docs/customization/theming.md` and the API reference.
3. **Demo step**, the same agent after step 2:
   - build `demo/examples/ThemeBuilderDemo/` (controls, preview, presets, copy, download, URL sharing and contrast hints), registered in `demo/App.tsx` under "Customization" with a link from the existing Theming demo;
   - the controls use the library's shared `Input`, `Checkbox` and `Button` components where they fit.
4. **Checks:**
   - every gate, plus a smoke-suite check that a theme using the new keys renders in both test apps;
   - a quick visual review in Chromium, in light and dark mode.
5. **Release** with the next minor version and its CHANGELOG entry.

## Out of scope

- Saving themes to an account or server; the URL hash and the copied code are the storage.
- Editing every one of the roughly 80 theme keys. The page covers the ones listed. A collapsed "Advanced" section shows the full theme as editable JSON for the rest.
