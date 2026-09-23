import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        dts({
            include: ['lib'],
            exclude: ['**/*.test.ts', '**/*.test.tsx', 'lib/utils/export/pdf-types.d.ts'],
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
