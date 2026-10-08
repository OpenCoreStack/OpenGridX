// Builds the GitHub wiki from docs/ (plus the hand-written pages in wiki/) into an output folder.
// docs/ stays the single source: every generated page says where to edit it, and the wiki
// workflow overwrites the wiki on each push to main.
//
//   node scripts/build-wiki.mjs [outDir]      (default: .wiki-build)

import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, posix, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, process.argv[2] ?? '.wiki-build');
const REPO = 'https://github.com/OpenCoreStack/OpenGridX';
const BLOB = `${REPO}/blob/main/`;
const RAW = 'https://raw.githubusercontent.com/OpenCoreStack/OpenGridX/main/';

// Sidebar sections, in order. Each entry: [source path relative to the repo root, wiki page name, sidebar label].
// Files under docs/ that are not listed here are not published (research notes, design specs).
const SECTIONS = [
    ['Start here', [
        ['wiki/Getting-Started.md', 'Getting-Started', 'Getting Started'],
        ['wiki/FAQ.md', 'FAQ', 'FAQ & Troubleshooting'],
        ['docs/API_REFERENCE.md', 'API-Reference', 'API Reference'],
        ['docs/performance.md', 'Performance', 'Performance'],
    ]],
    ['Components', [
        ['docs/components/datagrid.md', 'DataGrid', 'DataGrid'],
        ['docs/components/header.md', 'Header', 'Header'],
        ['docs/components/row.md', 'Row', 'Row'],
        ['docs/components/cell.md', 'Cell', 'Cell'],
        ['docs/components/toolbar.md', 'Toolbar', 'Toolbar'],
        ['docs/components/pagination.md', 'Pagination', 'Pagination'],
        ['docs/components/filter-panel.md', 'Filter-Panel', 'Filter Panel'],
        ['docs/components/tooltip.md', 'Tooltip', 'Tooltip'],
        ['docs/components/column-visibility.md', 'Column-Visibility', 'Column Visibility'],
        ['docs/components/column-group-header.md', 'Column-Grouping', 'Column Grouping'],
        ['docs/components/column-resize.md', 'Column-Resizing', 'Column Resizing'],
        ['docs/components/empty-state.md', 'Empty-State', 'Empty State'],
        ['docs/components/error-overlay.md', 'Error-Overlay', 'Error Overlay'],
        ['docs/components/aggregation-footer.md', 'Aggregation-Footer', 'Aggregation Footer'],
    ]],
    ['Features', [
        ['docs/features/virtualization.md', 'Virtualization', 'Virtualization'],
        ['docs/features/filtering.md', 'Filtering', 'Filtering & Search'],
        ['docs/features/sorting-pagination.md', 'Sorting-and-Pagination', 'Sorting & Pagination'],
        ['docs/features/custom-pagination.md', 'Custom-Pagination', 'Custom Pagination'],
        ['docs/features/editing-reordering.md', 'Editing-and-Reordering', 'Editing & Reordering'],
        ['docs/features/selection.md', 'Row-Selection', 'Row Selection'],
        ['docs/features/clipboard.md', 'Clipboard', 'Clipboard'],
        ['docs/features/cell-selection.md', 'Cell-Range-Selection', 'Cell Range Selection'],
        ['docs/features/undo-redo.md', 'Undo-Redo', 'Undo & Redo'],
        ['docs/features/pinning.md', 'Pinning', 'Pinning'],
        ['docs/features/state-persistence.md', 'State-Persistence', 'State Persistence'],
        ['docs/features/aggregation-pivot.md', 'Aggregation-and-Pivot', 'Aggregation & Pivot'],
        ['docs/features/tree-data-grouping.md', 'Tree-Data-and-Grouping', 'Tree Data & Grouping'],
        ['docs/features/cell-spanning.md', 'Cell-Spanning', 'Cell Spanning'],
        ['docs/features/master-detail.md', 'Master-Detail', 'Master-Detail'],
        ['docs/features/keyboard-navigation.md', 'Keyboard-and-Accessibility', 'Keyboard & Accessibility'],
        ['docs/features/list-view.md', 'List-View', 'List View'],
        ['docs/features/infinite-scroll.md', 'Infinite-Scroll', 'Infinite Scroll'],
        ['docs/features/data-source.md', 'Data-Source', 'Data Source'],
        ['docs/features/loading-states.md', 'Loading-States', 'Loading States'],
        ['docs/features/toolbar-customization.md', 'Toolbar-Customization', 'Toolbar Customization'],
        ['docs/features/export-guide.md', 'Export-Guide', 'Export (CSV, Excel, JSON, Print)'],
        ['docs/features/pdf-export.md', 'PDF-Export', 'PDF Export'],
    ]],
    ['Customization', [
        ['docs/customization/theming.md', 'Theming', 'Theming'],
        ['docs/customization/slots-api.md', 'Slots-API', 'Slots API'],
    ]],
    ['Upgrading', [
        ['docs/migration/v2-to-v3.md', 'Migrating-v2-to-v3', 'v2 → v3'],
        ['docs/migration/v1-to-v2.md', 'Migrating-v1-to-v2', 'v1 → v2'],
        ['docs/upgrade-guide-1.2.1-to-1.3.0.md', 'Upgrading-1.2-to-1.3', '1.2.1 → 1.3.0'],
        ['CHANGELOG.md', 'Changelog', 'Changelog'],
    ]],
    ['Contributing', [
        ['CONTRIBUTING.md', 'Contributing', 'Contributing'],
        ['docs/contributing/testing.md', 'Testing', 'Testing'],
        ['docs/contributing/react-compiler.md', 'React-Compiler', 'React Compiler'],
        ['docs/roadmap.md', 'Roadmap', 'Roadmap'],
        ['docs/architecture/datagrid-orchestration.md', 'Architecture-DataGrid-Orchestration', 'DataGrid orchestration'],
        ['docs/architecture/grid-row-meta.md', 'Architecture-GridRowMeta', 'GridRowMeta'],
        ['docs/architecture/use-grid-controlled-state.md', 'Architecture-useGridControlledState', 'useGridControlledState'],
        ['docs/architecture/use-grid-row-pipeline.md', 'Architecture-useGridRowPipeline', 'useGridRowPipeline'],
        ['docs/architecture/use-grid-columns.md', 'Architecture-useGridColumns', 'useGridColumns'],
        ['docs/architecture/use-grid-virtualization.md', 'Architecture-useGridVirtualization', 'useGridVirtualization'],
        ['docs/architecture/use-grid-visible-rows.md', 'Architecture-useGridVisibleRows', 'useGridVisibleRows'],
        ['docs/architecture/use-grid-scroll-sync.md', 'Architecture-useGridScrollSync', 'useGridScrollSync'],
        ['docs/architecture/use-grid-state-snapshot.md', 'Architecture-useGridStateSnapshot', 'useGridStateSnapshot'],
    ]],
];

