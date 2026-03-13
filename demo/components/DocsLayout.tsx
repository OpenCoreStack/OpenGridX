import React, { useState } from 'react';
import './DocsLayout.css';

interface DocsLayoutProps {
    title: string;
    description: string | React.ReactNode;
    children: React.ReactNode;
    sourceCode?: string;
}

export function DocsLayout({ title, description, children, sourceCode }: DocsLayoutProps) {
    const [showSource, setShowSource] = useState(false);

    const handleCopy = () => {
        if (sourceCode) {
            navigator.clipboard.writeText(sourceCode);

        }
    };

    return (
        <div className="docs-layout">
            <header className="docs-header" id={title.replace(/\s+/g, '-').toLowerCase()}>
                <h1 className="docs-title">{title}</h1>
                <div className="docs-description">{description}</div>
            </header>

            <h2 id="live-preview" style={{ marginTop: 32, marginBottom: 16 }}>Live Preview</h2>

            <div className="docs-preview-container">
                <div className="docs-toolbar">
                    <span className="docs-label">Preview</span>
                    <div className="docs-actions">
                        {}
                    </div>
                </div>
                <div className="docs-canvas">
                    {children}
                </div>
            </div>

            {sourceCode && (
                <div className={`docs-source-container ${showSource ? 'open' : ''}`} style={{ marginTop: 32 }}>
                    <h2 id="source-code" style={{ paddingLeft: 12, margin: '24px 0 16px 0' }}>Full Source Code</h2>
                    <div className="docs-source-header" onClick={() => setShowSource(!showSource)}>
                        <span className="docs-label">Source</span>
                        <div className="docs-actions">
                            <button
                                className="docs-btn docs-btn-text"
                                onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                            >
                                Copy
                            </button>
                            <span className="docs-chevron">
                                {showSource ? 'Hide' : 'Show'}
                            </span>
                        </div>
                    </div>
                    {showSource && (
                        <div className="docs-source-content">
                            <pre className="docs-code-block">
                                <code>{sourceCode}</code>
                            </pre>
                        </div>
                    )}
                </div>
            )}

            <div id="implementation-guide" style={{ marginTop: 40, padding: '0 8px 32px' }}>
                <h2 id="technical-guidance">Technical Guidance</h2>
                <p>
                    Implementing the <strong>{title}</strong> patterns requires importing the core dependencies 
                    directly from the main package. Ensure that your imports point correctly to the distributed library.
                </p>
                
                <h3 id="dependencies">Dependencies & Imports</h3>
                <div className="docs-source-content" style={{ marginTop: 12, marginBottom: 24 }}>
                    <pre className="docs-code-block" style={{ background: '#1e1e1e', padding: '16px', borderRadius: '8px', color: '#d4d4d4', overflowX: 'auto' }}>
                        <code>{`// Core imports should exclusively target the published package
import { DataGrid, GridColDef } from '@opencorestack/opengridx';
import '@opencorestack/opengridx/styles'; // Don't forget the base CSS styles`}</code>
                    </pre>
                </div>

                <h3 id="best-practices">Integration Best Practices</h3>
                <ul style={{ lineHeight: 1.6, color: '#4b5563', paddingLeft: 20 }}>
                    <li><strong style={{ color: '#111827' }}>Memorization:</strong> Wrap complex data processing or extensive column arrays in <code>useMemo</code> hooks so React does not recreate large references constantly.</li>
                    <li><strong style={{ color: '#111827' }}>Stable Methods:</strong> Supply stable functional references to event handlers like callbacks (e.g., <code>useCallback</code>) to prevent re-renders when rendering heavily customized cells.</li>
                    <li><strong style={{ color: '#111827' }}>Performance:</strong> Try to declare <code>columns</code> completely outside the component if it lacks interactive state.</li>
                </ul>

                <div className="docs-source-content" style={{ marginTop: 16 }}>
                    <pre className="docs-code-block" style={{ background: '#1e1e1e', padding: '16px', borderRadius: '8px', color: '#d4d4d4', overflowX: 'auto' }}>
                        <code>{`// Minimal implementation boilerplate
export default function RobustGrid() {
    return (
        <DataGrid 
            rows={rows} 
            columns={columns}
            // Insert your grid props here...
        />
    );
}`}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}
