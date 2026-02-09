/**
 * DocumentFormRenderer Component
 * 
 * Renders the appropriate document form component based on the active document tab.
 * Handles routing between different document types and manages their state.
 * 
 * @module DocumentFormRenderer
 */

import React, { memo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import { cn } from '@/ui/lib/utils';
import BilanFormsContainer from './BilanFormsContainer';
import DiversDocumentForm from './DiversDocumentForm';
import { useDocumentForm } from '../hooks/useDocumentForm';
import {
    ContactLensesDocument,
    GlassesDocument,
    MedicationsDocument,
    VisualAcuityCertificateDocument,
    WorkStopDocument,
    AbsenceCertificateDocument,
    ReportDocument,
    MedicalRecordDocument,
    BilanCardioVasculaireDocument,
    ReponseHTADocument,
    CTFLaserArgonDocument,
    CTFLaserYAGDocument,
    CTFCeciteTotaleDocument,
    CTFMalvisionClasseDocument,
    BilanCardioOVCRDocument,
    RepriseDeTravailDocument,
    CTFGlaucomeDocument,
    ReponseAzyterDocument,
    OrientCardioDocument,
    OrientNeuroDocument,
    OrientDiabMedInterneDocument,
    AngioDocument,
    DiabeteNormalDocument,
    CompteRenduCNASDocument,
    AvisORLDCCDocument,
    CNASOCTGDocument,
    CNASOCTMDocument,
    CNASECHODocument,
    CNASArgonDocument,
    CNASPachyDocument,
} from '../../documents';
import medicalRecords from '../../documents/medical_records_structured.json';

/**
 * Wrapper component to keep eye documents always mounted but hidden when not active
 * Improves performance by avoiding unmounting/remounting
 */
const PersistentEyeDocumentWrapper: React.FC<{
    activeDocTab: string;
    children: React.ReactNode;
}> = ({ activeDocTab, children }) => {
    return (
        <>
            <div className={cn(
                "h-full overflow-hidden",
                activeDocTab === 'glasses' ? 'block' : 'hidden'
            )}>
                <GlassesDocument />
            </div>

            <div className={cn(
                "h-full overflow-hidden",
                activeDocTab === 'contacts' ? 'block' : 'hidden'
            )}>
                <ContactLensesDocument />
            </div>

            {children}
        </>
    );
};

/**
 * Wrapper component for medical record documents with back button
 */
const MedicalRecordDocumentWrapper: React.FC<{
    children: React.ReactNode;
    onBack: () => void;
}> = ({ children, onBack }) => {
    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="flex items-center mb-4 p-2 flex-shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="text-primary hover:bg-primary/10"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex-1 min-h-0 overflow-auto">
                {children}
            </div>
        </div>
    );
};

interface DocumentFormRendererProps {
    activeDocTab: string;
    onPrint: () => void;
    isPrinting: boolean;
}

const DocumentFormRenderer: React.FC<DocumentFormRendererProps> = ({
    activeDocTab,
    onPrint,
    isPrinting,
}) => {
    // Get all form data from hook
    const {
        bilanFields,
        setBilanFields,
        customFieldInputs,
        setCustomFieldInputs,
        prescriptionData,
        setPrescriptionData,
        absenceData,
        setAbsenceData,
        workStopData,
        setWorkStopData,
        reportData,
        setReportData,
        detailedClinicalExam,
        tonometrie,
        patient,
        printGlassesData,
        setPrintGlassesData,
        printContactLensesData,
        setPrintContactLensesData,
        printVisualAcuityData,
        setPrintVisualAcuityData,
        printWorkStopData,
        setPrintWorkStopData,
        printAbsenceData,
        setPrintAbsenceData,
        printPrescriptionData,
        setPrintPrescriptionData,
        printControlFlags,
        setPrintControlFlags,
        selectedDiversDocument,
        setSelectedDiversDocument,
        printMedicalRecordData,
        setPrintMedicalRecordData,
        rightEyeData,
        leftEyeData,
    } = useDocumentForm();
    /**
     * Wrapper component to ensure height constraints
     */
    const FormWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div className="h-full">
            {children}
        </div>
    );
    // Bilan document types
    if (['bilanPreOp', 'bilanDiabete', 'bilanInflammatoire', 'bilanUveite'].includes(activeDocTab)) {
        return (
            <FormWrapper>
                <BilanFormsContainer
                    activeDocTab={activeDocTab}
                />
            </FormWrapper>
        );
    }

    // Divers documents
    if (activeDocTab === 'divers') {
        // Render specific document components based on selected document code
        const handleBack = () => {
            setSelectedDiversDocument('documentVierge');
        };

        switch (selectedDiversDocument) {
            case 'BILAN CARDIO VASCULAIRE':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <BilanCardioVasculaireDocument />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'REPONSE HTA':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <ReponseHTADocument />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'CTF (LASER ARGON)':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <CTFLaserArgonDocument />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'CTF (LASER YAG)':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <CTFLaserYAGDocument />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'CTF (CECITE TOTALE)':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <CTFCeciteTotaleDocument />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'CTF MALVISION CLASSE':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <CTFMalvisionClasseDocument patient={patient!} />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'BILAN CARDIO OVCR':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <BilanCardioOVCRDocument patient={patient!} />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'REPRISE DE TRAVAIL':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <RepriseDeTravailDocument />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'CTF GLAUCOME':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <CTFGlaucomeDocument patient={patient!} />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'REPONSE AZYTER':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <ReponseAzyterDocument />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'ORIENT CARDIO':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <OrientCardioDocument patient={patient!} />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'ORIENT NEURO':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <OrientNeuroDocument patient={patient!} />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'ORIENT DIAB MED INTERNE':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <OrientDiabMedInterneDocument />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'ANGIO':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <AngioDocument />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'Diabète Normal':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <DiabeteNormalDocument patient={patient!} />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'COMPTE RENDU CNAS':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <CompteRenduCNASDocument />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'AVIS ORL DCC':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <AvisORLDCCDocument />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'CNAS OCT G':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <CNASOCTGDocument patient={patient!} />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'CNAS OCT M':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <CNASOCTMDocument />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'CNAS ECHO':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <CNASECHODocument patient={patient!} />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'CNAS ARGON':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <CNASArgonDocument />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            case 'CNAS pachy':
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <CNASPachyDocument patient={patient!} />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            default:
                return (
                    <FormWrapper>
                        <DiversDocumentForm
                            onPrint={onPrint}
                            isPrinting={isPrinting}
                        />
                    </FormWrapper>
                );
        }
    }

    // Use persistent wrapper for eye documents and handle other documents
    return (
        <FormWrapper>
            <PersistentEyeDocumentWrapper activeDocTab={activeDocTab}>
                {/* Render other documents when they are active */}
                {activeDocTab === 'workStop' && <WorkStopDocument />}
                {activeDocTab === 'absence' && <AbsenceCertificateDocument />}
                {activeDocTab === 'report' && <ReportDocument />}
                {activeDocTab === 'certificatAcuite' && <VisualAcuityCertificateDocument />}
                {activeDocTab === 'medications' && <MedicationsDocument />}
            </PersistentEyeDocumentWrapper>
        </FormWrapper>
    );
};

export default memo(DocumentFormRenderer);
