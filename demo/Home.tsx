import './Home.css';

interface HomeProps {
    onNavigate?: (id: string) => void;
}

export default function Home(_props: HomeProps) {
    const coreCapabilities = [
        {
            icon: '⚡',
            name: 'Extreme Performance',
            desc: 'Built-in virtualization engine handling 100,000+ rows with constant 60fps scrolling.'
        },
        {
            icon: '🛰️',
            name: 'Server-Side Architecture',
            desc: 'Advanced hooks for remote filtering, sorting, and lazy loading with full SSR support.'
        },
        {
            icon: '🎨',
            name: 'Headless Flexibility',
            desc: 'Full UI customization via the Slots API. Replace any part of the grid with your own components.'
        },
        {
            icon: '📱',
            name: 'List View Mode',
            desc: 'Instant responsive transformation into a card-based layout for mobile users.'
        }
    ];

    const currentFeatures = [
        { icon: '🔍', name: 'Global Quick Search', desc: 'Instant search across every column in the current dataset.' },
        { icon: '📑', name: 'Column Grouping', desc: 'Multi-level nested header structures for complex data.' },
        { icon: '📍', name: 'Smart Pinning', desc: 'Secure columns or specific rows to the edges for persistence.' },
        { icon: '📏', name: 'Dynamic Resizing', desc: 'User-driven column width adjustments with constraints.' },
        { icon: '🖱️', name: 'Multi-Selection', desc: 'Robust row selection with checkbox support and range select.' },
        { icon: '⌨️', name: 'Clipboard API', desc: 'Full TSV-formatted copy support for Excel/Google Sheets.' },
        { icon: '📐', name: 'Row & Cell Spanning', desc: 'Merge adjacent cells based on value similarity or rules.' },
        { icon: '⌛', name: 'Loading Overlays', desc: 'Professional skeleton screens and shimmer effects for data transitions.' },
        { icon: '♿', name: 'A11Y Optimized', desc: 'Full WCAG 2.1 compliance with screen reader and keyboard navigation support.' },
        { icon: '🎨', name: 'Premium Theming', desc: 'Custom branding and dark mode support via the Slots and Theming API.' },
        { icon: '💾', name: 'State Persistence', desc: 'Save and restore user grid preferences (columns, filters, sorting) automatically.' }
    ];

    const advancedFeatures = [
        { icon: '📈', name: 'Pivot & Analytics', desc: 'Multi-dimensional data rotation for deep business intelligence.' },
        { icon: '🌳', name: 'Native Tree Data', desc: 'Manage hierarchies with expand/collapse logic and recursive paths.' },
        { icon: '📊', name: 'Dynamic Aggregations', desc: 'Footer and inline summaries (Sum, Avg, Min, Max, Unique).' },
        { icon: '📤', name: 'ExcelJS Integration', desc: 'Export multi-sheet, styled, and formula-aware XLSX files.' }
    ];

    const comingSoon = [
        { badge: 'Q2 2026', name: 'Advanced Charts Integration', desc: 'Native sparklines and trend charts directly inside grid cells.' },
        { badge: 'Q3 2026', name: 'Interactive Pivot Builder', desc: 'Intuitive drag-and-drop interface for end-user analytics.' },
        { badge: 'Q4 2026', name: 'Native PDF Reporting', desc: 'Automated PDF generation with customizable layouts.' }
    ];

    const browsers = [
        { icon: '🌐', name: 'Chrome 60+' },
        { icon: '🧭', name: 'Safari 12+' },
        { icon: '🚀', name: 'Firefox 60+' },
        { icon: '🔵', name: 'Edge 79+' }
    ];

    return (
        <div className="home-container">
            <header className="home-hero">
                <div className="home-logo-hero">
                    <img src={`${import.meta.env.BASE_URL}banner.png`} alt="OpenGridX Logo" className="home-banner-image" />
                </div>
                <span className="home-badge">OpenGridX v0.1.2</span>
                <p className="home-subtitle">
                    The elite, high-performance DataGrid for modern React.
                    Built to handle massive data with a premium developer experience.
                </p>
            </header>

            <section className="home-section">
                <h2 className="home-section-title">📖 Project Overview</h2>
                <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', borderLeft: '6px solid #4f46e5' }}>
                    <p style={{ fontSize: '1.1rem', margin: '0 0 16px', fontWeight: 600, color: '#0f172a' }}>
                        The OpenGridX project was born from a simple mission: to build the most performant, most extensible, and most intuitive DataGrid for the React ecosystem.
                    </p>
                    <p style={{ margin: '0 0 24px' }}>
                        Traditional grids often struggle as soon as data exceeds a few hundred rows or when custom UI requirements clash with rigid internal architectures. OpenGridX solves this by using a <strong>Headless-First architecture</strong>. We provide the complex state management, virtualization, and enterprise logic, while giving you complete control over every pixel through the <strong>Slots API</strong>.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                        <div>
                            <h4 style={{ margin: '0 0 8px', color: '#4f46e5' }}>🚀 Performance First</h4>
                            <p style={{ fontSize: '0.85rem', margin: 0 }}>Built-in virtualization and optimized render loops ensure smoothness even on low-end hardware.</p>
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 8px', color: '#4f46e5' }}>🧩 Modular Core</h4>
                            <p style={{ fontSize: '0.85rem', margin: 0 }}>Everything is a slot. Replace headers, cells, footers, or even the scrollbar with your own components.</p>
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 8px', color: '#4f46e5' }}>💼 Enterprise Grade</h4>
                            <p style={{ fontSize: '0.85rem', margin: 0 }}>Native support for Pivot, Tree Data, and ExcelJS exports for mission-critical applications.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="home-section">
                <h2 className="home-section-title">🚀 Core Capabilities</h2>
                <div className="home-grid">
                    {coreCapabilities.map((f, i) => (
                        <div key={i} className="feature-card">
                            <span className="feature-icon">{f.icon}</span>
                            <h3 className="feature-name">{f.name}</h3>
                            <p className="feature-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="home-section">
                <h2 className="home-section-title">✅ Current Features</h2>
                <div className="home-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                    {currentFeatures.map((f, i) => (
                        <div key={i} className="feature-card">
                            <span className="feature-icon" style={{ fontSize: '1.2rem', width: '40px', height: '40px' }}>{f.icon}</span>
                            <h3 className="feature-name" style={{ fontSize: '1rem' }}>{f.name}</h3>
                            <p className="feature-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="home-section">
                <h2 className="home-section-title">🏆 Advanced Features</h2>
                <div className="home-grid">
                    {advancedFeatures.map((f, i) => (
                        <div key={i} className="feature-card" style={{ background: 'linear-gradient(135deg, #fff 0%, #f0fdf4 100%)', borderColor: '#bbf7d0' }}>
                            <span className="feature-icon" style={{ background: '#fff' }}>{f.icon}</span>
                            <h3 className="feature-name">{f.name}</h3>
                            <p className="feature-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="home-section">
                <div className="stats-grid">
                    <div className="stat-box">
                        <span className="stat-label">📦 Footprint</span>
                        <div className="stat-value">28.4 <span style={{ fontSize: '1rem', color: '#94a3b8' }}>KB</span></div>
                        <p className="feature-desc" style={{ marginTop: '12px' }}>Gzipped & Tree-shaken bundle size including styles.</p>
                    </div>
                    <div className="stat-box">
                        <span className="stat-label">🌍 Browser Support</span>
                        <div className="browser-list">
                            {browsers.map((b, i) => (
                                <div key={i} className="browser-item">
                                    <span className="browser-icon">{b.icon}</span>
                                    <span>{b.name}</span>
                                </div>
                            ))}
                        </div>
                        <p className="feature-desc" style={{ marginTop: '12px' }}>Optimized for all evergreen platforms.</p>
                    </div>
                </div>
            </section>

            <section className="home-section">
                <h2 className="home-section-title">🚧 Coming Soon</h2>
                <div className="coming-soon-list">
                    {comingSoon.map((p, i) => (
                        <div key={i} className="coming-soon-card">
                            <span className="soon-badge">{p.badge}</span>
                            <h4 className="feature-name" style={{ margin: '8px 0' }}>{p.name}</h4>
                            <p className="feature-desc">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
