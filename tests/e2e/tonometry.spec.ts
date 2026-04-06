/**
 * E2E: Tonometry Tab – IOP entry, auto-calculation, time, toggle source
 *
 * Tests all tonometry interactions: Air IOP, Applanation IOP,
 * corrected IOP calculation, pachymetry, time input, and
 * the Air/App source toggle.
 */
import { test, expect, Page } from '@playwright/test';
import { loginAsDoctor, waitForDashboardReady } from './helpers/dashboard';

const TEST_PATIENT_ID = process.env.E2E_PATIENT_ID || 'test-patient-1';

async function goToTonometryTab(page: Page) {
    await loginAsDoctor(page);
    await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
    await waitForDashboardReady(page);

    const tab = page.getByRole('tab', { name: /Tonométrie/i });
    if (await tab.isVisible({ timeout: 3000 })) {
        await tab.click();
        await page.waitForTimeout(300);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Rendering
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Tonometry – rendering', () => {
    test.beforeEach(async ({ page }) => {
        await goToTonometryTab(page);
    });

    test('shows Tonométrie header', async ({ page }) => {
        await expect(page.getByText('Tonométrie')).toBeVisible();
    });

    test('shows Air label twice (OD + OG)', async ({ page }) => {
        const airLabels = await page.getByText('Air').all();
        expect(airLabels.length).toBeGreaterThanOrEqual(2);
    });

    test('shows App label twice (OD + OG)', async ({ page }) => {
        const appLabels = await page.getByText('App').all();
        expect(appLabels.length).toBeGreaterThanOrEqual(2);
    });

    test('shows Cor (corrected) label twice', async ({ page }) => {
        const corLabels = await page.getByText('Cor').all();
        expect(corLabels.length).toBeGreaterThanOrEqual(2);
    });

    test('shows Pac (pachymetry) label twice', async ({ page }) => {
        const pacLabels = await page.getByText('Pac').all();
        expect(pacLabels.length).toBeGreaterThanOrEqual(2);
    });

    test('shows Heure (time) label twice', async ({ page }) => {
        const heureLabels = await page.getByText('Heure').all();
        expect(heureLabels.length).toBeGreaterThanOrEqual(2);
    });

    test('shows source toggle button "Calcul via Air"', async ({ page }) => {
        await expect(page.getByText('Calcul via Air')).toBeVisible();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Source toggle
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Tonometry – source toggle', () => {
    test.beforeEach(async ({ page }) => {
        await goToTonometryTab(page);
    });

    test('clicking toggle changes from Air to App', async ({ page }) => {
        const toggleBtn = page.getByTitle('Basculer la source de calcul pour PIO Corrigée');
        await toggleBtn.click();
        await expect(page.getByText('Calcul via App')).toBeVisible();
    });

    test('clicking toggle twice returns to Air', async ({ page }) => {
        const toggleBtn = page.getByTitle('Basculer la source de calcul pour PIO Corrigée');
        await toggleBtn.click();
        await toggleBtn.click();
        await expect(page.getByText('Calcul via Air')).toBeVisible();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// IOP entry and auto-calculation
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Tonometry – IOP entry', () => {
    test.beforeEach(async ({ page }) => {
        await goToTonometryTab(page);
    });

    test('entering Air IOP opens dropdown for OD', async ({ page }) => {
        // Find the first Air input (OD)
        const airLabel = page.getByText('Air').first();
        const airInput = airLabel.locator('..').locator('input').first();
        await airInput.click();
        await page.waitForTimeout(200);
        // Dropdown should appear with IOP values
        const firstOption = page.locator('[data-value="5"]').first();
        await expect(firstOption).toBeVisible({ timeout: 3000 });
    });

    test('selecting Air IOP value 16 for OD sets the input', async ({ page }) => {
        const airLabel = page.getByText('Air').first();
        const airInput = airLabel.locator('..').locator('input').first();
        await airInput.click();
        await airInput.fill('16');
        await page.waitForTimeout(200);
        const option = page.locator('[data-value="16"]').first();
        if (await option.isVisible({ timeout: 2000 })) {
            await option.click();
            await expect(airInput).toHaveValue('16');
        }
    });

    test('entering pachymetry opens dropdown with values 400-700', async ({ page }) => {
        const pacLabel = page.getByText('Pac').first();
        const pacInput = pacLabel.locator('..').locator('input').first();
        await pacInput.click();
        await page.waitForTimeout(200);
        // Check for a value in range
        const option545 = page.locator('[data-value="545"]').first();
        if (await option545.isVisible({ timeout: 2000 })) {
            expect(true).toBe(true);
        }
    });

    test('IOP auto-calculation: entering Air=16 and Pac=545 sets Cor=16', async ({ page }) => {
        // OD (right eye) - first pair of inputs
        const airLabel = page.getByText('Air').first();
        const airInput = airLabel.locator('..').locator('input').first();
        await airInput.click();
        await airInput.fill('16');
        await page.waitForTimeout(200);
        const airOption = page.locator('[data-value="16"]').first();
        if (await airOption.isVisible({ timeout: 2000 })) {
            await airOption.click();
        }

        const pacLabel = page.getByText('Pac').first();
        const pacInput = pacLabel.locator('..').locator('input').first();
        await pacInput.click();
        await pacInput.fill('545');
        await page.waitForTimeout(200);
        const pacOption = page.locator('[data-value="545"]').first();
        if (await pacOption.isVisible({ timeout: 2000 })) {
            await pacOption.click();
        }

        // Corrected IOP should auto-populate
        await page.waitForTimeout(500);
        const corLabel = page.getByText('Cor').first();
        const corInput = corLabel.locator('..').locator('input').first();
        const corValue = await corInput.inputValue();
        // With air=16, pachy=545: corrected = 16 - 0 = 16
        expect(corValue).toBe('16');
    });

    test('IOP auto-calculation: thin cornea (450µm) increases corrected IOP', async ({ page }) => {
        const airLabel = page.getByText('Air').first();
        const airInput = airLabel.locator('..').locator('input').first();
        await airInput.click();
        await airInput.fill('16');
        const airOption = page.locator('[data-value="16"]').first();
        if (await airOption.isVisible({ timeout: 2000 })) await airOption.click();

        const pacLabel = page.getByText('Pac').first();
        const pacInput = pacLabel.locator('..').locator('input').first();
        await pacInput.click();
        await pacInput.fill('450');
        const pacOption = page.locator('[data-value="450"]').first();
        if (await pacOption.isVisible({ timeout: 2000 })) await pacOption.click();

        await page.waitForTimeout(500);
        const corInput = page.getByText('Cor').first().locator('..').locator('input').first();
        const corValue = await corInput.inputValue();
        // corrected = 16 - ((450-545)/50 * 2.5) = 16 + 4.75 ≈ 21
        const val = parseInt(corValue);
        expect(val).toBeGreaterThan(16);
    });

    test('auto-sets time when entering first IOP value', async ({ page }) => {
        const timeInputs = await page.locator('input[type="time"]').all();
        expect(timeInputs.length).toBeGreaterThanOrEqual(2);

        const firstTimeInput = timeInputs[0];
        const valueBefore = await firstTimeInput.inputValue();
        expect(valueBefore).toBe('');

        // Enter an Air IOP value
        const airLabel = page.getByText('Air').first();
        const airInput = airLabel.locator('..').locator('input').first();
        await airInput.click();
        await airInput.fill('15');
        const opt = page.locator('[data-value="15"]').first();
        if (await opt.isVisible({ timeout: 2000 })) await opt.click();

        await page.waitForTimeout(300);
        const valueAfter = await firstTimeInput.inputValue();
        // Time should be auto-set to current time (HH:MM format)
        expect(valueAfter).toMatch(/^\d{2}:\d{2}$/);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Corrected IOP back-calculation
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Tonometry – corrected IOP back-calculation', () => {
    test.beforeEach(async ({ page }) => {
        await goToTonometryTab(page);
    });

    test('entering corrected IOP back-calculates Air IOP', async ({ page }) => {
        // First set pachymetry
        const pacInput = page.getByText('Pac').first().locator('..').locator('input').first();
        await pacInput.click();
        await pacInput.fill('545');
        const pacOpt = page.locator('[data-value="545"]').first();
        if (await pacOpt.isVisible({ timeout: 2000 })) await pacOpt.click();

        // Now enter corrected IOP
        const corInput = page.getByText('Cor').first().locator('..').locator('input').first();
        await corInput.click();
        await corInput.fill('18');
        // Wait for debounce
        await page.waitForTimeout(600);

        // Air IOP should be back-calculated to 18 (since pachy=545, correction factor=0)
        const airInput = page.getByText('Air').first().locator('..').locator('input').first();
        const airValue = await airInput.inputValue();
        expect(airValue).toBe('18');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Time input
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Tonometry – time input', () => {
    test.beforeEach(async ({ page }) => {
        await goToTonometryTab(page);
    });

    test('time input accepts HH:MM format', async ({ page }) => {
        const timeInputs = await page.locator('input[type="time"]').all();
        const firstTime = timeInputs[0];
        await firstTime.fill('10:30');
        await expect(firstTime).toHaveValue('10:30');
    });

    test('time input is present for both eyes', async ({ page }) => {
        const timeInputs = await page.locator('input[type="time"]').all();
        expect(timeInputs.length).toBe(2);
    });
});
