#!/usr/bin/env node
// Turns a benchmark results file (bench/run.mjs) into the Markdown tables of docs/performance.md.
//
//   node bench/report.mjs [results.json]             print the Markdown (default: newest full run in bench/results)
//   node bench/report.mjs [results.json] --write F   replace the text between <!-- bench:start --> and
//                                                    <!-- bench:end --> in file F

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const resultsDir = join(root, 'bench', 'results');

const argv = process.argv.slice(2);
const writeIndex = argv.indexOf('--write');
const writeTarget = writeIndex === -1 ? null : argv[writeIndex + 1];
if (writeIndex !== -1 && !writeTarget) throw new Error('--write needs a Markdown file');
const positional = argv.filter((a, i) => !a.startsWith('--') && (writeIndex === -1 || i !== writeIndex + 1));

function newestResults() {
  const files = readdirSync(resultsDir).filter((f) => f.endsWith('.json') && !f.endsWith('-quick.json')).sort();
  if (files.length === 0) throw new Error('no results in bench/results; run `npm run bench` first');
  return join(resultsDir, files[files.length - 1]);
}

const file = positional[0] ? resolve(positional[0]) : newestResults();
const results = JSON.parse(readFileSync(file, 'utf8'));

const ENGINE_NAMES = { chromium: 'Chromium', firefox: 'Firefox', webkit: 'WebKit' };
const engines = Object.keys(results.browsers);
const fmtInt = (n) => Math.round(n).toLocaleString('en-US');

function fmtMs(n) {
  return n < 10 ? n.toFixed(1) : fmtInt(n);
}

/** "median (min–max)" with a unit; just the median when every run gave the same value. */
function cell(stat, format, unit) {
  if (!stat) return '–';
  if (format(stat.median) === 'none') return 'none';
  const median = `${format(stat.median)}${unit}`;
  if (stat.samples.length < 2 || format(stat.min) === format(stat.max)) return median;
  return `${median} (${format(stat.min)}–${format(stat.max)})`;
}

const ROWS = [
  ['Mount', 'mountMs', fmtMs, ' ms'],
  ['Sort, number column', 'sortNumberMs', fmtMs, ' ms'],
  ['Sort, string column', 'sortStringMs', fmtMs, ' ms'],
  ['Filter, string `contains`', 'filterStringMs', fmtMs, ' ms'],
  ['Filter, number `>`', 'filterNumberMs', fmtMs, ' ms'],
  ['Quick filter, one term', 'quickFilterMs', fmtMs, ' ms'],
  ['Group by region + `sum`', 'groupMs', fmtMs, ' ms'],
  ['Scroll frame time p50', 'scrollP50Ms', (n) => n.toFixed(1), ' ms'],
  ['Scroll frame time p95', 'scrollP95Ms', (n) => n.toFixed(1), ' ms'],
  ['Scroll frame time p99', 'scrollP99Ms', (n) => n.toFixed(1), ' ms'],
  ['Scroll frames over 16.7 ms', 'scrollOver16Pct', (n) => n.toFixed(1), ' %'],
  ['Scroll frames over 33 ms', 'scrollOver33Pct', (n) => n.toFixed(1), ' %'],
  ['… over 16.7 ms while scrolling steadily', 'scrollOver16ConstantPct', (n) => n.toFixed(1), ' %'],
  ['… over 16.7 ms during the jumps', 'scrollOver16JumpsPct', (n) => n.toFixed(1), ' %'],
  ['Long tasks during scroll ¹', 'scrollLongTasks', fmtInt, ''],
  ['Longest task during a sort ¹', 'sortLongTaskMaxMs', (n) => (n === 0 ? 'none' : fmtMs(n)), ' ms'],
  ['JS heap for the grid ¹', 'heapMB', (n) => n.toFixed(1), ' MB'],
  ['Row elements in the DOM, end of scroll', 'domRows', fmtInt, ''],
  ['Cells in the DOM, end of scroll', 'domCells', fmtInt, ''],
  ['Row elements in the DOM, at rest', 'domRowsAtRest', fmtInt, ''],
];

