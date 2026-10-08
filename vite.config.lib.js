import { defineConfig, transformWithEsbuild } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { existsSync, renameSync } from 'fs'
import dts from 'vite-plugin-dts'

const DTS_EXCLUDE = ['**/*.test.ts', '**/*.test.tsx', 'lib/utils/export/pdf-types.d.ts']

// The `ai` entry point (@opencorestack/opengridx/ai) is a second build of this config:
// `vite build --config vite.config.lib.js --mode ai`. A UMD build takes a single entry, so the core
// (es + umd) and ai (es + cjs) bundles cannot share one Rollup run. The ai build has no React plugin,
// keeps the core's dist/ files and writes dist/ai.es.js, dist/ai.cjs and dist/ai.d.ts.
const CORE_TYPES = resolve(__dirname, 'dist/index.d.ts')
const CORE_TYPES_ASIDE = resolve(__dirname, 'dist/index.d.ts.core')
const AI_TYPES = resolve(__dirname, 'dist/ai.d.ts')

const aiConfig = defineConfig({
    plugins: [
        {
            name: 'ogx-keep-core-types',
            buildStart() {
                if (existsSync(CORE_TYPES)) renameSync(CORE_TYPES, CORE_TYPES_ASIDE)
            },
        },
        // Vite keeps whitespace in ES library output, which costs the size budget check-bundle
        // enforces on dist/ai.es.js. The finished chunks are minified once more (maps are chained).
        {
            name: 'ogx-minify-ai',
            async generateBundle(_options, bundle) {
                for (const chunk of Object.values(bundle)) {
                    if (chunk.type !== 'chunk') continue;
                    const result = await transformWithEsbuild(chunk.code, chunk.fileName, { minify: true, sourcemap: true }, chunk.map ?? undefined);
                    chunk.code = result.code;
                    chunk.map = result.map;
                }
            },
        },
        dts({
            include: ['lib/ai', 'lib/types', 'lib/utils/values.ts', 'lib/utils/filtering', 'lib/vite-env.d.ts'],
            exclude: DTS_EXCLUDE,
            outDir: 'dist',
            entryRoot: 'lib',
            // The plugin rolls a single entry up into package.json's `types` path, dist/index.d.ts,
            // which the core build already wrote. The core's file is set aside first (see
            // keepCoreTypes) and the ai types are moved to dist/ai.d.ts afterwards.
            rollupTypes: true,
            afterBuild: () => {
                renameSync(CORE_TYPES, AI_TYPES)
                if (existsSync(CORE_TYPES_ASIDE)) renameSync(CORE_TYPES_ASIDE, CORE_TYPES)
            },
        })
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/ai/index.ts'),
            formats: ['es', 'cjs'],
            // `.cjs`, not `.cjs.js`: the package is "type": "module", so Node reads any .js file in it as ESM.
            fileName: (format) => (format === 'cjs' ? 'ai.cjs' : 'ai.es.js')
        },
        sourcemap: true,
        emptyOutDir: false
    }
})

// https://vite.dev/config/
const coreConfig = defineConfig({
    plugins: [
        react(),
        dts({
            include: ['lib'],
            exclude: [...DTS_EXCLUDE, 'lib/ai'],
            outDir: 'dist',
            rollupTypes: true
        })
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/index.ts'),
            name: 'OpenGridX',
            formats: ['es', 'umd'],
            fileName: (format) => `opengridx.${format}.js`
        },
        rollupOptions: {
            // Externalise every react / react-dom entry point, including react/jsx-runtime.
            // Bundling the JSX runtime pins the consumer to the React version it was built
            // with: React 19's runtime creates elements React 18 refuses to render.
            external: [/^react($|\/)/, /^react-dom($|\/)/, 'exceljs', 'jspdf', 'jspdf-autotable'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'ReactJSXRuntime',
                    exceljs: 'ExcelJS',
                    'jspdf': 'jsPDF',
                    'jspdf-autotable': 'jspdfAutotable',
                }
            }
        },
        sourcemap: true,
        emptyOutDir: true
    }
})

export default defineConfig(({ mode }) => (mode === 'ai' ? aiConfig : coreConfig))
