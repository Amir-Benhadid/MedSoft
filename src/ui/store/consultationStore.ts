/**
 * Consultation State Store
 * 
 * Zustand store for managing consultation data including eye measurements,
 * clinical exam data, prescriptions, and document overrides. Provides
 * actions for updating all aspects of a consultation.
 */

import { create } from 'zustand';
import { EyeData, DetailedClinicalExamData } from '@/ui/components/doctor/dashboard/types';
import { DocumentOverrides } from '@/ui/types/documentOverrides';
import { lentilleService } from '@/ui/services/LentilleService';

// --- Helpers for formatting and syncing ---
import { formatNumberWithSign } from '@/shared/formatters';

// --- Helpers for formatting and syncing ---
export const mergeTags = (newSourceTags: string, previousSourceTags: string, currentDocumentTags: string): string => {
    const newSourceList = (newSourceTags || '').split(',').map(s => s.trim()).filter(Boolean);
    const previousSourceList = (previousSourceTags || '').split(',').map(s => s.trim()).filter(Boolean);
    const currentDocumentList = (currentDocumentTags || '').split(',').map(s => s.trim()).filter(Boolean);
    const manualAdditions = currentDocumentList.filter(tag =>
        !previousSourceList.some(st => st.toLowerCase() === tag.toLowerCase())
    );
    const merged = [...manualAdditions];
    newSourceList.forEach(tag => {
        if (!merged.some(t => t.toLowerCase() === tag.toLowerCase())) {
            merged.push(tag);
        }
    });
    return merged.join(', ');
};

