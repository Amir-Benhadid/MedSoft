import { useCallback, useEffect, useState } from 'react';
import { DocumentPrinter } from '../PrintingLogic';
import { useConsultationStore } from '@/ui/store/consultationStore';
import genericRecords from '../medical_records_structured.json';

export const usePrintHandlers = ({
    activeDocTab,
}: any = {}) => {
    const patient = useConsultationStore(state => state.patient);

    const [isPrinting, setIsPrinting] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const getPrintOptions = useCallback(() => {
        const state = useConsultationStore.getState();
        const documentType = activeDocTab;
        const overrides = state.documentOverrides;

        // Construct print options from store data and overrides
        const printOptions = {
            leftEye: state.leftEye,
            rightEye: state.rightEye,
            prescriptions: state.prescriptions,
            clinicalExam: state.clinicalExam,
            printControlFlags: overrides.printControlFlags || {},
            printDataOverrides: {
                glasses: overrides.glasses,
                contacts: overrides.contacts,
                report: overrides.report,
                workStop: overrides.workStop,
                generic: overrides.generic,
                visualAcuity: overrides.visualAcuity,
                bilan: overrides.bilan,
                absence: overrides.absence,
                radiography: overrides['radiography_dynamic'],
            },
            genericConfig: documentType === 'generic'
                ? genericRecords.find(r => r.code === overrides.selectedGenericTemplate)
                : undefined,
        };

        return { documentType, patient, printOptions };
    }, [activeDocTab, patient]);

    const handlePreview = useCallback(async () => {
        if (!patient) return;

        setIsPreviewing(true);
        try {
            const { documentType, patient: patientData, printOptions } = getPrintOptions();
            if (patientData) {
                const url = await DocumentPrinter.generatePreviewUrl(documentType, patientData, printOptions);
                setPdfUrl(url);
                setShowPreview(true);
            }
        } catch (err) {
            console.error(err);
            alert('Erreur à la génération du PDF.');
        }
        setIsPreviewing(false);
    }, [patient, getPrintOptions]);

    const handlePrint = useCallback(async () => {
        if (!patient) return;

        setIsPrinting(true);
        try {
            const { documentType, patient: patientData, printOptions } = getPrintOptions();
            if (patientData) {
                await DocumentPrinter.printDocument(documentType, patientData, printOptions);

                // Mark as printed in the database
                const consultationId = useConsultationStore.getState().consultationId;
                if (consultationId) {
                    const state = useConsultationStore.getState();
                    const currentDocs = state.documentOverrides || {};
                    const currentPrinted = (currentDocs.printed as string[]) || [];

                    if (!currentPrinted.includes(documentType)) {
                        const newPrinted = [...currentPrinted, documentType];
                        const newDocs = { ...currentDocs, printed: newPrinted };

                        // Update local store
                        state.setDocumentOverride('printed', newPrinted);

                        // Update on server
                        // Dynamic import to avoid circular dependencies if any, though standard import is fine usually.
                        const { orpcClient } = await import('@/ui/lib/orpc/client');
                        await orpcClient.consultations.update({
                            id: consultationId,
                            updates: {
                                documents_data: newDocs
                            }
                        });
                    }
                }
            }
        } catch (err) {
            console.error(err);
            alert('Erreur à la génération du PDF.');
        }
        setIsPrinting(false);
    }, [patient, getPrintOptions]);

    const handleClosePreview = useCallback(() => {
        setShowPreview(false);
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    }, [pdfUrl]);

    // F1 key handler
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key === 'F1') {
                event.preventDefault();
                handlePrint();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handlePrint]);

    return {
        isPrinting,
        isPreviewing,
        pdfUrl,
        showPreview,
        setShowPreview,
        handlePreview,
        handlePrint,
        handleClosePreview,
    };
};
