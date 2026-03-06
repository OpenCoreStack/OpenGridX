import './Docs.css';

export default function Support() {
    return (
        <div className="docs-container">
            <h1 className="docs-title">📫 Support Channel</h1>
            <p className="docs-lead">We're here to help you build great applications. Get help from the community or directly from our core engineers.</p>

            <section className="docs-section">
                <h2 className="docs-h2">🛠️ Community Documentation</h2>
                <div className="docs-card-grid">
                    <a className="docs-card" href="https://github.com/opencorestack/OpenGridX/issues" target="_blank" rel="noopener noreferrer">
                        <div className="docs-card-title">🐛 GitHub Issues</div>
                        <p>Report bugs, request features, or view the current development status.</p>
                    </a>
                    <div className="docs-card docs-card--coming-soon">
                        <div className="docs-card-title">
                            💬 Discord Server
                            <span className="docs-coming-soon-badge">Coming Soon</span>
                        </div>
                        <p>Join our community to ask questions, share examples, and connect in real-time. Community channel launching soon!</p>
                    </div>
                </div>
            </section>

            <section className="docs-section">
                <h2 className="docs-h2">🏢 Enterprise Support</h2>
                <p>Enterprise users get access to our dedicated support infrastructure, including:</p>
                <ul>
                    <li><strong>Direct Access:</strong> Priority communication with core library developers.</li>
                    <li><strong>Guaranteed SLAs:</strong> Standard 24-hour response time for critical issues.</li>
                    <li><strong>Private Channels:</strong> Dedicated Slack or Microsoft Teams integration.</li>
                    <li><strong>Architectural Reviews:</strong> 1-on-1 sessions to optimize your grid architecture.</li>
                </ul>
            </section>

            <section className="docs-section docs-section--contact">
                <h2 className="docs-h2">📩 Contact Support</h2>
                <p>Don't hesitate to reach out. We're happy to discuss your specific data challenges.</p>
                <div className="docs-section--contact-actions">
                    <a href="mailto:asif.ansari7774@gmail.com" className="demo-link-btn">
                        Email Support
                    </a>
                    <a href="https://calendly.com/asif-ansari7774-calendly/30min" target="_blank" rel="noopener noreferrer" className="demo-link-btn demo-link-btn--secondary">
                        Schedule a Call
                    </a>
                </div>
            </section>
        </div>
    );
}
