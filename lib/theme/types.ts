
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
    /** The dot before the selected option of a menu group (`--ogx-overlay-item-indicator`). Default: `itemSelectedText`. @since v3.9 */
    itemIndicatorColor?: string;
    /** The icon of the selected option (`--ogx-overlay-item-selected-icon`). Default: the primary colour. @since v3.9 */
    itemSelectedIcon?: string;
    /** Menu item icons (`--ogx-overlay-icon`). Default: gray-400. @since v3.9 */
    iconColor?: string;
    /** Section labels such as "Pin column" (`--ogx-overlay-section-label-text`). Default: gray-400. @since v3.9 */
    sectionLabelText?: string;
    /** Lines between menu sections (`--ogx-overlay-divider`). Default: `border`. @since v3.9 */
    dividerColor?: string;

    /** Font of column menus, header filter menus, toolbar panels and the AI panel (`--ogx-overlay-font-family`). Default: the grid font. @since v3.7 */
    fontFamily?: string;
    /** Weight of menu items and panel labels (`--ogx-overlay-font-weight`). Default: each item's own weight (400, labels 500). @since v3.7 */
    fontWeight?: string;
    /** Size of menu items and panel labels (`--ogx-overlay-font-size`). Default: `--ogx-font-size-xs` (the AI panel: `--ogx-font-size-sm`). @since v3.7 */
    fontSize?: string;
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
    /** Font of header cells (`--ogx-grid-header-font-family`). Default: the grid font. @since v3.7 */
    headerFontFamily?: string;
    /** Weight of header cells (`--ogx-grid-header-font-weight`). Default: `600`. @since v3.7 */
    headerFontWeight?: string;
    /** Font of body cells (`--ogx-grid-cell-font-family`). Default: the grid font. @since v3.7 */
    cellFontFamily?: string;
    /** Weight of body cells (`--ogx-grid-cell-font-weight`). Default: inherited (400). @since v3.7 */
    cellFontWeight?: string;
    cellPaddingX?: string;
  cellPaddingY?: string;
    /** Horizontal padding of header cells (`--ogx-grid-header-padding-x`). Default: `cellPaddingX`. @since v3.7 */
    headerPaddingX?: string;
    /** Width of the grid's outer border (`--ogx-grid-border-width`). Default: `1px`. @since v3.7 */
    borderWidth?: string;
    /** Corner radius of the grid (`--ogx-grid-border-radius`). Default: `borders.radiusLg` (12px). @since v3.7 */
    borderRadius?: string;
    /** Width of the lines between body cells, aggregation footer cells and pinned sections (`--ogx-grid-column-divider-width`). Default: `1px`; `0` hides them. @since v3.7 */
    columnDividerWidth?: string;
    /** Width of the short separators between header and column-group cells (`--ogx-grid-header-column-divider-width`). Default: `1px`; `0` hides them. @since v3.7 */
    headerColumnDividerWidth?: string;
    /** Width of the lines under rows, the header row, column-group rows and the header filter row (`--ogx-grid-row-divider-width`). Default: `1px`; `0` hides them. @since v3.7 */
    rowDividerWidth?: string;
    /** Colour of the column dividers (`--ogx-grid-column-divider-color`). Default: `borderColor`. @since v3.7 */
    columnDividerColor?: string;
    /** Colour of the row dividers (`--ogx-grid-row-divider-color`). Default: `borderColor`. @since v3.7 */
    rowDividerColor?: string;
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
    /** The fill handle on the range's corner (`--ogx-fill-handle-color`). Default: the range border colour. @since v3.5 */
    fillHandleColor?: string;
    pinnedLeftShadow?: string;
  pinnedRightShadow?: string;
    checkboxBg?: string;
  checkboxBorder?: string;
    /** Fill and border of a checked or indeterminate checkbox (`--ogx-checkbox-checked-bg`). Default: the primary colour. @since v3.9 */
    checkboxCheckedBackground?: string;
    /** The check mark and indeterminate dash (`--ogx-checkbox-checkmark`). Default: white. @since v3.9 */
    checkboxCheckmark?: string;
    /** The expand / collapse chevron of group and tree rows (`--ogx-expand-icon-color`). Default: the header text colour. @since v3.9 */
    expandIconColor?: string;
    /** The chevron on hover (`--ogx-expand-icon-hover-color`). Default: the row text colour. @since v3.9 */
    expandIconHoverColor?: string;
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
