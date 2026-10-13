import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'demo/dist', 'research', '.claude', '.pack', 'e2e/fixtures', 'bench', 'test-results', 'playwright-report']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // Zero `any` (CLAUDE.md): enforced, not left to review.
      '@typescript-eslint/no-explicit-any': 'error',
      'no-unused-vars': 'off',
      // The React Compiler rules of react-hooks v7 are on (see docs/contributing/react-compiler.md),
      // except set-state-in-effect: the toolbar panels measure their anchor in an effect to position
      // themselves, which the rule reports although it is the intended use of an effect.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // Library code: no new `x as unknown as Y`. Such a cast turns type checking off for everything
    // downstream (one hid ~25 errors, R4 in 3.10). Widen a column with untypedColumn(s); narrow with
    // a plain `as`. The files below hold the documented boundaries (synthetic rows, third-party module
    // typings, window / CSS custom properties); add a file only with a comment at the cast.
    files: ['lib/**/*.{ts,tsx}'],
    ignores: [
      'lib/**/*.test.{ts,tsx}',
      'lib/utils/untypedColumns.ts',
      'lib/ai/columns.ts',
      'lib/components/AiAssistant/useSpeechInput.ts',
      'lib/components/DataGrid/DataGrid.tsx',
      'lib/components/DataGrid/GridRoot.tsx',
      'lib/components/DataGrid/GridVirtualRows.tsx',
      'lib/hooks/core/useGridGroupingColumn.ts',
      'lib/hooks/useRowGrouping.ts',
      'lib/utils/export/exportToExcelAdvanced.ts',
      'lib/utils/export/exportToPdf.ts',
      'lib/utils/parsing.ts',
    ],
    rules: {
      'no-restricted-syntax': ['error', {
        selector: "TSAsExpression > TSAsExpression.expression[typeAnnotation.type='TSUnknownKeyword']",
        message: 'No `as unknown as` in lib/: widen columns with untypedColumn(s), narrow with a plain `as`, or type the call (`useHook<R>(...)`). See the R4 note in CLAUDE.md.',
      }],
    },
  },
])
