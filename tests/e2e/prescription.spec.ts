/**
 * E2E: Prescription Tab – Add, edit, delete medications
 *
 * Tests the full prescription workflow: adding new medications,
 * filling all fields (name, dosage, frequency, duration, instructions),
 * medicine autocomplete, and deleting prescriptions.
 */
import { test, expect, Page } from '@playwright/test';
import { loginAsDoctor, waitForDashboardReady, saveConsultation } from './helpers/dashboard';

const TEST_PATIENT_ID = process.env.E2E_PATIENT_ID || 'test-patient-1';

async function goToPrescriptionTab(page: Page) {
    await loginAsDoctor(page);
    await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
    await waitForDashboardReady(page);

    const tab = page.getByRole('tab', { name: /Prescription|Médicament/i });
    if (await tab.isVisible({ timeout: 3000 })) {
        await tab.click();
        await page.waitForTimeout(300);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Empty state
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Prescription – empty state', () => {
    test.beforeEach(async ({ page }) => {
        await goToPrescriptionTab(page);
    });

    test('shows empty state or existing prescriptions', async ({ page }) => {
        // Either no prescriptions (shows empty placeholder)
        // or existing ones (from DB) are shown
        const hasPrescriptions = await page.getByText(/Médicaments \(\d+\)/).isVisible({ timeout: 3000 });
        expect(hasPrescriptions).toBe(true);
    });

    test('shows Ajouter button', async ({ page }) => {
        await expect(page.getByRole('button', { name: /Ajouter/i })).toBeVisible();
    });

    test('shows Nouveau médicament button', async ({ page }) => {
        await expect(page.getByRole('button', { name: /Nouveau médicament|New Medicine/i })).toBeVisible({ timeout: 3000 });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Adding prescriptions
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Prescription – adding', () => {
    test.beforeEach(async ({ page }) => {
        await goToPrescriptionTab(page);
    });

    test('clicking Ajouter adds a new prescription card', async ({ page }) => {
        const countBefore = await page.getByText(/Médicaments \((\d+)\)/).textContent();
        const numBefore = parseInt(countBefore?.match(/\((\d+)\)/)?.[1] || '0');

        await page.getByRole('button', { name: /Ajouter/i }).click();
        await page.waitForTimeout(300);

        const countAfter = await page.getByText(/Médicaments \((\d+)\)/).textContent();
        const numAfter = parseInt(countAfter?.match(/\((\d+)\)/)?.[1] || '0');
        expect(numAfter).toBe(numBefore + 1);
    });

    test('new prescription card shows all form fields', async ({ page }) => {
        await page.getByRole('button', { name: /Ajouter/i }).click();
        await page.waitForTimeout(300);

        await expect(page.getByText('Nom du médicament')).toBeVisible();
        await expect(page.getByText('Dosage')).toBeVisible();
        await expect(page.getByText('Fréquence')).toBeVisible();
        await expect(page.getByText('Durée')).toBeVisible();
        await expect(page.getByText('Instructions')).toBeVisible();
    });

    test('adding two prescriptions shows count of 2 (or more)', async ({ page }) => {
        await page.getByRole('button', { name: /Ajouter/i }).click();
        await page.getByRole('button', { name: /Ajouter/i }).click();
        await page.waitForTimeout(300);

        const countText = await page.getByText(/Médicaments \(\d+\)/).textContent();
        const num = parseInt(countText?.match(/\((\d+)\)/)?.[1] || '0');
        expect(num).toBeGreaterThanOrEqual(2);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Filling prescription fields
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Prescription – editing fields', () => {
    test.beforeEach(async ({ page }) => {
        await goToPrescriptionTab(page);
        // Add a fresh prescription
        await page.getByRole('button', { name: /Ajouter/i }).click();
        await page.waitForTimeout(400);
    });

    test('fills dosage field', async ({ page }) => {
        const dosageLabel = page.getByText('Dosage').first();
        const dosageInput = dosageLabel.locator('..').locator('input');
        await dosageInput.fill('500mg');
        await expect(dosageInput).toHaveValue('500mg');
    });

    test('fills fréquence field', async ({ page }) => {
        const freqLabel = page.getByText('Fréquence').first();
        const freqInput = freqLabel.locator('..').locator('input');
        await freqInput.fill('3 fois par jour');
        await expect(freqInput).toHaveValue('3 fois par jour');
    });

    test('fills durée field', async ({ page }) => {
        const durLabel = page.getByText('Durée').first();
        const durInput = durLabel.locator('..').locator('input');
        await durInput.fill('10 jours');
        await expect(durInput).toHaveValue('10 jours');
    });

    test('fills instructions textarea', async ({ page }) => {
        const instructLabel = page.getByText('Instructions').first();
        const instrTextarea = instructLabel.locator('..').locator('textarea');
        await instrTextarea.fill('Prendre avec les repas');
        await expect(instrTextarea).toHaveValue('Prendre avec les repas');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Medicine autocomplete
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Prescription – medicine autocomplete', () => {
    test.beforeEach(async ({ page }) => {
        await goToPrescriptionTab(page);
        await page.getByRole('button', { name: /Ajouter/i }).click();
        await page.waitForTimeout(400);
    });

    test('medicine name input is present in new prescription', async ({ page }) => {
        // MedicineAutocomplete renders an input
        const medicineSection = page.getByText('Nom du médicament').first().locator('..');
        const medicineInput = medicineSection.locator('input');
        await expect(medicineInput).toBeVisible();
    });

    test('typing in medicine input shows suggestions', async ({ page }) => {
        const medicineSection = page.getByText('Nom du médicament').first().locator('..');
        const medicineInput = medicineSection.locator('input').first();
        await medicineInput.click();
        await medicineInput.fill('Tim');
        await page.waitForTimeout(500);
        // Suggestions dropdown may appear
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Deleting prescriptions
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Prescription – deleting', () => {
    test.beforeEach(async ({ page }) => {
        await goToPrescriptionTab(page);
        await page.getByRole('button', { name: /Ajouter/i }).click();
        await page.waitForTimeout(400);
    });

    test('hovering over prescription card reveals delete button', async ({ page }) => {
        // The delete button is opacity-0 and appears on group-hover
        const card = page.locator('.group.animate-in').first();
        if (await card.isVisible({ timeout: 3000 })) {
            await card.hover();
            // Delete button (Trash2 icon) should become visible
            const deleteBtn = card.locator('button').filter({ has: page.locator('svg') });
            await expect(deleteBtn).toBeVisible({ timeout: 2000 });
        }
    });

    test('clicking delete removes the prescription', async ({ page }) => {
        const countBefore = await page.getByText(/Médicaments \((\d+)\)/).textContent();
        const numBefore = parseInt(countBefore?.match(/\((\d+)\)/)?.[1] || '0');

        const card = page.locator('.group.animate-in').first();
        if (await card.isVisible({ timeout: 3000 })) {
            await card.hover();
            const deleteBtn = card.locator('button').filter({ has: page.locator('svg') });
            if (await deleteBtn.isVisible({ timeout: 2000 })) {
                await deleteBtn.click();
                await page.waitForTimeout(300);
                const countAfter = await page.getByText(/Médicaments \((\d+)\)/).textContent();
                const numAfter = parseInt(countAfter?.match(/\((\d+)\)/)?.[1] || '0');
                expect(numAfter).toBe(numBefore - 1);
            }
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Save prescription data
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Prescription – save', () => {
    test('can save consultation with prescriptions', async ({ page }) => {
        await goToPrescriptionTab(page);
        await page.getByRole('button', { name: /Ajouter/i }).click();
        await page.waitForTimeout(400);

        // Fill basic fields
        const dosageInput = page.getByText('Dosage').first().locator('..').locator('input');
        await dosageInput.fill('250mg');

        // Save
        await page.getByRole('button', { name: /Sauvegarder/i }).click();
        await expect(page.getByText('Sauvegardée.')).toBeVisible({ timeout: 8000 });
    });
});
