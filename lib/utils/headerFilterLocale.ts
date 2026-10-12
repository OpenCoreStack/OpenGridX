import type { GridFilterOperator, GridLocaleText } from '../types';
import { HEADER_FILTER_OPERATOR_LABELS } from './headerFilters';

/** The header filter row's strings, with the English defaults filled in. */
export interface HeaderFilterLocale {
    custom: string;
    customTooltip: string;
    cellLabel: (header: string) => string;
    valueLabel: (header: string) => string;
    operatorButtonLabel: (header: string, operatorLabel: string) => string;
    operatorMenuLabel: (header: string) => string;
    clearLabel: (header: string) => string;
    clearTooltip: string;
    any: string;
    yes: string;
    no: string;
    operator: (operator: GridFilterOperator) => string;
}

/** Resolves the header filter strings of `localeText`, falling back to English. */
export function resolveHeaderFilterLocale(localeText: GridLocaleText | undefined): HeaderFilterLocale {
    const operators = localeText?.headerFilterOperators;
    return {
        custom: localeText?.headerFilterCustom ?? 'Custom filter',
        customTooltip: localeText?.headerFilterCustomTooltip ?? 'Set in the filter panel',
        cellLabel: localeText?.headerFilterCellLabel ?? (h => `Filter ${h}`),
        valueLabel: localeText?.headerFilterValueLabel ?? (h => `Filter value for ${h}`),
        operatorButtonLabel: localeText?.headerFilterOperatorButtonLabel ?? ((h, op) => `Filter operator for ${h}: ${op}`),
        operatorMenuLabel: localeText?.headerFilterOperatorMenuLabel ?? (h => `Filter operator for ${h}`),
        clearLabel: localeText?.headerFilterClearLabel ?? (h => `Clear filter for ${h}`),
        clearTooltip: localeText?.headerFilterClearTooltip ?? 'Clear',
        any: localeText?.headerFilterAny ?? 'Any',
        yes: localeText?.headerFilterTrue ?? 'Yes',
        no: localeText?.headerFilterFalse ?? 'No',
        operator: op => operators?.[op] ?? HEADER_FILTER_OPERATOR_LABELS[op] ?? op,
    };
}
