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

        // Ensure dates are Date objects (JSON serialization turns them into strings)
        const toDate = (v: unknown): Date | undefined => {
            if (!v) return undefined;
            if (v instanceof Date) return v;
            if (typeof v === 'string' || typeof v === 'number') return new Date(v);
            return undefined;
        };

        // Normalize absence data for PDF (consultationDate must be a Date)
        const absenceOverride = overrides.absence;
        const normalizedAbsence = absenceOverride ? {
            consultationDate: toDate(absenceOverride.consultationDate) || new Date(),
        } : undefined;

        // Normalize workStop data for PDF (startDate, endDate must be Date objects)
        // Fallback to unified state when workStop key not yet synced (e.g. right after user selects date)
        const workStopOverride = overrides.workStop ?? overrides.unifiedDocumentsState?.printStates?.printWorkStopData;
        const normalizedWorkStop = workStopOverride ? {
            startDate: toDate(workStopOverride.startDate) ?? new Date(),
            endDate: toDate(workStopOverride.endDate) ?? new Date(),
            exitAuthorized: workStopOverride.exitAuthorized ?? true,
        } : undefined;

        // Derive medicalRecord from unified state if not directly set (e.g. after load from DB)
        const medicalRecordOverride = overrides.medicalRecord ?? (() => {
            const unified = overrides.unifiedDocumentsState;
            const ps = unified?.printStates;
            const sd = ps?.selectedDiversDocument;
            if (sd && sd !== 'documentVierge') {
                return { documentType: sd, printData: ps?.printMedicalRecordData || {} };
            }
            return undefined;
        })();

        // Bilan fields: use overrides.bilan or unified state (PrintingLogic expects options.bilanFields)
        const bilanFields = overrides.bilan ?? overrides.unifiedDocumentsState?.bilanFields;

        // Construct print options from store data and overrides
        // IMPORTANT: Must match DocumentPrinter.printDocument options signature
        const printOptions = {
            leftEye: state.leftEye,
            rightEye: state.rightEye,
            bilanFields,
            // Map store prescriptions to PrescriptionData structure
            prescriptionData: overrides.printPrescriptionData || {
                treatments: state.prescriptions.map(p => ({
                    ...p,
                    // Ensure all required fields are present
                    customName: p.customName || '',
                    strength: p.strength || '',
                    type: p.type || '',
                    packaging: p.packaging || '',
                    frequency: typeof p.frequency === 'string' ? { value: 1, unit: p.frequency } : p.frequency,
                    duration: typeof p.duration === 'string' ? { value: 1, unit: p.duration } : p.duration
                })),
                notes: ''
            },
            // Map clinical exam
            detailedClinicalExam: state.clinicalExam,
            // Map report data from overrides
            reportData: overrides.report,

            // Other fields
            tonometrie: {
                left_eye: {
                    iop: state.leftEye.tension || '',
                    pachymetry: state.leftEye.pachymetry || '',
                    corrected_iop: state.leftEye.corrected_iop || '',
                    time: state.leftEye.tensionTime || ''
                },
                right_eye: {
                    iop: state.rightEye.tension || '',
                    pachymetry: state.rightEye.pachymetry || '',
                    corrected_iop: state.rightEye.corrected_iop || '',
                    time: state.rightEye.tensionTime || ''
                }
            },

            printControlFlags: overrides.printControlFlags || {},
            printDataOverrides: {
                glasses: overrides.glasses,
                contacts: overrides.contacts,
                report: overrides.report,
                workStop: normalizedWorkStop,
                generic: overrides.generic,
                visualAcuity: overrides.visualAcuity,
                certificatAcuite: overrides.certificatAcuite,
                bilan: overrides.bilan,
                absence: normalizedAbsence,
                radiography: overrides['radiography_dynamic'],
                medicalRecord: medicalRecordOverride,
                divers: overrides.divers,
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
