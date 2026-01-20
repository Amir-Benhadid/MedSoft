# UI Folder Documentation TODO List

This document tracks the documentation status of all TypeScript files in the `src/ui` folder.

## Progress: 23/163 files documented (14%)

**Last Verified:** Documentation process started.

---

## ✅ Completed Files (23)

### Verification Status
All files below have been verified to contain:
- File-level JSDoc comments
- Function/class-level documentation with parameters and return types
- Removal of non-useful inline comments

---

## ⏳ Pending Files (163)

### Core Files
- [x] `main.tsx` - Main React application entry point
- [ ] `index.html` - HTML template
- [ ] `index.css` - Global styles

### Routes
- [x] `routes/__root.tsx` - Root route component
- [x] `routes/index.tsx` - Landing/index route
- [x] `routes/doctor.tsx` - Doctor dashboard route
- [x] `routes/secretary.tsx` - Secretary dashboard route
- [x] `routes/book-viewer.tsx` - Book viewer route
- [ ] `routeTree.gen.ts` - Generated route tree (typically doesn't need documentation)

### Library Files
- [x] `lib/utils.ts` - Utility functions (cn helper)
- [ ] `lib/time.ts` - Time utility functions
- [x] `lib/query-client.ts` - TanStack Query client configuration
- [x] `lib/router.tsx` - TanStack Router configuration
- [ ] `lib/orpc/client.ts` - ORPC client setup
- [ ] `lib/orpc/ipc-transport.ts` - IPC transport for ORPC

### Contexts
- [x] `contexts/ConfigContext.tsx` - Application configuration context

### Hooks
- [ ] `hooks/useAuth.ts` - Authentication hooks (already has basic documentation)
- [x] `hooks/use-debounce.ts` - Debounce hook
- [x] `hooks/use-toast.ts` - Toast notification hook
- [x] `hooks/useAppointments.ts` - Appointment data hooks
- [x] `hooks/useConsultationTypes.ts` - Consultation type hooks
- [x] `hooks/useNavigation.ts` - Navigation utilities
- [x] `hooks/usePatients.ts` - Patient data hooks
- [x] `hooks/usePinDialog.ts` - PIN dialog hook
- [x] `hooks/useRealtime.ts` - Realtime subscription hook
- [x] `hooks/useSettingsDialog.ts` - Settings dialog hook
- [x] `hooks/useWaitlist.ts` - Waitlist hooks
- [x] `hooks/useWorkflow.ts` - Workflow hooks
- [x] `hooks/useWorkflowStore.ts` - Workflow store hook

### Services
- [x] `services/LentilleService.ts` - Lens conversion service

### Store
- [x] `store/consultationStore.ts` - Consultation state store

### Utils
- [x] `utils/calendar-utils.ts` - Calendar utility functions (already documented)

### Components - Setup
- [ ] `components/setup/AppLoader.tsx` - Application loader component
- [ ] `components/setup/SetupWizard.tsx` - Setup wizard component

### Components - Landing
- [ ] `components/landing/HeaderSection.tsx` - Landing page header
- [ ] `components/landing/PinDialog.tsx` - PIN entry dialog
- [ ] `components/landing/RoleCard.tsx` - Role selection card
- [ ] `components/landing/SettingsDialog.tsx` - Settings dialog

### Components - Patients
- [ ] `components/patients/PatientForm.tsx` - Patient form component
- [ ] `components/patients/PatientSelector.tsx` - Patient selector component

### Components - Shared
- [ ] `components/shared/PatientSearchDialog.tsx` - Patient search dialog
- [ ] `components/shared/SmartAutocompleteInput.tsx` - Smart autocomplete input
- [ ] `components/shared/SmartMultiSelectInput.tsx` - Smart multi-select input
- [ ] `components/shared/stats/TodayResume.tsx` - Today's statistics resume

### Components - Doctor
- [ ] `components/doctor/DoctorDashboard.tsx` - Main doctor dashboard
- [ ] `components/doctor/DoctorHeader.tsx` - Doctor header component
- [ ] `components/doctor/DoctorPatientList.tsx` - Doctor patient list
- [ ] `components/doctor/DoctorPatientListContent.tsx` - Doctor patient list content
- [ ] `components/doctor/RadiographyDashboard.tsx` - Radiography dashboard
- [ ] `components/doctor/FinishConsultationSheet.tsx` - Finish consultation sheet
- [ ] `components/doctor/patient-list/PatientDetailsPanel.tsx` - Patient details panel
- [ ] `components/doctor/patient-list/types.ts` - Patient list types
- [ ] `components/doctor/patient-list/usePatientListLogic.ts` - Patient list logic hook
- [ ] `components/doctor/patient-list/utils.ts` - Patient list utilities
- [ ] `components/doctor/dashboard/DashboardHeader.tsx` - Dashboard header
- [ ] `components/doctor/dashboard/EyeRefractionPanel.tsx` - Eye refraction panel
- [ ] `components/doctor/dashboard/ClinicalExamTab.tsx` - Clinical exam tab
- [ ] `components/doctor/dashboard/RefractionTab.tsx` - Refraction tab
- [ ] `components/doctor/dashboard/HistoryTab.tsx` - History tab
- [ ] `components/doctor/dashboard/PrescriptionTab.tsx` - Prescription tab
- [ ] `components/doctor/dashboard/PatientInfoCard.tsx` - Patient info card
- [ ] `components/doctor/dashboard/ClinicalExamHeader.tsx` - Clinical exam header
- [ ] `components/doctor/dashboard/DoctorDilationDialog.tsx` - Dilation dialog
- [ ] `components/doctor/dashboard/readonly/ReadOnlyClinicalExamDisplay.tsx` - Read-only clinical exam display
- [ ] `components/doctor/dashboard/readonly/ReadOnlyRefractionDisplay.tsx` - Read-only refraction display
- [ ] `components/doctor/dashboard/useDoctorDashboardLogic.ts` - Doctor dashboard logic hook
- [ ] `components/doctor/dashboard/types.ts` - Dashboard types
- [ ] `components/doctor/documents/DocumentsContainer.tsx` - Documents container
- [ ] `components/doctor/documents/DocumentPreview.tsx` - Document preview
- [ ] `components/doctor/documents/AbsenceCertificateDocument.tsx` - Absence certificate document
- [ ] `components/doctor/documents/BilanDocuments.tsx` - Bilan documents
- [ ] `components/doctor/documents/VisualAcuityCertificateDocument.tsx` - Visual acuity certificate
- [ ] `components/doctor/documents/WorkStopDocument.tsx` - Work stop document
- [ ] `components/doctor/documents/ContactLensesDocument.tsx` - Contact lenses document
- [ ] `components/doctor/documents/GenericDocument.tsx` - Generic document
- [ ] `components/doctor/documents/GlassesDocument.tsx` - Glasses document
- [ ] `components/doctor/documents/MedicalReportDocument.tsx` - Medical report document
- [ ] `components/doctor/documents/hooks/usePrintHandlers.ts` - Print handlers hook
- [ ] `components/doctor/documents/PrintingLogic.ts` - Printing logic
- [ ] `components/doctor/documents/utils/DocumentUtils.ts` - Document utilities
- [ ] `components/doctor/documents/utils/PdfUtils.ts` - PDF utilities
- [ ] `components/doctor/documents/types.ts` - Document types
- [ ] `components/doctor/finish-sheet/useFinishSheetLogic.ts` - Finish sheet logic hook
- [ ] `components/doctor/history/HistorySheet.tsx` - History sheet
- [ ] `components/doctor/medications/MedicineAutocomplete.tsx` - Medicine autocomplete
- [ ] `components/doctor/medications/NewMedicineSheet.tsx` - New medicine sheet
- [ ] `components/doctor/messaging/FloatingMessaging.tsx` - Floating messaging component
- [ ] `components/doctor/resume/MonthlyResume.tsx` - Monthly resume
- [ ] `components/doctor/books/BookLibrary.tsx` - Book library component
- [ ] `components/doctor/books/FlipBookViewer.tsx` - Flip book viewer
- [ ] `components/doctor/settings/SettingsContainer.tsx` - Settings container
- [ ] `components/doctor/settings/AutocompleteParams.tsx` - Autocomplete parameters
- [ ] `components/doctor/settings/ConsultationTypesParams.tsx` - Consultation types parameters
- [ ] `components/doctor/settings/MedicationsParams.tsx` - Medications parameters
- [ ] `components/doctor/settings/ProfessionalContactsParams.tsx` - Professional contacts parameters

### Components - Secretary
- [ ] `components/secretary/SecretaryHeader.tsx` - Secretary header
- [ ] `components/secretary/SecretaryPatientFileSheet.tsx` - Secretary patient file sheet
- [ ] `components/secretary/calendar/Calendar.tsx` - Calendar component
- [ ] `components/secretary/calendar/CalendarMenu.tsx` - Calendar menu
- [ ] `components/secretary/calendar/CalendarEvent.tsx` - Calendar event
- [ ] `components/secretary/calendar/CalendarQuickActions.tsx` - Calendar quick actions
- [ ] `components/secretary/calendar/CalendarAppointmentDialog.tsx` - Calendar appointment dialog
- [ ] `components/secretary/calendar/CalendarAppointmentSheet.tsx` - Calendar appointment sheet
- [ ] `components/secretary/calendar/MarkPresentDialog.tsx` - Mark present dialog
- [ ] `components/secretary/calendar/components/CompactPatientCard.tsx` - Compact patient card
- [ ] `components/secretary/calendar/components/CompactAntecedentsSection.tsx` - Compact antecedents section
- [ ] `components/secretary/calendar/components/index.ts` - Calendar components index
- [ ] `components/secretary/messaging/EnhancedMessaging.tsx` - Enhanced messaging component
- [ ] `components/secretary/patient/ClinicalDataSheet.tsx` - Clinical data sheet
- [ ] `components/secretary/sheet/SecretaryPatientDetails.tsx` - Secretary patient details
- [ ] `components/secretary/sheet/SecretaryDocumentsSheet.tsx` - Secretary documents sheet
- [ ] `components/secretary/sheet/SecretaryRefractionPanel.tsx` - Secretary refraction panel
- [ ] `components/secretary/waitlist/Waitlist.tsx` - Waitlist component
- [ ] `components/secretary/waitlist/WaitlistCard.tsx` - Waitlist card
- [ ] `components/secretary/waitlist/WaitlistEntrySheet.tsx` - Waitlist entry sheet
- [ ] `components/secretary/workflow/SecretaryWorkflowSidebar.tsx` - Workflow sidebar
- [ ] `components/secretary/workflow/SecretaryPaymentSheet.tsx` - Payment sheet
- [ ] `components/secretary/workflow/WorkflowPatientSelector.tsx` - Workflow patient selector
- [ ] `components/secretary/workflow/PatientSelectorDialog.tsx` - Patient selector dialog
- [ ] `components/secretary/workflow/PatientSelectionSection.tsx` - Patient selection section
- [ ] `components/secretary/workflow/DilationSection.tsx` - Dilation section
- [ ] `components/secretary/workflow/RehabilitationSection.tsx` - Rehabilitation section
- [ ] `components/secretary/workflow/PaymentSection.tsx` - Payment section
- [ ] `components/secretary/workflow/PaymentDetailsSection.tsx` - Payment details section
- [ ] `components/secretary/workflow/PaymentActionHeader.tsx` - Payment action header
- [ ] `components/secretary/workflow/useSecretaryPaymentLogic.ts` - Secretary payment logic hook

### Components - UI (shadcn/ui components)
- [ ] `components/ui/alert-dialog.tsx` - Alert dialog component
- [ ] `components/ui/command.tsx` - Command component
- [ ] `components/ui/toaster.tsx` - Toaster component
- [ ] `components/ui/sheet-stack/provider.tsx` - Sheet stack provider
- [ ] `components/ui/sheet-stack/index.ts` - Sheet stack index
- [ ] `components/ui/*` - Other UI components (28 files)

---

## 📝 Notes

- `routeTree.gen.ts` - Generated file (typically doesn't need documentation)
- `index.html`, `index.css` - Configuration/styling files (may not need extensive documentation)
- UI component files (shadcn/ui) - May have minimal documentation needs if they're mostly wrappers

---

## Documentation Standards

All documented files should include:
- File-level JSDoc comment describing the module's purpose
- Function/class-level JSDoc with:
  - Description
  - `@param` tags for parameters
  - `@returns` tag for return values
  - `@throws` tag if applicable
- Component props documentation (for React components)
- Removal of non-useful inline comments
- Clear, concise descriptions

---

*Last updated: 2024*