const pages = SECTIONS.flatMap(([, entries]) => entries);
const pageBySource = new Map(pages.map(([src, name]) => [src, name]));
// docs/README.md is the docs index; the wiki Home replaces it.
pageBySource.set('docs/README.md', 'Home');
pageBySource.set('wiki/Home.md', 'Home');

for (const [src] of pages) {
    if (!existsSync(join(ROOT, src))) throw new Error(`build-wiki: ${src} is listed in SECTIONS but does not exist`);
}
const names = pages.map(([, name]) => name);
const duplicate = names.find((n, i) => names.indexOf(n) !== i);
if (duplicate) throw new Error(`build-wiki: duplicate page name ${duplicate}`);

/** Warn about public docs that are not in the sidebar, so a new guide is not silently left out. */
function unlistedDocs() {
    const skip = ['docs/research/', 'docs/superpowers/', 'docs/README.md'];
    const out = [];
    const walk = dir => {
        for (const entry of readdirSync(join(ROOT, dir))) {
            const rel = posix.join(dir, entry);
            if (statSync(join(ROOT, rel)).isDirectory()) walk(rel);
            else if (rel.endsWith('.md') && !skip.some(s => rel.startsWith(s)) && !pageBySource.has(rel)) out.push(rel);
        }
    };
    walk('docs');
    return out;
}

