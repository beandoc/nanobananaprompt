import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/tests/setup.ts',
        // Ignore macOS AppleDouble resource-fork files (._*.test.ts), which are
        // binary and would otherwise be collected as (failing) test suites.
        exclude: ['**/node_modules/**', '**/dist/**', '**/._*'],
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