const syncDocuments = (set: any, get: any, prevState: any) => {
    const newState = get();
    const newOverrides = { ...newState.documentOverrides };
    let overridesChanged = false;

    // Prepare unified document state properly
    const unified = newOverrides.unifiedDocumentsState ? { ...newOverrides.unifiedDocumentsState } : { printStates: {} };
    const printStates = unified.printStates ? { ...unified.printStates } : {};
    const printGlassesData = printStates.printGlassesData ? { ...printStates.printGlassesData } : { leftEye: {}, rightEye: {} };
    const printVisualAcuityData = printStates.printVisualAcuityData ? { ...printStates.printVisualAcuityData } : {};
    const reportData = newOverrides.report ? { ...newOverrides.report } : {};

    // --- REPORT SYNC ---
    const prevExam = prevState.clinicalExam;
    const newExam = newState.clinicalExam;

    // sync inspection
    if (prevExam.inspection !== newExam.inspection) {
        reportData.inspection = newExam.inspection || '';
        overridesChanged = true;
    }

    // sync fondOeil
    if (prevExam.fundus?.fundus_exam !== newExam.fundus?.fundus_exam) {
        reportData.fondOeil = newExam.fundus?.fundus_exam || '';
        overridesChanged = true;
    }

    // sync segmentAnterieur
    if (prevExam.anteriorSegment?.slit_lamp_exam !== newExam.anteriorSegment?.slit_lamp_exam) {
        reportData.segmentAnterieur = mergeTags(
            newExam.anteriorSegment?.slit_lamp_exam || '',
            prevExam.anteriorSegment?.slit_lamp_exam || '',
            reportData.segmentAnterieur || ''
        );
        overridesChanged = true;
    }

    // sync conclusion / diagnosis
    if (prevExam.diagnosis !== newExam.diagnosis) {
        reportData.conclusion = mergeTags(
            newExam.diagnosis || '',
            prevExam.diagnosis || '',
            reportData.conclusion || ''
        );
        overridesChanged = true;
    }

    // sync generalMedicalHistory
    if (prevExam.generalMedicalHistory !== newExam.generalMedicalHistory) {
        reportData.generalMedicalHistory = newExam.generalMedicalHistory || '';
        overridesChanged = true;
    }

    // sync ophthalmologicalHistory
    if (prevExam.ophthalmologicalHistory !== newExam.ophthalmologicalHistory) {
        reportData.ophthalmologicalHistory = newExam.ophthalmologicalHistory || '';
        overridesChanged = true;
    }

    // --- GLASSES SYNC ---
    const syncGlasses = (eye: 'right' | 'left', fieldPrefix: 'rightEye' | 'leftEye') => {
        const prevEye = prevState[eye === 'right' ? 'rightEye' : 'leftEye'];
        const newEye = newState[eye === 'right' ? 'rightEye' : 'leftEye'];
        const currentDoc = printGlassesData[fieldPrefix] || {};
        let updated = false;

        const syncField = (key: keyof EyeData, docKey: string, isNumber: boolean = false) => {
            const newVal = newEye[key];
            const prevVal = prevEye[key];
            if (newVal !== prevVal) {
                currentDoc[docKey] = isNumber ? (formatNumberWithSign(newVal) || newVal) : newVal;
                updated = true;
            }
        };

        syncField('sph', 'sph', true);
        syncField('cyl', 'cyl', true);
        syncField('axis', 'axis', false);
        syncField('add', 'add', true);
        syncField('glassType', 'glassType', false);

        if (updated) {
            const sphText = currentDoc.sph || '';
            const addText = currentDoc.add || '';
            const sphNumStr = parseFloat(String(sphText).replace(',', '.'));
            const sphNum = isNaN(sphNumStr) ? 0 : sphNumStr;
            const addNum = parseFloat(String(addText).replace(',', '.')) || 0;
            const nearSphRaw = (sphText !== '' || addText !== '') ? (sphNum + addNum).toFixed(2) : '';
            const nearSphFmt = formatNumberWithSign(nearSphRaw) || nearSphRaw;

            // Near updates — always overwrite when source fields change
            currentDoc.nearSph = nearSphFmt;

            if (newEye.cyl !== prevEye.cyl) {
                currentDoc.nearCyl = currentDoc.cyl || '';
            }

            if (newEye.axis !== prevEye.axis) {
                currentDoc.nearAxis = currentDoc.axis || '';
            }

            printGlassesData[fieldPrefix] = currentDoc;
            overridesChanged = true;
        }
    };
    syncGlasses('right', 'rightEye');
    syncGlasses('left', 'leftEye');

    // --- VISUAL ACUITY SYNC ---
    const syncVisualAcuity = (eye: 'right' | 'left') => {
        const prevEye = prevState[eye === 'right' ? 'rightEye' : 'leftEye'];
        const newEye = newState[eye === 'right' ? 'rightEye' : 'leftEye'];

        const sc_vl = newEye.visualAcuityVL_SC || newEye.visualAcuity;
        const ac_vl = newEye.visualAcuityVL_AC;
        const prev_sc_vl = prevEye.visualAcuityVL_SC || prevEye.visualAcuity;
        const prev_ac_vl = prevEye.visualAcuityVL_AC;

        let updated = false;

        const docKeySC = eye === 'right' ? 'visualAcuityVL_SC_OD' : 'visualAcuityVL_SC_OG';
        const docKeyAC = eye === 'right' ? 'visualAcuityVL_AC_OD' : 'visualAcuityVL_AC_OG';

        if (sc_vl !== prev_sc_vl) {
            printVisualAcuityData[docKeySC] = sc_vl ?? '';
            updated = true;
        }

        if (ac_vl !== prev_ac_vl) {
            printVisualAcuityData[docKeyAC] = ac_vl ?? '';
            updated = true;
        }

        if (updated) overridesChanged = true;
    };
    syncVisualAcuity('right');
    syncVisualAcuity('left');

    if (overridesChanged) {
        newOverrides.report = reportData;
        printStates.printGlassesData = printGlassesData;
        printStates.printVisualAcuityData = printVisualAcuityData;
        unified.printStates = printStates;
        newOverrides.unifiedDocumentsState = unified;
        newOverrides.glasses = printGlassesData;
        newOverrides.visualAcuity = printVisualAcuityData;

        set({ documentOverrides: newOverrides });
    }
};

// Module-level snapshot — outside Zustand so it never triggers re-renders
// and never accumulates nested references. Cleared on reset/load.
let syncSnapshot: { leftEye: any; rightEye: any; clinicalExam: any } | null = null;

export const resetSyncSnapshot = () => { syncSnapshot = null; };

