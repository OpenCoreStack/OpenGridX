# Contributing to OpenGridX

Thanks for helping. OpenGridX is published on npm and used in production apps, so every change is treated as potentially semver-relevant.

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

- **Bugs:** open an issue with the bug report template. A minimal reproduction (CodeSandbox, StackBlitz or a small repo) gets the fastest fix.
- **Features:** open a feature request first and wait for agreement before writing a large PR.
- **Small fixes** (typos, docs, obvious one-line bugs) can go straight to a PR.

## Setup

Requires Node 22 (the version CI uses).

```bash
git clone https://github.com/OpenCoreStack/OpenGridX.git
cd OpenGridX
npm ci
npx playwright install chromium firefox webkit   # browser and smoke tests
npm run dev                                       # demo site
```

## Project layout

| Path | Contents |
| :--- | :--- |
| `lib/` | The published library |
| `lib/components/DataGrid/DataGrid.tsx` | Orchestration only: hook calls and JSX, no logic |
| `lib/hooks/core/`, `lib/hooks/features/` | Pipeline and opt-in feature hooks |
| `lib/types/index.ts` | All public types |
| `demo/` | Demo site (GitHub Pages) |
| `docs/` | Guides, API reference, architecture notes |
| `e2e/` | Package smoke suite |

Architecture notes: [docs/architecture/datagrid-orchestration.md](docs/architecture/datagrid-orchestration.md).

## Code rules

- TypeScript strict. No `any` (use `unknown` or a real type), no `@ts-ignore` / `@ts-expect-error`, no `eslint-disable`. Fix the cause.
- Put new logic in a hook or pure util and call it from `DataGrid.tsx`.
- Never write fields onto consumer row objects; hierarchy data goes in `rowMetaMap`.
- Read cell values through `getCellValue` (`lib/utils/values.ts`); contain consumer callbacks that may throw.
- CSS classes use the `ogx__` BEM prefix, variables `--ogx-*`. Class names are public API: renaming one is a breaking change.
- No ref mutation during render; no `setState` in an effect when the value can be derived.

## Docs and the wiki

Edit documentation in `docs/` (or `wiki/` for the wiki's Home, Getting Started and FAQ pages). The [GitHub wiki](https://github.com/OpenCoreStack/OpenGridX/wiki) is generated from them on every push to `main`, so edits made directly in the wiki are lost. A new page in `docs/` must be added to `SECTIONS` in `scripts/build-wiki.mjs`; `npm run wiki:build` warns about docs that are not listed and writes the result to `.wiki-build/` for a local look.

## Tests

See [docs/contributing/testing.md](docs/contributing/testing.md). In short:

| Command | Use for |
| :--- | :--- |
| `npm test` | Logic, hooks, rendering in jsdom |
| `npm run test:browser` | Anything needing layout, scrolling, focus or `ResizeObserver` (`*.browser.test.tsx`) |
| `npm run test:smoke` | The packed package in real React 18 / 19 apps |

Bug fixes need a test that fails without the fix.

## Before opening a PR

All of these must pass:

```bash
npm run lint
npm run typecheck
npm test
npm run test:browser
npm run build:lib
npm run build
```

Then:

- Add an entry under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) for any user-visible change.
- Update the docs (`docs/API_REFERENCE.md`, `docs/features/`, `docs/components/`) and the demo page for the feature.
- Breaking changes must be called out in the PR and need a migration note.

## Commits and PRs

- Conventional Commits: `fix(editing): …`, `feat(export): …`, `docs: …`, `test: …`, `chore: …`.
- One logical change per PR; keep unrelated refactors out.
- CI (`.github/workflows/ci.yml`) runs on every PR and must be green before merge.
- Version bumps and releases are done by the maintainer; don't change `version` in `package.json`.

## Security

Do not open public issues for vulnerabilities. Use GitHub's private vulnerability reporting (Security → Report a vulnerability) or email the maintainer.

## License

Contributions are licensed under the project's [MIT License](LICENSE).
