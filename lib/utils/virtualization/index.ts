
import { GridRenderContext } from '../../types';

export interface VirtualizationParams {
  scrollTop: number;
  scrollLeft: number;
  viewportHeight: number;
  viewportWidth: number;
  rowHeight: number;
  totalRows: number;
  columnWidths: number[];
  overscan?: number;
}

export interface VirtualizationResult {
  renderContext: GridRenderContext;
  offsetTop: number;
  offsetLeft: number;
  totalHeight: number;
  totalWidth: number;
}

export function calculateVirtualization(params: VirtualizationParams): VirtualizationResult {
  const {
    scrollTop,
    scrollLeft,
    viewportHeight,
    viewportWidth,
    rowHeight,
    totalRows,
    columnWidths,
    overscan = 3
  } = params;

  const firstVisibleRow = Math.floor(scrollTop / rowHeight);
  const lastVisibleRow = Math.min(
    totalRows - 1,
    Math.ceil((scrollTop + viewportHeight) / rowHeight)
  );

  const firstRowIndex = Math.max(0, firstVisibleRow - overscan);
  const lastRowIndex = Math.min(totalRows - 1, lastVisibleRow + overscan);

  let accumulatedWidth = 0;
  let firstColumnIndex = 0;
  let lastColumnIndex = columnWidths.length - 1;
  let offsetLeft = 0;

  for (let i = 0; i < columnWidths.length; i++) {
    if (accumulatedWidth + columnWidths[i] > scrollLeft) {
      firstColumnIndex = Math.max(0, i - overscan);
      break;
    }
    accumulatedWidth += columnWidths[i];
  }

  offsetLeft = columnWidths.slice(0, firstColumnIndex).reduce((sum, width) => sum + width, 0);

  accumulatedWidth = offsetLeft;
  for (let i = firstColumnIndex; i < columnWidths.length; i++) {
    accumulatedWidth += columnWidths[i];
    if (accumulatedWidth >= scrollLeft + viewportWidth) {
      lastColumnIndex = Math.min(columnWidths.length - 1, i + overscan);
      break;
    }
  }

  const totalHeight = totalRows * rowHeight;
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);
  const offsetTop = firstRowIndex * rowHeight;

  return {
    renderContext: {
      firstRowIndex,
      lastRowIndex,
      firstColumnIndex,
      lastColumnIndex
    },
    offsetTop,
    offsetLeft,
    totalHeight,
    totalWidth
  };
}

export function getRowPosition(rowIndex: number, rowHeight: number): number {
  return rowIndex * rowHeight;
}

export function getColumnPosition(colIndex: number, columnWidths: number[]): number {
  return columnWidths.slice(0, colIndex).reduce((sum, width) => sum + width, 0);
}

export function isRowVisible(
  rowIndex: number,
  renderContext: GridRenderContext
): boolean {
  return rowIndex >= renderContext.firstRowIndex && rowIndex <= renderContext.lastRowIndex;
}

export function isColumnVisible(
  colIndex: number,
  renderContext: GridRenderContext
): boolean {
  return colIndex >= renderContext.firstColumnIndex && colIndex <= renderContext.lastColumnIndex;
}
