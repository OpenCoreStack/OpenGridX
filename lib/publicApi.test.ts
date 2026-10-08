/**
 * Keeps the package entry (lib/index.ts) and the reference docs in step:
 * - every type, component, hook and function that docs/API_REFERENCE.md or docs/components/*.md
 *   names as public, and everything a code sample in docs/ or the README imports from the
 *   package, is exported from the package root;
 * - documented usages that depend on the public types (groupingColDef without `field`,
 *   `slotProps.toolbar` render props, a typed custom toolbar) compile under strict settings.
 *
 * The exports are read with the TypeScript compiler API, so type-only exports are covered too.
 */
import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import * as publicApi from './index';

const ROOT = path.resolve(__dirname, '..');
const LIB_INDEX = path.join(ROOT, 'lib', 'index.ts');
const LIB_AI_INDEX = path.join(ROOT, 'lib', 'ai', 'index.ts');
const API_REFERENCE = path.join(ROOT, 'docs', 'API_REFERENCE.md');
const COMPONENT_DOCS_DIR = path.join(ROOT, 'docs', 'components');
const SNIPPET_DIR = path.join(ROOT, 'lib', '__public_api_snippets__');

const COMPILER_OPTIONS: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
    allowImportingTsExtensions: true,
    isolatedModules: true,
    lib: ['lib.es2020.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
};

/** Builds one program over the package entry plus in-memory consumer snippets. */
function createProgram(snippets: Record<string, string>): ts.Program {
    const files = new Map<string, string>();
    for (const [name, source] of Object.entries(snippets)) {
        files.set(path.join(SNIPPET_DIR, `${name}.tsx`), source);
    }
    const host = ts.createCompilerHost(COMPILER_OPTIONS);
    const getSourceFile = host.getSourceFile.bind(host);
    const fileExists = host.fileExists.bind(host);
    const readFile = host.readFile.bind(host);
    host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
        const text = files.get(path.resolve(fileName));
        if (text !== undefined) return ts.createSourceFile(fileName, text, languageVersion, true);
        return getSourceFile(fileName, languageVersion, onError, shouldCreate);
    };
    host.fileExists = (fileName) => files.has(path.resolve(fileName)) || fileExists(fileName);
    host.readFile = (fileName) => files.get(path.resolve(fileName)) ?? readFile(fileName);
    return ts.createProgram([LIB_INDEX, LIB_AI_INDEX, ...files.keys()], COMPILER_OPTIONS, host);
}

