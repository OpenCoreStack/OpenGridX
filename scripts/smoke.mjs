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

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packDir = join(root, '.pack');
const tarball = join(packDir, 'opencorestack-opengridx.tgz');
const fixturesDir = join(root, 'e2e', 'fixtures');

const argv = process.argv.slice(2);
const sep = argv.indexOf('--');
const flags = new Set(sep === -1 ? argv : argv.slice(0, sep));
const playwrightArgs = sep === -1 ? [] : argv.slice(sep + 1);
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function run(cmd, args, cwd = root) {
  console.log(`\n$ ${[cmd, ...args].join(' ')}${cwd === root ? '' : `   (in ${cwd.slice(root.length + 1)})`}`);
  execFileSync(cmd, args, { cwd, stdio: 'inherit' });
}

function step(title) {
  console.log(`\n=== ${title}`);
}

const started = Date.now();

step('Build and pack the library');
if (flags.has('--skip-lib')) {
  if (!existsSync(join(root, 'dist', 'index.d.ts'))) throw new Error('--skip-lib needs dist/; run `npm run build:lib` first.');
} else {
  run(npm, ['run', 'build:lib']);
}
{
  rmSync(packDir, { recursive: true, force: true });
  mkdirSync(packDir, { recursive: true });
  const out = execFileSync(npm, ['pack', '--pack-destination', packDir, '--json', '--silent'], { cwd: root, encoding: 'utf8' });
  const [{ filename, size, unpackedSize }] = JSON.parse(out);
  renameSync(join(packDir, filename.replace(/^@/, '').replace('/', '-')), tarball);
  console.log(`packed ${filename} -> .pack/opencorestack-opengridx.tgz (${(size / 1024).toFixed(0)} kB, unpacked ${(unpackedSize / 1024).toFixed(0)} kB)`);
}

const fixtures = readdirSync(fixturesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(fixturesDir, d.name, 'package.json')))
  .map((d) => join(fixturesDir, d.name));

for (const dir of fixtures) {
  const name = dir.slice(fixturesDir.length + 1);
  step(`Install fixture ${name}`);
  const lock = join(dir, 'package-lock.json');
  const stamp = join(dir, 'node_modules', '.smoke-lock-hash');
  const lockText = readFileSync(lock, 'utf8');
  // The lockfile pins every third-party dependency. The library entry points at the tarball, whose
  // hash changes on every build, so its entry must carry no integrity or `npm ci` would reject it.
  if (JSON.parse(lockText).packages['node_modules/@opencorestack/opengridx']?.integrity) {
    throw new Error(`${lock}: remove "integrity" from the node_modules/@opencorestack/opengridx entry (npm install re-adds it).`);
  }
  const hash = createHash('sha256').update(lockText).digest('hex');
  if (flags.has('--fresh')) {
    rmSync(join(dir, 'node_modules'), { recursive: true, force: true });
    run(npm, ['install', '--no-audit', '--no-fund', '--no-package-lock'], dir);
  } else if (existsSync(stamp) && readFileSync(stamp, 'utf8') === hash) {
    console.log('dependencies up to date (lockfile unchanged)');
  } else {
    run(npm, ['ci', '--no-audit', '--no-fund'], dir);
    writeFileSync(stamp, hash);
  }
  // Unpack the tarball exactly where npm would put it. The package has no dependencies of its
  // own (react and the export libraries are peers the fixture provides), so this is the install.
  const target = join(dir, 'node_modules', '@opencorestack', 'opengridx');
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  run('tar', ['-xzf', tarball, '-C', target, '--strip-components=1'], dir);
  const shipped = JSON.parse(readFileSync(join(target, 'package.json'), 'utf8'));
  if (Object.keys(shipped.dependencies ?? {}).length > 0) {
    throw new Error('The package now has runtime dependencies; install the tarball with npm instead of unpacking it.');
  }
  rmSync(join(dir, 'node_modules', '.vite'), { recursive: true, force: true });

  step(`Build fixture ${name} (strict tsc against the published types, then vite build)`);
  run(npm, ['run', 'build'], dir);
}

if (!flags.has('--skip-tests')) {
  step('Run Playwright smoke tests');
  run(npx, ['playwright', 'test', '--config', 'e2e/playwright.config.ts', ...playwrightArgs]);
}

console.log(`\nsmoke suite finished in ${((Date.now() - started) / 1000).toFixed(0)}s`);
