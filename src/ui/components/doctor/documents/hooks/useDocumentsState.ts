import { useMemo, useCallback } from 'react';
import { useConsultationStore } from '../../../../store/consultationStore';
import {
    EyeData,
    PrescriptionData,
    GlassesPrintData,
    ContactLensesPrintData,
    WorkStopPrintData,
    AbsencePrintData,
    VisualAcuityPrintData,
    GenericPrintData
} from '../types';

export interface BilanFields {
    bilanPreOp: {
        groupage: boolean;
        fnsTP: boolean;
        ionogramme: boolean;
        glycemie: boolean;
        ureeCreatinine: boolean;
        bilanHepatique: boolean;
        ecgCardiologie: boolean;
    };
    bilanDiabete: {
        glycemieJeun: boolean;
        glycemiePostPrandiale: boolean;
        hbA1c: boolean;
        cholesterol: boolean;
        triglycerides: boolean;
    };
    bilanInflammatoire: {
        fns: boolean;
        crp: boolean;
        fibrinogene: boolean;
        vs: boolean;
        electrophorese: boolean;
    };
    bilanUveite: {
        fns: boolean;
        vsCrp: boolean;
        electrophorese: boolean;
        toxoplasmose: boolean;
        idrTuberculine: boolean;
        aslo: boolean;
        typageHla: boolean;
        vdrlTpha: boolean;
        serologie: boolean;
        radioThorax: boolean;
    };
}

export interface InternalBilanFields extends BilanFields {
    bilanPreOp: BilanFields['bilanPreOp'] & { customFields: string[] };
    bilanDiabete: BilanFields['bilanDiabete'] & { customFields: string[] };
    bilanInflammatoire: BilanFields['bilanInflammatoire'] & {
        customFields: string[];
    };
    bilanUveite: BilanFields['bilanUveite'] & { customFields: string[] };
}

const DEFAULT_BILAN_FIELDS: InternalBilanFields = {
    bilanPreOp: {
        groupage: true, fnsTP: true, ionogramme: true, glycemie: true,
        ureeCreatinine: true, bilanHepatique: true, ecgCardiologie: true, customFields: [],
    },
    bilanDiabete: {
        glycemieJeun: true, glycemiePostPrandiale: true, hbA1c: true,
        cholesterol: true, triglycerides: true, customFields: [],
    },
    bilanInflammatoire: {
        fns: true, crp: true, fibrinogene: true, vs: true, electrophorese: true, customFields: [],
    },
    bilanUveite: {
        fns: true, vsCrp: true, electrophorese: true, toxoplasmose: true,
        idrTuberculine: true, aslo: true, typageHla: true, vdrlTpha: true,
        serologie: true, radioThorax: true, customFields: [],
    },
};

const DEFAULT_PRINT_CONTROL_FLAGS = {
    includeVisualAcuityWithoutCorrection: true,
    includeVisualAcuityWithCorrection: true,
    includeTonometry: true,
    includeGlassType: false,
    includeNearVision: false,
    includeFarVision: false,
    includeRightEyeFar: true,
    includeLeftEyeFar: true,
    includeRightEyeNear: true,
    includeLeftEyeNear: true,
    includeRightEye: true,
    includeLeftEye: true,
};

