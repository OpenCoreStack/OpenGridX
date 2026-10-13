// Checks what `npm publish` would ship, after `npm run build:lib`:
//  1. no test artifact is in the package (tests, baselines, screenshots, snapshots, fixtures);
//     `files` in package.json works by exclusion, so a new kind of artifact slips in unnoticed;
//  2. what an app ships for `DataGrid` alone (minified with esbuild, React and the optional peers
//     external, gzipped) stays within its budget. Raise the budget deliberately, in the same commit
//     as the change that needs it.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';

const ROOT = resolve(import.meta.dirname, '..');
const DATAGRID_GZIP_BUDGET = 92 * 1024; // 3.9.0: 87.2 KB
const FORBIDDEN = [/\.test\.[cm]?[jt]sx?$/, /\.browser\.test\./, /__baseline__\//, /__screenshots__\//, /__snapshots__\//, /__fixtures__\//];

let failed = false;
const fail = (message) => { console.error(`check-package: ${message}`); failed = true; };

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const [pack] = JSON.parse(execFileSync(npm, ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: ROOT, encoding: 'utf8' }));
const leaked = pack.files.map(f => f.path).filter(path => FORBIDDEN.some(re => re.test(path)));
if (leaked.length > 0) fail(`${leaked.length} test file(s) would be published: ${leaked.slice(0, 5).join(', ')}${leaked.length > 5 ? ', …' : ''}. Exclude them in package.json "files".`);
else console.log(`check-package: ${pack.entryCount} files, no test artifacts (unpacked ${(pack.unpackedSize / 1048576).toFixed(1)} MB)`);

const dir = mkdtempSync(join(tmpdir(), 'ogx-size-'));
try {
    const entry = join(dir, 'entry.mjs');
    writeFileSync(entry, `export { DataGrid } from ${JSON.stringify(join(ROOT, 'dist/opengridx.es.js'))};\n`);
    const outfile = join(dir, 'out.js');
    await build({
        entryPoints: [entry], bundle: true, minify: true, format: 'esm', outfile, logLevel: 'error',
        external: ['react', 'react-dom', 'react/jsx-runtime', 'exceljs', 'jspdf', 'jspdf-autotable'],
    });
    const gzip = gzipSync(readFileSync(outfile)).length;
    const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
    if (gzip > DATAGRID_GZIP_BUDGET) fail(`DataGrid alone is ${kb(gzip)} gzipped, over the ${kb(DATAGRID_GZIP_BUDGET)} budget.`);
    else console.log(`check-package: DataGrid alone ${kb(gzip)} gzipped (budget ${kb(DATAGRID_GZIP_BUDGET)})`);
} finally {
    rmSync(dir, { recursive: true, force: true });
}

if (failed) process.exit(1);
