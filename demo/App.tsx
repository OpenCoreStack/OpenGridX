import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import { Toc } from './components/Toc';

const Home = lazy(() => import('./Home'));
const BasicExample = lazy(() => import('./examples/Basic/Basic'));
const AdvancedFilteringDemo = lazy(() => import('./examples/AdvancedFilteringDemo/AdvancedFilteringDemo'));
const GroupingExample = lazy(() => import('./examples/Grouping/Grouping'));
const TreeDataExample = lazy(() => import('./examples/TreeData/TreeData'));
const EditingExample = lazy(() => import('./examples/Editing/Editing'));
const MasterDetailExample = lazy(() => import('./examples/MasterDetail/MasterDetail'));
const AggregationFooterExample = lazy(() => import('./examples/AggregationFooter/AggregationFooter'));
const CellSpanningShowcase = lazy(() => import('./examples/CellSpanningShowcase/CellSpanningShowcase'));
const RowSpanningShowcase = lazy(() => import('./examples/RowSpanningShowcase/RowSpanningShowcase'));
const ColumnGroupingExample = lazy(() => import('./examples/ColumnGroupingExample/ColumnGroupingExample'));
const LazyLoadingExample = lazy(() => import('./examples/LazyLoading/LazyLoading'));
const InfiniteScrollDemo = lazy(() => import('./examples/InfiniteScrollDemo/InfiniteScrollDemo'));
const CustomPaginationDemo = lazy(() => import('./examples/CustomPagination/CustomPagination'));
const ExportDemo = lazy(() => import('./examples/ExportDemo/ExportDemo'));
const AdvancedExcelExportDemo = lazy(() => import('./examples/AdvancedExcelExportDemo/AdvancedExcelExportDemo'));
const ClipboardDemo = lazy(() => import('./examples/ClipboardDemo/ClipboardDemo'));
const EventsDemo = lazy(() => import('./examples/EventsDemo/EventsDemo'));
const DataGridTest = lazy(() => import('./examples/DataGridTest/DataGridTest'));
const ServerSideTreeDemo = lazy(() =>
    import('./examples/ServerSideTreeDemo/ServerSideTreeDemo').then(m => ({ default: m.ServerSideTreeDemo }))
);
const ServerSideAggregationDemo = lazy(() => import('./examples/ServerSideAggregationDemo/ServerSideAggregationDemo'));
const ThemingDemo = lazy(() => import('./examples/ThemingDemo/ThemingDemo'));
const StatePersistenceDemo = lazy(() => import('./examples/StatePersistenceDemo/StatePersistenceDemo'));
const PivotModeDemo = lazy(() => import('./examples/PivotModeDemo/PivotModeDemo'));
const ListViewDemo = lazy(() => import('./examples/ListViewDemo/ListViewDemo'));
const RealEstatePortfolioDemo = lazy(() => import('./examples/RealEstatePortfolioDemo/RealEstatePortfolioDemo'));
const EmployeeCalendarDemo = lazy(() => import('./examples/EmployeeCalendarDemo/EmployeeCalendarDemo'));
const LoadingStatesDemo = lazy(() => import('./examples/LoadingStatesDemo/LoadingStatesDemo'));
const ToolbarDemo = lazy(() => import('./examples/ToolbarDemo/ToolbarDemo'));
const FilterPanelDemo = lazy(() => import('./examples/FilterPanelDemo/FilterPanelDemo'));
const SlotsDemo = lazy(() => import('./examples/SlotsDemo/SlotsDemo'));
const CRUDTutorial = lazy(() => import('./examples/CRUDTutorial/CRUDTutorial'));

