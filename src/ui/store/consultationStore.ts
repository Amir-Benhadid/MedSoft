/**
 * Consultation State Store
 * 
 * Zustand store for managing consultation data including eye measurements,
 * clinical exam data, prescriptions, and document overrides. Provides
 * actions for updating all aspects of a consultation.
 */

import { create } from 'zustand';
import { EyeData, DetailedClinicalExamData } from '@/ui/components/doctor/dashboard/types';

/**
 * Prescription item interface
 */
interface PrescriptionItem {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

/**
 * Consultation state interface
 * Contains all data for a consultation including patient info, eye data,
 * clinical exam, prescriptions, and document overrides
 */
interface ConsultationState {
    leftEye: EyeData;
    rightEye: EyeData;
    clinicalExam: DetailedClinicalExamData;
    dilatationRequired: boolean;
    prescriptions: PrescriptionItem[];

    patientId: string | null;
    consultationId: string | null;
    patient: any | null;

    documentOverrides: Record<string, any>; // Store manual overrides for documents (e.g. glasses, contacts)

    // Actions
    setPatientId: (id: string | null) => void;
    setPatient: (patient: any | null) => void;
    setLeftEye: (data: Partial<EyeData>) => void;
    setRightEye: (data: Partial<EyeData>) => void;
    updateLeftEyeField: (field: keyof EyeData, value: string) => void;
    updateRightEyeField: (field: keyof EyeData, value: string) => void;

    setClinicalExam: (data: Partial<DetailedClinicalExamData>) => void;
    updateClinicalExamField: (field: string, value: any) => void;

    setDilatationRequired: (required: boolean) => void;

    addPrescription: () => void;
    updatePrescription: (id: string, field: keyof PrescriptionItem, value: string) => void;
    removePrescription: (id: string) => void;
    setPrescriptions: (items: PrescriptionItem[]) => void;

