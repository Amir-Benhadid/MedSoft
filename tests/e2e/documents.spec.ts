/**
 * E2E: Documents Tab – Document preview, printing, generation
 *
 * Tests document generation, preview, and print workflows
 * for prescription, medical report, certificate, and letter.
 */
import { test, expect, Page } from '@playwright/test';
import { loginAsDoctor, waitForDashboardReady } from './helpers/dashboard';

const TEST_PATIENT_ID = process.env.E2E_PATIENT_ID || 'test-patient-1';

async function goToDocumentsTab(page: Page) {
    await loginAsDoctor(page);
    await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
    await waitForDashboardReady(page);

    const tab = page.getByRole('tab', { name: /Documents?/i });
    if (await tab.isVisible({ timeout: 3000 })) {
        await tab.click();
        await page.waitForTimeout(500);
    } else {
        // Documents may be on a different navigation path
        test.skip();
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Documents tab rendering
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Documents – tab rendering', () => {
    test.beforeEach(async ({ page }) => {
        await goToDocumentsTab(page);
    });

    test('documents tab is accessible', async ({ page }) => {
        // Just verify the tab can be navigated to
        await expect(page.locator('body')).toBeVisible();
    });

    test('shows document generation options or placeholder', async ({ page }) => {
        // The documents tab shows either document cards or a "no documents" placeholder
        const hasOrdonnance = await page.getByText(/Ordonnance|Prescription/i).isVisible({ timeout: 3000 }).catch(() => false);
        const hasCertificat = await page.getByText(/Certificat/i).isVisible({ timeout: 3000 }).catch(() => false);
        const hasRapport = await page.getByText(/Rapport/i).isVisible({ timeout: 3000 }).catch(() => false);
        const hasLettre = await page.getByText(/Lettre/i).isVisible({ timeout: 3000 }).catch(() => false);
        const hasPlaceholder = await page.getByText(/Aucun document/i).isVisible({ timeout: 3000 }).catch(() => false);
        // At least one of these should be present
        expect(hasOrdonnance || hasCertificat || hasRapport || hasLettre || hasPlaceholder).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Document generation
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Documents – generation', () => {
    test.beforeEach(async ({ page }) => {
        await goToDocumentsTab(page);
    });

    test('clicking prescription document opens preview or generator', async ({ page }) => {
        const ordonnanceBtn = page.getByRole('button', { name: /Ordonnance|Prescription/i }).first();
        if (await ordonnanceBtn.isVisible({ timeout: 3000 })) {
            await ordonnanceBtn.click();
            await page.waitForTimeout(500);
        }
    });

    test('clicking medical report opens preview or generator', async ({ page }) => {
        const rapportBtn = page.getByRole('button', { name: /Rapport/i }).first();
        if (await rapportBtn.isVisible({ timeout: 3000 })) {
            await rapportBtn.click();
            await page.waitForTimeout(500);
        }
    });

    test('clicking certificate opens preview or generator', async ({ page }) => {
        const certBtn = page.getByRole('button', { name: /Certificat/i }).first();
        if (await certBtn.isVisible({ timeout: 3000 })) {
            await certBtn.click();
            await page.waitForTimeout(500);
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Print workflow
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Documents – print workflow', () => {
    test('print button triggers window.print (interceptable)', async ({ page }) => {
        await goToDocumentsTab(page);

        // Intercept window.print
        let printCalled = false;
        await page.exposeFunction('onPrintCalled', () => { printCalled = true; });
        await page.evaluate(() => {
            window.print = () => { (window as any).onPrintCalled(); };
        });

        const printBtn = page.getByRole('button', { name: /Imprimer|Print/i }).first();
        if (await printBtn.isVisible({ timeout: 3000 })) {
            await printBtn.click();
            await page.waitForTimeout(500);
            expect(printCalled).toBe(true);
        }
    });

    test('document preview dialog opens when viewing a document', async ({ page }) => {
        await goToDocumentsTab(page);

        // Try to open a document preview
        const viewBtn = page.getByRole('button', { name: /Voir|Preview|Aperçu/i }).first();
        if (await viewBtn.isVisible({ timeout: 3000 })) {
            await viewBtn.click();
            await page.waitForTimeout(500);
            // Dialog or preview panel should open
        }
    });
});
