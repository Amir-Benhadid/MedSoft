# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: clinical-exam.spec.ts >> Clinical Exam – save >> can save with clinical exam data filled
- Location: tests\e2e\clinical-exam.spec.ts:196:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Sauvegardée.')
Expected: visible
Error: strict mode violation: getByText('Sauvegardée.') resolved to 2 elements:
    1) <div class="text-sm opacity-90">Sauvegardée.</div> aka getByText('Sauvegardée.', { exact: true })
    2) <span role="status" aria-live="assertive">Notification SuccèsSauvegardée.</span> aka getByText('Notification SuccèsSauvegardé')

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Sauvegardée.')

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
            - button "Sauvegarder" [active] [ref=e21] [cursor=pointer]:
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
                  - textbox "Rien à signaler..." [ref=e289]: Normal
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
      - list [ref=e473]:
        - listitem [ref=e474]:
          - generic [ref=e475]:
            - generic [ref=e476]: Succès
            - generic [ref=e477]: Sauvegardée.
          - button [ref=e478] [cursor=pointer]:
            - img [ref=e479]
  - status [ref=e483]: Notification SuccèsSauvegardée.
```

# Test source

```ts
  105 |         await goToClinicalExam(page);
  106 |     });
  107 | 
  108 |     test('patient info card is visible', async ({ page }) => {
  109 |         await expect(page.getByText('Informations Patient')).toBeVisible({ timeout: 5000 });
  110 |     });
  111 | 
  112 |     test('patient name is displayed in info card', async ({ page }) => {
  113 |         const infoCard = page.getByText('Informations Patient').locator('../../..');
  114 |         // Patient name should be in the card
  115 |         await expect(infoCard).toBeVisible({ timeout: 5000 });
  116 |     });
  117 | 
  118 |     test('Antécédents Généraux field is visible', async ({ page }) => {
  119 |         await expect(page.getByText('Antécédents Généraux')).toBeVisible({ timeout: 5000 });
  120 |     });
  121 | 
  122 |     test('Antécédents Ophtalmologiques field is visible', async ({ page }) => {
  123 |         await expect(page.getByText('Antécédents Ophtalmologiques')).toBeVisible({ timeout: 5000 });
  124 |     });
  125 | 
  126 |     test('Diagnostic field is visible in patient info card', async ({ page }) => {
  127 |         await expect(page.getByText('Diagnostic')).toBeVisible({ timeout: 5000 });
  128 |     });
  129 | 
  130 |     test('Note field is visible', async ({ page }) => {
  131 |         await expect(page.getByText('Note')).toBeVisible({ timeout: 5000 });
  132 |     });
  133 | 
  134 |     test('hovering over Antécédents reveals expand button', async ({ page }) => {
  135 |         const antecedentCard = page.getByText('Antécédents Généraux').locator('../..');
  136 |         if (await antecedentCard.isVisible({ timeout: 3000 })) {
  137 |             await antecedentCard.hover();
  138 |             // Expand button should become visible
  139 |             const expandBtn = antecedentCard.locator('button');
  140 |             await expect(expandBtn).toBeVisible({ timeout: 2000 });
  141 |         }
  142 |     });
  143 | 
  144 |     test('clicking expand opens the antecedents dialog', async ({ page }) => {
  145 |         const antecedentCard = page.getByText('Antécédents Généraux').locator('../..');
  146 |         if (await antecedentCard.isVisible({ timeout: 3000 })) {
  147 |             await antecedentCard.hover();
  148 |             const expandBtn = antecedentCard.locator('button');
  149 |             if (await expandBtn.isVisible({ timeout: 2000 })) {
  150 |                 await expandBtn.click();
  151 |                 await expect(page.getByText('Modifier les Antécédents')).toBeVisible({ timeout: 3000 });
  152 |             }
  153 |         }
  154 |     });
  155 | 
  156 |     test('antecedents dialog can be closed with Fermer button', async ({ page }) => {
  157 |         const antecedentCard = page.getByText('Antécédents Généraux').locator('../..');
  158 |         if (await antecedentCard.isVisible({ timeout: 3000 })) {
  159 |             await antecedentCard.hover();
  160 |             const expandBtn = antecedentCard.locator('button');
  161 |             if (await expandBtn.isVisible({ timeout: 2000 })) {
  162 |                 await expandBtn.click();
  163 |                 const fermerBtn = page.getByRole('button', { name: /Fermer/i });
  164 |                 if (await fermerBtn.isVisible({ timeout: 3000 })) {
  165 |                     await fermerBtn.click();
  166 |                     await expect(page.getByText('Modifier les Antécédents')).not.toBeVisible({ timeout: 3000 });
  167 |                 }
  168 |             }
  169 |         }
  170 |     });
  171 | });
  172 | 
  173 | // ═══════════════════════════════════════════════════════════════════════════════
  174 | // FO Dilation highlight
  175 | // ═══════════════════════════════════════════════════════════════════════════════
  176 | test.describe('Clinical Exam – FO dilation highlight', () => {
  177 |     test.beforeEach(async ({ page }) => {
  178 |         await goToClinicalExam(page);
  179 |     });
  180 | 
  181 |     test('FO section gets amber ring when dilation is active in refraction', async ({ page }) => {
  182 |         // Navigate to refraction to trigger dilation
  183 |         const refrTab = page.getByRole('tab', { name: /Réfraction/i });
  184 |         if (await refrTab.isVisible({ timeout: 2000 })) {
  185 |             await refrTab.click();
  186 |             // If there's an active dilation, the FO section in clinical exam
  187 |             // will show an amber ring – this is a visual indicator
  188 |         }
  189 |     });
  190 | });
  191 | 
  192 | // ═══════════════════════════════════════════════════════════════════════════════
  193 | // Saving clinical exam data
  194 | // ═══════════════════════════════════════════════════════════════════════════════
  195 | test.describe('Clinical Exam – save', () => {
  196 |     test('can save with clinical exam data filled', async ({ page }) => {
  197 |         await goToClinicalExam(page);
  198 | 
  199 |         const inspInput = page.locator('input[placeholder="Rien à signaler..."]');
  200 |         if (await inspInput.isVisible({ timeout: 2000 })) {
  201 |             await inspInput.fill('Normal');
  202 |         }
  203 | 
  204 |         await page.getByRole('button', { name: /Sauvegarder/i }).click();
> 205 |         await expect(page.getByText('Sauvegardée.')).toBeVisible({ timeout: 10000 });
      |                                                      ^ Error: expect(locator).toBeVisible() failed
  206 |     });
  207 | });
  208 | 
```