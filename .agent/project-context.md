# OpenGridX Project Context

## 🌟 Project Overview
**OpenGridX** (`@opencorestack/opengridx`) is a zero-dependency, high-performance DataGrid library for React, engineered to match and extend the feature set of MUI X DataGrid Pro — offered completely free.
- **npm**: `@opencorestack/opengridx` (published under the `opencorestack` npm org, owned by `asif7774`)
- **Project Path**: `/Volumes/Data/RND/OpenGridX`
- **Core Value**: 100% custom implementation with ZERO external UI dependencies (no MUI, no Emotion, no Tailwind).
- **Performance**: Handles 100,000+ rows via custom virtualization at 60fps.
- **Current Version**: `0.1.3` (published to npm)

## 📦 NPM Publication Status
- **v0.1.0** → Published ✅ (March 6, 2026 — first publish)
- **v0.1.1** → Published ✅ (March 6, 2026 — ExcelJS externalized, cleaned devDeps, improved README)
- **v0.1.2** → Published ✅ (March 6, 2026 — Cell editing internal state bug fix)
- **v0.1.3** → Published ✅ (March 10, 2026 — CSS auto-import fix via barrel entry)
- **Package URL**: https://www.npmjs.com/package/@opencorestack/opengridx
- **npm org**: `opencorestack` (owner: `asif7774`)
- **Next publish**: bump version in `package.json`, then `npm publish --access public --otp=<code>`

### 🚨 VERSION BUMPING RULE
Whenever you increment the version in `package.json`, you **MUST ALSO** update it in:
1. `CHANGELOG.md`
2. `llms.txt`
3. `demo/public/llms.txt` (via `cp` from root)
4. `demo/App.tsx` (sidebar `<span className="app-version">`)
5. `demo/Home.tsx` (hero section `<span className="home-badge">`)
Always keep the demo and AI context files fully in sync with the NPM package version!

## 🏗️ Architecture & Technology Stack
- **Framework**: React 18+ with strict TypeScript 5+
- **State Management**: `useReducer` / `useContext` internally, exposed via `apiRef` pattern
- **Styling**: Vanilla CSS using BEM methodology (`ogx__` prefix, `--ogx-*` CSS variables)
- **Build**: Vite + `vite-plugin-dts` → outputs ES Module + UMD + CSS + TypeScript declarations
- **Entry point**: `lib/index.ts` → `dist/opengridx.es.js` + `dist/opengridx.umd.js`

## 📂 Directory Structure
- `lib/` — Core library source (published via `dist/`)
  - `lib/components/` — React components (DataGrid, Row, Cell, Header, Toolbar, etc.)
  - `lib/hooks/` — Feature hooks (useGridClipboard, useAggregation, usePivot, etc.)
  - `lib/utils/export/` — CSV, Excel, ExcelAdvanced, JSON, Print utilities
  - `lib/styles/` — All CSS (barrel: `opengridx.css`)
  - `lib/types/` — Full TypeScript types (`GridApi`, `GridColDef`, `DataGridProps`, etc.)
  - `lib/theme/` — `DataGridThemeProvider` + 5 built-in themes
  - `lib/state/` — `useGridStateStorage` + `initialState` support
  - `lib/index.ts` — Public barrel exports
- `demo/` — Interactive showcase app (Vite dev server, port 5173)
  - `demo/pages/` — Installation, Quickstart, API docs pages
  - `demo/examples/` — ~30 feature demos
  - `demo/public/llms.txt` — AI-readable package description
- `docs/` — Markdown documentation (features, components, customization)
- `.agent/` — Project context and workflow definitions
- `vite.config.lib.js` — Library build config
- `vite.config.js` — Demo app build config

## 🔑 Key Build Configuration (vite.config.lib.js)
```js
external: ['react', 'react-dom', 'exceljs']  // ExcelJS is peer dep, NOT bundled
sourcemap: true
formats: ['es', 'umd']
```

## 📦 Package Dependencies
```json
"peerDependencies": { "react": ">=18.0.0", "react-dom": ">=18.0.0", "exceljs": ">=4.0.0" }
"peerDependenciesMeta": { "exceljs": { "optional": true } }
"dependencies": {}
```

