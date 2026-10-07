#!/usr/bin/env node
/**
 * Runs babel-plugin-react-compiler over every library source file (lib/, tests excluded) and reports
 * what it did with each component and hook: compiled, skipped, or failed with a diagnostic.
 *
 *   npm run check:compiler   (node scripts/check-react-compiler.mjs)
 *
 * Prints every function the compiler did not compile and a summary. It always exits 0: a function
 * the compiler skips still works, it just is not auto-memoized.
 *
 * Nothing is written to disk. See docs/contributing/react-compiler.md.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from '@babel/core';

const root = fileURLToPath(new URL('..', import.meta.url));

function sourceFiles(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) return entry.name === '__screenshots__' ? [] : sourceFiles(path);
        if (!/\.(ts|tsx)$/.test(entry.name) || /\.(test|browser\.test)\.tsx?$/.test(entry.name) || entry.name.endsWith('.d.ts')) return [];
        return [path];
    });
}

const events = [];
const logger = {
    logEvent(filename, event) {
        events.push({ file: relative(root, filename), event });
    },
};

for (const file of sourceFiles(join(root, 'lib'))) {
    transformSync(readFileSync(file, 'utf8'), {
        filename: file,
        babelrc: false,
        configFile: false,
        parserOpts: { plugins: file.endsWith('.tsx') ? ['typescript', 'jsx'] : ['typescript'] },
        plugins: [['babel-plugin-react-compiler', { target: '19', panicThreshold: 'none', logger }]],
        code: false,
    });
}

const counts = {};
for (const { event } of events) counts[event.kind] = (counts[event.kind] ?? 0) + 1;

const describe = (detail) => {
    if (!detail) return '';
    const d = detail.options ?? detail;
    const loc = d.loc ?? d.details?.[0]?.loc;
    const line = loc?.start?.line ? `:${loc.start.line}` : '';
    return `${line} [${d.category ?? d.severity ?? 'diagnostic'}] ${d.reason ?? ''}${d.description ? ` — ${d.description}` : ''}`;
};

const problems = events.filter(({ event }) => event.kind !== 'CompileSuccess');
for (const { file, event } of problems) {
    const where = event.fnLoc?.start?.line ? `${file}:${event.fnLoc.start.line}` : file;
    if (event.kind === 'CompileError' || event.kind === 'CompileDiagnostic') {
        console.log(`${event.kind.padEnd(18)} ${where}${describe(event.detail)}`);
    } else if (event.kind === 'CompileSkip') {
        // The compiler prints the directive as [object Object]; the only one used in lib/ is 'use no memo'.
        console.log(`${'CompileSkip'.padEnd(18)} ${where} ${String(event.reason ?? '').replace("'[object Object]'", "a 'use no memo'")}`);
    } else {
        console.log(`${String(event.kind).padEnd(18)} ${where} ${event.data ?? ''}`);
    }
}

console.log('\nReact Compiler over lib/:', Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(', ') || 'nothing to compile');
