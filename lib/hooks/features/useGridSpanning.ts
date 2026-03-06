
import { useState, useCallback, useEffect } from 'react';
import type { GridRowId, GridColDef, GridRowModel, GridRenderCellParams } from '../../types';

type ColumnKey = string;

export type CellColSpanInfo = 
  | { 
      spannedByColSpan: true; 
      rightVisibleCellIndex: number; 
      leftVisibleCellIndex: number; 
    }
  | { 
      spannedByColSpan: false; 
      cellProps: { 
        colSpan: number; 
        width: number; 
      }; 
    };

type ColspanMap = Map<GridRowId, Record<ColumnKey, CellColSpanInfo>>;

export interface RowSpanningCaches {
  spannedCells: Record<GridRowId, Record<ColumnKey, number>>;
  hiddenCells: Record<GridRowId, Record<ColumnKey, boolean>>;
  hiddenCellOriginMap: Record<number, Record<ColumnKey, number>>;
}

export interface RowSpanningState {
  caches: RowSpanningCaches;
  processedRange: { firstRowIndex: number; lastRowIndex: number; };
}

export function useGridSpanning<R extends GridRowModel>(
  rows: R[],
  columns: GridColDef<R>[],
  columnWidths: Record<string, number>
) {

  const [colspanMap, setColspanMap] = useState<ColspanMap>(new Map());

  const [rowSpanningState, setRowSpanningState] = useState<RowSpanningState>({
    caches: {
      spannedCells: {},
      hiddenCells: {},
      hiddenCellOriginMap: {}
    },
    processedRange: { firstRowIndex: 0, lastRowIndex: 0 }
  });

  const resetColSpan = useCallback(() => {
    setColspanMap(new Map());
  }, []);

  const getCellColSpanInfo = useCallback((rowId: GridRowId, field: string): CellColSpanInfo | undefined => {
    return colspanMap.get(rowId)?.[field];
  }, [colspanMap]);

  const calculateColSpan = useCallback((
    rowId: GridRowId,
    row: R,
    rowIndex: number,
    minFirstColumn: number,
    maxLastColumn: number
  ) => {
    const newMap = new Map(colspanMap);

    for (let i = minFirstColumn; i < maxLastColumn; i++) {
      const colDef = columns[i];
      if (!colDef) continue;

      let colSpan = 1;
      if (colDef.colSpan) {
        if (typeof colDef.colSpan === 'function') {
          const params: GridRenderCellParams<R> = {
            row,
            value: row[colDef.field as keyof R],
            field: colDef.field,
            colDef,
            rowIndex,
            colIndex: i 
          };
          colSpan = colDef.colSpan(params);
        } else {
          colSpan = colDef.colSpan;
        }
      }

      if (colSpan <= 1) {
        setCellColSpanInfo(newMap, rowId, colDef.field, {
          spannedByColSpan: false,
          cellProps: { colSpan: 1, width: columnWidths[colDef.field] || 100 }
        });
        continue;
      }

      let width = columnWidths[colDef.field] || 100;
      for (let j = 1; j < colSpan; j++) {
        if (i + j < maxLastColumn) {
          const nextCol = columns[i + j];
          if (nextCol) {
            width += columnWidths[nextCol.field] || 100;

            setCellColSpanInfo(newMap, rowId, nextCol.field, {
              spannedByColSpan: true,
              leftVisibleCellIndex: i,
              rightVisibleCellIndex: Math.min(i + colSpan - 1, columns.length - 1)
            });
          }
        }
      }

      setCellColSpanInfo(newMap, rowId, colDef.field, {
        spannedByColSpan: false,
        cellProps: { colSpan, width }
      });

      i += colSpan - 1; 
    }

    setColspanMap(newMap);
  }, [colspanMap, columns, columnWidths]);

  const calculateRowSpan = useCallback((
    firstRowIndex: number,
    lastRowIndex: number
  ) => {
    const spannedCells: Record<GridRowId, Record<ColumnKey, number>> = {};
    const hiddenCells: Record<GridRowId, Record<ColumnKey, boolean>> = {};
    const hiddenCellOriginMap: Record<number, Record<ColumnKey, number>> = {};

    columns.forEach((colDef, columnIndex) => {

      if (!colDef.rowSpan) return;

      for (let index = firstRowIndex; index < lastRowIndex; index++) {
        const row = rows[index];
        if (!row) continue;

        if (hiddenCells[row.id]?.[colDef.field]) continue;

        const cellValue = colDef.valueGetter
          ? colDef.valueGetter({ row, field: colDef.field, value: row[colDef.field as keyof R] })
          : row[colDef.field as keyof R];

        let span = 1;
        if (typeof colDef.rowSpan === 'function') {
            const params: GridRenderCellParams<R> = {
                row,
                value: cellValue,
                field: colDef.field,
                colDef,
                rowIndex: index,
                colIndex: columnIndex
            };
            span = colDef.rowSpan(params);
        } else if (typeof colDef.rowSpan === 'number') {
            span = colDef.rowSpan;
        }

        if (span > 1) {
          if (!spannedCells[row.id]) spannedCells[row.id] = {};
          spannedCells[row.id][colDef.field] = span; 

          for (let k = 1; k < span; k++) {
            const nextIndex = index + k;
            if (nextIndex < lastRowIndex && rows[nextIndex]) {
              const nextRow = rows[nextIndex];
              if (!hiddenCells[nextRow.id]) hiddenCells[nextRow.id] = {};
              hiddenCells[nextRow.id][colDef.field] = true; 

              if (!hiddenCellOriginMap[nextIndex]) hiddenCellOriginMap[nextIndex] = {};
              hiddenCellOriginMap[nextIndex][colDef.field] = index; 
            }
          }
        }
      }
    });

    setRowSpanningState({
      caches: { spannedCells, hiddenCells, hiddenCellOriginMap },
      processedRange: { firstRowIndex, lastRowIndex }
    });
  }, [rows, columns]);

  const resetRowSpan = useCallback(() => {
    setRowSpanningState({
      caches: {
        spannedCells: {},
        hiddenCells: {},
        hiddenCellOriginMap: {}
      },
      processedRange: { firstRowIndex: 0, lastRowIndex: 0 }
    });
  }, []);

  useEffect(() => {

    const newMap = new Map<GridRowId, Record<ColumnKey, CellColSpanInfo>>();

    rows.forEach((row, index) => {
      for (let i = 0; i < columns.length; i++) {
        const colDef = columns[i];
        if (!colDef) continue;

        let colSpan = 1;
        if (colDef.colSpan) {
          if (typeof colDef.colSpan === 'function') {
            const params: GridRenderCellParams<R> = {
              row,
              value: row[colDef.field as keyof R],
              field: colDef.field,
              colDef,
              rowIndex: index,
              colIndex: i
            };
            colSpan = colDef.colSpan(params);
          } else {
            colSpan = colDef.colSpan;
          }
        }

        if (colSpan <= 1) {
          const colWidth = columnWidths[colDef.field] || (typeof colDef.width === 'number' ? colDef.width : 100);
          setCellColSpanInfo(newMap, row.id, colDef.field, {
            spannedByColSpan: false,
            cellProps: { colSpan: 1, width: colWidth }
          });
          continue;
        }

        let width = columnWidths[colDef.field] || (typeof colDef.width === 'number' ? colDef.width : 100);
        for (let j = 1; j < colSpan; j++) {
          if (i + j < columns.length) {
            const nextCol = columns[i + j];
            if (nextCol) {
              const nextColWidth = columnWidths[nextCol.field] || (typeof nextCol.width === 'number' ? nextCol.width : 100);
              width += nextColWidth;

              setCellColSpanInfo(newMap, row.id, nextCol.field, {
                spannedByColSpan: true,
                leftVisibleCellIndex: i,
                rightVisibleCellIndex: Math.min(i + colSpan - 1, columns.length - 1)
              });
            }
          }
        }

        setCellColSpanInfo(newMap, row.id, colDef.field, {
          spannedByColSpan: false,
          cellProps: { colSpan, width }
        });

        i += colSpan - 1; 
      }
    });

    setColspanMap(newMap);

    const spannedCells: Record<GridRowId, Record<ColumnKey, number>> = {};
    const hiddenCells: Record<GridRowId, Record<ColumnKey, boolean>> = {};
    const hiddenCellOriginMap: Record<number, Record<ColumnKey, number>> = {};

    columns.forEach((colDef, columnIndex) => {
      if (!colDef.rowSpan) return;

      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (!row) continue;

        if (hiddenCells[row.id]?.[colDef.field]) continue;

        const cellValue = colDef.valueGetter
          ? colDef.valueGetter({ row, field: colDef.field, value: row[colDef.field as keyof R] })
          : row[colDef.field as keyof R];

        let span = 1;
        if (typeof colDef.rowSpan === 'function') {
            const params: GridRenderCellParams<R> = {
                row,
                value: cellValue,
                field: colDef.field,
                colDef,
                rowIndex: index,
                colIndex: columnIndex
            };
            span = colDef.rowSpan(params);
        } else if (typeof colDef.rowSpan === 'number') {
            span = colDef.rowSpan;
        }

        if (span > 1) {
          if (!spannedCells[row.id]) spannedCells[row.id] = {};
          spannedCells[row.id][colDef.field] = span;

          for (let k = 1; k < span; k++) {
            const nextIndex = index + k;
            if (nextIndex < rows.length && rows[nextIndex]) {
              const nextRow = rows[nextIndex];
              if (!hiddenCells[nextRow.id]) hiddenCells[nextRow.id] = {};
              hiddenCells[nextRow.id][colDef.field] = true;

              if (!hiddenCellOriginMap[nextIndex]) hiddenCellOriginMap[nextIndex] = {};
              hiddenCellOriginMap[nextIndex][colDef.field] = index;
            }
          }
        }
      }
    });

    setRowSpanningState({
      caches: { spannedCells, hiddenCells, hiddenCellOriginMap },
      processedRange: { firstRowIndex: 0, lastRowIndex: rows.length }
    });
  }, [rows, columns, columnWidths]);

  const getSpannedCells = useCallback(() => rowSpanningState.caches.spannedCells, [rowSpanningState]);
  const getHiddenCells = useCallback(() => rowSpanningState.caches.hiddenCells, [rowSpanningState]);
  const getHiddenCellOriginMap = useCallback(() => rowSpanningState.caches.hiddenCellOriginMap, [rowSpanningState]);

  return {

    colspanMap,
    resetColSpan,
    getCellColSpanInfo,
    calculateColSpan,

    rowSpanningState,
    calculateRowSpan,
    resetRowSpan,
    getSpannedCells,
    getHiddenCells,
    getHiddenCellOriginMap
  };
}

function setCellColSpanInfo(
  map: ColspanMap,
  rowId: GridRowId,
  field: string,
  info: CellColSpanInfo
) {
  let columnInfo = map.get(rowId);
  if (!columnInfo) {
    columnInfo = {};
    map.set(rowId, columnInfo);
  }
  columnInfo[field] = info;
}
