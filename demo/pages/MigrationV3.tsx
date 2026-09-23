import './Docs.css';

export default function MigrationV3() {
    return (
        <div className="docs-container">
            <h1 className="docs-title">🔀 Migrating to v3.0</h1>
            <p className="docs-lead">
                Everything that can require action when upgrading <code>@opencorestack/opengridx</code> from any 2.x release
                to 3.0.0. Most apps need no code changes — check the three items below.
            </p>

            <section className="docs-section">
                <h2 className="docs-h2">Before you start: clear the bundler cache</h2>
                <p>
                    After upgrading, restart your dev server and clear the bundler cache. For Vite: stop the server,
                    run <code>rm -rf node_modules/.vite</code>, and start again with <code>--force</code>. Otherwise Vite
                    can keep serving the old version even though <code>node_modules</code> contains the new one, which
                    makes old behavior look like a regression.
                </p>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">1. Underscore hierarchy fields are no longer added to rows</h2>
                <p>
                    Until v3, row grouping and tree data copied each row and added <code>_hasChildren</code>,{' '}
                    <code>_treeDepth</code>, <code>_isExpanded</code>, <code>_groupingField</code>,{' '}
                    <code>_groupingValue</code>, <code>_descendantCount</code> and <code>_isGroupRow</code>.
                    They were deprecated in v1.1. In v3 they are gone; read <code>params.rowMeta</code> instead
                    (it is <code>undefined</code> for flat rows, so use optional chaining).
                </p>
                <p>
                    TypeScript will <strong>not</strong> warn you — <code>GridRowModel</code> has an index signature,
                    so <code>params.row._hasChildren</code> type-checks and is simply <code>undefined</code> in v3.
                    Search for them:
                </p>
                <div className="docs-code-block">
                    {'grep -rnE "\\._(hasChildren|treeDepth|isExpanded|groupingField|groupingValue|descendantCount|isGroupRow)\\b" src/'}
                </div>

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

                <div className="docs-code-block">
                    <span className="docs-code-comment">{'// ❌ v2 (undefined in v3):'}</span><br />
                    {'renderCell: (params) => {'}<br />
                    {'  const row = params.row as Record<string, unknown>;'}<br />
                    {'  return row._hasChildren ? <strong>{params.value}</strong> : params.value;'}<br />
                    {'},'}<br /><br />
                    <span className="docs-code-comment">{'// ✅ v3:'}</span><br />
                    {'renderCell: (params) =>'}<br />
                    {'  params.rowMeta?.hasChildren ? <strong>{params.formattedValue}</strong> : params.formattedValue,'}
                </div>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">2. <code>params.row</code> is now your own row object</h2>
                <p>
                    Because v2 copied rows to attach those fields, <code>params.row</code> under row grouping or tree
                    data was a <strong>copy</strong>. In v3 it is the <strong>same object you passed in <code>rows</code></strong>,
                    just as it is without grouping — and rows are no longer re-created on every render.
                </p>
                <p>
                    This only matters if your <code>renderCell</code>, <code>valueGetter</code> or{' '}
                    <code>valueFormatter</code> <strong>mutates</strong> the row while grouping or tree data is on:
                    those writes used to land on a throwaway copy and now change your data. Derive values instead, or
                    update rows through state and <code>processRowUpdate</code>.
                </p>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">3. Grouped export labels match the grid</h2>
                <p>
                    In v2, grouped exports disagreed on group-header labels: <code>exportToExcelAdvanced</code> used
                    the column's <code>groupingValueFormatter</code> and fell back to <code>"Header: value"</code>, while
                    CSV, basic Excel, JSON, print and PDF always wrote <code>"field: value"</code>. In v3 every format
                    writes the label the grid shows: the entry's <code>groupLabel</code> (set by{' '}
                    <code>getGroupedExportRows()</code>), else the column's <code>groupingValueFormatter</code>, else{' '}
                    <code>"field: value"</code>.
                </p>
                <p>
                    To control the label everywhere, set <code>groupingValueFormatter</code> on the grouping column:
                </p>
                <div className="docs-code-block">
                    {"{ field: 'dept', headerName: 'Department', groupingValueFormatter: ({ value }) => `Department: ${String(value)}` }"}
                </div>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">Quick checklist</h2>
                <div className="docs-checklist">
                    <label><input type="checkbox" readOnly /> Search for <code>._hasChildren</code>, <code>._treeDepth</code> and the other underscore fields — switch to <code>params.rowMeta</code></label>
                    <label><input type="checkbox" readOnly /> Check <code>renderCell</code> / <code>valueGetter</code> / <code>valueFormatter</code> for writes to <code>params.row</code> under grouping or tree data</label>
                    <label><input type="checkbox" readOnly /> If you export grouped data, check group labels and set <code>groupingValueFormatter</code> where you want a specific label</label>
                    <label><input type="checkbox" readOnly /> Restart the dev server and clear <code>node_modules/.vite</code></label>
                    <label><input type="checkbox" readOnly /> Run <code>tsc --noEmit</code> and your test suite</label>
                </div>
            </section>
        </div>
    );
}
