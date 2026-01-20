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
                contactLenses: overrides.contacts,
                report: overrides.report,
                workStop: overrides.workStop,
                generic: overrides.generic,
                visualAcuity: overrides.visualAcuity,
                bilan: overrides.bilan,
                absence: overrides.absence,
                radiography: overrides['radiography_dynamic'],
            },
            genericConfig: documentType === 'generic'
                ? genericRecords.find(r => r.Code === overrides.selectedGenericTemplate)
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
                    // We need to fetch current printed list first or use an atomic update if possible.
                    // Since we don't have atomic array append easily via simple update here without reading,
                    // we might need to read it or just append blind if the backend supports it.
                    // However, we can use the `documents_data` from the store/backend.
                    // Let's rely on reading the current state from the store if it has it, 
                    // or better, fetch-update pattern creates race conditions but is acceptable here.

                    // Actually, the best way might be to just call a specific mutation if one existed, 
                    // but we only have `update`.
                    // Let's assume we can get the current list from the store if we add it there, 
                    // but wait, `documents_data` IS in the store: `state.documentOverrides`.
                    // But `documentOverrides` in store maps to `documents_data` in DB? 
                    // Let's check `loadConsultation` in store.
                    // `documentOverrides: data.documents_data || {}`
                    // So yes, we can update `documentOverrides` locally and send it.

                    const state = useConsultationStore.getState();
                    const currentDocs = state.documentOverrides || {};
                    const currentPrinted = (currentDocs.printed as string[]) || [];

                    if (!currentPrinted.includes(documentType)) {
                        const newPrinted = [...currentPrinted, documentType];
                        const newDocs = { ...currentDocs, printed: newPrinted };

                        // Update local store
                        // We don't have a direct "setDocumentsData" but we have `setDocumentOverride` 
                        // which sets a KEY in `documentOverrides`. 
                        // Wait, `documentOverrides` IS `documents_data` object in schema?
                        // Schema: `documents_data: DocumentsDataSchema`.
                        // Store: `documentOverrides: Record<string, any>`.
                        // `loadConsultation`: `documentOverrides: data.documents_data || {}`.
                        // So `documentOverrides` IS the whole `documents_data` object.

                        // So I can update specific field "printed" in it?
                        // `setDocumentOverride` implementation: 
                        // `documentOverrides: { ...state.documentOverrides, [docId]: data }`
                        // this assumes `documentOverrides` is a map of docId -> data.

                        // BUT `loadConsultation` sets it to `data.documents_data`.
                        // `documents_data` has structure `{ reportData: {}, absenceData: {}, ... }`.

                        // If `documentOverrides` is treated as the root `documents_data` object:
                        // `setDocumentOverride(docId, data)` would do `documents_data[docId] = data`.
                        // So `setDocumentOverride('printed', newPrinted)` would result in 
                        // `documents_data.printed = newPrinted`.
                        // This matches the schema `printed: z.array(...)`.

                        state.setDocumentOverride('printed', newPrinted);

                        // Update on server
                        const { orpcClient } = await import('@/ui/lib/orpc/client');
                        await orpcClient.consultations.update({
                            id: consultationId,
                            updates: {
                                documents_data: {
                                    ...newDocs,
                                    printed: newPrinted
                                }
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
        handlePreview,
        handlePrint,
        handleClosePreview,
    };
};
