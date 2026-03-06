
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
    darkBaseColor?: string;
    darkHighlightColor?: string;
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

export interface GridThemeGrid {
    rowHeightCompact?: string;
  rowHeightStandard?: string;
  rowHeightComfortable?: string;
    headerHeight?: string;
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