## ✅ v0.1.1 Feature-Complete List
- High-Performance Row + Column Virtualization (60fps, 100k+ rows)
- Multi-Column Sorting (client + server-side)
- Advanced Filtering (11+ operators, AND/OR filter builder)
- Pagination (client + server + infinite scroll)
- Row Selection (checkbox, single/multi, controlled/uncontrolled)
- Column Pinning (left/right sticky)
- Row Pinning (top/bottom)
- Column Resizing (throttled 60fps drag)
- Column & Row Reordering (DnD)
- Detail Panels (master-detail)
- Cell & Row Spanning (colSpan/rowSpan)
- List View Mode (card-based layout)
- Column Grouping (multi-level headers)
- Toolbar (built-in + replaceable via slots)
- Inline Cell Editing
- Tree Data (hierarchical rows, lazy server-side children)
- Row Grouping (collapsible, with aggregation)
- Aggregation (SUM, AVG, COUNT, MIN, MAX)
- Pivot Mode (multidimensional)
- CSV / JSON / Print Export (zero deps)
- Basic Excel Export (`exportToExcel` — HTML-based, zero deps)
- Advanced Excel Export (`exportToExcelAdvanced` — real .xlsx binary, requires `exceljs`)
- Clipboard: Ctrl+C / Cmd+C → TSV for Excel/Sheets
- Clipboard: Programmatic `apiRef.current.copySelectedRows()`
- DataGridThemeProvider + 5 built-in themes
- CSS Variables (`--ogx-*` prefix), Shadow DOM compatible
- WCAG 2.1 AA Accessibility (ARIA roles, keyboard navigation)
- State Persistence (`initialState` prop + `useGridStateStorage` hook)
- `apiRef` imperative API (getSelectedRows, copySelectedRows, selectRow, setFilterModel, etc.)
- Slots system (replace any internal component)
- Skeleton Loader (animated, auto-detects columns)
- Server-side data source (`useGridDataSource` hook)

## 🔧 Recent Fixes (v0.1.1)
- `Ctrl+C` now works when grid checkboxes are focused
- Programmatic `apiRef.current.copySelectedRows()` correctly reads live selection
- ExcelJS moved from `dependencies` → optional `peerDependencies` AND marked `external` in Vite
- `getSelectedRows()` on apiRef returns live selection state (was returning stale data)
- `copySelectedRows` placeholder added to initial apiRef in `useDataGrid.ts` to satisfy `GridApi` type

## 🧠 Key Technical Gotchas
- **Sticky positioning**: Parent must have `position: relative` + correct overflow settings
- **ExcelJS**: Is a peer dep AND external in Vite — consumers must `npm install exceljs` separately
- **CSS auto-import**: `DataGrid.tsx` line 26 imports `opengridx.css` — consumers do NOT need a manual CSS import
- **apiRef initialization**: Any method added to `GridApi` interface must also have a placeholder in `useDataGrid.ts`'s initial `useRef` object, otherwise the build fails
- **selectedRowIds**: Must be memoized from `rowSelectionModel` BEFORE calling `useGridClipboard`
- **Skeleton Columns**: Use `state.dimensions.viewportWidth` not `layout.viewportWidth`
- **Scrollbar**: Use `scrollbar-gutter: stable` to prevent 15px layout shift on data change

## 🗺️ Roadmap (Post v0.1.1)
- **v0.2.0 planned**:
  - Rich Excel Styling (bold headers, background fill, native ExcelJS borders)
  - Cell Range Clipboard (select rectangular region, paste from Excel into editable cells)
  - Storybook integration (stories exist in `src/stories/`, Storybook removed from devDeps temporarily)

## 📝 Maintenance Workflows
- `/dev-demo` — Start demo dev server
- `/add-feature` — Implementation checklist for new features
- `/summarize-work` — EOD documentation protocol

## ⚠️ Moved Folder Note
If the project path has changed from `/Volumes/Data/RND/Custom-DataGrid`, update all path references accordingly. The workspace URI will reflect the new location.
