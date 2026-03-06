import './Docs.css';

interface QuickstartProps {
    onNavigate?: (id: string) => void;
}

export default function Quickstart({ onNavigate }: QuickstartProps) {
    return (
        <div className="docs-container">
            <h1 className="docs-title">⚡ Quickstart Guide</h1>
            <p className="docs-lead">Start building with OpenGridX in just a few lines of code. Explore the core API and simple configuration options.</p>

            <section className="docs-section">
                <h2 className="docs-h2">1. Import DataGrid</h2>
                <div className="docs-code-block">
                    <span className="docs-code-keyword">import</span> <span className="docs-code-keyword">{'{'}</span> DataGrid <span className="docs-code-keyword">{'}'}</span> <span className="docs-code-keyword">from</span> <span className="docs-code-string">'@opencorestack/opengridx'</span>;
                </div>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">2. Define Columns and Rows</h2>
                <div className="docs-code-block">
                    <span className="docs-code-keyword">const</span> columns = [
                    <br />  <span className="docs-code-keyword">{'{'}</span> field: <span className="docs-code-string">'id'</span>, headerName: <span className="docs-code-string">'ID'</span>, width: 70 <span className="docs-code-keyword">{'}'}</span>,
                    <br />  <span className="docs-code-keyword">{'{'}</span> field: <span className="docs-code-string">'name'</span>, headerName: <span className="docs-code-string">'Full Name'</span>, width: 200 <span className="docs-code-keyword">{'}'}</span>,
                    <br />  <span className="docs-code-keyword">{'{'}</span> field: <span className="docs-code-string">'role'</span>, headerName: <span className="docs-code-string">'Role'</span>, width: 150 <span className="docs-code-keyword">{'}'}</span>
                    <br />];
                    <br /><br />
                    <span className="docs-code-keyword">const</span> rows = [
                    <br />  <span className="docs-code-keyword">{'{'}</span> id: 1, name: <span className="docs-code-string">'Alicia Smith'</span>, role: <span className="docs-code-string">'Admin'</span> <span className="docs-code-keyword">{'}'}</span>,
                    <br />  <span className="docs-code-keyword">{'{'}</span> id: 2, name: <span className="docs-code-string">'Bob Johnson'</span>, role: <span className="docs-code-string">'Editor'</span> <span className="docs-code-keyword">{'}'}</span>,
                    <br />  <span className="docs-code-keyword">{'{'}</span> id: 3, name: <span className="docs-code-string">'Charlie Brown'</span>, role: <span className="docs-code-string">'Viewer'</span> <span className="docs-code-keyword">{'}'}</span>
                    <br />];
                </div>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">3. Render the Grid</h2>
                <div className="docs-code-block">
                    <span className="docs-code-keyword">export default function</span> App() <span className="docs-code-keyword">{'{'}</span>
                    <br />  <span className="docs-code-keyword">return</span> (
                    <br />    &lt;<span className="docs-code-keyword">div</span> style=<span className="docs-code-keyword">{"{{ width: '100%' }}"}</span>&gt;
                    <br />      &lt;<span className="docs-code-keyword">DataGrid</span> rows=<span className="docs-code-string">{'{rows}'}</span> columns=<span className="docs-code-string">{'{columns}'}</span> /&gt;
                    <br />    &lt;/<span className="docs-code-keyword">div</span>&gt;
                    <br />  );
                    <br /><span className="docs-code-keyword">{'}'}</span>
                </div>
            </section>

            <div className="docs-alert">
                <span className="docs-alert-icon">💡</span>
                <div className="docs-alert-body">
                    <strong>Note:</strong> The grid or its container MUST have a defined height for virtualization to work correctly.
                </div>
            </div>

            <section className="docs-section">
                <h2 className="docs-h2">📚 Next Steps</h2>
                <p>Now that you have a basic grid running, explore these interactive live demos:</p>
                <div className="docs-card-grid">
                    <div className="docs-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('Advanced Filtering')}>
                        <div className="docs-card-title">🔍 Advanced Filtering</div>
                        <p>Enable global search and column-level complex filters with AND/OR logic.</p>
                        <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>Open demo →</span>
                    </div>
                    <div className="docs-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('Interactive CRUD')}>
                        <div className="docs-card-title">✏️ Interactive CRUD</div>
                        <p>Learn how to create, update, and delete rows using grid state management.</p>
                        <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>Open demo →</span>
                    </div>
                    <div className="docs-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('Export Data')}>
                        <div className="docs-card-title">📤 Export Data</div>
                        <p>Production-ready Excel (.xlsx), CSV, JSON, and browser Print exports.</p>
                        <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>Open demo →</span>
                    </div>
                    <div className="docs-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('Pivot Mode')}>
                        <div className="docs-card-title">� Pivot Mode</div>
                        <p>Powerful cross-tabulation for business intelligence and analytics.</p>
                        <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>Open demo →</span>
                    </div>
                    <div className="docs-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('Theming')}>
                        <div className="docs-card-title">🎨 Theming</div>
                        <p>Apply custom brand colors, dark mode, and compact density presets.</p>
                        <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>Open demo →</span>
                    </div>
                    <div className="docs-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('Slots & Renderers')}>
                        <div className="docs-card-title">🧩 Slots & Renderers</div>
                        <p>Go headless — replace any internal component with your own UI.</p>
                        <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600 }}>Open demo →</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
