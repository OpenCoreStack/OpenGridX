import { useState, lazy, Suspense } from 'react';
import './App.css';

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

const examplesConfig: { name: string; component: React.LazyExoticComponent<React.ComponentType<any>>; category: string }[] = [
    // Resources
    { name: 'Home', component: Home, category: 'Resources' },
    { name: 'Installation', component: lazy(() => import('./pages/Installation')), category: 'Resources' },
    { name: 'Quickstart', component: lazy(() => import('./pages/Quickstart')), category: 'Resources' },
    { name: 'API Reference', component: lazy(() => import('./pages/APIDocumentation')), category: 'Resources' },
    { name: 'Licensing', component: lazy(() => import('./pages/Licensing')), category: 'Resources' },
    { name: 'Support', component: lazy(() => import('./pages/Support')), category: 'Resources' },

    // Main Features
    { name: 'Basic Usage', component: BasicExample, category: 'Main features' },
    { name: 'Loading States', component: LoadingStatesDemo, category: 'Main features' },
    { name: 'Export Data', component: ExportDemo, category: 'Main features' },
    { name: 'Clipboard Copy', component: ClipboardDemo, category: 'Main features' },
    { name: 'Advanced Filtering', component: AdvancedFilteringDemo, category: 'Main features' },
    { name: 'Cell Editing', component: EditingExample, category: 'Main features' },
    { name: 'Events Observer', component: EventsDemo, category: 'Main features' },
    { name: 'Full Feature Test', component: DataGridTest, category: 'Main features' },

    // Advanced Features
    { name: 'Row Grouping', component: GroupingExample, category: 'Advanced features' },
    { name: 'Tree Data', component: TreeDataExample, category: 'Advanced features' },
    { name: 'Master Detail', component: MasterDetailExample, category: 'Advanced features' },
    { name: 'Aggregation Footer', component: AggregationFooterExample, category: 'Advanced features' },
    { name: 'Row Spanning', component: RowSpanningShowcase, category: 'Advanced features' },
    { name: 'Cell Spanning', component: CellSpanningShowcase, category: 'Advanced features' },
    { name: 'Pivot Mode', component: PivotModeDemo, category: 'Advanced features' },
    { name: 'Column Grouping', component: ColumnGroupingExample, category: 'Advanced features' },
    { name: 'State Persistence', component: StatePersistenceDemo, category: 'Advanced features' },
    { name: 'Advanced Excel Export', component: AdvancedExcelExportDemo, category: 'Advanced features' },
    { name: 'Lazy Loading', component: LazyLoadingExample, category: 'Advanced features' },
    { name: 'Infinite Scroll', component: InfiniteScrollDemo, category: 'Advanced features' },
    { name: 'Server-Side Tree', component: ServerSideTreeDemo, category: 'Advanced features' },
    { name: 'Server-Side Aggregation', component: ServerSideAggregationDemo, category: 'Advanced features' },
    { name: 'Custom Pagination', component: CustomPaginationDemo, category: 'Advanced features' },

    // Components
    { name: 'Toolbar', component: ToolbarDemo, category: 'Components' },
    { name: 'Filter Panel', component: FilterPanelDemo, category: 'Components' },

    // Customization
    { name: 'Theming', component: ThemingDemo, category: 'Customization' },
    { name: 'List View', component: ListViewDemo, category: 'Customization' },
    { name: 'Slots & Renderers', component: SlotsDemo, category: 'Customization' },

    // Tutorials
    { name: 'Real Estate Portfolio', component: RealEstatePortfolioDemo, category: 'Tutorials' },
    { name: 'Time Off Calendar', component: EmployeeCalendarDemo, category: 'Tutorials' },
    { name: 'Interactive CRUD', component: CRUDTutorial, category: 'Tutorials' },
];

function DemoSkeleton() {
    return (
        <div className="demo-skeleton-container">
            <div className="demo-skeleton-spinner" />
            <span className="demo-skeleton-text">Loading demo…</span>
        </div>
    );
}

function App() {
    const [selectedExample, setSelectedExample] = useState('Home');

    const activeConfig = examplesConfig.find(e => e.name === selectedExample) || examplesConfig[0];
    const ActiveComponent = activeConfig.component;

    const grouped = examplesConfig.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, typeof examplesConfig>);

    const categories = ['Resources', 'Main features', 'Advanced features', 'Components', 'Customization', 'Tutorials'];

    return (
        <div className="app-container">
            <nav className="app-sidebar">
                <div className="app-logo-section">
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="OpenGridX Logo" className="app-logo" />
                    <h2 className="app-title">
                        OpenGridX
                        <span className="app-version">v0.1.2</span>
                    </h2>
                </div>

                {categories.map(category => (
                    <div key={category}>
                        <h3 className="sidebar-category-title">
                            {category}
                        </h3>
                        <div className="sidebar-nav-group">
                            {grouped[category]?.map(item => (
                                <button
                                    key={item.name}
                                    className={`sidebar-nav-button${selectedExample === item.name ? ' sidebar-nav-button--active' : ''}`}
                                    onClick={() => setSelectedExample(item.name)}
                                >
                                    {item.name}
                                </button>
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
                    <ActiveComponent onNavigate={setSelectedExample} />
                </Suspense>
            </main>
        </div>
    );
}

export default App;
