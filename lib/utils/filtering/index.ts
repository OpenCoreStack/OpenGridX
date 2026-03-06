
import type { GridRowModel, GridFilterItem, GridFilterModel, GridFilterGroup } from '../../types';

export const FILTER_OPERATORS = {
  contains: (value: any, filterValue: any): boolean => {
    if (value == null || filterValue == null) return false;
    return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
  },

  equals: (value: any, filterValue: any): boolean => {
    if (value == null && filterValue == null) return true;
    if (value == null || filterValue == null) return false;
    return String(value).toLowerCase() === String(filterValue).toLowerCase();
  },

  startsWith: (value: any, filterValue: any): boolean => {
    if (value == null || filterValue == null) return false;
    return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
  },

  endsWith: (value: any, filterValue: any): boolean => {
    if (value == null || filterValue == null) return false;
    return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
  },

  isEmpty: (value: any): boolean => {
    return value == null || String(value).trim() === '';
  },

  isNotEmpty: (value: any): boolean => {
    return value != null && String(value).trim() !== '';
  },

  '>': (value: any, filterValue: any): boolean => {
    if (value == null || filterValue == null) return false;
    const numValue = Number(value);
    const numFilter = Number(filterValue);
    if (isNaN(numValue) || isNaN(numFilter)) return false;
    return numValue > numFilter;
  },

  '>=': (value: any, filterValue: any): boolean => {
    if (value == null || filterValue == null) return false;
    const numValue = Number(value);
    const numFilter = Number(filterValue);
    if (isNaN(numValue) || isNaN(numFilter)) return false;
    return numValue >= numFilter;
  },

  '<': (value: any, filterValue: any): boolean => {
    if (value == null || filterValue == null) return false;
    const numValue = Number(value);
    const numFilter = Number(filterValue);
    if (isNaN(numValue) || isNaN(numFilter)) return false;
    return numValue < numFilter;
  },

  '<=': (value: any, filterValue: any): boolean => {
    if (value == null || filterValue == null) return false;
    const numValue = Number(value);
    const numFilter = Number(filterValue);
    if (isNaN(numValue) || isNaN(numFilter)) return false;
    return numValue <= numFilter;
  },

  '!=': (value: any, filterValue: any): boolean => {
    if (filterValue == null || filterValue === '') return true;
    // Numeric comparison if both are numbers, otherwise string
    const numV = Number(value);
    const numF = Number(filterValue);
    if (!isNaN(numV) && !isNaN(numF)) return numV !== numF;
    return String(value).toLowerCase() !== String(filterValue).toLowerCase();
  },

  isAnyOf: (value: any, filterValue: any[]): boolean => {
    if (value == null || !Array.isArray(filterValue)) return false;
    return filterValue.some(v => 
      String(value).toLowerCase() === String(v).toLowerCase()
    );
  },

  not: (value: any, filterValue: any): boolean => {
      if (value == null && filterValue == null) return false;
      if (value == null || filterValue == null) return true;
      return String(value).toLowerCase() !== String(filterValue).toLowerCase();
  },

  // Used by boolean and singleSelect — case-insensitive string comparison
  is: (value: any, filterValue: any): boolean => {
      if (filterValue == null || filterValue === '') return true;
      const rowStr = String(value).toLowerCase();
      const filterStr = String(filterValue).toLowerCase();
      return rowStr === filterStr;
  },

  '=': (value: any, filterValue: any): boolean => {
      if (value == null || filterValue == null || filterValue === '') return false;
      return Number(value) === Number(filterValue);
  },
};

/**
 * Apply a single filter item to a row
 */
export function applyFilterItem<R extends GridRowModel>(
  row: R,
  filterItem: GridFilterItem
): boolean {
  const { field, operator, value } = filterItem;

  // Get the value from the row
  const rowValue = row[field];

  // Get the operator function
  const operatorFn = FILTER_OPERATORS[operator];
  if (!operatorFn) {
    console.warn(`Unknown filter operator: ${operator}`);
    return true;
  }

  // Apply the operator
  return operatorFn(rowValue, value);
}

/**
 * Apply quick filter (global search across all fields)
 */
export function applyQuickFilter<R extends GridRowModel>(
  row: R,
  quickFilterValues: string[]
): boolean {
  if (!quickFilterValues || quickFilterValues.length === 0) {
    return true;
  }

  // Check if any quick filter value matches any field in the row
  return quickFilterValues.every(filterValue => {
    const searchTerm = filterValue.toLowerCase();
    return Object.values(row).some(value => {
      if (value == null) return false;
      return String(value).toLowerCase().includes(searchTerm);
    });
  });
}

/**
 * Filter rows based on filter model
 */
/**
 * Check if a row matches the filter model
 */
export function isRowMatchingFilter<R extends GridRowModel>(
  row: R,
  filterModel: GridFilterModel | GridFilterGroup // Accept Model or Group (similar structure)
): boolean {
  // Normalize input: GridFilterModel matches GridFilterGroup shape largely, but let's be safe

  const items = (filterModel as any).items || [];
  const logicOperator = (filterModel as any).logicOperator || 'and';
  const quickFilterValues = (filterModel as any).quickFilterValues || [];

  if (quickFilterValues.length > 0 && !applyQuickFilter(row, quickFilterValues)) {
    return false;
  }

  if (items.length === 0) {
    return true;
  }

  const evaluateItem = (item: GridFilterItem | GridFilterGroup): boolean => {
    if ('logicOperator' in item && 'items' in item) {

       const group = item as GridFilterGroup;
       const groupItems = group.items;
       if (groupItems.length === 0) return true;

       if (group.logicOperator === 'and') {
           return groupItems.every(evaluateItem);
       } else {
           return groupItems.some(evaluateItem);
       }
    } else {

       return applyFilterItem(row, item as GridFilterItem);
    }
  };

  if (logicOperator === 'and') {

    return items.every(evaluateItem);
  } else {

    return items.some(evaluateItem);
  }
}

export function filterRows<R extends GridRowModel>(
  rows: R[],
  filterModel: GridFilterModel
): R[] {
  if (!filterModel) return rows;

  const { items = [], quickFilterValues = [] } = filterModel;

  if (items.length === 0 && (!quickFilterValues || quickFilterValues.length === 0)) {
    return rows;
  }

  return rows.filter(row => isRowMatchingFilter(row, filterModel));
}

export function getDefaultOperator(type?: string): string {
  switch (type) {
    case 'number':
      return '=';
    case 'date':
      return 'is';
    case 'boolean':
      return 'is';
    case 'singleSelect':
      return 'isAnyOf';
    default:
      return 'contains';
  }
}

export function getOperatorsForType(type?: string): string[] {
  switch (type) {
    case 'number':
      return ['=', '!=', '>', '>=', '<', '<=', 'isEmpty', 'isNotEmpty'];
    case 'date':
      return ['is', 'not', 'after', 'onOrAfter', 'before', 'onOrBefore', 'isEmpty', 'isNotEmpty'];
    case 'boolean':
      return ['is'];
    case 'singleSelect':
      return ['isAnyOf', 'is', 'not'];
    default:
      return ['contains', 'equals', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'];
  }
}
