import './Docs.css';

export default function Licensing() {
    return (
        <div className="docs-container">
            <h1 className="docs-title">⚖️ Licensing</h1>
            <p className="docs-lead">OpenGridX is committed to high-performance open-source software, balanced with sustainable development for enterprise users.</p>

            <section className="docs-section">
                <h2 className="docs-h2">🛠️ MIT License (Open Source)</h2>
                <p>The core OpenGridX library is licensed under the <strong>MIT License</strong>. You are free to use, modify, and distribute the core features in any personal or commercial project.</p>
                <div className="docs-code-block" style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                    Copyright (c) 2026 OpenGridX Team
                    <br /><br />
                    Permission is hereby granted, free of charge, to any person obtaining a copy
                    of this software and associated documentation files (the "Software"), to deal
                    in the Software without restriction, including without limitation the rights
                    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                    copies of the Software, and to permit persons to whom the Software is
                    furnished to do so, subject to the following conditions:
                    <br /><br />
                    The above copyright notice and this permission notice shall be included in all
                    copies or substantial portions of the Software.
                </div>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">🏢 Enterprise Edition</h2>
                <p>Advanced features such as <strong>Advanced ExcelJS Export</strong>, <strong>Pivot Mode</strong>, and <strong>Interactive Pivot Builder</strong> are part of the Enterprise edition.</p>
                <div className="docs-card-grid">
                    <div className="docs-card">
                        <div className="docs-card-title">Commercial Support</div>
                        <p>Dedicated engineers to help you integrate and scale.</p>
                    </div>
                    <div className="docs-card">
                        <div className="docs-card-title">Advanced Components</div>
                        <p>Unlock complex analytics and reporting tools.</p>
                    </div>
                    <div className="docs-card">
                        <div className="docs-card-title">Custom SLAs</div>
                        <p>Guaranteed response times and priority bug fixes.</p>
                    </div>
                </div>
            </section>

            <div className="docs-alert">
                <span className="docs-alert-icon">📫</span>
                <div className="docs-alert-body">
                    <strong>Questions?</strong> Contact our licensing team at <a href="mailto:licensing@opengridx.com" style={{ color: 'inherit', fontWeight: 700 }}>licensing@opengridx.com</a>.
                </div>
            </div>
        </div>
    );
}
