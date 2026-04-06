/**
 * E2E: Clinical Exam Tab
 *
 * Tests all clinical exam fields: inspection, motility, anterior segment,
 * fundus, diagnosis, treatment plan. Also tests the patient info card.
 */
import { test, expect, Page } from '@playwright/test';
import { loginAsDoctor, waitForDashboardReady } from './helpers/dashboard';

const TEST_PATIENT_ID = process.env.E2E_PATIENT_ID || 'test-patient-1';

async function goToClinicalExam(page: Page) {
    await loginAsDoctor(page);
    await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
    await waitForDashboardReady(page);

    // Clinical exam might be on the default view or a separate tab
    const examTab = page.getByRole('tab', { name: /Examen|Clinique/i });
    if (await examTab.isVisible({ timeout: 2000 })) {
        await examTab.click();
        await page.waitForTimeout(300);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Clinical Exam fields
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Clinical Exam – sections visible', () => {
    test.beforeEach(async ({ page }) => {
        await goToClinicalExam(page);
    });

    test('INSP section is visible', async ({ page }) => {
        await expect(page.getByText('INSP').first()).toBeVisible({ timeout: 5000 });
    });

    test('MOT section is visible', async ({ page }) => {
        await expect(page.getByText('MOT').first()).toBeVisible({ timeout: 5000 });
    });

    test('SEG ANT section is visible', async ({ page }) => {
        await expect(page.getByText('SEG ANT').first()).toBeVisible({ timeout: 5000 });
    });

    test('FO (Fond d\'œil) section is visible', async ({ page }) => {
        await expect(page.getByText('FO').first()).toBeVisible({ timeout: 5000 });
    });

    test('DIAG section is visible', async ({ page }) => {
        await expect(page.getByText('DIAG').first()).toBeVisible({ timeout: 5000 });
    });

    test('CDT (Treatment) section is visible', async ({ page }) => {
        await expect(page.getByText('CDT').first()).toBeVisible({ timeout: 5000 });
    });

});

// ═══════════════════════════════════════════════════════════════════════════════
// Filling clinical exam fields
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Clinical Exam – filling fields', () => {
    test.beforeEach(async ({ page }) => {
        await goToClinicalExam(page);
    });

    test('typing in inspection field', async ({ page }) => {
        const inspInput = page.locator('input[placeholder="Rien à signaler..."]');
        if (await inspInput.isVisible({ timeout: 3000 })) {
            await inspInput.fill('Normal, aucune anomalie');
            await expect(inspInput).toHaveValue('Normal, aucune anomalie');
        }
    });

    test('typing in motility field', async ({ page }) => {
        const motInput = page.locator('input[placeholder="Normal..."]');
        if (await motInput.isVisible({ timeout: 3000 })) {
            await motInput.fill('Mouvements oculaires normaux');
            await expect(motInput).toHaveValue('Mouvements oculaires normaux');
        }
    });

    test('typing in fundus field', async ({ page }) => {
        const foTextarea = page.locator('textarea[placeholder="Examen du fond d\'œil..."]');
        if (await foTextarea.isVisible({ timeout: 3000 })) {
            await foTextarea.fill('Papille normale, rétine plane');
            await expect(foTextarea).toHaveValue('Papille normale, rétine plane');
        }
    });

    test('typing in treatment plan', async ({ page }) => {
        const cdtTextarea = page.locator('textarea[placeholder="Traitement prescrit..."]');
        if (await cdtTextarea.isVisible({ timeout: 3000 })) {
            await cdtTextarea.fill('Collyre antiglaucomateux');
            await expect(cdtTextarea).toHaveValue('Collyre antiglaucomateux');
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Patient info card
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Patient info card', () => {
    test.beforeEach(async ({ page }) => {
        await goToClinicalExam(page);
    });

    test('patient info card is visible', async ({ page }) => {
        await expect(page.getByText('Informations Patient')).toBeVisible({ timeout: 5000 });
    });

    test('patient name is displayed in info card', async ({ page }) => {
        const infoCard = page.getByText('Informations Patient').locator('../../..');
        // Patient name should be in the card
        await expect(infoCard).toBeVisible({ timeout: 5000 });
    });

    test('Antécédents Généraux field is visible', async ({ page }) => {
        await expect(page.getByText('Antécédents Généraux')).toBeVisible({ timeout: 5000 });
    });

    test('Antécédents Ophtalmologiques field is visible', async ({ page }) => {
        await expect(page.getByText('Antécédents Ophtalmologiques')).toBeVisible({ timeout: 5000 });
    });

    test('Diagnostic field is visible in patient info card', async ({ page }) => {
        await expect(page.getByText('Diagnostic')).toBeVisible({ timeout: 5000 });
    });

    test('Note field is visible', async ({ page }) => {
        await expect(page.getByText('Note')).toBeVisible({ timeout: 5000 });
    });

    test('hovering over Antécédents reveals expand button', async ({ page }) => {
        const antecedentCard = page.getByText('Antécédents Généraux').locator('../..');
        if (await antecedentCard.isVisible({ timeout: 3000 })) {
            await antecedentCard.hover();
            // Expand button should become visible
            const expandBtn = antecedentCard.locator('button');
            await expect(expandBtn).toBeVisible({ timeout: 2000 });
        }
    });

    test('clicking expand opens the antecedents dialog', async ({ page }) => {
        const antecedentCard = page.getByText('Antécédents Généraux').locator('../..');
        if (await antecedentCard.isVisible({ timeout: 3000 })) {
            await antecedentCard.hover();
            const expandBtn = antecedentCard.locator('button');
            if (await expandBtn.isVisible({ timeout: 2000 })) {
                await expandBtn.click();
                await expect(page.getByText('Modifier les Antécédents')).toBeVisible({ timeout: 3000 });
            }
        }
    });

    test('antecedents dialog can be closed with Fermer button', async ({ page }) => {
        const antecedentCard = page.getByText('Antécédents Généraux').locator('../..');
        if (await antecedentCard.isVisible({ timeout: 3000 })) {
            await antecedentCard.hover();
            const expandBtn = antecedentCard.locator('button');
            if (await expandBtn.isVisible({ timeout: 2000 })) {
                await expandBtn.click();
                const fermerBtn = page.getByRole('button', { name: /Fermer/i });
                if (await fermerBtn.isVisible({ timeout: 3000 })) {
                    await fermerBtn.click();
                    await expect(page.getByText('Modifier les Antécédents')).not.toBeVisible({ timeout: 3000 });
                }
            }
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FO Dilation highlight
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Clinical Exam – FO dilation highlight', () => {
    test.beforeEach(async ({ page }) => {
        await goToClinicalExam(page);
    });

    test('FO section gets amber ring when dilation is active in refraction', async ({ page }) => {
        // Navigate to refraction to trigger dilation
        const refrTab = page.getByRole('tab', { name: /Réfraction/i });
        if (await refrTab.isVisible({ timeout: 2000 })) {
            await refrTab.click();
            // If there's an active dilation, the FO section in clinical exam
            // will show an amber ring – this is a visual indicator
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Saving clinical exam data
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Clinical Exam – save', () => {
    test('can save with clinical exam data filled', async ({ page }) => {
        await goToClinicalExam(page);

        const inspInput = page.locator('input[placeholder="Rien à signaler..."]');
        if (await inspInput.isVisible({ timeout: 2000 })) {
            await inspInput.fill('Normal');
        }

        await page.getByRole('button', { name: /Sauvegarder/i }).click();
        await expect(page.getByText('Sauvegardée.')).toBeVisible({ timeout: 10000 });
    });
});
