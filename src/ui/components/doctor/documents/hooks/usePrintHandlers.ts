import { useCallback, useEffect, useState } from 'react';
import { DocumentPrinter } from '../PrintingLogic';
import { useConsultationStore } from '@/ui/store/consultationStore';
import { useQueryClient } from '@tanstack/react-query';
import { formatNumberWithSign } from '@/shared/formatters';
import genericRecords from '../medical_records_structured.json';
import { normalizeBilanFields } from './useDocumentsState';

export const usePrintHandlers = ({
    activeDocTab,
}: any = {}) => {
    const patient = useConsultationStore(state => state.patient);
    const queryClient = useQueryClient();

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
            isProlongation: workStopOverride.isProlongation ?? false,
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
        const bilanFieldsSource = overrides.unifiedDocumentsState?.bilanFields ?? overrides.bilan;
        const bilanFields = normalizeBilanFields(bilanFieldsSource);

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
                glasses: overrides.glasses ?? overrides.unifiedDocumentsState?.printStates?.printGlassesData ?? (() => {
                    const calcNear = (sph: string | undefined, add: string | undefined) => {
                        const s = parseFloat(String(sph || '').replace(',', '.')) || 0;
                        const a = parseFloat(String(add || '').replace(',', '.')) || 0;
                        if (!sph && !add) return '';
                        return (formatNumberWithSign(s + a) || (s + a).toFixed(2));
                    };
                    return {
                        rightEye: { 
                            sph: state.rightEye?.sph || '', cyl: state.rightEye?.cyl || '', axis: state.rightEye?.axis || '', 
                            add: state.rightEye?.add || '', glassType: state.rightEye?.glassType || '', 
                            nearSph: calcNear(state.rightEye?.sph, state.rightEye?.add), 
                            nearCyl: state.rightEye?.cyl || '', nearAxis: state.rightEye?.axis || '', 
                            emptyEyeOption: 'plan', emptyNearEyeOption: 'plan' 
                        },
                        leftEye: { 
                            sph: state.leftEye?.sph || '', cyl: state.leftEye?.cyl || '', axis: state.leftEye?.axis || '', 
                            add: state.leftEye?.add || '', glassType: state.leftEye?.glassType || '', 
                            nearSph: calcNear(state.leftEye?.sph, state.leftEye?.add), 
                            nearCyl: state.leftEye?.cyl || '', nearAxis: state.leftEye?.axis || '', 
                            emptyEyeOption: 'plan', emptyNearEyeOption: 'plan' 
                        },
                    };
                })(),
                contacts: overrides.contacts ?? overrides.unifiedDocumentsState?.printStates?.printContactLensesData ?? {
                    rightEye: { 
                        sph: state.rightEye?.sph || '', cyl: state.rightEye?.cyl || '', axis: state.rightEye?.axis || '', 
                        diam: state.rightEye?.diam || '', axis_k: state.rightEye?.axis_k || '', k1: state.rightEye?.k1 || '', k2: state.rightEye?.k2 || '', 
                        contactLensType: state.rightEye?.contactLensType || 'Sphérique', lensBrand: state.rightEye?.lensBrand || '', lensType: state.rightEye?.lensType || '' 
                    },
                    leftEye: { 
                        sph: state.leftEye?.sph || '', cyl: state.leftEye?.cyl || '', axis: state.leftEye?.axis || '', 
                        diam: state.leftEye?.diam || '', axis_k: state.leftEye?.axis_k || '', k1: state.leftEye?.k1 || '', k2: state.leftEye?.k2 || '', 
                        contactLensType: state.leftEye?.contactLensType || 'Sphérique', lensBrand: state.leftEye?.lensBrand || '', lensType: state.leftEye?.lensType || '' 
                    },
                },
                report: overrides.report,
                workStop: normalizedWorkStop,
                generic: overrides.generic,
                visualAcuity: overrides.visualAcuity ?? overrides.unifiedDocumentsState?.printStates?.printVisualAcuityData ?? {
                    visualAcuityVL_SC_OD: state.rightEye?.visualAcuityVL_SC || state.rightEye?.visualAcuity || '',
                    visualAcuityVL_SC_OG: state.leftEye?.visualAcuityVL_SC || state.leftEye?.visualAcuity || '',
                    visualAcuityVL_AC_OD: state.rightEye?.visualAcuityVL_AC || '',
                    visualAcuityVL_AC_OG: state.leftEye?.visualAcuityVL_AC || '',
                },
                certificatAcuite: overrides.certificatAcuite,
                bilan: bilanFields,
                absence: normalizedAbsence,
                radiography: overrides['radiography_dynamic'],
                medicalRecord: medicalRecordOverride,
                divers: overrides.divers,
                customGeneric: overrides.customGeneric ?? overrides.unifiedDocumentsState?.printStates?.printGenericData,
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
                console.log(`[PDF Preview Triggered] Generating for: ${documentType}`, { patientData, printOptions });
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
                console.log(`[PDF Print Triggered] Generating for: ${documentType}`, { patientData, printOptions });
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
                        const { orpcClient } = await import('@/ui/lib/orpc/client');
                        await orpcClient.consultations.update({
                            id: consultationId,
                            updates: {
                                documents_data: newDocs
                            }
                        });

                        // Invalidate cache immediately so that other screens (like history) show it as printed
                        queryClient.invalidateQueries({ queryKey: ['consultations'] });
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
