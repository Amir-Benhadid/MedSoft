# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: save-and-finish.spec.ts >> Finish consultation – sheet >> finish sheet has Confirmer button
- Location: tests\e2e\save-and-finish.spec.ts:100:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: /Confirmer/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('button', { name: /Confirmer/i })

```

# Page snapshot

```yaml
- generic:
  - generic:
    - generic:
      - generic:
        - generic:
          - generic:
            - banner:
              - generic:
                - button:
                  - img
              - generic:
                - button:
                  - img
                - button:
                  - generic: 💳
                - button:
                  - generic: 📅
                - button:
                  - img
                  - text: Sauvegarder
                - button:
                  - img
                  - text: Terminer la consultation
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - generic: Réfraction
                      - generic:
                        - generic:
                          - generic:
                            - generic:
                              - generic: OD
                            - generic:
                              - button:
                                - img
                                - text: OG → OD
                          - generic:
                            - generic:
                              - generic:
                                - generic:
                                  - generic: AV
                                - generic:
                                  - generic:
                                    - generic: VL
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: SC
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: AC
                                        - img
                                    - generic: VP
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: SC
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: AC
                                        - img
                            - generic:
                              - generic:
                                - generic:
                                  - generic: Sphère
                                  - generic: Cylindre
                                  - generic: Axe
                                  - generic: Add
                              - generic:
                                - generic:
                                  - generic:
                                    - generic: OBJ
                                  - generic:
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                              - generic:
                                - generic:
                                  - generic:
                                    - generic: SUB
                                  - generic:
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                            - generic:
                              - generic:
                                - generic:
                                  - generic: KER
                                - generic:
                                  - generic:
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: R0
                                      - generic:
                                        - textbox:
                                          - /placeholder: DL
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: K1
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: K2
                                        - img
                              - generic:
                                - generic:
                                  - generic: LEN
                                - generic:
                                  - generic:
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: Type
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: Matière
                                        - img
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: Marque
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: Verres
                                        - img
                        - generic:
                          - generic:
                            - generic:
                              - generic: OG
                            - generic:
                              - button:
                                - img
                                - text: OD → OG
                          - generic:
                            - generic:
                              - generic:
                                - generic:
                                  - generic: AV
                                - generic:
                                  - generic:
                                    - generic: VL
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: SC
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: AC
                                        - img
                                    - generic: VP
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: SC
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: AC
                                        - img
                            - generic:
                              - generic:
                                - generic:
                                  - generic: Sphère
                                  - generic: Cylindre
                                  - generic: Axe
                                  - generic: Add
                              - generic:
                                - generic:
                                  - generic:
                                    - generic: OBJ
                                  - generic:
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                              - generic:
                                - generic:
                                  - generic:
                                    - generic: SUB
                                  - generic:
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: "-"
                                        - img
                            - generic:
                              - generic:
                                - generic:
                                  - generic: KER
                                - generic:
                                  - generic:
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: R0
                                      - generic:
                                        - textbox:
                                          - /placeholder: DL
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: K1
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: K2
                                        - img
                              - generic:
                                - generic:
                                  - generic: LEN
                                - generic:
                                  - generic:
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: Type
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: Matière
                                        - img
                                    - generic:
                                      - generic:
                                        - textbox:
                                          - /placeholder: Marque
                                        - img
                                      - generic:
                                        - textbox:
                                          - /placeholder: Verres
                                        - img
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - generic: Tonométrie
                        - button:
                          - img
                          - text: Calcul via Air
                      - generic:
                        - generic:
                          - generic:
                            - generic:
                              - generic:
                                - generic: Air
                                - generic:
                                  - textbox:
                                    - /placeholder: "-"
                                  - img
                              - generic:
                                - generic: App
                                - generic:
                                  - textbox:
                                    - /placeholder: "-"
                                  - img
                              - generic:
                                - generic: Cor
                                - textbox:
                                  - /placeholder: "-"
                              - generic:
                                - generic: Pac
                                - generic:
                                  - textbox:
                                    - /placeholder: "-"
                                  - img
                              - generic:
                                - generic: Heure
                                - generic:
                                  - textbox
                          - generic:
                            - generic:
                              - generic:
                                - generic: Air
                                - generic:
                                  - textbox:
                                    - /placeholder: "-"
                                  - img
                              - generic:
                                - generic: App
                                - generic:
                                  - textbox:
                                    - /placeholder: "-"
                                  - img
                              - generic:
                                - generic: Cor
                                - textbox:
                                  - /placeholder: "-"
                              - generic:
                                - generic: Pac
                                - generic:
                                  - textbox:
                                    - /placeholder: "-"
                                  - img
                              - generic:
                                - generic: Heure
                                - generic:
                                  - textbox
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - generic:
                          - generic:
                            - generic: INSP
                          - generic:
                            - generic:
                              - textbox:
                                - /placeholder: Rien à signaler...
                        - generic:
                          - generic:
                            - generic: MOT
                          - generic:
                            - generic:
                              - textbox:
                                - /placeholder: Normal...
                      - generic:
                        - generic:
                          - generic:
                            - generic: SEG ANT
                          - generic:
                            - generic:
                              - generic:
                                - textbox:
                                  - /placeholder: Examen segment antérieur...
                        - generic:
                          - generic:
                            - generic: FO
                          - generic:
                            - textbox:
                              - /placeholder: Examen du fond d'œil...
                      - generic:
                        - generic:
                          - generic:
                            - generic: DIAG
                          - generic:
                            - generic:
                              - generic:
                                - textbox:
                                  - /placeholder: Diagnostic...
                        - generic:
                          - generic:
                            - generic: CDT
                          - generic:
                            - textbox:
                              - /placeholder: Traitement prescrit...
              - generic:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - generic: Informations Patient
                      - generic:
                        - generic:
                          - generic:
                            - img
                          - generic:
                            - generic: N/A
                        - generic:
                          - generic:
                            - generic:
                              - generic: Antécédents Généraux
                              - button:
                                - img
                            - generic:
                              - generic:
                                - textbox:
                                  - /placeholder: "-"
                                  - text: Aucun
                          - generic:
                            - generic: Diagnostic
                            - generic:
                              - generic:
                                - textbox:
                                  - /placeholder: "-"
                          - generic:
                            - generic:
                              - generic: Antécédents Ophtalmologiques
                              - button:
                                - img
                            - generic:
                              - generic:
                                - textbox:
                                  - /placeholder: "-"
                                  - text: Myopie
                          - generic:
                            - generic: Note
                            - generic:
                              - textbox:
                                - /placeholder: "-"
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - generic:
                          - generic:
                            - button [disabled]:
                              - img
                            - button:
                              - img
                          - generic:
                            - generic:
                              - button:
                                - img
                                - generic: Ordonnance
                              - button:
                                - img
                                - generic: Lunettes
                              - button:
                                - img
                                - generic: Lentilles
                              - button:
                                - img
                                - generic: Compte Rendu
                              - button:
                                - img
                                - generic: Certificat
                        - generic:
                          - button:
                            - img
                      - generic:
                        - generic:
                          - generic:
                            - generic:
                              - generic:
                                - generic:
                                  - generic:
                                    - generic:
                                      - generic:
                                        - generic:
                                          - img
                                        - generic:
                                          - heading [level=4]: Médicaments
                                          - paragraph: Gérer l'ordonnance
                                      - button:
                                        - img
                                        - text: Ajouter
                                    - generic:
                                      - generic:
                                        - generic:
                                          - img
                                        - generic: Aucun médicament prescrit
                                        - generic: Cliquez sur "Ajouter" pour rédiger une ordonnance
                        - generic:
                          - generic:
                            - generic:
                              - generic:
                                - heading [level=3]: Aperçu du document
                                - generic:
                                  - button:
                                    - img
                                    - generic: Imprimer
                                  - button:
                                    - img
                                    - generic: Aperçu PDF
                            - generic:
                              - generic:
                                - generic:
                                  - generic:
                                    - generic:
                                      - generic:
                                        - generic:
                                          - generic:
                                            - generic:
                                              - generic:
                                                - generic:
                                                  - generic: Aucun médicament prescrit
        - generic:
          - button
    - list
  - dialog "Fin de Consultation" [ref=e2]:
    - generic [ref=e3]:
      - heading "Fin de Consultation" [level=2] [ref=e4]:
        - img [ref=e5]
        - generic [ref=e9]: Fin de Consultation
      - paragraph [ref=e10]: Validez les détails du paiement et le prochain rendez-vous.
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]:
          - img [ref=e15]
          - generic [ref=e19]:
            - heading "Prochain Rendez-vous" [level=2] [ref=e20]
            - paragraph [ref=e21]: Planifier le suivi du patient
        - generic [ref=e23]:
          - generic [ref=e24]:
            - generic [ref=e25]:
              - text: Type
              - combobox [active] [ref=e26] [cursor=pointer]:
                - generic: Contrôle
                - img [ref=e27]
            - generic [ref=e29]:
              - text: Date (Optionnel)
              - textbox [ref=e30]
          - generic [ref=e35]: ou
          - generic [ref=e36]:
            - text: Délai (Recommandé)
            - combobox [ref=e37] [cursor=pointer]:
              - generic: Choisir un délai...
              - img [ref=e38]
      - generic [ref=e40]:
        - generic [ref=e41]:
          - img [ref=e43]
          - generic [ref=e46]:
            - heading "Facturation & Paiement" [level=2] [ref=e47]
            - paragraph [ref=e48]: Gestion des honoraires de la consultation
        - generic [ref=e49]:
          - generic [ref=e50]:
            - generic [ref=e51]: Type de Consultation
            - combobox [ref=e52] [cursor=pointer]:
              - img [ref=e53]
          - generic [ref=e55]:
            - generic [ref=e56]:
              - generic [ref=e58]: Montant à Encaisser
              - generic [ref=e59]:
                - generic:
                  - img
                - spinbutton [ref=e60]
                - generic:
                  - generic: DZD
              - generic [ref=e61]:
                - button "-500 DZD" [ref=e62] [cursor=pointer]
                - button "+500 DZD" [ref=e63] [cursor=pointer]
            - generic [ref=e65]:
              - generic [ref=e66]: Statut du Paiement
              - generic [ref=e67]:
                - button "Standard" [ref=e68] [cursor=pointer]:
                  - img [ref=e70]
                  - generic [ref=e72]: Standard
                  - img [ref=e73]
                - button "Acte Gratuit" [ref=e75] [cursor=pointer]:
                  - img [ref=e77]
                  - generic [ref=e81]: Acte Gratuit
    - generic [ref=e82]:
      - button "Annuler" [ref=e83] [cursor=pointer]
      - button "Terminer la Consultation" [ref=e84] [cursor=pointer]:
        - img [ref=e85]
        - text: Terminer la Consultation
    - button "Close" [ref=e87] [cursor=pointer]:
      - img [ref=e88]
      - generic [ref=e91]: Close
