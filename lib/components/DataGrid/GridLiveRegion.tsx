import { getDataSourceErrorMessage } from '../../utils/dataSource';
import type { GridFilterModel } from '../../types';

interface GridLiveRegionProps {
    loading: boolean;
    /** The dataSource error, if any. */
    error: unknown;
    noRowsLabel: string;
    /** Rows that pass the filter (grid rows, group rows included). */
    filteredRowCount: number;
    /** Data rows that pass the filter: the "n rows found" count. */
    dataRowCount: number;
    filterModel: GridFilterModel | undefined;
}

/** Polite status announcements: loading, a load error, no rows, or the row count of an active filter. */
export function GridLiveRegion({ loading, error, noRowsLabel, filteredRowCount, dataRowCount, filterModel }: GridLiveRegionProps) {
    return (
        <div className="ogx-aria-live-status" role="status" aria-live="polite">
            {loading ? 'Loading data...' : ''}
            {error ? `Error: ${getDataSourceErrorMessage(error)}` : ''}
            {!loading && !error && (
                filteredRowCount === 0
                    ? noRowsLabel
                    : (filterModel && ((filterModel.quickFilterValues?.length || 0) > 0 || (filterModel.items?.length || 0) > 0))
                        ? `${dataRowCount} ${dataRowCount === 1 ? 'row' : 'rows'} found`
                        : ''
            )}
        </div>
    );
}
