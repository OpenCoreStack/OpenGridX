#!/usr/bin/env node
// Large-dataset benchmark (design: docs/superpowers/specs/2026-10-09-benchmark-design.md).
//
//   1. build:lib and `npm pack` into .pack/ (shared with the smoke suite, scripts/lib/package-fixture.mjs)
//   2. install bench/app from its lockfile and unpack the tarball into it, then build it (strict tsc +
//      a production vite build, so React's development checks do not distort the timings)
//   3. serve it with `vite preview` on port 4320 and drive it with Playwright, one new browser context
//      per run: generate the rows (untimed), mount, scroll, reach, sort, filter, quick filter, group
//   4. write bench/results/<YYYY-MM-DD>-<machine>.json; `node bench/report.mjs` turns it into Markdown
//
// What is timed and how: see the comment at the top of bench/app/src/harness.tsx.
//
// Flags:
//   --rows 100000,1000000     row counts (default 10000,100000,500000,1000000). 1M also runs at 32 px.
//   --engine chromium,firefox engines (default chromium,firefox,webkit)
//   --repeat 5                measured runs per row count (default 5), after one discarded warm-up run.
//                             Per size: --repeat 5,1000000:3
//   --quick                   1 run, no warm-up, skips 500k (local checks and weekly CI)
//   --skip-lib                reuse dist/ from `npm run build:lib` (the tarball is still packed)
//   --skip-build              reuse the installed and built bench/app (no pack, install or build)
//   --out <file>              results path (default bench/results/<date>-<machine>[-quick].json)

import { execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import { join, relative } from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import { installPackedApp, npm, npx, packLibrary, root, run, step } from '../scripts/lib/package-fixture.mjs';

const appDir = join(root, 'bench', 'app');
const resultsDir = join(root, 'bench', 'results');
const PORT = 4320;
const BASE_URL = `http://localhost:${PORT}/`;
const SEED = 20261009;
const VIEWPORT = { width: 1280, height: 800 };
const ENGINES = { chromium, firefox, webkit };

// ── Arguments ──────────────────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function flagValue(name) {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  const value = argv[i + 1];
  if (value === undefined || value.startsWith('--')) throw new Error(`${name} needs a value`);
  return value;
}
const quick = argv.includes('--quick');
const engines = (flagValue('--engine') ?? 'chromium,firefox,webkit').split(',').map((s) => s.trim());
for (const e of engines) if (!(e in ENGINES)) throw new Error(`unknown engine "${e}" (chromium, firefox, webkit)`);
let sizes = (flagValue('--rows') ?? '10000,100000,500000,1000000').split(',').map((s) => Number(s.trim()));
if (sizes.some((n) => !Number.isInteger(n) || n <= 0)) throw new Error('--rows takes positive integers, e.g. 10000,100000');
if (quick && !argv.includes('--rows')) sizes = sizes.filter((n) => n !== 500000);
const repeatSpec = (flagValue('--repeat') ?? '5').split(',');
const defaultRepeat = quick ? 1 : Number(repeatSpec.find((s) => !s.includes(':')) ?? 5);
const repeatBySize = new Map(
  repeatSpec.filter((s) => s.includes(':')).map((s) => s.split(':').map(Number)),
);
const warmup = !quick;

/** Every row count at the default 52 px; 1M also at 32 px (compact), which Chromium can fully scroll. */
const configs = sizes.flatMap((rows) => {
  const list = [{ rows, rowHeight: 52 }];
  if (rows === 1_000_000) list.push({ rows, rowHeight: 32 });
  return list;
});