export const runSyncDocuments = () => {
    const store = useConsultationStore.getState();
    const prev = syncSnapshot ?? {
        leftEye: defaultEyeData,
        rightEye: defaultEyeData,
        clinicalExam: defaultClinicalExam,
    };
    syncDocuments(useConsultationStore.setState, useConsultationStore.getState, prev);
    syncSnapshot = { leftEye: store.leftEye, rightEye: store.rightEye, clinicalExam: store.clinicalExam };
};


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
    customName?: string;
    strength?: string;
    type?: string;
    packaging?: string;
}

interface ConsultationState {
    isDirty: boolean;
    leftEye: EyeData;
    rightEye: EyeData;
    clinicalExam: DetailedClinicalExamData;
    dilatationRequired: boolean;
    prescriptions: PrescriptionItem[];

    patientId: string | null;
    consultationId: string | null;
    patient: any | null;

    documentOverrides: DocumentOverrides;

    setPatientId: (id: string | null) => void;
    setPatient: (patient: any | null) => void;
    setLeftEye: (data: Partial<EyeData>) => void;
    setRightEye: (data: Partial<EyeData>) => void;
    updateLeftEyeField: (field: keyof EyeData, value: string) => void;
    updateRightEyeField: (field: keyof EyeData, value: string) => void;

    setObjectiveRefraction: (eye: 'left' | 'right', values: { sph?: string; cyl?: string; axis?: string; add?: string }) => void;
    setGlassType: (value: string) => void;

    setClinicalExam: (data: Partial<DetailedClinicalExamData>) => void;
    updateClinicalExamField: (field: string, value: any) => void;

    setDilatationRequired: (required: boolean) => void;

    addPrescription: () => void;
    updatePrescription: (id: string, field: keyof PrescriptionItem, value: string) => void;
    removePrescription: (id: string) => void;
    setPrescriptions: (items: PrescriptionItem[]) => void;

    reset: () => void;
    loadConsultation: (data: any) => void;
    setDocumentOverride: <K extends keyof DocumentOverrides>(docId: K, data: DocumentOverrides[K]) => void;
    updateDocumentOverride: <K extends keyof DocumentOverrides>(docId: K, field: string, value: any) => void;
}

const defaultEyeData: EyeData = {
    visualAcuity: '', visualAcuityVL_SC: '', visualAcuityVL_AC: '', visualAcuityVP_SC: '', visualAcuityVP_AC: '',
    sph: '', cyl: '', axis: '', add: '', tension: '', tensionTime: '', pachymetry: '', corrected_iop: '', tensionApplanation: '', k1: '', k2: '', axis_k: '',
    rayon: '', diam: '', pupillaryDistance: '', pd: '', objSph: '', objCyl: '', objAxis: '', objAdd: '', lensType: '', lensBrand: '',
    glassType: '', contactLensType: ''
};

const defaultClinicalExam: DetailedClinicalExamData = {
    consultationReason: '', generalMedicalHistory: '', ophthalmologicalHistory: '', inspection: '', inspectionOD: '', inspectionOG: '',
    motilityExam: '', motilityExamOD: '', motilityExamOG: '', diagnosis: '', diagnosisOD: '', diagnosisOG: '', treatmentPlan: '',
    treatmentPlanOD: '', treatmentPlanOG: '', profile: '', anteriorSegment: { slit_lamp_exam: '' }, anteriorSegmentOD: '', anteriorSegmentOG: '',
    gonioscopy: { gonioscopy_notes: '' }, fundus: { fundus_exam: '' }, fundusOD: '', fundusOG: '',
    medicalImaging: { radiography: [], bilans: [], notes: '' }, contactLens: { right: {}, left: {} },
    nextAppointment: { timeframe: '', reason: '', date: '' }
};

