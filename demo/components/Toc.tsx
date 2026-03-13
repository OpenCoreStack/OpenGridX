import { useState, useEffect } from 'react';

export function Toc() {
    const [headings, setHeadings] = useState<{ id: string, text: string, level: number }[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const calculateHeadings = () => {
            const elements = Array.from(document.querySelectorAll('.app-main-content h1, .app-main-content h2, .app-main-content h3'));
            const newHeadings = elements.map((el) => {
                if (!el.id) {
                    el.id = el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'id-' + Math.random().toString(36).substr(2, 9);
                }
                return {
                    id: el.id,
                    text: el.textContent || '',
                    level: Number(el.tagName.replace('H', ''))
                };
            });
            setHeadings(newHeadings);
        };
        
        // Wait for content (suspense/lazy load)
        const timeoutId = setTimeout(calculateHeadings, 500);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveId(entry.target.id);
                }
            });
        }, { rootMargin: '0px 0px -60% 0px' });

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveId(entry.target.id);
                }
            });
        }, { rootMargin: '0px 0px -80% 0px' });

        headings.forEach(heading => {
            const el = document.getElementById(heading.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    return (
        <aside className="app-toc-sidebar">
            <h3 className="toc-title">On this page</h3>
            <ul className="toc-list">
                {headings.filter(h => h.level !== 1).map(h => (
                    <li key={h.id} className={`toc-item toc-level-${h.level}`}>
                        <a 
                            href={`#${h.id}`} 
                            className={`toc-link ${activeId === h.id ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' });
                                window.history.pushState(null, '', `#${h.id}`);
                            }}
                        >
                            {h.text}
                        </a>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