// ── Machine ────────────────────────────────────────────────────────────────────────────────────
function osName() {
  try {
    if (process.platform === 'darwin') {
      return `macOS ${execFileSync('sw_vers', ['-productVersion'], { encoding: 'utf8' }).trim()}`;
    }
    if (process.platform === 'linux' && existsSync('/etc/os-release')) {
      const line = readFileSync('/etc/os-release', 'utf8').split('\n').find((l) => l.startsWith('PRETTY_NAME='));
      if (line) return line.slice('PRETTY_NAME='.length).replace(/"/g, '');
    }
  } catch {
    // fall through to the generic name
  }
  return `${os.type()} ${os.release()}`;
}

function cpuModel() {
  if (process.platform === 'darwin') {
    try {
      return execFileSync('sysctl', ['-n', 'machdep.cpu.brand_string'], { encoding: 'utf8' }).trim();
    } catch {
      // fall through
    }
  }
  return os.cpus()[0]?.model.trim() ?? 'unknown CPU';
}

function gitCommit() {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

const machine = {
  cpu: cpuModel(),
  cores: os.cpus().length,
  ramGB: Math.round(os.totalmem() / 1024 ** 3),
  os: osName(),
  arch: process.arch,
  node: process.version,
  ci: Boolean(process.env.CI),
  loadAverageAtStart: os.loadavg().map((n) => Number(n.toFixed(2))),
};

// ── Statistics ─────────────────────────────────────────────────────────────────────────────────
function summarize(samples) {
  const values = samples.filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const round = (n) => Number(n.toFixed(2));
  return { median: round(median), min: round(sorted[0]), max: round(sorted[sorted.length - 1]), samples: values.map(round) };
}

/** Flattens one run's raw results into named numbers. */
function metricsOf(raw) {
  const m = {
    mountMs: raw.mount,
    sortNumberMs: raw.sortNumber.ms,
    sortStringMs: raw.sortString.ms,
    filterStringMs: raw.filterString.ms,
    filterNumberMs: raw.filterNumber.ms,
    quickFilterMs: raw.quickFilter.ms,
    groupMs: raw.group.ms,
    scrollP50Ms: raw.scroll.p50,
    scrollP95Ms: raw.scroll.p95,
    scrollP99Ms: raw.scroll.p99,
    scrollOver16Pct: raw.scroll.over16 * 100,
    scrollOver33Pct: raw.scroll.over33 * 100,
    scrollOver16ConstantPct: raw.scroll.over16Constant * 100,
    scrollOver16JumpsPct: raw.scroll.over16Jumps * 100,
    domRows: raw.scroll.domRows,
    domCells: raw.scroll.domCells,
    domRowsAtRest: raw.scroll.domRowsAtRest,
    reachRows: raw.reach.lastVisibleRow,
    reachPct: (raw.reach.lastVisibleRow / raw.reach.rowCount) * 100,
    scrollHeightPx: raw.reach.scrollHeight,
    refreshIntervalMs: raw.refreshInterval.intervalMs,
    idleOver16Pct: raw.refreshInterval.idleOver16 * 100,
  };
  if (raw.heapMB !== null) m.heapMB = raw.heapMB;
  if (raw.scroll.longTasks) {
    m.scrollLongTasks = raw.scroll.longTasks.count;
    m.scrollLongTaskMs = raw.scroll.longTasks.totalMs;
  }
  if (raw.sortNumber.longTasks && raw.sortString.longTasks) {
    m.sortLongTasks = raw.sortNumber.longTasks.count + raw.sortString.longTasks.count;
    m.sortLongTaskMaxMs = Math.max(raw.sortNumber.longTasks.maxMs, raw.sortString.longTasks.maxMs);
  }
  return m;
}

// ── One run: a new browser context, the whole sequence of measurements ────────────────────────
async function runOnce(browser, engine, { rows, rowHeight }) {
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));
  try {
    await page.goto(BASE_URL);
    await page.waitForFunction(() => document.documentElement.dataset.benchReady === 'true');
    if (!(await page.evaluate(() => window.crossOriginIsolated))) throw new Error('the page is not cross-origin isolated');

    await page.evaluate(([n, seed]) => window.__bench.generate(n, seed), [rows, SEED]);
    const refreshInterval = await page.evaluate(() => window.__bench.refreshInterval());

    // Heap (Chromium only, through CDP): used JS heap after mount minus the same page with the rows
    // generated and no grid, both after a forced garbage collection.
    const cdp = engine === 'chromium' ? await context.newCDPSession(page) : null;
    const usedHeap = async () => {
      await cdp.send('HeapProfiler.collectGarbage');
      const { usedSize } = await cdp.send('Runtime.getHeapUsage');
      return usedSize;
    };
    const heapBefore = cdp ? await usedHeap() : 0;
    const mount = await page.evaluate((h) => window.__bench.mount(h), rowHeight);
    await page.evaluate(() => window.__bench.settle(30));
    const heapMB = cdp ? (await usedHeap() - heapBefore) / 1024 ** 2 : null;

    const scroll = await page.evaluate(([seed, interval]) => window.__bench.scroll(seed, interval), [SEED, refreshInterval.intervalMs]);
    const reach = await page.evaluate(() => window.__bench.reach());
    const sortNumber = await page.evaluate(() => window.__bench.sortNumber());
    const sortString = await page.evaluate(() => window.__bench.sortString());
    const filterString = await page.evaluate(() => window.__bench.filterString());
    const filterNumber = await page.evaluate(() => window.__bench.filterNumber());
    const quickFilter = await page.evaluate(() => window.__bench.quickFilter());
    const group = await page.evaluate(() => window.__bench.group());

    const warnings = [sortNumber, sortString, filterString, filterNumber, quickFilter, group]
      .map((r) => r.warning)
      .filter(Boolean);
    return {
      raw: { mount, refreshInterval, heapMB, scroll, reach, sortNumber, sortString, filterString, filterNumber, quickFilter, group },
      warnings: [...warnings, ...consoleErrors.map((t) => `console: ${t}`)],
      rowCounts: { filterString: filterString.rowCount, filterNumber: filterNumber.rowCount, quickFilter: quickFilter.rowCount, group: group.rowCount },
    };
  } finally {
    await context.close();
  }
}