export const useConsultationStore = create<ConsultationState>((set, get) => ({
    isDirty: false,
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

    setLeftEye: (data) => {
        set((state) => ({ leftEye: { ...state.leftEye, ...data }, isDirty: true }));
    },
    setRightEye: (data) => {
        set((state) => ({ rightEye: { ...state.rightEye, ...data }, isDirty: true }));
    },

    updateLeftEyeField: (field, value) => {
        set((state) => {
            const updates: Partial<EyeData> = { [field]: value };
            return {
                leftEye: { ...state.leftEye, ...updates },
                isDirty: true
            };
        });
    },

    updateRightEyeField: (field, value) => {
        set((state) => {
            const updates: Partial<EyeData> = { [field]: value };
            return {
                rightEye: { ...state.rightEye, ...updates },
                isDirty: true
            };
        });
    },

    setObjectiveRefraction: (eye, values) => {
        const updates: Partial<EyeData> = {};
        if (values.sph !== undefined) { updates.objSph = values.sph; updates.sph = values.sph; }
        if (values.cyl !== undefined) { updates.objCyl = values.cyl; updates.cyl = values.cyl; }
        if (values.axis !== undefined) { updates.objAxis = values.axis; updates.axis = values.axis; }
        if (values.add !== undefined) { updates.objAdd = values.add; updates.add = values.add; }

        set((state) => ({
            [eye === 'left' ? 'leftEye' : 'rightEye']: {
                ...state[eye === 'left' ? 'leftEye' : 'rightEye'],
                ...updates,
            },
            isDirty: true,
        }));
    },

    setGlassType: (value) => {
        set((state) => ({
            leftEye: { ...state.leftEye, glassType: value },
            rightEye: { ...state.rightEye, glassType: value },
            isDirty: true,
        }));
    },

    setClinicalExam: (data) => {
        set((state) => ({ clinicalExam: { ...state.clinicalExam, ...data }, isDirty: true }));
    },

    updateClinicalExamField: (field, value) => {
        set((state) => {
            let newExam = { ...state.clinicalExam };
            if (field.includes('.')) {
                const parts = field.split('.');
                const parent = parts[0] as keyof DetailedClinicalExamData;
                const child = parts[1];
                if (typeof newExam[parent] === 'object' && newExam[parent] !== null) {
                    // @ts-ignore
                    newExam[parent] = { ...newExam[parent], [child]: value };
                }
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
                if (field === 'inspection') { newExam.inspectionOD = value; newExam.inspectionOG = value; }
                if (field === 'motilityExam') { newExam.motilityExamOD = value; newExam.motilityExamOG = value; }
                if (field === 'diagnosis') { newExam.diagnosisOD = value; newExam.diagnosisOG = value; }
                if (field === 'treatmentPlan') { newExam.treatmentPlanOD = value; newExam.treatmentPlanOG = value; }
            }
            return { clinicalExam: newExam, isDirty: true };
        });
    },

    setDilatationRequired: (required) => set({ dilatationRequired: required, isDirty: true }),
    addPrescription: () => set((state) => ({ prescriptions: [{ id: Math.random().toString(), name: "", dosage: "", frequency: "", duration: "", instructions: "" }, ...state.prescriptions], isDirty: true })),
    updatePrescription: (id, field, value) => set((state) => ({ prescriptions: state.prescriptions.map(p => p.id === id ? { ...p, [field]: value } : p), isDirty: true })),
    removePrescription: (id) => set((state) => ({ prescriptions: state.prescriptions.filter(p => p.id !== id), isDirty: true })),
    setPrescriptions: (items) => set({ prescriptions: items, isDirty: true }),
    setDocumentOverride: (docId, data) => set((state) => ({ documentOverrides: { ...state.documentOverrides, [docId]: data } as DocumentOverrides, isDirty: true })),
    updateDocumentOverride: (docId, field, value) => set((state) => {
        const currentDoc = state.documentOverrides[docId] || {};
        return { documentOverrides: { ...state.documentOverrides, [docId]: { ...currentDoc, [field]: value } } as DocumentOverrides, isDirty: true };
    }),

    reset: () => {
        resetSyncSnapshot();
        set({ leftEye: defaultEyeData, rightEye: defaultEyeData, clinicalExam: defaultClinicalExam, dilatationRequired: false, prescriptions: [], patientId: null, consultationId: null, patient: null, documentOverrides: {}, isDirty: false });
    },

    loadConsultation: (data: any) => {
        resetSyncSnapshot();
        set({
            patientId: data.patient_id,
            consultationId: data.id,
            leftEye: { ...defaultEyeData, ...(data.left_eye || {}) },
            rightEye: { ...defaultEyeData, ...(data.right_eye || {}) },
            clinicalExam: { ...defaultClinicalExam, ...(data.clinical_exam || {}) },
            prescriptions: data.prescription?.treatments || [],
            dilatationRequired: data.clinical_exam?.dilatationRequired || false,
            documentOverrides: data.documents_data || {},
            isDirty: false
        });
    }
}));