    reset: () => void;
    loadConsultation: (data: any) => void;
    setDocumentOverride: (docId: string, data: any) => void;
    updateDocumentOverride: (docId: string, field: string, value: any) => void;
}

/**
 * Default empty eye data structure
 */
const defaultEyeData: EyeData = {
    visualAcuity: '', visualAcuityVL_SC: '', visualAcuityVL_AC: '', visualAcuityVP_SC: '', visualAcuityVP_AC: '',
    sph: '', cyl: '', axis: '', add: '', tension: '', tensionTime: '', pachymetry: '', corrected_iop: '', tensionApplanation: '', k1: '', k2: '', axis_k: '',
    rayon: '', diam: '', pupillaryDistance: '', pd: '', objSph: '', objCyl: '', objAxis: '', objAdd: '', lensType: '', lensBrand: '',
    glassType: '', contactLensType: ''
};

/**
 * Default empty clinical exam data structure
 */
const defaultClinicalExam: DetailedClinicalExamData = {
    consultationReason: '', generalMedicalHistory: '', ophthalmologicalHistory: '', inspection: '', inspectionOD: '', inspectionOG: '',
    motilityExam: '', motilityExamOD: '', motilityExamOG: '', diagnosis: '', diagnosisOD: '', diagnosisOG: '', treatmentPlan: '',
    treatmentPlanOD: '', treatmentPlanOG: '', profile: '', anteriorSegment: { slit_lamp_exam: '' }, anteriorSegmentOD: '', anteriorSegmentOG: '',
    gonioscopy: { gonioscopy_notes: '' }, fundus: { fundus_exam: '' }, fundusOD: '', fundusOG: '',
    medicalImaging: { radiography: [], bilans: [], notes: '' }, contactLens: { right: {}, left: {} },
    nextAppointment: { timeframe: '', reason: '', date: '' }
};

/**
 * Zustand store for consultation state management
 * 
 * Provides state and actions for:
 * - Patient information (ID, patient object)
 * - Eye data (left and right eye measurements)
 * - Clinical exam data (with automatic mirroring for OD/OG fields)
 * - Prescriptions (add, update, remove)
 * - Document overrides (for customizing document data)
 * - Consultation loading and reset
 * 
 * @returns {ConsultationState} Store state and actions
 */
export const useConsultationStore = create<ConsultationState>((set) => ({
    leftEye: defaultEyeData,
    rightEye: defaultEyeData,
    clinicalExam: defaultClinicalExam,
    dilatationRequired: false,
    prescriptions: [],
    patientId: null,
    consultationId: null,
    patient: null,
    documentOverrides: {},

    setPatientId: (id) => set({ patientId: id }),
    setPatient: (patient) => set({ patient: patient }),

    setLeftEye: (data) => set((state) => ({ leftEye: { ...state.leftEye, ...data } })),
    setRightEye: (data) => set((state) => ({ rightEye: { ...state.rightEye, ...data } })),

    updateLeftEyeField: (field, value) => set((state) => ({
        leftEye: { ...state.leftEye, [field]: value },
        ...(field === 'glassType' ? { rightEye: { ...state.rightEye, [field]: value } } : {})
    })),

    updateRightEyeField: (field, value) => set((state) => ({
        rightEye: { ...state.rightEye, [field]: value },
        ...(field === 'glassType' ? { leftEye: { ...state.leftEye, [field]: value } } : {})
    })),

    setClinicalExam: (data) => set((state) => ({ clinicalExam: { ...state.clinicalExam, ...data } })),

    updateClinicalExamField: (field, value) => set((state) => {
        // Handle nested fields if necessary or simple fields
        // Previously we had complex logic for mirroring OD/OG. Let's keep it simple here.
        // If the caller passes "anteriorSegment.slit_lamp_exam", we need to parse it?
        // Or we strictly use the structure defined in types.

        let newExam = { ...state.clinicalExam };

        if (field.includes('.')) {
            const parts = field.split('.');
            // simple 1-level nesting support
            const parent = parts[0] as keyof DetailedClinicalExamData;
            const child = parts[1];

            if (typeof newExam[parent] === 'object' && newExam[parent] !== null) {
                // @ts-ignore
                newExam[parent] = { ...newExam[parent], [child]: value };
            }

            // Mirror logic moved here to store
            if (parts[0] === 'anteriorSegment' && parts[1] === 'slit_lamp_exam') {
                newExam.anteriorSegmentOD = value;
                newExam.anteriorSegmentOG = value;
            }
            if (parts[0] === 'fundus' && parts[1] === 'fundus_exam') {
                newExam.fundusOD = value;
                newExam.fundusOG = value;
            }
        } else {
            // @ts-ignore
            newExam[field] = value;
            // Mirror logic
            if (field === 'inspection') { newExam.inspectionOD = value; newExam.inspectionOG = value; }
            if (field === 'motilityExam') { newExam.motilityExamOD = value; newExam.motilityExamOG = value; }
            if (field === 'diagnosis') { newExam.diagnosisOD = value; newExam.diagnosisOG = value; }
            if (field === 'treatmentPlan') { newExam.treatmentPlanOD = value; newExam.treatmentPlanOG = value; }
        }

        return { clinicalExam: newExam };
    }),

    setDilatationRequired: (required) => set({ dilatationRequired: required }),

    addPrescription: () => set((state) => ({
        prescriptions: [
            { id: Math.random().toString(), name: "", dosage: "", frequency: "", duration: "", instructions: "" },
            ...state.prescriptions
        ]
    })),

    updatePrescription: (id, field, value) => set((state) => ({
        prescriptions: state.prescriptions.map(p => p.id === id ? { ...p, [field]: value } : p)
    })),

    removePrescription: (id) => set((state) => ({
        prescriptions: state.prescriptions.filter(p => p.id !== id)
    })),

    setPrescriptions: (items) => set({ prescriptions: items }),

    setDocumentOverride: (docId, data) => set((state) => ({
        documentOverrides: { ...state.documentOverrides, [docId]: data }
    })),

    updateDocumentOverride: (docId, field, value) => set((state) => {
        const currentDoc = state.documentOverrides[docId] || {};
        return {
            documentOverrides: {
                ...state.documentOverrides,
                [docId]: { ...currentDoc, [field]: value }
            }
        };
    }),

    reset: () => set({
        leftEye: defaultEyeData,
        rightEye: defaultEyeData,
        clinicalExam: defaultClinicalExam,
        dilatationRequired: false,
        prescriptions: [],
        patientId: null,
        consultationId: null,
        patient: null,
        documentOverrides: {}
    }),

    loadConsultation: (data: any) => set({
        patientId: data.patient_id,
        consultationId: data.id,
        // If data.date exists, we could store it, but the store doesn't have a date field? 
        // It seems the store is mostly for the EXAM data, not metadata like date/status.

        leftEye: { ...defaultEyeData, ...data.left_eye },
        rightEye: { ...defaultEyeData, ...data.right_eye },
        clinicalExam: { ...defaultClinicalExam, ...data.clinical_exam },
        // Prescriptions from DB are { treatments: [], notes: '' }
        // Store expects prescriptions: PrescriptionItem[]
        prescriptions: data.prescription?.treatments || [],

        // Handle dilatation if we decide to store it in clinical_exam later, 
        // but for now, if it's not saved, we can't load it. 
        // If we want to persist it, we should ideally move it to clinical_exam.
        // For now, let's leave it as false or check if it's in clinical_exam.
        dilatationRequired: data.clinical_exam?.dilatationRequired || false,

        documentOverrides: data.documents_data || {}
    })
}));

