/**
 * Type-level checks for consumers' own row types: each snippet is compiled against the package
 * entry (lib/index.ts) with strict settings, and must compile cleanly (or, for the negative cases,
 * report the expected error). Covers
 * - interfaces and type aliases as the row type, with or without an index signature;
 * - untyped `GridColDef[]` passed alongside typed rows (the README basic example);
 * - `GridColDef<Row>[]` whose callbacks see `params.row` as the row type;
 * - the export functions and headless hooks, which take the same rows and columns;
 * - typed slot components (`slots.footer`, `slots.toolbar`, overlays).
 */
import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..', '..');
const LIB_INDEX = path.join(ROOT, 'lib', 'index.ts');
const SNIPPET_DIR = path.join(ROOT, 'lib', '__row_typing_snippets__');
const PKG = path.join(ROOT, 'lib', 'index').split(path.sep).join('/');

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
    return ts.createProgram([LIB_INDEX, ...files.keys()], COMPILER_OPTIONS, host);
}

function diagnosticsOf(program: ts.Program, name: string): string[] {
    const sourceFile = program.getSourceFile(path.join(SNIPPET_DIR, `${name}.tsx`));
    if (!sourceFile) throw new Error(`snippet ${name} is missing from the program`);
    return [...program.getSyntacticDiagnostics(sourceFile), ...program.getSemanticDiagnostics(sourceFile)]
        .map((d) => `TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
}

/** The first tsx code block under the README's "Basic Example" heading, importing from lib/index. */
function readmeBasicExample(): string {
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    const section = readme.slice(readme.indexOf('Basic Example'));
    const match = /```tsx\n([\s\S]*?)```/.exec(section);
    if (!match) throw new Error('README has no Basic Example code block');
    return match[1].replace(/['"]@opencorestack\/opengridx['"]/g, `'${PKG}'`);
}

const EMPLOYEE = `
    interface Employee { id: number; name: string; salary: number }
    const employees: Employee[] = [{ id: 1, name: 'Ann', salary: 10 }];
`;

/** Snippets that must compile without errors. */
const VALID: Record<string, string> = {
    interfaceRowsWithTypedColumns: `
        import { DataGrid } from '${PKG}';
        import type { GridColDef } from '${PKG}';
        ${EMPLOYEE}
        const columns: GridColDef<Employee>[] = [
            { field: 'name', renderCell: (params) => params.row.name.toUpperCase() },
            {
                field: 'salary',
                valueGetter: ({ row }) => row.salary * 2,
                valueSetter: ({ row, value }) => ({ ...row, salary: Number(value) }),
                valueFormatter: ({ row, value }) => \`\${row.name}: \${String(value)}\`,
                cellClassName: ({ row }) => (row.salary > 5 ? 'high' : 'low'),
                colSpan: ({ row }) => (row.id === 1 ? 2 : 1),
                renderEditCell: ({ row, onValueChange }) => <input onChange={(e) => onValueChange(e.target.value)} defaultValue={row.salary} />,
            },
        ];
        export const grid = (
            <DataGrid
                rows={employees}
                columns={columns}
                onRowClick={(params) => params.row.name.toUpperCase()}
                onCellClick={(params) => params.row.salary.toFixed()}
                getDetailPanelContent={({ row }) => <div>{row.name}</div>}
                processRowUpdate={(newRow, oldRow) => ({ ...newRow, salary: oldRow.salary })}
                isCellEditable={({ row }) => row.salary > 0}
                groupingColDef={{ headerName: 'Group', renderCell: ({ row }) => row.name }}
            />
        );
    `,
    interfaceRowsWithIndexSignature: `
        import { DataGrid } from '${PKG}';
        import type { GridColDef, GridRowModel } from '${PKG}';
        interface Row extends GridRowModel { id: number; name: string }
        interface Loose { id: string; [key: string]: unknown }
        const rows: Row[] = [];
        const looseRows: Loose[] = [];
        const columns: GridColDef<Row>[] = [{ field: 'name', renderCell: ({ row }) => row.name }];
        export const a = <DataGrid rows={rows} columns={columns} />;
        export const b = <DataGrid<Row> rows={rows} columns={columns} />;
        export const c = <DataGrid rows={looseRows} columns={[{ field: 'x', renderCell: ({ row }) => String(row.x) }]} />;
    `,
    typeAliasRows: `
        import { DataGrid } from '${PKG}';
        import type { GridColDef } from '${PKG}';
        type Product = { id: string; title: string; price: number };
        const products: Product[] = [];
        const columns: GridColDef<Product>[] = [{ field: 'price', valueGetter: ({ row }) => row.price * 1.2 }];
        export const grid = <DataGrid rows={products} columns={columns} />;
        // A column typed for an alias row type still fits where an untyped GridColDef is expected.
        export const loose: GridColDef[] = columns;
    `,
    rowsWithoutIdUseGetRowId: `
        import { DataGrid } from '${PKG}';
        import type { GridColDef } from '${PKG}';
        interface Sku { code: string; stock: number }
        const skus: Sku[] = [];
        const columns: GridColDef<Sku>[] = [{ field: 'stock', renderCell: ({ row }) => row.stock }];
        export const grid = <DataGrid rows={skus} columns={columns} getRowId={(row) => row.code} />;
    `,
    untypedColumnsWithInterfaceRows: `
        import { DataGrid } from '${PKG}';
        import type { GridColDef } from '${PKG}';
        ${EMPLOYEE}
        const columns: GridColDef[] = [
            { field: 'name', renderCell: (params) => String(params.row.name) },
            { field: 'salary', valueSetter: ({ row, value }) => ({ ...row, salary: value }) },
        ];
        export const grid = (
            <DataGrid
                rows={employees}
                columns={columns}
                onRowClick={(params) => params.row.name.toUpperCase()}
            />
        );
    `,
    untypedColumnsWithLiteralRows: `
        import { DataGrid } from '${PKG}';
        import type { GridColDef } from '${PKG}';
        const columns: GridColDef[] = [{ field: 'name', valueSetter: ({ row }) => row }];
        const rows = [{ id: 1, name: 'Ann' }];
        export const grid = <DataGrid rows={rows} columns={columns} />;
    `,
    inlineColumnsGetTheRowType: `
        import { DataGrid } from '${PKG}';
        ${EMPLOYEE}
        export const grid = (
            <DataGrid
                rows={employees}
                columns={[
                    { field: 'name', renderCell: (params) => params.row.name.toUpperCase() },
                    { field: 'salary', valueGetter: ({ row }) => row.salary + 1 },
                ]}
            />
        );
    `,
    readmeBasicExample: readmeBasicExample(),
    exportsAndHooksAcceptTheRowType: `
        import { exportToCsv, exportToExcel, exportToJson, printGrid, exportToPdf, exportToExcelAdvanced, usePivot, useAggregation } from '${PKG}';
        import type { GridColDef } from '${PKG}';
        ${EMPLOYEE}
        const typed: GridColDef<Employee>[] = [{ field: 'salary', valueGetter: ({ row }) => row.salary }];
        const untyped: GridColDef[] = [{ field: 'salary' }];
        exportToCsv(employees, typed, { getRowId: (row) => row.id, selectedRows: [1] });
        exportToCsv(employees, untyped);
        exportToExcel(employees, typed);
        exportToJson(employees, untyped, { getRowId: (row) => row.name });
        void printGrid(employees, typed, 'Title');
        void exportToPdf(employees, typed, { getRowId: (row) => row.id });
        void exportToExcelAdvanced(employees, untyped);
        export function useBoth() {
            const pivot = usePivot(employees, typed, { rowFields: ['name'], columnFields: [], valueFields: [] }, true);
            const agg = useAggregation({ rows: employees, columns: typed, aggregationModel: { salary: 'sum' }, isServerSide: false });
            const agg2 = useAggregation({ rows: employees, columns: untyped, aggregationModel: {}, isServerSide: false });
            return [pivot, agg, agg2];
        }
    `,
    typedSlots: `
        import { DataGrid, GridToolbar } from '${PKG}';
        import type { GridToolbarProps, GridFooterSlotProps, GridSlots } from '${PKG}';
        ${EMPLOYEE}
        function Footer({ rowCount }: { rowCount: number }) { return <span>{rowCount}</span>; }
        function FullFooter(props: GridFooterSlotProps) { return <span>{props.paginationModel.page}</span>; }
        function LegacyFooter(props: Record<string, unknown>) { return <span>{String(props.rowCount)}</span>; }
        function Toolbar(props: GridToolbarProps) { return <GridToolbar {...props} />; }
        function Empty({ message }: { message?: string }) { return <div>{message}</div>; }
        export const slots: GridSlots = { footer: LegacyFooter, toolbar: Toolbar };
        export const grid = (
            <DataGrid
                rows={employees}
                columns={[]}
                slots={{
                    footer: Footer,
                    toolbar: (props) => <div>{props.columns?.length}{String(props.apiRef.current.getAllRows().length)}</div>,
                    noRowsOverlay: Empty,
                    loadingOverlay: () => <div />,
                }}
                slotProps={{ noRowsOverlay: { message: 'Nothing' }, footer: { rowCount: 3 } }}
            />
        );
        export const inlineFooter = <DataGrid rows={employees} columns={[]} slots={{ footer: (props) => <span>{props.rowCount.toFixed()}</span> }} />;
        export const fullFooter = <DataGrid rows={employees} columns={[]} slots={{ footer: FullFooter }} />;
    `,
};

/** Snippets that must fail, with a fragment of the expected message. */
const INVALID: Record<string, { source: string; message: string }> = {
    primitiveRows: {
        source: `
            import { DataGrid } from '${PKG}';
            export const grid = <DataGrid rows={['a', 'b']} columns={[]} />;
        `,
        message: 'No overload matches this call',
    },
    typedColumnReadsMissingField: {
        source: `
            import type { GridColDef } from '${PKG}';
            ${EMPLOYEE}
            export const columns: GridColDef<Employee>[] = [{ field: 'x', renderCell: ({ row }) => row.missing }];
        `,
        message: "Property 'missing' does not exist on type 'Employee'",
    },
    columnsForAnotherRowType: {
        source: `
            import { DataGrid } from '${PKG}';
            import type { GridColDef } from '${PKG}';
            ${EMPLOYEE}
            interface Invoice { id: number; total: number }
            const columns: GridColDef<Invoice>[] = [{ field: 'total', valueGetter: ({ row }) => row.total }];
            export const grid = <DataGrid rows={employees} columns={columns} />;
        `,
        message: 'No overload matches this call',
    },
    valueSetterReturnsWrongShape: {
        source: `
            import type { GridColDef } from '${PKG}';
            ${EMPLOYEE}
            export const columns: GridColDef<Employee>[] = [{ field: 'salary', valueSetter: ({ row }) => ({ ...row, salary: 'high' }) }];
        `,
        message: "Type 'string' is not assignable to type 'number'",
    },
    rowCallbackReadsMissingField: {
        source: `
            import { DataGrid } from '${PKG}';
            ${EMPLOYEE}
            export const grid = <DataGrid rows={employees} columns={[]} onRowClick={({ row }) => row.missing} />;
        `,
        message: "Property 'missing' does not exist on type 'Employee'",
    },
    footerSlotWithWrongPropType: {
        source: `
            import { DataGrid } from '${PKG}';
            function Footer({ rowCount }: { rowCount: string }) { return <span>{rowCount}</span>; }
            export const grid = <DataGrid rows={[]} columns={[]} slots={{ footer: Footer }} />;
        `,
        message: "Type 'number' is not assignable to type 'string'",
    },
    footerSlotRequiringAPropTheGridDoesNotPass: {
        source: `
            import { DataGrid } from '${PKG}';
            function Footer({ label }: { label: string }) { return <span>{label}</span>; }
            export const grid = <DataGrid rows={[]} columns={[]} slots={{ footer: Footer }} />;
        `,
        message: "Property 'label' is missing",
    },
};

describe('row typing: consumer row types work with the public types', () => {
    const program = createProgram({
        ...VALID,
        ...Object.fromEntries(Object.entries(INVALID).map(([name, { source }]) => [name, source])),
    });

    it.each(Object.keys(VALID))('%s compiles', (name) => {
        expect(diagnosticsOf(program, name)).toEqual([]);
    });

    it.each(Object.keys(INVALID))('%s is rejected', (name) => {
        const diagnostics = diagnosticsOf(program, name).join('\n');
        expect(diagnostics).toContain(INVALID[name].message);
    });
});
