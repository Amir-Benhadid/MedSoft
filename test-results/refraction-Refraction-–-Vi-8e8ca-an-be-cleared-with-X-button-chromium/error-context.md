# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: refraction.spec.ts >> Refraction – Visual Acuity >> VA SC field can be cleared with X button
- Location: tests\e2e\refraction.spec.ts:75:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.hover: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder="SC"]').first()
    - locator resolved to <input type="text" value="8/10" placeholder="SC" class="flex w-full rounded-md border border-slate-200 bg-white/80 font-bold text-slate-900 ring-offset-background placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50 pr-5 xl:pr-6 cursor-text hover:bg-white transition-all shadow-sm"/>
  - attempting hover action
    2 × waiting for element to be visible and stable
      - element is visible and stable
      - scrolling into view if needed
      - done scrolling
      - <svg width="24" height="24" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" class="lucide lucide-x absolute right-1.5 xl:right-2 top-1/2 -translate-y-1/2 h-3 w-3 xl:h-3.5 xl:w-3.5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">…</svg> intercepts pointer events
    - retrying hover action
    - waiting 20ms
    2 × waiting for element to be visible and stable
      - element is visible and stable
      - scrolling into view if needed
      - done scrolling
      - <svg width="24" height="24" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" class="lucide lucide-x absolute right-1.5 xl:right-2 top-1/2 -translate-y-1/2 h-3 w-3 xl:h-3.5 xl:w-3.5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">…</svg> intercepts pointer events
    - retrying hover action
      - waiting 100ms
    34 × waiting for element to be visible and stable
       - element is visible and stable
       - scrolling into view if needed
       - done scrolling
       - <svg width="24" height="24" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" class="lucide lucide-x absolute right-1.5 xl:right-2 top-1/2 -translate-y-1/2 h-3 w-3 xl:h-3.5 xl:w-3.5 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">…</svg> intercepts pointer events
     - retrying hover action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - generic [ref=e6]:
      - banner [ref=e7]:
        - generic [ref=e8]:
          - button [ref=e9] [cursor=pointer]:
            - img [ref=e10]
          - generic:
            - generic:
              - heading [level=1]
        - generic [ref=e12]:
          - button [ref=e13] [cursor=pointer]:
            - img [ref=e14]
          - button "💳" [ref=e17] [cursor=pointer]:
            - generic [ref=e18]: 💳
          - button "📅" [ref=e19] [cursor=pointer]:
            - generic [ref=e20]: 📅
          - button "Sauvegarder" [ref=e21] [cursor=pointer]:
            - img [ref=e22]
            - text: Sauvegarder
          - button "Terminer la consultation" [ref=e26] [cursor=pointer]:
            - img [ref=e27]
            - text: Terminer la consultation
      - generic [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e35]:
            - generic [ref=e37]: Réfraction
            - generic [ref=e38]:
              - generic [ref=e39]:
                - generic [ref=e40]:
                  - generic [ref=e42]: OD
                  - button "OG → OD" [ref=e44] [cursor=pointer]:
                    - img [ref=e45]
                    - text: OG → OD
                - generic [ref=e48]:
                  - generic [ref=e50]:
                    - generic "Acuité Visuelle" [ref=e51]:
                      - generic [ref=e52]: AV
                    - generic [ref=e54]:
                      - generic [ref=e55]: VL
                      - generic [ref=e56]:
                        - generic [ref=e57]:
                          - textbox "SC" [ref=e58]: 8/10
                          - img [ref=e59] [cursor=pointer]
                        - generic [ref=e62]:
                          - textbox "AC" [ref=e63]
                          - img
                      - generic [ref=e64]: VP
                      - generic [ref=e65]:
                        - generic [ref=e66]:
                          - textbox "SC" [ref=e67]
                          - img
                        - generic [ref=e68]:
                          - textbox "AC" [ref=e69]
                          - img
                  - generic [ref=e70]:
                    - generic [ref=e72]:
                      - generic [ref=e73]: Sphère
                      - generic [ref=e74]: Cylindre
                      - generic [ref=e75]: Axe
                      - generic [ref=e76]: Add
                    - generic [ref=e78]:
                      - generic "Réfraction Objective" [ref=e79]:
                        - generic [ref=e80]: OBJ
                      - generic [ref=e82]:
                        - generic [ref=e83]:
                          - textbox "-" [ref=e84]
                          - img
                        - generic [ref=e85]:
                          - textbox "-" [ref=e86]
                          - img
                        - generic [ref=e87]:
                          - textbox "-" [ref=e88]
                          - img
                        - generic [ref=e89]:
                          - textbox "-" [ref=e90]
                          - img
                    - generic [ref=e92]:
                      - generic "Réfraction Subjective" [ref=e93]:
                        - generic [ref=e94]: SUB
                      - generic [ref=e96]:
                        - generic [ref=e97]:
                          - textbox "-" [ref=e98]
                          - img
                        - generic [ref=e99]:
                          - textbox "-" [ref=e100]
                          - img
                        - generic [ref=e101]:
                          - textbox "-" [ref=e102]
                          - img
                        - generic [ref=e103]:
                          - textbox "-" [ref=e104]
                          - img
                  - generic [ref=e105]:
                    - generic [ref=e106]:
                      - generic "Kératométrie" [ref=e107]:
                        - generic [ref=e108]: KER
                      - generic [ref=e110]:
                        - generic [ref=e111]:
                          - textbox "R0" [ref=e113]
                          - textbox "DL" [ref=e115]
                        - generic [ref=e116]:
                          - generic [ref=e117]:
                            - textbox "K1" [ref=e118]
                            - img
                          - generic [ref=e119]:
                            - textbox "K2" [ref=e120]
                            - img
                    - generic [ref=e121]:
                      - generic "Lentilles de Contact" [ref=e122]:
                        - generic [ref=e123]: LEN
                      - generic [ref=e125]:
                        - generic [ref=e126]:
                          - generic [ref=e127]:
                            - textbox "Type" [ref=e128]
                            - img
                          - generic [ref=e129]:
                            - textbox "Matière" [ref=e130]
                            - img
                        - generic [ref=e131]:
                          - generic [ref=e132]:
                            - textbox "Marque" [ref=e133]
                            - img
                          - generic [ref=e134]:
                            - textbox "Verres" [ref=e135]
                            - img
              - generic [ref=e136]:
                - generic [ref=e137]:
                  - generic [ref=e139]: OG
                  - button "OD → OG" [ref=e141] [cursor=pointer]:
                    - img [ref=e142]
                    - text: OD → OG
                - generic [ref=e145]:
                  - generic [ref=e147]:
                    - generic "Acuité Visuelle" [ref=e148]:
                      - generic [ref=e149]: AV
                    - generic [ref=e151]:
                      - generic [ref=e152]: VL
                      - generic [ref=e153]:
                        - generic [ref=e154]:
                          - textbox "SC" [ref=e155]
                          - img
                        - generic [ref=e156]:
                          - textbox "AC" [ref=e157]
                          - img
                      - generic [ref=e158]: VP
                      - generic [ref=e159]:
                        - generic [ref=e160]:
                          - textbox "SC" [ref=e161]
                          - img
                        - generic [ref=e162]:
                          - textbox "AC" [ref=e163]
                          - img
                  - generic [ref=e164]:
                    - generic [ref=e166]:
                      - generic [ref=e167]: Sphère
                      - generic [ref=e168]: Cylindre
                      - generic [ref=e169]: Axe
                      - generic [ref=e170]: Add
                    - generic [ref=e172]:
                      - generic "Réfraction Objective" [ref=e173]:
                        - generic [ref=e174]: OBJ
                      - generic [ref=e176]:
                        - generic [ref=e177]:
                          - textbox "-" [ref=e178]
                          - img
                        - generic [ref=e179]:
                          - textbox "-" [ref=e180]
                          - img
                        - generic [ref=e181]:
                          - textbox "-" [ref=e182]
                          - img
                        - generic [ref=e183]:
                          - textbox "-" [ref=e184]
                          - img
                    - generic [ref=e186]:
                      - generic "Réfraction Subjective" [ref=e187]:
                        - generic [ref=e188]: SUB
                      - generic [ref=e190]:
                        - generic [ref=e191]:
                          - textbox "-" [ref=e192]
                          - img
                        - generic [ref=e193]:
                          - textbox "-" [ref=e194]
                          - img
                        - generic [ref=e195]:
                          - textbox "-" [ref=e196]
                          - img
                        - generic [ref=e197]:
                          - textbox "-" [ref=e198]
                          - img
                  - generic [ref=e199]:
                    - generic [ref=e200]:
                      - generic "Kératométrie" [ref=e201]:
                        - generic [ref=e202]: KER
                      - generic [ref=e204]:
                        - generic [ref=e205]:
                          - textbox "R0" [ref=e207]
                          - textbox "DL" [ref=e209]
                        - generic [ref=e210]:
                          - generic [ref=e211]:
                            - textbox "K1" [ref=e212]
                            - img
                          - generic [ref=e213]:
                            - textbox "K2" [ref=e214]
                            - img
                    - generic [ref=e215]:
                      - generic "Lentilles de Contact" [ref=e216]:
                        - generic [ref=e217]: LEN
                      - generic [ref=e219]:
                        - generic [ref=e220]:
                          - generic [ref=e221]:
                            - textbox "Type" [ref=e222]
                            - img
                          - generic [ref=e223]:
                            - textbox "Matière" [ref=e224]
                            - img
                        - generic [ref=e225]:
                          - generic [ref=e226]:
                            - textbox "Marque" [ref=e227]
                            - img
                          - generic [ref=e228]:
                            - textbox "Verres" [ref=e229]
                            - img
          - generic [ref=e232]:
            - generic [ref=e233]:
              - generic [ref=e234]: Tonométrie
              - button "Calcul via Air" [ref=e235] [cursor=pointer]:
                - img [ref=e236]
                - text: Calcul via Air
            - generic [ref=e240]:
              - generic [ref=e242]:
                - generic [ref=e243]:
                  - generic [ref=e244]: Air
                  - generic [ref=e245]:
                    - textbox "-" [ref=e246]
                    - img
                - generic [ref=e247]:
                  - generic [ref=e248]: App
                  - generic [ref=e249]:
                    - textbox "-" [ref=e250]
                    - img
                - generic [ref=e251]:
                  - generic [ref=e252]: Cor
                  - textbox "-" [ref=e253]
                - generic [ref=e254]:
                  - generic [ref=e255]: Pac
                  - generic [ref=e256]:
                    - textbox "-" [ref=e257]
                    - img
                - generic [ref=e258]:
                  - generic [ref=e259]: Heure
                  - textbox [ref=e261]
              - generic [ref=e263]:
                - generic [ref=e264]:
                  - generic [ref=e265]: Air
                  - generic [ref=e266]:
                    - textbox "-" [ref=e267]
                    - img
                - generic [ref=e268]:
                  - generic [ref=e269]: App
                  - generic [ref=e270]:
                    - textbox "-" [ref=e271]
                    - img
                - generic [ref=e272]:
                  - generic [ref=e273]: Cor
                  - textbox "-" [ref=e274]
                - generic [ref=e275]:
                  - generic [ref=e276]: Pac
                  - generic [ref=e277]:
                    - textbox "-" [ref=e278]
                    - img
                - generic [ref=e279]:
                  - generic [ref=e280]: Heure
                  - textbox [ref=e282]
          - generic [ref=e285]:
            - generic [ref=e286]:
              - generic [ref=e287]:
                - generic "Inspection" [ref=e288]:
                  - generic [ref=e289]: INSP
                - textbox "Rien à signaler..." [ref=e292]
              - generic [ref=e293]:
                - generic "Motilité" [ref=e294]:
                  - generic [ref=e295]: MOT
                - textbox "Normal..." [ref=e298]
            - generic [ref=e299]:
              - generic [ref=e300]:
                - generic "Segment Antérieur" [ref=e301]:
                  - generic [ref=e302]: SEG ANT
                - textbox "Examen segment antérieur..." [ref=e306]
              - generic [ref=e307]:
                - generic "Fond d'œil" [ref=e308]:
                  - generic [ref=e309]: FO
                - textbox "Examen du fond d'œil..." [ref=e311]
            - generic [ref=e312]:
              - generic [ref=e313]:
                - generic "Diagnostic" [ref=e314]:
                  - generic [ref=e315]: DIAG
                - textbox "Diagnostic..." [ref=e319]
              - generic [ref=e320]:
                - generic "Traitement" [ref=e321]:
                  - generic [ref=e322]: CDT
                - textbox "Traitement prescrit..." [ref=e324]
        - generic [ref=e325]:
          - generic [ref=e328]:
            - generic [ref=e330]: Informations Patient
            - generic [ref=e332]:
              - generic [ref=e333]:
                - img [ref=e335]
                - generic [ref=e338]:
                  - heading [level=2]
                  - generic [ref=e339]: N/A
              - generic [ref=e340]:
                - generic [ref=e341]:
                  - generic [ref=e342]:
                    - generic [ref=e343]: Antécédents Généraux
                    - button [ref=e344] [cursor=pointer]:
                      - img [ref=e345]
                  - textbox "-" [ref=e352]: Aucun
                - generic [ref=e353]:
                  - generic [ref=e354]: Diagnostic
                  - textbox "-" [ref=e357]
                - generic [ref=e358]:
                  - generic [ref=e359]:
                    - generic [ref=e360]: Antécédents Ophtalmologiques
                    - button [ref=e361] [cursor=pointer]:
                      - img [ref=e362]
                  - textbox "-" [ref=e369]: Myopie
                - generic [ref=e370]:
                  - generic [ref=e371]: Note
                  - textbox "-" [ref=e373]
          - generic [ref=e376]:
            - generic [ref=e377]:
              - generic [ref=e378]:
                - generic [ref=e379]:
                  - button [disabled]:
                    - img
                  - button [ref=e380] [cursor=pointer]:
                    - img [ref=e381]
                - generic [ref=e384]:
                  - button "Ordonnance" [ref=e385] [cursor=pointer]:
                    - img [ref=e386]
                    - generic [ref=e389]: Ordonnance
                  - button "Lunettes" [ref=e390] [cursor=pointer]:
                    - img [ref=e391]
                    - generic [ref=e394]: Lunettes
                  - button "Lentilles" [ref=e395] [cursor=pointer]:
                    - img [ref=e396]
                    - generic [ref=e399]: Lentilles
                  - button "Compte Rendu" [ref=e400] [cursor=pointer]:
                    - img [ref=e401]
                    - generic [ref=e404]: Compte Rendu
                  - button "Certificat" [ref=e405] [cursor=pointer]:
                    - img [ref=e406]
                    - generic [ref=e410]: Certificat
              - button "Aperçu" [ref=e412] [cursor=pointer]:
                - img [ref=e413]
            - generic [ref=e416]:
              - generic [ref=e422]:
                - generic [ref=e423]:
                  - generic [ref=e424]:
                    - img [ref=e426]
                    - generic [ref=e429]:
                      - heading "Médicaments" [level=4] [ref=e430]
                      - paragraph [ref=e431]: Gérer l'ordonnance
                  - button "Ajouter" [ref=e432] [cursor=pointer]:
                    - img [ref=e433]
                    - text: Ajouter
                - generic [ref=e435]:
                  - img [ref=e437]
                  - generic [ref=e440]: Aucun médicament prescrit
                  - generic [ref=e441]: Cliquez sur "Ajouter" pour rédiger une ordonnance
              - generic [ref=e443]:
                - generic [ref=e445]:
                  - heading "Aperçu du document" [level=3] [ref=e446]
                  - generic [ref=e447]:
                    - button "Imprimer" [ref=e448] [cursor=pointer]:
                      - img [ref=e449]
                      - generic [ref=e453]: Imprimer
                    - button "Aperçu PDF" [ref=e454] [cursor=pointer]:
                      - img [ref=e455]
                      - generic [ref=e459]: Aperçu PDF
                - generic [ref=e471]: Aucun médicament prescrit
    - button [ref=e473] [cursor=pointer]:
      - img
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
  1   | /**
  2   |  * E2E: Refraction Tab – Visual Acuity, Refraction Data, Copy Buttons, Dilation
  3   |  *
  4   |  * Tests all interactions with the refraction tab including
  5   |  * VA entry, sph/cyl/axis/add selection, copy OD↔OG, and dilation workflow.
  6   |  */
  7   | import { test, expect, Page } from '@playwright/test';
  8   | import { loginAsDoctor, waitForDashboardReady, saveConsultation } from './helpers/dashboard';
  9   | 
  10  | const TEST_PATIENT_ID = process.env.E2E_PATIENT_ID || 'test-patient-1';
  11  | 
  12  | async function goToDashboard(page: Page) {
  13  |     await loginAsDoctor(page);
  14  |     await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
  15  |     await waitForDashboardReady(page);
  16  | }
  17  | 
  18  | async function goToRefractionTab(page: Page) {
  19  |     const tab = page.getByRole('tab', { name: /Réfraction/i });
  20  |     if (await tab.isVisible({ timeout: 3000 })) {
  21  |         await tab.click();
  22  |         await page.waitForTimeout(300);
  23  |     }
  24  | }
  25  | 
  26  | // ═══════════════════════════════════════════════════════════════════════════════
  27  | // Visual Acuity
  28  | // ═══════════════════════════════════════════════════════════════════════════════
  29  | test.describe('Refraction – Visual Acuity', () => {
  30  |     test.beforeEach(async ({ page }) => {
  31  |         await goToDashboard(page);
  32  |         await goToRefractionTab(page);
  33  |     });
  34  | 
  35  |     test('OD eye panel is visible with AV section', async ({ page }) => {
  36  |         await expect(page.getByText('OD')).toBeVisible();
  37  |     });
  38  | 
  39  |     test('OG eye panel is visible with AV section', async ({ page }) => {
  40  |         await expect(page.getByText('OG')).toBeVisible();
  41  |     });
  42  | 
  43  |     test('VL and VP labels are shown for each eye', async ({ page }) => {
  44  |         const vlLabels = await page.getByText('VL').all();
  45  |         expect(vlLabels.length).toBeGreaterThanOrEqual(2);
  46  |         const vpLabels = await page.getByText('VP').all();
  47  |         expect(vpLabels.length).toBeGreaterThanOrEqual(2);
  48  |     });
  49  | 
  50  |     test('clicking on VL SC input for OD opens dropdown', async ({ page }) => {
  51  |         // Find first SC placeholder input (VL SC for OD)
  52  |         const scInputs = page.locator('input[placeholder="SC"]');
  53  |         const firstSC = scInputs.first();
  54  |         await firstSC.click();
  55  |         // Dropdown should appear
  56  |         await page.waitForTimeout(300);
  57  |         const dropdown = page.locator('[data-value]').first();
  58  |         await expect(dropdown).toBeVisible({ timeout: 3000 });
  59  |     });
  60  | 
  61  |     test('selecting a VA value updates the input', async ({ page }) => {
  62  |         const scInputs = page.locator('input[placeholder="SC"]');
  63  |         const firstSC = scInputs.first();
  64  |         await firstSC.click();
  65  |         await firstSC.fill('10/10');
  66  |         await page.waitForTimeout(200);
  67  |         // Click the 10/10 option in dropdown
  68  |         const option = page.locator('[data-value="10/10"]').first();
  69  |         if (await option.isVisible({ timeout: 2000 })) {
  70  |             await option.click();
  71  |             await expect(firstSC).toHaveValue('10/10');
  72  |         }
  73  |     });
  74  | 
  75  |     test('VA SC field can be cleared with X button', async ({ page }) => {
  76  |         // First set a value
  77  |         const scInputs = page.locator('input[placeholder="SC"]');
  78  |         const firstSC = scInputs.first();
  79  |         await firstSC.click();
  80  |         await firstSC.fill('8/10');
  81  |         const option = page.locator('[data-value="8/10"]').first();
  82  |         if (await option.isVisible({ timeout: 2000 })) {
  83  |             await option.click();
  84  |         }
  85  |         // Now find and click X button
> 86  |         await firstSC.hover();
      |                       ^ Error: locator.hover: Test timeout of 30000ms exceeded.
  87  |         const clearBtn = page.locator('svg').last(); // X icon near the input
  88  |         if (await clearBtn.isVisible({ timeout: 1000 })) {
  89  |             await clearBtn.click();
  90  |         }
  91  |     });
  92  | });
  93  | 
  94  | // ═══════════════════════════════════════════════════════════════════════════════
  95  | // Sphere / Cylinder / Axis / Add
  96  | // ═══════════════════════════════════════════════════════════════════════════════
  97  | test.describe('Refraction – Sph/Cyl/Axis/Add', () => {
  98  |     test.beforeEach(async ({ page }) => {
  99  |         await goToDashboard(page);
  100 |         await goToRefractionTab(page);
  101 |     });
  102 | 
  103 |     test('OBJ and SUB labels are present in refraction panel', async ({ page }) => {
  104 |         const objLabels = await page.getByText('OBJ').all();
  105 |         const subLabels = await page.getByText('SUB').all();
  106 |         expect(objLabels.length + subLabels.length).toBeGreaterThan(0);
  107 |     });
  108 | 
  109 |     test('typing -1.25 in sph field filters dropdown correctly', async ({ page }) => {
  110 |         // Find SPH inputs (labeled SPH)
  111 |         const sphInputs = page.locator('input').filter({ hasText: '' }).all();
  112 |         // Look for inputs near SPH label
  113 |         const sphLabel = page.getByText('SPH').first();
  114 |         const sphInput = sphLabel.locator('..').locator('input').first();
  115 |         await sphInput.click();
  116 |         await sphInput.fill('-1.25');
  117 |         await page.waitForTimeout(300);
  118 |         // The dropdown should show -1.25
  119 |         const option = page.locator('[data-value="-1.25"]').first();
  120 |         if (await option.isVisible({ timeout: 2000 })) {
  121 |             await option.click();
  122 |         }
  123 |     });
  124 | 
  125 |     test('entering axis value updates the field', async ({ page }) => {
  126 |         const axisInputs = page.getByText('AXE').first()
  127 |             .locator('..').locator('input');
  128 |         if (await axisInputs.isVisible({ timeout: 2000 })) {
  129 |             await axisInputs.click();
  130 |             await axisInputs.fill('90');
  131 |             await page.waitForTimeout(300);
  132 |             const option = page.locator('[data-value="90"]').first();
  133 |             if (await option.isVisible({ timeout: 2000 })) {
  134 |                 await option.click();
  135 |             }
  136 |         }
  137 |     });
  138 | });
  139 | 
  140 | // ═══════════════════════════════════════════════════════════════════════════════
  141 | // Copy OD ↔ OG
  142 | // ═══════════════════════════════════════════════════════════════════════════════
  143 | test.describe('Refraction – copy buttons', () => {
  144 |     test.beforeEach(async ({ page }) => {
  145 |         await goToDashboard(page);
  146 |         await goToRefractionTab(page);
  147 |     });
  148 | 
  149 |     test('OG → OD copy button is visible', async ({ page }) => {
  150 |         await expect(page.getByRole('button', { name: /OG.*OD/i }).or(
  151 |             page.locator('button').filter({ hasText: 'OG' }).filter({ hasText: 'OD' })
  152 |         )).toBeVisible({ timeout: 5000 });
  153 |     });
  154 | 
  155 |     test('OD → OG copy button is visible', async ({ page }) => {
  156 |         await expect(page.getByRole('button', { name: /OD.*OG/i }).or(
  157 |             page.locator('button').filter({ hasText: 'OD' }).filter({ hasText: 'OG' })
  158 |         )).toBeVisible({ timeout: 5000 });
  159 |     });
  160 | 
  161 |     test('clicking OG → OD copies left eye data to right', async ({ page }) => {
  162 |         // This is a smoke test – actual copy verification requires checking store
  163 |         const copyBtn = page.getByRole('button', { name: /OG.*OD/i }).first();
  164 |         if (await copyBtn.isVisible({ timeout: 3000 })) {
  165 |             await copyBtn.click();
  166 |             // No error should occur
  167 |         }
  168 |     });
  169 | 
  170 |     test('clicking OD → OG copies right eye data to left', async ({ page }) => {
  171 |         const copyBtn = page.getByRole('button', { name: /OD.*OG/i }).first();
  172 |         if (await copyBtn.isVisible({ timeout: 3000 })) {
  173 |             await copyBtn.click();
  174 |         }
  175 |     });
  176 | });
  177 | 
  178 | // ═══════════════════════════════════════════════════════════════════════════════
  179 | // Keratometry
  180 | // ═══════════════════════════════════════════════════════════════════════════════
  181 | test.describe('Refraction – keratometry', () => {
  182 |     test.beforeEach(async ({ page }) => {
  183 |         await goToDashboard(page);
  184 |         await goToRefractionTab(page);
  185 |     });
  186 | 
```