import type { GridTheme } from './types';

export const darkTheme: GridTheme = {
  colors: {
    primary: '#60a5fa',       
    primaryDark: '#3b82f6',
    primaryLight: '#1e3a5f',   
    primaryFocus: 'rgba(96, 165, 250, 0.4)',
  },
  grid: {
    background: '#0f172a',             
    headerBackground: '#1e293b',       
    headerText: '#e2e8f0',             
    headerHoverBackground: '#334155',  
    headerSortedBackground: '#1e3a5f', 
    rowText: '#cbd5e1',                
    borderColor: '#334155',            
    rowHoverBackground: '#1e293b',     
    rowAlternateBackground: '#162032', 
    rowSelectedBackground: '#1e3a5f',  
    rowSelectedHoverBackground: '#1d4ed8', 
    cellFocusBorder: '#60a5fa',
    checkboxBg: '#1e293b',            
    checkboxBorder: '#64748b',         
  },
  borders: {
    color: '#334155',
    colorHover: '#475569',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
  },
  toolbar: {
    background: 'transparent',
    text: '#cbd5e1',
    border: '#334155',
    buttonBackground: 'transparent',
    buttonHoverBackground: '#1e293b',
    buttonText: '#e2e8f0',
    buttonPrimaryBackground: '#3b82f6',
    buttonPrimaryHoverBackground: '#2563eb',
    buttonPrimaryText: '#ffffff',
    buttonDangerBackground: 'rgba(239, 68, 68, 0.15)',
    buttonDangerHoverBackground: 'rgba(239, 68, 68, 0.25)',
    buttonDangerText: '#fca5a5',
    inputBackground: '#0f172a',
    inputText: '#f8fafc',
    inputBorder: '#334155',
    inputFocusBorder: '#60a5fa',
    inputFocusShadow: '0 0 0 3px rgba(96, 165, 250, 0.2)',
    chipBackground: '#1e293b',
    chipText: '#94a3b8',
    chipActiveBackground: 'rgba(96, 165, 250, 0.2)',
    chipActiveText: '#60a5fa',
  },
  overlays: {
    background: '#1e293b',
    text: '#f8fafc',
    border: '#334155',
    shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    itemHoverBackground: '#334155',
    itemHoverText: '#ffffff',
    itemSelectedBackground: 'rgba(96, 165, 250, 0.15)',
    itemSelectedText: '#60a5fa',
    itemDangerBackground: 'rgba(239, 68, 68, 0.15)',
    itemDangerText: '#fca5a5',
  },
  scrollbar: {
    thumbColor: 'rgba(148, 163, 184, 0.2)',
    trackColor: 'transparent',
  },
  skeleton: {
    baseColor: '#1e293b',
    highlightColor: '#334155',
    darkBaseColor: '#0f172a',
    darkHighlightColor: '#1e293b',
  }
};

export const roseTheme: GridTheme = {
  colors: {
    primary: '#e11d48',       
    primaryDark: '#be123c',
    primaryLight: '#fff1f2',  
    primaryFocus: 'rgba(225, 29, 72, 0.4)',
  },
  grid: {
    headerBackground: '#fff1f2',
    headerHoverBackground: '#ffe4e6',
    headerSortedBackground: '#fecdd3',
    rowAlternateBackground: '#fff8f8',
    rowSelectedBackground: '#ffe4e6',
    rowSelectedHoverBackground: '#fecdd3',
    cellFocusBorder: '#e11d48',
  },
};

export const emeraldTheme: GridTheme = {
  colors: {
    primary: '#059669',       
    primaryDark: '#047857',
    primaryLight: '#ecfdf5',  
    primaryFocus: 'rgba(5, 150, 105, 0.4)',
  },
  grid: {
    headerBackground: '#ecfdf5',
    headerHoverBackground: '#d1fae5',
    headerSortedBackground: '#a7f3d0',
    rowAlternateBackground: '#f6fdf9',
    rowSelectedBackground: '#d1fae5',
    rowSelectedHoverBackground: '#a7f3d0',
    cellFocusBorder: '#059669',
  },
};

export const amberTheme: GridTheme = {
  colors: {
    primary: '#d97706',       
    primaryDark: '#b45309',
    primaryLight: '#fffbeb',  
    primaryFocus: 'rgba(217, 119, 6, 0.4)',
  },
  grid: {
    headerBackground: '#fffbeb',
    headerHoverBackground: '#fef3c7',
    headerSortedBackground: '#fde68a',
    rowAlternateBackground: '#fffdf5',
    rowSelectedBackground: '#fef3c7',
    rowSelectedHoverBackground: '#fde68a',
    cellFocusBorder: '#d97706',
  },
};

export const compactTheme: GridTheme = {
  grid: {
    rowHeightCompact: '28px',
    rowHeightStandard: '36px',
    rowHeightComfortable: '48px',
    headerHeight: '40px',
    cellPaddingX: '8px',
    cellPaddingY: '4px',
  },
  typography: {
    fontSizeSm: '0.8rem',
    fontSizeMd: '0.875rem',
  },
};
