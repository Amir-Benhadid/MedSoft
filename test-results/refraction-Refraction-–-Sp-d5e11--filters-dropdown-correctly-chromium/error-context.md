# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: refraction.spec.ts >> Refraction – Sph/Cyl/Axis/Add >> typing -1.25 in sph field filters dropdown correctly
- Location: tests\e2e\refraction.spec.ts:109:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText('SPH').first().locator('..').locator('input').first()

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
                          - textbox "SC" [ref=e58]
                          - img
                        - generic [ref=e59]:
                          - textbox "AC" [ref=e60]
                          - img
                      - generic [ref=e61]: VP
                      - generic [ref=e62]:
                        - generic [ref=e63]:
                          - textbox "SC" [ref=e64]
                          - img
                        - generic [ref=e65]:
                          - textbox "AC" [ref=e66]
                          - img
                  - generic [ref=e67]:
                    - generic [ref=e69]:
                      - generic [ref=e70]: Sphère
                      - generic [ref=e71]: Cylindre
                      - generic [ref=e72]: Axe
                      - generic [ref=e73]: Add
                    - generic [ref=e75]:
                      - generic "Réfraction Objective" [ref=e76]:
                        - generic [ref=e77]: OBJ
                      - generic [ref=e79]:
                        - generic [ref=e80]:
                          - textbox "-" [ref=e81]
                          - img
                        - generic [ref=e82]:
                          - textbox "-" [ref=e83]
                          - img
                        - generic [ref=e84]:
                          - textbox "-" [ref=e85]
                          - img
                        - generic [ref=e86]:
                          - textbox "-" [ref=e87]
                          - img
                    - generic [ref=e89]:
                      - generic "Réfraction Subjective" [ref=e90]:
                        - generic [ref=e91]: SUB
                      - generic [ref=e93]:
                        - generic [ref=e94]:
                          - textbox "-" [ref=e95]
                          - img
                        - generic [ref=e96]:
                          - textbox "-" [ref=e97]
                          - img
                        - generic [ref=e98]:
                          - textbox "-" [ref=e99]
                          - img
                        - generic [ref=e100]:
                          - textbox "-" [ref=e101]
                          - img
                  - generic [ref=e102]:
                    - generic [ref=e103]:
                      - generic "Kératométrie" [ref=e104]:
                        - generic [ref=e105]: KER
                      - generic [ref=e107]:
                        - generic [ref=e108]:
                          - textbox "R0" [ref=e110]
                          - textbox "DL" [ref=e112]
                        - generic [ref=e113]:
                          - generic [ref=e114]:
                            - textbox "K1" [ref=e115]
                            - img
                          - generic [ref=e116]:
                            - textbox "K2" [ref=e117]
                            - img
                    - generic [ref=e118]:
                      - generic "Lentilles de Contact" [ref=e119]:
                        - generic [ref=e120]: LEN
                      - generic [ref=e122]:
                        - generic [ref=e123]:
                          - generic [ref=e124]:
                            - textbox "Type" [ref=e125]
                            - img
                          - generic [ref=e126]:
                            - textbox "Matière" [ref=e127]
                            - img
                        - generic [ref=e128]:
                          - generic [ref=e129]:
                            - textbox "Marque" [ref=e130]
                            - img
                          - generic [ref=e131]:
                            - textbox "Verres" [ref=e132]
                            - img
              - generic [ref=e133]:
                - generic [ref=e134]:
                  - generic [ref=e136]: OG
                  - button "OD → OG" [ref=e138] [cursor=pointer]:
                    - img [ref=e139]
                    - text: OD → OG
                - generic [ref=e142]:
                  - generic [ref=e144]:
                    - generic "Acuité Visuelle" [ref=e145]:
                      - generic [ref=e146]: AV
                    - generic [ref=e148]:
                      - generic [ref=e149]: VL
                      - generic [ref=e150]:
                        - generic [ref=e151]:
                          - textbox "SC" [ref=e152]
                          - img
                        - generic [ref=e153]:
                          - textbox "AC" [ref=e154]
                          - img
                      - generic [ref=e155]: VP
                      - generic [ref=e156]:
                        - generic [ref=e157]:
                          - textbox "SC" [ref=e158]
                          - img
                        - generic [ref=e159]:
                          - textbox "AC" [ref=e160]
                          - img
                  - generic [ref=e161]:
                    - generic [ref=e163]:
                      - generic [ref=e164]: Sphère
                      - generic [ref=e165]: Cylindre
                      - generic [ref=e166]: Axe
                      - generic [ref=e167]: Add
                    - generic [ref=e169]:
                      - generic "Réfraction Objective" [ref=e170]:
                        - generic [ref=e171]: OBJ
                      - generic [ref=e173]:
                        - generic [ref=e174]:
                          - textbox "-" [ref=e175]
                          - img
                        - generic [ref=e176]:
                          - textbox "-" [ref=e177]
                          - img
                        - generic [ref=e178]:
                          - textbox "-" [ref=e179]
                          - img
                        - generic [ref=e180]:
                          - textbox "-" [ref=e181]
                          - img
                    - generic [ref=e183]:
                      - generic "Réfraction Subjective" [ref=e184]:
                        - generic [ref=e185]: SUB
                      - generic [ref=e187]:
                        - generic [ref=e188]:
                          - textbox "-" [ref=e189]
                          - img
                        - generic [ref=e190]:
                          - textbox "-" [ref=e191]
                          - img
                        - generic [ref=e192]:
                          - textbox "-" [ref=e193]
                          - img
                        - generic [ref=e194]:
                          - textbox "-" [ref=e195]
                          - img
                  - generic [ref=e196]:
                    - generic [ref=e197]:
                      - generic "Kératométrie" [ref=e198]:
                        - generic [ref=e199]: KER
                      - generic [ref=e201]:
                        - generic [ref=e202]:
                          - textbox "R0" [ref=e204]
                          - textbox "DL" [ref=e206]
                        - generic [ref=e207]:
                          - generic [ref=e208]:
                            - textbox "K1" [ref=e209]
                            - img
                          - generic [ref=e210]:
                            - textbox "K2" [ref=e211]
                            - img
                    - generic [ref=e212]:
                      - generic "Lentilles de Contact" [ref=e213]:
                        - generic [ref=e214]: LEN
                      - generic [ref=e216]:
                        - generic [ref=e217]:
                          - generic [ref=e218]:
                            - textbox "Type" [ref=e219]
                            - img
                          - generic [ref=e220]:
                            - textbox "Matière" [ref=e221]
                            - img
                        - generic [ref=e222]:
                          - generic [ref=e223]:
                            - textbox "Marque" [ref=e224]
                            - img
                          - generic [ref=e225]:
                            - textbox "Verres" [ref=e226]
                            - img
          - generic [ref=e229]:
            - generic [ref=e230]:
              - generic [ref=e231]: Tonométrie
              - button "Calcul via Air" [ref=e232] [cursor=pointer]:
                - img [ref=e233]
                - text: Calcul via Air
            - generic [ref=e237]:
              - generic [ref=e239]:
                - generic [ref=e240]:
                  - generic [ref=e241]: Air
                  - generic [ref=e242]:
                    - textbox "-" [ref=e243]
                    - img
                - generic [ref=e244]:
                  - generic [ref=e245]: App
                  - generic [ref=e246]:
                    - textbox "-" [ref=e247]
                    - img
                - generic [ref=e248]:
                  - generic [ref=e249]: Cor
                  - textbox "-" [ref=e250]
                - generic [ref=e251]:
                  - generic [ref=e252]: Pac
                  - generic [ref=e253]:
                    - textbox "-" [ref=e254]
                    - img
                - generic [ref=e255]:
                  - generic [ref=e256]: Heure
                  - textbox [ref=e258]
              - generic [ref=e260]:
                - generic [ref=e261]:
                  - generic [ref=e262]: Air
                  - generic [ref=e263]:
                    - textbox "-" [ref=e264]
                    - img
                - generic [ref=e265]:
                  - generic [ref=e266]: App
                  - generic [ref=e267]:
                    - textbox "-" [ref=e268]
                    - img
                - generic [ref=e269]:
                  - generic [ref=e270]: Cor
                  - textbox "-" [ref=e271]
                - generic [ref=e272]:
                  - generic [ref=e273]: Pac
                  - generic [ref=e274]:
                    - textbox "-" [ref=e275]
                    - img
                - generic [ref=e276]:
                  - generic [ref=e277]: Heure
                  - textbox [ref=e279]
          - generic [ref=e282]:
            - generic [ref=e283]:
              - generic [ref=e284]:
                - generic "Inspection" [ref=e285]:
                  - generic [ref=e286]: INSP
                - textbox "Rien à signaler..." [ref=e289]
              - generic [ref=e290]:
                - generic "Motilité" [ref=e291]:
                  - generic [ref=e292]: MOT
                - textbox "Normal..." [ref=e295]
            - generic [ref=e296]:
              - generic [ref=e297]:
                - generic "Segment Antérieur" [ref=e298]:
                  - generic [ref=e299]: SEG ANT
                - textbox "Examen segment antérieur..." [ref=e303]
              - generic [ref=e304]:
                - generic "Fond d'œil" [ref=e305]:
                  - generic [ref=e306]: FO
                - textbox "Examen du fond d'œil..." [ref=e308]
            - generic [ref=e309]:
              - generic [ref=e310]:
                - generic "Diagnostic" [ref=e311]:
                  - generic [ref=e312]: DIAG
                - textbox "Diagnostic..." [ref=e316]
              - generic [ref=e317]:
                - generic "Traitement" [ref=e318]:
                  - generic [ref=e319]: CDT
                - textbox "Traitement prescrit..." [ref=e321]
        - generic [ref=e322]:
          - generic [ref=e325]:
            - generic [ref=e327]: Informations Patient
            - generic [ref=e329]:
              - generic [ref=e330]:
                - img [ref=e332]
                - generic [ref=e335]:
                  - heading [level=2]
                  - generic [ref=e336]: N/A
              - generic [ref=e337]:
                - generic [ref=e338]:
                  - generic [ref=e339]:
                    - generic [ref=e340]: Antécédents Généraux
                    - button [ref=e341] [cursor=pointer]:
                      - img [ref=e342]
                  - textbox "-" [ref=e349]: Aucun
                - generic [ref=e350]:
                  - generic [ref=e351]: Diagnostic
                  - textbox "-" [ref=e354]
                - generic [ref=e355]:
                  - generic [ref=e356]:
                    - generic [ref=e357]: Antécédents Ophtalmologiques
                    - button [ref=e358] [cursor=pointer]:
                      - img [ref=e359]
                  - textbox "-" [ref=e366]: Myopie
                - generic [ref=e367]:
                  - generic [ref=e368]: Note
                  - textbox "-" [ref=e370]
          - generic [ref=e373]:
            - generic [ref=e374]:
              - generic [ref=e375]:
                - generic [ref=e376]:
                  - button [disabled]:
                    - img
                  - button [ref=e377] [cursor=pointer]:
                    - img [ref=e378]
                - generic [ref=e381]:
                  - button "Ordonnance" [ref=e382] [cursor=pointer]:
                    - img [ref=e383]
                    - generic [ref=e386]: Ordonnance
                  - button "Lunettes" [ref=e387] [cursor=pointer]:
                    - img [ref=e388]
                    - generic [ref=e391]: Lunettes
                  - button "Lentilles" [ref=e392] [cursor=pointer]:
                    - img [ref=e393]
                    - generic [ref=e396]: Lentilles
                  - button "Compte Rendu" [ref=e397] [cursor=pointer]:
                    - img [ref=e398]
                    - generic [ref=e401]: Compte Rendu
                  - button "Certificat" [ref=e402] [cursor=pointer]:
                    - img [ref=e403]
                    - generic [ref=e407]: Certificat
              - button "Aperçu" [ref=e409] [cursor=pointer]:
                - img [ref=e410]
            - generic [ref=e413]:
              - generic [ref=e419]:
                - generic [ref=e420]:
                  - generic [ref=e421]:
                    - img [ref=e423]
                    - generic [ref=e426]:
                      - heading "Médicaments" [level=4] [ref=e427]
                      - paragraph [ref=e428]: Gérer l'ordonnance
                  - button "Ajouter" [ref=e429] [cursor=pointer]:
                    - img [ref=e430]
                    - text: Ajouter
                - generic [ref=e432]:
                  - img [ref=e434]
                  - generic [ref=e437]: Aucun médicament prescrit
                  - generic [ref=e438]: Cliquez sur "Ajouter" pour rédiger une ordonnance
              - generic [ref=e440]:
                - generic [ref=e442]:
                  - heading "Aperçu du document" [level=3] [ref=e443]
                  - generic [ref=e444]:
                    - button "Imprimer" [ref=e445] [cursor=pointer]:
                      - img [ref=e446]
                      - generic [ref=e450]: Imprimer
                    - button "Aperçu PDF" [ref=e451] [cursor=pointer]:
                      - img [ref=e452]
                      - generic [ref=e456]: Aperçu PDF
                - generic [ref=e468]: Aucun médicament prescrit
    - button [ref=e470] [cursor=pointer]:
      - img
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
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
  86  |         await firstSC.hover();
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
> 115 |         await sphInput.click();
      |                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  187 |     test('R0 and DL fields are visible in eye panel', async ({ page }) => {
  188 |         // Keratometry section
  189 |         const r0Label = page.getByText('R0').first();
  190 |         const dlLabel = page.getByText('DL').first();
  191 |         // Either of these should exist
  192 |         const hasKera = await r0Label.isVisible({ timeout: 3000 })
  193 |             .catch(() => false) || await dlLabel.isVisible({ timeout: 1000 }).catch(() => false);
  194 |         // Just check rendering doesn't crash
  195 |         expect(true).toBe(true);
  196 |     });
  197 | 
  198 |     test('K1 and K2 keratometry fields exist', async ({ page }) => {
  199 |         const k1 = page.getByText('K1').first();
  200 |         const k2 = page.getByText('K2').first();
  201 |         // Keratometry panel should have K values
  202 |     });
  203 | });
  204 | 
  205 | // ═══════════════════════════════════════════════════════════════════════════════
  206 | // Contact Lens section
  207 | // ═══════════════════════════════════════════════════════════════════════════════
  208 | test.describe('Refraction – contact lenses', () => {
  209 |     test.beforeEach(async ({ page }) => {
  210 |         await goToDashboard(page);
  211 |         await goToRefractionTab(page);
  212 |     });
  213 | 
  214 |     test('contact lens type dropdown exists', async ({ page }) => {
  215 |         // Look for "Sphérique" or "Torique" or the contact lens type label
```