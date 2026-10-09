// Fails the build if the published bundle contains a copy of React.
//
// React is a peer dependency: the consumer's copy must be the only one. A bundled
// react/jsx-runtime creates elements tagged for the React version we built with,
// which a consumer on another major version refuses to render.
//
// Also checks the `ai` entry point (@opencorestack/opengridx/ai): it imports nothing (no React, no
// dependencies), stays within its gzipped size budget, and the core bundles do not contain it.
import { existsSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const BUNDLES = ['dist/opengridx.es.js', 'dist/opengridx.umd.js'];
const REACT_INTERNALS = ['react.transitional.element', 'react.element', '__CLIENT_INTERNALS_DO_NOT_USE', 'ReactCurrentOwner'];

const AI_BUNDLES = ['dist/ai.es.js', 'dist/ai.cjs'];
const AI_TYPES = 'dist/ai.d.ts';
const AI_BUDGET_GZIP = 8 * 1024;
// The schema title (GRID_AI_SCHEMA_TITLE in lib/ai/schema.ts): a string literal survives minification.
const AI_MARKER = 'OpenGridX grid state';
// A static or dynamic import, or a require call. The ai bundles are minified, so no spaces are assumed.
const IMPORT_RE = /\bimport\s*[\w{*"'`(]|\brequire\s*\(/;

let failed = false;
function fail(message) {
    console.error(message);
    failed = true;
}

for (const file of BUNDLES) {
    const code = readFileSync(file, 'utf8');
    for (const marker of REACT_INTERNALS) {
        if (code.includes(marker)) fail(`${file}: contains React internals ("${marker}"); react/react-dom must stay external`);
    }
    if (!code.includes('react/jsx-runtime')) fail(`${file}: does not import react/jsx-runtime from the consumer`);
    if (code.includes(AI_MARKER)) fail(`${file}: contains the ai entry point's code; it must only ship in dist/ai.*`);
}

const aiSizes = [];
for (const file of AI_BUNDLES) {
    if (!existsSync(file)) {
        fail(`${file}: missing (vite build --config vite.config.lib.js --mode ai)`);
        continue;
    }
    const code = readFileSync(file, 'utf8');
    if (IMPORT_RE.test(code) || /\breact\b/i.test(code)) fail(`${file}: imports a module or mentions react; the ai entry point must import nothing`);
    if (!code.includes(AI_MARKER)) fail(`${file}: does not contain the ai code ("${AI_MARKER}")`);
    const gzip = gzipSync(code).length;
    aiSizes.push(`${file} ${(gzip / 1024).toFixed(2)} kB`);
    if (gzip > AI_BUDGET_GZIP) fail(`${file}: ${gzip} bytes gzipped, over the ${AI_BUDGET_GZIP}-byte budget`);
}
if (!existsSync(AI_TYPES)) fail(`${AI_TYPES}: missing`);
else if (/from\s*['"]react/.test(readFileSync(AI_TYPES, 'utf8'))) fail(`${AI_TYPES}: imports React types`);

if (failed) process.exit(1);
console.log('check-bundle: react, react-dom and react/jsx-runtime are external');
console.log(`check-bundle: the ai entry point imports nothing and is not in the core bundles (gzip ${aiSizes.join(', ')}; budget ${AI_BUDGET_GZIP / 1024} kB)`);