const examplesConfig = [
    // Resources
    { path: '/home', name: 'Home', component: Home, category: 'Resources' },
    { path: '/installation', name: 'Installation', component: lazy(() => import('./pages/Installation')), category: 'Resources' },
    { path: '/quickstart', name: 'Quickstart', component: lazy(() => import('./pages/Quickstart')), category: 'Resources' },
    { path: '/api-reference', name: 'API Reference', component: lazy(() => import('./pages/APIDocumentation')), category: 'Resources' },
    { path: '/licensing', name: 'Licensing', component: lazy(() => import('./pages/Licensing')), category: 'Resources' },
    { path: '/support', name: 'Support', component: lazy(() => import('./pages/Support')), category: 'Resources' },

    // Main Features
    { path: '/basic', name: 'Basic Usage', component: BasicExample, category: 'Main features' },
    { path: '/loading', name: 'Loading States', component: LoadingStatesDemo, category: 'Main features' },
    { path: '/export', name: 'Export Data', component: ExportDemo, category: 'Main features' },
    { path: '/clipboard', name: 'Clipboard Copy', component: ClipboardDemo, category: 'Main features' },
    { path: '/filtering', name: 'Advanced Filtering', component: AdvancedFilteringDemo, category: 'Main features' },
    { path: '/editing', name: 'Cell Editing', component: EditingExample, category: 'Main features' },
    { path: '/events', name: 'Events Observer', component: EventsDemo, category: 'Main features' },
    { path: '/full-test', name: 'Full Feature Test', component: DataGridTest, category: 'Main features' },

    // Advanced Features
    { path: '/grouping', name: 'Row Grouping', component: GroupingExample, category: 'Advanced features' },
    { path: '/tree-data', name: 'Tree Data', component: TreeDataExample, category: 'Advanced features' },
    { path: '/master-detail', name: 'Master Detail', component: MasterDetailExample, category: 'Advanced features' },
    { path: '/aggregation', name: 'Aggregation', component: AggregationFooterExample, category: 'Advanced features' },
    { path: '/row-span', name: 'Row Spanning', component: RowSpanningShowcase, category: 'Advanced features' },
    { path: '/cell-span', name: 'Cell Spanning', component: CellSpanningShowcase, category: 'Advanced features' },
    { path: '/pivot', name: 'Pivot Mode', component: PivotModeDemo, category: 'Advanced features' },
    { path: '/col-grouping', name: 'Column Grouping', component: ColumnGroupingExample, category: 'Advanced features' },
    { path: '/persistence', name: 'State Persistence', component: StatePersistenceDemo, category: 'Advanced features' },
    { path: '/excel-export', name: 'Advanced Excel Export', component: AdvancedExcelExportDemo, category: 'Advanced features' },
    { path: '/lazy-loading', name: 'Lazy Loading', component: LazyLoadingExample, category: 'Advanced features' },
    { path: '/infinite', name: 'Infinite Scroll', component: InfiniteScrollDemo, category: 'Advanced features' },
    { path: '/server-tree', name: 'Server-Side Tree', component: ServerSideTreeDemo, category: 'Advanced features' },
    { path: '/server-agg', name: 'Server-Side Aggregation', component: ServerSideAggregationDemo, category: 'Advanced features' },
    { path: '/custom-pagination', name: 'Custom Pagination', component: CustomPaginationDemo, category: 'Advanced features' },

    // Components
    { path: '/toolbar', name: 'Toolbar', component: ToolbarDemo, category: 'Components' },
    { path: '/filter-panel', name: 'Filter Panel', component: FilterPanelDemo, category: 'Components' },

    // Customization
    { path: '/theming', name: 'Theming', component: ThemingDemo, category: 'Customization' },
    { path: '/list-view', name: 'List View', component: ListViewDemo, category: 'Customization' },
    { path: '/slots', name: 'Slots & Renderers', component: SlotsDemo, category: 'Customization' },

    // Tutorials
    { path: '/real-estate', name: 'Real Estate Portfolio', component: RealEstatePortfolioDemo, category: 'Tutorials' },
    { path: '/calendar', name: 'Time Off Calendar', component: EmployeeCalendarDemo, category: 'Tutorials' },
    { path: '/crud', name: 'Interactive CRUD', component: CRUDTutorial, category: 'Tutorials' },
];

function DemoSkeleton() {
    return (
        <div className="demo-skeleton-container">
            <div className="demo-skeleton-spinner" />
            <span className="demo-skeleton-text">Loading demo…</span>
        </div>
    );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    
    // Check if current route is in 'Resources' category
    const currentConfig = examplesConfig.find(item => item.path === location.pathname);
    const isResourcePage = currentConfig?.category === 'Resources';

    // Automatically extract TOC from current page, except for Resources
    return (
        <div className="app-page-wrapper" key={location.pathname}>
            <div className={`app-content-column ${isResourcePage ? 'app-content-column--full-width' : ''}`}>
                {children}
            </div>
            {!isResourcePage && <Toc />}
        </div>
    );
}

export default function App() {
    const grouped = examplesConfig.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, typeof examplesConfig>);

    const categories = ['Resources', 'Main features', 'Advanced features', 'Components', 'Customization', 'Tutorials'];

    return (
        <Router basename={import.meta.env.BASE_URL}>
            <div className="app-root">
                <header className="app-top-header">
                    <div className="app-logo-section">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="OpenGridX Logo" className="app-logo" />
                        <h2 className="app-title">
                            OpenGridX
                            <span className="app-version">v0.1.8</span>
                        </h2>
                    </div>

                    <a href="https://github.com/OpenCoreStack/OpenGridX" target="_blank" rel="noopener noreferrer" className="app-github-link">
                        <svg height="24" viewBox="0 0 16 16" width="24" fill="currentColor">
                            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
                        </svg>
                        GitHub
                    </a>
                </header>

                <div className="app-container">
                    <nav className="app-sidebar">
                        {categories.map(category => (
                            <div key={category}>
                                <h3 className="sidebar-category-title">
                                    {category}
                                </h3>
                                <div className="sidebar-nav-group">
                                    {grouped[category]?.map(item => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `sidebar-nav-button${isActive ? ' sidebar-nav-button--active' : ''}`
                                            }
                                        >
                                            {item.name}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                            <h3 className="sidebar-category-title">Discovery</h3>
                            <div className="sidebar-nav-group">
                                <a
                                    href="/llms.txt"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="sidebar-nav-button"
                                    style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <span>🤖</span>
                                    llms.txt
                                </a>
                            </div>
                        </div>
                    </nav>
                    <main className="app-main-content">
                        <Suspense fallback={<DemoSkeleton />}>
                            <Routes>
                                <Route path="/" element={<Navigate to="/home" replace />} />
                                {examplesConfig.map((item) => (
                                    <Route
                                        key={item.path}
                                        path={item.path}
                                        element={<PageWrapper><item.component /></PageWrapper>}
                                    />
                                ))}
                            </Routes>
                        </Suspense>
                    </main>
                </div>
            </div>
        </Router>
    );
}
