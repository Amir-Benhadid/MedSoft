---
name: Test Infrastructure Setup
description: Vitest unit tests and Playwright E2E tests added for doctor dashboard
type: project
---

Unit tests (Vitest) and E2E tests (Playwright) were set up for the doctor dashboard.

**Why:** No tests existed before for the dashboard components. Tests cover all functionality from store logic to UI interactions.

**How to apply:** Run `pnpm test` for unit tests (177 tests, all passing). Run `pnpm test:e2e` for E2E (requires `pnpm dev:ui` running on port 3001 first, set `E2E_PATIENT_ID` env var to a real patient ID).

## Unit Test Files (src/tests/unit/)
- `store/consultationStore.test.ts` - All store actions, syncDocuments, formatNumberWithSign, mergeTags
- `components/TonometryTab.test.tsx` - IOP calculation, rendering, toggle source
- `components/DoctorDilationDialog.test.tsx` - Dialog interactions, defaults, product/eye selection
- `components/PrescriptionTab.test.tsx` - Add/edit/delete medications, count display
- `components/DashboardHeader.test.tsx` - Save button, finish button, back/history/payment buttons, PIN dialog
- `components/ClinicalExamTab.test.tsx` - All 6 fields, readOnly mode
- `components/PatientInfoCard.test.tsx` - Patient display, age calc, medical history fields, expand dialog

## E2E Test Files (tests/e2e/)
- `dashboard-navigation.spec.ts` - Load, tabs, history drawer, F3 shortcut, back nav, settings
- `refraction.spec.ts` - VA entry, Sph/Cyl/Axis/Add, copy OD↔OG, keratometry, contact lenses, dilation
- `tonometry.spec.ts` - IOP entry, auto-calculation, source toggle, time input, back-calculation
- `prescription.spec.ts` - Add/edit/delete medications, autocomplete, save
- `save-and-finish.spec.ts` - Manual save, finish sheet, payment, history, full workflow
- `clinical-exam.spec.ts` - All clinical fields, patient info card, expand dialog
- `documents.spec.ts` - Document generation, print workflow

## Config Files Added
- `vitest.config.ts` - jsdom environment, @/ alias
- `playwright.config.ts` - chromium, baseURL port 3001, fr-FR locale

## Bugs Found During Analysis
1. **DashboardHeader.tsx line 38-41**: `if (!patient) return null` early return BEFORE hooks `useState` and `usePinDialog` are called - violates React Rules of Hooks
2. **PatientInfoCard.tsx**: The `Diagnostic` SmartMultiSelectInput does NOT pass `disabled={readOnly}` - inconsistency with other fields
3. **TonometryTab**: No validation on IOP values (negative or >60 range)
4. **consultationStore**: `syncContactLenses` uses module-level counters for stale resolution - not truly thread-safe but fine for single user
