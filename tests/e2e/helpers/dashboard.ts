/**
 * Shared E2E helpers for Doctor Dashboard tests.
 *
 * Provides utilities for navigating to the dashboard,
 * filling common fields, and asserting UI state.
 */
import { Page, expect } from '@playwright/test';

// ─── Navigation ──────────────────────────────────────────────────────────────

/**
 * Navigate to the doctor dashboard for a given patient.
 * Assumes the app is already logged in as a doctor.
 */
export async function navigateToDashboard(
    page: Page,
    patientId: string,
    options: { mode?: 'normal' | 'radiography'; consultationId?: string } = {}
) {
    await mockElectron(page);
    const params = new URLSearchParams({ patientId });
    params.set('window', 'main');
    if (options.mode) params.set('mode', options.mode);

    if (options.consultationId) params.set('consultationId', options.consultationId);

    await page.goto(`/doctor?${params.toString()}`);
    // Wait for the dashboard to load (patient name visible)
    await page.waitForSelector('header h1', { timeout: 15000 });
}

/**
 * Mock the Electron API for tests running in the browser.
 * This prevents the setup wizard from showing by simulating isSetup: true.
 */
export async function mockElectron(page: Page) {
    await page.addInitScript(() => {
        (window as any).electronAPI = {
            test: () => 'Cabinet Medical API is working!',
            getVersion: async () => '1.0.0-test',
            getName: async () => 'MedSoft Test',
            isElectron: () => true,
            platform: 'win32',
            checkSetup: async () => ({
                isSetup: true,
                config: {
                    businessName: 'Cabinet Médical Test',
                    appMode: 'both',
                    serverMode: 'host',
                    dbPath: 'C:\\Users\\amirb\\OneDrive\\Documents\\test'
                }
            }),
            saveSetup: async () => true,
            launchMainWindow: () => {
                // In the browser, we simulate the 'launch' by navigating to main mode
                const url = new URL(window.location.href);
                url.searchParams.set('window', 'main');
                window.location.href = url.toString();
            },
            invoke: async (channel: string, ...args: any[]) => {
                const payload = args[0];
                if (channel === 'orpc:invoke') {
                    const { procedure, input } = payload;
                    console.log(`[E2E Mock] RPC: ${procedure}`, input);

                    if (procedure === 'auth.verifyPin') {
                        return { data: { valid: input.pin === '1234' } };
                    }

                    if (procedure === 'patients.get') {
                        return {
                            data: {
                                id: input.id,
                                first_name: 'Jean',
                                last_name: 'Test',
                                birth_date: '1980-01-01',
                                gender: 'M',
                                gen_ants: 'Aucun',
                                oph_ants: 'Myopie',
                                folder_id: 'F123'
                            }
                        };
                    }

                    if (procedure === 'consultations.listByPatient') {
                        return { data: [] };
                    }

                    if (procedure === 'consultations.create') {
                        return {
                            data: {
                                id: 'test-cons-1',
                                patient_id: input.patient_id,
                                date: new Date().toISOString(),
                                type: input.type || 'Consultation',
                                status: 'pending',
                                clinical_exam: {},
                                left_eye: {},
                                right_eye: {},
                                prescription: { treatments: [] }
                            }
                        };
                    }

                    if (procedure === 'consultations.update') {
                        return { data: { success: true } };
                    }

                    if (procedure === 'waitlist.list' || procedure === 'appointments.list' || procedure.includes('list') || procedure.includes('getAll')) {
                        return { data: [] };
                    }
                }
                return { data: null };
            },

            onDataChanged: () => () => { },
            onUpdateAvailable: () => () => { },
            onUpdateDownloaded: () => () => { },
            onDownloadProgress: () => () => { },
            onUpdateError: () => () => { },
        };
    });
}

/**
 * Login as doctor (adjust selectors to match actual login UI).
 */
export async function loginAsDoctor(page: Page) {
    await mockElectron(page);
    // Start at root which might show loader
    await page.goto('/');

    // Wait for the role selection button to appear
    // This implicitly waits for the AppLoader (4s) + navigation triggered by launchMainWindow
    const doctorBtn = page.getByRole('button', { name: /Docteur|Médecin/i });
    await expect(doctorBtn).toBeVisible({ timeout: 25000 });
    await doctorBtn.click();

    // Handle PIN Dialog
    // Title is "Accès Docteur" when purpose is 'doctor'
    const pinDialog = page.getByText(/Accès Docteur|Authentification/i);
    try {
        if (await pinDialog.isVisible({ timeout: 5000 })) {
            const pinInput = page.locator('input[type="password"]');
            await pinInput.fill('1234');
            await page.waitForTimeout(200); // Small wait for React state
            await page.getByRole('button', { name: /Confirmer/i }).click();
        }
    } catch (e) {
        console.log('PIN dialog not found or already bypassed', e);
    }


    // Wait for dashboard or navigation to complete
    await expect(page.locator('header')).toBeVisible({ timeout: 15000 });
}




// ─── Dashboard Interactions ───────────────────────────────────────────────────

/**
 * Wait for dashboard to be fully loaded (consultation data populated).
 */
export async function waitForDashboardReady(page: Page) {
    // Header should be visible
    await expect(page.locator('header')).toBeVisible({ timeout: 10000 });
    // Save button should be available
    await expect(page.getByRole('button', { name: /Sauvegarder/i })).toBeVisible({ timeout: 10000 });
}

/**
 * Click the Save button and wait for success toast.
 */
export async function saveConsultation(page: Page) {
    await page.getByRole('button', { name: /Sauvegarder/i }).click();
    await expect(page.getByText('Sauvegardée.')).toBeVisible({ timeout: 8000 });
}

/**
 * Open the finish consultation sheet.
 */
export async function openFinishSheet(page: Page) {
    await page.getByRole('button', { name: /Terminer la consultation/i }).click();
    // Wait for the sheet to open
    await page.waitForTimeout(500);
}

/**
 * Navigate to a specific tab in the dashboard.
 * @param tabLabel - The text of the tab (e.g. 'Réfraction', 'Tonométrie')
 */
export async function clickTab(page: Page, tabLabel: string) {
    await page.getByRole('tab', { name: tabLabel }).click();
}

// ─── Form Helpers ─────────────────────────────────────────────────────────────

/**
 * Fill a CompactSelect (the custom inline text+dropdown input).
 * Clicks the input, types a value, then clicks the matching dropdown option.
 */
export async function fillCompactSelect(
    page: Page,
    container: any,
    searchText: string,
    optionText?: string
) {
    const input = container.locator('input[type="text"]').first();
    await input.click();
    await input.fill(searchText);
    await page.waitForTimeout(200);

    const optLabel = optionText || searchText;
    const option = page.locator('[data-value]', { hasText: optLabel }).first();
    if (await option.isVisible({ timeout: 2000 })) {
        await option.click();
    }
}

/**
 * Clear a CompactSelect field using its X button.
 */
export async function clearCompactSelect(page: Page, container: any) {
    const clearBtn = container.locator('svg').filter({ hasText: '' }).last(); // X icon
    if (await clearBtn.isVisible({ timeout: 1000 })) {
        await clearBtn.click();
    }
}

// ─── Assertions ───────────────────────────────────────────────────────────────

/**
 * Assert that a toast notification appears.
 */
export async function assertToast(page: Page, message: string) {
    await expect(page.getByText(message)).toBeVisible({ timeout: 8000 });
}

/**
 * Assert the dashboard header shows the correct patient name.
 */
export async function assertPatientName(page: Page, name: string) {
    await expect(page.locator('header h1')).toContainText(name, { timeout: 5000 });
}
