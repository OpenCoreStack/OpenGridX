export type GridFilterOperator =
  | 'contains'
  | 'equals'
  | 'startsWith'
  | 'endsWith'
  | 'isEmpty'
  | 'isNotEmpty'
  | 'isAnyOf'
  | '='
  | '>'
  | '>='
  | '<'
  | '<='
  | '!='
  | 'is'
  | 'not'
  | 'after'
  | 'onOrAfter'
  | 'before'
  | 'onOrBefore';

/** Describes a filter condition for a specific column. */
export interface GridFilterItem {
  /** Optional ID for the filter item. */
  id?: string | number;
  /** The field name to filter. */
  field: string;
  /** The comparison operator. */
  operator: GridFilterOperator;
  /** The value to compare against. */
  value?: unknown;
}

/** Describes a group of filters combined with a logical operator. */
export interface GridFilterGroup {
    /** Optional ID for the group. */
    id?: string | number;
    /** Logical operator to join child items ('and' | 'or'). */
    logicOperator: 'and' | 'or';
    /** Array of child filter items or groups. */
    items: (GridFilterItem | GridFilterGroup)[];
}

/** The overall state of grid filtering. */
export interface GridFilterModel {
  /** Root-level filter items or groups. */
  items?: (GridFilterItem | GridFilterGroup)[];
  /** Global logical operator (defaults to 'and'). */
  logicOperator?: 'and' | 'or';
  /** Array of strings used for the quick search feature across all columns. */
  quickFilterValues?: string[];
}
