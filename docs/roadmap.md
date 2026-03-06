# OpenGridX Roadmap & Feature Status

This document tracks the current status of features in `OpenGridX` and outlines the roadmap for future development.

## ✅ Implemented Features

### Core
*   **Virtualization**: High-performance row and column virtualization for handling large datasets.
*   **Sorting**: Client-side and server-side multi-column sorting.
*   **Filtering**: Client-side filtering with support for various operators.
*   **Pagination**: Client-side and server-side pagination with customizable page sizes.
*   **Selection**: Row selection (single/multiple) with checkbox support.

### Advanced UI
*   **Advanced Filtering**: Client-side complex filter builder (AND/OR logic, recursive groups).
*   **Column Pinning**: Pin columns to the left or right.
*   **Row Pinning**: Pin rows to the top or bottom.
*   **Column Reordering**: Drag-and-drop column reordering.
*   **Column Resizing**: Interactive column resizing.
*   **Detail Panels**: Expandable rows to show custom detail views.
*   **Row Reordering**: Drag-and-drop row reordering.

### Data Management
*   **Editing**: Inline cell editing with value parsing/formatting.
*   **Tree Data**: Hierarchical data display (Client-side).
*   **Row Grouping**: Grouping rows by column values (Client-side).
*   **Spanning**: Row and Column spanning (Cell merging).
*   **Export**: CSV, JSON, Print, basic Excel (HTML-table). **Advanced Excel Export** via ExcelJS — real `.xlsx` with styled headers, typed cells (number/date/boolean), column widths, frozen rows, auto-filter, alternating row colors, aggregation totals, and multi-sheet workbooks.
*   **Pivot Mode**: Cross-tabulation of data — group rows into columns dynamically with aggregation (Sum, Avg, Count, Min, Max).

### Server-Side Integration
*   **Server-Side Data Source**: Hook-based integration for server-side sorting, filtering, and pagination.
*   **Infinite Scroll**: Automatically load more rows as the user scrolls (`paginationMode='infinite'`).
*   **Server-Side Tree Data**: Lazy loading children nodes, partial hierarchy fetching support.
*   **Server-Side Aggregation**: Sum, Avg, Count, Min, Max — computed server-side over the full dataset, with a sticky footer row and toolbar Σ panel.

### CSS & Theming *(completed 2026-02-19)*
*   **CSS Barrel File** (`lib/styles/opengridx.css`): Single entry point — variables → reset → components.
*   **Consistent Naming Convention**: `--ogx-*` CSS variables, `ogx__` BEM class prefix.
*   **Theming API**: `<DataGridThemeProvider theme={myTheme}>` component mapping a `GridTheme` object to `--ogx-*` CSS variables, with built-in light/dark/compact presets.
*   **Production Build Optimisation**: Code-split demo reduces initial bundle by 98.6% via React.lazy + manualChunks.

### Accessibility & Clipboard *(completed 2026-03-03)*
*   **ARIA roles**: `role="grid"`, `role="row"`, `role="gridcell"`, `role="columnheader"` on correct elements.
*   **ARIA attributes**: `aria-sort`, `aria-selected`, `aria-label`, `aria-expanded`, `aria-readonly`, `aria-haspopup` throughout.
*   **Keyboard navigation**: Tab / Enter / Escape / Arrow keys / Home / End / PageUp / PageDown.
*   **`aria-rowcount` and `aria-colcount`**: Accurate counts including system columns.
*   **Clipboard**: Full TSV-formatted copy support (Ctrl+C / Cmd+C) for seamless integration with Excel/Google Sheets.

### Advanced Excel Export *(completed 2026-03-03)*
*   **`exportToExcelAdvanced`**: Real `.xlsx` via ExcelJS (lazy-loaded — zero bundle cost unless used).
*   **Features**: Styled headers, typed cells, column widths from `colDef.width`, frozen header row, auto-filter dropdowns, alternating row colors, aggregation totals rows, multi-sheet workbooks, standalone summary sheet.
*   **API**: `ExcelAdvancedExportOptions`, `ExcelSheetDefinition`, `ExcelColumnStyle` — all exported and documented.
*   **Demo**: `AdvancedExcelExportDemo` in demo app (`Data Management` category).
*   **Docs**: `docs/features/export-guide.md` fully updated with feature comparison table and all options.

---

## 📅 Upcoming Features

### Advanced Data Features
*   **Interactive Pivot Builder**: Drag-and-drop UI for users to dynamically create pivot tables.
*   **Native PDF Reporting**: Automated PDF generation with customizable layouts.
*   **Advanced Charts Integration**: Inline sparklines and trend visualization.

### DX & Publishing
*   **npm publish**: Finalize `package.json` metadata, `README.md`, and publish to npm registry.

## ✅ Implemented Features (Recent)
*   **Storybook / Docs site**: Interactive component documentation with source code viewer and categorized navigation (implemented via `demo` app).
*   **Quickstart & Installation Guides**: Comprehensive onboarding documentation for developers.
