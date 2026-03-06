
import type { GridRowModel, GridSortItem } from '../../types';

export function compareValues(a: any, b: any, direction: 'asc' | 'desc'): number {

  if (a == null && b == null) return 0;
  if (a == null) return direction === 'asc' ? 1 : -1;
  if (b == null) return direction === 'asc' ? -1 : 1;

  if (typeof a === 'number' && typeof b === 'number') {
    return direction === 'asc' ? a - b : b - a;
  }

  if (a instanceof Date && b instanceof Date) {
    return direction === 'asc' 
      ? a.getTime() - b.getTime() 
      : b.getTime() - a.getTime();
  }

  const aStr = String(a).toLowerCase();
  const bStr = String(b).toLowerCase();

  if (direction === 'asc') {
    return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
  } else {
    return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
  }
}

export function sortRows<R extends GridRowModel>(
  rows: R[],
  sortModel: GridSortItem[]
): R[] {
  if (sortModel.length === 0) {
    return rows;
  }

  const sortedRows = [...rows];

  sortedRows.sort((a, b) => {
    for (const sortItem of sortModel) {
      const aValue = a[sortItem.field];
      const bValue = b[sortItem.field];

      const comparison = compareValues(aValue, bValue, sortItem.sort);

      if (comparison !== 0) {
        return comparison;
      }
    }
    return 0;
  });

  return sortedRows;
}