```

# Test source

```ts
  3   |  *
  4   |  * Tests the complete consultation lifecycle:
  5   |  * - Manual save (Sauvegarder)
  6   |  * - Finish consultation with payment data
  7   |  * - Consultation switching with auto-save
  8   |  * - History viewing
  9   |  */
  10  | import { test, expect, Page } from '@playwright/test';
  11  | import { loginAsDoctor, waitForDashboardReady } from './helpers/dashboard';
  12  | 
  13  | const TEST_PATIENT_ID = process.env.E2E_PATIENT_ID || 'test-patient-1';
  14  | 
  15  | async function goToDashboard(page: Page) {
  16  |     await loginAsDoctor(page);
  17  |     await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
  18  |     await waitForDashboardReady(page);
  19  | }
  20  | 
  21  | // ═══════════════════════════════════════════════════════════════════════════════
  22  | // Manual Save (Sauvegarder)
  23  | // ═══════════════════════════════════════════════════════════════════════════════
  24  | test.describe('Save – manual save', () => {
  25  |     test.beforeEach(async ({ page }) => {
  26  |         await goToDashboard(page);
  27  |     });
  28  | 
  29  |     test('clicking Sauvegarder triggers save and shows success toast', async ({ page }) => {
  30  |         await page.getByRole('button', { name: /Sauvegarder/i }).click();
  31  |         await expect(page.getByText('Sauvegardée.')).toBeVisible({ timeout: 10000 });
  32  |     });
  33  | 
  34  |     test('Sauvegarder shows loading spinner while saving', async ({ page }) => {
  35  |         await page.getByRole('button', { name: /Sauvegarder/i }).click();
  36  |         // Briefly spinner appears
  37  |         // (may be too fast to reliably test without intercepting the request)
  38  |         await page.waitForTimeout(100);
  39  |         // Just ensure no crash
  40  |         await expect(page.getByRole('button', { name: /Sauvegarder/i })).toBeVisible({ timeout: 10000 });
  41  |     });
  42  | 
  43  |     test('can save multiple times without errors', async ({ page }) => {
  44  |         await page.getByRole('button', { name: /Sauvegarder/i }).click();
  45  |         await expect(page.getByText('Sauvegardée.')).toBeVisible({ timeout: 10000 });
  46  |         await page.waitForTimeout(1000);
  47  |         await page.getByRole('button', { name: /Sauvegarder/i }).click();
  48  |         await expect(page.getByText('Sauvegardée.')).toBeVisible({ timeout: 10000 });
  49  |     });
  50  | 
  51  |     test('save with inspection data entered', async ({ page }) => {
  52  |         // Fill inspection field if visible
  53  |         const inspInput = page.locator('input[placeholder="Rien à signaler..."]');
  54  |         if (await inspInput.isVisible({ timeout: 2000 })) {
  55  |             await inspInput.fill('Normal');
  56  |         }
  57  |         await page.getByRole('button', { name: /Sauvegarder/i }).click();
  58  |         await expect(page.getByText('Sauvegardée.')).toBeVisible({ timeout: 10000 });
  59  |     });
  60  | });
  61  | 
  62  | // ═══════════════════════════════════════════════════════════════════════════════
  63  | // Finish Consultation Sheet
  64  | // ═══════════════════════════════════════════════════════════════════════════════
  65  | test.describe('Finish consultation – sheet', () => {
  66  |     test.beforeEach(async ({ page }) => {
  67  |         await goToDashboard(page);
  68  |     });
  69  | 
  70  |     test('clicking Terminer opens the finish sheet', async ({ page }) => {
  71  |         await page.getByRole('button', { name: /Terminer la consultation/i }).click();
  72  |         await page.waitForTimeout(500);
  73  |         // Finish sheet content should appear
  74  |         // Look for payment or next appointment sections
  75  |         const sheetContent = page.locator('[role="dialog"]').or(
  76  |             page.locator('[data-state="open"]')
  77  |         ).first();
  78  |         // Just verify no crash
  79  |         await page.waitForTimeout(1000);
  80  |     });
  81  | 
  82  |     test('finish sheet shows next appointment section', async ({ page }) => {
  83  |         await page.getByRole('button', { name: /Terminer la consultation/i }).click();
  84  |         await page.waitForTimeout(700);
  85  |         // Look for next appointment elements
  86  |         const hasProchainRdv = await page.getByText(/Prochain.*rendez-vous|Next.*appointment/i)
  87  |             .isVisible({ timeout: 3000 }).catch(() => false);
  88  |         const hasPaiement = await page.getByText(/Paiement|Payment/i)
  89  |             .isVisible({ timeout: 3000 }).catch(() => false);
  90  |         // At least one section should be visible
  91  |         expect(hasProchainRdv || hasPaiement).toBe(true);
  92  |     });
  93  | 
  94  |     test('finish sheet shows payment section', async ({ page }) => {
  95  |         await page.getByRole('button', { name: /Terminer la consultation/i }).click();
  96  |         await page.waitForTimeout(700);
  97  |         await expect(page.getByText(/Paiement|Amount|Montant/i).first()).toBeVisible({ timeout: 5000 });
  98  |     });
  99  | 
  100 |     test('finish sheet has Confirmer button', async ({ page }) => {
  101 |         await page.getByRole('button', { name: /Terminer la consultation/i }).click();
  102 |         await page.waitForTimeout(700);
> 103 |         await expect(page.getByRole('button', { name: /Confirmer/i })).toBeVisible({ timeout: 5000 });
      |                                                                        ^ Error: expect(locator).toBeVisible() failed
  104 |     });
  105 | 
  106 |     test('finish sheet can be closed without finishing', async ({ page }) => {
  107 |         await page.getByRole('button', { name: /Terminer la consultation/i }).click();
  108 |         await page.waitForTimeout(500);
  109 |         // Press Escape or click outside to close
  110 |         await page.keyboard.press('Escape');
  111 |         await page.waitForTimeout(500);
  112 |         // Dashboard should still be accessible
  113 |         await expect(page.getByRole('button', { name: /Sauvegarder/i })).toBeVisible();
  114 |     });
  115 | 
  116 |     test('filling payment amount in finish sheet', async ({ page }) => {
  117 |         await page.getByRole('button', { name: /Terminer la consultation/i }).click();
  118 |         await page.waitForTimeout(700);
  119 |         // Find amount input
  120 |         const amountInput = page.locator('input[type="number"], input[placeholder*="montant" i], input[placeholder*="amount" i]').first();
  121 |         if (await amountInput.isVisible({ timeout: 3000 })) {
  122 |             await amountInput.fill('2000');
  123 |             await expect(amountInput).toHaveValue('2000');
  124 |         }
  125 |     });
  126 | });
  127 | 
  128 | // ═══════════════════════════════════════════════════════════════════════════════
  129 | // Payment History
  130 | // ═══════════════════════════════════════════════════════════════════════════════
  131 | test.describe('Payment history', () => {
  132 |     test.beforeEach(async ({ page }) => {
  133 |         await goToDashboard(page);
  134 |     });
  135 | 
  136 |     test('clicking payment history button opens payment history panel', async ({ page }) => {
  137 |         await page.getByTitle('Historique des paiements et créances').click();
  138 |         await page.waitForTimeout(500);
  139 |         // Payment history sheet/panel should open
  140 |         // Just ensure no crash
  141 |     });
  142 | });
  143 | 
  144 | // ═══════════════════════════════════════════════════════════════════════════════
  145 | // Consultation History
  146 | // ═══════════════════════════════════════════════════════════════════════════════
  147 | test.describe('Consultation history', () => {
  148 |     test.beforeEach(async ({ page }) => {
  149 |         await goToDashboard(page);
  150 |     });
  151 | 
  152 |     test('clicking calendar button opens history drawer', async ({ page }) => {
  153 |         await page.getByTitle('Historique des consultations').click();
  154 |         await page.waitForTimeout(700);
  155 |         // History should be visible
  156 |     });
  157 | 
  158 |     test('F3 shortcut toggles history drawer', async ({ page }) => {
  159 |         await page.keyboard.press('F3');
  160 |         await page.waitForTimeout(500);
  161 |         await page.keyboard.press('F3');
  162 |         await page.waitForTimeout(500);
  163 |         // No crash
  164 |         await expect(page.getByRole('button', { name: /Sauvegarder/i })).toBeVisible();
  165 |     });
  166 | 
  167 |     test('history shows table with date, type, note, and actions columns', async ({ page }) => {
  168 |         await page.getByTitle('Historique des consultations').click();
  169 |         await page.waitForTimeout(700);
  170 |         // If history is open and has data
  171 |         const dateHeader = await page.getByRole('columnheader', { name: /Date/i }).isVisible({ timeout: 2000 });
  172 |         const typeHeader = await page.getByRole('columnheader', { name: /Type/i }).isVisible({ timeout: 2000 });
  173 |         // At least, no crash
  174 |     });
  175 | });
  176 | 
  177 | // ═══════════════════════════════════════════════════════════════════════════════
  178 | // Complete workflow: Fill → Save → Finish
  179 | // ═══════════════════════════════════════════════════════════════════════════════
  180 | test.describe('Full workflow – fill, save, finish', () => {
  181 |     test('complete consultation workflow', async ({ page }) => {
  182 |         await goToDashboard(page);
  183 | 
  184 |         // Step 1: Fill some clinical exam data
  185 |         const inspInput = page.locator('input[placeholder="Rien à signaler..."]');
  186 |         if (await inspInput.isVisible({ timeout: 2000 })) {
  187 |             await inspInput.fill('RAS');
  188 |         }
  189 | 
  190 |         // Step 2: Save
  191 |         await page.getByRole('button', { name: /Sauvegarder/i }).click();
  192 |         await expect(page.getByText('Sauvegardée.')).toBeVisible({ timeout: 10000 });
  193 | 
  194 |         // Step 3: Try to open finish sheet (don't actually finish)
  195 |         await page.getByRole('button', { name: /Terminer la consultation/i }).click();
  196 |         await page.waitForTimeout(700);
  197 | 
  198 |         // Step 4: Close without finishing
  199 |         await page.keyboard.press('Escape');
  200 |         await page.waitForTimeout(500);
  201 | 
  202 |         // Dashboard should still be intact
  203 |         await expect(page.getByRole('button', { name: /Sauvegarder/i })).toBeVisible();
```