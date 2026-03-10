/**
 * useDocumentForm Hook
 * 
 * Centralizes form data access for document form components.
 * Reads from useDocumentsState hook and consultationStore.
 * Provides all form data and setters for document editing.
 */

import { useMemo, useCallback } from 'react';
import { useConsultationStore } from '@/ui/store/consultationStore';
import { useDocumentsState } from './useDocumentsState';
import { EyeData, PrescriptionData, DetailedClinicalExamData, TonometrieData } from '../types';

const safeDate = (val: any, fallback?: Date | undefined): any => {
    if (!val) return fallback;
    const d = val instanceof Date ? val : new Date(val);
    return isNaN(d.getTime()) ? fallback : d;
};

/**
 * Hook to access all form data for document form components
 * 
 * @returns Form data and setters for all document types
 */
export function useDocumentForm() {
    // Read base data from consultation store using stable selectors
    const patient = useConsultationStore(state => state.patient);
    const leftEye = useConsultationStore(state => state.leftEye);
    const rightEye = useConsultationStore(state => state.rightEye);
    const clinicalExam = useConsultationStore(state => state.clinicalExam);
    const documentOverrides = useConsultationStore(state => state.documentOverrides);
    const setDocumentOverride = useConsultationStore(state => state.setDocumentOverride);

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
    const absenceData = useMemo(() => {
        const data = initialDocumentsData.absenceData || { date: new Date(), reason: '' };
        // Ensure date is a Date object, not a string, and valid
        return {
            ...data,
            date: safeDate(data.date, new Date()),
        };
    }, [initialDocumentsData]);
    const workStopData = useMemo(() => {
        const data = initialDocumentsData.workStopData || {
            startDate: new Date(),
            endDate: new Date(),
            reason: '',
            exitAuthorized: true,
            isProlongation: false,
            isReprise: false
        };
        // Ensure dates are Date objects, not strings, and valid
        return {
            ...data,
            startDate: safeDate(data.startDate, undefined),
            endDate: safeDate(data.endDate, undefined),
        };
    }, [initialDocumentsData]);

    // Report data state - sync from documentOverrides or initialize empty
    const reportData = useMemo(() => documentOverrides.report || {}, [documentOverrides.report]);
    const setReportData = useCallback((updater: any) => {
        if (typeof updater === 'function') {
            setDocumentOverride('report', updater(reportData));
        } else {
            setDocumentOverride('report', updater);
        }
    }, [reportData, setDocumentOverride]);

    // Setters for absence and workStop data
    const setAbsenceData = useCallback((updater: any) => {
        const currentUnifiedState = documentOverrides.unifiedDocumentsState || {};
        const currentAbsenceData = currentUnifiedState.absenceData || { date: new Date(), reason: '' };
        const newAbsenceData = typeof updater === 'function' ? updater(currentAbsenceData) : updater;
        setDocumentOverride('unifiedDocumentsState', {
            ...currentUnifiedState,
            absenceData: newAbsenceData
        });
    }, [documentOverrides.unifiedDocumentsState, setDocumentOverride]);

    const setWorkStopData = useCallback((updater: any) => {
        const currentUnifiedState = documentOverrides.unifiedDocumentsState || {};
        const currentWorkStopData = currentUnifiedState.workStopData || {
            startDate: new Date(),
            endDate: new Date(),
            reason: '',
            exitAuthorized: true,
            isProlongation: false,
            isReprise: false
        };
        const newWorkStopData = typeof updater === 'function' ? updater(currentWorkStopData) : updater;
        setDocumentOverride('unifiedDocumentsState', {
            ...currentUnifiedState,
            workStopData: newWorkStopData
        });
    }, [documentOverrides.unifiedDocumentsState, setDocumentOverride]);

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

    // Handle data changes from the hook
    const handleDocumentsDataChange = useCallback((newData: any) => {
        // Save unified state for persistence and rehydration
        setDocumentOverride('unifiedDocumentsState', newData);

        // Sync to individual legacy keys for usePrintHandlers
        if (newData.printStates) {
            setDocumentOverride('glasses', newData.printStates.printGlassesData);
            setDocumentOverride('contacts', newData.printStates.printContactLensesData);
            setDocumentOverride('visualAcuity', newData.printStates.printVisualAcuityData);
            setDocumentOverride('absence', newData.printStates.printAbsenceData);
            setDocumentOverride('workStop', newData.printStates.printWorkStopData);
            setDocumentOverride('bilan', newData.bilanFields);
            setDocumentOverride('printPrescriptionData', newData.printStates.printPrescriptionData);
            setDocumentOverride('customGeneric', newData.printStates.printGenericData);
        }

        if (newData.printControlFlags) {
            setDocumentOverride('printControlFlags', newData.printControlFlags);
        }
    }, [setDocumentOverride]);

    // Use shared state hook
    const {
        bilanFields,
        setBilanFields,
        customFieldInputs,
        setCustomFieldInputs,
        printControlFlags,
        setPrintControlFlags,
        selectedDiversDocument,
        setSelectedDiversDocument,
        printPrescriptionData,
        setPrintPrescriptionData,
        printGlassesData,
        setPrintGlassesData,
        printContactLensesData,
        setPrintContactLensesData,
        printVisualAcuityData,
        setPrintVisualAcuityData,
        printWorkStopData: printWorkStopDataFromHook,
        setPrintWorkStopData: setPrintWorkStopDataFromHook,
        printAbsenceData,
        setPrintAbsenceData,
        printMedicalRecordData,
        setPrintMedicalRecordData,
        printGenericData,
        setPrintGenericData,
    } = useDocumentsState({
        prescriptionData: prescriptionData,
        rightEyeData: rightEye,
        leftEyeData: leftEye,
        absenceData: absenceData,
        workStopData: workStopData,
        initialDocumentsData: initialDocumentsData,
        onDocumentsDataChange: handleDocumentsDataChange
    });

    // Note: prescriptionData setter would need to update the store's prescriptions
    // For now, we'll provide a no-op since prescriptions are managed in the store
    const setPrescriptionData = useCallback(() => {
        // Prescriptions are managed in the store, not in document state
        // This is kept for API compatibility but doesn't do anything
    }, []);

    // Return memoized form data and setters
    return useMemo(() => ({
        // Bilan states
        bilanFields,
        setBilanFields,
        customFieldInputs,
        setCustomFieldInputs,
        // Document states
        prescriptionData,
        setPrescriptionData,
        absenceData,
        setAbsenceData,
        workStopData,
        setWorkStopData,
        reportData,
        setReportData,
        // Print states
        printGlassesData,
        setPrintGlassesData,
        printContactLensesData,
        setPrintContactLensesData,
        printVisualAcuityData,
        setPrintVisualAcuityData,
        printWorkStopData: printWorkStopDataFromHook,
        setPrintWorkStopData: setPrintWorkStopDataFromHook,
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
        printGenericData,
        setPrintGenericData,
        // Base data
        patient,
        rightEyeData: rightEye,
        leftEyeData: leftEye,
        detailedClinicalExam: clinicalExam,
        tonometrie,
    }), [
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
        printGlassesData,
        setPrintGlassesData,
        printContactLensesData,
        setPrintContactLensesData,
        printVisualAcuityData,
        setPrintVisualAcuityData,
        printWorkStopDataFromHook,
        setPrintWorkStopDataFromHook,
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
        printGenericData,
        setPrintGenericData,
        patient,
        rightEye,
        leftEye,
        clinicalExam,
        tonometrie,
    ]);
}
