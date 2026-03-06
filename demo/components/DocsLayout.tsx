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
            <header className="docs-header">
                <h1 className="docs-title">{title}</h1>
                <div className="docs-description">{description}</div>
            </header>

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
                <div className={`docs-source-container ${showSource ? 'open' : ''}`}>
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
        </div>
    );
}
