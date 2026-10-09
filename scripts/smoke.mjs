#!/usr/bin/env node
// Package smoke suite: tests the library exactly as consumers install it.
//
//   1. build:lib, then `npm pack` into .pack/ under a fixed name
//   2. install each consumer fixture in e2e/fixtures/* (npm ci, skipped while its lockfile is
//      unchanged), then unpack the fresh tarball into its node_modules
//   3. build each fixture: strict `tsc` with skipLibCheck:false against the shipped .d.ts, then vite
//   4. run Playwright against `vite preview` of every fixture
//
// Flags: --skip-lib (reuse an existing dist/ from `npm run build:lib`; the tarball is still packed),
//        --skip-tests (stop after the fixture builds),
//        --fresh (ignore the fixture lockfiles and resolve the newest versions in range; weekly CI).
// Anything after `--` goes to `playwright test` (e.g. `-- --project=chromium-react19`).

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { installPackedApp, npm, npx, packLibrary, root, run, step } from './lib/package-fixture.mjs';

const fixturesDir = join(root, 'e2e', 'fixtures');

const argv = process.argv.slice(2);
const sep = argv.indexOf('--');
const flags = new Set(sep === -1 ? argv : argv.slice(0, sep));
const playwrightArgs = sep === -1 ? [] : argv.slice(sep + 1);

const started = Date.now();

step('Build and pack the library');
packLibrary({ skipLib: flags.has('--skip-lib') });

const fixtures = readdirSync(fixturesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(fixturesDir, d.name, 'package.json')))
  .map((d) => join(fixturesDir, d.name));

for (const dir of fixtures) {
  const name = dir.slice(fixturesDir.length + 1);
  step(`Install fixture ${name}`);
  installPackedApp(dir, { fresh: flags.has('--fresh') });

  step(`Build fixture ${name} (strict tsc against the published types, then vite build)`);
  run(npm, ['run', 'build'], dir);
}

if (!flags.has('--skip-tests')) {
  step('Run Playwright smoke tests');
  run(npx, ['playwright', 'test', '--config', 'e2e/playwright.config.ts', ...playwrightArgs]);
}

console.log(`\nsmoke suite finished in ${((Date.now() - started) / 1000).toFixed(0)}s`);
