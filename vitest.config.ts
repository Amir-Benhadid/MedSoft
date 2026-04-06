import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/tests/setup.ts'],
        include: ['src/tests/unit/**/*.test.{ts,tsx}'],
        exclude: ['node_modules', 'dist', 'tests/e2e'],
        coverage: {
            reporter: ['text', 'html'],
            include: ['src/ui/**/*.{ts,tsx}'],
            exclude: ['src/ui/**/*.d.ts', 'src/ui/routeTree.gen.ts'],
        },
    },
    resolve: {
        alias: {
            '@': resolve(process.cwd(), './src'),
        },
    },
});
