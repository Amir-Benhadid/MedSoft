# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: save-and-finish.spec.ts >> Full workflow – fill, save, finish >> fill refraction data then save
- Location: tests\e2e\save-and-finish.spec.ts:206:5

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
  204 |     });
  205 | 
  206 |     test('fill refraction data then save', async ({ page }) => {
  207 |         await goToDashboard(page);
  208 | 
  209 |         // Navigate to refraction tab if it exists
  210 |         const refrTab = page.getByRole('tab', { name: /Réfraction/i });
  211 |         if (await refrTab.isVisible({ timeout: 2000 })) {
  212 |             await refrTab.click();
  213 |             await page.waitForTimeout(300);
  214 | 
  215 |             // Try to fill VA for OD
  216 |             const scInputs = page.locator('input[placeholder="SC"]');
  217 |             const firstSC = scInputs.first();
  218 |             await firstSC.click();
  219 |             await firstSC.fill('10/10');
  220 |             await page.waitForTimeout(200);
  221 |             const option = page.locator('[data-value="10/10"]').first();
  222 |             if (await option.isVisible({ timeout: 2000 })) {
  223 |                 await option.click();
  224 |             }
  225 |         }
  226 | 
  227 |         // Save
  228 |         await page.getByRole('button', { name: /Sauvegarder/i }).click();
> 229 |         await expect(page.getByText('Sauvegardée.')).toBeVisible({ timeout: 10000 });
      |                                                      ^ Error: expect(locator).toBeVisible() failed
  230 |     });
  231 | 
  232 |     test('fill prescription then save', async ({ page }) => {
  233 |         await goToDashboard(page);
  234 | 
  235 |         // Navigate to prescription tab
  236 |         const rxTab = page.getByRole('tab', { name: /Prescription|Médicament/i });
  237 |         if (await rxTab.isVisible({ timeout: 2000 })) {
  238 |             await rxTab.click();
  239 |             await page.waitForTimeout(300);
  240 | 
  241 |             await page.getByRole('button', { name: /Ajouter/i }).click();
  242 |             await page.waitForTimeout(300);
  243 | 
  244 |             const dosageInput = page.getByText('Dosage').first().locator('..').locator('input');
  245 |             await dosageInput.fill('500mg');
  246 |         }
  247 | 
  248 |         await page.getByRole('button', { name: /Sauvegarder/i }).click();
  249 |         await expect(page.getByText('Sauvegardée.')).toBeVisible({ timeout: 10000 });
  250 |     });
  251 | });
  252 | 
```