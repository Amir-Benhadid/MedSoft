import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration.
 *
 * Targets the Vite dev server running the UI (port 3001).
 * Run: pnpm test:e2e
 *
 * Prerequisites: The UI dev server must be running (`pnpm dev:ui`).
 */
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false, // Sequential for consistent state
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['list'],
    ],
    use: {
        baseURL: 'http://127.0.0.1:3001',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry',
        // French locale for date pickers etc.
        locale: 'fr-FR',
        timezoneId: 'Africa/Algiers',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    // Optional: auto-start dev server before tests
    // webServer: {
    //   command: 'pnpm dev:ui',
    //   url: 'http://127.0.0.1:3001',
    //   reuseExistingServer: true,
    //   timeout: 120 * 1000,
    // },
});
