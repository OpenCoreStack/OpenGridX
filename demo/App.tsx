import { lazy, Suspense } from 'react';
import { version as packageVersion } from '../package.json';
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
const CellSelectionDemo = lazy(() => import('./examples/CellSelectionDemo/CellSelectionDemo'));
const ClipboardPasteDemo = lazy(() => import('./examples/ClipboardPasteDemo/ClipboardPasteDemo'));
const FillHandleDemo = lazy(() => import('./examples/FillHandleDemo/FillHandleDemo'));
const UndoRedoDemo = lazy(() => import('./examples/UndoRedoDemo/UndoRedoDemo'));
const CustomEditorsDemo = lazy(() => import('./examples/CustomEditorsDemo/CustomEditorsDemo'));
const AiSchemaDemo = lazy(() => import('./examples/AiSchemaDemo/AiSchemaDemo'));
const AiAssistantDemo = lazy(() => import('./examples/AiAssistantDemo/AiAssistantDemo'));
const EventsDemo = lazy(() => import('./examples/EventsDemo/EventsDemo'));
const DataGridTest = lazy(() => import('./examples/DataGridTest/DataGridTest'));
const ServerSideTreeDemo = lazy(() =>
    import('./examples/ServerSideTreeDemo/ServerSideTreeDemo').then(m => ({ default: m.ServerSideTreeDemo }))
);
const ServerSideAggregationDemo = lazy(() => import('./examples/ServerSideAggregationDemo/ServerSideAggregationDemo'));
const ThemingDemo = lazy(() => import('./examples/ThemingDemo/ThemingDemo'));
const ThemeBuilderDemo = lazy(() => import('./examples/ThemeBuilderDemo/ThemeBuilderDemo'));
const StatePersistenceDemo = lazy(() => import('./examples/StatePersistenceDemo/StatePersistenceDemo'));
const PivotModeDemo = lazy(() => import('./examples/PivotModeDemo/PivotModeDemo'));
const ListViewDemo = lazy(() => import('./examples/ListViewDemo/ListViewDemo'));
const RealEstatePortfolioDemo = lazy(() => import('./examples/RealEstatePortfolioDemo/RealEstatePortfolioDemo'));
const EmployeeCalendarDemo = lazy(() => import('./examples/EmployeeCalendarDemo/EmployeeCalendarDemo'));
const LoadingStatesDemo = lazy(() => import('./examples/LoadingStatesDemo/LoadingStatesDemo'));
const ToolbarDemo = lazy(() => import('./examples/ToolbarDemo/ToolbarDemo'));
const ToolbarCustomizationDemo = lazy(() => import('./examples/ToolbarCustomizationDemo/ToolbarCustomizationDemo'));
const FilterPanelDemo = lazy(() => import('./examples/FilterPanelDemo/FilterPanelDemo'));
const SlotsDemo = lazy(() => import('./examples/SlotsDemo/SlotsDemo'));
const CRUDTutorial = lazy(() => import('./examples/CRUDTutorial/CRUDTutorial'));
const ScrollToIndexesDemo = lazy(() => import('./examples/ScrollToIndexesDemo/ScrollToIndexesDemo'));
const LocaleTextDemo = lazy(() => import('./examples/LocaleTextDemo/LocaleTextDemo'));
const CellErrorBoundaryDemo = lazy(() => import('./examples/CellErrorBoundaryDemo/CellErrorBoundaryDemo'));
const PdfExportDemo = lazy(() => import('./examples/PdfExportDemo/PdfExportDemo'));
const MultiSortDemo = lazy(() => import('./examples/MultiSortDemo/MultiSortDemo'));
const HeaderWrapDemo = lazy(() => import('./examples/HeaderWrapDemo/HeaderWrapDemo'));
const HeaderFiltersDemo = lazy(() => import('./examples/HeaderFiltersDemo/HeaderFiltersDemo'));
const ContextMenuDemo = lazy(() => import('./examples/ContextMenuDemo/ContextMenuDemo'));
const RtlDemo = lazy(() => import('./examples/RtlDemo/RtlDemo'));

