# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: prescription.spec.ts >> Prescription – adding >> clicking Ajouter adds a new prescription card
- Location: tests\e2e\prescription.spec.ts:57:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.textContent: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText(/Médicaments \((\d+)\)/)

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
  1   | /**
  2   |  * E2E: Prescription Tab – Add, edit, delete medications
  3   |  *
  4   |  * Tests the full prescription workflow: adding new medications,
  5   |  * filling all fields (name, dosage, frequency, duration, instructions),
  6   |  * medicine autocomplete, and deleting prescriptions.
  7   |  */
  8   | import { test, expect, Page } from '@playwright/test';
  9   | import { loginAsDoctor, waitForDashboardReady, saveConsultation } from './helpers/dashboard';
  10  | 
  11  | const TEST_PATIENT_ID = process.env.E2E_PATIENT_ID || 'test-patient-1';
  12  | 
  13  | async function goToPrescriptionTab(page: Page) {
  14  |     await loginAsDoctor(page);
  15  |     await page.goto(`/doctor?patientId=${TEST_PATIENT_ID}`);
  16  |     await waitForDashboardReady(page);
  17  | 
  18  |     const tab = page.getByRole('tab', { name: /Prescription|Médicament/i });
  19  |     if (await tab.isVisible({ timeout: 3000 })) {
  20  |         await tab.click();
  21  |         await page.waitForTimeout(300);
  22  |     }
  23  | }
  24  | 
  25  | // ═══════════════════════════════════════════════════════════════════════════════
  26  | // Empty state
  27  | // ═══════════════════════════════════════════════════════════════════════════════
  28  | test.describe('Prescription – empty state', () => {
  29  |     test.beforeEach(async ({ page }) => {
  30  |         await goToPrescriptionTab(page);
  31  |     });
  32  | 
  33  |     test('shows empty state or existing prescriptions', async ({ page }) => {
  34  |         // Either no prescriptions (shows empty placeholder)
  35  |         // or existing ones (from DB) are shown
  36  |         const hasPrescriptions = await page.getByText(/Médicaments \(\d+\)/).isVisible({ timeout: 3000 });
  37  |         expect(hasPrescriptions).toBe(true);
  38  |     });
  39  | 
  40  |     test('shows Ajouter button', async ({ page }) => {
  41  |         await expect(page.getByRole('button', { name: /Ajouter/i })).toBeVisible();
  42  |     });
  43  | 
  44  |     test('shows Nouveau médicament button', async ({ page }) => {
  45  |         await expect(page.getByRole('button', { name: /Nouveau médicament|New Medicine/i })).toBeVisible({ timeout: 3000 });
  46  |     });
  47  | });
  48  | 
  49  | // ═══════════════════════════════════════════════════════════════════════════════
  50  | // Adding prescriptions
  51  | // ═══════════════════════════════════════════════════════════════════════════════
  52  | test.describe('Prescription – adding', () => {
  53  |     test.beforeEach(async ({ page }) => {
  54  |         await goToPrescriptionTab(page);
  55  |     });
  56  | 
  57  |     test('clicking Ajouter adds a new prescription card', async ({ page }) => {
> 58  |         const countBefore = await page.getByText(/Médicaments \((\d+)\)/).textContent();
      |                                                                           ^ Error: locator.textContent: Test timeout of 30000ms exceeded.
  59  |         const numBefore = parseInt(countBefore?.match(/\((\d+)\)/)?.[1] || '0');
  60  | 
  61  |         await page.getByRole('button', { name: /Ajouter/i }).click();
  62  |         await page.waitForTimeout(300);
  63  | 
  64  |         const countAfter = await page.getByText(/Médicaments \((\d+)\)/).textContent();
  65  |         const numAfter = parseInt(countAfter?.match(/\((\d+)\)/)?.[1] || '0');
  66  |         expect(numAfter).toBe(numBefore + 1);
  67  |     });
  68  | 
  69  |     test('new prescription card shows all form fields', async ({ page }) => {
  70  |         await page.getByRole('button', { name: /Ajouter/i }).click();
  71  |         await page.waitForTimeout(300);
  72  | 
  73  |         await expect(page.getByText('Nom du médicament')).toBeVisible();
  74  |         await expect(page.getByText('Dosage')).toBeVisible();
  75  |         await expect(page.getByText('Fréquence')).toBeVisible();
  76  |         await expect(page.getByText('Durée')).toBeVisible();
  77  |         await expect(page.getByText('Instructions')).toBeVisible();
  78  |     });
  79  | 
  80  |     test('adding two prescriptions shows count of 2 (or more)', async ({ page }) => {
  81  |         await page.getByRole('button', { name: /Ajouter/i }).click();
  82  |         await page.getByRole('button', { name: /Ajouter/i }).click();
  83  |         await page.waitForTimeout(300);
  84  | 
  85  |         const countText = await page.getByText(/Médicaments \(\d+\)/).textContent();
  86  |         const num = parseInt(countText?.match(/\((\d+)\)/)?.[1] || '0');
  87  |         expect(num).toBeGreaterThanOrEqual(2);
  88  |     });
  89  | });
  90  | 
  91  | // ═══════════════════════════════════════════════════════════════════════════════
  92  | // Filling prescription fields
  93  | // ═══════════════════════════════════════════════════════════════════════════════
  94  | test.describe('Prescription – editing fields', () => {
  95  |     test.beforeEach(async ({ page }) => {
  96  |         await goToPrescriptionTab(page);
  97  |         // Add a fresh prescription
  98  |         await page.getByRole('button', { name: /Ajouter/i }).click();
  99  |         await page.waitForTimeout(400);
  100 |     });
  101 | 
  102 |     test('fills dosage field', async ({ page }) => {
  103 |         const dosageLabel = page.getByText('Dosage').first();
  104 |         const dosageInput = dosageLabel.locator('..').locator('input');
  105 |         await dosageInput.fill('500mg');
  106 |         await expect(dosageInput).toHaveValue('500mg');
  107 |     });
  108 | 
  109 |     test('fills fréquence field', async ({ page }) => {
  110 |         const freqLabel = page.getByText('Fréquence').first();
  111 |         const freqInput = freqLabel.locator('..').locator('input');
  112 |         await freqInput.fill('3 fois par jour');
  113 |         await expect(freqInput).toHaveValue('3 fois par jour');
  114 |     });
  115 | 
  116 |     test('fills durée field', async ({ page }) => {
  117 |         const durLabel = page.getByText('Durée').first();
  118 |         const durInput = durLabel.locator('..').locator('input');
  119 |         await durInput.fill('10 jours');
  120 |         await expect(durInput).toHaveValue('10 jours');
  121 |     });
  122 | 
  123 |     test('fills instructions textarea', async ({ page }) => {
  124 |         const instructLabel = page.getByText('Instructions').first();
  125 |         const instrTextarea = instructLabel.locator('..').locator('textarea');
  126 |         await instrTextarea.fill('Prendre avec les repas');
  127 |         await expect(instrTextarea).toHaveValue('Prendre avec les repas');
  128 |     });
  129 | });
  130 | 
  131 | // ═══════════════════════════════════════════════════════════════════════════════
  132 | // Medicine autocomplete
  133 | // ═══════════════════════════════════════════════════════════════════════════════
  134 | test.describe('Prescription – medicine autocomplete', () => {
  135 |     test.beforeEach(async ({ page }) => {
  136 |         await goToPrescriptionTab(page);
  137 |         await page.getByRole('button', { name: /Ajouter/i }).click();
  138 |         await page.waitForTimeout(400);
  139 |     });
  140 | 
  141 |     test('medicine name input is present in new prescription', async ({ page }) => {
  142 |         // MedicineAutocomplete renders an input
  143 |         const medicineSection = page.getByText('Nom du médicament').first().locator('..');
  144 |         const medicineInput = medicineSection.locator('input');
  145 |         await expect(medicineInput).toBeVisible();
  146 |     });
  147 | 
  148 |     test('typing in medicine input shows suggestions', async ({ page }) => {
  149 |         const medicineSection = page.getByText('Nom du médicament').first().locator('..');
  150 |         const medicineInput = medicineSection.locator('input').first();
  151 |         await medicineInput.click();
  152 |         await medicineInput.fill('Tim');
  153 |         await page.waitForTimeout(500);
  154 |         // Suggestions dropdown may appear
  155 |     });
  156 | });
  157 | 
  158 | // ═══════════════════════════════════════════════════════════════════════════════
```