function diagnosticsOf(program: ts.Program, name: string): string[] {
    const sourceFile = program.getSourceFile(path.join(SNIPPET_DIR, `${name}.tsx`));
    if (!sourceFile) throw new Error(`snippet ${name} is missing from the program`);
    return [...program.getSyntacticDiagnostics(sourceFile), ...program.getSemanticDiagnostics(sourceFile)]
        .map((d) => `TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
}

const PKG = path.join(ROOT, 'lib', 'index').split(path.sep).join('/');

const SNIPPETS: Record<string, string> = {
    groupingColDefWithoutField: `
        import { DataGrid } from '${PKG}';
        import type { GridColDef, GridRowModel } from '${PKG}';
        interface Row extends GridRowModel { id: number; department: string }
        const columns: GridColDef<Row>[] = [{ field: 'department' }];
        export const grid = (
            <DataGrid<Row>
                rows={[]}
                columns={columns}
                rowGroupingModel={['department']}
                groupingColDef={{ headerName: 'Department', width: 250 }}
            />
        );
    `,
    toolbarSlotPropsRenderProps: `
        import { DataGrid, GridToolbar } from '${PKG}';
        import type { GridColDef, GridRowModel } from '${PKG}';
        interface Row extends GridRowModel { id: number; name: string }
        const columns: GridColDef<Row>[] = [{ field: 'name' }];
        export const grid = (
            <DataGrid<Row>
                rows={[]}
                columns={columns}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                        renderQuickFilter: (props) => (
                            <input value={props.value} onChange={(e) => props.onChange(e.target.value)} />
                        ),
                        renderFilterButton: (props) => <button onClick={props.onClick}>{props.activeCount}</button>,
                        className: 'my-toolbar',
                        columns,
                        myOwnKey: 42,
                    },
                }}
            />
        );
    `,
    customToolbarComponent: `
        import { DataGrid, GridToolbar, Pagination } from '${PKG}';
        import type { GridToolbarProps, PaginationProps, GridSlots } from '${PKG}';
        function MyToolbar(props: GridToolbarProps) {
            return <GridToolbar {...props} rightContent={<span>Custom</span>} />;
        }
        function MyPagination(props: PaginationProps) {
            return <Pagination {...props} showFirstButton={false} />;
        }
        interface LabelledPaginationProps extends PaginationProps { label?: string }
        function LabelledPagination({ label, ...props }: LabelledPaginationProps) {
            return <div>{label}<Pagination {...props} /></div>;
        }
        function UntypedPagination(props: Record<string, unknown>) {
            return <span>{String(props.page)}</span>;
        }
        const slots: GridSlots = { toolbar: MyToolbar, pagination: MyPagination };
        export const labelled: GridSlots = { pagination: LabelledPagination };
        export const untyped: GridSlots = { pagination: UntypedPagination };
        export const grid = <DataGrid rows={[]} columns={[]} slots={slots} />;
    `,
    toolbarSlotPropsRejectsWrongTypes: `
        import { DataGrid } from '${PKG}';
        export const grid = <DataGrid rows={[]} columns={[]} slotProps={{ toolbar: { renderQuickFilter: 'not a function' } }} />;
    `,
};

/** Every name an entry point (the package root, or `/ai`) exports (values and types). */
function readEntryExports(program: ts.Program, file: string = LIB_INDEX): Set<string> {
    const checker = program.getTypeChecker();
    const entry = program.getSourceFile(file);
    if (!entry) throw new Error(`${file} is missing from the program`);
    const moduleSymbol = checker.getSymbolAtLocation(entry);
    if (!moduleSymbol) throw new Error(`${file} has no module symbol`);
    return new Set(checker.getExportsOfModule(moduleSymbol).map((s) => s.getName()));
}

/** Types of the `@opencorestack/opengridx/ai` entry point: exported from there, not from the root. */
const AI_TYPE_NAME = /^GridAi[A-Z]/;

const readDoc = (file: string) => fs.readFileSync(file, 'utf8');
const componentDocs = fs.readdirSync(COMPONENT_DOCS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ file: `docs/components/${f}`, text: readDoc(path.join(COMPONENT_DOCS_DIR, f)) }));
const allDocs = [{ file: 'docs/API_REFERENCE.md', text: readDoc(API_REFERENCE) }, ...componentDocs];

/** Every Markdown page under docs/ plus the README: their code samples import from the package. */
function listMarkdown(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return listMarkdown(full);
        return entry.name.endsWith('.md') ? [full] : [];
    });
}
const sampleDocs = [...listMarkdown(path.join(ROOT, 'docs')), path.join(ROOT, 'README.md')]
    .map((file) => ({ file: path.relative(ROOT, file), text: readDoc(file) }));

/** Names imported from the package (or its `/ai` entry point) in the docs' code samples. */
function documentedImports(subpath: '' | '/ai' = ''): Map<string, string> {
    const found = new Map<string, string>();
    const importRe = subpath === '/ai'
        ? /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"]@opencorestack\/opengridx\/ai['"]/g
        : /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"]@opencorestack\/opengridx['"]/g;
    for (const { file, text } of sampleDocs) {
        for (const match of text.matchAll(importRe)) {
            const list = match[1].replace(/\/\/[^\n]*/g, '');
            for (const raw of list.split(',')) {
                const name = raw.replace(/^\s*type\s+/, '').split(/\s+as\s+/)[0].trim();
                if (name) found.set(name, file);
            }
        }
    }
    return found;
}

/**
 * Type-like names the API reference writes in backticks (`GridSlots`, `UseAggregationParams`,
 * `ToolbarButtonRenderProps<R>` …). Generic words such as `Record`, `Promise` or `ReactNode` do not
 * match the pattern.
 */
const PUBLIC_TYPE_NAME = /^(?:Grid|DataGrid|Use[A-Z]|Toolbar|BuiltIn|ColumnVisibility|Pdf|Csv|Excel|Json|Print)[A-Za-z0-9]*$|^[A-Z][A-Za-z0-9]*(?:Props|Options)$/;

/** Components the docs describe as internal: named in the docs, rendered by the grid, not exported. */
const INTERNAL_COMPONENTS = new Set(['GridAggregationFooter', 'GridEmptyState', 'GridErrorOverlay', 'ColumnResizeHandle']);

function documentedTypeNames(): Map<string, string> {
    const found = new Map<string, string>();
    for (const { file, text } of allDocs) {
        for (const match of text.matchAll(/`([A-Z][A-Za-z0-9]*)(?:<[^`]*>)?`/g)) {
            const name = match[1];
            if (PUBLIC_TYPE_NAME.test(name) && !INTERNAL_COMPONENTS.has(name)) found.set(name, file);
        }
    }
    return found;
}

