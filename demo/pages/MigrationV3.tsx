import type { ReactNode } from 'react';
import './Docs.css';

interface TriageRow {
    usage: ReactNode;
    section: number;
}

interface MigrationSection {
    n: number;
    title: string;
    points: ReactNode[];
}

const triage: TriageRow[] = [
    { usage: <>columns with <code>type: 'date' | 'boolean' | 'singleSelect' | 'image'</code> and no <code>valueFormatter</code></>, section: 1 },
    { usage: <>you pass <code>getRowId</code> and read <code>row.id</code></>, section: 2 },
    { usage: <>you read <code>params.row._hasChildren</code> or another underscore field</>, section: 3 },
    { usage: <>you mutate <code>params.row</code> in render callbacks under grouping / tree data</>, section: 4 },
    { usage: <>you build filter items in code, rely on empty filter values, or use the toolbar search</>, section: 5 },
    { usage: <>you sort numeric strings, date strings, accented text, or use multi-sort</>, section: 6 },
    { usage: <>you rely on Tab moving between cells, Enter in a non-editable cell, or <code>colIndex</code> / <code>rowIndex</code></>, section: 7 },
    { usage: <>you use <code>pagination</code>, <code>rowCount</code> or <code>pageSizeOptions</code></>, section: 8 },
    { usage: <>you use checkbox selection, select-all or a controlled <code>rowSelectionModel</code></>, section: 9 },
    { usage: <>you call <code>apiRef.current</code> setters or row / column getters</>, section: 10 },
    { usage: <>you edit cells (<code>processRowUpdate</code>, <code>isCellEditable</code>, <code>renderEditCell</code>)</>, section: 11 },
    { usage: <>you export CSV / Excel / JSON / print / PDF or parse those files</>, section: 12 },
    { usage: <>you show aggregation totals</>, section: 13 },
    { usage: <>you use row grouping or tree data, or parse group row ids</>, section: 14 },
    { usage: <>you pass a <code>dataSource</code> or use infinite scroll</>, section: 15 },
    { usage: <>you pin columns / rows, use detail panels, <code>onRowsScrollEnd</code> or pinned-row CSS</>, section: 16 },
    { usage: <>you use <code>onRowOrderChange</code> / <code>onColumnOrderChange</code> with pagination or a controlled <code>columnOrder</code></>, section: 17 },
    { usage: <>you have a <code>&lt;form&gt;</code> around the grid, or use <code>Button</code> / <code>Checkbox</code> / <code>GridTooltip</code></>, section: 18 },
    { usage: <>you copy with Ctrl+C or <code>copySelectedRows()</code></>, section: 19 },
    { usage: <>you use <code>DataGridThemeProvider</code> or a preset theme</>, section: 20 },
    { usage: <>you use <code>pivotMode</code></>, section: 21 },
    { usage: <>you use <code>colSpan</code>, <code>rowSpan</code> or column groups</>, section: 22 },
    { usage: <>you use <code>listView</code></>, section: 23 },
    { usage: <>you have CSS targeting <code>ogx__*</code> / <code>ogx-*</code> classes</>, section: 24 },
    { usage: <>you rely on TypeScript types of rows, columns or props</>, section: 25 },
];

