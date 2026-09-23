import './Docs.css';

export default function APIDocumentation() {
    const gridProps = [
        // Core Data
        { name: 'rows', type: 'R[]', default: 'required', desc: 'Array of data objects to display (pass [] when a dataSource supplies them).' },
        { name: 'columns', type: 'GridColDef<R>[]', default: 'required', desc: 'Column definitions controlling display, sorting, and editing.' },
        { name: 'getRowId', type: '(row: GridRowModel) => GridRowId', default: 'row.id', desc: 'Returns a unique identifier for each row. Only keys the internal store; rows are never copied or given an id.' },
        // Layout
        { name: 'height', type: 'number | string', default: 'undefined', desc: 'Height of the grid container (pixels or a CSS length).' },
        { name: 'rowHeight', type: 'number', default: '52', desc: 'Height of each row in pixels.' },
        { name: 'headerHeight', type: 'number', default: '56', desc: 'Height of the header row in pixels.' },
        { name: 'autoHeight', type: 'boolean', default: 'false', desc: 'Expand the grid height to exactly fit all rows (no scrollbar).' },
        // State
        { name: 'loading', type: 'boolean', default: 'false', desc: 'Renders a full-grid skeleton overlay.' },
        { name: 'initialState', type: 'GridInitialState', default: 'undefined', desc: 'Seed state on first render (sorting, filters, pagination, column widths).' },
        { name: 'noRowsLabel', type: 'string', default: "'No Data'", desc: 'Message displayed when the grid has no rows.' },
        // Selection
        { name: 'checkboxSelection', type: 'boolean', default: 'false', desc: 'Add a checkbox column for multi-row selection.' },
        { name: 'rowSelectionModel', type: 'GridRowId[]', default: 'undefined', desc: 'Controlled selection state.' },
        { name: 'onRowSelectionModelChange', type: '(model: GridRowId[]) => void', default: '—', desc: 'Fired when row selection changes.' },
        // Pagination
        { name: 'pagination', type: 'boolean', default: 'false', desc: 'Enable the bottom pagination bar.' },
        { name: 'paginationMode', type: "'client' | 'server' | 'infinite'", default: "'client'", desc: 'Controls whether paging is handled locally or server-side.' },
        { name: 'paginationModel', type: 'GridPaginationModel', default: '{page:0, pageSize:100}', desc: 'Current page index and page size.' },
        { name: 'rowCount', type: 'number', default: '—', desc: 'Server total for paginationMode="server" when you fetch pages yourself (a dataSource response rowCount wins).' },
        { name: 'pageSizeOptions', type: 'number[]', default: '[10,25,50,100]', desc: 'Available page size choices.' },
        // Sorting & Filtering
        { name: 'sortModel', type: 'GridSortItem[]', default: 'undefined', desc: 'Controlled sort state.' },
        { name: 'filterModel', type: 'GridFilterModel', default: 'undefined', desc: 'Controlled filter state.' },
        { name: 'sortingMode', type: "'client' | 'server'", default: "'client'", desc: 'Where sorting logic runs.' },
        { name: 'filterMode', type: "'client' | 'server'", default: "'client'", desc: 'Where filtering logic runs.' },
        // Column Features
        { name: 'columnVisibilityModel', type: 'Record<string, boolean>', default: '{}', desc: 'Controls which columns are visible.' },
        { name: 'pinnedColumns', type: 'GridColumnPinning', default: 'undefined', desc: 'Pin columns to left or right edges.' },
        { name: 'columnOrder', type: 'string[]', default: 'undefined', desc: 'Controlled column order by field name.' },
        { name: 'disableColumnReorder', type: 'boolean', default: 'false', desc: 'Disables drag-to-reorder column headers.' },
        // Row Features
        { name: 'pinnedRows', type: 'GridRowPinning', default: 'undefined', desc: 'Row IDs pinned to the top or bottom of the grid.' },
        { name: 'rowReordering', type: 'boolean', default: 'false', desc: 'Allow users to drag rows to reorder them.' },
        { name: 'rowGroupingModel', type: 'string[]', default: 'undefined', desc: 'Fields to group rows by.' },
        // Tree Data
        { name: 'treeData', type: 'boolean', default: 'false', desc: 'Enable hierarchical tree data mode.' },
        { name: 'getTreeDataPath', type: '(row) => string[]', default: '—', desc: 'Returns the path for a row in tree data mode.' },
        // Aggregation
        { name: 'aggregationModel', type: 'GridAggregationModel', default: 'undefined', desc: 'Column-level aggregation functions (sum, avg, min, max, count).' },
        // Pivot
        { name: 'pivotMode', type: 'boolean', default: 'false', desc: 'Enable pivot table mode.' },
        { name: 'pivotModel', type: 'GridPivotModel', default: 'undefined', desc: 'Active pivot configuration (rows, columns, values).' },
        // Editing
        { name: 'processRowUpdate', type: '(newRow, oldRow) => R | Promise<R>', default: '—', desc: 'Called once per committed cell edit. Return the updated row (or a Promise of it).' },
        { name: 'isCellEditable', type: '(params) => boolean', default: '—', desc: 'Per-cell veto over editable columns. Applies to double-click, Enter, Tab and aria-readonly.' },
        // Server-Side
        { name: 'dataSource', type: 'GridDataSource', default: '—', desc: 'Remote data provider. Drives server-side sorting, filtering, pagination.' },
        // List View
        { name: 'listView', type: 'boolean', default: 'false', desc: 'Render rows using a single custom cell (card view).' },
        { name: 'listViewColumn', type: 'GridListViewColDef', default: '—', desc: 'The single column definition used in list view mode.' },
        // Customization
        { name: 'slots', type: 'GridSlots', default: '—', desc: 'Override internal components: toolbar, pagination, noRowsOverlay, loadingOverlay, footer.' },
        { name: 'slotProps', type: 'GridSlotProps', default: '—', desc: 'Props forwarded to slot components. slotProps.toolbar is typed as GridToolbarProps plus extra keys.' },
        { name: 'groupingColDef', type: 'Partial<GridColDef<R>>', default: '—', desc: 'Configures the __group__ column shown while rowGroupingModel is active. No field needed.' },
        { name: 'className', type: 'string', default: '—', desc: 'Additional CSS class on the root grid element.' },
        { name: 'style', type: 'React.CSSProperties', default: '—', desc: 'Inline styles on the root grid element.' },
        { name: 'ariaLabel', type: 'string', default: '—', desc: 'Accessible label for the grid.' },
        // Events
        { name: 'onRowClick', type: '(params: GridRowParams) => void', default: '—', desc: 'Fired when a row is clicked.' },
        { name: 'onCellClick', type: '(params: GridCellParams) => void', default: '—', desc: 'Fired when a cell is clicked.' },
        { name: 'onStateChange', type: '(state: GridState) => void', default: '—', desc: 'Fired on mount and whenever the sort, filter, pagination, column or density state changes value.' },
        { name: 'onRowsScrollEnd', type: '(params: GridRowScrollEndParams) => void', default: '—', desc: 'Fired once each time the viewport comes within 100px of the bottom of the rows.' },
        { name: 'onColumnOrderChange', type: '(params) => void', default: '—', desc: 'Fired after a column is reordered by drag.' },
        { name: 'onColumnOrderModelChange', type: '(columnOrder: string[]) => void', default: '—', desc: 'Fired with the whole new column order after every change, including the Columns panel Reset.' },
        { name: 'onRowOrderChange', type: '(params) => void', default: '—', desc: 'Fired after a row is reordered (rowReordering must be true). oldIndex / targetIndex are positions in rows.' },
    ];

    const apiRefMethods = [
        { method: 'getRow(id)', return: 'GridRowModel | null', desc: 'Get row data by ID.' },
        { method: 'getAllRows()', return: 'GridRowModel[]', desc: 'Get all loaded rows.' },
        { method: 'getVisibleRows()', return: 'GridRowModel[]', desc: 'Get the rows on screen: pinned rows plus the current page (or all filtered rows).' },
        { method: 'getColumn(field)', return: 'GridColDef | null', desc: 'Get column definition.' },
        { method: 'getVisibleColumns()', return: 'GridColDef[]', desc: 'Get the columns on screen, in display order.' },
        { method: 'selectRow(id, isSelected)', return: 'void', desc: 'Set row selection.' },
        { method: 'getSelectedRows()', return: 'GridRowId[]', desc: 'Get selected row IDs.' },
        { method: 'sortColumn(field, dir)', return: 'void', desc: 'Sort like a header click; fires onSortModelChange.' },
        { method: 'setFilterModel(model)', return: 'void', desc: 'Set filters; fires onFilterModelChange.' },
        { method: 'setPage(page)', return: 'void', desc: 'Change current page; fires onPaginationModelChange.' },
        { method: 'scrollToIndexes(params)', return: 'void', desc: 'Scroll to specific index.' },
    ];

    const columnDefs = [
        // Identity
        { name: 'field', type: 'string', default: '—', desc: 'Unique key matching a property on the row object.' },
        { name: 'headerName', type: 'string', default: 'field', desc: 'Text label displayed in the column header.' },
        { name: 'description', type: 'string', default: '—', desc: 'Tooltip text shown on the header cell.' },
        // Sizing
        { name: 'width', type: 'number | string', default: 'unset: flexes', desc: 'Column width in pixels or a percentage string. Unset, the column flexes like flex: 1.' },
        { name: 'minWidth', type: 'number', default: '—', desc: 'Minimum pixel width (enforced on resize).' },
        { name: 'maxWidth', type: 'number', default: '—', desc: 'Maximum pixel width.' },
        { name: 'flex', type: 'number', default: '—', desc: 'Flex-grow weight. Distributes remaining space proportionally.' },
        // Alignment
        { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", desc: 'Cell content alignment.' },
        { name: 'headerAlign', type: "'left' | 'center' | 'right'", default: 'align', desc: 'Header text alignment. Falls back to align, then left.' },
        // Data
        { name: 'type', type: "'string' | 'number' | 'boolean' | 'date' | 'singleSelect' | 'image'", default: "'string'", desc: 'Column type — drives filtering operators and default formatting.' },
        { name: 'valueOptions', type: 'Array<string | { value; label }>', default: '—', desc: 'Options list for singleSelect type — the filter panel offers them as a select.' },
        { name: 'valueGetter', type: '(params) => any', default: '—', desc: 'Derive a cell value from the row (computed columns). Sorting, filtering and the quick filter use this value.' },
        { name: 'valueSetter', type: '(params: GridValueSetterParams) => R', default: '—', desc: 'Map an edited value back onto the row. Needed for editable valueGetter columns.' },
        { name: 'valueFormatter', type: '(params) => string', default: '—', desc: 'Format the display value. Sorting and column filters use the unformatted value; the quick filter also searches the formatted text.' },
        // Rendering
        { name: 'renderCell', type: '(params: GridRenderCellParams) => ReactNode', default: '—', desc: 'Custom cell renderer component.' },
        { name: 'renderHeader', type: '(params: GridRenderHeaderParams) => ReactNode', default: '—', desc: 'Custom header renderer component.' },
        { name: 'renderEditCell', type: '(params: GridRenderEditCellParams) => ReactNode', default: '—', desc: 'Custom editor shown during cell editing. Receives onValueChange, onCommit and onCancel.' },
        // Styling
        { name: 'cellClassName', type: 'string | ((params: GridRenderCellParams) => string)', default: '—', desc: 'CSS class(es) added to every cell in this column. Accepts a static string or a function for dynamic per-row classes.' },
        { name: 'headerClassName', type: 'string', default: '—', desc: 'CSS class(es) added to the header cell of this column.' },
        // Behaviour
        { name: 'sortable', type: 'boolean', default: 'true', desc: 'Allow the column to be sorted.' },
        { name: 'filterable', type: 'boolean', default: 'true', desc: 'Include this column in the filter panel and the quick filter.' },
        { name: 'resizable', type: 'boolean', default: 'true', desc: 'Allow the user to drag-resize this column.' },
        { name: 'editable', type: 'boolean', default: 'false', desc: 'Allow double-click or Enter to edit cell values (triggers processRowUpdate).' },
        { name: 'hideable', type: 'boolean', default: 'true', desc: 'Allow hiding via column menu / visibility panel.' },
        { name: 'pinnable', type: 'boolean', default: 'true', desc: 'Allow pinning via column menu.' },
        { name: 'disableColumnMenu', type: 'boolean', default: 'false', desc: 'Hide the ⋮ column menu icon.' },
        // Spanning
        { name: 'colSpan', type: 'number | ((params) => number)', default: '1', desc: 'Number of columns this cell spans horizontally.' },
        { name: 'rowSpan', type: 'number | ((params) => number)', default: '1', desc: 'Number of rows this cell spans vertically.' },
        // Advanced
        { name: 'groupable', type: 'boolean', default: 'true', desc: 'Allow this column to be used as a row grouping dimension.' },
        { name: 'aggregable', type: 'boolean', default: '—', desc: 'Whether the Summaries and pivot panels offer this column. Unset: number columns only.' },
        { name: 'zIndex', type: 'number', default: '—', desc: 'Override the CSS z-index for this column (useful with pinning).' },
    ];

    const toolbarProps = [
        { name: 'columns', type: 'GridColDef[]', default: '[]', desc: 'Column definitions — injected automatically when used via slots.' },
        { name: 'baseColumns', type: 'GridColDef[]', default: '—', desc: 'Pre-pivot columns shown in the Pivot panel instead of synthetic pivot columns.' },
        { name: 'aggregationModel', type: 'GridAggregationModel', default: '{}', desc: 'Current aggregation configuration.' },
        { name: 'onAggregationModelChange', type: '(model) => void', default: '—', desc: 'Called when the user changes aggregation settings. Presence renders the Summaries button.' },
        { name: 'pivotModel', type: 'GridPivotModel', default: '—', desc: 'Current pivot configuration.' },
        { name: 'onPivotModelChange', type: '(model) => void', default: '—', desc: 'Called when the user changes pivot settings. Presence renders the Pivot button.' },
        { name: 'filterModel', type: 'GridFilterModel', default: '—', desc: 'Current filter model.' },
        { name: 'onFilterModelChange', type: '(model) => void', default: '—', desc: 'Called when the user changes filters or the quick-search value. Presence renders the search bar and Filter button.' },
        { name: 'columnVisibilityModel', type: 'Record<string, boolean>', default: '{}', desc: 'Current column visibility map.' },
        { name: 'onColumnVisibilityModelChange', type: '(model) => void', default: '—', desc: 'Called when the user shows or hides a column. Presence renders the Columns button.' },
        { name: 'showNonHideableColumns', type: 'boolean', default: 'false', desc: 'Show hideable: false columns in the Columns panel as disabled rows.' },
        { name: 'onColumnReorder', type: '(from, to) => void', default: '—', desc: 'Called when the user drags a column in the Columns panel.' },
        { name: 'onColumnOrderReset', type: '() => void', default: '—', desc: 'Called when the user clicks Reset order in the Columns panel.' },
        { name: 'children', type: 'ReactNode', default: '—', desc: 'Content rendered on the left side of the toolbar, before the spacer.' },
        { name: 'rightContent', type: 'ReactNode', default: '—', desc: 'Content rendered on the right side, after all built-in buttons.' },
        { name: 'className', type: 'string', default: '—', desc: 'Additional CSS class on the toolbar root <div> for theme overrides.' },
        { name: 'style', type: 'CSSProperties', default: '—', desc: 'Inline styles on the toolbar root.' },
        { name: 'renderColumnsButton', type: '(props: ToolbarButtonRenderProps) => ReactNode', default: '—', desc: 'Replace the built-in Columns toggle button. The Columns panel still works.' },
        { name: 'renderFilterButton', type: '(props: ToolbarButtonRenderProps) => ReactNode', default: '—', desc: 'Replace the built-in Filters toggle button. The Filter panel still works.' },
        { name: 'renderAggregationButton', type: '(props: ToolbarButtonRenderProps) => ReactNode', default: '—', desc: 'Replace the built-in Summaries toggle button. The Aggregation panel still works.' },
        { name: 'renderExportButton', type: '() => ReactNode', default: '—', desc: 'Inject an Export button after the Aggregation button. No built-in export button exists.' },
        { name: 'renderQuickFilter', type: '(props: ToolbarQuickFilterRenderProps) => ReactNode', default: '—', desc: 'Replace the built-in quick-filter search input with your own component.' },
    ];

    const toolbarButtonProps = [
        { name: 'onClick', type: '() => void', desc: 'Toggle the associated panel open or closed.' },
        { name: 'isOpen', type: 'boolean', desc: 'Whether the associated panel is currently open.' },
        { name: 'activeCount', type: 'number', desc: 'Active items: hidden columns (Columns), applied filters (Filter), configured aggregations (Summaries).' },
    ];

    const toolbarQuickFilterProps = [
        { name: 'value', type: 'string', desc: 'Current search string: the quickFilterValues terms joined with spaces.' },
        { name: 'onChange', type: '(value: string) => void', desc: 'Call with the updated string when the input changes. The toolbar splits it on whitespace into quickFilterValues terms.' },
    ];

    return (
        <div className="docs-container" style={{ maxWidth: '1200px' }}>
            <h1 className="docs-title">📖 API Reference</h1>
            <p className="docs-lead">Complete technical reference for OpenGridX components, hooks, and types.</p>

            <section className="docs-section">
                <h2 className="docs-h2">🛠️ &lt;DataGrid /&gt; Props</h2>
                <div className="docs-table-wrapper">
                    <table className="docs-table">
                        <thead>
                            <tr>
                                <th>Prop</th>
                                <th>Type</th>
                                <th>Default</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gridProps.map(p => (
                                <tr key={p.name}>
                                    <td><span className="docs-prop-name text-nowrap">{p.name}</span></td>
                                    <td><span className="docs-prop-type">{p.type}</span></td>
                                    <td><code>{p.default}</code></td>
                                    <td>{p.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">🕹️ GridApi Methods</h2>
                <p>Imperative methods accessible via <code>apiRef.current</code>.</p>
                <div className="docs-table-wrapper">
                    <table className="docs-table">
                        <thead>
                            <tr>
                                <th>Method</th>
                                <th>Return Type</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiRefMethods.map(m => (
                                <tr key={m.method}>
                                    <td><span className="docs-prop-name">{m.method}</span></td>
                                    <td><span className="docs-prop-type">{m.return}</span></td>
                                    <td>{m.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">📑 Column Definitions (GridColDef)</h2>
                <div className="docs-table-wrapper">
                    <table className="docs-table">
                        <thead>
                            <tr>
                                <th>Property</th>
                                <th>Type</th>
                                <th>Default</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {columnDefs.map(c => (
                                <tr key={c.name}>
                                    <td><span className="docs-prop-name">{c.name}</span></td>
                                    <td><span className="docs-prop-type">{c.type}</span></td>
                                    <td><code>{c.default}</code></td>
                                    <td>{c.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">🛠️ GridToolbar Props</h2>
                <p>
                    Pass via <code>slotProps.toolbar</code> when using <code>{'slots={{ toolbar: GridToolbar }}'}</code>.
                    Each feature button is hidden when its callback prop is absent.
                </p>
                <div className="docs-table-wrapper">
                    <table className="docs-table">
                        <thead>
                            <tr>
                                <th>Prop</th>
                                <th>Type</th>
                                <th>Default</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {toolbarProps.map(p => (
                                <tr key={p.name}>
                                    <td><span className="docs-prop-name text-nowrap">{p.name}</span></td>
                                    <td><span className="docs-prop-type">{p.type}</span></td>
                                    <td><code>{p.default}</code></td>
                                    <td>{p.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h3 className="docs-h3" style={{ marginTop: '24px' }}>ToolbarButtonRenderProps</h3>
                <p>Passed to <code>renderColumnsButton</code>, <code>renderFilterButton</code>, and <code>renderAggregationButton</code>.</p>
                <div className="docs-table-wrapper">
                    <table className="docs-table">
                        <thead>
                            <tr><th>Property</th><th>Type</th><th>Description</th></tr>
                        </thead>
                        <tbody>
                            {toolbarButtonProps.map(p => (
                                <tr key={p.name}>
                                    <td><span className="docs-prop-name">{p.name}</span></td>
                                    <td><span className="docs-prop-type">{p.type}</span></td>
                                    <td>{p.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h3 className="docs-h3" style={{ marginTop: '24px' }}>ToolbarQuickFilterRenderProps</h3>
                <p>Passed to <code>renderQuickFilter</code>.</p>
                <div className="docs-table-wrapper">
                    <table className="docs-table">
                        <thead>
                            <tr><th>Property</th><th>Type</th><th>Description</th></tr>
                        </thead>
                        <tbody>
                            {toolbarQuickFilterProps.map(p => (
                                <tr key={p.name}>
                                    <td><span className="docs-prop-name">{p.name}</span></td>
                                    <td><span className="docs-prop-type">{p.type}</span></td>
                                    <td>{p.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