// We ignore initial data from props and pull straight from global store so there is 1 source of truth
export const useDocumentsState = ({
    prescriptionData,
    rightEyeData,
    leftEyeData,
    absenceData,
    workStopData,
}: any) => {
    const documentOverrides = useConsultationStore(state => state.documentOverrides);
    const setDocumentOverride = useConsultationStore(state => state.setDocumentOverride);

    // Get strictly unified state from the only store
    const unified = documentOverrides.unifiedDocumentsState || {};
    const pStates = unified.printStates || {};

    const createSetter = (key: string, isPrintState: boolean, legacyKey?: string, defaultValue?: any) => (updater: any) => {
        const safePrev = documentOverrides.unifiedDocumentsState || {};
        const currentState = isPrintState ? (safePrev.printStates?.[key] || defaultValue || {}) : (safePrev[key] || defaultValue || {});
        const newState = typeof updater === 'function' ? updater(currentState) : updater;

        const nextUnified = { ...safePrev };
        if (isPrintState) {
            nextUnified.printStates = { ...(safePrev.printStates || {}), [key]: newState };
            
            // Immediately flush legacy keys to stay synchronized with PDF generation instantly
            if (legacyKey) {
                setDocumentOverride(legacyKey, newState);
            }
            
            // Special legacy handling for divers tab/medical record
            if (key === 'selectedDiversDocument') {
                setDocumentOverride('selectedGenericTemplate', newState);
                if (newState && newState !== 'documentVierge') {
                    setDocumentOverride('medicalRecord', {
                        documentType: newState,
                        printData: nextUnified.printStates.printMedicalRecordData || {},
                    });
                } else {
                    setDocumentOverride('medicalRecord', undefined);
                }
            } else if (key === 'printMedicalRecordData') {
                const selectedDivers = nextUnified.printStates.selectedDiversDocument;
                if (selectedDivers && selectedDivers !== 'documentVierge') {
                    setDocumentOverride('medicalRecord', {
                        documentType: selectedDivers,
                        printData: newState || {},
                    });
                } else {
                    setDocumentOverride('medicalRecord', undefined);
                }
            }
        } else {
            nextUnified[key] = newState;
            if (legacyKey) {
                setDocumentOverride(legacyKey, newState);
            }
        }
        setDocumentOverride('unifiedDocumentsState', nextUnified);
    };

    // Derived States or Defaults
    const printGlassesData = pStates.printGlassesData || {
        rightEye: { sph: rightEyeData?.sph || '', cyl: rightEyeData?.cyl || '', axis: rightEyeData?.axis || '', add: rightEyeData?.add || '', glassType: rightEyeData?.glassType || '', nearSph: '', nearCyl: '', nearAxis: '', emptyEyeOption: 'plan', emptyNearEyeOption: 'plan' },
        leftEye: { sph: leftEyeData?.sph || '', cyl: leftEyeData?.cyl || '', axis: leftEyeData?.axis || '', add: leftEyeData?.add || '', glassType: leftEyeData?.glassType || '', nearSph: '', nearCyl: '', nearAxis: '', emptyEyeOption: 'plan', emptyNearEyeOption: 'plan' },
    };

    const printContactLensesData = pStates.printContactLensesData || {
        rightEye: { sph: rightEyeData?.sph || '', cyl: rightEyeData?.cyl || '', axis: rightEyeData?.axis || '', diam: rightEyeData?.diam || '', axis_k: rightEyeData?.axis_k || '', k1: rightEyeData?.k1 || '', k2: rightEyeData?.k2 || '', contactLensType: rightEyeData?.contactLensType || 'Sphérique', lensBrand: rightEyeData?.lensBrand || '', lensType: rightEyeData?.lensType || '' },
        leftEye: { sph: leftEyeData?.sph || '', cyl: leftEyeData?.cyl || '', axis: leftEyeData?.axis || '', diam: leftEyeData?.diam || '', axis_k: leftEyeData?.axis_k || '', k1: leftEyeData?.k1 || '', k2: leftEyeData?.k2 || '', contactLensType: leftEyeData?.contactLensType || 'Sphérique', lensBrand: leftEyeData?.lensBrand || '', lensType: leftEyeData?.lensType || '' },
    };

    const printVisualAcuityData = pStates.printVisualAcuityData || {
        visualAcuityVL_SC_OD: rightEyeData?.visualAcuityVL_SC || rightEyeData?.visualAcuity || '',
        visualAcuityVL_SC_OG: leftEyeData?.visualAcuityVL_SC || leftEyeData?.visualAcuity || '',
        visualAcuityVL_AC_OD: rightEyeData?.visualAcuityVL_AC || '',
        visualAcuityVL_AC_OG: leftEyeData?.visualAcuityVL_AC || '',
    };

    const bilanFields = unified.bilanFields || DEFAULT_BILAN_FIELDS;
    const printControlFlags = unified.printControlFlags || DEFAULT_PRINT_CONTROL_FLAGS;

    const printWorkStopData = pStates.printWorkStopData || {
        startDate: workStopData?.startDate,
        endDate: workStopData?.endDate,
        exitAuthorized: workStopData?.exitAuthorized ?? true,
        isProlongation: workStopData?.isProlongation ?? false,
        isReprise: workStopData?.isReprise ?? false,
    };

    const printAbsenceData = pStates.printAbsenceData || {
        consultationDate: absenceData?.date || new Date(),
    };

    const returnObj = {
        bilanFields,
        setBilanFields: createSetter('bilanFields', false, 'bilan', DEFAULT_BILAN_FIELDS),
        
        customFieldInputs: unified.customFieldInputs || { bilanPreOp: '', bilanDiabete: '', bilanInflammatoire: '', bilanUveite: '' },
        setCustomFieldInputs: createSetter('customFieldInputs', false, undefined, { bilanPreOp: '', bilanDiabete: '', bilanInflammatoire: '', bilanUveite: '' }),
        
        printControlFlags,
        setPrintControlFlags: createSetter('printControlFlags', false, 'printControlFlags', DEFAULT_PRINT_CONTROL_FLAGS),

        selectedDiversDocument: pStates.selectedDiversDocument || 'documentVierge',
        setSelectedDiversDocument: createSetter('selectedDiversDocument', true, undefined, 'documentVierge'),

        printPrescriptionData: pStates.printPrescriptionData || prescriptionData,
        setPrintPrescriptionData: createSetter('printPrescriptionData', true, 'printPrescriptionData', prescriptionData),

        printGlassesData,
        setPrintGlassesData: createSetter('printGlassesData', true, 'glasses', printGlassesData),

        printContactLensesData,
        setPrintContactLensesData: createSetter('printContactLensesData', true, 'contacts', printContactLensesData),

        printVisualAcuityData,
        setPrintVisualAcuityData: createSetter('printVisualAcuityData', true, 'visualAcuity', printVisualAcuityData),

        printWorkStopData,
        setPrintWorkStopData: createSetter('printWorkStopData', true, 'workStop', printWorkStopData),

        printAbsenceData,
        setPrintAbsenceData: createSetter('printAbsenceData', true, 'absence', printAbsenceData),

        printMedicalRecordData: pStates.printMedicalRecordData || {},
        setPrintMedicalRecordData: createSetter('printMedicalRecordData', true, undefined, {}),

        printGenericData: pStates.printGenericData || { title: '', text: '' },
        setPrintGenericData: createSetter('printGenericData', true, 'customGeneric', { title: '', text: '' }),
    };

    // Provide useMemo wrap to guarantee referential equality if we need it
    return useMemo(() => returnObj, [
        unified.bilanFields, unified.customFieldInputs, unified.printControlFlags,
        pStates.selectedDiversDocument, pStates.printPrescriptionData, pStates.printGlassesData,
        pStates.printContactLensesData, pStates.printVisualAcuityData, pStates.printWorkStopData,
        pStates.printAbsenceData, pStates.printMedicalRecordData, pStates.printGenericData
    ]);
};
