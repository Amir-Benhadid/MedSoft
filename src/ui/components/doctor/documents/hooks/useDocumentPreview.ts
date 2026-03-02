/**
 * useDocumentPreview Hook
 * 
 * Centralizes preview data access for document preview components.
 * Reads directly from consultationStore and useDocumentsState hook.
 * Handles prescription data debouncing and memoization for optimal performance.
 */

import { useMemo, useRef, useEffect, useState } from 'react';
import { useConsultationStore } from '@/ui/store/consultationStore';
import { useDocumentsState, InternalBilanFields } from './useDocumentsState';
import { EyeData, PrescriptionData, DetailedClinicalExamData, TonometrieData } from '../types';

interface UseDocumentPreviewOptions {
    activeDocTab: string;
}

/**
 * Hook to access all preview data for document preview components
 * 
 * @param options - Options including activeDocTab for conditional data
 * @returns Memoized preview data object
 */
export function useDocumentPreview({ activeDocTab }: UseDocumentPreviewOptions) {
    // Read base data from consultation store using stable selectors
    const patient = useConsultationStore(state => state.patient);
    const leftEye = useConsultationStore(state => state.leftEye);
    const rightEye = useConsultationStore(state => state.rightEye);
    const clinicalExam = useConsultationStore(state => state.clinicalExam);
    const documentOverrides = useConsultationStore(state => state.documentOverrides);

    // Prepare prescription data from store
    const prescriptions = useConsultationStore(state => state.prescriptions);
    const prescriptionData = useMemo<PrescriptionData>(() => ({
        treatments: prescriptions.map(p => ({
            name: p.name,
            customName: '',
            dosage: p.dosage,
            instructions: p.instructions,
            strength: '',
            type: '',
            packaging: '',
            frequency: { value: 1, unit: typeof p.frequency === 'string' ? p.frequency : 'par jour' },
            duration: { value: 1, unit: typeof p.duration === 'string' ? p.duration : 'mois' }
        })),
        notes: ''
    }), [prescriptions]);

    // Prepare absence and workStop data from documentOverrides
    const initialDocumentsData = useMemo(() => documentOverrides.unifiedDocumentsState || {}, [documentOverrides]);
    const absenceData = useMemo(() =>
        initialDocumentsData.absenceData || { date: new Date(), reason: '' },
        [initialDocumentsData]
    );
    const workStopData = useMemo(() =>
        initialDocumentsData.workStopData || {
            startDate: new Date(),
            endDate: new Date(),
            reason: '',
            exitAuthorized: true
        },
        [initialDocumentsData]
    );

    // Prepare tonometry data from eye measurements
    const tonometrie = useMemo<TonometrieData>(() => ({
        left_eye: {
            iop: leftEye.tension || '',
            pachymetry: leftEye.pachymetry || '',
            corrected_iop: leftEye.corrected_iop || '',
            time: leftEye.tensionTime || ''
        },
        right_eye: {
            iop: rightEye.tension || '',
            pachymetry: rightEye.pachymetry || '',
            corrected_iop: rightEye.corrected_iop || '',
            time: rightEye.tensionTime || ''
        }
    }), [
        leftEye.tension, leftEye.pachymetry, leftEye.corrected_iop, leftEye.tensionTime,
        rightEye.tension, rightEye.pachymetry, rightEye.corrected_iop, rightEye.tensionTime
    ]);

    // Report data from documentOverrides
    const reportData = useMemo(() => documentOverrides.report || {}, [documentOverrides.report]);

    // Use documentsState hook for print states and bilan fields
    const {
        bilanFields,
        printPrescriptionData,
        printGlassesData,
        printContactLensesData,
        printVisualAcuityData,
        printAbsenceData,
        printWorkStopData,
        printControlFlags,
    } = useDocumentsState({
        prescriptionData,
        rightEyeData: rightEye,
        leftEyeData: leftEye,
        absenceData,
        workStopData,
        initialDocumentsData,
    });

    // Debounce prescription data for medications preview
    // Use printPrescriptionData for medications since that's what's being edited
    const [debouncedPrescriptionData, setDebouncedPrescriptionData] = useState<PrescriptionData>(printPrescriptionData || prescriptionData);
    const debounceTimeoutRef = useRef<NodeJS.Timeout>();

    // Sync prescription data when tab changes to medications
    useEffect(() => {
        if (activeDocTab === 'medications') {
            setDebouncedPrescriptionData(printPrescriptionData || prescriptionData);
        }
    }, [activeDocTab, printPrescriptionData, prescriptionData]);

    // Debounce prescription data updates for medications preview
    // Use printPrescriptionData for medications since that's what's being edited
    useEffect(() => {
        if (activeDocTab === 'medications') {
            const dataToDebounce = printPrescriptionData || prescriptionData;
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            debounceTimeoutRef.current = setTimeout(() => {
                setDebouncedPrescriptionData(dataToDebounce);
            }, 200);

            return () => {
                if (debounceTimeoutRef.current) {
                    clearTimeout(debounceTimeoutRef.current);
                }
            };
        } else {
            setDebouncedPrescriptionData(printPrescriptionData || prescriptionData);
        }
    }, [printPrescriptionData, prescriptionData, activeDocTab]);

    // Get prescription data for preview (debounced for medications, immediate for others)
    const getPrescriptionDataForPreview = useMemo(() => {
        const dataToUse = activeDocTab === 'medications'
            ? debouncedPrescriptionData
            : (printPrescriptionData || prescriptionData);

        return {
            treatments: dataToUse.treatments.map((treatment) => ({
                name: treatment.name,
                customName: treatment.customName,
                dosage: treatment.dosage,
                instructions: treatment.instructions,
                strength: treatment.strength,
                type: treatment.type,
                packaging: treatment.packaging,
                isNew: treatment.isNew,
            })),
            notes: dataToUse.notes,
        };
    }, [activeDocTab, debouncedPrescriptionData, printPrescriptionData, prescriptionData]);

    // Return memoized preview data
    return useMemo(() => ({
        patient,
        rightEyeData: rightEye,
        leftEyeData: leftEye,
        detailedClinicalExam: clinicalExam,
        bilanFields: bilanFields as InternalBilanFields,
        prescriptionData: getPrescriptionDataForPreview,
        printPrescriptionData,
        absenceData,
        workStopData,
        reportData,
        printControlFlags,
        glassesPrintData: printGlassesData,
        contactLensesPrintData: printContactLensesData,
        visualAcuityPrintData: printVisualAcuityData,
        absencePrintData: printAbsenceData,
        workStopPrintData: printWorkStopData,
        tonometrie,
    }), [
        patient,
        rightEye,
        leftEye,
        clinicalExam,
        bilanFields,
        getPrescriptionDataForPreview,
        printPrescriptionData,
        absenceData,
        workStopData,
        reportData,
        printControlFlags,
        printGlassesData,
        printContactLensesData,
        printVisualAcuityData,
        printAbsenceData,
        printWorkStopData,
        tonometrie,
    ]);
}
