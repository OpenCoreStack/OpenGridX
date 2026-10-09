// Shared by the package smoke suite (scripts/smoke.mjs) and the benchmark (bench/run.mjs): pack the
// library into .pack/ under a fixed name, and install an app that depends on that tarball the way a
// consumer would.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const packDir = join(root, '.pack');
export const tarball = join(packDir, 'opencorestack-opengridx.tgz');
export const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
export const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

export function run(cmd, args, cwd = root) {
  console.log(`\n$ ${[cmd, ...args].join(' ')}${cwd === root ? '' : `   (in ${relative(root, cwd)})`}`);
  execFileSync(cmd, args, { cwd, stdio: 'inherit' });
}

export function step(title) {
  console.log(`\n=== ${title}`);
}

/**
 * Builds the library (unless `skipLib`, which reuses dist/) and packs it to .pack/opencorestack-opengridx.tgz.
 */
export function packLibrary({ skipLib = false } = {}) {
  if (skipLib) {
    if (!existsSync(join(root, 'dist', 'index.d.ts'))) throw new Error('--skip-lib needs dist/; run `npm run build:lib` first.');
  } else {
    run(npm, ['run', 'build:lib']);
  }
  rmSync(packDir, { recursive: true, force: true });
  mkdirSync(packDir, { recursive: true });
  const out = execFileSync(npm, ['pack', '--pack-destination', packDir, '--json', '--silent'], { cwd: root, encoding: 'utf8' });
  const [{ filename, size, unpackedSize }] = JSON.parse(out);
  renameSync(join(packDir, filename.replace(/^@/, '').replace('/', '-')), tarball);
  console.log(`packed ${filename} -> .pack/opencorestack-opengridx.tgz (${(size / 1024).toFixed(0)} kB, unpacked ${(unpackedSize / 1024).toFixed(0)} kB)`);
}

/**
 * Installs the app in `dir` from its lockfile (`npm ci`, skipped while the lockfile is unchanged), or
 * with the newest versions in range when `fresh`, then unpacks the fresh tarball into its node_modules.
 */
export function installPackedApp(dir, { fresh = false } = {}) {
  const lock = join(dir, 'package-lock.json');
  const stamp = join(dir, 'node_modules', '.smoke-lock-hash');
  const lockText = readFileSync(lock, 'utf8');
  // The lockfile pins every third-party dependency. The library entry points at the tarball, whose
  // hash changes on every build, so its entry must carry no integrity or `npm ci` would reject it.
  if (JSON.parse(lockText).packages['node_modules/@opencorestack/opengridx']?.integrity) {
    throw new Error(`${lock}: remove "integrity" from the node_modules/@opencorestack/opengridx entry (npm install re-adds it).`);
  }
  const hash = createHash('sha256').update(lockText).digest('hex');
  if (fresh) {
    rmSync(join(dir, 'node_modules'), { recursive: true, force: true });
    run(npm, ['install', '--no-audit', '--no-fund', '--no-package-lock'], dir);
  } else if (existsSync(stamp) && readFileSync(stamp, 'utf8') === hash) {
    console.log('dependencies up to date (lockfile unchanged)');
  } else {
    run(npm, ['ci', '--no-audit', '--no-fund'], dir);
    writeFileSync(stamp, hash);
  }
  // Unpack the tarball exactly where npm would put it. The package has no dependencies of its
  // own (react and the export libraries are peers the app provides), so this is the install.
  const target = join(dir, 'node_modules', '@opencorestack', 'opengridx');
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });
  run('tar', ['-xzf', tarball, '-C', target, '--strip-components=1'], dir);
  const shipped = JSON.parse(readFileSync(join(target, 'package.json'), 'utf8'));
  if (Object.keys(shipped.dependencies ?? {}).length > 0) {
    throw new Error('The package now has runtime dependencies; install the tarball with npm instead of unpacking it.');
  }
  rmSync(join(dir, 'node_modules', '.vite'), { recursive: true, force: true });
}
