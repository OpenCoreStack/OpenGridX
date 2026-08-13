import './Docs.css';

export default function APIDocumentation() {
    const gridProps = [
        // Core Data
        { name: 'rows', type: 'GridRowModel[]', default: '[]', desc: 'Array of data objects to display.' },
        { name: 'columns', type: 'GridColDef[]', default: '[]', desc: 'Column definitions controlling display, sorting, and editing.' },
        { name: 'getRowId', type: '(row: GridRowModel) => GridRowId', default: 'row.id', desc: 'Returns a unique identifier for each row.' },
        // Layout
        { name: 'height', type: 'number', default: 'undefined', desc: 'Fixed height in pixels. Overrides a parent container height.' },
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
        { name: 'rowCount', type: 'number', default: '—', desc: 'Total row count for server-side pagination.' },
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
        { name: 'pinnedRows', type: 'GridPinnedRows', default: 'undefined', desc: 'Pin rows to the top or bottom of the grid.' },
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
        { name: 'processRowUpdate', type: '(newRow, oldRow) => R | Promise<R>', default: '—', desc: 'Intercepts a committed cell edit. Return the updated row.' },
        { name: 'isCellEditable', type: '(params) => boolean', default: '—', desc: 'Fine-grained control over which cells are editable.' },
        // Server-Side
        { name: 'dataSource', type: 'GridDataSource', default: '—', desc: 'Remote data provider. Drives server-side sorting, filtering, pagination.' },
        // List View
        { name: 'listView', type: 'boolean', default: 'false', desc: 'Render rows using a single custom cell (card view).' },
        { name: 'listViewColumn', type: 'GridListViewColDef', default: '—', desc: 'The single column definition used in list view mode.' },
        // Customization
        { name: 'slots', type: 'GridSlots', default: '{}', desc: 'Override internal components (toolbar, loading overlay, no-rows overlay, etc.).' },
        { name: 'slotProps', type: 'Record<string, any>', default: '{}', desc: 'Props forwarded to slot components.' },
        { name: 'className', type: 'string', default: '—', desc: 'Additional CSS class on the root grid element.' },
        { name: 'style', type: 'React.CSSProperties', default: '—', desc: 'Inline styles on the root grid element.' },
        { name: 'ariaLabel', type: 'string', default: '—', desc: 'Accessible label for the grid.' },
        // Events
        { name: 'onRowClick', type: '(params: GridRowParams) => void', default: '—', desc: 'Fired when a row is clicked.' },
        { name: 'onCellClick', type: '(params: GridCellParams) => void', default: '—', desc: 'Fired when a cell is clicked.' },
        { name: 'onStateChange', type: '(state: GridState) => void', default: '—', desc: 'Fired on every internal state change (sort, filter, page, columns).' },
        { name: 'onRowsScrollEnd', type: '() => void', default: '—', desc: 'Fired when the user scrolls to the bottom of the grid.' },
        { name: 'onColumnOrderChange', type: '(params) => void', default: '—', desc: 'Fired after a column is reordered by drag.' },
        { name: 'onRowOrderChange', type: '(params) => void', default: '—', desc: 'Fired after a row is reordered (rowReordering must be true).' },
    ];

    const apiRefMethods = [
        { method: 'getRow(id)', return: 'GridRowModel | null', desc: 'Get row data by ID.' },
        { method: 'getAllRows()', return: 'GridRowModel[]', desc: 'Get all loaded rows.' },
        { method: 'getVisibleRows()', return: 'GridRowModel[]', desc: 'Get filtered/sorted rows.' },
        { method: 'getColumn(field)', return: 'GridColDef | null', desc: 'Get column definition.' },
        { method: 'getVisibleColumns()', return: 'GridColDef[]', desc: 'Get visible columns.' },
        { method: 'selectRow(id, isSelected)', return: 'void', desc: 'Set row selection.' },
        { method: 'getSelectedRows()', return: 'GridRowId[]', desc: 'Get selected row IDs.' },
        { method: 'sortColumn(field, dir)', return: 'void', desc: 'Programmatically sort.' },
        { method: 'setFilterModel(model)', return: 'void', desc: 'Programmatically set filters.' },
        { method: 'setPage(page)', return: 'void', desc: 'Change current page.' },
        { method: 'scrollToIndexes(params)', return: 'void', desc: 'Scroll to specific index.' },
    ];

    const columnDefs = [
        // Identity
        { name: 'field', type: 'string', default: '—', desc: 'Unique key matching a property on the row object.' },
        { name: 'headerName', type: 'string', default: 'field', desc: 'Text label displayed in the column header.' },
        { name: 'description', type: 'string', default: '—', desc: 'Tooltip text shown on the header cell.' },
        // Sizing
        { name: 'width', type: 'number | string', default: '100', desc: 'Column width in pixels or a percentage string.' },
        { name: 'minWidth', type: 'number', default: '—', desc: 'Minimum pixel width (enforced on resize).' },
        { name: 'maxWidth', type: 'number', default: '—', desc: 'Maximum pixel width.' },
        { name: 'flex', type: 'number', default: '—', desc: 'Flex-grow weight. Distributes remaining space proportionally.' },
        // Alignment
        { name: 'align', type: "'left' | 'center' | 'right'", default: "'left'", desc: 'Cell content alignment.' },
        { name: 'headerAlign', type: "'left' | 'center' | 'right'", default: "'left'", desc: 'Header text alignment.' },
        // Data
        { name: 'type', type: "'string' | 'number' | 'boolean' | 'date' | 'singleSelect' | 'image'", default: "'string'", desc: 'Column type — drives filtering operators and default formatting.' },
        { name: 'valueOptions', type: 'Array<string | { value; label }>', default: '—', desc: 'Options list for singleSelect type.' },
        { name: 'valueGetter', type: '(params) => any', default: '—', desc: 'Derive a cell value from the row (computed columns).' },
        { name: 'valueFormatter', type: '(params) => string', default: '—', desc: 'Format the display value without affecting sort/filter logic.' },
        // Rendering
        { name: 'renderCell', type: '(params: GridRenderCellParams) => ReactNode', default: '—', desc: 'Custom cell renderer component.' },
        { name: 'renderHeader', type: '(params: GridRenderHeaderParams) => ReactNode', default: '—', desc: 'Custom header renderer component.' },
        { name: 'renderEditCell', type: '(params: GridRenderCellParams) => ReactNode', default: '—', desc: 'Custom input component shown during cell editing.' },
        // Styling
        { name: 'cellClassName', type: 'string | ((params: GridRenderCellParams) => string)', default: '—', desc: 'CSS class(es) added to every cell in this column. Accepts a static string or a function for dynamic per-row classes.' },
        { name: 'headerClassName', type: 'string', default: '—', desc: 'CSS class(es) added to the header cell of this column.' },
        // Behaviour
        { name: 'sortable', type: 'boolean', default: 'true', desc: 'Allow the column to be sorted.' },
        { name: 'filterable', type: 'boolean', default: 'true', desc: 'Include this column in the filter panel.' },
        { name: 'resizable', type: 'boolean', default: 'true', desc: 'Allow the user to drag-resize this column.' },
        { name: 'editable', type: 'boolean', default: 'false', desc: 'Allow double-click to edit cell values (triggers processRowUpdate).' },
        { name: 'hideable', type: 'boolean', default: 'true', desc: 'Allow hiding via column menu / visibility panel.' },
        { name: 'pinnable', type: 'boolean', default: 'true', desc: 'Allow pinning via column menu.' },
        { name: 'disableColumnMenu', type: 'boolean', default: 'false', desc: 'Hide the ⋮ column menu icon.' },
        // Spanning
        { name: 'colSpan', type: 'number | ((params) => number)', default: '1', desc: 'Number of columns this cell spans horizontally.' },
        { name: 'rowSpan', type: 'number | ((params) => number)', default: '1', desc: 'Number of rows this cell spans vertically.' },
        // Advanced
        { name: 'groupable', type: 'boolean', default: 'true', desc: 'Allow this column to be used as a row grouping dimension.' },
        { name: 'aggregable', type: 'boolean', default: 'true', desc: 'Allow aggregation functions (sum, avg, etc.) on this column.' },
        { name: 'zIndex', type: 'number', default: '—', desc: 'Override the CSS z-index for this column (useful with pinning).' },
    ];

    const toolbarProps = [
        { name: 'columns', type: 'GridColDef[]', default: '[]', desc: 'Column definitions — injected automatically when used via slots.' },
        { name: 'baseColumns', type: 'GridColDef[]', default: '—', desc: 'Pre-pivot columns shown in the Pivot panel instead of synthetic pivot columns.' },
        { name: 'aggregationModel', type: 'GridAggregationModel', default: '{}', desc: 'Current aggregation configuration.' },
        { name: 'onAggregationModelChange', type: '(model) => void', default: '—', desc: 'Called when the user changes aggregation settings.' },
        { name: 'pivotModel', type: 'GridPivotModel', default: '—', desc: 'Current pivot configuration. Presence of this prop renders the Pivot button.' },
        { name: 'onPivotModelChange', type: '(model) => void', default: '—', desc: 'Called when the user changes pivot settings.' },
        { name: 'filterModel', type: 'GridFilterModel', default: '—', desc: 'Current filter model. Presence renders the search bar and Filter button.' },
        { name: 'onFilterModelChange', type: '(model) => void', default: '—', desc: 'Called when the user changes filters or the quick-search value.' },
        { name: 'columnVisibilityModel', type: 'Record<string, boolean>', default: '{}', desc: 'Current column visibility map. Presence renders the Columns button.' },
        { name: 'onColumnVisibilityModelChange', type: '(model) => void', default: '—', desc: 'Called when the user shows or hides a column.' },
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
        { name: 'value', type: 'string', desc: 'Current search string.' },
        { name: 'onChange', type: '(value: string) => void', desc: 'Call with the updated string when the input changes.' },
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
