/**
 * Consultation State Store
 * 
 * Zustand store for managing consultation data including eye measurements,
 * clinical exam data, prescriptions, and document overrides. Provides
 * actions for updating all aspects of a consultation.
 */

import { create } from 'zustand';
import { EyeData, DetailedClinicalExamData } from '@/ui/components/doctor/dashboard/types';
import { lentilleService } from '@/ui/services/LentilleService';

// --- Helpers for formatting and syncing ---
export const formatNumberWithSign = (value: number | string | undefined): string => {
    if (value === undefined || value === null || value === '') return '';
    const strVal = value.toString().replace(',', '.');
    const num = parseFloat(strVal);
    if (isNaN(num) || !isFinite(num)) return value?.toString() || '';
    if (num === 0) return '0.00';
    const formatted = num.toFixed(2);
    return num > 0 ? `+${formatted}` : formatted;
};

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

let lastContactLensSyncIdRight = 0;
let lastContactLensSyncIdLeft = 0;

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
        const prevDoc = reportData.inspection || '';
        if (prevDoc === (prevExam.inspection || '') || (!prevExam.inspection && !prevDoc)) {
            reportData.inspection = newExam.inspection || '';
            overridesChanged = true;
        }
    }

    // sync fondOeil
    if (prevExam.fundus?.fundus_exam !== newExam.fundus?.fundus_exam) {
        const prevDoc = reportData.fondOeil || '';
        if (prevDoc === (prevExam.fundus?.fundus_exam || '') || (!prevExam.fundus?.fundus_exam && !prevDoc)) {
            reportData.fondOeil = newExam.fundus?.fundus_exam || '';
            overridesChanged = true;
        }
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
        const prevDoc = reportData.generalMedicalHistory || '';
        if (prevDoc === (prevExam.generalMedicalHistory || '') || (!prevExam.generalMedicalHistory && !prevDoc)) {
            reportData.generalMedicalHistory = newExam.generalMedicalHistory || '';
            overridesChanged = true;
        }
    }

    // sync ophthalmologicalHistory
    if (prevExam.ophthalmologicalHistory !== newExam.ophthalmologicalHistory) {
        const prevDoc = reportData.ophthalmologicalHistory || '';
        if (prevDoc === (prevExam.ophthalmologicalHistory || '') || (!prevExam.ophthalmologicalHistory && !prevDoc)) {
            reportData.ophthalmologicalHistory = newExam.ophthalmologicalHistory || '';
            overridesChanged = true;
        }
    }

    // Helper for smart sync
    const shouldSync = (currentDocValue: any, prevExamValue: any, isNumber: boolean = false) => {
        if (!currentDocValue) return true; // If empty, always sync
        if (currentDocValue === prevExamValue) return true;
        if (isNumber) {
            const expectedFmt = formatNumberWithSign(prevExamValue) || prevExamValue;
            if (currentDocValue === expectedFmt) return true;
        }
        return false; // User manually changed it
    };

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
                if (shouldSync(currentDoc[docKey], prevVal, isNumber)) {
                    currentDoc[docKey] = isNumber ? (formatNumberWithSign(newVal) || newVal) : newVal;
                    updated = true;
                }
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
            const sphNum = parseFloat(String(sphText).replace(',', '.'));
            const addNum = parseFloat(String(addText).replace(',', '.')) || 0;
            const nearSphRaw = !isNaN(sphNum) ? (sphNum + addNum).toFixed(2) : '';
            const nearSphFmt = formatNumberWithSign(nearSphRaw) || nearSphRaw;

            const prevSphNum = parseFloat(String(prevEye.sph).replace(',', '.'));
            const prevAddNum = parseFloat(String(prevEye.add).replace(',', '.')) || 0;
            const prevNearSphRaw = !isNaN(prevSphNum) ? (prevSphNum + prevAddNum).toFixed(2) : '';
            const prevNearSphFmt = formatNumberWithSign(prevNearSphRaw) || prevNearSphRaw;

            // Near updates
            if (shouldSync(currentDoc.nearSph, prevNearSphRaw, false) || shouldSync(currentDoc.nearSph, prevNearSphFmt, false)) {
                currentDoc.nearSph = nearSphFmt;
            }

            if (newEye.cyl !== prevEye.cyl && shouldSync(currentDoc.nearCyl, prevEye.cyl, true)) {
                currentDoc.nearCyl = currentDoc.cyl || '';
            }

            if (newEye.axis !== prevEye.axis && shouldSync(currentDoc.nearAxis, prevEye.axis, false)) {
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

        if (sc_vl !== prev_sc_vl && shouldSync(printVisualAcuityData[docKeySC], prev_sc_vl)) {
            printVisualAcuityData[docKeySC] = sc_vl ?? '';
            updated = true;
        }

        if (ac_vl !== prev_ac_vl && shouldSync(printVisualAcuityData[docKeyAC], prev_ac_vl)) {
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

    // --- CONTACT LENSES SYNC (ASYNC) ---
    const syncContactLenses = (eye: 'right' | 'left', fieldPrefix: 'rightEye' | 'leftEye') => {
        const prevEye = prevState[eye === 'right' ? 'rightEye' : 'leftEye'];
        const newEye = newState[eye === 'right' ? 'rightEye' : 'leftEye'];

        if (
            prevEye.sph !== newEye.sph ||
            prevEye.cyl !== newEye.cyl ||
            prevEye.axis !== newEye.axis ||
            prevEye.contactLensType !== newEye.contactLensType ||
            prevEye.diam !== newEye.diam ||
            prevEye.axis_k !== newEye.axis_k ||
            prevEye.rayon !== newEye.rayon ||
            prevEye.lensBrand !== newEye.lensBrand ||
            prevEye.lensType !== newEye.lensType
        ) {
            const type = newEye.contactLensType || 'Sphérique';
            const isSpherical = type === 'Sphérique';

            // Use sequence tracking to prevent stale resolves
            const currentSyncId = eye === 'right' ? ++lastContactLensSyncIdRight : ++lastContactLensSyncIdLeft;

            lentilleService.convertToContactLens(
                newEye.sph || '',
                newEye.cyl || '',
                newEye.axis || '',
                type
            ).then(converted => {
                const latestSyncId = eye === 'right' ? lastContactLensSyncIdRight : lastContactLensSyncIdLeft;
                if (currentSyncId !== latestSyncId) return; // Prevent stale overwrites

                const currentStoreState = get();
                const latestOverrides = { ...currentStoreState.documentOverrides };
                const latestUnified = latestOverrides.unifiedDocumentsState ? { ...latestOverrides.unifiedDocumentsState } : { printStates: {} };
                const latestPrintStates = latestUnified.printStates ? { ...latestUnified.printStates } : {};
                const latestContactsData = latestPrintStates.printContactLensesData ? { ...latestPrintStates.printContactLensesData } : { leftEye: {}, rightEye: {} };

                if (converted && isFinite(converted.sphere)) {
                    latestContactsData[fieldPrefix] = {
                        ...(latestContactsData[fieldPrefix] || {}),
                        sph: formatNumberWithSign(converted.sphere),
                        cyl: isSpherical ? '' : formatNumberWithSign(converted.cylinder),
                        axis: isSpherical ? '' : (converted.axis ? converted.axis.toString() : ''),
                        contactLensType: type,
                        diam: newEye.diam || '',
                        axis_k: newEye.rayon || newEye.axis_k || '',
                        lensBrand: newEye.lensBrand || '',
                        lensType: newEye.lensType || '',
                    };
                } else {
                    latestContactsData[fieldPrefix] = {
                        ...(latestContactsData[fieldPrefix] || {}),
                        sph: newEye.sph || '',
                        cyl: newEye.cyl || '',
                        axis: newEye.axis || '',
                        contactLensType: type,
                        diam: newEye.diam || '',
                        axis_k: newEye.rayon || newEye.axis_k || '',
                        lensBrand: newEye.lensBrand || '',
                        lensType: newEye.lensType || '',
                    };
                }

                latestPrintStates.printContactLensesData = latestContactsData;
                latestUnified.printStates = latestPrintStates;
                latestOverrides.unifiedDocumentsState = latestUnified;
                latestOverrides.contacts = latestContactsData;

                set({ documentOverrides: latestOverrides });
            });
        }
    };
    syncContactLenses('right', 'rightEye');
    syncContactLenses('left', 'leftEye');
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

/**
 * Consultation state interface
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

    documentOverrides: Record<string, any>;

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
        const prevState = get();
        set((state) => ({ leftEye: { ...state.leftEye, ...data } }));
        syncDocuments(set, get, prevState);
    },
    setRightEye: (data) => {
        const prevState = get();
        set((state) => ({ rightEye: { ...state.rightEye, ...data } }));
        syncDocuments(set, get, prevState);
    },

    updateLeftEyeField: (field, value) => {
        const prevState = get();
        set((state) => {
            const updates: Partial<EyeData> = { [field]: value };
            if (field === 'objSph') updates.sph = value;
            if (field === 'objCyl') updates.cyl = value;
            if (field === 'objAxis') updates.axis = value;
            if (field === 'objAdd') updates.add = value;

            return {
                leftEye: { ...state.leftEye, ...updates },
                ...(field === 'glassType' ? { rightEye: { ...state.rightEye, [field]: value } } : {})
            };
        });
        syncDocuments(set, get, prevState);
    },

    updateRightEyeField: (field, value) => {
        const prevState = get();
        set((state) => {
            const updates: Partial<EyeData> = { [field]: value };
            if (field === 'objSph') updates.sph = value;
            if (field === 'objCyl') updates.cyl = value;
            if (field === 'objAxis') updates.axis = value;
            if (field === 'objAdd') updates.add = value;

            return {
                rightEye: { ...state.rightEye, ...updates },
                ...(field === 'glassType' ? { leftEye: { ...state.leftEye, [field]: value } } : {})
            };
        });
        syncDocuments(set, get, prevState);
    },

    setClinicalExam: (data) => {
        const prevState = get();
        set((state) => ({ clinicalExam: { ...state.clinicalExam, ...data } }));
        syncDocuments(set, get, prevState);
    },

    updateClinicalExamField: (field, value) => {
        const prevState = get();
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
            return { clinicalExam: newExam };
        });
        syncDocuments(set, get, prevState);
    },

    setDilatationRequired: (required) => set({ dilatationRequired: required }),
    addPrescription: () => set((state) => ({ prescriptions: [{ id: Math.random().toString(), name: "", dosage: "", frequency: "", duration: "", instructions: "" }, ...state.prescriptions] })),
    updatePrescription: (id, field, value) => set((state) => ({ prescriptions: state.prescriptions.map(p => p.id === id ? { ...p, [field]: value } : p) })),
    removePrescription: (id) => set((state) => ({ prescriptions: state.prescriptions.filter(p => p.id !== id) })),
    setPrescriptions: (items) => set({ prescriptions: items }),
    setDocumentOverride: (docId, data) => set((state) => ({ documentOverrides: { ...state.documentOverrides, [docId]: data } })),
    updateDocumentOverride: (docId, field, value) => set((state) => {
        const currentDoc = state.documentOverrides[docId] || {};
        return { documentOverrides: { ...state.documentOverrides, [docId]: { ...currentDoc, [field]: value } } };
    }),

    reset: () => set({ leftEye: defaultEyeData, rightEye: defaultEyeData, clinicalExam: defaultClinicalExam, dilatationRequired: false, prescriptions: [], patientId: null, consultationId: null, patient: null, documentOverrides: {} }),

    loadConsultation: (data: any) => {
        console.log("📥 Store: Loading consultation data", data.id);
        set({
            patientId: data.patient_id,
            consultationId: data.id,
            leftEye: { ...defaultEyeData, ...(data.left_eye || {}) },
            rightEye: { ...defaultEyeData, ...(data.right_eye || {}) },
            clinicalExam: { ...defaultClinicalExam, ...(data.clinical_exam || {}) },
            prescriptions: data.prescription?.treatments || [],
            dilatationRequired: data.clinical_exam?.dilatationRequired || false,
            documentOverrides: data.documents_data || {}
        });
    }
}));