/** Hooks and functions the API reference documents with a call signature, e.g. `usePivot(rawRows, …)`. */
function documentedFunctions(): Map<string, string> {
    const found = new Map<string, string>();
    const text = readDoc(API_REFERENCE);
    for (const match of text.matchAll(/`((?:use[A-Z]|exportTo|printGrid|formatAggregationValue)[A-Za-z0-9]*)\(/g)) {
        found.set(match[1], 'docs/API_REFERENCE.md');
    }
    return found;
}

describe('public API matches the reference docs', () => {
    const program = createProgram(SNIPPETS);
    const rootExports = readEntryExports(program);
    const aiExports = readEntryExports(program, LIB_AI_INDEX);

    it('exports every type the docs name', () => {
        const missing = [...documentedTypeNames()]
            .filter(([name]) => !(AI_TYPE_NAME.test(name) ? aiExports : rootExports).has(name))
            .map(([name, file]) => `${name} (${file})`);
        expect(missing).toEqual([]);
    });

    it('exports every name the docs import from the ai entry point, and the root does not', () => {
        const imports = documentedImports('/ai');
        expect(imports.size).toBeGreaterThan(1);
        const problems = [...imports]
            .filter(([name]) => !aiExports.has(name) || rootExports.has(name))
            .map(([name, file]) => `${name} (${file})`);
        expect(problems).toEqual([]);
    });

    it('exports every name the docs import from the package', () => {
        const imports = documentedImports();
        expect(imports.size).toBeGreaterThan(10);
        const missing = [...imports]
            .filter(([name]) => !rootExports.has(name))
            .map(([name, file]) => `${name} (${file})`);
        expect(missing).toEqual([]);
    });

    it('exports every hook and function the API reference documents, as runtime values', () => {
        const functions = documentedFunctions();
        expect(functions.size).toBeGreaterThan(5);
        const exportedValues = publicApi as Record<string, unknown>;
        const missing = [...functions.keys()].filter((name) => typeof exportedValues[name] !== 'function');
        expect(missing).toEqual([]);
    });

    it('exports every component that has its own page, unless the page calls it internal', () => {
        const exportedValues = publicApi as Record<string, unknown>;
        const problems: string[] = [];
        for (const { file, text } of componentDocs) {
            const heading = /^# `<?([A-Za-z]+)/m.exec(text);
            if (!heading) continue;
            const name = heading[1];
            const isInternal = /\binternal component\b(?!s)/i.test(text);
            if (isInternal && name in exportedValues) problems.push(`${name} is exported but ${file} calls it internal`);
            if (!isInternal && !(name in exportedValues)) problems.push(`${name} (${file}) is not exported`);
        }
        expect(problems).toEqual([]);
    });

    it('accepts groupingColDef without a field, as documented', () => {
        expect(diagnosticsOf(program, 'groupingColDefWithoutField')).toEqual([]);
    });

    it('infers the render-prop parameters in slotProps.toolbar and accepts extra keys', () => {
        expect(diagnosticsOf(program, 'toolbarSlotPropsRenderProps')).toEqual([]);
    });

    it('accepts a custom toolbar typed with GridToolbarProps and a pagination slot typed with PaginationProps', () => {
        expect(diagnosticsOf(program, 'customToolbarComponent')).toEqual([]);
    });

    it('type-checks the known GridToolbarProps keys in slotProps.toolbar', () => {
        const diagnostics = diagnosticsOf(program, 'toolbarSlotPropsRejectsWrongTypes');
        expect(diagnostics.length).toBeGreaterThan(0);
        expect(diagnostics.join('\n')).toContain('ToolbarQuickFilterRenderProps');
    });
});
