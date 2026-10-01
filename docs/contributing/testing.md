# Testing

Three layers, from fastest to closest to a real consumer.

| Command | What runs | Where the tests live |
| :--- | :--- | :--- |
| `npm test` | Vitest unit tests in jsdom | `lib/**/*.test.ts(x)` |
| `npm run test:browser` | Vitest browser mode in real Chromium, Firefox and WebKit | `lib/**/*.browser.test.ts(x)` |
| `npm run test:smoke` | Package smoke suite: Playwright Test against apps that installed the packed tarball | `e2e/` |

Other gates: `npm run lint`, `npm run typecheck` (lib, tests, demo, e2e), `npm run build:lib` (also checks that React stays external).

One-time setup for the browser and smoke suites:

```bash
npx playwright install chromium firefox webkit
```

## Which one do I write?

- **Render `<DataGrid>` with props and assert on it → Vitest.** Pure logic and hooks in `*.test.ts(x)`; anything that needs layout, `ResizeObserver`, scrolling or focus in `*.browser.test.tsx`.
- **Needs the built package, a real app, a dev/preview server or a file download → e2e smoke.** Examples: the published `.d.ts` compiles in a strict consumer, the bundle works under React 18, the stylesheet sizes the grid inside an app shell, optional peers (`exceljs`, `jspdf`) load from the consumer's `node_modules`.

Vitest tests import `lib/` source directly, so they cannot catch packaging mistakes (bundled `react/jsx-runtime`, a missing CSS rule in `dist/`, broken `exports`). That is what the smoke suite is for; keep it small.

## The package smoke suite

`npm run test:smoke` (`scripts/smoke.mjs`):

1. `npm run build:lib`, then `npm pack` into `.pack/opencorestack-opengridx.tgz`.
2. For each fixture in `e2e/fixtures/` (`react19`, `react18`): `npm ci` from its committed lockfile (skipped while the lockfile is unchanged), then unpack the fresh tarball into its `node_modules`.
3. Build each fixture: `tsc` in strict mode with `skipLibCheck: false` against the shipped types, then `vite build`. The build is itself a typing test.
4. `playwright test` (`e2e/playwright.config.ts`): Chromium, Firefox and WebKit against `vite preview` of each fixture (ports 4319 and 4318).

Scenarios are selected with `?scenario=`: `basic`, `flex`, `grouping`, `editing` (both fixtures), `pinned`, `dark` (React 19 only). Every test fails on any console error or warning.

Useful variants:

```bash
npm run test:smoke -- --skip-lib                       # reuse dist/ from a previous build:lib
npm run test:smoke -- --skip-tests                     # pack, install and build the fixtures only
npm run test:smoke -- -- --project=chromium-react18    # pass arguments to playwright test
npx playwright test --config e2e/playwright.config.ts  # rerun tests against the current fixture builds
npx playwright show-report playwright-report           # HTML report, traces of failed tests
```

`--fresh` ignores the fixture lockfiles and installs the newest versions in range (used by the weekly workflow).

### Fixtures

The fixtures are separate npm projects: they are not part of the root lint, typecheck or Vitest runs and install into their own `node_modules`. When you change a fixture's dependencies, run `npm install` in it and then delete the `integrity` field from the `node_modules/@opencorestack/opengridx` entry of its `package-lock.json` (the tarball changes on every build; the script refuses a lockfile that pins it).

## CI

- `.github/workflows/ci.yml` (pull requests and pushes to branches other than `main`): lint, typecheck, unit, browser tests, `build:lib`, smoke suite. Playwright reports and traces are uploaded when a step fails.
- `npm-publish.yml` runs the smoke suite after `build:lib` and before `npm publish`.
- `nightly.yml` runs weekly: all Vitest projects and the smoke suite with `--fresh`.