// ── Preview server ─────────────────────────────────────────────────────────────────────────────
async function startServer() {
  const child = spawn(npx, ['vite', 'preview', '--port', String(PORT), '--strictPort'], { cwd: appDir, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', (d) => { output += d; });
  child.stderr.on('data', (d) => { output += d; });
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`vite preview exited:\n${output}`);
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) return child;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  child.kill();
  throw new Error(`vite preview did not start on port ${PORT}:\n${output}`);
}

// ── Main ───────────────────────────────────────────────────────────────────────────────────────
const started = Date.now();
const loadPerCore = machine.loadAverageAtStart[0] / machine.cores;
if (loadPerCore > 0.5) {
  console.warn(`\nWARNING: 1-minute load average is ${machine.loadAverageAtStart[0]} on ${machine.cores} cores; timings may be noisy.`);
}

if (!argv.includes('--skip-build')) {
  step('Build and pack the library');
  packLibrary({ skipLib: argv.includes('--skip-lib') });
  step('Install bench/app');
  installPackedApp(appDir);
  step('Build bench/app (strict tsc, production vite build)');
  run(npm, ['run', 'build'], appDir);
} else if (!existsSync(join(appDir, 'dist', 'index.html'))) {
  throw new Error('--skip-build needs a built bench/app; run without it once.');
}

const packageVersion = JSON.parse(readFileSync(join(appDir, 'node_modules', '@opencorestack', 'opengridx', 'package.json'), 'utf8')).version;
const date = new Date().toISOString().slice(0, 10);
const slug = `${machine.cpu} ${process.platform}`.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const outFile = flagValue('--out') ?? join(resultsDir, `${date}-${slug}${quick ? '-quick' : ''}.json`);

const results = {
  schema: 1,
  date,
  package: { name: '@opencorestack/opengridx', version: packageVersion, commit: gitCommit() },
  machine,
  method: {
    viewport: VIEWPORT,
    headless: true,
    seed: SEED,
    warmupRunDiscarded: warmup,
    columns: 12,
    pinnedColumns: 2,
    note: 'Times are from starting the operation to the first painted frame showing its result (double rAF after the commit). Medians over the measured runs, with min and max.',
  },
  browsers: {},
  runs: [],
};

function save() {
  mkdirSync(resultsDir, { recursive: true });
  writeFileSync(outFile, `${JSON.stringify(results, null, 1)}\n`);
}

step(`Serve bench/app on ${BASE_URL}`);
const server = await startServer();
let failed = false;
try {
  for (const engine of engines) {
    const browser = await ENGINES[engine].launch({ headless: true });
    results.browsers[engine] = browser.version();
    step(`${engine} ${browser.version()}`);
    try {
      for (const config of configs) {
        const repeats = repeatBySize.get(config.rows) ?? defaultRepeat;
        const total = repeats + (warmup ? 1 : 0);
        const label = `${config.rows.toLocaleString('en-US')} rows @ ${config.rowHeight} px`;
        const measured = [];
        const warnings = new Set();
        let rowCounts = null;
        for (let i = 0; i < total; i++) {
          const isWarmup = warmup && i === 0;
          const t = Date.now();
          const result = await runOnce(browser, engine, config);
          const m = metricsOf(result.raw);
          console.log(
            `${label} run ${i + 1}/${total}${isWarmup ? ' (warm-up, discarded)' : ''}: ` +
            `mount ${m.mountMs.toFixed(0)} ms, sort ${m.sortNumberMs.toFixed(0)}/${m.sortStringMs.toFixed(0)} ms, ` +
            `filter ${m.filterStringMs.toFixed(0)}/${m.filterNumberMs.toFixed(0)} ms, quick ${m.quickFilterMs.toFixed(0)} ms, ` +
            `group ${m.groupMs.toFixed(0)} ms, scroll p95 ${m.scrollP95Ms.toFixed(1)} ms, ` +
            `reach ${m.reachRows.toLocaleString('en-US')} (${m.reachPct.toFixed(1)}%)` +
            `${m.heapMB !== undefined ? `, heap ${m.heapMB.toFixed(1)} MB` : ''} [${((Date.now() - t) / 1000).toFixed(0)} s]`,
          );
          for (const w of result.warnings) {
            if (!warnings.has(w)) console.warn(`  warning: ${w}`);
            warnings.add(w);
          }
          rowCounts = result.rowCounts;
          if (!isWarmup) measured.push(m);
        }
        const metrics = {};
        for (const key of Object.keys(measured[0])) metrics[key] = summarize(measured.map((m) => m[key]));
        results.runs.push({ engine, rows: config.rows, rowHeight: config.rowHeight, repeats, rowCounts, metrics, warnings: [...warnings] });
        save();
      }
    } finally {
      await browser.close();
    }
  }
} catch (err) {
  failed = true;
  console.error(err);
} finally {
  server.kill();
}

machine.loadAverageAtEnd = os.loadavg().map((n) => Number(n.toFixed(2)));
results.durationSeconds = Math.round((Date.now() - started) / 1000);
save();
console.log(`\nresults: ${relative(root, outFile)} (${results.durationSeconds} s). Markdown: node bench/report.mjs ${relative(root, outFile)}`);
if (failed) process.exit(1);
