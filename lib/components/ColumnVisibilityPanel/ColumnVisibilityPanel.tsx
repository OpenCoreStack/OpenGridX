import { useState, useMemo } from 'react';
import { Checkbox } from '../ui/Checkbox';
import type { GridColDef, GridRowModel } from '../../types';


export interface ColumnVisibilityPanelProps<R extends GridRowModel = GridRowModel> {
    columns: GridColDef<R>[];
    visibleColumns: Set<string>;
    onVisibilityChange: (field: string, isVisible: boolean) => void;
    onShowAll: () => void;
    onHideAll: () => void;
}

function SearchIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

export function ColumnVisibilityPanel<R extends GridRowModel = GridRowModel>(
    props: ColumnVisibilityPanelProps<R>
) {
    const { columns, visibleColumns, onVisibilityChange, onShowAll, onHideAll } = props;
    const [searchQuery, setSearchQuery] = useState('');

    const hideableColumns = useMemo(() => columns.filter(col => col.hideable !== false), [columns]);
    const allVisible = hideableColumns.every(col => visibleColumns.has(col.field));

    const filteredColumns = useMemo(() => {
        if (!searchQuery) return columns;
        const lowerQuery = searchQuery.toLowerCase();
        return columns.filter(col =>
            (col.headerName || col.field).toLowerCase().includes(lowerQuery)
        );
    }, [columns, searchQuery]);

    const handleToggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            onShowAll();
        } else {
            onHideAll();
        }
    };

    return (
        <div className="ogx-column-visibility-panel">
            <div className="ogx-column-visibility-panel__search-section">
                <div className="ogx-column-visibility-panel__search-container">
                    <SearchIcon />
                    <input
                        id="ogx-column-search"
                        name="ogx-column-search"
                        autoComplete="off"
                        className="ogx-column-visibility-panel__search-input"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="ogx-column-visibility-panel__list">
                {filteredColumns.map(col => {
                    const isVisible = visibleColumns.has(col.field);
                    const isHideable = col.hideable !== false;

                    return (
                        <label
                            key={col.field}
                            className={`ogx-column-visibility-panel__item ${!isHideable ? 'ogx-column-visibility-panel__item--disabled' : ''}`}
                        >
                            <Checkbox
                                checked={isVisible}
                                onChange={(e) => onVisibilityChange(col.field, e.target.checked)}
                                disabled={!isHideable}
                            />
                            <span className="ogx-column-visibility-panel__label">
                                {col.headerName || col.field}
                            </span>
                        </label>
                    );
                })}
            </div>

            <div className="ogx-column-visibility-panel__footer">
                <label className="ogx-column-visibility-panel__item">
                    <Checkbox
                        checked={allVisible}
                        onChange={handleToggleAll}
                    />
                    <span className="ogx-column-visibility-panel__label">
                        Show/Hide All
                    </span>
                </label>
                <button
                    className="ogx-column-visibility-panel__reset-btn"
                    onClick={onShowAll}
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
