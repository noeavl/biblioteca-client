import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
            output: {
                // Asegurar que .mjs files tengan el MIME type correcto
                assetFileNames: (assetInfo) => {
                    const fileName = assetInfo.names?.[0] || '';
                    if (fileName.endsWith('.mjs')) {
                        return 'assets/[name]-[hash][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
    },
    // Optimizar manejo de workers
    worker: {
        format: 'es',
    },
});