const sections: MigrationSection[] = [
    {
        n: 1, title: 'Cells are formatted by column type', points: [
            <>Without a <code>valueFormatter</code>: <code>date</code> shows <code>toLocaleDateString()</code> (was <code>String(value)</code>), <code>boolean</code> shows Yes / No, <code>singleSelect</code> shows the option label, <code>image</code> renders <code>&lt;img class="ogx__cell-image"&gt;</code>.</>,
            <>Applies to cells, <code>params.formattedValue</code>, list view and text exports. Add a <code>valueFormatter</code> to keep the old text.</>,
        ],
    },
    {
        n: 2, title: 'getRowId no longer writes an id onto rows', points: [
            <>Rows are stored untouched: <code>row.id === getRowId(row)</code> no longer holds, in callbacks, <code>processRowUpdate</code>, <code>apiRef</code> and <code>dataSource</code> rows.</>,
            <>Pass <code>getRowId</code> to export functions when exporting <code>selectedRows</code>.</>,
            <>Duplicate ids: the first row is kept, with a dev warning (the later row won and rendered twice).</>,
        ],
    },
    {
        n: 3, title: 'Underscore hierarchy fields are no longer added to rows', points: [
            <><code>_hasChildren</code>, <code>_treeDepth</code>, <code>_isExpanded</code>, <code>_groupingField</code>, <code>_groupingValue</code>, <code>_descendantCount</code>, <code>_isGroupRow</code> are gone. Read <code>params.rowMeta?.hasChildren</code> etc. instead.</>,
            <>TypeScript will <strong>not</strong> warn you: <code>GridRowModel</code> has an index signature.</>,
        ],
    },
    {
        n: 4, title: 'params.row is now your own row object', points: [
            <>Under row grouping and tree data, <code>params.row</code> is the object you passed in <code>rows</code>, not a copy. Mutating it in <code>renderCell</code> / <code>valueGetter</code> / <code>valueFormatter</code> now changes your data.</>,
        ],
    },
    {
        n: 5, title: 'Filtering', points: [
            <>Empty filter values (<code>undefined</code>, <code>null</code>, <code>''</code>, <code>[]</code>) no longer filter. Use <code>isEmpty</code> to match empty cells.</>,
            <>Blank cells are no longer 0 for numeric operators; <code>!=</code> always includes empty cells; date <code>after</code> / <code>before</code> operators now filter; date <code>is</code> / <code>not</code> compare calendar days.</>,
            <>Quick filter searches only visible, filterable columns, by displayed text. The toolbar search splits on whitespace (all words must match).</>,
            <><code>GridFilterOperator</code> gained <code>'='</code>, <code>'after'</code>, <code>'onOrAfter'</code>, <code>'before'</code>, <code>'onOrBefore'</code>: update exhaustive switches.</>,
        ],
    },
    {
        n: 6, title: 'Sorting', points: [
            <>Numeric strings in number columns and date strings in date columns sort as numbers / dates; text uses <code>Intl.Collator</code> (<code>item9 &lt; item10</code>); NaN / Invalid Date sort with nulls; <code>valueGetter</code> columns sort by computed value.</>,
            <>Shift-click keeps a column's sort priority; column-menu Unsort removes only that column.</>,
        ],
    },
    {
        n: 7, title: 'Keyboard, focus and ARIA', points: [
            <>Tab outside edit mode <strong>leaves the grid</strong>; while editing it still moves to the next editable cell.</>,
            <>Enter on a non-editable cell runs row-click handling (<code>onRowClick</code>, click-to-select, toggle rows with children).</>,
            <><code>colIndex</code> is absolute among visible data columns (was window-relative); bottom-pinned <code>rowIndex</code> follows the page rows (was 0..n).</>,
            <>Header <code>focusedCell</code> is <code>{'{ id: null, field }'}</code> (was <code>{"{ id: 'HEADER' }"}</code>); <code>aria-rowindex</code> is global, 1 = header.</>,
        ],
    },
    {
        n: 8, title: 'Pagination', points: [
            <>Client total counts filtered, unpinned rows. After data shrinks, the grid shows the last page and fires <code>onPaginationModelChange</code> once: adopt it.</>,
            <><code>rowCount</code> is read live; server modes without a <code>dataSource</code> are no longer re-sliced; default page size is the first option when 100 is not offered.</>,
        ],
    },
    {
        n: 9, title: 'Selection', points: [
            <>Select-all adds the filtered rows (was every stored row); deselect removes only those.</>,
            <>Ids of removed rows are pruned and <code>onRowSelectionModelChange</code> fires once with the pruned model.</>,
            <><code>disableMultipleRowSelection</code> also caps checkboxes, Space and <code>apiRef</code>, and removes select-all.</>,
        ],
    },
    {
        n: 10, title: 'apiRef', points: [
            <><code>sortColumn</code>, <code>setFilterModel</code>, <code>setPage</code>, <code>setPageSize</code>, <code>selectRow(s)</code> now change the grid and fire callbacks: remove duplicate state updates.</>,
            <><code>getVisibleRows</code> / <code>getAllFilteredRows</code> include pinned rows; under grouping <code>getAllFilteredRows</code> returns data rows only; <code>getVisibleColumns</code> excludes hidden columns.</>,
        ],
    },
    {
        n: 11, title: 'Editing', points: [
            <><code>isCellEditable</code> governs double-click, Enter, Tab and <code>aria-readonly</code>.</>,
            <><code>processRowUpdate</code> runs exactly once per commit, and also when the edited cell scrolls out, is filtered or paged away, or another edit starts.</>,
            <><code>singleSelect</code> commits the option value (not a string); <code>date</code> commits a <code>Date</code> for <code>Date</code> cells and <code>null</code> when cleared.</>,
            <>New: <code>valueSetter</code> for editable <code>valueGetter</code> columns; <code>renderEditCell</code> gets <code>onValueChange</code> / <code>onCommit</code> / <code>onCancel</code>.</>,
        ],
    },
    {
        n: 12, title: 'Exports', points: [
            <>CSV starts with a BOM (<code>bom: false</code>); text starting with <code>= + - @</code> gets a leading <code>'</code> (<code>escapeFormulas: false</code>).</>,
            <>A non-empty <code>selectedRows</code> wins over <code>groupedRows</code>, exported flat with totals over the selection.</>,
            <><code>exportToExcel</code> writes <code>.xls</code>; <code>exportToExcelAdvanced</code> writes native dates (local day), numbers and booleans; PDF needs <code>font</code> for non-Latin-1 text.</>,
            <>Group labels follow the grid: <code>groupLabel</code>, else <code>groupingValueFormatter</code>, else <code>"field: value"</code>. Spacer and system columns are never exported.</>,
        ],
    },
    {
        n: 13, title: 'Aggregation values', points: [
            <>Blank strings, booleans and arrays are ignored by <code>sum</code> / <code>avg</code> / <code>min</code> / <code>max</code> (<code>avg([10, '', 20])</code>: 10 → 15).</>,
            <><code>min</code> / <code>max</code> over dates return a <code>Date</code> (was epoch ms). <code>valueGetter</code> columns aggregate the computed value; <code>aggregable: false</code> is honoured.</>,
            <>Footer totals use the column's <code>valueFormatter</code>; <code>count</code> / <code>unique</code> stay plain numbers.</>,
        ],
    },
    {
        n: 14, title: 'Row grouping and tree data', points: [
            <><code>renderCell</code> is called for group, subtotal and auto-parent rows: return <code>undefined</code> to keep the default.</>,
            <>Clicking a real tree-data parent selects it (the chevron, Enter and Alt+Arrow expand). Auto-created parents are <code>{'{ id }'}</code> only: use <code>rowMeta.groupLabel</code>.</>,
            <>Subtotals and counts follow the filter; <code>getAggregationPosition</code> is honoured and called with <code>null</code> for the grand total.</>,
            <>Group ids for non-string values and tree auto-parent ids (<code>{'auto-group-["a","b"]'}</code>) changed: never parse them.</>,
        ],
    },
    {
        n: 15, title: 'Server-side data and infinite scroll', points: [
            <><code>getRows</code> is called with all-client modes (<code>endRow: Number.MAX_SAFE_INTEGER</code>); server sort / filter with client pagination loads all rows once.</>,
            <>Infinite scroll requests from the rows loaded so far to <code>(page + 1) * pageSize</code>, and restarts at row 0 on sort / filter changes.</>,
            <>Tree children request <code>endRow: Number.MAX_SAFE_INTEGER</code> (was -1); Retry re-runs <code>getRows</code>; refetch only on changed content.</>,
        ],
    },
    {
        n: 16, title: 'Layout and pinning', points: [
            <>Pinned columns render in <code>pinnedColumns.left</code> / <code>.right</code> order; pinned <code>%</code> / <code>flex</code> / <code>auto</code> widths are no longer 100px.</>,
            <><code>getDetailPanelHeight</code> 0 → 0px and <code>'auto'</code> → measured (both were 200px); detail callbacks run for expanded data rows only.</>,
            <><code>onRowsScrollEnd</code> fires once per arrival at the bottom (was every scroll event).</>,
            <>Header and pinned rows are wrapped in <code>.ogx__sticky-top</code> / <code>.ogx__sticky-bottom</code>.</>,
        ],
    },
    {
        n: 17, title: 'Row and column reordering and resizing', points: [
            <><code>onRowOrderChange</code> indices are positions in <code>rows</code> (were page-local and sorted): remove page-offset workarounds.</>,
            <><code>onColumnOrderChange</code> indices are positions in the full column order; use the new <code>onColumnOrderModelChange</code> for a controlled <code>columnOrder</code>.</>,
            <>Resize: no 1000px maximum, pointer events (update tests), right-pinned columns resize from the left edge.</>,
        ],
    },
    {
        n: 18, title: 'Toolbar, buttons and UI components', points: [
            <>Every grid button, and the exported <code>Button</code>, is <code>type="button"</code>: grid clicks no longer submit a surrounding <code>&lt;form&gt;</code>.</>,
            <><code>Checkbox</code> no longer adds a default <code>aria-label</code>. <code>GridTooltip</code> renders inside <code>.ogx-theme-provider</code> with <code>position: fixed</code>.</>,
            <>The Summaries button needs <code>onAggregationModelChange</code>; the column menu hides Hide / Pin for <code>hideable: false</code> / <code>pinnable: false</code>.</>,
        ],
    },
    {
        n: 19, title: 'Clipboard', points: [
            <><code>copySelectedRows()</code> rejects on failure: wrap it in <code>try</code> / <code>catch</code>.</>,
            <>Copies visible columns in screen order and every selected row that passes the filter; values with tabs, newlines or quotes are quoted. New <code>disableClipboardCopy</code>.</>,
        ],
    },
    {
        n: 20, title: 'Theming', points: [
            <><code>DataGridThemeProvider</code> pins a complete palette by <code>GridTheme.mode</code>, regardless of the OS: pick <code>darkTheme</code> yourself.</>,
            <>Theme heights apply (<code>compactTheme</code>: 36px rows, 40px header). Accent colours use <code>color-mix()</code> (Chrome 111+, Safari 16.2+, Firefox 113+).</>,
            <>Removed <code>skeleton.darkBaseColor</code> / <code>darkHighlightColor</code>.</>,
        ],
    },
    {
        n: 21, title: 'Pivot mode', points: [
            <>Pivot row ids are <code>{'__pivot_row__:["North"]'}</code> (were 0, 1, 2). The Grand Total is always last and never selected.</>,
            <>Source filters apply to source rows; <code>getRowId</code>, tree data and row grouping are ignored while pivoting; pivot is ignored with a <code>dataSource</code>.</>,
        ],
    },
    {
        n: 22, title: 'Cell spanning and column groups', points: [
            <>Spans skip hidden columns and stay inside their pinned section and row section; <code>colSpan</code> receives the <code>valueGetter</code> value and the rendered <code>colIndex</code>.</>,
            <>Header drag-reorder works within a column group; <code>GridColumnGroup.headerClassName</code> is applied.</>,
        ],
    },
    {
        n: 23, title: 'List view', points: [
            <><code>renderCell</code> gets real <code>value</code>, <code>formattedValue</code>, <code>colDef</code> and <code>rowMeta</code>; <code>slots.footer</code>, loading and overlays are honoured.</>,
            <>Without <code>listViewColumn</code> the grid view is shown with a warning. Rows are focusable; checkboxes are not Tab stops.</>,
        ],
    },
    {
        n: 24, title: 'DOM and CSS class changes', points: [
            <>Move sticky rules from <code>.ogx__pinned-rows--top</code> / <code>--bottom</code> to <code>.ogx__sticky-top</code> / <code>.ogx__sticky-bottom</code>.</>,
            <>New classes include <code>ogx__aggregation-spacer</code>, <code>ogx__loading-bar</code>, <code>ogx__row--group-footer</code>, <code>ogx__cell-image</code>, <code>ogx-column-resize-handle--start</code>, <code>ogx-col-group-cell--pinned</code>.</>,
        ],
    },
];

