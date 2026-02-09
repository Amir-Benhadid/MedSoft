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
export { default as BilanCardioVasculaireDocument, generateBilanCardioVasculairePDF } from './BilanCardioVasculaireDocument';
export { default as ReponseHTADocument, generateReponseHTAPDF } from './ReponseHTADocument';
export { default as CTFLaserArgonDocument, generateCTFLaserArgonPDF } from './CTFLaserArgonDocument';
export { default as CTFLaserYAGDocument, generateCTFLaserYAGPDF } from './CTFLaserYAGDocument';
export { default as CTFCeciteTotaleDocument, generateCTFCeciteTotalePDF } from './CTFCeciteTotaleDocument';
export { default as CTFMalvisionClasseDocument, generateCTFMalvisionClassePDF } from './CTFMalvisionClasseDocument';
export { default as BilanCardioOVCRDocument, generateBilanCardioOVCRPDF } from './BilanCardioOVCRDocument';
export { default as RepriseDeTravailDocument, generateRepriseDeTravailPDF } from './RepriseDeTravailDocument';
export { default as CTFGlaucomeDocument, generateCTFGlaucomePDF } from './CTFGlaucomeDocument';
export { default as ReponseAzyterDocument, generateReponseAzyterPDF } from './ReponseAzyterDocument';
export { default as OrientCardioDocument, generateOrientCardioPDF } from './OrientCardioDocument';
export { default as OrientNeuroDocument, generateOrientNeuroPDF } from './OrientNeuroDocument';
export { default as OrientDiabMedInterneDocument, generateOrientDiabMedInternePDF } from './OrientDiabMedInterneDocument';
export { default as AngioDocument, generateAngioPDF } from './AngioDocument';
export { default as DiabeteNormalDocument, generateDiabeteNormalPDF } from './DiabeteNormalDocument';
export { default as CompteRenduCNASDocument, generateCompteRenduCNASPDF } from './CompteRenduCNASDocument';
export { default as AvisORLDCCDocument, generateAvisORLDCCPDF } from './AvisORLDCCDocument';
export { default as CNASOCTGDocument, generateCNASOCTGPDF } from './CNASOCTGDocument';
export { default as CNASOCTMDocument, generateCNASOCTMPDF } from './CNASOCTMDocument';
export { default as CNASECHODocument, generateCNASECHOPDF } from './CNASECHODocument';
export { default as CNASArgonDocument, generateCNASArgonPDF } from './CNASArgonDocument';
export { default as CNASPachyDocument, generateCNASPachyPDF } from './CNASPachyDocument';

// Document Types
export type BilanType = 'bilanPreOp' | 'bilanDiabete' | 'bilanInflammatoire' | 'bilanUveite';
export type DocumentType = 'contacts' | 'glasses' | 'medications' | 'certificatAcuite' | 'workStop' | 'absence' | 'report' | BilanType | 'divers';
