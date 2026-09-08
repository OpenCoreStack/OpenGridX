import './Docs.css';

export default function MigrationV2() {
    return (
        <div className="docs-container">
            <h1 className="docs-title">🔀 Migrating to v2.0</h1>
            <p className="docs-lead">
                Everything you need to upgrade <code>@opencorestack/opengridx</code> from any v1.x release to v2.0.0.
                Most apps require only a couple of prop deletions — read the checklist below to find out what applies to yours.
            </p>

            {/* ── Breaking: removed props ── */}
            <section className="docs-section">
                <h2 className="docs-h2">1. Remove two dead callback props</h2>
                <p>
                    These props existed in v1 but their callbacks were <strong>never called</strong> — no UI existed to trigger
                    them. They have been removed from <code>DataGridProps</code> in v2. TypeScript will give a compile error
                    at every call site.
                </p>

                <table className="docs-table">
                    <thead>
                        <tr><th>Removed prop</th><th>Reason</th><th>Fix</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><code>onPinnedRowsChange</code></td>
                            <td>No pin/unpin-row UI exists — callback was never invoked</td>
                            <td>Delete the prop from your JSX</td>
                        </tr>
                        <tr>
                            <td><code>onRowGroupingModelChange</code></td>
                            <td>No drag-to-group UI exists — callback was never invoked</td>
                            <td>Delete the prop from your JSX</td>
                        </tr>
                    </tbody>
                </table>

                <div className="docs-code-block">
                    <span className="docs-code-comment">{'// ❌ v1 — remove these props:'}</span><br />
                    {'<DataGrid'}<br />
                    {'  onPinnedRowsChange={handlePinnedRowsChange}'}<br />
                    {'  onRowGroupingModelChange={handleGroupingChange}'}<br />
                    {'/>'}<br /><br />
                    <span className="docs-code-comment">{'// ✅ v2:'}</span><br />
                    {'<DataGrid />'}
                </div>
            </section>

            {/* ── Behavioral: groupable:false ── */}
            <section className="docs-section">
                <h2 className="docs-h2">2. Audit columns with <code>groupable: false</code></h2>
                <p>
                    In v1 the <code>groupable: false</code> flag on a <code>GridColDef</code> was silently ignored —
                    the column was still grouped when it appeared in <code>rowGroupingModel</code>.
                    In v2 the flag is enforced: that field is skipped entirely when building the group tree.
                </p>

                <div className="docs-alert">
                    <span className="docs-alert-icon">⚠️</span>
                    <div className="docs-alert-body">
                        <strong>Action required only if</strong> you have a column with <code>groupable: false</code> that
                        also appears in <code>rowGroupingModel</code>. Either remove the field from <code>rowGroupingModel</code>,
                        or remove <code>groupable: false</code>.
                    </div>
                </div>
            </section>

            {/* ── Behavioral: availableAggregationFunctions ── */}
            <section className="docs-section">
                <h2 className="docs-h2">3. Audit <code>availableAggregationFunctions</code></h2>
                <p>
                    In v1 <code>availableAggregationFunctions</code> on a <code>GridColDef</code> was silently ignored.
                    In v2 the list is enforced: any aggregation function in <code>aggregationModel</code> that is not
                    in <code>availableAggregationFunctions</code> for that field is skipped.
                </p>

                <div className="docs-alert">
                    <span className="docs-alert-icon">⚠️</span>
                    <div className="docs-alert-body">
                        <strong>Action required only if</strong> you have <code>availableAggregationFunctions</code> set
                        AND the active <code>aggregationModel</code> for that field uses a function not in the list.
                        Either add the function to the allowed list, or change <code>aggregationModel</code>.
                    </div>
                </div>
            </section>

            {/* ── Behavioral: groupingColDef ── */}
            <section className="docs-section">
                <h2 className="docs-h2">4. <code>groupingColDef</code> now creates a real column</h2>
                <p>
                    In v1 passing <code>groupingColDef</code> had no runtime effect. In v2, when <code>rowGroupingModel</code> is
                    active, it creates a dedicated <code>__group__</code> column at position 0, auto-pinned left.
                </p>

                <div className="docs-alert">
                    <span className="docs-alert-icon">⚠️</span>
                    <div className="docs-alert-body">
                        <strong>Action required only if</strong> you were passing <code>groupingColDef</code> expecting it to be
                        a no-op. If you don't want the dedicated column, remove <code>groupingColDef</code>.
                    </div>
                </div>
            </section>

            {/* ── Row._* runtime shim removal ── */}
            <section className="docs-section">
                <h2 className="docs-h2">5. Runtime <code>row._*</code> hierarchy fields removed</h2>
                <p>
                    In v1.1 the internal hierarchy fields (<code>_hasChildren</code>, <code>_treeDepth</code>,
                    <code>_isExpanded</code>, <code>_groupingField</code>, <code>_groupingValue</code>,
                    <code>_descendantCount</code>, <code>_isGroupRow</code>) were deprecated and flagged for removal.
                    They are now gone from the runtime row object in v2.
                </p>
                <p>If your <code>renderCell</code> reads any of these, migrate to <code>params.rowMeta</code>:</p>

                <div className="docs-code-block">
                    <span className="docs-code-comment">{'// ❌ v1 (runtime shim — no longer injected):'}</span><br />
                    {'renderCell: (params) => {'}<br />
                    {'  const hasChildren = (params.row as Record<string, unknown>)._hasChildren;'}<br />
                    {'  return hasChildren ? <GroupIcon /> : params.value;'}<br />
                    {'},'}<br /><br />
                    <span className="docs-code-comment">{'// ✅ v2:'}</span><br />
                    {'renderCell: (params) => {'}<br />
                    {'  const hasChildren = params.rowMeta?.hasChildren;'}<br />
                    {'  return hasChildren ? <GroupIcon /> : params.value;'}<br />
                    {'},'}
                </div>
            </section>

            {/* ── New features ── */}
            <section className="docs-section">
                <h2 className="docs-h2">New features in v2.0 (no migration required)</h2>
                <p>These are purely additive — existing v1 code continues to work without any changes.</p>

                <table className="docs-table">
                    <thead>
                        <tr><th>Feature</th><th>Prop / API</th><th>Notes</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Multi-sort single-click</td>
                            <td><code>multiSort</code></td>
                            <td>Every click appends instead of replacing. Shift+click always worked.</td>
                        </tr>
                        <tr>
                            <td>Multi-sort Shift+click</td>
                            <td>(built-in)</td>
                            <td>Shift+click now appends; previously behaved like a plain click.</td>
                        </tr>
                        <tr>
                            <td>Row density wired</td>
                            <td><code>density</code></td>
                            <td>Was accepted but silently ignored in v1.</td>
                        </tr>
                        <tr>
                            <td>Click-to-select control</td>
                            <td><code>disableRowSelectionOnClick</code></td>
                            <td>Was accepted but silently ignored in v1; <code>onRowSelectionModelChange</code> now fires correctly on click.</td>
                        </tr>
                        <tr>
                            <td>Single-row selection</td>
                            <td><code>disableMultipleRowSelection</code></td>
                            <td>Was accepted but silently ignored in v1.</td>
                        </tr>
                        <tr>
                            <td>Group label formatter</td>
                            <td><code>groupingValueFormatter</code> on <code>GridColDef</code></td>
                            <td>New field — customises the label shown in group-header rows.</td>
                        </tr>
                        <tr>
                            <td>Header tooltip</td>
                            <td><code>description</code> on <code>GridColDef</code></td>
                            <td>Was in types but ignored in v1; now renders as a native <code>title</code> tooltip.</td>
                        </tr>
                        <tr>
                            <td>Pagination bug fix</td>
                            <td>(internal)</td>
                            <td>Uncontrolled pagination navigation now works. Controlled usage (passing both <code>paginationModel</code> + <code>onPaginationModelChange</code>) was already working and is unchanged.</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* ── Checklist ── */}
            <section className="docs-section">
                <h2 className="docs-h2">Quick checklist</h2>

                <div className="docs-checklist">
                    <label><input type="checkbox" readOnly /> Search for <code>onPinnedRowsChange</code> — delete every occurrence</label>
                    <label><input type="checkbox" readOnly /> Search for <code>onRowGroupingModelChange</code> — delete every occurrence</label>
                    <label><input type="checkbox" readOnly /> Search for <code>groupable: false</code> — verify those fields are not in <code>rowGroupingModel</code></label>
                    <label><input type="checkbox" readOnly /> Search for <code>availableAggregationFunctions</code> — verify the list covers what <code>aggregationModel</code> actually uses</label>
                    <label><input type="checkbox" readOnly /> Search for <code>groupingColDef</code> — verify you want the <code>__group__</code> column it now creates</label>
                    <label><input type="checkbox" readOnly /> Search for <code>params.row._hasChildren</code> / <code>._treeDepth</code> etc. — migrate to <code>params.rowMeta</code></label>
                    <label><input type="checkbox" readOnly /> Run <code>tsc --noEmit</code> — the compiler will flag any remaining type errors</label>
                </div>
            </section>
        </div>
    );
}
