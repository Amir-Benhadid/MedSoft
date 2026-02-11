// Document Components
export { default as ContactLensesDocument, generateContactLensesPDF } from './ContactLensesDocument';
export { default as GlassesDocument, generateGlassesPDF } from './GlassesDocument';
export { default as MedicationsDocument, generateMedicationsPDF } from './MedicationsDocument';
export { default as VisualAcuityCertificateDocument, generateVisualAcuityCertificatePDF } from './VisualAcuityCertificateDocument';
export { default as WorkStopDocument, generateWorkStopPDF } from './WorkStopDocument';
export { default as AbsenceCertificateDocument, generateAbsenceCertificatePDF } from './AbsenceCertificateDocument';
export { default as ReportDocument, generateReportPDF } from './ReportDocument';
export { default as BilanDocument, generateBilanPDF } from './BilanDocuments';
export { default as MedicalRecordDocument, generateMedicalRecordPDF } from './MedicalRecordDocument';

// Individual Medical Record Documents
// Document Types
export type BilanType = 'bilanPreOp' | 'bilanDiabete' | 'bilanInflammatoire' | 'bilanUveite';
export type DocumentType = 'contacts' | 'glasses' | 'medications' | 'certificatAcuite' | 'workStop' | 'absence' | 'report' | BilanType | 'divers';
