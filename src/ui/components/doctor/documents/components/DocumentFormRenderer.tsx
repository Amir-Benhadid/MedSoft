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
            <div
                className="flex items-center flex-shrink-0"
                style={{ paddingInline: 'calc(var(--dash-p) / 2)', marginBottom: 'calc(var(--dash-gap) / 2)' }}
            >
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

        if (selectedDiversDocument && selectedDiversDocument !== 'documentVierge') {
            const selectedRecord = medicalRecords.find((record: any) => record.code === selectedDiversDocument);

            if (selectedRecord) {
                return (
                    <FormWrapper>
                        <MedicalRecordDocumentWrapper onBack={handleBack}>
                            <MedicalRecordDocument
                                medicalRecord={selectedRecord as any}
                                printData={printMedicalRecordData}
                                setPrintData={setPrintMedicalRecordData}
                                rightEyeData={rightEyeData}
                                leftEyeData={leftEyeData}
                                patient={patient}
                            />
                        </MedicalRecordDocumentWrapper>
                    </FormWrapper>
                );
            }
        }

        return (
            <FormWrapper>
                <DiversDocumentForm
                    onPrint={onPrint}
                    isPrinting={isPrinting}
                />
            </FormWrapper>
        );
    }

    // Use persistent wrapper for eye documents and handle other documents
    return (
        <FormWrapper>
            <PersistentEyeDocumentWrapper activeDocTab={activeDocTab}>
                {/* Render other documents when they are active */}
                {activeDocTab === 'workStop' && <WorkStopDocument />}
                {activeDocTab === 'absence' && <AbsenceCertificateDocument />}
                <div className={cn(
                    "h-full overflow-hidden",
                    activeDocTab === 'report' ? 'block' : 'hidden'
                )}>
                    <ReportDocument />
                </div>
                {activeDocTab === 'certificatAcuite' && <VisualAcuityCertificateDocument />}
                {activeDocTab === 'medications' && <MedicationsDocument />}
            </PersistentEyeDocumentWrapper>
        </FormWrapper>
    );
};

export default memo(DocumentFormRenderer);
