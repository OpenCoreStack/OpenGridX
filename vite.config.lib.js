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
            external: ['react', 'react-dom', 'exceljs', 'jspdf', 'jspdf-autotable'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
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
