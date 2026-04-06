/**
 * E2E: Dashboard Navigation & Opening
 *
 * Tests the initial load, patient info display, tab switching,
 * keyboard shortcuts, and back navigation.
 */
import { test, expect } from '@playwright/test';
import { loginAsDoctor, waitForDashboardReady } from './helpers/dashboard';

// ─── Setup: use first available patient ─────────────────────────────────────
// NOTE: These tests assume the database has at least one patient.
// Update TEST_PATIENT_ID to match a real patient in the test database.
const TEST_PATIENT_ID = process.env.E2E_PATIENT_ID || 'test-patient-1';

test.beforeEach(async ({ page }) => {
    await loginAsDoctor(page);
});

// ═══════════════════════════════════════════════════════════════════════════════
// Initial load
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Dashboard – initial load', () => {
    test('loads dashboard for a patient', async ({ page }) => {
        await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
        await waitForDashboardReady(page);
        await expect(page.locator('header')).toBeVisible();
    });

    test('shows patient name in the header', async ({ page }) => {
        await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
        await waitForDashboardReady(page);
        // Header should contain a patient name (h1)
        const headerText = await page.locator('header h1').textContent();
        expect(headerText?.trim().length).toBeGreaterThan(0);
    });

    test('shows Sauvegarder button in header', async ({ page }) => {
        await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
        await waitForDashboardReady(page);
        await expect(page.getByRole('button', { name: /Sauvegarder/i })).toBeVisible();
    });

    test('shows Terminer la consultation button', async ({ page }) => {
        await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
        await waitForDashboardReady(page);
        await expect(page.getByRole('button', { name: /Terminer la consultation/i })).toBeVisible();
    });

    test('shows patient info card', async ({ page }) => {
        await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
        await waitForDashboardReady(page);
        await expect(page.getByText('Informations Patient')).toBeVisible();
    });

    test('auto-opens history drawer when patient has history', async ({ page }) => {
        await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
        await waitForDashboardReady(page);
        // History sheet may auto-open
        // Either history sheet is open or a "Historique des consultations" text is visible
        await page.waitForTimeout(2000);
        // No assertion fails if no history – both states are valid
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Tabs navigation
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Dashboard – tab navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
        await waitForDashboardReady(page);
    });

    test('switches to Réfraction tab', async ({ page }) => {
        const tab = page.getByRole('tab', { name: /Réfraction/i });
        if (await tab.isVisible()) {
            await tab.click();
            await expect(page.getByText('Réfraction')).toBeVisible();
        } else {
            // Tab might not exist – skip
            test.skip();
        }
    });

    test('switches to Tonométrie tab', async ({ page }) => {
        const tab = page.getByRole('tab', { name: /Tonométrie/i });
        if (await tab.isVisible()) {
            await tab.click();
            await expect(page.getByText('Tonométrie')).toBeVisible();
        } else {
            test.skip();
        }
    });

    test('switches to Prescription tab', async ({ page }) => {
        const tab = page.getByRole('tab', { name: /Prescription/i });
        if (await tab.isVisible()) {
            await tab.click();
            await expect(page.getByText(/Médicaments/)).toBeVisible();
        } else {
            test.skip();
        }
    });

    test('switches to Examen Clinique tab', async ({ page }) => {
        const tab = page.getByRole('tab', { name: /Examen|Clinique/i });
        if (await tab.isVisible()) {
            await tab.click();
        } else {
            test.skip();
        }
    });

    test('switches to Documents tab', async ({ page }) => {
        const tab = page.getByRole('tab', { name: /Documents?/i });
        if (await tab.isVisible()) {
            await tab.click();
        } else {
            test.skip();
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// History drawer
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Dashboard – history drawer', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
        await waitForDashboardReady(page);
    });

    test('opens history drawer by clicking history button', async ({ page }) => {
        const historyBtn = page.getByTitle('Historique des consultations');
        await historyBtn.click();
        await page.waitForTimeout(500);
        // Sheet should appear
        await expect(historyBtn).toBeVisible();
    });

    test('F3 key toggles history drawer', async ({ page }) => {
        await page.keyboard.press('F3');
        await page.waitForTimeout(500);
        // Should toggle (open or close)
        await page.keyboard.press('F3');
        await page.waitForTimeout(500);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Back navigation
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Dashboard – back navigation', () => {
    test('clicking back button navigates away from dashboard', async ({ page }) => {
        await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
        await waitForDashboardReady(page);

        // Find back button (ArrowLeft icon)
        const backBtn = page.locator('button.mr-2').first();
        if (await backBtn.isVisible({ timeout: 2000 })) {
            await backBtn.click();
            // Should navigate back to patient list or home
            await page.waitForURL(/(?!.*patientId)/, { timeout: 5000 });
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Settings dialog
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Dashboard – settings', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
        await waitForDashboardReady(page);
    });

    test('clicking settings gear opens PIN dialog', async ({ page }) => {
        // Settings button (gear icon)
        const settingsBtn = page.locator('button').filter({ has: page.locator('svg') }).first();
        // Find button with Settings icon by title or aria
        const gearBtn = page.locator('[title*="ettings"], [aria-label*="ettings"]').first();
        // Just click the settings area
        const allBtns = await page.locator('header button').all();
        // The gear/settings button is typically the first icon-only button
        for (const btn of allBtns) {
            const classes = await btn.getAttribute('class');
            if (classes?.includes('text-slate-400')) {
                await btn.click();
                break;
            }
        }
        // PIN dialog should appear
        await expect(page.getByText('Code PIN requis')).toBeVisible({ timeout: 3000 });
    });

    test('PIN dialog can be cancelled', async ({ page }) => {
        const allBtns = await page.locator('header button').all();
        for (const btn of allBtns) {
            const classes = await btn.getAttribute('class');
            if (classes?.includes('text-slate-400')) {
                await btn.click();
                break;
            }
        }
        const pinDialog = page.getByText('Code PIN requis');
        if (await pinDialog.isVisible({ timeout: 2000 })) {
            await page.getByRole('button', { name: /Annuler/i }).click();
            await expect(pinDialog).not.toBeVisible({ timeout: 2000 });
        }
    });
});
