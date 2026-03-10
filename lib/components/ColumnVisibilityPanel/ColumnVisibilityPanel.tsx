import { useState, useMemo, useRef } from 'react';
import { Checkbox } from '../ui/Checkbox';
import type { GridColDef, GridRowModel } from '../../types';


export interface ColumnVisibilityPanelProps<R extends GridRowModel = GridRowModel> {
    columns: GridColDef<R>[];
    visibleColumns: Set<string>;
    onVisibilityChange: (field: string, isVisible: boolean) => void;
    onShowAll: () => void;
    onHideAll: () => void;
    onColumnReorder?: (fromField: string, toField: string) => void;
}

function SearchIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

function DragHandleIcon() {
    return (
        <svg
            className="ogx-column-visibility-panel__drag-handle"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <circle cx="9"  cy="5"  r="1.5" />
            <circle cx="15" cy="5"  r="1.5" />
            <circle cx="9"  cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9"  cy="19" r="1.5" />
            <circle cx="15" cy="19" r="1.5" />
        </svg>
    );
}

export function ColumnVisibilityPanel<R extends GridRowModel = GridRowModel>(
    props: ColumnVisibilityPanelProps<R>
) {
    const { columns, visibleColumns, onVisibilityChange, onShowAll, onHideAll, onColumnReorder } = props;
    const [searchQuery, setSearchQuery] = useState('');
    const [dragOverField, setDragOverField] = useState<string | null>(null);
    const dragFieldRef = useRef<string | null>(null);

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

    // ── Drag handlers ──────────────────────────────────────────────────────────
    const handleDragStart = (field: string) => (e: React.DragEvent) => {
        dragFieldRef.current = field;
        e.dataTransfer.effectAllowed = 'move';
        // Use a ghost image offset so the handle looks natural
        e.dataTransfer.setDragImage(e.currentTarget.closest('.ogx-column-visibility-panel__item') as HTMLElement, 20, 20);
    };

    const handleDragOver = (field: string) => (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (field !== dragFieldRef.current) {
            setDragOverField(field);
        }
    };

    const handleDragLeave = () => {
        setDragOverField(null);
    };

    const handleDrop = (toField: string) => (e: React.DragEvent) => {
        e.preventDefault();
        const fromField = dragFieldRef.current;
        setDragOverField(null);
        dragFieldRef.current = null;
        if (fromField && fromField !== toField && onColumnReorder) {
            onColumnReorder(fromField, toField);
        }
    };

    const handleDragEnd = () => {
        setDragOverField(null);
        dragFieldRef.current = null;
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
                    const isDragOver = dragOverField === col.field;
                    const canReorder = !!onColumnReorder && !searchQuery;

                    return (
                        <div
                            key={col.field}
                            className={[
                                'ogx-column-visibility-panel__item',
                                !isHideable && 'ogx-column-visibility-panel__item--disabled',
                                isDragOver && 'ogx-column-visibility-panel__item--drag-over',
                            ].filter(Boolean).join(' ')}
                            draggable={canReorder}
                            onDragOver={canReorder ? handleDragOver(col.field) : undefined}
                            onDragLeave={canReorder ? handleDragLeave : undefined}
                            onDrop={canReorder ? handleDrop(col.field) : undefined}
                            onDragEnd={canReorder ? handleDragEnd : undefined}
                        >
                            {canReorder && (
                                <span
                                    className="ogx-column-visibility-panel__drag-handle-wrapper"
                                    draggable
                                    onDragStart={handleDragStart(col.field)}
                                    title="Drag to reorder"
                                >
                                    <DragHandleIcon />
                                </span>
                            )}
                            <label
                                className="ogx-column-visibility-panel__item-label"
                                style={{ display: 'flex', alignItems: 'center', gap: 'var(--ogx-spacing-md)', flex: 1, cursor: isHideable ? 'pointer' : 'not-allowed' }}
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
                        </div>
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