// Sidebar order: categories and pages most developers look for first come first. Paths never change
// (links and the demo smoke test depend on them). `doc`: a text page, shown full width without a table of contents.
const examplesConfig = [
    // Getting started
    { path: '/home', name: 'Home', component: Home, category: 'Getting started', doc: true },
    { path: '/installation', name: 'Installation', component: lazy(() => import('./pages/Installation')), category: 'Getting started', doc: true },
    { path: '/quickstart', name: 'Quickstart', component: lazy(() => import('./pages/Quickstart')), category: 'Getting started', doc: true },
    { path: '/basic', name: 'Basic Usage', component: BasicExample, category: 'Getting started' },
    { path: '/api-reference', name: 'API Reference', component: lazy(() => import('./pages/APIDocumentation')), category: 'Getting started', doc: true },

    // Sorting & filtering
    { path: '/filtering', name: 'Advanced Filtering', component: AdvancedFilteringDemo, category: 'Sorting & filtering' },
    { path: '/multi-sort', name: 'Multi-Column Sort', component: MultiSortDemo, category: 'Sorting & filtering' },
    { path: '/header-filters', name: 'Header Filters', component: HeaderFiltersDemo, category: 'Sorting & filtering' },
    { path: '/filter-panel', name: 'Filter Panel', component: FilterPanelDemo, category: 'Sorting & filtering' },

    // Editing
    { path: '/editing', name: 'Cell Editing', component: EditingExample, category: 'Editing' },
    { path: '/custom-editors', name: 'Custom Cell Editors', component: CustomEditorsDemo, category: 'Editing' },
    { path: '/undo-redo', name: 'Undo & Redo', component: UndoRedoDemo, category: 'Editing' },

    // Pagination & server data
    { path: '/custom-pagination', name: 'Custom Pagination', component: CustomPaginationDemo, category: 'Pagination & server data' },
    { path: '/infinite', name: 'Infinite Scroll', component: InfiniteScrollDemo, category: 'Pagination & server data' },
    { path: '/lazy-loading', name: 'Lazy Loading', component: LazyLoadingExample, category: 'Pagination & server data' },
    { path: '/loading', name: 'Loading States', component: LoadingStatesDemo, category: 'Pagination & server data' },
    { path: '/server-tree', name: 'Server-Side Tree', component: ServerSideTreeDemo, category: 'Pagination & server data' },
    { path: '/server-agg', name: 'Server-Side Aggregation', component: ServerSideAggregationDemo, category: 'Pagination & server data' },
    { path: '/scroll-to', name: 'Scroll To Indexes', component: ScrollToIndexesDemo, category: 'Pagination & server data' },

    // Export & clipboard
    { path: '/export', name: 'Export Data', component: ExportDemo, category: 'Export & clipboard' },
    { path: '/excel-export', name: 'Advanced Excel Export', component: AdvancedExcelExportDemo, category: 'Export & clipboard' },
    { path: '/pdf-export', name: 'PDF Export', component: PdfExportDemo, category: 'Export & clipboard' },
    { path: '/clipboard', name: 'Clipboard Copy', component: ClipboardDemo, category: 'Export & clipboard' },
    { path: '/clipboard-paste', name: 'Paste from Excel', component: ClipboardPasteDemo, category: 'Export & clipboard' },

    // Grouping & aggregation
    { path: '/grouping', name: 'Row Grouping', component: GroupingExample, category: 'Grouping & aggregation' },
    { path: '/aggregation', name: 'Aggregation', component: AggregationFooterExample, category: 'Grouping & aggregation' },
    { path: '/tree-data', name: 'Tree Data', component: TreeDataExample, category: 'Grouping & aggregation' },
    { path: '/master-detail', name: 'Master Detail', component: MasterDetailExample, category: 'Grouping & aggregation' },
    { path: '/pivot', name: 'Pivot Mode', component: PivotModeDemo, category: 'Grouping & aggregation' },

    // Selection & spreadsheet
    { path: '/cell-selection', name: 'Cell Range Selection', component: CellSelectionDemo, category: 'Selection & spreadsheet' },
    { path: '/fill-handle', name: 'Fill Handle', component: FillHandleDemo, category: 'Selection & spreadsheet' },
    { path: '/context-menu', name: 'Context Menu', component: ContextMenuDemo, category: 'Selection & spreadsheet' },

    // Layout
    { path: '/col-grouping', name: 'Column Grouping', component: ColumnGroupingExample, category: 'Layout' },
    { path: '/header-wrap', name: 'Wrapped Header Text', component: HeaderWrapDemo, category: 'Layout' },
    { path: '/row-span', name: 'Row Spanning', component: RowSpanningShowcase, category: 'Layout' },
    { path: '/cell-span', name: 'Cell Spanning', component: CellSpanningShowcase, category: 'Layout' },
    { path: '/list-view', name: 'List View', component: ListViewDemo, category: 'Layout' },
    { path: '/rtl', name: 'Right-to-Left', component: RtlDemo, category: 'Layout' },

    // Theming & customization
    { path: '/theming', name: 'Theming', component: ThemingDemo, category: 'Theming & customization' },
    // fullWidth: no table of contents column, so the controls and the preview fit side by side.
    { path: '/theme-builder', name: 'Theme Builder', component: ThemeBuilderDemo, category: 'Theming & customization', fullWidth: true },
    { path: '/toolbar', name: 'Toolbar', component: ToolbarDemo, category: 'Theming & customization' },
    { path: '/toolbar-customization', name: 'Toolbar Customization', component: ToolbarCustomizationDemo, category: 'Theming & customization' },
    { path: '/slots', name: 'Slots & Renderers', component: SlotsDemo, category: 'Theming & customization' },
    { path: '/locale-text', name: 'Locale Text (i18n)', component: LocaleTextDemo, category: 'Theming & customization' },

    // AI
    { path: '/ai-assistant', name: 'AI Assistant', component: AiAssistantDemo, category: 'AI' },
    { path: '/ai-schema', name: 'Grid Schema & Validator', component: AiSchemaDemo, category: 'AI' },

    // Advanced
    { path: '/persistence', name: 'State Persistence', component: StatePersistenceDemo, category: 'Advanced' },
    { path: '/events', name: 'Events Observer', component: EventsDemo, category: 'Advanced' },
    { path: '/cell-error-boundary', name: 'Cell Error Boundary', component: CellErrorBoundaryDemo, category: 'Advanced' },
    { path: '/full-test', name: 'Full Feature Test', component: DataGridTest, category: 'Advanced' },

    // Tutorials
    { path: '/crud', name: 'Interactive CRUD', component: CRUDTutorial, category: 'Tutorials' },
    { path: '/real-estate', name: 'Real Estate Portfolio', component: RealEstatePortfolioDemo, category: 'Tutorials' },
    { path: '/calendar', name: 'Time Off Calendar', component: EmployeeCalendarDemo, category: 'Tutorials' },

    // Resources
    { path: '/licensing', name: 'Licensing', component: lazy(() => import('./pages/Licensing')), category: 'Resources', doc: true },
    { path: '/support', name: 'Support', component: lazy(() => import('./pages/Support')), category: 'Resources', doc: true },
    { path: '/migration-v3', name: 'Migrating to v3', component: lazy(() => import('./pages/MigrationV3')), category: 'Resources', doc: true },
    { path: '/migration-v2', name: 'Migrating to v2', component: lazy(() => import('./pages/MigrationV2')), category: 'Resources', doc: true },
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
    
    // Text pages (doc) and pages that ask for it are full width; the others get a table of contents.
    const currentConfig = examplesConfig.find(item => item.path === location.pathname);
    const isFullWidth = currentConfig?.doc === true || currentConfig?.fullWidth === true;

    return (
        <div className="app-page-wrapper" key={location.pathname}>
            <div className={`app-content-column ${isFullWidth ? 'app-content-column--full-width' : ''}`}>
                {children}
            </div>
            {!isFullWidth && <Toc />}
        </div>
    );
}

export default function App() {
    const grouped = examplesConfig.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, typeof examplesConfig>);

    const categories = ['Getting started', 'Sorting & filtering', 'Editing', 'Pagination & server data', 'Export & clipboard', 'Grouping & aggregation', 'Selection & spreadsheet', 'Layout', 'Theming & customization', 'AI', 'Advanced', 'Tutorials', 'Resources'];

    return (
        <Router basename={import.meta.env.BASE_URL}>
            <div className="app-root">
                <header className="app-top-header">
                    <div className="app-logo-section">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="OpenGridX Logo" className="app-logo" />
                        <h2 className="app-title">
                            OpenGridX
                            <span className="app-version">v{packageVersion}</span>
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
