import React, { useState } from 'react';
import './DocsLayout.css';
import { CodeBlock } from './CodeBlock';

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
                            <CodeBlock code={sourceCode} />
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
                    <CodeBlock code={`// Core imports should exclusively target the published package
import { DataGrid, GridColDef } from '@opencorestack/opengridx';
import '@opencorestack/opengridx/styles'; // Don't forget the base CSS styles`} />
                </div>

                <h3 id="best-practices">Integration Best Practices</h3>
                <ul style={{ lineHeight: 1.6, color: '#4b5563', paddingLeft: 20 }}>
                    <li><strong style={{ color: '#111827' }}>Rows:</strong> change a row by passing a new object (<code>rows.map(r =&gt; r.id === id ? {'{ ...r, ...changes }'} : r)</code>), never by mutating it: the grid caches per row object.</li>
                    <li><strong style={{ color: '#111827' }}>Columns and handlers:</strong> inline <code>columns</code> and handlers such as <code>onRowClick</code> are fine. Columns are compared shallowly (a new inline <code>valueGetter</code> function counts as a change), and rows receive the grid's own stable handlers.</li>
                    <li><strong style={{ color: '#111827' }}>Height:</strong> give the grid a bounded height (a <code>height</code> prop or a sized parent) so it virtualizes. See <em>Performance</em> in the docs.</li>
                </ul>

                <div className="docs-source-content" style={{ marginTop: 16 }}>
                    <CodeBlock code={`// Minimal implementation boilerplate
export default function RobustGrid() {
    return (
        <DataGrid 
            rows={rows} 
            columns={columns}
            // Insert your grid props here...
        />
    );
}`} />
                </div>
            </div>
        </div>
    );
}
