
export interface GridThemeColors {
    primary?: string;
    primaryDark?: string;
    primaryLight?: string;
    primaryFocus?: string;

    secondary?: string;
  secondaryDark?: string;
  secondaryLight?: string;

    success?: string;
  warning?: string;
  error?: string;
  info?: string;

  /** Page-level surface colour (`--ogx-color-white`): inputs, buttons, checkbox fallbacks. */
  white?: string;
  /** Strongest text colour (`--ogx-color-black`). */
  black?: string;
  /**
   * The neutral scale (`--ogx-color-gray-50` … `--ogx-color-gray-900`) used by group rows, detail
   * panels, inputs, buttons and panels. The theme's `mode` supplies a complete scale; override
   * single steps here.
   */
  gray?: GridThemeGrayScale;
}

/** Steps of the neutral scale; 50 is the lightest surface in light mode, the darkest in dark mode. */
export interface GridThemeGrayScale {
  50?: string;
  100?: string;
  200?: string;
  300?: string;
  400?: string;
  500?: string;
  600?: string;
  700?: string;
  800?: string;
  900?: string;
}

export interface GridThemeTypography {
    fontFamily?: string;
    fontFamilyMono?: string;
    fontSizeXs?: string;
    fontSizeSm?: string;
    fontSizeMd?: string;
    fontSizeLg?: string;
    fontSizeXl?: string;
}

export interface GridThemeToolbar {
    background?: string;
    text?: string;
    border?: string;

    buttonBackground?: string;
    buttonHoverBackground?: string;
    buttonText?: string;
    buttonPrimaryBackground?: string;
    buttonPrimaryHoverBackground?: string;
    buttonPrimaryText?: string;

    buttonDangerBackground?: string;
    buttonDangerHoverBackground?: string;
    buttonDangerText?: string;

    inputBackground?: string;
    inputText?: string;
    inputBorder?: string;
    inputFocusBorder?: string;
    inputFocusShadow?: string;

    chipBackground?: string;
    chipText?: string;
    chipActiveBackground?: string;
    chipActiveText?: string;
}

export interface GridThemeOverlays {
    background?: string;
    text?: string;
    border?: string;
    shadow?: string;

    itemHoverBackground?: string;
    itemHoverText?: string;
    itemSelectedBackground?: string;
    itemSelectedText?: string;
    itemDangerBackground?: string;
    itemDangerText?: string;
}

export interface GridThemeScrollbar {
    thumbColor?: string;
    trackColor?: string;
    size?: string;
}

export interface GridThemeSkeleton {
    baseColor?: string;
    highlightColor?: string;
}

export interface GridThemeSpacing {
    xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  xxl?: string;
}

export interface GridThemeBorders {
    widthThin?: string;
  widthMedium?: string;
  widthThick?: string;
    radiusSm?: string;
  radiusMd?: string;
  radiusLg?: string;
  radiusXl?: string;
    color?: string;
  colorHover?: string;
}

export interface GridThemeShadows {
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}

/**
 * Row and header heights are read by the grid itself (they drive virtualization), so they must be
 * pixel values such as `'36px'` or `'36'`. The `rowHeight` / `headerHeight` props win over them;
 * `rowHeightCompact` / `rowHeightComfortable` apply with `density="compact"` / `"comfortable"`.
 */
export interface GridThemeGrid {
    rowHeightCompact?: string;
  rowHeightStandard?: string;
  rowHeightComfortable?: string;
    headerHeight?: string;
    /** Font size of body cells (`--ogx-grid-cell-font-size`, default 13px). */
    cellFontSize?: string;
    /** Font size of header cells (`--ogx-grid-header-font-size`, default 13px). */
    headerFontSize?: string;
    cellPaddingX?: string;
  cellPaddingY?: string;
    background?: string;
  borderColor?: string;
  headerBackground?: string;
  headerText?: string;
    headerHoverBackground?: string;
  headerSortedBackground?: string;
  rowText?: string;
    rowHoverBackground?: string;
    rowAlternateBackground?: string;
  rowSelectedBackground?: string;
  rowSelectedHoverBackground?: string;
    cellFocusBorder?: string;
    /** Tint over a selected cell range (`--ogx-range-background`). Default: the primary colour at 12%. @since v3.3 */
    rangeBackground?: string;
    /** Outline of a selected cell range (`--ogx-range-border`). Default: the primary colour. @since v3.3 */
    rangeBorder?: string;
    pinnedLeftShadow?: string;
  pinnedRightShadow?: string;
    checkboxBg?: string;
  checkboxBorder?: string;
}

export interface GridThemeTransitions {
  durationFast?: string;
  durationNormal?: string;
  durationSlow?: string;
  easing?: string;
}

export interface GridTheme {
  /**
   * The complete base palette the theme starts from (default `'light'`). The provider pins every
   * colour token, so the grid follows the theme whatever the operating-system colour scheme is.
   * Use `'dark'` for a dark theme; the other keys override single tokens on top of it.
   */
  mode?: 'light' | 'dark';
  colors?: GridThemeColors;
  typography?: GridThemeTypography;
  spacing?: GridThemeSpacing;
  borders?: GridThemeBorders;
  shadows?: GridThemeShadows;
  grid?: GridThemeGrid;
  toolbar?: GridThemeToolbar;
  overlays?: GridThemeOverlays;
  scrollbar?: GridThemeScrollbar;
  skeleton?: GridThemeSkeleton;
  transitions?: GridThemeTransitions;
}