function machineBlock() {
  const m = results.machine;
  const browsers = engines.map((e) => `${ENGINE_NAMES[e]} ${results.browsers[e]}`).join(', ');
  const counts = [...new Set(results.runs.map((r) => r.repeats))];
  const repeats = counts.length === 1 ? `${counts[0]} run${counts[0] === 1 ? '' : 's'}` : `${counts.join(' or ')} runs (see each table)`;
  const lines = [
    `- **Machine:** ${m.cpu}, ${m.cores} cores, ${m.ramGB} GB RAM, ${m.os} (${m.arch})${m.ci ? ', CI runner' : ''}`,
    `- **Browsers:** ${browsers} (Playwright, headless, 1280×800 page)`,
    `- **Package:** ${results.package.name} ${results.package.version}${results.package.commit ? ` (commit \`${results.package.commit}\`)` : ''}, production build`,
    `- **Date:** ${results.date}; load average at start ${m.loadAverageAtStart.join(' / ')}${m.loadAverageAtEnd ? `, at end ${m.loadAverageAtEnd.join(' / ')}` : ''}`,
    `- **Runs:** median of ${repeats}${results.method.warmupRunDiscarded ? ' after one discarded warm-up run' : ''}, with the min–max range in brackets`,
  ];
  return lines.join('\n');
}

function sizeTable(rows, rowHeight) {
  const runs = engines.map((e) => results.runs.find((r) => r.engine === e && r.rows === rows && r.rowHeight === rowHeight));
  if (runs.every((r) => !r)) return null;
  const repeats = [...new Set(runs.filter(Boolean).map((r) => r.repeats))].join('/');
  const out = [`#### ${rows.toLocaleString('en-US')} rows, ${rowHeight} px rows${repeats === '5' ? '' : ` (${repeats} run${repeats === '1' ? '' : 's'})`}`, ''];
  out.push(`| Metric | ${engines.map((e) => ENGINE_NAMES[e]).join(' | ')} |`);
  out.push(`| :--- | ${engines.map(() => '---:').join(' | ')} |`);
  for (const [label, key, format, unit] of ROWS) {
    const cells = runs.map((r) => (r ? cell(r.metrics[key], format, unit) : '–'));
    if (cells.every((c) => c === '–')) continue;
    out.push(`| ${label} | ${cells.join(' | ')} |`);
  }
  const reach = runs.map((r) => {
    if (!r) return '–';
    const s = r.metrics.reachRows;
    const pct = r.metrics.reachPct.median;
    return pct >= 99.995 ? 'all rows' : `${fmtInt(s.median)} (${pct < 0.1 ? '<0.1' : pct.toFixed(1)} %)`;
  });
  out.push(`| Reach: last row on screen at the bottom | ${reach.join(' | ')} |`);
  const warnings = runs.flatMap((r, i) => (r ? r.warnings.map((w) => `${ENGINE_NAMES[engines[i]]}: ${w}`) : []));
  if (warnings.length) out.push('', ...warnings.map((w) => `> Warning: ${w}`));
  return out.join('\n');
}

function reachTable() {
  const configs = [...new Map(results.runs.map((r) => [`${r.rows}@${r.rowHeight}`, r])).values()];
  const out = ['| Rows × row height | Content height | ' + engines.map((e) => ENGINE_NAMES[e]).join(' | ') + ' |'];
  out.push(`| :--- | ---: | ${engines.map(() => '---:').join(' | ')} |`);
  for (const c of configs) {
    const cells = engines.map((e) => {
      const r = results.runs.find((x) => x.engine === e && x.rows === c.rows && x.rowHeight === c.rowHeight);
      if (!r) return '–';
      const pct = r.metrics.reachPct.median;
      return pct >= 99.995 ? 'all' : `${fmtInt(r.metrics.reachRows.median)} (${pct < 0.1 ? '<0.1' : pct.toFixed(1)} %)`;
    });
    out.push(`| ${c.rows.toLocaleString('en-US')} × ${c.rowHeight} px | ${fmtInt(c.rows * c.rowHeight)} px | ${cells.join(' | ')} |`);
  }
  return out.join('\n');
}

const sizes = [...new Map(results.runs.map((r) => [`${r.rows}@${r.rowHeight}`, r])).values()];
const tables = sizes.map((r) => sizeTable(r.rows, r.rowHeight)).filter(Boolean);
const markdown = [
  `<!-- Generated by \`node bench/report.mjs --write docs/performance.md\` from ${relative(root, file)}. Do not edit by hand. -->`,
  '',
  machineBlock(),
  '',
  '¹ Chromium only: Firefox and WebKit have no long-task entries, and the heap is read through the Chrome DevTools Protocol.',
  '',
  ...tables.flatMap((t) => [t, '']),
  '#### Reach: rows that can be scrolled into view',
  '',
  reachTable(),
].join('\n');

if (writeTarget) {
  const target = resolve(writeTarget);
  const text = readFileSync(target, 'utf8');
  const start = '<!-- bench:start -->';
  const end = '<!-- bench:end -->';
  const a = text.indexOf(start);
  const b = text.indexOf(end);
  if (a === -1 || b === -1 || b < a) throw new Error(`${writeTarget}: needs ${start} and ${end} markers`);
  writeFileSync(target, `${text.slice(0, a + start.length)}\n${markdown}\n${text.slice(b)}`);
  console.log(`wrote the benchmark tables into ${relative(root, target)}`);
} else {
  console.log(markdown);
}
