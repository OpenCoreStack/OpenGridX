import './Docs.css';

export default function Installation() {
    return (
        <div className="docs-container">
            <h1 className="docs-title">🚀 Installation</h1>
            <p className="docs-lead">Get OpenGridX up and running in your project in seconds. Optimized for React 18+ and modern bundlers.</p>

            <section className="docs-section">
                <h2 className="docs-h2">📦 Package Managers</h2>
                <div className="docs-code-block">
                    <span className="docs-code-comment"># Install using npm</span>
                    <br />
                    npm install <span className="docs-code-string">@opencorestack/opengridx</span>
                    <br /><br />
                    <span className="docs-code-comment"># Install using yarn</span>
                    <br />
                    yarn add <span className="docs-code-string">@opencorestack/opengridx</span>
                    <br /><br />
                    <span className="docs-code-comment"># Install using pnpm</span>
                    <br />
                    pnpm add <span className="docs-code-string">@opencorestack/opengridx</span>
                </div>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">🧩 Peer Dependencies</h2>
                <p>OpenGridX requires <strong>React</strong> and <strong>React DOM</strong> version 18 or higher.</p>
                <div className="docs-code-block">
                    <span className="docs-code-comment"># Ensure you have the core React ecosystem installed</span>
                    <br />
                    npm install <span className="docs-code-keyword">react react-dom</span>
                </div>
            </section>

            <div className="docs-alert">
                <span className="docs-alert-icon">💡</span>
                <div className="docs-alert-body">
                    <strong>Pro Tip:</strong> OpenGridX is fully tree-shakable. Your final bundle will only include the features you actually use.
                </div>
            </div>

            <section className="docs-section">
                <h2 className="docs-h2">🎨 Styles</h2>
                <p>Styles are <strong>automatically included</strong> when you import the <code>DataGrid</code> component — no separate CSS import is required.</p>
                <p>If you need to import styles manually (e.g., for SSR or CSS-in-JS setups), you can use the explicit styles export:</p>
                <div className="docs-code-block">
                    <span className="docs-code-comment">{'// Optional — only needed for SSR or manual style control'}</span>
                    <br />
                    <span className="docs-code-keyword">import</span> <span className="docs-code-string">'@opencorestack/opengridx/styles'</span>;
                </div>
            </section>
        </div>
    );
}