const pageNames = new Set(['Home', ...names]);
const IMAGE = /\.(png|jpe?g|gif|svg|webp)$/i;

/** Rewrite one link target found in `fromSrc` (repo-relative) to a wiki page, a GitHub URL or a raw URL. */
function rewriteTarget(target, fromSrc) {
    if (/^(https?:|mailto:|#)/.test(target)) return target;
    const [pathPart, hash = ''] = target.split('#');
    if (!pathPart) return target;
    // Already a wiki page name (hand-written pages in wiki/ link to each other this way).
    if (pageNames.has(pathPart)) return target;
    const repoPath = posix.normalize(posix.join(posix.dirname(fromSrc), pathPart)).replace(/^\.\//, '');
    if (repoPath.startsWith('..')) return target;
    const anchor = hash ? `#${hash}` : '';
    const page = pageBySource.get(repoPath);
    if (page) return `${page}${anchor}`;
    if (IMAGE.test(repoPath)) return `${RAW}${repoPath}`;
    return `${BLOB}${repoPath}${anchor}`;
}

/** Rewrite markdown links and <img src> in prose: not inside fenced code blocks or inline code spans. */
function rewriteLinks(markdown, fromSrc) {
    const rewriteText = text => text
        .replace(/(!?\[[^\]]*\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g, (_, open, target, close) => `${open}${rewriteTarget(target, fromSrc)}${close}`)
        .replace(/(<img\b[^>]*\bsrc=")([^"]+)(")/g, (_, open, target, close) => `${open}${rewriteTarget(target, fromSrc)}${close}`);
    let inFence = false;
    return markdown.split('\n').map(line => {
        if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; return line; }
        if (inFence) return line;
        // Swap inline code spans for placeholders so a link whose text is code ([`x`](a.md)) is still found.
        const spans = [];
        const masked = line.replace(/`+[^`]*`+/g, span => `\u0000${spans.push(span) - 1}\u0000`);
        return rewriteText(masked).replace(/\u0000(\d+)\u0000/g, (_, i) => spans[Number(i)]);
    }).join('\n');
}

function banner(src) {
    if (src.startsWith('wiki/')) return '';
    return `> 📝 Generated from [\`${src}\`](${BLOB}${src}). Edit it there; changes made in the wiki are overwritten.\n\n`;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const sources = [['wiki/Home.md', 'Home'], ...pages.map(([src, name]) => [src, name])];
for (const [src, name] of sources) {
    const body = rewriteLinks(readFileSync(join(ROOT, src), 'utf8'), src);
    writeFileSync(join(OUT, `${name}.md`), banner(src) + body.trimEnd() + '\n');
}

const sidebar = ['**[🏠 Home](Home)**', ''];
for (const [section, entries] of SECTIONS) {
    sidebar.push(`**${section}**`, '');
    for (const [, name, label] of entries) sidebar.push(`- [${label}](${name})`);
    sidebar.push('');
}
sidebar.push('---', '', `[Live demo](https://opencorestack.github.io/OpenGridX/) · [npm](https://www.npmjs.com/package/@opencorestack/opengridx) · [Issues](${REPO}/issues)`);
writeFileSync(join(OUT, '_Sidebar.md'), sidebar.join('\n') + '\n');

const version = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
writeFileSync(join(OUT, '_Footer.md'),
    `OpenGridX ${version} · MIT · This wiki is generated from [docs/](${REPO}/tree/main/docs) on every push to \`main\`. To fix a page, open a PR against the source file.\n`);

const missing = unlistedDocs();
if (missing.length) console.warn(`build-wiki: not in the wiki sidebar (add them to SECTIONS or skip): ${missing.join(', ')}`);
console.log(`build-wiki: ${sources.length} pages + sidebar and footer in ${relative(ROOT, OUT) || '.'}`);
