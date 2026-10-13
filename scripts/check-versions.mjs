// Every place that names the current version agrees with package.json, so a release cannot leave a
// stale "3.7.0" behind (the demo reads package.json itself; these files are written by hand).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(ROOT, path), 'utf8');
const { version } = JSON.parse(read('package.json'));
const problems = [];

const llms = read('llms.txt');
const llmsVersion = llms.match(/^# Version: (\S+)$/m)?.[1];
if (llmsVersion !== version) problems.push(`llms.txt says "# Version: ${llmsVersion}"`);
if (read('demo/public/llms.txt') !== llms) problems.push('demo/public/llms.txt differs from llms.txt (copy it)');

const claudeVersion = read('CLAUDE.md').match(/\*\*Current version:\*\* (\S+)/)?.[1];
if (claudeVersion !== version) problems.push(`CLAUDE.md says "Current version: ${claudeVersion}"`);

if (!read('CHANGELOG.md').includes(`## [${version}]`)) problems.push(`CHANGELOG.md has no "## [${version}]" entry`);

if (problems.length > 0) {
    console.error(`check:versions: package.json is ${version}, but:\n  - ${problems.join('\n  - ')}`);
    process.exit(1);
}
console.log(`check:versions: ${version} everywhere (llms.txt, demo copy, CLAUDE.md, CHANGELOG)`);