export default function MigrationV3() {
    return (
        <div className="docs-container">
            <h1 className="docs-title">🔀 Migrating to v3.0</h1>
            <p className="docs-lead">
                Everything that can require action when upgrading <code>@opencorestack/opengridx</code> from any 2.x
                release to 3.0.0. Most items are bug fixes, but they change what users see, what files contain, or what
                callbacks receive. Find what applies to you in the table, then read those sections. The full guide
                with code samples is <code>docs/migration/v2-to-v3.md</code> in the package.
            </p>

            <section className="docs-section">
                <h2 className="docs-h2">Who needs to do what</h2>
                <div className="docs-table-wrapper">
                    <table className="docs-table">
                        <thead>
                            <tr><th>If your app…</th><th>Go to</th></tr>
                        </thead>
                        <tbody>
                            {triage.map(row => (
                                <tr key={row.section}>
                                    <td>{row.usage}</td>
                                    <td><a href={`#migration-v3-${row.section}`}>§{row.section}</a></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">Before you start</h2>
                <h3 className="docs-h3">Clear the bundler cache</h3>
                <p>
                    After upgrading, restart your dev server and clear the bundler cache. For Vite: stop the server,
                    run <code>rm -rf node_modules/.vite</code>, and start again with <code>--force</code>. Otherwise Vite
                    can keep serving the old version even though <code>node_modules</code> contains the new one, which
                    makes old behavior look like a regression.
                </p>
                <h3 className="docs-h3">Import the stylesheet</h3>
                <p>
                    The stylesheet is <strong>not</strong> loaded by the JavaScript entry (some v2 docs said it was).
                    Without it the viewport is unbounded and every row renders. In development, 3.0.0 warns when it is missing.
                </p>
                <div className="docs-code-block">
                    {"import '@opencorestack/opengridx/styles';"}
                </div>
                <h3 className="docs-h3">Know the size limit</h3>
                <p>
                    A single scrolling grid tops out at about 645,000 rows at 52px in Chromium. Use pagination or a{' '}
                    <code>dataSource</code> beyond that.
                </p>
            </section>

            {sections.map(section => (
                <section key={section.n} id={`migration-v3-${section.n}`} className="docs-section">
                    <h2 className="docs-h2">{section.n}. {section.title}</h2>
                    <ul>
                        {section.points.map((point, i) => <li key={i}>{point}</li>)}
                    </ul>
                    {section.n === 3 && (
                        <table className="docs-table">
                            <thead>
                                <tr><th>v2 (row field)</th><th>v3 (<code>params.rowMeta</code>)</th></tr>
                            </thead>
                            <tbody>
                                <tr><td><code>params.row._hasChildren</code></td><td><code>params.rowMeta?.hasChildren</code></td></tr>
                                <tr><td><code>params.row._treeDepth</code></td><td><code>params.rowMeta?.treeDepth</code></td></tr>
                                <tr><td><code>params.row._isExpanded</code></td><td><code>params.rowMeta?.isExpanded</code></td></tr>
                                <tr><td><code>params.row._groupingField</code></td><td><code>params.rowMeta?.groupingField</code></td></tr>
                                <tr><td><code>params.row._groupingValue</code></td><td><code>params.rowMeta?.groupingValue</code></td></tr>
                                <tr><td><code>params.row._descendantCount</code></td><td><code>params.rowMeta?.descendantCount</code></td></tr>
                                <tr><td><code>params.row._isGroupRow</code></td><td><code>params.rowMeta?.isGroupRow</code></td></tr>
                            </tbody>
                        </table>
                    )}
                </section>
            ))}

            <section id="migration-v3-25" className="docs-section">
                <h2 className="docs-h2">25. Typing changes</h2>
                <p>
                    <strong>Placeholder:</strong> the type-level changes of 3.0.0 (row generics, stricter prop types) are
                    still being finalised and will be listed here.
                </p>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">Removed or renamed API</h2>
                <table className="docs-table">
                    <thead>
                        <tr><th>Removed / renamed</th><th>Replacement</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>Runtime <code>row._hasChildren</code> and the other underscore fields</td><td><code>params.rowMeta.*</code></td></tr>
                        <tr><td><code>row.id</code> written by <code>getRowId</code></td><td>your own key; <code>getRowId</code> option on exports</td></tr>
                        <tr><td><code>GridThemeSkeleton.darkBaseColor</code> / <code>darkHighlightColor</code></td><td><code>GridTheme.mode</code> / <code>darkTheme</code></td></tr>
                        <tr><td>Header <code>focusedCell.id === 'HEADER'</code></td><td><code>focusedCell.id === null</code></td></tr>
                        <tr><td>Default <code>aria-label</code> on <code>Checkbox</code></td><td>pass <code>label</code> / <code>aria-label</code></td></tr>
                        <tr><td>Default submit type on <code>Button</code></td><td>pass <code>type="submit"</code></td></tr>
                        <tr><td><code>endRow: -1</code> in tree-children requests</td><td><code>endRow: Number.MAX_SAFE_INTEGER</code></td></tr>
                    </tbody>
                </table>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">New API you may want</h2>
                <table className="docs-table">
                    <thead>
                        <tr><th>API</th><th>What it does</th></tr>
                    </thead>
                    <tbody>
                        <tr><td><code>GridColDef.valueSetter</code></td><td>write edits of computed columns back onto the row</td></tr>
                        <tr><td><code>renderEditCell</code> <code>onValueChange</code> / <code>onCommit</code> / <code>onCancel</code></td><td>custom editors without internals</td></tr>
                        <tr><td><code>onColumnOrderModelChange</code></td><td>the whole column order after every change</td></tr>
                        <tr><td><code>disableClipboardCopy</code></td><td>let your own Ctrl/Cmd+C handler own the shortcut</td></tr>
                        <tr><td><code>bom</code>, <code>escapeFormulas</code>, <code>getRowId</code> export options; <code>PdfExportOptions.font</code></td><td>control export output</td></tr>
                        <tr><td>Filter operators <code>'='</code>, <code>'after'</code>, <code>'onOrAfter'</code>, <code>'before'</code>, <code>'onOrBefore'</code></td><td>numeric equality and date ranges</td></tr>
                        <tr><td><code>GridTheme.mode</code>, <code>colors.gray</code>, <code>grid.cellFontSize</code></td><td>complete palettes and font sizes</td></tr>
                        <tr><td>Shift+Space, Ctrl/Cmd+A, Alt+Arrow keys</td><td>select, select all, expand / collapse, open column menu, resize</td></tr>
                    </tbody>
                </table>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">Quick checklist</h2>
                <div className="docs-checklist">
                    <label><input type="checkbox" readOnly /> Restart the dev server and clear <code>node_modules/.vite</code>; confirm the stylesheet import</label>
                    <label><input type="checkbox" readOnly /> Add a <code>valueFormatter</code> where you want the old text for typed columns</label>
                    <label><input type="checkbox" readOnly /> With <code>getRowId</code>: stop reading <code>row.id</code>; pass <code>getRowId</code> to exports</label>
                    <label><input type="checkbox" readOnly /> Replace underscore fields with <code>params.rowMeta</code>; remove writes to <code>params.row</code></label>
                    <label><input type="checkbox" readOnly /> Review empty filter values, exhaustive <code>GridFilterOperator</code> switches and search expectations</label>
                    <label><input type="checkbox" readOnly /> Update keyboard docs and tests for Tab and Enter; stop storing <code>colIndex</code> / <code>rowIndex</code></label>
                    <label><input type="checkbox" readOnly /> Adopt the models passed to <code>onPaginationModelChange</code> and <code>onRowSelectionModelChange</code></label>
                    <label><input type="checkbox" readOnly /> Make <code>processRowUpdate</code> safe for edits committed on scroll-away; drop value-type workarounds</label>
                    <label><input type="checkbox" readOnly /> Re-check exported files (BOM, <code>'</code> prefixes, selection vs grouped, <code>.xls</code>, xlsx cell types)</label>
                    <label><input type="checkbox" readOnly /> Handle <code>Date</code> results from <code>min</code> / <code>max</code></label>
                    <label><input type="checkbox" readOnly /> Guard <code>renderCell</code> for synthetic rows; stop parsing group ids</label>
                    <label><input type="checkbox" readOnly /> Make <code>getRows</code> honour any <code>startRow</code> / <code>endRow</code></label>
                    <label><input type="checkbox" readOnly /> Order <code>pinnedColumns</code> as shown on screen; move sticky CSS to the new wrappers</label>
                    <label><input type="checkbox" readOnly /> Remove page offsets from <code>onRowOrderChange</code>; use <code>onColumnOrderModelChange</code></label>
                    <label><input type="checkbox" readOnly /> Label <code>Checkbox</code>es; wrap <code>copySelectedRows()</code> in <code>try</code> / <code>catch</code></label>
                    <label><input type="checkbox" readOnly /> Choose light or dark theme yourself; remove the skeleton dark keys</label>
                    <label><input type="checkbox" readOnly /> Run <code>tsc --noEmit</code> and your test suite</label>
                </div>
            </section>
        </div>
    );
}
