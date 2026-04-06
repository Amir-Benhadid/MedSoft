# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tonometry.spec.ts >> Tonometry – corrected IOP back-calculation >> entering corrected IOP back-calculates Air IOP
- Location: tests\e2e\tonometry.spec.ts:218:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.inputValue: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByText('Air').first().locator('..').locator('input').first()

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
                    - textbox "-" [ref=e243]: "18"
                    - img [ref=e244] [cursor=pointer]
                - generic [ref=e247]:
                  - generic [ref=e248]: App
                  - generic [ref=e249]:
                    - textbox "-" [ref=e250]
                    - img
                - generic [ref=e251]:
                  - generic [ref=e252]: Cor
                  - textbox "-" [active] [ref=e253]: "18"
                - generic [ref=e254]:
                  - generic [ref=e255]: Pac
                  - generic [ref=e256]:
                    - textbox "-" [ref=e257]: "545"
                    - img [ref=e258] [cursor=pointer]
                - generic [ref=e261]:
                  - generic [ref=e262]: Heure
                  - textbox [ref=e264]: 20:02
              - generic [ref=e266]:
                - generic [ref=e267]:
                  - generic [ref=e268]: Air
                  - generic [ref=e269]:
                    - textbox "-" [ref=e270]
                    - img
                - generic [ref=e271]:
                  - generic [ref=e272]: App
                  - generic [ref=e273]:
                    - textbox "-" [ref=e274]
                    - img
                - generic [ref=e275]:
                  - generic [ref=e276]: Cor
                  - textbox "-" [ref=e277]
                - generic [ref=e278]:
                  - generic [ref=e279]: Pac
                  - generic [ref=e280]:
                    - textbox "-" [ref=e281]
                    - img
                - generic [ref=e282]:
                  - generic [ref=e283]: Heure
                  - textbox [ref=e285]
          - generic [ref=e288]:
            - generic [ref=e289]:
              - generic [ref=e290]:
                - generic "Inspection" [ref=e291]:
                  - generic [ref=e292]: INSP
                - textbox "Rien à signaler..." [ref=e295]
              - generic [ref=e296]:
                - generic "Motilité" [ref=e297]:
                  - generic [ref=e298]: MOT
                - textbox "Normal..." [ref=e301]
            - generic [ref=e302]:
              - generic [ref=e303]:
                - generic "Segment Antérieur" [ref=e304]:
                  - generic [ref=e305]: SEG ANT
                - textbox "Examen segment antérieur..." [ref=e309]
              - generic [ref=e310]:
                - generic "Fond d'œil" [ref=e311]:
                  - generic [ref=e312]: FO
                - textbox "Examen du fond d'œil..." [ref=e314]
            - generic [ref=e315]:
              - generic [ref=e316]:
                - generic "Diagnostic" [ref=e317]:
                  - generic [ref=e318]: DIAG
                - textbox "Diagnostic..." [ref=e322]
              - generic [ref=e323]:
                - generic "Traitement" [ref=e324]:
                  - generic [ref=e325]: CDT
                - textbox "Traitement prescrit..." [ref=e327]
        - generic [ref=e328]:
          - generic [ref=e331]:
            - generic [ref=e333]: Informations Patient
            - generic [ref=e335]:
              - generic [ref=e336]:
                - img [ref=e338]
                - generic [ref=e341]:
                  - heading [level=2]
                  - generic [ref=e342]: N/A
              - generic [ref=e343]:
                - generic [ref=e344]:
                  - generic [ref=e345]:
                    - generic [ref=e346]: Antécédents Généraux
                    - button [ref=e347] [cursor=pointer]:
                      - img [ref=e348]
                  - textbox "-" [ref=e355]: Aucun
                - generic [ref=e356]:
                  - generic [ref=e357]: Diagnostic
                  - textbox "-" [ref=e360]
                - generic [ref=e361]:
                  - generic [ref=e362]:
                    - generic [ref=e363]: Antécédents Ophtalmologiques
                    - button [ref=e364] [cursor=pointer]:
                      - img [ref=e365]
                  - textbox "-" [ref=e372]: Myopie
                - generic [ref=e373]:
                  - generic [ref=e374]: Note
                  - textbox "-" [ref=e376]
          - generic [ref=e379]:
            - generic [ref=e380]:
              - generic [ref=e381]:
                - generic [ref=e382]:
                  - button [disabled]:
                    - img
                  - button [ref=e383] [cursor=pointer]:
                    - img [ref=e384]
                - generic [ref=e387]:
                  - button "Ordonnance" [ref=e388] [cursor=pointer]:
                    - img [ref=e389]
                    - generic [ref=e392]: Ordonnance
                  - button "Lunettes" [ref=e393] [cursor=pointer]:
                    - img [ref=e394]
                    - generic [ref=e397]: Lunettes
                  - button "Lentilles" [ref=e398] [cursor=pointer]:
                    - img [ref=e399]
                    - generic [ref=e402]: Lentilles
                  - button "Compte Rendu" [ref=e403] [cursor=pointer]:
                    - img [ref=e404]
                    - generic [ref=e407]: Compte Rendu
                  - button "Certificat" [ref=e408] [cursor=pointer]:
                    - img [ref=e409]
                    - generic [ref=e413]: Certificat
              - button "Aperçu" [ref=e415] [cursor=pointer]:
                - img [ref=e416]
            - generic [ref=e419]:
              - generic [ref=e425]:
                - generic [ref=e426]:
                  - generic [ref=e427]:
                    - img [ref=e429]
                    - generic [ref=e432]:
                      - heading "Médicaments" [level=4] [ref=e433]
                      - paragraph [ref=e434]: Gérer l'ordonnance
                  - button "Ajouter" [ref=e435] [cursor=pointer]:
                    - img [ref=e436]
                    - text: Ajouter
                - generic [ref=e438]:
                  - img [ref=e440]
                  - generic [ref=e443]: Aucun médicament prescrit
                  - generic [ref=e444]: Cliquez sur "Ajouter" pour rédiger une ordonnance
              - generic [ref=e446]:
                - generic [ref=e448]:
                  - heading "Aperçu du document" [level=3] [ref=e449]
                  - generic [ref=e450]:
                    - button "Imprimer" [ref=e451] [cursor=pointer]:
                      - img [ref=e452]
                      - generic [ref=e456]: Imprimer
                    - button "Aperçu PDF" [ref=e457] [cursor=pointer]:
                      - img [ref=e458]
                      - generic [ref=e462]: Aperçu PDF
                - generic [ref=e474]: Aucun médicament prescrit
    - button [ref=e476] [cursor=pointer]:
      - img
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
  135 |         const airLabel = page.getByText('Air').first();
  136 |         const airInput = airLabel.locator('..').locator('input').first();
  137 |         await airInput.click();
  138 |         await airInput.fill('16');
  139 |         await page.waitForTimeout(200);
  140 |         const airOption = page.locator('[data-value="16"]').first();
  141 |         if (await airOption.isVisible({ timeout: 2000 })) {
  142 |             await airOption.click();
  143 |         }
  144 | 
  145 |         const pacLabel = page.getByText('Pac').first();
  146 |         const pacInput = pacLabel.locator('..').locator('input').first();
  147 |         await pacInput.click();
  148 |         await pacInput.fill('545');
  149 |         await page.waitForTimeout(200);
  150 |         const pacOption = page.locator('[data-value="545"]').first();
  151 |         if (await pacOption.isVisible({ timeout: 2000 })) {
  152 |             await pacOption.click();
  153 |         }
  154 | 
  155 |         // Corrected IOP should auto-populate
  156 |         await page.waitForTimeout(500);
  157 |         const corLabel = page.getByText('Cor').first();
  158 |         const corInput = corLabel.locator('..').locator('input').first();
  159 |         const corValue = await corInput.inputValue();
  160 |         // With air=16, pachy=545: corrected = 16 - 0 = 16
  161 |         expect(corValue).toBe('16');
  162 |     });
  163 | 
  164 |     test('IOP auto-calculation: thin cornea (450µm) increases corrected IOP', async ({ page }) => {
  165 |         const airLabel = page.getByText('Air').first();
  166 |         const airInput = airLabel.locator('..').locator('input').first();
  167 |         await airInput.click();
  168 |         await airInput.fill('16');
  169 |         const airOption = page.locator('[data-value="16"]').first();
  170 |         if (await airOption.isVisible({ timeout: 2000 })) await airOption.click();
  171 | 
  172 |         const pacLabel = page.getByText('Pac').first();
  173 |         const pacInput = pacLabel.locator('..').locator('input').first();
  174 |         await pacInput.click();
  175 |         await pacInput.fill('450');
  176 |         const pacOption = page.locator('[data-value="450"]').first();
  177 |         if (await pacOption.isVisible({ timeout: 2000 })) await pacOption.click();
  178 | 
  179 |         await page.waitForTimeout(500);
  180 |         const corInput = page.getByText('Cor').first().locator('..').locator('input').first();
  181 |         const corValue = await corInput.inputValue();
  182 |         // corrected = 16 - ((450-545)/50 * 2.5) = 16 + 4.75 ≈ 21
  183 |         const val = parseInt(corValue);
  184 |         expect(val).toBeGreaterThan(16);
  185 |     });
  186 | 
  187 |     test('auto-sets time when entering first IOP value', async ({ page }) => {
  188 |         const timeInputs = await page.locator('input[type="time"]').all();
  189 |         expect(timeInputs.length).toBeGreaterThanOrEqual(2);
  190 | 
  191 |         const firstTimeInput = timeInputs[0];
  192 |         const valueBefore = await firstTimeInput.inputValue();
  193 |         expect(valueBefore).toBe('');
  194 | 
  195 |         // Enter an Air IOP value
  196 |         const airLabel = page.getByText('Air').first();
  197 |         const airInput = airLabel.locator('..').locator('input').first();
  198 |         await airInput.click();
  199 |         await airInput.fill('15');
  200 |         const opt = page.locator('[data-value="15"]').first();
  201 |         if (await opt.isVisible({ timeout: 2000 })) await opt.click();
  202 | 
  203 |         await page.waitForTimeout(300);
  204 |         const valueAfter = await firstTimeInput.inputValue();
  205 |         // Time should be auto-set to current time (HH:MM format)
  206 |         expect(valueAfter).toMatch(/^\d{2}:\d{2}$/);
  207 |     });
  208 | });
  209 | 
  210 | // ═══════════════════════════════════════════════════════════════════════════════
  211 | // Corrected IOP back-calculation
  212 | // ═══════════════════════════════════════════════════════════════════════════════
  213 | test.describe('Tonometry – corrected IOP back-calculation', () => {
  214 |     test.beforeEach(async ({ page }) => {
  215 |         await goToTonometryTab(page);
  216 |     });
  217 | 
  218 |     test('entering corrected IOP back-calculates Air IOP', async ({ page }) => {
  219 |         // First set pachymetry
  220 |         const pacInput = page.getByText('Pac').first().locator('..').locator('input').first();
  221 |         await pacInput.click();
  222 |         await pacInput.fill('545');
  223 |         const pacOpt = page.locator('[data-value="545"]').first();
  224 |         if (await pacOpt.isVisible({ timeout: 2000 })) await pacOpt.click();
  225 | 
  226 |         // Now enter corrected IOP
  227 |         const corInput = page.getByText('Cor').first().locator('..').locator('input').first();
  228 |         await corInput.click();
  229 |         await corInput.fill('18');
  230 |         // Wait for debounce
  231 |         await page.waitForTimeout(600);
  232 | 
  233 |         // Air IOP should be back-calculated to 18 (since pachy=545, correction factor=0)
  234 |         const airInput = page.getByText('Air').first().locator('..').locator('input').first();
> 235 |         const airValue = await airInput.inputValue();
      |                                         ^ Error: locator.inputValue: Test timeout of 30000ms exceeded.
  236 |         expect(airValue).toBe('18');
  237 |     });
  238 | });
  239 | 
  240 | // ═══════════════════════════════════════════════════════════════════════════════
  241 | // Time input
  242 | // ═══════════════════════════════════════════════════════════════════════════════
  243 | test.describe('Tonometry – time input', () => {
  244 |     test.beforeEach(async ({ page }) => {
  245 |         await goToTonometryTab(page);
  246 |     });
  247 | 
  248 |     test('time input accepts HH:MM format', async ({ page }) => {
  249 |         const timeInputs = await page.locator('input[type="time"]').all();
  250 |         const firstTime = timeInputs[0];
  251 |         await firstTime.fill('10:30');
  252 |         await expect(firstTime).toHaveValue('10:30');
  253 |     });
  254 | 
  255 |     test('time input is present for both eyes', async ({ page }) => {
  256 |         const timeInputs = await page.locator('input[type="time"]').all();
  257 |         expect(timeInputs.length).toBe(2);
  258 |     });
  259 | });
  260 | 
```